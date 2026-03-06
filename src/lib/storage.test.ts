import { describe, expect, it, vi } from 'vitest';

// Undo the global storage mock from test/setup.ts so we test real S3
vi.unmock('./storage');

import { deleteAvatar, getPublicUrl, uploadAvatar } from './storage';

describe('getPublicUrl', () => {
  it('should construct correct URL from key', () => {
    const url = getPublicUrl('avatars/person-1/photo.jpg');
    expect(url).toContain('avatars/person-1/photo.jpg');
    expect(url).toMatch(/^https?:\/\/.+\/avatars\/person-1\/photo\.jpg$/);
  });
});

describe('uploadAvatar', () => {
  it('should upload file and return public URL', async () => {
    const buffer = Buffer.from('fake-image-content');
    const personId = 'test-person-upload';
    const filename = 'photo.jpg';

    const url = await uploadAvatar(buffer, personId, filename, 'image/jpeg');

    expect(url).toContain(`avatars/${personId}/${filename}`);
    expect(url).toMatch(/^https?:\/\//);
  });

  it('should handle special characters in filename', async () => {
    const buffer = Buffer.from('special-chars');
    const personId = 'test-person-special';
    const filename = 'ảnh đại diện (1).jpg';

    const url = await uploadAvatar(buffer, personId, filename, 'image/jpeg');

    expect(url).toContain(`avatars/${personId}/`);
    expect(url).toMatch(/^https?:\/\//);
  });

  it('should handle different content types', async () => {
    const buffer = Buffer.from('fake-png-content');
    const personId = 'test-person-png';
    const filename = 'avatar.png';

    const url = await uploadAvatar(buffer, personId, filename, 'image/png');

    expect(url).toContain(`avatars/${personId}/${filename}`);
  });
});

describe('getPublicUrl consistency', () => {
  it('should return the same URL for the same key', () => {
    const key = 'avatars/person-x/photo.png';
    const url1 = getPublicUrl(key);
    const url2 = getPublicUrl(key);
    expect(url1).toBe(url2);
  });
});

describe('deleteAvatar', () => {
  it('should delete an uploaded avatar without error', async () => {
    const buffer = Buffer.from('to-be-deleted');
    const personId = 'test-person-delete';
    const filename = 'delete-me.jpg';

    const url = await uploadAvatar(buffer, personId, filename, 'image/jpeg');

    await expect(deleteAvatar(url)).resolves.toBeUndefined();
  });

  it('should silently skip when URL does not match bucket base', async () => {
    await expect(deleteAvatar('https://other-domain.com/some-file.jpg')).resolves.toBeUndefined();
  });
});
