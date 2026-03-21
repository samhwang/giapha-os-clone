# Plan: Migrate Storage to unstorage (fs + s3 drivers)

## Context

The app currently stores files (avatars) on the local filesystem only, which works for self-hosted Docker deployments but not for cloud platforms (Cloudflare, Vercel, Supabase) that lack persistent local storage. We're adopting `unstorage` to support both local filesystem and S3-compatible storage, selectable at runtime via environment variables.

## Key Design Decision: Store Keys, Not URLs

**Current**: DB `avatarUrl` stores `/api/uploads/avatars/{personId}/{filename}` (a URL path tied to the local serving route).

**New**: DB `avatarUrl` stores just the storage key: `avatars/{personId}/{filename}`. A `resolveAvatarUrl(key)` function generates the appropriate URL at read time based on the active provider.

This requires a **one-time data migration** to strip the `/api/uploads/` prefix from existing values.

## Implementation Steps

### Step 1: Install dependencies

```bash
pnpm add unstorage aws4fetch
```

`unstorage` is the storage abstraction. `aws4fetch` is its peer dependency for the S3 driver (a lightweight S3-compatible fetch client — not the full AWS SDK).

### Step 2: Update env validation — `src/config/lib/env.server.ts`

Add to the `ServerEnv` Zod schema:

```ts
STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
// S3 vars — required only when STORAGE_PROVIDER=s3
S3_ENDPOINT: z.string().optional(),
S3_BUCKET: z.string().optional(),
S3_REGION: z.string().optional(),
S3_ACCESS_KEY_ID: z.string().optional(),
S3_SECRET_ACCESS_KEY: z.string().optional(),
S3_PUBLIC_URL: z.string().optional(), // e.g. https://cdn.example.com or https://bucket.s3.region.amazonaws.com
```

