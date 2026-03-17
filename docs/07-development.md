# Development

TL;DR: Create routes in `src/routes/`, add loaders for data fetching. Use TanStack Form for submissions and server functions for backend logic. Code is organized by domain module.

## Route Map

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/about` | About page |
| `/login` | Login/register |
| `/dashboard` | Main dashboard (family tree, stats) |
| `/dashboard/members` | Member list |
| `/dashboard/members/new` | Create member |
| `/dashboard/members/$id` | Member detail |
| `/dashboard/members/$id/edit` | Edit member |
| `/dashboard/events` | Events management |
| `/dashboard/kinship` | Kinship finder |
| `/dashboard/lineage` | Lineage order |
| `/dashboard/stats` | Family statistics |
| `/dashboard/data` | Data import/export |
| `/dashboard/users` | Admin user management |

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
// src/routes/dashboard/events.tsx → /dashboard/events
```

### Dynamic Segments

```tsx
// src/routes/dashboard/members/$id/index.tsx → /dashboard/members/:id
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/members/$id/')({
  component: MemberDetailPage,
})

function MemberDetailPage() {
  const { id } = Route.useParams()
  return <div>Member ID: {id}</div>
}
```

## Loaders (Data Fetching)

Loaders run on the server to fetch data before rendering. Data fetching is done via server functions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import * as memberFns from '../../members/server/member'

export const Route = createFileRoute('/dashboard/members/')({
  loader: () => memberFns.getMembers(),
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

## Server Functions

Server functions use `createServerFn` with middleware for auth:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { isUserMiddleware } from '../../auth/server/middleware'
import { findAllPersons } from '../repository/person'

export const getMembers = createServerFn()
  .middleware([isUserMiddleware])
  .handler(async () => {
    return findAllPersons()
  })
```

## Forms (TanStack Form)

This project uses TanStack Form for type-safe form handling.

### Validation Strategy

- **Calling server functions**: No form validators needed — server functions already validate with `.inputValidator()` or `.validator()`
- **Calling external APIs**: Add Zod validators to the form (e.g., Better Auth client)

### Creating a Form Hook

Create a form hook in your domain's hooks directory:

```tsx
// src/admin/hooks/useAdminForm.ts
import { createFormHook, createFormHookContexts } from '@tanstack/react-form-start';

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm: useAdminForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});
```

### Using the Form (Server Function)

```tsx
import { useAdminForm } from '../hooks/useAdminForm';
import { createUser } from '../server/user';

function CreateUserForm() {
  const form = useAdminForm({
    defaultValues: {
      email: '',
      password: '',
      role: 'member',
    },
    // No validators - server function handles validation
    onSubmit: async ({ value }) => {
      await createUser({ data: value });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.AppField name="email">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.AppField>
      <button type="submit">Create</button>
    </form>
  );
}
```

### Using the Form (External API)

```tsx
import * as z from 'zod';
import { authClient } from '../../auth/client';

const Login = z.object({
  email: z.email(),
  password: z.string().min(1),
});

function LoginForm() {
  const form = useAuthForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: Login,  // Validators needed for external API
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email({ email: value.email, password: value.password });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {/* ...fields */}
    </form>
  );
}
```

**Key points:**
- Server functions already validate — no form validators needed
- External APIs (e.g., Better Auth) need Zod validators in `validators.onSubmit`
- Forms use `form.AppField` with render props for controlled inputs
- Use `field.handleChange(value)` to update field values
- Use `form.state.isSubmitting` for loading state

## Authentication

### Checking Auth in Loader

```typescript
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
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
export const Route = createFileRoute('/dashboard/users')({
  beforeLoad: async ({ context }) => {
    if (context.user?.role !== 'admin') {
      throw redirect({ to: '/dashboard' })
    }
  },
})
```

## Using the Database

Use repository functions co-located with domain modules instead of calling Prisma directly:

```typescript
import { findAllPersons, findPersonById, createPerson, updatePerson, deletePerson } from '../repository/person'

// Query examples
const persons = await findAllPersons()
const person = await findPersonById('xxx')
const created = await createPerson({ data: { fullName: 'Name', gender: 'male' } })
const updated = await updatePerson('xxx', { fullName: 'New' })
const deleted = await deletePerson('xxx')
```

## Component Organization

### Domain Components

Components live in their domain module:

```
src/{domain}/components/    # Domain-specific components
src/{domain}/hooks/         # TanStack Form hooks, custom hooks
src/{domain}/server/        # Server functions
src/{domain}/utils/         # Pure utility functions
```

### Shared UI Components

Reusable non-domain components live in `src/ui/`:

```
src/ui/
├── common/       # LanguageSwitcher, ExportButton
├── icons/        # GenderIcons, DefaultAvatar
├── layout/       # Footer, HeaderMenu, LogoutButton, LandingHero
└── utils/        # cn() class merge utility, gender style helpers
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
