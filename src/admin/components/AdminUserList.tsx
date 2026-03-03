import { AnimatePresence, motion } from 'framer-motion';
import { type SubmitEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import type { UserProfile, UserRole } from '../../types';
import { changeRole, createUser, deleteUser, toggleStatus } from '../server/user';

interface AdminUserListProps {
  initialUsers: UserProfile[];
  currentUserId: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminUserList({ initialUsers, currentUserId }: AdminUserListProps) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setLoadingId(userId);
      await changeRole({ data: { userId, newRole } });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showNotification(t('admin.roleUpdated'), 'success');
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : t('admin.roleError'), 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      setLoadingId(userId);
      await toggleStatus({ data: { userId, isActive: newStatus } });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u)));
      showNotification(newStatus ? t('admin.statusApproved') : t('admin.statusLocked'), 'success');
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : t('admin.statusError'), 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(t('admin.deleteConfirm'))) return;
    try {
      setLoadingId(userId);
      await deleteUser({ data: { userId } });
      setUsers(users.filter((u) => u.id !== userId));
      showNotification(t('admin.deleteSuccess'), 'success');
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : t('admin.deleteError'), 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateUser = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createUser({
        data: {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          role: (formData.get('role') as UserRole) || 'member',
          isActive: formData.get('is_active') === 'true',
        },
      });
      showNotification(t('admin.createSuccess'), 'success');
      setIsCreateModalOpen(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: unknown) {
      showNotification(error instanceof Error ? error.message : t('admin.createError'), 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const notificationStyles =
    notification?.type === 'success'
      ? { backgroundColor: 'rgb(236 253 245 / 0.9)', borderColor: 'rgb(34 197 94 / 0.3)', color: 'emerald.800' }
      : notification?.type === 'error'
        ? { backgroundColor: 'rgb(254 242 242 / 0.9)', borderColor: 'rgb(239 68 68 / 0.3)', color: 'red.800' }
        : { backgroundColor: 'rgb(254 243 199 / 0.9)', borderColor: 'rgb(245 158 11 / 0.3)', color: 'amber.800' };

  const roleBadgeStyles = (role: string) =>
    role === 'admin'
      ? { backgroundColor: 'rgb(254 243 199 / 0.8)', color: 'amber.800', borderColor: 'rgb(245 158 11 / 0.3)' }
      : { backgroundColor: 'rgb(244 244 245 / 0.8)', color: 'stone.600', borderColor: 'rgb(228 228 231 / 0.5)' };

  const statusBadgeStyles = (isActive: boolean) =>
    isActive
      ? { backgroundColor: 'rgb(236 253 245 / 0.8)', color: 'emerald.800', borderColor: 'rgb(34 197 94 / 0.3)' }
      : { backgroundColor: 'rgb(254 242 242 / 0.8)', color: 'red.800', borderColor: 'rgb(239 68 68 / 0.3)' };

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6', position: 'relative' })}>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={css(
              {
                position: 'fixed',
                top: '50%',
                left: '50%',
                zIndex: 100,
                paddingX: '6',
                paddingY: '3',
                borderRadius: 'xl',
                boxShadow: 'lg',
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                minWidth: '20rem',
                maxWidth: '90vw',
              },
              notificationStyles
            )}
          >
            <p className={css({ fontSize: 'sm', fontWeight: '500' })}>{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={css({ display: 'flex', justifyContent: 'flex-end' })}>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className={css(
            {
              display: 'inlineFlex',
              alignItems: 'center',
              gap: '2',
              paddingX: '5',
              paddingY: '2.5',
              backgroundColor: 'amber.600',
              color: 'white',
              fontWeight: 'semibold',
              borderRadius: 'xl',
              transition: 'colors 0.2s',
              fontSize: 'sm',
              boxShadow: 'sm',
            },
            { _hover: { backgroundColor: 'amber.700' } }
          )}
        >
          {t('admin.addUser')}
        </button>
      </div>

      <div
        className={css({
          backgroundColor: 'rgb(255 255 255 / 0.6)',
          backdropFilter: 'blur(24px)',
          borderRadius: '2xl',
          boxShadow: 'sm',
          borderWidth: '1px',
          borderColor: 'rgb(228 228 231 / 0.6)',
          overflow: 'hidden',
        })}
      >
        <div className={css({ overflowX: 'auto' })}>
          <table className={css({ width: '100%', textAlign: 'left', fontSize: 'sm', whiteSpace: 'nowrap' })}>
            <thead
              className={css({
                textTransform: 'uppercase',
                letterSpacing: 'widest',
                borderBottomWidth: '1px',
                borderColor: 'rgb(228 228 231 / 0.6)',
                backgroundColor: 'rgb(250 250 250 / 0.5)',
              })}
            >
              <tr>
                <th className={css({ paddingX: '6', paddingY: '4', color: 'stone.500', fontWeight: 'semibold', fontSize: 'xs' })}>{t('admin.emailHeader')}</th>
                <th className={css({ paddingX: '6', paddingY: '4', color: 'stone.500', fontWeight: 'semibold', fontSize: 'xs' })}>{t('admin.roleHeader')}</th>
                <th className={css({ paddingX: '6', paddingY: '4', color: 'stone.500', fontWeight: 'semibold', fontSize: 'xs' })}>{t('admin.statusHeader')}</th>
                <th className={css({ paddingX: '6', paddingY: '4', color: 'stone.500', fontWeight: 'semibold', fontSize: 'xs' })}>
                  {t('admin.createdHeader')}
                </th>
                <th className={css({ paddingX: '6', paddingY: '4', color: 'stone.500', fontWeight: 'semibold', fontSize: 'xs', textAlign: 'right' })}>
                  {t('admin.actionsHeader')}
                </th>
              </tr>
            </thead>
            <tbody className={css({ borderBottomWidth: '1px', borderColor: 'rgb(250 250 250 / 0.6)' })}>
              {users.map((user) => (
                <tr key={user.id} className={css({ _hover: { backgroundColor: 'rgb(250 250 250 / 0.8)' }, transition: 'colors 0.2s' })}>
                  <td className={css({ paddingX: '6', paddingY: '4', fontWeight: 'medium', color: 'stone.900' })}>{user.email}</td>
                  <td className={css({ paddingX: '6', paddingY: '4' })}>
                    <span
                      className={css(
                        { display: 'inlineFlex', alignItems: 'center', paddingX: '2', paddingY: '1', borderRadius: 'md', fontSize: 'xs', fontWeight: 'medium' },
                        roleBadgeStyles(user.role)
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className={css({ paddingX: '6', paddingY: '4' })}>
                    <span
                      className={css(
                        { display: 'inlineFlex', alignItems: 'center', paddingX: '2', paddingY: '1', borderRadius: 'md', fontSize: 'xs', fontWeight: 'medium' },
                        statusBadgeStyles(user.isActive)
                      )}
                    >
                      {user.isActive ? t('admin.active') : t('admin.pending')}
                    </span>
                  </td>
                  <td className={css({ paddingX: '6', paddingY: '4', color: 'stone.500' })}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className={css({ paddingX: '6', paddingY: '4', textAlign: 'right', display: 'flex', gap: '3', justifyContent: 'flex-end' })}>
                    {user.id !== currentUserId ? (
                      <>
                        {user.isActive ? (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusChange(user.id, false)}
                            className={css({
                              color: 'stone.600',
                              _hover: { color: 'stone.900' },
                              fontWeight: 'medium',
                              opacity: loadingId === user.id ? 0.5 : 1,
                            })}
                          >
                            {t('admin.lock')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleStatusChange(user.id, true)}
                            className={css({
                              color: 'emerald.600',
                              _hover: { color: 'emerald.800' },
                              fontWeight: 'medium',
                              opacity: loadingId === user.id ? 0.5 : 1,
                            })}
                          >
                            {t('admin.approve')}
                          </button>
                        )}
                        {user.role === 'admin' ? (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'member')}
                            className={css({
                              color: 'stone.600',
                              _hover: { color: 'stone.900' },
                              fontWeight: 'medium',
                              opacity: loadingId === user.id ? 0.5 : 1,
                            })}
                          >
                            {t('admin.demote')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={loadingId === user.id}
                            onClick={() => handleRoleChange(user.id, 'admin')}
                            className={css({
                              color: 'amber.600',
                              _hover: { color: 'amber.800' },
                              fontWeight: 'medium',
                              opacity: loadingId === user.id ? 0.5 : 1,
                            })}
                          >
                            {t('admin.promote')}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={loadingId === user.id}
                          onClick={() => handleDelete(user.id)}
                          className={css({ color: 'red.600', _hover: { color: 'red.800' }, fontWeight: 'medium', opacity: loadingId === user.id ? 0.5 : 1 })}
                        >
                          {t('common.delete')}
                        </button>
                      </>
                    ) : (
                      <span className={css({ color: 'stone.400', fontStyle: 'italic', fontSize: 'xs' })}>{t('admin.you')}</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className={css({ paddingX: '6', paddingY: '8', textAlign: 'center', color: 'stone.500' })}>
                    {t('admin.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <div
          className={css({
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4',
            backgroundColor: 'rgb(28 25 23 / 0.4)',
            backdropFilter: 'blur(4px)',
          })}
        >
          <div
            className={css({
              backgroundColor: 'rgb(255 255 255 / 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: '2xl',
              boxShadow: '2xl',
              borderWidth: '1px',
              borderColor: 'rgb(228 228 231 / 0.6)',
              width: '100%',
              maxWidth: '28rem',
              overflow: 'hidden',
            })}
          >
            <div
              className={css({
                paddingX: '6',
                paddingY: '5',
                borderBottomWidth: '1px',
                borderColor: 'rgb(250 250 250 / 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgb(250 250 250 / 0.5)',
              })}
            >
              <h3 className={css({ fontSize: 'xl', fontFamily: 'serif', fontWeight: 'bold', color: 'stone.800' })}>{t('admin.createTitle')}</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className={css({
                  color: 'stone.400',
                  _hover: { color: 'stone.600', backgroundColor: 'stone.100' },
                  transition: 'colors 0.2s',
                  width: '8',
                  height: '8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'full',
                })}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className={css({ padding: '6' })}>
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                <div>
                  <label
                    htmlFor="createEmail"
                    className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'stone.700', marginBottom: '1' })}
                  >
                    {t('admin.emailRequired')}
                  </label>
                  <input
                    id="createEmail"
                    type="email"
                    name="email"
                    required
                    className={css(
                      {
                        width: '100%',
                        paddingX: '3',
                        paddingY: '2',
                        backgroundColor: 'white',
                        color: 'stone.900',
                        _placeholder: { color: 'stone.400' },
                        borderWidth: '1px',
                        borderColor: 'stone.300',
                        borderRadius: 'lg',
                        boxShadow: 'sm',
                        outline: 'none',
                        transition: 'colors 0.2s',
                      },
                      { _focus: { borderColor: 'amber.500', boxShadow: '0 0 0 1px var(--colors-amber-500)' } }
                    )}
                    placeholder={t('admin.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label
                    htmlFor="createPassword"
                    className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'stone.700', marginBottom: '1' })}
                  >
                    {t('admin.passwordRequired')}
                  </label>
                  <input
                    id="createPassword"
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className={css(
                      {
                        width: '100%',
                        paddingX: '3',
                        paddingY: '2',
                        backgroundColor: 'white',
                        color: 'stone.900',
                        _placeholder: { color: 'stone.400' },
                        borderWidth: '1px',
                        borderColor: 'stone.300',
                        borderRadius: 'lg',
                        boxShadow: 'sm',
                        outline: 'none',
                        transition: 'colors 0.2s',
                      },
                      { _focus: { borderColor: 'amber.500', boxShadow: '0 0 0 1px var(--colors-amber-500)' } }
                    )}
                    placeholder={t('admin.passwordHint')}
                  />
                </div>
                <div>
                  <label
                    htmlFor="createRole"
                    className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'stone.700', marginBottom: '1' })}
                  >
                    {t('common.role')}
                  </label>
                  <select
                    id="createRole"
                    name="role"
                    className={css(
                      {
                        width: '100%',
                        paddingX: '3',
                        paddingY: '2',
                        backgroundColor: 'white',
                        color: 'stone.900',
                        borderWidth: '1px',
                        borderColor: 'stone.300',
                        borderRadius: 'lg',
                        boxShadow: 'sm',
                        outline: 'none',
                        transition: 'colors 0.2s',
                      },
                      { _focus: { borderColor: 'amber.500', boxShadow: '0 0 0 1px var(--colors-amber-500)' } }
                    )}
                    defaultValue="member"
                  >
                    <option value="member">{t('admin.roleMember')}</option>
                    <option value="admin">{t('admin.roleAdmin')}</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="createStatus"
                    className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', color: 'stone.700', marginBottom: '1' })}
                  >
                    {t('common.status')}
                  </label>
                  <select
                    id="createStatus"
                    name="is_active"
                    className={css(
                      {
                        width: '100%',
                        paddingX: '3',
                        paddingY: '2',
                        backgroundColor: 'white',
                        color: 'stone.900',
                        borderWidth: '1px',
                        borderColor: 'stone.300',
                        borderRadius: 'lg',
                        boxShadow: 'sm',
                        outline: 'none',
                        transition: 'colors 0.2s',
                      },
                      { _focus: { borderColor: 'amber.500', boxShadow: '0 0 0 1px var(--colors-amber-500)' } }
                    )}
                    defaultValue="true"
                  >
                    <option value="true">{t('admin.statusActive')}</option>
                    <option value="false">{t('admin.statusPending')}</option>
                  </select>
                </div>
              </div>
              <div className={css({ marginTop: '8', display: 'flex', justifyContent: 'flex-end', gap: '3', paddingTop: '2' })}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={css({
                    paddingX: '4',
                    paddingY: '2',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'stone.600',
                    _hover: { color: 'stone.900', backgroundColor: 'stone.200' },
                    borderRadius: 'xl',
                    transition: 'colors 0.2s',
                  })}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={css({
                    paddingX: '4',
                    paddingY: '2',
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                    color: 'white',
                    backgroundColor: 'amber.600',
                    _hover: { backgroundColor: 'amber.700' },
                    borderRadius: 'xl',
                    transition: 'colors 0.2s',
                    boxShadow: 'sm',
                    opacity: isCreating ? 0.5 : 1,
                  })}
                >
                  {isCreating ? t('admin.creating') : t('admin.createUser')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
