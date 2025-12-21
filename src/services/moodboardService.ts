/**
 * moodboardService.ts - Moodboard & Brand Identity API Service Layer
 * Provides API integration for moodboard and brand identity nodes
 * Aligns with API endpoints from NEW_CATEGORIES_API_REQUIREMENTS.md
 */

import api from './api';

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
}

export interface ColorPaletteExtractRequest {
  sourceImage: string;
  colorCount: number;
  paletteType: PaletteType;
  includeNeutrals: boolean;
  generateVariations: boolean;
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
}

export interface TypographySuggestRequest {
  brandStyle?: string;
  colorPalette?: ColorPalette;
  style: TypographyStyle;
  useCase: TypographyUseCase;
  mood?: string;
}

export interface AestheticAnalyzeRequest {
  images: string[];
  analysisDepth: AnalysisDepth;
  compareToTrends: boolean;
  extractStyles: boolean;
}

export interface TextureGenerateRequest {
  description: string;
  reference?: string;
  textureType: TextureType;
  scale: TextureScale;
  seamless: boolean;
  resolution: '512' | '1024' | '2048' | '4096';
  colorOverride?: string;
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

// ==================== API SERVICE ====================

const MOODBOARD_API_BASE = '/api/moodboard';

export const moodboardService = {
  // ===== Moodboard Generation =====

  /**
   * Generate cohesive visual moodboards
   * POST /api/moodboard/generate
   */
  async generateMoodboard(request: MoodboardRequest): Promise<MoodboardResponse> {
    const response = await api.post<MoodboardResponse>(
      `${MOODBOARD_API_BASE}/generate`,
      request
    );
    return response.data;
  },

  // ===== Color Palette Extraction =====

  /**
   * Extract and generate color palettes from images
   * POST /api/moodboard/colors/extract
   */
  async extractColorPalette(request: ColorPaletteExtractRequest): Promise<ColorPaletteResponse> {
    const response = await api.post<ColorPaletteResponse>(
      `${MOODBOARD_API_BASE}/colors/extract`,
      request
    );
    return response.data;
  },

  // ===== Brand Kit Generation =====

  /**
   * Generate complete brand identity kits
   * POST /api/moodboard/brand-kit/generate
   */
  async generateBrandKit(request: BrandKitRequest): Promise<BrandKitResponse> {
    const response = await api.post<BrandKitResponse>(
      `${MOODBOARD_API_BASE}/brand-kit/generate`,
      request
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
    const response = await api.post<TextureGenerateResponse>(
      `${MOODBOARD_API_BASE}/texture/generate`,
      request
    );
    return response.data;
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
