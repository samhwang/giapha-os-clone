# Testing

TL;DR: Use Vitest for unit/component/integration tests and Playwright for E2E tests.

## Test Projects

The project uses two testing tools:

| Tool | Purpose | Command |
|------|---------|---------|
| **Vitest** | Unit tests, components, server functions, integration | `pnpm test:ui`, `pnpm test:server`, `pnpm test:integration` |
| **Playwright** | E2E browser tests with real Chromium | `pnpm test:e2e` |

## Running Tests

### Vitest Tests

```bash
pnpm test:run          # Run all Vitest tests once
pnpm test             # Watch mode
pnpm test:ui          # UI component tests
pnpm test:server      # Server function tests (Testcontainers)
pnpm test:integration # Route-level integration tests
```

### Playwright E2E Tests

```bash
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run with Playwright UI
```

## Why Playwright for E2E?

- TanStack Start's virtual imports (`#tanstack-router-entry`, etc.) don't work with Vitest's browser provider
- Playwright is the industry standard for React E2E testing
- Full control over browser context, network interception, storage

## Test Layers

### Layer 1: Utility Functions

Pure logic tests - no mocking needed.

```typescript
// src/utils/kinshipHelpers.test.ts
import { computeKinship } from './kinshipHelpers'

test('returns correct kinship for parent-child', () => {
  const result = computeKinship(parent, child, persons, relationships)
  expect(result.aCallsB).toBe('cha')
})
```

### Layer 2: Server Functions

Test business logic with a real PostgreSQL database using Testcontainers. Never mock database connections.

```typescript
// src/members/server/member.test.ts
import { getDbClient } from '@/lib/db'

test('creates person with private details', async () => {
  const db = getDbClient()

  const person = await db.person.create({
    data: {
      fullName: 'Test User',
      gender: 'male',
      privateDetails: {
        create: { phoneNumber: '0901234567' }
      }
    },
    include: { privateDetails: true }
  })

  expect(person.privateDetails?.phoneNumber).toBe('0901234567')
})
```

The server test project is configured with Testcontainers in `test/globalSetup.ts` and `test/per-file-db.ts`.

### Layer 3: Components (React Testing Library)

Test rendering and user interactions.

```typescript
// src/components/PersonCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PersonCard } from './PersonCard'

test('renders person name', () => {
  render(<PersonCard person={{ fullName: 'Nguyen Van A', gender: 'male' }} />)
  expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
})
```

### Layer 4: E2E Tests (Playwright)

Real browser testing with Playwright - no mocking of browser APIs.

```typescript
// e2e/landing.spec.ts
import { test, expect } from '@playwright/test'

test('landing page displays correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading')).toBeVisible()
})
```

#### Prerequisites

Before running E2E test, we need to make sure:

- Chromium for Testing is installed (this can be managed via Playwright).
- The DB migration and seeding scripts has been ran.
- `UPLOAD_DIR` is configured in the `.env` file.
- There is a dev server running.

The setup can be triggered by this script:

```bash
npx playwright install

docker compose up -d
pnpm run prisma:migrate:dev && pnpm run prisma:seed
pnpm run dev

pnpm run test:e2e
```

## Writing E2E Tests

### File Pattern

E2E tests live in the `e2e/` folder:

```
e2e/landing.spec.ts
e2e/login.spec.ts
e2e/members.spec.ts
```

### Basic Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('user flow description', async ({ page }) => {
    // Navigate
    await page.goto('/')

    // Interact
    await page.getByRole('link', { name: 'Login' }).click()

    // Assert
    await expect(page).toHaveURL(/.*\/login/)
  })
})
```

### Authentication

Use `storageState` in Playwright config to persist auth state across tests:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    storageState: '.auth/user.json',
  },
})
```

### Testing Protected Routes

```typescript
test('can access dashboard when logged in', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Welcome')).toBeVisible()
})
```

## Type Testing

Inline type tests using `expectTypeOf`:

```typescript
import { expectTypeOf } from 'vitest'

expectTypeOf<PersonNode>().toMatchTypeOf<object>()
expectTypeOf<KinshipResult | null>().toMatchTypeOf<object | null>()
```

## Coverage

Target coverage levels:

| Layer | Target |
|-------|--------|
| Utilities | 90%+ |
| Server Functions | 80%+ |
| Components | 70%+ |

Run coverage:

```bash
pnpm test:coverage
```

## Test Utilities

Use helpers from `src/test-utils/`:

```typescript
import { renderWithProviders } from '@/test-utils/render-wrapper'

renderWithProviders(<Component />)
```
