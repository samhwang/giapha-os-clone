import { createFileRoute } from '@tanstack/react-router';
import fs from 'node:fs/promises';
import path from 'node:path';

import { serverEnv } from '../../../config/lib/env.server';
import { logger } from '../../../lib/logger.server';
import { getPublicUrl, ONE_YEAR_SECONDS } from '../../../lib/storage';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export const Route = createFileRoute('/api/uploads/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const relativePath = url.pathname.replace('/api/uploads/', '');

        if (!relativePath || relativePath.includes('..')) {
          return new Response('Not found', { status: 404 });
        }

        if (serverEnv.STORAGE_PROVIDER === 's3') {
          return Response.redirect(getPublicUrl(relativePath), 302);
        }

        const filePath = path.resolve(serverEnv.UPLOAD_DIR as string, relativePath);
        const resolvedUploadDir = path.resolve(serverEnv.UPLOAD_DIR as string);

        if (!filePath.startsWith(resolvedUploadDir)) {
          return new Response('Not found', { status: 404 });
        }

        try {
          const buffer = await fs.readFile(filePath);
          const ext = path.extname(filePath).toLowerCase();
          const contentType = CONTENT_TYPES[ext];

          if (!contentType) {
            return new Response('Not found', { status: 404 });
          }

          return new Response(buffer, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
            },
          });
        } catch (error) {
          logger.error('Failed to serve upload', { path: relativePath, error });
          return new Response('Not found', { status: 404 });
        }
      },
    },
  },
});
