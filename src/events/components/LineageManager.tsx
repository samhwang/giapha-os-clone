import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Person, Relationship } from '../../types';
import { updateBatch } from '../server/lineage';

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
  changed: boolean;
}

function computeGenerations(persons: Person[], relationships: Relationship[]): Map<string, number> {
  const childParents = new Map<string, string[]>();
  const parentChildren = new Map<string, string[]>();

  for (const r of relationships) {
    if (r.type === 'biological_child' || r.type === 'adopted_child') {
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
    if (r.type === 'marriage') {
      const aSpouses = spouseMap.get(r.personAId) ?? [];
      aSpouses.push(r.personBId);
      spouseMap.set(r.personAId, aSpouses);
      const bSpouses = spouseMap.get(r.personBId) ?? [];
      bSpouses.push(r.personAId);
      spouseMap.set(r.personBId, bSpouses);
    }
  }

  const roots = persons.filter((p) => !childParents.has(p.id) && !p.isInLaw);
  const genMap = new Map<string, number>();
  const queue: Array<{ id: string; gen: number }> = roots.map((r) => ({ id: r.id, gen: 1 }));

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { id, gen } = item;
    if (genMap.has(id)) continue;
    genMap.set(id, gen);

    const children = parentChildren.get(id) || [];
    for (const childId of children) {
      if (!genMap.has(childId)) {
        queue.push({ id: childId, gen: gen + 1 });
      }
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const p of persons) {
      if (!p.isInLaw || genMap.has(p.id)) continue;
      const spouses = spouseMap.get(p.id) || [];
      for (const spouseId of spouses) {
        const spouseGen = genMap.get(spouseId);
        if (spouseGen !== undefined) {
          genMap.set(p.id, spouseGen);
          changed = true;
          break;
        }
      }
    }
  }

  return genMap;
}

function computeBirthOrders(persons: Person[], relationships: Relationship[]): Map<string, number> {
  const parentChildren = new Map<string, string[]>();

  for (const r of relationships) {
    if (r.type === 'biological_child' || r.type === 'adopted_child') {
      const children = parentChildren.get(r.personAId) ?? [];
      children.push(r.personBId);
      parentChildren.set(r.personAId, children);
    }
  }

  const personsById = new Map(persons.map((p) => [p.id, p]));
  const orderMap = new Map<string, number>();

  for (const [, childIds] of parentChildren) {
    const sorted = [...childIds].sort((a, b) => {
      const pa = personsById.get(a);
      const pb = personsById.get(b);
      const aYear = pa?.birthYear ?? Number.POSITIVE_INFINITY;
      const bYear = pb?.birthYear ?? Number.POSITIVE_INFINITY;
      if (aYear !== bYear) return aYear - bYear;
      return (pa?.fullName ?? '').localeCompare(pb?.fullName ?? '', 'vi');
    });

    let order = 1;
    for (const childId of sorted) {
      const p = personsById.get(childId);
      if (p && !p.isInLaw) {
        if (!orderMap.has(childId) || (orderMap.get(childId) ?? 0) > order) {
          orderMap.set(childId, order);
        }
        order++;
      }
    }
  }

  return orderMap;
}

export default function LineageManager({ persons, relationships }: LineageManagerProps) {
  const { t } = useTranslation();
  const [updates, setUpdates] = useState<ComputedUpdate[] | null>(null);
  const [computing, setComputing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleCompute = () => {
    setComputing(true);
    setApplied(false);
    setError(null);

    try {
      const genMap = computeGenerations(persons, relationships);
      const orderMap = computeBirthOrders(persons, relationships);

      const result: ComputedUpdate[] = persons.map((p) => {
        const newGen = genMap.get(p.id) ?? null;
        const newOrder = orderMap.get(p.id) ?? null;
        return {
          id: p.id,
          fullName: p.fullName,
          oldGeneration: p.generation,
          newGeneration: newGen,
          oldBirthOrder: p.birthOrder,
          newBirthOrder: newOrder,
          changed: newGen !== p.generation || newOrder !== p.birthOrder,
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
    } catch (err) {
      setError((err as Error).message || t('lineage.calcError'));
    } finally {
      setComputing(false);
    }
  };

  const handleApply = async () => {
    if (!updates) return;
    setApplying(true);
    setError(null);

    try {
      const changedOnly = updates.filter((u) => u.changed);
      await updateBatch({
        data: {
          updates: changedOnly.map((u) => ({
            id: u.id,
            generation: u.newGeneration,
            birthOrder: u.newBirthOrder,
          })),
        },
      });
      setApplied(true);
    } catch (err) {
      setError((err as Error).message || t('lineage.applyError'));
    } finally {
      setApplying(false);
    }
  };

  const changedCount = updates?.filter((u) => u.changed).length ?? 0;
  const displayedRows = showAll ? (updates ?? []) : (updates ?? []).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleCompute}
          disabled={computing || applying}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
        >
          {computing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {computing ? t('lineage.calculating') : t('lineage.calculate')}
        </button>

        {updates && changedCount > 0 && !applied && (
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {applying ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {applying ? t('lineage.updating') : t('lineage.applyChanges', { count: changedCount })}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm font-medium"
          >
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applied && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm font-semibold"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            {t('lineage.applySuccess', { count: changedCount })}
          </motion.div>
        )}
      </AnimatePresence>

      {updates && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-stone-500 font-medium">{t('lineage.changesSummary', { changed: changedCount, total: updates.length })}</p>
          </div>

          <div className="rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200/80">
                    <th className="text-left px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t('lineage.nameHeader')}</th>
                    <th className="text-center px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t('lineage.generationHeader')}</th>
                    <th className="text-center px-4 py-3 font-semibold text-stone-600 whitespace-nowrap">{t('lineage.birthOrderHeader')}</th>
                    <th className="text-center px-4 py-3 font-semibold text-stone-600">{t('lineage.statusHeader')}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-b border-stone-100 last:border-0 transition-colors ${
                        u.changed ? 'bg-amber-50/40' : ''
                      } ${i % 2 === 0 && !u.changed ? 'bg-white' : !u.changed ? 'bg-stone-50/30' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-stone-800">{u.fullName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-stone-400">{u.oldGeneration ?? '—'}</span>
                        {u.oldGeneration !== u.newGeneration && (
                          <>
                            <span className="mx-2 text-stone-300">→</span>
                            <span className="font-bold text-amber-700">{u.newGeneration ?? '—'}</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-stone-400">{u.oldBirthOrder ?? '—'}</span>
                        {u.oldBirthOrder !== u.newBirthOrder && (
                          <>
                            <span className="mx-2 text-stone-300">→</span>
                            <span className="font-bold text-amber-700">{u.newBirthOrder ?? '—'}</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.changed ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200/60">
                            {t('common.update')}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-400 border border-stone-200/60">
                            {t('common.unchanged')}
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
              className="mt-3 flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-amber-700 transition-colors mx-auto"
            >
              {showAll ? (
                <>
                  <ChevronUp className="size-4" /> {t('lineage.collapse')}
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" /> {t('lineage.showAll', { count: updates.length })}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
