/**
 * socialMediaService.ts - Social Media Content API Service Layer
 * Provides API integration for social media content creation nodes
 * Aligns with API endpoints from NEW_CATEGORIES_API_REQUIREMENTS.md
 */

import api from './api';
import {
  socialPlatformMap,
  contentToneMap,
  captionLengthMap,
  carouselTypeMap,
  socialContentTypeMap,
  storyTypeMap,
  hashtagStrategyMap,
  mapEnum,
} from './apiEnumMapper';

// ==================== TYPE DEFINITIONS ====================

// ===== Enums (aligned with API schema) =====

export type SocialPlatform =
  | 'instagram' | 'instagramStory' | 'tiktok'
  | 'facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'threads' | 'youtube';

export type SocialContentType =
  | 'promotional' | 'educational' | 'bts' | 'ugc'
  | 'announcement' | 'inspirational' | 'testimonial' | 'lifestyle';

export type ContentTone =
  | 'professional' | 'casual' | 'playful' | 'luxury'
  | 'edgy' | 'warm' | 'authoritative' | 'friendly';

export type CarouselType =
  | 'educational' | 'product' | 'beforeAfter' | 'steps'
  | 'listicle' | 'story' | 'comparison' | 'quotes';

export type SocialVisualStyle =
  | 'modern' | 'bold' | 'professional' | 'playful'
  | 'minimal' | 'colorful' | 'elegant' | 'casual';

export type StoryType =
  | 'showcase' | 'bts' | 'tutorial' | 'announcement'
  | 'testimonial' | 'dayInLife' | 'transformation' | 'trend';

export type CaptionLength = 'short' | 'medium' | 'long';

export type HashtagStrategy = 'niche' | 'popular' | 'mixed' | 'branded';

export type PostingFrequency = 'multiple' | 'daily' | 'frequent' | 'weekly';

export type PlanDuration = 'week' | 'twoWeeks' | 'month';

export type StoryDuration = '15s' | '30s' | '60s';

export type MusicMood = 'upbeat' | 'chill' | 'dramatic' | 'inspiring' | 'trending';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ContentPriority = 'high' | 'medium' | 'low';

export type EngagementLevel = 'low' | 'medium' | 'high';

// ===== Interfaces =====

export interface Caption {
  text: string;
  characterCount: number;
  emojiCount: number;
  callToAction?: string;
}

export interface PlatformSpecs {
  platform: SocialPlatform;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  maxCaptionLength: number;
  recommendedHashtags: number;
}

export interface HashtagSet {
  hashtags: string[];
  categories: {
    niche: string[];
    popular: string[];
    branded: string[];
  };
  totalReach: string;
}

export interface CarouselSlide {
  slideNumber: number;
  imageUrl: string;
  headline?: string;
  bodyText?: string;
  isCallToAction: boolean;
}

// ===== Parallel Carousel Generation Types =====

/**
 * Style seed for ensuring visual consistency across carousel slides
 */
export interface CarouselStyleSeed {
  colorPalette?: string[];
  styleKeywords?: string[];
  typographyStyle?: string;
  mood?: string;
  visualElements?: string;
}

/**
 * Content for a single carousel slide (from plan endpoint)
 */
export interface CarouselSlideContent {
  slideNumber: number;
  slideType?: string;
  headline?: string;
  bodyText?: string;
  imagePromptHint?: string;
  isCallToAction: boolean;
}

/**
 * Image dimensions for carousel slides
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ContentQueueItem {
  id: string;
  type: 'image' | 'carousel' | 'video' | 'story';
  content: string;
  platforms: SocialPlatform[];
  priority?: ContentPriority;
}

export interface AudienceInsights {
  peakEngagementTimes: string[];
  topPerformingDays: string[];
  audienceTimezone: string;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platform: SocialPlatform;
  scheduledTime: string;
  optimizationReason: string;
  estimatedEngagement: EngagementLevel;
}

export interface CalendarWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  posts: ScheduledPost[];
}

export interface CalendarView {
  weeks: CalendarWeek[];
  summary: {
    postsPerDay: Record<string, number>;
    gaps: string[];
    overlaps: string[];
  };
}

export interface ContentSuggestion {
  type: string;
  suggestion: string;
  priority: ContentPriority;
  reason: string;
}

export interface AudioTrack {
  name: string;
  artist?: string;
  url: string;
}

export interface VideoOutput {
  url: string;
  duration: number;
  dimensions: { width: number; height: number };
  fileSize: number;
}

// ===== Request Interfaces =====

export interface SocialPostRequest {
  topic: string;
  brandKit?: string;
  productImage?: string;
  platform: SocialPlatform;
  contentType: SocialContentType;
  tone: ContentTone;
  includeCaption: boolean;
  includeHashtags: boolean;
  hashtagCount?: number;
  /** Override the default image generation model (e.g., 'flux-pro', 'nano-banana-pro') */
  imageModel?: string;
  /** Override the default LLM model (e.g., 'gemini-2.5-flash', 'gemini-2.0-flash') */
  llmModel?: string;
}

