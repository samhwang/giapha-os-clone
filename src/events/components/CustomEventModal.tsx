import { AlertCircle, AlignLeft, Calendar as CalendarIcon, Loader2, MapPin, X } from 'lucide-react';
import { type SubmitEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CustomEventRecord } from '../../types';
import { cn } from '../../ui/utils/cn';
import { createCustomEvent, deleteCustomEvent, updateCustomEvent } from '../server/customEvent';

interface CustomEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: CustomEventRecord | null;
}

export default function CustomEventModal({ isOpen, onClose, onSuccess, eventToEdit }: CustomEventModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(eventToEdit?.name || '');
  const [eventDate, setEventDate] = useState(eventToEdit?.eventDate || '');
  const [location, setLocation] = useState(eventToEdit?.location || '');
  const [content, setContent] = useState(eventToEdit?.content || '');

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setName(eventToEdit.name);
        setEventDate(eventToEdit.eventDate);
        setLocation(eventToEdit.location || '');
        setContent(eventToEdit.content || '');
      } else {
        setName('');
        setEventDate('');
        setLocation('');
        setContent('');
      }
      setError(null);
    }
  }, [isOpen, eventToEdit]);

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

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (eventToEdit) {
        await updateCustomEvent({
          data: { id: eventToEdit.id, name, eventDate, location: location || null, content: content || null },
        });
      } else {
        await createCustomEvent({
          data: { name, eventDate, location: location || null, content: content || null },
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('customEvent.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;
    if (!window.confirm(t('customEvent.deleteConfirm'))) return;

    setLoading(true);
    setError(null);
    try {
      await deleteCustomEvent({ data: { id: eventToEdit.id } });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('customEvent.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClasses = cn(
    'bg-white text-stone-900 placeholder-stone-500 block w-full rounded-xl border border-stone-300 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white text-sm px-4 py-3 transition-all outline-none'
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out_forwards]">
      <button type="button" className="absolute inset-0 cursor-pointer" onClick={onClose} aria-label="Close" />

      <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-stone-200 animate-[fade-in-up_0.25s_ease-out_forwards]">
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
          <button
            type="button"
            onClick={onClose}
            className="size-10 flex items-center justify-center bg-stone-100/80 text-stone-600 rounded-full hover:bg-stone-200 hover:text-stone-900 shadow-sm border border-stone-200/50 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-16 pb-8">
          <h2 className="text-xl font-serif font-bold text-stone-800 mb-6">{eventToEdit ? t('customEvent.editTitle') : t('customEvent.createTitle')}</h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-3 shadow-sm">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/80 p-5 sm:p-6 rounded-2xl shadow-sm border border-stone-200/80 space-y-5">
              <div>
                <label htmlFor="ce-name" className="block text-sm font-semibold text-stone-700 mb-1.5">
                  {t('customEvent.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="ce-name"
                  required
                  type="text"
                  className={inputClasses}
                  placeholder={t('customEvent.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="ce-date" className="block text-sm font-semibold text-stone-700 mb-1.5">
                  {t('customEvent.date')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <input
                    id="ce-date"
                    required
                    type="date"
                    className={cn(inputClasses, 'pl-11')}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ce-location" className="block text-sm font-semibold text-stone-700 mb-1.5">
                  {t('customEvent.location')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <input
                    id="ce-location"
                    type="text"
                    className={cn(inputClasses, 'pl-11')}
                    placeholder={t('customEvent.locationPlaceholder')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ce-content" className="block text-sm font-semibold text-stone-700 mb-1.5">
                  {t('customEvent.content')}
                </label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 size-4 text-stone-400" />
                  <textarea
                    id="ce-content"
                    rows={3}
                    className={cn(inputClasses, 'pl-11 resize-none')}
                    placeholder={t('customEvent.contentPlaceholder')}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 pt-4 sm:pt-6">
              {eventToEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50 border border-rose-200/50"
                >
                  {t('customEvent.delete')}
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {loading ? t('common.saving') : t('customEvent.save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
