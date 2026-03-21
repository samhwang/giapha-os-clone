# Gia Pha OS Clone - Agent Guidelines

## Universal Agents Control Manifest

All agents must emulate `.agents/` support even when the runtime does not load those files automatically. Treat this document as the control manifest: it lists available metadata, where to read it, and how to compose it during a conversation.

## About the Project

Gia Pha OS Clone is a self-hosted Vietnamese genealogy and family tree management application. It is a reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os) using a fully self-hosted stack with no third-party cloud dependencies.

The project focuses on:

- **Self-hosting**: All infrastructure runs via Docker Compose (PostgreSQL, local filesystem)
- **Data sovereignty**: Families control their own genealogical data
- **Vietnamese culture**: Kinship naming, lunar calendar, death anniversaries
- **Maintainability**: Clean code, comprehensive tests, clear documentation

## Role & Technical Context

- **Domain**: Vietnamese genealogy/family tree management
- **Tech Stack**: TanStack Start, React 19, TypeScript, TanStack Form, Zustand, Prisma 7, PostgreSQL, Better Auth, Zod 4, CVA, unstorage (local fs / S3-compatible), Tailwind CSS v4
- **Architecture**: Full-stack app with server functions, file-based routing, Docker Compose infrastructure
- **Deployment**: Self-hosted via Docker Compose
- **Package Manager**: pnpm

## Change Management Philosophy

All changes must be:

- **Atomic**: The smallest possible and logically complete unit of change
- **Safe**: Type-checked, linted, and tested before commit
- **Tested**: High coverage on utilities (90%+), server functions (80%+), components (70%+)
- **Linted**: Must pass `pnpm lint` and `pnpm typecheck` before commit
- **Documented**: Clear commit messages following Conventional Commits pattern
- **Delivered**: Pushed to main branch

## Project Structure

```
.agents/
├── rules/                # Domain-specific guidelines and constraints
│   ├── commands.md       # Development workflow commands
│   ├── code-style.md     # Formatting, naming, file organization
│   ├── patterns.md       # TanStack, Prisma, Better Auth, storage patterns
│   ├── testing.md        # Vitest, React Testing Library, TDD/BDD
│   ├── deployment.md     # Docker Compose, self-hosting
│   └── communication.md  # Commit messages, docs, writing style
└── skills/               # Task-specific toolkits
    ├── create-component/
    ├── create-route/
    ├── create-server-function/
    ├── create-test/
    ├── db-migration/
    └── update-docs/

docs/                     # User-facing documentation (Diataxis framework)
prisma/                   # Database schema and seed data
scripts/                  # Infrastructure setup scripts
src/
├── admin/                # Admin features (user management, data import/export)
├── auth/                 # Authentication (Better Auth)
├── dashboard/            # Main dashboard (header, stats, store)
├── events/               # Events management
├── family-tree/          # Family tree visualization
├── members/              # Member CRUD
├── relationships/        # Kinship and relationships
├── routes/               # TanStack Start file-based routes
├── ui/                   # Shared UI components (layout, icons, common)
├── database/             # Database layer (client, repositories, generated types)
├── lib/                  # Core infrastructure (storage, env, config, type declarations)
└── i18n/                 # i18next setup and translations
```

## Execution Protocol

1. **Always read this file first** before starting a task so you know which skills or rules to load from `.agents/`.

2. **Rules**:
   - Rules are long-lived constraints (coding practices, patterns, deployment processes)
   - Load relevant rules based on the task at hand
   - Located in `.agents/rules/[rule-name].md`
   - Treat these as required context: preload them before drafting any response

3. **Skills**:
   - Skills are task-specific toolkits with proven workflows
   - Load a skill only if its trigger condition matches the task
   - Once loaded, follow the process and output format defined in the skill
   - Located in `.agents/skills/[skill-name]/SKILL.md`

4. **Response contract**:
   - Explicitly mention which rules are in effect
   - Derive recommendations while enforcing all loaded constraints
   - If conflicts arise, ask for clarification before diverging

## Available Rules

Load these rules when working on relevant domains:

- **[commands.md](.agents/rules/commands.md)** - Development workflow commands (Docker, pnpm, Prisma, Biome, Vitest)
- **[code-style.md](.agents/rules/code-style.md)** - Code formatting, TypeScript conventions, naming, file organization
- **[patterns.md](.agents/rules/patterns.md)** - TanStack Start/Router, Prisma, Better Auth, Tailwind, storage patterns
- **[testing.md](.agents/rules/testing.md)** - Vitest, React Testing Library, TDD/BDD, coverage targets
- **[deployment.md](.agents/rules/deployment.md)** - Docker Compose, PostgreSQL, file storage, environment setup
- **[communication.md](.agents/rules/communication.md)** - Conventional Commits, documentation style, writing conventions

