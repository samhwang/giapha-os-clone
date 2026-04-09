# Code Style & Conventions

## Tooling

[Oxlint](https://oxc.rs/docs/guide/usage/linter.html) handles linting. [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) handles formatting. No ESLint, Prettier, Biome, or separate formatters.

## Formatting Rules

- **Indent**: 2 spaces
- **Quotes**: Single quotes (JS/TS), double quotes (JSX)
- **Semicolons**: Always
- **Line width**: 160 characters
- **Trailing commas**: ES5 (objects, arrays, function parameters)
- **Arrow parentheses**: Always `(x) => x`
- **End of line**: LF
- **Final newline**: Always

## Auto-formatting

- **On save**: Configure editor to use Oxfmt
- **Pre-commit**: lint-staged runs Oxlint + Oxfmt on staged files
- **Manual**: `pnpm lint:fix`

## TypeScript Conventions

- Strict mode enabled
- Use `import type { ... }` for type-only imports
- Never use `any` — use `unknown` and narrow with type guards
- Prefer Prisma generated types over manual type definitions where possible
- Use explicit return types for all functions (exported and internal)
- Use `satisfies` operator for type-checked object literals
- For Zod schemas, declare the schema and type together in one block, so they can both be imported in one go, depending on the context of work (e.g. either as a type or a value):

```ts
// Good: Schema and type together
const CreatePerson = z.object({ name: z.string() });
type CreatePerson = z.infer<typeof CreatePerson>;

// Bad: Separate declarations
const createPersonSchema = z.object({ name: z.string() });
type CreatePerson = z.infer<typeof createPersonSchema>;
```

## Naming Conventions

| Element                  | Convention           | Example                        |
| ------------------------ | -------------------- | ------------------------------ |
| Variables, functions     | camelCase            | `birthOrder`, `computeKinship` |
| Components               | PascalCase           | `FamilyTree`, `PersonCard`     |
| Types, interfaces, enums | PascalCase           | `Person`, `RelationshipType`   |
| Constants                | UPPER_SNAKE_CASE     | `MAX_GENERATION_DEPTH`         |
| Files (general)          | kebab-case           | `kinship-helpers.ts`           |
| Files (components)       | PascalCase           | `FamilyTree.tsx`               |
| Files (routes)           | kebab-case or $param | `$id.tsx`, `index.tsx`         |
| Database columns         | snake_case           | `full_name`, `birth_year`      |
| Prisma fields            | camelCase            | `fullName`, `birthYear`        |

## Component Structure

Follow this order within each component file:

```tsx
// 1. Imports
import { useState } from "react";
import { useSomething } from "../../lib/something";
import type { Person } from "../../members/types";

// 2. Types/interfaces (if component-specific, named {Component}Props)
interface PersonCardProps {
  person: Person;
  onSelect: (id: string) => void;
}

// 3. Component (with explicit return type)
export function PersonCard({ person, onSelect }: PersonCardProps): ReactNode {
  // a. Hooks
  const [isOpen, setIsOpen] = useState(false);

  // b. Derived state
  const displayName = person.fullName;

  // c. Event handlers
  const handleClick = () => onSelect(person.id);

  // d. Effects (if needed)

  // e. Render
  return <div onClick={handleClick}>{displayName}</div>;
}
```

## Component Variants (CVA)

Use [class-variance-authority](https://cva.style/) for components with style variants. Define variants as a `cva()` call, export the component and optionally the variants.

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const avatarVariants = cva("rounded-full flex items-center justify-center", {
  variants: {
    gender: {
      male: "bg-sky-400",
      female: "bg-rose-400",
    },
  },
});

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  className?: string;
}
```

Existing CVA components in `src/ui/common/`: `Card`, `Badge`, `Button`, `Avatar`, `InLawBadge`. See [Reference](../../docs/reference/02-reference.md#shared-ui-components-design-system) for the full component list and design tokens.

### Design System Policy

All screens and components must use the design system. See [Reference](../../docs/reference/02-reference.md#design-tokens) for the complete token, typography, and layout utility tables.

**Tokens** — Use semantic tokens over hardcoded Tailwind colors:

```tsx
// ✅ Semantic tokens
<div className="bg-surface-glass border-border-default text-text-primary rounded-card shadow-card duration-default">

// ❌ Hardcoded values
<div className="bg-white/60 border-stone-200/60 text-stone-900 rounded-2xl shadow-sm duration-300">
```

**Typography** — Use typography utility classes:

```tsx
// ✅ Typography utilities
<h1 className="text-heading-page">{title}</h1>
<label className="text-label">{label}</label>
<p className="text-description">{desc}</p>

// ❌ Inline typography combos
<h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800">{title}</h1>
```

**Layout** — Use layout utility classes:

```tsx
// ✅ Layout utilities
<div className="layout-page">...</div>
<div className="layout-card-grid">...</div>

// ❌ Inline layout combos
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">...</div>
```

**Components** — Use shared components from `src/ui/common/`:

```tsx
<Card variant="glass" interactive>...</Card>
<Badge color="amber">Label</Badge>
<Button variant="primary">Save</Button>
<Modal isOpen onClose={close}><ModalPanel>...</ModalPanel></Modal>
<Input label="Name" error={error} leftIcon={<Search />} />
<EmptyState icon={<Icon />} title="No results" />
<ProgressBar value={50} max={100} color="bg-amber-400" />
```

**Custom classes** — Any Tailwind class that deviates from the design system must include a comment:

```tsx
{/* custom: landing page hero needs larger shadow for visual emphasis */}
<div className="shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
```

## Import Order

Oxfmt auto-organizes imports (configured in `.oxfmtrc.json`):

1. React / React DOM
2. External packages (`@tanstack/*`, etc.)
3. Relative imports (project modules via `../` or `./`)
4. Type imports (`import type { ... }`)
5. Style imports

## Comments

- Explain **why**, not **how**
- No JSDoc for self-explanatory functions
- Use `// TODO:` for known incomplete work
- No commented-out code in commits

## File Size

- Aim for < 300 lines per file
- Extract large components into smaller pieces
- Extract shared logic into utility functions or hooks

## Module Structure

Organize `src/` by domain functionality, not by technical layer:

```
src/
├── routes/           # File-based routing (framework requirement)
├── database/         # Database layer (client, repositories, generated types)
├── lib/              # Core infrastructure (storage, env, config)
├── auth/             # Authentication (Better Auth)
├── i18n/             # Internationalization
├── types/            # Global types
│
├── {domain}/         # Functional modules
│   ├── components/   # Domain-specific React components
│   ├── server/       # Server functions (API logic)
│   ├── utils/        # Domain utilities
│   ├── types/        # Domain-specific types (co-located)
│   └── index.ts      # Public exports
│
└── ui/               # Shared generic components
    ├── layout/       # Layout components (Header, Footer, etc.)
    ├── icons/        # Icon components
    └── common/       # Reusable components (buttons, cards, etc.)
```

Rules:

- Each functional module should be self-contained
- Types belong in the module that uses them; co-locate if only used by 1 file
- Keep `database/` for all database concerns (client, repositories, generated types)
- Keep `lib/` for cross-cutting concerns only (storage, env, config)
- Use `ui/` for generic components with no domain logic

## Clean Code

Reference: [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript)

### Control Flow

- **Guard clauses first**: Invert conditions and return/continue early to avoid nesting.

  ```ts
  // Bad
  if (file) {
    if (file.type === "json") {
      process(file);
    }
  }

  // Good
  if (!file) return;
  if (file.type !== "json") return;
  process(file);
  ```

- **No redundant wrappers**: Don't wrap `for` loops in `if (arr.length > 0)` — iterating an empty array is a no-op.
- **Extract complex conditions into named booleans**: If a condition needs a comment to explain it, extract it into a `const` instead.

  ```ts
  // Bad
  // Check if we should upload the avatar
  if (avatarFile && personId) { ... }

  // Good
  const shouldUploadAvatar = avatarFile && personId;
  if (shouldUploadAvatar) { ... }
  ```

- **Combine nested conditions with `&&`** when the inner block is a single early return.
- **Collapse nested if/else into ternaries** when the only difference is the assigned value.

### Functions

- **Do one thing**: If a function has sections separated by blank lines or comments, each section is likely a candidate for extraction.
- **2 parameters or fewer**: Use a single object parameter for 3+ arguments. Declare a `{FunctionName}Input` interface immediately above the function. Never declare object types inline in the signature.
- **Keep logic functions short**: Aim for < 30 lines of logic (excluding JSX).
- **No flag arguments**: Avoid boolean parameters that make a function do two different things. Split into two functions instead when practical.

### Variables

- **Meaningful names**: No single-letter variables or abbreviations (`generation` not `gen`, `percentage` not `pct`).
- **Named constants over magic numbers**: Extract unexplained literals into `const DRAG_THRESHOLD = 5`.
- **Consistent vocabulary**: If a similar pattern exists elsewhere (e.g. `hasPrivateDetails` in create), follow the same naming in related code (e.g. `hasPrivateDetailsToUpdate` in update).

### DRY

- **Extract duplicated logic**: If the same pattern appears in 2+ places, extract a shared helper.
- **Shared utilities go in `ui/utils/` or the relevant domain `utils/`**.

### Error Handling

- **Never ignore caught errors**: Always log, display, or re-throw.
- **Never ignore rejected promises**: Attach `.catch()` or use try/catch in async functions.

## Other Conventions

- Destructure props in function parameters
- Use `const` by default, `let` only when reassignment is needed
- No `var`
- Prefer template literals over string concatenation

## Ignored Files

Oxlint skips these (configured in `.oxlintrc.json`):

- `src/routeTree.gen.ts` (auto-generated by TanStack Router)
- `node_modules/`
- `dist/`
- `coverage/`
- `**/generated/` (Prisma client)
