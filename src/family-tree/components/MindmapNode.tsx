import type { TFunction } from 'i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import { Gender, type Person } from '../../members/types';
import type { Relationship } from '../../relationships/types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { cn } from '../../ui/utils/cn';
import { getAvatarBg } from '../../ui/utils/styles';
import type { AdjacencyLists } from '../utils/treeHelpers';
import { getFilteredTreeData } from '../utils/treeHelpers';

export interface ExpandSignal {
  type: 'expand' | 'collapse';
  ts: number;
}

export interface MindmapContextData {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  adj: AdjacencyLists;
  hideDaughtersInLaw: boolean;
  hideSonsInLaw: boolean;
  hideDaughters: boolean;
  hideSons: boolean;
  hideMales: boolean;
  hideFemales: boolean;
  showAvatar: boolean;
  expandSignal: ExpandSignal | null;
  setMemberModalId: (id: string | null) => void;
  t: TFunction;
}

function getTreeData(personId: string, ctx: MindmapContextData) {
  return getFilteredTreeData(personId, ctx.personsMap, ctx.adj, {
    hideDaughtersInLaw: ctx.hideDaughtersInLaw,
    hideSonsInLaw: ctx.hideSonsInLaw,
    hideDaughters: ctx.hideDaughters,
    hideSons: ctx.hideSons,
    hideMales: ctx.hideMales,
    hideFemales: ctx.hideFemales,
  });
}

