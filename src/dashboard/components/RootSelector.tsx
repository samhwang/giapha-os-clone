import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gender, type Person } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';
import { cn } from '../../ui/utils/cn';
import { getAvatarBg, getGenderStyle } from '../../ui/utils/styles';
import { useDashboardStore } from '../store/dashboardStore';

export default function RootSelector({ persons, currentRootId }: { persons: Person[]; currentRootId: string }) {
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
        className={`w-full flex items-center gap-3 bg-white/60 backdrop-blur-md border rounded-xl px-3 py-2 text-sm shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 group
          ${isOpen ? 'border-amber-300 bg-white shadow-md ring-2 ring-amber-500/10' : 'border-stone-200/60 hover:border-amber-300 hover:bg-white/90 hover:shadow-md'}`}
      >
        <div className="relative shrink-0">
          <div
            className={cn(
              'size-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden ring-2 ring-white shadow-xs',
              currentRootPerson ? getAvatarBg(currentRootPerson.gender) : 'bg-stone-100 text-stone-400'
            )}
          >
            {currentRootPerson ? (
              currentRootPerson.avatarUrl ? (
                <img src={currentRootPerson.avatarUrl} alt={currentRootPerson.fullName} className="h-full w-full object-cover" />
              ) : (
                <DefaultAvatar gender={currentRootPerson.gender} />
              )
            ) : (
              '?'
            )}
          </div>
          {currentRootPerson && (
            <div
              className={cn(
                'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-2 ring-white shadow-xs flex items-center justify-center',
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

        <div className="flex-1 min-w-0 text-left">
          <p className="text-2xs font-bold text-stone-400 uppercase tracking-widest leading-none mb-0.5">{t('nav.rootDisplay')}</p>
          <p className="truncate text-stone-800 font-semibold select-none leading-tight">
            {currentRootPerson ? currentRootPerson.fullName : t('nav.selectPerson')}
          </p>
        </div>

        <div className={cn('transition-transform duration-300', isOpen && 'rotate-180')}>
          <ChevronDown className={cn('size-4 shrink-0', isOpen ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-600')} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-xl shadow-xl max-h-80 flex flex-col overflow-hidden ring-1 ring-black/5 animate-[scale-in_0.2s_ease-out_forwards]">
          <div className="p-2 border-b border-stone-100/80 bg-stone-50/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                className="w-full text-stone-900 placeholder-stone-400 bg-white border border-stone-200/80 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-sm"
                placeholder={t('nav.searchMember')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1.5">
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
                        'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group/item',
                        isSelected
                          ? 'bg-amber-50 text-amber-900 border border-amber-200/50 shadow-sm'
                          : 'text-stone-700 hover:bg-stone-100/80 border border-transparent'
                      )}
                    >
                      <div className="relative shrink-0">
                        <div
                          className={cn(
                            'size-8 rounded-full flex items-center justify-center text-2xs font-bold text-white overflow-hidden ring-1 ring-white shadow-xs',
                            getAvatarBg(person.gender)
                          )}
                        >
                          {person.avatarUrl ? (
                            <img src={person.avatarUrl} alt={person.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <DefaultAvatar gender={person.gender} />
                          )}
                        </div>
                        <div
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-1 ring-white shadow-xs flex items-center justify-center',
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

                      <div className="flex-1 min-w-0 text-left">
                        <p className={`truncate ${isSelected ? 'font-bold' : 'font-medium group-hover/item:text-stone-900'}`}>{person.fullName}</p>
                        {person.generation != null && <p className="text-2xs text-stone-400 font-medium">{t('nav.generationN', { gen: person.generation })}</p>}
                      </div>

                      {isSelected && <Check className="size-4 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="size-10 rounded-full bg-stone-100 flex items-center justify-center mb-1">
                  <Search className="size-5 text-stone-300" />
                </div>
                <div className="text-sm font-medium text-stone-600">{t('nav.noSearchResults')}</div>
                <div className="text-xs text-stone-400">{t('nav.tryDifferentSearch')}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
