import fs from 'node:fs/promises';
import path from 'node:path';
import { serverEnv } from './env.server';

const UPLOADS_PREFIX = '/api/uploads/';

export function getPublicUrl(key: string): string {
  return `${UPLOADS_PREFIX}${key}`;
}

export async function uploadAvatar(buffer: Buffer, personId: string, filename: string, _contentType: string): Promise<string> {
  const key = `avatars/${personId}/${filename}`;
  const dir = path.join(serverEnv.UPLOAD_DIR, 'avatars', personId);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

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
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
}
