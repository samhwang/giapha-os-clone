import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ExternalLink, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getPersonById } from '@/server/functions/member';
import type { Person } from '@/types';
import { useDashboard } from './DashboardContext';
import MemberDetailContent from './MemberDetailContent';

export default function MemberDetailModal({ isAdmin }: { isAdmin: boolean }) {
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
        if (!result) throw new Error('Không thể tải thông tin thành viên.');
        setPerson(result as Person);
        if (isAdmin && result.privateDetails) {
          setPrivateData(result.privateDetails);
        }
      } catch (err) {
        console.error('Error fetching member details:', err);
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống.');
      } finally {
        setLoading(false);
      }
    },
    [isAdmin]
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
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm"
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: click-away backdrop */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: click-away backdrop */}
          <div className="absolute inset-0 cursor-pointer" onClick={closeModal} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-stone-200"
          >
            {/* Header Actions */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
              {isAdmin && person && (
                <Link
                  to="/dashboard/members/$id"
                  params={{ id: person.id }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-100/80 backdrop-blur-md text-amber-800 rounded-full hover:bg-amber-200 font-semibold text-sm shadow-sm border border-amber-200/50 transition-colors"
                >
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">Xem chi tiết</span>
                </Link>
              )}
              <button
                type="button"
                onClick={closeModal}
                className="size-10 flex items-center justify-center bg-stone-100/80 backdrop-blur-md text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 shadow-sm border border-stone-200/50 transition-colors"
                aria-label="Đóng"
              >
                <X className="size-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 min-h-[400px] flex items-center justify-center flex-col gap-4">
                <div className="size-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-stone-500 font-medium">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="flex-1 min-h-[400px] flex items-center justify-center flex-col gap-4 p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2 shadow-inner">
                  <AlertCircle className="size-8" />
                </div>
                <p className="text-red-600 font-medium text-lg">{error}</p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-2 px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-full transition-colors"
                >
                  Đóng
                </button>
              </div>
            ) : person ? (
              <div className="flex-1 overflow-y-auto">
                <MemberDetailContent person={person} privateData={privateData} isAdmin={isAdmin} />
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
