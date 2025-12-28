/**
 * Character Library Service - API client for standalone character management
 *
 * Endpoints: /api/characters
 * - CRUD operations for standalone characters
 * - Character-story linking for multi-story character usage
 */

import api from './api';

// ============================================================================
// Types
// ============================================================================

export interface CharacterFullProfile {
  age?: number;
  gender?: string;
  physicalDescription?: string;
  personality?: {
    traits?: string[];
    fears?: string[];
    desires?: string[];
  };
  backstory?: string;
  motivation?: string;
  arc?: string;
  relationships?: Array<{
    characterId: string;
    type: string;
    description?: string;
  }>;
  voice?: {
    speechPatterns?: string[];
    catchphrases?: string[];
    vocabulary?: string;
  };
}

export interface StandaloneCharacter {
  id: string;
  userId?: string;
  storyId?: string | null; // Nullable - standalone characters have no story
  name: string;
  fullName?: string;
  aliases?: string[];
  age?: number;
  gender?: string;
  role?: string;
  archetype?: string;
  briefDescription?: string;
  fullProfile?: CharacterFullProfile;
  portraitUrl?: string;
  portraitPrompt?: string;
  position?: number;
  createdAt: string;
  updatedAt: string;
  // Populated when fetching single character
  linkedStories?: CharacterStoryLink[];
}

export interface CharacterStoryLink {
  id: string;
  characterId: string;
  storyId: string;
  role?: string;
  notes?: string;
  createdAt: string;
  // Populated story info
  storyTitle?: string;
}

export interface CreateCharacterRequest {
  name: string;
  fullName?: string;
  aliases?: string[];
  age?: number;
  gender?: string;
  role?: string;
  archetype?: string;
  briefDescription?: string;
  portraitUrl?: string;
  portraitPrompt?: string;
  fullProfile?: CharacterFullProfile;
}

export interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {}

export interface LinkCharacterRequest {
  role?: string;
  notes?: string;
}

export interface ListCharactersParams {
  page?: number;
  pageSize?: number;
  role?: string;
  archetype?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CharacterListResponse {
  success: boolean;
  characters: StandaloneCharacter[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CharacterResponse {
  success: boolean;
  character: StandaloneCharacter;
  error?: string;
}

export interface CharacterStoriesResponse {
  success: boolean;
  stories: CharacterStoryLink[];
}

// ============================================================================
// Service Implementation
// ============================================================================

const API_BASE = '/api/characters';

export const characterLibraryService = {
  // ==========================================================================
  // Character CRUD
  // ==========================================================================

  /**
   * List user's standalone characters
   */
  async listCharacters(params?: ListCharactersParams): Promise<CharacterListResponse> {
    const response = await api.get<CharacterListResponse>(API_BASE, { params });
    return response.data;
  },

  /**
   * Get a specific character with linked stories
   */
  async getCharacter(id: string): Promise<StandaloneCharacter> {
    const response = await api.get<CharacterResponse>(`${API_BASE}/${id}`);
    return response.data.character;
  },

  /**
   * Create a standalone character
   */
  async createCharacter(request: CreateCharacterRequest): Promise<StandaloneCharacter> {
    const response = await api.post<CharacterResponse>(API_BASE, request);
    return response.data.character;
  },

  /**
   * Update a character
   */
  async updateCharacter(id: string, request: UpdateCharacterRequest): Promise<StandaloneCharacter> {
    const response = await api.put<CharacterResponse>(`${API_BASE}/${id}`, request);
    return response.data.character;
  },

  /**
   * Delete a character
   */
  async deleteCharacter(id: string): Promise<void> {
    await api.delete(`${API_BASE}/${id}`);
  },

  // ==========================================================================
  // Character-Story Linking
  // ==========================================================================

  /**
   * Link a character to a story
   */
  async linkToStory(characterId: string, storyId: string, request?: LinkCharacterRequest): Promise<void> {
    await api.post(`${API_BASE}/${characterId}/stories/${storyId}`, request || {});
  },

  /**
   * Unlink a character from a story
   */
  async unlinkFromStory(characterId: string, storyId: string): Promise<void> {
    await api.delete(`${API_BASE}/${characterId}/stories/${storyId}`);
  },

  /**
   * Get all stories a character is linked to
   */
  async getLinkedStories(characterId: string): Promise<CharacterStoryLink[]> {
    const response = await api.get<CharacterStoriesResponse>(`${API_BASE}/${characterId}/stories`);
    return response.data.stories;
  },

  // ==========================================================================
  // Helpers
  // ==========================================================================

  /**
   * Create character from generation output (helper for flows)
   */
  async createFromGeneration(
    generatedCharacter: {
      name: string;
      age?: number;
      gender?: string;
      role?: string;
      archetype?: string;
      motivation?: string;
      goal?: string;
      fear?: string;
      backstory?: { origin?: string };
      personality?: { traits?: string[] };
      arc?: string;
    },
    portraitUrl?: string,
    portraitPrompt?: string
  ): Promise<StandaloneCharacter> {
    const request: CreateCharacterRequest = {
      name: generatedCharacter.name,
      fullName: generatedCharacter.name,
      age: generatedCharacter.age,
      gender: generatedCharacter.gender,
      role: generatedCharacter.role,
      archetype: generatedCharacter.archetype,
      briefDescription: generatedCharacter.motivation || generatedCharacter.backstory?.origin,
      portraitUrl,
      portraitPrompt,
      fullProfile: {
        age: generatedCharacter.age,
        gender: generatedCharacter.gender,
        personality: generatedCharacter.personality ? {
          traits: generatedCharacter.personality.traits,
          fears: generatedCharacter.fear ? [generatedCharacter.fear] : undefined,
          desires: generatedCharacter.goal ? [generatedCharacter.goal] : undefined,
        } : undefined,
        backstory: generatedCharacter.backstory?.origin,
        motivation: generatedCharacter.motivation,
        arc: generatedCharacter.arc,
      },
    };

    return this.createCharacter(request);
  },
};

export default characterLibraryService;
