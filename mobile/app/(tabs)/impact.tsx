import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../lib/constants';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import FlashSponsorships from '../../components/FlashSponsorships';
import RewardsSection from '../../components/RewardsSection';
import type { GlobalStats, PersonalStats, Team, Achievement, LeaderboardEntry } from '../../types';

export default function ImpactScreen() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);

  const loadData = useCallback(async () => {
    try {
      // Load global stats (no auth required)
      const { stats: global } = await api.getGlobalStats();
      setGlobalStats(global);

      // Load personal stats (auth required)
      if (isAuthenticated) {
        const { stats: personal, team, achievements: userAchievements } = await api.getPersonalStats();
        setPersonalStats(personal);
        setCurrentTeam(team);
        setAchievements(userAchievements);

        const { leaderboard } = await api.getFriendsLeaderboard(5);
        setFriendsLeaderboard(leaderboard);
      }
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const progress = globalStats
    ? Math.min((globalStats.totalMeals / globalStats.currentGoal) * 100, 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.accent}
        />
      }
    >
      {/* Global Counter */}
      <View style={styles.globalSection}>
        <View style={styles.globalCounter}>
          <Text style={styles.counterLabel}>Meals Donated</Text>
          <Text style={styles.counterValue}>
            {(globalStats?.totalMeals || 0).toLocaleString()}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Goal: {(globalStats?.currentGoal || 0).toLocaleString()} meals
            </Text>
          </View>
        </View>

        <View style={styles.rewardCard}>
          <Ionicons name="gift" size={24} color={Colors.accent} />
          <View style={styles.rewardInfo}>
            <Text style={styles.rewardTitle}>Community Reward</Text>
            <Text style={styles.rewardText}>
              Reach the goal to unlock exclusive badges for everyone!
            </Text>
          </View>
        </View>
      </View>

      {/* Flash Sponsorships - visible to everyone */}
      <FlashSponsorships limit={3} />

      {isAuthenticated ? (
        <>
          {/* Rewards Section */}
          <RewardsSection limit={6} />

          {/* Personal Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Impact</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="heart" size={24} color={Colors.error} />
                <Text style={styles.statValue}>{personalStats?.mealsDonated || 0}</Text>
                <Text style={styles.statLabel}>Meals Donated</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="flame" size={24} color={Colors.warning} />
                <Text style={styles.statValue}>{personalStats?.mealStreak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="camera" size={24} color={Colors.accent} />
                <Text style={styles.statValue}>{personalStats?.postCount || 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="logo-bitcoin" size={24} color={Colors.warning} />
                <Text style={styles.statValue}>{user?.coins || 0}</Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
            </View>
          </View>

          {/* Meal Balance */}
          <View style={styles.section}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Available Meals</Text>
                <Text style={styles.balanceValue}>{personalStats?.mealsBalance || 0}</Text>
              </View>
              <Pressable style={styles.buyButton}>
                <Text style={styles.buyButtonText}>Buy Meals</Text>
              </Pressable>
            </View>
          </View>

          {/* Team */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Team</Text>
            {currentTeam ? (
              <Pressable
                style={styles.teamCard}
                onPress={() => router.push(`/teams/${currentTeam.id}`)}
              >
                {currentTeam.logoUrl && (
                  <Image source={{ uri: currentTeam.logoUrl }} style={styles.teamLogo} />
                )}
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{currentTeam.name}</Text>
                  <Text style={styles.teamStats}>
                    {currentTeam.memberCount} members • {currentTeam.totalMeals.toLocaleString()} meals
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </Pressable>
            ) : (
              <Pressable style={styles.joinTeamCard}>
                <Ionicons name="people" size={32} color={Colors.accent} />
                <Text style={styles.joinTeamText}>Join a team to compete with others!</Text>
                <Pressable style={styles.joinTeamButton}>
                  <Text style={styles.joinTeamButtonText}>Find Teams</Text>
                </Pressable>
              </Pressable>
            )}
          </View>

          {/* Friends Leaderboard */}
          {friendsLeaderboard.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Friends Leaderboard</Text>
              <View style={styles.leaderboardCard}>
                {friendsLeaderboard.map((entry, index) => (
                  <Pressable
                    key={entry.id}
                    style={[
                      styles.leaderboardEntry,
                      entry.isCurrentUser && styles.leaderboardEntryCurrent,
                    ]}
                    onPress={() => router.push(`/profile/${entry.id}`)}
                  >
                    <Text style={styles.leaderboardRank}>#{entry.rank}</Text>
                    <Image
                      source={{ uri: entry.profileImage || 'https://via.placeholder.com/40' }}
                      style={styles.leaderboardAvatar}
                    />
                    <View style={styles.leaderboardInfo}>
                      <Text style={styles.leaderboardName}>{entry.name}</Text>
                      <Text style={styles.leaderboardUsername}>@{entry.username}</Text>
                    </View>
                    <Text style={styles.leaderboardMeals}>{entry.mealsDonated}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trophy Case</Text>
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement) => (
                  <View key={achievement.id} style={styles.achievementCard}>
                    <Image
                      source={{ uri: achievement.iconUrl }}
                      style={styles.achievementIcon}
                    />
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementTier}>{achievement.tier}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      ) : (
        <View style={styles.signInPrompt}>
          <Ionicons name="heart-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.signInTitle}>Sign in to track your impact</Text>
          <Text style={styles.signInText}>
            See your donation stats, join teams, and unlock achievements
          </Text>
          <Pressable
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
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
  globalSection: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  globalCounter: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  counterLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  counterValue: {
    color: Colors.accent,
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: Spacing.sm,
  },
  progressContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  rewardText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.text,
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    marginVertical: Spacing.xs,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  balanceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceInfo: {},
  balanceLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  balanceValue: {
    color: Colors.text,
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  buyButtonText: {
    color: Colors.background,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  teamCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  teamStats: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  joinTeamCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  joinTeamText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  joinTeamButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  joinTeamButtonText: {
    color: Colors.background,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  leaderboardCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderboardEntryCurrent: {
    backgroundColor: Colors.surface,
  },
  leaderboardRank: {
    color: Colors.accent,
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    width: 30,
  },
  leaderboardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  leaderboardUsername: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  leaderboardMeals: {
    color: Colors.accent,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  achievementCard: {
    width: 80,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
  },
  achievementName: {
    color: Colors.text,
    fontSize: FontSizes.xs,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  achievementTier: {
    color: Colors.warning,
    fontSize: FontSizes.xs,
    textTransform: 'capitalize',
  },
  signInPrompt: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  signInTitle: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  signInText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  signInButtonText: {
    color: Colors.background,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
