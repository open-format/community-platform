-- First set a default value for new rows
ALTER TABLE "communities" ADD COLUMN "show_social_handles_new" boolean DEFAULT false;

-- Copy existing data with explicit casting
UPDATE "communities" 
SET "show_social_handles_new" = 
  CASE 
    WHEN "show_social_handles" IN ('true', 't', 'yes', 'y', 'on', '1') THEN true
    ELSE false
  END;

-- Drop the old column
ALTER TABLE "communities" DROP COLUMN "show_social_handles";

-- Rename the new column to the original name
ALTER TABLE "communities" RENAME COLUMN "show_social_handles_new" TO "show_social_handles";