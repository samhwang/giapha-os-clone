import { useMutation } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal, ModalCloseButton, ModalPanel } from '../../ui/common/Modal';
import { cn } from '../../ui/utils/cn';
import { useCustomEventForm } from '../hooks/useCustomEventForm';
import { createCustomEvent, deleteCustomEvent, updateCustomEvent } from '../server/customEvent';
import type { CustomEventRecord } from '../types';

interface CustomEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: CustomEventRecord | null;
}

export default function CustomEventModal({ isOpen, onClose, onSuccess, eventToEdit }: CustomEventModalProps) {
  const { t } = useTranslation();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomEvent({ data: { id } }),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const error = deleteMutation.error ? (deleteMutation.error instanceof Error ? deleteMutation.error.message : t('customEvent.deleteError')) : null;
  const deleting = deleteMutation.isPending;

  const form = useCustomEventForm({
    defaultValues: {
      name: '',
      eventDate: '',
      location: '',
      content: '',
    },
    listeners: {
      onMount: ({ formApi }) => {
        if (!isOpen) return;
        deleteMutation.reset();

        if (!eventToEdit) return;

        formApi.setFieldValue('name', eventToEdit.name);
        formApi.setFieldValue('eventDate', eventToEdit.eventDate);
        formApi.setFieldValue('location', eventToEdit.location || '');
        formApi.setFieldValue('content', eventToEdit.content || '');
      },
    },
    onSubmit: async ({ value }) => {
      if (eventToEdit) {
        await updateCustomEvent({
          data: {
            id: eventToEdit.id,
            name: value.name,
            eventDate: value.eventDate,
            location: value.location || null,
            content: value.content || null,
          },
        });
        onSuccess();
        onClose();
        return;
      }

      await createCustomEvent({
        data: {
          name: value.name,
          eventDate: value.eventDate,
          location: value.location || null,
          content: value.content || null,
        },
      });
      onSuccess();
      onClose();
    },
  });

  const handleDelete = () => {
    if (!eventToEdit) return;
    if (!window.confirm(t('customEvent.deleteConfirm'))) return;
    deleteMutation.mutate(eventToEdit.id);
  };

  const inputClasses = cn(
    'bg-white text-stone-900 placeholder-stone-500 block w-full rounded-xl border border-stone-300 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white text-sm px-4 py-3 transition-all outline-none'
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalPanel maxWidth="2xl">
        <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20">
          <ModalCloseButton onClick={onClose} label={t('common.close')} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-16 pb-8">
          <h2 className="text-heading-section mb-6">{eventToEdit ? t('customEvent.editTitle') : t('customEvent.createTitle')}</h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-3 shadow-sm">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="bg-surface-elevated p-5 sm:p-6 rounded-2xl shadow-sm border border-border-strong space-y-5">
              <form.AppField name="name">
                {(field) => (
                  <div>
                    <label htmlFor={`ce-${field.name}`} className="text-label">
                      {t('customEvent.name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`ce-${field.name}`}
                      required
                      type="text"
                      className={inputClasses}
                      placeholder={t('customEvent.namePlaceholder')}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.AppField>

              <form.AppField name="eventDate">
                {(field) => <field.CustomEventField type="date" className={cn(inputClasses, 'pl-11')} required label={t('customEvent.date')} />}
              </form.AppField>

              <form.AppField name="location">
                {(field) => (
                  <field.CustomEventField
                    type="text"
                    className={cn(inputClasses, 'pl-11')}
                    label={t('customEvent.location')}
                    placeholder={t('customEvent.locationPlaceholder')}
                  />
                )}
              </form.AppField>

              <form.AppField name="content">
                {(field) => (
                  <field.CustomEventField
                    type="textarea"
                    className={cn(inputClasses, 'pl-11 resize-none')}
                    label={t('customEvent.content')}
                    placeholder={t('customEvent.contentPlaceholder')}
                  />
                )}
              </form.AppField>
            </div>

            <div className="flex justify-between items-center gap-4 pt-4 sm:pt-6">
              {eventToEdit ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={form.state.isSubmitting || deleting}
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
                  disabled={form.state.isSubmitting || deleting}
                  className="px-4 py-2.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={form.state.isSubmitting || deleting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {form.state.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {form.state.isSubmitting ? t('common.saving') : t('customEvent.save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </ModalPanel>
    </Modal>
  );
}
