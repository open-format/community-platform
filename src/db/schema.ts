import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Example user table
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  wallet_address: varchar("wallet_address", { length: 42 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const communities = pgTable("communities", {
  id: varchar("id", { length: 42 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  description: varchar("description", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  primary_color: varchar("primary_color", { length: 7 }).notNull().default("#000000"),
  secondary_color: varchar("secondary_color", { length: 7 }).notNull().default("#FFFFFF"),
  logo_url: varchar("logo_url", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
