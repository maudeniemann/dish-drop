import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fetchAllPages, fetchPhotoRedirectUrl } from './utils/google-places';
import { mapCuisineTypes, mapPriceLevel, getFallbackPhoto } from './utils/cuisine-mapper';
import { generateSlug, deduplicateSlugs } from './utils/slug';

// Boston College center coordinates
const BC_LAT = 42.3355;
const BC_LNG = -71.1685;

// Multiple queries to cover diverse cuisines and neighborhoods around BC
const SEARCH_QUERIES = [
  'restaurants near Boston College Chestnut Hill',
  'pizza Italian restaurants near Cleveland Circle Brighton MA',
  'Mexican tacos burritos restaurants near Boston College',
  'Chinese Japanese Asian restaurants near Brookline MA',
  'cafes coffee bakeries brunch near Newton Centre MA',
  'bars pubs seafood restaurants near Brighton MA',
  'Indian Thai Mediterranean restaurants near Chestnut Hill MA',
  'fast food sandwich deli near Boston College',
  'Korean Vietnamese ramen near Brookline Allston',
  'steakhouse BBQ American grill near Chestnut Hill Newton',
  'ice cream dessert sweets near Boston College',
  'Greek Middle Eastern food near Brighton Brookline',
];

interface TransformedRestaurant {
  name: string;
  slug: string;
  coverImage: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  googlePlaceId: string;
  cuisineTypes: string[];
  priceLevel: number | null;
  hours: Record<string, string> | null;
}

function extractComponent(components: any[], type: string): string | null {
  const comp = components?.find((c: any) => c.types?.includes(type));
  return comp?.longText || comp?.shortText || null;
}

function extractStreetAddress(components: any[], formatted: string): string {
  if (components && components.length > 0) {
    const number = extractComponent(components, 'street_number');
    const street = extractComponent(components, 'route');
    if (number && street) return `${number} ${street}`;
  }
  // Fallback: first part of formatted address
  return formatted?.split(',')[0]?.trim() || 'Address Unknown';
}

function parseHours(openingHours: any): Record<string, string> | null {
  if (!openingHours?.weekdayDescriptions) return null;
  const hours: Record<string, string> = {};
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  openingHours.weekdayDescriptions.forEach((desc: string, i: number) => {
    // Format: "Monday: 11:00 AM – 10:00 PM"
    const parts = desc.split(': ');
    const timeStr = parts.slice(1).join(': ') || 'Closed';
    if (i < days.length) {
      hours[days[i]] = timeStr;
    }
  });
  return hours;
}

async function main() {
  console.log('=== DishDrop Restaurant Fetcher ===\n');
  console.log(`Fetching restaurants near Boston College (${BC_LAT}, ${BC_LNG})...\n`);

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('ERROR: GOOGLE_PLACES_API_KEY is not set in .env');
    console.error('Please add your Google Places API key to api/.env');
    process.exit(1);
  }

  const seenPlaceIds = new Set<string>();
  const allRestaurants: TransformedRestaurant[] = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`Query: "${query}"`);
    try {
      const places = await fetchAllPages(query);
      let newCount = 0;

      for (const place of places) {
        const placeId = place.id;
        if (!placeId || seenPlaceIds.has(placeId)) continue;
        seenPlaceIds.add(placeId);

        const addressComponents = place.addressComponents || [];
        const city = extractComponent(addressComponents, 'locality')
          || extractComponent(addressComponents, 'sublocality')
          || 'Boston';
        const state = extractComponent(addressComponents, 'administrative_area_level_1') || 'MA';
        const zipCode = extractComponent(addressComponents, 'postal_code') || '02135';
        const streetAddress = extractStreetAddress(addressComponents, place.formattedAddress);

        const cuisineTypes = mapCuisineTypes(place.types || []);

        // Try to get a permanent photo URL from Google, fallback to Unsplash
        let coverImage: string;
        const photoName = place.photos?.[0]?.name;
        if (photoName) {
          const photoUrl = await fetchPhotoRedirectUrl(photoName);
          coverImage = photoUrl || getFallbackPhoto(cuisineTypes);
        } else {
          coverImage = getFallbackPhoto(cuisineTypes);
        }

        const restaurant: TransformedRestaurant = {
          name: place.displayName?.text || 'Unknown Restaurant',
          slug: generateSlug(place.displayName?.text || 'unknown'),
          coverImage,
          address: streetAddress,
          city,
          state,
          zipCode,
          latitude: place.location?.latitude || BC_LAT,
          longitude: place.location?.longitude || BC_LNG,
          phone: place.nationalPhoneNumber || null,
          website: place.websiteUri || null,
          googlePlaceId: placeId,
          cuisineTypes,
          priceLevel: mapPriceLevel(place.priceLevel),
          hours: parseHours(place.currentOpeningHours),
        };

        allRestaurants.push(restaurant);
        newCount++;
      }

      console.log(`  Found ${places.length} results, ${newCount} new unique restaurants`);
    } catch (err: any) {
      console.error(`  ERROR for query "${query}": ${err.message}`);
    }

    // Rate limiting between queries
    await new Promise(r => setTimeout(r, 1500));

    // Stop if we have enough
    if (allRestaurants.length >= 250) {
      console.log(`\nReached ${allRestaurants.length} restaurants, stopping early.`);
      break;
    }
  }

  // Ensure slug uniqueness
  deduplicateSlugs(allRestaurants);

  console.log(`\n=== Total unique restaurants fetched: ${allRestaurants.length} ===\n`);

  // Save to JSON
  const outputDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'restaurants-raw.json');
  fs.writeFileSync(outputPath, JSON.stringify(allRestaurants, null, 2));
  console.log(`Saved to ${outputPath}`);

  // Print cuisine distribution
  const cuisineCounts: Record<string, number> = {};
  for (const r of allRestaurants) {
    for (const c of r.cuisineTypes) {
      cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
    }
  }
  console.log('\nCuisine distribution:');
  Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cuisine, count]) => {
      console.log(`  ${cuisine}: ${count}`);
    });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
