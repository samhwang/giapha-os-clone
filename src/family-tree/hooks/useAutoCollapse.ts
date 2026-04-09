import { useCallback, useEffect, useState } from 'react';

import type { Person } from '../../members/types';
import type { AdjacencyLists, TreeFilterOptions } from '../utils/treeHelpers';

import { getFilteredTreeData } from '../utils/treeHelpers';

interface UseAutoCollapseOptions {
  roots: Person[];
  personsMap: Map<string, Person>;
  adj: AdjacencyLists;
  filters: TreeFilterOptions;
  autoCollapseLevel: number;
  onCollapsed?: () => void;
}

export function useAutoCollapse({ roots, personsMap, adj, filters, autoCollapseLevel, onCollapsed }: UseAutoCollapseOptions) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  /* oxlint-disable react-hooks/exhaustive-deps -- filters/adj are derived from personsMap/relationships */
  useEffect(() => {
    const autoCollapsed = new Set<string>();

    const walk = (personId: string, visited: Set<string>, level: number) => {
      if (visited.has(personId)) return;
      visited.add(personId);

      const data = getFilteredTreeData({ personId, personsMap, adj, filters });
      if (!data.person) return;

      if (autoCollapseLevel > 0 && level >= autoCollapseLevel && data.children.length > 0) {
        autoCollapsed.add(personId);
      }

      for (const child of data.children) {
        walk(child.id, new Set(visited), level + 1);
      }
    };

    for (const root of roots) {
      walk(root.id, new Set(), 0);
    }
    setCollapsedNodes(autoCollapsed);

    if (onCollapsed) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(onCollapsed);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [roots, personsMap, autoCollapseLevel]);
  /* oxlint-enable react-hooks/exhaustive-deps */

  const toggleCollapse = useCallback((personId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  }, []);

  return { collapsedNodes, toggleCollapse };
}
