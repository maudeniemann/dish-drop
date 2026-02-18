import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
});

async function main() {
  const dataPath = path.join(__dirname, '..', 'data', 'restaurants-raw.json');

  if (!fs.existsSync(dataPath)) {
    console.error(`ERROR: ${dataPath} not found.`);
    console.error('Run "npm run fetch-restaurants" first to fetch restaurant data.');
    process.exit(1);
  }

  const restaurants = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`=== Seeding ${restaurants.length} restaurants into database ===\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const r of restaurants) {
    try {
      const existing = await prisma.restaurant.findUnique({
        where: { googlePlaceId: r.googlePlaceId },
      });

      if (existing) {
        await prisma.restaurant.update({
          where: { googlePlaceId: r.googlePlaceId },
          data: {
            name: r.name,
            coverImage: r.coverImage,
            address: r.address,
            city: r.city,
            state: r.state,
            zipCode: r.zipCode,
            latitude: r.latitude,
            longitude: r.longitude,
            phone: r.phone,
            website: r.website,
            cuisineTypes: r.cuisineTypes,
            priceLevel: r.priceLevel,
            hours: r.hours,
          },
        });
        updated++;
      } else {
        // Check for slug collision
        let slug = r.slug;
        let slugSuffix = 1;
        while (await prisma.restaurant.findUnique({ where: { slug } })) {
          slugSuffix++;
          slug = `${r.slug}-${slugSuffix}`;
        }

        await prisma.restaurant.create({
          data: {
            name: r.name,
            slug,
            coverImage: r.coverImage,
            address: r.address,
            city: r.city,
            state: r.state,
            zipCode: r.zipCode,
            latitude: r.latitude,
            longitude: r.longitude,
            phone: r.phone,
            website: r.website,
            googlePlaceId: r.googlePlaceId,
            cuisineTypes: r.cuisineTypes,
            priceLevel: r.priceLevel,
            hours: r.hours,
            postCount: 0,
            averageRating: 0,
            mealsDonated: 0,
            isClaimed: false,
          },
        });
        created++;
      }

      if ((created + updated) % 20 === 0) {
        console.log(`  Progress: ${created + updated}/${restaurants.length} (${created} created, ${updated} updated)`);
      }
    } catch (err: any) {
      errors++;
      console.error(`  Error seeding "${r.name}": ${err.message}`);
    }
  }

  console.log(`\n=== Seed complete ===`);
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total in DB: ${await prisma.restaurant.count()}`);
}

main()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
