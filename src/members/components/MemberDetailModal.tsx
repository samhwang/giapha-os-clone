import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ExternalLink, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { useDashboard } from '../../dashboard/components/DashboardContext';
import type { Person } from '../../types';
import { getPersonById } from '../server/member';
import MemberDetailContent from './MemberDetailContent';

export default function MemberDetailModal({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useTranslation();
  const { memberModalId: memberId, setMemberModalId } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [privateData, setPrivateData] = useState<{ phoneNumber?: string | null; occupation?: string | null; currentResidence?: string | null } | null>(null);

  const closeModal = () => {
    setMemberModalId(null);
  };

  const fetchData = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPersonById({ data: { id } });
        if (!result) throw new Error(t('member.loadError'));
        setPerson(result as Person);
        if (isAdmin && result.privateDetails) {
          setPrivateData(result.privateDetails);
        }
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError(err instanceof Error ? err.message : t('member.systemError'));
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, t]
  );

  useEffect(() => {
    if (memberId) {
      setIsOpen(true);
      fetchData(memberId);
    } else {
      setIsOpen(false);
      setTimeout(() => {
        setPerson(null);
        setPrivateData(null);
        setError(null);
      }, 300);
    }
  }, [memberId, fetchData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={css({
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: { base: '4', sm: '6' },
            backgroundColor: 'rgb(28 25 23 / 0.4)',
            backdropFilter: 'blur(4px)',
          })}
        >
          <button
            type="button"
            tabIndex={0}
            className={css({ position: 'absolute', inset: 0, cursor: 'pointer' })}
            onClick={closeModal}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') closeModal();
            }}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={css({
              position: 'relative',
              backgroundColor: 'rgb(255 255 255 / 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: '3xl',
              boxShadow: '2xl',
              width: '100%',
              maxWidth: '56rem',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'stone.200',
            })}
          >
            {/* Header Actions */}
            <div
              className={css({
                position: 'absolute',
                top: { base: '4', sm: '5' },
                right: { base: '4', sm: '5' },
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              {isAdmin && person && (
                <Link
                  to="/dashboard/members/$id"
                  params={{ id: person.id }}
                  className={css(
                    {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5',
                      paddingX: '4',
                      paddingY: '2',
                      backgroundColor: 'rgb(254 243 199 / 0.8)',
                      backdropFilter: 'blur(12px)',
                      color: 'amber.800',
                      borderRadius: 'full',
                      fontWeight: 'semibold',
                      fontSize: 'sm',
                      boxShadow: 'sm',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'rgb(245 158 11 / 0.5)',
                      transition: 'colors 0.2s',
                    },
                    { _hover: { backgroundColor: 'amber.200' } }
                  )}
                >
                  <ExternalLink className={css({ width: '4', height: '4' })} />
                  <span className={css({ display: { base: 'none', sm: 'inline' } })}>{t('member.viewDetail')}</span>
                </Link>
              )}
              <button
                type="button"
                onClick={closeModal}
                className={css(
                  {
                    width: '10',
                    height: '10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgb(228 228 231 / 0.8)',
                    backdropFilter: 'blur(12px)',
                    color: 'stone.600',
                    borderRadius: 'full',
                    transition: 'colors 0.2s',
                    boxShadow: 'sm',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgb(228 228 231 / 0.5)',
                  },
                  { _hover: { backgroundColor: 'stone.200', color: 'stone.900' } }
                )}
                aria-label={t('common.close')}
              >
                <X className={css({ width: '5', height: '5' })} />
              </button>
            </div>

            {loading ? (
              <div
                className={css({
                  flex: 1,
                  minHeight: '25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '4',
                })}
              >
                <div
                  className={css({
                    width: '10',
                    height: '10',
                    borderWidth: '4',
                    borderColor: 'amber.600',
                    borderTopColor: 'transparent',
                    borderRadius: 'full',
                    animation: 'spin 1s linear infinite',
                  })}
                />
                <p className={css({ color: 'stone.500', fontWeight: 'medium' })}>{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div
                className={css({
                  flex: 1,
                  minHeight: '25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '4',
                  padding: '8',
                  textAlign: 'center',
                })}
              >
                <div
                  className={css({
                    width: '16',
                    height: '16',
                    backgroundColor: 'red.50',
                    color: 'red.500',
                    borderRadius: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2',
                    boxShadow: 'inner',
                  })}
                >
                  <AlertCircle className={css({ width: '8', height: '8' })} />
                </div>
                <p className={css({ color: 'red.600', fontWeight: 'medium', fontSize: 'lg' })}>{error}</p>
                <button
                  type="button"
                  onClick={closeModal}
                  className={css(
                    {
                      marginTop: '2',
                      paddingX: '6',
                      paddingY: '2.5',
                      backgroundColor: 'stone.100',
                      color: 'stone.700',
                      fontWeight: 'semibold',
                      borderRadius: 'full',
                      transition: 'colors 0.2s',
                    },
                    { _hover: { backgroundColor: 'stone.200' } }
                  )}
                >
                  {t('common.close')}
                </button>
              </div>
            ) : person ? (
              <div className={css({ flex: 1, overflowY: 'auto' })}>
                <MemberDetailContent person={person} privateData={privateData} isAdmin={isAdmin} />
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
