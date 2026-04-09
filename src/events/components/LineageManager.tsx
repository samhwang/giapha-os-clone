import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Person } from "../../members/types";

import { type Relationship, RelationshipType } from "../../relationships/types";
import { Button } from "../../ui/common/Button";
import { cn } from "../../ui/utils/cn";
import { updateBatch } from "../server/lineage";

interface LineageManagerProps {
  persons: Person[];
  relationships: Relationship[];
}

interface ComputedUpdate {
  id: string;
  fullName: string;
  oldGeneration: number | null;
  newGeneration: number | null;
  oldBirthOrder: number | null;
  newBirthOrder: number | null;
  oldIsInLaw: boolean;
  newIsInLaw: boolean;
  gender: string;
  changed: boolean;
}

function computeGenerations(persons: Person[], relationships: Relationship[]): Map<string, number> {
  const childParents = new Map<string, string[]>();
  const parentChildren = new Map<string, string[]>();

  for (const r of relationships) {
    if (
      r.type === RelationshipType.enum.biological_child ||
      r.type === RelationshipType.enum.adopted_child
    ) {
      const parents = childParents.get(r.personBId) ?? [];
      parents.push(r.personAId);
      childParents.set(r.personBId, parents);

      const children = parentChildren.get(r.personAId) ?? [];
      children.push(r.personBId);
      parentChildren.set(r.personAId, children);
    }
  }

  const spouseMap = new Map<string, string[]>();
  for (const r of relationships) {
    if (r.type === RelationshipType.enum.marriage) {
      const aSpouses = spouseMap.get(r.personAId) ?? [];
      aSpouses.push(r.personBId);
      spouseMap.set(r.personAId, aSpouses);
      const bSpouses = spouseMap.get(r.personBId) ?? [];
      bSpouses.push(r.personAId);
      spouseMap.set(r.personBId, bSpouses);
    }
  }

  // True roots: no parents AND no spouses
  const trueRoots = persons.filter((p) => !childParents.has(p.id) && !spouseMap.has(p.id));

  // Also include persons who have spouses but neither they nor their spouses have parents
  const processedRoots = new Set(trueRoots.map((p) => p.id));
  for (const p of persons.filter((p) => !childParents.has(p.id) && spouseMap.has(p.id))) {
    const spouses = spouseMap.get(p.id) || [];
    const anySpouseHasParents = spouses.some((sId) => childParents.has(sId));
    if (
      !anySpouseHasParents &&
      !processedRoots.has(p.id) &&
      !spouses.some((sId) => processedRoots.has(sId))
    ) {
      trueRoots.push(p);
      processedRoots.add(p.id);
    }
  }

  const genMap = new Map<string, number>();
  const queue: Array<{ id: string; gen: number }> = trueRoots.map((r) => ({ id: r.id, gen: 1 }));

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    const { id, gen } = item;

    // Use longest path (deepest generation)
    if (genMap.has(id) && gen <= (genMap.get(id) ?? 0)) continue;
    genMap.set(id, gen);

    // Propagate to children
    const children = parentChildren.get(id) || [];
    for (const childId of children) {
      queue.push({ id: childId, gen: gen + 1 });
    }

    // Propagate to spouses during BFS
    const spouses = spouseMap.get(id) || [];
    for (const spouseId of spouses) {
      if (!genMap.has(spouseId) || gen > (genMap.get(spouseId) ?? 0)) {
        queue.push({ id: spouseId, gen });
      }
    }
  }

  // Fallback for disconnected persons
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of persons) {
      if (genMap.has(p.id)) continue;
      const spouses = spouseMap.get(p.id) || [];
      for (const spouseId of spouses) {
        if (genMap.has(spouseId)) {
          genMap.set(p.id, genMap.get(spouseId) ?? 1);
          changed = true;
          break;
        }
      }
    }
  }

  return genMap;
}

