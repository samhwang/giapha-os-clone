import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Undo the global storage mock from test/setup.ts so we test real implementation
vi.unmock('./storage');

// Mock env.server to use a temp directory with local provider
const mockEnv: Record<string, string | undefined> = {
  UPLOAD_DIR: '',
  STORAGE_PROVIDER: 'local',
};
vi.mock('../config/lib/env.server', () => ({
  get serverEnv() {
    return mockEnv;
  },
}));

import { _resetStorage, deleteAvatar, getPublicUrl, resolveAvatarUrl, uploadAvatar } from './storage';

let tempDir: string;

beforeEach(async () => {
  _resetStorage();
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
  mockEnv.UPLOAD_DIR = tempDir;
  mockEnv.STORAGE_PROVIDER = 'local';
  mockEnv.S3_PUBLIC_URL = undefined;
});

afterEach(async () => {
  await fsp.rm(tempDir, { recursive: true, force: true });
});

describe('getPublicUrl', () => {
  it('should construct local URL from key', () => {
    const url = getPublicUrl('avatars/person-1/photo.jpg');
    expect(url).toBe('/api/uploads/avatars/person-1/photo.jpg');
  });

  it('should construct S3 URL when provider is s3', () => {
    mockEnv.STORAGE_PROVIDER = 's3';
    mockEnv.S3_PUBLIC_URL = 'https://cdn.example.com';
    const url = getPublicUrl('avatars/person-1/photo.jpg');
    expect(url).toBe('https://cdn.example.com/avatars/person-1/photo.jpg');
  });

  it('should return the same URL for the same key', () => {
    const key = 'avatars/person-x/photo.png';
    expect(getPublicUrl(key)).toBe(getPublicUrl(key));
  });
});

describe('resolveAvatarUrl', () => {
  it('should return null for null key', () => {
    expect(resolveAvatarUrl(null)).toBeNull();
  });

  it('should return public URL for valid key', () => {
    expect(resolveAvatarUrl('avatars/p1/photo.jpg')).toBe('/api/uploads/avatars/p1/photo.jpg');
  });
});

describe('uploadAvatar', () => {
  it('should write file and return key (not URL)', async () => {
    const content = 'fake-image-content';
    const buffer = Buffer.from(content);
    const personId = 'test-person-upload';
    const filename = 'photo.jpg';

    const key = await uploadAvatar({ buffer, personId, filename, contentType: 'image/jpeg' });

    expect(key).toBe(`avatars/${personId}/${filename}`);

    const written = await fsp.readFile(path.join(tempDir, 'avatars', personId, filename));
    expect(written.toString()).toBe(content);
  });

  it('should handle special characters in filename', async () => {
    const buffer = Buffer.from('special-chars');
    const personId = 'test-person-special';
    const filename = 'ảnh đại diện (1).jpg';

    const key = await uploadAvatar({ buffer, personId, filename, contentType: 'image/jpeg' });

    expect(key).toBe(`avatars/${personId}/${filename}`);
  });

  it('should handle different content types', async () => {
    const buffer = Buffer.from('fake-png-content');
    const personId = 'test-person-png';
    const filename = 'avatar.png';

    const key = await uploadAvatar({ buffer, personId, filename, contentType: 'image/png' });

    expect(key).toBe(`avatars/${personId}/${filename}`);
  });

  it('should reject files exceeding 2 MB', async () => {
    const oversizedBuffer = Buffer.alloc(2 * 1024 * 1024 + 1);
    await expect(uploadAvatar({ buffer: oversizedBuffer, personId: 'p1', filename: 'big.jpg', contentType: 'image/jpeg' })).rejects.toThrow(
      'Avatar exceeds maximum size of 2 MB'
    );
  });

  it('should reject disallowed content types', async () => {
    const buffer = Buffer.from('not-an-image');
    await expect(uploadAvatar({ buffer, personId: 'p1', filename: 'file.txt', contentType: 'text/plain' })).rejects.toThrow('Invalid avatar type: text/plain');
  });

  it('should accept all allowed image types', async () => {
    const buffer = Buffer.from('fake');
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
      const key = await uploadAvatar({ buffer, personId: 'p1', filename: `img.${type.split('/')[1]}`, contentType: type });
      expect(key).toBeDefined();
    }
  });
});

describe('deleteAvatar', () => {
  it('should delete an uploaded avatar without error', async () => {
    const buffer = Buffer.from('to-be-deleted');
    const personId = 'test-person-delete';
    const filename = 'delete-me.jpg';

    const key = await uploadAvatar({ buffer, personId, filename, contentType: 'image/jpeg' });
    const filePath = path.join(tempDir, 'avatars', personId, filename);

    const stat = await fsp.stat(filePath).catch(() => null);
    expect(stat).not.toBeNull();

    await expect(deleteAvatar(key)).resolves.toBeUndefined();

    const afterStat = await fsp.stat(filePath).catch(() => null);
    expect(afterStat).toBeNull();
  });

  it('should handle empty key gracefully', async () => {
    await expect(deleteAvatar('')).resolves.toBeUndefined();
  });

  it('should handle non-existent key gracefully', async () => {
    await expect(deleteAvatar('avatars/nonexistent/file.jpg')).resolves.toBeUndefined();
  });
});
