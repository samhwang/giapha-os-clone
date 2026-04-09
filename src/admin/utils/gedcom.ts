import { Gender, type Person } from '../../members/types';
import { type Relationship, RelationshipType } from '../../relationships/types';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function getMonthName(month: number | null): string {
  if (!month) return '';
  return MONTHS[month - 1] || '';
}

function parseMonthName(name: string): number | null {
  const idx = MONTHS.indexOf(name.toUpperCase());
  return idx !== -1 ? idx + 1 : null;
}

function formatNum(n: number | null | undefined): string {
  return n && n > 0 ? String(n).padStart(2, '0') : '';
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface ExportToGedcomInput {
  persons: Person[];
  relationships: Relationship[];
}

export function exportToGedcom(data: ExportToGedcomInput): string {
  let gedcom = '';

  // Header (GEDCOM 7.0)
  gedcom += '0 HEAD\n';
  gedcom += '1 GEDC\n';
  gedcom += '2 VERS 7.0\n';
  gedcom += '1 SOUR Giapha_OS\n';
  gedcom += '2 NAME Giapha OS\n';
  gedcom += '2 VERS 0.1.0\n';

  const personMap = new Map(data.persons.map((p) => [p.id, p]));

  // Map original IDs to short export IDs (to satisfy 20-char XREF limit)
  const exportIdMap = new Map<string, string>();
  let personCounter = 1;
  for (const person of data.persons) {
    exportIdMap.set(person.id, `I${personCounter++}`);
  }

  const getIndiXref = (id: string) => `@${exportIdMap.get(id) || id.replace(/-/g, '')}@`;

  // Pre-process Families
  let familyCounter = 1;
  const marriages = data.relationships.filter((r) => r.type === RelationshipType.enum.marriage);
  const childrenRels = data.relationships.filter((r) => r.type === RelationshipType.enum.biological_child || r.type === RelationshipType.enum.adopted_child);

  const families: { id: string; husb?: string; wife?: string; children: string[] }[] = [];

  for (const marriage of marriages) {
    const pA = personMap.get(marriage.personAId);
    const pB = personMap.get(marriage.personBId);
    if (!pA || !pB) continue;

    families.push({
      id: `F${familyCounter++}`,
      husb: pA.gender === Gender.enum.male ? pA.id : pB.gender === Gender.enum.male ? pB.id : pA.id,
      wife: pA.gender === Gender.enum.female ? pA.id : pB.gender === Gender.enum.female ? pB.id : pB.id,
      children: [],
    });
  }

  // Assign children to families
  for (const childRel of childrenRels) {
    const parentId = childRel.personAId;
    const childId = childRel.personBId;

    let fam = families.find((f) => f.husb === parentId || f.wife === parentId);
    if (!fam) {
      const parent = personMap.get(parentId);
      if (!parent) continue;
      fam = {
        id: `F${familyCounter++}`,
        husb: parent.gender === Gender.enum.male ? parentId : undefined,
        wife: parent.gender === Gender.enum.female ? parentId : undefined,
        children: [],
      };
      families.push(fam);
    }

    if (!fam.children.includes(childId)) {
      fam.children.push(childId);
    }
  }

  // Map persons to their families (for FAMC and FAMS)
  const personFamc = new Map<string, string[]>();
  const personFams = new Map<string, string[]>();

  for (const fam of families) {
    if (fam.husb) {
      const current = personFams.get(fam.husb) || [];
      if (!current.includes(fam.id)) personFams.set(fam.husb, [...current, fam.id]);
    }
    if (fam.wife) {
      const current = personFams.get(fam.wife) || [];
      if (!current.includes(fam.id)) personFams.set(fam.wife, [...current, fam.id]);
    }
    for (const childId of fam.children) {
      const current = personFamc.get(childId) || [];
      if (!current.includes(fam.id)) personFamc.set(childId, [...current, fam.id]);
    }
  }

  // Export Individuals
  for (const person of data.persons) {
    gedcom += `0 ${getIndiXref(person.id)} INDI\n`;

    // Name
    if (person.fullName) {
      const parts = person.fullName.trim().split(' ');
      const lastName = parts.length > 1 ? parts.pop() : '';
      const firstName = parts.join(' ');
      gedcom += `1 NAME ${firstName} /${lastName}/\n`;
    } else {
      gedcom += '1 NAME Unknown /Unknown/\n';
    }

    // Sex
    if (person.gender === Gender.enum.male) gedcom += '1 SEX M\n';
    else if (person.gender === Gender.enum.female) gedcom += '1 SEX F\n';
    else gedcom += '1 SEX U\n';

    // Birth
    if (person.birthYear || person.birthMonth || person.birthDay) {
      gedcom += '1 BIRT\n';
      const dateParts = [formatNum(person.birthDay), getMonthName(person.birthMonth), person.birthYear ? String(person.birthYear) : ''].filter(Boolean);
      if (dateParts.length > 0) gedcom += `2 DATE ${dateParts.join(' ')}\n`;
    }

    // Death
    if (person.isDeceased) {
      gedcom += '1 DEAT Y\n';
      if (person.deathYear || person.deathMonth || person.deathDay) {
        const dateParts = [formatNum(person.deathDay), getMonthName(person.deathMonth), person.deathYear ? String(person.deathYear) : ''].filter(Boolean);
        if (dateParts.length > 0) gedcom += `2 DATE ${dateParts.join(' ')}\n`;
      }
    }

    // Family Links
    const famcs = personFamc.get(person.id) || [];
    for (const famId of famcs) {
      gedcom += `1 FAMC @${famId}@\n`;
    }
    const famss = personFams.get(person.id) || [];
    for (const famId of famss) {
      gedcom += `1 FAMS @${famId}@\n`;
    }

    // Note
    if (person.note) {
      const lines = person.note.split('\n');
      gedcom += `1 NOTE ${lines[0]}\n`;
      for (let i = 1; i < lines.length; i++) {
        gedcom += `2 CONT ${lines[i]}\n`;
      }
    }
  }

  for (const fam of families) {
    gedcom += `0 @${fam.id}@ FAM\n`;
    if (fam.husb) gedcom += `1 HUSB ${getIndiXref(fam.husb)}\n`;
    if (fam.wife) gedcom += `1 WIFE ${getIndiXref(fam.wife)}\n`;
    for (const childId of fam.children) {
      gedcom += `1 CHIL ${getIndiXref(childId)}\n`;
    }
  }

  gedcom += '0 TRLR\n';
  return gedcom;
}

export function parseGedcom(gedcom: string): {
  persons: Partial<Person>[];
  relationships: { type: string; personAId: string; personBId: string }[];
} {
  const lines = gedcom.split(/\r?\n/).filter((line) => line.trim().length > 0);

  const persons: Partial<Person>[] = [];
  const relationships: { type: string; personAId: string; personBId: string }[] = [];
  const idMap = new Map<string, string>();

  type ParseRecord = { type: 'INDI' | 'FAM'; id: string; lines: string[] };
  const records: ParseRecord[] = [];
  let currentRecord: ParseRecord | null = null;

  for (const line of lines) {
    if (line.startsWith('0 ')) {
      if (currentRecord) records.push(currentRecord);
      const match = line.match(/^0\s+@([^@]+)@\s+(INDI|FAM)/);
      if (match) {
        currentRecord = { id: match[1], type: match[2] as 'INDI' | 'FAM', lines: [] };
      } else {
        currentRecord = null;
      }
    } else if (currentRecord) {
      currentRecord.lines.push(line.trim());
    }
  }
  if (currentRecord) records.push(currentRecord);

  // Parse Individuals
  for (const record of records.filter((r) => r.type === 'INDI')) {
    const uuid = generateUUID();
    idMap.set(record.id, uuid);

    let fullName = 'Unknown';
    let gender: Gender = Gender.enum.other;
    let isDeceased = false;
    let birthDay: number | null = null;
    let birthMonth: number | null = null;
    let birthYear: number | null = null;
    let deathDay: number | null = null;
    let deathMonth: number | null = null;
    let deathYear: number | null = null;
    let note = '';
    let currentTag = '';

    for (const line of record.lines) {
      const match = line.match(/^(\d+)\s+([A-Z0-9_]+)(?:\s+(.*))?$/);
      if (!match) continue;

      const level = Number.parseInt(match[1], 10);
      const tag = match[2];
      const val = match[3] || '';

      if (level === 1) {
        currentTag = tag;
        if (tag === 'NAME') fullName = val.replace(/\//g, '').trim();
        else if (tag === 'SEX') gender = val === 'M' ? Gender.enum.male : val === 'F' ? Gender.enum.female : Gender.enum.other;
        else if (tag === 'DEAT') isDeceased = val.trim().length === 0 || val === 'Y';
        else if (tag === 'NOTE') note = val;
      } else if (level === 2) {
        if (currentTag === 'NOTE' && tag === 'CONT') {
          note += `\n${val}`;
        } else if (tag === 'DATE') {
          const cleanVal = val.replace(/^(ABT|EST|AFT|BEF|CAL)\s+/i, '');
          const parts = cleanVal.split(' ');
          const parseDateParts = () => {
            if (parts.length === 3)
              return {
                day: Number.parseInt(parts[0], 10) || null,
                month: parseMonthName(parts[1]),
                year: Number.parseInt(parts[2], 10) || null,
              };
            if (parts.length === 2)
              return {
                day: null,
                month: parseMonthName(parts[0]),
                year: Number.parseInt(parts[1], 10) || null,
              };
            if (parts.length === 1) return { day: null, month: null, year: Number.parseInt(parts[0], 10) || null };
            return { day: null, month: null, year: null };
          };
          const dp = parseDateParts();
          if (currentTag === 'BIRT') {
            birthDay = dp.day;
            birthMonth = dp.month;
            birthYear = dp.year;
          } else if (currentTag === 'DEAT') {
            isDeceased = true;
            deathDay = dp.day;
            deathMonth = dp.month;
            deathYear = dp.year;
          }
        }
      }
    }

    persons.push({
      id: uuid,
      fullName,
      gender,
      isDeceased,
      birthDay,
      birthMonth,
      birthYear,
      deathDay,
      deathMonth,
      deathYear,
      isInLaw: false,
      birthOrder: null,
      generation: null,
      avatarUrl: null,
      note: note.length > 0 ? note : null,
    });
  }

  // Parse Families
  for (const record of records.filter((r) => r.type === 'FAM')) {
    let husb: string | null = null;
    let wife: string | null = null;
    const children: string[] = [];

    for (const line of record.lines) {
      const match = line.match(/^1\s+(HUSB|WIFE|CHIL)\s+@([^@]+)@/);
      if (!match) continue;
      const uuid = idMap.get(match[2]);
      if (!uuid) continue;
      if (match[1] === 'HUSB') husb = uuid;
      else if (match[1] === 'WIFE') wife = uuid;
      else if (match[1] === 'CHIL') children.push(uuid);
    }

    if (husb && wife && husb !== wife) {
      relationships.push({
        type: RelationshipType.enum.marriage,
        personAId: husb,
        personBId: wife,
      });
    }

    const parentA = husb || wife;
    if (parentA) {
      for (const childId of children) {
        if (parentA === childId) continue;
        relationships.push({
          type: RelationshipType.enum.biological_child,
          personAId: parentA,
          personBId: childId,
        });
      }
    }
  }

  return { persons, relationships };
}
