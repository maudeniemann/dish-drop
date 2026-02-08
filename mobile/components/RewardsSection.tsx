import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../lib/constants';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Coupon } from '../types';

interface Props {
  limit?: number;
}

export default function RewardsSection({ limit = 10 }: Props) {
  const { user, refreshUser } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { coupons: data } = await api.getCoupons();
      setCoupons(data.slice(0, limit));
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimCoupon = async (coupon: Coupon) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (user.coins < coupon.coinCost) {
      Alert.alert(
        'Not Enough Coins',
        `You need ${coupon.coinCost - user.coins} more coins to claim this reward. Keep posting to earn more!`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Claim Reward',
      `Spend ${coupon.coinCost} coins to claim "${coupon.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            setClaimingId(coupon.id);
            try {
              const { message } = await api.claimCoupon(coupon.id);
              Alert.alert('Success!', message);
              // Refresh user to update coin balance
              await refreshUser();
              // Update coupon state
              setCoupons((prev) =>
                prev.map((c) =>
                  c.id === coupon.id ? { ...c, isClaimed: true } : c
                )
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to claim coupon');
            } finally {
              setClaimingId(null);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (coupons.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="gift" size={20} color={Colors.accent} />
          <Text style={styles.title}>Rewards</Text>
        </View>
        <View style={styles.coinBadge}>
          <Ionicons name="logo-bitcoin" size={16} color={Colors.warning} />
          <Text style={styles.coinCount}>{user?.coins || 0}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Earn 1 coin per Drop! Redeem for exclusive rewards.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {coupons.map((coupon) => {
          const canAfford = (user?.coins || 0) >= coupon.coinCost;
          const isClaimed = coupon.isClaimed;

          return (
            <View key={coupon.id} style={styles.card}>
              <Image
                source={{ uri: coupon.imageUrl || coupon.restaurant.logoUrl }}
                style={styles.cardImage}
              />

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {coupon.title}
                </Text>

                <Text style={styles.restaurantName} numberOfLines={1}>
                  {coupon.restaurant.name}
                </Text>

                {coupon.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {coupon.description}
                  </Text>
                )}

                <View style={styles.footer}>
                  <View style={styles.costBadge}>
                    <Ionicons name="logo-bitcoin" size={14} color={Colors.warning} />
                    <Text style={styles.costText}>{coupon.coinCost}</Text>
                  </View>

                  {isClaimed ? (
                    <View style={styles.claimedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                      <Text style={styles.claimedText}>Claimed</Text>
                    </View>
                  ) : (
                    <Pressable
                      style={[
                        styles.claimButton,
                        !canAfford && styles.claimButtonDisabled,
                      ]}
                      onPress={() => handleClaimCoupon(coupon)}
                      disabled={!canAfford || claimingId === coupon.id}
                    >
                      {claimingId === coupon.id ? (
                        <ActivityIndicator size="small" color={Colors.background} />
                      ) : (
                        <Text
                          style={[
                            styles.claimButtonText,
                            !canAfford && styles.claimButtonTextDisabled,
                          ]}
                        >
                          {canAfford ? 'Claim' : 'Need more'}
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>

                {coupon.remaining !== null && coupon.remaining !== undefined && (
                  <Text style={styles.remaining}>
                    {coupon.remaining} remaining
                  </Text>
                )}
              </View>
            </View>
          );
        })}
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
    marginBottom: Spacing.xs,
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
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  coinCount: {
    color: Colors.warning,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.surface,
  },
  cardContent: {
    padding: Spacing.sm,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  restaurantName: {
    color: Colors.accent,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costText: {
    color: Colors.warning,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    backgroundColor: Colors.surface,
  },
  claimButtonText: {
    color: Colors.background,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  claimButtonTextDisabled: {
    color: Colors.textMuted,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    color: Colors.success,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  remaining: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
