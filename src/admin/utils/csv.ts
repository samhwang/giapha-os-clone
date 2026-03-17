import JSZip from 'jszip';
import Papa from 'papaparse';
import type { CustomEventExport, Person, PersonDetailsPrivateExport, Relationship } from '../../types';

export async function exportToCsvZip(data: {
  persons: Person[];
  relationships: Relationship[];
  personDetailsPrivate?: PersonDetailsPrivateExport[];
  customEvents?: CustomEventExport[];
}): Promise<Blob> {
  const zip = new JSZip();
  zip.file('persons.csv', Papa.unparse(data.persons));
  zip.file('relationships.csv', Papa.unparse(data.relationships));

  if (data.personDetailsPrivate?.length) {
    zip.file('person_details_private.csv', Papa.unparse(data.personDetailsPrivate));
  }
  if (data.customEvents?.length) {
    zip.file('custom_events.csv', Papa.unparse(data.customEvents));
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

  const personsParsed = Papa.parse<Partial<Person>>(await personsFile.async('text'), {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const relationshipsParsed = Papa.parse<Partial<Relationship>>(await relationshipsFile.async('text'), {
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
    const parsed = Papa.parse<Partial<PersonDetailsPrivateExport>>(await privateFile.async('text'), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    result.personDetailsPrivate = parsed.data;
  }

  const eventsFile = loadedZip.file('custom_events.csv');
  if (eventsFile) {
    const parsed = Papa.parse<Partial<CustomEventExport>>(await eventsFile.async('text'), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    result.customEvents = parsed.data;
  }

  return result;
}
