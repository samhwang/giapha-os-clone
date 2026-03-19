import fs from 'node:fs/promises';
import path from 'node:path';
import { serverEnv } from '../config/lib/env.server';
import { logger } from './logger.server';

const UPLOADS_PREFIX = '/api/uploads/';
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export function getPublicUrl(key: string): string {
  return `${UPLOADS_PREFIX}${key}`;
}

interface UploadAvatarInput {
  buffer: Buffer;
  personId: string;
  filename: string;
  contentType: string;
}

export async function uploadAvatar({ buffer, personId, filename, contentType }: UploadAvatarInput): Promise<string> {
  if (buffer.length > MAX_AVATAR_SIZE_BYTES) {
    throw new Error(`Avatar exceeds maximum size of 2 MB`);
  }

  if (!ALLOWED_AVATAR_TYPES.has(contentType)) {
    throw new Error(`Invalid avatar type: ${contentType}. Allowed: ${[...ALLOWED_AVATAR_TYPES].join(', ')}`);
  }

  const key = `avatars/${personId}/${filename}`;
  const dir = path.join(serverEnv.UPLOAD_DIR, 'avatars', personId);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

  logger.info('Avatar uploaded', { personId, key });
  return getPublicUrl(key);
}

export async function deleteAvatar(url: string): Promise<void> {
  if (!url.startsWith(UPLOADS_PREFIX)) return;

  const key = url.slice(UPLOADS_PREFIX.length);
  const filePath = path.resolve(serverEnv.UPLOAD_DIR, key);

  // Ensure the resolved path is within UPLOAD_DIR to prevent traversal
  const resolvedUploadDir = path.resolve(serverEnv.UPLOAD_DIR);
  if (!filePath.startsWith(resolvedUploadDir)) return;

  try {
    await fs.unlink(filePath);
    logger.info('Avatar deleted', { key });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    logger.error('Failed to delete avatar', { key, error: err });
  }
}
