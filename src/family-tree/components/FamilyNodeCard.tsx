import type { MouseEvent } from 'react';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import type { Person } from '../../members/types';
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
    // biome-ignore lint/a11y/useKeyWithClickEvents: wrapped in button when used standalone
    // biome-ignore lint/a11y/noStaticElementInteractions: interactive wrapper handles a11y
    <div
      onClick={onClickCard}
      className={cn(
        'group py-2 px-1 flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 rounded-2xl relative h-full',
        person.isDeceased && 'grayscale-[0.4] opacity-80',
        showAvatar ? 'w-20 sm:w-24 md:w-28 bg-white/70 hover:shadow-xl' : 'px-3'
      )}
    >
      {isRingVisible && (
        <div className="absolute top-3/12 -left-2.5 sm:-left-4 size-5 sm:size-6 rounded-full shadow-sm bg-white z-20 flex items-center justify-center text-2xs sm:text-sm">
          💍
        </div>
      )}
      {isPlusVisible && (
        <div className="absolute top-3/12 -left-2.5 sm:-left-4 size-5 sm:size-6 rounded-full shadow-sm bg-white z-20 flex items-center justify-center text-2xs sm:text-sm">
          +
        </div>
      )}

      {showAvatar && (
        <div className="relative z-10 mb-1.5 sm:mb-2">
          <Avatar
            gender={person.gender}
            avatarUrl={person.avatarUrl}
            fullName={person.fullName}
            className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-2xs sm:text-xs md:text-sm shrink-0 shadow-lg ring-2 ring-white transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-1 w-full px-0.5 sm:px-1 relative z-10">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: wrapped in button when standalone */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: parent button handles a11y */}
        <span
          className={cn(
            'text-2xs sm:text-xs-plus md:text-xs font-bold text-center leading-tight line-clamp-2 transition-colors cursor-pointer',
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
