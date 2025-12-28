/**
 * moodboardService.ts - Moodboard & Brand Identity API Service Layer
 * Provides API integration for moodboard and brand identity nodes
 * Aligns with API endpoints from NEW_CATEGORIES_API_REQUIREMENTS.md
 */

import api from './api';
import {
  moodboardStyleMap,
  moodToneMap,
  industryTypeMap,
  brandPersonalityMap,
  textureTypeMap,
  paletteTypeMap,
  mapEnum,
} from './apiEnumMapper';

// ==================== TYPE DEFINITIONS ====================

// ===== Enums (aligned with API schema) =====

export type MoodboardStyle =
  | 'collage' | 'pinterest' | 'minimal' | 'magazine' | 'scattered'
  | 'editorial' | 'professional' | 'artistic';

export type MoodTone =
  | 'light' | 'dark' | 'warm' | 'cool' | 'vibrant'
  | 'muted' | 'balanced' | 'dramatic' | 'serene' | 'energetic';

export type PaletteType =
  | 'dominant' | 'harmonious' | 'complementary' | 'analogous'
  | 'triadic' | 'splitComplementary' | 'tetradic';

export type ColorUsage = 'primary' | 'secondary' | 'accent' | 'neutral' | 'background';

export type IndustryType =
  | 'tech' | 'fashion' | 'food' | 'health' | 'finance'
  | 'creative' | 'ecommerce' | 'nonprofit' | 'education'
  | 'entertainment' | 'travel' | 'beauty' | 'sports';

export type BrandPersonality =
  | 'professional' | 'playful' | 'luxury' | 'modern'
  | 'organic' | 'bold' | 'minimal' | 'vintage' | 'futuristic';

export type TypographyStyle =
  | 'modern' | 'classic' | 'playful' | 'elegant'
  | 'geometric' | 'minimal' | 'bold' | 'handwritten';

export type TypographyUseCase =
  | 'web' | 'print' | 'social' | 'branding' | 'editorial' | 'packaging';

export type FontCategory = 'serif' | 'sansSerif' | 'display' | 'script' | 'monospace';

export type TextureType =
  | 'fabric' | 'wood' | 'stone' | 'metal' | 'paper'
  | 'leather' | 'concrete' | 'ceramic' | 'glass'
  | 'organic' | 'abstract' | 'geometric' | 'noise';

export type TextureScale = 'small' | 'medium' | 'large';

export type AnalysisDepth = 'quick' | 'standard' | 'deep';

export type AspectRatio = '4:3' | '16:9' | '1:1' | 'pinterest';

// Moodboard element types for parallel generation
export type MoodboardElementType =
  | 'Texture' | 'Lifestyle' | 'Product' | 'ColorSwatch'
  | 'Pattern' | 'Atmosphere' | 'Typography' | 'Material';

// ===== Interfaces =====

export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk?: { c: number; m: number; y: number; k: number };
  pantone?: string;
  usage: ColorUsage;
  percentage: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: ColorSwatch[];
  harmony: string;
  mood: string;
}

export interface FontPairing {
  name: string;
  family: string;
  category: FontCategory;
  weights: number[];
  googleFontsUrl?: string;
  sampleImage: string;
}

export interface TypographySpec {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
}

export interface TypographySystem {
  primary: FontPairing;
  secondary?: FontPairing;
  accent?: FontPairing;
  hierarchy: {
    h1: TypographySpec;
    h2: TypographySpec;
    h3: TypographySpec;
    body: TypographySpec;
    caption: TypographySpec;
  };
}

export interface TypographyPairing {
  id: string;
  name: string;
  description: string;
  headingFont: FontPairing;
  bodyFont: FontPairing;
  accentFont?: FontPairing;
  compatibility: number;
  sampleImage: string;
}

export interface PatternAsset {
  name: string;
  style: string;
  imageUrl: string;
  seamless: boolean;
  usage: string;
}

export interface BrandKit {
  id: string;
  name: string;
  colorPalette: ColorPalette;
  typography: TypographySystem;
  patterns?: PatternAsset[];
  icons?: string[];
  usageGuidelines: string;
  voiceAndTone: string;
}

export interface AestheticAnalysis {
  overallStyle: string;
  dominantMood: string;
  colorAnalysis: {
    temperature: 'warm' | 'cool' | 'neutral';
    saturation: 'muted' | 'balanced' | 'vibrant';
    contrast: 'low' | 'medium' | 'high';
  };
  compositionStyle: string;
  lightingStyle: string;
  textureQualities: string[];
  influences: string[];
  targetAudience: string;
  strengthsAndWeaknesses: {
    strengths: string[];
    improvements: string[];
  };
}

