import JSZip from 'jszip';
import Papa from 'papaparse';
import type { Person, Relationship } from '../../types';

export async function exportToCsvZip(data: { persons: Person[]; relationships: Relationship[] }): Promise<Blob> {
  const personsCsv = Papa.unparse(data.persons);
  const relationshipsCsv = Papa.unparse(data.relationships);

  const zip = new JSZip();
  zip.file('persons.csv', personsCsv);
  zip.file('relationships.csv', relationshipsCsv);

  return zip.generateAsync({ type: 'blob' });
}

export async function parseCsvZip(zipBlob: Blob): Promise<{
  persons: Partial<Person>[];
  relationships: Partial<Relationship>[];
}> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipBlob);

  const personsFile = loadedZip.file('persons.csv');
  const relationshipsFile = loadedZip.file('relationships.csv');

  if (!personsFile || !relationshipsFile) {
    throw new Error('Invalid ZIP: missing persons.csv or relationships.csv');
  }

  const personsCsvStr = await personsFile.async('text');
  const relationshipsCsvStr = await relationshipsFile.async('text');

  const personsParsed = Papa.parse<Partial<Person>>(personsCsvStr, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const relationshipsParsed = Papa.parse<Partial<Relationship>>(relationshipsCsvStr, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return {
    persons: personsParsed.data,
    relationships: relationshipsParsed.data,
  };
}
