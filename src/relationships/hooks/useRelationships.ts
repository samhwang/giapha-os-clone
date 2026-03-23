import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '../../lib/logger';
import { createPerson, getPersons } from '../../members/server/member';
import { Gender, type Person } from '../../members/types';
import { createRelationship, deleteRelationship, getRelationshipsForPerson } from '../server/relationship';
import { RelationshipType } from '../types';

export interface DescendantStats {
  biologicalChildren: number;
  maleBiologicalChildren: number;
  femaleBiologicalChildren: number;
  paternalGrandchildren: number;
  maternalGrandchildren: number;
  sonInLaw: number;
  daughterInLaw: number;
}

export interface EnrichedRelationship {
  id: string;
  type: RelationshipType;
  direction: 'parent' | 'child' | 'spouse' | 'child_in_law';
  targetPerson: Person;
  note: string | null;
}

export interface AddRelationshipData {
  direction: string;
  type: string;
  note: string;
  targetId: string;
}

export interface BulkAddData {
  spouseId: string;
  children: Array<{ name: string; gender: string; birthYear: string; birthOrder: string }>;
}

export interface QuickAddSpouseData {
  name: string;
  birthYear: string;
  note: string;
}

interface UseRelationshipsOptions {
  personId: string;
  personGender: string;
  onStatsLoaded?: (stats: DescendantStats) => void;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: relationship enrichment requires nested loops
export function useRelationships({ personId, personGender, onStatsLoaded }: UseRelationshipsOptions) {
  const { t } = useTranslation();

  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Which form is active
  const [activeForm, setActiveForm] = useState<'none' | 'add' | 'bulk' | 'spouse'>('none');

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

      if (onStatsLoaded) {
        const bioChildren = formattedRels.filter((r) => r.direction === 'child' && r.type === RelationshipType.enum.biological_child);
        const maleChildren = formattedRels.filter((r) => r.direction === 'child' && r.targetPerson.gender === Gender.enum.male);
        const femaleChildren = formattedRels.filter((r) => r.direction === 'child' && r.targetPerson.gender === Gender.enum.female);

        const sonInLaw = formattedRels.filter((r) => r.direction === 'child_in_law' && r.targetPerson.gender === Gender.enum.male).length;
        const daughterInLaw = formattedRels.filter((r) => r.direction === 'child_in_law' && r.targetPerson.gender === Gender.enum.female).length;

        let paternalGrandchildren = 0;
        let maternalGrandchildren = 0;

        if (childrenIds.length > 0) {
          for (const childId of childrenIds) {
            const childRelsForGrandchildren = await getRelationshipsForPerson({ data: { personId: childId } });
            const grandchildCount = childRelsForGrandchildren.filter(
              (r) => r.personAId === childId && (r.type === RelationshipType.enum.biological_child || r.type === RelationshipType.enum.adopted_child)
            ).length;

            const childPerson = personsMap.get(childId);
            if (childPerson?.gender === Gender.enum.male) paternalGrandchildren += grandchildCount;
            else if (childPerson?.gender === Gender.enum.female) maternalGrandchildren += grandchildCount;
          }
        }

        onStatsLoaded({
          biologicalChildren: bioChildren.length,
          maleBiologicalChildren: maleChildren.length,
          femaleBiologicalChildren: femaleChildren.length,
          paternalGrandchildren,
          maternalGrandchildren,
          sonInLaw,
          daughterInLaw,
        });
      }

      setRelationships(formattedRels);
    } catch (err) {
      logger.error('Error fetching relationships:', err);
    } finally {
      setLoading(false);
    }
  }, [personId, t, onStatsLoaded]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const handleAddRelationship = async (data: AddRelationshipData): Promise<void> => {
    setProcessing(true);
    try {
      let personAId = personId;
      let personBId = data.targetId;

      if (data.direction === 'parent') {
        personAId = data.targetId;
        personBId = personId;
      }

      let type: RelationshipType = RelationshipType.enum.biological_child;
      if (data.direction === 'spouse') type = RelationshipType.enum.marriage;
      else if (data.type === RelationshipType.enum.adopted_child) type = RelationshipType.enum.adopted_child;

      await createRelationship({
        data: { personAId, personBId, type, note: data.note || null },
      });

      setActiveForm('none');
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      setActionError(`${t('error.generic')} ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAdd = async (data: BulkAddData): Promise<void> => {
    const validChildren = data.children.filter((c) => c.name.trim() !== '');
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
            gender: child.gender as Gender,
            ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
            ...(birthOrder && !Number.isNaN(birthOrder) ? { birthOrder } : {}),
          },
        });

        await createRelationship({
          data: { personAId: personId, personBId: newPerson.id, type: RelationshipType.enum.biological_child },
        });

        if (data.spouseId && data.spouseId !== 'unknown') {
          await createRelationship({
            data: { personAId: data.spouseId, personBId: newPerson.id, type: RelationshipType.enum.biological_child },
          });
        }

        successCount++;
      }

      if (successCount === validChildren.length) {
        setActiveForm('none');
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

  const handleQuickAddSpouse = async (data: QuickAddSpouseData): Promise<void> => {
    if (!data.name.trim()) {
      setActionError(t('relationship.spouseNameRequired'));
      return;
    }

    setProcessing(true);
    try {
      const newSpouseGender =
        personGender === Gender.enum.male ? Gender.enum.female : personGender === Gender.enum.female ? Gender.enum.male : Gender.enum.female;
      const birthYear = data.birthYear.trim() !== '' ? Number.parseInt(data.birthYear, 10) : undefined;

      const newPerson = await createPerson({
        data: {
          fullName: data.name.trim(),
          gender: newSpouseGender as Gender,
          ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
        },
      });

      await createRelationship({
        data: {
          personAId: personId,
          personBId: newPerson.id,
          type: RelationshipType.enum.marriage,
          note: data.note.trim() || null,
        },
      });

      setActiveForm('none');
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      setActionError(`${t('error.generic')} ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (relId: string): Promise<void> => {
    if (!confirm(t('relationship.deleteConfirm'))) return;
    try {
      await deleteRelationship({ data: { id: relId } });
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      setActionError(`${t('error.generic')} ${e.message}`);
    }
  };

  const groupByType = (type: string): EnrichedRelationship[] =>
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

  return {
    relationships,
    loading,
    allPersons,
    processing,
    actionError,
    dismissError: () => setActionError(null),
    activeForm,
    setActiveForm,
    handleAddRelationship,
    handleBulkAdd,
    handleQuickAddSpouse,
    handleDelete,
    groupByType,
  };
}
