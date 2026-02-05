/**
 * Safe AsyncStorage utilities with error handling
 * Prevents crashes when storage is unavailable or corrupted
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Safely get an item from AsyncStorage
 * Returns null if storage is unavailable or the key doesn't exist
 */
export async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get storage key "${key}":`, error);
    return null;
  }
}

/**
 * Safely set an item in AsyncStorage
 * Returns true if successful, false otherwise
 */
export async function safeSetItem(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set storage key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove an item from AsyncStorage
 * Returns true if successful, false otherwise
 */
export async function safeRemoveItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove storage key "${key}":`, error);
    return false;
  }
}

/**
 * Safely get and parse JSON from AsyncStorage
 * Returns the default value if parsing fails or key doesn't exist
 */
export async function safeGetJSON<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const item = await AsyncStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse storage key "${key}":`, error);
    // Try to remove corrupted data
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore removal errors
    }
    return defaultValue;
  }
}

/**
 * Safely stringify and set JSON in AsyncStorage
 * Returns true if successful, false otherwise
 */
export async function safeSetJSON(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to save storage key "${key}":`, error);
    return false;
  }
}

/**
 * Check if AsyncStorage is available
 */
export async function isStorageAvailable(): Promise<boolean> {
  try {
    const testKey = '__storage_test__';
    await AsyncStorage.setItem(testKey, testKey);
    await AsyncStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all app storage (for logout)
 */
export async function clearAllStorage(): Promise<boolean> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter((key) => key.startsWith('dish_drop_'));
    await AsyncStorage.multiRemove(appKeys);
    return true;
  } catch (error) {
    console.warn('Failed to clear storage:', error);
    return false;
  }
}

/**
 * Get multiple items at once
 */
export async function safeMultiGet(keys: string[]): Promise<Record<string, string | null>> {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    return Object.fromEntries(pairs);
  } catch (error) {
    console.warn('Failed to get multiple storage keys:', error);
    return Object.fromEntries(keys.map((k) => [k, null]));
  }
}

/**
 * Set multiple items at once
 */
export async function safeMultiSet(
  items: Array<[string, string]>
): Promise<boolean> {
  try {
    await AsyncStorage.multiSet(items);
    return true;
  } catch (error) {
    console.warn('Failed to set multiple storage keys:', error);
    return false;
  }
}
