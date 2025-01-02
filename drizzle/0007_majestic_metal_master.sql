ALTER TABLE "communities" ALTER COLUMN "token_label" SET DEFAULT 'Points';--> statement-breakpoint
ALTER TABLE "communities" ALTER COLUMN "token_label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ALTER COLUMN "user_label" SET DEFAULT 'User';--> statement-breakpoint
ALTER TABLE "communities" ALTER COLUMN "user_label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ALTER COLUMN "participant_label" SET DEFAULT 'Participant';--> statement-breakpoint
ALTER TABLE "communities" ALTER COLUMN "participant_label" SET NOT NULL;