import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'garage',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const bucket = process.env.S3_BUCKET || 'avatars';

export function getPublicUrl(key: string): string {
  return `${process.env.S3_ENDPOINT}/${bucket}/${key}`;
}

export async function uploadAvatar(buffer: Buffer, personId: string, filename: string, contentType: string): Promise<string> {
  const key = `avatars/${personId}/${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return getPublicUrl(key);
}

export async function deleteAvatar(url: string): Promise<void> {
  const baseUrl = `${process.env.S3_ENDPOINT}/${bucket}/`;
  if (!url.startsWith(baseUrl)) return;

  const key = url.slice(baseUrl.length);

  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}
