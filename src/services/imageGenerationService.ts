/**
 * Image Generation Service
 * Unified API service for image generation using various AI providers
 * Aligned with swagger v5 API schema: /api/ImageGeneration endpoints
 */

import { api } from './api';

// ============================================================================
// Type Definitions - Aligned with swagger v5 ImageGenerationRequest schema
// ============================================================================

export interface ImageGenerationRequest {
  /** Model/provider to use (e.g., 'flux-pro', 'flux-dev', 'nano-banana') */
  model?: string;
  /** Text prompt describing the image to generate */
  prompt?: string;
  /** Negative prompt for elements to avoid */
  negativePrompt?: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Number of images to generate */
  numImages?: number;
  /** Random seed for reproducibility */
  seed?: number;
  /** Style preset */
  style?: string;
  /** Guidance scale for prompt adherence */
  guidanceScale?: number;
  /** Reference image URL for img2img */
  referenceImageUrl?: string;
  /** Reference image base64 */
  referenceImage?: string;
  /** Reference image binary data */
  referenceImageData?: string;
  /** Strength of reference image influence (0-1) */
  strength?: number;
  /** Context strength for FLUX Kontext */
  contextStrength?: number;
  /** Preserve structure when using reference */
  preserveStructure?: boolean;
  /** ControlNet conditioning image URL */
  controlNetImageUrl?: string;
  /** ControlNet conditioning image base64 */
  controlNetImage?: string;
  /** ControlNet type (canny, depth, pose, etc.) */
  controlNetType?: string;
  /** ControlNet influence strength */
  controlNetStrength?: number;
  /** LoRA model to apply */
  loraModel?: string;
  /** LoRA scale */
  loraScale?: number;
  /** Upscale factor for output */
  upscaleFactor?: number;
  /** Style reference image URL */
  styleReferenceUrl?: string;
  /** Style reference strength */
  styleStrength?: number;
  /** Multiple image URLs for batch processing */
  imageUrls?: string[];
  /** Output resolution preset */
  resolution?: string;
  /** Aspect ratio (e.g., '16:9', '1:1', '9:16') */
  aspectRatio?: string;
  /** Additional provider-specific parameters */
  additionalParameters?: Record<string, unknown>;
}

