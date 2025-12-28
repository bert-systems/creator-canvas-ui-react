/**
 * Story Store - Zustand state management for the Storyteller Studio
 * Manages stories, characters, scenes, and publishing state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  storyLibraryService,
  type StoryResponse,
  type CharacterResponse,
  type SceneResponse,
  type CreateStoryRequest,
  type UpdateStoryRequest,
  type CreateCharacterRequest,
  type UpdateCharacterRequest,
  type CreateSceneRequest,
  type UpdateSceneRequest,
  type ListStoriesParams,
  type PublishStoryRequest,
  type PublicStoriesParams,
  type TrendingParams,
} from '@/services/storyLibraryService';

// ============================================================================
// Store Types
// ============================================================================

interface StoryStoreState {
  // My Stories
  stories: StoryResponse[];
  storiesLoading: boolean;
  storiesTotalCount: number;
  storiesPage: number;
  storiesPageSize: number;
  storiesHasMore: boolean;

  // Current Story (being edited)
  currentStory: StoryResponse | null;
  currentStoryLoading: boolean;
  hasUnsavedChanges: boolean;

  // Characters for current story
  characters: CharacterResponse[];
  charactersLoading: boolean;

  // Scenes for current story
  scenes: SceneResponse[];
  scenesLoading: boolean;

  // Public/Discovery Stories
  publicStories: StoryResponse[];
  publicStoriesLoading: boolean;
  featuredStories: StoryResponse[];
  trendingStories: StoryResponse[];

  // Filters
  storyFilters: ListStoriesParams;

  // UI State
  selectedStoryId: string | null;
  storyLibraryOpen: boolean;
  storyDetailModalOpen: boolean;

  // Actions - My Stories
  fetchStories: (params?: ListStoriesParams) => Promise<void>;
  fetchStory: (id: string) => Promise<void>;
  createStory: (request: CreateStoryRequest) => Promise<StoryResponse>;
  updateStory: (id: string, request: UpdateStoryRequest) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  setCurrentStory: (story: StoryResponse | null) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  // Actions - Publishing
  publishStory: (id: string, request?: PublishStoryRequest) => Promise<void>;
  unpublishStory: (id: string) => Promise<void>;
  likeStory: (id: string) => Promise<void>;
  unlikeStory: (id: string) => Promise<void>;

  // Actions - Discovery
  fetchPublicStories: (params?: PublicStoriesParams) => Promise<void>;
  fetchFeaturedStories: (limit?: number) => Promise<void>;
  fetchTrendingStories: (params?: TrendingParams) => Promise<void>;

  // Actions - Characters
  fetchCharacters: (storyId: string) => Promise<void>;
  createCharacter: (storyId: string, request: CreateCharacterRequest) => Promise<CharacterResponse>;
  updateCharacter: (storyId: string, characterId: string, request: UpdateCharacterRequest) => Promise<void>;
  deleteCharacter: (storyId: string, characterId: string) => Promise<void>;

  // Actions - Scenes
  fetchScenes: (storyId: string, chapterId?: string) => Promise<void>;
  createScene: (storyId: string, request: CreateSceneRequest) => Promise<SceneResponse>;
  updateScene: (storyId: string, sceneId: string, request: UpdateSceneRequest) => Promise<void>;
  deleteScene: (storyId: string, sceneId: string) => Promise<void>;
  reorderScenes: (storyId: string, sceneIds: string[], chapterId?: string) => Promise<void>;

  // Actions - UI
  setSelectedStoryId: (id: string | null) => void;
  setStoryLibraryOpen: (open: boolean) => void;
  setStoryDetailModalOpen: (open: boolean) => void;
  setStoryFilters: (filters: Partial<ListStoriesParams>) => void;
  clearFilters: () => void;

  // Actions - Utility
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  // My Stories
  stories: [],
  storiesLoading: false,
  storiesTotalCount: 0,
  storiesPage: 1,
  storiesPageSize: 20,
  storiesHasMore: true,

  // Current Story
  currentStory: null,
  currentStoryLoading: false,
  hasUnsavedChanges: false,

  // Characters
  characters: [],
  charactersLoading: false,

  // Scenes
  scenes: [],
  scenesLoading: false,

  // Public/Discovery
  publicStories: [],
  publicStoriesLoading: false,
  featuredStories: [],
  trendingStories: [],

  // Filters
  storyFilters: {} as ListStoriesParams,

  // UI State
  selectedStoryId: null,
  storyLibraryOpen: false,
  storyDetailModalOpen: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useStoryStore = create<StoryStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // =======================================================================
      // My Stories Actions
      // =======================================================================

      fetchStories: async (params?: ListStoriesParams) => {
        set({ storiesLoading: true });
        try {
          const mergedParams = { ...get().storyFilters, ...params };
          const response = await storyLibraryService.listStories(mergedParams);
          set({
            stories: response.stories,
            storiesTotalCount: response.totalCount,
            storiesPage: response.page,
            storiesPageSize: response.pageSize,
            storiesHasMore: response.page < response.totalPages,
            storiesLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch stories:', error);
          set({ storiesLoading: false });
          throw error;
        }
      },

      fetchStory: async (id: string) => {
        set({ currentStoryLoading: true });
        try {
          const story = await storyLibraryService.getStory(id);
          set({ currentStory: story, currentStoryLoading: false, hasUnsavedChanges: false });
          // Also fetch characters and scenes for the story
          get().fetchCharacters(id);
          get().fetchScenes(id);
        } catch (error) {
          console.error('Failed to fetch story:', error);
          set({ currentStoryLoading: false });
          throw error;
        }
      },

      createStory: async (request: CreateStoryRequest) => {
        try {
          const story = await storyLibraryService.createStory(request);
          set((state) => ({
            stories: [story, ...state.stories],
            currentStory: story,
            hasUnsavedChanges: false,
          }));
          return story;
        } catch (error) {
          console.error('Failed to create story:', error);
          throw error;
        }
      },

      updateStory: async (id: string, request: UpdateStoryRequest) => {
        try {
          const updatedStory = await storyLibraryService.updateStory(id, request);
          set((state) => ({
            stories: state.stories.map((s) => (s.id === id ? updatedStory : s)),
            currentStory: state.currentStory?.id === id ? updatedStory : state.currentStory,
            hasUnsavedChanges: false,
          }));
        } catch (error) {
          console.error('Failed to update story:', error);
          throw error;
        }
      },

      deleteStory: async (id: string) => {
        try {
          await storyLibraryService.deleteStory(id);
          set((state) => ({
            stories: state.stories.filter((s) => s.id !== id),
            currentStory: state.currentStory?.id === id ? null : state.currentStory,
            selectedStoryId: state.selectedStoryId === id ? null : state.selectedStoryId,
          }));
        } catch (error) {
          console.error('Failed to delete story:', error);
          throw error;
        }
      },

      setCurrentStory: (story: StoryResponse | null) => {
        set({ currentStory: story, hasUnsavedChanges: false });
      },

      setHasUnsavedChanges: (hasChanges: boolean) => {
        set({ hasUnsavedChanges: hasChanges });
      },

      // =======================================================================
      // Publishing Actions
      // =======================================================================

      publishStory: async (id: string, request?: PublishStoryRequest) => {
        try {
          const updatedStory = await storyLibraryService.publishStory(id, request);
          set((state) => ({
            stories: state.stories.map((s) => (s.id === id ? updatedStory : s)),
            currentStory: state.currentStory?.id === id ? updatedStory : state.currentStory,
          }));
        } catch (error) {
          console.error('Failed to publish story:', error);
          throw error;
        }
      },

      unpublishStory: async (id: string) => {
        try {
          const updatedStory = await storyLibraryService.unpublishStory(id);
          set((state) => ({
            stories: state.stories.map((s) => (s.id === id ? updatedStory : s)),
            currentStory: state.currentStory?.id === id ? updatedStory : state.currentStory,
          }));
        } catch (error) {
          console.error('Failed to unpublish story:', error);
          throw error;
        }
      },

      likeStory: async (id: string) => {
        try {
          await storyLibraryService.likeStory(id);
          // Update local state to reflect the like
          set((state) => ({
            publicStories: state.publicStories.map((s) =>
              s.id === id ? { ...s, likesCount: (s as any).likesCount + 1 } : s
            ),
          }));
        } catch (error) {
          console.error('Failed to like story:', error);
          throw error;
        }
      },

      unlikeStory: async (id: string) => {
        try {
          await storyLibraryService.unlikeStory(id);
          set((state) => ({
            publicStories: state.publicStories.map((s) =>
              s.id === id ? { ...s, likesCount: Math.max(0, (s as any).likesCount - 1) } : s
            ),
          }));
        } catch (error) {
          console.error('Failed to unlike story:', error);
          throw error;
        }
      },

      // =======================================================================
      // Discovery Actions
      // =======================================================================

      fetchPublicStories: async (params?: PublicStoriesParams) => {
        set({ publicStoriesLoading: true });
        try {
          const response = await storyLibraryService.listPublicStories(params);
          set({ publicStories: response.stories, publicStoriesLoading: false });
        } catch (error) {
          console.error('Failed to fetch public stories:', error);
          set({ publicStoriesLoading: false });
          throw error;
        }
      },

      fetchFeaturedStories: async (limit = 10) => {
        try {
          const stories = await storyLibraryService.getFeaturedStories(limit);
          set({ featuredStories: stories });
        } catch (error) {
          console.error('Failed to fetch featured stories:', error);
          throw error;
        }
      },

      fetchTrendingStories: async (params?: TrendingParams) => {
        try {
          const stories = await storyLibraryService.getTrendingStories(params);
          set({ trendingStories: stories });
        } catch (error) {
          console.error('Failed to fetch trending stories:', error);
          throw error;
        }
      },

      // =======================================================================
      // Character Actions
      // =======================================================================

      fetchCharacters: async (storyId: string) => {
        set({ charactersLoading: true });
        try {
          const response = await storyLibraryService.listCharacters(storyId);
          set({ characters: response.items, charactersLoading: false });
        } catch (error) {
          console.error('Failed to fetch characters:', error);
          set({ charactersLoading: false });
          throw error;
        }
      },

      createCharacter: async (storyId: string, request: CreateCharacterRequest) => {
        try {
          const character = await storyLibraryService.createCharacter(storyId, request);
          set((state) => ({ characters: [...state.characters, character] }));
          return character;
        } catch (error) {
          console.error('Failed to create character:', error);
          throw error;
        }
      },

      updateCharacter: async (storyId: string, characterId: string, request: UpdateCharacterRequest) => {
        try {
          const updatedCharacter = await storyLibraryService.updateCharacter(storyId, characterId, request);
          set((state) => ({
            characters: state.characters.map((c) => (c.id === characterId ? updatedCharacter : c)),
          }));
        } catch (error) {
          console.error('Failed to update character:', error);
          throw error;
        }
      },

      deleteCharacter: async (storyId: string, characterId: string) => {
        try {
          await storyLibraryService.deleteCharacter(storyId, characterId);
          set((state) => ({
            characters: state.characters.filter((c) => c.id !== characterId),
          }));
        } catch (error) {
          console.error('Failed to delete character:', error);
          throw error;
        }
      },

      // =======================================================================
      // Scene Actions
      // =======================================================================

      fetchScenes: async (storyId: string, chapterId?: string) => {
        set({ scenesLoading: true });
        try {
          const response = await storyLibraryService.listScenes(storyId, chapterId);
          set({ scenes: response.items, scenesLoading: false });
        } catch (error) {
          console.error('Failed to fetch scenes:', error);
          set({ scenesLoading: false });
          throw error;
        }
      },

      createScene: async (storyId: string, request: CreateSceneRequest) => {
        try {
          const scene = await storyLibraryService.createScene(storyId, request);
          set((state) => ({ scenes: [...state.scenes, scene] }));
          return scene;
        } catch (error) {
          console.error('Failed to create scene:', error);
          throw error;
        }
      },

      updateScene: async (storyId: string, sceneId: string, request: UpdateSceneRequest) => {
        try {
          const updatedScene = await storyLibraryService.updateScene(storyId, sceneId, request);
          set((state) => ({
            scenes: state.scenes.map((s) => (s.id === sceneId ? updatedScene : s)),
          }));
        } catch (error) {
          console.error('Failed to update scene:', error);
          throw error;
        }
      },

      deleteScene: async (storyId: string, sceneId: string) => {
        try {
          await storyLibraryService.deleteScene(storyId, sceneId);
          set((state) => ({
            scenes: state.scenes.filter((s) => s.id !== sceneId),
          }));
        } catch (error) {
          console.error('Failed to delete scene:', error);
          throw error;
        }
      },

      reorderScenes: async (storyId: string, sceneIds: string[], chapterId?: string) => {
        try {
          await storyLibraryService.reorderScenes(storyId, { sceneIds, chapterId });
          // Re-fetch scenes to get updated order
          get().fetchScenes(storyId, chapterId);
        } catch (error) {
          console.error('Failed to reorder scenes:', error);
          throw error;
        }
      },

      // =======================================================================
      // UI Actions
      // =======================================================================

      setSelectedStoryId: (id: string | null) => {
        set({ selectedStoryId: id });
      },

      setStoryLibraryOpen: (open: boolean) => {
        set({ storyLibraryOpen: open });
      },

      setStoryDetailModalOpen: (open: boolean) => {
        set({ storyDetailModalOpen: open });
      },

      setStoryFilters: (filters: Partial<ListStoriesParams>) => {
        set((state) => ({
          storyFilters: { ...state.storyFilters, ...filters },
        }));
      },

      clearFilters: () => {
        set({ storyFilters: {} });
      },

      // =======================================================================
      // Utility Actions
      // =======================================================================

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'story-store' }
  )
);

export default useStoryStore;
