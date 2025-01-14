"use server";

import type { InferModel } from "drizzle-orm";
import { and, eq, not, or, sql } from "drizzle-orm";
import type { Address } from "viem";
import { db } from "..";
import { communities, tiers } from "../schema";
import { upsertTiers } from "./tiers";

type Community = InferModel<typeof communities>;

type UpdateCommunityData = Partial<Community> & {
  tiers?: Array<{
    name: string;
    points_required: number;
    color: string;
    tier_id?: string;
    community_id?: string;
  }>;
  deletedTierIds?: string[];
};

export async function createCommunity(communityId: Address, name: string, chainId: number) {
  // Check if the community already exists
  const existingCommunity = await db.query.communities.findFirst({
    where: or(eq(communities.id, communityId.toLowerCase()), eq(communities.slug, communityId.toLowerCase())),
  });

  if (existingCommunity) {
    return existingCommunity;
  }

  const newCommunity = await db
    .insert(communities)
    .values({
      id: communityId.toLowerCase(),
      slug: communityId.toLowerCase(),
      title: name.toLowerCase(),
      description: `Welcome to the ${name} community!`,
      chain_id: chainId,
    })
    .returning();

  // Add default tiers
  await db.insert(tiers).values([
    {
      community_id: communityId.toLowerCase(),
      name: "Bronze",
      points_required: 0,
      color: "#CD7F32",
    },
    {
      community_id: communityId.toLowerCase(),
      name: "Silver",
      points_required: 100,
      color: "#C0C0C0",
    },
    {
      community_id: communityId.toLowerCase(),
      name: "Gold",
      points_required: 500,
      color: "#FFD700",
    },
  ]);

  return newCommunity;
}

export async function getCommunities() {
  const communities = await db.query.communities.findMany();
  return communities;
}

export async function getCommunity(slugOrId: string) {
  const community = await db.query.communities.findFirst({
    where: or(eq(sql`LOWER(${communities.slug})`, slugOrId.toLowerCase()), eq(communities.id, slugOrId)),
    with: {
      tiers: {
        orderBy: (tiers, { asc }) => [asc(tiers.points_required)],
      },
    },
  });
  return community;
}

export async function updateCommunity(communityId: string, data: UpdateCommunityData) {
  try {
    // Extract tiers data
    const { tiers: tiersData, deletedTierIds, ...communityData } = data;

    // Update community metadata
    const updatedCommunity = await db
      .update(communities)
      .set(communityData)
      .where(eq(communities.id, communityId))
      .returning();

    // Handle tiers update if provided
    if (tiersData) {
      // Add community_id to each tier
      const tiersWithCommunityId = tiersData.map((tier) => ({
        ...tier,
        community_id: communityId,
      }));

      await upsertTiers(tiersWithCommunityId, deletedTierIds || []);
    }

    return updatedCommunity;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function isSlugAvailable(slug: string, excludeCommunityId?: string) {
  const existing = await db.query.communities.findFirst({
    where: and(
      eq(communities.slug, slug),
      // Exclude current community when checking (for updates)
      excludeCommunityId ? not(eq(communities.id, excludeCommunityId)) : undefined
    ),
  });
  return !existing;
}
