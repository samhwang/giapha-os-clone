import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Gender, type Person } from '../../members/types';
import Avatar from '../../ui/common/Avatar';
import { EmptyState } from '../../ui/common/EmptyState';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';
import { cn } from '../../ui/utils/cn';
import { getGenderStyle } from '../../ui/utils/styles';
import { useDashboardStore } from '../store/dashboardStore';

interface RootSelectorProps {
  persons: Person[];
  currentRootId: string;
}

export default function RootSelector({ persons, currentRootId }: RootSelectorProps) {
  const { setRootId } = useDashboardStore();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRootPerson = persons.find((p) => p.id === currentRootId);

  const filteredPersons = persons.filter((p) => p.fullName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 20);

  const handleSelect = (personId: string) => {
    setRootId(personId);
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full sm:w-72" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl border bg-surface-glass px-3 py-2 text-sm shadow-sm backdrop-blur-md transition-all duration-default focus:ring-2 focus:ring-amber-500/20 focus:outline-none',
          isOpen
            ? 'border-amber-300 bg-white shadow-md ring-2 ring-amber-500/10'
            : 'border-border-default hover:border-amber-300 hover:bg-white/90 hover:shadow-md'
        )}
      >
        <div className="relative shrink-0">
          {currentRootPerson ? (
            <Avatar
              gender={currentRootPerson.gender}
              avatarUrl={currentRootPerson.avatarUrl}
              fullName={currentRootPerson.fullName}
              className="size-8 text-xs font-bold shadow-xs ring-2 ring-white"
            />
          ) : (
            <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-stone-100 text-xs font-bold text-stone-400 shadow-xs ring-2 ring-white">
              ?
            </div>
          )}
          {currentRootPerson && (
            <div
              className={cn(
                'absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full shadow-xs ring-2 ring-white',
                getGenderStyle(currentRootPerson.gender)
              )}
            >
              {currentRootPerson.gender === Gender.enum.male ? (
                <MaleIcon className="size-2.5" />
              ) : currentRootPerson.gender === Gender.enum.female ? (
                <FemaleIcon className="size-2.5" />
              ) : null}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="mb-0.5 text-2xs leading-none font-bold tracking-widest text-stone-400 uppercase">{t('nav.rootDisplay')}</p>
          <p className="truncate leading-tight font-semibold text-stone-800 select-none">
            {currentRootPerson ? currentRootPerson.fullName : t('nav.selectPerson')}
          </p>
        </div>

        <div className={cn('transition-transform duration-default', isOpen && 'rotate-180')}>
          <ChevronDown className={cn('size-4 shrink-0', isOpen ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-600')} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 flex max-h-80 w-full animate-[scale-in_0.2s_ease-out_forwards] flex-col overflow-hidden rounded-xl border border-border-strong bg-surface-panel shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
          <div className="sticky top-0 z-10 border-b border-stone-100/80 bg-stone-50/50 p-2 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                className="w-full rounded-lg border border-border-strong bg-white py-2 pr-3 pl-9 text-sm text-stone-900 placeholder-stone-400 shadow-sm transition-all outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                placeholder={t('nav.searchMember')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5">
            {filteredPersons.length > 0 ? (
              <div className="space-y-0.5">
                {filteredPersons.map((person) => {
                  const isSelected = person.id === currentRootId;
                  return (
                    <button
                      type="button"
                      key={person.id}
                      onClick={() => handleSelect(person.id)}
                      className={cn(
                        'group/item flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-fast',
                        isSelected
                          ? 'border border-amber-200/50 bg-amber-50 text-amber-900 shadow-sm'
                          : 'border border-transparent text-stone-700 hover:bg-stone-100/80'
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar
                          gender={person.gender}
                          avatarUrl={person.avatarUrl}
                          fullName={person.fullName}
                          className="size-8 text-2xs font-bold shadow-xs ring-1 ring-white"
                        />
                        <div
                          className={cn(
                            'absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full shadow-xs ring-1 ring-white',
                            getGenderStyle(person.gender)
                          )}
                        >
                          {person.gender === Gender.enum.male ? (
                            <MaleIcon className="size-2.5" />
                          ) : person.gender === Gender.enum.female ? (
                            <FemaleIcon className="size-2.5" />
                          ) : null}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <p className={cn('truncate', isSelected ? 'font-bold' : 'font-medium group-hover/item:text-stone-900')}>{person.fullName}</p>
                        {person.generation != null && <p className="text-2xs font-medium text-stone-400">{t('nav.generationN', { gen: person.generation })}</p>}
                      </div>

                      {isSelected && <Check className="size-4 shrink-0 text-amber-600" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="size-10 text-stone-300" />}
                title={t('nav.noSearchResults')}
                description={t('nav.tryDifferentSearch')}
                className="px-4 py-8"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
