CREATE TABLE "communities" (
	"id" varchar(42) PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"description" varchar(255),
	"slug" varchar(255) NOT NULL,
	"primary_color" varchar(7) DEFAULT '#000000' NOT NULL,
	"secondary_color" varchar(7) DEFAULT '#FFFFFF' NOT NULL,
	"logo_url" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"token" varchar(42) NOT NULL,
	"function_name" varchar(255) NOT NULL,
	"amount" varchar(255) NOT NULL,
	"reward_id" varchar(255) NOT NULL,
	"metadata_uri" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" varchar(42) NOT NULL,
	"name" varchar(255) NOT NULL,
	"points_required" integer NOT NULL,
	"color" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"app_id" varchar(42) NOT NULL,
	"owner" varchar(42) NOT NULL,
	"webhook" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;