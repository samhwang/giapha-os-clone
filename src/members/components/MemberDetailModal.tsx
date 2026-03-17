import { Link } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, ExternalLink, Pencil, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { getPersonById } from '../server/member';
import type { Person } from '../types';
import MemberDetailContent from './MemberDetailContent';
import MemberForm from './MemberForm';

export default function MemberDetailModal({ isAdmin, canEdit = false }: { isAdmin: boolean; canEdit?: boolean }) {
  const { t } = useTranslation();
  const { memberModalId: memberId, setMemberModalId, showCreateModal, setShowCreateModal } = useDashboardStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [privateData, setPrivateData] = useState<{ phoneNumber?: string | null; occupation?: string | null; currentResidence?: string | null } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const closeModal = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    if (isCreating) {
      setIsCreating(false);
      setShowCreateModal(false);
      return;
    }
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
      setIsCreating(false);
      fetchData(memberId);
    } else if (showCreateModal) {
      setIsOpen(true);
      setIsCreating(true);
      setPerson(null);
      setPrivateData(null);
      setError(null);
      setIsEditing(false);
    } else {
      setIsOpen(false);
      setTimeout(() => {
        setPerson(null);
        setPrivateData(null);
        setError(null);
        setIsEditing(false);
        setIsCreating(false);
      }, 300);
    }
  }, [memberId, showCreateModal, fetchData]);

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
    <>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out_forwards]">
          {!isEditing && !isCreating && (
            <button
              type="button"
              tabIndex={0}
              className="absolute inset-0 cursor-pointer"
              onClick={() => {
                setMemberModalId(null);
                setShowCreateModal(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setMemberModalId(null);
                  setShowCreateModal(false);
                }
              }}
            />
          )}

          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-stone-200 animate-[scale-in_0.2s_ease-out_forwards]">
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
              {canEdit && person && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-100/80 backdrop-blur-md text-amber-800 rounded-full hover:bg-amber-200 font-semibold text-sm shadow-sm border border-amber-200/50 transition-colors"
                >
                  <Pencil className="size-4" />
                  <span className="hidden sm:inline">{t('common.edit')}</span>
                </button>
              )}
              {isAdmin && person && !isEditing && (
                <Link
                  to="/dashboard/members/$id"
                  params={{ id: person.id }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-100/80 backdrop-blur-md text-stone-700 rounded-full hover:bg-stone-200 font-semibold text-sm shadow-sm border border-stone-200/50 transition-colors"
                >
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">{t('member.viewDetail')}</span>
                </Link>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-100/80 backdrop-blur-md text-stone-700 rounded-full hover:bg-stone-200 font-semibold text-sm shadow-sm border border-stone-200/50 transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">{t('common.back')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={
                  isEditing
                    ? () => setIsEditing(false)
                    : isCreating
                      ? () => {
                          setIsCreating(false);
                          setShowCreateModal(false);
                        }
                      : () => setMemberModalId(null)
                }
                className="size-10 flex items-center justify-center bg-stone-100/80 backdrop-blur-md text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 shadow-sm border border-stone-200/50 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="size-5" />
              </button>
            </div>

            {isCreating ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <h2 className="text-xl font-serif font-bold text-stone-800 mb-6">{t('member.addMember')}</h2>
                <MemberForm
                  isAdmin={isAdmin}
                  onSuccess={(personId) => {
                    setIsCreating(false);
                    setShowCreateModal(false);
                    setMemberModalId(personId);
                  }}
                  onCancel={() => {
                    setIsCreating(false);
                    setShowCreateModal(false);
                  }}
                />
              </div>
            ) : loading ? (
              <div className="flex-1 min-h-100 flex items-center justify-center flex-col gap-4">
                <div className="size-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-stone-500 font-medium">{t('common.loading')}</p>
              </div>
            ) : error ? (
              <div className="flex-1 min-h-100 flex items-center justify-center flex-col gap-4 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2 shadow-inner">
                  <AlertCircle className="size-8" />
                </div>
                <p className="text-red-600 font-medium text-lg">{error}</p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-2 px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-full transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            ) : person ? (
              <div className="flex-1 overflow-y-auto">
                {isEditing ? (
                  <div className="p-4 sm:p-6">
                    <MemberForm
                      initialData={{ ...person, ...privateData }}
                      isEditing
                      isAdmin={isAdmin}
                      onSuccess={(personId) => {
                        setIsEditing(false);
                        fetchData(personId);
                      }}
                      onCancel={() => setIsEditing(false)}
                    />
                  </div>
                ) : (
                  <MemberDetailContent person={person} privateData={privateData} isAdmin={isAdmin} canEdit={canEdit} />
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
