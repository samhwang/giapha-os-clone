import { Minus, Plus } from 'lucide-react';
import { useDashboard } from '../../dashboard/components/DashboardContext';
import type { Person } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';

interface FamilyNodeCardProps {
  person: Person;
  role?: string;
  note?: string | null;
  isMainNode?: boolean;
  onClickCard?: () => void;
  onClickName?: (e: React.MouseEvent) => void;
  isExpandable?: boolean;
  isExpanded?: boolean;
  isRingVisible?: boolean;
  isPlusVisible?: boolean;
}

export default function FamilyNodeCard({
  person,
  isMainNode = false,
  onClickCard,
  onClickName,
  isExpandable = false,
  isExpanded = false,
  isRingVisible = false,
  isPlusVisible = false,
}: FamilyNodeCardProps) {
  const { showAvatar, setMemberModalId } = useDashboard();

  const content = (
    // biome-ignore lint/a11y/useKeyWithClickEvents: wrapped in button when used standalone
    // biome-ignore lint/a11y/noStaticElementInteractions: interactive wrapper handles a11y
    <div
      onClick={onClickCard}
      className={`group py-2 px-1 w-20 sm:w-24 md:w-28 flex flex-col items-center justify-start transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative bg-white/70 backdrop-blur-md rounded-2xl
        ${isMainNode && person.isDeceased ? 'grayscale-[0.4] opacity-80' : ''}
      `}
    >
      {isRingVisible && (
        <div className="absolute top-3/12 -left-2.5 sm:-left-4 size-5 sm:size-6 rounded-full shadow-sm bg-white z-20 flex items-center justify-center text-[10px] sm:text-sm">
          💍
        </div>
      )}
      {isPlusVisible && (
        <div className="absolute top-3/12 -left-2.5 sm:-left-4 size-5 sm:size-6 rounded-full shadow-sm bg-white z-20 flex items-center justify-center text-[10px] sm:text-sm">
          +
        </div>
      )}

      {isExpandable && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-stone-200/80 rounded-full size-6 flex items-center justify-center shadow-md z-20 text-stone-500 hover:text-amber-600 transition-colors">
          {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      )}

      {showAvatar && (
        <div className="relative z-10 mb-1.5 sm:mb-2">
          <div
            className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm text-white overflow-hidden shrink-0 shadow-lg ring-2 ring-white transition-transform duration-300 group-hover:scale-105
              ${
                person.gender === 'male'
                  ? 'bg-linear-to-br from-sky-400 to-sky-700'
                  : person.gender === 'female'
                    ? 'bg-linear-to-br from-rose-400 to-rose-700'
                    : 'bg-linear-to-br from-stone-400 to-stone-600'
              }`}
          >
            {person.avatarUrl ? (
              <img src={person.avatarUrl} alt={person.fullName} className="w-full h-full object-cover" />
            ) : (
              <DefaultAvatar gender={person.gender} />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-1 w-full px-0.5 sm:px-1 relative z-10">
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: wrapped in button when standalone */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: parent button handles a11y */}
        <span
          className={`text-[10px] sm:text-[11px] md:text-xs font-bold text-center leading-tight line-clamp-2 transition-colors cursor-pointer
            ${onClickName ? 'text-stone-800 group-hover:text-amber-700 hover:underline' : 'text-stone-800 group-hover:text-amber-800'}`}
          title={person.fullName}
          onClick={(e) => {
            if (onClickName) {
              e.stopPropagation();
              e.preventDefault();
              onClickName(e);
            }
          }}
        >
          {person.fullName}
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
