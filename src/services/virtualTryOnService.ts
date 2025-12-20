/**
 * Virtual Try-On Service
 * Handles all fashion-related API calls including virtual try-on, clothes swap, and runway animation
 * Supports multiple providers: FASHN, IDM-VTON, CAT-VTON, Leffa, Kling-Kolors
 */

import { api } from './api';

// Provider-specific virtual try-on endpoints
const TRYON_API_BASE = '/api/ImageGeneration/virtual-tryon';
// Unified virtual try-on API (swagger v5)
const UNIFIED_TRYON_API = '/api/VirtualTryOn';
// Fashion-specific endpoints
const FASHION_API_BASE = '/api/fashion';

// ===== Type Definitions =====

// Virtual Try-On Provider Types
export type TryOnProvider = 'fashn' | 'idm-vton' | 'cat-vton' | 'leffa' | 'kling-kolors';

// Garment Types
export type GarmentType = 'top' | 'bottom' | 'dress' | 'full-outfit' | 'upper_body' | 'lower_body' | 'dresses';
export type GarmentPhotoType = 'auto' | 'flat-lay' | 'model';
export type TryOnMode = 'quality' | 'performance' | 'balanced';  // fal.ai FASHN expects 'performance' not 'speed'
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

// Swagger v3 aligned types
export interface ClothesSwapRequest {
  modelImage: string;           // Required - URL of model/person image
  garmentImage: string;         // Required - URL of garment to swap in
  garmentDescription?: string;  // Optional description of garment
  category?: 'tops' | 'bottoms' | 'dresses' | 'outerwear';  // Garment category
  modelId?: string;             // Optional model ID for consistency
}

// Walk style options for runway animation (Swagger v3 uses plain string type)
export type WalkStyle = 'haute-couture' | 'rtw' | 'commercial' | 'editorial' | 'streetwear' | string;
export type CameraStyle = 'static' | 'follow' | 'crane' | 'multi-angle' | string;

export interface RunwayAnimationRequest {
  onModelImage: string;         // Required - URL of styled model image
  model?: ModelData;            // Optional model data
  garment?: GarmentData;        // Optional garment data
  walkStyle?: string;           // Walk style: haute-couture, rtw, commercial, editorial, streetwear
  duration?: string | number;   // Animation duration: "5s" or "10s" (or number for backward compat)
  cameraStyle?: string;         // Camera movement style: static, follow, crane, multi-angle
}

// Supporting types for RunwayAnimationRequest
export interface ModelData {
  id?: string;
  bodyType?: string;
  skinTone?: string;
  pose?: string;
}

