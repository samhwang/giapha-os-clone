# Deployment & Self-Hosting

## Infrastructure Overview

All services run via Docker Compose:

- **PostgreSQL 17** — Primary database
- **Garage v1.1.0** — S3-compatible file storage (avatar images)
- **Node.js 22** — Application runtime (not containerized for development)

## Docker Compose Management

```bash
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose down -v        # Stop and remove volumes (data loss!)
docker compose restart        # Restart all services
docker compose logs -f        # Follow all logs
```

## PostgreSQL

### Connection

Default: `postgresql://giapha:giapha@localhost:5432/giapha`

### Backup

```bash
docker compose exec postgres pg_dump -U giapha giapha > backup.sql
```

### Restore

```bash
docker compose exec -T postgres psql -U giapha giapha < backup.sql
```

### Migrations

```bash
pnpm prisma migrate dev --name describe_change   # Development
pnpm prisma migrate deploy                        # Production
```

## Garage (S3 Storage)

### Initial Setup

Run after first `docker compose up`:

```bash
./scripts/setup-garage.sh
```

This creates the `avatars` bucket and outputs S3 access keys. Add these to `.env`.

### Bucket Management

Garage admin API runs on port 3902. S3 API runs on port 3900.

### Public Access

Avatar URLs follow the pattern:

```
http://localhost:3900/avatars/{personId}/{filename}
```

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://giapha:giapha@localhost:5432/giapha` |
| `BETTER_AUTH_SECRET` | Auth encryption secret | Random 32+ character string |
| `BETTER_AUTH_URL` | Application URL | `http://localhost:3000` |
| `S3_ENDPOINT` | Garage S3 API URL | `http://localhost:3900` |
| `S3_ACCESS_KEY` | Garage access key | From setup script output |
| `S3_SECRET_KEY` | Garage secret key | From setup script output |
| `S3_BUCKET` | Storage bucket name | `avatars` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `SITE_NAME` | Display name in UI | `Gia Pha OS` |

## Health Checks

### PostgreSQL

```bash
docker compose exec postgres pg_isready
```

### Garage

```bash
curl http://localhost:3902/health
```

### Application

```bash
curl http://localhost:3000
```

## Troubleshooting

### Database connection refused

1. Check if PostgreSQL is running: `docker compose ps`
2. Check logs: `docker compose logs postgres`
3. Verify `DATABASE_URL` in `.env`

### Garage upload fails

1. Check if Garage is running: `docker compose ps`
2. Verify bucket exists: check `./scripts/setup-garage.sh` output
3. Verify S3 credentials in `.env`

### Prisma schema drift

If the database schema is out of sync:

```bash
pnpm prisma db push --force-reset   # Warning: drops all data
pnpm prisma db seed                  # Re-seed after reset
```
