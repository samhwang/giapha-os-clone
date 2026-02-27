import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => {
    let validatorSchema: { parse?: (input: unknown) => unknown } | ((input: unknown) => unknown) | null = null;
    const builder = {
      validator: (schema: unknown) => {
        validatorSchema = schema as typeof validatorSchema;
        return builder;
      },
      handler: (fn: (opts: { data: unknown }) => unknown) => {
        const callable = async (input: unknown) => {
          let data = input;
          if (validatorSchema) {
            data = typeof validatorSchema === 'function' ? validatorSchema(input) : validatorSchema.parse!(input);
          }
          return fn({ data });
        };
        return callable;
      },
    };
    return builder;
  }),
}));

const mockRequireAdmin = vi.fn();
vi.mock('./_auth', () => ({
  requireAuth: vi.fn(),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

const mockPrisma = {
  user: {
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

const mockSignUpEmail = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: (...args: unknown[]) => mockSignUpEmail(...args),
    },
  },
}));

const { changeRole, deleteUser, createUser, toggleStatus, getUsers } = await import('./user');

// ─── Helpers ────────────────────────────────────────────────────────────────

const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const OTHER_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({ id: ADMIN_ID, role: 'admin' });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('changeRole', () => {
  it('should change another user role', async () => {
    mockPrisma.user.update.mockResolvedValue({});

    const result = await changeRole({ userId: OTHER_ID, newRole: 'admin' });

    expect(result).toEqual({ success: true });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: OTHER_ID },
      data: { role: 'admin' },
    });
  });

  it('should prevent changing own role', async () => {
    await expect(changeRole({ userId: ADMIN_ID, newRole: 'member' })).rejects.toThrow('Không thể thay đổi vai trò của chính mình.');
  });

  it('should reject invalid role via Zod', async () => {
    await expect(changeRole({ userId: OTHER_ID, newRole: 'superadmin' as never })).rejects.toThrow();
  });
});

describe('deleteUser', () => {
  it('should delete another user', async () => {
    mockPrisma.user.delete.mockResolvedValue({});

    const result = await deleteUser({ userId: OTHER_ID });

    expect(result).toEqual({ success: true });
  });

  it('should prevent self-deletion', async () => {
    await expect(deleteUser({ userId: ADMIN_ID })).rejects.toThrow('Không thể xoá tài khoản của chính mình.');
  });
});

describe('createUser', () => {
  it('should create a new user via Better Auth signup', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockSignUpEmail.mockResolvedValue({ user: { id: 'new-user-id' } });
    mockPrisma.user.update.mockResolvedValue({});

    const result = await createUser({
      email: 'new@test.com',
      password: 'password123',
      role: 'member',
      isActive: true,
    });

    expect(result).toEqual({ success: true });
    expect(mockSignUpEmail).toHaveBeenCalledWith({
      body: { email: 'new@test.com', password: 'password123', name: 'new@test.com' },
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'new-user-id' },
      data: { role: 'member', isActive: true },
    });
  });

  it('should throw when email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(createUser({ email: 'existing@test.com', password: 'password123' })).rejects.toThrow('Email đã được sử dụng.');
  });

  it('should reject short password via Zod', async () => {
    await expect(createUser({ email: 'test@test.com', password: '123' })).rejects.toThrow();
  });

  it('should reject invalid email via Zod', async () => {
    await expect(createUser({ email: 'not-email', password: 'password123' })).rejects.toThrow();
  });
});

describe('toggleStatus', () => {
  it('should toggle another user status', async () => {
    mockPrisma.user.update.mockResolvedValue({});

    const result = await toggleStatus({ userId: OTHER_ID, isActive: false });

    expect(result).toEqual({ success: true });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: OTHER_ID },
      data: { isActive: false },
    });
  });

  it('should prevent toggling own status', async () => {
    await expect(toggleStatus({ userId: ADMIN_ID, isActive: false })).rejects.toThrow('Không thể thay đổi trạng thái của chính mình.');
  });
});

describe('getUsers', () => {
  it('should return all users with selected fields', async () => {
    const users = [{ id: ADMIN_ID, email: 'admin@test.com', role: 'admin' }];
    mockPrisma.user.findMany.mockResolvedValue(users);

    const result = await getUsers();

    expect(result).toEqual(users);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  });
});
