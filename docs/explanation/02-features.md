# Features

What the application does and how its core features work.

## Family Tree Management

### Members

Members are the core data model. Each person in the family tree has a name, gender, birth and death dates, generation number, birth order, and optional avatar. Deceased members additionally track a lunar death date for Vietnamese death anniversary calculations.

Private details (phone number, occupation, current residence) are stored separately and are only visible to admin and editor roles.

### Relationships

Relationships connect family members with three types:

- **Marriage** — Person A is married to Person B
- **Biological child** — Person A is biological parent of Person B
- **Adopted child** — Person A is adoptive parent of Person B

Each relationship can have an optional note.

### Generation Tracking

Each person has a `generation` number. First generation represents founders/ancestors, and each child typically has `generation + 1`. This is used for kinship calculations and tree visualization.

### Visualization

Four view modes available on the dashboard:

- **Tree view**: Hierarchical family tree with pan/zoom and collapsible nodes
- **Mindmap view**: Mindmap-style tree layout with expand/collapse
- **Bubble map view**: D3 force-directed graph showing family units as draggable pill-shaped nodes
- **List view**: Flat member list with search

## Kinship Calculation

The app calculates family relationships dynamically using Vietnamese kinship terminology. Given two people and the full graph of family relationships, the system determines the Vietnamese kinship term each person would use to address the other.

### Vietnamese Kinship Terms

Vietnamese kinship terms are based on generation difference, gender, and lineage side (paternal vs. maternal):

| Generation Difference | Male | Female |
|----------------------|------|--------|
| -2 | ông nội / ông ngoại | bà nội / bà ngoại |
| -1 | cha / chú / bác | mẹ / cô / dì |
| 0 | anh / em | chị / em |
| +1 | con | con |
| +2 | cháu | cháu |

### Kinship Lookup

The Kinship Lookup tool at `/dashboard/kinship` allows users to select two people and see how they are related, including the Vietnamese terms each would use.

## Events

### Death Anniversaries (Giỗ)

Death anniversaries follow the Vietnamese lunar calendar. The system stores both the solar death date and the lunar death date, calculates the lunar anniversary date for each year, and displays upcoming anniversaries on the dashboard.

### Birthday Reminders

Birthdays are tracked using solar date fields (year/month/day). The dashboard shows a list of upcoming birthdays.

### Custom Events

Custom family events (reunions, ceremonies, etc.) can be created at `/dashboard/events` with a name, date, location, and description. Events are tracked by their creator.

### Lineage Management

The lineage manager at `/dashboard/lineage` organizes the family hierarchy and lineage order.

## Internationalization (i18n)

The app supports Vietnamese (default) and English via [react-i18next](https://www.i18next.com/).

- Language preference is stored in a `lang` cookie (`vi` or `en`)
- Falls back to the browser's `Accept-Language` header
- UI includes a language switcher component

### Translated Content

- UI labels and buttons
- Error messages
- Kinship terms (Vietnamese specific)
- Date formats (Vietnamese: DD/MM/YYYY, English: MM/DD/YYYY)

Translation files are stored in `src/i18n/lib/translations/` (`vi.json` and `en.json`).

## User Roles

Three roles control access to different parts of the application:

| Role | Permissions |
|------|-------------|
| `admin` | Full access, manage users, approve accounts, data import/export, view private details |
| `editor` | Add/edit family members (no access to private details) |
| `member` | View family tree, limited editing |

Role checks are enforced via server function middleware on the backend and `beforeLoad` route guards on the frontend.

## Data Import/Export

### Export

Export family data in multiple formats at `/dashboard/data`:

- **JSON** — Full family data backup
- **CSV** — Spreadsheet-compatible export
- **[GEDCOM](https://en.wikipedia.org/wiki/GEDCOM)** — Genealogy standard format
- **PDF** — Printable family tree
- **ZIP** — Compressed archive of exported data

### Import

Import from:
- **JSON** — Restore from backup
