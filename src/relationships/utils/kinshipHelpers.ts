import { type KinshipResult, type PersonNode, RelationshipType, type RelEdge } from "../types";
import {
  ANCESTORS,
  ancestorDepthTerm,
  COLLATERAL,
  DESCENDANTS,
  DESCRIPTION,
  DIRECT,
  descendantDepthTerm,
  FALLBACK,
  GENDER_SUFFIX,
  IN_LAW,
  IN_LAW_REVERSE,
  KINSHIP_MODIFIER,
  SIBLING,
  SIDE,
  UNCLE_AUNT,
} from "./kinship-dictionary";

const DEPTH_SIBLING = 1;
const DEPTH_GREAT_AUNT = 3;
const DEPTH_GREAT_GREAT_AUNT = 4;

function compareSeniority(a: PersonNode, b: PersonNode): "senior" | "junior" | "equal" {
  if (a.id === b.id) return "equal";

  if (a.birthOrder != null && b.birthOrder != null) {
    if (a.birthOrder < b.birthOrder) return "senior";
    if (a.birthOrder > b.birthOrder) return "junior";
  }

  if (a.birthYear != null && b.birthYear != null) {
    if (a.birthYear < b.birthYear) return "senior";
    if (a.birthYear > b.birthYear) return "junior";
  }

  return "equal";
}

interface GetDirectAncestorTermInput {
  depth: number;
  gender: "male" | "female" | "other";
  isPaternal: boolean;
}

function getDirectAncestorTerm({ depth, gender, isPaternal }: GetDirectAncestorTermInput): string {
  if (depth === 1) return gender === "female" ? DIRECT.MOTHER : DIRECT.FATHER;
  if (depth === 2) {
    const base = gender === "female" ? DIRECT.GRANDMOTHER : DIRECT.GRANDFATHER;
    return `${base} ${isPaternal ? SIDE.PATERNAL : SIDE.MATERNAL}`;
  }
  const title = ANCESTORS[depth] || ancestorDepthTerm(depth);
  if (depth === 3) {
    const base = gender === "female" ? DIRECT.GREAT_GRANDMOTHER : DIRECT.GREAT_GRANDFATHER;
    return `${base} ${isPaternal ? SIDE.PATERNAL : SIDE.MATERNAL}`;
  }
  return title;
}

function getDirectDescendantTerm(depth: number, gender: "male" | "female" | "other"): string {
  const base = DESCENDANTS[depth] || descendantDepthTerm(depth);
  const suffix =
    gender === "male"
      ? ` ${GENDER_SUFFIX.MALE}`
      : gender === "female"
        ? ` ${GENDER_SUFFIX.FEMALE}`
        : "";
  return base + suffix;
}

interface ResolveBloodTermsInput {
  depthA: number;
  depthB: number;
  personA: PersonNode;
  personB: PersonNode;
  pathA: PersonNode[];
  pathB: PersonNode[];
}

