/**
 * DishDrop Menu Importer
 *
 * Takes the scraped menu data from menus-extracted.json and:
 * 1. Updates the database (Restaurant.menu and Restaurant.menuUrl fields)
 * 2. Generates a CSV export for review
 * 3. Updates restaurants-raw.json with menu data for future mock data generation
 *
 * Usage: npx ts-node --transpile-only scripts/import-menus.ts
 */

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

interface MenuItem {
  name: string;
  description?: string;
  price?: string;
  dietaryTags?: string[];
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface RestaurantMenu {
  categories: MenuCategory[];
}

interface MenuEntry {
  name: string;
  menu: RestaurantMenu;
  menuUrl: string;
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const MENUS_FILE = path.join(DATA_DIR, 'menus-extracted.json');
const CSV_FILE = path.join(DATA_DIR, 'menus-export.csv');
const LOG_FILE = path.join(DATA_DIR, 'scrape-log.json');

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function main() {
  if (!fs.existsSync(MENUS_FILE)) {
    console.error('Error: menus-extracted.json not found. Run scrape-menus first.');
    process.exit(1);
  }

  const menuData: Record<string, MenuEntry> = JSON.parse(
    fs.readFileSync(MENUS_FILE, 'utf-8')
  );

  const slugs = Object.keys(menuData);
  console.log(`\n📥 DishDrop Menu Importer`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Menus to import: ${slugs.length}\n`);

  // ========================================
  // 1. Update database
  // ========================================
  console.log('--- Updating database ---');
  let dbUpdated = 0;
  let dbSkipped = 0;
  let dbErrors = 0;

  for (const slug of slugs) {
    const entry = menuData[slug];
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
      });

      if (!restaurant) {
        // Try to find by name
        const byName = await prisma.restaurant.findFirst({
          where: { name: entry.name },
        });

        if (byName) {
          await prisma.restaurant.update({
            where: { id: byName.id },
            data: {
              menu: entry.menu as any,
              menuUrl: entry.menuUrl,
            },
          });
          dbUpdated++;
        } else {
          console.log(`  [skip] ${entry.name} - not found in DB`);
          dbSkipped++;
        }
      } else {
        await prisma.restaurant.update({
          where: { slug },
          data: {
            menu: entry.menu as any,
            menuUrl: entry.menuUrl,
          },
        });
        dbUpdated++;
      }

      if (dbUpdated % 20 === 0 && dbUpdated > 0) {
        console.log(`  Progress: ${dbUpdated}/${slugs.length} updated`);
      }
    } catch (err: any) {
      dbErrors++;
      console.error(`  [error] ${entry.name}: ${err.message}`);
    }
  }

  console.log(`  Updated: ${dbUpdated}`);
  console.log(`  Skipped: ${dbSkipped}`);
  console.log(`  Errors: ${dbErrors}\n`);

  // ========================================
  // 2. Generate CSV export
  // ========================================
  console.log('--- Generating CSV export ---');
  const csvRows: string[] = [
    'Restaurant,Category,Item Name,Description,Price,Dietary Tags',
  ];

  let totalItems = 0;
  for (const slug of slugs) {
    const entry = menuData[slug];
    for (const category of entry.menu.categories) {
      for (const item of category.items) {
        totalItems++;
        csvRows.push(
          [
            escapeCsv(entry.name),
            escapeCsv(category.name),
            escapeCsv(item.name),
            escapeCsv(item.description || ''),
            escapeCsv(item.price || ''),
            escapeCsv((item.dietaryTags || []).join('; ')),
          ].join(',')
        );
      }
    }
  }

  fs.writeFileSync(CSV_FILE, csvRows.join('\n'), 'utf-8');
  console.log(`  Wrote ${totalItems} items to ${CSV_FILE}\n`);

  // ========================================
  // 3. Update restaurants-raw.json
  // ========================================
  console.log('--- Updating restaurants-raw.json ---');
  const rawPath = path.join(DATA_DIR, 'restaurants-raw.json');
  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

  let rawUpdated = 0;
  for (const restaurant of rawData) {
    if (menuData[restaurant.slug]) {
      restaurant.menu = menuData[restaurant.slug].menu;
      restaurant.menuUrl = menuData[restaurant.slug].menuUrl;
      rawUpdated++;
    }
  }

  fs.writeFileSync(rawPath, JSON.stringify(rawData, null, 2), 'utf-8');
  console.log(`  Updated ${rawUpdated} restaurants in restaurants-raw.json\n`);

  // ========================================
  // 4. Print summary with scrape log
  // ========================================
  console.log(`${'='.repeat(50)}`);
  console.log(`📊 Import Summary`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Total menus imported: ${slugs.length}`);
  console.log(`Total menu items: ${totalItems}`);
  console.log(`Database updated: ${dbUpdated}`);
  console.log(`CSV export: ${CSV_FILE}`);

  if (fs.existsSync(LOG_FILE)) {
    const log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
    const failed = log.results?.filter(
      (r: any) => !['success', 'partial'].includes(r.status)
    ) || [];
    if (failed.length > 0) {
      console.log(`\n--- Failed URLs (${failed.length}) ---`);
      for (const f of failed) {
        console.log(`  ${f.name} [${f.status}]: ${f.error || 'unknown'}`);
      }
    }
  }
}

main()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
