import { createFileRoute, Link } from '@tanstack/react-router';
import { css } from '../../../../styled-system/css';
import MemberForm from '../../../members/components/MemberForm';

export const Route = createFileRoute('/dashboard/members/new')({
  component: NewMemberPage,
});

function NewMemberPage() {
  const { session } = Route.useRouteContext();
  const isAdmin = session.role === 'admin';

  return (
    <div className={css({ flex: 1, width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', paddingBottom: '8' })}>
      <div
        className={css({
          width: '100%',
          position: 'relative',
          zIndex: 20,
          paddingY: '4',
          paddingX: { base: '4', sm: '6', lg: '8' },
          maxWidth: '3xl',
          marginX: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        })}
      >
        <h1 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>Thêm Thành Viên Mới</h1>
        <Link
          to="/dashboard"
          className={css(
            {
              paddingX: '4',
              paddingY: '2',
              backgroundColor: 'rgb(255 255 255 / 0.8)',
              color: 'stone.700',
              borderRadius: 'lg',
              fontWeight: 'medium',
              fontSize: 'sm',
              transition: 'all 0.2s',
              boxShadow: 'sm',
            },
            { _hover: { backgroundColor: 'stone.200', color: 'stone.900' } }
          )}
        >
          Hủy
        </Link>
      </div>
      <main
        className={css({
          maxWidth: '3xl',
          marginX: 'auto',
          paddingX: { base: '4', sm: '6', lg: '8' },
          paddingY: { base: '4', sm: '6' },
          position: 'relative',
          zIndex: 10,
          width: '100%',
          flex: 1,
        })}
      >
        <MemberForm isAdmin={isAdmin} />
      </main>
    </div>
  );
}