function resolveBloodTerms({
  depthA,
  depthB,
  personA,
  personB,
  pathA,
  pathB,
}: ResolveBloodTermsInput): [string, string, string] {
  const needsSwap =
    (depthA === DEPTH_SIBLING && depthB > DEPTH_SIBLING) ||
    (depthA > DEPTH_SIBLING && depthB > DEPTH_SIBLING && depthA < depthB);

  if (needsSwap) {
    const [bCallsA, aCallsB, desc] = resolveBloodTerms({
      depthA: depthB,
      depthB: depthA,
      personA: personB,
      personB: personA,
      pathA: pathB,
      pathB: pathA,
    });
    return [aCallsB, bCallsA, desc];
  }

  const genderA = personA.gender;
  const genderB = personB.gender;

  if (depthA === 0) {
    const firstChildOfA = pathB[pathB.length - 1];
    if (!firstChildOfA) return [FALLBACK.DESCENDANT, FALLBACK.ANCESTOR, DESCRIPTION.DIRECT_LINE];
    const isPaternal = firstChildOfA.gender === "male";
    const bCallsA = getDirectAncestorTerm({ depth: depthB, gender: genderA, isPaternal });
    const aCallsB = getDirectDescendantTerm(depthB, genderB);
    return [aCallsB, bCallsA, DESCRIPTION.DIRECT_LINE];
  }

  if (depthB === 0) {
    const firstChildOfB = pathA[pathA.length - 1];
    if (!firstChildOfB) return [FALLBACK.ANCESTOR, FALLBACK.DESCENDANT, DESCRIPTION.DIRECT_LINE];
    const isPaternal = firstChildOfB.gender === "male";
    const aCallsB = getDirectAncestorTerm({ depth: depthA, gender: genderB, isPaternal });
    const bCallsA = getDirectDescendantTerm(depthA, genderA);
    return [aCallsB, bCallsA, DESCRIPTION.DIRECT_LINE];
  }

  const branchA = pathA[pathA.length - 1];
  const branchB = pathB[pathB.length - 1];
  if (!branchA || !branchB) return [FALLBACK.KIN, FALLBACK.KIN, DESCRIPTION.KINSHIP];

  const seniority = compareSeniority(branchA, branchB);
  const isPaternalA = branchA.gender === "male";

  if (depthA === DEPTH_SIBLING && depthB === DEPTH_SIBLING) {
    const aSenior = compareSeniority(personA, personB);
    if (aSenior === "senior") {
      return [
        genderB === "female" ? SIBLING.YOUNGER_SISTER : SIBLING.YOUNGER_BROTHER,
        genderA === "female" ? SIBLING.OLDER_SISTER : SIBLING.OLDER_BROTHER,
        SIBLING.LABEL,
      ];
    }
    return [
      genderB === "female" ? SIBLING.OLDER_SISTER : SIBLING.OLDER_BROTHER,
      genderA === "female" ? SIBLING.YOUNGER_SISTER : SIBLING.YOUNGER_BROTHER,
      SIBLING.LABEL,
    ];
  }

  if (depthA > DEPTH_SIBLING && depthB === DEPTH_SIBLING) {
    let termForB = "";
    const isPaternalSide = branchA.gender === "male";

    if (isPaternalSide) {
      if (genderB === "female") {
        termForB = seniority === "junior" ? UNCLE_AUNT.BAC : UNCLE_AUNT.CO;
      } else {
        termForB = seniority === "junior" ? UNCLE_AUNT.BAC : UNCLE_AUNT.CHU;
      }
    } else {
      termForB = genderB === "female" ? UNCLE_AUNT.DI : UNCLE_AUNT.CAU;
    }

    let prefix = "";
    if (depthA === DEPTH_GREAT_AUNT)
      prefix = `${genderB === "female" ? DIRECT.GRANDMOTHER : DIRECT.GRANDFATHER} `;
    else if (depthA === DEPTH_GREAT_GREAT_AUNT)
      prefix = `${genderB === "female" ? DIRECT.GREAT_GRANDMOTHER : DIRECT.GREAT_GRANDFATHER} `;
    else if (depthA > DEPTH_GREAT_GREAT_AUNT) prefix = `${ANCESTORS[depthA - 1]} `;

    return [
      (prefix + termForB).trim(),
      getDirectDescendantTerm(depthA, genderA),
      isPaternalSide ? DESCRIPTION.PATERNAL_SENIOR : DESCRIPTION.MATERNAL_SENIOR,
    ];
  }

  if (depthA > DEPTH_SIBLING && depthB > DEPTH_SIBLING) {
    const side = isPaternalA ? SIDE.PATERNAL_LABEL : SIDE.MATERNAL_LABEL;

    if (depthA === depthB && seniority === "senior") {
      return [
        COLLATERAL.YOUNGER,
        genderA === "female" ? COLLATERAL.OLDER_SISTER : COLLATERAL.OLDER_BROTHER,
        `Anh em ${KINSHIP_MODIFIER.COLLATERAL} ${side}`,
      ];
    }
    if (depthA === depthB) {
      return [
        genderB === "female" ? COLLATERAL.OLDER_SISTER : COLLATERAL.OLDER_BROTHER,
        COLLATERAL.YOUNGER,
        `Anh em ${KINSHIP_MODIFIER.COLLATERAL} ${side}`,
      ];
    }

    const genDiff = depthA - depthB;
    let termForB: string = FALLBACK.KIN;
    if (genDiff === 1 && branchA.gender === "male") {
      if (genderB === "female") {
        termForB = seniority === "junior" ? COLLATERAL.BAC : COLLATERAL.CO;
      } else {
        termForB = seniority === "junior" ? COLLATERAL.BAC : COLLATERAL.CHU;
      }
    } else if (genDiff === 1) {
      termForB = genderB === "female" ? COLLATERAL.DI : COLLATERAL.CAU;
    } else {
      termForB = genderB === "female" ? COLLATERAL.GRANDMOTHER : COLLATERAL.GRANDFATHER;
    }
    return [termForB, COLLATERAL.GRANDCHILD, `${FALLBACK.KIN} ${side}`];
  }

  return [FALLBACK.IN_CLAN, FALLBACK.IN_CLAN, DESCRIPTION.KINSHIP];
}

