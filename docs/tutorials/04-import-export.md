# Tutorial: Back Up and Share Your Family Data

By the end of this tutorial, you will have exported your family data in three formats, and restored it from a backup — proving that your data is portable and recoverable.

## Prerequisites

- Completed the [Build Your First Family Tree](./01-family-tree.md) tutorial (you need some family data)
- You are logged in with an **admin** account
- You are on the dashboard

## 1. Open the Backup & Restore Page

1. From the dashboard, click the **Backup & Restore** card in the Administrator Section
2. You should see a page with two columns: **Backup Data** on the left and **Restore Data** on the right

## 2. Export as JSON

JSON is the full backup format — it captures everything.

1. On the left column, make sure **JSON** is selected (it is the default)
2. Click **Download Backup**
3. A file named `giapha-export-YYYY-MM-DD.json` downloads to your computer
4. Open the file in a text editor

You should see a JSON structure containing all your family members (names, dates, generations) and all relationships (marriages, parent-child connections). This is a complete snapshot of your family tree.

## 3. Export as CSV

CSV is useful for opening your family data in spreadsheet software.

1. Click the **CSV** format button
2. Click **Download Backup**
3. A ZIP file downloads containing CSV files
4. Extract the ZIP and open the CSV file in a spreadsheet application (Excel, Google Sheets, etc.)

You should see columns for each member's name, gender, generation, birth dates, and other fields — one row per family member.

## 4. Export as GEDCOM

[GEDCOM](https://en.wikipedia.org/wiki/GEDCOM) is the standard format used by genealogy software worldwide.

1. Click the **GEDCOM** format button
2. Click **Download Backup**
3. A `.ged` file downloads

This file can be imported into other genealogy tools like Gramps, Ancestry, or MyHeritage if you ever want to move your data to another platform.

## 5. Restore from JSON Backup

Now test that your backup actually works by restoring it.

1. On the right column (**Restore Data**), click **Choose File**
2. Select the `giapha-export-YYYY-MM-DD.json` file you downloaded in step 2
3. A confirmation dialog appears warning: **"This will replace all current family data. This action cannot be undone."**
4. Click **Import Data**

You should see a green success message showing the number of imported persons and relationships — for example, "Successfully imported 4 persons and 3 relationships."

5. Go back to the members list to verify all your members and relationships are intact

## What You Learned

The app supports three export formats for different purposes:

| Format                                             | Best For                           | Contains                                  |
| -------------------------------------------------- | ---------------------------------- | ----------------------------------------- |
| **JSON**                                           | Full backup and restore            | All data (members, relationships, events) |
| **CSV**                                            | Spreadsheets and analysis          | Member data in tabular format             |
| **[GEDCOM](https://en.wikipedia.org/wiki/GEDCOM)** | Sharing with other genealogy tools | Industry-standard family tree format      |

JSON is the only format that supports round-trip import — export as JSON, then import the same file to restore everything.

For more about data formats, see [Features — Data Import/Export](../explanation/02-features.md#data-importexport).
