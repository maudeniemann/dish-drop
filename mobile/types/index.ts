// User types
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string;
  profileImage?: string;
  teamId?: string;
  team?: Team;
  latitude?: number;
  longitude?: number;
  city?: string;
  mealsDonated: number;
  postCount: number;
  mealStreak: number;
  mealsBalance: number;
  isPrivate: boolean;
  pushEnabled: boolean;
  createdAt: string;
  _count?: {
    followers: number;
    following: number;
    posts: number;
    collections: number;
  };
  isFollowing?: boolean;
}

export interface UserPreview {
  id: string;
  username: string;
  name: string;
  profileImage?: string;
  mealsDonated?: number;
  mealStreak?: number;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  user: UserPreview & { mealStreak?: number };
  dishName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  rating: number;
  restaurantId: string;
  restaurant: RestaurantPreview;
  caption?: string;
  price?: number;
  dietaryTags: string[];
  cuisineType?: string;
  isPrivate: boolean;
  donationMade: boolean;
  mealsDonated: number;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  viewCount?: number;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface PostPreview {
  id: string;
  dishName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  rating: number;
  likeCount: number;
  commentCount?: number;
  saveCount?: number;
  createdAt: string;
  restaurant: RestaurantPreview;
  user?: UserPreview;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverImage?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  reservationUrl?: string;
  orderUrl?: string;
  postCount: number;
  averageRating: number;
  mealsDonated: number;
  cuisineTypes: string[];
  priceLevel?: number;
  hours?: Record<string, string>;
  isClaimed: boolean;
}

export interface RestaurantPreview {
  id: string;
  name: string;
  slug?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  averageRating?: number;
  postCount?: number;
}

// Collection types
export interface Collection {
  id: string;
  userId: string;
  user?: UserPreview;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  isDefault: boolean;
  itemCount: number;
  previewImages?: string[];
  createdAt: string;
  updatedAt: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  slug: string;
  type: 'university' | 'city' | 'company';
  logoUrl?: string;
  city?: string;
  state?: string;
  memberCount: number;
  totalMeals: number;
  currentGoal: number;
  goalDeadline?: string;
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: UserPreview;
  content: string;
  parentId?: string;
  createdAt: string;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  type: 'posts' | 'donations' | 'streak' | 'social' | 'exploration';
  threshold: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  sortOrder: number;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
}

// Donation types
export interface Donation {
  id: string;
  userId: string;
  mealCount: number;
  amount: number;
  source: 'post' | 'purchase' | 'gift' | 'reward';
  postId?: string;
  status: string;
  createdAt: string;
}

// Global stats
export interface GlobalStats {
  id: string;
  totalMeals: number;
  currentGoal: number;
  goalDeadline?: string;
  totalDonors: number;
}

// Personal stats
export interface PersonalStats {
  mealsDonated: number;
  mealsBalance: number;
  postCount: number;
  mealStreak: number;
  totalViews: number;
  restaurantsVisited: number;
  dishesSaved: number;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  sortOrder: number;
}

// Search results
export interface SearchResults {
  dishes?: PostPreview[];
  restaurants?: RestaurantPreview[];
  users?: UserPreview[];
  collections?: Collection[];
}

// Leaderboard entry
export interface LeaderboardEntry extends UserPreview {
  rank: number;
  isCurrentUser?: boolean;
}

export interface TeamLeaderboardEntry extends Team {
  rank: number;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}

export interface ApiError {
  error: string;
}

// Form types for creating/updating
export interface CreatePostData {
  dishName: string;
  imageUrl: string;
  thumbnailUrl?: string;
  rating: number;
  restaurantId: string;
  caption?: string;
  price?: number;
  dietaryTags?: string[];
  cuisineType?: string;
  isPrivate?: boolean;
  donateMeals?: number;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  profileImage?: string;
  isPrivate?: boolean;
  pushEnabled?: boolean;
}

// Filter types
export interface FeedFilters {
  feed?: 'friends' | 'nearby';
  lat?: number;
  lng?: number;
  radius?: number;
  cuisineType?: string;
}

export interface RestaurantFilters {
  lat?: number;
  lng?: number;
  radius?: number;
  cuisine?: string;
  priceLevel?: number;
  search?: string;
}
