/**
 * Virtual Try-On Service
 * Handles all fashion-related API calls including virtual try-on, clothes swap, and runway animation
 * Supports multiple providers: FASHN, IDM-VTON, CAT-VTON, Leffa, Kling-Kolors
 */

import { api } from './api';

const TRYON_API_BASE = '/api/ImageGeneration/virtual-tryon';
const FASHION_API_BASE = '/api/fashion';

// ===== Type Definitions =====

// Virtual Try-On Provider Types
export type TryOnProvider = 'fashn' | 'idm-vton' | 'cat-vton' | 'leffa' | 'kling-kolors';

// Garment Types
export type GarmentType = 'top' | 'bottom' | 'dress' | 'full-outfit' | 'upper_body' | 'lower_body' | 'dresses';
export type GarmentPhotoType = 'auto' | 'flat-lay' | 'model';
export type TryOnMode = 'quality' | 'speed' | 'balanced';
export type TryOnCategory = 'tops' | 'bottoms' | 'one-pieces';

// Animation Types
export type RunwayAnimationType = 'catwalk' | 'spin' | 'fabric-flow' | 'pose-to-pose';

// Common Response Types
export interface GeneratedTryOnImage {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
}

export interface TryOnJobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
}

// ===== Request Types =====

export interface VirtualTryOnRequest {
  // Human/Model image (one of these required)
  humanImage?: string;  // Base64 encoded
  human_image_url?: string;  // URL

  // Garment image (one of these required)
  garmentImage?: string;  // Base64 encoded
  garment_image_url?: string;  // URL

  // Garment configuration
  garmentDescription?: string;
  description?: string;
  category?: TryOnCategory;
  garmentType?: GarmentType;
  cloth_type?: string;
  garmentPhotoType?: GarmentPhotoType;

  // Generation settings
  mode?: TryOnMode;
  numInferenceSteps?: number;
  num_inference_steps?: number;
  guidanceScale?: number;
  guidance_scale?: number;
  seed?: number;
  numSamples?: number;
  num_samples?: number;

  // Output settings
  outputFormat?: 'png' | 'jpeg' | 'webp';
  output_format?: string;

  // Safety settings
  moderationLevel?: 'low' | 'medium' | 'high';
  moderation_level?: string;
  segmentationFree?: boolean;
  segmentation_free?: boolean;
  enableSafetyChecker?: boolean;
  enable_safety_checker?: boolean;

  // Session tracking
  sessionId?: string;
}

export interface ClothesSwapRequest {
  personImageUrl: string;
  prompt: string;
  preserveIdentity?: boolean;
  preserveBackground?: boolean;
  negativePrompt?: string;
  guidanceScale?: number;
  numInferenceSteps?: number;
  seed?: number;
}

export interface RunwayAnimationRequest {
  lookbookImageUrl: string;
  animationType: RunwayAnimationType;
  duration?: 5 | 10;
  audioEnabled?: boolean;
  cameraMotion?: 'static' | 'follow' | 'pan';
  musicStyle?: 'electronic' | 'classical' | 'ambient' | 'none';
}

// ===== Response Types =====

export interface VirtualTryOnResponse {
  model?: string;
  images?: GeneratedTryOnImage[];
  mask?: string;
  hasNsfwConcepts?: boolean;
  metadata?: Record<string, unknown>;
  requestId?: string;
  provider?: string;
  generationTime?: number;
}

export interface ClothesSwapResponse {
  imageUrl: string;
  thumbnailUrl?: string;
  requestId?: string;
  generationTime?: number;
  metadata?: Record<string, unknown>;
}

export interface RunwayAnimationResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  hasAudio?: boolean;
  progress?: number;
  error?: string;
}

// ===== API Response Wrapper =====

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

// ===== Virtual Try-On Service =====

