# Kiểm Thử

TL;DR: Dùng Vitest với nhiều test projects - unit tests, integration tests, và browser (E2E) tests. Chạy với `pnpm test`.

## Các Test Projects

Project dùng Vitest với nhiều test projects cho các nhu cầu kiểm thử khác nhau:

| Project | Mục đích | Lệnh |
|---------|---------|---------|
| `ui-components` | Unit tests cho utilities và components | `pnpm test:ui` |
| `server` | Server function tests với PostgreSQL thực qua Testcontainers | `pnpm test:server` |
| `integration` | Route-level tests với jsdom | `pnpm test:integration` |
| `browser` | E2E tests với Chromium thực qua Playwright | `pnpm test:browser:run` |

## Chạy Tests

### Tất Cả Tests

```bash
pnpm test:run
```

### Cụ Thể

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

## Các Lớp Test

### Lớp 1: Hàm Tiện Ích

Tests logic thuần - không cần mock.

```typescript
// src/utils/kinshipHelpers.test.ts
import { computeKinship } from './kinshipHelpers'

test('returns correct kinship for parent-child', () => {
  const result = computeKinship(parent, child, persons, relationships)
  expect(result.aCallsB).toBe('cha')
})
```

### Lớp 2: Server Functions

Test business logic với database PostgreSQL thực sự dùng Testcontainers. Không bao giờ mock database connections.

```typescript
// src/server/functions/members.test.ts
import { getDbClient } from '@/lib/db'

test('returns members with details', async () => {
  const db = getDbClient()
  
  // Seed test data directly
  await db.person.create({
    data: { fullName: 'Test User', gender: 'male' }
  })
  
  const result = await getMembers()
  expect(result).toHaveLength(1)
})
```

Test project đã được cấu hình với Testcontainers trong `test/globalSetup.ts` và `test/per-file-db.ts`.

### Lớp 3: Components (React Testing Library)

Test rendering và user interactions.

```typescript
// src/components/PersonCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PersonCard } from './PersonCard'

test('renders person name', () => {
  render(<PersonCard person={{ fullName: 'Nguyen Van A', gender: 'male' }} />)
  expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
})
```

### Lớp 4: Browser Tests (E2E)

Tests browser thực với Playwright - không mock các API của browser.

```typescript
// src/routes/dashboard/index.browser-test.tsx
import { test, expect } from 'vitest'

test('dashboard loads correctly', async () => {
  const { getByRole } = render(<Dashboard />)
  await expect(getByRole('heading')).toBeInTheDocument()
})
```

## Viết Browser Tests

### Đặt Tên File

Dùng đuôi `.browser-test.tsx`:

```
src/routes/dashboard/index.browser-test.tsx
src/routes/login.browser-test.tsx
```

### Cấu Trúc Cơ Bản

```typescript
import { test, expect } from 'vitest'
import { render } from 'vitest-browser-react'

test('page renders', async () => {
  const { getByRole } = render(<YourComponent />)
  await expect(getByRole('heading')).toBeInTheDocument()
})
```

### Mock trong Browser Tests

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

Type tests inline dùng `expectTypeOf`:

```typescript
import { expectTypeOf } from 'vitest'

expectTypeOf<PersonNode>().toMatchTypeOf<object>()
expectTypeOf<KinshipResult | null>().toMatchTypeOf<object | null>()
```

## Coverage

Mức coverage mục tiêu:

| Lớp | Mục tiêu |
|-------|-----------|
| Utilities | 90%+ |
| Server Functions | 80%+ |
| Components | 70%+ |

Chạy coverage:

```bash
pnpm test:coverage
```

## Test Utilities

Dùng helpers từ `src/test-utils/`:

```typescript
import { renderWithProviders } from '@/test-utils/render-wrapper'

renderWithProviders(<Component />)
```
