import { ArrowUpDown, Filter, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PersonCard from '../../members/components/PersonCard';
import { Gender, type Person } from '../../members/types';
import type { Relationship } from '../../relationships/types';
import { useDashboardStore } from '../store/dashboardStore';

interface DashboardMemberListProps {
  initialPersons: Person[];
  relationships?: Relationship[];
}

type PersonWithFamily = Person & { _familyId?: string };

export default function DashboardMemberList({ initialPersons, relationships = [] }: DashboardMemberListProps) {
  const { t } = useTranslation();
  const { setShowCreateModal } = useDashboardStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('updated_desc');
  const [filterOption, setFilterOption] = useState('all');

  const filteredPersons = initialPersons.filter((person) => {
    const matchesSearch = person.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    switch (filterOption) {
      case 'male':
        matchesFilter = person.gender === Gender.enum.male;
        break;
      case 'female':
        matchesFilter = person.gender === Gender.enum.female;
        break;
      case 'in_law_female':
        matchesFilter = person.gender === Gender.enum.female && person.isInLaw;
        break;
      case 'in_law_male':
        matchesFilter = person.gender === Gender.enum.male && person.isInLaw;
        break;
      case 'deceased':
        matchesFilter = person.isDeceased;
        break;
      case 'first_child':
        matchesFilter = person.birthOrder === 1;
        break;
      default:
        matchesFilter = true;
        break;
    }

    return matchesSearch && matchesFilter;
  });

  const { parentsOf, spousesOf } = useMemo(() => {
    const pOf = new Map<string, string[]>();
    const sOf = new Map<string, string[]>();

    for (const rel of relationships) {
      if (rel.type === 'biological_child' || rel.type === 'adopted_child') {
        if (!pOf.has(rel.personBId)) pOf.set(rel.personBId, []);
        pOf.get(rel.personBId)?.push(rel.personAId);
      } else if (rel.type === 'marriage') {
        if (!sOf.has(rel.personAId)) sOf.set(rel.personAId, []);
        if (!sOf.has(rel.personBId)) sOf.set(rel.personBId, []);
        sOf.get(rel.personAId)?.push(rel.personBId);
        sOf.get(rel.personBId)?.push(rel.personAId);
      }
    }

    return { parentsOf: pOf, spousesOf: sOf };
  }, [relationships]);

  const sortedPersons = useMemo(() => {
    if (!sortOption.includes('generation')) {
      return [...filteredPersons].sort((a, b) => {
        switch (sortOption) {
          case 'birth_asc':
            return (a.birthYear || 9999) - (b.birthYear || 9999);
          case 'birth_desc':
            return (b.birthYear || 0) - (a.birthYear || 0);
          case 'name_asc':
            return a.fullName.localeCompare(b.fullName, 'vi');
          case 'name_desc':
            return b.fullName.localeCompare(a.fullName, 'vi');
          case 'updated_desc':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          case 'updated_asc':
            return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          default:
            return 0;
        }
      });
    }

    return buildFamilyGroupedSort(filteredPersons, initialPersons, parentsOf, spousesOf, sortOption);
  }, [filteredPersons, sortOption, initialPersons, parentsOf, spousesOf]);

  const isGenerationSort = sortOption.includes('generation');

  return (
    <>
      <div className="mb-8 relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200/60 transition-all duration-300 relative z-10 w-full">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder={t('member.searchPlaceholder')}
                className="bg-white/90 text-stone-900 w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200/80 shadow-sm placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto items-center">
              <div className="relative w-full sm:w-auto">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-full sm:w-40 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                >
                  <option value="all">{t('member.filterAll')}</option>
                  <option value="male">{t('common.male')}</option>
                  <option value="female">{t('common.female')}</option>
                  <option value="in_law_female">{t('member.filterInLawFemale')}</option>
                  <option value="in_law_male">{t('member.filterInLawMale')}</option>
                  <option value="deceased">{t('member.filterDeceased')}</option>
                  <option value="first_child">{t('member.filterFirstborn')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="size-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('member.openMenu')}>
                    <title>{t('member.openMenu')}</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative w-full sm:w-auto">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                <select
                  className="appearance-none bg-white/90 text-stone-700 w-full sm:w-52 pl-9 pr-8 py-2.5 rounded-xl border border-stone-200/80 shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 hover:border-amber-300 font-medium text-sm transition-all focus:bg-white"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="birth_asc">{t('member.sortBirthAsc')}</option>
                  <option value="birth_desc">{t('member.sortBirthDesc')}</option>
                  <option value="name_asc">{t('member.sortNameAsc')}</option>
                  <option value="name_desc">{t('member.sortNameDesc')}</option>
                  <option value="updated_desc">{t('member.sortUpdatedDesc')}</option>
                  <option value="updated_asc">{t('member.sortUpdatedAsc')}</option>
                  <option value="generation_asc">{t('member.sortGenerationAsc')}</option>
                  <option value="generation_desc">{t('member.sortGenerationDesc')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="size-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label={t('member.openMenu')}>
                    <title>{t('member.openMenu')}</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="size-4" strokeWidth={2.5} />
            {t('member.addMember')}
          </button>
        </div>
      </div>

      {sortedPersons.length === 0 && (
        <div className="text-center py-12 text-stone-400 italic">{initialPersons.length > 0 ? t('member.noResults') : t('member.emptyState')}</div>
      )}

      {sortedPersons.length > 0 && isGenerationSort && (
        <GenerationGroupedList
          persons={sortedPersons}
          initialPersons={initialPersons}
          parentsOf={parentsOf}
          spousesOf={spousesOf}
          sortOption={sortOption}
          t={t}
        />
      )}

      {sortedPersons.length > 0 && !isGenerationSort && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPersons.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Family Grouping Logic ────────────────────────────────────────────────

function getGroupId(personId: string, parentsOf: Map<string, string[]>, spousesOf: Map<string, string[]>): string {
  const parents = parentsOf.get(personId) || [];
  if (parents.length > 0) return `parents_${[...parents].sort().join('_')}`;

  // BFS through marriage cluster to find a bloodline member
  const visited = new Set<string>([personId]);
  const queue = [personId];
  const cluster: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (!curr) continue;
    cluster.push(curr);
    const pts = parentsOf.get(curr);
    if (pts && pts.length > 0) return `parents_${[...pts].sort().join('_')}`;

    for (const s of spousesOf.get(curr) || []) {
      if (visited.has(s)) continue;
      visited.add(s);
      queue.push(s);
    }
  }

  return `spouses_${[...cluster].sort()[0]}`;
}

function buildFamilyGroupedSort(
  filteredPersons: Person[],
  allPersons: Person[],
  parentsOf: Map<string, string[]>,
  spousesOf: Map<string, string[]>,
  sortOption: string
): PersonWithFamily[] {
  const personMap = new Map<string, Person>();
  for (const p of allPersons) personMap.set(p.id, p);

  // Group persons into families
  const families = new Map<string, Person[]>();
  for (const p of filteredPersons) {
    const groupId = getGroupId(p.id, parentsOf, spousesOf);
    if (!families.has(groupId)) families.set(groupId, []);
    families.get(groupId)?.push(p);
  }

  // Sort families by parent birth order, then own birth order
  const getFamilyScore = (members: Person[]) => {
    const coreMember = members.find((m) => !m.isInLaw) || members[0];
    const parents = parentsOf.get(coreMember.id) || [];
    let parentBirthOrder = 999;
    if (parents.length > 0) {
      const p1 = personMap.get(parents[0]);
      if (p1) parentBirthOrder = p1.birthOrder || 999;
    }
    return { parentBirthOrder, ownBirthOrder: coreMember.birthOrder || 999, birthYear: coreMember.birthYear || 9999 };
  };

  const sortedGroups = Array.from(families.entries()).sort((a, b) => {
    const scoreA = getFamilyScore(a[1]);
    const scoreB = getFamilyScore(b[1]);
    if (scoreA.parentBirthOrder !== scoreB.parentBirthOrder) return scoreA.parentBirthOrder - scoreB.parentBirthOrder;
    if (scoreA.ownBirthOrder !== scoreB.ownBirthOrder) return scoreA.ownBirthOrder - scoreB.ownBirthOrder;
    return scoreA.birthYear - scoreB.birthYear;
  });

  // Sort within each family: bloodline first, by birth order, spouses follow their partner
  const result: PersonWithFamily[] = [];
  for (const [groupId, members] of sortedGroups) {
    const sorted = sortFamilyMembers(members, spousesOf);
    for (const m of sorted) result.push({ ...m, _familyId: groupId });
  }

  // Stable sort by generation
  result.sort((a, b) => {
    const genA = a.generation || 999;
    const genB = b.generation || 999;
    if (genA !== genB) return sortOption === 'generation_desc' ? genB - genA : genA - genB;
    return 0;
  });

  return result;
}

function sortFamilyMembers(members: Person[], spousesOf: Map<string, string[]>): Person[] {
  const getBloodlineRef = (p: Person) => {
    if (!p.isInLaw) return p;
    const spIds = spousesOf.get(p.id) || [];
    return members.find((m) => spIds.includes(m.id) && !m.isInLaw) || p;
  };

  return [...members].sort((a, b) => {
    const refA = getBloodlineRef(a);
    const refB = getBloodlineRef(b);

    if (refA.id !== refB.id) {
      if ((refA.birthOrder || 999) !== (refB.birthOrder || 999)) return (refA.birthOrder || 999) - (refB.birthOrder || 999);
      return (refA.birthYear || 9999) - (refB.birthYear || 9999);
    }

    // Same bloodline partner — bloodline member first
    if (a.isInLaw !== b.isInLaw) return a.isInLaw ? 1 : -1;
    return (a.birthYear || 9999) - (b.birthYear || 9999);
  });
}

// ─── Couple Grouping for Rendering ────────────────────────────────────────

function buildCoupleGroups(famPersons: Person[], spousesOf: Map<string, string[]>): Person[][] {
  const placed = new Set<string>();
  const groups: Person[][] = [];

  for (const p of famPersons) {
    if (placed.has(p.id)) continue;
    const group = [p];
    placed.add(p.id);

    const queue = [p.id];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) continue;
      for (const spId of spousesOf.get(curr) || []) {
        if (placed.has(spId)) continue;
        const spObj = famPersons.find((m) => m.id === spId);
        if (!spObj) continue;
        group.push(spObj);
        placed.add(spId);
        queue.push(spId);
      }
    }

    // Order: bloodline first, then in-laws
    const bloodline = group.filter((m) => !m.isInLaw).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
    const inLaws = group.filter((m) => m.isInLaw).sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
    groups.push([...bloodline, ...inLaws]);
  }

  return groups;
}

// ─── Generation Grouped Rendering ─────────────────────────────────────────

function GenerationGroupedList({
  persons,
  initialPersons,
  parentsOf,
  spousesOf,
  sortOption,
  t,
}: {
  persons: PersonWithFamily[];
  initialPersons: Person[];
  parentsOf: Map<string, string[]>;
  spousesOf: Map<string, string[]>;
  sortOption: string;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
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
  const parentNames = parents.map((p) => p.fullName).join(' & ');

  const label = parentNames ? `${t('member.childrenOf')}: ${parentNames}` : totalFamilies > 1 ? `${t('member.family')} ${familyIndex + 1}` : null;

  const coupleGroups = buildCoupleGroups(famPersons, spousesOf);

  return (
    <div className="relative bg-white border border-stone-300 rounded-[2.5rem] p-5 sm:p-8 shadow-sm">
      {label && (
        <div className="absolute -top-3 left-8 px-3 py-0.5 bg-stone-100 text-xs font-bold text-stone-600 uppercase tracking-widest border border-stone-300 rounded-full shadow-sm z-20">
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
