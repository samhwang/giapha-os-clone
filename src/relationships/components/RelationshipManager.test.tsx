import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPerson } from '../../../test/fixtures';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import { Gender, RelationshipType } from '../../types';
import RelationshipManager from './RelationshipManager';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

const mockGetRelationshipsForPerson = vi.fn();
const mockGetPersons = vi.fn();
const mockCreateRelationship = vi.fn();
const mockDeleteRelationship = vi.fn();
const mockCreatePerson = vi.fn();

vi.mock('../server/relationship', () => ({
  getRelationshipsForPerson: (...args: unknown[]) => mockGetRelationshipsForPerson(...args),
  createRelationship: (...args: unknown[]) => mockCreateRelationship(...args),
  deleteRelationship: (...args: unknown[]) => mockDeleteRelationship(...args),
}));

vi.mock('../../members/server/member', () => ({
  getPersons: (...args: unknown[]) => mockGetPersons(...args),
  createPerson: (...args: unknown[]) => mockCreatePerson(...args),
}));

const personA = createPerson({ id: 'p1', fullName: 'Nguyễn Văn A', gender: Gender.enum.male });
const personB = createPerson({ id: 'p2', fullName: 'Trần Thị B', gender: Gender.enum.female });

describe('RelationshipManager', () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useDashboardStore.getState().reset();
    mockGetRelationshipsForPerson.mockReset().mockResolvedValue([]);
    mockGetPersons.mockReset().mockResolvedValue([]);
    mockCreateRelationship.mockReset().mockResolvedValue(undefined);
    mockDeleteRelationship.mockReset().mockResolvedValue(undefined);
    mockCreatePerson.mockReset().mockResolvedValue(createPerson({ id: 'new-spouse-id' }));
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it('renders relationship section titles', async () => {
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      expect(screen.getByText(/bố \/ mẹ/i)).toBeInTheDocument();
      expect(screen.getByText(/vợ \/ chồng/i)).toBeInTheDocument();
      expect(screen.getByText(/con cái/i)).toBeInTheDocument();
    });
  });

  it('shows add buttons for editor', async () => {
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      expect(screen.getByText(/thêm con/i)).toBeInTheDocument();
      expect(screen.getByText(/thêm vợ\/chồng/i)).toBeInTheDocument();
      expect(screen.getByText(/thêm mối quan hệ/i)).toBeInTheDocument();
    });
  });

  it('hides add buttons for non-editor', async () => {
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} />);

    await waitFor(() => {
      expect(screen.queryByText(/thêm con/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/thêm vợ\/chồng/i)).not.toBeInTheDocument();
    });
  });

  it('displays relationship target person name', async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([{ id: 'r1', type: RelationshipType.enum.marriage, personAId: 'p1', personBId: 'p2', note: null }]);
    mockGetPersons.mockResolvedValue([personA, personB]);

    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} />);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockGetRelationshipsForPerson.mockReturnValue(new Promise(() => {}));
    mockGetPersons.mockReturnValue(new Promise(() => {}));

    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} />);
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  it('shows empty state for sections with no relationships when canEdit', async () => {
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      const emptyTexts = screen.getAllByText(/chưa có thông tin/i);
      expect(emptyTexts.length).toBeGreaterThan(0);
    });
  });

  it('clicking add relationship opens form', async () => {
    const user = userEvent.setup();
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      expect(screen.getByText(/thêm mối quan hệ/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/thêm mối quan hệ/i));

    expect(screen.getByText(/thêm quan hệ mới/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nhập tên để tìm/i)).toBeInTheDocument();
  });

  it('delete relationship calls deleteRelationship', async () => {
    confirmSpy.mockReturnValue(true);
    mockGetRelationshipsForPerson.mockResolvedValue([{ id: 'r1', type: RelationshipType.enum.marriage, personAId: 'p1', personBId: 'p2', note: null }]);
    mockGetPersons.mockResolvedValue([personA, personB]);

    const user = userEvent.setup();
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /xóa mối quan hệ/i }));

    await waitFor(() => {
      expect(mockDeleteRelationship).toHaveBeenCalledWith({ data: { id: 'r1' } });
    });
  });

  it('delete cancel does not call server', async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([{ id: 'r1', type: RelationshipType.enum.marriage, personAId: 'p1', personBId: 'p2', note: null }]);
    mockGetPersons.mockResolvedValue([personA, personB]);

    const user = userEvent.setup();
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /xóa mối quan hệ/i }));
    expect(mockDeleteRelationship).not.toHaveBeenCalled();
  });

  it('quick add spouse creates person and relationship', async () => {
    const user = userEvent.setup();
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      expect(screen.getByText(/thêm vợ\/chồng/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/thêm vợ\/chồng/i));

    expect(screen.getByText(/thêm nhanh vợ\/chồng/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/họ và tên/i), 'Trần Thị C');
    await user.click(screen.getByText(/^lưu$/i));

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({ fullName: 'Trần Thị C', gender: Gender.enum.female }),
      });
    });

    await waitFor(() => {
      expect(mockCreateRelationship).toHaveBeenCalledWith({
        data: expect.objectContaining({ personAId: 'p1', type: RelationshipType.enum.marriage }),
      });
    });
  });

  it('shows inline error on add spouse failure', async () => {
    mockCreatePerson.mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<RelationshipManager personId="p1" personGender={Gender.enum.male} canEdit={true} />);

    await waitFor(() => {
      expect(screen.getByText(/thêm vợ\/chồng/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/thêm vợ\/chồng/i));
    await user.type(screen.getByLabelText(/họ và tên/i), 'Trần Thị C');
    await user.click(screen.getByText(/^lưu$/i));

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
