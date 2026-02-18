import { API_URL, StorageKeys } from './constants';
import { safeGetItem } from './storage';
import type {
  User,
  Post,
  Restaurant,
  RestaurantMenu,
  Collection,
  Team,
  Comment,
  GlobalStats,
  PersonalStats,
  Achievement,
  SearchResults,
  LeaderboardEntry,
  TeamLeaderboardEntry,
  CreatePostData,
  CreateCollectionData,
  UpdateProfileData,
  FeedFilters,
  RestaurantFilters,
  Category,
  Coupon,
  UserCoupon,
  FlashSponsorship,
  FlashSponsorshipDrop,
  UserPreview,
  MysteryBox,
  TrendingDish,
  SponsoredPost,
} from '../types';
import {
  mockPosts,
  mockRestaurants,
  mockUsers,
  mockGlobalStats,
  mockPersonalStats,
  mockCollections,
  mockLeaderboard,
  mockAchievements,
  mockCategories,
  mockCoupons,
  mockFlashSponsorship,
  mockMysteryBox,
  mockTrendingDishes,
  mockSponsoredPost,
  mockCommunityCollections,
  COIN_THRESHOLDS,
  getMenuForRestaurant,
} from './mockData';

// Enable mock mode for demos
const USE_MOCK_DATA = true;

