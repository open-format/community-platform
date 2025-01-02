ALTER TABLE "communities" RENAME COLUMN "logo_url" TO "banner_url";--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "leaderboard_token" varchar(42);--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "tiers_token" varchar(42);