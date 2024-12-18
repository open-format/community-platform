"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { tiers as tiersSchema } from "../schema";

export async function getTiers(communityId: string) {
  const tiers = await db
    .select()
    .from(tiersSchema)
    .where(eq(tiersSchema.community_id, communityId))
    .orderBy(tiersSchema.points_required);
  return tiers;
}

type NewTier = typeof tiersSchema.$inferInsert;

export async function upsertTiers(data: NewTier[], deletedTierIds: string[] = []) {
  try {
    // First, delete any removed tiers
    if (deletedTierIds.length > 0) {
      await db.delete(tiersSchema).where(inArray(tiersSchema.id, deletedTierIds));
    }

    // Map the data, only including id for existing tiers
    const mappedData = data.map((tier) => {
      const baseTier = {
        name: tier.name,
        points_required: tier.points_required,
        color: tier.color,
        community_id: tier.community_id,
      };

      if (tier.tier_id) {
        return { ...baseTier, id: tier.tier_id };
      }

      return baseTier;
    });

    // Then bulk upsert the remaining/new tiers
    await db
      .insert(tiersSchema)
      .values(mappedData)
      .onConflictDoUpdate({
        target: [tiersSchema.id],
        set: {
          name: sql`EXCLUDED.name`,
          points_required: sql`EXCLUDED.points_required`,
          color: sql`EXCLUDED.color`,
          community_id: sql`EXCLUDED.community_id`,
        },
      })
      .returning();

    // Get fresh data after the upsert
    const freshTiers = await getTiers(data[0].community_id);

    revalidatePath("/communities/[slug]/tiers", "page");
    return freshTiers;
  } catch (error) {
    console.error("Error upserting tiers:", error);
    throw error;
  }
}
