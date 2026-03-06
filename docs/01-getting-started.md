# Getting Started

TL;DR: Clone the repo, install dependencies, start Docker services, run migrations, then start the dev server with `pnpm dev`.

## Prerequisites

- **Docker** & Docker Compose - for PostgreSQL and Garage (S3 storage)
- **pnpm** - package manager
- **Node.js** 20+ - runtime

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/giapha-os-clone.git
cd giapha-os-clone
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings. The default values work for local development:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/giapha"
S3_ACCESS_KEY="garage_access_key"
S3_SECRET_KEY="garage_secret_key"
S3_ENDPOINT="http://localhost:3900"
S3_BUCKET="giapha"
BETTER_AUTH_SECRET="your-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Start infrastructure

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Garage** (S3-compatible storage) on port 3900

### 5. Setup database

Push the schema to your database:

```bash
pnpm prisma db push
```

Generate the Prisma client:

```bash
pnpm prisma generate
```

(Optional) Seed sample data:

```bash
pnpm prisma db seed
```

### 6. Start development server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm prisma studio` | Open database GUI |
| `pnpm prisma db push` | Push schema changes |
| `docker compose up -d` | Start/stop infrastructure |

## Troubleshooting

### Port already in use

If port 3000 is taken:

```bash
# Find what's using it
lsof -i :3000

# Or use a different port
PORT=3001 pnpm dev
```

### Database connection refused

Make sure Docker is running:

```bash
docker ps
# Should show postgres and garage containers
```

### Reset database

```bash
# Wipe and recreate
pnpm prisma migrate reset

# Or just push fresh
pnpm prisma db push --force-reset
```

## Next Steps

- Read the [Architecture](./architecture.md) guide to understand the project structure
- Read the [Development](./development.md) guide to start building features
- Explore the [Features](./features.md) documentation