function computeBirthOrders(persons: Person[], relationships: Relationship[]): Map<string, number> {
  const parentChildren = new Map<string, Set<string>>();

  for (const r of relationships) {
    if (
      r.type === RelationshipType.enum.biological_child ||
      r.type === RelationshipType.enum.adopted_child
    ) {
      if (!parentChildren.has(r.personAId)) parentChildren.set(r.personAId, new Set());
      parentChildren.get(r.personAId)?.add(r.personBId);
    }
  }

  const personsById = new Map(persons.map((p) => [p.id, p]));
  const orderMap = new Map<string, number>();

  for (const [, childIds] of parentChildren) {
    const sorted = Array.from(childIds).sort((a, b) => {
      const pa = personsById.get(a);
      const pb = personsById.get(b);
      const aYear = pa?.birthYear ?? Number.POSITIVE_INFINITY;
      const bYear = pb?.birthYear ?? Number.POSITIVE_INFINITY;
      if (aYear !== bYear) return aYear - bYear;
      return (pa?.fullName ?? "").localeCompare(pb?.fullName ?? "", "vi");
    });

    let order = 1;
    for (const childId of sorted) {
      const p = personsById.get(childId);
      if (p && !p.isInLaw) {
        // Keep largest order from any parent
        if (!orderMap.has(childId) || (orderMap.get(childId) ?? 0) < order) {
          orderMap.set(childId, order);
        }
        order++;
      }
    }
  }

  return orderMap;
}

function computeInLaws(persons: Person[], relationships: Relationship[]): Map<string, boolean> {
  const childParents = new Map<string, string[]>();
  const spouseMap = new Map<string, string[]>();

  for (const r of relationships) {
    if (
      r.type === RelationshipType.enum.biological_child ||
      r.type === RelationshipType.enum.adopted_child
    ) {
      if (!childParents.has(r.personBId)) childParents.set(r.personBId, []);
      childParents.get(r.personBId)?.push(r.personAId);
    } else if (r.type === RelationshipType.enum.marriage) {
      if (!spouseMap.has(r.personAId)) spouseMap.set(r.personAId, []);
      spouseMap.get(r.personAId)?.push(r.personBId);
      if (!spouseMap.has(r.personBId)) spouseMap.set(r.personBId, []);
      spouseMap.get(r.personBId)?.push(r.personAId);
    }
  }

  const inLawMap = new Map<string, boolean>();

  for (const p of persons) {
    const hasParents = childParents.has(p.id);
    const hasSpouse = spouseMap.has(p.id);

    if (hasParents) {
      inLawMap.set(p.id, false);
      continue;
    }

    if (hasSpouse) {
      const spouses = spouseMap.get(p.id) || [];
      const anySpouseHasParents = spouses.some((sId) => childParents.has(sId));

      if (anySpouseHasParents) {
        inLawMap.set(p.id, true);
      } else {
        const spousesData = spouses.map((sId) => persons.find((per) => per.id === sId));
        const shouldBeBloodline =
          !p.isInLaw || (p.gender === "male" && spousesData.every((s) => s?.gender !== "male"));
        inLawMap.set(p.id, !shouldBeBloodline);
      }
    } else {
      inLawMap.set(p.id, false);
    }
  }

  return inLawMap;
}

function getInLawLabel(isInLaw: boolean, gender: string, t: (key: string) => string): string {
  if (!isInLaw) return "—";
  return gender === "male" ? t("lineage.sonInLaw") : t("lineage.daughterInLaw");
}

function InLawCell({ update, t }: { update: ComputedUpdate; t: (key: string) => string }) {
  const isChanged = update.oldIsInLaw !== update.newIsInLaw;
  const oldLabel = getInLawLabel(update.oldIsInLaw, update.gender, t);
  const newLabel = isChanged
    ? update.newIsInLaw
      ? getInLawLabel(true, update.gender, t)
      : t("lineage.bloodline")
    : null;

  return (
    <>
      <span className={isChanged ? "text-stone-400" : ""}>{oldLabel}</span>
      {newLabel && (
        <>
          <span className="mx-2 text-stone-300">→</span>
          <span className="font-bold text-amber-700">{newLabel}</span>
        </>
      )}
    </>
  );
}

