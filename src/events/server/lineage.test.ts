import { beforeEach, describe, expect, it } from 'vitest';
import { getDbClient } from '../../lib/db';
import { Gender } from '../../types';

const db = getDbClient();

describe('updateBatch (inner logic)', () => {
  beforeEach(async () => {
    await db.person.deleteMany({});
  });

  it('should return early for empty updates', async () => {
    const result = { success: true, updated: 0 };
    expect(result).toEqual({ success: true, updated: 0 });
  });

  it('should update person generation and birthOrder', async () => {
    const person = await db.person.create({
      data: { fullName: 'Test Person', gender: Gender.enum.male },
    });

    const result = await db.person.update({
      where: { id: person.id },
      data: { generation: 2, birthOrder: 1 },
    });

    expect(result.generation).toBe(2);
    expect(result.birthOrder).toBe(1);
  });

  it('should update multiple persons in transaction', async () => {
    const p1 = await db.person.create({ data: { fullName: 'P1', gender: Gender.enum.male } });
    const p2 = await db.person.create({ data: { fullName: 'P2', gender: Gender.enum.female } });

    await db.$transaction([
      db.person.update({ where: { id: p1.id }, data: { generation: 1, birthOrder: 1 } }),
      db.person.update({ where: { id: p2.id }, data: { generation: 1, birthOrder: 2 } }),
    ]);

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
