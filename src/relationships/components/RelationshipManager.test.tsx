import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import RelationshipManager from './RelationshipManager';

vi.mock('../../dashboard/components/DashboardContext', () => ({
  DashboardContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
  useDashboard: () => ({
    memberModalId: null,
    setMemberModalId: vi.fn(),
    showAvatar: true,
    setShowAvatar: vi.fn(),
    view: 'list' as const,
    setView: vi.fn(),
    rootId: null,
    setRootId: vi.fn(),
  }),
}));

const mockGetRelationshipsForPerson = vi.fn();
const mockGetPersons = vi.fn();

vi.mock('../server/relationship', () => ({
  getRelationshipsForPerson: (...args: unknown[]) => mockGetRelationshipsForPerson(...args),
  createRelationship: vi.fn(() => Promise.resolve()),
  deleteRelationship: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../members/server/member', () => ({
  getPersons: (...args: unknown[]) => mockGetPersons(...args),
  createPerson: vi.fn(() => Promise.resolve(createPerson())),
}));

describe('RelationshipManager', () => {
  it('renders relationship section titles', async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([]);
    mockGetPersons.mockResolvedValue([]);

    render(<RelationshipManager personId="p1" isAdmin={true} personGender="male" />);

    await waitFor(() => {
      expect(screen.getByText(/bố \/ mẹ/i)).toBeInTheDocument();
      expect(screen.getByText(/vợ \/ chồng/i)).toBeInTheDocument();
      expect(screen.getByText(/con cái/i)).toBeInTheDocument();
    });
  });

  it('shows add buttons for admin', async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([]);
    mockGetPersons.mockResolvedValue([]);

    render(<RelationshipManager personId="p1" isAdmin={true} personGender="male" />);

    await waitFor(() => {
      expect(screen.getByText(/thêm con/i)).toBeInTheDocument();
      expect(screen.getByText(/thêm vợ\/chồng/i)).toBeInTheDocument();
      expect(screen.getByText(/thêm mối quan hệ/i)).toBeInTheDocument();
    });
  });

  it('hides add buttons for non-admin', async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([]);
    mockGetPersons.mockResolvedValue([]);

    render(<RelationshipManager personId="p1" isAdmin={false} personGender="male" />);

    await waitFor(() => {
      expect(screen.queryByText(/thêm con/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/thêm vợ\/chồng/i)).not.toBeInTheDocument();
    });
  });

  it('displays relationship target person name', async () => {
    const spouse = createPerson({ id: 'p2', fullName: 'Trần Thị B', gender: 'female' });

    mockGetRelationshipsForPerson.mockResolvedValue([{ id: 'r1', type: 'marriage', personAId: 'p1', personBId: 'p2', note: null }]);
    mockGetPersons.mockResolvedValue([createPerson({ id: 'p1', fullName: 'Nguyễn Văn A', gender: 'male' }), spouse]);

    render(<RelationshipManager personId="p1" isAdmin={true} personGender="male" />);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockGetRelationshipsForPerson.mockReturnValue(new Promise(() => {}));
    mockGetPersons.mockReturnValue(new Promise(() => {}));

    render(<RelationshipManager personId="p1" isAdmin={true} personGender="male" />);
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  it('shows empty state for sections with no relationships when admin', async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([]);
    mockGetPersons.mockResolvedValue([]);

    render(<RelationshipManager personId="p1" isAdmin={true} personGender="male" />);

    await waitFor(() => {
      const emptyTexts = screen.getAllByText(/chưa có thông tin/i);
      expect(emptyTexts.length).toBeGreaterThan(0);
    });
  });
});
