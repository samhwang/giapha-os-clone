import JSZip from 'jszip';
import Papa from 'papaparse';
import { describe, expect, it } from 'vitest';
import { createPerson, mockPersons, mockRelationships } from '../../../test/fixtures';
import type { Person, Relationship } from '../../types';

// JSZip in Node doesn't support Blob round-trips, so we test the CSV logic
// (Papa.unparse → zip → extract → Papa.parse) using ArrayBuffer instead.

async function exportToZipBuffer(data: { persons: Person[]; relationships: Relationship[] }): Promise<ArrayBuffer> {
  const personsCsv = Papa.unparse(data.persons);
  const relationshipsCsv = Papa.unparse(data.relationships);
  const zip = new JSZip();
  zip.file('persons.csv', personsCsv);
  zip.file('relationships.csv', relationshipsCsv);
  return zip.generateAsync({ type: 'arraybuffer' });
}

async function parseZipBuffer(buf: ArrayBuffer) {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(buf);
  const personsFile = loaded.file('persons.csv');
  const relationshipsFile = loaded.file('relationships.csv');
  if (!personsFile || !relationshipsFile) throw new Error('Invalid ZIP: missing persons.csv or relationships.csv');
  const personsCsv = await personsFile.async('text');
  const relationshipsCsv = await relationshipsFile.async('text');
  return {
    persons: Papa.parse<Partial<Person>>(personsCsv, { header: true, skipEmptyLines: true, dynamicTyping: true }).data,
    relationships: Papa.parse<Partial<Relationship>>(relationshipsCsv, { header: true, skipEmptyLines: true, dynamicTyping: true }).data,
  };
}

describe('CSV export/import via zip', () => {
  it('produces a valid zip with persons.csv and relationships.csv', async () => {
    const buf = await exportToZipBuffer({
      persons: mockPersons as Person[],
      relationships: mockRelationships as Relationship[],
    });
    expect(buf.byteLength).toBeGreaterThan(0);
  });

  it('handles empty data', async () => {
    const buf = await exportToZipBuffer({ persons: [], relationships: [] });
    expect(buf.byteLength).toBeGreaterThan(0);
  });

  it('round-trips persons and relationships', async () => {
    const persons = mockPersons as Person[];
    const relationships = mockRelationships as Relationship[];

    const buf = await exportToZipBuffer({ persons, relationships });
    const parsed = await parseZipBuffer(buf);

    expect(parsed.persons).toHaveLength(persons.length);
    expect(parsed.relationships).toHaveLength(relationships.length);
    expect(parsed.persons[0].fullName).toBe(persons[0].fullName);
    expect(parsed.relationships[0].personAId).toBe(relationships[0].personAId);
  });

  it('preserves special characters in names', async () => {
    const person = createPerson({ fullName: 'Nguyễn, Văn "Tèo"' });
    const buf = await exportToZipBuffer({ persons: [person as Person], relationships: [] });
    const parsed = await parseZipBuffer(buf);
    expect(parsed.persons[0].fullName).toBe('Nguyễn, Văn "Tèo"');
  });

  it('handles null and undefined fields in round-trip', async () => {
    const person = createPerson({ fullName: 'Test', birthYear: null, deathYear: null, note: null });
    const buf = await exportToZipBuffer({ persons: [person as Person], relationships: [] });
    const parsed = await parseZipBuffer(buf);

    expect(parsed.persons[0].fullName).toBe('Test');
    expect(parsed.persons[0].birthYear).toBeNull();
  });

  it('preserves empty arrays in round-trip', async () => {
    const buf = await exportToZipBuffer({ persons: [], relationships: [] });
    const parsed = await parseZipBuffer(buf);

    expect(parsed.persons).toHaveLength(0);
    expect(parsed.relationships).toHaveLength(0);
  });

  it('throws on invalid zip (missing files)', async () => {
    const zip = new JSZip();
    zip.file('wrong.csv', 'data');
    const buf = await zip.generateAsync({ type: 'arraybuffer' });
    await expect(parseZipBuffer(buf)).rejects.toThrow('Invalid ZIP: missing persons.csv or relationships.csv');
  });
});
