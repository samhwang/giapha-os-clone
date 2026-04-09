# Storage Configuration

How to configure file storage for uploads (avatars, images). By default, files are stored on the local filesystem. For cloud or distributed setups, use S3-compatible storage.

## Local Storage (Default)

Files are stored under the `UPLOAD_DIR` directory (default `./uploads`) and served via the `/api/uploads/` route.

### Docker Volume Options

By default, Docker manages named volumes. You can use bind mounts instead for more control:

```yaml
# docker-compose.production.yml - use these instead of named volumes

services:
  postgres:
    volumes:
      # Named volume (default)
      # - postgres_data:/var/lib/postgresql/data

      # Bind mount (uncomment and customize path)
      - './data/postgres:/var/lib/postgresql/data'

  app:
    volumes:
      # Named volume (default)
      # - uploads_data:/app/uploads

      # Bind mount (uncomment and customize path)
      - './data/uploads:/app/uploads'
```

Create the directories if using bind mounts:

```bash
mkdir -p data/postgres data/uploads
```

## S3-Compatible Storage

For cloud deployments or distributed self-hosted setups, use S3-compatible storage instead of the local filesystem. This works with AWS S3, [SeaweedFS](https://github.com/seaweedfs/seaweedfs), [MinIO](https://min.io/), [Cloudflare R2](https://developers.cloudflare.com/r2/), [Supabase Storage](https://supabase.com/docs/guides/storage), and any other S3-compatible provider.

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

See the [Environment Variables](../reference/02-reference.md#environment-variables) reference for the full list of storage-related variables.

### Running SeaweedFS

To run [SeaweedFS](https://github.com/seaweedfs/seaweedfs) alongside your app, uncomment the `seaweedfs` service in `docker-compose.production.yml`:

```yaml
seaweedfs:
  image: chrislusf/seaweedfs:latest
  command: 'server -s3 -dir=/data'
  ports:
    - '8333:8333'
    - '9333:9333'
  volumes:
    - seaweedfs_data:/data
  restart: unless-stopped
  networks:
    - giapha-network
```

Then set `S3_PUBLIC_URL` to the publicly accessible URL of your SeaweedFS instance (e.g. `https://storage.your-domain.com/giapha` if behind a reverse proxy).

## Migrating Between Storage Providers

The database stores provider-agnostic storage keys (e.g. `avatars/{personId}/{filename}`), so no database changes are needed when switching providers. You only need to copy the files themselves to the new storage, preserving the directory structure.

### Using rclone

[rclone](https://rclone.org/) works with any S3-compatible provider. Configure your provider as a remote, then sync files in either direction:

```bash
# Local to S3-compatible
rclone sync ./data/uploads/ s3-remote:giapha/

# S3-compatible to local
rclone sync s3-remote:giapha/ ./data/uploads/
```

See [rclone S3 configuration](https://rclone.org/s3/) for setup instructions.

### After Migrating

Update your environment variables to match the new provider:

```yaml
# Switch to S3-compatible
- STORAGE_PROVIDER=s3
- S3_ENDPOINT=http://seaweedfs:8333 # your provider's endpoint
- S3_BUCKET=giapha
# ... other S3 vars

# Or switch back to local
- STORAGE_PROVIDER=local
- UPLOAD_DIR=/app/uploads
```

Verify that avatars display correctly in the application. No database changes are needed — the stored keys work with any provider. The `/api/uploads/*` route serves files for local storage or redirects to the S3 public URL.

## Avatar Upload

Members can upload avatars:

- Supported formats: JPG, PNG, GIF, WebP
- Max size: 2MB
- Stored in `avatars/{personId}/` directory (relative to storage root)

See the [Storage Providers](../reference/02-reference.md#storage-providers) reference for provider-specific CLI tools and documentation links.