export interface GarmentData {
  id?: string;
  type?: string;
  description?: string;
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

// Swagger v3 aligned response types
export interface ClothesSwapResponse {
  success: boolean;
  images?: string[];              // Array of generated image URLs
  jobId?: string;                 // Job ID for async operations
  cost?: number;                  // Cost of the operation
  errors?: string[];              // Error messages if any
}

export interface RunwayAnimationResponse {
  success: boolean;
  jobId?: string;                 // Job ID for polling
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;              // Video URL when completed
  errors?: string[];              // Error messages if any
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

// ===== Clothes Swap Service =====

export const clothesSwapService = {
  /**
   * Swap clothes on a person using virtual try-on AI
   * Aligned with Swagger v3 API schema
   * Note: ASP.NET controller may expect payload wrapped in "request" object
   */
  async swap(request: ClothesSwapRequest): Promise<ApiResponse<ClothesSwapResponse>> {
    const requestPayload = {
      modelImage: request.modelImage,
      garmentImage: request.garmentImage,
      garmentDescription: request.garmentDescription,
      category: request.category,
      modelId: request.modelId,
    };

    console.log('[clothesSwapService.swap] Sending payload:', requestPayload);

    const response = await api.post<ClothesSwapResponse>(
      `${FASHION_API_BASE}/clothes-swap`,
      // Wrap payload in "request" object as expected by ASP.NET controller
      { request: requestPayload },
      getAuthHeaders()
    );
    return { success: response.data.success, data: response.data };
  },
};

// ===== Runway Animation Service =====

export const runwayAnimationService = {
  /**
   * Create runway/fashion animation from styled model image
   * Aligned with Swagger v3 API schema
   * Note: ASP.NET controller expects payload wrapped in "request" object
   */
  async create(request: RunwayAnimationRequest): Promise<ApiResponse<RunwayAnimationResponse>> {
    // Ensure duration is a string (e.g., "5s", "10s")
    const durationStr = typeof request.duration === 'number'
      ? `${request.duration}s`
      : (request.duration ?? '5s');

    const requestPayload = {
      onModelImage: request.onModelImage,
      model: request.model,
      garment: request.garment,
      walkStyle: request.walkStyle ?? 'commercial',
      duration: durationStr,
      cameraStyle: request.cameraStyle ?? 'follow',
    };

    console.log('[runwayAnimationService.create] Sending payload:', requestPayload);

    const response = await api.post<RunwayAnimationResponse>(
      `${FASHION_API_BASE}/runway-animation`,
      // Wrap payload in "request" object as expected by ASP.NET controller
      { request: requestPayload },
      getAuthHeaders()
    );
    return { success: response.data.success, data: response.data };
  },

  /**
   * Get status of a runway animation job
   */
  async getStatus(jobId: string): Promise<ApiResponse<RunwayAnimationResponse>> {
    const response = await api.get<RunwayAnimationResponse>(
      `${FASHION_API_BASE}/runway-animation/jobs/${jobId}`,
      getAuthHeaders()
    );
    return { success: response.data.success, data: response.data };
  },

  /**
   * Poll for job completion
   * Aligned with Swagger v3 response structure
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
        throw new Error(status.errors?.[0] || 'Animation generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }

    throw new Error('Job polling timeout exceeded');
  },
};

// ============================================================================
// Unified Virtual Try-On API (swagger v5 - /api/VirtualTryOn)
// ============================================================================

export interface VirtualTryOnModelInfo {
  modelId: string;
  displayName: string;
  description?: string;
  resolution?: string;
  pricing?: string;
  capabilities?: string[];
  requiresDescription?: boolean;
  supportsFlatLay?: boolean;
  returnsMask?: boolean;
  supportedGarmentTypes?: string[];
}

export const unifiedTryOnService = {
  /**
   * Get list of available virtual try-on models
   * GET /api/VirtualTryOn/models
   */
  async getModels(): Promise<VirtualTryOnModelInfo[]> {
    const response = await api.get<VirtualTryOnModelInfo[]>(
      `${UNIFIED_TRYON_API}/models`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate virtual try-on with auto-selected model
   * POST /api/VirtualTryOn/generate
   */
  async generate(request: VirtualTryOnRequest): Promise<ApiResponse<VirtualTryOnResponse>> {
    const response = await api.post<VirtualTryOnResponse>(
      `${UNIFIED_TRYON_API}/generate`,
      request,
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Generate virtual try-on with specific model
   * POST /api/VirtualTryOn/generate/{model}
   */
  async generateWithModel(
    model: string,
    request: VirtualTryOnRequest
  ): Promise<ApiResponse<VirtualTryOnResponse>> {
    const response = await api.post<VirtualTryOnResponse>(
      `${UNIFIED_TRYON_API}/generate/${model}`,
      { ...request, model },
      getAuthHeaders()
    );
    return { success: true, data: response.data };
  },

  /**
   * Validate virtual try-on request
   * GET /api/VirtualTryOn/validate
   */
  async validate(): Promise<{ valid: boolean; message?: string }> {
    const response = await api.get<{ valid: boolean; message?: string }>(
      `${UNIFIED_TRYON_API}/validate`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Unified Fashion Service =====

export const fashionService = {
  virtualTryOn: virtualTryOnService,
  unifiedTryOn: unifiedTryOnService,
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
