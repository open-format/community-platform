"use server";

import type { InferModel } from "drizzle-orm";
import { and, eq, not, or, sql } from "drizzle-orm";
import { db } from "..";
import { communities } from "../schema";

type Community = InferModel<typeof communities>;

export async function createCommunity(communityId: string, name: string) {
  const newCommunity = await db
    .insert(communities)
    .values({ id: communityId.toLowerCase(), slug: communityId.toLowerCase(), title: name.toLowerCase() })
    .returning();
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

export async function updateCommunity(communityId: string, data: Partial<Community>) {
  try {
    const updatedCommunity = await db.update(communities).set(data).where(eq(communities.id, communityId)).returning();
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