export const virtualTryOnService = {
  /**
   * Try on garment using FASHN (recommended for quality)
   */
  async tryOnFashn(request: VirtualTryOnRequest): Promise<ApiResponse<VirtualTryOnResponse>> {
    const response = await api.post<VirtualTryOnResponse>(
      `${TRYON_API_BASE}/fashn`,
      {
        human_image_url: request.human_image_url || request.humanImage,
        garment_image_url: request.garment_image_url || request.garmentImage,
        category: request.category ?? 'tops',
        mode: request.mode ?? 'quality',
        garment_photo_type: request.garmentPhotoType ?? 'auto',
        num_samples: request.numSamples ?? request.num_samples ?? 1,
        output_format: request.outputFormat ?? 'png',
        segmentation_free: request.segmentationFree ?? false,
      },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Try on garment using IDM-VTON (good for complex garments)
   */
  async tryOnIdmVton(request: VirtualTryOnRequest): Promise<ApiResponse<VirtualTryOnResponse>> {
    const response = await api.post<VirtualTryOnResponse>(
      `${TRYON_API_BASE}/idm-vton`,
      {
        human_image_url: request.human_image_url || request.humanImage,
        garment_image_url: request.garment_image_url || request.garmentImage,
        garment_description: request.garmentDescription ?? request.description ?? '',
        num_inference_steps: request.numInferenceSteps ?? request.num_inference_steps ?? 30,
        guidance_scale: request.guidanceScale ?? request.guidance_scale ?? 2.5,
        seed: request.seed,
        num_samples: request.numSamples ?? request.num_samples ?? 1,
      },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Try on garment using CAT-VTON (fast processing)
   */
  async tryOnCatVton(request: VirtualTryOnRequest): Promise<ApiResponse<VirtualTryOnResponse>> {
    const response = await api.post<VirtualTryOnResponse>(
      `${TRYON_API_BASE}/cat-vton`,
      {
        human_image_url: request.human_image_url || request.humanImage,
        garment_image_url: request.garment_image_url || request.garmentImage,
        cloth_type: request.cloth_type ?? request.garmentType ?? 'upper_body',
        num_inference_steps: request.numInferenceSteps ?? 50,
        guidance_scale: request.guidanceScale ?? 2.5,
        seed: request.seed ?? -1,
      },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Try on garment using Leffa (balanced quality/speed)
   */
  async tryOnLefta(request: VirtualTryOnRequest): Promise<ApiResponse<VirtualTryOnResponse>> {
    const response = await api.post<VirtualTryOnResponse>(
      `${TRYON_API_BASE}/leffa`,
      {
        human_image_url: request.human_image_url || request.humanImage,
        garment_image_url: request.garment_image_url || request.garmentImage,
        garment_type: request.garmentType ?? 'upper_body',
        num_inference_steps: request.numInferenceSteps ?? 50,
        guidance_scale: request.guidanceScale ?? 2.5,
        seed: request.seed,
      },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Try on garment using Kling-Kolors (high quality, longer processing)
   */
  async tryOnKlingKolors(request: VirtualTryOnRequest): Promise<ApiResponse<VirtualTryOnResponse>> {
    const response = await api.post<VirtualTryOnResponse>(
      `${TRYON_API_BASE}/kling-kolors`,
      {
        human_image_url: request.human_image_url || request.humanImage,
        garment_image_url: request.garment_image_url || request.garmentImage,
        category: request.category ?? 'tops',
        num_samples: request.numSamples ?? 1,
        seed: request.seed,
      },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Auto-select best provider based on garment type and quality preference
   */
  async tryOnAuto(
    request: VirtualTryOnRequest,
    qualityPreference: 'speed' | 'quality' | 'balanced' = 'balanced'
  ): Promise<ApiResponse<VirtualTryOnResponse>> {
    // Provider selection logic
    let provider: TryOnProvider;

    if (qualityPreference === 'speed') {
      provider = 'cat-vton';
    } else if (qualityPreference === 'quality') {
      provider = 'fashn';
    } else {
      // Balanced - choose based on garment type
      const garmentType = request.garmentType ?? request.category;
      if (garmentType === 'dress' || garmentType === 'full-outfit' || garmentType === 'dresses') {
        provider = 'idm-vton'; // Better for complex garments
      } else {
        provider = 'leffa'; // Good balance for simple garments
      }
    }

    return this.tryOnWithProvider(request, provider);
  },

  /**
   * Try on with specific provider
   */
  async tryOnWithProvider(
    request: VirtualTryOnRequest,
    provider: TryOnProvider
  ): Promise<ApiResponse<VirtualTryOnResponse>> {
    switch (provider) {
      case 'fashn':
        return this.tryOnFashn(request);
      case 'idm-vton':
        return this.tryOnIdmVton(request);
      case 'cat-vton':
        return this.tryOnCatVton(request);
      case 'leffa':
        return this.tryOnLefta(request);
      case 'kling-kolors':
        return this.tryOnKlingKolors(request);
      default:
        return this.tryOnFashn(request);
    }
  },

  /**
   * Get available providers and their capabilities
   */
  getProviderInfo(): Record<TryOnProvider, { name: string; speed: string; quality: string; bestFor: string }> {
    return {
      'fashn': {
        name: 'FASHN',
        speed: 'Medium',
        quality: 'High',
        bestFor: 'Fashion photography, high-quality results',
      },
      'idm-vton': {
        name: 'IDM-VTON',
        speed: 'Slow',
        quality: 'Very High',
        bestFor: 'Complex garments, dresses, full outfits',
      },
      'cat-vton': {
        name: 'CAT-VTON',
        speed: 'Fast',
        quality: 'Good',
        bestFor: 'Quick iterations, simple garments',
      },
      'leffa': {
        name: 'Leffa',
        speed: 'Medium',
        quality: 'Good',
        bestFor: 'Balanced quality and speed',
      },
      'kling-kolors': {
        name: 'Kling-Kolors',
        speed: 'Slow',
        quality: 'High',
        bestFor: 'Realistic results, professional use',
      },
    };
  },
};

// ===== Clothes Swap Service (FLUX Kontext) =====

export const clothesSwapService = {
  /**
   * Swap clothes on a person using FLUX Kontext
   */
  async swap(request: ClothesSwapRequest): Promise<ApiResponse<ClothesSwapResponse>> {
    const response = await api.post<ClothesSwapResponse>(
      `${FASHION_API_BASE}/clothes-swap`,
      {
        personImageUrl: request.personImageUrl,
        prompt: request.prompt,
        preserveIdentity: request.preserveIdentity ?? true,
        preserveBackground: request.preserveBackground ?? true,
        negativePrompt: request.negativePrompt ?? 'blurry, distorted, low quality',
        guidanceScale: request.guidanceScale ?? 7.5,
        numInferenceSteps: request.numInferenceSteps ?? 30,
        seed: request.seed,
      },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },
};

// ===== Runway Animation Service =====

export const runwayAnimationService = {
  /**
   * Create runway/fashion animation from lookbook image
   */
  async create(request: RunwayAnimationRequest): Promise<ApiResponse<RunwayAnimationResponse>> {
    const response = await api.post<RunwayAnimationResponse>(
      `${FASHION_API_BASE}/runway-animation`,
      {
        lookbookImageUrl: request.lookbookImageUrl,
        animationType: request.animationType,
        duration: request.duration ?? 5,
        audioEnabled: request.audioEnabled ?? false,
        cameraMotion: request.cameraMotion ?? 'follow',
        musicStyle: request.musicStyle ?? 'none',
      },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Get status of a runway animation job
   */
  async getStatus(jobId: string): Promise<ApiResponse<RunwayAnimationResponse>> {
    const response = await api.get<RunwayAnimationResponse>(
      `${FASHION_API_BASE}/runway-animation/jobs/${jobId}`,
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Poll for job completion
   */
  async pollJobStatus(
    jobId: string,
    onProgress?: (status: RunwayAnimationResponse) => void,
    intervalMs = 3000,
    maxAttempts = 120
  ): Promise<RunwayAnimationResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await this.getStatus(jobId);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get job status');
      }

      const status = response.data;
      onProgress?.(status);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Animation generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }

    throw new Error('Job polling timeout exceeded');
  },
};

// ===== Unified Fashion Service =====

export const fashionService = {
  virtualTryOn: virtualTryOnService,
  clothesSwap: clothesSwapService,
  runwayAnimation: runwayAnimationService,

  /**
   * Get estimated cost for fashion operations
   */
  getEstimatedCost(
    operation: 'try-on' | 'clothes-swap' | 'runway-animation',
    options?: { provider?: TryOnProvider; duration?: number }
  ): number {
    const costs: Record<string, number> = {
      'try-on-fashn': 0.05,
      'try-on-idm-vton': 0.08,
      'try-on-cat-vton': 0.03,
      'try-on-leffa': 0.04,
      'try-on-kling-kolors': 0.07,
      'clothes-swap': 0.10,
      'runway-animation-5s': 0.25,
      'runway-animation-10s': 0.45,
    };

    if (operation === 'try-on') {
      return costs[`try-on-${options?.provider ?? 'fashn'}`] ?? 0.05;
    } else if (operation === 'runway-animation') {
      return costs[`runway-animation-${options?.duration ?? 5}s`] ?? 0.25;
    }

    return costs[operation] ?? 0.10;
  },
};

export default fashionService;
