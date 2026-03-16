# Development Workflow Commands

## Quick Reference

### Infrastructure (Docker Compose)

```bash
docker compose up -d          # Start PostgreSQL
docker compose down           # Stop all services
docker compose logs -f        # Follow logs
docker compose ps             # Check running services
```

### Development

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
```

### Database (Prisma)

All Prisma commands use `dotenvx run --` to load environment variables.

```bash
pnpm prisma:generate          # Regenerate client after schema changes
pnpm prisma:push              # Push schema (development)
pnpm prisma:seed              # Seed sample data
pnpm prisma studio            # Open database GUI (http://localhost:5555)
pnpm prisma:migrate:dev       # Create migration
pnpm prisma:format            # Format schema file
```

### Testing

```bash
pnpm test                     # Watch mode
pnpm test:run                 # Run once
pnpm test:coverage            # With coverage
pnpm test:ui                  # UI components only
pnpm test:server              # Server functions only
pnpm test:integration         # Integration tests
pnpm test:e2e                 # Playwright E2E tests
pnpm test:e2e:ui              # Playwright E2E with UI
```

### Linting

```bash
pnpm lint                     # Check issues
pnpm lint:fix                 # Auto-fix
pnpm typecheck                # TypeScript check
```

### Auth

```bash
pnpm auth:generate            # Generate Better Auth client
pnpm auth:secret              # Generate Better Auth secret
```

### Quality Check

```bash
pnpm typecheck && pnpm lint && pnpm test:run && pnpm build
```

### Troubleshooting

- Port 3000: `lsof -i :3000`
- Port 5432: `lsof -i :5432` (PostgreSQL)
