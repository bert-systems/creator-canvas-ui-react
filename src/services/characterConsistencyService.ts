/**
 * Character Consistency Service
 * Handles character lock, face memory, and element library operations
 * Supports multi-reference character generation with up to 5 face memory slots
 * Integrates with Kling O1 element library for consistent objects/characters in video
 */

import { api } from './api';

// ===== API Endpoints =====

const CHARACTER_API_BASE = '/api/character';
const ELEMENT_LIBRARY_API = '/api/kling/element-library';

// ===== Type Definitions =====

export interface CharacterProfile {
  id: string;
  name: string;
  description?: string;
  referenceImages: string[];
  faceEmbedding?: string; // Base64 encoded face embedding
  traits: CharacterTraits;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterTraits {
  age?: string;
  gender?: string;
  ethnicity?: string;
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  facialFeatures?: string[];
  distinguishingMarks?: string[];
  bodyType?: string;
  height?: string;
}

export interface FaceMemorySlot {
  slotIndex: number; // 0-4 for 5 slots
  name: string;
  imageUrl: string;
  embedding?: string;
  isActive: boolean;
}

export interface FaceMemoryState {
  slots: FaceMemorySlot[];
  activeSlotIndices: number[];
  sessionId: string;
}

export interface ElementLibraryItem {
  id: string;
  name: string;
  type: 'character' | 'object' | 'environment';
  imageUrls: string[];
  thumbnailUrl?: string;
  klingElementId?: string; // Kling O1 element ID for video generation
  createdAt: string;
}

export interface ElementLibrary {
  id: string;
  name: string;
  items: ElementLibraryItem[];
  createdAt: string;
}

// ===== Request Types =====

export interface CreateCharacterRequest {
  name: string;
  description?: string;
  referenceImages: string[]; // Up to 7 reference images
  extractTraits?: boolean;
}

export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  referenceImages?: string[];
  traits?: Partial<CharacterTraits>;
}

export interface GenerateWithCharacterRequest {
  characterId: string;
  prompt: string;
  scene?: string;
  pose?: string;
  style?: string;
  numImages?: number;
  width?: number;
  height?: number;
  preserveIdentityStrength?: number; // 0.0 - 1.0
}

export interface FaceMemoryRequest {
  faceImages: string[]; // Up to 5 face images
  slotNames?: string[];
}

export interface GenerateWithFaceMemoryRequest {
  prompt: string;
  activeSlotIndices: number[];
  characterAssignments?: Record<number, string>; // Slot index -> character name in prompt
  scene?: string;
  numImages?: number;
  width?: number;
  height?: number;
}

export interface CreateElementRequest {
  name: string;
  type: 'character' | 'object' | 'environment';
  imageUrls: string[];
}

export interface GenerateVideoWithElementsRequest {
  prompt: string;
  elementIds: string[];
  duration?: 5 | 10;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

// ===== Response Types =====

export interface CharacterResponse {
  success: boolean;
  data?: CharacterProfile;
  error?: string;
}

export interface GenerationResponse {
  success: boolean;
  images?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  requestId?: string;
  error?: string;
}

export interface FaceMemoryResponse {
  success: boolean;
  data?: FaceMemoryState;
  error?: string;
}

export interface ElementLibraryResponse {
  success: boolean;
  data?: ElementLibrary;
  error?: string;
}

export interface VideoGenerationResponse {
  success: boolean;
  jobId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
}

// ===== Helper Functions =====

const getUserId = (): string => {
  const authData = localStorage.getItem('authData');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.userId || parsed.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
  return 'anonymous';
};

const getAuthHeaders = () => ({
  headers: {
    'X-User-Id': getUserId(),
  },
});

// ===== Character Lock Service =====

export const characterLockService = {
  /**
   * Create a new character profile from reference images
   */
  async createCharacter(request: CreateCharacterRequest): Promise<CharacterResponse> {
    try {
      const response = await api.post<CharacterProfile>(
        `${CHARACTER_API_BASE}/profiles`,
        {
          name: request.name,
          description: request.description,
          referenceImages: request.referenceImages.slice(0, 7), // Max 7 refs
          extractTraits: request.extractTraits ?? true,
        },
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to create character:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create character',
      };
    }
  },

  /**
   * Get a character profile by ID
   */
  async getCharacter(characterId: string): Promise<CharacterResponse> {
    try {
      const response = await api.get<CharacterProfile>(
        `${CHARACTER_API_BASE}/profiles/${characterId}`,
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to get character:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get character',
      };
    }
  },

  /**
   * List all character profiles
   */
  async listCharacters(): Promise<{ success: boolean; data?: CharacterProfile[]; error?: string }> {
    try {
      const response = await api.get<{ characters: CharacterProfile[] }>(
        `${CHARACTER_API_BASE}/profiles`,
        getAuthHeaders()
      );
      return { success: true, data: response.data.characters };
    } catch (error) {
      console.error('Failed to list characters:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list characters',
      };
    }
  },

  /**
   * Update a character profile
   */
  async updateCharacter(
    characterId: string,
    request: UpdateCharacterRequest
  ): Promise<CharacterResponse> {
    try {
      const response = await api.put<CharacterProfile>(
        `${CHARACTER_API_BASE}/profiles/${characterId}`,
        request,
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to update character:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update character',
      };
    }
  },

  /**
   * Delete a character profile
   */
  async deleteCharacter(characterId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(
        `${CHARACTER_API_BASE}/profiles/${characterId}`,
        getAuthHeaders()
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to delete character:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete character',
      };
    }
  },

