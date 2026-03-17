import { beforeEach, describe, expect, it } from 'vitest';
import { createCustomEvent, deleteAllCustomEvents, deleteCustomEvent, findAllCustomEvents, updateCustomEvent } from '../repository/custom-event';

describe('customEvent (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllCustomEvents();
  });

  it('should create a custom event', async () => {
    const event = await createCustomEvent({ name: 'Giỗ Ông', eventDate: '2025-03-15', location: 'Hà Nội', content: 'Nội dung' });

    expect(event.name).toBe('Giỗ Ông');
    expect(event.eventDate).toBe('2025-03-15');
    expect(event.location).toBe('Hà Nội');
    expect(event.content).toBe('Nội dung');
  });

  it('should update a custom event', async () => {
    const event = await createCustomEvent({ name: 'Giỗ', eventDate: '2025-03-15' });

    const updated = await updateCustomEvent({ id: event.id, data: { name: 'Giỗ Ông Bà', location: 'HCM' } });

    expect(updated.name).toBe('Giỗ Ông Bà');
    expect(updated.location).toBe('HCM');
  });

  it('should delete a custom event', async () => {
    const event = await createCustomEvent({ name: 'Giỗ', eventDate: '2025-03-15' });

    await deleteCustomEvent(event.id);

    const all = await findAllCustomEvents();
    expect(all.find((e) => e.id === event.id)).toBeUndefined();
  });
});
