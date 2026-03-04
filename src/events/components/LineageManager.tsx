import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
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
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '3', sm: { flexDirection: 'row' } })}>
        <button
          type="button"
          onClick={handleCompute}
          disabled={computing || applying}
          className={css(
            {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2',
              paddingX: '5',
              paddingY: '2.5',
              fontWeight: 'semibold',
              borderRadius: 'xl',
              transition: 'colors 0.2s',
              fontSize: 'sm',
            },
            { backgroundColor: 'stone.100', color: 'stone.700', _hover: { backgroundColor: 'stone.200' }, _disabled: { opacity: 0.5 } }
          )}
        >
          {computing ? <Loader2 className={css({ width: '4', height: '4' })} /> : <Sparkles className={css({ width: '4', height: '4' })} />}
          {computing ? t('lineage.calculating') : t('lineage.calculate')}
        </button>

        {updates && changedCount > 0 && !applied && (
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className={css(
              {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2',
                paddingX: '5',
                paddingY: '2.5',
                fontWeight: 'semibold',
                borderRadius: 'xl',
                transition: 'colors 0.2s',
                fontSize: 'sm',
                boxShadow: 'sm',
              },
              { backgroundColor: 'amber.600', color: 'white', _hover: { backgroundColor: 'amber.700' }, _disabled: { opacity: 0.5 } }
            )}
          >
            {applying ? (
              <Loader2 className={css({ width: '4', height: '4', animation: 'spin 1s linear infinite' })} />
            ) : (
              <RefreshCw className={css({ width: '4', height: '4' })} />
            )}
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
            className={css(
              { display: 'flex', alignItems: 'start', gap: '3', padding: '4', borderRadius: 'xl', fontSize: 'sm', fontWeight: 'medium' },
              { backgroundColor: 'red.50', color: 'red.700', borderWidth: '1px', borderStyle: 'solid', borderColor: 'red.200' }
            )}
          >
            <AlertCircle className={css({ width: '5', height: '5', flexShrink: 0, marginTop: '0.5' })} />
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
            className={css(
              { display: 'flex', alignItems: 'center', gap: '3', padding: '4', borderRadius: 'xl', fontSize: 'sm', fontWeight: 'semibold' },
              { backgroundColor: 'emerald.50', color: 'emerald.700', borderWidth: '1px', borderStyle: 'solid', borderColor: 'emerald.200' }
            )}
          >
            <CheckCircle2 className={css({ width: '5', height: '5', flexShrink: 0 })} />
            {t('lineage.applySuccess', { count: changedCount })}
          </motion.div>
        )}
      </AnimatePresence>

      {updates && (
        <div>
          <div className={css({ marginBottom: '3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}>
            <p className={css({ fontSize: 'sm', color: 'stone.500', fontWeight: 'medium' })}>
              {t('lineage.changesSummary', { changed: changedCount, total: updates.length })}
            </p>
          </div>

          <div
            className={css({
              borderRadius: '2xl',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgb(228 228 231 / 0.8)',
              overflow: 'hidden',
              boxShadow: 'sm',
            })}
          >
            <div className={css({ overflowX: 'auto' })}>
              <table className={css({ width: '100%', fontSize: 'sm' })}>
                <thead>
                  <tr
                    className={css({
                      backgroundColor: 'stone.50',
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: 'rgb(228 228 231 / 0.8)',
                    })}
                  >
                    <th className={css({ textAlign: 'left', paddingX: '4', paddingY: '3', fontWeight: 'semibold', color: 'stone.600', whiteSpace: 'nowrap' })}>
                      {t('lineage.nameHeader')}
                    </th>
                    <th
                      className={css({ textAlign: 'center', paddingX: '4', paddingY: '3', fontWeight: 'semibold', color: 'stone.600', whiteSpace: 'nowrap' })}
                    >
                      {t('lineage.generationHeader')}
                    </th>
                    <th
                      className={css({ textAlign: 'center', paddingX: '4', paddingY: '3', fontWeight: 'semibold', color: 'stone.600', whiteSpace: 'nowrap' })}
                    >
                      {t('lineage.birthOrderHeader')}
                    </th>
                    <th className={css({ textAlign: 'center', paddingX: '4', paddingY: '3', fontWeight: 'semibold', color: 'stone.600' })}>
                      {t('lineage.statusHeader')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((u, i) => (
                    <tr
                      key={u.id}
                      className={css(
                        { borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'stone.100', transition: 'colors 0.2s' },
                        u.changed ? { backgroundColor: 'rgb(254 243 199 / 0.4)' } : {},
                        i % 2 === 0 && !u.changed ? { backgroundColor: 'white' } : !u.changed ? { backgroundColor: 'rgb(228 228 231 / 0.3)' } : {}
                      )}
                    >
                      <td className={css({ paddingX: '4', paddingY: '3', fontWeight: 'medium', color: 'stone.800' })}>{u.fullName}</td>
                      <td className={css({ paddingX: '4', paddingY: '3', textAlign: 'center' })}>
                        <span className={css({ color: 'stone.400' })}>{u.oldGeneration ?? '—'}</span>
                        {u.oldGeneration !== u.newGeneration && (
                          <>
                            <span className={css({ marginX: '2', color: 'stone.300' })}>→</span>
                            <span className={css({ fontWeight: 'bold', color: 'amber.700' })}>{u.newGeneration ?? '—'}</span>
                          </>
                        )}
                      </td>
                      <td className={css({ paddingX: '4', paddingY: '3', textAlign: 'center' })}>
                        <span className={css({ color: 'stone.400' })}>{u.oldBirthOrder ?? '—'}</span>
                        {u.oldBirthOrder !== u.newBirthOrder && (
                          <>
                            <span className={css({ marginX: '2', color: 'stone.300' })}>→</span>
                            <span className={css({ fontWeight: 'bold', color: 'amber.700' })}>{u.newBirthOrder ?? '—'}</span>
                          </>
                        )}
                      </td>
                      <td className={css({ paddingX: '4', paddingY: '3', textAlign: 'center' })}>
                        {u.changed ? (
                          <span
                            className={css({
                              display: 'inline-block',
                              paddingX: '2',
                              paddingY: '0.5',
                              borderRadius: 'full',
                              fontSize: 'xs',
                              fontWeight: 'bold',
                              backgroundColor: 'amber.100',
                              color: 'amber.700',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: 'rgb(251 191 36 / 0.6)',
                            })}
                          >
                            {t('common.update')}
                          </span>
                        ) : (
                          <span
                            className={css({
                              display: 'inline-block',
                              paddingX: '2',
                              paddingY: '0.5',
                              borderRadius: 'full',
                              fontSize: 'xs',
                              fontWeight: 'bold',
                              backgroundColor: 'stone.100',
                              color: 'stone.400',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: 'rgb(228 228 231 / 0.6)',
                            })}
                          >
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
              className={css(
                {
                  marginTop: '3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  marginX: 'auto',
                  transition: 'colors 0.2s',
                },
                { color: 'stone.500', _hover: { color: 'amber.700' } }
              )}
            >
              {showAll ? (
                <>
                  <ChevronUp className={css({ width: '4', height: '4' })} /> {t('lineage.collapse')}
                </>
              ) : (
                <>
                  <ChevronDown className={css({ width: '4', height: '4' })} /> {t('lineage.showAll', { count: updates.length })}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
