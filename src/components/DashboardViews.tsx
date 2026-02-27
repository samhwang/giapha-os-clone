import { useMemo } from 'react';
import type { Person, Relationship } from '../types';
import AvatarToggle from './AvatarToggle';
import { useDashboard } from './DashboardContext';
import DashboardMemberList from './DashboardMemberList';
import ExportButton from './ExportButton';
import FamilyTree from './FamilyTree';
import MindmapTree from './MindmapTree';
import RootSelector from './RootSelector';

interface DashboardViewsProps {
  persons: Person[];
  relationships: Relationship[];
}

export default function DashboardViews({ persons, relationships }: DashboardViewsProps) {
  const { view: currentView, rootId } = useDashboard();

  const { personsMap, roots, defaultRootId } = useMemo(() => {
    const pMap = new Map<string, Person>();
    for (const p of persons) pMap.set(p.id, p);

    const childIds = new Set(relationships.filter((r) => r.type === 'biological_child' || r.type === 'adopted_child').map((r) => r.personBId));

    let finalRootId = rootId;

    if (!finalRootId || !pMap.has(finalRootId)) {
      const rootsFallback = persons.filter((p) => !childIds.has(p.id));
      if (rootsFallback.length > 0) {
        finalRootId = rootsFallback[0].id;
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
    <main className="flex-1 overflow-auto bg-stone-50/50 flex flex-col">
      {currentView !== 'list' && persons.length > 0 && activeRootId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full flex flex-wrap items-center justify-center gap-4 relative z-20">
          <RootSelector persons={persons} currentRootId={activeRootId} />
          <div className="flex items-center gap-2">
            <AvatarToggle />
            <ExportButton />
          </div>
        </div>
      )}

      {currentView === 'list' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
          <DashboardMemberList initialPersons={persons} />
        </div>
      )}

      <div className="flex-1 w-full relative z-10">
        {currentView === 'tree' && <FamilyTree personsMap={personsMap} relationships={relationships} roots={roots} />}
        {currentView === 'mindmap' && <MindmapTree personsMap={personsMap} relationships={relationships} roots={roots} />}
      </div>
    </main>
  );
}
