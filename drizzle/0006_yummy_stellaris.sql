ALTER TABLE "communities" ADD COLUMN "token_label" varchar(255);--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "user_label" varchar(255);--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "participant_label" varchar(255);--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN "background_color";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN "text_color";--> statement-breakpoint
ALTER TABLE "communities" DROP COLUMN "button_color";