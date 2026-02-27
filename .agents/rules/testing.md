# Testing Guidelines

## Stack

- **Vitest** — Test runner and assertion library
- **React Testing Library** — Component testing
- **@testing-library/user-event** — User interaction simulation
- **@testing-library/jest-dom** — DOM matchers
- **@vitest/coverage-v8** — Code coverage

## TDD Workflow

Follow the Red-Green-Refactor cycle:

1. **Red**: Write a failing test describing expected behavior
2. **Green**: Write the minimum code to make the test pass
3. **Refactor**: Clean up while keeping tests green

## BDD Test Structure

Use nested `describe`/`it` with Given-When-Then comments:

```tsx
describe('computeKinship', () => {
  describe('when both persons are spouses', () => {
    it('should return "Vợ" and "Chồng" for a married couple', () => {
      // Given: two persons with a marriage relationship
      const persons = [malePerson, femalePerson];
      const relationships = [marriageRelationship];

      // When: computeKinship is called
      const result = computeKinship(malePerson, femalePerson, persons, relationships);

      // Then: returns correct Vietnamese kinship terms
      expect(result.aCallsB).toBe('Vợ');
      expect(result.bCallsA).toBe('Chồng');
    });
  });
});
```

## Test File Co-location

Place test files next to their source:

```
src/utils/kinshipHelpers.ts
src/utils/kinshipHelpers.test.ts
src/components/PersonCard.tsx
src/components/PersonCard.test.tsx
src/server/functions/member.ts
src/server/functions/member.test.ts
```

## Test Layers

### Layer 1: Utility Functions (pure logic)

- No mocking needed — pure input/output
- Highest coverage target: 90%+
- Files: `src/utils/*.test.ts`

### Layer 2: Server Functions (mock Prisma)

- Mock Prisma client with `vi.mock`
- Test business logic, validation, error handling
- Coverage target: 80%+
- Files: `src/server/functions/*.test.ts`

### Layer 3: Components (React Testing Library)

- Use `render()` with provider wrapper from `src/test-utils/render-wrapper.tsx`
- Test rendering, user interactions, state changes
- Coverage target: 70%+
- Files: `src/components/*.test.tsx`

### Layer 4: Integration (optional)

- Full user flows (auth, CRUD operations)
- Heavier setup, use sparingly

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
| `src/server/functions/**` | 80%+ | Business logic with mocked DB |
| `src/components/**` | 70%+ | Rendering and interactions |

## What NOT to Test

- Generated files (`routeTree.gen.ts`)
- Third-party library internals
- CSS/styling details
- Prisma client itself (trust the ORM)
- Simple pass-through components with no logic
