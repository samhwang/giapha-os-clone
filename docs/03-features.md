# Features

TL;DR: This app manages family trees with genealogy features, kinship calculation, Vietnamese calendar events, and bilingual support.

## Family Tree Management

### Adding Members

Members are added through the dashboard. Each person has:
- Full name (required)
- Gender (male/female/other)
- Other names (aliases)
- Birth year, month, day (individual fields)
- Death year, month, day (if deceased)
- Lunar death date (year, month, day — for Vietnamese death anniversaries)
- Is deceased flag
- Is in-law flag
- Avatar image
- Generation number
- Birth order (siblings order)
- Notes
- Private details (phone number, occupation, current residence — admin/editor only)

### Managing Relationships

Relationships connect family members:

| Type | Description |
|------|-------------|
| `marriage` | Person A is married to Person B |
| `biological_child` | Person A is biological parent of Person B |
| `adopted_child` | Person A is adoptive parent of Person B |

Each relationship can have an optional note.

### Generation Tracking

Each person has a `generation` number:
- First generation: founders/ancestors
- Each child typically has `generation + 1`

### Family Tree Visualization

Three view modes available on the dashboard:
- **Tree view**: Hierarchical family tree with pan/zoom
- **Mindmap view**: Mindmap-style tree layout
- **List view**: Flat member list with search

## Kinship Calculation

The app calculates family relationships dynamically using Vietnamese kinship terminology.

### How It Works

```typescript
import { computeKinship } from '../relationships/utils/kinshipHelpers'

const result = computeKinship(personA, personB, persons, relationships)
// result: { aCallsB: "ông", bCallsA: "cháu" }
```

### Kinship Terms

Vietnamese kinship terms based on generation difference:

| Generation Difference | Male | Female |
|----------------------|------|--------|
| -2 | ông nội / ông ngoại | bà nội / bà ngoại |
| -1 | cha / chú / bác | mẹ / cô / dì |
| 0 | anh / em | chị / em |
| +1 | con | con |
| +2 | cháu | cháu |

### Finding Relatives

Use the Kinship Finder tool at `/dashboard/kinship` to find how two people are related.

## Events

### Death Anniversaries (Giỗ)

Death anniversaries follow the Vietnamese lunar calendar. Key features:
- Store death date (solar) and lunar death date
- Calculate lunar anniversary date
- Display upcoming anniversaries

### Birthday Reminders

Track birthdays with:
- Solar birthday (year/month/day fields)
- Upcoming birthday list

### Custom Events

Custom family events can be created at `/dashboard/events`:
- Event name
- Event date
- Location
- Content/description
- Tracked by creator

### Lineage Management

Manage lineage order at `/dashboard/lineage` to organize the family hierarchy.

## Internationalization (i18n)

The app supports Vietnamese (default) and English.

### Switching Languages

Language is managed via react-i18next with cookie-based persistence:
- Language preference stored in a `lang` cookie (`vi` or `en`)
- Falls back to the browser's `Accept-Language` header
- UI includes a language switcher component

### Translation Files

Translations are stored in `src/i18n/lib/translations/`:
- `vi.json` — Vietnamese (default)
- `en.json` — English

### Translated Content

- UI labels and buttons
- Error messages
- Kinship terms (Vietnamese specific)
- Date formats

### Date Formats

| Locale | Format |
|--------|--------|
| Vietnamese | DD/MM/YYYY |
| English | MM/DD/YYYY |

## Image Upload

### Storage

Images are stored on the local filesystem under `UPLOAD_DIR` and served via the `/api/uploads/` route.

### Avatar Upload

Members can upload avatars:
- Supported formats: JPG, PNG, WebP
- Max size: 5MB
- Stored in `uploads/avatars/{personId}/` directory

### Implementation

```typescript
import { uploadAvatar, deleteAvatar } from '../../lib/storage'

// Upload
const url = await uploadAvatar({ buffer, personId, filename, contentType })

// Delete
await deleteAvatar(url)
```

## User Roles

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, manage users, approve accounts, data import/export |
| `editor` | Add/edit family members, view private details |
| `member` | View family tree, limited editing |

### Authorization

Role checks are done via server function middleware:

```typescript
// Admin-only server function
const adminFn = createServerFn()
  .middleware([isAdminMiddleware])
  .handler(async ({ context }) => {
    // context.user is available
  })
```

Protected routes use `beforeLoad` to check session:

```typescript
beforeLoad: async ({ context }) => {
  if (!context.user) {
    throw redirect({ to: '/login' })
  }
}
```

## Data Import/Export

### Export

Export family data in multiple formats at `/dashboard/data`:
- **JSON** — Full family data backup
- **CSV** — Spreadsheet-compatible export
- **GEDCOM** — Genealogy standard format
- **PDF** — Printable family tree
- **ZIP** — Compressed archive of exported data

### Import

Import from:
- **JSON** — Restore from backup
