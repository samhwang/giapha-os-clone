import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from './env';

const s3 = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: 'garage',
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

const bucket = env.S3_BUCKET;

export function getPublicUrl(key: string): string {
  return `${env.S3_ENDPOINT}/${bucket}/${key}`;
}

export async function uploadAvatar(buffer: Buffer, personId: string, filename: string, contentType: string): Promise<string> {
  const key = `avatars/${personId}/${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return getPublicUrl(key);
}

export async function deleteAvatar(url: string): Promise<void> {
  const baseUrl = `${env.S3_ENDPOINT}/${bucket}/`;
  if (!url.startsWith(baseUrl)) return;

  const key = url.slice(baseUrl.length);

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}
