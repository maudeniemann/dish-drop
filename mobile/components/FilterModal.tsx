import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  FontSizes,
  BorderRadius,
  CUISINE_TYPES,
  DIETARY_TAGS,
  PRICE_LEVELS,
  DISTANCE_OPTIONS,
  RATING_OPTIONS,
} from '../lib/constants';
import type {
  ExploreFilterState,
  FeedFilterState,
  ExploreSortOption,
  FeedSortOption,
} from '../types';

// --- Explore Filters ---

interface ExploreFilterModalProps {
  mode: 'explore';
  visible: boolean;
  filters: ExploreFilterState;
  onApply: (filters: ExploreFilterState) => void;
  onClose: () => void;
}

interface FeedFilterModalProps {
  mode: 'feed';
  visible: boolean;
  filters: FeedFilterState;
  onApply: (filters: FeedFilterState) => void;
  onClose: () => void;
}

type FilterModalProps = ExploreFilterModalProps | FeedFilterModalProps;

const EXPLORE_SORT_OPTIONS: { value: ExploreSortOption; label: string }[] = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
];

const FEED_SORT_OPTIONS: { value: FeedSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Nearest' },
  { value: 'popular', label: 'Most Popular' },
];

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function FilterModal(props: FilterModalProps) {
  const { mode, visible, onClose } = props;

  // Local draft state so changes aren't applied until "Apply" is tapped
  const [draft, setDraft] = useState<ExploreFilterState | FeedFilterState>(props.filters);

  // Reset draft when modal opens
  useEffect(() => {
    if (visible) {
      setDraft(props.filters);
    }
  }, [visible]);

  const handleApply = () => {
    if (mode === 'explore') {
      (props as ExploreFilterModalProps).onApply(draft as ExploreFilterState);
    } else {
      (props as FeedFilterModalProps).onApply(draft as FeedFilterState);
    }
    onClose();
  };

  const handleReset = () => {
    if (mode === 'explore') {
      const reset: ExploreFilterState = {
        cuisines: [],
        priceLevels: [],
        minRating: 0,
        maxDistance: null,
        hasReservations: false,
        hasDelivery: false,
        sort: 'rating',
      };
      setDraft(reset);
    } else {
      const reset: FeedFilterState = {
        cuisines: [],
        dietaryTags: [],
        minRating: 0,
        sort: 'newest',
      };
      setDraft(reset);
    }
  };

  // --- Toggle helpers ---
  const toggleCuisine = (cuisine: string) => {
    setDraft((prev) => {
      const cuisines = prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine];
      return { ...prev, cuisines };
    });
  };

  const togglePriceLevel = (level: number) => {
    if (mode !== 'explore') return;
    setDraft((prev) => {
      const d = prev as ExploreFilterState;
      const priceLevels = d.priceLevels.includes(level)
        ? d.priceLevels.filter((p) => p !== level)
        : [...d.priceLevels, level];
      return { ...prev, priceLevels };
    });
  };

  const setMinRating = (rating: number) => {
    setDraft((prev) => ({ ...prev, minRating: rating }));
  };

  const setMaxDistance = (distance: number | null) => {
    if (mode !== 'explore') return;
    setDraft((prev) => ({
      ...prev,
      maxDistance: (prev as ExploreFilterState).maxDistance === distance ? null : distance,
    }));
  };

  const toggleDietaryTag = (tag: string) => {
    if (mode !== 'feed') return;
    setDraft((prev) => {
      const d = prev as FeedFilterState;
      const dietaryTags = d.dietaryTags.includes(tag)
        ? d.dietaryTags.filter((t) => t !== tag)
        : [...d.dietaryTags, tag];
      return { ...prev, dietaryTags };
    });
  };

  const setSort = (sort: ExploreSortOption | FeedSortOption) => {
    setDraft((prev) => ({ ...prev, sort } as ExploreFilterState | FeedFilterState));
  };

  const toggleBoolean = (key: 'hasReservations' | 'hasDelivery') => {
    if (mode !== 'explore') return;
    setDraft((prev) => ({ ...prev, [key]: !(prev as ExploreFilterState)[key] }));
  };

  const exploreDraft = draft as ExploreFilterState;
  const feedDraft = draft as FeedFilterState;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleRow}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Filters & Sort</Text>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentInner}
          >
            {/* Sort */}
            <SectionTitle title="Sort By" />
            <View style={styles.chipRow}>
              {(mode === 'explore' ? EXPLORE_SORT_OPTIONS : FEED_SORT_OPTIONS).map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={draft.sort === opt.value}
                  onPress={() => setSort(opt.value)}
                />
              ))}
            </View>

            {/* Cuisine */}
            <SectionTitle title="Cuisine" />
            <View style={styles.chipRow}>
              {CUISINE_TYPES.map((cuisine) => (
                <Chip
                  key={cuisine}
                  label={cuisine}
                  selected={draft.cuisines.includes(cuisine)}
                  onPress={() => toggleCuisine(cuisine)}
                />
              ))}
            </View>

            {/* Price (explore only) */}
            {mode === 'explore' && (
              <>
                <SectionTitle title="Price Range" />
                <View style={styles.chipRow}>
                  {PRICE_LEVELS.map((pl) => (
                    <Chip
                      key={pl.value}
                      label={`${pl.label}  ${pl.description}`}
                      selected={exploreDraft.priceLevels.includes(pl.value)}
                      onPress={() => togglePriceLevel(pl.value)}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Rating */}
            <SectionTitle title="Minimum Rating" />
            <View style={styles.chipRow}>
              {RATING_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={draft.minRating === opt.value}
                  onPress={() => setMinRating(opt.value)}
                />
              ))}
            </View>

            {/* Distance (explore only) */}
            {mode === 'explore' && (
              <>
                <SectionTitle title="Max Distance" />
                <View style={styles.chipRow}>
                  {DISTANCE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      selected={exploreDraft.maxDistance === opt.value}
                      onPress={() => setMaxDistance(opt.value)}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Dietary (feed only) */}
            {mode === 'feed' && (
              <>
                <SectionTitle title="Dietary & Allergens" />
                <View style={styles.chipRow}>
                  {DIETARY_TAGS.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      selected={feedDraft.dietaryTags.includes(tag)}
                      onPress={() => toggleDietaryTag(tag)}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Quick toggles (explore only) */}
            {mode === 'explore' && (
              <>
                <SectionTitle title="Features" />
                <View style={styles.chipRow}>
                  <Chip
                    label="Reservations"
                    selected={exploreDraft.hasReservations}
                    onPress={() => toggleBoolean('hasReservations')}
                  />
                  <Chip
                    label="Delivery / Order"
                    selected={exploreDraft.hasDelivery}
                    onPress={() => toggleBoolean('hasDelivery')}
                  />
                </View>
              </>
            )}

            {/* Bottom padding for scroll */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// --- Count active filters (exported for badge) ---

export function countExploreFilters(f: ExploreFilterState): number {
  let count = 0;
  if (f.cuisines.length > 0) count++;
  if (f.priceLevels.length > 0) count++;
  if (f.minRating > 0) count++;
  if (f.maxDistance !== null) count++;
  if (f.hasReservations) count++;
  if (f.hasDelivery) count++;
  return count;
}

export function countFeedFilters(f: FeedFilterState): number {
  let count = 0;
  if (f.cuisines.length > 0) count++;
  if (f.dietaryTags.length > 0) count++;
  if (f.minRating > 0) count++;
  return count;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  resetText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  applyButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  applyText: {
    color: Colors.background,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
  contentInner: {
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  chipTextSelected: {
    color: Colors.background,
    fontWeight: '600',
  },
});
