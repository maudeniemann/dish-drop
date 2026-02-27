import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../lib/constants';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Collection } from '../../types';
import { mockPosts, mockUsers, mockRestaurants } from '../../lib/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.72;
const MY_COLLECTION_WIDTH = 150;
const CREATOR_CARD_WIDTH = 140;

// ─── Featured / Community Collections ──────────────────────────────
interface FeaturedCollection {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  creatorImage: string;
  itemCount: number;
  followerCount: number;
  coverImage: string;
  gradientColors: [string, string];
}

const featuredCollections: FeaturedCollection[] = [
  {
    id: 'feat-1',
    name: 'Best Late Night Eats Near BC',
    description: 'Open past midnight when you need fuel for that all-nighter',
    creatorName: 'eagle_eater',
    creatorImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    itemCount: 18,
    followerCount: 342,
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    gradientColors: ['#0f172a', '#1e3a5f'],
  },
  {
    id: 'feat-2',
    name: 'Top Burgers in Boston',
    description: 'The juiciest, most stacked burgers from Allston to Back Bay',
    creatorName: 'burger_baron',
    creatorImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    itemCount: 24,
    followerCount: 891,
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    gradientColors: ['#4a1c1c', '#7c2d12'],
  },
  {
    id: 'feat-3',
    name: 'Date Night Spots',
    description: 'Romantic restaurants perfect for impressing your special someone',
    creatorName: 'brunch_boss',
    creatorImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    itemCount: 15,
    followerCount: 567,
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
    gradientColors: ['#3b0764', '#581c87'],
  },
  {
    id: 'feat-4',
    name: 'Cheap Eats Under $10',
    description: 'Delicious meals that won\'t break the college budget',
    creatorName: 'bc_eats',
    creatorImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    itemCount: 31,
    followerCount: 1205,
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    gradientColors: ['#14532d', '#166534'],
  },
  {
    id: 'feat-5',
    name: 'Hidden Gems of Brookline',
    description: 'Underrated spots the locals swear by',
    creatorName: 'newton_native',
    creatorImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    itemCount: 12,
    followerCount: 278,
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
    gradientColors: ['#172554', '#1e40af'],
  },
];

// ─── Trending Collections ──────────────────────────────────────────
interface TrendingCollection {
  id: string;
  name: string;
  creatorName: string;
  creatorImage: string;
  itemCount: number;
  followerCount: number;
  previewImages: string[];
}

const trendingCollections: TrendingCollection[] = [
  {
    id: 'trend-1',
    name: 'Ramen Rankings',
    creatorName: 'noodle_ninja',
    creatorImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    itemCount: 14,
    followerCount: 456,
    previewImages: [
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=200',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=200',
    ],
  },
  {
    id: 'trend-2',
    name: 'Best Brunch Spots',
    creatorName: 'brunch_boss',
    creatorImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    itemCount: 20,
    followerCount: 723,
    previewImages: [
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200',
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200',
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200',
    ],
  },
  {
    id: 'trend-3',
    name: 'Spice Trail: Hottest Dishes',
    creatorName: 'spice_lover',
    creatorImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
    itemCount: 17,
    followerCount: 389,
    previewImages: [
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=200',
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200',
    ],
  },
  {
    id: 'trend-4',
    name: 'Study Cafe Vibes',
    creatorName: 'sofiasnacks',
    creatorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    itemCount: 11,
    followerCount: 534,
    previewImages: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
    ],
  },
  {
    id: 'trend-5',
    name: 'Pizza Pilgrimage',
    creatorName: 'chef_mike',
    creatorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    itemCount: 16,
    followerCount: 612,
    previewImages: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
    ],
  },
  {
    id: 'trend-6',
    name: 'Dessert Heaven',
    creatorName: 'dessert_diva',
    creatorImage: 'https://images.unsplash.com/photo-1502767089025-6572583d8c40?w=150',
    itemCount: 22,
    followerCount: 847,
    previewImages: [
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200',
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200',
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200',
    ],
  },
];

