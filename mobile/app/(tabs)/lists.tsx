import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../lib/constants';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Collection } from '../../types';

export default function ListsScreen() {
  const { isAuthenticated } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadCollections = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const { collections: data } = await api.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

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

      setCollections((prev) => [...prev, collection]);
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Cannot Delete', 'Default collections cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCollection(collectionId);
              setCollections((prev) => prev.filter((c) => c.id !== collectionId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete collection');
            }
          },
        },
      ]
    );
  };

  const renderCollection = ({ item: collection }: { item: Collection }) => (
    <Pressable
      style={styles.collectionCard}
      onPress={() => router.push(`/collection/${collection.id}`)}
      onLongPress={() => handleDeleteCollection(collection.id, collection.isDefault)}
    >
      <View style={styles.collectionPreview}>
        {collection.previewImages && collection.previewImages.length > 0 ? (
          collection.previewImages.slice(0, 4).map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={styles.previewImage}
            />
          ))
        ) : (
          <View style={styles.emptyPreview}>
            <Ionicons name="images-outline" size={32} color={Colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.collectionInfo}>
        <View style={styles.collectionHeader}>
          <Text style={styles.collectionName}>{collection.name}</Text>
          {collection.isDefault && (
            <Ionicons name="lock-closed" size={14} color={Colors.textMuted} />
          )}
        </View>
        <Text style={styles.collectionCount}>
          {collection.itemCount} {collection.itemCount === 1 ? 'dish' : 'dishes'}
        </Text>
        {collection.description && (
          <Text style={styles.collectionDescription} numberOfLines={1}>
            {collection.description}
          </Text>
        )}
      </View>
      <View style={styles.collectionPrivacy}>
        <Ionicons
          name={collection.isPublic ? 'globe-outline' : 'lock-closed-outline'}
          size={16}
          color={Colors.textSecondary}
        />
      </View>
    </Pressable>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.emptyTitle}>Sign in to see your collections</Text>
        <Pressable
          style={styles.signInButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {collections.length} {collections.length === 1 ? 'Collection' : 'Collections'}
            </Text>
            <Pressable
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color={Colors.background} />
              <Text style={styles.createButtonText}>New</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>No collections yet</Text>
            <Text style={styles.emptyListSubtext}>
              Create a collection to save your favorite dishes
            </Text>
          </View>
        }
      />

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="My Collection"
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  signInButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  signInButtonText: {
    color: Colors.background,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  createButtonText: {
    color: Colors.background,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  collectionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  collectionPreview: {
    width: 100,
    height: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewImage: {
    width: 50,
    height: 50,
    backgroundColor: Colors.surface,
  },
  emptyPreview: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  collectionInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  collectionName: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  collectionCount: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  collectionDescription: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
  collectionPrivacy: {
    padding: Spacing.md,
    justifyContent: 'center',
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyListText: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  emptyListSubtext: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginTop: Spacing.sm,
  },
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
