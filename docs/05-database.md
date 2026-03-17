# Database

TL;DR: Schema defined in Prisma, use `pnpm prisma:push` to sync, `pnpm prisma studio` to browse.

## Schema Overview

The database schema is defined in `prisma/schema.prisma`. Prisma generates TypeScript types to `src/database/generated/prisma`. The schema uses `@@map` annotations to map camelCase Prisma field names to snake_case database column names.

### Enums

```prisma
enum Gender {
  male
  female
  other
}

enum RelationshipType {
  marriage
  biological_child
  adopted_child
}

enum UserRole {
  admin
  editor
  member
}
```

### Authentication Models (Better Auth Managed)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  emailVerified Boolean   @default(false) @map("email_verified")
  image         String?
  role          UserRole  @default(member)
  isActive      Boolean   @default(false) @map("is_active")
  timeZone      String?   @map("time_zone")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  sessions      Session[]
  accounts      Account[]

  @@map("users")
}

model Account {
  id                    String    @id @default(uuid())
  userId                String    @map("user_id")
  accountId             String    @map("account_id")
  providerId            String    @map("provider_id")
  accessToken           String?   @map("access_token")
  refreshToken          String?   @map("refresh_token")
  accessTokenExpiresAt  DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope                 String?
  idToken               String?   @map("id_token")
  password              String?
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
  @@index([userId])
}

model Session {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
  @@index([userId])
}

model Verification {
  id         String    @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime  @map("expires_at")
  createdAt  DateTime? @default(now()) @map("created_at")
  updatedAt  DateTime? @updatedAt @map("updated_at")

  @@map("verifications")
  @@index([identifier])
}
```

### Domain Models

```prisma
model Person {
  id              String                @id @default(uuid())
  fullName        String                @map("full_name")
  gender          Gender                @default(male)
  birthYear       Int?                  @map("birth_year")
  birthMonth      Int?                  @map("birth_month")
  birthDay        Int?                  @map("birth_day")
  deathYear       Int?                  @map("death_year")
  deathMonth      Int?                  @map("death_month")
  deathDay        Int?                  @map("death_day")
  deathLunarYear  Int?                  @map("death_lunar_year")
  deathLunarMonth Int?                  @map("death_lunar_month")
  deathLunarDay   Int?                  @map("death_lunar_day")
  isDeceased      Boolean               @default(false) @map("is_deceased")
  isInLaw         Boolean               @default(false) @map("is_in_law")
  birthOrder      Int?                  @map("birth_order")
  generation      Int?
  otherNames      String?               @map("other_names")
  avatarUrl       String?               @map("avatar_url")
  note            String?
  createdAt       DateTime              @default(now()) @map("created_at")
  updatedAt       DateTime              @updatedAt @map("updated_at")
  privateDetails  PersonDetailsPrivate?
  relationsA      Relationship[]        @relation("personA")
  relationsB      Relationship[]        @relation("personB")

  @@map("persons")
  @@index([generation])
  @@index([isDeceased])
  @@index([birthYear])
  @@index([isInLaw])
}

model PersonDetailsPrivate {
  personId         String   @id @map("person_id")
  person           Person   @relation(fields: [personId], references: [id], onDelete: Cascade)
  phoneNumber      String?  @map("phone_number")
  occupation       String?
  currentResidence String?  @map("current_residence")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  @@map("person_details_private")
}

model Relationship {
  id        String           @id @default(uuid())
  type      RelationshipType
  personA   Person           @relation("personA", fields: [personAId], references: [id], onDelete: Cascade)
  personAId String           @map("person_a")
  personB   Person           @relation("personB", fields: [personBId], references: [id], onDelete: Cascade)
  personBId String           @map("person_b")
  note      String?
  createdAt DateTime         @default(now()) @map("created_at")
  updatedAt DateTime         @updatedAt @map("updated_at")

  @@unique([personAId, personBId, type])
  @@map("relationships")
}

model CustomEvent {
  id        String   @id @default(uuid())
  name      String
  eventDate String   @map("event_date")
  location  String?
  content   String?
  createdBy String?  @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("custom_events")
}
```

## Common Commands

### Push Schema Changes

```bash
pnpm prisma:push
```

Syncs the Prisma schema to the database. Use for development.

### Generate Prisma Client

```bash
pnpm prisma:generate
```

Regenerates the TypeScript types to `src/database/generated/prisma` after schema changes.

### Open Prisma Studio

```bash
pnpm prisma studio
```

Opens a web interface to browse and edit database data.

### Create Migration

```bash
pnpm prisma:migrate:dev
```

Creates a migration file for schema changes. Use for tracked schema evolution.

### Reset Database

```bash
pnpm prisma migrate reset
```

Resets the database and re-runs all migrations. Warning: deletes all data.

### Seed Database

```bash
pnpm prisma:seed
```

Runs the seed script defined in `prisma/seed.ts` to populate sample data.

## Repository Layer

All database operations go through repository functions co-located with their domain modules. Server functions import from these repositories instead of calling Prisma directly. This decouples business logic from the ORM — if the ORM is replaced, only the repository files need to change.

### Structure

Repository files live alongside their domain server functions:

```
src/database/
├── generated/prisma/      # Prisma generated client (auto-generated)
├── lib/
│   └── client.ts          # getDbClient() singleton
└── transaction.ts         # DbClient type + withTransaction helper

src/members/server/
└── repository/person.ts   # Person + PersonDetailsPrivate operations

src/relationships/server/
└── repository/relationship.ts  # Relationship operations

src/events/server/
└── repository/custom-event.ts  # CustomEvent operations

src/admin/server/
└── repository/user.ts     # User operations
```

### Usage in Server Functions

```typescript
import { createPerson, findPersonById } from '../repository/person';
import { withTransaction } from '../../database/transaction';

// Simple query
const person = await findPersonById(id);

// Create
const newPerson = await createPerson({ fullName: 'Nguyễn Văn A', gender: 'male' });

// Transaction (pass tx client to repository functions)
await withTransaction(async (tx) => {
  await deleteAllRelationships(tx);
  await deleteAllPersons(tx);
  await createManyPersons(data, tx);
});
```

### Repository Function Pattern

Each function accepts an optional `client` parameter that defaults to `getDbClient()`. Pass `tx` from a transaction for transactional operations:

```typescript
import { getDbClient } from '../../database/lib/client';
import type { DbClient } from '../../database/transaction';

export function findPersonById(id: string, client: DbClient = getDbClient()) {
  return client.person.findUnique({ where: { id }, include: { privateDetails: true } });
}
```

### Available Repositories

| File | Entity | Operations |
|------|--------|------------|
| `members/server/repository/person.ts` | Person, PersonDetailsPrivate | create, update, find, delete, batch update, upsert private details |
| `relationships/server/repository/relationship.ts` | Relationship | create, delete, find by participants, find for person, count |
| `events/server/repository/custom-event.ts` | CustomEvent | create, update, delete, find all |
| `admin/server/repository/user.ts` | User | count, find by email, find all, update, delete |
| `database/transaction.ts` | — | `withTransaction` helper, `DbClient` type |

## Best Practices

1. **Use repository functions** — never call `db.entity.operation()` directly in server files
2. **Always use transactions** for multi-step operations via `withTransaction`
3. **Validate input** before database operations
4. **Use Prisma types** from `src/database/generated/prisma` instead of raw queries
5. **Include relations** when needed, avoid over-fetching
6. **Use `@@map`** to keep Prisma field names camelCase while database columns stay snake_case
