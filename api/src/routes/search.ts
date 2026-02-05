import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /search - Universal search
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, type, lat, lng, limit = '10' } = req.query;

    if (!q || (q as string).trim().length === 0) {
      res.status(400).json({ error: 'Search query required' });
      return;
    }

    const query = (q as string).trim();
    const limitNum = parseInt(limit as string);

    const results: {
      dishes?: unknown[];
      restaurants?: unknown[];
      users?: unknown[];
      collections?: unknown[];
    } = {};

    // Search based on type or all
    const searchTypes = type ? [(type as string)] : ['dishes', 'restaurants', 'users', 'collections'];

    // Search dishes (posts)
    if (searchTypes.includes('dishes')) {
      const dishes = await prisma.post.findMany({
        where: {
          isPrivate: false,
          OR: [
            { dishName: { contains: query, mode: 'insensitive' } },
            { caption: { contains: query, mode: 'insensitive' } },
            { cuisineType: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: [{ likeCount: 'desc' }, { createdAt: 'desc' }],
        take: limitNum,
        select: {
          id: true,
          dishName: true,
          imageUrl: true,
          thumbnailUrl: true,
          rating: true,
          likeCount: true,
          restaurant: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      });
      results.dishes = dishes;
    }

    // Search restaurants
    if (searchTypes.includes('restaurants')) {
      let restaurantWhere: Record<string, unknown> = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { cuisineTypes: { has: query } },
        ],
      };

      // Add location filtering if provided
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const radiusKm = 50; // 50km radius for search
        const latDelta = radiusKm / 111;
        const lngDelta = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));

        restaurantWhere = {
          ...restaurantWhere,
          latitude: { gte: latitude - latDelta, lte: latitude + latDelta },
          longitude: { gte: longitude - lngDelta, lte: longitude + lngDelta },
        };
      }

      const restaurants = await prisma.restaurant.findMany({
        where: restaurantWhere,
        orderBy: [{ postCount: 'desc' }, { averageRating: 'desc' }],
        take: limitNum,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          city: true,
          state: true,
          averageRating: true,
          postCount: true,
          cuisineTypes: true,
          priceLevel: true,
        },
      });
      results.restaurants = restaurants;
    }

    // Search users
    if (searchTypes.includes('users')) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { mealsDonated: 'desc' },
        take: limitNum,
        select: {
          id: true,
          username: true,
          name: true,
          profileImage: true,
          mealsDonated: true,
          postCount: true,
          _count: {
            select: { followers: true },
          },
        },
      });
      results.users = users.map((u) => ({
        ...u,
        followerCount: u._count.followers,
        _count: undefined,
      }));
    }

    // Search collections
    if (searchTypes.includes('collections')) {
      const collections = await prisma.collection.findMany({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { itemCount: 'desc' },
        take: limitNum,
        select: {
          id: true,
          name: true,
          description: true,
          coverImage: true,
          itemCount: true,
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      });
      results.collections = collections;
    }

    res.json({ results, query });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /search/suggestions - Search suggestions/autocomplete
router.get('/suggestions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || (q as string).trim().length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const query = (q as string).trim();

    // Get suggestions from different sources
    const [dishes, restaurants, users] = await Promise.all([
      prisma.post.findMany({
        where: {
          isPrivate: false,
          dishName: { contains: query, mode: 'insensitive' },
        },
        select: { dishName: true },
        distinct: ['dishName'],
        take: 5,
      }),
      prisma.restaurant.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        select: { name: true, slug: true },
        take: 5,
      }),
      prisma.user.findMany({
        where: { username: { contains: query, mode: 'insensitive' } },
        select: { username: true },
        take: 5,
      }),
    ]);

    const suggestions = [
      ...dishes.map((d) => ({ type: 'dish', text: d.dishName })),
      ...restaurants.map((r) => ({ type: 'restaurant', text: r.name, slug: r.slug })),
      ...users.map((u) => ({ type: 'user', text: `@${u.username}` })),
    ];

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// GET /search/categories - Get browsable categories
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

export default router;
