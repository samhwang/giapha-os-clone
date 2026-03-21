import { Fragment, type ReactNode, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Gender, type Person } from '../../members/types';
import type { Relationship } from '../../relationships/types';
import { cn } from '../../ui/utils/cn';
import { usePanZoom } from '../hooks/usePanZoom';
import { buildAdjacencyLists, getFilteredTreeData } from '../utils/treeHelpers';
import FamilyNodeCard from './FamilyNodeCard';
import styles from './family-tree.module.css';
import TreeFilters, { useTreeFilters } from './TreeFilters';
import ZoomControls from './ZoomControls';

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

  const {
    scale,
    isPressed,
    isDragging,
    handlers: { handleMouseDown, handleMouseMove, handleMouseUpOrLeave, handleClickCapture, handleZoomIn, handleZoomOut, handleResetZoom },
  } = usePanZoom(containerRef);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-center scroll when root changes
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [roots]);

  const adj = useMemo(() => buildAdjacencyLists(relationships, personsMap), [relationships, personsMap]);

  const getTreeData = (personId: string) => getFilteredTreeData({ personId, personsMap, adj, filters });

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
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <TreeFilters filters={filters} onToggle={toggle} />
        <ZoomControls scale={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom} />
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
