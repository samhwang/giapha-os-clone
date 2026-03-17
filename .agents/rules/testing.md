# Testing Guidelines

See [docs/en/06-testing.md](../docs/en/06-testing.md) for comprehensive testing documentation.

## Quick Reference

### Running Tests

```bash
pnpm test                    # Vitest watch mode
pnpm test:run                # Vitest run once
pnpm test:coverage           # With coverage
pnpm test:ui                 # UI components
pnpm test:server             # Server functions
pnpm test:integration        # Route tests
pnpm test:e2e                # Playwright E2E tests
pnpm test:e2e:ui            # Playwright UI mode
```

### Test File Pattern

| Type | Pattern | Example |
|------|---------|---------|
| Unit | `.test.ts` | `src/utils/kinshipHelpers.test.ts` |
| Component | `.test.tsx` | `src/components/PersonCard.test.tsx` |
| E2E | `.spec.ts` | `e2e/login.spec.ts` |

### Coverage Targets

- `src/utils/**`: 90%+
- `src/**/server/*.test.ts`: 80%+
- `src/components/**`: 70%+

## Test Layers

### Layer 1: Utility Functions (pure logic)

- No mocking needed — pure input/output
- Highest coverage target: 90%+
- Files: `src/utils/*.test.ts`

### Layer 2: Server Functions (inner logic via Testcontainers)

- **DO NOT mock Prisma** — use Testcontainers for real PostgreSQL
- Test the **inner business logic** directly, not the TanStack Start wrapper
- Extract core logic into testable functions, call them directly from tests
- Use Testcontainers globalSetup for database lifecycle
- Files: `src/**/server/*.test.ts`

**Why test inner logic instead of full server functions?**
- TanStack Start's `createServerFn` wraps handlers in complex runtime context
- Mocking the framework adds unnecessary complexity and brittleness
- Testing inner logic directly gives us the same coverage without framework coupling
- Use Testcontainers for real database; mock only auth helpers

Example pattern:
```ts
// ❌ DON'T: Test through TanStack Start wrapper (requires complex mocking)
import { createPerson } from './member'; // the server function export
const result = await createPerson({ data: { fullName: 'Test', gender: 'male' } });

// ✅ DO: Test inner logic directly via repository functions (uses real DB via Testcontainers)
import { createPerson } from '../repository/person';
const result = await createPerson({
  data: { fullName: 'Test', gender: 'male' },
});
```

### Layer 3: Components (React Testing Library)

- Use `render()` with provider wrapper from `src/test-utils/render-wrapper.tsx`
- Test rendering, user interactions, state changes
- Coverage target: 70%+
- Files: `src/components/*.test.tsx`

### Layer 4: E2E Tests (Playwright)

- Real Chromium browser via Playwright (not Vitest browser)
- Test full user flows, real DOM APIs, localStorage, fetch
- No mocking of browser APIs
- E2E tests live in `e2e/` folder
- Files: `e2e/**/*.spec.ts`

**Why Playwright instead of Vitest browser?**
- TanStack Start's virtual imports (`#tanstack-router-entry`, etc.) don't work with Vitest's browser provider
- Playwright is the industry standard for React E2E testing
- Full control over browser context, network interception, storage

Example:
```ts
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('login flow works', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

Type tests can be inlined within regular test files using `expectTypeOf` from vitest.

## Query Priority

Follow Testing Library's query priority:

1. `getByRole` — Most accessible
2. `getByLabelText` — For form elements
3. `getByText` — For visible text
4. `getByTestId` — Last resort

## Test Fixtures

Shared mock data lives in `src/test-utils/fixtures.ts`:

- `mockPersons` — Array of representative persons across generations
- `mockRelationships` — Marriage + biological_child relationships
- `mockAdminUser`, `mockMemberUser` — User objects with different roles
- Builder functions: `createPerson(overrides)`, `createRelationship(overrides)`

## Coverage Targets

| Area | Target | Rationale |
|------|--------|-----------|
| `src/utils/**` | 90%+ | Pure logic, most critical |
| `src/**/server/*.test.ts` | 80%+ | Business logic via Testcontainers |
| `src/components/**` | 70%+ | Rendering and interactions |

## What NOT to Test

- Generated files (`routeTree.gen.ts`)
- Third-party library internals
- CSS/styling details
- Prisma client itself (trust the ORM)
- Simple pass-through components with no logic
