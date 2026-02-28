import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useDashboard } from '../../dashboard/components/DashboardContext';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import type { Person, Relationship } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';

interface MindmapTreeProps {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
}

export default function MindmapTree({ personsMap, relationships, roots }: MindmapTreeProps) {
  const { showAvatar, setMemberModalId } = useDashboard();

  const getTreeData = (personId: string) => {
    const spousesList = relationships
      .filter((r) => r.type === 'marriage' && (r.personAId === personId || r.personBId === personId))
      .map((r) => {
        const spouseId = r.personAId === personId ? r.personBId : r.personAId;
        return { person: personsMap.get(spouseId) as Person, note: r.note };
      })
      .filter((s) => s.person);

    const childRels = relationships.filter((r) => (r.type === 'biological_child' || r.type === 'adopted_child') && r.personAId === personId);

    const childrenList = childRels.map((r) => personsMap.get(r.personBId)).filter(Boolean) as Person[];

    return { person: personsMap.get(personId) as Person, spouses: spousesList, children: childrenList };
  };

  function MindmapNode({ personId, level = 0, isLast = false }: { personId: string; level?: number; isLast?: boolean }) {
    const data = getTreeData(personId);
    const [isExpanded, setIsExpanded] = useState(level < 2);

    if (!data.person) return null;

    const hasChildren = data.children.length > 0;

    return (
      <div className="relative pl-6 py-1.5">
        {level > 0 && (
          <>
            <div
              className="absolute border-l-[1.5px] border-stone-300"
              style={{
                left: '0',
                top: isLast ? '-16px' : '-16px',
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
                aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isExpanded ? <ChevronDown strokeWidth={2.5} className="w-3.5 h-3.5" /> : <ChevronRight strokeWidth={2.5} className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 ring-2 ring-white" />
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`group/card relative flex flex-wrap items-center gap-2 bg-white/60 backdrop-blur-md rounded-2xl border border-stone-200/60 p-2 sm:p-2.5 shadow-sm hover:border-amber-300 hover:shadow-md hover:bg-white/90 transition-all duration-300 overflow-hidden cursor-pointer
              ${data.person.isDeceased ? 'opacity-80 grayscale-[0.3]' : ''}`}
            onClick={() => setMemberModalId(data.person.id)}
          >
            <div className="flex items-center gap-2.5 relative z-10 w-full">
              <div className="flex flex-1 items-center gap-2.5 min-w-0">
                {showAvatar && (
                  <div className="relative shrink-0">
                    <div
                      className={`size-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-white transition-transform duration-300 group-hover/card:scale-105
                      ${data.person.gender === 'male' ? 'bg-linear-to-br from-sky-400 to-sky-700' : data.person.gender === 'female' ? 'bg-linear-to-br from-rose-400 to-rose-700' : 'bg-linear-to-br from-stone-400 to-stone-600'}`}
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
                    <svg className="size-3 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" role="img" aria-label="Ngày">
                      <title>Ngày</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">
                      {formatDisplayDate(data.person.birthYear, data.person.birthMonth, data.person.birthDay)}
                      {data.person.isDeceased && ` → ${formatDisplayDate(data.person.deathYear, data.person.deathMonth, data.person.deathDay)}`}
                    </span>
                  </span>
                  {data.person.isInLaw && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-bold uppercase tracking-widest shadow-xs border ${
                          data.person.gender === 'male'
                            ? 'bg-sky-50 text-sky-700 border-sky-200/60'
                            : data.person.gender === 'female'
                              ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                              : 'bg-stone-50 text-stone-700 border-stone-200/60'
                        }`}
                      >
                        {data.person.gender === 'male' ? 'Rể' : data.person.gender === 'female' ? 'Dâu' : 'Khách'}
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
                        setMemberModalId(spouseData.person.id);
                      }}
                      className={`flex flex-col items-center gap-1 bg-stone-50/50 hover:bg-white rounded-xl p-1.5 border border-stone-200/60 hover:border-amber-300 transition-all shadow-sm hover:shadow-md group/spouse cursor-pointer
                        ${spouseData.person.isDeceased ? 'opacity-80 grayscale-[0.3]' : ''}`}
                      title={spouseData.note || (spouseData.person.gender === 'male' ? 'Chồng' : 'Vợ')}
                    >
                      {showAvatar && (
                        <div
                          className={`size-8 rounded-full overflow-hidden flex items-center justify-center text-white text-2xs font-bold shadow-sm ring-2 ring-white transition-transform duration-300 group-hover/spouse:scale-105
                          ${spouseData.person.gender === 'male' ? 'bg-linear-to-br from-sky-400 to-sky-700' : spouseData.person.gender === 'female' ? 'bg-linear-to-br from-rose-400 to-rose-700' : 'bg-linear-to-br from-stone-400 to-stone-600'}`}
                        >
                          {spouseData.person.avatarUrl ? (
                            <img src={spouseData.person.avatarUrl} alt={spouseData.person.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <DefaultAvatar gender={spouseData.person.gender} />
                          )}
                        </div>
                      )}
                      <span className="text-2xs font-bold text-stone-600 truncate max-w-[50px] text-center">{spouseData.person.fullName.split(' ').pop()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="origin-top relative z-0 mt-[-16px] pt-[16px] overflow-hidden"
            >
              <div className="pb-1">
                {data.children.map((child, index) => (
                  <MindmapNode key={child.id} personId={child.id} level={level + 1} isLast={index === data.children.length - 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (roots.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
          <Share2 className="size-8 text-stone-300" />
        </div>
        <p className="text-stone-500 font-medium tracking-wide">Gia phả trống</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-140px)] flex justify-start lg:justify-center overflow-x-auto">
      <div id="export-container" className="font-sans min-w-max pb-20 p-8">
        {roots.map((root, index) => (
          <MindmapNode key={root.id} personId={root.id} level={0} isLast={index === roots.length - 1} />
        ))}
      </div>
    </div>
  );
}