  /**
   * Generate images with a locked character
   */
  async generateWithCharacter(request: GenerateWithCharacterRequest): Promise<GenerationResponse> {
    try {
      const response = await api.post<{
        images: Array<{ url: string; width: number; height: number }>;
        requestId: string;
      }>(
        `${CHARACTER_API_BASE}/generate`,
        {
          characterId: request.characterId,
          prompt: request.prompt,
          scene: request.scene,
          pose: request.pose,
          style: request.style,
          numImages: request.numImages ?? 1,
          width: request.width ?? 1024,
          height: request.height ?? 1024,
          preserveIdentityStrength: request.preserveIdentityStrength ?? 0.8,
        },
        getAuthHeaders()
      );
      return {
        success: true,
        images: response.data.images,
        requestId: response.data.requestId,
      };
    } catch (error) {
      console.error('Failed to generate with character:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate with character',
      };
    }
  },
};

// ===== Face Memory Service =====

export const faceMemoryService = {
  /**
   * Initialize face memory with up to 5 faces
   */
  async initializeFaceMemory(request: FaceMemoryRequest): Promise<FaceMemoryResponse> {
    try {
      const slots: FaceMemorySlot[] = request.faceImages.slice(0, 5).map((imageUrl, index) => ({
        slotIndex: index,
        name: request.slotNames?.[index] || `Face ${index + 1}`,
        imageUrl,
        isActive: true,
      }));

      const response = await api.post<FaceMemoryState>(
        `${CHARACTER_API_BASE}/face-memory/initialize`,
        { slots },
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to initialize face memory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize face memory',
      };
    }
  },

  /**
   * Update a face memory slot
   */
  async updateSlot(
    sessionId: string,
    slotIndex: number,
    imageUrl: string,
    name?: string
  ): Promise<FaceMemoryResponse> {
    try {
      const response = await api.put<FaceMemoryState>(
        `${CHARACTER_API_BASE}/face-memory/${sessionId}/slots/${slotIndex}`,
        { imageUrl, name },
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to update face memory slot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update face memory slot',
      };
    }
  },

  /**
   * Toggle a face memory slot active/inactive
   */
  async toggleSlot(
    sessionId: string,
    slotIndex: number,
    isActive: boolean
  ): Promise<FaceMemoryResponse> {
    try {
      const response = await api.patch<FaceMemoryState>(
        `${CHARACTER_API_BASE}/face-memory/${sessionId}/slots/${slotIndex}/toggle`,
        { isActive },
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to toggle face memory slot:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle face memory slot',
      };
    }
  },

  /**
   * Generate images with face memory
   */
  async generateWithFaceMemory(
    sessionId: string,
    request: GenerateWithFaceMemoryRequest
  ): Promise<GenerationResponse> {
    try {
      const response = await api.post<{
        images: Array<{ url: string; width: number; height: number }>;
        requestId: string;
      }>(
        `${CHARACTER_API_BASE}/face-memory/${sessionId}/generate`,
        {
          prompt: request.prompt,
          activeSlotIndices: request.activeSlotIndices,
          characterAssignments: request.characterAssignments,
          scene: request.scene,
          numImages: request.numImages ?? 1,
          width: request.width ?? 1024,
          height: request.height ?? 1024,
        },
        getAuthHeaders()
      );
      return {
        success: true,
        images: response.data.images,
        requestId: response.data.requestId,
      };
    } catch (error) {
      console.error('Failed to generate with face memory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate with face memory',
      };
    }
  },

  /**
   * Clear face memory session
   */
  async clearSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(
        `${CHARACTER_API_BASE}/face-memory/${sessionId}`,
        getAuthHeaders()
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to clear face memory session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear face memory session',
      };
    }
  },
};

