import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { getPersons } from '../../members/server/member';
import KinshipFinder from '../../relationships/components/KinshipFinder';
import { getRelationships } from '../../relationships/server/relationship';

export const Route = createFileRoute('/dashboard/kinship')({
  loader: async () => {
    const [persons, relationships] = await Promise.all([getPersons(), getRelationships()]);
    return { persons, relationships };
  },
  component: KinshipPage,
});

function KinshipPage() {
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
          paddingX: { base: '4', sm: '6', lg: '8' },
          maxWidth: '5xl',
          marginX: 'auto',
        })}
      >
        <h1 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>{t('page.kinshipTitle')}</h1>
        <p className={css({ fontSize: 'sm', color: 'stone.500', marginTop: '1' })}>{t('page.kinshipDesc')}</p>
      </div>
      <main
        className={css({
          maxWidth: '5xl',
          marginX: 'auto',
          paddingX: { base: '4', sm: '6', lg: '8' },
          paddingY: { base: '4', sm: '6' },
          position: 'relative',
          zIndex: 10,
          width: '100%',
          flex: 1,
        })}
      >
        <KinshipFinder persons={persons} relationships={relationships} />
      </main>
    </div>
  );
}
