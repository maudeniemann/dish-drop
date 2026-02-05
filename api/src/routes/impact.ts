import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /impact/global - Get global donation stats
router.get('/global', async (_req: Request, res: Response): Promise<void> => {
  try {
    let stats = await prisma.globalStats.findUnique({
      where: { id: 'global' },
    });

    if (!stats) {
      // Create initial stats
      stats = await prisma.globalStats.create({
        data: {
          id: 'global',
          totalMeals: 0,
          currentGoal: 1000000,
          totalDonors: 0,
        },
      });
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ error: 'Failed to get global stats' });
  }
});

// GET /impact/personal - Get personal impact stats
router.get('/personal', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mealsDonated: true,
        mealsBalance: true,
        postCount: true,
        mealStreak: true,
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
            totalMeals: true,
            memberCount: true,
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: 'desc' },
        },
        _count: {
          select: {
            posts: true,
            saves: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get total views on user's posts
    const viewStats = await prisma.post.aggregate({
      where: { userId },
      _sum: { viewCount: true },
    });

    // Get unique restaurants visited
    const restaurantCount = await prisma.post.findMany({
      where: { userId },
      select: { restaurantId: true },
      distinct: ['restaurantId'],
    });

    res.json({
      stats: {
        mealsDonated: user.mealsDonated,
        mealsBalance: user.mealsBalance,
        postCount: user.postCount,
        mealStreak: user.mealStreak,
        totalViews: viewStats._sum.viewCount || 0,
        restaurantsVisited: restaurantCount.length,
        dishesSaved: user._count.saves,
      },
      team: user.team,
      achievements: user.achievements.map((a) => a.achievement),
    });
  } catch (error) {
    console.error('Get personal stats error:', error);
    res.status(500).json({ error: 'Failed to get personal stats' });
  }
});

// POST /impact/donations - Make a donation (purchase meals)
router.post('/donations', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const donationSchema = z.object({
      mealCount: z.number().int().positive(),
      // In production, this would include Stripe payment info
      stripePaymentId: z.string().optional(),
    });

    const validation = donationSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.issues[0].message });
      return;
    }

    const { mealCount, stripePaymentId } = validation.data;
    const userId = req.user!.userId;

    // Price per meal (could be dynamic)
    const pricePerMeal = 1.0;
    const amount = mealCount * pricePerMeal;

    // In production, verify Stripe payment here

    await prisma.$transaction(async (tx) => {
      // Create donation record
      await tx.donation.create({
        data: {
          userId,
          mealCount,
          amount,
          source: 'purchase',
          stripePaymentId,
        },
      });

      // Update user stats
      await tx.user.update({
        where: { id: userId },
        data: {
          mealsDonated: { increment: mealCount },
          mealsBalance: { increment: mealCount },
        },
      });

      // Update team stats if user is on a team
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { teamId: true },
      });

      if (user?.teamId) {
        await tx.team.update({
          where: { id: user.teamId },
          data: { totalMeals: { increment: mealCount } },
        });
      }

      // Update global stats
      await tx.globalStats.upsert({
        where: { id: 'global' },
        update: {
          totalMeals: { increment: mealCount },
        },
        create: {
          id: 'global',
          totalMeals: mealCount,
          totalDonors: 1,
        },
      });
    });

    res.status(201).json({
      message: 'Donation successful',
      mealCount,
      amount,
    });
  } catch (error) {
    console.error('Donation error:', error);
    res.status(500).json({ error: 'Failed to process donation' });
  }
});

// GET /impact/donations - Get user's donation history
router.get('/donations', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { cursor, limit = '20' } = req.query;

    const donations = await prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string) + 1,
      ...(cursor ? { cursor: { id: cursor as string }, skip: 1 } : {}),
    });

    const hasMore = donations.length > parseInt(limit as string);
    if (hasMore) donations.pop();

    res.json({
      donations,
      nextCursor: hasMore ? donations[donations.length - 1]?.id : null,
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Failed to get donations' });
  }
});

// GET /impact/leaderboard/friends - Get friends leaderboard
router.get('/leaderboard/friends', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { limit = '10' } = req.query;

    // Get users the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = [...following.map((f) => f.followingId), userId];

    const users = await prisma.user.findMany({
      where: { id: { in: followingIds } },
      orderBy: { mealsDonated: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        username: true,
        name: true,
        profileImage: true,
        mealsDonated: true,
        mealStreak: true,
      },
    });

    // Add rank
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      isCurrentUser: user.id === userId,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get friends leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// GET /impact/leaderboard/global - Get global user leaderboard
router.get('/leaderboard/global', async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = '50' } = req.query;

    const users = await prisma.user.findMany({
      orderBy: { mealsDonated: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        username: true,
        name: true,
        profileImage: true,
        mealsDonated: true,
        mealStreak: true,
        team: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// GET /impact/achievements - Get all achievements
router.get('/achievements', async (_req: Request, res: Response): Promise<void> => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }],
    });

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

export default router;