// ===== Element Library Service (Kling O1) =====

export const elementLibraryService = {
  /**
   * Create an element library
   */
  async createLibrary(name: string): Promise<ElementLibraryResponse> {
    try {
      const response = await api.post<ElementLibrary>(
        ELEMENT_LIBRARY_API,
        { name },
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to create element library:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create element library',
      };
    }
  },

  /**
   * Add an element to a library
   */
  async addElement(
    libraryId: string,
    request: CreateElementRequest
  ): Promise<{ success: boolean; data?: ElementLibraryItem; error?: string }> {
    try {
      const response = await api.post<ElementLibraryItem>(
        `${ELEMENT_LIBRARY_API}/${libraryId}/elements`,
        {
          name: request.name,
          type: request.type,
          imageUrls: request.imageUrls.slice(0, 7), // Max 7 reference images
        },
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to add element:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add element',
      };
    }
  },

  /**
   * Get an element library
   */
  async getLibrary(libraryId: string): Promise<ElementLibraryResponse> {
    try {
      const response = await api.get<ElementLibrary>(
        `${ELEMENT_LIBRARY_API}/${libraryId}`,
        getAuthHeaders()
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to get element library:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get element library',
      };
    }
  },

  /**
   * List all element libraries
   */
  async listLibraries(): Promise<{ success: boolean; data?: ElementLibrary[]; error?: string }> {
    try {
      const response = await api.get<{ libraries: ElementLibrary[] }>(
        ELEMENT_LIBRARY_API,
        getAuthHeaders()
      );
      return { success: true, data: response.data.libraries };
    } catch (error) {
      console.error('Failed to list element libraries:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list element libraries',
      };
    }
  },

  /**
   * Delete an element from a library
   */
  async deleteElement(
    libraryId: string,
    elementId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(
        `${ELEMENT_LIBRARY_API}/${libraryId}/elements/${elementId}`,
        getAuthHeaders()
      );
      return { success: true };
    } catch (error) {
      console.error('Failed to delete element:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete element',
      };
    }
  },

  /**
   * Generate video with elements (Kling O1)
   */
  async generateVideoWithElements(
    request: GenerateVideoWithElementsRequest
  ): Promise<VideoGenerationResponse> {
    try {
      const response = await api.post<{
        jobId: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
      }>(
        `${ELEMENT_LIBRARY_API}/generate-video`,
        {
          prompt: request.prompt,
          elementIds: request.elementIds,
          duration: request.duration ?? 5,
          aspectRatio: request.aspectRatio ?? '16:9',
        },
        getAuthHeaders()
      );
      return {
        success: true,
        jobId: response.data.jobId,
        status: response.data.status,
      };
    } catch (error) {
      console.error('Failed to generate video with elements:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate video with elements',
      };
    }
  },

  /**
   * Check video generation status
   */
  async getVideoStatus(jobId: string): Promise<VideoGenerationResponse> {
    try {
      const response = await api.get<{
        status: 'pending' | 'processing' | 'completed' | 'failed';
        videoUrl?: string;
        error?: string;
      }>(
        `${ELEMENT_LIBRARY_API}/generate-video/${jobId}`,
        getAuthHeaders()
      );
      return {
        success: true,
        jobId,
        status: response.data.status,
        videoUrl: response.data.videoUrl,
        error: response.data.error,
      };
    } catch (error) {
      console.error('Failed to get video status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get video status',
      };
    }
  },
};

// ===== Unified Character Service =====

export const characterConsistencyService = {
  characterLock: characterLockService,
  faceMemory: faceMemoryService,
  elementLibrary: elementLibraryService,

  /**
   * Get estimated cost for character operations
   */
  getEstimatedCost(
    operation: 'character-create' | 'character-generate' | 'face-memory-init' | 'face-memory-generate' | 'element-video',
    options?: { numImages?: number; duration?: number }
  ): number {
    const costs: Record<string, number> = {
      'character-create': 0.10, // Face embedding extraction
      'character-generate': 0.08, // Per image with character lock
      'face-memory-init': 0.15, // 5 face embeddings
      'face-memory-generate': 0.10, // Per image with multi-face
      'element-video-5s': 0.25,
      'element-video-10s': 0.45,
    };

    if (operation === 'character-generate' || operation === 'face-memory-generate') {
      const numImages = options?.numImages ?? 1;
      return costs[operation] * numImages;
    }

    if (operation === 'element-video') {
      const duration = options?.duration ?? 5;
      return costs[`element-video-${duration}s`] ?? 0.25;
    }

    return costs[operation] ?? 0.10;
  },
};

export default characterConsistencyService;