const ancestryCache = new WeakMap<
  Map<string, PersonNode>,
  Map<string, Map<string, { depth: number; path: PersonNode[] }>>
>();

interface GetAncestryDataInput {
  id: string;
  parentMap: Map<string, string[]>;
  personsMap: Map<string, PersonNode>;
}

function getAncestryData({
  id,
  parentMap,
  personsMap,
}: GetAncestryDataInput): Map<string, { depth: number; path: PersonNode[] }> {
  const idCache = ancestryCache.get(personsMap);
  const cached = idCache?.get(id);
  if (cached) {
    return cached;
  }

  const depths = new Map<string, { depth: number; path: PersonNode[] }>();
  const queue: { id: string; depth: number; path: PersonNode[] }[] = [{ id, depth: 0, path: [] }];

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const { id: currentId, depth, path } = item;
    if (depths.has(currentId)) continue;
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

  const cache = idCache ?? new Map();
  cache.set(id, depths);
  if (!idCache) {
    ancestryCache.set(personsMap, cache);
  }

  return depths;
}

interface FindBloodKinshipInput {
  personA: PersonNode;
  personB: PersonNode;
  personsMap: Map<string, PersonNode>;
  parentMap: Map<string, string[]>;
}

function findBloodKinship({
  personA,
  personB,
  personsMap,
  parentMap,
}: FindBloodKinshipInput): KinshipResult | null {
  const ancA = getAncestryData({ id: personA.id, parentMap, personsMap });
  const ancB = getAncestryData({ id: personB.id, parentMap, personsMap });

  let lcaId: string | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const [id, dataA] of ancA) {
    if (!ancB.has(id)) continue;
    const dist = dataA.depth + (ancB.get(id)?.depth ?? 0);
    if (dist < minDistance) {
      minDistance = dist;
      lcaId = id;
    }
  }

  if (!lcaId) return null;

  const dataA = ancA.get(lcaId);
  const dataB = ancB.get(lcaId);
  if (!dataA || !dataB) return null;

  const [aCallsB, bCallsA, description] = resolveBloodTerms({
    depthA: dataA.depth,
    depthB: dataB.depth,
    personA,
    personB,
    pathA: dataA.path,
    pathB: dataB.path,
  });

  const lcaName = personsMap.get(lcaId)?.fullName ?? FALLBACK.COMMON_ANCESTOR;
  const pathParts: string[] = [];
  if (personA.id !== lcaId) {
    pathParts.push(`${personA.fullName} cách ${lcaName} ${dataA.depth} đời.`);
  }
  if (personB.id !== lcaId) {
    pathParts.push(`${personB.fullName} cách ${lcaName} ${dataB.depth} đời.`);
  }

  return {
    aCallsB,
    bCallsA,
    description: `${description} (${FALLBACK.COMMON_ANCESTOR}: ${lcaName})`,
    distance: minDistance,
    pathLabels: pathParts,
  };
}

interface ComputeKinshipInput {
  personA: PersonNode;
  personB: PersonNode;
  persons: PersonNode[];
  relationships: RelEdge[];
}