export interface CarouselRequest {
  topic: string;
  brandKit?: string;
  sourceImages?: string[];
  platform: 'instagram' | 'linkedin' | 'facebook';
  slideCount: number;
  carouselType: CarouselType;
  visualStyle: SocialVisualStyle;
  includeCaption: boolean;
  /** Override the default image generation model for carousel slides */
  imageModel?: string;
  /** Override the default LLM model for carousel content */
  llmModel?: string;
}

export interface CaptionRequest {
  postImage?: string;
  context: string;
  brandKit?: string;
  platform: SocialPlatform;
  tone: ContentTone;
  length: CaptionLength;
  includeEmojis: boolean;
  includeCTA: boolean;
  hashtagCount: number;
  hashtagStrategy?: HashtagStrategy;
  /** Override the default LLM model for caption generation */
  llmModel?: string;
}

export interface StoryCreateRequest {
  concept: string;
  sourceImages?: string[];
  brandKit?: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  duration: StoryDuration;
  storyType: StoryType;
  includeMusic: boolean;
  includeTextOverlays: boolean;
  musicMood?: MusicMood;
  /** Override the default video generation model for story/reel creation */
  videoModel?: string;
}

export interface TemplateCustomizeRequest {
  templateId: string;
  brandKit?: string;
  content?: string;
  featureImage?: string;
  platform: SocialPlatform;
  generateVariations: boolean;
  /** Override the default image generation model for template customization */
  imageModel?: string;
}

export interface ContentScheduleRequest {
  posts: ContentQueueItem[];
  platforms: SocialPlatform[];
  frequency: PostingFrequency;
  planDuration: PlanDuration;
  optimizeTimings: boolean;
  timezone: string;
  audienceData?: AudienceInsights;
  /** Override the default LLM model for content scheduling optimization */
  llmModel?: string;
}

// ===== Parallel Carousel Request/Response Interfaces =====

/**
 * Request for carousel planning (LLM-only, fast)
 * POST /api/social/carousel/plan
 */
export interface CarouselPlanRequest {
  topic: string;
  brandKit?: string;
  platform: 'instagram' | 'linkedin' | 'facebook';
  slideCount: number;
  carouselType: CarouselType;
  visualStyle: SocialVisualStyle;
  /** Override LLM model */
  llmModel?: string;
}

/**
 * Response from carousel planning
 */
export interface CarouselPlanResponse {
  success: boolean;
  styleSeed?: CarouselStyleSeed;
  slides?: CarouselSlideContent[];
  dimensions?: ImageDimensions;
  platform?: string;
  cost: number;
  errors?: string[];
  processingTimeMs: number;
}

/**
 * Request for generating a single carousel slide
 * POST /api/social/carousel/slide/generate
 */
export interface CarouselSlideGenerateRequest {
  topic: string;
  slideContent: CarouselSlideContent;
  styleSeed: CarouselStyleSeed;
  totalSlides: number;
  platform: 'instagram' | 'linkedin' | 'facebook';
  dimensions?: ImageDimensions;
  /** Override image generation model */
  imageModel?: string;
}

/**
 * Response from generating a single slide
 */
export interface CarouselSlideGenerateResponse {
  success: boolean;
  slide?: CarouselSlide;
  cost: number;
  errors?: string[];
  processingTimeMs: number;
  generationId?: string;
  assetId?: string;
}

/**
 * Aggregated result from parallel carousel generation
 */
export interface ParallelCarouselResult {
  plan?: CarouselPlanResponse;
  slides: CarouselSlide[];
  caption?: Caption;
  totalTimeMs: number;
  totalCost: number;
  errors: string[];
}

