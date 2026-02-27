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

const mockRequireAuth = vi.fn();
const mockRequireAdmin = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

const mockPrisma = {
  person: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    findMany: vi.fn(),
  },
  personDetailsPrivate: {
    upsert: vi.fn(),
  },
  relationship: {
    count: vi.fn(),
  },
};

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

const mockUploadAvatar = vi.fn();
const mockDeleteAvatar = vi.fn();

vi.mock('@/lib/storage', () => ({
  uploadAvatar: (...args: unknown[]) => mockUploadAvatar(...args),
  deleteAvatar: (...args: unknown[]) => mockDeleteAvatar(...args),
}));

const { createPerson, updatePerson, deleteMember, uploadPersonAvatar, getPersons, getPersonById } = await import('./member');

// ─── Helpers ────────────────────────────────────────────────────────────────

const VALID_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ id: 'user-1', role: 'admin', isActive: true });
  mockRequireAdmin.mockResolvedValue({ id: 'user-1', role: 'admin', isActive: true });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('createPerson', () => {
  it('should create a person without private details', async () => {
    const input = { fullName: 'Nguyễn Văn A', gender: 'male' as const };
    const expected = { id: VALID_UUID, ...input, privateDetails: null };
    mockPrisma.person.create.mockResolvedValue(expected);

    const result = await createPerson(input);

    expect(result).toEqual(expected);
    expect(mockPrisma.person.create).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { privateDetails: true },
      })
    );
  });

  it('should create a person with private details', async () => {
    const input = {
      fullName: 'Nguyễn Văn B',
      gender: 'male' as const,
      phoneNumber: '0901234567',
      occupation: 'Kỹ sư',
    };
    mockPrisma.person.create.mockResolvedValue({ id: VALID_UUID });

    await createPerson(input);

    expect(mockPrisma.person.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: 'Nguyễn Văn B',
        gender: 'male',
        privateDetails: {
          create: {
            phoneNumber: '0901234567',
            occupation: 'Kỹ sư',
            currentResidence: null,
          },
        },
      }),
      include: { privateDetails: true },
    });
  });

  it('should throw when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(createPerson({ fullName: 'Test', gender: 'male' })).rejects.toThrow('Vui lòng đăng nhập.');
  });

  it('should reject invalid input via Zod', async () => {
    await expect(createPerson({ fullName: '', gender: 'male' })).rejects.toThrow();
  });
});

describe('updatePerson', () => {
  it('should update person fields', async () => {
    const updated = { id: VALID_UUID, fullName: 'Updated Name', privateDetails: null };
    mockPrisma.person.update.mockResolvedValue(updated);
    mockPrisma.person.findUniqueOrThrow.mockResolvedValue(updated);

    const result = await updatePerson({ id: VALID_UUID, fullName: 'Updated Name' });

    expect(result).toEqual(updated);
    expect(mockPrisma.person.update).toHaveBeenCalledWith({
      where: { id: VALID_UUID },
      data: { fullName: 'Updated Name' },
    });
  });

  it('should upsert private details when provided', async () => {
    mockPrisma.person.update.mockResolvedValue({ id: VALID_UUID });
    mockPrisma.person.findUniqueOrThrow.mockResolvedValue({ id: VALID_UUID });
    mockPrisma.personDetailsPrivate.upsert.mockResolvedValue({});

    await updatePerson({ id: VALID_UUID, phoneNumber: '0909999999' });

    expect(mockPrisma.personDetailsPrivate.upsert).toHaveBeenCalledWith({
      where: { personId: VALID_UUID },
      create: expect.objectContaining({ phoneNumber: '0909999999' }),
      update: expect.objectContaining({ phoneNumber: '0909999999' }),
    });
  });
});

