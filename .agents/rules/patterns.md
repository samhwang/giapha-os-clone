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

Use TanStack Start middleware for auth guards:

```tsx
import { createMiddleware } from '@tanstack/react-start';

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await auth.api.getSession({ headers: getHeaders() });
  if (!session) throw redirect({ to: '/login' });
  return next({ context: { user: session.user } });
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
import { Prisma } from '@prisma/client';

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

## Framer Motion

### Animation Patterns

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Fade in
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

// List items with stagger
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
```

## S3/Garage Storage

### Upload Pattern

```tsx
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'garage',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

// Upload
await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET,
  Key: `avatars/${personId}/${filename}`,
  Body: buffer,
  ContentType: contentType,
}));
```

### Public URL Construction

```
${S3_ENDPOINT}/${S3_BUCKET}/avatars/${personId}/${filename}
```
