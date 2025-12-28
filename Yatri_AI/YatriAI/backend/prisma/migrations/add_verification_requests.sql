-- Add verification request model
CREATE TABLE IF NOT EXISTS "verification_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "documents" TEXT[],
  "notes" TEXT,
  "adminNotes" TEXT,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "verification_requests_userId_idx" ON "verification_requests"("userId");
CREATE INDEX IF NOT EXISTS "verification_requests_status_idx" ON "verification_requests"("status");
CREATE INDEX IF NOT EXISTS "verification_requests_type_idx" ON "verification_requests"("type");


