# Database

TL;DR: Schema defined in Prisma, use `pnpm prisma:push` to sync, `pnpm prisma studio` to browse.

## Schema Overview

The database schema is defined in `prisma/schema.prisma`. Prisma generates TypeScript types to `src/generated/prisma`. The schema uses `@@map` annotations to map camelCase Prisma field names to snake_case database column names.

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

Regenerates the TypeScript types to `src/generated/prisma` after schema changes.

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

## Working with Prisma

### In Server Functions

```typescript
import { getDbClient } from '../../lib/db'

const db = getDbClient()
const persons = await db.person.findMany({
  include: {
    relationsA: true,
    relationsB: true,
  },
})
```

### Queries

```typescript
import { getDbClient } from '../../lib/db'

const db = getDbClient()

// Find one
const person = await db.person.findUnique({
  where: { id: 'xxx' },
})

// Find many with filter
const persons = await db.person.findMany({
  where: { gender: 'male' },
  orderBy: { birthYear: 'asc' },
})

// Update
await db.person.update({
  where: { id: 'xxx' },
  data: { fullName: 'New Name' },
})

// Delete
await db.person.delete({
  where: { id: 'xxx' },
})

// Relationships
await db.relationship.create({
  data: {
    personAId: 'parent-id',
    personBId: 'child-id',
    type: 'biological_child',
  },
})
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Validate input** before database operations
3. **Use Prisma types** from `../../generated/prisma` instead of raw queries
4. **Include relations** when needed, avoid over-fetching
5. **Use `@@map`** to keep Prisma field names camelCase while database columns stay snake_case
