import childProcess from 'node:child_process';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';

const ADMIN_TOKEN = 'test-admin-token';

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
admin_token = "${ADMIN_TOKEN}"
`.trim();

const BUCKET_NAME = 'avatars';

function pushSchema(databaseUrl: string) {
  console.log('Running Prisma DB Push');
  process.env.DATABASE_URL = databaseUrl;
  childProcess.execSync(`pnpm run prisma:migrate:dev --url "${databaseUrl}"`, {
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
  console.log('Prisma DB Push complete');
}

function adminHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  };
}

async function setupGarage(adminUrl: string): Promise<{ accessKey: string; secretKey: string }> {
  const statusRes = await fetch(`${adminUrl}/v1/status`, { headers: adminHeaders() });
  const status = (await statusRes.json()) as { node: string };
  const nodeId = status.node;
  console.log(`Garage node ID: ${nodeId}`);

  await fetch(`${adminUrl}/v1/layout`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify([{ id: nodeId, zone: 'dc1', capacity: 1073741824, tags: ['test'] }]),
  });

  const layoutRes = await fetch(`${adminUrl}/v1/layout`, { headers: adminHeaders() });
  const layout = (await layoutRes.json()) as { version: number };
  const applyRes = await fetch(`${adminUrl}/v1/layout/apply`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ version: layout.version + 1 }),
  });
  if (!applyRes.ok) {
    throw new Error(`Garage layout apply failed: ${await applyRes.text()}`);
  }
  console.log('Garage layout applied');

  console.log('Waiting for Garage layout to propagate...');
  let bucket: { id: string } | undefined;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise((r) => setTimeout(r, 2000));
    const bucketRes = await fetch(`${adminUrl}/v1/bucket`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ globalAlias: BUCKET_NAME }),
    });
    if (bucketRes.ok) {
      bucket = (await bucketRes.json()) as { id: string };
      break;
    }
    const errText = await bucketRes.text();
    if (attempt % 5 === 0) {
      console.log(`Garage bucket attempt ${attempt + 1}: ${errText}`);
    }
  }
  if (!bucket) throw new Error('Failed to create Garage bucket after retries');
  console.log(`Garage bucket created: ${bucket.id}`);

  await fetch(`${adminUrl}/v1/bucket?id=${bucket.id}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ websiteAccess: { enabled: true, indexDocument: 'index.html' } }),
  });

  const keyRes = await fetch(`${adminUrl}/v1/key`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ name: 'test-key' }),
  });
  if (!keyRes.ok) {
    throw new Error(`Garage key creation failed: ${await keyRes.text()}`);
  }
  const key = (await keyRes.json()) as { accessKeyId: string; secretAccessKey: string };

  const allowRes = await fetch(`${adminUrl}/v1/bucket/allow`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({
      bucketId: bucket.id,
      accessKeyId: key.accessKeyId,
      permissions: { read: true, write: true, owner: true },
    }),
  });
  if (!allowRes.ok) {
    throw new Error(`Garage bucket allow failed: ${await allowRes.text()}`);
  }
  console.log('Garage setup complete');

  return { accessKey: key.accessKeyId, secretKey: key.secretAccessKey };
}

export async function setup() {
  console.log('Starting PostgreSQL container...');
  const db: StartedPostgreSqlContainer = await new PostgreSqlContainer('postgres:17-alpine').start();
  const databaseUrl = db.getConnectionUri();
  console.log(`PostgreSQL running at ${databaseUrl}`);

  pushSchema(databaseUrl);

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

  process.env.DATABASE_URL = databaseUrl;
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
