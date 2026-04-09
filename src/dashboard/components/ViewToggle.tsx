import { Circle, List, ListTree, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../ui/utils/cn';
import { useDashboardStore } from '../store/dashboardStore';

export type ViewMode = 'list' | 'tree' | 'mindmap' | 'bubble';

export default function ViewToggle() {
  const { view: currentView, setView } = useDashboardStore();
  const { t } = useTranslation();

  const tabs = [
    { id: 'list' as const, label: t('nav.list'), icon: <List className="size-4" /> },
    { id: 'tree' as const, label: t('nav.treeView'), icon: <Network className="size-4" /> },
    { id: 'mindmap' as const, label: 'Mindmap', icon: <ListTree className="size-4" /> },
    { id: 'bubble' as const, label: 'Bubble', icon: <Circle className="size-4" /> },
  ];

  return (
    <div className="relative z-10 mx-auto mt-4 mb-2 flex w-fit rounded-full border border-border-default bg-stone-200/50 p-1.5 shadow-inner backdrop-blur-sm">
      {tabs.map((tab, _index) => {
        const isActive = currentView === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={cn(
              'relative z-10 flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-default ease-in-out sm:px-6 sm:py-2.5',
              isActive ? 'text-stone-900' : 'text-stone-500 hover:text-stone-800'
            )}
          >
            {isActive && <div className="absolute inset-0 z-[-1] animate-scale-in rounded-full border border-border-default bg-white shadow-sm" />}
            <span className={cn('transition-colors duration-default', isActive ? 'text-amber-700' : 'text-stone-400')}>{tab.icon}</span>
            <span className="tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