describe('deleteMember', () => {
  it('should delete a member with no relationships', async () => {
    mockPrisma.relationship.count.mockResolvedValue(0);
    mockPrisma.person.findUnique.mockResolvedValue({ id: VALID_UUID, avatarUrl: null });
    mockPrisma.person.delete.mockResolvedValue({});

    const result = await deleteMember({ id: VALID_UUID });

    expect(result).toEqual({ success: true });
    expect(mockPrisma.person.delete).toHaveBeenCalledWith({ where: { id: VALID_UUID } });
  });

  it('should throw when member has relationships', async () => {
    mockPrisma.relationship.count.mockResolvedValue(2);

    await expect(deleteMember({ id: VALID_UUID })).rejects.toThrow('Không thể xoá');
  });

  it('should delete avatar from S3 when member has one', async () => {
    mockPrisma.relationship.count.mockResolvedValue(0);
    mockPrisma.person.findUnique.mockResolvedValue({ id: VALID_UUID, avatarUrl: 'http://s3/avatars/p-1/photo.jpg' });
    mockPrisma.person.delete.mockResolvedValue({});

    await deleteMember({ id: VALID_UUID });

    expect(mockDeleteAvatar).toHaveBeenCalledWith('http://s3/avatars/p-1/photo.jpg');
  });

  it('should require admin role', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Từ chối truy cập. Chỉ admin mới có quyền này.'));

    await expect(deleteMember({ id: VALID_UUID })).rejects.toThrow('Từ chối truy cập');
  });
});

describe('uploadPersonAvatar', () => {
  it('should upload avatar and update person', async () => {
    mockPrisma.person.findUnique.mockResolvedValue({ id: VALID_UUID, avatarUrl: null });
    mockUploadAvatar.mockResolvedValue('http://s3/avatars/p-1/photo.jpg');
    mockPrisma.person.update.mockResolvedValue({ id: VALID_UUID, avatarUrl: 'http://s3/avatars/p-1/photo.jpg' });

    const result = await uploadPersonAvatar({
      personId: VALID_UUID,
      filename: 'photo.jpg',
      contentType: 'image/jpeg',
      base64: Buffer.from('fake-image').toString('base64'),
    });

    expect(result.avatarUrl).toBe('http://s3/avatars/p-1/photo.jpg');
  });

  it('should delete old avatar before uploading new one', async () => {
    mockPrisma.person.findUnique.mockResolvedValue({ id: VALID_UUID, avatarUrl: 'http://s3/old.jpg' });
    mockUploadAvatar.mockResolvedValue('http://s3/new.jpg');
    mockPrisma.person.update.mockResolvedValue({ id: VALID_UUID, avatarUrl: 'http://s3/new.jpg' });

    await uploadPersonAvatar({
      personId: VALID_UUID,
      filename: 'new.jpg',
      contentType: 'image/jpeg',
      base64: Buffer.from('img').toString('base64'),
    });

    expect(mockDeleteAvatar).toHaveBeenCalledWith('http://s3/old.jpg');
  });

  it('should throw when person not found', async () => {
    mockPrisma.person.findUnique.mockResolvedValue(null);

    await expect(
      uploadPersonAvatar({
        personId: VALID_UUID,
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
        base64: 'abc',
      })
    ).rejects.toThrow('Không tìm thấy thành viên.');
  });
});

describe('getPersons', () => {
  it('should return all persons ordered by createdAt', async () => {
    const persons = [{ id: '1' }, { id: '2' }];
    mockPrisma.person.findMany.mockResolvedValue(persons);

    const result = await getPersons();

    expect(result).toEqual(persons);
    expect(mockPrisma.person.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'asc' } });
  });
});

describe('getPersonById', () => {
  it('should return person with private details', async () => {
    const person = { id: VALID_UUID, fullName: 'Test', privateDetails: { phoneNumber: '123' } };
    mockPrisma.person.findUnique.mockResolvedValue(person);

    const result = await getPersonById({ id: VALID_UUID });

    expect(result).toEqual(person);
  });

  it('should return null for non-existent person', async () => {
    mockPrisma.person.findUnique.mockResolvedValue(null);

    const result = await getPersonById({ id: VALID_UUID });

    expect(result).toBeNull();
  });
});
