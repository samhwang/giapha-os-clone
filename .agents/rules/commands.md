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
pnpm run dev          # Start dev server (http://localhost:3000)
pnpm run build        # Production build
pnpm run start        # Start production server
```

### Database (Prisma)

All Prisma commands use `dotenvx run --` to load environment variables.

```bash
pnpm run prisma:generate          # Regenerate client after schema changes
pnpm run prisma:push              # Push schema (development)
pnpm run prisma:seed              # Seed sample data
pnpm run prisma:studio            # Open database GUI (http://localhost:5555)
pnpm run prisma:migrate:dev       # Create migration
pnpm run prisma:format            # Format schema file
```

### Testing

```bash
pnpm run test                     # Watch mode
pnpm run test:run                 # Run once
pnpm run test:coverage            # With coverage
pnpm run test:ui                  # UI components only
pnpm run test:server              # Server functions only
pnpm run test:integration         # Integration tests
pnpm run test:e2e                 # Playwright E2E tests
pnpm run test:e2e:ui              # Playwright E2E with UI
```

### Linting

```bash
pnpm run lint                     # Check issues
pnpm run lint:fix                 # Auto-fix
pnpm run typecheck                # TypeScript check
```

### Auth

```bash
pnpm run auth:generate            # Generate Better Auth client
pnpm run auth:secret              # Generate Better Auth secret
```

### Quality Check

```bash
pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run build
```

### Troubleshooting

- Port 3000: `lsof -i :3000`
- Port 5432: `lsof -i :5432` (PostgreSQL)
