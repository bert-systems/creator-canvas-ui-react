/**
 * Interior Store - Zustand state management for the Interior Design Studio
 * Manages room redesigns, virtual stagings, and furniture items
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface FurnitureItem {
  id: string;
  redesignId?: string;
  name?: string;
  category?: string;
  style?: string;
  imageUrl?: string;
  description?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  material?: string;
  color?: string;
  price?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RoomRedesign {
  id: string;
  userId?: string;
  name?: string;
  description?: string;
  roomType?: string;
  originalImageUrl?: string;
  redesignedImageUrl?: string;
  style?: string;
  colorScheme?: string[];
  budget?: string;
  furniture?: FurnitureItem[];
  prompt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualStaging {
  id: string;
  userId?: string;
  name?: string;
  description?: string;
  roomType?: string;
  emptyRoomImageUrl?: string;
  stagedImageUrl?: string;
  style?: string;
  furniture?: string[];
  targetAudience?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ListRedesignsParams {
  page?: number;
  pageSize?: number;
  roomType?: string;
  style?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateRedesignRequest {
  name: string;
  description?: string;
  roomType?: string;
  originalImageUrl?: string;
  redesignedImageUrl?: string;
  style?: string;
  colorScheme?: string[];
  budget?: string;
  prompt?: string;
  tags?: string[];
}

export interface CreateStagingRequest {
  name: string;
  description?: string;
  roomType?: string;
  emptyRoomImageUrl?: string;
  stagedImageUrl?: string;
  style?: string;
  furniture?: string[];
  targetAudience?: string;
}

export interface CreateFurnitureRequest {
  name: string;
  category?: string;
  style?: string;
  imageUrl?: string;
  description?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  material?: string;
  color?: string;
  price?: number;
}

// ============================================================================
// Store Types
// ============================================================================

interface InteriorStoreState {
  // Room Redesigns
  redesigns: RoomRedesign[];
  redesignsLoading: boolean;
  redesignsTotalCount: number;
  redesignsPage: number;
  redesignsHasMore: boolean;

  // Virtual Stagings
  stagings: VirtualStaging[];
  stagingsLoading: boolean;

  // Current selection
  currentRedesign: RoomRedesign | null;
  currentStaging: VirtualStaging | null;

  // Furniture for current redesign
  furniture: FurnitureItem[];
  furnitureLoading: boolean;

  // Filters
  redesignFilters: ListRedesignsParams;

  // UI State
  selectedRedesignId: string | null;

  // Actions - Redesigns
  fetchRedesigns: (params?: ListRedesignsParams) => Promise<void>;
  fetchRedesign: (id: string) => Promise<void>;
  createRedesign: (request: CreateRedesignRequest) => Promise<RoomRedesign>;
  updateRedesign: (id: string, request: Partial<CreateRedesignRequest>) => Promise<void>;
  deleteRedesign: (id: string) => Promise<void>;

  // Actions - Virtual Stagings
  fetchStagings: (params?: ListRedesignsParams) => Promise<void>;
  createStaging: (request: CreateStagingRequest) => Promise<VirtualStaging>;
  deleteStaging: (id: string) => Promise<void>;

  // Actions - Furniture
  fetchFurniture: (redesignId: string) => Promise<void>;
  createFurniture: (redesignId: string, request: CreateFurnitureRequest) => Promise<FurnitureItem>;
  deleteFurniture: (redesignId: string, furnitureId: string) => Promise<void>;

  // Actions - UI
  setSelectedRedesignId: (id: string | null) => void;
  setRedesignFilters: (filters: Partial<ListRedesignsParams>) => void;
  clearFilters: () => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  redesigns: [],
  redesignsLoading: false,
  redesignsTotalCount: 0,
  redesignsPage: 1,
  redesignsHasMore: true,

  stagings: [],
  stagingsLoading: false,

  currentRedesign: null,
  currentStaging: null,

  furniture: [],
  furnitureLoading: false,

  redesignFilters: {} as ListRedesignsParams,
  selectedRedesignId: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useInteriorStore = create<InteriorStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // =======================================================================
      // Redesigns Actions
      // =======================================================================

      fetchRedesigns: async (params?: ListRedesignsParams) => {
        set({ redesignsLoading: true });
        try {
          const mergedParams = { ...get().redesignFilters, ...params };
          const response = await api.get<{
            success: boolean;
            redesigns: RoomRedesign[];
            totalCount: number;
            page: number;
            pageSize: number;
          }>('/api/interior-design/redesigns', { params: mergedParams });

          set({
            redesigns: response.data.redesigns || [],
            redesignsTotalCount: response.data.totalCount || 0,
            redesignsPage: response.data.page || 1,
            redesignsHasMore: (response.data.page || 1) * (response.data.pageSize || 20) < (response.data.totalCount || 0),
            redesignsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch redesigns:', error);
          set({ redesignsLoading: false });
          throw error;
        }
      },

      fetchRedesign: async (id: string) => {
        try {
          const response = await api.get<{ success: boolean; redesign: RoomRedesign }>(`/api/interior-design/redesigns/${id}`);
          set({ currentRedesign: response.data.redesign });
        } catch (error) {
          console.error('Failed to fetch redesign:', error);
          throw error;
        }
      },

      createRedesign: async (request: CreateRedesignRequest) => {
        try {
          const response = await api.post<{ success: boolean; redesign: RoomRedesign }>('/api/interior-design/redesigns', request);
          const redesign = response.data.redesign;
          set((state) => ({ redesigns: [redesign, ...state.redesigns] }));
          return redesign;
        } catch (error) {
          console.error('Failed to create redesign:', error);
          throw error;
        }
      },

      updateRedesign: async (id: string, request: Partial<CreateRedesignRequest>) => {
        try {
          const response = await api.patch<{ success: boolean; redesign: RoomRedesign }>(`/api/interior-design/redesigns/${id}`, request);
          set((state) => ({
            redesigns: state.redesigns.map((r) => (r.id === id ? response.data.redesign : r)),
            currentRedesign: state.currentRedesign?.id === id ? response.data.redesign : state.currentRedesign,
          }));
        } catch (error) {
          console.error('Failed to update redesign:', error);
          throw error;
        }
      },

      deleteRedesign: async (id: string) => {
        try {
          await api.delete(`/api/interior-design/redesigns/${id}`);
          set((state) => ({
            redesigns: state.redesigns.filter((r) => r.id !== id),
            currentRedesign: state.currentRedesign?.id === id ? null : state.currentRedesign,
            selectedRedesignId: state.selectedRedesignId === id ? null : state.selectedRedesignId,
          }));
        } catch (error) {
          console.error('Failed to delete redesign:', error);
          throw error;
        }
      },

      // =======================================================================
      // Virtual Stagings Actions
      // =======================================================================

      fetchStagings: async (params?: ListRedesignsParams) => {
        set({ stagingsLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            stagings: VirtualStaging[];
          }>('/api/interior-design/stagings', { params });

          set({
            stagings: response.data.stagings || [],
            stagingsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch stagings:', error);
          set({ stagingsLoading: false });
          throw error;
        }
      },

      createStaging: async (request: CreateStagingRequest) => {
        try {
          const response = await api.post<{ success: boolean; staging: VirtualStaging }>('/api/interior-design/stagings', request);
          const staging = response.data.staging;
          set((state) => ({ stagings: [staging, ...state.stagings] }));
          return staging;
        } catch (error) {
          console.error('Failed to create staging:', error);
          throw error;
        }
      },

      deleteStaging: async (id: string) => {
        try {
          await api.delete(`/api/interior-design/stagings/${id}`);
          set((state) => ({
            stagings: state.stagings.filter((s) => s.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete staging:', error);
          throw error;
        }
      },

      // =======================================================================
      // Furniture Actions
      // =======================================================================

      fetchFurniture: async (redesignId: string) => {
        set({ furnitureLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            furniture: FurnitureItem[];
          }>(`/api/interior-design/redesigns/${redesignId}/furniture`);

          set({
            furniture: response.data.furniture || [],
            furnitureLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch furniture:', error);
          set({ furnitureLoading: false });
          throw error;
        }
      },

      createFurniture: async (redesignId: string, request: CreateFurnitureRequest) => {
        try {
          const response = await api.post<{ success: boolean; furniture: FurnitureItem }>(
            `/api/interior-design/redesigns/${redesignId}/furniture`,
            request
          );
          const item = response.data.furniture;
          set((state) => ({ furniture: [item, ...state.furniture] }));
          return item;
        } catch (error) {
          console.error('Failed to create furniture:', error);
          throw error;
        }
      },

      deleteFurniture: async (redesignId: string, furnitureId: string) => {
        try {
          await api.delete(`/api/interior-design/redesigns/${redesignId}/furniture/${furnitureId}`);
          set((state) => ({
            furniture: state.furniture.filter((f) => f.id !== furnitureId),
          }));
        } catch (error) {
          console.error('Failed to delete furniture:', error);
          throw error;
        }
      },

      // =======================================================================
      // UI Actions
      // =======================================================================

      setSelectedRedesignId: (id: string | null) => {
        set({ selectedRedesignId: id });
      },

      setRedesignFilters: (filters: Partial<ListRedesignsParams>) => {
        set((state) => ({
          redesignFilters: { ...state.redesignFilters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ redesignFilters: {} });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'interior-store' }
  )
);

export default useInteriorStore;
