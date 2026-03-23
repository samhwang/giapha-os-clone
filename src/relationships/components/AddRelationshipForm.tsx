import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import { Gender, type Person } from '../../members/types';
import { cn } from '../../ui/utils/cn';
import { RelationshipType } from '../types';

interface AddRelationshipFormProps {
  onSubmit: (data: { direction: string; type: string; note: string; targetId: string }) => Promise<void>;
  onCancel: () => void;
  processing: boolean;
  allPersons: Person[];
  personId: string;
}

export default function AddRelationshipForm({ onSubmit, onCancel, processing, allPersons, personId }: AddRelationshipFormProps) {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<'parent' | 'child' | 'spouse'>('parent');
  const [type, setType] = useState<RelationshipType>(RelationshipType.enum.biological_child);
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const results = allPersons.filter((p) => p.id !== personId && p.fullName.toLowerCase().includes(term)).slice(0, 5);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, personId, allPersons]);

  const handleSubmit = () => {
    if (!selectedTargetId) return;
    onSubmit({ direction, type, note, targetId: selectedTargetId });
  };

  const handleCancel = () => {
    setSelectedTargetId(null);
    setSearchTerm('');
    setNote('');
    onCancel();
  };

  return (
    <div className="mt-4 bg-stone-50/50 p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
      <h4 className="font-bold text-stone-800 mb-3 text-sm">{t('relationship.addNewRelationship')}</h4>
      <div className="space-y-3">
        <div>
          <label htmlFor="relNote" className="block text-xs font-medium text-stone-500 mb-1">
            {t('relationship.noteLabel')}
          </label>
          <input
            id="relNote"
            type="text"
            placeholder={t('relationship.notePlaceholder')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border mb-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="relDirection" className="block text-xs font-medium text-stone-500 mb-1">
            {t('relationship.typeLabel')}
          </label>
          <select
            id="relDirection"
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'parent' | 'child' | 'spouse')}
            className="bg-white text-stone-900 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
          >
            <option value="parent">{t('relationship.typeChild')}</option>
            <option value="spouse">{t('relationship.typeSpouse')}</option>
            <option value="child">{t('relationship.typeParent')}</option>
          </select>
        </div>

        {(direction === 'child' || direction === 'parent') && (
          <div>
            <label htmlFor="relType" className="block text-xs font-medium text-stone-500 mb-1">
              {t('relationship.detailLabel')}
            </label>
            <select
              id="relType"
              value={type}
              onChange={(e) => setType(e.target.value as RelationshipType)}
              className="bg-white text-stone-900 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
            >
              <option value="biological_child">{t('relationship.biological')}</option>
              <option value="adopted_child">{t('relationship.adopted')}</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="relSearch" className="block text-xs font-medium text-stone-500 mb-1">
            {t('relationship.searchPerson')}
          </label>
          <input
            id="relSearch"
            type="text"
            placeholder={t('relationship.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
          />
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-stone-200 rounded-md shadow-lg max-h-62.5 overflow-y-auto">
              <div className="px-3 py-1.5 bg-stone-100 text-2xs font-bold text-stone-500 uppercase tracking-wide border-b border-stone-200 sticky top-0 z-10">
                {t('relationship.searchResults')}
              </div>
              {searchResults.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setSelectedTargetId(p.id);
                    setSearchTerm(p.fullName);
                    setSearchResults([]);
                  }}
                  className="w-full px-3 py-2 hover:bg-amber-50 text-sm flex items-center justify-between border-b border-stone-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex items-center justify-center text-[8px] font-bold size-3 rounded-full text-white shrink-0',
                        p.gender === Gender.enum.male && 'bg-sky-500',
                        p.gender === Gender.enum.female && 'bg-rose-500',
                        p.gender === Gender.enum.other && 'bg-stone-400'
                      )}
                    >
                      {p.gender === Gender.enum.male ? '♂' : p.gender === Gender.enum.female ? '♀' : '?'}
                    </span>
                    <span className="font-medium text-stone-800">{p.fullName}</span>
                  </div>
                  <span className="text-2xs text-stone-400">
                    {formatDisplayDate({ year: p.birthYear, month: p.birthMonth, day: p.birthDay, unknownLabel: t('common.unknown') })}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedTargetId && <p className="text-xs text-green-600 mt-1">{t('relationship.selected', { name: searchTerm })}</p>}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedTargetId || processing}
            className="flex-1 bg-amber-700 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors"
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
