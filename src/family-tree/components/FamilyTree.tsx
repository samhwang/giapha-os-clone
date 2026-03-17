import { Filter, Minus, Plus } from 'lucide-react';
import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Gender, type Person, type Relationship } from '../../types';
import { cn } from '../../ui/utils/cn';
import { usePanZoom } from '../hooks/usePanZoom';
import { buildAdjacencyLists, getFilteredTreeData } from '../utils/treeHelpers';
import FamilyNodeCard from './FamilyNodeCard';
import styles from './family-tree.module.css';

export default function FamilyTree({ personsMap, relationships, roots }: { personsMap: Map<string, Person>; relationships: Relationship[]; roots: Person[] }) {
  const { t } = useTranslation();
  const { showAvatar } = useDashboardStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hideDaughtersInLaw, setHideDaughtersInLaw] = useState(false);
  const [hideSonsInLaw, setHideSonsInLaw] = useState(false);
  const [hideDaughters, setHideDaughters] = useState(false);
  const [hideSons, setHideSons] = useState(false);
  const [hideMales, setHideMales] = useState(false);
  const [hideFemales, setHideFemales] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const {
    scale,
    isPressed,
    isDragging,
    handlers: { handleMouseDown, handleMouseMove, handleMouseUpOrLeave, handleClickCapture, handleZoomIn, handleZoomOut, handleResetZoom },
  } = usePanZoom(containerRef);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-center scroll when root changes
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [roots]);

  const adj = useMemo(() => buildAdjacencyLists(relationships, personsMap), [relationships, personsMap]);

  const getTreeData = (personId: string) =>
    getFilteredTreeData(personId, personsMap, adj, { hideDaughtersInLaw, hideSonsInLaw, hideDaughters, hideSons, hideMales, hideFemales });

  const renderTreeNode = (personId: string, visited: Set<string> = new Set()): ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const data = getTreeData(personId);
    if (!data.person) return null;

    return (
      <li key={personId}>
        <div className="node-container inline-flex flex-col items-center">
          <div
            className={cn(
              'flex relative z-10 items-stretch h-full',
              showAvatar && 'bg-white rounded-2xl shadow-md border border-stone-200/80 transition-opacity'
            )}
          >
            <FamilyNodeCard person={data.person} />
            {data.spouses.length > 0 &&
              data.spouses.map((spouseData, idx) => (
                <div key={spouseData.person.id} className="flex relative">
                  <FamilyNodeCard
                    isRingVisible={idx === 0}
                    isPlusVisible={idx > 0}
                    person={spouseData.person}
                    role={spouseData.person.gender === Gender.enum.male ? t('tree.husband') : t('tree.wife')}
                    note={spouseData.note}
                  />
                </div>
              ))}
          </div>
        </div>

        {data.children.length > 0 && (
          <ul>
            {data.children.map((child) => (
              <Fragment key={child.id}>{renderTreeNode(child.id, new Set(visited))}</Fragment>
            ))}
          </ul>
        )}
      </li>
    );
  };

  if (roots.length === 0) return <div className="text-center p-10 text-stone-500">{t('tree.noData')}</div>;

  return (
    <section aria-label="Family tree" className="relative w-full">
      {/* Toolbar: zoom + filters */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Filter dropdown */}
        <div className="relative" ref={filtersRef}>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm shadow-sm border transition-all',
              showFilters
                ? 'bg-amber-100/90 text-amber-800 border-amber-200'
                : 'bg-white/80 text-stone-600 border-stone-200/60 hover:bg-white hover:text-stone-900 hover:shadow-md backdrop-blur-md'
            )}
          >
            <Filter className="size-4" />
            <span className="hidden sm:inline">{t('tree.filter')}</span>
          </button>

          {showFilters && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl shadow-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col gap-3 z-50 animate-[fade-in_0.15s_ease-out_forwards]">
              <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideDaughtersInLaw}
                  onChange={(e) => setHideDaughtersInLaw(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                />
                {t('tree.hideDaughtersInLaw')}
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideSonsInLaw}
                  onChange={(e) => setHideSonsInLaw(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                />
                {t('tree.hideSonsInLaw')}
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideDaughters}
                  onChange={(e) => setHideDaughters(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                />
                {t('tree.hideDaughters')}
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideSons}
                  onChange={(e) => setHideSons(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                />
                {t('tree.hideSons')}
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideMales}
                  onChange={(e) => setHideMales(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                />
                {t('tree.hideMales')}
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideFemales}
                  onChange={(e) => setHideFemales(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                />
                {t('tree.hideFemales')}
              </label>
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full overflow-hidden h-10">
          <button
            type="button"
            onClick={handleZoomOut}
            className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50"
            title={t('tree.zoomOut')}
            disabled={scale <= 0.3}
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 h-full hover:bg-stone-100/50 text-stone-600 transition-colors text-xs font-medium min-w-12.5 text-center border-x border-stone-200/50"
            title={t('tree.zoomReset')}
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50"
            title={t('tree.zoomIn')}
            disabled={scale >= 2}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-to-pan container */}
      <div
        ref={containerRef}
        className={cn('w-full overflow-auto bg-stone-50', isPressed ? 'cursor-grabbing' : 'cursor-grab')}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          id="export-container"
          className={cn('w-max min-w-full mx-auto p-4', styles.tree, 'transition-all duration-200', isDragging && 'opacity-90')}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          <ul>
            {roots.map((root) => (
              <Fragment key={root.id}>{renderTreeNode(root.id)}</Fragment>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