export const MindmapNode = memo(function MindmapNode({
  personId,
  level = 0,
  isLast = false,
  ctx,
}: {
  personId: string;
  level?: number;
  isLast?: boolean;
  ctx: MindmapContextData;
}) {
  const data = getTreeData(personId, ctx);
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [lastSignalTs, setLastSignalTs] = useState(0);

  if (ctx.expandSignal && ctx.expandSignal.ts !== lastSignalTs) {
    setIsExpanded(ctx.expandSignal.type === 'expand');
    setLastSignalTs(ctx.expandSignal.ts);
  }

  if (!data.person) return null;

  const hasChildren = data.children.length > 0;

  return (
    <div className={cn('relative py-1.5', level > 0 ? 'pl-6' : 'pl-0')}>
      {level > 0 && (
        <>
          <div
            className="absolute border-l-[1.5px] border-stone-300"
            style={{
              left: '0',
              top: '-16px',
              bottom: isLast ? 'auto' : '-16px',
              height: isLast ? '40px' : '100%',
            }}
          />
          <div
            className="absolute border-l-[1.5px] border-b-[1.5px] border-stone-300 rounded-bl-xl"
            style={{ left: '0', top: '24px', width: '24px', height: '24px' }}
          />
        </>
      )}

      <div className="flex items-center gap-2 group relative z-10">
        <div className="size-5 flex items-center justify-center shrink-0 z-10 bg-transparent">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="size-5 flex items-center justify-center bg-white hover:bg-amber-50 border border-stone-200 rounded shadow-sm text-stone-500 hover:text-amber-600 focus:outline-none transition-colors"
              aria-label={isExpanded ? ctx.t('tree.collapse') : ctx.t('tree.expand')}
            >
              {isExpanded ? <ChevronDown strokeWidth={2.5} className="w-3.5 h-3.5" /> : <ChevronRight strokeWidth={2.5} className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300 ring-2 ring-white" />
          )}
        </div>

        {/* biome-ignore lint/a11y/useSemanticElements: can't use <button> because spouse <button> elements are nested inside */}
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'group/card relative flex flex-wrap items-center gap-2 bg-white/60 backdrop-blur-md rounded-2xl border border-stone-200/60 p-2 sm:p-2.5 shadow-sm hover:border-amber-300 hover:shadow-md hover:bg-white/90 transition-all duration-300 overflow-hidden cursor-pointer animate-[fade-in_0.3s_ease-out_forwards]',
            data.person.isDeceased && 'opacity-80 grayscale-[0.3]'
          )}
          onClick={() => ctx.setMemberModalId(data.person.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              ctx.setMemberModalId(data.person.id);
            }
          }}
        >
          <div className="flex items-center gap-2.5 relative z-10 w-full">
            <div className="flex flex-1 items-center gap-2.5 min-w-0">
              {ctx.showAvatar && (
                <div className="relative shrink-0">
                  <div
                    className={cn(
                      'size-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white transition-transform duration-300 group-hover/card:scale-105',
                      getAvatarBg(data.person.gender)
                    )}
                  >
                    {data.person.avatarUrl ? (
                      <img src={data.person.avatarUrl} alt={data.person.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <DefaultAvatar gender={data.person.gender} />
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-sm text-stone-900 group-hover/card:text-amber-700 transition-colors leading-tight truncate mb-0.5">
                  {data.person.fullName}
                </span>
                <span className="text-xs-plus text-stone-500 font-medium truncate flex items-center gap-1">
                  <svg
                    className="size-3 text-stone-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    role="img"
                    aria-label={ctx.t('tree.dateLabel')}
                  >
                    <title>{ctx.t('tree.dateLabel')}</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="truncate">
                    {formatDisplayDate(data.person.birthYear, data.person.birthMonth, data.person.birthDay, ctx.t('common.unknown'))}
                    {data.person.isDeceased &&
                      ` → ${formatDisplayDate(data.person.deathYear, data.person.deathMonth, data.person.deathDay, ctx.t('common.unknown'))}`}
                  </span>
                </span>
                {data.person.isInLaw && (
                  <div className="flex flex-wrap items-center gap-1 mt-1.5 shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-bold uppercase tracking-widest shadow-xs border',
                        data.person.gender === Gender.enum.male && 'bg-sky-50 text-sky-700 border-sky-200/60',
                        data.person.gender === Gender.enum.female && 'bg-rose-50 text-rose-700 border-rose-200/60',
                        data.person.gender === Gender.enum.other && 'bg-stone-50 text-stone-700 border-stone-200/60'
                      )}
                    >
                      {data.person.gender === Gender.enum.male
                        ? ctx.t('member.filterInLawMale')
                        : data.person.gender === Gender.enum.female
                          ? ctx.t('member.filterInLawFemale')
                          : ctx.t('member.inLawOther')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {data.spouses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 ml-1 pl-2 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-px before:h-[70%] before:bg-stone-200/80">
                {data.spouses.map((spouseData) => (
                  <button
                    type="button"
                    key={spouseData.person.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      ctx.setMemberModalId(spouseData.person.id);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-1 bg-stone-50/50 hover:bg-white rounded-xl p-1.5 border border-stone-200/60 hover:border-amber-300 transition-all shadow-sm hover:shadow-md group/spouse cursor-pointer',
                      spouseData.person.isDeceased && 'opacity-80 grayscale-[0.3]'
                    )}
                    title={spouseData.note || (spouseData.person.gender === Gender.enum.male ? ctx.t('tree.husband') : ctx.t('tree.wife'))}
                  >
                    {ctx.showAvatar && (
                      <div
                        className={cn(
                          'size-8 rounded-full overflow-hidden flex items-center justify-center text-white text-2xs font-bold shadow-sm ring-2 ring-white transition-transform duration-300 group-hover/spouse:scale-105',
                          getAvatarBg(spouseData.person.gender)
                        )}
                      >
                        {spouseData.person.avatarUrl ? (
                          <img src={spouseData.person.avatarUrl} alt={spouseData.person.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <DefaultAvatar gender={spouseData.person.gender} />
                        )}
                      </div>
                    )}
                    <span className="text-2xs font-bold text-stone-600 truncate max-w-12.5 text-center">{spouseData.person.fullName.split(' ').pop()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="origin-top relative z-0 -mt-4 pt-4 overflow-hidden animate-[fade-in_0.3s_ease-out_forwards]">
          <div className="pb-1">
            {data.children.map((child, index) => (
              <MindmapNode key={child.id} personId={child.id} level={level + 1} isLast={index === data.children.length - 1} ctx={ctx} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
