# DishDrop — Complete Project Knowledge Base

## What Is DishDrop?

DishDrop is a **food social media mobile app with meal donation gamification**. Users share photos and reviews of dishes they eat at restaurants, discover new places, and donate meals to those in need. Every post can trigger a meal donation. The app gamifies the experience with coins, achievements, streaks, leaderboards, flash sponsorships, and redeemable coupons.

**Target location:** Boston, MA (default: Boston College campus, 42.3355, -71.1685)

---

## Tech Stack

### Mobile (Frontend)
- **React Native 0.81.5** with **Expo SDK 54**
- **Expo Router 6** (file-based routing)
- **TypeScript 5.9**
- **React 19.1**
- **State:** React Context (AuthContext, LocationContext)
- **Storage:** AsyncStorage
- **Maps:** React Native Maps 1.20
- **Animation:** React Native Reanimated 4.1
- **Icons:** Ionicons
- **Dates:** date-fns 4.1

### Backend (API)
- **Express.js 5.2** (TypeScript)
- **Prisma 5.22** ORM
- **PostgreSQL** via Supabase (with PgBouncer connection pooling)
- **JWT** authentication (7-day expiration)
- **bcryptjs** for password hashing
- **Zod 4.3** for input validation
- **CORS** enabled

### External Services
- **Google Places API** — restaurant data fetching
- **Stripe** — payment integration (configured, not actively used)
- **AWS S3** — image storage (configured, not actively used)
- **Supabase** — PostgreSQL hosting

---

## Project Structure

```
dish-drop/
├── mobile/                    # React Native + Expo app
│   ├── app/                   # Expo Router routes
│   │   ├── _layout.tsx        # Root layout
│   │   ├── (auth)/            # Login & register screens
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/            # Main tab navigation
│   │   │   ├── _layout.tsx    # Tab bar config
│   │   │   ├── index.tsx      # Home feed
│   │   │   ├── explore.tsx    # Restaurant discovery + map
│   │   │   ├── create.tsx     # Create dish post
│   │   │   ├── impact.tsx     # Donation stats & achievements
│   │   │   ├── profile.tsx    # User profile
│   │   │   └── lists.tsx      # Collections (hidden tab)
│   │   ├── profile/[userId].tsx
│   │   ├── profile/edit.tsx
│   │   ├── restaurant/[restaurantId].tsx
│   │   ├── post/[postId].tsx
│   │   └── collection/[collectionId].tsx
│   ├── components/            # Reusable UI components
│   │   ├── FilterModal.tsx
│   │   ├── RewardsSection.tsx
│   │   ├── ProfileView.tsx
│   │   ├── FlashSponsorships.tsx
│   │   ├── CollectionsView.tsx
│   │   └── MenuView.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Auth state, login/register/logout
│   │   └── LocationContext.tsx # GPS location (hardcoded to BC)
│   ├── lib/
│   │   ├── api.ts             # API client (with mock data fallback)
│   │   ├── constants.ts       # Colors, spacing, theme
│   │   ├── storage.ts         # AsyncStorage helpers
│   │   └── mockData.ts        # Auto-generated mock data
│   ├── types/
│   │   └── index.ts           # All TypeScript types
│   ├── assets/                # Images, icons, splash screens
│   ├── app.json               # Expo config
│   └── package.json
│
├── api/                       # Express.js backend
│   ├── src/
│   │   ├── index.ts           # Server entry (port 3001)
│   │   ├── lib/
│   │   │   ├── prisma.ts      # Prisma client singleton
│   │   │   └── jwt.ts         # JWT sign/verify utilities
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT auth middleware
│   │   └── routes/
│   │       ├── auth.ts        # Register, login, me, logout
│   │       ├── users.ts       # Profiles, following, leaderboard
│   │       ├── posts.ts       # CRUD, feed, like, save, comment
│   │       ├── restaurants.ts # Discovery, details, menu, claim
│   │       ├── collections.ts # CRUD, add/remove items
│   │       ├── impact.ts      # Global & personal donation stats
│   │       ├── teams.ts       # Team leaderboards, join
│   │       ├── search.ts      # Global search
│   │       ├── coupons.ts     # Coin redemption system
│   │       └── sponsorships.ts# Flash sponsorship campaigns
│   ├── prisma/
│   │   ├── schema.prisma      # Full database schema
│   │   └── seed.ts            # Database seeder
│   ├── scripts/               # Data management utilities
│   │   ├── fetch-restaurants.ts
│   │   ├── seed-restaurants.ts
│   │   ├── generate-mock-content.ts
│   │   ├── update-mobile-mock.ts
│   │   ├── scrape-menus.ts
│   │   └── import-menus.ts
│   ├── data/                  # Static data files
│   │   ├── restaurants-raw.json   # 329 restaurants
│   │   └── menus-extracted.json
│   └── package.json
```