// API client with authentication
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await safeGetItem(StorageKeys.AUTH_TOKEN);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    username: string;
    name: string;
  }): Promise<{ user: User; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  async updateLocation(data: {
    latitude: number;
    longitude: number;
    city?: string;
  }): Promise<void> {
    return this.request('/auth/update-location', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // User endpoints
  async getUser(userId: string): Promise<{ user: User }> {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId: string, data: UpdateProfileData): Promise<{ user: User }> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserPosts(
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/users/${userId}/posts?${params}`);
  }

  async getUserLikes(
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<{ likes: Post[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/users/${userId}/likes?${params}`);
  }

  async getFollowers(
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<{ followers: User[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/users/${userId}/followers?${params}`);
  }

  async getFollowing(
    userId: string,
    cursor?: string,
    limit = 20
  ): Promise<{ following: User[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/users/${userId}/following?${params}`);
  }

  async followUser(userId: string): Promise<void> {
    return this.request(`/users/${userId}/follow`, { method: 'POST' });
  }

  async unfollowUser(userId: string): Promise<void> {
    return this.request(`/users/${userId}/follow`, { method: 'DELETE' });
  }

  // Post endpoints
  async getPosts(
    filters: FeedFilters = {},
    cursor?: string,
    limit = 20
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    if (USE_MOCK_DATA) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { posts: mockPosts, nextCursor: null };
    }
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters.feed) params.append('feed', filters.feed);
    if (filters.lat) params.append('lat', String(filters.lat));
    if (filters.lng) params.append('lng', String(filters.lng));
    if (filters.radius) params.append('radius', String(filters.radius));
    if (filters.cuisineType) params.append('cuisineType', filters.cuisineType);
    if (cursor) params.append('cursor', cursor);
    return this.request(`/posts?${params}`);
  }

  async getPost(postId: string): Promise<{ post: Post }> {
    return this.request(`/posts/${postId}`);
  }

  async createPost(data: CreatePostData): Promise<{ post: Post }> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePost(postId: string): Promise<void> {
    return this.request(`/posts/${postId}`, { method: 'DELETE' });
  }

  async likePost(postId: string): Promise<void> {
    return this.request(`/posts/${postId}/like`, { method: 'POST' });
  }

  async unlikePost(postId: string): Promise<void> {
    return this.request(`/posts/${postId}/like`, { method: 'DELETE' });
  }

  async savePost(postId: string, collectionId?: string): Promise<void> {
    return this.request(`/posts/${postId}/save`, {
      method: 'POST',
      body: JSON.stringify({ collectionId }),
    });
  }

  async unsavePost(postId: string): Promise<void> {
    return this.request(`/posts/${postId}/save`, { method: 'DELETE' });
  }

  async getComments(
    postId: string,
    cursor?: string,
    limit = 50
  ): Promise<{ comments: Comment[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/posts/${postId}/comments?${params}`);
  }

  async addComment(
    postId: string,
    content: string,
    parentId?: string
  ): Promise<{ comment: Comment }> {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  }

  // Restaurant endpoints
  async getRestaurants(
    filters: RestaurantFilters = {},
    cursor?: string,
    limit = 20
  ): Promise<{ restaurants: Restaurant[]; nextCursor: string | null }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { restaurants: mockRestaurants.slice(0, limit), nextCursor: null };
    }
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters.lat) params.append('lat', String(filters.lat));
    if (filters.lng) params.append('lng', String(filters.lng));
    if (filters.radius) params.append('radius', String(filters.radius));
    if (filters.cuisine) params.append('cuisine', filters.cuisine);
    if (filters.priceLevel) params.append('priceLevel', String(filters.priceLevel));
    if (filters.search) params.append('search', filters.search);
    if (cursor) params.append('cursor', cursor);
    return this.request(`/restaurants?${params}`);
  }

  async getNearbyRestaurants(
    lat: number,
    lng: number,
    limit = 10
  ): Promise<{ restaurants: Restaurant[] }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { restaurants: mockRestaurants.slice(0, limit) };
    }
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      limit: String(limit),
    });
    return this.request(`/restaurants/nearby?${params}`);
  }

  async getRestaurant(restaurantId: string): Promise<{ restaurant: Restaurant }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const restaurant = mockRestaurants.find(r => r.id === restaurantId);
      if (!restaurant) throw new Error('Restaurant not found');
      return { restaurant };
    }
    return this.request(`/restaurants/${restaurantId}`);
  }

  async getRestaurantPosts(
    restaurantId: string,
    sort = 'recent',
    cursor?: string,
    limit = 20
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const posts = mockPosts.filter(p => p.restaurantId === restaurantId);
      return { posts, nextCursor: null };
    }
    const params = new URLSearchParams({ sort, limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/restaurants/${restaurantId}/posts?${params}`);
  }

  async getRestaurantMenu(restaurantId: string): Promise<{ menu: RestaurantMenu }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const restaurant = mockRestaurants.find(r => r.id === restaurantId);
      if (!restaurant) throw new Error('Restaurant not found');
      return { menu: getMenuForRestaurant(restaurant) };
    }
    return this.request(`/restaurants/${restaurantId}/menu`);
  }

  async createRestaurant(data: Partial<Restaurant>): Promise<{ restaurant: Restaurant }> {
    return this.request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Collection endpoints
  async getCollections(): Promise<{ collections: Collection[] }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { collections: mockCollections };
    }
    return this.request('/collections');
  }

  async getPublicCollections(
    userId?: string,
    cursor?: string,
    limit = 20
  ): Promise<{ collections: Collection[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (userId) params.append('userId', userId);
    if (cursor) params.append('cursor', cursor);
    return this.request(`/collections/public?${params}`);
  }

  async getCollection(
    collectionId: string,
    cursor?: string,
    limit = 20
  ): Promise<{ collection: Collection; items: Post[]; nextCursor: string | null }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const collection = mockCollections.find(c => c.id === collectionId)
        || mockCommunityCollections.find(c => c.id === collectionId);
      if (!collection) throw new Error('Collection not found');
      // Return collection with mock posts
      const items = mockPosts.slice(0, limit);
      return { collection, items, nextCursor: null };
    }

    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/collections/${collectionId}?${params}`);
  }

  async createCollection(data: CreateCollectionData): Promise<{ collection: Collection }> {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(
    collectionId: string,
    data: Partial<CreateCollectionData>
  ): Promise<{ collection: Collection }> {
    return this.request(`/collections/${collectionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(collectionId: string): Promise<void> {
    return this.request(`/collections/${collectionId}`, { method: 'DELETE' });
  }

  async addToCollection(collectionId: string, postId: string): Promise<void> {
    return this.request(`/collections/${collectionId}/items`, {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  }

  async removeFromCollection(collectionId: string, postId: string): Promise<void> {
    return this.request(`/collections/${collectionId}/items/${postId}`, {
      method: 'DELETE',
    });
  }

  // Impact endpoints
  async getGlobalStats(): Promise<{ stats: GlobalStats }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { stats: mockGlobalStats };
    }
    return this.request('/impact/global');
  }

  async getPersonalStats(): Promise<{
    stats: PersonalStats;
    team: Team | null;
    achievements: Achievement[];
  }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        stats: mockPersonalStats,
        team: {
          id: 'team-bc',
          name: 'Boston College',
          slug: 'boston-college',
          type: 'university',
          logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Boston_College_Eagles_logo.svg/150px-Boston_College_Eagles_logo.svg.png',
          city: 'Chestnut Hill',
          state: 'MA',
          memberCount: 1234,
          totalMeals: 45678,
          currentGoal: 50000,
        },
        achievements: mockAchievements.slice(0, 3),
      };
    }
    return this.request('/impact/personal');
  }

  async makeDonation(
    mealCount: number,
    stripePaymentId?: string
  ): Promise<{ message: string; mealCount: number; amount: number }> {
    return this.request('/impact/donations', {
      method: 'POST',
      body: JSON.stringify({ mealCount, stripePaymentId }),
    });
  }

  async getDonationHistory(
    cursor?: string,
    limit = 20
  ): Promise<{ donations: any[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/impact/donations?${params}`);
  }

  async getFriendsLeaderboard(limit = 10): Promise<{ leaderboard: LeaderboardEntry[] }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { leaderboard: mockLeaderboard.slice(0, limit) };
    }
    return this.request(`/impact/leaderboard/friends?limit=${limit}`);
  }

  async getGlobalLeaderboard(limit = 50): Promise<{ leaderboard: LeaderboardEntry[] }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { leaderboard: mockLeaderboard.slice(0, limit) };
    }
    return this.request(`/impact/leaderboard/global?limit=${limit}`);
  }

  async getAllAchievements(): Promise<{ achievements: Achievement[] }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { achievements: mockAchievements };
    }
    return this.request('/impact/achievements');
  }

  // Team endpoints
  async getTeams(
    type?: string,
    search?: string,
    cursor?: string,
    limit = 20
  ): Promise<{ teams: Team[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    if (cursor) params.append('cursor', cursor);
    return this.request(`/teams?${params}`);
  }

  async getTeamLeaderboard(
    type?: string,
    limit = 20
  ): Promise<{ leaderboard: TeamLeaderboardEntry[] }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (type) params.append('type', type);
    return this.request(`/teams/leaderboard?${params}`);
  }

  async getTeam(teamId: string): Promise<{ team: Team; topMembers: User[] }> {
    return this.request(`/teams/${teamId}`);
  }

  async getTeamMembers(
    teamId: string,
    cursor?: string,
    limit = 20
  ): Promise<{ members: User[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.append('cursor', cursor);
    return this.request(`/teams/${teamId}/members?${params}`);
  }

  async joinTeam(teamId: string): Promise<void> {
    return this.request(`/teams/${teamId}/join`, { method: 'POST' });
  }

  async leaveTeam(teamId: string): Promise<void> {
    return this.request(`/teams/${teamId}/leave`, { method: 'DELETE' });
  }

  // Search endpoints
  async search(
    query: string,
    type?: string,
    lat?: number,
    lng?: number,
    limit = 10
  ): Promise<{ results: SearchResults; query: string }> {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (type) params.append('type', type);
    if (lat) params.append('lat', String(lat));
    if (lng) params.append('lng', String(lng));
    return this.request(`/search?${params}`);
  }

  async getSearchSuggestions(
    query: string
  ): Promise<{ suggestions: Array<{ type: string; text: string; slug?: string }> }> {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { categories: mockCategories };
    }
    return this.request('/search/categories');
  }

  // Coupon endpoints (API)
  async getCoupons(restaurantId?: string): Promise<{ coupons: Coupon[]; coinBalance: number; thresholds: typeof COIN_THRESHOLDS }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        coupons: mockCoupons,
        coinBalance: mockPersonalStats.coinBalance,
        thresholds: COIN_THRESHOLDS,
      };
    }
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    return this.request(`/coupons?${params}`);
  }

  async getMyCoupons(): Promise<{ coupons: UserCoupon[] }> {
    return this.request('/coupons/mine');
  }

  async claimCoupon(couponId: string): Promise<{ userCoupon: UserCoupon; message: string; coinsSpent: number }> {
    return this.request(`/coupons/${couponId}/claim`, { method: 'POST' });
  }

  async useCoupon(userCouponId: string): Promise<{ message: string }> {
    return this.request(`/coupons/${userCouponId}/use`, { method: 'POST' });
  }

  async redeemCoupon(couponId: string): Promise<{ coupon: Coupon }> {
    return this.request(`/coupons/${couponId}/redeem`, { method: 'POST' });
  }

  // Flash Sponsorship endpoints
  async getSponsorships(): Promise<{ sponsorships: FlashSponsorship[] }> {
    return this.request('/sponsorships');
  }

  async getActiveSponsorship(): Promise<{ sponsorship: FlashSponsorship | null }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { sponsorship: mockFlashSponsorship };
    }
    return this.request('/sponsorships/active');
  }

  async getSponsorship(sponsorshipId: string): Promise<{
    sponsorship: FlashSponsorship & {
      topContributors: Array<UserPreview & { dropCount: number }>;
      drops: FlashSponsorshipDrop[];
    };
  }> {
    return this.request(`/sponsorships/${sponsorshipId}`);
  }

  async getRestaurantSponsorships(restaurantId: string): Promise<{ sponsorships: FlashSponsorship[] }> {
    return this.request(`/sponsorships/restaurant/${restaurantId}`);
  }

  async recordSponsorshipDrop(sponsorshipId: string, postId?: string): Promise<{
    drop: FlashSponsorshipDrop;
    goalReached: boolean;
    message: string;
  }> {
    return this.request(`/sponsorships/${sponsorshipId}/drop`, {
      method: 'POST',
      body: JSON.stringify({ postId }),
    });
  }

  // Mystery Box endpoints
  async getMysteryBox(): Promise<{ mysteryBox: MysteryBox | null }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { mysteryBox: mockMysteryBox };
    }
    return this.request('/mystery-box/today');
  }

  async openMysteryBox(boxId: string): Promise<{ mysteryBox: MysteryBox }> {
    return this.request(`/mystery-box/${boxId}/open`, { method: 'POST' });
  }

  // Trending endpoints
  async getTrendingDishes(limit = 6): Promise<{ dishes: TrendingDish[] }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { dishes: mockTrendingDishes.slice(0, limit) };
    }
    return this.request(`/trending/dishes?limit=${limit}`);
  }

  // Sponsored content
  async getSponsoredPost(): Promise<{ sponsored: SponsoredPost | null }> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { sponsored: mockSponsoredPost };
    }
    return this.request('/sponsored/feed');
  }
}

// Export singleton instance
export const api = new ApiClient(API_URL);

export default api;
