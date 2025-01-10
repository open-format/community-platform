import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const communities = pgTable("communities", {
  id: varchar("id", { length: 42 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  description: varchar("description", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  accent_color: varchar("accent_color", { length: 7 }).notNull().default("#6366F1"),
  token_label: varchar("token_label", { length: 255 }).notNull().default("Points"),
  user_label: varchar("user_label", { length: 255 }).notNull().default("User"),
  participant_label: varchar("participant_label", { length: 255 }).notNull().default("Participant"),
  dark_mode: boolean("dark_mode").notNull().default(false),
  banner_url: varchar("banner_url", { length: 255 }),
  token_to_display: varchar("token_to_display", { length: 42 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  show_social_handles: boolean("show_social_handles").notNull().default(false),
  chain_id: integer("chain_id"),
});

export const communitiesRelations = relations(communities, ({ many }) => ({
  tiers: many(tiers),
}));

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }),
  app_id: varchar("app_id", { length: 42 }).notNull(),
  owner: varchar("owner", { length: 42 }).notNull(),
  webhook: varchar("webhook", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowsRelations = relations(workflows, ({ many }) => ({
  rewards: many(rewards),
}));

export const rewards = pgTable("rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflow_id: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id),
  token: varchar("token", { length: 42 }).notNull(),
  function_name: varchar("function_name", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 255 }).notNull(),
  reward_id: varchar("reward_id", { length: 255 }).notNull(),
  metadata_uri: varchar("metadata_uri", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const rewardsRelations = relations(rewards, ({ one }) => ({
  workflow: one(workflows, {
    fields: [rewards.workflow_id],
    references: [workflows.id],
  }),
}));

export const tiers = pgTable("tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  community_id: varchar("community_id", { length: 42 })
    .notNull()
    .references(() => communities.id),
  name: varchar("name", { length: 255 }).notNull(),
  points_required: integer("points_required").notNull(),
  color: varchar("color", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const tiersRelations = relations(tiers, ({ one }) => ({
  community: one(communities, {
    fields: [tiers.community_id],
    references: [communities.id],
  }),
}));
