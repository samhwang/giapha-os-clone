# Development

How to build features, write tests, and run CI for Gia Pha OS.

## Creating Routes

[TanStack Router](https://tanstack.com/router/latest) uses file-based routing. The route file path determines the URL. See the [file naming conventions](https://tanstack.com/router/v1/docs/routing/file-naming-conventions) for the full set of defaults.

### Basic Route

```tsx
// src/routes/about.tsx → /about
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return <div>About Page</div>;
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
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/members/$id/")({
  component: MemberDetailPage,
});

function MemberDetailPage() {
  const { id } = Route.useParams();
  return <div>Member ID: {id}</div>;
}
```

See the [Route Map](../reference/02-reference.md#route-map) reference for all existing routes.

## Loaders (Data Fetching)

Loaders run on the server to fetch data before rendering. Data fetching is done via server functions:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import * as memberFns from "../../members/server/member";

export const Route = createFileRoute("/dashboard/members/")({
  loader: () => memberFns.getMembers(),
  component: MembersPage,
});

function MembersPage() {
  const { persons } = Route.useLoaderData();
  return (
    <ul>
      {persons.map((person) => (
        <li key={person.id}>{person.fullName}</li>
      ))}
    </ul>
  );
}
```

## Server Functions

Server functions use `createServerFn` with middleware for auth:

```typescript
import { createServerFn } from "@tanstack/react-start";
import { isUserMiddleware } from "../../auth/server/middleware";
import { findAllPersons } from "../repository/person";

export const getMembers = createServerFn()
  .middleware([isUserMiddleware])
  .handler(async () => {
    return findAllPersons();
  });
```

## Forms (TanStack Form)

This project uses [TanStack Form](https://tanstack.com/form/latest) for type-safe form handling.

### Validation Strategy

- **Calling server functions**: No form validators needed — server functions already validate with `.inputValidator()` or `.validator()`
- **Calling external APIs**: Add [Zod](https://zod.dev/) validators to the form (e.g., [Better Auth](https://www.better-auth.com/) client)

### Creating a Form Hook

Create a form hook in your domain's hooks directory:

```tsx
// src/admin/hooks/useAdminForm.ts
import { createFormHook, createFormHookContexts } from "@tanstack/react-form-start";

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
import { useAdminForm } from "../hooks/useAdminForm";
import { createUser } from "../server/user";

function CreateUserForm() {
  const form = useAdminForm({
    defaultValues: {
      email: "",
      password: "",
      role: "member",
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
          <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
        )}
      </form.AppField>
      <button type="submit">Create</button>
    </form>
  );
}
```

### Using the Form (External API)

```tsx
import * as z from "zod";
import { authClient } from "../../auth/client";

const Login = z.object({
  email: z.email(),
  password: z.string().min(1),
});

function LoginForm() {
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

**Key points:**

- Server functions already validate — no form validators needed
- External APIs (e.g., Better Auth) need Zod validators in `validators.onSubmit`
- Forms use `form.AppField` with render props for controlled inputs
- Use `field.handleChange(value)` to update field values
- Use `form.state.isSubmitting` for loading state

## Authentication

### Checking Auth in Loader

```typescript
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" });
    }
  },
});
```

### Getting User in Component

```tsx
import { useRouteContext } from "@tanstack/react-router";

function DashboardPage() {
  const { user } = useRouteContext({ from: "/dashboard" });
  return <div>Welcome, {user.name}</div>;
}
```

### Role-Based Access

```typescript
export const Route = createFileRoute("/dashboard/users")({
  beforeLoad: async ({ context }) => {
    if (context.user?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
});
```

## Using the Database

Use repository functions co-located with domain modules instead of calling [Prisma](https://www.prisma.io/) directly:

```typescript
import {
  findAllPersons,
  findPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} from "../repository/person";

// Query examples
const persons = await findAllPersons();
const person = await findPersonById("xxx");
const created = await createPerson({ data: { fullName: "Name", gender: "male" } });
const updated = await updatePerson({ id: "xxx", data: { fullName: "New" } });
const deleted = await deletePerson("xxx");
```

### Database Migrations

```bash
# Push schema changes (development)
pnpm run prisma:push

# Create a migration file (tracked schema evolution)
pnpm run prisma:migrate:dev

# Regenerate TypeScript types after schema changes
pnpm run prisma:generate

# Seed sample data
pnpm run prisma:seed
```

See the [Database](../reference/01-database.md) reference for the full schema and repository API.

## Testing

### Running Tests

```bash
pnpm run test:run          # Run all Vitest tests once
pnpm run test              # Watch mode
pnpm run test:ui           # UI component tests
pnpm run test:server       # Server function tests (Testcontainers)
pnpm run test:integration  # Route-level integration tests
pnpm run test:e2e          # Playwright E2E tests
pnpm run test:e2e:ui       # Playwright UI mode
```

### Test Layers

#### Layer 1: Utility Functions

Pure logic tests — no mocking needed.

```typescript
// src/utils/kinshipHelpers.test.ts
import { computeKinship } from "./kinshipHelpers";

test("returns correct kinship for parent-child", () => {
  const result = computeKinship(parent, child, persons, relationships);
  expect(result.aCallsB).toBe("cha");
});
```

#### Layer 2: Server Functions

Test business logic with a real PostgreSQL database using [Testcontainers](https://testcontainers.com/). Never mock database connections.

```typescript
// src/members/server/member.test.ts
import { createPerson, findPersonById } from "../repository/person";

test("creates person with private details", async () => {
  const person = await createPerson({
    data: {
      fullName: "Test User",
      gender: "male",
      privateDetails: {
        create: { phoneNumber: "0901234567" },
      },
    },
  });

  expect(person.privateDetails?.phoneNumber).toBe("0901234567");
});
```

#### Layer 3: Components

Test rendering and user interactions with [React Testing Library](https://testing-library.com/).

```tsx
// src/components/PersonCard.test.tsx
import { render, screen } from "@testing-library/react";
import { PersonCard } from "./PersonCard";

test("renders person name", () => {
  render(<PersonCard person={{ fullName: "Nguyen Van A", gender: "male" }} />);
  expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
});
```

#### Layer 4: E2E Tests

Real browser testing with [Playwright](https://playwright.dev/).

```typescript
// e2e/landing.spec.ts
import { test, expect } from "@playwright/test";

test("landing page displays correctly", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading")).toBeVisible();
});
```

##### E2E Prerequisites

Before running E2E tests:

- Chromium for Testing is installed (managed via Playwright)
- The DB migration and seeding scripts have been run
- `UPLOAD_DIR` is configured in the `.env` file
- There is a dev server running

```bash
npx playwright install chromium

docker compose up -d
pnpm run prisma:migrate:dev && pnpm run prisma:seed
pnpm run dev

pnpm run test:e2e
```

### Writing E2E Tests

E2E tests live in the `e2e/` folder:

```
e2e/landing.spec.ts
e2e/login.spec.ts
e2e/members.spec.ts
```

#### Basic Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("user flow description", async ({ page }) => {
    // Navigate
    await page.goto("/");

    // Interact
    await page.getByRole("link", { name: "Login" }).click();

    // Assert
    await expect(page).toHaveURL(/.*\/login/);
  });
});
```

#### Authentication in E2E

Use `storageState` in Playwright config to persist auth state across tests:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    storageState: ".auth/user.json",
  },
});
```

### Type Testing

Inline type tests using `expectTypeOf`:

```typescript
import { expectTypeOf } from "vitest";

expectTypeOf<PersonNode>().toMatchTypeOf<object>();
expectTypeOf<KinshipResult | null>().toMatchTypeOf<object | null>();
```

See the [Commands](../reference/02-reference.md#commands) and [Coverage Targets](../reference/02-reference.md#coverage-targets) references for the full test command list and coverage goals.

## Running CI Locally

Before submitting a pull request, run the same checks locally:

```bash
# Full quality check (lint + typecheck + tests)
pnpm run typecheck && pnpm run lint && pnpm run test:run

# Build to verify production build works
pnpm run build
```

### Pre-commit Hooks

The project uses lint-staged with [Biome](https://biomejs.dev/) to run lint checks on staged files before commit.

### Pre-push Hook

Before pushing to remote, the pre-push hook runs:

```bash
pnpm run lint:ci      # Lint check
pnpm run test:run     # All tests
pnpm run typecheck    # TypeScript check
```

This ensures no broken code leaves your local machine.

See the [CI/CD Workflows](../reference/02-reference.md#cicd-workflows) reference for the full GitHub Actions pipeline description.
