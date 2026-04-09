# Gia Pha OS Clone

A self-hosted Vietnamese genealogy and family tree management application. This is a reimplementation of [Gia Pha OS](https://github.com/homielab/giapha-os) using a fully self-hosted stack — no third-party cloud dependencies.

This is a mainly Vietnamese app. It does support English, but only for usage purposes. The main kinship term stays Vietnamese.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19, TypeScript)
- **Forms**: [TanStack Form](https://tanstack.com/form) (type-safe form handling)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database**: [Prisma](https://www.prisma.io/) + PostgreSQL
- **File Storage**: Local filesystem / S3-compatible (via [unstorage](https://unstorage.unjs.io/))
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Infrastructure**: Docker Compose

## Features

- Family tree visualization (tree, mindmap, bubble map, and list views)
- Member management with avatar uploads
- Vietnamese kinship calculator (automatic relationship naming)
- Lunar calendar integration for death anniversaries
- Family statistics dashboard
- Upcoming events (birthdays and death anniversaries)
- Custom event management
- Lineage order management
- Data import/export (JSON, CSV, GEDCOM, PDF)
- Role-based access control (admin/editor/member)
- Admin user management (approve, block, create users)

## Quick Start (Self-Hosted)

1. **Clone and configure**

   ```bash
   git clone https://github.com/your-repo/giapha-os-clone.git
   cd giapha-os-clone
   ```

2. **Generate secrets**

   ```bash
   openssl rand -hex 32  # For BETTER_AUTH_SECRET
   openssl rand -hex 32  # For DB_PASSWORD
   ```

3. Update service environment variables in `docker-compose.production.yml`. These fields will be marked with `change-me`.

4. **Start services**

   ```bash
   docker compose -f docker-compose.production.yml up -d
   ```

   This will start the database container `postgres`, then when that's ready `db-migrate` will run and initiate the database.
   When it's finished, then the `app` service will boot up.

5. **Access the app**

   Open `http://localhost:3000`. The first user to sign up becomes admin.

See the [Deployment Guide](./docs/how-to/02-deployment.md) for detailed instructions.

## Quick Start (Development)

1. **Start infrastructure**

   ```bash
   docker compose up -d
   ```

2. **Set up Better Auth token**

   ```bash
   pnpm run auth:secret
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Configure environment**

   ```bash
   cp .env.sample .env
   ```

5. **Set up database**

   ```bash
   pnpm run prisma:migrate:dev
   pnpm run prisma:seed
   ```

6. **Start development server**

   ```bash
   pnpm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── .agents/              # Agent rules and skills
├── prisma/               # Database schema and seed data
├── scripts/              # Infrastructure setup scripts
├── public/               # Static assets (favicons, manifest)
├── src/
│   ├── admin/            # Admin features (user management, data import/export)
│   ├── auth/             # Authentication (Better Auth)
│   ├── dashboard/        # Main dashboard (header, stats, store)
│   ├── events/           # Events management
│   ├── family-tree/      # Family tree visualization
│   ├── members/          # Member CRUD
│   ├── relationships/    # Kinship and relationships
│   ├── routes/           # TanStack Start file-based routes
│   ├── ui/               # Shared UI components
│   ├── database/         # Database layer (client, repositories, generated types)
│   ├── config/           # App configuration (env validation, site settings)
│   ├── lib/              # Shared utilities (storage, dates, errors, logging, query keys)
│   └── i18n/             # i18next translations
├── docker-compose.yml    # PostgreSQL
├── .oxlintrc.json        # Linter config (Oxlint)
└── .oxfmtrc.json         # Formatter config (Oxfmt)
```
