import { db } from "./index";
import { communities, tiers } from "./schema";

async function seed() {
  // Insert demo community
  await db.insert(communities).values({
    id: "0xc48cf71e5ca0fb4cb0024cd1c1420aa7daf44868", // contract address for the community
    title: "Demo Community",
    description: "A demo community for testing purposes",
    slug: "demo-community",
    banner_url: "https://avatars.githubusercontent.com/u/121942809?s=200&v=4",
  });

  // Insert tiers directly with community_id
  await db.insert(tiers).values([
    {
      name: "Bronze",
      points_required: 100,
      color: "#CD7F32", // Bronze color
      community_id: "0xc48cf71e5ca0fb4cb0024cd1c1420aa7daf44868",
    },
    {
      name: "Silver",
      points_required: 500,
      color: "#C0C0C0", // Silver color
      community_id: "0xc48cf71e5ca0fb4cb0024cd1c1420aa7daf44868",
    },
    {
      name: "Gold",
      points_required: 1000,
      color: "#FFD700", // Gold color
      community_id: "0xc48cf71e5ca0fb4cb0024cd1c1420aa7daf44868",
    },
    {
      name: "Platinum",
      points_required: 2500,
      color: "#E5E4E2", // Platinum color
      community_id: "0xc48cf71e5ca0fb4cb0024cd1c1420aa7daf44868",
    },
  ]);
}

// Execute the seed function
seed()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // Close the database connection
    process.exit(0);
  });
