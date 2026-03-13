# Deployment Guide

This guide covers self-hosting Gia Pha OS in production using Docker Compose.

## Prerequisites

- **Server**: VPS, bare-metal, or home server with Docker and Docker Compose
- **Domain**: Optional but recommended for SSL/TLS
- **Resources**: 2+ CPU cores, 4GB+ RAM, 20GB+ storage

### Software Requirements

- Docker 24.0+
- Docker Compose v2.20+
- OpenSSL (for generating secrets)

## Environment Setup

### 1. Clone and Configure

```bash
git clone https://github.com/your-repo/giapha-os-clone.git
cd giapha-os-clone
cp .env.sample .env
```

### 2. Generate Secrets

Edit `.env` and generate secure values:

```bash
# Generate auth secret (32+ characters)
openssl rand -hex 32

# Generate database password
openssl rand -hex 16
```

Update your `.env` file:

```env
# Database
DB_PASSWORD=your-secure-password-here
DATABASE_URL=postgresql://giapha:${DB_PASSWORD}@postgres:5432/giapha

# Auth
BETTER_AUTH_SECRET=your-auth-secret-here
BETTER_AUTH_URL=https://your-domain.com

# File uploads (default: ./uploads, in Docker: /app/uploads)
UPLOAD_DIR=./uploads
```

## Infrastructure Setup

### Start Services

```bash
docker compose -f docker-compose.production.yml up -d
```

Verify services are running:

```bash
docker compose -f docker-compose.production.yml ps
```

All services should show `healthy` status.

### Storage Options

By default, Docker manages named volumes. You can use bind mounts instead for more control:

```yaml
# docker-compose.production.yml - use these instead of named volumes

services:
  postgres:
    volumes:
      # Named volume (default)
      # - postgres_data:/var/lib/postgresql/data

      # Bind mount (uncomment and customize path)
      - "./data/postgres:/var/lib/postgresql/data"

  app:
    volumes:
      # Named volume (default)
      # - uploads_data:/app/uploads

      # Bind mount (uncomment and customize path)
      - "./data/uploads:/app/uploads"
```

Create the directories if using bind mounts:

```bash
mkdir -p data/postgres data/uploads
```

## Database Setup

### Run Migrations

```bash
docker compose -f docker-compose.production.yml exec app pnpm prisma:migrate deploy
```

### Seed Data (Optional)

```bash
docker compose -f docker-compose.production.yml exec app pnpm prisma:seed
```

## First User Setup

1. Access your application at `http://your-server-ip:3000`
2. Sign up with your account
3. The first user to sign up automatically becomes admin

## Reverse Proxy

A reverse proxy is optional but recommended for:
- SSL/TLS termination
- Custom domain names
- Better security headers

### Option 1: Skip Reverse Proxy

If you're testing or running on a private network, you can access directly:

```
http://your-server-ip:3000
```

### Option 2: Nginx

Install Nginx, then create `/etc/nginx/sites-available/giapha`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

For SSL, use Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Caddy

Create `Caddyfile`:

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

Run Caddy:

```bash
caddy run
```

Caddy automatically handles SSL via Let's Encrypt.

### Option 3: Traefik

Add labels to your `docker-compose.production.yml`:

```yaml
services:
  app:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.giapha.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.giapha.tls=true"
      - "traefik.http.routers.giapha.tls.certresolver=letsencrypt"
```

Run Traefik:

```yaml
# docker-compose.traefik.yml
services:
  traefik:
    image: traefik:v3.0
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/acme.json:/acme.json
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
    restart: unless-stopped
```

## Security Considerations

### Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### Environment Variables

- Never commit `.env` to version control
- Use strong, random values for all secrets
- Rotate secrets periodically

### Regular Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.production.yml build app
docker compose -f docker-compose.production.yml up -d

# Run migrations if needed
docker compose -f docker-compose.production.yml exec app pnpm prisma:migrate deploy
```

## Backup & Restore

### Database Backup

```bash
# Create backup
docker compose -f docker-compose.production.yml exec postgres pg_dump -U giapha giapha > backup_$(date +%Y%m%d).sql

# Restore
docker compose -f docker-compose.production.yml exec -T postgres psql -U giapha giapha < backup_20240101.sql
```

### Uploads Backup

```bash
# Using bind mounts (backup the data directory)
tar czf uploads_backup_$(date +%Y%m%d).tar.gz data/uploads/

# Using named volumes
docker run --rm \
  -v giapha-os-clone_uploads_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads_backup.tar.gz /data
```

### Full System Backup

```bash
# Backup everything
tar czf giapha_backup_$(date +%Y%m%d).tar.gz \
  .env \
  data/ \
  docker-compose.production.yml
```

## Monitoring

### Health Checks

```bash
# Check service status
docker compose -f docker-compose.production.yml ps

# Check logs
docker compose -f docker-compose.production.yml logs -f

# Check resource usage
docker stats
```

### Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| App | `http://localhost:3000` | Application |
| PostgreSQL | `localhost:5432` | Database |

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.production.yml logs postgres
docker compose -f docker-compose.production.yml logs app
```

### Database Connection Issues

```bash
# Verify database is running
docker compose -f docker-compose.production.yml exec postgres pg_isready -U giapha

# Test connection from app
docker compose -f docker-compose.production.yml exec app sh -c 'nc -zv postgres 5432'
```

### Permission Errors

```bash
# Fix bind mount permissions
sudo chown -R 1000:1000 data/postgres data/uploads
```

### Reset Everything

```bash
# Stop and remove containers
docker compose -f docker-compose.production.yml down

# Remove volumes (WARNING: deletes all data)
docker compose -f docker-compose.production.yml down -v

# Start fresh
docker compose -f docker-compose.production.yml up -d
```

## Using Pre-built Docker Image

Instead of building locally, you can use the pre-built image from GitHub Container Registry.

### Pull the Image

```bash
# Latest tag
docker pull ghcr.io/<owner>/giapha-os-clone:latest

# Or with specific SHA
docker pull ghcr.io/<owner>/giapha-os-clone:abc1234
```

### Run with Docker Compose

The docker-compose files already reference the GHCR image. Use `--pull` to always pull the latest:

```bash
# Production
docker compose -f docker-compose.production.yml pull app
docker compose -f docker-compose.production.yml up -d

# Development
docker compose pull app
docker compose up -d
```

### Build Locally Instead

If you prefer to build locally instead of using the pre-built image:

```bash
docker compose build app
docker compose up -d
```

To switch between image and build, edit the docker-compose file:

```yaml
services:
  app:
    # Use pre-built image (default)
    image: ghcr.io/<owner>/giapha-os-clone:latest

    # OR build locally (comment out image:)
    # build: .
```
