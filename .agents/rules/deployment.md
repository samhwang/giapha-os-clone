# Deployment & Self-Hosting

See [docs/01-deployment.md](../docs/01-deployment.md) for comprehensive deployment guide.

## Quick Reference

### Docker Compose

```bash
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose restart        # Restart services
docker compose logs -f        # Follow logs
```

### PostgreSQL

- Default: `postgresql://giapha:giapha@localhost:5432/giapha`
- Backup: `docker compose exec postgres pg_dump -U giapha giapha > backup.sql`
- Restore: `docker compose exec -T postgres psql -U giapha giapha < backup.sql`

### File Storage

- Uploads are stored on the local filesystem under `UPLOAD_DIR` (default `./uploads`)
- Served via `/api/uploads/` route
- In Docker, mount a volume at `/app/uploads` for persistence

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret (32+ chars) |
| `BETTER_AUTH_URL` | Application URL |
| `UPLOAD_DIR` | File upload directory (default `./uploads`) |

### Health Checks

```bash
docker compose exec postgres pg_isready     # PostgreSQL
curl http://localhost:3000                   # Application
```
