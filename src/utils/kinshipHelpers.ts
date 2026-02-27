import type { KinshipResult, PersonNode, RelEdge } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Compare seniority between two persons (siblings or same generation).
 * Priority: birthOrder > birthYear
 */
function compareSeniority(a: PersonNode, b: PersonNode): 'senior' | 'junior' | 'equal' {
  if (a.id === b.id) return 'equal';

  if (a.birthOrder != null && b.birthOrder != null) {
    if (a.birthOrder < b.birthOrder) return 'senior';
    if (a.birthOrder > b.birthOrder) return 'junior';
  }

  if (a.birthYear != null && b.birthYear != null) {
    if (a.birthYear < b.birthYear) return 'senior';
    if (a.birthYear > b.birthYear) return 'junior';
  }

  return 'equal';
}

// ── Vietnamese Terminology Constants ──────────────────────────────────────

const ANCESTORS = ['', 'Cha/Mẹ', 'Ông/Bà', 'Cụ', 'Kỵ', 'Sơ', 'Tiệm', 'Tiểu', 'Di', 'Diễn'];
const DESCENDANTS = ['', 'Con', 'Cháu', 'Chắt', 'Chít', 'Chút', 'Chét', 'Chót', 'Chẹt'];

function getDirectAncestorTerm(depth: number, gender: 'male' | 'female' | 'other', isPaternal: boolean): string {
  if (depth === 1) return gender === 'female' ? 'Mẹ' : 'Cha';
  if (depth === 2) {
    const base = gender === 'female' ? 'Bà' : 'Ông';
    return `${base} ${isPaternal ? 'nội' : 'ngoại'}`;
  }
  const title = ANCESTORS[depth] || `Tổ đời ${depth}`;
  if (depth === 3) {
    const base = gender === 'female' ? 'Cụ bà' : 'Cụ ông';
    return `${base} ${isPaternal ? 'nội' : 'ngoại'}`;
  }
  return title;
}

function getDirectDescendantTerm(depth: number, gender: 'male' | 'female' | 'other'): string {
  const base = DESCENDANTS[depth] || `Cháu đời ${depth}`;
  const suffix = gender === 'male' ? ' trai' : gender === 'female' ? ' gái' : '';
  return base + suffix;
}

// ── Core Algorithm ──────────────────────────────────────────────────────────

function resolveBloodTerms(
  depthA: number,
  depthB: number,
  personA: PersonNode,
  personB: PersonNode,
  pathA: PersonNode[],
  pathB: PersonNode[]
): [string, string, string] {
  const genderA = personA.gender;
  const genderB = personB.gender;

  // 1. Direct lineage (A is ancestor/descendant of B)
  if (depthA === 0) {
    const firstChildOfA = pathB[pathB.length - 1];
    if (!firstChildOfA) return ['Hậu duệ', 'Tiền bối', 'Quan hệ Trực hệ'];
    const isPaternal = firstChildOfA.gender === 'male';
    const bCallsA = getDirectAncestorTerm(depthB, genderA, isPaternal);
    const aCallsB = getDirectDescendantTerm(depthB, genderB);
    return [aCallsB, bCallsA, 'Quan hệ Trực hệ'];
  }

  if (depthB === 0) {
    const firstChildOfB = pathA[pathA.length - 1];
    if (!firstChildOfB) return ['Tiền bối', 'Hậu duệ', 'Quan hệ Trực hệ'];
    const isPaternal = firstChildOfB.gender === 'male';
    const aCallsB = getDirectAncestorTerm(depthA, genderB, isPaternal);
    const bCallsA = getDirectDescendantTerm(depthA, genderA);
    return [aCallsB, bCallsA, 'Quan hệ Trực hệ'];
  }

  // 2. Lateral relationships (siblings or cousins)
  const branchA = pathA[pathA.length - 1];
  const branchB = pathB[pathB.length - 1];
  if (!branchA || !branchB) return ['Họ hàng', 'Họ hàng', 'Quan hệ họ hàng'];

  const seniority = compareSeniority(branchA, branchB);
  const isPaternalA = branchA.gender === 'male';

  // Siblings (same parents)
  if (depthA === 1 && depthB === 1) {
    const aSenior = compareSeniority(personA, personB);
    if (aSenior === 'senior') {
      return [genderB === 'female' ? 'Em gái' : 'Em trai', genderA === 'female' ? 'Chị gái' : 'Anh trai', 'Anh chị em ruột'];
    }
    return [genderB === 'female' ? 'Chị gái' : 'Anh trai', genderA === 'female' ? 'Em gái' : 'Em trai', 'Anh chị em ruột'];
  }

  // Uncle/aunt (depthA > 1, depthB = 1)
  if (depthA > 1 && depthB === 1) {
    let termForB = '';
    const isPaternalSide = branchA.gender === 'male';

    if (isPaternalSide) {
      if (genderB === 'female') {
        termForB = 'Cô';
      } else {
        termForB = seniority === 'senior' ? 'Chú' : 'Bác';
      }
    } else {
      if (genderB === 'female') {
        termForB = 'Dì';
      } else {
        termForB = 'Cậu';
      }
    }

    let prefix = '';
    if (depthA === 3) prefix = genderB === 'female' ? 'Bà ' : 'Ông ';
    else if (depthA === 4) prefix = genderB === 'female' ? 'Cụ bà ' : 'Cụ ông ';
    else if (depthA > 4) prefix = `${ANCESTORS[depthA - 1]} `;

    return [(prefix + termForB).trim(), getDirectDescendantTerm(depthA, genderA), isPaternalSide ? 'Bên Nội (Vế trên)' : 'Bên Ngoại (Vế trên)'];
  }

  // Reverse of uncle/aunt
  if (depthA === 1 && depthB > 1) {
    const [bCallsA, aCallsB, desc] = resolveBloodTerms(depthB, depthA, personB, personA, pathB, pathA);
    return [aCallsB, bCallsA, desc];
  }

  // Cousins (both depth > 1)
  if (depthA > 1 && depthB > 1) {
    const side = isPaternalA ? 'Nội' : 'Ngoại';

    if (depthA === depthB) {
      if (seniority === 'senior') {
        return ['Em họ', genderA === 'female' ? 'Chị họ' : 'Anh họ', `Anh em họ ${side}`];
      }
      return [genderB === 'female' ? 'Chị họ' : 'Anh họ', 'Em họ', `Anh em họ ${side}`];
    }

    const genDiff = depthA - depthB;
    if (genDiff > 0) {
      let termForB = 'Họ hàng';
      if (genDiff === 1) {
        const isPaternalSide = branchA.gender === 'male';
        if (isPaternalSide) {
          termForB = genderB === 'female' ? 'Cô họ' : seniority === 'senior' ? 'Chú họ' : 'Bác họ';
        } else {
          termForB = genderB === 'female' ? 'Dì họ' : 'Cậu họ';
        }
      } else {
        termForB = genderB === 'female' ? 'Bà họ' : 'Ông họ';
      }
      return [termForB, 'Cháu họ', `Họ hàng ${side}`];
    }

    const [bCallsA, aCallsB, desc] = resolveBloodTerms(depthB, depthA, personB, personA, pathB, pathA);
    return [aCallsB, bCallsA, desc];
  }

  return ['Người trong họ', 'Người trong họ', 'Quan hệ họ hàng'];
}

