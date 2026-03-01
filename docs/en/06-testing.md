# Testing

TL;DR: Use Vitest with multiple test projects - unit tests, integration tests, and browser (E2E) tests. Run with `pnpm test`.

## Test Projects

The project uses Vitest with multiple test projects for different testing needs:

| Project | Purpose | Command |
|---------|---------|---------|
| `ui-components` | Unit tests for utilities and components | `pnpm test:ui` |
| `server` | Server function tests with mocked Prisma | `pnpm test:server` |
| `integration` | Route-level tests with jsdom | `pnpm test:integration` |
| `browser` | E2E tests with real Chromium via Playwright | `pnpm test:browser:run` |

## Running Tests

### All Tests

```bash
pnpm test:run
```

### Specific Project

```bash
pnpm test:ui        # Unit tests
pnpm test:server    # Server tests
pnpm test:integration  # Integration tests
pnpm test:browser:run  # Browser tests
```

### Watch Mode

```bash
pnpm test           # Watch all
pnpm test:browser   # Watch browser tests
```

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

Test business logic with mocked Prisma.

```typescript
// src/server/functions/members.test.ts
import { getMembers } from './member'
import { getDbClient } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  getDbClient: vi.fn(() => ({
    person: {
      findMany: vi.fn().mockResolvedValue([...])
    }
  }))
}))

test('returns members with details', async () => {
  const result = await getMembers()
  expect(result).toHaveLength(5)
})
```

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

### Layer 4: Browser Tests (E2E)

Real browser testing with Playwright - no mocking of browser APIs.

```typescript
// src/routes/dashboard/index.browser-test.tsx
import { test, expect } from 'vitest'

test('dashboard loads correctly', async () => {
  const { getByRole } = render(<Dashboard />)
  await expect(getByRole('heading')).toBeInTheDocument()
})
```

## Writing Browser Tests

### File Pattern

Use `.browser-test.tsx` extension:

```
src/routes/dashboard/index.browser-test.tsx
src/routes/login.browser-test.tsx
```

### Basic Structure

```typescript
import { test, expect } from 'vitest'
import { render } from 'vitest-browser-react'

test('page renders', async () => {
  const { getByRole } = render(<YourComponent />)
  await expect(getByRole('heading')).toBeInTheDocument()
})
```

### Mocking in Browser Tests

```typescript
import { describe, expect, test, vi } from 'vitest'

vi.mock('@/lib/some-module', () => ({
  someFunction: vi.fn(),
}))

test('works with mocks', async () => {
  // Test implementation
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
