import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/constants';
import { api } from '../lib/api';
import type { FlashSponsorship } from '../types';

interface Props {
  limit?: number;
}

export default function FlashSponsorships({ limit = 5 }: Props) {
  const [sponsorships, setSponsorships] = useState<FlashSponsorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSponsorships();
  }, []);

  const loadSponsorships = async () => {
    try {
      const { sponsorships: data } = await api.getSponsorships();
      setSponsorships(data.slice(0, limit));
    } catch (error) {
      console.error('Error loading sponsorships:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon!';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (sponsorships.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flash" size={20} color={Colors.warning} />
          <Text style={styles.title}>Flash Sponsorships</Text>
        </View>
        <Pressable onPress={() => router.push('/sponsorships')}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sponsorships.map((sponsorship) => (
          <Pressable
            key={sponsorship.id}
            style={styles.card}
            onPress={() => router.push(`/sponsorship/${sponsorship.id}`)}
          >
            <Image
              source={{ uri: sponsorship.bannerUrl || sponsorship.restaurant.coverImage }}
              style={styles.cardImage}
            />
            <View style={styles.cardOverlay}>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${sponsorship.progress || 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {sponsorship.currentDrops}/{sponsorship.targetDrops} drops
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {sponsorship.title}
              </Text>

              <View style={styles.restaurantRow}>
                {sponsorship.restaurant.logoUrl && (
                  <Image
                    source={{ uri: sponsorship.restaurant.logoUrl }}
                    style={styles.restaurantLogo}
                  />
                )}
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {sponsorship.restaurant.name}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Ionicons name="heart" size={14} color={Colors.error} />
                  <Text style={styles.statText}>
                    {sponsorship.totalMealsPledged} meals
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="time" size={14} color={Colors.warning} />
                  <Text style={styles.statText}>
                    {formatTimeRemaining(sponsorship.timeRemaining || 0)}
                  </Text>
                </View>
              </View>

              {sponsorship.charityName && (
                <Text style={styles.charity}>
                  Supporting {sponsorship.charityName}
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  seeAll: {
    color: Colors.accent,
    fontSize: FontSizes.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    width: 280,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surface,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  progressContainer: {
    gap: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  progressText: {
    color: Colors.text,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  restaurantLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  restaurantName: {
    color: Colors.accent,
    fontSize: FontSizes.sm,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  charity: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