// ── Data Processing ──────────────────────────────────────────────────────────

function getAncestryData(id: string, parentMap: Map<string, string[]>, personsMap: Map<string, PersonNode>) {
  const depths = new Map<string, { depth: number; path: PersonNode[] }>();
  const queue: { id: string; depth: number; path: PersonNode[] }[] = [{ id, depth: 0, path: [] }];

  while (queue.length > 0) {
    const { id: currentId, depth, path } = queue.shift()!;
    if (!depths.has(currentId)) {
      depths.set(currentId, { depth, path });

      const currentNode = personsMap.get(currentId);
      if (!currentNode) continue;

      const parents = parentMap.get(currentId) ?? [];
      for (const pId of parents) {
        const pNode = personsMap.get(pId);
        if (pNode) {
          queue.push({ id: pId, depth: depth + 1, path: [...path, currentNode] });
        }
      }
    }
  }
  return depths;
}

function findBloodKinship(
  personA: PersonNode,
  personB: PersonNode,
  personsMap: Map<string, PersonNode>,
  parentMap: Map<string, string[]>
): KinshipResult | null {
  const ancA = getAncestryData(personA.id, parentMap, personsMap);
  const ancB = getAncestryData(personB.id, parentMap, personsMap);

  let lcaId: string | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const [id, dataA] of ancA) {
    if (ancB.has(id)) {
      const dist = dataA.depth + ancB.get(id)?.depth;
      if (dist < minDistance) {
        minDistance = dist;
        lcaId = id;
      }
    }
  }

  if (!lcaId) return null;

  const dataA = ancA.get(lcaId)!;
  const dataB = ancB.get(lcaId)!;

  const [aCallsB, bCallsA, description] = resolveBloodTerms(dataA.depth, dataB.depth, personA, personB, dataA.path, dataB.path);

  const lcaName = personsMap.get(lcaId)?.fullName ?? 'Tổ tiên chung';
  const pathParts: string[] = [];
  pathParts.push(`${personA.fullName} cách ${lcaName} ${dataA.depth} đời.`);
  pathParts.push(`${personB.fullName} cách ${lcaName} ${dataB.depth} đời.`);

  return {
    aCallsB,
    bCallsA,
    description: `${description} (Tổ tiên chung: ${lcaName})`,
    distance: minDistance,
    pathLabels: pathParts,
  };
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

