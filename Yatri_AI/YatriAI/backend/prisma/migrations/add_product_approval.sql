-- Add approved field to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false;


