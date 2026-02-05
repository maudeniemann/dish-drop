import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, getRatingColor, CUISINE_TYPES } from '../../lib/constants';
import { api } from '../../lib/api';
import type { Post, Restaurant, User, Collection, Category } from '../../types';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    dishes?: Post[];
    restaurants?: Restaurant[];
    users?: User[];
    collections?: Collection[];
  } | null>(null);

  const [trendingDishes, setTrendingDishes] = useState<Post[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [popularCollections, setPopularCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExploreData();
  }, []);

  const loadExploreData = async () => {
    try {
      setIsLoading(true);

      // Load trending dishes (nearby, high rating)
      const { posts } = await api.getPosts(
        { feed: 'nearby', lat: 42.3361, lng: -71.1677 },
        undefined,
        10
      );
      setTrendingDishes(posts);

      // Load nearby restaurants
      const { restaurants } = await api.getNearbyRestaurants(42.3361, -71.1677, 10);
      setNearbyRestaurants(restaurants);

      // Load popular collections
      const { collections } = await api.getPublicCollections(undefined, undefined, 10);
      setPopularCollections(collections);
    } catch (error) {
      console.error('Error loading explore data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const { results } = await api.search(query, undefined, 42.3361, -71.1677, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const renderDishCard = ({ item: dish }: { item: Post }) => (
    <Pressable
      style={styles.dishCard}
      onPress={() => router.push(`/post/${dish.id}`)}
    >
      <Image source={{ uri: dish.imageUrl }} style={styles.dishImage} />
      <View style={styles.dishOverlay}>
        <View style={[styles.dishRating, { backgroundColor: getRatingColor(dish.rating) }]}>
          <Text style={styles.dishRatingText}>{dish.rating}</Text>
        </View>
      </View>
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={1}>{dish.dishName}</Text>
        <Text style={styles.dishRestaurant} numberOfLines={1}>{dish.restaurant.name}</Text>
      </View>
    </Pressable>
  );

  const renderRestaurantCard = ({ item: restaurant }: { item: Restaurant }) => (
    <Pressable
      style={styles.restaurantCard}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
    >
      <Image
        source={{ uri: restaurant.logoUrl || 'https://via.placeholder.com/80' }}
        style={styles.restaurantLogo}
      />
      <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
      <View style={styles.restaurantStats}>
        <Ionicons name="star" size={12} color={Colors.warning} />
        <Text style={styles.restaurantRating}>
          {restaurant.averageRating?.toFixed(1) || 'New'}
        </Text>
      </View>
    </Pressable>
  );

  const renderCollectionCard = ({ item: collection }: { item: Collection }) => (
    <Pressable
      style={styles.collectionCard}
      onPress={() => router.push(`/collection/${collection.id}`)}
    >
      <View style={styles.collectionPreview}>
        {collection.previewImages?.slice(0, 4).map((url, i) => (
          <Image
            key={i}
            source={{ uri: url }}
            style={styles.collectionPreviewImage}
          />
        ))}
      </View>
      <Text style={styles.collectionName} numberOfLines={1}>{collection.name}</Text>
      <Text style={styles.collectionUser}>@{collection.user?.username}</Text>
    </Pressable>
  );

  const renderCategoryButton = (category: string) => (
    <Pressable
      key={category}
      style={styles.categoryButton}
      onPress={() => handleSearch(category)}
    >
      <Text style={styles.categoryText}>{category}</Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes, restaurants, users..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Search Results or Explore Content */}
      {searchResults ? (
        <ScrollView style={styles.searchResults}>
          {isSearching && (
            <ActivityIndicator color={Colors.accent} style={{ marginVertical: Spacing.md }} />
          )}

          {searchResults.dishes && searchResults.dishes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dishes</Text>
              {searchResults.dishes.map((dish) => (
                <Pressable
                  key={dish.id}
                  style={styles.searchResultItem}
                  onPress={() => router.push(`/post/${dish.id}`)}
                >
                  <Image source={{ uri: dish.imageUrl }} style={styles.searchResultImage} />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle}>{dish.dishName}</Text>
                    <Text style={styles.searchResultSubtitle}>{dish.restaurant.name}</Text>
                  </View>
                  <View style={[styles.searchResultRating, { backgroundColor: getRatingColor(dish.rating) }]}>
                    <Text style={styles.searchResultRatingText}>{dish.rating}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {searchResults.restaurants && searchResults.restaurants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Restaurants</Text>
              {searchResults.restaurants.map((restaurant) => (
                <Pressable
                  key={restaurant.id}
                  style={styles.searchResultItem}
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                >
                  <View style={styles.searchResultIcon}>
                    <Ionicons name="restaurant" size={24} color={Colors.accent} />
                  </View>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle}>{restaurant.name}</Text>
                    <Text style={styles.searchResultSubtitle}>{restaurant.city}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {searchResults.users && searchResults.users.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Users</Text>
              {searchResults.users.map((user) => (
                <Pressable
                  key={user.id}
                  style={styles.searchResultItem}
                  onPress={() => router.push(`/profile/${user.id}`)}
                >
                  <Image
                    source={{ uri: user.profileImage || 'https://via.placeholder.com/40' }}
                    style={styles.searchResultAvatar}
                  />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle}>{user.name}</Text>
                    <Text style={styles.searchResultSubtitle}>@{user.username}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.exploreContent}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <View style={styles.categoriesGrid}>
              {CUISINE_TYPES.slice(0, 12).map(renderCategoryButton)}
            </View>
          </View>

          {/* Trending Dishes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Nearby</Text>
            <FlatList
              horizontal
              data={trendingDishes}
              renderItem={renderDishCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Nearby Restaurants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurants Near You</Text>
            <FlatList
              horizontal
              data={nearbyRestaurants}
              renderItem={renderRestaurantCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Popular Collections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Collections</Text>
            <FlatList
              horizontal
              data={popularCollections}
              renderItem={renderCollectionCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: FontSizes.md,
  },
  searchResults: {
    flex: 1,
  },
  exploreContent: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  horizontalList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryText: {
    color: Colors.text,
    fontSize: FontSizes.sm,
  },
  dishCard: {
    width: 160,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  dishImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surface,
  },
  dishOverlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  dishRating: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  dishRatingText: {
    color: Colors.background,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  dishInfo: {
    padding: Spacing.sm,
  },
  dishName: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  dishRestaurant: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  restaurantCard: {
    width: 100,
    alignItems: 'center',
  },
  restaurantLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.card,
  },
  restaurantName: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  restaurantStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  restaurantRating: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
  },
  collectionCard: {
    width: 150,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  collectionPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  collectionPreviewImage: {
    width: 75,
    height: 75,
    backgroundColor: Colors.surface,
  },
  collectionName: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  collectionUser: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
  },
  searchResultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
  },
  searchResultIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  searchResultSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  searchResultRating: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  searchResultRatingText: {
    color: Colors.background,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
});
