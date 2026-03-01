# Testing Guidelines

See [docs/en/06-testing.md](../docs/en/06-testing.md) for comprehensive testing documentation.

## Quick Reference

### Running Tests

```bash
pnpm test                    # Watch mode
pnpm test:run                # Run once
pnpm test:coverage           # With coverage
pnpm test:ui                 # UI components
pnpm test:server             # Server functions
pnpm test:integration        # Route tests
pnpm test:browser:run        # Browser (E2E)
```

### Test File Pattern

| Type | Pattern | Example |
|------|---------|---------|
| Unit | `.test.ts` | `src/utils/kinshipHelpers.test.ts` |
| Component | `.test.tsx` | `src/components/PersonCard.test.tsx` |
| Browser | `.browser-test.tsx` | `src/routes/login.browser-test.tsx` |

### Coverage Targets

- `src/utils/**`: 90%+
- `src/server/functions/**`: 80%+
- `src/components/**`: 70%+

### Query Priority

1. `getByRole` — Most accessible
2. `getByLabelText` — For form elements
3. `getByText` — For visible text
4. `getByTestId` — Last resort
