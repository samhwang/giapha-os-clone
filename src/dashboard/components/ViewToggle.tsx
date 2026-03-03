import { motion } from 'framer-motion';
import { List, ListTree, Network } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { useDashboard } from './DashboardContext';

export type ViewMode = 'list' | 'tree' | 'mindmap';

export default function ViewToggle() {
  const { view: currentView, setView } = useDashboard();
  const { t } = useTranslation();

  const tabs = [
    { id: 'list' as const, label: t('nav.list'), icon: <List className={css({ width: '4', height: '4' })} /> },
    { id: 'tree' as const, label: t('nav.treeView'), icon: <Network className={css({ width: '4', height: '4' })} /> },
    { id: 'mindmap' as const, label: 'Mindmap', icon: <ListTree className={css({ width: '4', height: '4' })} /> },
  ];

  return (
    <div
      className={css({
        display: 'flex',
        backgroundColor: 'rgb(228 228 231 / 0.5)',
        padding: '1.5',
        borderRadius: 'full',
        boxShadow: 'inset 0 2px 4px rgb(0 0 0 / 0.06)',
        width: 'fit-content',
        marginX: 'auto',
        marginTop: '4',
        marginBottom: '2',
        position: 'relative',
        border: '1px solid rgb(228 228 231 / 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 10,
      })}
    >
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={css(
              {
                position: 'relative',
                paddingX: { base: '4', sm: '6' },
                paddingY: { base: '1.5', sm: '2.5' },
                fontSize: 'sm',
                fontWeight: 'semibold',
                borderRadius: 'full',
                transition: 'color 300ms ease-in-out',
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                zIndex: 10,
              },
              isActive ? { color: 'stone.900' } : { color: 'stone.500', _hover: { color: 'stone.800' } }
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className={css({
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'white',
                  borderRadius: 'full',
                  boxShadow: 'sm',
                  border: '1px solid rgb(228 228 231 / 0.6)',
                  zIndex: -10,
                })}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              />
            )}
            <span className={css({ transition: 'color 300ms', color: isActive ? 'amber.700' : 'stone.400' })}>{tab.icon}</span>
            <span className={css({ letterSpacing: '0.025em' })}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
