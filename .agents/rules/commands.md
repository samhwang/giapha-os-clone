# Development Workflow Commands

## Infrastructure (Docker Compose)

```bash
docker compose up -d          # Start PostgreSQL + Garage in background
docker compose down           # Stop all services
docker compose logs -f        # Follow logs from all services
docker compose logs postgres  # Follow PostgreSQL logs
docker compose logs garage    # Follow Garage logs
docker compose ps             # Check running services
```

## Development

```bash
pnpm dev          # Start development server (http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
```

## Database (Prisma)

```bash
pnpm prisma generate          # Regenerate Prisma client after schema changes
pnpm prisma db push           # Push schema to database (no migration history)
pnpm prisma db seed            # Seed database with sample data
pnpm prisma studio            # Open database GUI (http://localhost:5555)
pnpm prisma migrate dev       # Create and apply a new migration
pnpm prisma migrate dev --name describe_change  # Named migration
pnpm prisma migrate reset     # Reset database and reapply all migrations + seed
```

## Garage (S3 Storage)

```bash
./scripts/setup-garage.sh     # Create avatars bucket and generate access keys
```

## Type Checking

```bash
pnpm typecheck                # Run TypeScript compiler in check mode
```

## Linting & Formatting (Biome)

```bash
pnpm lint                     # Check for lint issues (read-only)
pnpm lint:fix                 # Auto-fix safe lint issues
pnpm lint:fix:unsafe          # Auto-fix all issues (including unsafe transforms)
pnpm ci                       # Strict CI mode (fails on any issue)
```

## Testing (Vitest)

```bash
pnpm test                     # Run tests in watch mode
pnpm test:run                 # Run tests once (CI-friendly)
pnpm test:coverage            # Run tests with coverage report
```

## Git Hooks (Husky)

```bash
pnpm prepare                  # Initialize Husky git hooks
```

- **Pre-commit**: Runs `lint-staged` (Biome check + format on staged files)
- **Pre-push**: Runs `pnpm ci && pnpm test:run && pnpm typecheck`

## Full Quality Check

Run all checks before pushing:

```bash
pnpm typecheck && pnpm lint && pnpm test:run && pnpm build
```

## Troubleshooting

### PostgreSQL connection issues

```bash
docker compose logs postgres   # Check for startup errors
docker compose restart postgres
```

### Prisma client out of date

```bash
pnpm prisma generate          # Regenerate after schema changes
```

### Garage bucket not found

```bash
./scripts/setup-garage.sh     # Re-run bucket creation
```

### Port conflicts

Default ports: 3000 (app), 5432 (PostgreSQL), 3900 (Garage S3), 3902 (Garage admin).
Check for conflicting processes:

```bash
lsof -i :3000
lsof -i :5432
```
