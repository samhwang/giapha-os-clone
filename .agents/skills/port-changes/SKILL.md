---
name: port-changes
description: Analyze upstream Gia Pha OS changes and create an integration plan for the fork
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: upstream-integration
---

# Port Changes Skill

## Purpose

Identify and plan integration of recent changes from the base Gia Pha OS repository
(Next.js) into this TanStack Start fork.

## Trigger Condition

When user asks to:

- Port changes from the base repo
- Check for upstream changes
- Sync with the original Gia Pha OS
- See what's new in the base repo

## Constants

- **Base repo path**: `base/giapha-os` (relative to project root)
- **Base remote**: `git@github.com:homielab/giapha-os.git`
- **Base branch**: `main`
- **Snapshot branch**: `current`

## Workflow

### Step 1: Snapshot Current State

Create a snapshot branch from the current local main before pulling:

```bash
cd base/giapha-os
git checkout main
git branch -f current main
```

This creates (or force-resets) a `current` branch pointing at the current local
state of `main`.

### Step 2: Pull Latest Changes

```bash
cd base/giapha-os
git checkout main
git pull origin main
```

### Step 3: Check for New Changes

```bash
cd base/giapha-os
git log --oneline current..main
```

If this produces no output, report "No new changes in the base repo" and skip to
Step 7.

### Step 4: Analyze the Diff

Get the full diff and file-level summary:

```bash
cd base/giapha-os
git diff current..main --stat
git diff current..main
```

Categorize changes by:

- **Which files changed**: components, actions, utils, types, config, styles
- **Nature of change**: new feature, bug fix, refactor, dependency update, UI tweak

### Step 5: Group Into Features

Organize changes into logical feature groups. For each group, note:

- **Feature name**: Brief descriptive name
- **Base repo files**: Which files in the base repo were modified
- **Fork equivalent**: Where the equivalent code lives (or would live) in this fork
- **Complexity**: Low / Medium / High
- **Dependencies**: Other features that must be ported first

Use the directory mapping:

| Base repo (Next.js) | Fork (TanStack Start) |
| --- | --- |
| `app/` | `src/routes/` |
| `app/actions/` | `src/*/server/` |
| `components/` | `src/*/components/` |
| `utils/` | `src/*/utils/` or `src/lib/` |
| `types/` | `src/*/types/` (co-located) |
| `hooks/` | `src/*/hooks/` (co-located) |
| `app/globals.css` | `src/styles.css` |

### Step 6: Produce Integration Plan

For each feature group, produce a plan entry:

```
## Feature: [Name]
- **Priority**: P0 (critical) / P1 (important) / P2 (nice to have)
- **Base commits**: [list of commit hashes]
- **Files changed in base**: [list]
- **Target files in fork**: [list]
- **Approach**: Direct port / Adapt / Rewrite / Skip
- **Notes**: [framework-specific translation needed]
```

**Divergence check**: If the diff touches more than 30 files or spans more than
50 commits, flag the repos as significantly diverged and recommend:

- Reviewing changes in smaller batches (by date range or feature area)
- Prioritizing only high-value features
- Considering whether some changes are already independently implemented

### Step 7: Cleanup

After the user confirms the plan is finalized (or explicitly asks to clean up):

```bash
cd base/giapha-os
git branch -d current
```

Do NOT delete the branch until the user says iteration on the plan is complete.

## Checklist

- [ ] Snapshot branch created before pulling
- [ ] Latest changes pulled successfully
- [ ] All commits between `current..main` reviewed
- [ ] Changes grouped into coherent features
- [ ] Directory mapping applied (Next.js -> TanStack Start paths)
- [ ] Priority and complexity assessed for each group
- [ ] Divergence flagged if applicable
- [ ] Integration plan presented to user for review
- [ ] Snapshot branch cleaned up after plan is finalized

## Framework Translation Reference

- `"use server"` actions -> `createServerFn` from `@tanstack/react-start`
- `useRouter()` / `router.push()` -> `useNavigate()` from `@tanstack/react-router`
- `next/image` -> standard `<img>` or custom component
- `next/link` -> `<Link>` from `@tanstack/react-router`
- Clerk auth -> Better Auth
- Supabase storage -> local filesystem via `UPLOAD_DIR`

## Notes

- This skill only analyzes and plans. It does NOT make changes to the fork.
- The `current` branch is local-only and temporary. It exists only in `base/giapha-os`.
- If `current` already exists (from a previous interrupted run), Step 1 uses `git branch -f` to force-reset it.
- When the repos are heavily diverged, prefer smaller focused port sessions over one large plan.
