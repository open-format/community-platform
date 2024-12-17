"use server";

import type { InferModel } from "drizzle-orm";
import { and, eq, not, or } from "drizzle-orm";
import { db } from "..";
import { communities } from "../schema";

type Community = InferModel<typeof communities>;

export async function createCommunity(communityId: string) {
  const newCommunity = await db.insert(communities).values({ id: communityId, slug: communityId }).returning();
  return newCommunity;
}

export async function getCommunities() {
  const communities = await db.query.communities.findMany();
  return communities;
}

export async function getCommunity(slugOrId: string) {
  const community = await db.query.communities.findFirst({
    where: or(eq(communities.slug, slugOrId), eq(communities.id, slugOrId)),
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
