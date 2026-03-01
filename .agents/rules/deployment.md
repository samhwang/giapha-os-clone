# Deployment & Self-Hosting

See [docs/en/07-deployment.md](../docs/en/07-deployment.md) for comprehensive deployment guide.

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

### Garage (S3 Storage)

- Setup: `./scripts/setup-garage.sh`
- S3 API: port 3900
- Admin API: port 3902

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret (32+ chars) |
| `BETTER_AUTH_URL` | Application URL |
| `S3_ENDPOINT` | Garage S3 API URL |
| `S3_ACCESS_KEY` | Garage access key |
| `S3_SECRET_KEY` | Garage secret key |
| `S3_BUCKET` | Storage bucket name |

### Health Checks

```bash
docker compose exec postgres pg_isready     # PostgreSQL
curl http://localhost:3902/health          # Garage
curl http://localhost:3000                # Application
```