// ─── Creator Profiles ──────────────────────────────────────────────
interface CreatorProfile {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  followerCount: number;
  postCount: number;
  specialty: string;
  isFollowing: boolean;
}

const nearbyCreators: CreatorProfile[] = [
  {
    id: mockUsers[0].id,
    username: 'spice_lover',
    name: 'Aisha Mohammed',
    profileImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
    followerCount: 1243,
    postCount: 87,
    specialty: 'Indian & Thai',
    isFollowing: false,
  },
  {
    id: mockUsers[1].id,
    username: 'eagle_eater',
    name: 'James O\'Brien',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    followerCount: 2156,
    postCount: 134,
    specialty: 'Late Night',
    isFollowing: true,
  },
  {
    id: mockUsers[2].id,
    username: 'noodle_ninja',
    name: 'David Wang',
    profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    followerCount: 1879,
    postCount: 96,
    specialty: 'Ramen & Noodles',
    isFollowing: false,
  },
  {
    id: mockUsers[4].id,
    username: 'burger_baron',
    name: 'Nick Russo',
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    followerCount: 3421,
    postCount: 201,
    specialty: 'Burgers & BBQ',
    isFollowing: false,
  },
  {
    id: mockUsers[8].id,
    username: 'chef_mike',
    name: 'Mike Patterson',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    followerCount: 987,
    postCount: 64,
    specialty: 'Italian & Pizza',
    isFollowing: false,
  },
  {
    id: mockUsers[10].id,
    username: 'sofiasnacks',
    name: 'Sofia Rodriguez',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    followerCount: 4532,
    postCount: 243,
    specialty: 'Cafe & Dessert',
    isFollowing: true,
  },
  {
    id: mockUsers[9].id,
    username: 'dessert_diva',
    name: 'Lily Zhang',
    profileImage: 'https://images.unsplash.com/photo-1502767089025-6572583d8c40?w=150',
    followerCount: 2678,
    postCount: 156,
    specialty: 'Sweets & Bakery',
    isFollowing: false,
  },
];

