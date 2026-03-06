# Architecture

TL;DR: TanStack Start + React 19 + TanStack Router for full-stack, Prisma + PostgreSQL for database, Better Auth for authentication, Garage (S3) for file storage.

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | TanStack Start | latest |
| UI | React | 19 |
| Routing | TanStack Router | latest |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 6.x |
| Auth | Better Auth | latest |
| Storage | Garage (S3-compatible) | latest |
| Styling | Tailwind CSS | 4.x |
| i18n | react-i18next | latest |
| Testing | Vitest | 4.x |
| Browser Testing | Vitest Browser + Playwright | latest |

## Project Structure

```
src/
├── components/           # Shared React components
│   ├── ui/              # Base UI components (Button, Input, etc.)
│   └── ...
├── lib/                  # Core libraries
│   ├── auth-client.ts    # Auth client (browser)
│   ├── auth-server.ts    # Auth server (node)
│   ├── db.ts            # Prisma client
│   └── storage.ts       # S3 storage utilities
├── routes/              # TanStack Router file-based routing
│   ├── index.tsx        # Landing page (/)
│   ├── login.tsx        # Login page (/login)
│   ├── dashboard/       # Dashboard routes (/dashboard/*)
│   │   ├── index.tsx    # Dashboard home
│   │   ├── members/     # Member management
│   │   └── ...
│   └── __root.tsx       # Root route with providers
├── styles/              # Global CSS
├── types/               # Shared TypeScript types
├── utils/               # Pure utility functions
└── test-utils/          # Test helpers and fixtures
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
Loader (server-side data fetching)
    ↓
Database Query (Prisma → PostgreSQL)
    ↓
Return Data to Component
    ↓
Render UI
```

### Form Submissions

```
User submits form
    ↓
Action (server-side handler)
    ↓
Validate Input
    ↓
Database Operation (Prisma)
    ↓
Redirect or Return Data
```

## Authentication Flow

1. **Login**: User submits credentials → Better Auth validates → Session created
2. **Session**: Stored in cookie, validated on each request
3. **Protected Routes**: Loader checks session, redirects if not authenticated
4. **Roles**: User roles (admin, user) stored in session for authorization

## File Organization Conventions

### Routes

- File-based routing: `src/routes/path.tsx` → `/path`
- Nested routes: `src/routes/dashboard/members.tsx` → `/dashboard/members`
- Dynamic segments: `src/routes/dashboard/members/$id.tsx` → `/dashboard/members/:id`

### Components

- Shared components: `src/components/`
- Feature components: co-located with routes
- UI components: `src/components/ui/`

### Server Functions

- Load: `export const loader = async () => { ... }`
- Actions: `export const action = async () => { ... }`
- Located inline in route files

## Database Connection

Prisma client is initialized in `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export { prisma }
```

Used in loaders and actions for database operations.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `S3_*` | S3 storage configuration (endpoint, access key, secret key, bucket) |
| `BETTER_AUTH_SECRET` | Auth encryption key |
| `BETTER_AUTH_URL` | Public URL for auth |
