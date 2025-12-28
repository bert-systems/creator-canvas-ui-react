/**
 * Story Library Service
 * Client-side API service for the Story Asset Library
 *
 * Provides CRUD operations for persisting stories to the backend,
 * enabling multi-device sync, sharing, and collaboration.
 */

import api from './api';

// ============================================================================
// ARCHETYPE MAPPING HELPERS
// ============================================================================

/**
 * Valid CharacterArchetype enum values from the API
 */
const VALID_ARCHETYPES = [
  'Hero', 'Mentor', 'Herald', 'ThresholdGuardian', 'Shapeshifter', 'Shadow',
  'Trickster', 'Ally', 'Mother', 'Father', 'Child', 'Rebel', 'Lover',
  'Creator', 'Ruler', 'Caregiver', 'Sage', 'Innocent', 'Explorer',
  'Everyman', 'Jester', 'Magician', 'Outlaw'
] as const;

type ValidArchetype = typeof VALID_ARCHETYPES[number];

/**
 * Maps free-form archetype descriptions to valid API enum values.
 * Uses keyword matching to find the best fit.
 */
function mapToValidArchetype(archetypeDescription: string): ValidArchetype {
  if (!archetypeDescription) return 'Ally';

  const lower = archetypeDescription.toLowerCase();

  // Direct match first (case-insensitive)
  const directMatch = VALID_ARCHETYPES.find(a => lower.includes(a.toLowerCase()));
  if (directMatch) return directMatch;

  // Keyword mapping
  if (lower.includes('hero') || lower.includes('protagonist') || lower.includes('chosen')) return 'Hero';
  if (lower.includes('mentor') || lower.includes('guide') || lower.includes('teacher') || lower.includes('wise')) return 'Mentor';
  if (lower.includes('herald') || lower.includes('messenger') || lower.includes('announcer')) return 'Herald';
  if (lower.includes('guardian') || lower.includes('threshold') || lower.includes('gatekeeper')) return 'ThresholdGuardian';
  if (lower.includes('shapeshifter') || lower.includes('chameleon') || lower.includes('deceiver')) return 'Shapeshifter';
  if (lower.includes('shadow') || lower.includes('villain') || lower.includes('antagonist') || lower.includes('tyrant') || lower.includes('bully')) return 'Shadow';
  if (lower.includes('trickster') || lower.includes('prankster') || lower.includes('fool')) return 'Trickster';
  if (lower.includes('ally') || lower.includes('companion') || lower.includes('sidekick') || lower.includes('friend') || lower.includes('loyal') || lower.includes('supporter')) return 'Ally';
  if (lower.includes('mother') || lower.includes('maternal')) return 'Mother';
  if (lower.includes('father') || lower.includes('paternal')) return 'Father';
  if (lower.includes('child') || lower.includes('youth') || lower.includes('innocent genius') || lower.includes('young')) return 'Child';
  if (lower.includes('rebel') || lower.includes('revolutionary') || lower.includes('outcast')) return 'Rebel';
  if (lower.includes('lover') || lower.includes('romantic')) return 'Lover';
  if (lower.includes('creator') || lower.includes('artist') || lower.includes('inventor') || lower.includes('innovator')) return 'Creator';
  if (lower.includes('ruler') || lower.includes('king') || lower.includes('queen') || lower.includes('leader')) return 'Ruler';
  if (lower.includes('caregiver') || lower.includes('nurturer') || lower.includes('healer')) return 'Caregiver';
  if (lower.includes('sage') || lower.includes('philosopher') || lower.includes('scholar')) return 'Sage';
  if (lower.includes('innocent') || lower.includes('naive') || lower.includes('pure') || lower.includes('underdog')) return 'Innocent';
  if (lower.includes('explorer') || lower.includes('seeker') || lower.includes('wanderer') || lower.includes('adventurer')) return 'Explorer';
  if (lower.includes('everyman') || lower.includes('ordinary') || lower.includes('regular')) return 'Everyman';
  if (lower.includes('jester') || lower.includes('clown') || lower.includes('comedian') || lower.includes('enthusiast')) return 'Jester';
  if (lower.includes('magician') || lower.includes('wizard') || lower.includes('sorcerer')) return 'Magician';
  if (lower.includes('outlaw') || lower.includes('rogue') || lower.includes('thief')) return 'Outlaw';

  // Default fallback
  return 'Ally';
}

/**
 * Cleans character name by removing markdown formatting
 */
function cleanCharacterName(name: string): string {
  if (!name) return 'Unknown';
  // Remove markdown bold/italic markers and trim
  return name.replace(/\*+/g, '').trim();
}

// ============================================================================
// Type Definitions
// ============================================================================

export type StoryStatus = 'Draft' | 'InProgress' | 'Complete' | 'Archived';

