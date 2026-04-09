import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../events/components/EventsList', () => ({ default: () => null }));
vi.mock('../../members/components/MemberDetailModal', () => ({ default: () => null }));

const mockGetPersons = vi.fn();
const mockGetCustomEvents = vi.fn();

vi.mock('../../members/server/member', () => ({
  getPersons: (...args: unknown[]) => mockGetPersons(...args),
}));

vi.mock('../../events/server/customEvent', () => ({
  getCustomEvents: (...args: unknown[]) => mockGetCustomEvents(...args),
}));

let capturedOptions: Record<string, unknown> = {};

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => {
    capturedOptions = opts;
    return { options: opts };
  },
  useRouter: () => ({ invalidate: vi.fn() }),
}));

describe('dashboard/events loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch persons and customEvents', async () => {
    const persons = [{ id: '1', fullName: 'Test' }];
    const customEvents = [{ id: '2', name: 'Event' }];
    mockGetPersons.mockResolvedValue(persons);
    mockGetCustomEvents.mockResolvedValue(customEvents);

    await import('./events');

    const loader = capturedOptions.loader as () => Promise<unknown>;
    const result = await loader();

    expect(result).toEqual({ persons, customEvents });
  });
});
