import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gender } from '../../members/types';
import { Button } from '../../ui/common/Button';
import { INPUT_BASE } from '../../ui/common/Input';
import { cn } from '../../ui/utils/cn';

interface BulkChild {
  name: string;
  gender: Gender;
  birthYear: string;
  birthOrder: string;
}

interface BulkAddChildrenFormProps {
  onSubmit: (data: { spouseId: string; children: Array<{ name: string; gender: string; birthYear: string; birthOrder: string }> }) => Promise<void>;
  onCancel: () => void;
  processing: boolean;
  spouses: Array<{ id: string; fullName: string; note: string | null }>;
}

export default function BulkAddChildrenForm({ onSubmit, onCancel, processing, spouses }: BulkAddChildrenFormProps) {
  const { t } = useTranslation();
  const [selectedSpouseId, setSelectedSpouseId] = useState<string>('');
  const [bulkChildren, setBulkChildren] = useState<BulkChild[]>([{ name: '', gender: Gender.enum.male, birthYear: '', birthOrder: '1' }]);

  const handleSubmit = () => {
    onSubmit({
      spouseId: selectedSpouseId,
      children: bulkChildren.map((c) => ({ name: c.name, gender: c.gender, birthYear: c.birthYear, birthOrder: c.birthOrder })),
    });
  };

  const handleCancel = () => {
    setBulkChildren([{ name: '', gender: Gender.enum.male, birthYear: '', birthOrder: '1' }]);
    setSelectedSpouseId('');
    onCancel();
  };

  return (
    <div className="mt-4 bg-sky-50/50 p-4 sm:p-5 rounded-xl border border-sky-200 shadow-sm">
      <h4 className="font-bold text-sky-800 mb-3 text-sm">{t('relationship.bulkAddChildren')}</h4>
      <div className="space-y-4">
        <div>
          <label htmlFor="bulkSpouse" className="block text-xs font-medium text-stone-500 mb-1">
            {t('relationship.selectOtherParent')}
          </label>
          <select
            id="bulkSpouse"
            value={selectedSpouseId}
            onChange={(e) => setSelectedSpouseId(e.target.value)}
            className={cn(INPUT_BASE, 'flex-1 text-sm rounded-md sm:rounded-lg p-2 sm:p-2.5 focus:border-sky-500 focus:ring-sky-500')}
          >
            <option value="unknown">{t('relationship.unknownParent')}</option>
            {spouses.map((spouse) => (
              <option key={spouse.id} value={spouse.id}>
                {spouse.fullName} {spouse.note ? `(${spouse.note})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-stone-500 mb-1">{t('relationship.childrenList')}</span>
          {bulkChildren.map((child, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form rows without stable IDs
            <div key={index} className="flex gap-2 items-center">
              <span className="text-stone-400 text-xs w-4">{index + 1}.</span>
              <input
                type="text"
                placeholder={t('relationship.fullNamePlaceholder')}
                value={child.name}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].name = e.target.value;
                  setBulkChildren(newBulk);
                }}
                className={cn(INPUT_BASE, 'flex-2 text-sm rounded-md p-2 focus:border-sky-500 focus:ring-sky-500')}
              />
              <select
                value={child.gender}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].gender = e.target.value as Gender;
                  setBulkChildren(newBulk);
                }}
                className={cn(INPUT_BASE, 'flex-1 text-sm rounded-md p-2 focus:border-sky-500 focus:ring-sky-500')}
              >
                <option value={Gender.enum.male}>{t('common.male')}</option>
                <option value={Gender.enum.female}>{t('common.female')}</option>
                <option value={Gender.enum.other}>{t('common.other')}</option>
              </select>
              <input
                type="number"
                placeholder={t('relationship.birthYearPlaceholder')}
                value={child.birthYear}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].birthYear = e.target.value;
                  setBulkChildren(newBulk);
                }}
                className={cn(INPUT_BASE, 'flex-1 text-sm rounded-md p-2 focus:border-sky-500 focus:ring-sky-500 w-24')}
              />
              <input
                type="number"
                placeholder={t('relationship.birthOrderPlaceholder')}
                value={child.birthOrder}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].birthOrder = e.target.value;
                  setBulkChildren(newBulk);
                }}
                className={cn(INPUT_BASE, 'text-sm rounded-md p-2 focus:border-sky-500 focus:ring-sky-500 w-16')}
              />
              <button
                type="button"
                onClick={() => {
                  const newBulk = bulkChildren.filter((_, i) => i !== index);
                  if (newBulk.length === 0) {
                    newBulk.push({ name: '', gender: Gender.enum.male, birthYear: '', birthOrder: '1' });
                  }
                  setBulkChildren(newBulk);
                }}
                className="text-stone-400 hover:text-red-500 p-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const nextOrder = String(bulkChildren.length + 1);
              setBulkChildren([...bulkChildren, { name: '', gender: Gender.enum.male, birthYear: '', birthOrder: nextOrder }]);
            }}
            className="text-sky-600 text-xs font-semibold hover:text-sky-800 mt-2 px-6"
          >
            {t('relationship.addRow')}
          </button>
        </div>

        <div className="flex gap-2 pt-4 border-t border-stone-200">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={processing || bulkChildren.every((c) => c.name.trim() === '')}
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white border-transparent rounded-md sm:rounded-lg"
          >
            {processing ? t('common.saving') : t('relationship.saveAll')}
          </Button>
          <Button size="sm" onClick={handleCancel} className="rounded-md sm:rounded-lg">
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
