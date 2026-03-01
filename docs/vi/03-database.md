# Database

TL;DR: Schema được định nghĩa trong Prisma, dùng `pnpm prisma db push` để sync, `pnpm prisma studio` để duyệt.

## Tổng Quan Schema

Schema database được định nghĩa trong `prisma/schema.prisma`. Bao gồm các models cho authentication, dữ liệu genealogy, và relationships.

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

## Các Lệnh Thường Dùng

### Đẩy Thay Đổi Schema

```bash
pnpm prisma db push
```

Đồng bộ Prisma schema với database. Dùng cho development.

### Generate Prisma Client

```bash
pnpm prisma generate
```

Tạo lại TypeScript types sau khi thay đổi schema.

### Mở Prisma Studio

```bash
pnpm prisma studio
```

Mở giao diện web để duyệt và chỉnh sửa dữ liệu database.

### Tạo Migration

```bash
pnpm prisma migrate dev --name describe_change
```

Tạo file migration cho thay đổi schema. Dùng cho việc theo dõi thay đổi schema.

### Reset Database

```bash
pnpm prisma migrate reset
```

Reset database và chạy lại tất cả migrations. Cảnh báo: xóa tất cả dữ liệu.

### Seed Database

```bash
pnpm prisma db seed
```

Chạy script seed được định nghĩa trong `prisma/seed.ts` để điền dữ liệu mẫu.

## Làm Việc với Prisma

### Trong Loaders

```typescript
import { getDbClient } from '@/lib/db'

export const loader = async () => {
  const db = getDbClient()
  const persons = await db.person.findMany({
    include: {
      relationshipsAsA: true,
      relationshipsAsB: true,
    },
  })
  return { persons }
}
```

### Trong Actions

```typescript
import { getDbClient } from '@/lib/db'

export const action = async ({ request }: ActionArgs) => {
  const db = getDbClient()
  const formData = await request.formData()
  const name = formData.get('name') as string
  
  const person = await db.person.create({
    data: {
      fullName: name,
      gender: 'male',
    },
  })
  
  return { success: true, person }
}
```

### Các Queries

```typescript
import { getDbClient } from '@/lib/db'

const db = getDbClient()

// Find one
const person = await db.person.findUnique({
  where: { id: 'xxx' },
})

// Find many with filter
const persons = await db.person.findMany({
  where: { gender: 'male' },
  orderBy: { birthDate: 'asc' },
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
    type: 'parent',
  },
})
```

## Best Practices

1. **Luôn dùng transactions** cho các thao tác nhiều bước
2. **Validate input** trước khi thao tác database
3. **Dùng Prisma types** thay vì raw queries
4. **Include relations** khi cần, tránh over-fetching
5. **Soft delete** khi phù hợp (thêm trường `deletedAt`)
