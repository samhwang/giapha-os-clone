import { Crosshair, Minus, Plus } from 'lucide-react';
import { Fragment, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Gender, type Person } from '../../members/types';
import type { Relationship } from '../../relationships/types';
import { cn } from '../../ui/utils/cn';
import { useAutoCollapse } from '../hooks/useAutoCollapse';
import { usePanZoom } from '../hooks/usePanZoom';
import { buildAdjacencyLists, getFilteredTreeData } from '../utils/treeHelpers';
import FamilyNodeCard from './FamilyNodeCard';
import styles from './family-tree.module.css';
import TreeFilters, { useTreeFilters } from './TreeFilters';
import ZoomControls from './ZoomControls';

const DEFAULT_AUTO_COLLAPSE_LEVEL = 2;

interface FamilyTreeProps {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
}

export default function FamilyTree({ personsMap, relationships, roots }: FamilyTreeProps) {
  const { t } = useTranslation();
  const { showAvatar } = useDashboardStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { filters, toggle } = useTreeFilters();

  const [autoCollapseLevel, _setAutoCollapseLevel] = useState(DEFAULT_AUTO_COLLAPSE_LEVEL);

  const {
    scale,
    isPressed,
    isDragging,
    handlers: { handleMouseDown, handleMouseMove, handleMouseUpOrLeave, handleClickCapture, handleZoomIn, handleZoomOut, handleResetZoom },
  } = usePanZoom(containerRef);

  const centerTree = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const inner = el.querySelector('#export-container');
    if (inner) {
      const innerRect = inner.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();
      el.scrollLeft += innerRect.left + innerRect.width / 2 - (containerRect.left + containerRect.width / 2);
    } else {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, []);

  const adj = useMemo(() => buildAdjacencyLists(relationships, personsMap), [relationships, personsMap]);

  const getTreeData = (personId: string) => getFilteredTreeData({ personId, personsMap, adj, filters });

  const { collapsedNodes, toggleCollapse } = useAutoCollapse({
    roots,
    personsMap,
    adj,
    filters,
    autoCollapseLevel,
    onCollapsed: centerTree,
  });

  const renderTreeNode = (personId: string, visited: Set<string> = new Set()): ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const data = getTreeData(personId);
    if (!data.person) return null;

    const hasChildren = data.children.length > 0;
    const isCollapsed = collapsedNodes.has(personId);

    return (
      <li key={personId}>
        <div className="node-container inline-flex flex-col items-center">
          <div
            className={cn(
              'flex relative z-10 items-stretch h-full',
              showAvatar && 'bg-white rounded-2xl shadow-md border border-border-strong transition-opacity'
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

            {/* Expand/Collapse Toggle */}
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(personId);
                }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-border-strong rounded-full size-6 flex items-center justify-center shadow-md z-20 text-stone-500 hover:text-amber-600 hover:border-amber-300 transition-colors cursor-pointer"
                title={isCollapsed ? t('tree.expand') : t('tree.collapse')}
              >
                {isCollapsed ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {hasChildren && !isCollapsed && (
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
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <TreeFilters filters={filters} onToggle={toggle} />
        <ZoomControls scale={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom} />
        <button
          type="button"
          onClick={centerTree}
          className="flex items-center justify-center size-10 rounded-full bg-surface-elevated backdrop-blur-md shadow-sm border border-border-default text-stone-600 hover:bg-white hover:text-stone-900 hover:shadow-md transition-all"
          title={t('tree.center')}
        >
          <Crosshair className="size-4" />
        </button>
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
          className={cn('w-max min-w-full mx-auto p-4', styles.tree, 'transition-all duration-fast', isDragging && 'opacity-90')}
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
