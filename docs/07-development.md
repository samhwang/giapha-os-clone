# Development

TL;DR: Create routes in `src/routes/`, add loaders for data fetching, actions for form submissions. Use TanStack Router file-based routing.

## Creating Routes

TanStack Router uses file-based routing. The route file path determines the URL.

### Basic Route

```tsx
// src/routes/about.tsx → /about
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return <div>About Page</div>
}
```

### Nested Routes

```typescript
// src/routes/dashboard/index.tsx → /dashboard
// src/routes/dashboard/settings.tsx → /dashboard/settings
```

### Dynamic Segments

```tsx
// src/routes/dashboard/members/$id.tsx → /dashboard/members/:id
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/members/$id')({
  component: MemberDetailPage,
})

function MemberDetailPage() {
  const { id } = Route.useParams()
  return <div>Member ID: {id}</div>
}
```

## Loaders (Data Fetching)

Loaders run on the server to fetch data before rendering.

```tsx
import { getDbClient } from '@/lib/db'

export const Route = createFileRoute('/dashboard/members')({
  loader: async () => {
    const db = getDbClient()
    const persons = await db.person.findMany({
      include: { details: true },
    })
    return { persons }
  },
  component: MembersPage,
})

function MembersPage() {
  const { persons } = Route.useLoaderData()
  return (
    <ul>
      {persons.map(person => (
        <li key={person.id}>{person.fullName}</li>
      ))}
    </ul>
  )
}
```

## Actions (Form Submissions)

Actions handle form submissions on the server.

```tsx
export const Route = createFileRoute('/dashboard/members/new')({
  component: NewMemberPage,
})

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  
  const person = await db.person.create({
    data: {
      fullName: formData.get('fullName') as string,
      gender: formData.get('gender') as any,
    },
  })
  
  return { success: true, person }
}

function NewMemberPage() {
  const navigate = useNavigate()
  const action = useAction()
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await fetch('?action', {
      method: 'POST',
      body: formData,
    })
    
    navigate({ to: '/dashboard/members' })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

## Authentication

### Checking Auth in Loader

```typescript
export const Route = createFileRoute('/dashboard')({
  loader: async ({ context }) => {
    const session = await context.auth.api.getSession()
    
    if (!session) {
      throw redirect({ to: '/login' })
    }
    
    return { user: session.user }
  },
})
```

### Getting User in Component

```tsx
import { useRouteContext } from '@tanstack/react-router'

function DashboardPage() {
  const { user } = useRouteContext({ from: '/dashboard' })
  return <div>Welcome, {user.name}</div>
}
```

### Role-Based Access

```typescript
export const Route = createFileRoute('/admin')({
  loader: async ({ context }) => {
    const session = await context.auth.api.getSession()
    
    if (session?.user.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
})
```

## Using the Database

Import the Prisma client from `@/lib/db`:

```typescript
import { getDbClient } from '@/lib/db'

const db = getDbClient()

// Query examples
const persons = await db.person.findMany()
const person = await db.person.findUnique({ where: { id: 'xxx' } })
const created = await db.person.create({ data: { ... } })
const updated = await db.person.update({ where: { id: 'xxx' }, data: { ... } })
const deleted = await db.person.delete({ where: { id: 'xxx' } })
```

## Component Organization

### Shared Components

Put reusable components in `src/components/`:

```
src/components/
├── ui/           # Base UI (Button, Input, Card)
├── layout/       # Layout components
└── ...
```

### Feature Components

Co-locate with routes or in `src/features/`:

```
src/features/
├── members/
│   ├── components/
│   └── utils/
└── events/
```

## Running Development Server

```bash
pnpm dev
```

The app runs at `http://localhost:3000`.

## Building for Production

```bash
pnpm build
```

Output goes to `dist/`.