export type StoryGenre =
  | 'Fantasy' | 'SciFi' | 'Thriller' | 'Mystery' | 'Romance'
  | 'Horror' | 'Drama' | 'Comedy' | 'Adventure' | 'Literary'
  | 'Historical' | 'Contemporary' | 'Dystopian' | 'MagicalRealism';

export type StoryTone =
  | 'Dark' | 'Lighthearted' | 'Serious' | 'Whimsical'
  | 'Gritty' | 'Hopeful' | 'Melancholic' | 'Suspenseful';

export type POV = 'First' | 'Second' | 'ThirdLimited' | 'ThirdOmniscient' | 'Multiple';

export interface CharacterProfile {
  id?: string;
  name: string;
  role: string;
  archetype: string;
  briefDescription?: string;
  motivation?: string;
  appearance?: Record<string, unknown>;
  personality?: Record<string, unknown>;
  backstory?: Record<string, unknown>;
}

export interface OutlineData {
  acts: Array<{
    actNumber: number;
    title: string;
    summary: string;
    beats?: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  }>;
  majorBeats?: string[];
}

export interface SceneData {
  id?: string;
  title: string;
  slugline?: string;
  description: string;
  content?: string;
  characters?: string[];
  location?: string;
  mood?: string;
}

export interface LocationData {
  id?: string;
  name: string;
  type: string;
  description: string;
  atmosphere?: string;
}

export interface StoryData {
  title?: string;
  premise?: string;
  themes?: string[];
  genre?: StoryGenre;
  subGenre?: string;
  tone?: StoryTone;
  pointOfView?: POV;
  centralConflict?: string;
  stakes?: string;
  hook?: string;
  targetWordCount?: number;
  logline?: string;
  tagline?: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateStoryRequest {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  storyData?: StoryData;
  characters?: CharacterProfile[];
  outline?: OutlineData;
  scenes?: SceneData[];
  locations?: LocationData[];
  genre?: StoryGenre;
  tone?: StoryTone;
  pointOfView?: POV;
  targetLength?: string;
  targetAudience?: string;
  status?: StoryStatus;
  tags?: string[];
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  storyData?: StoryData;
  characters?: CharacterProfile[];
  outline?: OutlineData;
  scenes?: SceneData[];
  locations?: LocationData[];
  genre?: StoryGenre;
  tone?: StoryTone;
  pointOfView?: POV;
  targetLength?: string;
  targetAudience?: string;
  status?: StoryStatus;
  tags?: string[];
  wordCount?: number;
}

export interface ShareStoryRequest {
  userIds: string[];
  permission?: 'Read' | 'Edit' | 'Admin';
}

export interface PublishStoryRequest {
  visibility?: 'public' | 'private';
  categories?: string[];
  mature?: boolean;
  allowComments?: boolean;
  allowLikes?: boolean;
}

// ============================================================================
// Character Types
// ============================================================================

export interface CreateCharacterRequest {
  name: string;
  fullName?: string;
  aliases?: string[];
  age?: number;
  gender?: string;
  role: string;
  archetype: string;
  briefDescription?: string;
  portraitUrl?: string;
  fullProfile?: {
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
  };
}

export interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {}

export interface CharacterResponse {
  id: string;
  storyId: string;
  name: string;
  role: string;
  archetype: string;
  briefDescription?: string;
  fullProfile?: CreateCharacterRequest['fullProfile'];
  portraitUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterListResponse {
  items: CharacterResponse[];
  totalCount: number;
}

// ============================================================================
// Scene Types
// ============================================================================

export interface CreateSceneRequest {
  chapterId?: string;
  title: string;
  slugline?: string;
  description: string;
  content?: string;
  beats?: string[];
  characters?: string[];
  location?: string;
  timeOfDay?: string;
  mood?: string;
  position?: number;
}

export interface UpdateSceneRequest extends Partial<CreateSceneRequest> {}

export interface SceneIllustration {
  id: string;
  imageUrl: string;
  prompt: string;
  caption?: string;
  position: number;
}

export interface SceneResponse {
  id: string;
  storyId: string;
  chapterId?: string;
  title: string;
  slugline?: string;
  description: string;
  content?: string;
  beats?: string[];
  characters?: string[];
  location?: string;
  timeOfDay?: string;
  mood?: string;
  position: number;
  wordCount: number;
  headerImageUrl?: string;
  illustrations?: SceneIllustration[];
  createdAt: string;
  updatedAt: string;
}

export interface SceneListResponse {
  items: SceneResponse[];
  totalCount: number;
}

export interface ReorderScenesRequest {
  chapterId?: string;
  sceneIds: string[];
}

// ============================================================================
// Discovery Types
// ============================================================================

export interface PublicStoriesParams {
  page?: number;
  pageSize?: number;
  category?: string;
  genre?: string;
  sortBy?: 'trending' | 'newest' | 'popular' | 'featured';
  search?: string;
}

export interface TrendingParams {
  period?: 'day' | 'week' | 'month' | 'all';
  limit?: number;
}

export interface PublicStoryResponse extends StoryResponse {
  author?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  isFeatured: boolean;
  publishedAt?: string;
  isLikedByUser?: boolean;
}

export interface StoryResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  storyData?: StoryData;
  characters?: CharacterProfile[];
  outline?: OutlineData;
  scenes?: SceneData[];
  locations?: LocationData[];
  genre?: StoryGenre;
  tone?: StoryTone;
  pointOfView?: POV;
  targetLength?: string;
  targetAudience?: string;
  status: StoryStatus;
  tags?: string[];
  wordCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;
  sharedWith?: string[];
}

export interface StoriesListResponse {
  stories: StoryResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListStoriesParams {
  page?: number;
  pageSize?: number;
  status?: StoryStatus;
  genre?: StoryGenre;
  search?: string;
  tags?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Service Implementation
// ============================================================================

class StoryLibraryService {
  private readonly basePath = '/api/stories';

  /**
   * List all stories with optional filtering and pagination
   */
  async listStories(params?: ListStoriesParams): Promise<StoriesListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params?.status) queryParams.set('status', params.status);
    if (params?.genre) queryParams.set('genre', params.genre);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.tags) queryParams.set('tags', params.tags);
    if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    const response = await api.get<StoriesListResponse>(url);
    return response.data;
  }

