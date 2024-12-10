import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Example user table
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  wallet_address: varchar("wallet_address", { length: 42 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
