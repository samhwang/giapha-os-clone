import { Crosshair, Minus, Plus } from 'lucide-react';
import { Fragment, type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Relationship } from '../../relationships/types';

import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Gender, type Person } from '../../members/types';
import { cn } from '../../ui/utils/cn';
import { useAutoCollapse } from '../hooks/useAutoCollapse';
import { usePanZoom } from '../hooks/usePanZoom';
import { buildAdjacencyLists, getFilteredTreeData } from '../utils/treeHelpers';
import styles from './family-tree.module.css';
import FamilyNodeCard from './FamilyNodeCard';
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
              'relative z-10 flex h-full items-stretch',
              showAvatar && 'rounded-2xl border border-border-strong bg-white shadow-md transition-opacity'
            )}
          >
            <FamilyNodeCard person={data.person} />
            {data.spouses.length > 0 &&
              data.spouses.map((spouseData, idx) => (
                <div key={spouseData.person.id} className="relative flex">
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
                className="absolute -bottom-3 left-1/2 z-20 flex size-6 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-white text-stone-500 shadow-md transition-colors hover:border-amber-300 hover:text-amber-600"
                title={isCollapsed ? t('tree.expand') : t('tree.collapse')}
              >
                {isCollapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
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

  if (roots.length === 0) return <div className="p-10 text-center text-stone-500">{t('tree.noData')}</div>;

  return (
    <section aria-label="Family tree" className="relative w-full">
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <TreeFilters filters={filters} onToggle={toggle} />
        <ZoomControls scale={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom} />
        <button
          type="button"
          onClick={centerTree}
          className="flex size-10 items-center justify-center rounded-full border border-border-default bg-surface-elevated text-stone-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-stone-900 hover:shadow-md"
          title={t('tree.center')}
        >
          <Crosshair className="size-4" />
        </button>
      </div>

      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- drag-to-pan container */}
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
          className={cn('mx-auto w-max min-w-full p-4', styles.tree, 'transition-all duration-fast', isDragging && 'opacity-90')}
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