export interface GeneratedImage {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
  seed?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  images?: GeneratedImage[];
  jobId?: string;
  status?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ModelCapabilities {
  supportsNegativePrompt?: boolean;
  supportsSeed?: boolean;
  supportsStyle?: boolean;
  supportsGuidanceScale?: boolean;
  supportsInpainting?: boolean;
  supportsOutpainting?: boolean;
  supportsVariations?: boolean;
  supportsImageToImage?: boolean;
  supportsControlNet?: boolean;
  supportsLoRA?: boolean;
  supportsUpscaling?: boolean;
  supportsStyleTransfer?: boolean;
  supportsIPAdapter?: boolean;
  maxPromptLength?: number;
  supportedStyles?: string[];
  supportedControlNetTypes?: string[];
  supportedUpscaleFactors?: number[];
  minInferenceSteps?: number;
  maxInferenceSteps?: number;
}

export interface ModelPricing {
  pricePerImage?: number;
  currency?: string;
}

export interface SupportedSize {
  width: number;
  height: number;
  aspectRatio: string;
}

export interface ModelInfo {
  // API response format (from providers endpoint)
  modelId?: string;
  displayName?: string;
  // Legacy format
  id?: string;
  name?: string;
  description?: string;
  tier?: 'flagship' | 'production' | 'creative' | 'fast';
  cost?: string;
  pricing?: ModelPricing;
  capabilities?: ModelCapabilities | string[];
  supportedSizes?: SupportedSize[];
  /** Supported modes: 't2i' (text-to-image), 'i2i' (image-to-image) */
  modes?: ('t2i' | 'i2i')[];
  /** Default parameters */
  defaults?: {
    width?: number;
    height?: number;
    guidanceScale?: number;
  };
}

export interface ProviderInfo {
  id: string;
  name: string;
  description?: string;
  capabilities?: string[];
  pricing?: string;
  /** Available models under this provider */
  models?: ModelInfo[];
}

export interface ProvidersResponse {
  success: boolean;
  providers?: ProviderInfo[];
  error?: string | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

const API_BASE = '/api/ImageGeneration';

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

// ============================================================================
// Image Generation Service
// ============================================================================

export const imageGenerationService = {
  /**
   * Get list of available image generation providers and their models
   * GET /api/imagegeneration/providers
   * Returns provider info with available models, tiers, and capabilities
   */
  async getProviders(): Promise<ProvidersResponse> {
    const response = await api.get<ProvidersResponse>(
      `${API_BASE}/providers`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get flat list of all available models across all providers
   * Useful for model selection dropdowns
   */
  async getAllModels(): Promise<ModelInfo[]> {
    const providersResponse = await this.getProviders();
    if (!providersResponse.success || !providersResponse.providers) {
      return [];
    }
    // Flatten models from all providers
    return providersResponse.providers.flatMap(p => p.models || []);
  },

  /**
   * Generate images with auto-selected provider
   * POST /api/ImageGeneration/generate
   */
  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await api.post<ImageGenerationResponse>(
      `${API_BASE}/generate`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate images with specific provider
   * POST /api/ImageGeneration/generate/{providerName}
   */
  async generateWithProvider(
    providerName: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const response = await api.post<ImageGenerationResponse>(
      `${API_BASE}/generate/${providerName}`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Validate image generation request
   * GET /api/ImageGeneration/validate
   */
  async validate(): Promise<{ valid: boolean; message?: string }> {
    const response = await api.get<{ valid: boolean; message?: string }>(
      `${API_BASE}/validate`,
      getAuthHeaders()
    );
    return response.data;
  },

  // ==========================================================================
  // Convenience Methods - Provider-specific shortcuts
  // ==========================================================================

  /**
   * Generate with FLUX Pro (highest quality)
   */
  async generateFluxPro(request: Omit<ImageGenerationRequest, 'model'>): Promise<ImageGenerationResponse> {
    return this.generateWithProvider('flux-pro', { ...request, model: 'flux-pro' });
  },

  /**
   * Generate with FLUX Dev (balanced quality/speed)
   */
  async generateFluxDev(request: Omit<ImageGenerationRequest, 'model'>): Promise<ImageGenerationResponse> {
    return this.generateWithProvider('flux-dev', { ...request, model: 'flux-dev' });
  },

  /**
   * Generate with FLUX Schnell (fastest)
   */
  async generateFluxSchnell(request: Omit<ImageGenerationRequest, 'model'>): Promise<ImageGenerationResponse> {
    return this.generateWithProvider('flux-schnell', { ...request, model: 'flux-schnell' });
  },

  /**
   * Generate with FLUX Kontext (reference-based editing)
   */
  async generateFluxKontext(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    return this.generateWithProvider('flux-kontext', { ...request, model: 'flux-kontext' });
  },

  /**
   * Generate with Nano Banana Pro
   */
  async generateNanoBanana(request: Omit<ImageGenerationRequest, 'model'>): Promise<ImageGenerationResponse> {
    return this.generateWithProvider('nano-banana-pro', { ...request, model: 'nano-banana-pro' });
  },

  /**
   * Upscale image using AI upscaler
   */
  async upscale(imageUrl: string, factor: number = 2): Promise<ImageGenerationResponse> {
    return this.generate({
      referenceImageUrl: imageUrl,
      upscaleFactor: factor,
    });
  },

  /**
   * Image-to-image generation
   */
  async img2img(
    referenceImageUrl: string,
    prompt: string,
    options?: {
      strength?: number;
      negativePrompt?: string;
      model?: string;
    }
  ): Promise<ImageGenerationResponse> {
    return this.generate({
      referenceImageUrl,
      prompt,
      strength: options?.strength ?? 0.7,
      negativePrompt: options?.negativePrompt,
      model: options?.model ?? 'flux-dev',
    });
  },

  /**
   * Style transfer from reference image
   */
  async styleTransfer(
    contentImageUrl: string,
    styleReferenceUrl: string,
    prompt?: string,
    styleStrength: number = 0.8
  ): Promise<ImageGenerationResponse> {
    return this.generate({
      referenceImageUrl: contentImageUrl,
      styleReferenceUrl,
      styleStrength,
      prompt,
    });
  },

  /**
   * Generate with ControlNet conditioning
   */
  async generateWithControlNet(
    prompt: string,
    controlNetImageUrl: string,
    controlNetType: 'canny' | 'depth' | 'pose' | 'lineart' | 'softedge',
    options?: {
      controlNetStrength?: number;
      model?: string;
      width?: number;
      height?: number;
    }
  ): Promise<ImageGenerationResponse> {
    return this.generate({
      prompt,
      controlNetImageUrl,
      controlNetType,
      controlNetStrength: options?.controlNetStrength ?? 0.8,
      model: options?.model,
      width: options?.width,
      height: options?.height,
    });
  },

  /**
   * Generate variations of an image
   */
  async generateVariations(
    imageUrl: string,
    numVariations: number = 4,
    variationStrength: number = 0.3
  ): Promise<ImageGenerationResponse> {
    return this.generate({
      referenceImageUrl: imageUrl,
      numImages: numVariations,
      strength: variationStrength,
    });
  },

  /**
   * Generate with LoRA model
   */
  async generateWithLora(
    prompt: string,
    loraModel: string,
    options?: {
      loraScale?: number;
      width?: number;
      height?: number;
      negativePrompt?: string;
    }
  ): Promise<ImageGenerationResponse> {
    return this.generate({
      prompt,
      loraModel,
      loraScale: options?.loraScale ?? 0.8,
      width: options?.width,
      height: options?.height,
      negativePrompt: options?.negativePrompt,
    });
  },
};

export default imageGenerationService;
