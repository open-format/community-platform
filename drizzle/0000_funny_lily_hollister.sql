CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
