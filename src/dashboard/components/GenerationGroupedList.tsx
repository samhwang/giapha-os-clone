import { useMemo } from 'react';
import PersonCard from '../../members/components/PersonCard';
import type { Person } from '../../members/types';
import { buildCoupleGroups, type PersonWithFamily } from '../../members/utils/familyGrouping';

interface GenerationGroupedListProps {
  persons: PersonWithFamily[];
  initialPersons: Person[];
  parentsOf: Map<string, string[]>;
  spousesOf: Map<string, string[]>;
  sortOption: string;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

export default function GenerationGroupedList({ persons, initialPersons, parentsOf, spousesOf, sortOption, t }: GenerationGroupedListProps) {
  const generationGroups = useMemo(() => {
    const groups = new Map<string, PersonWithFamily[]>();
    for (const p of persons) {
      const gen = String(p.generation ?? 0);
      if (!groups.has(gen)) groups.set(gen, []);
      groups.get(gen)?.push(p);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (sortOption === 'generation_desc') return Number(b) - Number(a);
      return Number(a) - Number(b);
    });
  }, [persons, sortOption]);

  return (
    <div className="space-y-10">
      {generationGroups.map(([gen, genPersons]) => (
        <GenerationSection key={gen} gen={gen} persons={genPersons} initialPersons={initialPersons} parentsOf={parentsOf} spousesOf={spousesOf} t={t} />
      ))}
    </div>
  );
}

function GenerationSection({
  gen,
  persons,
  initialPersons,
  parentsOf,
  spousesOf,
  t,
}: {
  gen: string;
  persons: PersonWithFamily[];
  initialPersons: Person[];
  parentsOf: Map<string, string[]>;
  spousesOf: Map<string, string[]>;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const familiesMap = useMemo(() => {
    const map = new Map<string, PersonWithFamily[]>();
    for (const p of persons) {
      const fid = p._familyId || 'unknown';
      if (!map.has(fid)) map.set(fid, []);
      map.get(fid)?.push(p);
    }
    return map;
  }, [persons]);

  const families = Array.from(familiesMap.values());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200" />
        <h3 className="text-lg font-serif font-bold text-amber-800 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200/50 shadow-sm">
          {gen === '0' ? t('member.unknownGeneration') : t('stats.generationLabel', { gen })}
        </h3>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <div className="space-y-12">
        {families.map((famPersons, idx) => (
          <FamilyGroup
            key={famPersons[0]?.id ?? `fam-${idx}`}
            famPersons={famPersons}
            initialPersons={initialPersons}
            parentsOf={parentsOf}
            spousesOf={spousesOf}
            totalFamilies={families.length}
            familyIndex={idx}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

function FamilyGroup({
  famPersons,
  initialPersons,
  parentsOf,
  spousesOf,
  totalFamilies,
  familyIndex,
  t,
}: {
  famPersons: Person[];
  initialPersons: Person[];
  parentsOf: Map<string, string[]>;
  spousesOf: Map<string, string[]>;
  totalFamilies: number;
  familyIndex: number;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const firstBloodline = famPersons.find((p) => !p.isInLaw) || famPersons[0];
  const parentIds = parentsOf.get(firstBloodline.id) || [];
  const parents = parentIds.map((id) => initialPersons.find((p) => p.id === id)).filter(Boolean) as Person[];
  const parentNames = parents.map((p) => p.fullName.trim().split(' ').splice(-2).join(' ')).join(' & ');

  const label = parentNames ? `${t('member.childrenOf')}: ${parentNames}` : totalFamilies > 1 ? `${t('member.family')} ${familyIndex + 1}` : null;

  const coupleGroups = buildCoupleGroups(famPersons, spousesOf);

  return (
    <div className="relative bg-white border border-stone-300 rounded-[2.5rem] p-5 sm:p-8 shadow-sm">
      {label && (
        <div className="absolute -top-3 left-8 px-3 py-0.5 bg-stone-100 text-xs font-bold text-stone-600 tracking-widest border border-stone-300 rounded-full shadow-sm z-20">
          {label}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {coupleGroups.map((group) => (
          <CoupleGroup key={group[0]?.id ?? 'empty'} group={group} />
        ))}
      </div>
    </div>
  );
}

function CoupleGroup({ group }: { group: Person[] }) {
  const isCouple = group.length > 1;
  const colSpanClass = group.length === 2 ? 'md:col-span-2' : group.length >= 3 ? 'md:col-span-2 lg:col-span-3' : 'col-span-1';
  const innerGridClass = group.length === 2 ? 'grid-cols-2' : group.length >= 3 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1';

  return (
    <div className={`relative ${colSpanClass}`}>
      {isCouple && (
        <>
          <div className="hidden sm:block absolute -inset-3 lg:-inset-4 bg-amber-50/70 border border-amber-200/80 rounded-4xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] z-0" />
          <div className="sm:hidden absolute -inset-2 bg-amber-50/70 border border-amber-200/80 rounded-3xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] z-0" />
        </>
      )}
      <div className={`relative z-10 grid grid-cols-1 ${innerGridClass} gap-y-6 lg:gap-x-6 h-full`}>
        {group.map((person, pIdx) => (
          <div key={person.id} className="relative h-full flex flex-col">
            <PersonCard person={person} />
            {isCouple && pIdx < group.length - 1 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-amber-300 z-10 translate-x-1/2" />}
            {isCouple && pIdx < group.length - 1 && <div className="md:hidden absolute -bottom-6 left-1/2 w-0.5 h-6 bg-amber-300 z-10 -translate-x-1/2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
