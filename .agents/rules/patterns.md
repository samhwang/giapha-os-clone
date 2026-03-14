# Tech Stack Patterns

## TanStack Start

### Route Files

Routes use file-based routing with `createFileRoute`:

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    // Runs on server — fetch data with Prisma
    const persons = await prisma.person.findMany();
    return { persons };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { persons } = Route.useLoaderData();
  return <div>{/* render */}</div>;
}
```

### Server Functions

Replace Next.js Server Actions with `createServerFn`:

```tsx
import { createServerFn } from '@tanstack/react-start';

export const createPerson = createServerFn({ method: 'POST' })
  .validator((data: CreatePersonInput) => data)
  .handler(async ({ data }) => {
    return prisma.person.create({ data });
  });
```

### Middleware

Use TanStack Start middleware for auth guards. The app separates auth logic from middleware:

#### Auth Library (`src/server/auth/lib.ts`)

Inner logic functions that perform the actual auth checks:

```tsx
import { auth } from 'better-auth';
import { getHeaders } from '@tanstack/react-start/server';

export async function requireSession(): Promise<Session> {
  const session = await auth.api.getSession({ headers: getHeaders() });
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function requireUser(): Promise<User> {
  const session = await requireSession();
  if (!session.user) throw new Error('Unauthorized');
  return session.user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'admin') throw new Error('Từ chối truy cập.');
  return user;
}
```

#### Middleware (`src/server/auth/middleware.ts`)

TanStack Start middlewares that use the auth library:

```tsx
import { createMiddleware } from '@tanstack/react-start';
import { getHeaders } from '@tanstack/react-start/server';
import { auth } from 'better-auth';
import { requireSession, requireUser, requireAdmin } from './lib';

export const isSessionMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await requireSession();
  return next({ context: { session } });
});

export const isUserMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await requireUser();
  return next({ context: { user } });
});

export const isAdminMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await requireAdmin();
  return next({ context: { user } });
});
```

#### Usage in Server Functions

```tsx
import { createServerFn } from '@tanstack/react-start';
import { isAdminMiddleware } from '@/server/auth/middleware';

export const exportData = createServerFn({ method: 'GET' })
  .middleware([isAdminMiddleware])
  .handler(async () => {
    // Handler logic
  });
```

## TanStack Router

### Dynamic Routes

Use `$param` prefix for dynamic segments:

- `src/routes/dashboard/members/$id.tsx` → `/dashboard/members/:id`
- Access params: `const { id } = Route.useParams()`

### Navigation

```tsx
import { Link, useNavigate } from '@tanstack/react-router';

// Declarative
<Link to="/dashboard/members/$id" params={{ id: person.id }}>View</Link>

// Programmatic
const navigate = useNavigate();
navigate({ to: '/dashboard/members/$id', params: { id } });
```

### Search Params

```tsx
// In route definition
export const Route = createFileRoute('/dashboard/')({
  validateSearch: (search) => ({
    view: search.view as 'tree' | 'list' | 'mindmap' ?? 'tree',
    root: search.root as string ?? null,
  }),
});

// In component
const { view, root } = Route.useSearch();
const navigate = useNavigate();
navigate({ search: { view: 'mindmap' } });
```

## Prisma

### Query Patterns

```tsx
// Include relations
const person = await prisma.person.findUnique({
  where: { id },
  include: { privateDetails: true, relationsA: true, relationsB: true },
});

// Transactions for multi-step operations
await prisma.$transaction([
  prisma.person.delete({ where: { id } }),
  prisma.personDetailsPrivate.deleteMany({ where: { personId: id } }),
]);
```

### Error Handling

```tsx
import { Prisma } from '@/generated/prisma';

try {
  await prisma.person.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
    }
  }
  throw error;
}
```

## Better Auth

### Client Usage

```tsx
import { authClient } from '@/lib/auth-client';

// Sign up
await authClient.signUp.email({ email, password, name });

// Sign in
await authClient.signIn.email({ email, password });

// Sign out
await authClient.signOut();

// Get session (React hook)
const { data: session } = authClient.useSession();
```

### Protected Routes

Use `beforeLoad` in route definitions:

```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.user) throw redirect({ to: '/login' });
    if (!context.user.isActive) throw redirect({ to: '/login' });
  },
});
```

## Tailwind CSS v4

### Custom Button Styles

The app uses custom button classes defined in `globals.css`:

- `.btn` — Base button (white with stone border)
- `.btn-primary` — Amber gradient button
- `.btn-secondary` — Stone gradient button

### Gender-based Colors

- Male: `bg-sky-50`, `text-sky-700`, `border-sky-200`
- Female: `bg-rose-50`, `text-rose-700`, `border-rose-200`
- Other: `bg-stone-50`, `text-stone-700`, `border-stone-200`

### Responsive Patterns

- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Common pattern: single column on mobile, multi-column on desktop

## Animations

Use Tailwind CSS utilities and custom keyframes defined in `src/styles.css`.

### Custom Keyframes

Available animations: `fade-in`, `fade-in-up`, `scale-in` (defined in `src/styles.css`).

### Usage Patterns

```tsx
// Arbitrary animation with Tailwind
<div className="animate-[fade-in-up_0.6s_ease-out_forwards]">

// Transitions for hover/focus states
<button className="transition-all duration-300 hover:scale-105 hover:shadow-md">

// Combine with delay via style attribute for stagger effects
<div
  className="animate-[fade-in-up_0.6s_ease-out_forwards]"
  style={{ animationDelay: `${index * 50}ms` }}
>
```

## File Storage

### Upload Pattern

Avatar files are stored on the local filesystem under `UPLOAD_DIR` (default `./uploads`):

```tsx
import fs from 'node:fs/promises';
import path from 'node:path';

// Upload
const dir = path.join(UPLOAD_DIR, 'avatars', personId);
await fs.mkdir(dir, { recursive: true });
await fs.writeFile(path.join(dir, filename), buffer);

// Delete
await fs.unlink(path.join(UPLOAD_DIR, key));
```

### Public URL Construction

Files are served via an API route and stored as relative paths in the database:

```
/api/uploads/avatars/${personId}/${filename}
```
