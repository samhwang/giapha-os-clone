# Tutorial: Track Family Events

By the end of this tutorial, you will have birthday reminders, a Vietnamese lunar death anniversary, and a custom family event — all visible on the dashboard.

## Prerequisites

- Completed the [Build Your First Family Tree](./01-family-tree.md) tutorial (you need members with birth dates)
- You are logged in and on the dashboard

## 1. Check Birthdays on the Dashboard

If you followed the previous tutorial, your members already have birth dates. Look at the dashboard home page:

1. From the dashboard, notice the **upcoming events** section in the top card
2. If any of your members have birthdays coming up within the next 30 days, they appear here with a cake icon
3. Click **View Events** (the arrow button) to see the full events page

If no birthdays are within 30 days, that is expected — we will create events with closer dates next.

## 2. Add a Birthday Near Today

To see a birthday appear in upcoming events, edit a member to have a birthday close to today's date.

1. Click the **Family Tree** card from the dashboard
2. Click on **Nguyễn Thị D** to open her detail page
3. Click **Edit**
4. Under **Birth Date (Solar)**, change the month and day to be within the next few days (keep the year as `1990`)
5. Click **Save Changes**
6. Return to the dashboard

You should now see **Nguyễn Thị D**'s birthday in the upcoming events section with a cake icon and the number of days until the birthday.

## 3. Record a Death with Lunar Date

Vietnamese death anniversaries (Giỗ) follow the lunar calendar. Add a deceased member with both solar and lunar death dates.

1. Go to the members list and click on **Nguyễn Văn A** (the grandfather)
2. Click **Edit**
3. Check the **Is Deceased** checkbox
4. New fields appear for death dates:
   - **Death Date (Solar)**: Day `20`, Month `1`, Year `2010`
   - **Death Date (Lunar)**: Day `6`, Month `12`, Year `2009`
5. Click **Save Changes**

Back on the member detail page, you should see a **DECEASED** badge and both the solar and lunar death dates displayed.

## 4. See the Death Anniversary on the Dashboard

1. Return to the dashboard
2. The upcoming events section now shows the death anniversary (Giỗ) for **Nguyễn Văn A** with a flower icon
3. The date shown is the lunar anniversary converted to this year's solar calendar

Click **View Events** to see the full events page. Use the filter tabs at the top:

- Click **Death Anniversaries** to see only Giỗ events
- Click **Birthdays** to see only birthday events
- Click **All** to see everything

## 5. Create a Custom Event

Add a family reunion as a custom event.

1. On the events page, click the **+** button (visible to admins)
2. Fill in the event details:
   - **Event Name**: `Họp mặt gia đình 2025`
   - **Event Date**: Pick a date within the next 30 days
   - **Location**: `Nhà thờ họ Nguyễn, Huế`
   - **Content**: `Buổi họp mặt gia đình thường niên`
3. Save the event

The custom event now appears in the events list with a star icon.

## 6. View All Events Together

1. Return to the dashboard
2. The upcoming events section now shows three types of events:
   - A **birthday** (cake icon) — Nguyễn Thị D
   - A **death anniversary** (flower icon) — Nguyễn Văn A
   - A **custom event** (star icon) — Họp mặt gia đình

Each event shows how many days away it is. Events happening today are highlighted.

3. On the events page, use the filter tabs to switch between event types
4. Toggle **Show Deceased Birthdays** to include or exclude birthdays of deceased members

## What You Learned

The app tracks three types of events:

| Event Type                    | Source                    | Calendar                   |
| ----------------------------- | ------------------------- | -------------------------- |
| **Birthdays**                 | Member's birth date       | Solar                      |
| **Death Anniversaries (Giỗ)** | Member's lunar death date | Lunar → converted to solar |
| **Custom Events**             | Manually created          | Solar                      |

Death anniversaries use the Vietnamese lunar calendar — the same lunar date falls on a different solar date each year, and the app handles the conversion automatically.

For more about the lunar calendar system, see [Features — Events](../explanation/02-features.md#events). To learn about backing up your family data, continue to the [next tutorial](./04-import-export.md).
