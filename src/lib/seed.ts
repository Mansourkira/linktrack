import { db } from './db';
import { plans, profiles, workspaces } from './schema';

export async function seed() {
    console.log('🌱 Seeding database...');

    try {
        // Insert default plans
        await db.insert(plans).values([
            {
                code: 'free',
                priceMonthly: '0',
                maxLinks: 50,
                maxCustomDomains: 1,
            },
            {
                code: 'pro',
                priceMonthly: '9.99',
                maxLinks: 1000,
                maxCustomDomains: 5,
            },
            {
                code: 'business',
                priceMonthly: '29.99',
                maxLinks: 10000,
                maxCustomDomains: 20,
            },
        ]);

        console.log('✅ Plans seeded');

        // Insert a default profile for testing
        const [defaultProfile] = await db.insert(profiles).values({
            username: 'demo',
            fullName: 'Demo User',
            themeMode: 'system',
        }).returning();

        console.log('✅ Default profile created');

        // Insert a default workspace
        await db.insert(workspaces).values({
            ownerProfileId: defaultProfile.id,
            name: 'Demo Workspace',
            slug: 'demo',
        });

        console.log('✅ Default workspace created');

        console.log('🎉 Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Run seed if this file is executed directly
if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
