import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Gender } from '../../members/types';
import { Button } from '../../ui/common/Button';
import { INPUT_BASE } from '../../ui/common/Input';
import { cn } from '../../ui/utils/cn';

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
    void onSubmit({ name, birthYear, note });
  };

  const handleCancel = () => {
    setName('');
    setBirthYear('');
    setNote('');
    onCancel();
  };

  return (
    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm sm:p-5">
      <h4 className="mb-3 text-sm font-bold text-rose-800">{t('relationship.quickAddSpouse')}</h4>
      <div className="space-y-3">
        <div>
          <label htmlFor="spouseName" className="mb-1 block text-xs font-medium text-rose-700">
            {t('relationship.fullNameRequired')}
          </label>
          <input
            id="spouseName"
            type="text"
            placeholder={t('member.fullNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={cn(INPUT_BASE, 'rounded-md p-2 text-sm focus:border-rose-500 focus:ring-rose-500 sm:rounded-lg sm:p-2.5')}
          />
        </div>
        <div>
          <label htmlFor="spouseBirthYear" className="mb-1 block text-xs font-medium text-rose-700">
            {t('relationship.birthYearOptional')}
          </label>
          <input
            id="spouseBirthYear"
            type="number"
            placeholder={t('relationship.birthYearPlaceholder')}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className={cn(INPUT_BASE, 'rounded-md p-2 text-sm focus:border-rose-500 focus:ring-rose-500 sm:rounded-lg sm:p-2.5')}
          />
        </div>
        <div>
          <label htmlFor="spouseRelNote" className="mb-1 block text-xs font-medium text-rose-700">
            {t('relationship.spouseNoteLabel')}
          </label>
          <input
            id="spouseRelNote"
            type="text"
            placeholder={t('relationship.spouseNotePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={cn(INPUT_BASE, 'rounded-md p-2 text-sm focus:border-rose-500 focus:ring-rose-500 sm:rounded-lg sm:p-2.5')}
          />
        </div>
        <p className="mt-1 text-xs text-stone-500 italic">
          {t('relationship.autoGenderNote', {
            gender: personGender === Gender.enum.male ? t('common.female') : personGender === Gender.enum.female ? t('common.male') : t('common.female'),
          })}
        </p>
        <div className="flex gap-2 pt-2">
          {/* custom: solid rose submit button matches the spouse form's rose-themed section */}
          <Button
            variant="danger"
            size="sm"
            onClick={handleSubmit}
            disabled={!name.trim() || processing}
            className="flex-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 sm:rounded-lg"
          >
            {processing ? t('common.saving') : t('common.save')}
          </Button>
          <Button size="sm" onClick={handleCancel} className="rounded-md sm:rounded-lg">
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
