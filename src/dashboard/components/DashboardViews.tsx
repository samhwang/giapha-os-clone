import { lazy, Suspense, useMemo } from 'react';

import FamilyTree from '../../family-tree/components/FamilyTree';
import MindmapTree from '../../family-tree/components/MindmapTree';

const BubbleMapTree = lazy(() => import('../../family-tree/components/BubbleMapTree'));

import type { Person } from '../../members/types';

import { type Relationship, RelationshipType } from '../../relationships/types';
import ExportButton from '../../ui/common/ExportButton';
import { useDashboardStore } from '../store/dashboardStore';
import AvatarToggle from './AvatarToggle';
import DashboardMemberList from './DashboardMemberList';
import RootSelector from './RootSelector';

interface DashboardViewsProps {
  persons: Person[];
  relationships: Relationship[];
}

export default function DashboardViews({ persons, relationships }: DashboardViewsProps) {
  const { view: currentView, rootId } = useDashboardStore();

  const { personsMap, roots, defaultRootId } = useMemo(() => {
    const pMap = new Map<string, Person>();
    for (const p of persons) pMap.set(p.id, p);

    const childIds = new Set(
      relationships.filter((r) => r.type === RelationshipType.enum.biological_child || r.type === RelationshipType.enum.adopted_child).map((r) => r.personBId)
    );

    let finalRootId = rootId;

    if (!finalRootId || !pMap.has(finalRootId)) {
      const rootsFallback = persons.filter((p) => !childIds.has(p.id));
      const sortByBirthYear = (a: Person, b: Person) => (a.birthYear ?? Infinity) - (b.birthYear ?? Infinity);

      if (rootsFallback.length > 0) {
        const gen1 = rootsFallback.filter((p) => p.generation === 1);
        finalRootId = gen1.length > 0 ? gen1.sort(sortByBirthYear)[0].id : rootsFallback.sort(sortByBirthYear)[0].id;
      } else if (persons.length > 0) {
        finalRootId = persons[0].id;
      }
    }

    let calculatedRoots: Person[] = [];
    if (finalRootId && pMap.has(finalRootId)) {
      const person = pMap.get(finalRootId);
      if (person) calculatedRoots = [person];
    }

    return { personsMap: pMap, roots: calculatedRoots, defaultRootId: finalRootId };
  }, [persons, relationships, rootId]);

  const activeRootId = rootId || defaultRootId;

  return (
    <main className="flex flex-1 flex-col overflow-auto bg-stone-50/50">
      {currentView !== 'list' && persons.length > 0 && activeRootId && (
        <div className="layout-page relative z-20 flex w-full flex-wrap items-center justify-center gap-4 pt-6 pb-2">
          <RootSelector persons={persons} currentRootId={activeRootId} />
          <div className="flex items-center gap-2">
            <AvatarToggle />
            <ExportButton />
          </div>
        </div>
      )}

      {currentView === 'list' && (
        <div className="layout-page relative z-10 w-full py-8">
          <DashboardMemberList initialPersons={persons} relationships={relationships} />
        </div>
      )}

      <div className="relative z-10 w-full flex-1">
        {currentView === 'tree' && <FamilyTree personsMap={personsMap} relationships={relationships} roots={roots} />}
        {currentView === 'mindmap' && <MindmapTree personsMap={personsMap} relationships={relationships} roots={roots} />}
        {currentView === 'bubble' && (
          <Suspense fallback={null}>
            <BubbleMapTree personsMap={personsMap} relationships={relationships} roots={roots} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