  /**
   * Get a specific story by ID
   */
  async getStory(id: string): Promise<StoryResponse> {
    const response = await api.get<StoryResponse>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Create a new story
   */
  async createStory(request: CreateStoryRequest): Promise<StoryResponse> {
    const response = await api.post<StoryResponse>(this.basePath, request);
    return response.data;
  }

  /**
   * Update an existing story
   */
  async updateStory(id: string, request: UpdateStoryRequest): Promise<StoryResponse> {
    const response = await api.put<StoryResponse>(`${this.basePath}/${id}`, request);
    return response.data;
  }

  /**
   * Delete a story
   */
  async deleteStory(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`);
  }

  /**
   * Share a story with other users
   */
  async shareStory(id: string, request: ShareStoryRequest): Promise<StoryResponse> {
    const response = await api.post<StoryResponse>(`${this.basePath}/${id}/share`, request);
    return response.data;
  }

  // ==========================================================================
  // Publishing Methods
  // ==========================================================================

  /**
   * Publish a story to the community
   */
  async publishStory(id: string, request?: PublishStoryRequest): Promise<StoryResponse> {
    const response = await api.post<{ story: StoryResponse }>(`${this.basePath}/${id}/publish`, request || {});
    return response.data.story;
  }

  /**
   * Unpublish a story (make it private)
   */
  async unpublishStory(id: string): Promise<StoryResponse> {
    const response = await api.post<{ story: StoryResponse }>(`${this.basePath}/${id}/unpublish`);
    return response.data.story;
  }

  /**
   * Like a story
   */
  async likeStory(id: string): Promise<{ likesCount: number }> {
    const response = await api.post<{ likesCount: number }>(`${this.basePath}/${id}/like`);
    return response.data;
  }

  /**
   * Unlike a story
   */
  async unlikeStory(id: string): Promise<{ likesCount: number }> {
    const response = await api.delete<{ likesCount: number }>(`${this.basePath}/${id}/like`);
    return response.data;
  }

  // ==========================================================================
  // Discovery Methods
  // ==========================================================================

  /**
   * List public stories
   */
  async listPublicStories(params?: PublicStoriesParams): Promise<StoriesListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params?.category) queryParams.set('category', params.category);
    if (params?.genre) queryParams.set('genre', params.genre);
    if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params?.search) queryParams.set('search', params.search);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/public?${queryString}` : `${this.basePath}/public`;

    const response = await api.get<StoriesListResponse>(url);
    return response.data;
  }

  /**
   * Get featured stories
   */
  async getFeaturedStories(limit = 10): Promise<StoryResponse[]> {
    const response = await api.get<{ stories: StoryResponse[] }>(`${this.basePath}/featured?limit=${limit}`);
    return response.data.stories;
  }

  /**
   * Get trending stories
   */
  async getTrendingStories(params?: TrendingParams): Promise<StoryResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.set('period', params.period);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/trending?${queryString}` : `${this.basePath}/trending`;

    const response = await api.get<{ stories: StoryResponse[] }>(url);
    return response.data.stories;
  }

  // ==========================================================================
  // Character Methods
  // ==========================================================================

  /**
   * List characters for a story
   */
  async listCharacters(storyId: string): Promise<CharacterListResponse> {
    const response = await api.get<CharacterListResponse>(`${this.basePath}/${storyId}/characters`);
    return response.data;
  }

  /**
   * Get a specific character
   */
  async getCharacter(storyId: string, characterId: string): Promise<CharacterResponse> {
    const response = await api.get<{ character: CharacterResponse }>(`${this.basePath}/${storyId}/characters/${characterId}`);
    return response.data.character;
  }

  /**
   * Create a character for a story
   */
  async createCharacter(storyId: string, request: CreateCharacterRequest): Promise<CharacterResponse> {
    const response = await api.post<{ character: CharacterResponse }>(`${this.basePath}/${storyId}/characters`, request);
    return response.data.character;
  }

  /**
   * Update a character
   */
  async updateCharacter(storyId: string, characterId: string, request: UpdateCharacterRequest): Promise<CharacterResponse> {
    const response = await api.put<{ character: CharacterResponse }>(`${this.basePath}/${storyId}/characters/${characterId}`, request);
    return response.data.character;
  }

  /**
   * Delete a character
   */
  async deleteCharacter(storyId: string, characterId: string): Promise<void> {
    await api.delete(`${this.basePath}/${storyId}/characters/${characterId}`);
  }

  // ==========================================================================
  // Scene Methods
  // ==========================================================================

  /**
   * List scenes for a story
   */
  async listScenes(storyId: string, chapterId?: string): Promise<SceneListResponse> {
    const url = chapterId
      ? `${this.basePath}/${storyId}/scenes?chapterId=${chapterId}`
      : `${this.basePath}/${storyId}/scenes`;
    const response = await api.get<SceneListResponse>(url);
    return response.data;
  }

  /**
   * Get a specific scene
   */
  async getScene(storyId: string, sceneId: string): Promise<SceneResponse> {
    const response = await api.get<{ scene: SceneResponse }>(`${this.basePath}/${storyId}/scenes/${sceneId}`);
    return response.data.scene;
  }

  /**
   * Create a scene for a story
   */
  async createScene(storyId: string, request: CreateSceneRequest): Promise<SceneResponse> {
    const response = await api.post<{ scene: SceneResponse }>(`${this.basePath}/${storyId}/scenes`, request);
    return response.data.scene;
  }

  /**
   * Update a scene
   */
  async updateScene(storyId: string, sceneId: string, request: UpdateSceneRequest): Promise<SceneResponse> {
    const response = await api.put<{ scene: SceneResponse }>(`${this.basePath}/${storyId}/scenes/${sceneId}`, request);
    return response.data.scene;
  }

  /**
   * Delete a scene
   */
  async deleteScene(storyId: string, sceneId: string): Promise<void> {
    await api.delete(`${this.basePath}/${storyId}/scenes/${sceneId}`);
  }

  /**
   * Reorder scenes within a story or chapter
   */
  async reorderScenes(storyId: string, request: ReorderScenesRequest): Promise<void> {
    await api.post(`${this.basePath}/${storyId}/scenes/reorder`, request);
  }

  /**
   * Helper: Save story from Story Genesis node output
   * Transforms the node output format to the API request format
   */
  async saveFromNodeOutput(
    storyOutput: Record<string, unknown>,
    characters?: Array<Record<string, unknown>>,
    outline?: Record<string, unknown>,
    tags?: string[]
  ): Promise<StoryResponse> {
    const storyData: StoryData = {
      title: storyOutput.title as string,
      premise: storyOutput.premise as string,
      themes: storyOutput.themes as string[],
      genre: storyOutput.genre as StoryGenre,
      tone: storyOutput.tone as StoryTone,
      centralConflict: storyOutput.centralConflict as string,
      stakes: storyOutput.stakes as string,
      hook: storyOutput.hook as string,
      logline: storyOutput.logline as string,
      tagline: storyOutput.tagline as string,
    };

    const characterProfiles: CharacterProfile[] = (characters || []).map(char => ({
      name: cleanCharacterName(char.name as string),
      role: (char.role as string) || 'Supporting',
      archetype: mapToValidArchetype(char.archetype as string),
      briefDescription: (char.briefDescription as string) || '',
      motivation: (char.motivation as string) || '',
    }));

    const outlineData: OutlineData | undefined = outline ? {
      acts: ((outline.acts as Array<Record<string, unknown>>) || []).map(act => ({
        actNumber: act.actNumber as number,
        title: act.title as string,
        summary: act.summary as string,
      })),
      majorBeats: outline.majorBeats as string[],
    } : undefined;

    const request: CreateStoryRequest = {
      title: storyData.title || 'Untitled Story',
      description: storyData.logline,
      storyData,
      characters: characterProfiles,
      outline: outlineData,
      genre: storyData.genre,
      tone: storyData.tone,
      status: 'Draft',
      tags: tags || [],
    };

    return this.createStory(request);
  }
}

// Export singleton instance
export const storyLibraryService = new StoryLibraryService();

export default storyLibraryService;
