import { ChevronsDownUp, ChevronsUpDown, Filter, Minus, Plus, Share2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import type { Person, Relationship } from '../../types';
import { cn } from '../../ui/utils/cn';
import { buildAdjacencyLists } from '../utils/treeHelpers';
import type { ExpandSignal, MindmapContextData } from './MindmapNode';
import { MindmapNode } from './MindmapNode';

interface MindmapTreeProps {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
}

export default function MindmapTree({ personsMap, relationships, roots }: MindmapTreeProps) {
  const { t } = useTranslation();
  const { showAvatar, setMemberModalId } = useDashboardStore();
  const [scale, setScale] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [hideSpouses, setHideSpouses] = useState(false);
  const [hideMales, setHideMales] = useState(false);
  const [hideFemales, setHideFemales] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [expandSignal, setExpandSignal] = useState<ExpandSignal | null>(null);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const handleResetZoom = () => setScale(1);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adj = useMemo(() => buildAdjacencyLists(relationships, personsMap), [relationships, personsMap]);

  const ctx: MindmapContextData = useMemo(
    () => ({
      personsMap,
      relationships,
      adj,
      hideSpouses,
      hideMales,
      hideFemales,
      showAvatar,
      expandSignal,
      setMemberModalId,
    }),
    [personsMap, relationships, adj, hideSpouses, hideMales, hideFemales, showAvatar, expandSignal, setMemberModalId]
  );

  if (roots.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
          <Share2 className="size-8 text-stone-300" />
        </div>
        <p className="text-stone-500 font-medium tracking-wide">Gia phả trống</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Toolbar: expand/collapse + filters + zoom */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Expand/Collapse all */}
        <div className="flex items-center bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full overflow-hidden h-10">
          <button
            type="button"
            onClick={() => setExpandSignal({ type: 'expand', ts: Date.now() })}
            className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors flex items-center gap-1.5"
            title={t('tree.expandAll')}
          >
            <ChevronsUpDown className="size-4" />
            <span className="hidden sm:inline text-xs font-medium">{t('tree.expandAll')}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpandSignal({ type: 'collapse', ts: Date.now() })}
            className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors border-l border-stone-200/50 flex items-center gap-1.5"
            title={t('tree.collapseAll')}
          >
            <ChevronsDownUp className="size-4" />
            <span className="hidden sm:inline text-xs font-medium">{t('tree.collapseAll')}</span>
          </button>
        </div>

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
            <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl shadow-xl border border-stone-200/60 rounded-2xl p-4 flex flex-col gap-3 z-50 animate-[fade-in_0.15s_ease-out_forwards]">
              <label className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideSpouses}
                  onChange={(e) => setHideSpouses(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
                />
                {t('tree.hideSpouses')}
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

      <div className="w-full h-full p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-140px)] flex justify-start lg:justify-center overflow-x-auto">
        <div
          id="export-container"
          className="font-sans min-w-max pb-20 p-8 transition-all duration-200"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {roots.map((root, index) => (
            <MindmapNode key={root.id} personId={root.id} level={0} isLast={index === roots.length - 1} ctx={ctx} />
          ))}
        </div>
      </div>
    </div>
  );
}
