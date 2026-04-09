import type { TFunction } from 'i18next';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';

import type { Relationship } from '../../relationships/types';
import type { AdjacencyLists, TreeFilterOptions } from '../utils/treeHelpers';

import { formatDisplayDate } from '../../events/utils/dateHelpers';
import { Gender, type Person } from '../../members/types';
import Avatar from '../../ui/common/Avatar';
import { cardVariants } from '../../ui/common/Card';
import InLawBadge from '../../ui/common/InLawBadge';
import { cn } from '../../ui/utils/cn';
import { getFilteredTreeData } from '../utils/treeHelpers';

export interface ExpandSignal {
  type: 'expand' | 'collapse';
  ts: number;
}

export interface MindmapContextData {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  adj: AdjacencyLists;
  filters: TreeFilterOptions;
  showAvatar: boolean;
  hideExpandButtons: boolean;
  autoCollapseLevel: number;
  expandSignal: ExpandSignal | null;
  setMemberModalId: (id: string | null) => void;
  t: TFunction;
}

function getTreeData(personId: string, ctx: MindmapContextData) {
  return getFilteredTreeData({
    personId,
    personsMap: ctx.personsMap,
    adj: ctx.adj,
    filters: ctx.filters,
  });
}

interface MindmapNodeProps {
  personId: string;
  level?: number;
  isLast?: boolean;
  ctx: MindmapContextData;
}

export const MindmapNode = memo(function MindmapNode({ personId, level = 0, isLast = false, ctx }: MindmapNodeProps) {
  const data = getTreeData(personId, ctx);
  const [isExpanded, setIsExpanded] = useState(ctx.autoCollapseLevel > 0 ? level < ctx.autoCollapseLevel : level < 2);
  const [lastSignalTs, setLastSignalTs] = useState(0);
  const [lastCollapseLevel, setLastCollapseLevel] = useState(ctx.autoCollapseLevel);

  // React 18 supports setState during render for synchronous derived state.
  // This ensures expand/collapse signals apply before the first paint.
  if (ctx.expandSignal && ctx.expandSignal.ts !== lastSignalTs) {
    setIsExpanded(ctx.expandSignal.type === 'expand');
    setLastSignalTs(ctx.expandSignal.ts);
  }

  if (ctx.autoCollapseLevel !== lastCollapseLevel) {
    setLastCollapseLevel(ctx.autoCollapseLevel);
    if (ctx.autoCollapseLevel > 0) {
      setIsExpanded(level < ctx.autoCollapseLevel);
    }
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
            className="absolute rounded-bl-xl border-b-[1.5px] border-l-[1.5px] border-stone-300"
            style={{ left: '0', top: '24px', width: '24px', height: '24px' }}
          />
        </>
      )}

      <div className="group relative z-10 flex items-center gap-2">
        <div className="z-10 flex size-5 shrink-0 items-center justify-center bg-transparent">
          {hasChildren && !ctx.hideExpandButtons ? (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex size-5 items-center justify-center rounded border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-amber-50 hover:text-amber-600 focus:outline-none"
              aria-label={isExpanded ? ctx.t('tree.collapse') : ctx.t('tree.expand')}
            >
              {isExpanded ? <ChevronDown strokeWidth={2.5} className="h-3.5 w-3.5" /> : <ChevronRight strokeWidth={2.5} className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-stone-300 ring-2 ring-white" />
          )}
        </div>

        {/* oxlint-disable jsx-a11y/prefer-tag-over-role -- can't use <button> because spouse <button> elements are nested inside */}
        <div
          role="button"
          tabIndex={0}
          className={cn(
            cardVariants({ variant: 'glass', interactive: true }),
            'group/card relative flex animate-[fade-in_0.3s_ease-out_forwards] cursor-pointer flex-wrap items-center gap-2 p-2 sm:p-2.5',
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
          <div className="relative z-10 flex w-full items-center gap-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              {ctx.showAvatar && (
                <div className="relative shrink-0">
                  <Avatar
                    gender={data.person.gender}
                    avatarUrl={data.person.avatarUrl}
                    fullName={data.person.fullName}
                    className="size-10 text-xs font-bold shadow-md ring-2 ring-white transition-transform duration-default group-hover/card:scale-105"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="mb-0.5 truncate text-sm leading-tight font-bold text-stone-900 transition-colors group-hover/card:text-amber-700">
                  {data.person.fullName}
                </span>
                <span className="flex items-center gap-1 truncate text-xs-plus font-medium text-stone-500">
                  <svg
                    className="size-3 shrink-0 text-stone-400"
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
                    {formatDisplayDate({
                      year: data.person.birthYear,
                      month: data.person.birthMonth,
                      day: data.person.birthDay,
                      unknownLabel: ctx.t('common.unknown'),
                    })}
                    {data.person.isDeceased &&
                      ` → ${formatDisplayDate({ year: data.person.deathYear, month: data.person.deathMonth, day: data.person.deathDay, unknownLabel: ctx.t('common.unknown') })}`}
                  </span>
                </span>
                {data.person.isInLaw && (
                  <div className="mt-1.5 flex shrink-0 flex-wrap items-center gap-1">
                    <InLawBadge size="sm" gender={data.person.gender} />
                  </div>
                )}
              </div>
            </div>

            {data.spouses.length > 0 && (
              <div className="relative ml-1 flex flex-wrap gap-1.5 pl-2 before:absolute before:top-1/2 before:left-0 before:h-[70%] before:w-px before:-translate-y-1/2 before:bg-stone-200/80">
                {data.spouses.map((spouseData) => (
                  <button
                    type="button"
                    key={spouseData.person.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      ctx.setMemberModalId(spouseData.person.id);
                    }}
                    className={cn(
                      'group/spouse flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border-default bg-stone-50/50 p-1.5 shadow-sm transition-all hover:border-amber-300 hover:bg-white hover:shadow-md',
                      spouseData.person.isDeceased && 'opacity-80 grayscale-[0.3]'
                    )}
                    title={spouseData.note || (spouseData.person.gender === Gender.enum.male ? ctx.t('tree.husband') : ctx.t('tree.wife'))}
                  >
                    {ctx.showAvatar && (
                      <Avatar
                        gender={spouseData.person.gender}
                        avatarUrl={spouseData.person.avatarUrl}
                        fullName={spouseData.person.fullName}
                        className="size-8 text-2xs font-bold shadow-sm ring-2 ring-white transition-transform duration-default group-hover/spouse:scale-105"
                      />
                    )}
                    <span className="max-w-12.5 truncate text-center text-2xs font-bold text-stone-600">{spouseData.person.fullName.split(' ').pop()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="relative z-0 -mt-4 origin-top animate-[fade-in_0.3s_ease-out_forwards] overflow-hidden pt-4">
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
