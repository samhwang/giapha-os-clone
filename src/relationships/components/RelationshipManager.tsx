import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { DashboardContext, useDashboard } from '../../dashboard/components/DashboardContext';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import { createPerson, getPersons } from '../../members/server/member';
import type { Person, RelationshipType } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { createRelationship, deleteRelationship, getRelationshipsForPerson } from '../server/relationship';

interface RelationshipManagerProps {
  personId: string;
  isAdmin: boolean;
  personGender: string;
}

interface EnrichedRelationship {
  id: string;
  type: RelationshipType;
  direction: 'parent' | 'child' | 'spouse' | 'child_in_law';
  targetPerson: Person;
  note: string | null;
}

export default function RelationshipManager({ personId, isAdmin, personGender }: RelationshipManagerProps) {
  const { t } = useTranslation();
  const dashboardContext = useContext(DashboardContext);
  const { setMemberModalId } = useDashboard();
  const navigate = useNavigate();

  const handlePersonClick = (id: string) => {
    if (dashboardContext !== undefined) {
      setMemberModalId(id);
    } else {
      navigate({ to: '/dashboard/members/$id', params: { id } });
    }
  };

  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newRelType, setNewRelType] = useState<RelationshipType>('biological_child');
  const [newRelDirection, setNewRelDirection] = useState<'parent' | 'child' | 'spouse'>('parent');
  const [newRelNote, setNewRelNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [selectedSpouseId, setSelectedSpouseId] = useState<string>('');
  const [bulkChildren, setBulkChildren] = useState<{ name: string; gender: 'male' | 'female' | 'other'; birthYear: string; isProcessing: boolean }[]>([
    { name: '', gender: 'male', birthYear: '', isProcessing: false },
  ]);

  const [isAddingSpouse, setIsAddingSpouse] = useState(false);
  const [newSpouseName, setNewSpouseName] = useState('');
  const [newSpouseBirthYear, setNewSpouseBirthYear] = useState('');
  const [newSpouseNote, setNewSpouseNote] = useState('');

  const fetchRelationships = useCallback(async () => {
    try {
      const rels = await getRelationshipsForPerson({ data: { personId } });
      const persons = await getPersons();
      setAllPersons(persons);

      const personsMap = new Map(persons.map((p) => [p.id, p]));
      const formattedRels: EnrichedRelationship[] = [];

      for (const r of rels) {
        const isA = r.personAId === personId;
        const targetId = isA ? r.personBId : r.personAId;
        const target = personsMap.get(targetId);
        if (!target) continue;

        let direction: 'parent' | 'child' | 'spouse' = 'spouse';
        if (r.type === 'marriage') {
          direction = 'spouse';
        } else if (isA) {
          direction = 'child';
        } else {
          direction = 'parent';
        }

        formattedRels.push({
          id: r.id,
          type: r.type as RelationshipType,
          direction,
          targetPerson: target,
          note: r.note,
        });
      }

      const childrenIds = formattedRels.filter((r) => r.direction === 'child').map((r) => r.targetPerson.id);

      for (const childId of childrenIds) {
        const childRels = await getRelationshipsForPerson({ data: { personId: childId } });
        const childPerson = personsMap.get(childId);
        if (!childPerson) continue;

        for (const m of childRels) {
          if (m.type !== 'marriage') continue;
          const spouseId = m.personAId === childId ? m.personBId : m.personAId;
          const spousePerson = personsMap.get(spouseId);
          if (!spousePerson) continue;

          const spouseGender = spousePerson.gender;
          let noteLabel =
            spouseGender === 'female'
              ? t('relationship.daughterInLaw', { name: childPerson.fullName })
              : spouseGender === 'male'
                ? t('relationship.sonInLaw', { name: childPerson.fullName })
                : t('relationship.spouseOf', { name: childPerson.fullName });

          if (m.note) noteLabel += ` - ${m.note}`;

          formattedRels.push({
            id: `${m.id}_inlaw`,
            type: 'marriage',
            direction: 'child_in_law',
            targetPerson: spousePerson,
            note: noteLabel,
          });
        }
      }

      setRelationships(formattedRels);
    } catch (err) {
      console.error('Error fetching relationships:', err);
    } finally {
      setLoading(false);
    }
  }, [personId, t]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const results = allPersons.filter((p) => p.id !== personId && p.fullName.toLowerCase().includes(term)).slice(0, 5);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, personId, allPersons]);

  const handleAddRelationship = async () => {
    if (!selectedTargetId) return;
    setProcessing(true);

    try {
      let personAId = personId;
      let personBId = selectedTargetId;

      if (newRelDirection === 'parent') {
        personAId = selectedTargetId;
        personBId = personId;
      }

      let type: RelationshipType = 'biological_child';
      if (newRelDirection === 'spouse') type = 'marriage';
      else if (newRelType === 'adopted_child') type = 'adopted_child';

      await createRelationship({
        data: {
          personAId,
          personBId,
          type,
          note: newRelNote || null,
        },
      });

      setIsAdding(false);
      setSearchTerm('');
      setSelectedTargetId(null);
      setNewRelNote('');
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      alert(`${t('error.generic')} ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAdd = async () => {
    const validChildren = bulkChildren.filter((c) => c.name.trim() !== '');
    if (validChildren.length === 0) {
      alert(t('relationship.bulkMinOneChild'));
      return;
    }

    setProcessing(true);
    let successCount = 0;

    try {
      for (const child of validChildren) {
        const birthYear = child.birthYear.trim() !== '' ? Number.parseInt(child.birthYear, 10) : undefined;

        const newPerson = await createPerson({
          data: {
            fullName: child.name.trim(),
            gender: child.gender,
            ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
          },
        });

        await createRelationship({
          data: {
            personAId: personId,
            personBId: newPerson.id,
            type: 'biological_child',
          },
        });

        if (selectedSpouseId && selectedSpouseId !== 'unknown') {
          await createRelationship({
            data: {
              personAId: selectedSpouseId,
              personBId: newPerson.id,
              type: 'biological_child',
            },
          });
        }

        successCount++;
      }

      if (successCount === validChildren.length) {
        setIsAddingBulk(false);
        setBulkChildren([{ name: '', gender: 'male', birthYear: '', isProcessing: false }]);
        setSelectedSpouseId('');
        fetchRelationships();
      } else {
        alert(t('relationship.bulkPartialError', { count: successCount, total: validChildren.length }));
        fetchRelationships();
      }
    } catch (err) {
      const e = err as Error;
      alert(`${t('error.generic')} ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickAddSpouse = async () => {
    if (!newSpouseName.trim()) {
      alert(t('relationship.spouseNameRequired'));
      return;
    }

    setProcessing(true);
    try {
      const newSpouseGender = personGender === 'male' ? 'female' : personGender === 'female' ? 'male' : 'female';
      const birthYear = newSpouseBirthYear.trim() !== '' ? Number.parseInt(newSpouseBirthYear, 10) : undefined;

      const newPerson = await createPerson({
        data: {
          fullName: newSpouseName.trim(),
          gender: newSpouseGender as 'male' | 'female' | 'other',
          ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
        },
      });

      await createRelationship({
        data: {
          personAId: personId,
          personBId: newPerson.id,
          type: 'marriage',
          note: newSpouseNote.trim() || null,
        },
      });

      setIsAddingSpouse(false);
      setNewSpouseName('');
      setNewSpouseBirthYear('');
      setNewSpouseNote('');
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      alert(`${t('error.generic')} ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (relId: string) => {
    if (!confirm(t('relationship.deleteConfirm'))) return;
    try {
      await deleteRelationship({ data: { id: relId } });
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      alert(`${t('error.generic')} ${e.message}`);
    }
  };

  const groupByType = (type: string) => relationships.filter((r) => r.direction === type);

  if (loading) return <div className={css({ color: 'stone.500', fontSize: 'sm' })}>{t('relationship.loadingFamily')}</div>;

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      {(['parent', 'spouse', 'child', 'child_in_law'] as const).map((group) => {
        const items = groupByType(group);
        let title = '';
        if (group === 'parent') title = t('relationship.parents');
        if (group === 'spouse') title = t('relationship.spouse');
        if (group === 'child') title = t('relationship.children');
        if (group === 'child_in_law') title = t('relationship.inLawChildren');

        if (items.length === 0 && !isAdmin) return null;

        return (
          <div key={group} className={css({ borderBottomWidth: '1px', borderColor: 'stone.100', paddingBottom: '4' })}>
            <h4
              className={css({
                fontWeight: 'bold',
                color: 'stone.700',
                marginBottom: '3',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'sm',
                textTransform: 'uppercase',
                letterSpacing: 'wide',
              })}
            >
              {title}
            </h4>
            {items.length > 0 ? (
              <ul className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                {items.map((rel) => (
                  <li key={rel.id} className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
                    <button
                      type="button"
                      onClick={() => handlePersonClick(rel.targetPerson.id)}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3',
                        padding: '2.5',
                        marginX: '-2.5',
                        borderRadius: 'xl',
                        transition: 'all 0.2s',
                        flex: 1,
                        textAlign: 'left',
                        _hover: { backgroundColor: 'stone.100' },
                      })}
                    >
                      <div
                        className={css(
                          {
                            width: '8',
                            height: '8',
                            borderRadius: 'full',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'xs',
                            color: 'white',
                            overflow: 'hidden',
                            flexShrink: 0,
                          },
                          rel.targetPerson.gender === 'male'
                            ? { backgroundColor: 'sky.700' }
                            : rel.targetPerson.gender === 'female'
                              ? { backgroundColor: 'rose.700' }
                              : { backgroundColor: 'stone.500' }
                        )}
                      >
                        {rel.targetPerson.avatarUrl ? (
                          <img
                            src={rel.targetPerson.avatarUrl}
                            alt={rel.targetPerson.fullName}
                            className={css({ height: '100%', width: '100%', objectFit: 'cover' })}
                          />
                        ) : (
                          <DefaultAvatar gender={rel.targetPerson.gender} />
                        )}
                      </div>
                      <div className={css({ display: 'flex', flexDirection: 'column' })}>
                        <span className={css({ color: 'stone.900', fontWeight: 'medium', fontSize: 'sm' })}>{rel.targetPerson.fullName}</span>
                        {rel.note && (
                          <span className={css({ fontSize: 'xs', color: 'amber.600', fontWeight: 'medium', fontStyle: 'italic', marginTop: '0.5' })}>
                            ({rel.note})
                          </span>
                        )}
                        {rel.type === 'adopted_child' && (
                          <span className={css({ fontSize: 'xs', color: 'stone.400', fontStyle: 'italic', marginTop: '0.5' })}>
                            ({t('relationship.adopted')})
                          </span>
                        )}
                      </div>
                    </button>
                    {isAdmin && rel.direction !== 'child_in_law' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rel.id)}
                        className={css(
                          { color: 'stone.300', _hover: { color: 'red.500', backgroundColor: 'red.50' } },
                          { _hover: { backgroundColor: 'red.50' } },
                          {
                            padding: '2.5',
                            borderRadius: 'lg',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '2',
                            transition: 'colors 0.2s',
                          }
                        )}
                        title={t('relationship.deleteRelationship')}
                        aria-label={t('relationship.deleteRelationship')}
                      >
                        <Trash2 className={css({ width: '4', height: '4' })} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={css({ fontSize: 'xs', color: 'stone.400', fontStyle: 'italic' })}>{t('relationship.noInfo')}</p>
            )}
          </div>
        );
      })}

      {isAdmin && !isAdding && !isAddingBulk && !isAddingSpouse && (
        <div className={css({ display: 'flex', flexDirection: { base: 'column', sm: 'row' }, gap: '3', marginTop: '4' })}>
          <button
            type="button"
            onClick={() => setIsAddingBulk(true)}
            className={css({
              flex: 1,
              paddingY: '3',
              borderWidth: '2',
              borderStyle: 'dashed',
              borderColor: 'stone.200',
              backgroundColor: 'rgb(255 255 255 / 0.5)',
              borderRadius: { base: 'xl', sm: '2xl' },
              color: 'stone.500',
              fontWeight: 'medium',
              fontSize: 'sm',
              transition: 'all 0.2s',
              _hover: { borderColor: 'sky.400', color: 'sky.700', backgroundColor: 'stone.50' },
            })}
          >
            {t('relationship.addChild')}
          </button>
          <button
            type="button"
            onClick={() => setIsAddingSpouse(true)}
            className={css({
              flex: 1,
              paddingY: '3',
              borderWidth: '2',
              borderStyle: 'dashed',
              borderColor: 'stone.200',
              backgroundColor: 'rgb(255 255 255 / 0.5)',
              borderRadius: { base: 'xl', sm: '2xl' },
              color: 'stone.500',
              fontWeight: 'medium',
              fontSize: 'sm',
              transition: 'all 0.2s',
              _hover: { borderColor: 'rose.400', color: 'rose.700', backgroundColor: 'stone.50' },
            })}
          >
            {t('relationship.addSpouse')}
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className={css({
              flex: 1,
              paddingY: '3',
              borderWidth: '2',
              borderStyle: 'dashed',
              borderColor: 'stone.200',
              backgroundColor: 'rgb(255 255 255 / 0.5)',
              borderRadius: { base: 'xl', sm: '2xl' },
              color: 'stone.500',
              fontWeight: 'medium',
              fontSize: 'sm',
              transition: 'all 0.2s',
              _hover: { borderColor: 'amber.400', color: 'amber.700', backgroundColor: 'stone.50' },
            })}
          >
            {t('relationship.addRelationship')}
          </button>
        </div>
      )}

      {isAdmin && isAdding && (
        <div
          className={css({
            marginTop: '4',
            backgroundColor: 'rgb(255 255 255 / 0.5)',
            padding: { base: '4', sm: '5' },
            borderRadius: 'xl',
            borderWidth: '1px',
            borderColor: 'stone.200',
            boxShadow: 'sm',
          })}
        >
          <h4 className={css({ fontWeight: 'bold', color: 'stone.800', marginBottom: '3', fontSize: 'sm' })}>{t('relationship.addNewRelationship')}</h4>
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
            <div>
              <label htmlFor="relNote" className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'stone.500', marginBottom: '1' })}>
                {t('relationship.noteLabel')}
              </label>
              <input
                id="relNote"
                type="text"
                placeholder={t('relationship.notePlaceholder')}
                value={newRelNote}
                onChange={(e) => setNewRelNote(e.target.value)}
                className={css({
                  backgroundColor: 'white',
                  color: 'stone.900',
                  _placeholder: { color: 'stone.400' },
                  display: 'block',
                  width: '100%',
                  fontSize: 'sm',
                  borderRadius: { base: 'md', sm: 'lg' },
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  boxShadow: 'sm',
                  _focus: { borderColor: 'amber.500' },
                  padding: { base: '2', sm: '2.5' },
                  marginBottom: '3',
                  transition: 'colors 0.2s',
                })}
              />
            </div>
            <div>
              <label htmlFor="relDirection" className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'stone.500', marginBottom: '1' })}>
                {t('relationship.typeLabel')}
              </label>
              <select
                id="relDirection"
                value={newRelDirection}
                onChange={(e) => setNewRelDirection(e.target.value as 'parent' | 'child' | 'spouse')}
                className={css({
                  backgroundColor: 'white',
                  color: 'stone.900',
                  display: 'block',
                  width: '100%',
                  fontSize: 'sm',
                  borderRadius: { base: 'md', sm: 'lg' },
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  boxShadow: 'sm',
                  _focus: { borderColor: 'amber.500' },
                  padding: { base: '2', sm: '2.5' },
                  transition: 'colors 0.2s',
                })}
              >
                <option value="parent">{t('relationship.typeChild')}</option>
                <option value="spouse">{t('relationship.typeSpouse')}</option>
                <option value="child">{t('relationship.typeParent')}</option>
              </select>
            </div>

            {(newRelDirection === 'child' || newRelDirection === 'parent') && (
              <div>
                <label htmlFor="relType" className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'stone.500', marginBottom: '1' })}>
                  {t('relationship.detailLabel')}
                </label>
                <select
                  id="relType"
                  value={newRelType}
                  onChange={(e) => setNewRelType(e.target.value as RelationshipType)}
                  className={css({
                    backgroundColor: 'white',
                    color: 'stone.900',
                    display: 'block',
                    width: '100%',
                    fontSize: 'sm',
                    borderRadius: { base: 'md', sm: 'lg' },
                    borderWidth: '1px',
                    borderColor: 'stone.300',
                    boxShadow: 'sm',
                    _focus: { borderColor: 'amber.500' },
                    padding: { base: '2', sm: '2.5' },
                    transition: 'colors 0.2s',
                  })}
                >
                  <option value="biological_child">{t('relationship.biological')}</option>
                  <option value="adopted_child">{t('relationship.adopted')}</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="relSearch" className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'stone.500', marginBottom: '1' })}>
                {t('relationship.searchPerson')}
              </label>
              <input
                id="relSearch"
                type="text"
                placeholder={t('relationship.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={css({
                  backgroundColor: 'white',
                  color: 'stone.900',
                  _placeholder: { color: 'stone.400' },
                  display: 'block',
                  width: '100%',
                  fontSize: 'sm',
                  borderRadius: { base: 'md', sm: 'lg' },
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  boxShadow: 'sm',
                  _focus: { borderColor: 'amber.500' },
                  padding: { base: '2', sm: '2.5' },
                  transition: 'colors 0.2s',
                })}
              />
              {searchResults.length > 0 && (
                <div
                  className={css({
                    marginTop: '2',
                    backgroundColor: 'white',
                    borderWidth: '1px',
                    borderColor: 'stone.200',
                    borderRadius: 'md',
                    boxShadow: 'lg',
                    maxHeight: '10rem',
                    overflowY: 'auto',
                  })}
                >
                  <div
                    className={css({
                      paddingX: '3',
                      paddingY: '1.5',
                      backgroundColor: 'stone.100',
                      fontSize: '2xs',
                      fontWeight: 'bold',
                      color: 'stone.500',
                      textTransform: 'uppercase',
                      letterSpacing: 'wide',
                      borderBottomWidth: '1px',
                      borderColor: 'stone.200',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                    })}
                  >
                    {t('relationship.searchResults')}
                  </div>
                  {searchResults.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setSelectedTargetId(p.id);
                        setSearchTerm(p.fullName);
                        setSearchResults([]);
                      }}
                      className={css({
                        width: '100%',
                        paddingX: '3',
                        paddingY: '2',
                        fontSize: 'sm',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottomWidth: '1px',
                        borderColor: 'stone.100',
                        _hover: { backgroundColor: 'amber.50' },
                      })}
                    >
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                        <span
                          className={css(
                            {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '3xs',
                              fontWeight: 'bold',
                              width: '3',
                              height: '3',
                              borderRadius: 'full',
                              color: 'white',
                              flexShrink: 0,
                            },
                            p.gender === 'male'
                              ? { backgroundColor: 'sky.500' }
                              : p.gender === 'female'
                                ? { backgroundColor: 'rose.500' }
                                : { backgroundColor: 'stone.400' }
                          )}
                        >
                          {p.gender === 'male' ? '♂' : p.gender === 'female' ? '♀' : '?'}
                        </span>
                        <span className={css({ fontWeight: 'medium', color: 'stone.800' })}>{p.fullName}</span>
                      </div>
                      <span className={css({ fontSize: '2xs', color: 'stone.400' })}>
                        {formatDisplayDate(p.birthYear, p.birthMonth, p.birthDay, t('common.unknown'))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedTargetId && (
                <p className={css({ fontSize: 'xs', color: 'green.600', marginTop: '1' })}>{t('relationship.selected', { name: searchTerm })}</p>
              )}
            </div>

            <div className={css({ display: 'flex', gap: '2', paddingTop: '2' })}>
              <button
                type="button"
                onClick={handleAddRelationship}
                disabled={!selectedTargetId || processing}
                className={css({
                  flex: 1,
                  backgroundColor: 'amber.700',
                  color: 'white',
                  paddingY: { base: '2', sm: '2.5' },
                  borderRadius: { base: 'md', sm: 'lg' },
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  _hover: { backgroundColor: 'amber.800' },
                  _disabled: { opacity: 0.5 },
                  transition: 'colors 0.2s',
                })}
              >
                {processing ? t('common.saving') : t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedTargetId(null);
                  setSearchTerm('');
                  setNewRelNote('');
                }}
                className={css({
                  paddingX: '4',
                  paddingY: { base: '2', sm: '2.5' },
                  backgroundColor: 'white',
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  color: 'stone.700',
                  borderRadius: { base: 'md', sm: 'lg' },
                  fontSize: 'sm',
                  _hover: { backgroundColor: 'stone.50' },
                  transition: 'colors 0.2s',
                })}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && isAddingBulk && (
        <div
          className={css({
            marginTop: '4',
            backgroundColor: 'rgb(224 242 254 / 0.5)',
            padding: { base: '4', sm: '5' },
            borderRadius: 'xl',
            borderWidth: '1px',
            borderColor: 'sky.200',
            boxShadow: 'sm',
          })}
        >
          <h4 className={css({ fontWeight: 'bold', color: 'sky.800', marginBottom: '3', fontSize: 'sm' })}>{t('relationship.bulkAddChildren')}</h4>
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
            <div>
              <label htmlFor="bulkSpouse" className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'stone.500', marginBottom: '1' })}>
                {t('relationship.selectOtherParent')}
              </label>
              <select
                id="bulkSpouse"
                value={selectedSpouseId}
                onChange={(e) => setSelectedSpouseId(e.target.value)}
                className={css({
                  flex: 1,
                  backgroundColor: 'white',
                  color: 'stone.900',
                  fontSize: 'sm',
                  borderRadius: { base: 'md', sm: 'lg' },
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  boxShadow: 'sm',
                  _focus: { borderColor: 'sky.500' },
                  padding: { base: '2', sm: '2.5' },
                  transition: 'colors 0.2s',
                })}
              >
                <option value="unknown">{t('relationship.unknownParent')}</option>
                {groupByType('spouse').map((rel) => (
                  <option key={rel.id} value={rel.targetPerson.id}>
                    {rel.targetPerson.fullName} {rel.note ? `(${rel.note})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
              <span className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'stone.500', marginBottom: '1' })}>
                {t('relationship.childrenList')}
              </span>
              {/* biome-ignore lint:suspicious/noArrayIndexKey */}
              {bulkChildren.map((child, index) => (
                <div key={index} className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                  <span className={css({ color: 'stone.400', fontSize: 'xs', width: '4' })}>{index + 1}.</span>
                  <input
                    type="text"
                    placeholder={t('relationship.fullNamePlaceholder')}
                    value={child.name}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].name = e.target.value;
                      setBulkChildren(newBulk);
                    }}
                    className={css({
                      flex: 2,
                      backgroundColor: 'white',
                      color: 'stone.900',
                      _placeholder: { color: 'stone.400' },
                      fontSize: 'sm',
                      borderRadius: 'md',
                      borderWidth: '1px',
                      borderColor: 'stone.300',
                      boxShadow: 'sm',
                      _focus: { borderColor: 'sky.500' },
                      padding: '2',
                      border: '1px',
                    })}
                  />
                  <select
                    value={child.gender}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].gender = e.target.value as 'male' | 'female' | 'other';
                      setBulkChildren(newBulk);
                    }}
                    className={css({
                      flex: 1,
                      backgroundColor: 'white',
                      color: 'stone.900',
                      fontSize: 'sm',
                      borderRadius: 'md',
                      borderWidth: '1px',
                      borderColor: 'stone.300',
                      boxShadow: 'sm',
                      _focus: { borderColor: 'sky.500' },
                      padding: '2',
                      border: '1px',
                    })}
                  >
                    <option value="male">{t('common.male')}</option>
                    <option value="female">{t('common.female')}</option>
                    <option value="other">{t('common.other')}</option>
                  </select>
                  <input
                    type="number"
                    placeholder={t('relationship.birthYearPlaceholder')}
                    value={child.birthYear}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].birthYear = e.target.value;
                      setBulkChildren(newBulk);
                    }}
                    className={css({
                      flex: 1,
                      backgroundColor: 'white',
                      color: 'stone.900',
                      _placeholder: { color: 'stone.400' },
                      fontSize: 'sm',
                      borderRadius: 'md',
                      borderWidth: '1px',
                      borderColor: 'stone.300',
                      boxShadow: 'sm',
                      _focus: { borderColor: 'sky.500' },
                      padding: '2',
                      border: '1px',
                      width: '6rem',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newBulk = bulkChildren.filter((_, i) => i !== index);
                      if (newBulk.length === 0) {
                        newBulk.push({ name: '', gender: 'male', birthYear: '', isProcessing: false });
                      }
                      setBulkChildren(newBulk);
                    }}
                    className={css({ color: 'stone.400', _hover: { color: 'red.500' }, padding: '2' })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setBulkChildren([...bulkChildren, { name: '', gender: 'male', birthYear: '', isProcessing: false }]);
                }}
                className={css({ color: 'sky.600', fontSize: 'xs', fontWeight: 'semibold', _hover: { color: 'sky.800' }, marginTop: '2', paddingX: '6' })}
              >
                {t('relationship.addRow')}
              </button>
            </div>

            <div className={css({ display: 'flex', gap: '2', paddingTop: '4', borderTopWidth: '1px', borderColor: 'stone.200' })}>
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={processing || bulkChildren.every((c) => c.name.trim() === '')}
                className={css({
                  flex: 1,
                  backgroundColor: 'sky.600',
                  color: 'white',
                  paddingY: { base: '2', sm: '2.5' },
                  borderRadius: { base: 'md', sm: 'lg' },
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  _hover: { backgroundColor: 'sky.700' },
                  _disabled: { opacity: 0.5 },
                  transition: 'colors 0.2s',
                })}
              >
                {processing ? t('common.saving') : t('relationship.saveAll')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingBulk(false);
                  setBulkChildren([{ name: '', gender: 'male', birthYear: '', isProcessing: false }]);
                  setSelectedSpouseId('');
                }}
                className={css({
                  paddingX: '4',
                  paddingY: { base: '2', sm: '2.5' },
                  backgroundColor: 'white',
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  color: 'stone.700',
                  borderRadius: { base: 'md', sm: 'lg' },
                  fontSize: 'sm',
                  _hover: { backgroundColor: 'stone.50' },
                  transition: 'colors 0.2s',
                })}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && isAddingSpouse && (
        <div
          className={css({
            marginTop: '4',
            backgroundColor: 'rgb(255 241 242 / 0.5)',
            padding: { base: '4', sm: '5' },
            borderRadius: 'xl',
            borderWidth: '1px',
            borderColor: 'rose.200',
            boxShadow: 'sm',
          })}
        >
          <h4 className={css({ fontWeight: 'bold', color: 'rose.800', marginBottom: '3', fontSize: 'sm' })}>{t('relationship.quickAddSpouse')}</h4>
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
            <div>
              <label htmlFor="spouseName" className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'rose.700', marginBottom: '1' })}>
                {t('relationship.fullNameRequired')}
              </label>
              <input
                id="spouseName"
                type="text"
                placeholder={t('member.fullNamePlaceholder')}
                value={newSpouseName}
                onChange={(e) => setNewSpouseName(e.target.value)}
                className={css({
                  backgroundColor: 'white',
                  color: 'stone.900',
                  _placeholder: { color: 'stone.400' },
                  display: 'block',
                  width: '100%',
                  fontSize: 'sm',
                  borderRadius: { base: 'md', sm: 'lg' },
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  boxShadow: 'sm',
                  _focus: { borderColor: 'rose.500' },
                  padding: { base: '2', sm: '2.5' },
                  transition: 'colors 0.2s',
                })}
              />
            </div>
            <div>
              <label
                htmlFor="spouseBirthYear"
                className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'rose.700', marginBottom: '1' })}
              >
                {t('relationship.birthYearOptional')}
              </label>
              <input
                id="spouseBirthYear"
                type="number"
                placeholder={t('relationship.birthYearPlaceholder')}
                value={newSpouseBirthYear}
                onChange={(e) => setNewSpouseBirthYear(e.target.value)}
                className={css({
                  backgroundColor: 'white',
                  color: 'stone.900',
                  _placeholder: { color: 'stone.400' },
                  display: 'block',
                  width: '100%',
                  fontSize: 'sm',
                  borderRadius: { base: 'md', sm: 'lg' },
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  boxShadow: 'sm',
                  _focus: { borderColor: 'rose.500' },
                  padding: { base: '2', sm: '2.5' },
                  transition: 'colors 0.2s',
                })}
              />
            </div>
            <div>
              <label htmlFor="spouseRelNote" className={css({ display: 'block', fontSize: 'xs', fontWeight: 'medium', color: 'rose.700', marginBottom: '1' })}>
                {t('relationship.spouseNoteLabel')}
              </label>
              <input
                id="spouseRelNote"
                type="text"
                placeholder={t('relationship.spouseNotePlaceholder')}
                value={newSpouseNote}
                onChange={(e) => setNewSpouseNote(e.target.value)}
                className={css({
                  backgroundColor: 'white',
                  color: 'stone.900',
                  _placeholder: { color: 'stone.400' },
                  display: 'block',
                  width: '100%',
                  fontSize: 'sm',
                  borderRadius: { base: 'md', sm: 'lg' },
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  boxShadow: 'sm',
                  _focus: { borderColor: 'rose.500' },
                  padding: { base: '2', sm: '2.5' },
                  transition: 'colors 0.2s',
                })}
              />
            </div>
            <p className={css({ fontSize: 'xs', color: 'stone.500', fontStyle: 'italic', marginTop: '1' })}>
              {t('relationship.autoGenderNote', {
                gender: personGender === 'male' ? t('common.female') : personGender === 'female' ? t('common.male') : t('common.female'),
              })}
            </p>
            <div className={css({ display: 'flex', gap: '2', paddingTop: '2' })}>
              <button
                type="button"
                onClick={handleQuickAddSpouse}
                disabled={!newSpouseName.trim() || processing}
                className={css({
                  flex: 1,
                  backgroundColor: 'rose.600',
                  color: 'white',
                  paddingY: { base: '2', sm: '2.5' },
                  borderRadius: { base: 'md', sm: 'lg' },
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  _hover: { backgroundColor: 'rose.700' },
                  _disabled: { opacity: 0.5 },
                  transition: 'colors 0.2s',
                })}
              >
                {processing ? t('common.saving') : t('common.save')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSpouse(false);
                  setNewSpouseName('');
                  setNewSpouseBirthYear('');
                  setNewSpouseNote('');
                }}
                className={css({
                  paddingX: '4',
                  paddingY: { base: '2', sm: '2.5' },
                  backgroundColor: 'white',
                  borderWidth: '1px',
                  borderColor: 'stone.300',
                  color: 'stone.700',
                  borderRadius: { base: 'md', sm: 'lg' },
                  fontSize: 'sm',
                  _hover: { backgroundColor: 'stone.50' },
                  transition: 'colors 0.2s',
                })}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
