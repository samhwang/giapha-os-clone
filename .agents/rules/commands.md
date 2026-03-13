# Development Workflow Commands

See [docs/en/01-getting-started.md](../docs/en/01-getting-started.md) for comprehensive setup guide.

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

```bash
pnpm prisma generate          # Regenerate client after schema changes
pnpm prisma db push           # Push schema (development)
pnpm prisma db seed           # Seed sample data
pnpm prisma studio            # Open database GUI (http://localhost:5555)
pnpm prisma migrate dev --name describe_change  # Create migration
```

### Testing

```bash
pnpm test                     # Watch mode
pnpm test:run                 # Run once
pnpm test:coverage           # With coverage
```

### Linting

```bash
pnpm lint                     # Check issues
pnpm lint:fix                 # Auto-fix
pnpm typecheck                # TypeScript check
```

### Quality Check

```bash
pnpm typecheck && pnpm lint && pnpm test:run && pnpm build
```

### Troubleshooting

- Port 3000: `lsof -i :3000`
- Port 5432: `lsof -i :5432` (PostgreSQL)
