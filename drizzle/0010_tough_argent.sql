ALTER TABLE "communities" RENAME COLUMN "leaderboard_token" TO "token_to_display";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN "tiers_token";