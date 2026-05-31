import { getDb, closeConnection } from "./db";
import { plans, profiles, workspaces } from "../src/lib/schemas/schema";

export async function seed() {
  console.log("🌱 Seeding database...");

  const db = getDb();

  try {
    await db.insert(plans).values([
      {
        code: "free",
        priceMonthly: "0",
        maxLinks: 50,
        maxCustomDomains: 1,
      },
      {
        code: "pro",
        priceMonthly: "9.99",
        maxLinks: 1000,
        maxCustomDomains: 5,
      },
      {
        code: "business",
        priceMonthly: "29.99",
        maxLinks: 10000,
        maxCustomDomains: 20,
      },
    ]);

    console.log("✅ Plans seeded");

    const [defaultProfile] = await db
      .insert(profiles)
      .values({
        username: "demo",
        fullName: "Demo User",
        themeMode: "system",
      })
      .returning();

    console.log("✅ Default profile created");

    await db.insert(workspaces).values({
      ownerProfileId: defaultProfile.id,
      name: "Demo Workspace",
      slug: "demo",
    });

    console.log("✅ Default workspace created");
    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await closeConnection();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
