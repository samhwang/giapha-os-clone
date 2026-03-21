# Deployment & Self-Hosting

See [docs/02-deployment.md](../docs/02-deployment.md) for the comprehensive deployment guide and [docs/08-storage.md](../docs/08-storage.md) for storage configuration.

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

- Storage provider is selected via `STORAGE_PROVIDER` env var (`local` or `s3`)
- **Local**: Files stored under `UPLOAD_DIR`, served via `/api/uploads/` route. Mount a volume at `/app/uploads` in Docker.
- **S3**: Files stored in an S3-compatible bucket (AWS S3, SeaweedFS, MinIO, Cloudflare R2, etc.). The `/api/uploads/` route redirects to the S3 public URL.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Auth secret (32+ chars) |
| `BETTER_AUTH_URL` | Application URL |
| `STORAGE_PROVIDER` | `local` (default) or `s3` |
| `UPLOAD_DIR` | File upload directory (required when `local`) |
| `S3_ENDPOINT` | S3-compatible endpoint (required when `s3`) |
| `S3_BUCKET` | S3 bucket name (required when `s3`) |
| `S3_REGION` | S3 region (required when `s3`) |
| `S3_ACCESS_KEY_ID` | S3 access key (required when `s3`) |
| `S3_SECRET_ACCESS_KEY` | S3 secret key (required when `s3`) |
| `S3_PUBLIC_URL` | Public URL prefix for S3 objects (required when `s3`) |

### Health Checks

```bash
docker compose exec postgres pg_isready     # PostgreSQL
curl http://localhost:3000                   # Application
```