---

## Database Schema (Prisma/PostgreSQL)

### User
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| email | String | Unique |
| username | String | Unique, 3-30 chars, alphanumeric + underscore |
| name | String | Required |
| passwordHash | String | bcryptjs hashed |
| bio | String? | Optional |
| profileImage | String? | URL |
| teamId | String? | FK → Team |
| latitude/longitude | Float? | User location |
| city | String? | |
| mealsDonated | Int | Default 0 |
| postCount | Int | Default 0 |
| mealStreak | Int | Default 0 |
| mealsBalance | Int | Default 5 |
| coins | Int | Default 0 |
| totalCoins | Int | Default 0 |
| isPrivate | Boolean | Default false |

### Post
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| userId | String | FK → User |
| restaurantId | String? | FK → Restaurant |
| dishName | String | Required |
| imageUrl | String | Required |
| rating | Int | 1-10 scale |
| caption | String? | |
| price | Float? | |
| dietaryTags | String[] | Array |
| cuisineType | String? | |
| isPrivate | Boolean | Default false |
| donationMade | Boolean | Default false |
| mealsDonated | Int | Default 0 |
| likeCount | Int | Denormalized |
| commentCount | Int | Denormalized |
| saveCount | Int | Denormalized |
| viewCount | Int | Denormalized |

### Restaurant
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String | Required |
| slug | String | Unique, URL-safe |
| address, city, state, zipCode | String | Location |
| latitude/longitude | Float | Coordinates |
| cuisineTypes | String[] | Array |
| priceLevel | Int? | 1-4 scale |
| postCount | Int | Denormalized |
| averageRating | Float | Denormalized |
| hours | Json? | Operating hours |
| menu | Json? | Menu data |
| isClaimed | Boolean | Restaurant owner claim |
| googlePlaceId | String? | External ref |

### Other Models
- **Collection** — User-created lists of saved posts (default: "Favorites", "To Try")
- **CollectionItem** — Links posts to collections
- **Comment** — Threaded comments on posts (has parentId)
- **Like** — Unique per user+post
- **Save** — Unique per user+post
- **Follow** — follower/following social graph
- **Team** — University/city/company groups with donation goals
- **Donation** — Meal donation records (source: post, purchase, gift, reward)
- **Achievement** — Unlockable badges (tiers: bronze/silver/gold/platinum; types: posts/donations/streak/social/exploration)
- **UserAchievement** — Tracks which users unlocked which achievements
- **Coupon** — Restaurant discounts redeemable with coins (types: percentage/fixed/freeItem)
- **UserCoupon** — Tracks claimed coupons and redemption codes
- **FlashSponsorship** — Time-limited campaigns where restaurants pledge meals per X posts
- **FlashSponsorshipDrop** — User participation in sponsorships
- **GlobalStats** — Single-row table for community-wide stats (total meals, current goal)
- **Category** — Food categories
- **Notification** — In-app notifications (types: like/comment/follow/achievement/coupon/flash_sponsorship)