export function computeKinship(personA: PersonNode, personB: PersonNode, persons: PersonNode[], relationships: RelEdge[]): KinshipResult | null {
  if (personA.id === personB.id) return null;

  const personsMap = new Map(persons.map((p) => [p.id, p]));
  const parentMap = new Map<string, string[]>();
  const spouseMap = new Map<string, string[]>();

  for (const r of relationships) {
    if (r.type === 'biological_child' || r.type === 'adopted_child') {
      const p = parentMap.get(r.personBId) ?? [];
      p.push(r.personAId);
      parentMap.set(r.personBId, p);
    } else if (r.type === 'marriage') {
      const sA = spouseMap.get(r.personAId) ?? [];
      sA.push(r.personBId);
      spouseMap.set(r.personAId, sA);
      const sB = spouseMap.get(r.personBId) ?? [];
      sB.push(r.personAId);
      spouseMap.set(r.personBId, sB);
    }
  }

  // 0. Check direct marriage
  const spousesA = spouseMap.get(personA.id) ?? [];
  if (spousesA.includes(personB.id)) {
    return {
      aCallsB: personB.gender === 'female' ? 'Vợ' : 'Chồng',
      bCallsA: personA.gender === 'female' ? 'Vợ' : 'Chồng',
      description: 'Quan hệ Hôn nhân',
      distance: 0,
      pathLabels: [`${personA.fullName} và ${personB.fullName} là vợ chồng.`],
    };
  }

  // 1. Check blood kinship
  const blood = findBloodKinship(personA, personB, personsMap, parentMap);
  if (blood) return blood;

  // 2. Check via A's spouse
  for (const sId of spousesA) {
    if (sId === personB.id) continue;
    const spouseA = personsMap.get(sId);
    if (!spouseA) continue;
    const res = findBloodKinship(spouseA, personB, personsMap, parentMap);
    if (res) {
      let aCallsB = res.aCallsB;
      let bCallsA = res.bCallsA;

      if (res.bCallsA.startsWith('Con')) {
        bCallsA = personA.gender === 'male' ? 'Con rể' : 'Con dâu';
      } else if (res.bCallsA.startsWith('Cháu')) {
        bCallsA = personA.gender === 'male' ? 'Cháu rể' : 'Cháu dâu';
      } else if (res.bCallsA.includes('Anh trai')) {
        bCallsA = 'Anh rể';
      } else if (res.bCallsA.includes('Chị gái')) {
        bCallsA = 'Chị dâu';
      } else if (res.bCallsA.includes('Em')) {
        bCallsA = personA.gender === 'male' ? 'Em rể' : 'Em dâu';
      } else if (res.bCallsA === 'Chú' || res.bCallsA === 'Cậu' || res.bCallsA.includes('Dượng')) {
        bCallsA = 'Dượng';
      } else if (res.bCallsA === 'Cô' || res.bCallsA === 'Dì' || res.bCallsA.includes('Thím') || res.bCallsA.includes('Mợ')) {
        bCallsA = spouseA.gender === 'male' ? (res.bCallsA === 'Chú' ? 'Thím' : 'Mợ') : 'Dượng';
      }

      if (res.aCallsB === 'Chú') aCallsB = 'Chú';
      else if (res.aCallsB === 'Cô') aCallsB = 'Cô';
      else if (res.aCallsB === 'Cậu') aCallsB = 'Cậu';
      else if (res.aCallsB === 'Dì') aCallsB = 'Dì';

      return {
        ...res,
        aCallsB,
        bCallsA,
        description: `Thông qua hôn nhân của ${spouseA.fullName}`,
        pathLabels: [`${personA.fullName} là vợ/chồng của ${spouseA.fullName}`, ...res.pathLabels],
      };
    }
  }

  // 3. Check via B's spouse
  const spousesB = spouseMap.get(personB.id) ?? [];
  for (const sId of spousesB) {
    const spouseB = personsMap.get(sId);
    if (!spouseB) continue;
    const res = findBloodKinship(personA, spouseB, personsMap, parentMap);
    if (res) {
      let aCallsB = res.aCallsB;
      const bCallsA = res.bCallsA;

      if (res.aCallsB.startsWith('Con')) {
        aCallsB = personB.gender === 'male' ? 'Con rể' : 'Con dâu';
      } else if (res.aCallsB.startsWith('Cháu')) {
        aCallsB = personB.gender === 'male' ? 'Cháu rể' : 'Cháu dâu';
      } else if (res.aCallsB.includes('Anh trai')) {
        aCallsB = 'Anh rể';
      } else if (res.aCallsB.includes('Chị gái')) {
        aCallsB = 'Chị dâu';
      } else if (res.aCallsB.includes('Em')) {
        aCallsB = personB.gender === 'male' ? 'Em rể' : 'Em dâu';
      } else if (res.aCallsB === 'Chú' || res.aCallsB === 'Cậu') {
        aCallsB = spouseB.gender === 'male' ? 'Dượng' : res.aCallsB === 'Chú' ? 'Thím' : 'Mợ';
      }

      return {
        ...res,
        aCallsB,
        bCallsA,
        description: `Thông qua hôn nhân của ${spouseB.fullName}`,
        pathLabels: [...res.pathLabels, `${personB.fullName} là vợ/chồng của ${spouseB.fullName}`],
      };
    }
  }

  return {
    aCallsB: 'Người dưng',
    bCallsA: 'Người dưng',
    description: 'Không tìm thấy quan hệ trong phạm vi dữ liệu',
    distance: -1,
    pathLabels: [],
  };
}
