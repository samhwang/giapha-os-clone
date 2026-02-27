# Gia Pha OS Clone

English | [Tiếng Việt](README.vi.md)

A self-hosted Vietnamese genealogy and family tree management application. This is a reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os) using a fully self-hosted stack — no third-party cloud dependencies.

This is a mainly Vietnamese app. It does support English, but only for usage purposes. The main kinship term stays Vietnamese.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19, TypeScript)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database**: [Prisma](https://www.prisma.io/) + PostgreSQL
- **File Storage**: [Garage](https://garagehq.deuxfleurs.fr/) (S3-compatible)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **Infrastructure**: Docker Compose

## Features

- Family tree visualization (tree, mindmap, and list views)
- Member management with avatar uploads
- Vietnamese kinship calculator (automatic relationship naming)
- Lunar calendar integration for death anniversaries
- Family statistics dashboard
- Upcoming events (birthdays and death anniversaries)
- Data import/export (JSON backup)
- Role-based access control (admin/member)
- Admin user management (approve, block, create users)

## Prerequisites

- [Node.js](https://nodejs.org/) v22.x
- [pnpm](https://pnpm.io/) v10.x
- [Docker](https://www.docker.com/) + Docker Compose
- [jq](https://jqlang.github.io/jq/) (used by `setup-garage.sh`)

## Quick Start

1. **Start infrastructure**

   ```bash
   docker compose up -d
   ```

2. **Set up Garage storage bucket**

   ```bash
   ./scripts/setup-garage.sh
   ```

3. **Set up Better Auth token**

  ```bash
  pnpm run auth:secret
  ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Configure environment**

   ```bash
   cp .env.sample .env
   # Edit .env with your S3 keys from the Garage and Better Auth setup output
   ```

6. **Set up database**

   ```bash
   pnpm run prisma:migrate:dev
   pnpm run prisma:seed
   ```

7. **Start development server**

   ```bash
   pnpm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The first user to sign up automatically becomes admin.

## Available Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Production build |
| `pnpm run start` | Start production server |
| `pnpm run test` | Run tests in watch mode |
| `pnpm run test:run` | Run tests once |
| `pnpm run test:coverage` | Run tests with coverage report |
| `pnpm run test:ui` | Run UI component tests |
| `pnpm run test:server` | Run server function tests |
| `pnpm run test:integration` | Run integration tests |
| `pnpm run lint` | Check linting (Biome) |
| `pnpm run lint:fix` | Auto-fix lint issues |
| `pnpm run typecheck` | TypeScript type checking |
| `pnpm run ci` | Strict CI linting check |
| `pnpm run prisma:studio` | Open Prisma database GUI |
| `pnpm run prisma:push` | Push schema to database |
| `pnpm run prisma:generate` | Generate Prisma client |
| `pnpm run prisma:seed` | Seed database with sample data |
| `pnpm run prisma:migrate:dev` | Create and apply migration |
| `pnpm run prisma:migrate:prod` | Deploy migration |
| `pnpm run prisma:format` | Format Prisma schema |
| `pnpm run auth:secret` | Generate Better Auth secret |
| `pnpm run auth:generate` | Generate Better Auth client |

## Project Structure

```
├── .agents/              # Agent rules and skills
├── prisma/               # Database schema and seed data
├── scripts/              # Infrastructure setup scripts
├── public/               # Static assets (favicons, manifest)
├── src/
│   ├── components/       # React components
│   ├── lib/              # Core libraries (auth, db, storage)
│   ├── routes/           # TanStack Start file-based routes
│   ├── server/functions/ # Server functions (API logic)
│   ├── styles/           # Global CSS styles
│   ├── test-utils/       # Test fixtures and helpers
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Pure utility functions
├── docker-compose.yml    # PostgreSQL + Garage
└── biome.json            # Linter/formatter config
```

## Attribution

This project is a reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os) by [Homielab](https://github.com/homielab). The original application is built with Next.js and Supabase. This clone replaces the cloud dependencies with self-hosted alternatives while preserving the core functionality and UI.
