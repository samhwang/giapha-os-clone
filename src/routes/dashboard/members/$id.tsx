import { createFileRoute, Link } from '@tanstack/react-router';
import { css } from '../../../../styled-system/css';
import DeleteMemberButton from '../../../members/components/DeleteMemberButton';
import MemberDetailContent from '../../../members/components/MemberDetailContent';
import { getPersonById } from '../../../members/server/member';
import type { Person } from '../../../types';

export const Route = createFileRoute('/dashboard/members/$id')({
  loader: async ({ params }) => {
    const person = await getPersonById({ data: { id: params.id } });
    if (!person) throw new Error('Không tìm thấy thành viên.');
    return { person, privateData: person.privateDetails };
  },
  component: MemberDetailPage,
});

function MemberDetailPage() {
  const { person, privateData } = Route.useLoaderData();
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
          maxWidth: '5xl',
          marginX: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        })}
      >
        <Link
          to="/dashboard"
          className={css(
            { display: 'flex', alignItems: 'center', color: 'stone.500', fontWeight: 'medium', fontSize: 'sm', transition: 'colors 0.2s' },
            { _hover: { color: 'amber.700' } }
          )}
        >
          <span className={css({ marginRight: '1', transition: 'transform 0.2s' })}>←</span>
          Quay lại
        </Link>
        {isAdmin && (
          <div className={css({ display: 'flex', alignItems: 'center', gap: '2.5' })}>
            <Link
              to="/dashboard/members/$id/edit"
              params={{ id: person.id }}
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
              Chỉnh sửa
            </Link>
            <DeleteMemberButton memberId={person.id} />
          </div>
        )}
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
        <div
          className={css({
            backgroundColor: 'rgb(255 255 255 / 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: '2xl',
            boxShadow: 'sm',
            border: '1px solid rgb(228 228 231 / 0.6)',
            overflow: 'hidden',
            transition: 'shadow 0.3s',
          })}
        >
          <MemberDetailContent person={person as unknown as Person} privateData={privateData} isAdmin={isAdmin} />
        </div>
      </main>
    </div>
  );
}
