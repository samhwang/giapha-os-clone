import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { logger } from "../../lib/logger";
import { queryKeys } from "../../lib/queryKeys";
import { createPerson, getPersons, updatePerson } from "../../members/server/member";
import { Gender, type Person } from "../../members/types";
import {
  createRelationship,
  deleteRelationship,
  getRelationshipsForPerson,
} from "../server/relationship";
import { RelationshipType } from "../types";
import { getAutoPopulatedFields } from "../utils/autoPopulate";

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
  direction: "parent" | "child" | "spouse" | "child_in_law";
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
  person: Person;
  onStatsLoaded?: (stats: DescendantStats) => void;
}

interface RelationshipsData {
  relationships: EnrichedRelationship[];
  allPersons: Person[];
}

async function fetchRelationshipsData(
  personId: string,
  t: (key: string, opts?: Record<string, string>) => string,
  onStatsLoaded?: (stats: DescendantStats) => void,
): Promise<RelationshipsData> {
  const rels = await getRelationshipsForPerson({ data: { personId } });
  const persons = await getPersons();

  const personsMap = new Map(persons.map((p) => [p.id, p]));
  const formattedRels: EnrichedRelationship[] = [];

  for (const r of rels) {
    const isA = r.personAId === personId;
    const targetId = isA ? r.personBId : r.personAId;
    const target = personsMap.get(targetId);
    if (!target) continue;

    let direction: "parent" | "child" | "spouse" = "spouse";
    if (r.type === RelationshipType.enum.marriage) {
      direction = "spouse";
    } else if (isA) {
      direction = "child";
    } else {
      direction = "parent";
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
  const childrenIds = formattedRels
    .filter((r) => r.direction === "child")
    .map((r) => r.targetPerson.id);

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
          ? t("relationship.daughterInLaw", { name: childPerson.fullName })
          : spouseGender === Gender.enum.male
            ? t("relationship.sonInLaw", { name: childPerson.fullName })
            : t("relationship.spouseOf", { name: childPerson.fullName });

      if (m.note) noteLabel += ` - ${m.note}`;

      formattedRels.push({
        id: `${m.id}_inlaw`,
        type: RelationshipType.enum.marriage,
        direction: "child_in_law",
        targetPerson: spousePerson,
        note: noteLabel,
      });
    }
  }

  if (onStatsLoaded) {
    const bioChildren = formattedRels.filter(
      (r) => r.direction === "child" && r.type === RelationshipType.enum.biological_child,
    );
    const maleChildren = formattedRels.filter(
      (r) => r.direction === "child" && r.targetPerson.gender === Gender.enum.male,
    );
    const femaleChildren = formattedRels.filter(
      (r) => r.direction === "child" && r.targetPerson.gender === Gender.enum.female,
    );

    const sonInLaw = formattedRels.filter(
      (r) => r.direction === "child_in_law" && r.targetPerson.gender === Gender.enum.male,
    ).length;
    const daughterInLaw = formattedRels.filter(
      (r) => r.direction === "child_in_law" && r.targetPerson.gender === Gender.enum.female,
    ).length;

    let paternalGrandchildren = 0;
    let maternalGrandchildren = 0;

    if (childrenIds.length > 0) {
      for (const childId of childrenIds) {
        const childRelsForGrandchildren = await getRelationshipsForPerson({
          data: { personId: childId },
        });
        const grandchildCount = childRelsForGrandchildren.filter(
          (r) =>
            r.personAId === childId &&
            (r.type === RelationshipType.enum.biological_child ||
              r.type === RelationshipType.enum.adopted_child),
        ).length;

        const childPerson = personsMap.get(childId);
        if (childPerson?.gender === Gender.enum.male) paternalGrandchildren += grandchildCount;
        else if (childPerson?.gender === Gender.enum.female)
          maternalGrandchildren += grandchildCount;
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

  return { relationships: formattedRels, allPersons: persons };
}

export function useRelationships({ person, onStatsLoaded }: UseRelationshipsOptions) {
  const personId = person.id;
  const personGender = person.gender;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeForm, setActiveForm] = useState<"none" | "add" | "bulk" | "spouse">("none");

  const { data, isLoading: loading } = useQuery({
    queryKey: queryKeys.relationships.forPerson(personId),
    queryFn: () => fetchRelationshipsData(personId, t, onStatsLoaded),
  });

  const relationships = data?.relationships ?? [];
  const allPersons = data?.allPersons ?? [];

  const invalidateRelationships = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.relationships.forPerson(personId) });
  };

  const addRelationshipMutation = useMutation({
    mutationFn: async (mutationData: AddRelationshipData) => {
      let personAId = personId;
      let personBId = mutationData.targetId;

      if (mutationData.direction === "parent") {
        personAId = mutationData.targetId;
        personBId = personId;
      }

      let type: RelationshipType = RelationshipType.enum.biological_child;
      if (mutationData.direction === "spouse") type = RelationshipType.enum.marriage;
      else if (mutationData.type === RelationshipType.enum.adopted_child)
        type = RelationshipType.enum.adopted_child;

      await createRelationship({
        data: { personAId, personBId, type, note: mutationData.note || null },
      });

      // Auto-populate generation and isInLaw on target if currently null
      try {
        const targetPerson = allPersons.find((p) => p.id === mutationData.targetId);
        if (targetPerson && (targetPerson.generation == null || targetPerson.isInLaw == null)) {
          const fields = getAutoPopulatedFields(
            mutationData.direction as "child" | "parent" | "spouse",
            person,
          );
          const updates: { id: string; generation?: number; isInLaw?: boolean } = {
            id: mutationData.targetId,
          };

          if (targetPerson.generation == null && fields.generation !== undefined) {
            updates.generation = fields.generation;
          }
          if (targetPerson.isInLaw == null) {
            updates.isInLaw = fields.isInLaw;
          }

          if (updates.generation !== undefined || updates.isInLaw !== undefined) {
            await updatePerson({ data: updates });
          }
        }
      } catch (err) {
        logger.error("Failed to auto-update target person properties", err);
      }
    },
    onSuccess: () => {
      setActiveForm("none");
      invalidateRelationships();
    },
  });

  const bulkAddMutation = useMutation({
    mutationFn: async (mutationData: BulkAddData) => {
      const validChildren = mutationData.children.filter((c) => c.name.trim() !== "");
      if (validChildren.length === 0) {
        throw new Error(t("relationship.bulkMinOneChild"));
      }

      let successCount = 0;

      for (const child of validChildren) {
        const birthYear =
          child.birthYear.trim() !== "" ? Number.parseInt(child.birthYear, 10) : undefined;
        const birthOrder =
          child.birthOrder.trim() !== "" ? Number.parseInt(child.birthOrder, 10) : undefined;

        const childFields = getAutoPopulatedFields("child", person);
        const newPerson = await createPerson({
          data: {
            fullName: child.name.trim(),
            gender: child.gender as Gender,
            ...childFields,
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

        if (mutationData.spouseId && mutationData.spouseId !== "unknown") {
          await createRelationship({
            data: {
              personAId: mutationData.spouseId,
              personBId: newPerson.id,
              type: RelationshipType.enum.biological_child,
            },
          });
        }

        successCount++;
      }

      if (successCount < validChildren.length) {
        throw new Error(
          t("relationship.bulkPartialError", {
            count: String(successCount),
            total: String(validChildren.length),
          }),
        );
      }
    },
    onSuccess: () => {
      setActiveForm("none");
      invalidateRelationships();
    },
    onError: () => {
      invalidateRelationships();
    },
  });

  const quickAddSpouseMutation = useMutation({
    mutationFn: async (mutationData: QuickAddSpouseData) => {
      if (!mutationData.name.trim()) {
        throw new Error(t("relationship.spouseNameRequired"));
      }

      const newSpouseGender =
        personGender === Gender.enum.male
          ? Gender.enum.female
          : personGender === Gender.enum.female
            ? Gender.enum.male
            : Gender.enum.female;
      const birthYear =
        mutationData.birthYear.trim() !== ""
          ? Number.parseInt(mutationData.birthYear, 10)
          : undefined;

      const spouseFields = getAutoPopulatedFields("spouse", person);
      const newPerson = await createPerson({
        data: {
          fullName: mutationData.name.trim(),
          gender: newSpouseGender as Gender,
          ...spouseFields,
          ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
        },
      });

      await createRelationship({
        data: {
          personAId: personId,
          personBId: newPerson.id,
          type: RelationshipType.enum.marriage,
          note: mutationData.note.trim() || null,
        },
      });
    },
    onSuccess: () => {
      setActiveForm("none");
      invalidateRelationships();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (relId: string) => {
      await deleteRelationship({ data: { id: relId } });
    },
    onSuccess: () => {
      invalidateRelationships();
    },
  });

  const handleAddRelationship = async (data: AddRelationshipData): Promise<void> => {
    addRelationshipMutation.mutate(data);
  };

  const handleBulkAdd = async (data: BulkAddData): Promise<void> => {
    bulkAddMutation.mutate(data);
  };

  const handleQuickAddSpouse = async (data: QuickAddSpouseData): Promise<void> => {
    quickAddSpouseMutation.mutate(data);
  };

  const handleDelete = async (relId: string): Promise<void> => {
    if (!confirm(t("relationship.deleteConfirm"))) return;
    deleteMutation.mutate(relId);
  };

  const processing =
    addRelationshipMutation.isPending ||
    bulkAddMutation.isPending ||
    quickAddSpouseMutation.isPending ||
    deleteMutation.isPending;

  const actionError =
    addRelationshipMutation.error?.message ||
    bulkAddMutation.error?.message ||
    quickAddSpouseMutation.error?.message ||
    deleteMutation.error?.message ||
    null;

  const dismissError = () => {
    addRelationshipMutation.reset();
    bulkAddMutation.reset();
    quickAddSpouseMutation.reset();
    deleteMutation.reset();
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
    dismissError,
    activeForm,
    setActiveForm,
    handleAddRelationship,
    handleBulkAdd,
    handleQuickAddSpouse,
    handleDelete,
    groupByType,
  };
}