export interface TrendComparison {
  alignedTrends: string[];
  emergingTrends: string[];
  timelessElements: string[];
}

export interface TextureMetadata {
  dimensions: { width: number; height: number };
  seamless: boolean;
  textureType: string;
}

// ===== Request Interfaces =====

export interface MoodboardRequest {
  theme: string;
  referenceImages?: string[];
  moodboardStyle: MoodboardStyle;
  mood: MoodTone;
  imageCount: number;
  includeTypography: boolean;
  includeColorPalette: boolean;
  aspectRatio?: AspectRatio;
  outputFormat?: 'collage' | 'grid' | 'scattered';
  /** Override the default image generation model (e.g., 'flux-pro', 'nano-banana-pro') */
  imageModel?: string;
  /** Override the default LLM model (e.g., 'gemini-2.5-flash', 'gemini-2.0-flash') */
  llmModel?: string;
}

export interface ColorPaletteExtractRequest {
  sourceImage: string;
  colorCount: number;
  paletteType: PaletteType;
  includeNeutrals: boolean;
  generateVariations: boolean;
  /** Override the default LLM model for color analysis */
  llmModel?: string;
}

export interface BrandKitRequest {
  brandDescription: string;
  industry: IndustryType;
  brandPersonality: BrandPersonality;
  inspirationImages?: string[];
  includeTypography: boolean;
  includePatterns: boolean;
  includeIconography: boolean;
  colorPreferences?: string[];
  /** Override the default image generation model for brand visuals */
  imageModel?: string;
  /** Override the default LLM model for brand kit generation */
  llmModel?: string;
}

export interface TypographySuggestRequest {
  brandStyle?: string;
  colorPalette?: ColorPalette;
  style: TypographyStyle;
  useCase: TypographyUseCase;
  mood?: string;
  /** Override the default LLM model for typography suggestions */
  llmModel?: string;
}

export interface AestheticAnalyzeRequest {
  images: string[];
  analysisDepth: AnalysisDepth;
  compareToTrends: boolean;
  extractStyles: boolean;
  /** Override the default LLM model for aesthetic analysis */
  llmModel?: string;
}

export interface TextureGenerateRequest {
  description: string;
  reference?: string;
  textureType: TextureType;
  scale: TextureScale;
  seamless: boolean;
  resolution: '512' | '1024' | '2048' | '4096';
  colorOverride?: string;
  /** Override the default image generation model for texture creation */
  imageModel?: string;
}

// ===== Response Interfaces =====

export interface MoodboardResponse {
  moodboard: string;
  individualImages: string[];
  colorPalette?: ColorPalette;
  typographySuggestions?: TypographyPairing[];
  keywords: string[];
  aiNotes: string;
}

export interface ColorPaletteResponse {
  palette: ColorPalette;
  variations?: ColorPalette[];
  visualization: string;
}

export interface BrandKitResponse {
  brandKit: BrandKit;
  moodboard: string;
  presentationUrl?: string;
}

export interface TypographySuggestResponse {
  suggestions: TypographyPairing[];
  sampleImages: string[];
}

export interface AestheticAnalyzeResponse {
  analysis: AestheticAnalysis;
  styleTags: string[];
  colorPalette: ColorPalette;
  trendComparison?: TrendComparison;
}

export interface TextureGenerateResponse {
  texture: string;
  variations: string[];
  seamlessTile?: string;
  normalMap?: string;
  metadata: TextureMetadata;
}

// ===== New Split API Request/Response Interfaces =====

/**
 * Request for generating individual moodboard elements
 * POST /api/moodboard/element/generate
 */
export interface MoodboardElementRequest {
  theme: string;
  elementType: MoodboardElementType;
  moodboardStyle?: MoodboardStyle;
  mood?: MoodTone;
  width?: number;
  height?: number;
  /** Override the default image generation model */
  imageModel?: string;
}

/**
 * Response from generating individual moodboard elements
 */
export interface MoodboardElementResponse {
  success: boolean;
  imageUrl?: string;
  elementType?: string;
  cost?: number;
  errors?: string[];
  generationId?: string;
  assetId?: string;
  processingTimeMs?: number;
}

/**
 * Request for LLM-based moodboard analysis
 * POST /api/moodboard/analyze
 */
