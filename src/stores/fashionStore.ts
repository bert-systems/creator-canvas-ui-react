/**
 * Fashion Store - Zustand state management for the Fashion Studio
 * Manages lookbooks, garments, colorways, and outfits
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface FashionGarment {
  id: string;
  lookbookId?: string;
  name?: string;
  category?: string;
  imageUrl?: string;
  description?: string;
  fabricType?: string;
  color?: string;
  pattern?: string;
  season?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FashionColorway {
  id: string;
  lookbookId?: string;
  name?: string;
  baseGarmentId?: string;
  colors?: string[];
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FashionOutfit {
  id: string;
  lookbookId?: string;
  name?: string;
  description?: string;
  garmentIds?: string[];
  imageUrl?: string;
  occasion?: string;
  style?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Lookbook {
  id: string;
  userId?: string;
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  season?: string;
  year?: number;
  collection?: string;
  style?: string;
  targetAudience?: string;
  colorPalette?: string[];
  garments?: FashionGarment[];
  colorways?: FashionColorway[];
  outfits?: FashionOutfit[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ListLookbooksParams {
  page?: number;
  pageSize?: number;
  season?: string;
  style?: string;
  collection?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateLookbookRequest {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  season?: string;
  year?: number;
  collection?: string;
  style?: string;
  targetAudience?: string;
  colorPalette?: string[];
  tags?: string[];
}

export interface CreateGarmentRequest {
  name: string;
  category?: string;
  imageUrl?: string;
  description?: string;
  fabricType?: string;
  color?: string;
  pattern?: string;
  season?: string;
}

export interface CreateColorwayRequest {
  name: string;
  baseGarmentId?: string;
  colors?: string[];
  imageUrl?: string;
}

export interface CreateOutfitRequest {
  name: string;
  description?: string;
  garmentIds?: string[];
  imageUrl?: string;
  occasion?: string;
  style?: string;
}

// ============================================================================
// Store Types
// ============================================================================

interface FashionStoreState {
  // Lookbooks
  lookbooks: Lookbook[];
  lookbooksLoading: boolean;
  lookbooksTotalCount: number;
  lookbooksPage: number;
  lookbooksHasMore: boolean;

  // Current lookbook with details
  currentLookbook: Lookbook | null;
  currentLookbookLoading: boolean;

  // Garments for current lookbook
  garments: FashionGarment[];
  garmentsLoading: boolean;

  // Colorways for current lookbook
  colorways: FashionColorway[];
  colorwaysLoading: boolean;

  // Outfits for current lookbook
  outfits: FashionOutfit[];
  outfitsLoading: boolean;

  // Filters
  lookbookFilters: ListLookbooksParams;

  // UI State
  selectedLookbookId: string | null;

  // Actions - Lookbooks
  fetchLookbooks: (params?: ListLookbooksParams) => Promise<void>;
  fetchLookbook: (id: string) => Promise<void>;
  createLookbook: (request: CreateLookbookRequest) => Promise<Lookbook>;
  updateLookbook: (id: string, request: Partial<CreateLookbookRequest>) => Promise<void>;
  deleteLookbook: (id: string) => Promise<void>;

  // Actions - Garments
  fetchGarments: (lookbookId: string) => Promise<void>;
  createGarment: (lookbookId: string, request: CreateGarmentRequest) => Promise<FashionGarment>;
  deleteGarment: (lookbookId: string, garmentId: string) => Promise<void>;

  // Actions - Colorways
  fetchColorways: (lookbookId: string) => Promise<void>;
  createColorway: (lookbookId: string, request: CreateColorwayRequest) => Promise<FashionColorway>;
  deleteColorway: (lookbookId: string, colorwayId: string) => Promise<void>;

  // Actions - Outfits
  fetchOutfits: (lookbookId: string) => Promise<void>;
  createOutfit: (lookbookId: string, request: CreateOutfitRequest) => Promise<FashionOutfit>;
  deleteOutfit: (lookbookId: string, outfitId: string) => Promise<void>;

  // Actions - UI
  setSelectedLookbookId: (id: string | null) => void;
  setLookbookFilters: (filters: Partial<ListLookbooksParams>) => void;
  clearFilters: () => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  lookbooks: [],
  lookbooksLoading: false,
  lookbooksTotalCount: 0,
  lookbooksPage: 1,
  lookbooksHasMore: true,

  currentLookbook: null,
  currentLookbookLoading: false,

  garments: [],
  garmentsLoading: false,

  colorways: [],
  colorwaysLoading: false,

  outfits: [],
  outfitsLoading: false,

  lookbookFilters: {} as ListLookbooksParams,
  selectedLookbookId: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useFashionStore = create<FashionStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // =======================================================================
      // Lookbooks Actions
      // =======================================================================

      fetchLookbooks: async (params?: ListLookbooksParams) => {
        set({ lookbooksLoading: true });
        try {
          const mergedParams = { ...get().lookbookFilters, ...params };
          const response = await api.get<{
            success: boolean;
            lookbooks: Lookbook[];
            totalCount: number;
            page: number;
            pageSize: number;
          }>('/api/fashion/lookbooks', { params: mergedParams });

          set({
            lookbooks: response.data.lookbooks || [],
            lookbooksTotalCount: response.data.totalCount || 0,
            lookbooksPage: response.data.page || 1,
            lookbooksHasMore: (response.data.page || 1) * (response.data.pageSize || 20) < (response.data.totalCount || 0),
            lookbooksLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch lookbooks:', error);
          set({ lookbooksLoading: false });
          throw error;
        }
      },

      fetchLookbook: async (id: string) => {
        set({ currentLookbookLoading: true });
        try {
          const response = await api.get<{ success: boolean; lookbook: Lookbook }>(`/api/fashion/lookbooks/${id}`);
          set({
            currentLookbook: response.data.lookbook,
            currentLookbookLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch lookbook:', error);
          set({ currentLookbookLoading: false });
          throw error;
        }
      },

      createLookbook: async (request: CreateLookbookRequest) => {
        try {
          const response = await api.post<{ success: boolean; lookbook: Lookbook }>('/api/fashion/lookbooks', request);
          const lookbook = response.data.lookbook;
          set((state) => ({ lookbooks: [lookbook, ...state.lookbooks] }));
          return lookbook;
        } catch (error) {
          console.error('Failed to create lookbook:', error);
          throw error;
        }
      },

      updateLookbook: async (id: string, request: Partial<CreateLookbookRequest>) => {
        try {
          const response = await api.patch<{ success: boolean; lookbook: Lookbook }>(`/api/fashion/lookbooks/${id}`, request);
          set((state) => ({
            lookbooks: state.lookbooks.map((l) => (l.id === id ? response.data.lookbook : l)),
            currentLookbook: state.currentLookbook?.id === id ? response.data.lookbook : state.currentLookbook,
          }));
        } catch (error) {
          console.error('Failed to update lookbook:', error);
          throw error;
        }
      },

      deleteLookbook: async (id: string) => {
        try {
          await api.delete(`/api/fashion/lookbooks/${id}`);
          set((state) => ({
            lookbooks: state.lookbooks.filter((l) => l.id !== id),
            currentLookbook: state.currentLookbook?.id === id ? null : state.currentLookbook,
            selectedLookbookId: state.selectedLookbookId === id ? null : state.selectedLookbookId,
          }));
        } catch (error) {
          console.error('Failed to delete lookbook:', error);
          throw error;
        }
      },

      // =======================================================================
      // Garments Actions
      // =======================================================================

      fetchGarments: async (lookbookId: string) => {
        set({ garmentsLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            garments: FashionGarment[];
          }>(`/api/fashion/lookbooks/${lookbookId}/garments`);

          set({
            garments: response.data.garments || [],
            garmentsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch garments:', error);
          set({ garmentsLoading: false });
          throw error;
        }
      },

      createGarment: async (lookbookId: string, request: CreateGarmentRequest) => {
        try {
          const response = await api.post<{ success: boolean; garment: FashionGarment }>(
            `/api/fashion/lookbooks/${lookbookId}/garments`,
            request
          );
          const garment = response.data.garment;
          set((state) => ({ garments: [garment, ...state.garments] }));
          return garment;
        } catch (error) {
          console.error('Failed to create garment:', error);
          throw error;
        }
      },

      deleteGarment: async (lookbookId: string, garmentId: string) => {
        try {
          await api.delete(`/api/fashion/lookbooks/${lookbookId}/garments/${garmentId}`);
          set((state) => ({
            garments: state.garments.filter((g) => g.id !== garmentId),
          }));
        } catch (error) {
          console.error('Failed to delete garment:', error);
          throw error;
        }
      },

      // =======================================================================
      // Colorways Actions
      // =======================================================================

      fetchColorways: async (lookbookId: string) => {
        set({ colorwaysLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            colorways: FashionColorway[];
          }>(`/api/fashion/lookbooks/${lookbookId}/colorways`);

          set({
            colorways: response.data.colorways || [],
            colorwaysLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch colorways:', error);
          set({ colorwaysLoading: false });
          throw error;
        }
      },

      createColorway: async (lookbookId: string, request: CreateColorwayRequest) => {
        try {
          const response = await api.post<{ success: boolean; colorway: FashionColorway }>(
            `/api/fashion/lookbooks/${lookbookId}/colorways`,
            request
          );
          const colorway = response.data.colorway;
          set((state) => ({ colorways: [colorway, ...state.colorways] }));
          return colorway;
        } catch (error) {
          console.error('Failed to create colorway:', error);
          throw error;
        }
      },

      deleteColorway: async (lookbookId: string, colorwayId: string) => {
        try {
          await api.delete(`/api/fashion/lookbooks/${lookbookId}/colorways/${colorwayId}`);
          set((state) => ({
            colorways: state.colorways.filter((c) => c.id !== colorwayId),
          }));
        } catch (error) {
          console.error('Failed to delete colorway:', error);
          throw error;
        }
      },

      // =======================================================================
      // Outfits Actions
      // =======================================================================

      fetchOutfits: async (lookbookId: string) => {
        set({ outfitsLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            outfits: FashionOutfit[];
          }>(`/api/fashion/lookbooks/${lookbookId}/outfits`);

          set({
            outfits: response.data.outfits || [],
            outfitsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch outfits:', error);
          set({ outfitsLoading: false });
          throw error;
        }
      },

      createOutfit: async (lookbookId: string, request: CreateOutfitRequest) => {
        try {
          const response = await api.post<{ success: boolean; outfit: FashionOutfit }>(
            `/api/fashion/lookbooks/${lookbookId}/outfits`,
            request
          );
          const outfit = response.data.outfit;
          set((state) => ({ outfits: [outfit, ...state.outfits] }));
          return outfit;
        } catch (error) {
          console.error('Failed to create outfit:', error);
          throw error;
        }
      },

      deleteOutfit: async (lookbookId: string, outfitId: string) => {
        try {
          await api.delete(`/api/fashion/lookbooks/${lookbookId}/outfits/${outfitId}`);
          set((state) => ({
            outfits: state.outfits.filter((o) => o.id !== outfitId),
          }));
        } catch (error) {
          console.error('Failed to delete outfit:', error);
          throw error;
        }
      },

      // =======================================================================
      // UI Actions
      // =======================================================================

      setSelectedLookbookId: (id: string | null) => {
        set({ selectedLookbookId: id });
      },

      setLookbookFilters: (filters: Partial<ListLookbooksParams>) => {
        set((state) => ({
          lookbookFilters: { ...state.lookbookFilters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ lookbookFilters: {} });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'fashion-store' }
  )
);

export default useFashionStore;
