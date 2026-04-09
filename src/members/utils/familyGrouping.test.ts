import { describe, expect, it } from "vitest";

import type { Person } from "../types";

import {
  binhThiMoc,
  camThiDiu,
  dinhThiMyDuyen,
  ngoThiDiuHien,
  tanThiKheo,
  vanCongGoc,
  vanCongMoc,
  vanCongThuan,
  vanCongTri,
  vanCongVien,
  vanThiBinh,
  vanThiCam,
  vanTriMinh,
} from "../../../test/fixtures";
import {
  buildCoupleGroups,
  buildFamilyGroupedSort,
  getGroupId,
  sortFamilyMembers,
} from "./familyGrouping";

// Helper to build Maps from mock data
function buildMaps(_persons: Person[]) {
  const parentsOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();

  // Use mockRelationships to derive parents/spouses maps
  // For these tests, manually construct simple Maps from fixture data
  // Gen 2 children have Gen 1 parents
  parentsOf.set(vanCongThuan.id, [vanCongGoc.id, binhThiMoc.id]);
  parentsOf.set(vanThiBinh.id, [vanCongGoc.id, binhThiMoc.id]);
  parentsOf.set(vanCongVien.id, [vanCongGoc.id, binhThiMoc.id]);
  // Gen 3 children have Gen 2 parents
  parentsOf.set(vanCongTri.id, [vanCongThuan.id, camThiDiu.id]);
  parentsOf.set(vanThiCam.id, [vanCongThuan.id, camThiDiu.id]);
  parentsOf.set(vanCongMoc.id, [vanCongThuan.id, camThiDiu.id]);
  // Gen 4 children have Gen 3 parents
  parentsOf.set(vanTriMinh.id, [vanCongTri.id, ngoThiDiuHien.id]);

  // Spouses (marriages)
  spousesOf.set(vanCongGoc.id, [binhThiMoc.id]);
  spousesOf.set(binhThiMoc.id, [vanCongGoc.id]);
  spousesOf.set(vanCongThuan.id, [camThiDiu.id]);
  spousesOf.set(camThiDiu.id, [vanCongThuan.id]);
  spousesOf.set(vanCongTri.id, [ngoThiDiuHien.id]);
  spousesOf.set(ngoThiDiuHien.id, [vanCongTri.id]);
  spousesOf.set(vanTriMinh.id, [dinhThiMyDuyen.id]);
  spousesOf.set(dinhThiMyDuyen.id, [vanTriMinh.id]);
  spousesOf.set(vanCongVien.id, [tanThiKheo.id]);
  spousesOf.set(tanThiKheo.id, [vanCongVien.id]);

  return { parentsOf, spousesOf };
}

describe("getGroupId", () => {
  it("returns parents group when person has parents", () => {
    const { parentsOf, spousesOf } = buildMaps([]);
    const groupId = getGroupId(vanCongTri.id, parentsOf, spousesOf);
    expect(groupId).toMatch(/^parents_/);
    expect(groupId).toContain(vanCongThuan.id);
    expect(groupId).toContain(camThiDiu.id);
  });

  it("returns spouses group when person has no parents and no spouses", () => {
    const parentsOf = new Map<string, string[]>();
    const spousesOf = new Map<string, string[]>();
    const soloId = "solo-person-id";
    parentsOf.set(soloId, []); // explicitly no parents
    const groupId = getGroupId(soloId, parentsOf, spousesOf);
    expect(groupId).toMatch(/^spouses_/);
  });

  it("returns parents group when a BFS spouse has parents", () => {
    const { parentsOf, spousesOf } = buildMaps([]);
    // dinhThiMyDuyen has no parents in our map, but is married to vanTriMinh who has parents
    const groupId = getGroupId(dinhThiMyDuyen.id, parentsOf, spousesOf);
    // BFS should find vanTriMinh's parents
    expect(groupId).toMatch(/^parents_/);
    expect(groupId).toContain(vanCongTri.id);
    expect(groupId).toContain(ngoThiDiuHien.id);
  });
});

