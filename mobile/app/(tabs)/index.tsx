import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, getRatingColor } from '../../lib/constants';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Post, FeedType } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const POST_HEIGHT = SCREEN_HEIGHT - 180; // Full screen minus tab bar and header

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const [feedType, setFeedType] = useState<FeedType>('nearby');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (!refresh && !nextCursor) {
        setIsLoading(true);
      }

      const cursor = refresh ? undefined : nextCursor || undefined;

      // For demo, using nearby feed with sample coordinates
      const { posts: newPosts, nextCursor: newCursor } = await api.getPosts(
        {
          feed: feedType,
          lat: 42.3361,  // Boston College coordinates
          lng: -71.1677,
          radius: 10000,
        },
        cursor,
        10
      );

      if (refresh) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setNextCursor(newCursor);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [feedType, nextCursor]);

  useEffect(() => {
    loadPosts(true);
  }, [feedType]);

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await api.unlikePost(postId);
      } else {
        await api.likePost(postId);
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !isLiked,
                likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (postId: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        await api.unsavePost(postId);
      } else {
        await api.savePost(postId);
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isSaved: !isSaved,
                saveCount: isSaved ? p.saveCount - 1 : p.saveCount + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={styles.postContainer}>
      {/* Background Image */}
      <Image
        source={{ uri: post.imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* Overlay gradient */}
      <View style={styles.overlay} />

      {/* User info (top left) */}
      <Pressable
        style={styles.userInfo}
        onPress={() => router.push(`/profile/${post.user.id}`)}
      >
        <Image
          source={{ uri: post.user.profileImage || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.username}>@{post.user.username}</Text>
          {post.user.mealStreak && post.user.mealStreak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={12} color={Colors.warning} />
              <Text style={styles.streakText}>{post.user.mealStreak} day streak</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Action buttons (right side) */}
      <View style={styles.actionButtons}>
        <Pressable
          style={styles.actionButton}
          onPress={() => handleLike(post.id, post.isLiked || false)}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={post.isLiked ? Colors.error : Colors.text}
          />
          <Text style={styles.actionCount}>{post.likeCount}</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <Ionicons name="chatbubble-outline" size={26} color={Colors.text} />
          <Text style={styles.actionCount}>{post.commentCount}</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => handleSave(post.id, post.isSaved || false)}
        >
          <Ionicons
            name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={post.isSaved ? Colors.accent : Colors.text}
          />
          <Text style={styles.actionCount}>{post.saveCount}</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Ionicons name="share-outline" size={26} color={Colors.text} />
        </Pressable>
      </View>

      {/* Dish info (bottom) */}
      <View style={styles.dishInfo}>
        <View style={styles.dishHeader}>
          <Text style={styles.dishName}>{post.dishName}</Text>
          <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(post.rating) }]}>
            <Text style={styles.ratingText}>{post.rating}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push(`/restaurant/${post.restaurant.id}`)}
        >
          <View style={styles.restaurantRow}>
            <Ionicons name="location" size={14} color={Colors.accent} />
            <Text style={styles.restaurantName}>{post.restaurant.name}</Text>
            {post.restaurant.city && (
              <Text style={styles.restaurantCity}> • {post.restaurant.city}</Text>
            )}
          </View>
        </Pressable>

        {post.caption && (
          <Text style={styles.caption} numberOfLines={2}>
            {post.caption}
          </Text>
        )}

        {post.donationMade && (
          <View style={styles.donationBadge}>
            <Ionicons name="heart" size={12} color={Colors.error} />
            <Text style={styles.donationText}>
              {post.mealsDonated} meal{post.mealsDonated !== 1 ? 's' : ''} donated
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading dishes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Feed type toggle */}
      <View style={styles.feedToggle}>
        <Pressable
          style={[styles.feedButton, feedType === 'friends' && styles.feedButtonActive]}
          onPress={() => setFeedType('friends')}
        >
          <Text style={[styles.feedButtonText, feedType === 'friends' && styles.feedButtonTextActive]}>
            Friends
          </Text>
        </Pressable>
        <Pressable
          style={[styles.feedButton, feedType === 'nearby' && styles.feedButtonActive]}
          onPress={() => setFeedType('nearby')}
        >
          <Text style={[styles.feedButtonText, feedType === 'nearby' && styles.feedButtonTextActive]}>
            Nearby
          </Text>
        </Pressable>
      </View>

      {/* Posts feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={POST_HEIGHT}
        decelerationRate="fast"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadPosts(true)}
            tintColor={Colors.accent}
          />
        }
        onEndReached={() => {
          if (nextCursor && !isLoading) {
            loadPosts();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No dishes yet</Text>
            <Text style={styles.emptySubtext}>
              {feedType === 'friends'
                ? 'Follow people to see their posts here'
                : 'Be the first to share a dish nearby!'}
            </Text>
          </View>
        }
      />
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
  loadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
  },
  feedToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  feedButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  feedButtonActive: {
    backgroundColor: Colors.accent,
  },
  feedButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  feedButtonTextActive: {
    color: Colors.background,
  },
  postContainer: {
    width: SCREEN_WIDTH,
    height: POST_HEIGHT,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.card,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  userInfo: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  username: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakText: {
    color: Colors.warning,
    fontSize: FontSizes.xs,
  },
  actionButtons: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 150,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  dishInfo: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.md,
    right: 70,
  },
  dishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dishName: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    color: Colors.background,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restaurantName: {
    color: Colors.accent,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  restaurantCity: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  caption: {
    color: Colors.text,
    fontSize: FontSizes.md,
    marginTop: Spacing.sm,
  },
  donationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  donationText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
  },
  emptyContainer: {
    flex: 1,
    height: POST_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
