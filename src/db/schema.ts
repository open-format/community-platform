import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Define ENUMs for event and reward types
export const EVENT_TYPES = ["connect_account", "voice_channel_join"] as const;

export const REWARD_TYPES = ["token", "badge"] as const;

export const PLATFORM_TYPES = ["discord", "github", "telegram"] as const;

export const community_roles = pgTable(
  "community_roles",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    communityId: uuid("community_id").references(() => communities.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("role_community_unique_idx").on(table.communityId, table.name)],
);

export const communities = pgTable("communities", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name: text("name"),
  description: text("description"),
  goals: jsonb("goals").default([]),
  platforms: jsonb("platforms").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  communityContractAddress: text("community_contract_address"),
  communityContractChainId: integer("community_contract_chain_id"),
  communityWalletId: text("community_wallet_id"),
  communityWalletAddress: text("community_wallet_address"),
  slug: varchar("slug", { length: 255 }).default(sql`gen_random_uuid()`).notNull().unique(),
  accentColor: varchar("accent_color", { length: 7 }).notNull().default("#6366F1"),
  tokenLabel: varchar("token_label", { length: 255 }).notNull().default("Points"),
  userLabel: varchar("user_label", { length: 255 }).notNull().default("User"),
  participantLabel: varchar("participant_label", { length: 255 }).notNull().default("Participant"),
  darkMode: boolean("dark_mode").notNull().default(false),
  bannerUrl: varchar("banner_url", { length: 255 }),
  tokenToDisplay: varchar("token_to_display", { length: 42 }),
  showSocialHandles: boolean("show_social_handles").notNull().default(false),
  hiddenTokens: varchar("hidden_tokens", { length: 42 }).array().default([]),
});

export const tiers = pgTable("tiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  communityId: uuid("community_id")
    .notNull()
    .references(() => communities.id),
  name: varchar("name", { length: 255 }).notNull(),
  pointsRequired: integer("points_required").notNull(),
  color: varchar("color", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  did: text("did").unique().notNull(), // Privy DID, unique identifier
  nickname: text("nickname"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const user_communities = pgTable(
  "user_communities",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    communityId: uuid("community_id").references(() => communities.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    joinedAt: timestamp("joined_at").defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("user_community_unique_idx").on(table.userId, table.communityId)],
);

export const user_community_roles = pgTable(
  "user_community_roles",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    communityId: uuid("community_id").references(() => communities.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    roleId: uuid("role_id").references(() => community_roles.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("user_community_role_unique_idx").on(table.userId, table.communityId, table.roleId),
  ],
);

export const platformConnections = pgTable(
  "platform_connections",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    communityId: uuid("community_id").references(() => communities.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    platformId: text("platform_id").notNull(),
    platformType: text("platform_type", { enum: PLATFORM_TYPES }).notNull(),
    platformName: text("platform_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("platform_idx").on(table.platformId, table.platformType)],
);

export const platformPermissions = pgTable(
  "platform_permissions",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    platformConnectionId: uuid("platform_connection_id")
      .notNull()
      .references(() => platformConnections.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    roleId: text("role_id").notNull(), // Discord role ID
    command: text("command").notNull(),
    // Token permission fields
    tokenAddress: text("token_address").notNull(), // The address of the ERC20 token
    maxAmount: text("max_amount"), // Maximum amount this role can send (null means unlimited)
    dailyLimit: text("daily_limit"), // Daily limit for this role
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Index for quick lookups by platform connection, role, and token
    index("platform_permissions_lookup_idx").on(
      table.platformConnectionId,
      table.roleId,
      table.tokenAddress,
    ),
  ],
);

export const pendingRewards = pgTable(
  "pending_rewards",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    community_id: uuid("community_id")
      .notNull()
      .references(() => communities.id),
    contributor_name: text("contributor_name").notNull(),
    wallet_address: text("wallet_address").notNull(),
    platform: text("platform", { enum: PLATFORM_TYPES }).notNull(),
    reward_id: text("reward_id").notNull(),
    points: integer("points").notNull(),
    summary: text("summary"),
    description: text("description"),
    impact: text("impact"),
    evidence: text("evidence").array(),
    reasoning: text("reasoning"),
    metadata_uri: text("metadata_uri").notNull(),
    status: text("status", {
      enum: ["pending", "processed", "failed"],
    }).default("pending"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    processed_at: timestamp("processed_at", { withTimezone: true }),
    error: text("error"),
  },
  (table) => [
    index("pending_rewards_community_idx").on(table.community_id),
    index("pending_rewards_status_idx").on(table.status),
  ],
);

// Define the relation from communities to roles
export const communitiesRelations = relations(communities, ({ many }) => ({
  roles: many(community_roles),
  platformConnections: many(platformConnections),
  tiers: many(tiers),
}));

// Define the relation from roles to communities
export const communityRolesRelations = relations(community_roles, ({ one }) => ({
  community: one(communities, {
    fields: [community_roles.communityId],
    references: [communities.id],
  }),
}));

export const platformConnectionsRelations = relations(platformConnections, ({ one, many }) => ({
  community: one(communities, {
    fields: [platformConnections.communityId],
    references: [communities.id],
  }),
  permissions: many(platformPermissions),
}));

export const platformPermissionsRelations = relations(platformPermissions, ({ one }) => ({
  platformConnection: one(platformConnections, {
    fields: [platformPermissions.platformConnectionId],
    references: [platformConnections.id],
  }),
}));

export const pendingRewardsRelations = relations(pendingRewards, ({ one }) => ({
  community: one(communities, {
    fields: [pendingRewards.community_id],
    references: [communities.id],
  }),
}));

export const tiersRelations = relations(tiers, ({ one }) => ({
  community: one(communities, {
    fields: [tiers.communityId],
    references: [communities.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  communities: many(user_communities),
}));

export const userCommunitiesRelations = relations(user_communities, ({ one, many }) => ({
  user: one(users, {
    fields: [user_communities.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [user_communities.communityId],
    references: [communities.id],
  }),
  roles: many(user_community_roles),
}));

export const userCommunityRolesRelations = relations(user_community_roles, ({ one }) => ({
  user: one(users, {
    fields: [user_community_roles.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [user_community_roles.communityId],
    references: [communities.id],
  }),
  role: one(community_roles, {
    fields: [user_community_roles.roleId],
    references: [community_roles.id],
  }),
}));
