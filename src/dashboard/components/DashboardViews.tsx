import { useMemo } from 'react';
import { css } from '../../../styled-system/css';
import FamilyTree from '../../family-tree/components/FamilyTree';
import MindmapTree from '../../family-tree/components/MindmapTree';
import type { Person, Relationship } from '../../types';
import ExportButton from '../../ui/common/ExportButton';
import AvatarToggle from './AvatarToggle';
import { useDashboard } from './DashboardContext';
import DashboardMemberList from './DashboardMemberList';
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
    <main className={css({ flex: '1', overflow: 'auto', backgroundColor: 'rgb(254 250 244 / 0.5)', display: 'flex', flexDirection: 'column' })}>
      {currentView !== 'list' && persons.length > 0 && activeRootId && (
        <div
          className={css({
            maxWidth: '7xl',
            marginX: 'auto',
            paddingX: '4',
            paddingTop: '6',
            paddingBottom: '2',
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4',
            position: 'relative',
            zIndex: '20',
            sm: { paddingX: '6' },
            lg: { paddingX: '8' },
          })}
        >
          <RootSelector persons={persons} currentRootId={activeRootId} />
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <AvatarToggle />
            <ExportButton />
          </div>
        </div>
      )}

      {currentView === 'list' && (
        <div
          className={css({
            maxWidth: '7xl',
            marginX: 'auto',
            paddingX: '4',
            paddingY: '8',
            width: '100%',
            position: 'relative',
            zIndex: '10',
            sm: { paddingX: '6' },
            lg: { paddingX: '8' },
          })}
        >
          <DashboardMemberList initialPersons={persons} />
        </div>
      )}

      <div className={css({ flex: '1', width: '100%', position: 'relative', zIndex: '10' })}>
        {currentView === 'tree' && <FamilyTree personsMap={personsMap} relationships={relationships} roots={roots} />}
        {currentView === 'mindmap' && <MindmapTree personsMap={personsMap} relationships={relationships} roots={roots} />}
      </div>
    </main>
  );
}
