/**
 * Character Store - Zustand state management for character library
 *
 * Supports:
 * - Standalone characters (via /api/characters) ✅ IMPLEMENTED
 * - Story-linked characters (via /api/stories/{storyId}/characters)
 * - Character-story linking for multi-story character usage
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  characterLibraryService,
  type StandaloneCharacter,
  type CreateCharacterRequest,
  type UpdateCharacterRequest,
  type ListCharactersParams,
  type LinkCharacterRequest,
  type CharacterStoryLink,
} from '@/services/characterLibraryService';
import {
  storyLibraryService,
  type CharacterResponse as StoryCharacterResponse,
  type CreateCharacterRequest as StoryCreateCharacterRequest,
  type UpdateCharacterRequest as StoryUpdateCharacterRequest,
} from '@/services/storyLibraryService';

// Re-export types for convenience
export type { StandaloneCharacter, CreateCharacterRequest, UpdateCharacterRequest, CharacterStoryLink };

// ============================================================================
// Store Types
// ============================================================================

interface CharacterStoreState {
  // Standalone characters
  characters: StandaloneCharacter[];
  charactersLoading: boolean;
  charactersTotalCount: number;
  charactersPage: number;
  charactersHasMore: boolean;

  // Story-linked characters (current story context)
  storyCharacters: StoryCharacterResponse[];
  storyCharactersLoading: boolean;
  currentStoryId: string | null;

  // Current selection
  currentCharacter: StandaloneCharacter | null;
  currentCharacterLoading: boolean;

  // Filters
  characterFilters: ListCharactersParams;

  // UI State
  selectedCharacterId: string | null;
  characterLibraryOpen: boolean;
  characterDetailModalOpen: boolean;

  // Actions - Standalone Characters
  fetchCharacters: (params?: ListCharactersParams) => Promise<void>;
  fetchCharacter: (id: string) => Promise<void>;
  createCharacter: (request: CreateCharacterRequest) => Promise<StandaloneCharacter>;
  updateCharacter: (id: string, request: UpdateCharacterRequest) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;

  // Actions - Story-Linked Characters
  fetchStoryCharacters: (storyId: string) => Promise<void>;
  createStoryCharacter: (storyId: string, request: StoryCreateCharacterRequest) => Promise<StoryCharacterResponse>;
  updateStoryCharacter: (storyId: string, characterId: string, request: StoryUpdateCharacterRequest) => Promise<void>;
  deleteStoryCharacter: (storyId: string, characterId: string) => Promise<void>;

  // Actions - Character-Story Linking
  linkCharacterToStory: (characterId: string, storyId: string, request?: LinkCharacterRequest) => Promise<void>;
  unlinkCharacterFromStory: (characterId: string, storyId: string) => Promise<void>;
  getLinkedStories: (characterId: string) => Promise<CharacterStoryLink[]>;

  // Actions - UI
  setSelectedCharacterId: (id: string | null) => void;
  setCharacterLibraryOpen: (open: boolean) => void;
  setCharacterDetailModalOpen: (open: boolean) => void;
  setCharacterFilters: (filters: Partial<ListCharactersParams>) => void;
  setCurrentStoryId: (storyId: string | null) => void;
  clearFilters: () => void;

  // Actions - Utility
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  characters: [],
  charactersLoading: false,
  charactersTotalCount: 0,
  charactersPage: 1,
  charactersHasMore: true,

  storyCharacters: [],
  storyCharactersLoading: false,
  currentStoryId: null,

  currentCharacter: null,
  currentCharacterLoading: false,

  characterFilters: {} as ListCharactersParams,

  selectedCharacterId: null,
  characterLibraryOpen: false,
  characterDetailModalOpen: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useCharacterStore = create<CharacterStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // =======================================================================
      // Standalone Characters Actions
      // =======================================================================

      fetchCharacters: async (params?: ListCharactersParams) => {
        set({ charactersLoading: true });
        try {
          const mergedParams = { ...get().characterFilters, ...params };
          const response = await characterLibraryService.listCharacters(mergedParams);
          set({
            characters: response.characters,
            charactersTotalCount: response.totalCount,
            charactersPage: response.page,
            charactersHasMore: response.page < response.totalPages,
            charactersLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch characters:', error);
          set({ charactersLoading: false });
          throw error;
        }
      },

      fetchCharacter: async (id: string) => {
        set({ currentCharacterLoading: true });
        try {
          const character = await characterLibraryService.getCharacter(id);
          set({ currentCharacter: character, currentCharacterLoading: false });
        } catch (error) {
          console.error('Failed to fetch character:', error);
          set({ currentCharacterLoading: false });
          throw error;
        }
      },

      createCharacter: async (request: CreateCharacterRequest) => {
        try {
          const character = await characterLibraryService.createCharacter(request);
          set((state) => ({
            characters: [character, ...state.characters],
            charactersTotalCount: state.charactersTotalCount + 1,
          }));
          return character;
        } catch (error) {
          console.error('Failed to create character:', error);
          throw error;
        }
      },

      updateCharacter: async (id: string, request: UpdateCharacterRequest) => {
        try {
          const updatedCharacter = await characterLibraryService.updateCharacter(id, request);
          set((state) => ({
            characters: state.characters.map((c) => (c.id === id ? updatedCharacter : c)),
            currentCharacter: state.currentCharacter?.id === id ? updatedCharacter : state.currentCharacter,
          }));
        } catch (error) {
          console.error('Failed to update character:', error);
          throw error;
        }
      },

      deleteCharacter: async (id: string) => {
        try {
          await characterLibraryService.deleteCharacter(id);
          set((state) => ({
            characters: state.characters.filter((c) => c.id !== id),
            charactersTotalCount: state.charactersTotalCount - 1,
            currentCharacter: state.currentCharacter?.id === id ? null : state.currentCharacter,
            selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
          }));
        } catch (error) {
          console.error('Failed to delete character:', error);
          throw error;
        }
      },

      // =======================================================================
      // Story-Linked Characters Actions
      // =======================================================================

      fetchStoryCharacters: async (storyId: string) => {
        set({ storyCharactersLoading: true, currentStoryId: storyId });
        try {
          const response = await storyLibraryService.listCharacters(storyId);
          set({
            storyCharacters: response.items,
            storyCharactersLoading: false,
          });
        } catch (error) {
          console.error('Failed to fetch story characters:', error);
          set({ storyCharactersLoading: false });
          throw error;
        }
      },

      createStoryCharacter: async (storyId: string, request: StoryCreateCharacterRequest) => {
        try {
          const character = await storyLibraryService.createCharacter(storyId, request);
          set((state) => ({
            storyCharacters: [...state.storyCharacters, character],
          }));
          return character;
        } catch (error) {
          console.error('Failed to create story character:', error);
          throw error;
        }
      },

      updateStoryCharacter: async (storyId: string, characterId: string, request: StoryUpdateCharacterRequest) => {
        try {
          const updatedCharacter = await storyLibraryService.updateCharacter(storyId, characterId, request);
          set((state) => ({
            storyCharacters: state.storyCharacters.map((c) =>
              c.id === characterId ? updatedCharacter : c
            ),
          }));
        } catch (error) {
          console.error('Failed to update story character:', error);
          throw error;
        }
      },

      deleteStoryCharacter: async (storyId: string, characterId: string) => {
        try {
          await storyLibraryService.deleteCharacter(storyId, characterId);
          set((state) => ({
            storyCharacters: state.storyCharacters.filter((c) => c.id !== characterId),
          }));
        } catch (error) {
          console.error('Failed to delete story character:', error);
          throw error;
        }
      },

      // =======================================================================
      // Character-Story Linking Actions
      // =======================================================================

      linkCharacterToStory: async (characterId: string, storyId: string, request?: LinkCharacterRequest) => {
        try {
          await characterLibraryService.linkToStory(characterId, storyId, request);
          // Refresh the character to get updated linked stories
          const character = await characterLibraryService.getCharacter(characterId);
          set((state) => ({
            characters: state.characters.map((c) => (c.id === characterId ? character : c)),
            currentCharacter: state.currentCharacter?.id === characterId ? character : state.currentCharacter,
          }));
        } catch (error) {
          console.error('Failed to link character to story:', error);
          throw error;
        }
      },

      unlinkCharacterFromStory: async (characterId: string, storyId: string) => {
        try {
          await characterLibraryService.unlinkFromStory(characterId, storyId);
          // Refresh the character to get updated linked stories
          const character = await characterLibraryService.getCharacter(characterId);
          set((state) => ({
            characters: state.characters.map((c) => (c.id === characterId ? character : c)),
            currentCharacter: state.currentCharacter?.id === characterId ? character : state.currentCharacter,
          }));
        } catch (error) {
          console.error('Failed to unlink character from story:', error);
          throw error;
        }
      },

      getLinkedStories: async (characterId: string) => {
        try {
          return await characterLibraryService.getLinkedStories(characterId);
        } catch (error) {
          console.error('Failed to get linked stories:', error);
          throw error;
        }
      },

      // =======================================================================
      // UI Actions
      // =======================================================================

      setSelectedCharacterId: (id: string | null) => {
        set({ selectedCharacterId: id });
      },

      setCharacterLibraryOpen: (open: boolean) => {
        set({ characterLibraryOpen: open });
      },

      setCharacterDetailModalOpen: (open: boolean) => {
        set({ characterDetailModalOpen: open });
      },

      setCharacterFilters: (filters: Partial<ListCharactersParams>) => {
        set((state) => ({
          characterFilters: { ...state.characterFilters, ...filters },
        }));
      },

      setCurrentStoryId: (storyId: string | null) => {
        set({ currentStoryId: storyId });
      },

      clearFilters: () => {
        set({ characterFilters: {} });
      },

      // =======================================================================
      // Utility Actions
      // =======================================================================

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'character-store' }
  )
);

export default useCharacterStore;
