# Deployment

TL;DR: Self-host with Docker Compose - PostgreSQL + Garage S3. Set environment variables and build for production.

## Infrastructure

The app requires two external services:

### PostgreSQL

- **Purpose**: Database
- **Port**: 5432 (default)
- **Image**: postgres:15

### Garage (S3-Compatible)

- **Purpose**: File storage (avatars, images)
- **Port**: 3900 (default)
- **Image**: depierre/garage

## Docker Compose

### Development

```bash
docker compose up -d
```

Starts PostgreSQL and Garage for local development.

### Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: giapha
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - giapha

  garage:
    image: depierre/garage
    restart: always
    command: garage server --data-dir /data
    volumes:
      - garage_data:/data
    ports:
      - "3900:3900"
    environment:
      GARAGE_SECRET_KEY: ${GARAGE_SECRET_KEY}
    networks:
      - giapha

  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/giapha
      - GARAGE_ACCESS_KEY=${GARAGE_ACCESS_KEY}
      - GARAGE_SECRET_KEY=${GARAGE_SECRET_KEY}
      - GARAGE_ENDPOINT=http://garage:3900
      - GARAGE_BUCKET=giapha
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=https://your-domain.com
    depends_on:
      - postgres
      - garage
    networks:
      - giapha

volumes:
  postgres_data:
  garage_data:

networks:
  giapha:
```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GARAGE_ACCESS_KEY` | S3 access key |
| `GARAGE_SECRET_KEY` | S3 secret key |
| `GARAGE_ENDPOINT` | Garage API URL |
| `GARAGE_BUCKET` | S3 bucket name |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) |
| `BETTER_AUTH_URL` | Public URL |

### Generate Secrets

```bash
# Auth secret (generate 32+ char random string)
openssl rand -base64 32

# Garage keys
openssl rand -hex 16
```

## Building

### Build for Production

```bash
pnpm build
```

Output is in `dist/`.

### Docker Build

```bash
docker build -t giapha-os:latest .
```

## Self-Hosting Checklist

1. [ ] Set up server (VPS, home server, etc.)
2. [ ] Install Docker and Docker Compose
3. [ ] Configure environment variables
4. [ ] Pull latest image or build locally
5. [ ] Start services with `docker compose -f docker-compose.prod.yml up -d`
6. [ ] Set up reverse proxy (nginx, Caddy, etc.)
7. [ ] Configure SSL/TLS (Let's Encrypt)
8. [ ] Set up backups (database, uploads)

## Backup

### Database Backup

```bash
# Dump database
docker exec giapha-postgres pg_dump -U postgres giapha > backup.sql

# Restore
docker exec -i giapha-postgres psql -U postgres giapha < backup.sql
```

### File Backup

```bash
# Backup Garage data
docker run --rm -v giapha_garage_data:/data -v $(pwd):/backup alpine tar czf /backup/garage_backup.tar.gz /data
```

## Monitoring

### Health Check

```bash
docker compose ps
docker compose logs -f app
```

### Resource Usage

```bash
docker stats
```
