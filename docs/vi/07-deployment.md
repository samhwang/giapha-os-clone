# Triển Khai

TL;DR: Tự host với Docker Compose - PostgreSQL + Garage S3. Cài đặt biến môi trường và build cho production.

## Hạ Tầng

App yêu cầu hai dịch vụ bên ngoài:

### PostgreSQL

- **Mục đích**: Database
- **Port**: 5432 (mặc định)
- **Image**: postgres:15

### Garage (S3-Compatible)

- **Mục đích**: File storage (avatars, images)
- **Port**: 3900 (mặc định)
- **Image**: depierre/garage

## Docker Compose

### Development

```bash
docker compose up -d
```

Khởi động PostgreSQL và Garage cho local development.

### Production

Tạo `docker-compose.prod.yml`:

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

## Biến Môi Trường

### Bắt Buộc

| Variable | Mô tả |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GARAGE_ACCESS_KEY` | S3 access key |
| `GARAGE_SECRET_KEY` | S3 secret key |
| `GARAGE_ENDPOINT` | Garage API URL |
| `GARAGE_BUCKET` | S3 bucket name |
| `BETTER_AUTH_SECRET` | Auth secret (tối thiểu 32 ký tự) |
| `BETTER_AUTH_URL` | URL công khai |

### Tạo Secrets

```bash
# Auth secret (tạo chuỗi ngẫu nhiên 32+ ký tự)
openssl rand -base64 32

# Garage keys
openssl rand -hex 16
```

## Build

### Build cho Production

```bash
pnpm build
```

Output trong `dist/`.

### Docker Build

```bash
docker build -t giapha-os:latest .
```

## Checklist Tự Host

1. [ ] Cài đặt server (VPS, home server, etc.)
2. [ ] Cài đặt Docker và Docker Compose
3. [ ] Cấu hình biến môi trường
4. [ ] Pull image mới nhất hoặc build local
5. [ ] Khởi động services với `docker compose -f docker-compose.prod.yml up -d`
6. [ ] Cài đặt reverse proxy (nginx, Caddy, etc.)
7. [ ] Cấu hình SSL/TLS (Let's Encrypt)
8. [ ] Cài đặt backups (database, uploads)

## Backup

### Backup Database

```bash
# Dump database
docker exec giapha-postgres pg_dump -U postgres giapha > backup.sql

# Restore
docker exec -i giapha-postgres psql -U postgres giapha < backup.sql
```

### Backup Files

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

### Sử Dụng Tài Nguyên

```bash
docker stats
```
