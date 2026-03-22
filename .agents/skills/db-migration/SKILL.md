---
name: db-migration
description: Manage Prisma schema changes and database migrations
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: database-management
---

# Database Migration Skill

## Purpose

Manage Prisma schema changes, migrations, and database seeding for the project.

## Trigger Condition

When user asks to:
- Add a new model/table
- Modify existing schema
- Run migrations
- Seed database

## Workflow

### Step 1: Edit Schema

Edit `prisma/schema.prisma`:
```prisma
model NewModel {
  id        String   @id @default(cuid())
  field     String
  relation  Relation @relation(fields: [relationId], references: [id])
  relationId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([field])
}
```

### Step 2: Generate Migration

```bash
pnpm prisma migrate dev --name describe_change
```

### Step 3: Generate Client

```bash
pnpm prisma generate
```

### Step 4: Verify

```bash
pnpm prisma studio  # Review changes
pnpm typecheck      # Ensure types compile
```

### Step 5: Seed (if needed)

Edit `prisma/seed.ts` and run:
```bash
pnpm prisma db seed
```

## Checklist

- [ ] Schema follows Prisma conventions
- [ ] Relations properly defined
- [ ] Indexes added for frequently queried fields
- [ ] Migration name is descriptive (snake_case)
- [ ] Client regenerated after migration
- [ ] Types compile without errors
- [ ] Seed data updated (if applicable)

## Patterns

### Adding a Model

```prisma
model Event {
  id          String   @id @default(cuid())
  memberId    String
  member      Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  eventType   EventType
  date        DateTime
  lunarDate   String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([memberId])
  @@index([eventType, date])
}
```

### Adding a Relation

```prisma
// One-to-Many
model Family {
  id      String    @id @default(cuid())
  members Member[]
}

model Member {
  id        String  @id @default(cuid())
  familyId  String
  family    Family  @relation(fields: [familyId], references: [id])
}

// Many-to-Many (implicit)
model Member {
  id          String     @id @default(cuid())
  relationshipsFrom MemberRelation[] @relation("FromMember")
  relationshipsTo   MemberRelation[] @relation("ToMember")
}

model MemberRelation {
  id          String  @id @default(cuid())
  fromMemberId String
  toMemberId   String
  fromMember   Member  @relation("FromMember", fields: [fromMemberId], references: [id])
  toMember     Member  @relation("ToMember", fields: [toMemberId], references: [id])
  relationType RelationType

  @@unique([fromMemberId, toMemberId, relationType])
}
```

### Enum Type

```prisma
enum EventType {
  BIRTH
  DEATH
  MARRIAGE
  OTHER
}

enum RelationType {
  PARENT
  CHILD
  SPOUSE
  SIBLING
}
```

### Seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from '../src/database/generated/prisma/client'

async function main() {
  const db = new PrismaClient({ adapter })
  const family = await db.family.create({
    data: {
      name: 'Nguyen Family',
      members: {
        create: [
          { firstName: 'Minh', lastName: 'Nguyen', gender: 'MALE' },
          { firstName: 'Lan', lastName: 'Nguyen', gender: 'FEMALE' },
        ],
      },
    },
  })
  console.log('Created family:', family.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
```

## Commands Reference

| Command | Purpose |
|---------|---------|
| `pnpm prisma migrate dev --name name` | Create and apply migration |
| `pnpm prisma migrate deploy` | Apply migrations (production) |
| `pnpm prisma migrate reset` | Reset database (dev only) |
| `pnpm prisma db push` | Push schema without migration |
| `pnpm prisma generate` | Generate Prisma Client |
| `pnpm prisma studio` | GUI for database |
| `pnpm prisma db seed` | Run seed script |

## Notes

- Always use migrations in team environments
- Use `db push` for quick local prototyping only
- Add indexes for query performance
- Use enums for fixed sets of values
- Include `onDelete: Cascade` for child records
- Run `pnpm typecheck` after generating client
