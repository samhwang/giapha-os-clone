import childProcess from 'node:child_process';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, Wait, type StartedTestContainer } from 'testcontainers';

const GARAGE_CONFIG = `
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "sqlite"

replication_factor = 1
rpc_bind_addr = "[::]:3901"
rpc_secret = "0000000000000000000000000000000000000000000000000000000000000000"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.garage.localhost"

[s3_web]
bind_addr = "[::]:3902"
root_domain = ".web.garage.localhost"

[admin]
api_bind_addr = "[::]:3903"
`.trim();

const BUCKET_NAME = 'avatars';

function pushSchema(databaseUrl?: string) {
  console.log('Running Prisma DB Push');
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
  }
  childProcess.execSync('pnpm run prisma:push', {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
  console.log('Prisma DB Push complete');
}

async function setupGarage(adminUrl: string): Promise<{ accessKey: string; secretKey: string }> {
  // Get node ID
  const statusRes = await fetch(`${adminUrl}/v1/status`);
  const status = (await statusRes.json()) as { node: string };
  const nodeId = status.node;
  console.log(`Garage node ID: ${nodeId}`);

  // Configure node layout
  await fetch(`${adminUrl}/v1/layout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{ id: nodeId, zone: 'dc1', capacity: 1, tags: ['test'] }]),
  });

  // Apply layout
  const layoutRes = await fetch(`${adminUrl}/v1/layout`);
  const layout = (await layoutRes.json()) as { version: number };
  await fetch(`${adminUrl}/v1/layout/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: layout.version + 1 }),
  });
  console.log('Garage layout applied');

  // Create bucket
  const bucketRes = await fetch(`${adminUrl}/v1/bucket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ globalAlias: BUCKET_NAME }),
  });
  const bucket = (await bucketRes.json()) as { id: string };
  console.log(`Garage bucket created: ${bucket.id}`);

  // Enable public reads
  await fetch(`${adminUrl}/v1/bucket?id=${bucket.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ websiteAccess: { enabled: true, indexDocument: 'index.html' } }),
  });

  // Create API key
  const keyRes = await fetch(`${adminUrl}/v1/key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'test-key' }),
  });
  const key = (await keyRes.json()) as { id: string; accessKeyId: string; secretAccessKey: string };

  // Grant key access to bucket
  await fetch(`${adminUrl}/v1/bucket/allow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bucketId: bucket.id,
      accessKeyId: key.id,
      permissions: { read: true, write: true, owner: true },
    }),
  });
  console.log('Garage setup complete');

  return { accessKey: key.accessKeyId, secretKey: key.secretAccessKey };
}

async function localSetup() {
  // Start PostgreSQL
  console.log('Starting PostgreSQL container...');
  const db: StartedPostgreSqlContainer = await new PostgreSqlContainer('postgres:17-alpine').start();
  const databaseUrl = db.getConnectionUri();
  console.log(`PostgreSQL running at ${databaseUrl}`);

  pushSchema(databaseUrl);

  // Start Garage
  console.log('Starting Garage container...');
  const garage: StartedTestContainer = await new GenericContainer('dxflrs/garage:v1.1.0')
    .withExposedPorts(3900, 3903)
    .withCopyContentToContainer([{ content: GARAGE_CONFIG, target: '/etc/garage.toml' }])
    .withWaitStrategy(Wait.forHttp('/health', 3903))
    .start();

  const adminUrl = `http://${garage.getHost()}:${garage.getMappedPort(3903)}`;
  const s3Url = `http://${garage.getHost()}:${garage.getMappedPort(3900)}`;
  console.log(`Garage S3 API at ${s3Url}, Admin at ${adminUrl}`);

  const { accessKey, secretKey } = await setupGarage(adminUrl);

  // Set env vars for test modules
  process.env.S3_ENDPOINT = s3Url;
  process.env.S3_ACCESS_KEY = accessKey;
  process.env.S3_SECRET_KEY = secretKey;
  process.env.S3_BUCKET = BUCKET_NAME;
  process.env.BETTER_AUTH_SECRET = 'test-secret-that-is-at-least-32-characters-long!!';
  process.env.BETTER_AUTH_URL = 'http://localhost:3000';

  return async function teardown() {
    console.log('Stopping containers...');
    await garage.stop();
    await db.stop();
    console.log('Containers stopped');
  };
}

async function ciSetup() {
  console.log('CI mode: using service containers');
  console.log(`Database at ${process.env.DATABASE_URL}`);

  pushSchema();

  return async function teardown() {
    console.log('CI teardown complete');
  };
}

export async function setup() {
  const isInCI = !!process.env.CI;
  return isInCI ? ciSetup() : localSetup();
}
