import JSZip from 'jszip';
import Papa from 'papaparse';

import type { Person } from '../../members/types';
import type { Relationship } from '../../relationships/types';
import type { CustomEventExport, PersonDetailsPrivateExport } from '../types';

export const UTF8_BOM = '\uFEFF';

function stripBom(text: string): string {
  return text.startsWith(UTF8_BOM) ? text.slice(1) : text;
}

export async function exportToCsvZip(data: {
  persons: Person[];
  relationships: Relationship[];
  personDetailsPrivate?: PersonDetailsPrivateExport[];
  customEvents?: CustomEventExport[];
}): Promise<Blob> {
  const zip = new JSZip();
  zip.file('persons.csv', UTF8_BOM + Papa.unparse(data.persons));
  zip.file('relationships.csv', UTF8_BOM + Papa.unparse(data.relationships));

  if (data.personDetailsPrivate?.length) {
    zip.file('person_details_private.csv', UTF8_BOM + Papa.unparse(data.personDetailsPrivate));
  }
  if (data.customEvents?.length) {
    zip.file('custom_events.csv', UTF8_BOM + Papa.unparse(data.customEvents));
  }

  return zip.generateAsync({ type: 'blob' });
}

export async function parseCsvZip(zipBlob: Blob): Promise<{
  persons: Partial<Person>[];
  relationships: Partial<Relationship>[];
  personDetailsPrivate?: Partial<PersonDetailsPrivateExport>[];
  customEvents?: Partial<CustomEventExport>[];
}> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipBlob);

  const personsFile = loadedZip.file('persons.csv');
  const relationshipsFile = loadedZip.file('relationships.csv');

  if (!personsFile || !relationshipsFile) {
    throw new Error('Invalid ZIP: missing persons.csv or relationships.csv');
  }

  const personsCsvRaw = await personsFile.async('text');
  const relationshipsCsvRaw = await relationshipsFile.async('text');

  const personsParsed = Papa.parse<Partial<Person>>(stripBom(personsCsvRaw), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const relationshipsParsed = Papa.parse<Partial<Relationship>>(stripBom(relationshipsCsvRaw), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const result: {
    persons: Partial<Person>[];
    relationships: Partial<Relationship>[];
    personDetailsPrivate?: Partial<PersonDetailsPrivateExport>[];
    customEvents?: Partial<CustomEventExport>[];
  } = {
    persons: personsParsed.data,
    relationships: relationshipsParsed.data,
  };

  const privateFile = loadedZip.file('person_details_private.csv');
  if (privateFile) {
    const parsed = Papa.parse<Partial<PersonDetailsPrivateExport>>(stripBom(await privateFile.async('text')), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    result.personDetailsPrivate = parsed.data;
  }

  const eventsFile = loadedZip.file('custom_events.csv');
  if (eventsFile) {
    const parsed = Papa.parse<Partial<CustomEventExport>>(stripBom(await eventsFile.async('text')), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    result.customEvents = parsed.data;
  }

  return result;
}
