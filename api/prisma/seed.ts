import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// High-quality food images from Unsplash
const foodImages = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
  tacos: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
  pasta: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
  steak: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
  iceCream: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
  wings: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800',
  curry: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800',
  pho: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800',
  dimsum: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
  burrito: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
  poke: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  acaiBowl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
};

// Profile images - diverse group of people
const profileImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
];

// Restaurant cover images
const restaurantCovers = {
  fastFood: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200',
  fineDining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
  casual: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
  cafe: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1200',
  asian: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=1200',
  italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
  mexican: 'https://images.unsplash.com/photo-1653505792562-ee7f36e66c13?w=1200',
  bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200',
};

// Charity logos
const charityLogos = {
  feedingAmerica: 'https://www.feedingamerica.org/themes/flavor/images/logo.svg',
  noKidHungry: 'https://www.nokidhungry.org/sites/all/themes/flavor/logo.png',
  mealsonWheels: 'https://www.mealsonwheelsamerica.org/images/national/mowa-logo-2.png',
};

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.flashSponsorshipDrop.deleteMany();
  await prisma.flashSponsorship.deleteMany();
  await prisma.userCoupon.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.collectionItem.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.save.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.team.deleteMany();
  await prisma.category.deleteMany();
  await prisma.globalStats.deleteMany();

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Burgers', slug: 'burgers', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Pizza', slug: 'pizza', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Sushi', slug: 'sushi', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Mexican', slug: 'mexican', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Italian', slug: 'italian', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Chinese', slug: 'chinese', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Thai', slug: 'thai', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Indian', slug: 'indian', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Breakfast', slug: 'breakfast', sortOrder: 9 } }),
    prisma.category.create({ data: { name: 'Desserts', slug: 'desserts', sortOrder: 10 } }),
    prisma.category.create({ data: { name: 'Healthy', slug: 'healthy', sortOrder: 11 } }),
    prisma.category.create({ data: { name: 'Fast Food', slug: 'fast-food', sortOrder: 12 } }),
  ]);

  // ============================================
  // TEAMS
  // ============================================
  console.log('👥 Creating teams...');
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Boston College',
        slug: 'boston-college',
        type: 'university',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Boston_College_Eagles_logo.svg/800px-Boston_College_Eagles_logo.svg.png',
        city: 'Chestnut Hill',
        state: 'MA',
        currentGoal: 10000,
        memberCount: 0,
        totalMeals: 0,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Harvard University',
        slug: 'harvard',
        type: 'university',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/800px-Harvard_University_coat_of_arms.svg.png',
        city: 'Cambridge',
        state: 'MA',
        currentGoal: 15000,
        memberCount: 0,
        totalMeals: 0,
      },
    }),
    prisma.team.create({
      data: {
        name: 'MIT',
        slug: 'mit',
        type: 'university',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/800px-MIT_logo.svg.png',
        city: 'Cambridge',
        state: 'MA',
        currentGoal: 12000,
        memberCount: 0,
        totalMeals: 0,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Boston Foodies',
        slug: 'boston-foodies',
        type: 'city',
        city: 'Boston',
        state: 'MA',
        currentGoal: 25000,
        memberCount: 0,
        totalMeals: 0,
      },
    }),
  ]);

  // ============================================
  // RESTAURANTS - Comprehensive List
  // ============================================
  console.log('🍽️ Creating restaurants...');

  // Boston area restaurants with real reservation links
  const restaurants = await Promise.all([
    // Fast Food Chains
    prisma.restaurant.create({
      data: {
        name: "Shake Shack",
        slug: "shake-shack-boston",
        coverImage: restaurantCovers.fastFood,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Shake_Shack_Logo.svg/1200px-Shake_Shack_Logo.svg.png',
        address: "234 Newbury St",
        city: "Boston",
        state: "MA",
        zipCode: "02116",
        latitude: 42.3501,
        longitude: -71.0789,
        phone: "(617) 936-3470",
        website: "https://shakeshack.com",
        orderUrl: "https://order.shakeshack.com",
        cuisineTypes: ["American", "Burgers", "Fast Casual"],
        priceLevel: 2,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Chipotle Mexican Grill",
        slug: "chipotle-newbury",
        coverImage: restaurantCovers.mexican,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Chipotle_Mexican_Grill_logo.svg/1200px-Chipotle_Mexican_Grill_logo.svg.png',
        address: "143 Newbury St",
        city: "Boston",
        state: "MA",
        zipCode: "02116",
        latitude: 42.3512,
        longitude: -71.0765,
        phone: "(617) 262-6220",
        website: "https://chipotle.com",
        orderUrl: "https://chipotle.com/order",
        cuisineTypes: ["Mexican", "Fast Casual"],
        priceLevel: 1,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "sweetgreen",
        slug: "sweetgreen-boston",
        coverImage: restaurantCovers.casual,
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sweetgreen_logo.svg/1200px-Sweetgreen_logo.svg.png',
        address: "699 Boylston St",
        city: "Boston",
        state: "MA",
        zipCode: "02116",
        latitude: 42.3489,
        longitude: -71.0823,
        phone: "(617) 936-3500",
        website: "https://sweetgreen.com",
        orderUrl: "https://order.sweetgreen.com",
        cuisineTypes: ["Healthy", "Salads", "Fast Casual"],
        priceLevel: 2,
        postCount: 0,
        averageRating: 0,
      },
    }),

    // Fine Dining
    prisma.restaurant.create({
      data: {
        name: "Mamma Maria",
        slug: "mamma-maria",
        coverImage: restaurantCovers.italian,
        address: "3 North Square",
        city: "Boston",
        state: "MA",
        zipCode: "02113",
        latitude: 42.3637,
        longitude: -71.0539,
        phone: "(617) 523-0077",
        website: "https://mammamaria.com",
        reservationUrl: "https://www.opentable.com/mamma-maria",
        cuisineTypes: ["Italian", "Fine Dining"],
        priceLevel: 4,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "O Ya",
        slug: "o-ya-boston",
        coverImage: restaurantCovers.asian,
        address: "9 East St",
        city: "Boston",
        state: "MA",
        zipCode: "02111",
        latitude: 42.3539,
        longitude: -71.0582,
        phone: "(617) 654-9900",
        website: "https://o-ya.restaurant",
        reservationUrl: "https://resy.com/cities/bos/o-ya",
        cuisineTypes: ["Japanese", "Sushi", "Fine Dining"],
        priceLevel: 4,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "No. 9 Park",
        slug: "no-9-park",
        coverImage: restaurantCovers.fineDining,
        address: "9 Park St",
        city: "Boston",
        state: "MA",
        zipCode: "02108",
        latitude: 42.3574,
        longitude: -71.0619,
        phone: "(617) 742-9991",
        website: "https://no9park.com",
        reservationUrl: "https://www.opentable.com/no-9-park",
        cuisineTypes: ["French", "Italian", "Fine Dining"],
        priceLevel: 4,
        postCount: 0,
        averageRating: 0,
      },
    }),

    // Casual Dining
    prisma.restaurant.create({
      data: {
        name: "Neptune Oyster",
        slug: "neptune-oyster",
        coverImage: restaurantCovers.casual,
        address: "63 Salem St",
        city: "Boston",
        state: "MA",
        zipCode: "02113",
        latitude: 42.3641,
        longitude: -71.0559,
        phone: "(617) 742-3474",
        website: "https://neptuneoyster.com",
        cuisineTypes: ["Seafood", "American"],
        priceLevel: 3,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Mike's Pastry",
        slug: "mikes-pastry",
        coverImage: restaurantCovers.cafe,
        logoUrl: 'https://mikespastry.com/wp-content/uploads/2020/09/mikes-logo-1.png',
        address: "300 Hanover St",
        city: "Boston",
        state: "MA",
        zipCode: "02113",
        latitude: 42.3644,
        longitude: -71.0531,
        phone: "(617) 742-3050",
        website: "https://mikespastry.com",
        orderUrl: "https://mikespastry.com/order-online",
        cuisineTypes: ["Italian", "Bakery", "Desserts"],
        priceLevel: 1,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Tatte Bakery & Cafe",
        slug: "tatte-harvard-square",
        coverImage: restaurantCovers.cafe,
        address: "1352 Massachusetts Ave",
        city: "Cambridge",
        state: "MA",
        zipCode: "02138",
        latitude: 42.3725,
        longitude: -71.1187,
        phone: "(617) 354-4200",
        website: "https://tattebakery.com",
        orderUrl: "https://order.tattebakery.com",
        cuisineTypes: ["Bakery", "Cafe", "Breakfast"],
        priceLevel: 2,
        postCount: 0,
        averageRating: 0,
      },
    }),

    // Ramen & Asian
    prisma.restaurant.create({
      data: {
        name: "Ganko Ittetsu Ramen",
        slug: "ganko-ittetsu",
        coverImage: restaurantCovers.asian,
        address: "318 Harvard St",
        city: "Brookline",
        state: "MA",
        zipCode: "02446",
        latitude: 42.3416,
        longitude: -71.1217,
        phone: "(617) 232-0888",
        website: "https://gankoittetsu.com",
        cuisineTypes: ["Japanese", "Ramen"],
        priceLevel: 2,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Dumpling Palace",
        slug: "dumpling-palace",
        coverImage: restaurantCovers.asian,
        address: "50 Beach St",
        city: "Boston",
        state: "MA",
        zipCode: "02111",
        latitude: 42.3516,
        longitude: -71.0605,
        phone: "(617) 338-8858",
        cuisineTypes: ["Chinese", "Dim Sum"],
        priceLevel: 1,
        postCount: 0,
        averageRating: 0,
      },
    }),

    // Pizza
    prisma.restaurant.create({
      data: {
        name: "Santarpio's Pizza",
        slug: "santarpios",
        coverImage: restaurantCovers.italian,
        address: "111 Chelsea St",
        city: "East Boston",
        state: "MA",
        zipCode: "02128",
        latitude: 42.3746,
        longitude: -71.0323,
        phone: "(617) 567-9871",
        cuisineTypes: ["Pizza", "Italian"],
        priceLevel: 1,
        postCount: 0,
        averageRating: 0,
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Regina Pizzeria",
        slug: "regina-pizzeria",
        coverImage: restaurantCovers.italian,
        logoUrl: 'https://www.reginapizzeria.com/images/regina-logo.png',
        address: "11½ Thacher St",
        city: "Boston",
        state: "MA",
        zipCode: "02113",
        latitude: 42.3656,
        longitude: -71.0571,
        phone: "(617) 227-0765",
        website: "https://reginapizzeria.com",
        orderUrl: "https://order.reginapizzeria.com",
        cuisineTypes: ["Pizza", "Italian"],
        priceLevel: 2,
        postCount: 0,
        averageRating: 0,
      },
    }),

    // Mexican
    prisma.restaurant.create({
      data: {
        name: "El Pelon Taqueria",
        slug: "el-pelon",
        coverImage: restaurantCovers.mexican,
        address: "92 Peterborough St",
        city: "Boston",
        state: "MA",
        zipCode: "02215",
        latitude: 42.3432,
        longitude: -71.0989,
        phone: "(617) 262-9090",
        website: "https://elpelon.com",
        cuisineTypes: ["Mexican", "Tacos"],
        priceLevel: 1,
        postCount: 0,
        averageRating: 0,
      },
    }),

    // Bars & Late Night
    prisma.restaurant.create({
      data: {
        name: "The Hawthorne",
        slug: "the-hawthorne",
        coverImage: restaurantCovers.bar,
        address: "500A Commonwealth Ave",
        city: "Boston",
        state: "MA",
        zipCode: "02215",
        latitude: 42.3492,
        longitude: -71.0954,
        phone: "(617) 532-9150",
        website: "https://thehawthornebar.com",
        reservationUrl: "https://resy.com/cities/bos/the-hawthorne",
        cuisineTypes: ["Cocktails", "Bar"],
        priceLevel: 3,
        postCount: 0,
        averageRating: 0,
      },
    }),
  ]);

  // ============================================
  // ACHIEVEMENTS
  // ============================================
  console.log('🏆 Creating achievements...');
  const achievements = await Promise.all([
    // Posting achievements
    prisma.achievement.create({
      data: { name: 'First Drop', slug: 'first-drop', description: 'Post your first dish', iconUrl: '🍽️', type: 'posts', threshold: 1, tier: 'bronze', sortOrder: 1 },
    }),
    prisma.achievement.create({
      data: { name: 'Regular', slug: 'regular', description: 'Post 10 dishes', iconUrl: '📸', type: 'posts', threshold: 10, tier: 'silver', sortOrder: 2 },
    }),
    prisma.achievement.create({
      data: { name: 'Food Blogger', slug: 'food-blogger', description: 'Post 50 dishes', iconUrl: '✨', type: 'posts', threshold: 50, tier: 'gold', sortOrder: 3 },
    }),
    prisma.achievement.create({
      data: { name: 'Influencer', slug: 'influencer', description: 'Post 100 dishes', iconUrl: '👑', type: 'posts', threshold: 100, tier: 'platinum', sortOrder: 4 },
    }),

    // Donation achievements
    prisma.achievement.create({
      data: { name: 'First Meal', slug: 'first-meal', description: 'Donate your first meal', iconUrl: '❤️', type: 'donations', threshold: 1, tier: 'bronze', sortOrder: 5 },
    }),
    prisma.achievement.create({
      data: { name: 'Generous', slug: 'generous', description: 'Donate 10 meals', iconUrl: '💕', type: 'donations', threshold: 10, tier: 'silver', sortOrder: 6 },
    }),
    prisma.achievement.create({
      data: { name: 'Philanthropist', slug: 'philanthropist', description: 'Donate 50 meals', iconUrl: '🌟', type: 'donations', threshold: 50, tier: 'gold', sortOrder: 7 },
    }),
    prisma.achievement.create({
      data: { name: 'Hero', slug: 'hero', description: 'Donate 100 meals', iconUrl: '🦸', type: 'donations', threshold: 100, tier: 'platinum', sortOrder: 8 },
    }),

    // Streak achievements
    prisma.achievement.create({
      data: { name: 'On Fire', slug: 'on-fire', description: '7 day posting streak', iconUrl: '🔥', type: 'streak', threshold: 7, tier: 'bronze', sortOrder: 9 },
    }),
    prisma.achievement.create({
      data: { name: 'Dedicated', slug: 'dedicated', description: '30 day posting streak', iconUrl: '💪', type: 'streak', threshold: 30, tier: 'silver', sortOrder: 10 },
    }),
    prisma.achievement.create({
      data: { name: 'Unstoppable', slug: 'unstoppable', description: '100 day posting streak', iconUrl: '⚡', type: 'streak', threshold: 100, tier: 'gold', sortOrder: 11 },
    }),

    // Social achievements
    prisma.achievement.create({
      data: { name: 'Social Butterfly', slug: 'social-butterfly', description: 'Get 100 followers', iconUrl: '🦋', type: 'social', threshold: 100, tier: 'silver', sortOrder: 12 },
    }),
    prisma.achievement.create({
      data: { name: 'Popular', slug: 'popular', description: 'Get 1000 followers', iconUrl: '⭐', type: 'social', threshold: 1000, tier: 'gold', sortOrder: 13 },
    }),

    // Exploration achievements
    prisma.achievement.create({
      data: { name: 'Explorer', slug: 'explorer', description: 'Visit 10 different restaurants', iconUrl: '🗺️', type: 'exploration', threshold: 10, tier: 'bronze', sortOrder: 14 },
    }),
    prisma.achievement.create({
      data: { name: 'Adventurer', slug: 'adventurer', description: 'Visit 50 different restaurants', iconUrl: '🧭', type: 'exploration', threshold: 50, tier: 'gold', sortOrder: 15 },
    }),

    // Coin achievements
    prisma.achievement.create({
      data: { name: 'Coin Collector', slug: 'coin-collector', description: 'Earn 100 coins', iconUrl: '🪙', type: 'coins', threshold: 100, tier: 'bronze', sortOrder: 16 },
    }),
    prisma.achievement.create({
      data: { name: 'Rich', slug: 'rich', description: 'Earn 1000 coins', iconUrl: '💰', type: 'coins', threshold: 1000, tier: 'gold', sortOrder: 17 },
    }),
  ]);

  // ============================================
  // USERS - Diverse mock users
  // ============================================
  console.log('👤 Creating users...');
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        passwordHash,
        username: 'emma_eats',
        name: 'Emma Thompson',
        bio: '🍕 Boston foodie | BC \'25 | Living for good eats & good vibes ✨',
        profileImage: profileImages[0],
        teamId: teams[0].id,
        latitude: 42.3505,
        longitude: -71.0770,
        city: 'Boston',
        mealsDonated: 47,
        postCount: 23,
        mealStreak: 12,
        coins: 230,
        totalCoins: 450,
      },
    }),
    prisma.user.create({
      data: {
        email: 'marcus@example.com',
        passwordHash,
        username: 'marcusmunchies',
        name: 'Marcus Chen',
        bio: 'Food photographer 📷 | Ramen enthusiast 🍜 | MIT grad student',
        profileImage: profileImages[1],
        teamId: teams[2].id,
        latitude: 42.3601,
        longitude: -71.0942,
        city: 'Cambridge',
        mealsDonated: 89,
        postCount: 67,
        mealStreak: 34,
        coins: 670,
        totalCoins: 890,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sofia@example.com',
        passwordHash,
        username: 'sofiasnacks',
        name: 'Sofia Rodriguez',
        bio: 'Tacos are my love language 🌮 | Harvard Med \'26',
        profileImage: profileImages[2],
        teamId: teams[1].id,
        latitude: 42.3770,
        longitude: -71.1167,
        city: 'Cambridge',
        mealsDonated: 156,
        postCount: 89,
        mealStreak: 45,
        coins: 890,
        totalCoins: 1200,
      },
    }),
    prisma.user.create({
      data: {
        email: 'james@example.com',
        passwordHash,
        username: 'jamesjams',
        name: 'James Williams',
        bio: 'Discovering hidden gems one bite at a time 🍔',
        profileImage: profileImages[3],
        teamId: teams[3].id,
        latitude: 42.3554,
        longitude: -71.0640,
        city: 'Boston',
        mealsDonated: 234,
        postCount: 145,
        mealStreak: 67,
        coins: 1450,
        totalCoins: 2100,
      },
    }),
    prisma.user.create({
      data: {
        email: 'olivia@example.com',
        passwordHash,
        username: 'oliviaomnoms',
        name: 'Olivia Park',
        bio: 'Sushi lover 🍣 | Brunch queen 👑 | BC \'24',
        profileImage: profileImages[4],
        teamId: teams[0].id,
        latitude: 42.3399,
        longitude: -71.1685,
        city: 'Chestnut Hill',
        mealsDonated: 78,
        postCount: 56,
        mealStreak: 28,
        coins: 560,
        totalCoins: 780,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alex@example.com',
        passwordHash,
        username: 'alexappetite',
        name: 'Alex Johnson',
        bio: 'Food is my therapy 🍕 | Always hungry',
        profileImage: profileImages[5],
        latitude: 42.3467,
        longitude: -71.0972,
        city: 'Boston',
        mealsDonated: 45,
        postCount: 34,
        mealStreak: 15,
        coins: 340,
        totalCoins: 450,
      },
    }),
    prisma.user.create({
      data: {
        email: 'maya@example.com',
        passwordHash,
        username: 'mayamunchies',
        name: 'Maya Patel',
        bio: 'Curry connoisseur 🍛 | Spreading foodie love',
        profileImage: profileImages[6],
        teamId: teams[1].id,
        latitude: 42.3751,
        longitude: -71.1056,
        city: 'Cambridge',
        mealsDonated: 112,
        postCount: 78,
        mealStreak: 42,
        coins: 780,
        totalCoins: 1120,
      },
    }),
    prisma.user.create({
      data: {
        email: 'noah@example.com',
        passwordHash,
        username: 'noahnibbles',
        name: 'Noah Kim',
        bio: 'Late night ramen runs 🍜 | MIT \'25',
        profileImage: profileImages[7],
        teamId: teams[2].id,
        latitude: 42.3598,
        longitude: -71.0921,
        city: 'Cambridge',
        mealsDonated: 67,
        postCount: 45,
        mealStreak: 21,
        coins: 450,
        totalCoins: 670,
      },
    }),
    prisma.user.create({
      data: {
        email: 'isabella@example.com',
        passwordHash,
        username: 'isabellaindulges',
        name: 'Isabella Rossi',
        bio: 'Pasta princess 🍝 | North End regular',
        profileImage: profileImages[8],
        latitude: 42.3631,
        longitude: -71.0545,
        city: 'Boston',
        mealsDonated: 189,
        postCount: 123,
        mealStreak: 56,
        coins: 1230,
        totalCoins: 1890,
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@example.com',
        passwordHash,
        username: 'daviddishes',
        name: 'David Martinez',
        bio: 'Taco Tuesday every day 🌮 | Food = happiness',
        profileImage: profileImages[9],
        teamId: teams[3].id,
        latitude: 42.3523,
        longitude: -71.0552,
        city: 'Boston',
        mealsDonated: 98,
        postCount: 67,
        mealStreak: 33,
        coins: 670,
        totalCoins: 980,
      },
    }),
  ]);

  // Update team member counts
  await prisma.team.update({ where: { id: teams[0].id }, data: { memberCount: 2, totalMeals: 125 } });
  await prisma.team.update({ where: { id: teams[1].id }, data: { memberCount: 2, totalMeals: 268 } });
  await prisma.team.update({ where: { id: teams[2].id }, data: { memberCount: 2, totalMeals: 156 } });
  await prisma.team.update({ where: { id: teams[3].id }, data: { memberCount: 2, totalMeals: 332 } });

  // ============================================
  // FOLLOWS - Create social connections
  // ============================================
  console.log('🤝 Creating follows...');
  const followPairs = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 0], [1, 2], [1, 5], [1, 6],
    [2, 0], [2, 1], [2, 3], [2, 7],
    [3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 8],
    [4, 0], [4, 2], [4, 6],
    [5, 1], [5, 3], [5, 7],
    [6, 1], [6, 2], [6, 8],
    [7, 0], [7, 1], [7, 3],
    [8, 3], [8, 4], [8, 9],
    [9, 3], [9, 5], [9, 8],
  ];

  await Promise.all(
    followPairs.map(([follower, following]) =>
      prisma.follow.create({
        data: {
          followerId: users[follower].id,
          followingId: users[following].id,
        },
      })
    )
  );

  // ============================================
  // POSTS - Mock food posts with selfies
  // ============================================
  console.log('📸 Creating posts...');
  const dishData = [
    { name: 'ShackBurger', image: foodImages.burger, rating: 9, restaurant: 0, cuisine: 'American', tags: [] },
    { name: 'Chicken Burrito Bowl', image: foodImages.burrito, rating: 8, restaurant: 1, cuisine: 'Mexican', tags: ['gluten-free'] },
    { name: 'Harvest Bowl', image: foodImages.salad, rating: 9, restaurant: 2, cuisine: 'Healthy', tags: ['vegetarian', 'gluten-free'] },
    { name: 'Lobster Ravioli', image: foodImages.pasta, rating: 10, restaurant: 3, cuisine: 'Italian', tags: [] },
    { name: 'Omakase Selection', image: foodImages.sushi, rating: 10, restaurant: 4, cuisine: 'Japanese', tags: ['gluten-free'] },
    { name: 'Beef Tenderloin', image: foodImages.steak, rating: 10, restaurant: 5, cuisine: 'French', tags: ['gluten-free'] },
    { name: 'Lobster Roll', image: foodImages.sandwich, rating: 9, restaurant: 6, cuisine: 'Seafood', tags: [] },
    { name: 'Cannoli', image: foodImages.iceCream, rating: 10, restaurant: 7, cuisine: 'Italian', tags: ['vegetarian'] },
    { name: 'Croissant & Latte', image: foodImages.coffee, rating: 9, restaurant: 8, cuisine: 'Bakery', tags: ['vegetarian'] },
    { name: 'Spicy Miso Ramen', image: foodImages.ramen, rating: 9, restaurant: 9, cuisine: 'Japanese', tags: [] },
    { name: 'Soup Dumplings', image: foodImages.dimsum, rating: 9, restaurant: 10, cuisine: 'Chinese', tags: [] },
    { name: 'Cheese Pizza', image: foodImages.pizza, rating: 10, restaurant: 11, cuisine: 'Italian', tags: ['vegetarian'] },
    { name: 'Margherita Pizza', image: foodImages.pizza, rating: 9, restaurant: 12, cuisine: 'Italian', tags: ['vegetarian'] },
    { name: 'Fish Tacos', image: foodImages.tacos, rating: 9, restaurant: 13, cuisine: 'Mexican', tags: [] },
    { name: 'Classic Cocktail', image: foodImages.coffee, rating: 8, restaurant: 14, cuisine: 'Bar', tags: ['vegetarian'] },
    { name: 'Crispy Wings', image: foodImages.wings, rating: 8, restaurant: 0, cuisine: 'American', tags: ['gluten-free'] },
    { name: 'Carnitas Bowl', image: foodImages.burrito, rating: 9, restaurant: 1, cuisine: 'Mexican', tags: ['gluten-free'] },
    { name: 'Acai Bowl', image: foodImages.acaiBowl, rating: 8, restaurant: 2, cuisine: 'Healthy', tags: ['vegan', 'gluten-free'] },
    { name: 'Gnocchi', image: foodImages.pasta, rating: 9, restaurant: 3, cuisine: 'Italian', tags: ['vegetarian'] },
    { name: 'Salmon Sashimi', image: foodImages.sushi, rating: 10, restaurant: 4, cuisine: 'Japanese', tags: ['gluten-free'] },
    { name: 'Poke Bowl', image: foodImages.poke, rating: 8, restaurant: 2, cuisine: 'Hawaiian', tags: ['gluten-free'] },
    { name: 'Breakfast Burrito', image: foodImages.breakfast, rating: 8, restaurant: 8, cuisine: 'Breakfast', tags: [] },
    { name: 'Butter Chicken', image: foodImages.curry, rating: 9, restaurant: 10, cuisine: 'Indian', tags: ['gluten-free'] },
    { name: 'Tonkotsu Ramen', image: foodImages.ramen, rating: 10, restaurant: 9, cuisine: 'Japanese', tags: [] },
    { name: 'Fries & Shake', image: foodImages.fries, rating: 8, restaurant: 0, cuisine: 'American', tags: ['vegetarian'] },
  ];

  const captions = [
    'Absolute 🔥! Best meal I\'ve had all week',
    'Can\'t stop thinking about this 😍',
    'If you haven\'t tried this, you\'re missing out!',
    'Date night done right ✨',
    'Study break never tasted so good 📚➡️🍽️',
    'Worth every penny 💸',
    'My comfort food go-to 🥰',
    'Third time this week... no regrets',
    'POV: You found the hidden gem 💎',
    'This is what dreams are made of',
    'Late night cravings satisfied ✅',
    'Brunch vibes only 🥂',
    'Food coma incoming 😴',
    'Treat yourself! You deserve it',
    'Chef\'s kiss 👨‍🍳💋',
  ];

  const posts = [];
  for (let i = 0; i < dishData.length; i++) {
    const dish = dishData[i];
    const user = users[i % users.length];
    const restaurant = restaurants[dish.restaurant];
    const donated = Math.random() > 0.3;

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        dishName: dish.name,
        imageUrl: dish.image,
        rating: dish.rating,
        restaurantId: restaurant.id,
        caption: captions[Math.floor(Math.random() * captions.length)],
        dietaryTags: dish.tags,
        cuisineType: dish.cuisine,
        donationMade: donated,
        mealsDonated: donated ? Math.floor(Math.random() * 3) + 1 : 0,
        likeCount: Math.floor(Math.random() * 150) + 10,
        commentCount: Math.floor(Math.random() * 20),
        saveCount: Math.floor(Math.random() * 30),
        viewCount: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
      },
    });
    posts.push(post);

    // Update restaurant stats
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        postCount: { increment: 1 },
        averageRating: dish.rating, // Simplified
        mealsDonated: { increment: post.mealsDonated },
      },
    });
  }

  // ============================================
  // LIKES & SAVES
  // ============================================
  console.log('❤️ Creating likes and saves...');
  for (const post of posts) {
    // Random likes from users
    const likers = users.filter(() => Math.random() > 0.5).slice(0, 8);
    for (const liker of likers) {
      if (liker.id !== post.userId) {
        await prisma.like.create({
          data: { postId: post.id, userId: liker.id },
        }).catch(() => {}); // Ignore duplicates
      }
    }

    // Random saves
    const savers = users.filter(() => Math.random() > 0.7).slice(0, 4);
    for (const saver of savers) {
      if (saver.id !== post.userId) {
        await prisma.save.create({
          data: { postId: post.id, userId: saver.id },
        }).catch(() => {});
      }
    }
  }

  // ============================================
  // COMMENTS
  // ============================================
  console.log('💬 Creating comments...');
  const commentTexts = [
    'Looks amazing! 😍',
    'Need to try this ASAP!',
    'OMG I\'m so hungry now',
    'Adding this to my list!',
    'You always find the best spots!',
    'How was it??',
    'We need to go here together!',
    'This is making me hungry 🤤',
    'Wow, great shot!',
    'The vibes look immaculate',
    '10/10 would devour',
    'Is this as good as it looks?',
  ];

  for (const post of posts.slice(0, 15)) {
    const commenters = users.filter(() => Math.random() > 0.6).slice(0, 3);
    for (const commenter of commenters) {
      if (commenter.id !== post.userId) {
        await prisma.comment.create({
          data: {
            postId: post.id,
            userId: commenter.id,
            content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          },
        });
      }
    }
  }

  // ============================================
  // COLLECTIONS
  // ============================================
  console.log('📚 Creating collections...');
  for (const user of users) {
    // Default collections
    await prisma.collection.create({
      data: {
        userId: user.id,
        name: 'Favorites',
        isDefault: true,
        isPublic: false,
        itemCount: Math.floor(Math.random() * 10) + 3,
      },
    });
    await prisma.collection.create({
      data: {
        userId: user.id,
        name: 'Want to Try',
        isDefault: true,
        isPublic: false,
        itemCount: Math.floor(Math.random() * 15) + 5,
      },
    });
  }

  // Custom public collections
  await prisma.collection.create({
    data: {
      userId: users[0].id,
      name: 'Best Pizza in Boston',
      description: 'My definitive ranking of Boston pizza spots 🍕',
      isPublic: true,
      itemCount: 8,
    },
  });
  await prisma.collection.create({
    data: {
      userId: users[2].id,
      name: 'Date Night Spots',
      description: 'Romantic restaurants for that special someone ❤️',
      isPublic: true,
      itemCount: 12,
    },
  });
  await prisma.collection.create({
    data: {
      userId: users[3].id,
      name: 'Hidden Gems',
      description: 'Under-the-radar spots only locals know about',
      isPublic: true,
      itemCount: 15,
    },
  });

  // ============================================
  // COUPONS
  // ============================================
  console.log('🎟️ Creating coupons...');
  await Promise.all([
    prisma.coupon.create({
      data: {
        restaurantId: restaurants[0].id, // Shake Shack
        title: '15% Off Your Order',
        description: 'Show this coupon at checkout for 15% off your entire order!',
        discountType: 'percentage',
        discountValue: 15,
        coinCost: 50,
        totalQuantity: 500,
        claimedCount: 127,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        imageUrl: foodImages.burger,
      },
    }),
    prisma.coupon.create({
      data: {
        restaurantId: restaurants[1].id, // Chipotle
        title: 'Free Guac',
        description: 'Get free guacamole with any entrée purchase',
        discountType: 'freeItem',
        discountValue: 0,
        coinCost: 30,
        totalQuantity: 1000,
        claimedCount: 456,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        imageUrl: foodImages.burrito,
      },
    }),
    prisma.coupon.create({
      data: {
        restaurantId: restaurants[2].id, // sweetgreen
        title: '$3 Off',
        description: '$3 off any bowl or salad',
        discountType: 'fixed',
        discountValue: 3,
        coinCost: 25,
        totalQuantity: 750,
        claimedCount: 234,
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        imageUrl: foodImages.salad,
      },
    }),
    prisma.coupon.create({
      data: {
        restaurantId: restaurants[7].id, // Mike's Pastry
        title: 'Free Cannoli',
        description: 'One free cannoli with purchase of $10+',
        discountType: 'freeItem',
        discountValue: 0,
        coinCost: 40,
        totalQuantity: 300,
        claimedCount: 89,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        imageUrl: foodImages.iceCream,
      },
    }),
    prisma.coupon.create({
      data: {
        restaurantId: restaurants[9].id, // Ganko Ramen
        title: '20% Off Ramen',
        description: '20% off any ramen bowl',
        discountType: 'percentage',
        discountValue: 20,
        coinCost: 60,
        totalQuantity: 200,
        claimedCount: 67,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        imageUrl: foodImages.ramen,
      },
    }),
    prisma.coupon.create({
      data: {
        restaurantId: restaurants[12].id, // Regina Pizzeria
        title: 'Free Slice',
        description: 'One free slice with any large pizza',
        discountType: 'freeItem',
        discountValue: 0,
        coinCost: 35,
        totalQuantity: 400,
        claimedCount: 156,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        imageUrl: foodImages.pizza,
      },
    }),
  ]);

  // ============================================
  // FLASH SPONSORSHIPS
  // ============================================
  console.log('⚡ Creating flash sponsorships...');
  await Promise.all([
    prisma.flashSponsorship.create({
      data: {
        restaurantId: restaurants[0].id, // Shake Shack
        title: '🍔 Shake Shack Challenge: 100 Drops = 200 Meals!',
        description: 'Help us reach 100 Drops at Shake Shack Boston and they\'ll donate 200 meals to Greater Boston Food Bank! Every drop counts.',
        targetDrops: 100,
        currentDrops: 67,
        mealsToDonatePer: 1,
        bonusMeals: 100,
        totalMealsPledged: 200,
        totalMealsDonated: 0,
        startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        bannerUrl: foodImages.burger,
        charityName: 'Greater Boston Food Bank',
      },
    }),
    prisma.flashSponsorship.create({
      data: {
        restaurantId: restaurants[1].id, // Chipotle
        title: '🌯 Chipotle Cares: Drop 150, Feed 300!',
        description: 'Chipotle is matching! Reach 150 drops and they\'ll donate 300 meals to local shelters. Let\'s make a difference together!',
        targetDrops: 150,
        currentDrops: 89,
        mealsToDonatePer: 2,
        bonusMeals: 50,
        totalMealsPledged: 300,
        totalMealsDonated: 0,
        startsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        bannerUrl: foodImages.burrito,
        charityName: 'Pine Street Inn',
      },
    }),
    prisma.flashSponsorship.create({
      data: {
        restaurantId: restaurants[7].id, // Mike's Pastry
        title: '🥐 Sweet for a Cause: 50 Drops = 100 Meals',
        description: 'Mike\'s Pastry is joining the movement! Help us hit 50 drops and they\'ll donate 100 meals. Every cannoli post helps!',
        targetDrops: 50,
        currentDrops: 43,
        mealsToDonatePer: 1,
        bonusMeals: 50,
        totalMealsPledged: 100,
        totalMealsDonated: 0,
        startsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        bannerUrl: foodImages.iceCream,
        charityName: 'Community Servings',
      },
    }),
    prisma.flashSponsorship.create({
      data: {
        restaurantId: restaurants[9].id, // Ganko Ramen
        title: '🍜 Ramen Rally: 75 Drops for 150 Meals!',
        description: 'Warm hearts with warm ramen! Hit 75 drops at Ganko Ittetsu and they\'ll donate 150 meals.',
        targetDrops: 75,
        currentDrops: 23,
        mealsToDonatePer: 2,
        bonusMeals: 0,
        totalMealsPledged: 150,
        totalMealsDonated: 0,
        startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        bannerUrl: foodImages.ramen,
        charityName: 'Lovin\' Spoonfuls',
      },
    }),
  ]);

  // ============================================
  // GLOBAL STATS
  // ============================================
  console.log('📊 Creating global stats...');
  await prisma.globalStats.create({
    data: {
      id: 'global',
      totalMeals: 847293,
      currentGoal: 1000000,
      totalDonors: 23456,
    },
  });

  // ============================================
  // NOTIFICATIONS (Sample)
  // ============================================
  console.log('🔔 Creating notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        body: 'You earned the "Coin Collector" badge!',
        actionType: 'achievement',
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: 'flash_sponsorship',
        title: 'Flash Sponsorship Alert! ⚡',
        body: 'Shake Shack is 33 drops away from donating 200 meals!',
        actionType: 'sponsorship',
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[1].id,
        type: 'coupon',
        title: 'New Coupon Available! 🎟️',
        body: 'You have enough coins for a free cannoli at Mike\'s Pastry!',
        actionType: 'coupon',
      },
    }),
  ]);

  console.log('✅ Seed completed successfully!');
  console.log(`
📊 Summary:
- ${categories.length} categories
- ${teams.length} teams
- ${restaurants.length} restaurants
- ${achievements.length} achievements
- ${users.length} users
- ${posts.length} posts
- 6 coupons
- 4 flash sponsorships
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