export function computeKinship({
  personA,
  personB,
  persons,
  relationships,
}: ComputeKinshipInput): KinshipResult | null {
  if (personA.id === personB.id) return null;

  const personsMap = new Map(persons.map((p) => [p.id, p]));
  const parentMap = new Map<string, string[]>();
  const spouseMap = new Map<string, string[]>();

  for (const r of relationships) {
    if (
      r.type === RelationshipType.enum.biological_child ||
      r.type === RelationshipType.enum.adopted_child
    ) {
      const p = parentMap.get(r.personBId) ?? [];
      p.push(r.personAId);
      parentMap.set(r.personBId, p);
    } else if (r.type === RelationshipType.enum.marriage) {
      const sA = spouseMap.get(r.personAId) ?? [];
      sA.push(r.personBId);
      spouseMap.set(r.personAId, sA);
      const sB = spouseMap.get(r.personBId) ?? [];
      sB.push(r.personAId);
      spouseMap.set(r.personBId, sB);
    }
  }

  // 0. Direct marriage
  const spousesA = spouseMap.get(personA.id) ?? [];
  if (spousesA.includes(personB.id)) {
    return {
      aCallsB: personB.gender === "female" ? IN_LAW.WIFE : IN_LAW.HUSBAND,
      bCallsA: personA.gender === "female" ? IN_LAW.WIFE : IN_LAW.HUSBAND,
      description: DESCRIPTION.MARRIAGE,
      distance: 0,
      pathLabels: [`${personA.fullName} và ${personB.fullName} là vợ chồng.`],
    };
  }

  // 1. Blood kinship
  const blood = findBloodKinship({ personA, personB, personsMap, parentMap });
  if (blood) return blood;

  // 2. Through marriage of A (A's spouse is blood-related to B)
  for (const sId of spousesA) {
    if (sId === personB.id) continue;
    const spouseA = personsMap.get(sId);
    if (!spouseA) continue;
    const res = findBloodKinship({ personA: spouseA, personB, personsMap, parentMap });
    if (res) {
      let aCallsB = res.aCallsB;
      let bCallsA = res.bCallsA;

      // A calls B (person in spouse's family)
      const suffix =
        personA.gender === "male" ? KINSHIP_MODIFIER.WIFE_SUFFIX : KINSHIP_MODIFIER.HUSBAND_SUFFIX;
      if (
        res.aCallsB === DIRECT.FATHER ||
        res.aCallsB === DIRECT.MOTHER ||
        res.aCallsB.startsWith(DIRECT.GRANDFATHER) ||
        res.aCallsB.startsWith(DIRECT.GRANDMOTHER) ||
        res.aCallsB.startsWith("Cụ")
      ) {
        aCallsB = res.aCallsB + suffix;
      } else if (res.aCallsB.includes(SIBLING.OLDER_BROTHER)) {
        aCallsB = `Anh${suffix}`;
      } else if (res.aCallsB.includes(SIBLING.OLDER_SISTER)) {
        aCallsB = `Chị${suffix}`;
      } else if (res.aCallsB === COLLATERAL.YOUNGER) {
        aCallsB = `Em${suffix} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.aCallsB === COLLATERAL.OLDER_SISTER) {
        aCallsB = `Chị${suffix} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.aCallsB === COLLATERAL.OLDER_BROTHER) {
        aCallsB = `Anh${suffix} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.aCallsB.includes("Em")) {
        aCallsB = `Em${suffix}`;
      } else if (
        (
          [UNCLE_AUNT.BAC, UNCLE_AUNT.CHU, UNCLE_AUNT.CO, UNCLE_AUNT.CAU, UNCLE_AUNT.DI] as string[]
        ).includes(res.aCallsB) ||
        res.aCallsB.endsWith(` ${KINSHIP_MODIFIER.COLLATERAL}`)
      ) {
        aCallsB = res.aCallsB.replace(` ${KINSHIP_MODIFIER.COLLATERAL}`, "") + suffix;
      }

      // B calls A (in-law of their blood relative)
      if (res.bCallsA.startsWith("Con")) {
        bCallsA = personA.gender === "male" ? IN_LAW.SON_IN_LAW : IN_LAW.DAUGHTER_IN_LAW;
      } else if (res.bCallsA.startsWith("Cháu")) {
        bCallsA =
          personA.gender === "male"
            ? IN_LAW.GRANDCHILD_IN_LAW_MALE
            : IN_LAW.GRANDCHILD_IN_LAW_FEMALE;
      } else if (
        res.bCallsA.includes(SIBLING.OLDER_BROTHER) ||
        res.bCallsA.includes(SIBLING.OLDER_SISTER)
      ) {
        bCallsA =
          personA.gender === "male" ? IN_LAW.OLDER_BROTHER_IN_LAW : IN_LAW.OLDER_SISTER_IN_LAW;
      } else if (res.bCallsA.includes("Em")) {
        bCallsA =
          personA.gender === "male" ? IN_LAW.YOUNGER_BROTHER_IN_LAW : IN_LAW.YOUNGER_SISTER_IN_LAW;
        if (res.bCallsA.includes(KINSHIP_MODIFIER.COLLATERAL))
          bCallsA += ` (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.bCallsA === COLLATERAL.OLDER_SISTER) {
        bCallsA = `${IN_LAW.OLDER_BROTHER_IN_LAW} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.bCallsA === COLLATERAL.OLDER_BROTHER) {
        bCallsA = `${IN_LAW.OLDER_SISTER_IN_LAW} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.bCallsA === COLLATERAL.CHU) {
        bCallsA = IN_LAW.THIM_COLLATERAL;
      } else if (res.bCallsA === COLLATERAL.BAC) {
        bCallsA = COLLATERAL.BAC;
      } else {
        const reverseInLaw = IN_LAW_REVERSE[res.bCallsA];
        if (reverseInLaw) {
          bCallsA = reverseInLaw;
        } else {
          bCallsA = `${personA.gender === "male" ? IN_LAW.HUSBAND : IN_LAW.WIFE} của ${res.bCallsA}`;
        }
      }

      return {
        ...res,
        aCallsB,
        bCallsA,
        description: `Thông qua hôn nhân của ${spouseA.fullName}`,
        pathLabels: [
          `${personA.fullName} là ${personA.gender === "male" ? IN_LAW.HUSBAND : IN_LAW.WIFE} của ${spouseA.fullName}`,
          ...res.pathLabels,
        ],
      };
    }
  }

  // 3. Through marriage of B (B's spouse is blood-related to A)
  const spousesB = spouseMap.get(personB.id) ?? [];
  for (const sId of spousesB) {
    const spouseB = personsMap.get(sId);
    if (!spouseB) continue;
    const res = findBloodKinship({ personA, personB: spouseB, personsMap, parentMap });
    if (res) {
      let aCallsB = res.aCallsB;
      let bCallsA = res.bCallsA;

      // A calls B (spouse of A's blood relative)
      if (res.aCallsB.startsWith("Con")) {
        aCallsB = personB.gender === "male" ? IN_LAW.SON_IN_LAW : IN_LAW.DAUGHTER_IN_LAW;
      } else if (res.aCallsB.startsWith("Cháu")) {
        aCallsB =
          personB.gender === "male"
            ? IN_LAW.GRANDCHILD_IN_LAW_MALE
            : IN_LAW.GRANDCHILD_IN_LAW_FEMALE;
      } else if (res.aCallsB.includes(SIBLING.OLDER_BROTHER)) {
        aCallsB =
          personB.gender === "female" ? IN_LAW.OLDER_SISTER_IN_LAW : IN_LAW.OLDER_BROTHER_IN_LAW;
      } else if (res.aCallsB.includes(SIBLING.OLDER_SISTER)) {
        aCallsB =
          personB.gender === "male" ? IN_LAW.OLDER_BROTHER_IN_LAW : IN_LAW.OLDER_SISTER_IN_LAW;
      } else if (res.aCallsB.includes(COLLATERAL.OLDER_SISTER)) {
        aCallsB = `${IN_LAW.OLDER_BROTHER_IN_LAW} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.aCallsB.includes(COLLATERAL.OLDER_BROTHER)) {
        aCallsB = `${IN_LAW.OLDER_SISTER_IN_LAW} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.aCallsB.includes("Em")) {
        aCallsB =
          personB.gender === "male"
            ? `${IN_LAW.YOUNGER_BROTHER_IN_LAW} (${KINSHIP_MODIFIER.COLLATERAL})`
            : `${IN_LAW.YOUNGER_SISTER_IN_LAW} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.aCallsB === COLLATERAL.CHU) {
        aCallsB = IN_LAW.THIM_COLLATERAL;
      } else {
        const reverseInLaw = IN_LAW_REVERSE[res.aCallsB];
        if (reverseInLaw) {
          aCallsB = reverseInLaw;
        } else {
          aCallsB = `${personB.gender === "male" ? IN_LAW.HUSBAND : IN_LAW.WIFE} của ${res.aCallsB}`;
        }
      }

      // B calls A (person in spouse's family)
      const suffix =
        personB.gender === "male" ? KINSHIP_MODIFIER.WIFE_SUFFIX : KINSHIP_MODIFIER.HUSBAND_SUFFIX;
      if (
        res.bCallsA === DIRECT.FATHER ||
        res.bCallsA === DIRECT.MOTHER ||
        res.bCallsA.startsWith(DIRECT.GRANDFATHER) ||
        res.bCallsA.startsWith(DIRECT.GRANDMOTHER) ||
        res.bCallsA.startsWith("Cụ")
      ) {
        bCallsA = res.bCallsA + suffix;
      } else if (res.bCallsA.includes(SIBLING.OLDER_BROTHER)) {
        bCallsA = `Anh${suffix}`;
      } else if (res.bCallsA.includes(SIBLING.OLDER_SISTER)) {
        bCallsA = `Chị${suffix}`;
      } else if (res.bCallsA === COLLATERAL.YOUNGER) {
        bCallsA = `Em${suffix} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.bCallsA === COLLATERAL.OLDER_SISTER) {
        bCallsA = `Chị${suffix} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.bCallsA === COLLATERAL.OLDER_BROTHER) {
        bCallsA = `Anh${suffix} (${KINSHIP_MODIFIER.COLLATERAL})`;
      } else if (res.bCallsA.includes("Em")) {
        bCallsA = `Em${suffix}`;
      } else if (
        (
          [UNCLE_AUNT.BAC, UNCLE_AUNT.CHU, UNCLE_AUNT.CO, UNCLE_AUNT.CAU, UNCLE_AUNT.DI] as string[]
        ).includes(res.bCallsA) ||
        res.bCallsA.endsWith(` ${KINSHIP_MODIFIER.COLLATERAL}`)
      ) {
        bCallsA = res.bCallsA + suffix;
      }

      return {
        ...res,
        aCallsB,
        bCallsA,
        description: `Thông qua hôn nhân của ${spouseB.fullName}`,
        pathLabels: [
          ...res.pathLabels,
          `${personB.fullName} là ${personB.gender === "male" ? IN_LAW.HUSBAND : IN_LAW.WIFE} của ${spouseB.fullName}`,
        ],
      };
    }
  }

  // 4. Through both spouses (A's spouse related to B's spouse)
  for (const sIdA of spousesA) {
    const spouseA = personsMap.get(sIdA);
    if (!spouseA) continue;
    for (const sIdB of spousesB) {
      if (sIdA === sIdB) continue;
      const spouseB = personsMap.get(sIdB);
      if (!spouseB) continue;

      const res = findBloodKinship({ personA: spouseA, personB: spouseB, personsMap, parentMap });
      if (res) {
        const prefixA = personA.gender === "male" ? IN_LAW.HUSBAND : IN_LAW.WIFE;
        const prefixB = personB.gender === "male" ? IN_LAW.HUSBAND : IN_LAW.WIFE;

        let aCallsB = `${prefixB} của ${res.aCallsB}`;
        let bCallsA = `${prefixA} của ${res.bCallsA}`;

        if (res.description.includes(SIBLING.LABEL)) {
          if (
            personA.gender === "male" &&
            personB.gender === "male" &&
            spouseA.gender === "female" &&
            spouseB.gender === "female"
          ) {
            aCallsB = IN_LAW.BROTHERS_IN_LAW;
            bCallsA = IN_LAW.BROTHERS_IN_LAW;
          } else if (
            personA.gender === "female" &&
            personB.gender === "female" &&
            spouseA.gender === "male" &&
            spouseB.gender === "male"
          ) {
            aCallsB = IN_LAW.SISTERS_IN_LAW;
            bCallsA = IN_LAW.SISTERS_IN_LAW;
          }
        }

        return {
          ...res,
          aCallsB,
          bCallsA,
          description: `Thông qua hôn nhân của cả ${spouseA.fullName} và ${spouseB.fullName}`,
          pathLabels: [
            `${personA.fullName} là ${prefixA} của ${spouseA.fullName}`,
            ...res.pathLabels,
            `${personB.fullName} là ${prefixB} của ${spouseB.fullName}`,
          ],
        };
      }
    }
  }

  return {
    aCallsB: FALLBACK.STRANGER,
    bCallsA: FALLBACK.STRANGER,
    description: "kinship.noRelationFound",
    distance: -1,
    pathLabels: [],
  };
}