// ===== Response Interfaces =====

export interface SocialPostResponse {
  postImage: string;
  caption?: Caption;
  hashtags?: string[];
  alternativeVersions?: {
    imageUrl: string;
    style: string;
  }[];
  platformSpecs: PlatformSpecs;
}

export interface CarouselResponse {
  slides: CarouselSlide[];
  caption?: Caption;
  coverSlide: string;
  metadata: {
    totalSlides: number;
    platform: string;
    dimensions: { width: number; height: number };
  };
}

export interface CaptionResponse {
  caption: Caption;
  hashtags: HashtagSet;
  alternatives: Caption[];
  engagementTips: string[];
}

export interface StoryCreateResponse {
  jobId: string;
  status: JobStatus;
  video?: VideoOutput;
  frames?: string[];
  audioTrack?: AudioTrack;
}

export interface TemplateCustomizeResponse {
  customizedPost: string;
  colorVariations?: string[];
  editableTemplate?: {
    format: 'figma' | 'canva' | 'psd';
    url: string;
  };
}

export interface ContentScheduleResponse {
  schedule: ScheduledPost[];
  calendar: CalendarView;
  suggestions: ContentSuggestion[];
  analytics: {
    totalPosts: number;
    platformBreakdown: Record<string, number>;
    contentMix: Record<string, number>;
    estimatedReach: string;
  };
}

// ==================== API SERVICE ====================

const SOCIAL_API_BASE = '/api/social';

