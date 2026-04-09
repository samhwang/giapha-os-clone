import { Filter } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { TreeFilterOptions } from '../utils/treeHelpers';

import { cn } from '../../ui/utils/cn';

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
          'flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-sm transition-all',
          showFilters
            ? 'border-amber-200 bg-amber-100/90 text-amber-800'
            : 'border-border-default bg-surface-elevated text-stone-600 backdrop-blur-md hover:bg-white hover:text-stone-900 hover:shadow-md'
        )}
      >
        <Filter className="size-4" />
        <span className="hidden sm:inline">{t('tree.filter')}</span>
      </button>

      {/* custom: dropdown panel — not a semantic card, needs panel-specific positioning and shadow */}
      {showFilters && (
        <div className="absolute top-full right-0 z-50 mt-2 flex w-52 animate-[fade-in_0.15s_ease-out_forwards] flex-col gap-3 rounded-card border border-border-default bg-surface-panel p-4 shadow-xl backdrop-blur-xl">
          {filterOptions.map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-stone-700 select-none">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => onToggle(key)}
                className="size-4 cursor-pointer rounded text-amber-600 focus:ring-amber-500"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
