import { beforeEach, describe, expect, it } from 'vitest';
import { getDbClient } from '../../lib/db';

const db = getDbClient();

describe('customEvent (inner logic)', () => {
  beforeEach(async () => {
    await db.customEvent.deleteMany({});
  });

  it('should create a custom event', async () => {
    const event = await db.customEvent.create({
      data: { name: 'Giỗ Ông', eventDate: '2025-03-15', location: 'Hà Nội', content: 'Nội dung' },
    });

    expect(event.name).toBe('Giỗ Ông');
    expect(event.eventDate).toBe('2025-03-15');
    expect(event.location).toBe('Hà Nội');
    expect(event.content).toBe('Nội dung');
  });

  it('should update a custom event', async () => {
    const event = await db.customEvent.create({
      data: { name: 'Giỗ', eventDate: '2025-03-15' },
    });

    const updated = await db.customEvent.update({
      where: { id: event.id },
      data: { name: 'Giỗ Ông Bà', location: 'HCM' },
    });

    expect(updated.name).toBe('Giỗ Ông Bà');
    expect(updated.location).toBe('HCM');
  });

  it('should delete a custom event', async () => {
    const event = await db.customEvent.create({
      data: { name: 'Giỗ', eventDate: '2025-03-15' },
    });

    await db.customEvent.delete({ where: { id: event.id } });

    const found = await db.customEvent.findUnique({ where: { id: event.id } });
    expect(found).toBeNull();
  });
});
