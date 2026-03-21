# Architecture

Why the application is built the way it is, how data flows through the system, and where this project came from.

For the tech stack table, project structure, and environment variables, see the [Reference](../reference/02-reference.md) document.

## Why This Stack

[TanStack Start](https://tanstack.com/start/latest) was chosen as the framework because it provides full-stack React with file-based routing, server functions, and type-safe data loading — all without a separate API layer. Combined with [Prisma](https://www.prisma.io/) for database access and [Better Auth](https://www.better-auth.com/) for authentication, the stack allows the entire application to be self-hosted via Docker Compose with no third-party cloud dependencies.

Key design decisions:

- **TanStack Start over Next.js**: Server functions with middleware chains provide cleaner auth patterns than Next.js API routes. File-based routing with type-safe loaders reduces boilerplate.
- **Prisma over raw SQL**: Generated TypeScript types ensure type safety across the database layer. The repository pattern decouples business logic from the ORM.
- **Better Auth over Supabase Auth**: Self-hosted authentication with no external dependency. Session-based auth stored in cookies.
- **unstorage over direct filesystem calls**: Abstraction layer that supports both local filesystem and S3-compatible storage via a single `STORAGE_PROVIDER` environment variable.
- **Tailwind CSS v4 over CSS Modules**: Utility-first styling with built-in animation support. Consistent design system without maintaining separate CSS files.

## Domain Module Convention

The codebase is organized by domain (members, events, relationships, etc.) rather than by technical layer (components, services, models). Each domain module follows a consistent structure:

```
src/{domain}/
├── components/     # React components for this domain
├── hooks/          # TanStack Form hooks and custom hooks
├── server/         # Server functions (createServerFn)
│   └── repository/ # Database operations for this domain
└── utils/          # Pure utility functions
```

This convention means all code related to "members" lives under `src/members/`, all code related to "events" lives under `src/events/`, etc. Cross-cutting concerns (database client, storage, auth) live in dedicated infrastructure directories (`src/database/`, `src/lib/`, `src/auth/`).

## Data Flow

### Client-Side Rendering

```
User Request
    ↓
TanStack Router (file-based routes)
    ↓
Route Component (e.g., src/routes/dashboard/index.tsx)
    ↓
Loader (server-side data fetching via createServerFn)
    ↓
Database Query (Prisma → PostgreSQL)
    ↓
Return Data to Component
    ↓
Render UI
```

### Form Submissions

```
User fills TanStack Form
    ↓
Client-side validation (Zod, where applicable)
    ↓
form.onSubmit calls server function
    ↓
Server function validates input (Zod)
    ↓
Database Operation (Prisma)
    ↓
Return result / Invalidate router
```

## Authentication Flow

1. **Login**: User submits credentials → Better Auth validates → Session created
2. **Session**: Stored in cookie, validated on each request
3. **Protected Routes**: `beforeLoad` checks session, redirects if not authenticated
4. **Roles**: Three roles (admin, editor, member) stored on the User model. Server function middleware (`isAdminMiddleware`, `isUserMiddleware`) enforces authorization.

## Database Layer

All database concerns follow a repository pattern. Server functions import repository functions instead of calling Prisma directly. This decouples business logic from the ORM — if the ORM is replaced, only the repository files need to change.

Repository functions accept an optional `client` parameter that defaults to the singleton Prisma client. Pass a transaction client (`tx`) from `withTransaction` for transactional operations. This pattern keeps the database layer testable and transaction-friendly.

## Project Origins

This project is a reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os) by [Homielab](https://github.com/homielab). The original application is built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/). This clone replaces the cloud dependencies with self-hosted alternatives while preserving the core functionality and UI.

### Divergence from Original

This project has evolved significantly beyond being a direct clone. The original purpose of preserving the original implementation is no longer relevant as the codebase has diverged substantially.

### Architecture Changes

| Aspect | Original | This Clone |
|--------|----------|------------|
| Framework | Next.js | TanStack Start |
| Auth | Supabase Auth | Better Auth |
| Database | Supabase (PostgreSQL) | Prisma + PostgreSQL |
| File Storage | Supabase Storage | Local filesystem / S3-compatible |
| Styling | CSS Modules + custom | Tailwind CSS v4 |

### Code Improvements

- **Server Functions**: Refactored with per-function Prisma client initialization instead of singleton pattern
- **Type Safety**: Strict TypeScript with [Zod](https://zod.dev/) schema validation at API boundaries
- **Kinship Logic**: Added WeakMap caching for ancestry calculations, extracted reusable transformation functions
- **Error Handling**: Centralized error constants for i18n support
- **Database**: Added indexes on frequently queried columns (generation, isDeceased, birthYear, isInLaw)
- **Testing**: Comprehensive test coverage with [Vitest](https://vitest.dev/), integration tests with [Testcontainers](https://testcontainers.com/)

### Conventions

- [Biome](https://biomejs.dev/) for linting/formatting (replacing ESLint + Prettier)
- Atomic commits with [Conventional Commits](https://www.conventionalcommits.org/)
- Agent-based workflow with `.agents/` rules for consistent implementation patterns
- Module-based project structure organized by domain functionality
