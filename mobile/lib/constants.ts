// API configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Colors - Dish Drop dark theme
export const Colors = {
  // Primary colors
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#1acae7',

  // Background colors
  background: '#000000',
  card: '#1a1a1a',
  cardHover: '#252525',
  surface: '#121212',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',

  // Rating colors (1-10 scale)
  rating: {
    excellent: '#22c55e',   // 9-10
    great: '#84cc16',       // 7-8
    good: '#eab308',        // 5-6
    fair: '#f97316',        // 3-4
    poor: '#ef4444',        // 1-2
  },

  // Status colors
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',

  // UI colors
  border: '#333333',
  divider: '#2a2a2a',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Tab bar
  tabBarBackground: '#000000',
  tabBarActive: '#1acae7',
  tabBarInactive: '#666666',
};

// Get color for rating (1-10)
export function getRatingColor(rating: number): string {
  if (rating >= 9) return Colors.rating.excellent;
  if (rating >= 7) return Colors.rating.great;
  if (rating >= 5) return Colors.rating.good;
  if (rating >= 3) return Colors.rating.fair;
  return Colors.rating.poor;
}

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Font sizes
export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

// Font weights
export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Dietary tags
export const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Keto',
  'Paleo',
];

// Cuisine types
export const CUISINE_TYPES = [
  'American',
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'Thai',
  'Vietnamese',
  'Korean',
  'Mediterranean',
  'French',
  'Greek',
  'Middle Eastern',
  'Caribbean',
  'Soul Food',
  'Seafood',
  'BBQ',
  'Pizza',
  'Burgers',
  'Sushi',
  'Ramen',
  'Tacos',
  'Brunch',
  'Desserts',
  'Coffee',
];

// Price levels
export const PRICE_LEVELS = [
  { value: 1, label: '$', description: 'Under $15' },
  { value: 2, label: '$$', description: '$15-30' },
  { value: 3, label: '$$$', description: '$30-60' },
  { value: 4, label: '$$$$', description: 'Over $60' },
];

// Storage keys
export const StorageKeys = {
  AUTH_TOKEN: 'dish_drop_auth_token',
  USER_DATA: 'dish_drop_user_data',
  ONBOARDING_COMPLETE: 'dish_drop_onboarding',
  LAST_LOCATION: 'dish_drop_last_location',
};

// Feed types
export type FeedType = 'friends' | 'nearby';

// Default avatar
export const DEFAULT_AVATAR = 'https://via.placeholder.com/150/1a1a1a/1acae7?text=DD';

// Distance calculation (haversine formula, returns miles)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance filter presets (miles)
export const DISTANCE_OPTIONS = [
  { value: 0.5, label: '0.5 mi' },
  { value: 1, label: '1 mi' },
  { value: 3, label: '3 mi' },
  { value: 5, label: '5 mi' },
  { value: 10, label: '10 mi' },
];

// Rating filter presets
export const RATING_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
  { value: 9, label: '9+' },
];

// Image dimensions
export const ImageDimensions = {
  thumbnail: { width: 150, height: 150 },
  post: { width: 1080, height: 1080 },
  profile: { width: 400, height: 400 },
  cover: { width: 1200, height: 400 },
};
