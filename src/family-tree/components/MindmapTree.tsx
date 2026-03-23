import { ChevronsDownUp, ChevronsUpDown, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import type { Person } from '../../members/types';
import type { Relationship } from '../../relationships/types';
import { buildAdjacencyLists } from '../utils/treeHelpers';
import type { ExpandSignal, MindmapContextData } from './MindmapNode';
import { MindmapNode } from './MindmapNode';
import TreeFilters, { useTreeFilters } from './TreeFilters';
import ZoomControls from './ZoomControls';

const DEFAULT_AUTO_COLLAPSE_LEVEL = 2;

interface MindmapTreeProps {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
}

export default function MindmapTree({ personsMap, relationships, roots }: MindmapTreeProps) {
  const { t } = useTranslation();
  const { showAvatar, setMemberModalId } = useDashboardStore();
  const [scale, setScale] = useState(1);
  const { filters, toggle } = useTreeFilters();
  const [hideExpandButtons, _setHideExpandButtons] = useState(false);
  const [autoCollapseLevel, _setAutoCollapseLevel] = useState(DEFAULT_AUTO_COLLAPSE_LEVEL);
  const [expandSignal, setExpandSignal] = useState<ExpandSignal | null>(null);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const handleResetZoom = () => setScale(1);

  const adj = useMemo(() => buildAdjacencyLists(relationships, personsMap), [relationships, personsMap]);

  const ctx: MindmapContextData = useMemo(
    () => ({
      personsMap,
      relationships,
      adj,
      filters,
      showAvatar,
      hideExpandButtons,
      autoCollapseLevel,
      expandSignal,
      setMemberModalId,
      t,
    }),
    [personsMap, relationships, adj, filters, showAvatar, hideExpandButtons, autoCollapseLevel, expandSignal, setMemberModalId, t]
  );

  if (roots.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
          <Share2 className="size-8 text-stone-300" />
        </div>
        <p className="text-stone-500 font-medium tracking-wide">{t('tree.emptyTree')}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
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

        <TreeFilters filters={filters} onToggle={toggle} />
        <ZoomControls scale={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom} />
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
