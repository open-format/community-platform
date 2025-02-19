"use server";

import { db } from "..";
import { communities } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTokenVisibility(communityId: string, tokenId: string, hidden: boolean) {
  try {
    const community = await db.query.communities.findFirst({
      where: eq(communities.id, communityId)
    });

    if (!community) throw new Error("Community not found");

    // Ensure current hidden tokens is an array and remove duplicates
    const currentHiddenTokens = [...new Set(community.hidden_tokens || [])];
    console.log('Current hidden tokens (deduped):', currentHiddenTokens);
    
    const newHiddenTokens = hidden 
      ? [...new Set([...currentHiddenTokens, tokenId])] // Add token and remove duplicates
      : currentHiddenTokens.filter(id => id !== tokenId);
    
    console.log('New hidden tokens:', newHiddenTokens);

    await db.update(communities)
      .set({ hidden_tokens: newHiddenTokens })
      .where(eq(communities.id, communityId));

    // Force a hard revalidate
    revalidatePath(`/communities/${community.slug}/tokens`, 'page');
    
    // Log the updated community
    const updatedCommunity = await db.query.communities.findFirst({
      where: eq(communities.id, communityId)
    });
    console.log('Updated community hidden tokens:', updatedCommunity?.hidden_tokens);

    return { success: true };
  } catch (error) {
    console.error('Error updating token visibility:', error);
    return { success: false, error };
  }
}