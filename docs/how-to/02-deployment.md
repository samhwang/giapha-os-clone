# Deployment Guide

How to deploy Gia Pha OS to production.

## Node-based / Container-based Deployments

This section covers self-hosting Gia Pha OS in production using [Docker](https://www.docker.com/) Compose on bare-metal servers, Linux VPS, home servers, or container platforms like [Railway](https://railway.app/).

### Prerequisites

- **Server**: VPS, bare-metal, or home server with Docker and Docker Compose
- **Domain**: Optional but recommended for SSL/TLS
- **Resources**: 2+ CPU cores, 4GB+ RAM, 20GB+ storage

### Software Requirements

- Docker 24.0+
- Docker Compose v2.20+
- OpenSSL (for generating secrets)

### Environment Setup

#### 1. Clone and Configure

```bash
git clone https://github.com/your-repo/giapha-os-clone.git
cd giapha-os-clone
```

#### 2. Generate Secrets

Edit `.env` and generate secure values:

```bash
# Generate auth secret (32+ characters)
openssl rand -hex 32

# Generate database password
openssl rand -hex 16
```

Update your `docker-compose.production.yaml` file. The fields need to be changed all starts with `change-me`.

### Infrastructure Setup

#### Start Services

```bash
docker compose -f docker-compose.production.yml up -d
```

Verify services are running:

```bash
docker compose -f docker-compose.production.yml ps
```

All services should show `healthy` status.

For storage configuration (bind mounts, S3-compatible storage), see the [Storage Configuration](./04-storage.md) guide.

### Database Setup

#### Run Migrations

```bash
docker compose -f docker-compose.production.yml up db-migrate
```

### First User Setup

1. Access your application at `http://your-server-ip:3000`
2. Sign up with your account
3. The first user to sign up automatically becomes admin

### Reverse Proxy

A reverse proxy is optional but recommended for:

- SSL/TLS termination
- Custom domain names
- Better security headers

#### Option 1: Skip Reverse Proxy

If you're testing or running on a private network, you can access directly:

```
http://your-server-ip:3000
```

#### Option 2: Nginx

Install [Nginx](https://nginx.org/), then create `/etc/nginx/sites-available/giapha`:

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

For SSL, use [Certbot](https://certbot.eff.org/):

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Option 3: Caddy

Create `Caddyfile`:

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

Run [Caddy](https://caddyserver.com/):

```bash
caddy run
```

Caddy automatically handles SSL via [Let's Encrypt](https://letsencrypt.org/).

#### Option 4: Traefik

Add labels to your `docker-compose.production.yml`:

```yaml
services:
  app:
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.giapha.rule=Host(`your-domain.com`)'
      - 'traefik.http.routers.giapha.tls=true'
      - 'traefik.http.routers.giapha.tls.certresolver=letsencrypt'
```

Run [Traefik](https://traefik.io/):

```yaml
# docker-compose.traefik.yml
services:
  traefik:
    image: traefik:v3.0
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/acme.json:/acme.json
    command:
      - '--api.insecure=true'
      - '--providers.docker=true'
      - '--providers.docker.exposedbydefault=false'
      - '--certificatesresolvers.letsencrypt.acme.email=your@email.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.tlschallenge=true'
    restart: unless-stopped
```

### Security Considerations

#### Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

#### Environment Variables

- Never commit `.env` to version control
- Use strong, random values for all secrets
- Rotate secrets periodically

#### Regular Updates

```bash
# Pull latest code
git pull origin main

# Repull and restart
docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d

# Run DB migrations if needed
docker compose -f docker-compose.production.yml up db-migrate
```

### Backup & Restore

#### Database Backup

```bash
# Create backup
docker compose -f docker-compose.production.yml exec postgres pg_dump -U giapha giapha > backup_$(date +%Y%m%d).sql

# Restore
docker compose -f docker-compose.production.yml exec -T postgres psql -U giapha giapha < backup_20240101.sql
```

#### Uploads Backup

```bash
# Using bind mounts (backup the data directory)
tar czf uploads_backup_$(date +%Y%m%d).tar.gz data/uploads/

# Using named volumes
docker run --rm \
  -v giapha-os-clone_uploads_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads_backup.tar.gz /data
```

#### Full System Backup

```bash
# Backup everything
tar czf giapha_backup_$(date +%Y%m%d).tar.gz \
  .env \
  data/ \
  docker-compose.production.yml
```

### Monitoring

#### Health Checks

```bash
# Check service status
docker compose -f docker-compose.production.yml ps

# Check logs
docker compose -f docker-compose.production.yml logs -f

# Check resource usage
docker stats
```

### Troubleshooting

#### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.production.yml logs postgres
docker compose -f docker-compose.production.yml logs db-migrate
docker compose -f docker-compose.production.yml logs app
```

#### Database Connection Issues

```bash
# Verify database is running
docker compose -f docker-compose.production.yml exec postgres pg_isready -U giapha

# Test connection from app
docker compose -f docker-compose.production.yml exec app sh -c 'nc -zv postgres 5432'
```

#### Permission Errors

```bash
# Fix bind mount permissions
sudo chown -R 1000:1000 data/postgres data/uploads
```

#### Reset Everything

```bash
# Stop and remove containers
docker compose -f docker-compose.production.yml down

# Remove volumes (WARNING: deletes all data)
docker compose -f docker-compose.production.yml down -v

# Start fresh
docker compose -f docker-compose.production.yml up -d
```

### Using Pre-built Docker Image

Instead of building locally, you can use the pre-built image from GitHub Container Registry.

#### Pull the Image

```bash
# Latest tag
docker pull ghcr.io/<owner>/giapha-os-clone:latest

# Or with specific SHA
docker pull ghcr.io/<owner>/giapha-os-clone:abc1234
```

#### Run with Docker Compose

The docker-compose files already reference the GHCR image. Use `--pull` to always pull the latest:

```bash
# Production
docker compose -f docker-compose.production.yml pull app db-migrate
docker compose -f docker-compose.production.yml up -d

# Development
docker compose pull app
docker compose up -d
```

#### Build Locally Instead

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

## Cloud Deployments

> **Note:** This project primarily targets self-hosting on a Node server. The other hosting adapters are provided as best effort and are not 100% guaranteed. Please report any errors found with these hosting options, including error messages.

### Prerequisites

All cloud/serverless providers share these requirements:

- **S3-compatible storage is required** — serverless providers have no persistent filesystem. Set `STORAGE_PROVIDER=s3` with the appropriate S3 variables (see `.env.sample`). See [Storage Configuration](./04-storage.md#s3-compatible-storage) for setup details.
- **Managed PostgreSQL** — use your provider's managed database or an external service (e.g. [Neon](https://neon.tech/), [Supabase](https://supabase.com/)).
- **Environment variables** — configure all variables from `.env.sample` in your provider's dashboard.

See the [Deployment Targets](../reference/02-reference.md#deployment-targets) reference for the full build configuration table.

### Security Headers

For `node` and `vercel` deployments, security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) are applied automatically via Nitro route rules.

For `netlify` and `cloudflare`, these headers must be configured in their respective config files. See the sample files (`netlify.toml.sample`, `wrangler.toml.sample`) in the project root.

### Vercel

1. Import the repository in the [Vercel](https://vercel.com/) dashboard
2. Set the build command to `pnpm run build`
3. Add `DEPLOYMENT_ENV=vercel` to the build environment variables
4. Add all other environment variables from `.env.sample`
5. Set `STORAGE_PROVIDER=s3` with your S3 credentials

The app uses `/api/auth/*` and `/api/uploads/*` routes via TanStack Start server functions — these do not conflict with Vercel's reserved `/api` directory.

### Netlify

1. Install the Netlify plugin: `pnpm add -D @netlify/vite-plugin-tanstack-start`
2. Import the repository in the [Netlify](https://www.netlify.com/) dashboard
3. Copy `netlify.toml.sample` to `netlify.toml` and update as needed
4. Add all environment variables from `.env.sample` to the Netlify dashboard
5. Set `STORAGE_PROVIDER=s3` with your S3 credentials

Alternatively, deploy via CLI:

```bash
npx netlify deploy
```

### Cloudflare Workers

1. Install the Cloudflare plugin and Wrangler: `pnpm add -D @cloudflare/vite-plugin wrangler`
2. Copy `wrangler.toml.sample` to `wrangler.toml` and update as needed
3. Add `DEPLOYMENT_ENV=cloudflare` to the build environment variables
4. Add all other environment variables from `.env.sample`
5. Set `STORAGE_PROVIDER=s3` with your S3 credentials

[Cloudflare](https://workers.cloudflare.com/) picks up configuration from `wrangler.toml` automatically — you do not need to run Wrangler locally to deploy. Connect your repository via the Cloudflare dashboard and it will build and deploy on push.

To deploy manually instead:

```bash
npx wrangler login
DEPLOYMENT_ENV=cloudflare pnpm run build
npx wrangler deploy
```

#### Database Connectivity

Cloudflare Workers cannot make direct TCP connections to PostgreSQL. Options:

- **Hyperdrive** — Cloudflare's managed connection pooler. Add a Hyperdrive binding in `wrangler.toml` and set `DATABASE_URL` to the Hyperdrive connection string.
- **Connection pooler** — Use Supabase Pooler, [Neon](https://neon.tech/), or PgBouncer with HTTP/WebSocket support.

#### Prisma on Cloudflare

The standard Prisma client may not work on Cloudflare Workers. You may need `@prisma/adapter-pg-worker` or Prisma Accelerate. See [Prisma's Cloudflare docs](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1) for details.

#### Additional Notes

- The `nodejs_compat` compatibility flag is required (the app uses Node.js APIs via unstorage, Prisma, etc.)
- `STORAGE_PROVIDER` must be `s3`. [Cloudflare R2](https://developers.cloudflare.com/r2/) is S3-compatible and works well here.
- Workers have a 128MB memory limit and 30s CPU time limit.
