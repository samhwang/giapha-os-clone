# Getting Started

TL;DR: Clone the repo, install dependencies, start Docker services, run migrations, then start the dev server with `bun run dev`.

## Prerequisites

- **[Docker](https://www.docker.com/)** & Docker Compose - for PostgreSQL
- **[Bun](https://bun.sh/)** - runtime and package manager

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/giapha-os-clone.git
cd giapha-os-clone
```

### 2. Install dependencies

```bash
bun install
```

### 3. Environment setup

Copy the example environment file and configure it:

```bash
cp .env.sample .env
```

Edit `.env` with your settings. The default values work for local development:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/giapha"
UPLOAD_DIR=./uploads
BETTER_AUTH_SECRET="your-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Start infrastructure

```bash
docker compose up -d
```

This starts:

- **PostgreSQL** on port 5432

File uploads are stored locally under `UPLOAD_DIR` (default `./uploads`), which is created automatically.

### 5. Setup database

Push the schema to your database:

```bash
bun run prisma:push
```

Generate the Prisma client:

```bash
bun run prisma:generate
```

(Optional) Seed sample data:

```bash
bun run prisma:seed
```

### 6. Start development server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

See the [Commands](../reference/02-reference.md#commands) reference for the full command list.

## Troubleshooting

### Port already in use

If port 3000 is taken:

```bash
# Find what's using it
lsof -i :3000

# Or use a different port
PORT=3001 bun run dev
```

### Database connection refused

Make sure Docker is running:

```bash
docker ps
# Should show postgres container
```

### Reset database

```bash
# Wipe and recreate
bunx dotenvx run -- prisma migrate reset

# Or just push fresh
bunx dotenvx run -- prisma db push --force-reset
```

## Next Steps

- Read the [Architecture](../explanation/01-architecture.md) guide to understand design decisions
- Read the [Development](./03-development.md) guide to start building features
- Explore the [Features](../explanation/02-features.md) documentation
