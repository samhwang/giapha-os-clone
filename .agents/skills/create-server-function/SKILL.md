---
name: create-server-function
description: Create a server function with Zod validation and Prisma integration
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: api-development
---

# Server Function CRUD Skill

## Purpose

Create a new server function with Zod validation, Prisma integration, and Better Auth patterns.

## Trigger Condition

When user asks to:

- Create API endpoint
- Add CRUD operations
- Create server function in `src/*/server/`

## Workflow

### Step 1: Choose Location

Server functions live in feature directories:

- Member-related → `src/members/server/`
- Admin-related → `src/admin/server/`
- Relationship-related → `src/relationships/server/`
- Event-related → `src/events/server/`

### Step 2: Create Server Function File

Create `src/*/server/[feature].ts`:

```typescript
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { isEditorMiddleware } from "../../auth/server/middleware";
// Import repository functions for the relevant entity
import { findAllItems, createItem } from "../repository/item";

const CreateItemPayload = z.object({
  name: z.string().min(1),
});

export const getItems = createServerFn({ method: "GET" }).handler(async () => {
  return findAllItems();
});

export const createItemFn = createServerFn({ method: "POST" })
  .inputValidator(CreateItemPayload)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    return createItem({ data });
  });
```

### Step 3: Create Tests

Create: `src/*/server/[feature].test.ts`

## Checklist

- [ ] Uses `createServerFn` from `@tanstack/react-start`
- [ ] Input validated with Zod `.validator()`
- [ ] Uses repository functions from `src/{module}/repository/` for database operations
- [ ] Includes proper error handling
- [ ] Tests cover success and error paths
- [ ] Passes `pnpm typecheck` and `pnpm lint`

## Patterns

### Read Function

```typescript
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { findPersonById } from "../repository/person";

const IdPayload = z.object({ id: z.uuid() });

export const getPersonById = createServerFn({ method: "GET" })
  .inputValidator(IdPayload)
  .handler(async ({ data }) => {
    return findPersonById(data.id);
  });
```

### Write Function (with Auth)

```typescript
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { isEditorMiddleware } from "../../auth/server/middleware";
import { createPerson } from "../repository/person";

const CreatePersonPayload = z.object({
  fullName: z.string().min(1),
  gender: z.enum(["male", "female", "other"]),
});

export const createPersonFn = createServerFn({ method: "POST" })
  .inputValidator(CreatePersonPayload)
  .middleware([isEditorMiddleware])
  .handler(async ({ data }) => {
    return createPerson({ data });
  });
```

### Transaction Example

```typescript
import { createServerFn } from "@tanstack/react-start";
import { isAdminMiddleware } from "../../auth/server/middleware";
import { deleteAllPersons, createManyPersons } from "../repository/person";
import { withTransaction } from "../../database/transaction";

export const importData = createServerFn({ method: "POST" })
  .middleware([isAdminMiddleware])
  .handler(async ({ data }) => {
    await withTransaction(async (tx) => {
      await deleteAllPersons(tx);
      await createManyPersons(data.persons, tx);
    });
  });
```

## Notes

- Always validate inputs with Zod via `.inputValidator()`
- Use middleware from `../../auth/server/middleware` for protected routes
- Use repository functions from `../repository/` for same-module or `../../{module}/repository/` for cross-module database operations
- Never call `getDbClient()` directly in server functions
- Follow naming: `getXxx`, `createXxx`, `updateXxx`, `deleteXxx`
