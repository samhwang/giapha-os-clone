# Test Creation Skill

## Purpose

Create unit and browser tests using Vitest and React Testing Library following BDD patterns.

## Trigger Condition

When user asks to:
- Write tests
- Add test coverage
- Create test file

## Workflow

### Step 1: Determine Test Location

Tests are co-located with source files:
- `src/utils/date.ts` → `src/utils/date.test.ts`
- `src/components/Button.tsx` → `src/components/Button.test.tsx`
- `src/server/functions/member.ts` → `src/server/functions/member.test.ts`

### Step 2: Choose Test Type

- **Unit tests**: Pure functions, utilities, server functions
- **Component tests**: React components with interactions
- **Integration tests**: Full workflows (use sparingly)

### Step 3: Write Tests

Use Given-When-Then pattern:
```typescript
describe('functionName', () => {
  describe('given valid input', () => {
    it('should return expected output', () => {
      // given
      const input = 'value'
      
      // when
      const result = functionName(input)
      
      // then
      expect(result).toBe('expected')
    })
  })
  
  describe('given invalid input', () => {
    it('should throw error', () => {
      expect(() => functionName(null)).toThrow()
    })
  })
})
```

### Step 4: Run Tests

```bash
pnpm test        # Watch mode
pnpm test:run    # Single run
```

## Checklist

- [ ] Tests use Given-When-Then structure
- [ ] Describe blocks group related tests
- [ ] Test names describe behavior, not implementation
- [ ] Tests are independent and can run in any order
- [ ] Tests cover happy path and error cases
- [ ] Passes `pnpm test:run`

## Patterns

### Unit Test (Utility Function)

```typescript
// src/utils/date.test.ts
import { describe, it, expect } from 'vitest'
import { formatVietnameseDate } from './date'

describe('formatVietnameseDate', () => {
  describe('given a valid date', () => {
    it('should format as DD/MM/YYYY', () => {
      const date = new Date('2024-01-15')
      const result = formatVietnameseDate(date)
      expect(result).toBe('15/01/2024')
    })
  })
  
  describe('given an invalid date', () => {
    it('should throw error', () => {
      expect(() => formatVietnameseDate(null as any)).toThrow()
    })
  })
})
```

### Server Function Test

```typescript
// src/members/server/member.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createMember } from './member'
import { db } from '../../../lib/db'
import { auth } from '../../../auth/server'

vi.mock('../../../lib/db', () => ({
  db: {
    member: {
      create: vi.fn(),
    },
  },
}))

vi.mock('../../../auth/server', () => ({
  auth: vi.fn(),
}))

describe('createMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  describe('given authenticated user', () => {
    it('should create member', async () => {
      const mockSession = { user: { familyId: 'family-1' } }
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      vi.mocked(db.member.create).mockResolvedValue({ id: '1', firstName: 'Minh' })
      
      const result = await createMember({ data: { firstName: 'Minh', lastName: 'Nguyen' } })
      
      expect(result.firstName).toBe('Minh')
    })
  })
  
  describe('given unauthenticated user', () => {
    it('should throw error', async () => {
      vi.mocked(auth).mockResolvedValue(null)
      
      await expect(createMember({ data: { firstName: 'Minh' } })).rejects.toThrow('Unauthorized')
    })
  })
})
```

### Component Test (React Testing Library)

```tsx
// src/components/Button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  describe('given default props', () => {
    it('should render children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })
  })
  
  describe('given onClick handler', () => {
    it('should call handler when clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      render(<Button onClick={handler}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
  
  describe('given disabled prop', () => {
    it('should not call handler when clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      render(<Button disabled onClick={handler}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      
      expect(handler).not.toHaveBeenCalled()
    })
  })
})
```

### Integration Test (Browser)

```tsx
// src/routes/members.test.tsx
import { describe, it, expect } from 'vitest'
import { setup, createRouter } from '@testing-library/react'
import MembersPage from './members'

describe('MembersPage', () => {
  it('should display members list', async () => {
    const { router } = setup(<MembersPage />, {
      router: {
        loader: () => ({ members: [{ id: '1', firstName: 'Minh' }] }),
      },
    })
    
    expect(screen.getByText('Minh')).toBeInTheDocument()
  })
})
```

## Testing Library Best Practices

- Use `screen.getByRole` for accessibility
- Use `screen.getByText` for text content
- Use `screen.getByLabelText` for form elements
- Use `userEvent` over `fireEvent`
- Test behavior, not implementation
- Assert outcomes, not intermediate states

## Coverage Targets (per AGENTS.md)

- **Utilities**: 90%+ coverage
- **Server Functions**: 80%+ coverage
- **Components**: 70%+ coverage