Change `UPLOAD_DIR` from always-defaulted to optional (it's only needed for local):

```ts
UPLOAD_DIR: z.string().min(1).optional(),
```

Add `.refine()` calls to enforce provider-specific vars:

```ts
.refine(
  (env) => {
    if (env.STORAGE_PROVIDER !== 'local') return true;
    return !!env.UPLOAD_DIR;
  },
  { message: 'UPLOAD_DIR is required when STORAGE_PROVIDER=local' }
)
.refine(
  (env) => {
    if (env.STORAGE_PROVIDER !== 's3') return true;
    return env.S3_ENDPOINT && env.S3_BUCKET && env.S3_REGION
      && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_PUBLIC_URL;
  },
  { message: 'S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_URL are required when STORAGE_PROVIDER=s3' }
)
```

### Step 3: Rewrite storage lib — `src/lib/storage.ts`

Replace direct `fs` calls with `unstorage`. Key changes:

- Create an `unstorage` instance using `fsDriver` or `s3Driver` based on `STORAGE_PROVIDER`
- `uploadAvatar()` → uses `storage.setItemRaw(key, buffer, { headers: { 'Content-Type': contentType } })`, **returns the key** (not a URL). The S3 driver supports passing `Content-Type` and `Cache-Control` headers in the options arg.
- `deleteAvatar(key)` → uses `storage.removeItem(key)` (takes a key, not a URL)
- `getPublicUrl(key)` → returns `/api/uploads/${key}` for local, `${S3_PUBLIC_URL}/${key}` for s3

```ts
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';
import s3Driver from 'unstorage/drivers/s3';
import { serverEnv } from '../config/lib/env.server';

function createStorageInstance() {
  if (serverEnv.STORAGE_PROVIDER === 's3') {
    return createStorage({
      driver: s3Driver({
        endpoint: serverEnv.S3_ENDPOINT!,
        bucket: serverEnv.S3_BUCKET!,
        region: serverEnv.S3_REGION!,
        accessKeyId: serverEnv.S3_ACCESS_KEY_ID!,
        secretAccessKey: serverEnv.S3_SECRET_ACCESS_KEY!,
      }),
    });
  }
  return createStorage({
    driver: fsDriver({ base: serverEnv.UPLOAD_DIR }),
  });
}

export const storage = createStorageInstance();
```

Validation logic (size/type checks) stays the same. The path traversal checks in `deleteAvatar` are no longer needed since unstorage handles paths internally.

### Step 4: Add `resolveAvatarUrl` utility — `src/lib/storage.ts`

```ts
export function resolveAvatarUrl(key: string | null): string | null {
  if (!key) return null;
  return getPublicUrl(key);
}
```

### Step 5: Apply URL resolution at the repository read boundary

In `src/members/repository/person.ts`, add a mapping function that resolves `avatarUrl` keys to full URLs when returning person data. Apply it in `findAllPersons`, `findPersonById`, `findPersonByIdOrThrow`, and `createPerson` (any function that returns person data with `avatarUrl`).

```ts
import { resolveAvatarUrl } from '../../lib/storage';

function withResolvedAvatar<T extends { avatarUrl: string | null }>(person: T): T {
  return { ...person, avatarUrl: resolveAvatarUrl(person.avatarUrl) };
}
```

This means **zero changes to any frontend components** — they continue receiving full URLs.

### Step 6: Update `src/members/server/member.ts`

- `uploadPersonAvatar`: `uploadAvatar()` now returns a key. Store the key in `avatarUrl` (code is nearly identical, just the semantics change).
- `deleteMember`: `deleteAvatar()` now takes a key directly (which is what `person.avatarUrl` stores in DB). But note: the value returned from repository functions has the resolved URL. We need the raw key for deletion. Two options:
  - Read the raw DB value before resolving (query without the mapping)
  - Strip the URL back to a key

  **Recommended**: Add a `findPersonByIdRaw()` or pass the raw DB value. Simplest approach: in `deleteMember`, query using `findPersonById` but store the raw avatarUrl before resolution. Actually, the cleanest approach is to have `deleteAvatar` accept either a key or a full URL and normalize it internally. But that re-couples things.

  **Simplest**: In `deleteMember` and `uploadPersonAvatar`, query the person using a raw repository call (without avatar URL resolution) since these are server-only operations. We can export the raw `findPersonById` separately or just call Prisma directly in these two spots.

  **Decided approach**: Export the existing repository functions as-is (they return raw DB values). The `withResolvedAvatar` mapping is applied in new wrapper functions used by loaders/getters that feed the frontend. The server functions (`deleteMember`, `uploadPersonAvatar`) continue using the raw repository functions.

  Concretely:
  - Keep `findPersonById`, `findAllPersons`, etc. as raw (no avatar resolution)
  - Add `findPersonByIdResolved`, `findAllPersonsResolved` wrappers that apply `withResolvedAvatar`
  - Loaders and `getPersons`/`getPersonById` server functions use the resolved versions
  - `deleteMember` and `uploadPersonAvatar` use the raw versions (as they do today)

### Step 7: Update uploads route — `src/routes/api/uploads/$.ts`

- **Local provider**: Keep current behavior (serve files from filesystem). Can optionally use `storage.getItemRaw()` instead of raw `fs.readFile`, but direct fs reads are fine for a local-only route.
- **S3 provider**: Redirect to the S3 public URL via 302 redirect. This handles any bookmarked/cached `/api/uploads/...` URLs gracefully.

```ts
if (serverEnv.STORAGE_PROVIDER === 's3') {
  return Response.redirect(getPublicUrl(relativePath), 302);
}
// ... existing local fs serving logic
```

### Step 8: Data migration

Create a Prisma migration with custom SQL to strip the `/api/uploads/` prefix:

```sql
UPDATE "Person"
SET "avatarUrl" = SUBSTRING("avatarUrl" FROM LENGTH('/api/uploads/') + 1)
WHERE "avatarUrl" LIKE '/api/uploads/%';
```

Use `pnpm prisma migrate dev --name storage_keys_migration` and replace the generated SQL with this.

### Step 9: Update tests

**`test/setup.ts`**:
- Update mock return value: `uploadAvatar` returns `'avatars/test/avatar.jpg'` (key, not URL)
- Add `getPublicUrl` and `resolveAvatarUrl` to the mock

**`src/lib/storage.test.ts`**:
- Rewrite to test unstorage-based implementation
- Local provider tests: use `fsDriver` with temp directory (similar to current approach)
- Test that `uploadAvatar` returns a key, not a URL
- Test `getPublicUrl` for both local and s3 providers
- Test `resolveAvatarUrl` for null handling
- Keep validation tests (size/type limits) as-is

**`src/members/server/member.test.ts`**:
- Update assertions to expect keys instead of URLs where checking stored `avatarUrl`

### Step 10: Update documentation

**`.env.sample`** — Add new env vars with comments:
```env
# Storage provider: "local" (default) or "s3"
STORAGE_PROVIDER=local

# S3-compatible storage (required when STORAGE_PROVIDER=s3)
# Works with AWS S3, SeaweedFS, MinIO, Cloudflare R2, Supabase Storage, etc.
# S3_ENDPOINT=http://localhost:8333
# S3_BUCKET=giapha
# S3_REGION=us-east-1
# S3_ACCESS_KEY_ID=your-access-key
# S3_SECRET_ACCESS_KEY=your-secret-key
# S3_PUBLIC_URL=http://localhost:8333/giapha
```

**`docker-compose.yml`** (dev) — Add an optional SeaweedFS service for local S3 testing:
```yaml
seaweedfs:
  image: chrislusf/seaweedfs:latest
  command: "server -s3 -dir=/data"
  ports:
    - "8333:8333"
    - "9333:9333"
  volumes:
    - ./.docker/seaweedfs/data:/data
```

**`docker-compose.production.yml`** — Add S3 env vars as comments in the app service:
```yaml
# Storage: defaults to local filesystem. Set STORAGE_PROVIDER=s3 for S3-compatible storage.
- STORAGE_PROVIDER=local
# - S3_ENDPOINT=http://seaweedfs:8333
# - S3_BUCKET=giapha
# - S3_REGION=us-east-1
# - S3_ACCESS_KEY_ID=your-access-key
# - S3_SECRET_ACCESS_KEY=your-secret-key
# - S3_PUBLIC_URL=http://seaweedfs:8333/giapha
```

**`docs/01-deployment.md`** — Add a new section "S3-Compatible Storage" after the existing "Storage Options" section:
- Explain when to use S3 (cloud deployments, or self-hosted with shared/distributed storage)
- SeaweedFS example setup with docker-compose snippet (add `seaweedfs` service)
- Env var configuration for SeaweedFS
- Note compatibility with other S3-compatible providers (MinIO, Cloudflare R2, Supabase Storage, AWS S3)
- Include a docker-compose snippet for adding SeaweedFS as a service:

```yaml
seaweedfs:
  image: chrislusf/seaweedfs:latest
  command: "server -s3 -dir=/data"
  ports:
    - "8333:8333"
    - "9333:9333"
  volumes:
    - seaweedfs_data:/data
  restart: unless-stopped
  networks:
    - giapha-network
```

**`docs/04-architecture.md`** — Update:
- Tech stack table: change "Storage" from "Local filesystem" to "unstorage (local fs / S3-compatible)"
- Environment variables table: add new storage vars

**`.agents/rules/patterns.md`** — Update the "File Storage" section to reflect unstorage-based pattern

**`.agents/rules/deployment.md`** — Update the "File Storage" bullet to mention S3 option

**`AGENTS.md`** — Update tech stack references from "Local filesystem" to "unstorage (local fs / S3-compatible)"

## Files to modify

| File | Change |
|------|--------|
| `package.json` | Add `unstorage`, `aws4fetch` |
| `src/config/lib/env.server.ts` | Add `STORAGE_PROVIDER` and S3 env vars |
| `src/lib/storage.ts` | Rewrite with unstorage, return keys, add `resolveAvatarUrl` |
| `src/members/repository/person.ts` | Add resolved wrapper functions |
| `src/members/server/member.ts` | Minimal — semantics change (URL → key) |
| `src/routes/api/uploads/$.ts` | Add S3 redirect path |
| `prisma/migrations/*/migration.sql` | Strip `/api/uploads/` prefix from existing data |
| `test/setup.ts` | Update mock return values |
| `src/lib/storage.test.ts` | Rewrite for unstorage |
| `src/members/server/member.test.ts` | Update assertions |
| `.env.sample` | Add new env vars with documentation |
| `docker-compose.yml` | Add optional SeaweedFS service for local S3 testing |
| `docker-compose.production.yml` | Add S3 env var comments + optional SeaweedFS service |
| `docs/01-deployment.md` | Add S3/SeaweedFS setup section |
| `docs/04-architecture.md` | Update tech stack and env vars tables |
| `.agents/rules/patterns.md` | Update File Storage section |
| `.agents/rules/deployment.md` | Update storage reference |
| `AGENTS.md` | Update tech stack references |

## Verification

1. **Unit tests**: `pnpm test:run` — all storage and member tests pass
2. **Type check**: `pnpm typecheck` — no type errors
3. **Lint**: `pnpm lint` — clean
4. **Local provider E2E**: Start app with `STORAGE_PROVIDER=local`, upload an avatar, verify it displays correctly, delete member and verify file is removed
5. **S3 provider E2E**: Start SeaweedFS via docker-compose, set `STORAGE_PROVIDER=s3` with SeaweedFS credentials, upload an avatar, verify it's served from S3 URL
6. **Migration**: Run `pnpm prisma migrate dev`, verify existing `avatarUrl` values are stripped of `/api/uploads/` prefix
7. **Build**: `pnpm build` — production build succeeds
