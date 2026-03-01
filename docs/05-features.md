# Features

TL;DR: This app manages family trees with genealogy features, kinship calculation, Vietnamese calendar events, and bilingual support.

## Family Tree Management

### Adding Members

Members are added through the dashboard. Each person has:
- Full name (required)
- Gender (male/female/other)
- Birth date & place
- Death date & place (if deceased)
- Avatar image
- Generation number
- Birth order (siblings order)
- Private details (phone, address, job, notes)

### Managing Relationships

Relationships connect family members:

| Type | Description |
|------|-------------|
| `parent` | Person A is parent of Person B |
| `child` | Person A is child of Person B |
| `spouse` | Person A is spouse of Person B |

### Generation Tracking

Each person has a `generation` number:
- First generation: founders/ancestors
- Each child typically has `generation + 1`

## Kinship Calculation

The app calculates family relationships dynamically.

### How It Works

```typescript
import { computeKinship } from '@/relationships/utils/kinshipHelpers'

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

Use the Kinship Finder tool to find how two people are related.

## Events

### Death Anniversaries (Giỗ)

Death anniversaries follow the Vietnamese lunar calendar. Key features:
- Store death date (solar)
- Calculate lunar anniversary date
- Display upcoming anniversaries
- Reminder system (future)

### Birthday Reminders

Track birthdays with:
- Solar birthday
- Lunar birthday (calculated)
- Upcoming birthday list

## Internationalization (i18n)

The app supports Vietnamese and English.

### Switching Languages

Language is managed via react-i18next. UI includes language switcher.

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

Images are stored in Garage (S3-compatible storage).

### Avatar Upload

Members can upload avatars:
- Supported formats: JPG, PNG, WebP
- Max size: 5MB
- Stored in `avatars/` bucket path

### Implementation

```typescript
import { uploadFile, deleteFile } from '@/lib/storage'

// Upload
const url = await uploadFile(file, 'avatars/')

// Delete
await deleteFile('avatars/filename.jpg')
```

## User Roles

### Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, manage users, data import/export |
| `user` | View family tree, add/edit family members |

### Authorization

Role checks are done in loaders:

```typescript
loader: async ({ context }) => {
  const session = await context.auth.api.getSession()
  
  if (session?.user.role !== 'admin') {
    throw redirect({ to: '/dashboard' })
  }
}
```

## Data Import/Export

### Export

Export family data as JSON or GEDCOM format (future).

### Import

Import from:
- JSON format
- GEDCOM (future)