export default function LineageManager({ persons, relationships }: LineageManagerProps) {
  const { t } = useTranslation();
  const [updates, setUpdates] = useState<ComputedUpdate[] | null>(null);
  const [computing, setComputing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const applyMutation = useMutation({
    mutationFn: (changedUpdates: ComputedUpdate[]) =>
      updateBatch({
        data: {
          updates: changedUpdates.map((u) => ({
            id: u.id,
            generation: u.newGeneration,
            birthOrder: u.newBirthOrder,
            isInLaw: u.newIsInLaw,
          })),
        },
      }),
  });

  const applying = applyMutation.isPending;
  const applied = applyMutation.isSuccess;
  const error = applyMutation.error
    ? (applyMutation.error as Error).message || t("lineage.applyError")
    : null;

  const handleCompute = () => {
    setComputing(true);
    applyMutation.reset();

    try {
      const genMap = computeGenerations(persons, relationships);
      const orderMap = computeBirthOrders(persons, relationships);
      const inLawMap = computeInLaws(persons, relationships);

      const result: ComputedUpdate[] = persons.map((p) => {
        const newGen = genMap.get(p.id) ?? null;
        const newOrder = orderMap.get(p.id) ?? null;
        const newInLaw = inLawMap.get(p.id) ?? false;
        return {
          id: p.id,
          fullName: p.fullName,
          oldGeneration: p.generation,
          newGeneration: newGen,
          oldBirthOrder: p.birthOrder,
          newBirthOrder: newOrder,
          oldIsInLaw: p.isInLaw,
          newIsInLaw: newInLaw,
          gender: p.gender,
          changed: newGen !== p.generation || newOrder !== p.birthOrder || newInLaw !== p.isInLaw,
        };
      });

      result.sort((a, b) => {
        if (a.changed !== b.changed) return a.changed ? -1 : 1;
        const gA = a.newGeneration ?? 999;
        const gB = b.newGeneration ?? 999;
        if (gA !== gB) return gA - gB;
        const oA = a.newBirthOrder ?? 999;
        const oB = b.newBirthOrder ?? 999;
        return oA - oB;
      });

      setUpdates(result);
    } catch {
      // Compute errors are local (not server), keep as-is
      applyMutation.reset();
    } finally {
      setComputing(false);
    }
  };

  const handleApply = () => {
    if (!updates) return;
    const changedOnly = updates.filter((u) => u.changed);
    applyMutation.mutate(changedOnly);
  };

  const changedCount = updates?.filter((u) => u.changed).length ?? 0;
  const displayedRows = showAll ? (updates ?? []) : (updates ?? []).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="ghost"
          onClick={handleCompute}
          disabled={computing || applying}
          className="rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
        >
          {computing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {computing ? t("lineage.calculating") : t("lineage.calculate")}
        </Button>

        {updates && changedCount > 0 && !applied && (
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={applying}
            className="rounded-xl"
          >
            {applying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {applying ? t("lineage.updating") : t("lineage.applyChanges", { count: changedCount })}
          </Button>
        )}
      </div>

      {error && (
        <div className="flex animate-[fade-in-up_0.3s_ease-out_forwards] items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          {error}
        </div>
      )}

      {applied && (
        <div className="flex animate-[fade-in-up_0.3s_ease-out_forwards] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="size-5 shrink-0" />
          {t("lineage.applySuccess", { count: changedCount })}
        </div>
      )}

      {updates && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-stone-500">
              {t("lineage.changesSummary", { changed: changedCount, total: updates.length })}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-strong shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-strong bg-stone-50">
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap text-stone-600">
                      {t("lineage.nameHeader")}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap text-stone-600">
                      {t("lineage.generationHeader")}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap text-stone-600">
                      {t("lineage.birthOrderHeader")}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap text-stone-600">
                      {t("lineage.inLawHeader")}
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-stone-600">
                      {t("lineage.statusHeader")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((u, i) => (
                    <tr
                      key={u.id}
                      className={cn(
                        "border-b border-stone-100 transition-colors last:border-0",
                        u.changed && "bg-amber-50/40",
                        i % 2 === 0 && !u.changed && "bg-white",
                        !u.changed && i % 2 !== 0 && "bg-stone-50/30",
                      )}
                    >
                      <td className="px-4 py-3 font-medium text-stone-800">{u.fullName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-stone-400">{u.oldGeneration ?? "—"}</span>
                        {u.oldGeneration !== u.newGeneration && (
                          <>
                            <span className="mx-2 text-stone-300">→</span>
                            <span className="font-bold text-amber-700">
                              {u.newGeneration ?? "—"}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-stone-400">{u.oldBirthOrder ?? "—"}</span>
                        {u.oldBirthOrder !== u.newBirthOrder && (
                          <>
                            <span className="mx-2 text-stone-300">→</span>
                            <span className="font-bold text-amber-700">
                              {u.newBirthOrder ?? "—"}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <InLawCell update={u} t={t} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.changed ? (
                          <span className="inline-block rounded-full border border-amber-200/60 bg-amber-100 px-2 py-0.5 text-xs-plus font-bold text-amber-700">
                            {t("common.update")}
                          </span>
                        ) : (
                          <span className="inline-block rounded-full border border-border-default bg-stone-100 px-2 py-0.5 text-xs-plus font-bold text-stone-400">
                            {t("common.unchanged")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {updates.length > 20 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mx-auto mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-amber-700"
            >
              {showAll ? (
                <>
                  <ChevronUp className="size-4" /> {t("lineage.collapse")}
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" />{" "}
                  {t("lineage.showAll", { count: updates.length })}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