export const socialMediaService = {
  // ===== Post Generation =====

  /**
   * Generate platform-optimized social media posts
   * POST /api/social/post/generate
   */
  async generatePost(request: SocialPostRequest): Promise<SocialPostResponse> {
    const apiRequest = {
      ...request,
      platform: mapEnum(request.platform, socialPlatformMap),
      contentType: mapEnum(request.contentType, socialContentTypeMap),
      tone: mapEnum(request.tone, contentToneMap),
    };
    const response = await api.post<SocialPostResponse>(
      `${SOCIAL_API_BASE}/post/generate`,
      apiRequest
    );
    return response.data;
  },

  // ===== Carousel Generation =====

  /**
   * Create multi-slide carousel posts (sequential - slower)
   * POST /api/social/carousel/generate
   */
  async generateCarousel(request: CarouselRequest): Promise<CarouselResponse> {
    const apiRequest = {
      ...request,
      platform: mapEnum(request.platform, socialPlatformMap),
      carouselType: mapEnum(request.carouselType, carouselTypeMap),
    };
    const response = await api.post<CarouselResponse>(
      `${SOCIAL_API_BASE}/carousel/generate`,
      apiRequest
    );
    return response.data;
  },

  // ===== Parallel Carousel Generation =====

  /**
   * Plan carousel content and get style seed (LLM-only, fast ~3-5s)
   * POST /api/social/carousel/plan
   */
  async planCarousel(request: CarouselPlanRequest): Promise<CarouselPlanResponse> {
    const apiRequest = {
      ...request,
      platform: mapEnum(request.platform, socialPlatformMap),
      carouselType: mapEnum(request.carouselType, carouselTypeMap),
    };
    const response = await api.post<CarouselPlanResponse>(
      `${SOCIAL_API_BASE}/carousel/plan`,
      apiRequest
    );
    return response.data;
  },

  /**
   * Generate a single carousel slide image (~15-20s)
   * POST /api/social/carousel/slide/generate
   */
  async generateSlide(request: CarouselSlideGenerateRequest): Promise<CarouselSlideGenerateResponse> {
    const apiRequest = {
      ...request,
      platform: mapEnum(request.platform, socialPlatformMap),
    };
    const response = await api.post<CarouselSlideGenerateResponse>(
      `${SOCIAL_API_BASE}/carousel/slide/generate`,
      apiRequest
    );
    return response.data;
  },

  /**
   * Generate carousel with parallel slide generation
   * 1. Call /plan to get style seed + content for each slide (~3-5s)
   * 2. Call /slide/generate for all slides IN PARALLEL (~15-20s)
   * Total time: ~20-25s instead of 75-200s sequential
   *
   * @param onSlideComplete - Optional callback fired when each slide completes
   */
  async generateCarouselParallel(
    request: CarouselRequest,
    onSlideComplete?: (slideNumber: number, slide: CarouselSlide) => void
  ): Promise<ParallelCarouselResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let totalCost = 0;

    // Step 1: Plan the carousel
    let plan: CarouselPlanResponse | undefined;
    try {
      plan = await this.planCarousel({
        topic: request.topic,
        brandKit: request.brandKit,
        platform: request.platform,
        slideCount: request.slideCount,
        carouselType: request.carouselType,
        visualStyle: request.visualStyle,
      });
      totalCost += plan.cost;

      if (!plan.success || !plan.slides || !plan.styleSeed) {
        throw new Error(plan.errors?.join(', ') || 'Planning failed');
      }
    } catch (err) {
      errors.push(`Planning: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return {
        plan: undefined,
        slides: [],
        caption: undefined,
        totalTimeMs: Date.now() - startTime,
        totalCost,
        errors,
      };
    }

    // Step 2: Generate all slides in parallel
    const slidePromises = plan.slides.map(async (slideContent) => {
      try {
        const result = await this.generateSlide({
          topic: request.topic,
          slideContent,
          styleSeed: plan!.styleSeed!,
          totalSlides: request.slideCount,
          platform: request.platform,
          dimensions: plan!.dimensions,
        });

        if (result.success && result.slide) {
          totalCost += result.cost;
          if (onSlideComplete) {
            onSlideComplete(slideContent.slideNumber, result.slide);
          }
          return result.slide;
        } else {
          errors.push(`Slide ${slideContent.slideNumber}: ${result.errors?.join(', ') || 'Generation failed'}`);
          return null;
        }
      } catch (err) {
        errors.push(`Slide ${slideContent.slideNumber}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        return null;
      }
    });

    const slideResults = await Promise.all(slidePromises);
    const slides = slideResults.filter((s): s is CarouselSlide => s !== null);

    // Sort slides by slideNumber
    slides.sort((a, b) => a.slideNumber - b.slideNumber);

    // Step 3: Optionally generate caption (can be done after slides for better context)
    let caption: Caption | undefined;
    if (request.includeCaption && slides.length > 0) {
      try {
        const captionResult = await this.generateCaption({
          context: `Carousel about: ${request.topic}. Slides: ${slides.map(s => s.headline).filter(Boolean).join(', ')}`,
          platform: request.platform === 'linkedin' ? 'linkedin' : 'instagram',
          tone: 'casual',
          length: 'medium',
          includeEmojis: true,
          includeCTA: true,
          hashtagCount: 10,
          hashtagStrategy: 'mixed',
        });
        caption = captionResult.caption;
        totalCost += 0.01; // Approximate caption cost
      } catch {
        // Caption is optional, don't fail the whole operation
      }
    }

    return {
      plan,
      slides,
      caption,
      totalTimeMs: Date.now() - startTime,
      totalCost,
      errors,
    };
  },

  // ===== Caption Generation =====

  /**
   * Generate engaging captions with hashtags
   * POST /api/social/caption/generate
   */
  async generateCaption(request: CaptionRequest): Promise<CaptionResponse> {
    const apiRequest = {
      ...request,
      platform: mapEnum(request.platform, socialPlatformMap),
      tone: mapEnum(request.tone, contentToneMap),
      length: mapEnum(request.length, captionLengthMap),
      hashtagStrategy: request.hashtagStrategy ? mapEnum(request.hashtagStrategy, hashtagStrategyMap) : undefined,
    };
    const response = await api.post<CaptionResponse>(
      `${SOCIAL_API_BASE}/caption/generate`,
      apiRequest
    );
    return response.data;
  },

  // ===== Story/Reel Creation =====

  /**
   * Create vertical video content for Stories/Reels
   * POST /api/social/story/create
   */
  async createStory(request: StoryCreateRequest): Promise<StoryCreateResponse> {
    const apiRequest = {
      ...request,
      platform: mapEnum(request.platform, socialPlatformMap),
      storyType: mapEnum(request.storyType, storyTypeMap),
    };
    const response = await api.post<StoryCreateResponse>(
      `${SOCIAL_API_BASE}/story/create`,
      apiRequest
    );
    return response.data;
  },

  // ===== Template Customization =====

  /**
   * Customize social media templates with brand assets
   * POST /api/social/template/customize
   */
  async customizeTemplate(request: TemplateCustomizeRequest): Promise<TemplateCustomizeResponse> {
    const apiRequest = {
      ...request,
      platform: mapEnum(request.platform, socialPlatformMap),
    };
    const response = await api.post<TemplateCustomizeResponse>(
      `${SOCIAL_API_BASE}/template/customize`,
      apiRequest
    );
    return response.data;
  },

  // ===== Content Scheduling =====

  /**
   * Plan content with AI-optimized posting times
   * POST /api/social/content/schedule
   */
  async scheduleContent(request: ContentScheduleRequest): Promise<ContentScheduleResponse> {
    const response = await api.post<ContentScheduleResponse>(
      `${SOCIAL_API_BASE}/content/schedule`,
      request
    );
    return response.data;
  },

  // ===== Job Status Polling =====

  /**
   * Poll for async story creation job status
   * GET /api/jobs/{jobId}
   */
  async getJobStatus(jobId: string): Promise<{ status: JobStatus; result?: unknown; error?: string }> {
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
  },

  // ===== Helper Functions =====

  /**
   * Poll story creation until complete
   */
  async pollStoryUntilComplete(
    jobId: string,
    onProgress?: (status: JobStatus) => void,
    maxAttempts = 120,
    intervalMs = 2000
  ): Promise<StoryCreateResponse> {
    for (let i = 0; i < maxAttempts; i++) {
      const job = await this.getJobStatus(jobId);

      if (onProgress) {
        onProgress(job.status as JobStatus);
      }

      if (job.status === 'completed') {
        return job.result as StoryCreateResponse;
      }

      if (job.status === 'failed') {
        throw new Error(job.error || 'Story creation failed');
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Story creation timed out');
  },

  /**
   * Quick Instagram post
   */
  quickInstagramPost(topic: string, productImage?: string): Promise<SocialPostResponse> {
    return this.generatePost({
      topic,
      productImage,
      platform: 'instagram',
      contentType: 'promotional',
      tone: 'casual',
      includeCaption: true,
      includeHashtags: true,
      hashtagCount: 15,
    });
  },

  /**
   * Quick educational carousel
   */
  quickEducationalCarousel(topic: string, slideCount = 5): Promise<CarouselResponse> {
    return this.generateCarousel({
      topic,
      platform: 'instagram',
      slideCount,
      carouselType: 'educational',
      visualStyle: 'modern',
      includeCaption: true,
    });
  },

  /**
   * Quick caption with hashtags
   */
  quickCaption(context: string, platform: SocialPlatform = 'instagram'): Promise<CaptionResponse> {
    return this.generateCaption({
      context,
      platform,
      tone: 'casual',
      length: 'medium',
      includeEmojis: true,
      includeCTA: true,
      hashtagCount: 15,
      hashtagStrategy: 'mixed',
    });
  },

  /**
   * Get platform-specific dimensions
   */
  getPlatformDimensions(platform: SocialPlatform): { width: number; height: number; aspectRatio: string } {
    const specs: Record<SocialPlatform, { width: number; height: number; aspectRatio: string }> = {
      instagram: { width: 1080, height: 1080, aspectRatio: '1:1' },
      instagramStory: { width: 1080, height: 1920, aspectRatio: '9:16' },
      tiktok: { width: 1080, height: 1920, aspectRatio: '9:16' },
      facebook: { width: 1200, height: 630, aspectRatio: '1.91:1' },
      twitter: { width: 1200, height: 675, aspectRatio: '16:9' },
      linkedin: { width: 1200, height: 627, aspectRatio: '1.91:1' },
      pinterest: { width: 1000, height: 1500, aspectRatio: '2:3' },
      threads: { width: 1080, height: 1080, aspectRatio: '1:1' },
      youtube: { width: 1080, height: 1920, aspectRatio: '9:16' },
    };
    return specs[platform];
  },

  /**
   * Get recommended hashtag count per platform
   */
  getRecommendedHashtagCount(platform: SocialPlatform): number {
    const counts: Record<SocialPlatform, number> = {
      instagram: 20,
      instagramStory: 5,
      tiktok: 5,
      facebook: 3,
      twitter: 3,
      linkedin: 5,
      pinterest: 10,
      threads: 5,
      youtube: 10,
    };
    return counts[platform];
  },
};

export default socialMediaService;
