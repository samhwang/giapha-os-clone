# Route Creation Skill

## Purpose

Create a new TanStack Start route with proper structure including loader, validation, component, and tests.

## Trigger Condition

When user asks to:
- Create a new page/route
- Add a new endpoint
- Create a route file in `src/routes/`

## Workflow

### Step 1: Identify Route Path

Determine the file path based on TanStack Start conventions:
- `/members` → `src/routes/members.tsx`
- `/members/$memberId` → `src/routes/members.$memberId.tsx`
- `/admin/users` → `src/routes/admin.users.tsx`

### Step 2: Create Route File

Create `src/routes/[route-name].tsx` with:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/[route-name]')({
  validateSearch: z.object({
    // search params schema
  }),
  loader: async ({ context }) => {
    // server-side data fetching
    return { data: [] }
  },
})
```

### Step 3: Create Component (if needed)

Create in `src/components/` or co-locate:
- `src/routes/[route-name].components.tsx`

### Step 4: Add Server Functions (if needed)

Create in `src/*/server/`:
- `src/*/server/[feature].ts`

### Step 5: Create Tests

Create co-located test: `src/routes/[route-name].test.tsx`

## Checklist

- [ ] Route file follows TanStack Start `createFileRoute` pattern
- [ ] Loader uses Prisma for database queries
- [ ] Search params validated with Zod
- [ ] Component uses `Route.useLoaderData()` for data access
- [ ] Tests cover happy path and error cases
- [ ] Passes `pnpm typecheck` and `pnpm lint`

## Examples

### Member List Route

```typescript
// src/routes/members.tsx
import { createFileRoute } from '@tanstack/react-router'
import { membersOptions } from '@/members/server/member'

export const Route = createFileRoute('/members')({
  loader: async ({ context }) => {
    return await context.members.getAllMembers()
  },
})

export default function MembersPage() {
  const members = Route.useLoaderData()
  return <MembersList members={members} />
}
```

### Member Detail Route

```typescript
// src/routes/members.$memberId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const memberParamsSchema = z.object({
  memberId: z.string(),
})

export const Route = createFileRoute('/members/$memberId')({
  validateSearch: z.object({
    tab: z.enum(['overview', 'family', 'events']).default('overview'),
  }),
  loader: async ({ params, context }) => {
    const { memberId } = memberParamsSchema.parse(params)
    return await context.members.getMemberById(memberId)
  },
})

export default function MemberDetailPage() {
  const { memberId } = Route.useParams()
  const member = Route.useLoaderData()
  const search = Route.useSearch()
  
  return <MemberProfile member={member} activeTab={search.tab} />
}
```

## Notes

- Route files use `.tsx` extension (JSX required)
- Use `$` prefix for dynamic path segments
- Co-locate related components and tests
- Follow existing route patterns in `src/routes/`
