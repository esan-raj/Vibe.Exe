-- Add approved field to tours table
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false;


