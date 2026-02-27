# Gia Pha OS Clone - Agent Guidelines

## Universal Agents Control Manifest

All agents must emulate `.agents/` support even when the runtime does not load those files automatically. Treat this document as the control manifest: it lists available metadata, where to read it, and how to compose it during a conversation.

## About the Project

Gia Pha OS Clone is a self-hosted Vietnamese genealogy and family tree management application. It is a reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os) using a fully self-hosted stack with no third-party cloud dependencies.

The project focuses on:

- **Self-hosting**: All infrastructure runs via Docker Compose (PostgreSQL, Garage S3)
- **Data sovereignty**: Families control their own genealogical data
- **Vietnamese culture**: Kinship naming, lunar calendar, death anniversaries
- **Maintainability**: Clean code, comprehensive tests, clear documentation

## Role & Technical Context

- **Domain**: Vietnamese genealogy/family tree management
- **Tech Stack**: TanStack Start, React 19, TypeScript, Prisma, PostgreSQL, Better Auth, Garage (S3), Tailwind CSS v4, Framer Motion
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
│   ├── patterns.md       # TanStack, Prisma, Better Auth, S3 patterns
│   ├── testing.md        # Vitest, React Testing Library, TDD/BDD
│   ├── deployment.md     # Docker Compose, self-hosting
│   └── communication.md  # Commit messages, docs, writing style
└── skills/               # Task-specific toolkits (future)
    └── .gitkeep

prisma/                   # Database schema and seed data
scripts/                  # Infrastructure setup scripts
src/
├── components/           # React components (30+ files)
├── lib/                  # Core libraries (auth, db, storage)
├── routes/               # TanStack Start file-based routes
├── server/functions/     # Server functions (API logic)
├── styles/               # Global CSS styles
├── test-utils/           # Test fixtures and helpers
├── types/                # TypeScript type definitions
└── utils/                # Pure utility functions
```

## Execution Protocol

1. **Always read this file first** before starting a task so you know which skills or rules to load from `.agents/`.

2. **Rules**:
   - Rules are long-lived constraints (coding practices, patterns, deployment processes)
   - Load relevant rules based on the task at hand
   - Located in `.agents/rules/[rule-name].md`
   - Treat these as required context: preload them before drafting any response

3. **Skills** (future):
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
- **[patterns.md](.agents/rules/patterns.md)** - TanStack Start/Router, Prisma, Better Auth, Tailwind, S3 patterns
- **[testing.md](.agents/rules/testing.md)** - Vitest, React Testing Library, TDD/BDD, coverage targets
- **[deployment.md](.agents/rules/deployment.md)** - Docker Compose, PostgreSQL, Garage, environment setup
- **[communication.md](.agents/rules/communication.md)** - Conventional Commits, documentation style, writing conventions

## Available Skills

Skills will be added as needed for specific task types.

**Currently**: No skills defined yet. Future skills might include:
- Component creation templates
- Route creation workflows
- Database migration patterns

Add skills under `.agents/skills/[skill-name]/SKILL.md` as needed.

## Quick Reference

### Tech Stack

- **TanStack Start** (full-stack React framework)
- **React 19** with TypeScript (strict mode)
- **TanStack Router** (file-based routing)
- **Prisma** + PostgreSQL (database)
- **Better Auth** (authentication)
- **Garage** (S3-compatible file storage)
- **Tailwind CSS v4** + Framer Motion (styling/animation)
- **Biome** (linting + formatting)
- **Vitest** + React Testing Library (testing)

### Essential Commands

```bash
docker compose up -d     # Start PostgreSQL + Garage
pnpm dev                 # Development server
pnpm build               # Production build
pnpm test                # Run tests (watch mode)
pnpm test:run            # Run tests (single run)
pnpm lint                # Check code quality (Biome)
pnpm lint:fix            # Auto-fix linting issues
pnpm typecheck           # TypeScript type checking
pnpm prisma studio       # Database GUI
pnpm prisma db push      # Push schema to database
pnpm prisma db seed      # Seed sample data
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
pnpm typecheck     # Type check
pnpm lint          # Lint check
pnpm test:run      # Run all tests
```

Pre-commit hooks run lint-staged (Biome) automatically.

### Full Quality Check

```bash
pnpm typecheck && pnpm lint && pnpm test:run && pnpm build
```

### Database Changes

```bash
# Edit prisma/schema.prisma, then:
pnpm prisma migrate dev --name describe_change
pnpm prisma generate
```

### Adding a New Route

1. Create route file in `src/routes/` following TanStack Start conventions
2. Add loader function for server-side data fetching
3. Create component(s) in `src/components/`
4. Add server functions in `src/server/functions/` if needed
5. Write tests co-located with source files

## Extending the Manifest

- Additional **rules** can be added under `.agents/rules/` for new domains
- Additional **skills** can be added under `.agents/skills/` for specific task types
- Keep this file updated so future agents know when to load each artifact and how to combine them safely

## Project Context

- **Clone project**: Reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os)
- **Reference code**: Available in `base/giapha-os/` directory
- **Self-hosted**: Docker Compose for PostgreSQL + Garage (S3)
- **Vietnamese genealogy**: Kinship terms, lunar calendar, family tree visualization
- **Core modules**: `src/utils/**` (kinship, dates, events), `src/server/functions/**` (business logic)
- **Code quality**: Biome for linting/formatting, TypeScript strict mode, comprehensive tests

When in doubt, follow existing patterns in the codebase and refer to the relevant rules in `.agents/rules/`.
