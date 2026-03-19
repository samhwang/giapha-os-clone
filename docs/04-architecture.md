# Architecture

TL;DR: TanStack Start + React 19 + TanStack Router for full-stack, Prisma + PostgreSQL for database, Better Auth for authentication, local filesystem for file storage.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | TanStack Start | latest |
| UI | React | 19 |
| Routing | TanStack Router | latest |
| Forms | TanStack Form | latest |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 7.x |
| Auth | Better Auth | latest |
| Storage | Local filesystem | - |
| Styling | Tailwind CSS | 4.x |
| Component Variants | CVA (class-variance-authority) | latest |
| State Management | Zustand | 5.x |
| Validation | Zod | 4.x |
| i18n | react-i18next | latest |
| Icons | lucide-react | latest |
| Unit Testing | Vitest | 4.x |
| E2E Testing | Playwright | latest |

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

## Database Layer

All database concerns live under `src/database/`:

- **Client**: `src/database/lib/client.ts` initializes the Prisma client singleton using the PostgreSQL adapter
- **Repositories**: Co-located with domain modules (e.g., `src/members/repository/person.ts`)
- **Generated types**: `src/database/generated/prisma/` contains auto-generated Prisma types

Server functions import repository functions instead of calling Prisma directly. This decouples business logic from the ORM.

```typescript
// Server functions use repository functions
import { findPersonById, createPerson } from '../repository/person';
import { withTransaction } from '../../database/transaction';
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `UPLOAD_DIR` | File upload directory (default `./uploads`) |
| `BETTER_AUTH_SECRET` | Auth encryption key |
| `BETTER_AUTH_URL` | Public URL for auth |
| `SITE_NAME` | Site display name (runtime, server-side) |
