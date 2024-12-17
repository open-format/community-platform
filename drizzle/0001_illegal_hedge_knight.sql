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