const topReviewers: CreatorProfile[] = [
  {
    id: mockUsers[10].id,
    username: 'sofiasnacks',
    name: 'Sofia Rodriguez',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    followerCount: 4532,
    postCount: 243,
    specialty: 'Cafe & Dessert',
    isFollowing: true,
  },
  {
    id: mockUsers[4].id,
    username: 'burger_baron',
    name: 'Nick Russo',
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    followerCount: 3421,
    postCount: 201,
    specialty: 'Burgers & BBQ',
    isFollowing: false,
  },
  {
    id: mockUsers[9].id,
    username: 'dessert_diva',
    name: 'Lily Zhang',
    profileImage: 'https://images.unsplash.com/photo-1502767089025-6572583d8c40?w=150',
    followerCount: 2678,
    postCount: 156,
    specialty: 'Sweets & Bakery',
    isFollowing: false,
  },
  {
    id: mockUsers[1].id,
    username: 'eagle_eater',
    name: 'James O\'Brien',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    followerCount: 2156,
    postCount: 134,
    specialty: 'Late Night',
    isFollowing: true,
  },
  {
    id: mockUsers[2].id,
    username: 'noodle_ninja',
    name: 'David Wang',
    profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    followerCount: 1879,
    postCount: 96,
    specialty: 'Ramen & Noodles',
    isFollowing: false,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────
function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function ListsScreen() {
  const { isAuthenticated } = useAuth();
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [followState, setFollowState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    [...nearbyCreators, ...topReviewers].forEach(c => {
      initial[c.id] = c.isFollowing;
    });
    return initial;
  });

  const loadCollections = useCallback(async () => {
    try {
      const { collections: data } = await api.getCollections();
      setMyCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCollections();
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }
    setIsCreating(true);
    try {
      const { collection } = await api.createCollection({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined,
      });
      setMyCollections(prev => [...prev, collection]);
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleFollow = (userId: string) => {
    setFollowState(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // ─── Section: Header ────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>Collections</Text>
      <Pressable
        style={styles.searchButton}
        onPress={() => {/* TODO: navigate to search */}}
      >
        <Ionicons name="search" size={22} color={Colors.text} />
      </Pressable>
    </View>
  );

  // ─── Section: My Collections (horizontal) ──────────────────────
  const renderMyCollections = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>My Collections</Text>
        <Text style={styles.sectionCount}>{myCollections.length}</Text>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: '__new__' } as any, ...myCollections]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => {
          if (item.id === '__new__') {
            return (
              <Pressable
                style={styles.newCollectionCard}
                onPress={() => setShowCreateModal(true)}
              >
                <View style={styles.newCollectionIcon}>
                  <Ionicons name="add" size={28} color={Colors.accent} />
                </View>
                <Text style={styles.newCollectionText}>New{'\n'}Collection</Text>
              </Pressable>
            );
          }
          const collection = item as Collection;
          return (
            <Pressable
              style={styles.myCollectionCard}
              onPress={() => router.push(`/collection/${collection.id}`)}
            >
              <View style={styles.myCollectionCover}>
                {collection.previewImages && collection.previewImages.length > 0 ? (
                  <Image
                    source={{ uri: collection.previewImages[0] }}
                    style={styles.myCollectionImage}
                  />
                ) : (
                  <View style={styles.myCollectionPlaceholder}>
                    <Ionicons name="images-outline" size={24} color={Colors.textMuted} />
                  </View>
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.myCollectionGradient}
                />
                <View style={styles.myCollectionBadge}>
                  <Text style={styles.myCollectionBadgeText}>{collection.itemCount}</Text>
                </View>
              </View>
              <Text style={styles.myCollectionName} numberOfLines={2}>
                {collection.name}
              </Text>
              <View style={styles.myCollectionMeta}>
                <Ionicons
                  name={collection.isPublic ? 'globe-outline' : 'lock-closed-outline'}
                  size={10}
                  color={Colors.textMuted}
                />
                <Text style={styles.myCollectionMetaText}>
                  {collection.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );

  // ─── Section: Featured Playlists (Spotify-style) ───────────────
  const renderFeaturedPlaylists = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Featured Collections</Text>
          <Text style={styles.sectionSubtitle}>Curated by the community</Text>
        </View>
        <Pressable style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
        </Pressable>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={featuredCollections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalList}
        snapToInterval={FEATURED_CARD_WIDTH + Spacing.md}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <Pressable
            style={styles.featuredCard}
            onPress={() => router.push(`/collection/${item.id}`)}
          >
            <Image
              source={{ uri: item.coverImage }}
              style={styles.featuredCoverImage}
            />
            <LinearGradient
              colors={[...item.gradientColors.map(c => c + 'dd'), item.gradientColors[1] + 'ff'] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.featuredGradient}
            />
            <View style={styles.featuredContent}>
              <View style={styles.featuredTop}>
                <View style={styles.featuredPlaylistBadge}>
                  <Ionicons name="musical-notes" size={10} color={Colors.accent} />
                  <Text style={styles.featuredPlaylistBadgeText}>COLLECTION</Text>
                </View>
              </View>
              <View style={styles.featuredBottom}>
                <Text style={styles.featuredName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.featuredDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.featuredMeta}>
                  <Image
                    source={{ uri: item.creatorImage }}
                    style={styles.featuredCreatorAvatar}
                  />
                  <Text style={styles.featuredCreatorName}>@{item.creatorName}</Text>
                  <Text style={styles.featuredDot}>·</Text>
                  <Text style={styles.featuredMetaText}>{item.itemCount} dishes</Text>
                  <Text style={styles.featuredDot}>·</Text>
                  <Text style={styles.featuredMetaText}>{formatCount(item.followerCount)} saves</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );

  // ─── Section: Creators Near You ────────────────────────────────
  const renderCreatorsNearYou = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Creators Near You</Text>
          <Text style={styles.sectionSubtitle}>Food lovers around Boston College</Text>
        </View>
        <Pressable style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
        </Pressable>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={nearbyCreators}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => {
          const isFollowing = followState[item.id] ?? false;
          return (
            <Pressable
              style={styles.creatorCard}
              onPress={() => router.push(`/profile/${item.id}`)}
            >
              <Image
                source={{ uri: item.profileImage }}
                style={styles.creatorAvatar}
              />
              <Text style={styles.creatorName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.creatorUsername} numberOfLines={1}>@{item.username}</Text>
              <Text style={styles.creatorSpecialty} numberOfLines={1}>{item.specialty}</Text>
              <View style={styles.creatorStats}>
                <Text style={styles.creatorStatValue}>{formatCount(item.followerCount)}</Text>
                <Text style={styles.creatorStatLabel}> followers</Text>
              </View>
              <Pressable
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                ]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  toggleFollow(item.id);
                }}
              >
                <Text style={[
                  styles.followButtonText,
                  isFollowing && styles.followingButtonText,
                ]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );

  // ─── Section: Trending Collections (grid) ──────────────────────
  const renderTrendingCollections = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Trending Collections</Text>
          <Text style={styles.sectionSubtitle}>Popular this week</Text>
        </View>
        <Pressable style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
        </Pressable>
      </View>
      <View style={styles.trendingGrid}>
        {trendingCollections.map((item) => (
          <Pressable
            key={item.id}
            style={styles.trendingCard}
            onPress={() => router.push(`/collection/${item.id}`)}
          >
            <View style={styles.trendingPreviewRow}>
              {item.previewImages.slice(0, 3).map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: img }}
                  style={[
                    styles.trendingPreviewImage,
                    i === 0 && styles.trendingPreviewLarge,
                  ]}
                />
              ))}
            </View>
            <View style={styles.trendingInfo}>
              <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.trendingMeta}>
                <Image
                  source={{ uri: item.creatorImage }}
                  style={styles.trendingCreatorAvatar}
                />
                <Text style={styles.trendingCreatorName} numberOfLines={1}>
                  @{item.creatorName}
                </Text>
              </View>
              <View style={styles.trendingStats}>
                <Text style={styles.trendingStatText}>
                  {item.itemCount} dishes · {formatCount(item.followerCount)} saves
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // ─── Section: Top Reviewers ────────────────────────────────────
  const renderTopReviewers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Top Reviewers</Text>
          <Text style={styles.sectionSubtitle}>Most active food critics near you</Text>
        </View>
      </View>
      <View style={styles.reviewersList}>
        {topReviewers.map((item, index) => {
          const isFollowing = followState[item.id] ?? false;
          return (
            <Pressable
              key={item.id}
              style={styles.reviewerRow}
              onPress={() => router.push(`/profile/${item.id}`)}
            >
              <Text style={styles.reviewerRank}>#{index + 1}</Text>
              <Image
                source={{ uri: item.profileImage }}
                style={styles.reviewerAvatar}
              />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{item.name}</Text>
                <Text style={styles.reviewerUsername}>
                  @{item.username} · {item.specialty}
                </Text>
                <View style={styles.reviewerStatsRow}>
                  <Text style={styles.reviewerStatText}>
                    {item.postCount} reviews
                  </Text>
                  <Text style={styles.reviewerDot}>·</Text>
                  <Text style={styles.reviewerStatText}>
                    {formatCount(item.followerCount)} followers
                  </Text>
                </View>
              </View>
              <Pressable
                style={[
                  styles.followButtonSmall,
                  isFollowing && styles.followingButtonSmall,
                ]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  toggleFollow(item.id);
                }}
              >
                <Text style={[
                  styles.followButtonSmallText,
                  isFollowing && styles.followingButtonSmallText,
                ]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  // ─── Loading State ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {renderHeader()}
        {myCollections.length > 0 && renderMyCollections()}
        {renderFeaturedPlaylists()}
        {renderCreatorsNearYou()}
        {renderTrendingCollections()}
        {renderTopReviewers()}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Create Collection Modal ─────────────────────────────── */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Best Tacos Near BC"
                  placeholderTextColor={Colors.textMuted}
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                  maxLength={50}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What's this collection about?"
                  placeholderTextColor={Colors.textMuted}
                  value={newCollectionDescription}
                  onChangeText={setNewCollectionDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>
              <Pressable
                style={[styles.submitButton, isCreating && styles.submitButtonDisabled]}
                onPress={handleCreateCollection}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={styles.submitButtonText}>Create Collection</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
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

  // ─── Page Header ────────────────────────────────────────────────
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  pageTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Section Layout ─────────────────────────────────────────────
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  sectionCount: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
  },
  seeAllText: {
    color: Colors.accent,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },

  // ─── My Collections (horizontal scroll) ─────────────────────────
  newCollectionCard: {
    width: MY_COLLECTION_WIDTH,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  newCollectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  newCollectionText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  myCollectionCard: {
    width: MY_COLLECTION_WIDTH,
  },
  myCollectionCover: {
    width: MY_COLLECTION_WIDTH,
    height: MY_COLLECTION_WIDTH,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.card,
  },
  myCollectionImage: {
    width: '100%',
    height: '100%',
  },
  myCollectionPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  myCollectionGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  myCollectionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  myCollectionBadgeText: {
    color: Colors.text,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  myCollectionName: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  myCollectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  myCollectionMetaText: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },

  // ─── Featured Playlists ─────────────────────────────────────────
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredCoverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  featuredTop: {
    flexDirection: 'row',
  },
  featuredPlaylistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  featuredPlaylistBadgeText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  featuredBottom: {},
  featuredName: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: FontSizes.sm,
    marginTop: 4,
    lineHeight: 18,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  featuredCreatorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredCreatorName: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FontSizes.xs,
    fontWeight: '500',
  },
  featuredDot: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: FontSizes.xs,
  },
  featuredMetaText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.xs,
  },

  // ─── Creator Cards ──────────────────────────────────────────────
  creatorCard: {
    width: CREATOR_CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    padding: Spacing.md,
  },
  creatorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.accent,
    marginBottom: Spacing.sm,
  },
  creatorName: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  creatorUsername: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
  creatorSpecialty: {
    color: Colors.accent,
    fontSize: FontSizes.xs,
    fontWeight: '500',
    marginTop: 4,
  },
  creatorStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  creatorStatValue: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  creatorStatLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
  },
  followButton: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    width: '100%',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  followButtonText: {
    color: Colors.background,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  followingButtonText: {
    color: Colors.textSecondary,
  },

  // ─── Trending Collections (grid) ────────────────────────────────
  trendingGrid: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  trendingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 100,
  },
  trendingPreviewRow: {
    width: 100,
    height: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingPreviewImage: {
    width: 50,
    height: 50,
    backgroundColor: Colors.surface,
  },
  trendingPreviewLarge: {
    width: 100,
    height: 50,
  },
  trendingInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  trendingName: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  trendingCreatorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  trendingCreatorName: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
  },
  trendingStats: {
    marginTop: 4,
  },
  trendingStatText: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },

  // ─── Top Reviewers (list) ──────────────────────────────────────
  reviewersList: {
    paddingHorizontal: Spacing.md,
  },
  reviewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  reviewerRank: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
    fontWeight: '700',
    width: 28,
  },
  reviewerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  reviewerUsername: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 1,
  },
  reviewerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewerStatText: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
  },
  reviewerDot: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginHorizontal: 4,
  },
  followButtonSmall: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  followingButtonSmall: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  followButtonSmallText: {
    color: Colors.background,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  followingButtonSmallText: {
    color: Colors.textSecondary,
  },

  // ─── Create Modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  modalForm: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
