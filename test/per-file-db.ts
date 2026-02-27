import pg from 'pg';
import { afterAll } from 'vitest';

const baseUrl = process.env.DATABASE_URL!;
const parsed = new URL(baseUrl);
const templateDb = parsed.pathname.slice(1);
const workerDb = `${templateDb}_${process.env.VITEST_POOL_ID ?? process.pid}`;

// Connect to 'postgres' db to run CREATE DATABASE
const adminUrl = new URL(baseUrl);
adminUrl.pathname = '/postgres';

const client = new pg.Client({ connectionString: adminUrl.toString() });
await client.connect();
await client.query(`DROP DATABASE IF EXISTS "${workerDb}"`);
await client.query(`CREATE DATABASE "${workerDb}" TEMPLATE "${templateDb}"`);
await client.end();

// Override DATABASE_URL for this worker
const workerUrl = new URL(baseUrl);
workerUrl.pathname = `/${workerDb}`;
process.env.DATABASE_URL = workerUrl.toString();

// Cleanup after all tests in this file
afterAll(async () => {
  const { getDbClient } = await import('@/lib/db');
  await getDbClient().$disconnect();

  const dropClient = new pg.Client({ connectionString: adminUrl.toString() });
  await dropClient.connect();
  await dropClient.query(`DROP DATABASE IF EXISTS "${workerDb}"`);
  await dropClient.end();
});
