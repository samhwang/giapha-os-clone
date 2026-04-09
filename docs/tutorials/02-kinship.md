# Tutorial: Discover Vietnamese Kinship Terms

By the end of this tutorial, you will understand how Vietnamese kinship terms work and how to use Kinship Lookup to look up relationships between any two family members.

## Prerequisites

- Completed the [Build Your First Family Tree](./01-family-tree.md) tutorial (you need at least 4 members across 3 generations with relationships)
- You are logged in and on the dashboard

## 1. Open Kinship Lookup

1. From the dashboard, click the **Kinship Lookup** card
2. You should see a page titled **Kinship Lookup** with two person selectors side by side

## 2. Look Up Grandparent and Grandchild

1. In the **Member A** selector, click and search for `Nguyễn Văn A` (the grandfather)
2. In the **Member B** selector, click and search for `Nguyễn Thị D` (the grandchild)

You should see the results appear immediately:

- **Nguyễn Văn A calls Nguyễn Thị D**: `cháu` (grandchild)
- **Nguyễn Thị D calls Nguyễn Văn A**: `ông nội` (paternal grandfather)

The term is `ông nội` (not `ông ngoại`) because the relationship is through the father's side — this is the paternal/maternal distinction in Vietnamese kinship.

## 3. Look Up Parent and Child

1. Change **Member A** to `Nguyễn Văn C` (the father)
2. Keep **Member B** as `Nguyễn Thị D` (the daughter)

The results update:

- **Nguyễn Văn C calls Nguyễn Thị D**: `con` (child)
- **Nguyễn Thị D calls Nguyễn Văn C**: `cha` (father)

## 4. Look Up the Married Couple

1. Change **Member A** to `Nguyễn Văn A` (the grandfather)
2. Change **Member B** to `Trần Thị B` (the grandmother)

The results show:

- **Nguyễn Văn A calls Trần Thị B**: `vợ` (wife)
- **Trần Thị B calls Nguyễn Văn A**: `chồng` (husband)

## 5. Try the Swap Button

1. Click the **swap button** (the arrow icon between the two selectors)
2. Member A and Member B switch places
3. The kinship terms reverse — the same relationship, seen from the other side

## 6. Explore the Path Analysis

Below the kinship terms, look for the **Path Analysis** section. It shows the chain of relationships connecting the two selected members — for example, "Nguyễn Thị D → child of Nguyễn Văn C → child of Nguyễn Văn A" with numbered steps.

## 7. Add a Maternal Grandparent

To see the paternal vs. maternal distinction in action, add a member from the mother's side.

1. Go back to the members list and click **Add Member**
2. Fill in the form:
   - **Full Name**: `Nguyễn Thị E`
   - **Gender**: Select `Female`
   - **Generation**: Enter `2`
   - **Birth Date (Solar)**: Day `18`, Month `9`, Year `1967`
3. Click **Add Member**

Now create a marriage relationship:

4. Click on **Nguyễn Văn C** to open his detail page
5. Add a relationship: **Type** `Marriage`, **Person** `Nguyễn Thị E`
6. Save the relationship

Next, add the wife's parent:

7. Go back to the members list and click **Add Member**
8. Fill in the form:
   - **Full Name**: `Lê Văn F`
   - **Gender**: Select `Male`
   - **Generation**: Enter `1`
   - **Birth Date (Solar)**: Day `7`, Month `2`, Year `1938`
9. Click **Add Member**

Create the parent-child relationship:

10. Click on **Lê Văn F** to open his detail page
11. Add a relationship: **Type** `Biological Child`, **Person** `Nguyễn Thị E`
12. Save the relationship

## 8. Compare Paternal vs. Maternal Terms

Return to Kinship Lookup:

1. Select **Member A**: `Nguyễn Văn A` (paternal grandfather)
2. Select **Member B**: `Nguyễn Thị D`
3. Result: `ông nội` — **paternal** grandfather

Now compare:

4. Change **Member A** to `Lê Văn F` (maternal grandfather)
5. Keep **Member B** as `Nguyễn Thị D`
6. Result: `ông ngoại` — **maternal** grandfather

Same generation difference, same gender — but different terms based on which side of the family the relationship comes through.

## What You Learned

Vietnamese kinship terms depend on three factors:

| Factor                    | Effect                                                         |
| ------------------------- | -------------------------------------------------------------- |
| **Generation difference** | Determines the base term (grandparent, parent, sibling, child) |
| **Gender**                | Distinguishes male/female variants (ông/bà, cha/mẹ, anh/chị)   |
| **Lineage side**          | Distinguishes paternal (nội) from maternal (ngoại)             |

For the full terminology table, see [Features — Kinship Calculation](../explanation/02-features.md#kinship-calculation). To learn about tracking family events, continue to the [next tutorial](./03-events.md).
