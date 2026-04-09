import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";
import s3Driver from "unstorage/drivers/s3";

import { serverEnv } from "../config/lib/env.server";
import { logger } from "./logger.server";

const UPLOADS_PREFIX = "/api/uploads/";
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const ONE_YEAR_SECONDS = 31_536_000;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

let _storage: ReturnType<typeof createStorage> | null = null;

export function _resetStorage() {
  _storage = null;
}

function getStorage() {
  if (_storage) return _storage;

  if (serverEnv.STORAGE_PROVIDER === "s3") {
    const { S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = serverEnv;
    _storage = createStorage({
      driver: s3Driver({
        endpoint: S3_ENDPOINT,
        bucket: S3_BUCKET,
        region: S3_REGION,
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      }),
    });
  } else {
    _storage = createStorage({
      driver: fsDriver({ base: serverEnv.UPLOAD_DIR }),
    });
  }

  return _storage;
}

export function getPublicUrl(key: string): string {
  if (serverEnv.STORAGE_PROVIDER === "s3") {
    return `${serverEnv.S3_PUBLIC_URL}/${key}`;
  }
  return `${UPLOADS_PREFIX}${key}`;
}

export function resolveAvatarUrl(key: string | null): string | null {
  if (!key) return null;
  return getPublicUrl(key);
}

interface UploadAvatarInput {
  buffer: Buffer;
  personId: string;
  filename: string;
  contentType: string;
}

export async function uploadAvatar({
  buffer,
  personId,
  filename,
  contentType,
}: UploadAvatarInput): Promise<string> {
  if (buffer.length > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("Avatar exceeds maximum size of 2 MB");
  }

  if (!ALLOWED_AVATAR_TYPES.has(contentType)) {
    throw new Error(
      `Invalid avatar type: ${contentType}. Allowed: ${[...ALLOWED_AVATAR_TYPES].join(", ")}`,
    );
  }

  const key = `avatars/${personId}/${filename}`;

  await getStorage().setItemRaw(key, buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
    },
  });

  logger.info("Avatar uploaded", { personId, key });
  return key;
}

export async function deleteAvatar(key: string): Promise<void> {
  if (!key) return;

  try {
    await getStorage().removeItem(key);
    logger.info("Avatar deleted", { key });
  } catch (err) {
    logger.error("Failed to delete avatar", { key, error: err });
  }
}
