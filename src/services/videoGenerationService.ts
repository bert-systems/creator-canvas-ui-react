/**
 * Video Generation Service
 * Handles all video generation API calls for Kling 2.6, Kling O1, VEO 3.1, and Kling Avatar
 */

import { api } from './api';

const VIDEO_API_BASE = '/api/video-generation';

// ===== Type Definitions =====

// Common Types
export type Resolution = '720p' | '1080p' | '1440p' | '4K';
export type Duration = 5 | 8 | 10;
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';
export type AudioType = 'dialogue' | 'ambient' | 'mixed' | 'none';
export type CameraMotion = 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'zoom-in' | 'zoom-out' | 'static' | 'auto' | 'orbit';
export type KlingModel = 'kling-2.6-pro' | 'kling-2.5-turbo';
export type VEOMode = 'standard' | 'fast';
export type EditType = 'background-replace' | 'style-transfer' | 'element-modify';
export type TransitionStyle = 'smooth' | 'dynamic' | 'artful';

// Job Status
export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface VideoJobResponse {
  jobId: string;
  status: JobStatus;
  estimatedTime?: number;
  progress?: number;
  queuePosition?: number;
}

export interface VideoJobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface VideoResult {
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  resolution: Resolution;
  hasAudio: boolean;
  metadata?: Record<string, unknown>;
}

// ===== Kling 2.6 Types =====

export interface KlingTextToVideoRequest {
  prompt: string;
  duration?: Duration;
  resolution?: Resolution;
  audioEnabled?: boolean;
  audioType?: AudioType;
  aspectRatio?: AspectRatio;
  model?: KlingModel;
  negativePrompt?: string;
  seed?: number;
}

export interface KlingImageToVideoRequest {
  imageUrl: string;
  prompt?: string;
  duration?: Duration;
  motionStrength?: number; // 0-100
  cameraMotion?: CameraMotion;
  audioEnabled?: boolean;
  audioType?: AudioType;
  resolution?: Resolution;
  negativePrompt?: string;
  seed?: number;
}

// ===== Kling O1 Types =====

export interface KlingO1ReferenceToVideoRequest {
  referenceImages: string[]; // Up to 7 URLs
  prompt: string;
  duration?: Duration;
  startFrame?: string;
  endFrame?: string;
  cameraMotion?: CameraMotion;
  resolution?: Resolution;
  preserveCharacterConsistency?: boolean;
}

export interface KlingO1VideoEditRequest {
  videoUrl: string;
  editType: EditType;
  referenceImages?: string[]; // Up to 4
  prompt: string;
  preserveMotion?: boolean;
}

// ===== VEO 3.1 Types =====

export interface VEOGenerateRequest {
  prompt: string;
  duration?: 8;
  resolution?: '720p' | '1080p';
  audioEnabled?: boolean;
  mode?: VEOMode;
  negativePrompt?: string;
  aspectRatio?: AspectRatio;
  seed?: number;
}

export interface VEOFramesToVideoRequest {
  startFrameUrl: string;
  endFrameUrl: string;
  duration?: number; // 2-8 seconds
  transitionStyle?: TransitionStyle;
  prompt?: string;
}

// ===== Kling Avatar Types =====

export interface KlingAvatarRequest {
  imageUrl: string;
  audioUrl: string;
  resolution?: '720p' | '1080p';
  fps?: 30 | 48;
  expressionIntensity?: number; // 0-100
  headMotion?: boolean;
}

// ===== API Response Wrapper =====

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== Service Implementation =====

// Helper to get user ID from auth context or localStorage
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

// Helper to create headers with X-User-Id
const getAuthHeaders = () => ({
  headers: {
    'X-User-Id': getUserId(),
  },
});

// ===== Kling 2.6 Service =====

