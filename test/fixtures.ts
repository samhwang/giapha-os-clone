import type { UserProfile } from "../src/admin/types";

import { UserRole } from "../src/auth/types";
import { Gender, type Person } from "../src/members/types";
import { type Relationship, RelationshipType } from "../src/relationships/types";

// ============================================================
// Builder functions
// ============================================================

const now = new Date("2025-01-01T00:00:00Z");

export function createPerson(overrides: Partial<Person> = {}): Person {
  return {
    id: crypto.randomUUID(),
    fullName: "Test Person",
    gender: Gender.enum.male,
    birthYear: 1990,
    birthMonth: 1,
    birthDay: 1,
    deathYear: null,
    deathMonth: null,
    deathDay: null,
    deathLunarYear: null,
    deathLunarMonth: null,
    deathLunarDay: null,
    isDeceased: false,
    isInLaw: false,
    generation: 1,
    birthOrder: null,
    otherNames: null,
    avatarUrl: null,
    note: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createRelationship(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: crypto.randomUUID(),
    type: RelationshipType.enum.biological_child,
    personAId: "",
    personBId: "",
    note: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function createUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: crypto.randomUUID(),
    email: "test@example.com",
    name: "Test User",
    role: UserRole.enum.member,
    isActive: true,
    timeZone: "UTC",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================================
// Seed-based fixtures (Vạn family — 4 generations)
// ============================================================

// Generation 1 — Ancestors
export const vanCongGoc = createPerson({
  id: "10000000-0000-0000-0000-000000000001",
  fullName: "Vạn Công Gốc",
  gender: Gender.enum.male,
  birthYear: 1902,
  birthMonth: 3,
  birthDay: 15,
  deathYear: 1975,
  deathMonth: 8,
  deathDay: 22,
  isDeceased: true,
  generation: 1,
});

export const binhThiMoc = createPerson({
  id: "10000000-0000-0000-0000-000000000002",
  fullName: "Bình Thị Mộc",
  gender: Gender.enum.female,
  birthYear: 1908,
  birthMonth: 6,
  birthDay: 10,
  deathYear: 1980,
  deathMonth: 1,
  deathDay: 5,
  isDeceased: true,
  isInLaw: true,
  generation: 1,
});

// Generation 2 — Grandparents
export const vanCongThuan = createPerson({
  id: "20000000-0000-0000-0000-000000000001",
  fullName: "Vạn Công Thuận",
  gender: Gender.enum.male,
  birthYear: 1930,
  birthMonth: 2,
  birthDay: 4,
  deathYear: 2008,
  deathMonth: 11,
  deathDay: 30,
  isDeceased: true,
  generation: 2,
  birthOrder: 1,
});

export const camThiDiu = createPerson({
  id: "20000000-0000-0000-0000-000000000002",
  fullName: "Cam Thị Dịu",
  gender: Gender.enum.female,
  birthYear: 1934,
  birthMonth: 9,
  birthDay: 20,
  deathYear: 2012,
  deathMonth: 4,
  deathDay: 14,
  isDeceased: true,
  isInLaw: true,
  generation: 2,
});

export const vanThiBinh = createPerson({
  id: "20000000-0000-0000-0000-000000000003",
  fullName: "Vạn Thị Bình",
  gender: Gender.enum.female,
  birthYear: 1935,
  birthMonth: 7,
  birthDay: 7,
  isDeceased: false,
  generation: 2,
  birthOrder: 2,
});

export const vanCongVien = createPerson({
  id: "20000000-0000-0000-0000-000000000004",
  fullName: "Vạn Công Viễn",
  gender: Gender.enum.male,
  birthYear: 1942,
  birthMonth: 12,
  birthDay: 1,
  isDeceased: false,
  generation: 2,
  birthOrder: 3,
});

export const tanThiKheo = createPerson({
  id: "20000000-0000-0000-0000-000000000005",
  fullName: "Tân Thị Khéo",
  gender: Gender.enum.female,
  birthYear: 1945,
  birthMonth: 3,
  birthDay: 8,
  isDeceased: false,
  isInLaw: true,
  generation: 2,
});

// Generation 3 — Parents/uncles/aunts
export const vanCongTri = createPerson({
  id: "30000000-0000-0000-0000-000000000001",
  fullName: "Vạn Công Trí",
  gender: Gender.enum.male,
  birthYear: 1958,
  birthMonth: 4,
  birthDay: 12,
  generation: 3,
  birthOrder: 1,
});

export const ngoThiDiuHien = createPerson({
  id: "30000000-0000-0000-0000-000000000002",
  fullName: "Ngô Thị Dịu Hiền",
  gender: Gender.enum.female,
  birthYear: 1961,
  birthMonth: 8,
  birthDay: 25,
  isInLaw: true,
  generation: 3,
});

export const vanThiCam = createPerson({
  id: "30000000-0000-0000-0000-000000000003",
  fullName: "Vạn Thị Cẩm",
  gender: Gender.enum.female,
  birthYear: 1962,
  birthMonth: 11,
  birthDay: 3,
  generation: 3,
  birthOrder: 2,
});

export const vanCongMoc = createPerson({
  id: "30000000-0000-0000-0000-000000000005",
  fullName: "Vạn Công Mộc",
  gender: Gender.enum.male,
  birthYear: 1967,
  birthMonth: 6,
  birthDay: 20,
  generation: 3,
  birthOrder: 3,
});

// Generation 4 — Grandchildren
export const vanTriMinh = createPerson({
  id: "40000000-0000-0000-0000-000000000001",
  fullName: "Vạn Trí Minh",
  gender: Gender.enum.male,
  birthYear: 1989,
  birthMonth: 3,
  birthDay: 14,
  generation: 4,
  birthOrder: 1,
});

export const dinhThiMyDuyen = createPerson({
  id: "40000000-0000-0000-0000-000000000002",
  fullName: "Đinh Thị Mỹ Duyên",
  gender: Gender.enum.female,
  birthYear: 1991,
  birthMonth: 7,
  birthDay: 8,
  isInLaw: true,
  generation: 4,
});

// ============================================================
// Collections
// ============================================================

export const mockPersons: Person[] = [
  vanCongGoc,
  binhThiMoc,
  vanCongThuan,
  camThiDiu,
  vanThiBinh,
  vanCongVien,
  tanThiKheo,
  vanCongTri,
  ngoThiDiuHien,
  vanThiCam,
  vanCongMoc,
  vanTriMinh,
  dinhThiMyDuyen,
];

export const mockRelationships: Relationship[] = [
  // Gen 1 marriage
  createRelationship({
    id: "rel-001",
    type: RelationshipType.enum.marriage,
    personAId: vanCongGoc.id,
    personBId: binhThiMoc.id,
  }),
  // Gen 1 → Gen 2
  createRelationship({
    id: "rel-002",
    type: RelationshipType.enum.biological_child,
    personAId: vanCongGoc.id,
    personBId: vanCongThuan.id,
  }),
  createRelationship({
    id: "rel-003",
    type: RelationshipType.enum.biological_child,
    personAId: binhThiMoc.id,
    personBId: vanCongThuan.id,
  }),
  createRelationship({
    id: "rel-004",
    type: RelationshipType.enum.biological_child,
    personAId: vanCongGoc.id,
    personBId: vanThiBinh.id,
  }),
  createRelationship({
    id: "rel-005",
    type: RelationshipType.enum.biological_child,
    personAId: binhThiMoc.id,
    personBId: vanThiBinh.id,
  }),
  createRelationship({
    id: "rel-006",
    type: RelationshipType.enum.biological_child,
    personAId: vanCongGoc.id,
    personBId: vanCongVien.id,
  }),
  createRelationship({
    id: "rel-007",
    type: RelationshipType.enum.biological_child,
    personAId: binhThiMoc.id,
    personBId: vanCongVien.id,
  }),
  // Gen 2 marriages
  createRelationship({
    id: "rel-008",
    type: RelationshipType.enum.marriage,
    personAId: vanCongThuan.id,
    personBId: camThiDiu.id,
  }),
  createRelationship({
    id: "rel-009",
    type: RelationshipType.enum.marriage,
    personAId: vanCongVien.id,
    personBId: tanThiKheo.id,
  }),
  // Gen 2 → Gen 3
  createRelationship({
    id: "rel-010",
    type: RelationshipType.enum.biological_child,
    personAId: vanCongThuan.id,
    personBId: vanCongTri.id,
  }),
  createRelationship({
    id: "rel-011",
    type: RelationshipType.enum.biological_child,
    personAId: camThiDiu.id,
    personBId: vanCongTri.id,
  }),
  createRelationship({
    id: "rel-012",
    type: RelationshipType.enum.biological_child,
    personAId: vanCongThuan.id,
    personBId: vanThiCam.id,
  }),
  createRelationship({
    id: "rel-013",
    type: RelationshipType.enum.biological_child,
    personAId: camThiDiu.id,
    personBId: vanThiCam.id,
  }),
  createRelationship({
    id: "rel-014",
    type: RelationshipType.enum.biological_child,
    personAId: vanCongThuan.id,
    personBId: vanCongMoc.id,
  }),
  createRelationship({
    id: "rel-015",
    type: RelationshipType.enum.biological_child,
    personAId: camThiDiu.id,
    personBId: vanCongMoc.id,
  }),
  // Gen 3 marriage
  createRelationship({
    id: "rel-016",
    type: RelationshipType.enum.marriage,
    personAId: vanCongTri.id,
    personBId: ngoThiDiuHien.id,
  }),
  // Gen 3 → Gen 4
  createRelationship({
    id: "rel-017",
    type: RelationshipType.enum.biological_child,
    personAId: vanCongTri.id,
    personBId: vanTriMinh.id,
  }),
  createRelationship({
    id: "rel-018",
    type: RelationshipType.enum.biological_child,
    personAId: ngoThiDiuHien.id,
    personBId: vanTriMinh.id,
  }),
  // Gen 4 marriage
  createRelationship({
    id: "rel-019",
    type: RelationshipType.enum.marriage,
    personAId: vanTriMinh.id,
    personBId: dinhThiMyDuyen.id,
  }),
];

// ============================================================
// Mock users
// ============================================================

export const mockAdminUser = createUser({
  id: "user-admin-001",
  email: "admin@giapha.local",
  name: "Admin User",
  role: UserRole.enum.admin,
  isActive: true,
});

export const mockMemberUser = createUser({
  id: "user-member-001",
  email: "member@giapha.local",
  name: "Member User",
  role: UserRole.enum.member,
  isActive: true,
});

export const mockInactiveUser = createUser({
  id: "user-inactive-001",
  email: "inactive@giapha.local",
  name: "Inactive User",
  role: UserRole.enum.member,
  isActive: false,
});
