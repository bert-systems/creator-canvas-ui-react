/**
 * Story Library Service
 * Client-side API service for the Story Asset Library
 *
 * Provides CRUD operations for persisting stories to the backend,
 * enabling multi-device sync, sharing, and collaboration.
 */

import api from './api';

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
      name: char.name as string,
      role: char.role as string,
      archetype: char.archetype as string,
      briefDescription: char.briefDescription as string,
      motivation: char.motivation as string,
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