export const klingService = {
  /**
   * Generate video from text prompt using Kling 2.6
   */
  async textToVideo(request: KlingTextToVideoRequest): Promise<ApiResponse<VideoJobResponse>> {
    const response = await api.post<ApiResponse<VideoJobResponse>>(
      `${VIDEO_API_BASE}/kling/text-to-video`,
      {
        prompt: request.prompt,
        duration: request.duration ?? 5,
        resolution: request.resolution ?? '1080p',
        audioEnabled: request.audioEnabled ?? true,
        audioType: request.audioType ?? 'ambient',
        aspectRatio: request.aspectRatio ?? '16:9',
        model: request.model ?? 'kling-2.6-pro',
        negativePrompt: request.negativePrompt,
        seed: request.seed,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Animate a static image using Kling 2.6 Image-to-Video
   */
  async imageToVideo(request: KlingImageToVideoRequest): Promise<ApiResponse<VideoJobResponse>> {
    const response = await api.post<ApiResponse<VideoJobResponse>>(
      `${VIDEO_API_BASE}/kling/image-to-video`,
      {
        imageUrl: request.imageUrl,
        prompt: request.prompt,
        duration: request.duration ?? 5,
        motionStrength: request.motionStrength ?? 50,
        cameraMotion: request.cameraMotion ?? 'auto',
        audioEnabled: request.audioEnabled ?? false,
        audioType: request.audioType,
        resolution: request.resolution ?? '1080p',
        negativePrompt: request.negativePrompt,
        seed: request.seed,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Check the status of a Kling video generation job
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<VideoJobStatusResponse>> {
    const response = await api.get<ApiResponse<VideoJobStatusResponse>>(
      `${VIDEO_API_BASE}/kling/jobs/${jobId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Cancel a running Kling job
   */
  async cancelJob(jobId: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
      `${VIDEO_API_BASE}/kling/jobs/${jobId}/cancel`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Kling O1 Service (Character Consistency) =====

export const klingO1Service = {
  /**
   * Generate video with character consistency using reference images
   */
  async referenceToVideo(request: KlingO1ReferenceToVideoRequest): Promise<ApiResponse<VideoJobResponse>> {
    if (request.referenceImages.length === 0 || request.referenceImages.length > 7) {
      return {
        success: false,
        error: 'referenceImages must contain 1-7 images',
      };
    }

    const response = await api.post<ApiResponse<VideoJobResponse>>(
      `${VIDEO_API_BASE}/kling-o1/reference-to-video`,
      {
        referenceImages: request.referenceImages,
        prompt: request.prompt,
        duration: request.duration ?? 5,
        startFrame: request.startFrame,
        endFrame: request.endFrame,
        cameraMotion: request.cameraMotion ?? 'auto',
        resolution: request.resolution ?? '1080p',
        preserveCharacterConsistency: request.preserveCharacterConsistency ?? true,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Edit an existing video (background replace, style transfer, element modify)
   */
  async videoEdit(request: KlingO1VideoEditRequest): Promise<ApiResponse<VideoJobResponse>> {
    if (request.referenceImages && request.referenceImages.length > 4) {
      return {
        success: false,
        error: 'referenceImages must contain at most 4 images',
      };
    }

    const response = await api.post<ApiResponse<VideoJobResponse>>(
      `${VIDEO_API_BASE}/kling-o1/video-edit`,
      {
        videoUrl: request.videoUrl,
        editType: request.editType,
        referenceImages: request.referenceImages,
        prompt: request.prompt,
        preserveMotion: request.preserveMotion ?? true,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Check the status of a Kling O1 job
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<VideoJobStatusResponse>> {
    const response = await api.get<ApiResponse<VideoJobStatusResponse>>(
      `${VIDEO_API_BASE}/kling-o1/jobs/${jobId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== VEO 3.1 Service =====

export const veoService = {
  /**
   * Generate cinematic video using VEO 3.1
   */
  async generate(request: VEOGenerateRequest): Promise<ApiResponse<VideoJobResponse>> {
    const response = await api.post<ApiResponse<VideoJobResponse>>(
      `${VIDEO_API_BASE}/veo/generate`,
      {
        prompt: request.prompt,
        duration: 8, // VEO 3.1 fixed at 8s
        resolution: request.resolution ?? '1080p',
        audioEnabled: request.audioEnabled ?? true,
        mode: request.mode ?? 'standard',
        negativePrompt: request.negativePrompt,
        aspectRatio: request.aspectRatio ?? '16:9',
        seed: request.seed,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate quick draft video using VEO 3.1 Fast mode
   */
  async generateDraft(request: VEOGenerateRequest): Promise<ApiResponse<VideoJobResponse>> {
    return this.generate({
      ...request,
      mode: 'fast',
      resolution: '720p', // Fast mode uses lower resolution
    });
  },

  /**
   * Generate video from start/end frames (scene extension)
   */
  async framesToVideo(request: VEOFramesToVideoRequest): Promise<ApiResponse<VideoJobResponse>> {
    const response = await api.post<ApiResponse<VideoJobResponse>>(
      `${VIDEO_API_BASE}/veo/frames-to-video`,
      {
        startFrameUrl: request.startFrameUrl,
        endFrameUrl: request.endFrameUrl,
        duration: request.duration ?? 4,
        transitionStyle: request.transitionStyle ?? 'smooth',
        prompt: request.prompt,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Check the status of a VEO job
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<VideoJobStatusResponse>> {
    const response = await api.get<ApiResponse<VideoJobStatusResponse>>(
      `${VIDEO_API_BASE}/veo/jobs/${jobId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Kling Avatar v2 Service (Talking Head) =====

export const klingAvatarService = {
  /**
   * Generate talking head video from image and audio
   */
  async generate(request: KlingAvatarRequest): Promise<ApiResponse<VideoJobResponse>> {
    const response = await api.post<ApiResponse<VideoJobResponse>>(
      `${VIDEO_API_BASE}/kling-avatar/generate`,
      {
        imageUrl: request.imageUrl,
        audioUrl: request.audioUrl,
        resolution: request.resolution ?? '1080p',
        fps: request.fps ?? 30,
        expressionIntensity: request.expressionIntensity ?? 70,
        headMotion: request.headMotion ?? true,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Check the status of a Kling Avatar job
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<VideoJobStatusResponse>> {
    const response = await api.get<ApiResponse<VideoJobStatusResponse>>(
      `${VIDEO_API_BASE}/kling-avatar/jobs/${jobId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Unified Video Service =====

export const videoGenerationService = {
  kling: klingService,
  klingO1: klingO1Service,
  veo: veoService,
  klingAvatar: klingAvatarService,

  /**
   * Poll for job completion with callback
   */
  async pollJobStatus(
    provider: 'kling' | 'kling-o1' | 'veo' | 'kling-avatar',
    jobId: string,
    onProgress?: (status: VideoJobStatusResponse) => void,
    intervalMs = 3000,
    maxAttempts = 200 // ~10 minutes max
  ): Promise<VideoJobStatusResponse> {
    const getStatus = async () => {
      switch (provider) {
        case 'kling':
          return klingService.getJobStatus(jobId);
        case 'kling-o1':
          return klingO1Service.getJobStatus(jobId);
        case 'veo':
          return veoService.getJobStatus(jobId);
        case 'kling-avatar':
          return klingAvatarService.getJobStatus(jobId);
      }
    };

    let attempts = 0;
    while (attempts < maxAttempts) {
      const response = await getStatus();

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get job status');
      }

      const status = response.data;
      onProgress?.(status);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed' || status.status === 'cancelled') {
        throw new Error(status.error || `Job ${status.status}`);
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }

    throw new Error('Job polling timeout exceeded');
  },

  /**
   * Get estimated cost for a video generation job
   */
  getEstimatedCost(
    provider: 'kling' | 'kling-o1' | 'veo' | 'kling-avatar',
    duration: number,
    resolution: Resolution
  ): number {
    // Placeholder cost estimation (credits per second)
    const baseCosts: Record<string, number> = {
      'kling': 0.05,
      'kling-o1': 0.08,
      'veo': 0.06,
      'kling-avatar': 0.04,
    };

    const resolutionMultipliers: Record<Resolution, number> = {
      '720p': 1.0,
      '1080p': 1.5,
      '1440p': 2.0,
      '4K': 3.0,
    };

    const baseCost = baseCosts[provider] ?? 0.05;
    const multiplier = resolutionMultipliers[resolution] ?? 1.5;

    return baseCost * duration * multiplier;
  },
};

export default videoGenerationService;
