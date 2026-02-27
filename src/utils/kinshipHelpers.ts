import type { KinshipResult, PersonNode, RelEdge } from '../types';

const DEPTH_SIBLING = 1;
const DEPTH_GREAT_AUNT = 3;
const DEPTH_GREAT_GREAT_AUNT = 4;

const ANCESTORS = ['', 'Cha/Mẹ', 'Ông/Bà', 'Cụ', 'Kỵ', 'Sơ', 'Tiệm', 'Tiểu', 'Di', 'Diễn'];
const DESCENDANTS = ['', 'Con', 'Cháu', 'Chắt', 'Chít', 'Chút', 'Chét', 'Chót', 'Chẹt'];

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

  const branchA = pathA[pathA.length - 1];
  const branchB = pathB[pathB.length - 1];
  if (!branchA || !branchB) return ['Họ hàng', 'Họ hàng', 'Quan hệ họ hàng'];

  const seniority = compareSeniority(branchA, branchB);
  const isPaternalA = branchA.gender === 'male';

  if (depthA === DEPTH_SIBLING && depthB === DEPTH_SIBLING) {
    const aSenior = compareSeniority(personA, personB);
    if (aSenior === 'senior') {
      return [genderB === 'female' ? 'Em gái' : 'Em trai', genderA === 'female' ? 'Chị gái' : 'Anh trai', 'Anh chị em ruột'];
    }
    return [genderB === 'female' ? 'Chị gái' : 'Anh trai', genderA === 'female' ? 'Em gái' : 'Em trai', 'Anh chị em ruột'];
  }

  if (depthA > DEPTH_SIBLING && depthB === DEPTH_SIBLING) {
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
    if (depthA === DEPTH_GREAT_AUNT) prefix = genderB === 'female' ? 'Bà ' : 'Ông ';
    else if (depthA === DEPTH_GREAT_GREAT_AUNT) prefix = genderB === 'female' ? 'Cụ bà ' : 'Cụ ông ';
    else if (depthA > DEPTH_GREAT_GREAT_AUNT) prefix = `${ANCESTORS[depthA - 1]} `;

    return [(prefix + termForB).trim(), getDirectDescendantTerm(depthA, genderA), isPaternalSide ? 'Bên Nội (Vế trên)' : 'Bên Ngoại (Vế trên)'];
  }

  if (depthA === DEPTH_SIBLING && depthB > DEPTH_SIBLING) {
    const [bCallsA, aCallsB, desc] = resolveBloodTerms(depthB, depthA, personB, personA, pathB, pathA);
    return [aCallsB, bCallsA, desc];
  }

  if (depthA > DEPTH_SIBLING && depthB > DEPTH_SIBLING) {
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

const ancestryCache = new WeakMap<Map<string, PersonNode>, Map<string, { depth: number; path: PersonNode[] }>>();

function getAncestryData(
  id: string,
  parentMap: Map<string, string[]>,
  personsMap: Map<string, PersonNode>
): Map<string, { depth: number; path: PersonNode[] }> {
  const cached = ancestryCache.get(personsMap);
  if (cached?.has(id)) {
    return cached;
  }

  const depths = new Map<string, { depth: number; path: PersonNode[] }>();
  const queue: { id: string; depth: number; path: PersonNode[] }[] = [{ id, depth: 0, path: [] }];

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { id: currentId, depth, path } = item;
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

  if (!ancestryCache.has(personsMap)) {
    ancestryCache.set(personsMap, depths);
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
      const dist = dataA.depth + (ancB.get(id)?.depth ?? 0);
      if (dist < minDistance) {
        minDistance = dist;
        lcaId = id;
      }
    }
  }

  if (!lcaId) return null;

  const dataA = ancA.get(lcaId);
  const dataB = ancB.get(lcaId);
  if (!dataA || !dataB) return null;

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

function transformByMarriage(res: KinshipResult, referrer: PersonNode, spouse: PersonNode, direction: 'a-to-b' | 'b-to-a'): KinshipResult {
  let aCallsB = res.aCallsB;
  let bCallsA = res.bCallsA;

  if (direction === 'a-to-b') {
    if (res.bCallsA.startsWith('Con')) {
      bCallsA = referrer.gender === 'male' ? 'Con rể' : 'Con dâu';
    } else if (res.bCallsA.startsWith('Cháu')) {
      bCallsA = referrer.gender === 'male' ? 'Cháu rể' : 'Cháu dâu';
    } else if (res.bCallsA.includes('Anh trai')) {
      bCallsA = 'Anh rể';
    } else if (res.bCallsA.includes('Chị gái')) {
      bCallsA = 'Chị dâu';
    } else if (res.bCallsA.includes('Em')) {
      bCallsA = referrer.gender === 'male' ? 'Em rể' : 'Em dâu';
    } else if (res.bCallsA === 'Chú' || res.bCallsA === 'Cậu' || res.bCallsA.includes('Dượng')) {
      bCallsA = 'Dượng';
    } else if (res.bCallsA === 'Cô' || res.bCallsA === 'Dì' || res.bCallsA.includes('Thím') || res.bCallsA.includes('Mợ')) {
      bCallsA = spouse.gender === 'male' ? (res.bCallsA === 'Chú' ? 'Thím' : 'Mợ') : 'Dượng';
    }

    if (res.aCallsB === 'Chú') aCallsB = 'Chú';
    else if (res.aCallsB === 'Cô') aCallsB = 'Cô';
    else if (res.aCallsB === 'Cậu') aCallsB = 'Cậu';
    else if (res.aCallsB === 'Dì') aCallsB = 'Dì';
  } else {
    if (res.aCallsB.startsWith('Con')) {
      aCallsB = referrer.gender === 'male' ? 'Con rể' : 'Con dâu';
    } else if (res.aCallsB.startsWith('Cháu')) {
      aCallsB = referrer.gender === 'male' ? 'Cháu rể' : 'Cháu dâu';
    } else if (res.aCallsB.includes('Anh trai')) {
      aCallsB = 'Anh rể';
    } else if (res.aCallsB.includes('Chị gái')) {
      aCallsB = 'Chị dâu';
    } else if (res.aCallsB.includes('Em')) {
      aCallsB = referrer.gender === 'male' ? 'Em rể' : 'Em dâu';
    } else if (res.aCallsB === 'Chú' || res.aCallsB === 'Cậu') {
      aCallsB = spouse.gender === 'male' ? 'Dượng' : res.aCallsB === 'Chú' ? 'Thím' : 'Mợ';
    }
  }

  return { ...res, aCallsB, bCallsA };
}

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

  const blood = findBloodKinship(personA, personB, personsMap, parentMap);
  if (blood) return blood;

  for (const sId of spousesA) {
    if (sId === personB.id) continue;
    const spouseA = personsMap.get(sId);
    if (!spouseA) continue;
    const res = findBloodKinship(spouseA, personB, personsMap, parentMap);
    if (res) {
      const transformed = transformByMarriage(res, personA, spouseA, 'a-to-b');
      return {
        ...transformed,
        description: `Thông qua hôn nhân của ${spouseA.fullName}`,
        pathLabels: [`${personA.fullName} là vợ/chồng của ${spouseA.fullName}`, ...res.pathLabels],
      };
    }
  }

  const spousesB = spouseMap.get(personB.id) ?? [];
  for (const sId of spousesB) {
    const spouseB = personsMap.get(sId);
    if (!spouseB) continue;
    const res = findBloodKinship(personA, spouseB, personsMap, parentMap);
    if (res) {
      const transformed = transformByMarriage(res, personB, spouseB, 'b-to-a');
      return {
        ...transformed,
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
