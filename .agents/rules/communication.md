# Communication & Writing Standards

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code restructuring (no behavior change) |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependency updates |
| `style` | Formatting changes (no logic change) |
| `perf` | Performance improvements |

### Examples

```
feat: add kinship calculator page
fix: correct lunar date conversion for leap months
docs: update README with Garage setup instructions
test: add kinship helper unit tests
chore: update Prisma to v6
refactor: extract avatar upload to shared utility
```

### Rules

- Use imperative mood: "add feature" not "added feature"
- Lowercase first letter after type prefix
- No period at the end of the subject line
- Subject line under 72 characters
- Body explains **why**, not **what** (the diff shows what)

## Code Comments

- Explain **why** something exists, not **how** it works
- No commented-out code in commits
- Use `// TODO:` for known incomplete work
- No JSDoc for self-explanatory functions
- Vietnamese terms in comments are acceptable for domain-specific concepts (kinship terms, lunar calendar)

## Language

- American English spelling (color, not colour; organize, not organise)
- Active voice preferred
- Concise writing — say what needs to be said, nothing more

## Documentation

- When updating `README.md`, always update `README.vi.md` (Vietnamese version) with the same changes
- Keep both versions in sync

## Pull Request Structure

```markdown
## Summary
Brief description of what changed and why.

## Changes
- Bullet list of specific changes

## Test Plan
- How to verify the changes work correctly
```