describe("buildFamilyGroupedSort", () => {
  it("groups persons by family and sorts by generation ascending", () => {
    const { parentsOf, spousesOf } = buildMaps([]);
    const allPersons = [vanCongGoc, binhThiMoc, vanCongThuan, camThiDiu, vanCongTri];
    const filtered = [vanCongTri, vanCongThuan, vanCongGoc];
    const result = buildFamilyGroupedSort(filtered, allPersons, parentsOf, spousesOf, "generation");
    expect(result.length).toBe(3);
    // Gen 1 should come first
    expect(result[0].generation).toBe(1);
    // Each entry should have _familyId
    for (const p of result) {
      expect(p._familyId).toBeDefined();
    }
  });

  it("handles members without birthOrder (null)", () => {
    const { parentsOf, spousesOf } = buildMaps([]);
    const allPersons = [vanCongTri, ngoThiDiuHien];
    const filtered = [vanCongTri, ngoThiDiuHien];
    const result = buildFamilyGroupedSort(filtered, allPersons, parentsOf, spousesOf, "generation");
    expect(result.length).toBe(2);
    // birthOrder is null for both, should not crash
  });

  it("handles all members being in-laws (no core member via !isInLaw)", () => {
    const { parentsOf, spousesOf } = buildMaps([]);
    // Only in-laws
    const allPersons = [binhThiMoc];
    const filtered = [binhThiMoc];
    const result = buildFamilyGroupedSort(filtered, allPersons, parentsOf, spousesOf, "generation");
    expect(result).toHaveLength(1);
    expect(result[0].isInLaw).toBe(true);
  });
});

describe("sortFamilyMembers", () => {
  it("sorts by birthOrder when bloodline refs differ", () => {
    const spousesOf = new Map<string, string[]>();
    const members: Person[] = [
      { ...vanCongThuan, birthOrder: 2 },
      { ...vanCongTri, birthOrder: 1 },
    ];
    const sorted = sortFamilyMembers(members, spousesOf);
    expect(sorted[0].id).toBe(vanCongTri.id); // birthOrder 1 first
    expect(sorted[1].id).toBe(vanCongThuan.id);
  });

  it("places bloodline member before in-law when same bloodline ref", () => {
    const spousesOf = new Map<string, string[]>();
    spousesOf.set(vanCongTri.id, [ngoThiDiuHien.id]);
    spousesOf.set(ngoThiDiuHien.id, [vanCongTri.id]);
    const members: Person[] = [
      { ...vanCongTri, isInLaw: false, birthYear: 1958, birthOrder: 1 },
      { ...ngoThiDiuHien, isInLaw: true, birthYear: 1961, birthOrder: null },
    ];
    const sorted = sortFamilyMembers(members, spousesOf);
    // Bloodline member first
    expect(sorted[0].id).toBe(vanCongTri.id);
    expect(sorted[1].id).toBe(ngoThiDiuHien.id);
  });

  it("sorts by birthYear when birthOrder is null for both", () => {
    const spousesOf = new Map<string, string[]>();
    const members: Person[] = [
      { ...vanCongTri, birthYear: 1960, birthOrder: null },
      { ...vanCongGoc, birthYear: 1950, birthOrder: null },
    ];
    const sorted = sortFamilyMembers(members, spousesOf);
    expect(sorted[0].id).toBe(vanCongGoc.id); // earlier birthYear first
    expect(sorted[1].id).toBe(vanCongTri.id);
  });
});

describe("buildCoupleGroups", () => {
  it("groups a single person with no spouse as single-element group", () => {
    const spousesOf = new Map<string, string[]>();
    const result = buildCoupleGroups([vanCongTri], spousesOf);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].id).toBe(vanCongTri.id);
  });

  it("groups married couples together via BFS", () => {
    const spousesOf = new Map<string, string[]>();
    spousesOf.set(vanCongTri.id, [ngoThiDiuHien.id]);
    spousesOf.set(ngoThiDiuHien.id, [vanCongTri.id]);
    const result = buildCoupleGroups([vanCongTri, ngoThiDiuHien], spousesOf);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    // Bloodline first, then in-law
    expect(result[0][0].isInLaw).toBe(false);
    expect(result[0][1].isInLaw).toBe(true);
  });

  it("separates unrelated persons into different groups", () => {
    const spousesOf = new Map<string, string[]>();
    const result = buildCoupleGroups([vanCongTri, vanCongGoc], spousesOf);
    expect(result).toHaveLength(2);
  });
});
