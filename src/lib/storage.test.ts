import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Undo the global storage mock from test/setup.ts so we test real filesystem
vi.unmock('./storage');

// Mock env.server to use a temp directory
const mockEnv = { UPLOAD_DIR: '' };
vi.mock('./env.server', () => ({
  get serverEnv() {
    return mockEnv;
  },
}));

import { deleteAvatar, getPublicUrl, uploadAvatar } from './storage';

let tempDir: string;

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
  mockEnv.UPLOAD_DIR = tempDir;
});

afterEach(async () => {
  await fsp.rm(tempDir, { recursive: true, force: true });
});

describe('getPublicUrl', () => {
  it('should construct correct URL from key', () => {
    const url = getPublicUrl('avatars/person-1/photo.jpg');
    expect(url).toBe('/api/uploads/avatars/person-1/photo.jpg');
  });

  it('should return the same URL for the same key', () => {
    const key = 'avatars/person-x/photo.png';
    expect(getPublicUrl(key)).toBe(getPublicUrl(key));
  });
});

describe('uploadAvatar', () => {
  it('should write file to disk and return public URL', async () => {
    const content = 'fake-image-content';
    const buffer = Buffer.from(content);
    const personId = 'test-person-upload';
    const filename = 'photo.jpg';

    const url = await uploadAvatar(buffer, personId, filename, 'image/jpeg');

    expect(url).toBe(`/api/uploads/avatars/${personId}/${filename}`);

    const written = await fsp.readFile(path.join(tempDir, 'avatars', personId, filename));
    expect(written.toString()).toBe(content);
  });

  it('should handle special characters in filename', async () => {
    const buffer = Buffer.from('special-chars');
    const personId = 'test-person-special';
    const filename = 'ảnh đại diện (1).jpg';

    const url = await uploadAvatar(buffer, personId, filename, 'image/jpeg');

    expect(url).toContain(`avatars/${personId}/`);
    expect(fs.existsSync(path.join(tempDir, 'avatars', personId, filename))).toBe(true);
  });

  it('should handle different content types', async () => {
    const buffer = Buffer.from('fake-png-content');
    const personId = 'test-person-png';
    const filename = 'avatar.png';

    const url = await uploadAvatar(buffer, personId, filename, 'image/png');

    expect(url).toBe(`/api/uploads/avatars/${personId}/${filename}`);
    expect(fs.existsSync(path.join(tempDir, 'avatars', personId, filename))).toBe(true);
  });

  it('should reject files exceeding 2 MB', async () => {
    const oversizedBuffer = Buffer.alloc(2 * 1024 * 1024 + 1);
    await expect(uploadAvatar(oversizedBuffer, 'p1', 'big.jpg', 'image/jpeg')).rejects.toThrow('Avatar exceeds maximum size of 2 MB');
  });

  it('should reject disallowed content types', async () => {
    const buffer = Buffer.from('not-an-image');
    await expect(uploadAvatar(buffer, 'p1', 'file.txt', 'text/plain')).rejects.toThrow('Invalid avatar type: text/plain');
  });

  it('should accept all allowed image types', async () => {
    const buffer = Buffer.from('fake');
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
      await expect(uploadAvatar(buffer, 'p1', `img.${type.split('/')[1]}`, type)).resolves.toBeDefined();
    }
  });
});

describe('deleteAvatar', () => {
  it('should delete an uploaded avatar without error', async () => {
    const buffer = Buffer.from('to-be-deleted');
    const personId = 'test-person-delete';
    const filename = 'delete-me.jpg';

    const url = await uploadAvatar(buffer, personId, filename, 'image/jpeg');
    const filePath = path.join(tempDir, 'avatars', personId, filename);
    expect(fs.existsSync(filePath)).toBe(true);

    await expect(deleteAvatar(url)).resolves.toBeUndefined();
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('should silently skip when URL does not match uploads prefix', async () => {
    await expect(deleteAvatar('https://other-domain.com/some-file.jpg')).resolves.toBeUndefined();
  });

  it('should silently handle already-deleted files', async () => {
    await expect(deleteAvatar('/api/uploads/avatars/nonexistent/file.jpg')).resolves.toBeUndefined();
  });
});
