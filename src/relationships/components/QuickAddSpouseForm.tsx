import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gender } from '../../members/types';

interface QuickAddSpouseFormProps {
  onSubmit: (data: { name: string; birthYear: string; note: string }) => Promise<void>;
  onCancel: () => void;
  processing: boolean;
  personGender: string;
}

export default function QuickAddSpouseForm({ onSubmit, onCancel, processing, personGender }: QuickAddSpouseFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit({ name, birthYear, note });
  };

  const handleCancel = () => {
    setName('');
    setBirthYear('');
    setNote('');
    onCancel();
  };

  return (
    <div className="mt-4 bg-rose-50/50 p-4 sm:p-5 rounded-xl border border-rose-200 shadow-sm">
      <h4 className="font-bold text-rose-800 mb-3 text-sm">{t('relationship.quickAddSpouse')}</h4>
      <div className="space-y-3">
        <div>
          <label htmlFor="spouseName" className="block text-xs font-medium text-rose-700 mb-1">
            {t('relationship.fullNameRequired')}
          </label>
          <input
            id="spouseName"
            type="text"
            placeholder={t('member.fullNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
          />
        </div>
        <div>
          <label htmlFor="spouseBirthYear" className="block text-xs font-medium text-rose-700 mb-1">
            {t('relationship.birthYearOptional')}
          </label>
          <input
            id="spouseBirthYear"
            type="number"
            placeholder={t('relationship.birthYearPlaceholder')}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
          />
        </div>
        <div>
          <label htmlFor="spouseRelNote" className="block text-xs font-medium text-rose-700 mb-1">
            {t('relationship.spouseNoteLabel')}
          </label>
          <input
            id="spouseRelNote"
            type="text"
            placeholder={t('relationship.spouseNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
          />
        </div>
        <p className="text-xs text-stone-500 italic mt-1">
          {t('relationship.autoGenderNote', {
            gender: personGender === Gender.enum.male ? t('common.female') : personGender === Gender.enum.female ? t('common.male') : t('common.female'),
          })}
        </p>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || processing}
            className="flex-1 bg-rose-600 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {processing ? t('common.saving') : t('common.save')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 sm:py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md sm:rounded-lg text-sm hover:bg-stone-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
