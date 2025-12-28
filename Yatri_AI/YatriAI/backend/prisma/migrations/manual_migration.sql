-- Manual SQL Migration: Add category and verified fields to Feedback table
-- Run this in Neon SQL Editor if Prisma migrations fail

-- Check if columns already exist before adding them
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feedback' AND column_name = 'category'
    ) THEN
        ALTER TABLE "feedback" ADD COLUMN "category" TEXT DEFAULT 'platform';
    END IF;

    -- Add verified column if it doesn't exist (note: schema uses 'verified', not 'isVerified')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'feedback' AND column_name = 'verified'
    ) THEN
        ALTER TABLE "feedback" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- If isVerified exists (from previous attempts), we can keep it or migrate data
    -- For now, we'll just ensure verified exists
END $$;

-- Verify the changes
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;



