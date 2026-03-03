import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import FamilyStats from '../../dashboard/components/FamilyStats';
import { getPersons } from '../../members/server/member';
import { getRelationships } from '../../relationships/server/relationship';

export const Route = createFileRoute('/dashboard/stats')({
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: StatsPage,
});

function StatsPage() {
  const { t } = useTranslation();
  const { persons, relationships } = Route.useLoaderData();

  return (
    <div className={css({ flex: 1, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', paddingBottom: '8' })}>
      <div
        className={css({
          width: '100%',
          position: 'relative',
          zIndex: 20,
          paddingY: '4',
          paddingX: '4',
          sm: { paddingX: '6' },
          lg: { paddingX: '8' },
          maxWidth: '80rem',
          marginX: 'auto',
        })}
      >
        <h1 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>{t('page.statsTitle')}</h1>
        <p className={css({ fontSize: 'sm', color: 'stone.500', marginTop: '1' })}>{t('page.statsDesc')}</p>
      </div>
      <main
        className={css({
          maxWidth: '80rem',
          marginX: 'auto',
          paddingX: { base: '4', sm: '6', lg: '8' },
          paddingY: { base: '4', sm: '6' },
          position: 'relative',
          zIndex: 10,
          width: '100%',
          flex: 1,
        })}
      >
        <FamilyStats persons={persons} relationships={relationships} />
      </main>
    </div>
  );
}
