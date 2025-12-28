/**
 * Moodboard Store - Zustand state management for the Moodboards Studio
 * Manages moodboards, brand kits, and UI state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface MoodboardElement {
  id: string;
  elementType?: string;
  url?: string;
  value?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

export interface Moodboard {
  id: string;
  userId?: string;
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  theme?: string;
  style?: string;
  mood?: string;
  colorPalette?: string[];
  elements?: MoodboardElement[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BrandKit {
  id: string;
  userId?: string;
  name?: string;
  companyName?: string;
  logoUrl?: string;
  primaryColors?: string[];
  secondaryColors?: string[];
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    sizes?: Record<string, number>;
  };
  style?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListMoodboardsParams {
  page?: number;
  pageSize?: number;
  theme?: string;
  style?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateMoodboardRequest {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  theme?: string;
  style?: string;
  mood?: string;
  colorPalette?: string[];
  tags?: string[];
}

export interface CreateBrandKitRequest {
  name: string;
  companyName?: string;
  logoUrl?: string;
  primaryColors?: string[];
  secondaryColors?: string[];
  typography?: {
    headingFont?: string;
    bodyFont?: string;
  };
  style?: string;
}

// ============================================================================
// Store Types
// ============================================================================

interface MoodboardStoreState {
  // Moodboards
  moodboards: Moodboard[];
  moodboardsLoading: boolean;
  moodboardsTotalCount: number;
  moodboardsPage: number;
  moodboardsHasMore: boolean;

  // Brand Kits
  brandKits: BrandKit[];
  brandKitsLoading: boolean;

  // Current selection
  currentMoodboard: Moodboard | null;
  currentBrandKit: BrandKit | null;

  // Filters
  moodboardFilters: ListMoodboardsParams;

  // UI State
  selectedMoodboardId: string | null;

  // Actions - Moodboards
  fetchMoodboards: (params?: ListMoodboardsParams) => Promise<void>;
  fetchMoodboard: (id: string) => Promise<void>;
  createMoodboard: (request: CreateMoodboardRequest) => Promise<Moodboard>;
  updateMoodboard: (id: string, request: Partial<CreateMoodboardRequest>) => Promise<void>;
  deleteMoodboard: (id: string) => Promise<void>;

  // Actions - Brand Kits
  fetchBrandKits: (params?: ListMoodboardsParams) => Promise<void>;
  createBrandKit: (request: CreateBrandKitRequest) => Promise<BrandKit>;
  deleteBrandKit: (id: string) => Promise<void>;

  // Actions - UI
  setSelectedMoodboardId: (id: string | null) => void;
  setMoodboardFilters: (filters: Partial<ListMoodboardsParams>) => void;
  clearFilters: () => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  moodboards: [],
  moodboardsLoading: false,
  moodboardsTotalCount: 0,
  moodboardsPage: 1,
  moodboardsHasMore: true,

  brandKits: [],
  brandKitsLoading: false,

  currentMoodboard: null,
  currentBrandKit: null,

  moodboardFilters: {} as ListMoodboardsParams,
  selectedMoodboardId: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useMoodboardStore = create<MoodboardStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // =======================================================================
      // Moodboards Actions
      // =======================================================================

      fetchMoodboards: async (params?: ListMoodboardsParams) => {
        set({ moodboardsLoading: true });
        try {
          const mergedParams = { ...get().moodboardFilters, ...params };
          const response = await api.get<{
            success: boolean;
            moodboards: Moodboard[];
            totalCount: number;
            page: number;
            pageSize: number;
          }>('/api/moodboard/library', { params: mergedParams });

          set({
            moodboards: response.data.moodboards || [],
            moodboardsTotalCount: response.data.totalCount || 0,
            moodboardsPage: response.data.page || 1,
            moodboardsHasMore: (response.data.page || 1) * (response.data.pageSize || 20) < (response.data.totalCount || 0),
            moodboardsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch moodboards:', error);
          set({ moodboardsLoading: false });
          throw error;
        }
      },

      fetchMoodboard: async (id: string) => {
        try {
          const response = await api.get<{ success: boolean; moodboard: Moodboard }>(`/api/moodboard/library/${id}`);
          set({ currentMoodboard: response.data.moodboard });
        } catch (error) {
          console.error('Failed to fetch moodboard:', error);
          throw error;
        }
      },

      createMoodboard: async (request: CreateMoodboardRequest) => {
        try {
          const response = await api.post<{ success: boolean; moodboard: Moodboard }>('/api/moodboard/library', request);
          const moodboard = response.data.moodboard;
          set((state) => ({ moodboards: [moodboard, ...state.moodboards] }));
          return moodboard;
        } catch (error) {
          console.error('Failed to create moodboard:', error);
          throw error;
        }
      },

      updateMoodboard: async (id: string, request: Partial<CreateMoodboardRequest>) => {
        try {
          const response = await api.patch<{ success: boolean; moodboard: Moodboard }>(`/api/moodboard/library/${id}`, request);
          set((state) => ({
            moodboards: state.moodboards.map((m) => (m.id === id ? response.data.moodboard : m)),
            currentMoodboard: state.currentMoodboard?.id === id ? response.data.moodboard : state.currentMoodboard,
          }));
        } catch (error) {
          console.error('Failed to update moodboard:', error);
          throw error;
        }
      },

      deleteMoodboard: async (id: string) => {
        try {
          await api.delete(`/api/moodboard/library/${id}`);
          set((state) => ({
            moodboards: state.moodboards.filter((m) => m.id !== id),
            currentMoodboard: state.currentMoodboard?.id === id ? null : state.currentMoodboard,
            selectedMoodboardId: state.selectedMoodboardId === id ? null : state.selectedMoodboardId,
          }));
        } catch (error) {
          console.error('Failed to delete moodboard:', error);
          throw error;
        }
      },

      // =======================================================================
      // Brand Kits Actions
      // =======================================================================

      fetchBrandKits: async (params?: ListMoodboardsParams) => {
        set({ brandKitsLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            brandKits: BrandKit[];
          }>('/api/moodboard/brand-kits', { params });

          set({
            brandKits: response.data.brandKits || [],
            brandKitsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch brand kits:', error);
          set({ brandKitsLoading: false });
          throw error;
        }
      },

      createBrandKit: async (request: CreateBrandKitRequest) => {
        try {
          const response = await api.post<{ success: boolean; brandKit: BrandKit }>('/api/moodboard/brand-kits', request);
          const brandKit = response.data.brandKit;
          set((state) => ({ brandKits: [brandKit, ...state.brandKits] }));
          return brandKit;
        } catch (error) {
          console.error('Failed to create brand kit:', error);
          throw error;
        }
      },

      deleteBrandKit: async (id: string) => {
        try {
          await api.delete(`/api/moodboard/brand-kits/${id}`);
          set((state) => ({
            brandKits: state.brandKits.filter((b) => b.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete brand kit:', error);
          throw error;
        }
      },

      // =======================================================================
      // UI Actions
      // =======================================================================

      setSelectedMoodboardId: (id: string | null) => {
        set({ selectedMoodboardId: id });
      },

      setMoodboardFilters: (filters: Partial<ListMoodboardsParams>) => {
        set((state) => ({
          moodboardFilters: { ...state.moodboardFilters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ moodboardFilters: {} });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'moodboard-store' }
  )
);

export default useMoodboardStore;
