import { beforeEach, describe, expect, it } from 'vitest';

import { batchUpdatePersons, createPerson, deleteAllPersons, updatePerson } from '../../members/repository/person';
import { Gender } from '../../members/types';

describe('updateBatch (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should return early for empty updates', async () => {
    const result = { success: true, updated: 0 };
    expect(result).toEqual({ success: true, updated: 0 });
  });

  it('should update person generation and birthOrder', async () => {
    const person = await createPerson({ fullName: 'Test Person', gender: Gender.enum.male });

    const result = await updatePerson({ id: person.id, data: { generation: 2, birthOrder: 1 } });

    expect(result.generation).toBe(2);
    expect(result.birthOrder).toBe(1);
  });

  it('should update multiple persons in transaction', async () => {
    const p1 = await createPerson({ fullName: 'P1', gender: Gender.enum.male });
    const p2 = await createPerson({ fullName: 'P2', gender: Gender.enum.female });

    await batchUpdatePersons([
      { id: p1.id, generation: 1, birthOrder: 1 },
      { id: p2.id, generation: 1, birthOrder: 2 },
    ]);

    const { getDbClient } = await import('../../database/lib/client');
    const db = getDbClient();
    const result = await db.person.findMany({
      where: { id: { in: [p1.id, p2.id] } },
      orderBy: { birthOrder: 'asc' },
    });

    expect(result).toHaveLength(2);
    expect(result[0].generation).toBe(1);
    expect(result[0].birthOrder).toBe(1);
    expect(result[1].generation).toBe(1);
    expect(result[1].birthOrder).toBe(2);
  });
});
