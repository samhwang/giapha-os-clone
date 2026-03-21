import childProcess from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

function pushSchema(databaseUrl: string) {
  console.log('Running Prisma DB Push');
  process.env.DATABASE_URL = databaseUrl;
  childProcess.execSync(`pnpm run prisma:migrate:dev --url "${databaseUrl}"`, {
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  console.log('Prisma DB Push complete');
}

export async function setup() {
  console.log('Starting PostgreSQL container...');
  const db: StartedPostgreSqlContainer = await new PostgreSqlContainer('postgres:17-alpine').start();
  const databaseUrl = db.getConnectionUri();
  console.log(`PostgreSQL running at ${databaseUrl}`);

  pushSchema(databaseUrl);

  const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'giapha-test-uploads-'));
  console.log(`Upload dir: ${uploadDir}`);

  process.env.DATABASE_URL = databaseUrl;
  process.env.STORAGE_PROVIDER = 'local';
  process.env.UPLOAD_DIR = uploadDir;
  process.env.BETTER_AUTH_SECRET = 'test-secret-that-is-at-least-32-characters-long!!';
  process.env.BETTER_AUTH_URL = 'http://localhost:3000';

  return async function teardown() {
    console.log('Stopping containers...');
    await fs.rm(uploadDir, { recursive: true, force: true });
    await db.stop();
    console.log('Containers stopped');
  };
}
