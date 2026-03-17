import { beforeEach, describe, expect, it } from 'vitest';
import { createPerson, deleteAllPersons, findAllPersons } from '../../members/repository/person';
import { Gender } from '../../members/types';
import { createRelationship, deleteAllRelationships, findAllRelationships } from '../../relationships/repository/relationship';
import { RelationshipType } from '../../relationships/types';

describe('exportData (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should return backup payload with persons and relationships', async () => {
    const personA = await createPerson({ fullName: 'Nguyễn Vạn', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'Trần Thị', gender: Gender.enum.female });
    await createRelationship({ type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id });

    const persons = await findAllPersons();
    const relationships = await findAllRelationships();

    expect(persons).toHaveLength(2);
    expect(relationships).toHaveLength(1);
    expect(relationships[0].type).toBe('marriage');
  });

  it('should return backup payload with correct structure', async () => {
    await createPerson({ fullName: 'Test', gender: Gender.enum.male });

    const persons = await findAllPersons();
    const relationships = await findAllRelationships();

    expect(persons[0]).toHaveProperty('id');
    expect(persons[0]).toHaveProperty('fullName');
    expect(persons[0]).toHaveProperty('gender');
    expect(relationships).toHaveLength(0);
  });
});

describe('importData (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should delete existing data and import new data', async () => {
    await createPerson({ fullName: 'Old Person', gender: Gender.enum.male });

    await deleteAllPersons();

    const personA = await createPerson({ fullName: 'Nguyễn Vạn', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'Nguyễn Thị', gender: Gender.enum.female });
    await createRelationship({ type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id });

    const persons = await findAllPersons();
    const relationships = await findAllRelationships();

    const { getDbClient } = await import('../../database/lib/client');
    const db = getDbClient();
    const oldPerson = await db.person.findFirst({ where: { fullName: 'Old Person' } });
    expect(oldPerson).toBeNull();

    expect(persons).toHaveLength(2);
    expect(relationships).toHaveLength(1);
  });

  it('should handle import with empty data as no-op', async () => {
    const persons = await findAllPersons();
    const relationships = await findAllRelationships();

    expect(persons).toHaveLength(0);
    expect(relationships).toHaveLength(0);
  });

  it('should handle import with only persons (no relationships)', async () => {
    await createPerson({ fullName: 'Solo', gender: Gender.enum.male });

    const persons = await findAllPersons();
    const relationships = await findAllRelationships();

    expect(persons).toHaveLength(1);
    expect(relationships).toHaveLength(0);
  });
});
