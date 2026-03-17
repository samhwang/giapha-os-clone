import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import { logger } from '../../lib/logger';
import { createPerson, getPersons } from '../../members/server/member';
import { Gender, type Person } from '../../members/types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { cn } from '../../ui/utils/cn';
import { getAvatarBg } from '../../ui/utils/styles';
import { createRelationship, deleteRelationship, getRelationshipsForPerson } from '../server/relationship';
import { RelationshipType } from '../types';

interface RelationshipManagerProps {
  personId: string;
  canEdit?: boolean;
  personGender: string;
}

interface EnrichedRelationship {
  id: string;
  type: RelationshipType;
  direction: 'parent' | 'child' | 'spouse' | 'child_in_law';
  targetPerson: Person;
  note: string | null;
}

export default function RelationshipManager({ personId, canEdit = false, personGender }: RelationshipManagerProps) {
  const { t } = useTranslation();
  const { setMemberModalId } = useDashboardStore();

  const handlePersonClick = (id: string) => {
    setMemberModalId(id);
  };

  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Relationship State
  const [isAdding, setIsAdding] = useState(false);
  const [newRelType, setNewRelType] = useState<RelationshipType>(RelationshipType.enum.biological_child);
  const [newRelDirection, setNewRelDirection] = useState<'parent' | 'child' | 'spouse'>('parent');
  const [newRelNote, setNewRelNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Bulk Add State
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [selectedSpouseId, setSelectedSpouseId] = useState<string>('');
  const [bulkChildren, setBulkChildren] = useState<{ name: string; gender: Gender; birthYear: string; birthOrder: string; isProcessing: boolean }[]>([
    { name: '', gender: Gender.enum.male, birthYear: '', birthOrder: '1', isProcessing: false },
  ]);

  // Quick Add Spouse State
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
        if (r.type === RelationshipType.enum.marriage) {
          direction = 'spouse';
        } else if (isA) {
          direction = 'child'; // I am A (Parent), B is Child
        } else {
          direction = 'parent'; // I am B (Child), A is Parent
        }

        formattedRels.push({
          id: r.id,
          type: r.type as RelationshipType,
          direction,
          targetPerson: target,
          note: r.note,
        });
      }

      // Fetch in-laws (spouses of children)
      const childrenIds = formattedRels.filter((r) => r.direction === 'child').map((r) => r.targetPerson.id);

      for (const childId of childrenIds) {
        const childRels = await getRelationshipsForPerson({ data: { personId: childId } });
        const childPerson = personsMap.get(childId);
        if (!childPerson) continue;

        for (const m of childRels) {
          if (m.type !== RelationshipType.enum.marriage) continue;
          const spouseId = m.personAId === childId ? m.personBId : m.personAId;
          const spousePerson = personsMap.get(spouseId);
          if (!spousePerson) continue;

          const spouseGender = spousePerson.gender;
          let noteLabel =
            spouseGender === Gender.enum.female
              ? t('relationship.daughterInLaw', { name: childPerson.fullName })
              : spouseGender === Gender.enum.male
                ? t('relationship.sonInLaw', { name: childPerson.fullName })
                : t('relationship.spouseOf', { name: childPerson.fullName });

          if (m.note) noteLabel += ` - ${m.note}`;

          formattedRels.push({
            id: `${m.id}_inlaw`,
            type: RelationshipType.enum.marriage,
            direction: 'child_in_law',
            targetPerson: spousePerson,
            note: noteLabel,
          });
        }
      }

      setRelationships(formattedRels);
    } catch (err) {
      logger.error('Error fetching relationships:', err);
    } finally {
      setLoading(false);
    }
  }, [personId, t]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  // Search for people
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

      let type: RelationshipType = RelationshipType.enum.biological_child;
      if (newRelDirection === 'spouse') type = RelationshipType.enum.marriage;
      else if (newRelType === RelationshipType.enum.adopted_child) type = RelationshipType.enum.adopted_child;

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
      setActionError(`${t('error.generic')} ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAdd = async () => {
    const validChildren = bulkChildren.filter((c) => c.name.trim() !== '');
    if (validChildren.length === 0) {
      setActionError(t('relationship.bulkMinOneChild'));
      return;
    }

    setProcessing(true);
    let successCount = 0;

    try {
      for (const child of validChildren) {
        const birthYear = child.birthYear.trim() !== '' ? Number.parseInt(child.birthYear, 10) : undefined;
        const birthOrder = child.birthOrder.trim() !== '' ? Number.parseInt(child.birthOrder, 10) : undefined;

        const newPerson = await createPerson({
          data: {
            fullName: child.name.trim(),
            gender: child.gender,
            ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
            ...(birthOrder && !Number.isNaN(birthOrder) ? { birthOrder } : {}),
          },
        });

        await createRelationship({
          data: {
            personAId: personId,
            personBId: newPerson.id,
            type: RelationshipType.enum.biological_child,
          },
        });

        if (selectedSpouseId && selectedSpouseId !== 'unknown') {
          await createRelationship({
            data: {
              personAId: selectedSpouseId,
              personBId: newPerson.id,
              type: RelationshipType.enum.biological_child,
            },
          });
        }

        successCount++;
      }

      if (successCount === validChildren.length) {
        setIsAddingBulk(false);
        setBulkChildren([{ name: '', gender: Gender.enum.male, birthYear: '', birthOrder: '1', isProcessing: false }]);
        setSelectedSpouseId('');
        fetchRelationships();
      } else {
        setActionError(t('relationship.bulkPartialError', { count: successCount, total: validChildren.length }));
        fetchRelationships();
      }
    } catch (err) {
      const e = err as Error;
      setActionError(`${t('error.generic')} ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickAddSpouse = async () => {
    if (!newSpouseName.trim()) {
      setActionError(t('relationship.spouseNameRequired'));
      return;
    }

    setProcessing(true);
    try {
      const newSpouseGender =
        personGender === Gender.enum.male ? Gender.enum.female : personGender === Gender.enum.female ? Gender.enum.male : Gender.enum.female;
      const birthYear = newSpouseBirthYear.trim() !== '' ? Number.parseInt(newSpouseBirthYear, 10) : undefined;

      const newPerson = await createPerson({
        data: {
          fullName: newSpouseName.trim(),
          gender: newSpouseGender as Gender,
          ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
        },
      });

      await createRelationship({
        data: {
          personAId: personId,
          personBId: newPerson.id,
          type: RelationshipType.enum.marriage,
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
      setActionError(`${t('error.generic')} ${e.message}`);
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
      setActionError(`${t('error.generic')} ${e.message}`);
    }
  };

  const groupByType = (type: string) =>
    relationships
      .filter((r) => r.direction === type)
      .sort((a, b) => {
        const yearA = a.targetPerson.birthYear;
        const yearB = b.targetPerson.birthYear;
        if (yearA == null && yearB == null) return 0;
        if (yearA == null) return 1;
        if (yearB == null) return -1;
        return yearA - yearB;
      });

  if (loading) return <div className="text-stone-500 text-sm">{t('relationship.loadingFamily')}</div>;

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl p-3 flex items-center justify-between gap-2">
          <p>{actionError}</p>
          <button type="button" onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold shrink-0">
            ×
          </button>
        </div>
      )}
      {['parent', 'spouse', 'child', 'child_in_law'].map((group) => {
        const items = groupByType(group);
        let title = '';
        if (group === 'parent') title = t('relationship.parents');
        if (group === 'spouse') title = t('relationship.spouse');
        if (group === 'child') title = t('relationship.children');
        if (group === 'child_in_law') title = t('relationship.inLawChildren');

        if (items.length === 0 && !canEdit) return null;

        return (
          <div key={group} className="border-b border-stone-100 pb-4 last:border-0">
            <h4 className="font-bold text-stone-700 mb-3 flex justify-between items-center text-sm uppercase tracking-wide">{title}</h4>
            {items.length > 0 ? (
              <ul className="space-y-3">
                {items.map((rel) => (
                  <li key={rel.id} className="flex items-center justify-between group">
                    <button
                      type="button"
                      onClick={() => handlePersonClick(rel.targetPerson.id)}
                      className="flex items-center gap-3 hover:bg-stone-100 p-2.5 -mx-2.5 rounded-xl transition-all duration-200 flex-1 text-left"
                    >
                      <div
                        className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center text-xs text-white overflow-hidden',
                          getAvatarBg(rel.targetPerson.gender)
                        )}
                      >
                        {rel.targetPerson.avatarUrl ? (
                          <img src={rel.targetPerson.avatarUrl} alt={rel.targetPerson.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <DefaultAvatar gender={rel.targetPerson.gender} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-stone-900 font-medium text-sm">{rel.targetPerson.fullName}</span>
                        {rel.note && <span className="text-xs text-amber-600 font-medium italic mt-0.5">({rel.note})</span>}
                        {rel.type === RelationshipType.enum.adopted_child && (
                          <span className="text-xs text-stone-400 italic mt-0.5">({t('relationship.adopted')})</span>
                        )}
                      </div>
                    </button>
                    {canEdit && rel.direction !== 'child_in_law' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rel.id)}
                        className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 sm:p-2.5 rounded-lg transition-colors flex items-center justify-center ml-2"
                        title={t('relationship.deleteRelationship')}
                        aria-label={t('relationship.deleteRelationship')}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">{t('relationship.noInfo')}</p>
            )}
          </div>
        );
      })}

      {/* Add Buttons (Editor+) */}
      {canEdit && !isAdding && !isAddingBulk && !isAddingSpouse && (
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            type="button"
            onClick={() => setIsAddingBulk(true)}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-sky-400 hover:text-sky-700 transition-all duration-200"
          >
            {t('relationship.addChild')}
          </button>
          <button
            type="button"
            onClick={() => setIsAddingSpouse(true)}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-rose-400 hover:text-rose-700 transition-all duration-200"
          >
            {t('relationship.addSpouse')}
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-amber-400 hover:text-amber-700 transition-all duration-200"
          >
            {t('relationship.addRelationship')}
          </button>
        </div>
      )}

      {/* Add Relationship Form */}
      {canEdit && isAdding && (
        <div className="mt-4 bg-stone-50/50 p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
          <h4 className="font-bold text-stone-800 mb-3 text-sm">{t('relationship.addNewRelationship')}</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="relNote" className="block text-xs font-medium text-stone-500 mb-1">
                {t('relationship.noteLabel')}
              </label>
              <input
                id="relNote"
                type="text"
                placeholder={t('relationship.notePlaceholder')}
                value={newRelNote}
                onChange={(e) => setNewRelNote(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border mb-3 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="relDirection" className="block text-xs font-medium text-stone-500 mb-1">
                {t('relationship.typeLabel')}
              </label>
              <select
                id="relDirection"
                value={newRelDirection}
                onChange={(e) => setNewRelDirection(e.target.value as 'parent' | 'child' | 'spouse')}
                className="bg-white text-stone-900 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
              >
                <option value="parent">{t('relationship.typeChild')}</option>
                <option value="spouse">{t('relationship.typeSpouse')}</option>
                <option value="child">{t('relationship.typeParent')}</option>
              </select>
            </div>

            {(newRelDirection === 'child' || newRelDirection === 'parent') && (
              <div>
                <label htmlFor="relType" className="block text-xs font-medium text-stone-500 mb-1">
                  {t('relationship.detailLabel')}
                </label>
                <select
                  id="relType"
                  value={newRelType}
                  onChange={(e) => setNewRelType(e.target.value as RelationshipType)}
                  className="bg-white text-stone-900 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
                >
                  <option value="biological_child">{t('relationship.biological')}</option>
                  <option value="adopted_child">{t('relationship.adopted')}</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="relSearch" className="block text-xs font-medium text-stone-500 mb-1">
                {t('relationship.searchPerson')}
              </label>
              <input
                id="relSearch"
                type="text"
                placeholder={t('relationship.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-stone-200 rounded-md shadow-lg max-h-62.5 overflow-y-auto">
                  <div className="px-3 py-1.5 bg-stone-100 text-2xs font-bold text-stone-500 uppercase tracking-wide border-b border-stone-200 sticky top-0 z-10">
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
                      className="w-full px-3 py-2 hover:bg-amber-50 text-sm flex items-center justify-between border-b border-stone-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'flex items-center justify-center text-[8px] font-bold size-3 rounded-full text-white shrink-0',
                            p.gender === Gender.enum.male && 'bg-sky-500',
                            p.gender === Gender.enum.female && 'bg-rose-500',
                            p.gender === Gender.enum.other && 'bg-stone-400'
                          )}
                        >
                          {p.gender === Gender.enum.male ? '♂' : p.gender === Gender.enum.female ? '♀' : '?'}
                        </span>
                        <span className="font-medium text-stone-800">{p.fullName}</span>
                      </div>
                      <span className="text-2xs text-stone-400">{formatDisplayDate(p.birthYear, p.birthMonth, p.birthDay, t('common.unknown'))}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedTargetId && <p className="text-xs text-green-600 mt-1">{t('relationship.selected', { name: searchTerm })}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddRelationship}
                disabled={!selectedTargetId || processing}
                className="flex-1 bg-amber-700 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors"
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
                className="px-4 py-2 sm:py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md sm:rounded-lg text-sm hover:bg-stone-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Children Form */}
      {canEdit && isAddingBulk && (
        <div className="mt-4 bg-sky-50/50 p-4 sm:p-5 rounded-xl border border-sky-200 shadow-sm">
          <h4 className="font-bold text-sky-800 mb-3 text-sm">{t('relationship.bulkAddChildren')}</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="bulkSpouse" className="block text-xs font-medium text-stone-500 mb-1">
                {t('relationship.selectOtherParent')}
              </label>
              <select
                id="bulkSpouse"
                value={selectedSpouseId}
                onChange={(e) => setSelectedSpouseId(e.target.value)}
                className="flex-1 bg-white text-stone-900 text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 sm:p-2.5 border transition-colors"
              >
                <option value="unknown">{t('relationship.unknownParent')}</option>
                {groupByType('spouse').map((rel) => (
                  <option key={rel.id} value={rel.targetPerson.id}>
                    {rel.targetPerson.fullName} {rel.note ? `(${rel.note})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-stone-500 mb-1">{t('relationship.childrenList')}</span>
              {bulkChildren.map((child, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form rows without stable IDs
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-stone-400 text-xs w-4">{index + 1}.</span>
                  <input
                    type="text"
                    placeholder={t('relationship.fullNamePlaceholder')}
                    value={child.name}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].name = e.target.value;
                      setBulkChildren(newBulk);
                    }}
                    className="flex-2 bg-white text-stone-900 placeholder-stone-400 text-sm rounded-md border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border"
                  />
                  <select
                    value={child.gender}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].gender = e.target.value as Gender;
                      setBulkChildren(newBulk);
                    }}
                    className="flex-1 bg-white text-stone-900 text-sm rounded-md border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border"
                  >
                    <option value={Gender.enum.male}>{t('common.male')}</option>
                    <option value={Gender.enum.female}>{t('common.female')}</option>
                    <option value={Gender.enum.other}>{t('common.other')}</option>
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
                    className="flex-1 bg-white text-stone-900 placeholder-stone-400 text-sm rounded-md border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border w-24"
                  />
                  <input
                    type="number"
                    placeholder={t('relationship.birthOrderPlaceholder')}
                    value={child.birthOrder}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].birthOrder = e.target.value;
                      setBulkChildren(newBulk);
                    }}
                    className="bg-white text-stone-900 placeholder-stone-400 text-sm rounded-md border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border w-16"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newBulk = bulkChildren.filter((_, i) => i !== index);
                      if (newBulk.length === 0) {
                        newBulk.push({ name: '', gender: Gender.enum.male, birthYear: '', birthOrder: '1', isProcessing: false });
                      }
                      setBulkChildren(newBulk);
                    }}
                    className="text-stone-400 hover:text-red-500 p-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const nextOrder = String(bulkChildren.length + 1);
                  setBulkChildren([...bulkChildren, { name: '', gender: Gender.enum.male, birthYear: '', birthOrder: nextOrder, isProcessing: false }]);
                }}
                className="text-sky-600 text-xs font-semibold hover:text-sky-800 mt-2 px-6"
              >
                {t('relationship.addRow')}
              </button>
            </div>

            <div className="flex gap-2 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={processing || bulkChildren.every((c) => c.name.trim() === '')}
                className="flex-1 bg-sky-600 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
              >
                {processing ? t('common.saving') : t('relationship.saveAll')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingBulk(false);
                  setBulkChildren([{ name: '', gender: Gender.enum.male, birthYear: '', birthOrder: '1', isProcessing: false }]);
                  setSelectedSpouseId('');
                }}
                className="px-4 py-2 sm:py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md sm:rounded-lg text-sm hover:bg-stone-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Spouse Form */}
      {canEdit && isAddingSpouse && (
        <div className="mt-4 bg-rose-50/50 p-4 sm:p-5 rounded-xl border border-rose-200 shadow-sm">
          <h4 className="font-bold text-rose-800 mb-3 text-sm">{t('relationship.quickAddSpouse')}</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="spouseName" className="block text-xs font-medium text-rose-700 mb-1">
                {t('relationship.fullNameRequired')}
              </label>
              <input
                id="spouseName"
                type="text"
                placeholder={t('member.fullNamePlaceholder')}
                value={newSpouseName}
                onChange={(e) => setNewSpouseName(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
              />
            </div>
            <div>
              <label htmlFor="spouseBirthYear" className="block text-xs font-medium text-rose-700 mb-1">
                {t('relationship.birthYearOptional')}
              </label>
              <input
                id="spouseBirthYear"
                type="number"
                placeholder={t('relationship.birthYearPlaceholder')}
                value={newSpouseBirthYear}
                onChange={(e) => setNewSpouseBirthYear(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
              />
            </div>
            <div>
              <label htmlFor="spouseRelNote" className="block text-xs font-medium text-rose-700 mb-1">
                {t('relationship.spouseNoteLabel')}
              </label>
              <input
                id="spouseRelNote"
                type="text"
                placeholder={t('relationship.spouseNotePlaceholder')}
                value={newSpouseNote}
                onChange={(e) => setNewSpouseNote(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
              />
            </div>
            <p className="text-xs text-stone-500 italic mt-1">
              {t('relationship.autoGenderNote', {
                gender: personGender === Gender.enum.male ? t('common.female') : personGender === Gender.enum.female ? t('common.male') : t('common.female'),
              })}
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleQuickAddSpouse}
                disabled={!newSpouseName.trim() || processing}
                className="flex-1 bg-rose-600 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
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
                className="px-4 py-2 sm:py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md sm:rounded-lg text-sm hover:bg-stone-50 transition-colors"
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
