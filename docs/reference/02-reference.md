# Reference

Lookup tables for tech stack, project structure, routes, environment variables, commands, CI/CD workflows, and more.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | [TanStack Start](https://tanstack.com/start/latest) | latest |
| UI | [React](https://react.dev/) | 19 |
| Routing | [TanStack Router](https://tanstack.com/router/latest) | latest |
| Forms | [TanStack Form](https://tanstack.com/form/latest) | latest |
| Database | [PostgreSQL](https://www.postgresql.org/) | 15+ |
| ORM | [Prisma](https://www.prisma.io/) | 7.x |
| Auth | [Better Auth](https://www.better-auth.com/) | latest |
| Storage | [unstorage](https://unstorage.unjs.io/) (local fs / S3-compatible) | latest |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | 4.x |
| Component Variants | [CVA](https://cva.style/) (class-variance-authority) | latest |
| State Management | [Zustand](https://github.com/pmndrs/zustand) | 5.x |
| Validation | [Zod](https://zod.dev/) | 4.x |
| i18n | [react-i18next](https://www.i18next.com/) | latest |
| Icons | [lucide-react](https://lucide.dev/) | latest |
| Unit Testing | [Vitest](https://vitest.dev/) | 4.x |
| E2E Testing | [Playwright](https://playwright.dev/) | latest |
| Linting/Formatting | [Biome](https://biomejs.dev/) | latest |

## Project Structure

```
src/
├── admin/              # Admin features (user management, data import/export)
│   ├── components/     # AdminUserList, DataImportExport
│   ├── hooks/          # useAdminForm (TanStack Form)
│   ├── repository/     # user.ts (database operations)
│   ├── server/         # Server functions (user, data management)
│   └── utils/          # CSV and GEDCOM export utilities
├── auth/               # Authentication (Better Auth)
│   ├── client.ts       # Auth client (browser)
│   ├── server.ts       # Auth server (node)
│   ├── components/     # LoginForm, RegisterForm, AuthField
│   ├── hooks/          # useAuthForm (TanStack Form)
│   └── server/         # Auth helpers and middleware
├── dashboard/          # Main dashboard
│   ├── components/     # DashboardHeader, ViewToggle, RootSelector, FamilyStats
│   └── store/          # Zustand store (dashboardStore)
├── events/             # Events management
│   ├── components/     # CustomEventModal, EventsList, LineageManager
│   ├── repository/     # custom-event.ts (database operations)
│   ├── server/         # customEvent, lineage server functions
│   └── utils/          # eventHelpers, dateHelpers
├── family-tree/        # Family tree visualization
│   ├── components/     # FamilyTree, MindmapTree, MindmapNode, FamilyNodeCard
│   ├── hooks/          # usePanZoom
│   └── utils/          # treeHelpers
├── members/            # Member management
│   ├── components/     # MemberForm, MemberDetailModal, PersonCard
│   ├── hooks/          # useMemberForm (TanStack Form)
│   ├── repository/     # person.ts (database operations)
│   └── server/         # member server functions
├── relationships/      # Kinship and relationships
│   ├── components/     # RelationshipManager, KinshipFinder
│   ├── server/         # relationship server functions
│   └── utils/          # kinshipHelpers (Vietnamese kinship logic)
├── routes/             # TanStack Router file-based routes
│   ├── __root.tsx      # Root route with providers
│   ├── index.tsx       # Landing page (/)
│   ├── login.tsx       # Login page (/login)
│   ├── about.tsx       # About page (/about)
│   ├── dashboard/      # Protected routes (/dashboard/*)
│   └── api/            # API routes (auth, uploads)
├── ui/                 # Shared UI components
│   ├── common/         # LanguageSwitcher, ExportButton
│   ├── icons/          # GenderIcons, DefaultAvatar
│   ├── layout/         # Footer, HeaderMenu, LogoutButton, LandingHero
│   └── utils/          # cn() utility, gender style helpers
├── database/           # Database layer
│   ├── generated/prisma/  # Prisma generated types (auto-generated)
│   ├── lib/
│   │   └── client.ts   # Prisma client singleton (getDbClient)
│   └── repository/     # Repository functions (one per entity)
│       ├── transaction.ts  # DbClient type + withTransaction
│       ├── person.ts       # Person + PersonDetailsPrivate ops
│       ├── relationship.ts # Relationship ops
│       ├── custom-event.ts # CustomEvent ops
│       └── user.ts         # User ops
├── config/             # App configuration
│   ├── lib/
│   │   └── env.server.ts   # Server environment variables (Zod-validated)
│   └── server/
│       └── getSiteName.ts  # Server function for runtime site name
├── lib/                # Core infrastructure
│   ├── storage.ts      # File upload handling
│   ├── date.ts         # Date/timezone utilities
│   └── errors.ts       # Error constants
├── types/              # Global TypeScript types and Zod enums
└── i18n/               # Internationalization
    ├── lib/            # i18next setup and translations (en, vi)
    └── server/         # getLanguage server function
```

### Domain Module Convention

Each domain module follows a consistent structure:

```
src/{domain}/
├── components/     # React components for this domain
├── hooks/          # TanStack Form hooks and custom hooks
├── server/         # Server functions (createServerFn)
└── utils/          # Pure utility functions
```

### Shared UI Components

```
src/ui/
├── common/       # LanguageSwitcher, ExportButton
├── icons/        # GenderIcons, DefaultAvatar
├── layout/       # Footer, HeaderMenu, LogoutButton, LandingHero
└── utils/        # cn() class merge utility, gender style helpers
```

## Route Map

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/about` | About page |
| `/login` | Login/register |
| `/dashboard` | Main dashboard (family tree, stats) |
| `/dashboard/members` | Member list |
| `/dashboard/members/new` | Create member |
| `/dashboard/members/$id` | Member detail |
| `/dashboard/members/$id/edit` | Edit member |
| `/dashboard/events` | Events management |
| `/dashboard/kinship` | Kinship finder |
| `/dashboard/lineage` | Lineage order |
| `/dashboard/stats` | Family statistics |
| `/dashboard/data` | Data import/export |
| `/dashboard/users` | Admin user management |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STORAGE_PROVIDER` | Storage driver: `local` (default) or `s3` |
| `UPLOAD_DIR` | File upload directory (required when `local`) |
| `S3_ENDPOINT` | S3-compatible endpoint URL (required when `s3`) |
| `S3_BUCKET` | S3 bucket name (required when `s3`) |
| `S3_REGION` | S3 region (required when `s3`) |
| `S3_ACCESS_KEY_ID` | S3 access key (required when `s3`) |
| `S3_SECRET_ACCESS_KEY` | S3 secret key (required when `s3`) |
| `S3_PUBLIC_URL` | Public URL prefix for S3 objects (required when `s3`) |
| `BETTER_AUTH_SECRET` | Auth encryption key |
| `BETTER_AUTH_URL` | Public URL for auth |
| `SITE_NAME` | Site display name (runtime, server-side) |

## Commands

### Development

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |

### Database ([Prisma](https://www.prisma.io/))

| Command | Description |
|---------|-------------|
| `pnpm run prisma:push` | Push schema changes to database |
| `pnpm run prisma:generate` | Regenerate TypeScript types |
| `pnpm run prisma:studio` | Open database GUI |
| `pnpm run prisma:migrate:dev` | Create migration file |
| `npx dotenvx run -- prisma migrate reset` | Reset database (deletes all data) |
| `pnpm run prisma:seed` | Seed sample data |

### Testing

| Command | Description |
|---------|-------------|
| `pnpm run test` | [Vitest](https://vitest.dev/) watch mode |
| `pnpm run test:run` | Run all Vitest tests once |
| `pnpm run test:ui` | UI component tests |
| `pnpm run test:server` | Server function tests ([Testcontainers](https://testcontainers.com/)) |
| `pnpm run test:integration` | Route-level integration tests |
| `pnpm run test:coverage` | Run with coverage report |
| `pnpm run test:e2e` | [Playwright](https://playwright.dev/) E2E tests |
| `pnpm run test:e2e:ui` | Playwright UI mode |

### Code Quality

| Command | Description |
|---------|-------------|
| `pnpm run lint` | [Biome](https://biomejs.dev/) linting and formatting check |
| `pnpm run lint:fix` | Auto-fix linting issues |
| `pnpm run typecheck` | TypeScript type checking |

### Infrastructure

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start PostgreSQL (and optionally [SeaweedFS](https://github.com/seaweedfs/seaweedfs) for S3 storage) |
| `docker compose down` | Stop services |

### Quality Check (all-in-one)

```bash
pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run build
```

## CI/CD Workflows

The project uses [GitHub Actions](https://docs.github.com/en/actions) for automated testing and deployment.

### Pull Request Workflow

**File:** `.github/workflows/pull-request.yml`

Triggered on pull requests to master branch. Runs the full CI pipeline.

### CI Workflow

**File:** `.github/workflows/ci.yml`

Reusable workflow called by both pull requests and the build workflow. Runs all validation checks in parallel:

| Task | Command | Description |
|------|---------|-------------|
| ci | `pnpm run lint` | Biome linting and formatting check |
| typecheck | `pnpm run typecheck` | TypeScript type checking |
| test:ui | `pnpm run test:ui` | React component unit tests |
| test:server | `pnpm run test:server` | Server function tests |
| test:integration | `pnpm run test:integration` | Integration tests |
| e2e | `pnpm run test:e2e` | Playwright end-to-end tests |

All tasks except e2e run in parallel using a matrix strategy.

### Build and Push Workflow

**File:** `.github/workflows/build.yml`

Triggered on push to master branch. Runs CI, then builds and pushes a Docker image to [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) (GHCR).

### Docker Image Tags

```
ghcr.io/<owner>/giapha-os-clone:latest
ghcr.io/<owner>/giapha-os-clone:sha-<short_sha>
```

- `latest` — Always points to the most recent build
- `sha-{short_sha}` — Unique tag for each commit

## Coverage Targets

| Layer | Target |
|-------|--------|
| Utilities (`src/utils/**`) | 90%+ |
| Server Functions (`src/**/server/*.test.ts`) | 80%+ |
| Components (`src/components/**`) | 70%+ |

## Test Utilities

Helpers from `test/`:

```tsx
import { renderWithProviders } from '../../test/render-wrapper'

renderWithProviders(<Component />)
```

Shared mock data in `src/test-utils/fixtures.ts`:

- `mockPersons` — Representative persons across generations
- `mockRelationships` — Marriage + biological_child relationships
- `mockAdminUser`, `mockMemberUser` — User objects with different roles
- Builder functions: `createPerson(overrides)`, `createRelationship(overrides)`

## Service Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| App | `http://localhost:3000` | Application |
| PostgreSQL | `localhost:5432` | Database |

## Deployment Targets

The deployment target is controlled by the `DEPLOYMENT_ENV` environment variable at **build time**:

| DEPLOYMENT_ENV | Provider | Vite Plugin |
|----------------|----------|-------------|
| `node` (default) | Docker, VPS, Railway | `nitro` (node-server preset) |
| `vercel` | [Vercel](https://vercel.com/) | `nitro` (vercel preset) |
| `netlify` | [Netlify](https://www.netlify.com/) | `@netlify/vite-plugin-tanstack-start` |
| `cloudflare` | [Cloudflare Workers](https://workers.cloudflare.com/) | `@cloudflare/vite-plugin` |

## Storage Providers

| Provider | Documentation |
|----------|--------------|
| [SeaweedFS](https://github.com/seaweedfs/seaweedfs) | [S3 API docs](https://github.com/seaweedfs/seaweedfs/wiki/Amazon-S3-API) |
| [Garage](https://garagehq.deuxfleurs.fr/) | [S3 compatibility docs](https://garagehq.deuxfleurs.fr/documentation/connect/cli/) |
| [AWS S3](https://aws.amazon.com/s3/) | [AWS CLI s3 sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html) |
| [Supabase Storage](https://supabase.com/docs/guides/storage) | [Storage guides](https://supabase.com/docs/guides/storage) |
| [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | [Vercel Blob docs](https://vercel.com/docs/storage/vercel-blob) |
| [Cloudflare R2](https://developers.cloudflare.com/r2/) | [R2 docs](https://developers.cloudflare.com/r2/) |
| [MinIO](https://min.io/) | [mc CLI reference](https://min.io/docs/minio/linux/reference/minio-mc.html) |

## File Organization Conventions

### Routes

- File-based routing: `src/routes/path.tsx` → `/path`
- Nested routes: `src/routes/dashboard/members/index.tsx` → `/dashboard/members`
- Dynamic segments: `src/routes/dashboard/members/$id/index.tsx` → `/dashboard/members/:id`

### Components

- Domain components: `src/{domain}/components/` (co-located with their domain)
- Shared UI components: `src/ui/` (layout, icons, common utilities)

### Server Functions

- Domain server functions: `src/{domain}/server/` using `createServerFn` with middleware
- Auth middleware applied via `.middleware()` chain
