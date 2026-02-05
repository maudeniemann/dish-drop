# Dish Drop

A food social media app with meal donation gamification. Share your favorite dishes, discover new restaurants, and donate meals to those in need.

## Tech Stack

- **Mobile**: React Native + Expo SDK 54
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma

## Setup

### Backend (API)

```bash
cd api
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run db:generate
npm run db:push
npm run dev
```

### Mobile App

```bash
cd mobile
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env with your API URL
npx expo start
```

## Features

- TikTok-style vertical feed
- BeReal-style friends feed
- Restaurant discovery
- Collections/playlists
- Meal donation tracking
- Teams & leaderboards
- Achievements

## Environment Variables

### API (.env)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `DIRECT_URL` - Supabase direct connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Mobile (.env)
- `EXPO_PUBLIC_API_URL` - Backend API URL (e.g., http://localhost:3001/api)
