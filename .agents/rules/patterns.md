# Tech Stack Patterns

## TanStack Start

### Route Files

Routes use file-based routing with `createFileRoute`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  loader: async () => {
    const [persons, customEvents] = await Promise.all([getPersons(), getCustomEvents()]);
    return { persons, customEvents };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { persons, customEvents } = Route.useLoaderData();
  return <div>{/* render */}</div>;
}
```

### Server Functions

Replace Next.js Server Actions with `createServerFn`:

```tsx
import { createServerFn } from "@tanstack/react-start";

export const createPerson = createServerFn({ method: "POST" })
  .validator((data: CreatePersonInput) => data)
  .handler(async ({ data }) => {
    return db.person.create({ data });
  });
```

### Middleware

Use TanStack Start middleware for auth guards. The app separates auth logic from middleware:

#### Auth Library (`src/auth/server/lib.ts`)

Inner logic functions that perform the actual auth checks:

```tsx
import { auth } from "better-auth";
import { getHeaders } from "@tanstack/react-start/server";

export async function requireSession(): Promise<Session> {
  const session = await auth.api.getSession({ headers: getHeaders() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireUser(): Promise<User> {
  const session = await requireSession();
  if (!session.user) throw new Error("Unauthorized");
  return session.user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Từ chối truy cập.");
  return user;
}
```

#### Middleware (`src/auth/server/middleware.ts`)

TanStack Start middlewares that use the auth library:

```tsx
import { createMiddleware } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "better-auth";
import { requireSession, requireUser, requireAdmin } from "./lib";

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
import { createServerFn } from "@tanstack/react-start";
import { isAdminMiddleware } from "../../auth/server/middleware";

export const exportData = createServerFn({ method: "GET" })
  .middleware([isAdminMiddleware])
  .handler(async () => {
    // Handler logic
  });
```

## TanStack Query

[TanStack Query](https://tanstack.com/query/latest) manages server state on the client: caching, background refetching, and mutation side effects.

### Query Key Factory

All query keys live in `src/lib/queryKeys.ts`:

```ts
import { queryKeys } from "../../lib/queryKeys";

// Usage
queryKeys.persons.all; // ['persons']
queryKeys.persons.detail(id); // ['person', id]
queryKeys.relationships.forPerson(personId); // ['relationships', personId]
```

Always use factory keys — never hand-write key arrays.

### useQuery

```tsx
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";

const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.persons.detail(memberId ?? ""),
  queryFn: () => getPersonById({ data: { id: memberId! } }),
  enabled: !!memberId, // conditional fetching
});
```

### useMutation + Invalidation

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data: CreatePersonInput) => createPerson({ data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
  },
});
```

For mutations that affect loader data, use `router.invalidate()` instead:

```tsx
const router = useRouter();
const handleChange = useCallback(() => {
  router.invalidate();
}, [router]);
```

### When to Use What

| Scenario                                                   | Approach                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| Data loaded in route loader, no client-side refetch needed | `Route.useLoaderData()` only                                 |
| Data fetched on demand (modals, conditional UI)            | `useQuery` with `enabled` flag                               |
| Write operations (create, update, delete)                  | `useMutation` + `invalidateQueries` or `router.invalidate()` |

## TanStack Router

### Dynamic Routes

Use `$param` prefix for dynamic segments:

- `src/routes/dashboard/members/$id.tsx` → `/dashboard/members/:id`
- Access params: `const { id } = Route.useParams()`

### Navigation

```tsx
import { Link, useNavigate } from "@tanstack/react-router";

// Declarative
<Link to="/dashboard/members/$id" params={{ id: person.id }}>
  View
</Link>;

// Programmatic
const navigate = useNavigate();
navigate({ to: "/dashboard/members/$id", params: { id } });
```

### Search Params

```tsx
// In route definition
export const Route = createFileRoute("/dashboard/")({
  validateSearch: (search) => ({
    view: (search.view as "tree" | "list" | "mindmap") ?? "tree",
    root: (search.root as string) ?? null,
  }),
});

// In component
const { view, root } = Route.useSearch();
const navigate = useNavigate();
navigate({ search: { view: "mindmap" } });
```

## TanStack Form

Forms use `@tanstack/react-form-start` for type-safe form handling.

### Validation Strategy

- **Calling server functions**: If the form calls a server function that already has `.inputValidator()` or `.validator()`, the form does NOT need Zod validators
- **Calling external APIs**: If the form calls an external API (e.g., Better Auth client), add Zod validators to the form

### Create Form Hook

Create a hook file per feature domain:

```tsx
// src/admin/hooks/useAdminForm.ts
import { createFormHook, createFormHookContexts } from "@tanstack/react-form-start";

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm: useAdminForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {}, // Add custom field components if needed
  formComponents: {},
});
```

### Form with Server Function (no validators needed)

```tsx
import { useAdminForm } from '../hooks/useAdminForm';

export default function AdminUserList({ ... }) {
  const form = useAdminForm({
    defaultValues: {
      email: '',
      password: '',
      role: 'member' as UserRole,
      isActive: true,
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
          <div>
            <label htmlFor={field.name}>Email</label>
            <input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.AppField>

      <button type="submit" disabled={form.state.isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

### Form with External API (validators needed)

```tsx
import * as z from "zod";
import { authClient } from "../../auth/client";

const Login = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export default function LoginForm() {
  const form = useAuthForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: Login, // Validators needed for external API
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

### Best Practices

- **Server function = no form validators**: The server function already validates with Zod
- **External API = add form validators**: Use Zod schema in `validators.onSubmit`
- **Use render props**: `form.AppField` with render props gives access to `field.state.value`, `field.handleChange()`
- **Custom field components**: Extract reusable field logic (e.g., AuthField, CustomEventField) into custom components
- **Complex forms**: For forms with complex logic (date conversion, file handling), consider keeping some state management separate

## Database Repository Layer

All database operations go through repository functions co-located with their domain modules. Server functions never call Prisma directly.

### Repository Usage

```tsx
import { findPersonById, createPerson } from "../repository/person";
import { countRelationshipsForPerson } from "../../relationships/repository/relationship";
import { withTransaction } from "../../database/transaction";

// Simple queries
const person = await findPersonById(id);
const count = await countRelationshipsForPerson(id);

// Create
const newPerson = await createPerson({
  data: { fullName: "Test", gender: "male" },
});

// Transactions (pass tx to repository functions)
await withTransaction(async (tx) => {
  await deleteAllPersons(tx);
  await createManyPersons(data, tx);
});
```

### Repository Function Pattern

Each function accepts an optional `client` parameter (defaults to `getDbClient()`). Pass `tx` from a transaction for transactional operations. Functions with 3+ domain parameters (e.g. `updatePerson`, `upsertPersonDetailsPrivate`) use a single object parameter with a colocated `{FunctionName}Input` interface. The `client` parameter always stays as a separate positional argument — it is infrastructure, not domain data. Functions with 1-2 domain parameters keep positional args.

### Error Handling

```tsx
import { Prisma } from "../../database/generated/prisma/client";

try {
  await createPerson({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // Unique constraint violation
    }
  }
  throw error;
}
```

## Better Auth

### Client Usage

```tsx
import { authClient } from "../../auth/client";

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
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    if (!context.user) throw redirect({ to: "/login" });
    if (!context.user.isActive) throw redirect({ to: "/login" });
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

### Storage Abstraction

Files are stored via `unstorage` (`src/lib/storage.ts`) which supports local filesystem (`fs` driver) and S3-compatible storage (`s3` driver), selected at runtime via `STORAGE_PROVIDER` env var.

```tsx
import { uploadAvatar, deleteAvatar, getPublicUrl, resolveAvatarUrl } from "../lib/storage";

// Upload — returns a storage key (not a URL)
const key = await uploadAvatar({ buffer, personId, filename, contentType });
// key = "avatars/{personId}/{filename}"

// Delete — takes a storage key
await deleteAvatar(key);

// URL resolution — converts key to provider-appropriate URL
const url = getPublicUrl(key);
// local: "/api/uploads/avatars/..." | s3: "https://cdn.example.com/avatars/..."
```

### Database Storage

The database stores **storage keys** (e.g. `avatars/{personId}/{filename}`), not URLs. Use `resolveAvatarUrl()` or the `*Resolved` repository wrappers to convert keys to URLs at the read boundary.

### Local File Serving

For local storage, files are served via the `/api/uploads/*` API route. For S3, this route redirects to the S3 public URL.
