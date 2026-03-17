-- Migrate existing record IDs to UUID v4.
-- FK columns with ON UPDATE CASCADE will auto-propagate from parent PK changes.

-- Parent tables first (CASCADE updates sessions.user_id, accounts.user_id,
-- person_details_private.person_id, relationships.person_a, relationships.person_b)
UPDATE "users" SET "id" = gen_random_uuid()::text;
UPDATE "persons" SET "id" = gen_random_uuid()::text;

-- Child / independent tables (only their own PK needs updating)
UPDATE "sessions" SET "id" = gen_random_uuid()::text;
UPDATE "accounts" SET "id" = gen_random_uuid()::text;
UPDATE "verifications" SET "id" = gen_random_uuid()::text;
UPDATE "relationships" SET "id" = gen_random_uuid()::text;
UPDATE "custom_events" SET "id" = gen_random_uuid()::text;
