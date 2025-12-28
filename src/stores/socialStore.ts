/**
 * Social Store - Zustand state management for the Social Media Studio
 * Manages posts, carousels, and UI state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/services/api';

// ============================================================================
// Types
// ============================================================================

export interface SocialPost {
  id: string;
  userId?: string;
  postType?: string;
  platform?: string;
  caption?: string;
  hashtags?: string[];
  imageUrls?: string[];
  videoUrl?: string;
  status?: string;
  scheduledFor?: string;
  publishedAt?: string;
  engagement?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SocialCarousel {
  id: string;
  userId?: string;
  title?: string;
  platform?: string;
  caption?: string;
  hashtags?: string[];
  status?: string;
  slides?: Array<{
    id: string;
    slideOrder: number;
    imageUrl?: string;
    caption?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ListPostsParams {
  page?: number;
  pageSize?: number;
  platform?: string;
  status?: string;
  postType?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreatePostRequest {
  postType: string;
  platform: string;
  caption?: string;
  hashtags?: string[];
  imageUrls?: string[];
  videoUrl?: string;
  status?: string;
  scheduledFor?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateCarouselRequest {
  title: string;
  platform: string;
  caption?: string;
  hashtags?: string[];
  status?: string;
  slides?: Array<{
    slideOrder: number;
    imageUrl?: string;
    caption?: string;
  }>;
}

// ============================================================================
// Store Types
// ============================================================================

interface SocialStoreState {
  // Posts
  posts: SocialPost[];
  postsLoading: boolean;
  postsTotalCount: number;
  postsPage: number;
  postsPageSize: number;
  postsHasMore: boolean;

  // Carousels
  carousels: SocialCarousel[];
  carouselsLoading: boolean;

  // Current selection
  currentPost: SocialPost | null;
  currentCarousel: SocialCarousel | null;

  // Filters
  postFilters: ListPostsParams;

  // UI State
  selectedPostId: string | null;

  // Actions - Posts
  fetchPosts: (params?: ListPostsParams) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (request: CreatePostRequest) => Promise<SocialPost>;
  updatePost: (id: string, request: Partial<CreatePostRequest>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;

  // Actions - Carousels
  fetchCarousels: (params?: ListPostsParams) => Promise<void>;
  createCarousel: (request: CreateCarouselRequest) => Promise<SocialCarousel>;
  deleteCarousel: (id: string) => Promise<void>;

  // Actions - UI
  setSelectedPostId: (id: string | null) => void;
  setPostFilters: (filters: Partial<ListPostsParams>) => void;
  clearFilters: () => void;
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  posts: [],
  postsLoading: false,
  postsTotalCount: 0,
  postsPage: 1,
  postsPageSize: 20,
  postsHasMore: true,

  carousels: [],
  carouselsLoading: false,

  currentPost: null,
  currentCarousel: null,

  postFilters: {} as ListPostsParams,
  selectedPostId: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useSocialStore = create<SocialStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // =======================================================================
      // Posts Actions
      // =======================================================================

      fetchPosts: async (params?: ListPostsParams) => {
        set({ postsLoading: true });
        try {
          const mergedParams = { ...get().postFilters, ...params };
          const response = await api.get<{
            success: boolean;
            posts: SocialPost[];
            totalCount: number;
            page: number;
            pageSize: number;
          }>('/api/social/posts', { params: mergedParams });

          set({
            posts: response.data.posts || [],
            postsTotalCount: response.data.totalCount || 0,
            postsPage: response.data.page || 1,
            postsPageSize: response.data.pageSize || 20,
            postsHasMore: (response.data.page || 1) * (response.data.pageSize || 20) < (response.data.totalCount || 0),
            postsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch posts:', error);
          set({ postsLoading: false });
          throw error;
        }
      },

      fetchPost: async (id: string) => {
        try {
          const response = await api.get<{ success: boolean; post: SocialPost }>(`/api/social/posts/${id}`);
          set({ currentPost: response.data.post });
        } catch (error) {
          console.error('Failed to fetch post:', error);
          throw error;
        }
      },

      createPost: async (request: CreatePostRequest) => {
        try {
          const response = await api.post<{ success: boolean; post: SocialPost }>('/api/social/posts', request);
          const post = response.data.post;
          set((state) => ({ posts: [post, ...state.posts] }));
          return post;
        } catch (error) {
          console.error('Failed to create post:', error);
          throw error;
        }
      },

      updatePost: async (id: string, request: Partial<CreatePostRequest>) => {
        try {
          const response = await api.patch<{ success: boolean; post: SocialPost }>(`/api/social/posts/${id}`, request);
          set((state) => ({
            posts: state.posts.map((p) => (p.id === id ? response.data.post : p)),
            currentPost: state.currentPost?.id === id ? response.data.post : state.currentPost,
          }));
        } catch (error) {
          console.error('Failed to update post:', error);
          throw error;
        }
      },

      deletePost: async (id: string) => {
        try {
          await api.delete(`/api/social/posts/${id}`);
          set((state) => ({
            posts: state.posts.filter((p) => p.id !== id),
            currentPost: state.currentPost?.id === id ? null : state.currentPost,
            selectedPostId: state.selectedPostId === id ? null : state.selectedPostId,
          }));
        } catch (error) {
          console.error('Failed to delete post:', error);
          throw error;
        }
      },

      // =======================================================================
      // Carousels Actions
      // =======================================================================

      fetchCarousels: async (params?: ListPostsParams) => {
        set({ carouselsLoading: true });
        try {
          const response = await api.get<{
            success: boolean;
            carousels: SocialCarousel[];
          }>('/api/social/carousels', { params });

          set({
            carousels: response.data.carousels || [],
            carouselsLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch carousels:', error);
          set({ carouselsLoading: false });
          throw error;
        }
      },

      createCarousel: async (request: CreateCarouselRequest) => {
        try {
          const response = await api.post<{ success: boolean; carousel: SocialCarousel }>('/api/social/carousels', request);
          const carousel = response.data.carousel;
          set((state) => ({ carousels: [carousel, ...state.carousels] }));
          return carousel;
        } catch (error) {
          console.error('Failed to create carousel:', error);
          throw error;
        }
      },

      deleteCarousel: async (id: string) => {
        try {
          await api.delete(`/api/social/carousels/${id}`);
          set((state) => ({
            carousels: state.carousels.filter((c) => c.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete carousel:', error);
          throw error;
        }
      },

      // =======================================================================
      // UI Actions
      // =======================================================================

      setSelectedPostId: (id: string | null) => {
        set({ selectedPostId: id });
      },

      setPostFilters: (filters: Partial<ListPostsParams>) => {
        set((state) => ({
          postFilters: { ...state.postFilters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ postFilters: {} });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'social-store' }
  )
);

export default useSocialStore;
