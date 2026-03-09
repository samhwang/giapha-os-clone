# CI/CD Pipeline

This document describes the continuous integration and deployment workflows for Gia Pha OS.

## Overview

The project uses GitHub Actions for automated testing and deployment. The pipeline runs on every pull request and push to the master branch.

## Workflows

### Pull Request Workflow

**File:** `.github/workflows/pull-request.yml`

Triggered on: Pull requests to master branch

This workflow runs the full CI pipeline on every pull request to ensure changes are safe before merging.

```yaml
on:
  pull_request:
    branches: [master]
```

### CI Workflow

**File:** `.github/workflows/ci.yml`

This is a reusable workflow called by both pull requests and the build workflow. It runs all validation checks in parallel for faster feedback.

**Test Suites:**

| Task | Command | Description |
|------|---------|-------------|
| ci | `pnpm lint` | Biome linting and formatting check |
| typecheck | `pnpm typecheck` | TypeScript type checking |
| test:ui | `pnpm test:ui` | React component unit tests |
| test:server | `pnpm test:server` | Server function tests |
| test:integration | `pnpm test:integration` | Integration tests |
| e2e | `pnpm test:e2e` | Playwright end-to-end tests |

All tasks except e2e run in parallel using a matrix strategy. E2E tests run separately due to their longer execution time.

### Build and Push Workflow

**File:** `.github/workflows/build.yml`

Triggered on: Push to master branch

This workflow:
1. Runs the CI workflow to validate changes
2. Builds a Docker image
3. Pushes the image to GitHub Container Registry (GHCR)

The image is tagged with:
- `latest` - Always points to the most recent build
- `sha-{short_sha}` - Unique tag for each commit

## Running CI Locally

Before submitting a pull request, run the same checks locally:

```bash
# Full quality check (lint + typecheck + tests)
pnpm typecheck && pnpm lint && pnpm test:run

# Build to verify production build works
pnpm build
```

Individual commands:

```bash
# Lint and format check
pnpm lint

# TypeScript type check
pnpm typecheck

# Run all tests (watch mode)
pnpm test

# Run tests once
pnpm test:run

# Run specific test suite
pnpm test:run ui
pnpm test:run server
pnpm test:run integration
pnpm test:run e2e
```

## Pre-commit Hooks

The project uses lint-staged with Biome to run lint checks on staged files before commit. This catches issues early and ensures consistent code style.

## Pre-push Hook

Before pushing to remote, the pre-push hook runs:

```bash
pnpm run lint:ci     # Lint check
pnpm run test:run    # All tests
pnpm run typecheck   # TypeScript check
```

This ensures no broken code leaves your local machine. The hook runs automatically when you execute `git push`.

## Docker Image

The Docker image is published to GitHub Container Registry:

```
ghcr.io/<owner>/giapha-os-clone:latest
ghcr.io/<owner>/giapha-os-clone:sha-<short_sha>
```

See [Deployment Guide](./07-deployment.md) for using the pre-built image.
