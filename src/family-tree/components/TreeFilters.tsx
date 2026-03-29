import { Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/common/Card';
import { cn } from '../../ui/utils/cn';
import type { TreeFilterOptions } from '../utils/treeHelpers';

const INITIAL_FILTERS: TreeFilterOptions = {
  hideDaughtersInLaw: false,
  hideSonsInLaw: false,
  hideDaughters: false,
  hideSons: false,
  hideMales: false,
  hideFemales: false,
};

export function useTreeFilters() {
  const [filters, setFilters] = useState<TreeFilterOptions>(INITIAL_FILTERS);

  const toggle = (key: keyof TreeFilterOptions) => setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  return { filters, toggle };
}

interface TreeFiltersProps {
  filters: TreeFilterOptions;
  onToggle: (key: keyof TreeFilterOptions) => void;
}

export default function TreeFilters({ filters, onToggle }: TreeFiltersProps) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOptions: { key: keyof TreeFilterOptions; label: string }[] = [
    { key: 'hideDaughtersInLaw', label: t('tree.hideDaughtersInLaw') },
    { key: 'hideSonsInLaw', label: t('tree.hideSonsInLaw') },
    { key: 'hideDaughters', label: t('tree.hideDaughters') },
    { key: 'hideSons', label: t('tree.hideSons') },
    { key: 'hideMales', label: t('tree.hideMales') },
    { key: 'hideFemales', label: t('tree.hideFemales') },
  ];

  return (
    <div className="relative" ref={filtersRef}>
      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className={cn(
          'flex items-center gap-2 px-4 h-10 rounded-full font-semibold text-sm shadow-sm border transition-all',
          showFilters
            ? 'bg-amber-100/90 text-amber-800 border-amber-200'
            : 'bg-surface-elevated text-stone-600 border-border-default hover:bg-white hover:text-stone-900 hover:shadow-md backdrop-blur-md'
        )}
      >
        <Filter className="size-4" />
        <span className="hidden sm:inline">{t('tree.filter')}</span>
      </button>

      {showFilters && (
        <Card className="absolute top-full right-0 mt-2 w-52 bg-surface-panel backdrop-blur-xl shadow-xl p-4 flex flex-col gap-3 z-50 animate-[fade-in_0.15s_ease-out_forwards]">
          {filterOptions.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 text-sm font-medium text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => onToggle(key)}
                className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer size-4"
              />
              {label}
            </label>
          ))}
        </Card>
      )}
    </div>
  );
}
