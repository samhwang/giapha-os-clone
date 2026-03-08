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

# S3 (will be updated after Garage setup)
S3_ENDPOINT=http://localhost:3900
S3_ACCESS_KEY=change-me
S3_SECRET_KEY=change-me
S3_BUCKET=avatars
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

  garage:
    volumes:
      # Named volume (default)
      # - garage_data:/var/lib/garage

      # Bind mount (uncomment and customize path)
      - "./data/garage:/var/lib/garage"
```

Create the directories if using bind mounts:

```bash
mkdir -p data/postgres data/garage
```

### Garage Configuration

Garage uses TOML configuration files, not environment variables. You must configure `garage.toml` directly.

#### Configure garage.toml

Edit `.docker/garage/garage.toml` and set secure values. Note: Garage does NOT support environment variable interpolation in TOML files - all values must be hardcoded:

```toml
metadata_dir = "/var/lib/garage/meta"
data_dir = "/var/lib/garage/data"
db_engine = "sqlite"

replication_factor = 1
rpc_bind_addr = "[::]:3901"
rpc_secret = "your-64-char-hex-rpc-secret"  # Generate with: openssl rand -hex 32

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.garage.localhost"

[s3_web]
bind_addr = "[::]:3902"
root_domain = ".web.garage.localhost"

[admin]
api_bind_addr = "[::]:3903"
admin_token = "your-64-char-hex-admin-token"  # Generate with: openssl rand -hex 32
```

Generate secure values:

```bash
# Generate RPC secret (64 characters)
openssl rand -hex 32

# Generate admin token (64 characters)
openssl rand -hex 32
```

#### Start Garage

```bash
docker compose -f docker-compose.production.yml up -d garage
```

Wait for Garage to be ready:

```bash
until curl -sf http://localhost:3903/health > /dev/null 2>&1; do sleep 1; done
```

### Automated Setup

Run the setup script to configure node layout, create buckets, and generate S3 keys:

```bash
./scripts/setup-garage.sh
```

This will:
1. Wait for Garage to be ready
2. Configure node layout with specified capacity
3. Create the bucket
4. Generate S3 access keys
5. Output the values to add to `.env`

### Windows Setup

If you're on Windows, you can use the provided scripts instead:

**Prerequisites for Windows:**
- [jq for Windows](https://jqlang.github.io/jq/download/) - download the `jq.exe` and place it in your PATH
- [curl for Windows](https://curl.se/windows/) - usually pre-installed on Windows 10+

**Option 1 - PowerShell (recommended for Windows):**
```powershell
.\scripts\setup-garage.ps1
```

**Option 2 - Command Prompt:**
```cmd
.\scripts\setup-garage.bat
```

> **Note**: These Windows scripts have limited testing. If you encounter issues, we strongly recommend using [WSL](https://learn.microsoft.com/en-us/windows/wsl/) to run the Linux script instead. WSL provides the most reliable experience and easiest troubleshooting.

### Manual Setup

If you prefer manual configuration, you need to read the admin token from your `garage.toml`:

```bash
# Read admin token from garage.toml (or set it as a variable)
GARAGE_ADMIN_TOKEN=$(grep "^admin_token" .docker/garage/garage.toml | cut -d'=' -f2 | tr -d ' "')

# Wait for Garage
until curl -sf http://localhost:3903/health > /dev/null 2>&1; do sleep 1; done

# Get node ID
NODE_ID=$(curl -sf http://localhost:3903/v1/status \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" | jq -r '.node')

# Apply layout
curl -sf -X POST http://localhost:3903/v1/layout \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "[{\"id\": \"$NODE_ID\", \"zone\": \"dc1\", \"capacity\": 107374182400, \"tags\": [\"prod\"]}]"

curl -sf -X POST http://localhost:3903/v1/layout/apply \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"version\": 1}"

# Create bucket
curl -sf -X POST http://localhost:3903/v1/bucket \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"globalAlias": "avatars"}'

# Create API key
curl -sf -X POST http://localhost:3903/v1/key \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "giapha-prod"}'
```

### Update Environment

After Garage setup, update your `.env` with the generated keys:

```env
S3_ENDPOINT=http://your-server-ip:3900
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=avatars
```

Restart the app:

```bash
docker compose -f docker-compose.production.yml restart app
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

### Garage Data Backup

```bash
# Using bind mounts (backup the data directory)
tar czf garage_backup_$(date +%Y%m%d).tar.gz data/garage/

# Using named volumes
docker run --rm \
  -v giapha-os-clone_garage_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/garage_backup.tar.gz /data
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
| Garage S3 | `http://localhost:3900` | S3 API |
| Garage Admin | `http://localhost:3903` | Admin API |
| Garage Health | `http://localhost:3902/health` | Health check |

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.production.yml logs postgres
docker compose -f docker-compose.production.yml logs garage
docker compose -f docker-compose.production.yml logs app
```

### Database Connection Issues

```bash
# Verify database is running
docker compose -f docker-compose.production.yml exec postgres pg_isready -U giapha

# Test connection from app
docker compose -f docker-compose.production.yml exec app sh -c 'nc -zv postgres 5432'
```

### Garage Access Issues

```bash
# Check Garage health
curl http://localhost:3902/health

# Verify API key (read token from garage.toml)
GARAGE_ADMIN_TOKEN=$(grep "^admin_token" .docker/garage/garage.toml | cut -d'=' -f2 | tr -d ' "')
curl http://localhost:3903/v1/key \
  -H "Authorization: Bearer $GARAGE_ADMIN_TOKEN"
```

### Permission Errors

```bash
# Fix bind mount permissions
sudo chown -R 1000:1000 data/postgres data/garage
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
