# Kiến Trúc

TL;DR: TanStack Start + React 19 + TanStack Router cho full-stack, Prisma + PostgreSQL cho database, Better Auth cho authentication, Garage (S3) cho file storage.

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
| Animation | Framer Motion | latest |
| i18n | react-i18next | latest |
| Testing | Vitest | 4.x |
| Browser Testing | Vitest Browser + Playwright | latest |

## Cấu Trúc Dự Án

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

## Luồng Dữ Liệu

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

## Luồng Authentication

1. **Login**: User submits credentials → Better Auth validates → Session created
2. **Session**: Stored in cookie, validated on each request
3. **Protected Routes**: Loader checks session, redirects if not authenticated
4. **Roles**: User roles (admin, user) stored in session for authorization

## Quy Ước Tổ Chức File

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

## Kết Nối Database

Prisma client được khởi tạo trong `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export { prisma }
```

Được sử dụng trong loaders và actions cho các thao tác database.

## Biến Môi Trường

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GARAGE_*` | S3 storage configuration |
| `BETTER_AUTH_SECRET` | Auth encryption key |
| `BETTER_AUTH_URL` | Public URL for auth |
