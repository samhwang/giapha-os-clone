# Deployment Guide

## Node-based / Container-based Deployments

This section covers self-hosting Gia Pha OS in production using Docker Compose on bare-metal servers, Linux VPS, home servers, or container platforms like Railway.

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

#### Storage Options

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

#### S3-Compatible Storage

For cloud deployments or distributed self-hosted setups, you can use S3-compatible storage instead of the local filesystem. This works with AWS S3, SeaweedFS, MinIO, Cloudflare R2, Supabase Storage, and any other S3-compatible provider.

Set the following environment variables in your `docker-compose.production.yml`:

```yaml
- STORAGE_PROVIDER=s3
- S3_ENDPOINT=http://seaweedfs:8333
- S3_BUCKET=giapha
- S3_REGION=us-east-1
- S3_ACCESS_KEY_ID=your-access-key
- S3_SECRET_ACCESS_KEY=your-secret-key
- S3_PUBLIC_URL=http://your-domain.com:8333/giapha
```

##### SeaweedFS Example

To run SeaweedFS alongside your app, uncomment the `seaweedfs` service in `docker-compose.production.yml`:

```yaml
seaweedfs:
  image: chrislusf/seaweedfs:latest
  command: "server -s3 -dir=/data"
  ports:
    - "8333:8333"
    - "9333:9333"
  volumes:
    - seaweedfs_data:/data
  restart: unless-stopped
  networks:
    - giapha-network
```

Then set `S3_PUBLIC_URL` to the publicly accessible URL of your SeaweedFS instance (e.g. `https://storage.your-domain.com/giapha` if behind a reverse proxy).

#### Migrating Files Between Storage Providers

The database stores provider-agnostic storage keys (e.g. `avatars/{personId}/{filename}`), so no database changes are needed when switching providers. You only need to copy the files themselves to the new storage, preserving the directory structure.

##### Using rclone (generic solution)

[rclone](https://rclone.org/) works with any S3-compatible provider. Configure your provider as a remote, then sync files in either direction:

```bash
# Local to S3-compatible
rclone sync ./data/uploads/ s3-remote:giapha/

# S3-compatible to local
rclone sync s3-remote:giapha/ ./data/uploads/
```

See [rclone S3 configuration](https://rclone.org/s3/) for setup instructions.

##### Provider-specific tools

Each provider has its own CLI or dashboard for managing files. Refer to their documentation for upload/download instructions:

| Provider | Documentation |
|----------|--------------|
| SeaweedFS | [S3 API docs](https://github.com/seaweedfs/seaweedfs/wiki/Amazon-S3-API) |
| Garage | [S3 compatibility docs](https://garagehq.deuxfleurs.fr/documentation/connect/cli/) |
| AWS S3 | [AWS CLI s3 sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html) |
| Supabase Storage | [Storage guides](https://supabase.com/docs/guides/storage) |
| Vercel Blob | [Vercel Blob docs](https://vercel.com/docs/storage/vercel-blob) |
| Cloudflare R2 | [R2 docs](https://developers.cloudflare.com/r2/) |
| MinIO | [mc CLI reference](https://min.io/docs/minio/linux/reference/minio-mc.html) |

##### After migrating

Update your environment variables to match the new provider:

```yaml
# Switch to S3-compatible
- STORAGE_PROVIDER=s3
- S3_ENDPOINT=http://seaweedfs:8333   # your provider's endpoint
- S3_BUCKET=giapha
# ... other S3 vars

# Or switch back to local
- STORAGE_PROVIDER=local
- UPLOAD_DIR=/app/uploads
```

Verify that avatars display correctly in the application. No database changes are needed — the stored keys work with any provider. The `/api/uploads/*` route serves files for local storage or redirects to the S3 public URL.

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

#### Option 3: Caddy

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

#### Option 4: Traefik

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

#### Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| App | `http://localhost:3000` | Application |
| PostgreSQL | `localhost:5432` | Database |

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

- **S3-compatible storage is required** — serverless providers have no persistent filesystem. Set `STORAGE_PROVIDER=s3` with the appropriate S3 variables (see `.env.sample`).
- **Managed PostgreSQL** — use your provider's managed database or an external service (e.g. Neon, Supabase, PlanetScale).
- **Environment variables** — configure all variables from `.env.sample` in your provider's dashboard.

### Build Configuration

The deployment target is controlled by the `DEPLOYMENT_ENV` environment variable at **build time**:

| DEPLOYMENT_ENV | Provider | Vite Plugin |
|----------------|----------|-------------|
| `node` (default) | Docker, VPS, Railway | `nitro` (node-server preset) |
| `vercel` | Vercel | `nitro` (vercel preset) |
| `netlify` | Netlify | `@netlify/vite-plugin-tanstack-start` |
| `cloudflare` | Cloudflare Workers | `@cloudflare/vite-plugin` |

### Security Headers

For `node` and `vercel` deployments, security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) are applied automatically via Nitro route rules.

For `netlify` and `cloudflare`, these headers must be configured in their respective config files. See the sample files (`netlify.toml.sample`, `wrangler.toml.sample`) in the project root.

### Vercel

1. Import the repository in the Vercel dashboard
2. Set the build command to `pnpm build`
3. Add `DEPLOYMENT_ENV=vercel` to the build environment variables
4. Add all other environment variables from `.env.sample`
5. Set `STORAGE_PROVIDER=s3` with your S3 credentials

The app uses `/api/auth/*` and `/api/uploads/*` routes via TanStack Start server functions — these do not conflict with Vercel's reserved `/api` directory.

### Netlify

1. Install the Netlify plugin: `pnpm add -D @netlify/vite-plugin-tanstack-start`
2. Import the repository in the Netlify dashboard
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
3. Authenticate: `wrangler login`
4. Build and deploy:

```bash
DEPLOYMENT_ENV=cloudflare pnpm build
wrangler deploy
```

#### Database Connectivity

Cloudflare Workers cannot make direct TCP connections to PostgreSQL. Options:

- **Hyperdrive** — Cloudflare's managed connection pooler. Add a Hyperdrive binding in `wrangler.toml` and set `DATABASE_URL` to the Hyperdrive connection string.
- **Connection pooler** — Use Supabase Pooler, Neon, or PgBouncer with HTTP/WebSocket support.

#### Prisma on Cloudflare

The standard Prisma client may not work on Cloudflare Workers. You may need `@prisma/adapter-pg-worker` or Prisma Accelerate. See [Prisma's Cloudflare docs](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1) for details.

#### Additional Notes

- The `nodejs_compat` compatibility flag is required (the app uses Node.js APIs via unstorage, Prisma, etc.)
- `STORAGE_PROVIDER` must be `s3`. Cloudflare R2 is S3-compatible and works well here.
- Workers have a 128MB memory limit and 30s CPU time limit.
