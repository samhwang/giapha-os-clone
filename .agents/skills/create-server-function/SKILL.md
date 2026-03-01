# Server Function CRUD Skill

## Purpose

Create a new server function with Zod validation, Prisma integration, and Better Auth patterns.

## Trigger Condition

When user asks to:
- Create API endpoint
- Add CRUD operations
- Create server function in `src/*/server/`

## Workflow

### Step 1: Choose Location

Server functions live in feature directories:
- Member-related → `src/members/server/`
- Admin-related → `src/admin/server/`
- Relationship-related → `src/relationships/server/`
- Event-related → `src/events/server/`

### Step 2: Create Server Function File

Create `src/*/server/[feature].ts`:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

const [getItems, createItem] = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    return z.object({
      // input schema
    }).parse(data)
  })
  .handler(async ({ data, context }) => {
    // implementation
  })

export const itemFns = {
  getItems,
  createItem,
}
```

### Step 3: Register in Context (if new feature)

Add to `src/lib/get-server-context.tsx`:
```typescript
import * as itemFns from '@/items/server/item'

export function getServerRouteHelpers() {
  return {
    items: itemFns,
  }
}
```

### Step 4: Create Tests

Create: `src/*/server/[feature].test.ts`

## Checklist

- [ ] Uses `createServerFn` from `@tanstack/react-start`
- [ ] Input validated with Zod `.validator()`
- [ ] Uses Prisma for database operations
- [ ] Includes proper error handling
- [ ] Tests cover success and error paths
- [ ] Passes `pnpm typecheck` and `pnpm lint`

## Patterns

### Read Function

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/lib/db'

const getMemberById = createServerFn({ method: 'GET' })
  .validator((data: unknown) => z.string().parse(data))
  .handler(async ({ data: memberId }) => {
    const member = await db.member.findUnique({
      where: { id: memberId },
    })
    if (!member) {
      throw new Error('Member not found')
    }
    return member
  })
```

### Write Function (with Auth)

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

const createMember = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      birthDate: z.string().optional(),
    }).parse(data)
  })
  .handler(async ({ data }) => {
    const session = await auth()
    if (!session) {
      throw new Error('Unauthorized')
    }
    return db.member.create({
      data: {
        ...data,
        familyId: session.user.familyId,
      },
    })
  })
```

### List with Pagination

```typescript
const listMembers = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    return z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }).parse(data)
  })
  .handler(async ({ data: { page, limit, search } }) => {
    const where = search
      ? { OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ]}
      : {}
    
    const [members, total] = await Promise.all([
      db.member.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created' },
      }),
At: 'desc      db.member.count({ where }),
    ])
    
    return { members, total, page, totalPages: Math.ceil(total / limit) }
  })
```

## Notes

- Always validate inputs with Zod
- Use `auth()` from `@/lib/auth` for protected routes
- Use `db` from `@/lib/db` for Prisma operations
- Export functions in a named object for clean imports
- Follow naming: `getXxx`, `createXxx`, `updateXxx`, `deleteXxx`, `listXxx`
