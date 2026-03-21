# Tutorial: Build Your First Family Tree

By the end of this tutorial, you will have a three-generation family tree with members, relationships, and avatars — viewable in three different visualization modes.

## Prerequisites

- A running instance of Gia Pha OS (see [Quick Start](../how-to/01-quick-start.md))
- An account with admin or editor role
- You are logged in and on the dashboard

## 1. Add the Founder

Start by adding the oldest ancestor — the root of your family tree.

1. From the dashboard, click the **Family Tree** card
2. Click **Add Member**
3. Fill in the form:
   - **Full Name**: `Nguyễn Văn A`
   - **Gender**: Select `Male`
   - **Generation**: Enter `1`
   - **Birth Date (Solar)**: Day `15`, Month `3`, Year `1940`
4. Click **Add Member**

You are redirected to the members page. You should see **Nguyễn Văn A** listed with a generation badge showing "Gen. 1".

## 2. Add a Spouse

Now add a spouse for the founder.

1. Click **Add Member**
2. Fill in the form:
   - **Full Name**: `Trần Thị B`
   - **Gender**: Select `Female`
   - **Generation**: Enter `1`
   - **Birth Date (Solar)**: Day `22`, Month `8`, Year `1942`
3. Click **Add Member**

You now have two members in generation 1.

## 3. Create the Marriage Relationship

Connect the two members as spouses.

1. Click on **Nguyễn Văn A** to open his detail page
2. In the **Family** section, look for the relationship manager
3. Add a new relationship:
   - **Type**: Select `Marriage`
   - **Person**: Select `Trần Thị B`
4. Save the relationship

You should see **Trần Thị B** listed as a spouse under Nguyễn Văn A's family section.

## 4. Add a Child (Generation 2)

Add the next generation.

1. Go back to the members list
2. Click **Add Member**
3. Fill in the form:
   - **Full Name**: `Nguyễn Văn C`
   - **Gender**: Select `Male`
   - **Generation**: Enter `2`
   - **Birth Order**: Enter `1`
   - **Birth Date (Solar)**: Day `10`, Month `6`, Year `1965`
4. Click **Add Member**

## 5. Create the Parent-Child Relationship

1. Click on **Nguyễn Văn A** to open his detail page
2. In the **Family** section, add a new relationship:
   - **Type**: Select `Biological Child`
   - **Person**: Select `Nguyễn Văn C`
3. Save the relationship

**Nguyễn Văn C** now appears as a child of Nguyễn Văn A. The tree view will show a line connecting them.

## 6. Add a Grandchild (Generation 3)

Add one more generation to complete a three-generation tree.

1. Go back to the members list
2. Click **Add Member**
3. Fill in the form:
   - **Full Name**: `Nguyễn Thị D`
   - **Gender**: Select `Female`
   - **Generation**: Enter `3`
   - **Birth Order**: Enter `1`
   - **Birth Date (Solar)**: Day `5`, Month `12`, Year `1990`
4. Click **Add Member**

Then create the parent-child relationship:

5. Click on **Nguyễn Văn C** to open his detail page
6. In the **Family** section, add a new relationship:
   - **Type**: Select `Biological Child`
   - **Person**: Select `Nguyễn Thị D`
7. Save the relationship

You now have three generations: grandparent → parent → grandchild.

## 7. Switch Visualization Modes

Go to the members page and use the view toggle to explore all three modes:

1. **Tree view** — You should see a hierarchical tree with Nguyễn Văn A at the top, Nguyễn Văn C in the middle, and Nguyễn Thị D at the bottom. Trần Thị B appears alongside Nguyễn Văn A as a spouse. Use pan and zoom to navigate.

2. **Mindmap view** — The same data displayed as a mindmap layout, branching outward from the root.

3. **List view** — A flat searchable list of all four members. Try typing "Nguyễn" in the search box to filter results.

## 8. Upload an Avatar

Give one of your members a photo.

1. Click on **Nguyễn Văn A** to open his detail page
2. Click **Edit**
3. In the **Avatar** section, click **Choose Photo**
4. Select a JPG, PNG, or WebP image (max 5MB)
5. You should see a circular preview of the photo
6. Click **Save Changes**

Back on the member detail page, the avatar now appears in the profile banner and on the tree view nodes.

## What You Built

You now have a working family tree with:
- **4 members** across 3 generations
- **3 relationships** (1 marriage, 2 biological child)
- **3 visualization modes** to explore the same data
- **1 avatar** to personalize a member

To learn more about how these features work, see [Features](../explanation/02-features.md). To explore how members are related using Vietnamese kinship terms, continue to the [next tutorial](./02-kinship.md).
