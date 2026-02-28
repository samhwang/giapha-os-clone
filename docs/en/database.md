# Database

TL;DR: Schema defined in Prisma, use `pnpm prisma db push` to sync, `pnpm prisma studio` to browse.

## Schema Overview

The database schema is defined in `prisma/schema.prisma`. It includes models for authentication, genealogy data, and relationships.

### Authentication Models

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  identifier String
  value      String
  expires    DateTime
  
  @@id([identifier, value])
}
```

### Genealogy Models

```prisma
model Person {
  id              String   @id @default(cuid())
  fullName        String
  gender          Gender
  birthDate       DateTime?
  birthPlace      String?
  deathDate       DateTime?
  deathPlace      String?
  avatar          String?
  generation      Int      @default(1)
  birthOrder      Int      @default(0)
  isAlive         Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  details         PersonDetailsPrivate?
  relationshipsAsA Relationship[] @relation("PersonA")
  relationshipsAsB Relationship[] @relation("PersonB")
}

model PersonDetailsPrivate {
  id          String  @id @default(cuid())
  personId    String  @unique
  phone       String?
  address     String?
  job         String?
  notes       String?
  
  person      Person  @relation(fields: [personId], references: [id], onDelete: Cascade)
}

enum Gender {
  male
  female
  other
}

model Relationship {
  id          String   @id @default(cuid())
  personAId   String
  personBId   String
  type        RelationshipType
  createdAt   DateTime @default(now())
  
  personA     Person   @relation("PersonA", fields: [personAId], references: [id], onDelete: Cascade)
  personB     Person   @relation("PersonB", fields: [personBId], references: [id], onDelete: Cascade)
  
  @@unique([personAId, personBId, type])
}

enum RelationshipType {
  parent
  child
  spouse
}
```

## Common Commands

### Push Schema Changes

```bash
pnpm prisma db push
```

Syncs the Prisma schema to the database. Use for development.

### Generate Prisma Client

```bash
pnpm prisma generate
```

Regenerates the TypeScript types after schema changes.

### Open Prisma Studio

```bash
pnpm prisma studio
```

Opens a web interface to browse and edit database data.

### Create Migration

```bash
pnpm prisma migrate dev --name describe_change
```

Creates a migration file for schema changes. Use for tracked schema evolution.

### Reset Database

```bash
pnpm prisma migrate reset
```

Resets the database and re-runs all migrations. Warning: deletes all data.

### Seed Database

```bash
pnpm prisma db seed
```

Runs the seed script defined in `prisma/seed.ts` to populate sample data.

## Working with Prisma

### In Loaders

```typescript
import { prisma } from '@/lib/db'

export const loader = async () => {
  const persons = await prisma.person.findMany({
    include: {
      relationshipsAsA: true,
      relationshipsAsB: true,
    },
  })
  return { persons }
}
```

### In Actions

```typescript
export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const name = formData.get('name') as string
  
  const person = await prisma.person.create({
    data: {
      fullName: name,
      gender: 'male',
    },
  })
  
  return { success: true, person }
}
```

### Queries

```typescript
// Find one
const person = await prisma.person.findUnique({
  where: { id: 'xxx' },
})

// Find many with filter
const persons = await prisma.person.findMany({
  where: { gender: 'male' },
  orderBy: { birthDate: 'asc' },
})

// Update
await prisma.person.update({
  where: { id: 'xxx' },
  data: { fullName: 'New Name' },
})

// Delete
await prisma.person.delete({
  where: { id: 'xxx' },
})

// Relationships
await prisma.relationship.create({
  data: {
    personAId: 'parent-id',
    personBId: 'child-id',
    type: 'parent',
  },
})
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Validate input** before database operations
3. **Use Prisma types** instead of raw queries
4. **Include relations** when needed, avoid over-fetching
5. **Soft delete** where appropriate (add `deletedAt` field)
