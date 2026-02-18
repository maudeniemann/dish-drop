import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// MOCK USERS — BC students / locals
// ============================================

const MOCK_USERS = [
  { username: 'foodie_emma', name: 'Emma Chen', profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { username: 'boston_bites', name: 'Marcus Johnson', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { username: 'tasteexplorer', name: 'Sofia Rodriguez', profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  { username: 'chef_mike', name: 'Mike Patterson', profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { username: 'bc_eats', name: 'Alex Kim', profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
  { username: 'newton_native', name: 'Jordan Lee', profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { username: 'chestnut_chomper', name: 'Taylor Morgan', profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  { username: 'newton_nomad', name: 'Chris Evans', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { username: 'brookline_babe', name: 'Priya Patel', profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { username: 'eagle_eater', name: 'James O\'Brien', profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { username: 'culinary_queen', name: 'Maya Thompson', profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150' },
  { username: 'noodle_ninja', name: 'David Wang', profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150' },
  { username: 'brunch_boss', name: 'Olivia Martinez', profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150' },
  { username: 'pizza_prince', name: 'Ryan Kelly', profileImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150' },
  { username: 'sushi_sensei', name: 'Yuki Tanaka', profileImage: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150' },
  { username: 'spice_lover', name: 'Aisha Mohammed', profileImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150' },
  { username: 'dessert_diva', name: 'Lily Zhang', profileImage: 'https://images.unsplash.com/photo-1502767089025-6572583d8c40?w=150' },
  { username: 'burger_baron', name: 'Nick Russo', profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { username: 'taco_tuesday', name: 'Carmen Diaz', profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150' },
  { username: 'coffee_connoisseur', name: 'Ben Marshall', profileImage: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150' },
];

// ============================================
// DISH NAMES BY CUISINE TYPE
// ============================================

const DISH_NAMES: Record<string, string[]> = {
  Italian: ['Margherita Pizza', 'Chicken Parmesan', 'Penne Vodka', 'Tiramisu', 'Lasagna', 'Fettuccine Alfredo', 'Bruschetta', 'Risotto', 'Ravioli', 'Caprese Salad'],
  Mexican: ['Fish Tacos', 'Carnitas Burrito', 'Chicken Quesadilla', 'Churros', 'Guacamole & Chips', 'Steak Tacos', 'Enchiladas', 'Elote', 'Nachos Supreme', 'Al Pastor Bowl'],
  Chinese: ['Mapo Tofu', 'Dan Dan Noodles', 'Kung Pao Chicken', 'Peking Duck', 'Hot & Sour Soup', 'General Tso Chicken', 'Scallion Pancakes', 'Dumplings', 'Fried Rice', 'Sesame Chicken'],
  Japanese: ['Salmon Sashimi', 'Tonkotsu Ramen', 'Dragon Roll', 'Chicken Katsu', 'Miso Soup', 'Gyoza', 'Tempura Udon', 'Spicy Tuna Roll', 'Teriyaki Salmon', 'Edamame'],
  Indian: ['Butter Chicken', 'Tikka Masala', 'Garlic Naan', 'Samosa', 'Biryani', 'Palak Paneer', 'Tandoori Chicken', 'Mango Lassi', 'Chicken Korma', 'Dal Makhani'],
  Thai: ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice', 'Thai Iced Tea', 'Massaman Curry', 'Papaya Salad', 'Basil Fried Rice', 'Satay Skewers', 'Tom Kha Gai'],
  Korean: ['Bibimbap', 'Korean Fried Chicken', 'Kimchi Jjigae', 'Bulgogi', 'Japchae', 'Tteokbokki', 'Korean BBQ Platter', 'Kimchi Fried Rice', 'Mandoo', 'Galbi'],
  Vietnamese: ['Pho Bo', 'Banh Mi', 'Spring Rolls', 'Bun Bo Hue', 'Vietnamese Coffee', 'Vermicelli Bowl', 'Lemongrass Chicken', 'Pho Ga', 'Crispy Egg Rolls', 'Bun Cha'],
  Mediterranean: ['Falafel Plate', 'Hummus & Pita', 'Shawarma Wrap', 'Greek Salad', 'Lamb Kebab', 'Tabbouleh', 'Baba Ganoush', 'Stuffed Grape Leaves', 'Mediterranean Bowl', 'Gyro Platter'],
  French: ['Croque Monsieur', 'French Onion Soup', 'Crème Brûlée', 'Coq au Vin', 'Quiche Lorraine', 'Beef Bourguignon', 'Croissant', 'Escargot', 'Duck Confit', 'Ratatouille'],
  Seafood: ['Lobster Roll', 'New England Clam Chowder', 'Fish & Chips', 'Grilled Salmon', 'Shrimp Scampi', 'Oysters on the Half Shell', 'Crab Cakes', 'Fried Calamari', 'Seared Tuna', 'Seafood Pasta'],
  Pizza: ['Pepperoni Pizza', 'Margherita Pizza', 'Buffalo Chicken Pizza', 'Hawaiian Pizza', 'Sicilian Slice', 'White Pizza', 'Meat Lovers Pizza', 'Veggie Pizza', 'BBQ Chicken Pizza', 'Supreme Pizza'],
  Burgers: ['Classic Cheeseburger', 'Bacon Burger', 'Mushroom Swiss Burger', 'BBQ Burger', 'Veggie Burger', 'Double Stack', 'Turkey Burger', 'Smash Burger', 'Blue Cheese Burger', 'Truffle Burger'],
  Sushi: ['Rainbow Roll', 'Spicy Tuna Roll', 'Dragon Roll', 'California Roll', 'Salmon Nigiri', 'Philadelphia Roll', 'Volcano Roll', 'Eel Avocado Roll', 'Chirashi Bowl', 'Sashimi Platter'],
  BBQ: ['Pulled Pork Sandwich', 'Brisket Plate', 'BBQ Ribs', 'Smoked Wings', 'Mac & Cheese', 'Cornbread', 'Burnt Ends', 'Smoked Turkey', 'Coleslaw', 'Baked Beans'],
  'Bar Food': ['Loaded Nachos', 'Buffalo Wings', 'Mozzarella Sticks', 'Sliders', 'Onion Rings', 'Fried Pickles', 'Chicken Tenders', 'Quesadilla', 'Potato Skins', 'Beer Battered Fries'],
  'Wine Bar': ['Patatas Bravas', 'Charcuterie Board', 'Bruschetta', 'Cheese Board', 'Truffle Fries', 'Crostini', 'Olives & Almonds', 'Grilled Octopus', 'Stuffed Dates', 'Flatbread'],
  'Coffee & Cafe': ['Latte', 'Cappuccino', 'Avocado Toast', 'Iced Coffee', 'Croissant', 'Matcha Latte', 'Cold Brew', 'Blueberry Muffin', 'Espresso', 'Chai Tea Latte'],
  Bakery: ['Chocolate Croissant', 'Sourdough Bread', 'Cinnamon Roll', 'Almond Croissant', 'Baguette', 'Scone', 'Danish', 'Banana Bread', 'Focaccia', 'Brioche'],
  Dessert: ['Oreo Milkshake', 'Chocolate Lava Cake', 'Ice Cream Sundae', 'Cheesecake', 'Brownie', 'Cookie Dough Ice Cream', 'Churros', 'Creme Brulee', 'Cannoli', 'Tiramisu'],
  Sandwiches: ['Italian Sub', 'Turkey Club', 'BLT', 'Grilled Cheese', 'Philly Cheesesteak', 'Reuben', 'Chicken Pesto', 'Cubano', 'Veggie Wrap', 'Meatball Sub'],
  Steakhouse: ['Ribeye Steak', 'Filet Mignon', 'New York Strip', 'Surf & Turf', 'Bone-in Ribeye', 'Steak Tips', 'Porterhouse', 'Prime Rib', 'Wagyu Burger', 'Caesar Salad'],
  American: ['Classic Burger', 'Mac & Cheese', 'Buffalo Wings', 'Grilled Chicken Sandwich', 'Caesar Salad', 'BBQ Ribs', 'Fish & Chips', 'Club Sandwich', 'Loaded Fries', 'Chicken Caesar Wrap'],
  Brunch: ['Eggs Benedict', 'Avocado Toast', 'French Toast', 'Pancake Stack', 'Shakshuka', 'Breakfast Burrito', 'Acai Bowl', 'Smoked Salmon Bagel', 'Omelette', 'Belgian Waffle'],
  'Fast Food': ['Double Cheeseburger', 'Chicken Nuggets', 'French Fries', 'Milkshake', 'Fried Chicken Sandwich', 'Hot Dog', 'Onion Rings', 'Wrap Combo', 'Taco Combo', 'Fish Sandwich'],
  Greek: ['Gyro Platter', 'Moussaka', 'Spanakopita', 'Greek Salad', 'Souvlaki', 'Baklava', 'Lamb Chops', 'Tzatziki & Pita', 'Dolmades', 'Pastitsio'],
  Spanish: ['Patatas Bravas', 'Paella', 'Gambas al Ajillo', 'Churros con Chocolate', 'Croquetas', 'Jamon Iberico', 'Tortilla Española', 'Gazpacho', 'Pimientos de Padron', 'Sangria'],
  Ramen: ['Tonkotsu Ramen', 'Shoyu Ramen', 'Miso Ramen', 'Spicy Miso Ramen', 'Tsukemen', 'Vegetable Ramen', 'Tan Tan Ramen', 'Black Garlic Ramen'],
  'Middle Eastern': ['Falafel Wrap', 'Chicken Shawarma', 'Hummus Plate', 'Lamb Kebab', 'Tabouleh', 'Lahmacun', 'Baklava', 'Fattoush Salad', 'Kibbeh', 'Baba Ganoush'],
  Vegan: ['Buddha Bowl', 'Vegan Burger', 'Cauliflower Tacos', 'Acai Bowl', 'Avocado Toast', 'Falafel Wrap', 'Vegan Ramen', 'Jackfruit Sandwich'],
  Vegetarian: ['Margherita Pizza', 'Veggie Burger', 'Falafel Plate', 'Caprese Salad', 'Eggplant Parmesan', 'Mushroom Risotto', 'Paneer Tikka', 'Veggie Stir Fry'],
  'Latin American': ['Empanadas', 'Arepas', 'Ceviche', 'Pupusas', 'Plantain Bowl', 'Churrasco', 'Tamales', 'Tostones'],
  Lebanese: ['Chicken Shawarma', 'Fattoush', 'Manakeesh', 'Kibbeh', 'Tabbouleh', 'Hummus', 'Lamb Kofta', 'Baba Ganoush'],
  Turkish: ['Doner Kebab', 'Lahmacun', 'Pide', 'Iskender Kebab', 'Turkish Delight', 'Manti', 'Adana Kebab', 'Baklava'],
};

// ============================================
// FOOD PHOTO URLs BY CUISINE
// ============================================

const FOOD_PHOTOS: Record<string, string[]> = {
  Italian: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  ],
  Mexican: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800',
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
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
  ],
  Korean: [
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=800',
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
    'https://images.unsplash.com/photo-1568901346375-23c9450f58cd?w=800',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
  ],
  Sushi: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
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
  ],
  BBQ: [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
  ],
  American: [
    'https://images.unsplash.com/photo-1568901346375-23c9450f58cd?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  ],
  Brunch: [
    'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
  ],
  Mediterranean: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800',
  ],
  French: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=800',
  ],
  default: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  ],
};

// ============================================
// CAPTION TEMPLATES
// ============================================

const CAPTION_TEMPLATES = [
  'Absolutely incredible {dish}. Will be back tomorrow!',
  'Best {dish} near BC, hands down.',
  'This place never disappoints. The {dish} is perfection.',
  'BC students NEED to try this place.',
  'Late night study break turned into a full meal. No regrets.',
  'Found my new go-to spot. This {dish} hits different.',
  'Walked here from campus and it was so worth it.',
  'Date night done right. The {dish} was amazing.',
  'This might be the best thing I\'ve eaten all semester.',
  'Can\'t believe I waited this long to try this place.',
  'Brought the whole friend group here. Everyone loved it.',
  'The {dish} here is seriously underrated.',
  'Perfect for a quick bite between classes.',
  'Finals week comfort food at its finest.',
  'If you\'re near campus, you have to stop here.',
  'This {dish} just made my entire week.',
  'Wow. Just wow. The flavors are incredible.',
  'Third time this week... I might have a problem.',
  'My go-to order: {dish}. Never fails.',
  'Trying something new and I\'m not disappointed.',
  'This place has the best vibes. And the food matches.',
  'Rainy day comfort food. The {dish} was perfect.',
  'Study group lunch spot. 10/10 would recommend.',
  'Every time I come here, I order the {dish}. It\'s that good.',
  'Weekend brunch goals right here.',
  'The portion size is insane. Brought leftovers for tomorrow.',
  'Heard about this from a friend and wow, they weren\'t lying.',
  'Newton Centre has some hidden gems. This is one of them.',
  'Cleveland Circle standby. Always delivers.',
  'The {dish} here rivals anything in downtown Boston.',
];

const DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'spicy', 'dairy-free', 'nut-free'];

// Teen-style comment templates
const COMMENT_TEMPLATES = [
  'omg this looks SO good 😍',
  'wait i need to try this asap',
  'no way!! where is this?',
  'bruh the presentation >>',
  'literally drooling rn',
  'adding this to my list fr',
  'why does this look better than anything ive ever eaten',
  'ok but did it taste as good as it looks??',
  'im obsessed w this place',
  'youre making me so hungry stop',
  'this is giving me life',
  'wait ive been there!! so good',
  'i need this in my life rn',
  'the vibes look immaculate',
  'ok when are we going together',
  'this just made my day',
  'screaming i love this place',
  'no bc this looks incredible',
  'stop im literally gonna go rn',
  'best spot near campus no cap',
  'im gonna dream about this tonight',
  'ok youre convincing me to go',
  'how have i never been here wtf',
  'this is everything',
  'literally my favorite place',
  'obsessed w everything about this',
  'the {dish} there hits different',
  'ive been saying!! this place is elite',
  'putting this on my bc bucket list',
  'ok but the portion sizes there are huge',
  'we NEED to go here together soon',
  'your food pics are always immaculate',
  'drop the review!! how was it',
  'lowkey wanna go rn',
  'this looks fire ngl',
  'wait is this the place on comm ave?',
  'obsessed. going this weekend',
  'i pass this every day omg',
  'youre single handedly keeping this place in business lol',
  'the {dish} here is unmatched fr',
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const offset = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

function randomDietaryTags(): string[] {
  const tags: string[] = [];
  if (Math.random() < 0.15) tags.push('vegetarian');
  if (Math.random() < 0.05) tags.push('vegan');
  if (Math.random() < 0.1) tags.push('gluten-free');
  if (Math.random() < 0.1) tags.push('spicy');
  return tags;
}

function generateCaption(dishName: string): string {
  const template = pickRandom(CAPTION_TEMPLATES);
  return template.replace(/{dish}/g, dishName);
}

function getPhotoForCuisine(cuisine: string): string {
  const pool = FOOD_PHOTOS[cuisine] || FOOD_PHOTOS.default;
  return pickRandom(pool);
}

function getDishForCuisine(cuisine: string): string {
  const dishes = DISH_NAMES[cuisine] || DISH_NAMES.American;
  return pickRandom(dishes);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('=== DishDrop Content Generator ===\n');

  // 1. Create mock users
  console.log('Creating 20 mock users...');
  const passwordHash = await bcrypt.hash('testpassword123', 10);
  const users: { id: string }[] = [];

  for (const u of MOCK_USERS) {
    const email = `${u.username}@dishdrop.test`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        username: u.username,
        name: u.name,
        profileImage: u.profileImage,
      },
      create: {
        email,
        passwordHash,
        username: u.username,
        name: u.name,
        profileImage: u.profileImage,
        latitude: 42.3355 + (Math.random() - 0.5) * 0.02,
        longitude: -71.1685 + (Math.random() - 0.5) * 0.02,
        city: pickRandom(['Chestnut Hill', 'Brighton', 'Newton', 'Brookline']),
        mealsDonated: Math.floor(Math.random() * 300) + 10,
        mealStreak: Math.floor(Math.random() * 30) + 1,
        mealsBalance: Math.floor(Math.random() * 20),
        postCount: 0,
      },
    });
    users.push(user);
  }
  console.log(`  Created/updated ${users.length} users`);

  // 2. Get all restaurants
  const restaurants = await prisma.restaurant.findMany();
  console.log(`\nFound ${restaurants.length} restaurants in database`);

  if (restaurants.length === 0) {
    console.error('ERROR: No restaurants found. Run seed-restaurants first.');
    process.exit(1);
  }

  // 3. Create posts for each restaurant (2-4 per restaurant)
  console.log('\nGenerating posts...');
  let totalPosts = 0;
  let totalMeals = 0;

  for (const restaurant of restaurants) {
    const postCount = 2 + Math.floor(Math.random() * 3); // 2-4 posts
    const primaryCuisine = restaurant.cuisineTypes[0] || 'American';

    for (let i = 0; i < postCount; i++) {
      const user = pickRandom(users);
      const dishName = getDishForCuisine(primaryCuisine);
      const rating = 6 + Math.floor(Math.random() * 5); // 6-10
      const donationMade = Math.random() > 0.45;
      const mealsDonated = donationMade ? Math.floor(Math.random() * 3) + 1 : 0;

      try {
        await prisma.post.create({
          data: {
            userId: user.id,
            dishName,
            imageUrl: getPhotoForCuisine(primaryCuisine),
            rating,
            restaurantId: restaurant.id,
            caption: generateCaption(dishName),
            price: 5 + Math.floor(Math.random() * 35),
            cuisineType: primaryCuisine,
            dietaryTags: randomDietaryTags(),
            donationMade,
            mealsDonated,
            likeCount: 20 + Math.floor(Math.random() * 81), // 20-100
            commentCount: 0, // Will be updated after creating comments
            saveCount: Math.floor(Math.random() * 200),
            viewCount: Math.floor(Math.random() * 1500) + 50,
            createdAt: randomDate(90),
          },
        });
        totalPosts++;
        totalMeals += mealsDonated;
      } catch (err: any) {
        // Skip duplicate errors silently
      }
    }

    if (totalPosts % 50 === 0 && totalPosts > 0) {
      console.log(`  Generated ${totalPosts} posts so far...`);
    }
  }

  console.log(`  Total posts created: ${totalPosts}`);
  console.log(`  Total meals donated: ${totalMeals}`);

  // 4. Update restaurant aggregate stats
  console.log('\nUpdating restaurant aggregate stats...');
  for (const restaurant of restaurants) {
    const stats = await prisma.post.aggregate({
      where: { restaurantId: restaurant.id },
      _avg: { rating: true },
      _count: true,
      _sum: { mealsDonated: true },
    });

    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        postCount: stats._count,
        averageRating: Math.round((stats._avg.rating || 0) * 10) / 10,
        mealsDonated: stats._sum.mealsDonated || 0,
      },
    });
  }

  // 5. Update user post counts
  console.log('Updating user post counts...');
  for (const user of users) {
    const postCount = await prisma.post.count({ where: { userId: user.id } });
    const mealSum = await prisma.post.aggregate({
      where: { userId: user.id },
      _sum: { mealsDonated: true },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        postCount,
        mealsDonated: mealSum._sum.mealsDonated || 0,
      },
    });
  }

  // 6. Create some follow relationships
  console.log('Creating follow relationships...');
  let followCount = 0;
  for (const user of users) {
    // Each user follows 5-10 random other users
    const numFollows = 5 + Math.floor(Math.random() * 6);
    const others = users.filter(u => u.id !== user.id);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, numFollows);

    for (const other of shuffled) {
      try {
        await prisma.follow.create({
          data: { followerId: user.id, followingId: other.id },
        });
        followCount++;
      } catch {
        // Ignore duplicate follows
      }
    }
  }
  console.log(`  Created ${followCount} follow relationships`);

  // 7. Create comments for posts
  console.log('\nCreating comments for posts...');
  const allPosts = await prisma.post.findMany({ select: { id: true, dishName: true } });

  // Build all comments first, then batch insert
  const commentsToCreate: Array<{ postId: string; userId: string; content: string; createdAt: Date }> = [];
  const postCommentCounts: Record<string, number> = {};

  for (const post of allPosts) {
    // Each post gets 2-5 comments
    const numComments = 2 + Math.floor(Math.random() * 4);
    postCommentCounts[post.id] = numComments;

    for (let i = 0; i < numComments; i++) {
      const commenter = pickRandom(users);
      let commentText = pickRandom(COMMENT_TEMPLATES);
      // Replace {dish} placeholder if present
      commentText = commentText.replace(/{dish}/g, post.dishName);

      commentsToCreate.push({
        postId: post.id,
        userId: commenter.id,
        content: commentText,
        createdAt: randomDate(90),
      });
    }
  }

  // Batch insert all comments (much faster!)
  console.log(`  Inserting ${commentsToCreate.length} comments in batches...`);
  const batchSize = 500;
  for (let i = 0; i < commentsToCreate.length; i += batchSize) {
    const batch = commentsToCreate.slice(i, i + batchSize);
    await prisma.comment.createMany({ data: batch, skipDuplicates: true });
    console.log(`    Inserted ${Math.min(i + batchSize, commentsToCreate.length)} / ${commentsToCreate.length}`);
  }

  // Update post comment counts in batch using raw SQL (much faster!)
  console.log('Updating post comment counts...');
  const updatePromises = Object.entries(postCommentCounts).map(([postId, count]) =>
    prisma.post.update({
      where: { id: postId },
      data: { commentCount: count },
    })
  );
  await Promise.all(updatePromises);
  console.log(`  Created ${commentsToCreate.length} comments`);

  console.log('\n=== Content generation complete! ===');
  console.log(`  Users: ${users.length}`);
  console.log(`  Restaurants: ${restaurants.length}`);
  console.log(`  Posts: ${totalPosts}`);
  console.log(`  Comments: ${totalComments}`);
  console.log(`  Follow relationships: ${followCount}`);
}

main()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
