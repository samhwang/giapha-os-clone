import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  Link: () => null,
}));

describe('dashboard/index loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch persons and customEvents in parallel', async () => {
    const persons = [{ id: '1', fullName: 'Test' }];
    const customEvents = [{ id: '2', name: 'Event' }];
    mockGetPersons.mockResolvedValue(persons);
    mockGetCustomEvents.mockResolvedValue(customEvents);

    await import('./index');

    const loader = capturedOptions.loader as () => Promise<unknown>;
    const result = await loader();

    expect(result).toEqual({ persons, customEvents });
    expect(mockGetPersons).toHaveBeenCalledOnce();
    expect(mockGetCustomEvents).toHaveBeenCalledOnce();
  });

  it('should handle empty results', async () => {
    mockGetPersons.mockResolvedValue([]);
    mockGetCustomEvents.mockResolvedValue([]);

    const loader = capturedOptions.loader as () => Promise<unknown>;
    const result = await loader();

    expect(result).toEqual({ persons: [], customEvents: [] });
  });
});
