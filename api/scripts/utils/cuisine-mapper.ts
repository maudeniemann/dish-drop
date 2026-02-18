// Maps Google Places types to DishDrop cuisine types
const TYPE_TO_CUISINE: Record<string, string> = {
  // Specific restaurant types
  italian_restaurant: 'Italian',
  mexican_restaurant: 'Mexican',
  chinese_restaurant: 'Chinese',
  japanese_restaurant: 'Japanese',
  indian_restaurant: 'Indian',
  thai_restaurant: 'Thai',
  vietnamese_restaurant: 'Vietnamese',
  korean_restaurant: 'Korean',
  mediterranean_restaurant: 'Mediterranean',
  french_restaurant: 'French',
  greek_restaurant: 'Greek',
  american_restaurant: 'American',
  seafood_restaurant: 'Seafood',
  pizza_restaurant: 'Pizza',
  hamburger_restaurant: 'Burgers',
  sushi_restaurant: 'Sushi',
  ramen_restaurant: 'Ramen',
  barbecue_restaurant: 'BBQ',
  brunch_restaurant: 'Brunch',
  middle_eastern_restaurant: 'Middle Eastern',
  turkish_restaurant: 'Turkish',
  lebanese_restaurant: 'Lebanese',
  spanish_restaurant: 'Spanish',
  brazilian_restaurant: 'Brazilian',
  peruvian_restaurant: 'Latin American',
  // General types
  bar: 'Bar Food',
  wine_bar: 'Wine Bar',
  cafe: 'Coffee & Cafe',
  coffee_shop: 'Coffee & Cafe',
  bakery: 'Bakery',
  ice_cream_shop: 'Dessert',
  sandwich_shop: 'Sandwiches',
  steak_house: 'Steakhouse',
  vegan_restaurant: 'Vegan',
  vegetarian_restaurant: 'Vegetarian',
  fast_food_restaurant: 'Fast Food',
  meal_delivery: 'Delivery',
  meal_takeaway: 'Takeout',
};

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 1,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

export function mapCuisineTypes(types: string[]): string[] {
  const cuisines = types
    .map(t => TYPE_TO_CUISINE[t])
    .filter(Boolean);
  const unique = [...new Set(cuisines)];
  return unique.length > 0 ? unique.slice(0, 3) : ['American'];
}

export function mapPriceLevel(priceLevel?: string): number | null {
  if (!priceLevel) return null;
  return PRICE_LEVEL_MAP[priceLevel] || null;
}

// Unsplash fallback photos organized by cuisine type
export const CUISINE_PHOTO_MAP: Record<string, string[]> = {
  Italian: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
  ],
  Mexican: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800',
  ],
  Chinese: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
  ],
  Japanese: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800',
  ],
  Indian: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800',
  ],
  Thai: [
    'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800',
    'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
    'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800',
  ],
  Korean: [
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=800',
  ],
  Vietnamese: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
    'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800',
  ],
  Mediterranean: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
  ],
  French: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=800',
  ],
  Seafood: [
    'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=800',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
    'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800',
  ],
  Pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  ],
  Burgers: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
  ],
  Sushi: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
  ],
  BBQ: [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  ],
  'Bar Food': [
    'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800',
    'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800',
  ],
  'Wine Bar': [
    'https://images.unsplash.com/photo-1534938665420-4193effeacc4?w=800',
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
  ],
  'Coffee & Cafe': [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
  ],
  Bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800',
  ],
  Dessert: [
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
  ],
  Sandwiches: [
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=800',
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
  ],
  Steakhouse: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    'https://images.unsplash.com/photo-1558030006-450675393462?w=800',
  ],
  American: [
    'https://images.unsplash.com/photo-1568901346375-23c9450f58cd?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  ],
  Brunch: [
    'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
  ],
  'Fast Food': [
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800',
  ],
  Greek: [
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  ],
  Spanish: [
    'https://images.unsplash.com/photo-1534938665420-4193effeacc4?w=800',
    'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800',
  ],
  Ramen: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800',
  ],
  'Middle Eastern': [
    'https://images.unsplash.com/photo-1547050605-2f268cd5daf0?w=800',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
  ],
  Vegan: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    'https://images.unsplash.com/photo-1540914124281-342587941389?w=800',
  ],
  Vegetarian: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    'https://images.unsplash.com/photo-1540914124281-342587941389?w=800',
  ],
  default: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  ],
};

export function getFallbackPhoto(cuisineTypes: string[]): string {
  const primary = cuisineTypes[0] || 'default';
  const pool = CUISINE_PHOTO_MAP[primary] || CUISINE_PHOTO_MAP.default;
  return pool[Math.floor(Math.random() * pool.length)];
}
