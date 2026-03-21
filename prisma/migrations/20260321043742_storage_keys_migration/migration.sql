-- Strip /api/uploads/ prefix from avatarUrl to store storage keys instead of URLs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Person') THEN
    UPDATE "Person"
    SET "avatarUrl" = SUBSTRING("avatarUrl" FROM LENGTH('/api/uploads/') + 1)
    WHERE "avatarUrl" LIKE '/api/uploads/%';
  END IF;
END $$;
