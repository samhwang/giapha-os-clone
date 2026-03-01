# Attribution & Divergence

TL;DR: This project is a reimplementation of Gia Pha OS, with significant architectural changes including TanStack Start, Better Auth, Prisma, and Garage S3.

## Attribution

This project is a reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os) by [Homielab](https://github.com/homielab). The original application is built with Next.js and Supabase. This clone replaces the cloud dependencies with self-hosted alternatives while preserving the core functionality and UI.

## Divergence from Original

This project has evolved significantly beyond being a direct clone. The original purpose of preserving the original implementation is no longer relevant as the codebase has diverged substantially.

## Architecture Changes

| Aspect | Original | This Clone |
|--------|----------|------------|
| Framework | Next.js | TanStack Start |
| Auth | Supabase Auth | Better Auth |
| Database | Supabase (PostgreSQL) | Prisma + PostgreSQL |
| File Storage | Supabase Storage | Garage (S3-compatible) |
| Styling | CSS Modules + custom | Tailwind CSS v4 + Framer Motion |

## Code Improvements

- **Server Functions**: Refactored with per-function Prisma client initialization instead of singleton pattern
- **Type Safety**: Strict TypeScript with Zod schema validation at API boundaries
- **Kinship Logic**: Added WeakMap caching for ancestry calculations, extracted reusable transformation functions
- **Error Handling**: Centralized error constants for i18n support
- **Database**: Added indexes on frequently queried columns (generation, isDeceased, birthYear, isInLaw)
- **Testing**: Comprehensive test coverage with Vitest, integration tests with testcontainers

## Conventions

- Biome for linting/formatting (replacing ESLint + Prettier)
- Atomic commits with Conventional Commits
- Agent-based workflow with `.agents/` rules for consistent implementation patterns
- Module-based project structure organized by domain functionality
