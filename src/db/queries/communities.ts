"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { communities } from "../schema";

export async function createCommunity(communityId: string) {
  const newCommunity = await db.insert(communities).values({ id: communityId, slug: communityId }).returning();
  return newCommunity;
}

export async function getCommunity(communityId: string) {
  const community = await db.select().from(communities).where(eq(communities.slug, communityId));
  return community;
}

export async function updateCommunity(communityId: string, data: Partial<typeof communities>) {
  const updatedCommunity = await db.update(communities).set(data).where(eq(communities.id, communityId));
  return updatedCommunity;
}
