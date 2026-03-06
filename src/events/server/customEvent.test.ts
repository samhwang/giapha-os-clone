import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';
import { requireAdmin } from '../../server/functions/_auth';
import { UserRole } from '../../types';

vi.mock('../../server/functions/_auth', () => ({
  requireAdmin: vi.fn(),
}));

const db = getDbClient();

describe('customEvent (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      id: 'user-1',
      role: UserRole.enum.admin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@test.com',
      emailVerified: true,
      name: 'Test',
    });
    await db.customEvent.deleteMany({});
  });

  it('should create a custom event', async () => {
    const event = await db.customEvent.create({
      data: { name: 'Giỗ Ông', eventDate: '2025-03-15', location: 'Hà Nội', content: 'Nội dung' },
    });

    expect(event.id).toBeDefined();
    expect(event.name).toBe('Giỗ Ông');
    expect(event.eventDate).toBe('2025-03-15');
    expect(event.location).toBe('Hà Nội');
    expect(event.content).toBe('Nội dung');
  });

  it('should list custom events ordered by eventDate', async () => {
    await db.customEvent.create({ data: { name: 'Event B', eventDate: '2025-06-01' } });
    await db.customEvent.create({ data: { name: 'Event A', eventDate: '2025-01-01' } });

    const events = await db.customEvent.findMany({ orderBy: { eventDate: 'asc' } });
    expect(events).toHaveLength(2);
    expect(events[0].name).toBe('Event A');
    expect(events[1].name).toBe('Event B');
  });

  it('should update a custom event', async () => {
    const event = await db.customEvent.create({
      data: { name: 'Original', eventDate: '2025-03-15' },
    });

    const updated = await db.customEvent.update({
      where: { id: event.id },
      data: { name: 'Updated', location: 'HCM' },
    });

    expect(updated.name).toBe('Updated');
    expect(updated.location).toBe('HCM');
    expect(updated.eventDate).toBe('2025-03-15');
  });

  it('should delete a custom event', async () => {
    const event = await db.customEvent.create({
      data: { name: 'To Delete', eventDate: '2025-03-15' },
    });

    await db.customEvent.delete({ where: { id: event.id } });
    const found = await db.customEvent.findUnique({ where: { id: event.id } });
    expect(found).toBeNull();
  });

  it('should create event with null optional fields', async () => {
    const event = await db.customEvent.create({
      data: { name: 'Minimal', eventDate: '2025-01-01', location: null, content: null },
    });

    expect(event.location).toBeNull();
    expect(event.content).toBeNull();
  });

  it('should require admin access', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Từ chối truy cập.'));
    await expect(requireAdmin()).rejects.toThrow('Từ chối truy cập.');
  });
});
