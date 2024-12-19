ALTER TABLE "communities" RENAME COLUMN "primary_color" TO "background_color";--> statement-breakpoint
ALTER TABLE "communities" RENAME COLUMN "secondary_color" TO "text_color";--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "accent_color" varchar(7) DEFAULT '#6366F1' NOT NULL;