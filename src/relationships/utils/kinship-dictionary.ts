// Centralized Vietnamese kinship terminology dictionary.
// All kinship term strings should be referenced from here
// so there is a single place to update terminology.

// --- Atomic building blocks ---

export const GENDER_SUFFIX = {
  MALE: 'trai',
  FEMALE: 'gái',
} as const;

export const SIDE = {
  PATERNAL: 'nội',
  MATERNAL: 'ngoại',
  PATERNAL_LABEL: 'Nội',
  MATERNAL_LABEL: 'Ngoại',
} as const;

export const KINSHIP_MODIFIER = {
  COLLATERAL: 'họ',
  WIFE_SUFFIX: ' vợ',
  HUSBAND_SUFFIX: ' chồng',
} as const;

// --- Generational arrays ---

export const ANCESTORS = ['', 'Cha/Mẹ', 'Ông/Bà', 'Cụ', 'Kỵ', 'Sơ', 'Tiệm', 'Tiểu', 'Di', 'Diễn'] as const;
export const DESCENDANTS = ['', 'Con', 'Cháu', 'Chắt', 'Chít', 'Chút', 'Chét', 'Chót', 'Chẹt'] as const;

// --- Direct family ---

export const DIRECT = {
  FATHER: 'Cha',
  MOTHER: 'Mẹ',
  GRANDFATHER: 'Ông',
  GRANDMOTHER: 'Bà',
  GREAT_GRANDFATHER: 'Cụ ông',
  GREAT_GRANDMOTHER: 'Cụ bà',
} as const;

// --- Siblings ---

export const SIBLING = {
  OLDER_BROTHER: 'Anh trai',
  OLDER_SISTER: 'Chị gái',
  YOUNGER_BROTHER: 'Em trai',
  YOUNGER_SISTER: 'Em gái',
  LABEL: 'Anh chị em ruột',
} as const;

// --- Uncle / Aunt ---

export const UNCLE_AUNT = {
  BAC: 'Bác',
  CHU: 'Chú',
  CO: 'Cô',
  CAU: 'Cậu',
  DI: 'Dì',
} as const;

// --- In-law terms ---

export const IN_LAW = {
  WIFE: 'Vợ',
  HUSBAND: 'Chồng',
  SON_IN_LAW: 'Con rể',
  DAUGHTER_IN_LAW: 'Con dâu',
  GRANDCHILD_IN_LAW_MALE: 'Cháu rể',
  GRANDCHILD_IN_LAW_FEMALE: 'Cháu dâu',
  OLDER_BROTHER_IN_LAW: 'Anh rể',
  OLDER_SISTER_IN_LAW: 'Chị dâu',
  YOUNGER_BROTHER_IN_LAW: 'Em rể',
  YOUNGER_SISTER_IN_LAW: 'Em dâu',
  THIM: 'Thím',
  MO: 'Mợ',
  DUONG: 'Dượng',
  THIM_COLLATERAL: 'Thím họ',
  BROTHERS_IN_LAW: 'Anh em cột chèo',
  SISTERS_IN_LAW: 'Chị em dâu',
} as const;

// Reverse in-law term mapping: when a blood relative's term
// needs to be "flipped" to find what the in-law is called.
export const IN_LAW_REVERSE: Record<string, string> = {
  [UNCLE_AUNT.CHU]: UNCLE_AUNT.CO,
  [UNCLE_AUNT.CO]: UNCLE_AUNT.CHU,
  [UNCLE_AUNT.CAU]: UNCLE_AUNT.DI,
  [UNCLE_AUNT.DI]: UNCLE_AUNT.CAU,
  'Bà Cô': 'Ông Dượng',
  'Ông Chú': 'Bà Thím',
  'Ông Bác': 'Bà Bác',
};

// --- Collateral (họ) terms ---

export const COLLATERAL = {
  OLDER_BROTHER: 'Anh họ',
  OLDER_SISTER: 'Chị họ',
  YOUNGER: 'Em họ',
  BAC: 'Bác họ',
  CHU: 'Chú họ',
  CO: 'Cô họ',
  CAU: 'Cậu họ',
  DI: 'Dì họ',
  GRANDCHILD: 'Cháu họ',
  GRANDFATHER: 'Ông họ',
  GRANDMOTHER: 'Bà họ',
} as const;

// --- Relationship descriptions ---

export const DESCRIPTION = {
  DIRECT_LINE: 'Quan hệ Trực hệ',
  MARRIAGE: 'Quan hệ Hôn nhân',
  KINSHIP: 'Quan hệ họ hàng',
  PATERNAL_SENIOR: 'Bên Nội (Vế trên)',
  MATERNAL_SENIOR: 'Bên Ngoại (Vế trên)',
} as const;

// --- Fallbacks & special ---

export const FALLBACK = {
  DESCENDANT: 'Hậu duệ',
  ANCESTOR: 'Tiền bối',
  KIN: 'Họ hàng',
  COMMON_ANCESTOR: 'Tổ tiên chung',
  IN_CLAN: 'Người trong họ',
  STRANGER: 'Người dưng',
} as const;

// --- Template builders (for depth-based fallbacks) ---

export function ancestorDepthTerm(depth: number): string {
  return `Tổ đời ${depth}`;
}

export function descendantDepthTerm(depth: number): string {
  return `Cháu đời ${depth}`;
}