---

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` — Create account (email, password, username, name)
- `POST /login` — Returns user + JWT token
- `GET /me` — Current user from token
- `POST /logout` — Client-side (stateless JWT)
- `PUT /update-location` — Update lat/lng (authed)

### Users (`/api/users`)
- `GET /` — Get user by ID or username
- `GET /leaderboard` — Top donors
- `GET /search` — Search users by name/username
- `PUT /` — Update profile (authed)
- `POST /follow/:userId` — Follow (authed)
- `DELETE /follow/:userId` — Unfollow (authed)
- `GET /:userId/followers` and `/following`

### Posts (`/api/posts`)
- `GET /` — Feed (filters: feed type, location, cuisine, userId, restaurantId)
- `GET /:id` — Single post
- `POST /` — Create post (authed)
- `PUT /:id` — Update post (authed)
- `DELETE /:id` — Delete post (authed)
- `POST /:id/like`, `DELETE /:id/like` — Like/unlike (authed)
- `POST /:id/save`, `DELETE /:id/save` — Save/unsave (authed)
- `POST /:id/comment` — Add comment (authed)

### Restaurants (`/api/restaurants`)
- `GET /` — List (filters: location, cuisine, price, search)
- `GET /:id` — Details
- `GET /:id/posts` — Restaurant's posts
- `GET /:id/menu` — Menu data
- `POST /:id/claim` — Claim ownership (authed)

### Collections (`/api/collections`)
- `GET /` — User's collections (authed)
- `GET /:id` — Collection details
- `POST /` — Create (authed)
- `PUT /:id` — Update (authed)
- `DELETE /:id` — Delete (authed)
- `POST /:id/items` — Add post (authed)
- `DELETE /:id/items/:postId` — Remove post (authed)

### Impact (`/api/impact`)
- `GET /global` — Community donation stats
- `GET /personal` — User's stats & achievements (authed)
- `POST /donate` — Make donation (authed)

### Teams (`/api/teams`)
- `GET /` — List teams
- `GET /:id` — Team details
- `GET /:id/leaderboard` — Team member rankings
- `POST /:id/join` — Join team (authed)

### Search (`/api/search`)
- `GET /` — Search dishes, restaurants, users, collections

### Coupons (`/api/coupons`)
- `GET /` — Available coupons
- `POST /:id/claim` — Claim coupon with coins (authed)
- `GET /claimed` — User's claimed coupons (authed)

### Sponsorships (`/api/sponsorships`)
- `GET /` — Active flash sponsorships
- `GET /:id` — Sponsorship details
- `POST /:id/drop` — Participate (authed)

---

## Key Features

1. **Social Feed** — Swipeable dish posts with photos, ratings (1-10), captions, dietary tags, prices, and restaurant links
2. **Restaurant Discovery** — Map and list views, cuisine/price/distance filters, 329 real Boston restaurants from Google Places
3. **Meal Donations** — Every post can donate meals; personal/global tracking; community goal (1M meals)
4. **Gamification** — Coins earned per post, redeemable for restaurant coupons; achievement badges with tiers; daily streaks
5. **Flash Sponsorships** — Time-limited campaigns where restaurants pledge meals per community posts
6. **Collections/Playlists** — Organize saved dishes into themed lists
7. **Teams** — University/city/company teams competing on donation leaderboards
8. **Search** — Global search across dishes, restaurants, users, and collections
9. **User Profiles** — Post history, follower/following counts, donation stats, achievements
10. **Demo Mode** — App works fully offline with mock data (20 users, 50 posts, 329 restaurants, 234 comments)

---

## Styling & Theme

- **Primary background:** #000 (black)
- **Accent color:** #1acae7 (cyan)
- **Rating colors:** 5-tier scale (red → orange → yellow → lime → green)
- **Dark mode by default**
- **React Native StyleSheet** (no styling library)

---

## Authentication Flow

1. User registers with email, password (min 8 chars), username (3-30 chars), name
2. Password hashed with bcryptjs, stored in PostgreSQL
3. JWT returned on login (7-day exp), stored in AsyncStorage
4. All protected endpoints require `Authorization: Bearer <token>` header
5. Demo mode auto-logs in as `demo@dishdrop.app`

---

## Development

### Run Mobile
```bash
cd mobile && npm install --legacy-peer-deps && npx expo start
```

### Run API
```bash
cd api && npm install && npm run db:generate && npm run dev
```

### Demo Mode
App runs without a backend — all data from `mobile/lib/mockData.ts`

---

## Known Limitations

- Location hardcoded to Boston College
- Stripe payments configured but not wired into UI
- AWS S3 configured but image uploads use URLs, not actual uploads
- Push notifications model exists but no push service integrated
- Menu data from web scraping may need manual cleanup
- No real-time features (no WebSocket/SSE)

---

## Git History (Recent)

1. Fix Collections toggle — raise modeToggleBar above MapView
2. Fix Collections tab — prevent search overlay blocking toggle
3. Fix app stability, location, auth, and collections
4. Update README with setup instructions
5. Add UI/UX enhancements (feed, nav, menu tab)
6. Add gamification (coins, coupons, flash sponsorships)
7. Initial commit
