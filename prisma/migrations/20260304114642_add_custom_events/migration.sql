-- CreateTable
CREATE TABLE "custom_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "event_date" TEXT NOT NULL,
    "location" TEXT,
    "content" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_events_pkey" PRIMARY KEY ("id")
);
