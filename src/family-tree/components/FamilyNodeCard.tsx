import type { MouseEvent } from 'react';

import type { Person } from '../../members/types';

import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import Avatar from '../../ui/common/Avatar';
import { cn } from '../../ui/utils/cn';

interface FamilyNodeCardProps {
  person: Person;
  role?: string;
  note?: string | null;
  onClickCard?: () => void;
  onClickName?: (e: MouseEvent) => void;
  isRingVisible?: boolean;
  isPlusVisible?: boolean;
}

export default function FamilyNodeCard({ person, onClickCard, onClickName, isRingVisible = false, isPlusVisible = false }: FamilyNodeCardProps) {
  const { showAvatar, setMemberModalId } = useDashboardStore();

  const content = (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- wrapped in button when used standalone
    <div
      onClick={onClickCard}
      className={cn(
        'group relative flex h-full flex-col items-center justify-start rounded-2xl px-1 py-2 transition-all duration-default hover:-translate-y-1',
        person.isDeceased && 'opacity-80 grayscale-[0.4]',
        showAvatar ? 'w-20 bg-white/70 hover:shadow-xl sm:w-24 md:w-28' : 'px-3'
      )}
    >
      {isRingVisible && (
        <div className="absolute top-3/12 -left-2.5 z-20 flex size-5 items-center justify-center rounded-full bg-white text-2xs shadow-sm sm:-left-4 sm:size-6 sm:text-sm">
          💍
        </div>
      )}
      {isPlusVisible && (
        <div className="absolute top-3/12 -left-2.5 z-20 flex size-5 items-center justify-center rounded-full bg-white text-2xs shadow-sm sm:-left-4 sm:size-6 sm:text-sm">
          +
        </div>
      )}

      {showAvatar && (
        <div className="relative z-10 mb-1.5 sm:mb-2">
          <Avatar
            gender={person.gender}
            avatarUrl={person.avatarUrl}
            fullName={person.fullName}
            className="h-10 w-10 shrink-0 text-2xs shadow-lg ring-2 ring-white transition-transform duration-default group-hover:scale-105 sm:h-12 sm:w-12 sm:text-xs md:h-14 md:w-14 md:text-sm"
          />
        </div>
      )}

      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-1 px-0.5 sm:px-1">
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- parent button handles a11y */}
        <span
          className={cn(
            'line-clamp-2 cursor-pointer text-center text-2xs leading-tight font-bold transition-colors sm:text-xs-plus md:text-xs',
            onClickName ? 'text-stone-800 group-hover:text-amber-700 hover:underline' : 'text-stone-800 group-hover:text-amber-800'
          )}
          title={person.fullName}
          onClick={(e) => {
            if (onClickName) {
              e.stopPropagation();
              e.preventDefault();
              onClickName(e);
            }
          }}
        >
          {showAvatar
            ? person.fullName
            : person.fullName.split(' ').map((word) => (
                <span key={word} className="block">
                  {word}
                </span>
              ))}
        </span>
      </div>
    </div>
  );

  if (onClickCard || onClickName) {
    return content;
  }

  return (
    <button type="button" onClick={() => setMemberModalId(person.id)} className="block w-fit">
      {content}
    </button>
  );
}
