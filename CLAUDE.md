# Dish Drop — Food Social + Meal Donation Gamification

## What This Is
Mobile-first food social media app where posting dishes donates meals. Combines restaurant discovery, food sharing, gamification (coins, achievements, streaks), and community impact tracking.

## Stack
- **Mobile**: React Native 0.81 + Expo SDK 54 + Expo Router 6 (file-based routing)
- **Backend**: Express 5 + TypeScript + Prisma 5 + PostgreSQL (Supabase)
- **Auth**: JWT (7-day, bcryptjs hashing)
- **Validation**: Zod 4
- **Maps**: react-native-maps + expo-location
- **Camera**: expo-camera + expo-image-picker
- **Animation**: react-native-reanimated 4
- **External**: Google Places API (restaurant data)
- **Deployment**: Vercel (API), Expo (mobile)

## Project Layout
```
mobile/    → React Native + Expo app
api/       → Express.js backend (port 3001)
```

## Current State: HYBRID MODE
- App works fully in demo mode (427KB mock data auto-fallback)
- Real backend API is implemented (13 route files, 50+ endpoints)
- `mobile/lib/api.ts` tries real API first, falls back to mockData on network error
- To go live: just start the backend (`cd api && npm run dev`)

## Mobile Routes (Expo Router)
- `(auth)/login`, `(auth)/register` — Authentication
- `(tabs)/index` — Home feed (Friends/Nearby toggle)
- `(tabs)/explore` — Restaurant discovery + map view
- `(tabs)/create` — Create dish post
- `(tabs)/impact` — Donation stats, achievements, leaderboards
- `(tabs)/profile` — User profile
- `(tabs)/lists` — Collections (hidden tab)
- `restaurant/[restaurantId]`, `post/[postId]`, `profile/[userId]`, `collection/[collectionId]`

## Database (44 Prisma models)
Key: User, Post, Restaurant (329 real Boston venues), Collection, Team, Follow, Like, Save, Comment, Donation, Achievement (40+ badges), UserAchievement, Coupon, UserCoupon, FlashSponsorship, FlashSponsorshipDrop, RestaurantClaim, SponsoredPost, MysteryBox, Report, BlockedUser, GlobalStats

## Gamification System
- **Coins**: earned per post, spent on restaurant coupons (10-25 coins each)
- **Achievements**: 40+ badges across 5 types (posts, donations, streak, social, exploration) × 4 tiers (bronze → platinum)
- **Streaks**: consecutive posting days tracked
- **Leaderboards**: global + per-team (university/city/company)
- **Flash sponsorships**: restaurants pledge meals per community post

## Environment Variables
Mobile: `EXPO_PUBLIC_API_URL=http://localhost:3001/api`
API: `DATABASE_URL, DIRECT_URL, JWT_SECRET, GOOGLE_PLACES_API_KEY, PORT=3001`

## Dev
```bash
cd mobile && npx expo start        # Mobile app
cd api && npm run dev              # Backend on :3001
cd api && npm run db:push          # Sync Prisma schema
cd api && npm run db:seed          # Seed test data
cd api && npm run fetch-restaurants # Scrape Google Places
```
