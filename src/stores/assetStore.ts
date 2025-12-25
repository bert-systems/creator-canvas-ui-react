/**
 * Asset Store - Zustand state management for the Asset System
 * Manages assets, collections, and generation history
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Asset,
  Collection,
  Generation,
  UsageStatistics,
  AssetSearchParams,
  CollectionSearchParams,
  GenerationSearchParams,
  UsageQueryParams,
  AssetType,
  UsagePeriod,
  CreateCollectionParams,
  AssetUpdateParams,
  UpdateCollectionParams,
} from '@/models/assetSystem';
import { assetApiService } from '@/services/assetApiService';
import { collectionApiService } from '@/services/collectionApiService';
import { generationApiService } from '@/services/generationApiService';

// ============================================================================
// Store Types
// ============================================================================

interface AssetStoreState {
  // Assets
  assets: Asset[];
  featuredAssets: Asset[];
  myAssets: Asset[];
  currentAsset: Asset | null;
  similarAssets: Asset[];
  assetsLoading: boolean;
  assetsTotalCount: number;
  assetsPage: number;
  assetsPageSize: number;
  assetsHasMore: boolean;

  // Collections
  collections: Collection[];
  myCollections: Collection[];
  favoritesCollection: Collection | null;
  currentCollection: Collection | null;
  collectionAssets: Asset[];
  collectionsLoading: boolean;

  // Generations
  generations: Generation[];
  currentGeneration: Generation | null;
  generationsLoading: boolean;
  generationsTotalCount: number;
  generationsPage: number;

  // Usage Statistics
  usageStats: UsageStatistics | null;
  usageLoading: boolean;
  usagePeriod: UsagePeriod;

  // Filters
  assetFilters: AssetSearchParams;
  generationFilters: GenerationSearchParams;

  // UI State
  selectedAssetIds: string[];
  assetLibraryOpen: boolean;
  addToCollectionModalOpen: boolean;
  assetDetailModalOpen: boolean;

  // Actions - Assets
  searchAssets: (params?: AssetSearchParams) => Promise<void>;
  fetchFeaturedAssets: (assetType?: AssetType) => Promise<void>;
  fetchMyAssets: (params?: { page?: number; assetType?: AssetType }) => Promise<void>;
  fetchAsset: (assetId: string) => Promise<void>;
  fetchSimilarAssets: (assetId: string) => Promise<void>;
  uploadAsset: (file: File, metadata?: { title?: string; description?: string; tags?: string }) => Promise<Asset>;
  updateAsset: (assetId: string, updates: AssetUpdateParams) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  deleteAssets: (assetIds: string[]) => Promise<void>;
  likeAsset: (assetId: string) => Promise<void>;
  unlikeAsset: (assetId: string) => Promise<void>;
  setAssetFilters: (filters: AssetSearchParams) => void;
  loadMoreAssets: () => Promise<void>;

  // Actions - Collections
  fetchPublicCollections: (params?: CollectionSearchParams) => Promise<void>;
  fetchMyCollections: () => Promise<void>;
  fetchFavoritesCollection: () => Promise<void>;
  fetchCollection: (collectionId: string) => Promise<void>;
  fetchCollectionAssets: (collectionId: string) => Promise<void>;
  createCollection: (params: CreateCollectionParams) => Promise<Collection>;
  updateCollection: (collectionId: string, updates: UpdateCollectionParams) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  addToCollection: (collectionId: string, assetIds: string[]) => Promise<void>;
  removeFromCollection: (collectionId: string, assetId: string) => Promise<void>;
  addToFavorites: (assetId: string) => Promise<void>;
  removeFromFavorites: (assetId: string) => Promise<void>;

  // Actions - Generations
  fetchGenerations: (params?: GenerationSearchParams) => Promise<void>;
  fetchGeneration: (generationId: string) => Promise<void>;
  setGenerationFilters: (filters: GenerationSearchParams) => void;
  loadMoreGenerations: () => Promise<void>;

  // Actions - Usage
  fetchUsageStats: (params?: UsageQueryParams) => Promise<void>;
  setUsagePeriod: (period: UsagePeriod) => void;

  // Actions - Selection
  selectAsset: (assetId: string) => void;
  deselectAsset: (assetId: string) => void;
  selectAll: (assetIds: string[]) => void;
  selectAllAssets: () => void;
  clearSelection: () => void;

  // Actions - UI
  openAssetLibrary: () => void;
  closeAssetLibrary: () => void;
  openAddToCollectionModal: () => void;
  closeAddToCollectionModal: () => void;
  openAssetDetail: (assetId: string) => void;
  closeAssetDetail: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAssetStore = create<AssetStoreState>()(
  devtools(
    (set, get) => ({
      // Initial State - Assets
      assets: [],
      featuredAssets: [],
      myAssets: [],
      currentAsset: null,
      similarAssets: [],
      assetsLoading: false,
      assetsTotalCount: 0,
      assetsPage: 1,
      assetsPageSize: 20,
      assetsHasMore: true,

      // Initial State - Collections
      collections: [],
      myCollections: [],
      favoritesCollection: null,
      currentCollection: null,
      collectionAssets: [],
      collectionsLoading: false,

      // Initial State - Generations
      generations: [],
      currentGeneration: null,
      generationsLoading: false,
      generationsTotalCount: 0,
      generationsPage: 1,

      // Initial State - Usage
      usageStats: null,
      usageLoading: false,
      usagePeriod: 'month',

      // Initial State - Filters
      assetFilters: {},
      generationFilters: {},

      // Initial State - UI
      selectedAssetIds: [],
      assetLibraryOpen: false,
      addToCollectionModalOpen: false,
      assetDetailModalOpen: false,

      // ========== Asset Actions ==========

      searchAssets: async (params) => {
        set({ assetsLoading: true });
        try {
          const filters = { ...get().assetFilters, ...params };
          const result = await assetApiService.search(filters);
          set({
            assets: result.items,
            assetsTotalCount: result.totalCount,
            assetsPage: result.page,
            assetFilters: filters,
          });
        } finally {
          set({ assetsLoading: false });
        }
      },

      fetchFeaturedAssets: async (assetType) => {
        set({ assetsLoading: true });
        try {
          const result = await assetApiService.getFeatured({ assetType, pageSize: 50 });
          set({ featuredAssets: result.items });
        } finally {
          set({ assetsLoading: false });
        }
      },

      fetchMyAssets: async (params) => {
        set({ assetsLoading: true });
        try {
          const result = await assetApiService.getMyAssets({
            assetType: params?.assetType,
            page: params?.page || 1,
            pageSize: 20,
          });
          const isFirstPage = !params?.page || params.page === 1;
          set((state) => ({
            myAssets: isFirstPage ? result.items : [...state.myAssets, ...result.items],
            assetsHasMore: result.items.length >= 20,
          }));
        } finally {
          set({ assetsLoading: false });
        }
      },

      fetchAsset: async (assetId) => {
        try {
          const asset = await assetApiService.getById(assetId);
          set({ currentAsset: asset });
        } catch (error) {
          console.error('Failed to fetch asset:', error);
        }
      },

      fetchSimilarAssets: async (assetId) => {
        try {
          const similar = await assetApiService.findSimilar(assetId, 12);
          set({ similarAssets: similar });
        } catch (error) {
          console.error('Failed to fetch similar assets:', error);
        }
      },

      uploadAsset: async (file, metadata) => {
        const asset = await assetApiService.upload({
          file,
          title: metadata?.title,
          description: metadata?.description,
          tags: metadata?.tags,
        });
        // Add to myAssets
        set((state) => ({ myAssets: [asset, ...state.myAssets] }));
        return asset;
      },

      updateAsset: async (assetId, updates: AssetUpdateParams) => {
        const updated = await assetApiService.update(assetId, updates);
        set((state) => ({
          assets: state.assets.map((a) => (a.id === assetId ? updated : a)),
          myAssets: state.myAssets.map((a) => (a.id === assetId ? updated : a)),
          currentAsset: state.currentAsset?.id === assetId ? updated : state.currentAsset,
        }));
      },

      deleteAsset: async (assetId) => {
        await assetApiService.delete(assetId);
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== assetId),
          myAssets: state.myAssets.filter((a) => a.id !== assetId),
          selectedAssetIds: state.selectedAssetIds.filter((id) => id !== assetId),
        }));
      },

      deleteAssets: async (assetIds) => {
        // Delete each asset in parallel
        await Promise.all(assetIds.map((id) => assetApiService.delete(id)));
        set((state) => ({
          assets: state.assets.filter((a) => !assetIds.includes(a.id)),
          myAssets: state.myAssets.filter((a) => !assetIds.includes(a.id)),
          selectedAssetIds: [],
        }));
      },

      likeAsset: async (assetId) => {
        await assetApiService.like(assetId);
        const updateLike = (assets: Asset[]) =>
          assets.map((a) =>
            a.id === assetId ? { ...a, isLikedByUser: true, likesCount: a.likesCount + 1 } : a
          );
        set((state) => ({
          assets: updateLike(state.assets),
          featuredAssets: updateLike(state.featuredAssets),
          myAssets: updateLike(state.myAssets),
          currentAsset: state.currentAsset?.id === assetId
            ? { ...state.currentAsset, isLikedByUser: true, likesCount: state.currentAsset.likesCount + 1 }
            : state.currentAsset,
        }));
      },

      unlikeAsset: async (assetId) => {
        await assetApiService.unlike(assetId);
        const updateUnlike = (assets: Asset[]) =>
          assets.map((a) =>
            a.id === assetId ? { ...a, isLikedByUser: false, likesCount: Math.max(0, a.likesCount - 1) } : a
          );
        set((state) => ({
          assets: updateUnlike(state.assets),
          featuredAssets: updateUnlike(state.featuredAssets),
          myAssets: updateUnlike(state.myAssets),
          currentAsset: state.currentAsset?.id === assetId
            ? { ...state.currentAsset, isLikedByUser: false, likesCount: Math.max(0, state.currentAsset.likesCount - 1) }
            : state.currentAsset,
        }));
      },

      setAssetFilters: (filters) => {
        set({ assetFilters: filters });
      },

      loadMoreAssets: async () => {
        const { assetsPage, assetsTotalCount, assetsPageSize, assets, assetFilters } = get();
        if (assets.length >= assetsTotalCount) return;

        set({ assetsLoading: true });
        try {
          const result = await assetApiService.search({
            ...assetFilters,
            page: assetsPage + 1,
            pageSize: assetsPageSize,
          });
          set({
            assets: [...assets, ...result.items],
            assetsPage: result.page,
          });
        } finally {
          set({ assetsLoading: false });
        }
      },

      // ========== Collection Actions ==========

      fetchPublicCollections: async (params) => {
        set({ collectionsLoading: true });
        try {
          const result = await collectionApiService.getPublic(params);
          set({ collections: result.items });
        } finally {
          set({ collectionsLoading: false });
        }
      },

      fetchMyCollections: async () => {
        set({ collectionsLoading: true });
        try {
          const result = await collectionApiService.getMyCollections();
          set({ myCollections: result.items });
        } finally {
          set({ collectionsLoading: false });
        }
      },

      fetchFavoritesCollection: async () => {
        try {
          const favorites = await collectionApiService.getFavorites();
          set({ favoritesCollection: favorites });
        } catch (error) {
          console.error('Failed to fetch favorites:', error);
        }
      },

      fetchCollection: async (collectionId) => {
        try {
          const collection = await collectionApiService.getById(collectionId);
          set({ currentCollection: collection });
        } catch (error) {
          console.error('Failed to fetch collection:', error);
        }
      },

      fetchCollectionAssets: async (collectionId) => {
        try {
          const result = await collectionApiService.getAssets(collectionId, { pageSize: 100 });
          set({ collectionAssets: result.items });
        } catch (error) {
          console.error('Failed to fetch collection assets:', error);
        }
      },

      createCollection: async (params: CreateCollectionParams) => {
        const collection = await collectionApiService.create(params);
        set((state) => ({ myCollections: [collection, ...state.myCollections] }));
        return collection;
      },

      updateCollection: async (collectionId, updates: UpdateCollectionParams) => {
        const updated = await collectionApiService.update(collectionId, updates);
        set((state) => ({
          myCollections: state.myCollections.map((c) => (c.id === collectionId ? updated : c)),
          currentCollection: state.currentCollection?.id === collectionId ? updated : state.currentCollection,
        }));
      },

      deleteCollection: async (collectionId) => {
        await collectionApiService.delete(collectionId);
        set((state) => ({
          myCollections: state.myCollections.filter((c) => c.id !== collectionId),
        }));
      },

      addToCollection: async (collectionId, assetIds) => {
        await collectionApiService.addAssets(collectionId, { assetIds });
        // Refresh collection to get updated count
        const updated = await collectionApiService.getById(collectionId);
        set((state) => ({
          myCollections: state.myCollections.map((c) => (c.id === collectionId ? updated : c)),
        }));
      },

      removeFromCollection: async (collectionId, assetId) => {
        await collectionApiService.removeAsset(collectionId, assetId);
        set((state) => ({
          collectionAssets: state.collectionAssets.filter((a) => a.id !== assetId),
        }));
      },

      addToFavorites: async (assetId) => {
        await collectionApiService.addToFavorites(assetId);
        // Refresh favorites count
        get().fetchFavoritesCollection();
      },

      removeFromFavorites: async (assetId) => {
        await collectionApiService.removeFromFavorites(assetId);
        get().fetchFavoritesCollection();
      },

      // ========== Generation Actions ==========

      fetchGenerations: async (params) => {
        set({ generationsLoading: true });
        try {
          const filters = { ...get().generationFilters, ...params };
          const result = await generationApiService.getHistory(filters);
          set({
            generations: result.items,
            generationsTotalCount: result.totalCount,
            generationsPage: result.page,
            generationFilters: filters,
          });
        } finally {
          set({ generationsLoading: false });
        }
      },

      fetchGeneration: async (generationId) => {
        try {
          const generation = await generationApiService.getById(generationId);
          set({ currentGeneration: generation });
        } catch (error) {
          console.error('Failed to fetch generation:', error);
        }
      },

      setGenerationFilters: (filters) => {
        set({ generationFilters: filters });
      },

      loadMoreGenerations: async () => {
        const { generationsPage, generationsTotalCount, generations, generationFilters } = get();
        if (generations.length >= generationsTotalCount) return;

        set({ generationsLoading: true });
        try {
          const result = await generationApiService.getHistory({
            ...generationFilters,
            page: generationsPage + 1,
          });
          set({
            generations: [...generations, ...result.items],
            generationsPage: result.page,
          });
        } finally {
          set({ generationsLoading: false });
        }
      },

      // ========== Usage Actions ==========

      fetchUsageStats: async (params) => {
        set({ usageLoading: true });
        try {
          const period = params?.period ?? get().usagePeriod;
          const stats = await generationApiService.getUsageStatistics({ ...params, period });
          set({ usageStats: stats });
        } finally {
          set({ usageLoading: false });
        }
      },

      setUsagePeriod: (period) => {
        set({ usagePeriod: period });
        get().fetchUsageStats({ period });
      },

      // ========== Selection Actions ==========

      selectAsset: (assetId) => {
        set((state) => ({
          selectedAssetIds: state.selectedAssetIds.includes(assetId)
            ? state.selectedAssetIds
            : [...state.selectedAssetIds, assetId],
        }));
      },

      deselectAsset: (assetId) => {
        set((state) => ({
          selectedAssetIds: state.selectedAssetIds.filter((id) => id !== assetId),
        }));
      },

      selectAll: (assetIds) => {
        set({ selectedAssetIds: assetIds });
      },

      selectAllAssets: () => {
        set((state) => ({
          selectedAssetIds: state.assets.map((a) => a.id),
        }));
      },

      clearSelection: () => {
        set({ selectedAssetIds: [] });
      },

      // ========== UI Actions ==========

      openAssetLibrary: () => set({ assetLibraryOpen: true }),
      closeAssetLibrary: () => set({ assetLibraryOpen: false }),
      openAddToCollectionModal: () => set({ addToCollectionModalOpen: true }),
      closeAddToCollectionModal: () => set({ addToCollectionModalOpen: false }),
      openAssetDetail: async (assetId) => {
        set({ assetDetailModalOpen: true });
        await get().fetchAsset(assetId);
      },
      closeAssetDetail: () => set({ assetDetailModalOpen: false, currentAsset: null }),
    }),
    { name: 'asset-store' }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectAssets = (state: AssetStoreState) => state.assets;
export const selectFeaturedAssets = (state: AssetStoreState) => state.featuredAssets;
export const selectMyAssets = (state: AssetStoreState) => state.myAssets;
export const selectCurrentAsset = (state: AssetStoreState) => state.currentAsset;
export const selectAssetsLoading = (state: AssetStoreState) => state.assetsLoading;
export const selectAssetFilters = (state: AssetStoreState) => state.assetFilters;

export const selectCollections = (state: AssetStoreState) => state.collections;
export const selectMyCollections = (state: AssetStoreState) => state.myCollections;
export const selectFavoritesCollection = (state: AssetStoreState) => state.favoritesCollection;
export const selectCollectionsLoading = (state: AssetStoreState) => state.collectionsLoading;

export const selectGenerations = (state: AssetStoreState) => state.generations;
export const selectGenerationsLoading = (state: AssetStoreState) => state.generationsLoading;
export const selectUsageStats = (state: AssetStoreState) => state.usageStats;
export const selectUsagePeriod = (state: AssetStoreState) => state.usagePeriod;

export const selectSelectedAssetIds = (state: AssetStoreState) => state.selectedAssetIds;
export const selectHasSelection = (state: AssetStoreState) => state.selectedAssetIds.length > 0;

export default useAssetStore;
