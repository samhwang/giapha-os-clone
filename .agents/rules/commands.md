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
bun run dev          # Start dev server (http://localhost:3000)
bun run build        # Production build
bun run start        # Start production server
```

### Database (Prisma)

All Prisma commands use `dotenvx run --` to load environment variables.

```bash
bun run prisma:generate          # Regenerate client after schema changes
bun run prisma:push              # Push schema (development)
bun run prisma:seed              # Seed sample data
bun run prisma:studio            # Open database GUI (http://localhost:5555)
bun run prisma:migrate:dev       # Create migration
bun run prisma:format            # Format schema file
```

### Testing

```bash
bun run test                     # Watch mode
bun run test:run                 # Run once
bun run test:coverage            # With coverage
bun run test:ui                  # UI components only
bun run test:server              # Server functions only
bun run test:integration         # Integration tests
bun run test:e2e                 # Playwright E2E tests
bun run test:e2e:ui              # Playwright E2E with UI
```

### Linting

```bash
bun run lint                     # Check issues
bun run lint:fix                 # Auto-fix
bun run typecheck                # TypeScript check
```

### Auth

```bash
bun run auth:generate            # Generate Better Auth client
bun run auth:secret              # Generate Better Auth secret
```

### Quality Check

```bash
bun run typecheck && bun run lint && bun run test:run && bun run build
```

### Troubleshooting

- Port 3000: `lsof -i :3000`
- Port 5432: `lsof -i :5432` (PostgreSQL)