export interface MoodboardAnalysisRequest {
  theme: string;
  moodboardStyle?: MoodboardStyle;
  mood?: MoodTone;
  industry?: string;
  /** Override the default LLM model */
  llmModel?: string;
}

/**
 * Response from LLM-based moodboard analysis
 */
export interface MoodboardAnalysisResponse {
  success: boolean;
  colorPalette?: ColorPalette;
  typography?: TypographySystem;
  keywords?: string[];
  aiNotes?: string;
  cost?: number;
  errors?: string[];
  processingTimeMs?: number;
}

/**
 * Aggregated result from parallel moodboard generation
 */
export interface ParallelMoodboardResult {
  moodboard?: MoodboardResponse;
  analysis?: MoodboardAnalysisResponse;
  elements: MoodboardElementResponse[];
  totalTimeMs: number;
  errors: string[];
}

// ==================== API SERVICE ====================

const MOODBOARD_API_BASE = '/api/moodboard';

export const moodboardService = {
  // ===== Moodboard Generation =====

  /**
   * Generate cohesive visual moodboards
   * POST /api/moodboard/generate
   */
  async generateMoodboard(request: MoodboardRequest): Promise<MoodboardResponse> {
    const apiRequest = {
      ...request,
      moodboardStyle: mapEnum(request.moodboardStyle, moodboardStyleMap),
      mood: mapEnum(request.mood, moodToneMap),
    };
    const response = await api.post<MoodboardResponse>(
      `${MOODBOARD_API_BASE}/generate`,
      apiRequest
    );
    return response.data;
  },

  // ===== Color Palette Extraction =====

  /**
   * Extract and generate color palettes from images
   * POST /api/moodboard/colors/extract
   */
  async extractColorPalette(request: ColorPaletteExtractRequest): Promise<ColorPaletteResponse> {
    const apiRequest = {
      ...request,
      paletteType: mapEnum(request.paletteType, paletteTypeMap),
    };
    const response = await api.post<ColorPaletteResponse>(
      `${MOODBOARD_API_BASE}/colors/extract`,
      apiRequest
    );
    return response.data;
  },

  // ===== Brand Kit Generation =====

  /**
   * Generate complete brand identity kits
   * POST /api/moodboard/brand-kit/generate
   */
  async generateBrandKit(request: BrandKitRequest): Promise<BrandKitResponse> {
    const apiRequest = {
      ...request,
      industry: mapEnum(request.industry, industryTypeMap),
      brandPersonality: mapEnum(request.brandPersonality, brandPersonalityMap),
    };
    const response = await api.post<BrandKitResponse>(
      `${MOODBOARD_API_BASE}/brand-kit/generate`,
      apiRequest
    );
    return response.data;
  },

  // ===== Typography Suggestions =====

  /**
   * Get font pairing suggestions
   * POST /api/moodboard/typography/suggest
   */
  async suggestTypography(request: TypographySuggestRequest): Promise<TypographySuggestResponse> {
    const response = await api.post<TypographySuggestResponse>(
      `${MOODBOARD_API_BASE}/typography/suggest`,
      request
    );
    return response.data;
  },

  // ===== Aesthetic Analysis =====

  /**
   * Analyze visual aesthetic qualities
   * POST /api/moodboard/aesthetic/analyze
   */
  async analyzeAesthetic(request: AestheticAnalyzeRequest): Promise<AestheticAnalyzeResponse> {
    const response = await api.post<AestheticAnalyzeResponse>(
      `${MOODBOARD_API_BASE}/aesthetic/analyze`,
      request
    );
    return response.data;
  },

  // ===== Texture Generation =====

  /**
   * Generate seamless textures and patterns
   * POST /api/moodboard/texture/generate
   */
  async generateTexture(request: TextureGenerateRequest): Promise<TextureGenerateResponse> {
    const apiRequest = {
      ...request,
      textureType: mapEnum(request.textureType, textureTypeMap),
    };
    const response = await api.post<TextureGenerateResponse>(
      `${MOODBOARD_API_BASE}/texture/generate`,
      apiRequest
    );
    return response.data;
  },

  // ===== Split API Endpoints for Parallel Generation =====

  /**
   * Generate a single moodboard element
   * POST /api/moodboard/element/generate
   * Fast endpoint (~15-20s) for generating individual elements
   */
  async generateElement(request: MoodboardElementRequest): Promise<MoodboardElementResponse> {
    const apiRequest = {
      ...request,
      moodboardStyle: request.moodboardStyle ? mapEnum(request.moodboardStyle, moodboardStyleMap) : undefined,
      mood: request.mood ? mapEnum(request.mood, moodToneMap) : undefined,
    };
    const response = await api.post<MoodboardElementResponse>(
      `${MOODBOARD_API_BASE}/element/generate`,
      apiRequest
    );
    return response.data;
  },

  /**
   * Analyze theme to get colors, typography, and keywords
   * POST /api/moodboard/analyze
   * Fast LLM-only endpoint (~5-7s) for extracting design attributes
   */
  async analyze(request: MoodboardAnalysisRequest): Promise<MoodboardAnalysisResponse> {
    const apiRequest = {
      ...request,
      moodboardStyle: request.moodboardStyle ? mapEnum(request.moodboardStyle, moodboardStyleMap) : undefined,
      mood: request.mood ? mapEnum(request.mood, moodToneMap) : undefined,
    };
    const response = await api.post<MoodboardAnalysisResponse>(
      `${MOODBOARD_API_BASE}/analyze`,
      apiRequest
    );
    return response.data;
  },

  /**
   * Generate moodboard with parallel API calls
   * Orchestrates: /generate, /analyze, and multiple /element/generate calls
   * Total time: ~20-30s instead of 2+ minutes
   *
   * @param theme - The moodboard theme description
   * @param style - Layout style (collage, pinterest, etc.)
   * @param mood - Mood tone (light, dark, warm, etc.)
   * @param elementTypes - Which element types to generate in parallel
   */
  async generateParallel(
    theme: string,
    style: MoodboardStyle,
    mood: MoodTone,
    elementTypes: MoodboardElementType[] = ['Texture', 'Lifestyle', 'Product']
  ): Promise<ParallelMoodboardResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    // Build all promises to run in parallel
    const promises: Promise<unknown>[] = [];

    // 1. Main moodboard generation
    const moodboardPromise = this.generateMoodboard({
      theme,
      moodboardStyle: style,
      mood,
      imageCount: 1,
      includeTypography: false,
      includeColorPalette: false,
    }).catch(err => {
      errors.push(`Moodboard: ${err.message}`);
      return null;
    });
    promises.push(moodboardPromise);

    // 2. LLM analysis (colors, typography, keywords)
    const analysisPromise = this.analyze({
      theme,
      moodboardStyle: style,
      mood,
    }).catch(err => {
      errors.push(`Analysis: ${err.message}`);
      return null;
    });
    promises.push(analysisPromise);

    // 3. Element generation (parallel for each type)
    const elementPromises = elementTypes.map(elementType =>
      this.generateElement({
        theme,
        elementType,
        moodboardStyle: style,
        mood,
      }).catch(err => {
        errors.push(`${elementType}: ${err.message}`);
        return null;
      })
    );
    promises.push(...elementPromises);

    // Wait for all to complete
    const results = await Promise.all(promises);

    const totalTimeMs = Date.now() - startTime;

    return {
      moodboard: results[0] as MoodboardResponse | undefined,
      analysis: results[1] as MoodboardAnalysisResponse | undefined,
      elements: results.slice(2).filter(Boolean) as MoodboardElementResponse[],
      totalTimeMs,
      errors,
    };
  },

  // ===== Helper Functions =====

  /**
   * Generate color variations from a base palette
   */
  generateColorVariations(basePalette: ColorPalette, variationType: PaletteType): Promise<ColorPaletteResponse> {
    return this.extractColorPalette({
      sourceImage: '', // Will use the palette colors
      colorCount: basePalette.colors.length,
      paletteType: variationType,
      includeNeutrals: true,
      generateVariations: true,
    });
  },

  /**
   * Quick moodboard from theme
   */
  quickMoodboard(theme: string, style: MoodboardStyle = 'collage'): Promise<MoodboardResponse> {
    return this.generateMoodboard({
      theme,
      moodboardStyle: style,
      mood: 'balanced',
      imageCount: 6,
      includeTypography: false,
      includeColorPalette: true,
    });
  },

  /**
   * Quick brand kit from description
   */
  quickBrandKit(description: string, industry: IndustryType): Promise<BrandKitResponse> {
    return this.generateBrandKit({
      brandDescription: description,
      industry,
      brandPersonality: 'modern',
      includeTypography: true,
      includePatterns: true,
      includeIconography: false,
    });
  },
};

export default moodboardService;