## Available Skills

Load a skill when working on specific task types:

- **[create-component](.agents/skills/create-component/SKILL.md)** - Create React components with proper structure and tests
- **[create-route](.agents/skills/create-route/SKILL.md)** - Create TanStack Start routes with loader, validation, and tests
- **[create-test](.agents/skills/create-test/SKILL.md)** - Write unit and browser tests with Vitest and React Testing Library
- **[create-server-function](.agents/skills/create-server-function/SKILL.md)** - Create server functions with Zod validation and Prisma
- **[db-migration](.agents/skills/db-migration/SKILL.md)** - Manage Prisma schema changes and migrations
- **[port-changes](.agents/skills/port-changes/SKILL.md)** - Analyze upstream base repo changes and create an integration plan for the fork
- **[update-docs](.agents/skills/update-docs/SKILL.md)** - Audit and update all documentation to reflect recent changes

## Quick Reference

### Tech Stack

- **TanStack Start** (full-stack React framework)
- **React 19** with TypeScript (strict mode)
- **TanStack Router** (file-based routing)
- **TanStack Form** (type-safe form handling)
- **Zustand** (state management)
- **Prisma 7** + PostgreSQL (database)
- **Better Auth** (authentication)
- **Zod 4** (validation)
- **CVA** (component variants)
- **unstorage (local fs / S3-compatible)** (file uploads via `STORAGE_PROVIDER`)
- **Tailwind CSS v4** (styling/animation)
- **Biome** (linting + formatting)
- **Vitest** + React Testing Library (unit/component tests)
- **Playwright** (E2E tests)

### Essential Commands

```bash
docker compose up -d          # Start PostgreSQL
pnpm run dev                  # Development server
pnpm run build                # Production build
pnpm run test                 # Run tests (watch mode)
pnpm run test:run             # Run tests (single run)
pnpm run lint                 # Check code quality (Biome)
pnpm run lint:fix             # Auto-fix linting issues
pnpm run typecheck            # TypeScript type checking
pnpm run prisma:studio        # Database GUI
pnpm run prisma:push          # Push schema to database
pnpm run prisma:seed          # Seed sample data
```

### Key Principles

- **Atomic changes**: Smallest logical units
- **Type safety**: Strict TypeScript, Prisma generated types
- **Test coverage**: TDD/BDD workflow, high coverage on core modules
- **Self-hosting**: No cloud dependencies, Docker Compose for everything
- **Self-documenting code**: Clear names over comments
- **American English**: Consistent spelling and terminology

## Rules vs. Skills at a Glance

| Aspect | Rules | Skills |
|--------|-------|--------|
| Purpose | Written guidelines covering a domain | Full toolkits with templates and workflows |
| Execution | Agent interprets and implements | Drop-in code, docs, and checklists |
| Complexity | Describes guardrails and best practices | Encodes proven patterns for specific tasks |
| Maintenance | Update prose as policies evolve | Refresh package when better solutions emerge |

## Common Workflows

### Before Committing

```bash
pnpm run typecheck     # Type check
pnpm run lint          # Lint check
pnpm run test:run      # Run all tests
```

Pre-commit hooks run lint-staged (Biome) automatically.

### Full Quality Check

```bash
pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run build
```

### Database Changes

```bash
# Edit prisma/schema.prisma, then:
pnpm run prisma:migrate:dev
pnpm run prisma:generate
```

### Adding a New Route

1. Create route file in `src/routes/` following TanStack Start conventions
2. Add loader function for server-side data fetching
3. Create component(s) in `src/{domain}/components/`
4. Add server functions in `src/{domain}/server/` if needed
5. Write tests co-located with source files

## Extending the Manifest

- Additional **rules** can be added under `.agents/rules/` for new domains
- Additional **skills** can be added under `.agents/skills/` for specific task types
- Keep this file updated so future agents know when to load each artifact and how to combine them safely

## Project Context

- **Clone project**: Reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os)
- **Reference code**: Available in `base/giapha-os/` directory
- **Self-hosted**: Docker Compose for PostgreSQL + unstorage (local fs / S3-compatible)
- **Vietnamese genealogy**: Kinship terms, lunar calendar, family tree visualization
- **Core modules**: `src/relationships/utils/` (kinship), `src/events/utils/` (dates, events), `src/members/server/` (member logic), `src/admin/server/` (admin logic)
- **Code quality**: Biome for linting/formatting, TypeScript strict mode, comprehensive tests

When in doubt, follow existing patterns in the codebase and refer to the relevant rules in `.agents/rules/`.
