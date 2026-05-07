-- Add photos to progress milestones
ALTER TABLE "project_progress_milestones"
ADD COLUMN IF NOT EXISTS "photo_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

