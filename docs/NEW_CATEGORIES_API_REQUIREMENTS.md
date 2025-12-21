# New Categories API Requirements
# Interior Design, Moodboard & Social Media

**Version**: 1.1
**Date**: December 20, 2025
**Status**: ✅ FULLY IMPLEMENTED - All 18 Endpoints Ready
**Related**: `docs/CREATIVE_CANVAS_STUDIO_ENHANCED_STRATEGY.md`

---

## Executive Summary

This document specifies the backend API endpoints required to power three new categories in Creative Canvas Studio:

1. **Interior Design** - Room redesign, virtual staging, floor plans, furniture suggestions
2. **Moodboard & Brand Identity** - Visual inspiration, color palettes, brand kits, typography
3. **Social Media Content** - Platform-optimized posts, carousels, captions, scheduling

### Key Integration Points

| Category | Primary AI Models | Endpoint Prefix |
|----------|-------------------|-----------------|
| Interior Design | FLUX.2 Pro, Gemini 2.5 Flash, Meshy 6 | `/api/interior/` |
| Moodboard | FLUX.2 Pro, Gemini 2.5 Flash | `/api/moodboard/` |
| Social Media | FLUX.2 Pro, Gemini 2.5 Flash, Kling 2.6 | `/api/social/` |

### Implementation Priority

| Priority | Endpoints | Nodes Enabled |
|----------|-----------|---------------|
| P0 (Critical) | Room Redesign, Virtual Staging, Moodboard Generator, Social Post Generator | 4 core nodes |
| P1 (High) | Floor Plan, Color Palette, Caption Generator, Carousel | 4 additional nodes |
| P2 (Medium) | Furniture Suggestion, Brand Kit, Story Creator, Template Customizer | 4 additional nodes |
| P3 (Low) | Material Palette, 3D Visualizer, Typography, Content Scheduler | 6 remaining nodes |

---

# Part 1: Interior Design APIs

## 1.1 Room Redesign

**POST** `/api/interior/room-redesign`

Transform room photos with AI-powered style changes while preserving room structure.

**Request:**
```typescript
interface RoomRedesignRequest {
  roomImage: string;                    // URL or base64 of room photo
  styleReference?: string;              // Optional style reference image URL
  roomType: RoomType;
  designStyle: InteriorDesignStyle;
  preserveStructure: boolean;           // Keep windows, doors, layout
  intensity: number;                    // 0.1-1.0, how much to change
  customPrompt?: string;                // Additional instructions
}

type RoomType =
  | 'livingRoom' | 'bedroom' | 'kitchen' | 'bathroom'
  | 'diningRoom' | 'homeOffice' | 'nursery' | 'outdoor'
  | 'basement' | 'attic' | 'studio' | 'openPlan';

type InteriorDesignStyle =
  | 'modern' | 'scandinavian' | 'industrial' | 'midCentury'
  | 'bohemian' | 'traditional' | 'coastal' | 'farmhouse'
  | 'japandi' | 'artDeco' | 'mediterranean' | 'transitional'
  | 'minimalist' | 'maximalist' | 'rustic' | 'contemporary';
```

**Response:**
```typescript
interface RoomRedesignResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  redesignedRoom: string;               // Generated image URL
  beforeAfterComparison?: string;       // Side-by-side image URL
  designNotes?: string;                 // AI-generated design commentary
  suggestedProducts?: ProductSuggestion[];
  cost?: number;
}

interface ProductSuggestion {
  name: string;
  category: string;
  description: string;
  estimatedPrice?: string;
  searchTerms: string[];
}
```

**AI Model**: FLUX.2 Pro with inpainting/img2img capabilities

---

## 1.2 Virtual Staging

**POST** `/api/interior/virtual-staging`

Add furniture and decor to empty rooms for real estate staging.

**Request:**
```typescript
interface VirtualStagingRequest {
  emptyRoomImage: string;               // URL of empty room photo
  roomType: RoomType;
  stagingStyle: StagingStyle;
  furnishingLevel: FurnishingLevel;
  targetAudience?: 'luxury' | 'family' | 'young-professional' | 'retiree';
  budgetTier?: 'budget' | 'mid' | 'premium' | 'luxury';
}

type StagingStyle =
  | 'modern' | 'contemporary' | 'traditional' | 'scandinavian' | 'luxury'
  | 'transitional' | 'coastal' | 'urban' | 'family-friendly';

type FurnishingLevel =
  | 'minimal'    // Essential pieces only (sofa, bed, table)
  | 'standard'   // Core furniture + basic decor
  | 'full'       // Complete room with accessories
  | 'luxury';    // Premium items, art, plants, detailed styling
```

**Response:**
```typescript
interface VirtualStagingResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stagedRoomImage: string;              // Generated staged room URL
  furnitureList?: StagedFurnitureItem[];
  estimatedStagingCost?: string;        // "Estimated real staging: $2,500-4,000"
}

interface StagedFurnitureItem {
  name: string;
  category: 'seating' | 'tables' | 'storage' | 'lighting' | 'decor' | 'rugs' | 'art';
  position: string;                     // "left wall", "center", etc.
  style: string;
}
```

**AI Model**: FLUX.2 Pro with room inpainting

---

## 1.3 Floor Plan Generator

**POST** `/api/interior/floor-plan`

Generate 2D floor plans from dimensions or room photos.

**Request:**
```typescript
interface FloorPlanRequest {
  // Option 1: From dimensions
  dimensions?: {
    length: number;                     // feet or meters
    width: number;
    unit: 'feet' | 'meters';
  };
  // Option 2: From photo
  roomPhoto?: string;                   // URL - AI will estimate dimensions

  roomType: RoomType;
  includeLayout: boolean;               // Add furniture layout suggestions
  layoutCount?: number;                 // 1-4 layout variations
  requirements?: string[];              // "work from home desk", "king bed", etc.
}
```

**Response:**
```typescript
interface FloorPlanResponse {
  floorPlan: string;                    // Generated floor plan image URL
  dimensions: {
    length: number;
    width: number;
    area: number;
    unit: string;
  };
  layoutSuggestions?: FloorPlanLayout[];
}

interface FloorPlanLayout {
  id: string;
  name: string;                         // "Open Concept", "Cozy Conversation", etc.
  description: string;
  layoutImage: string;
  furniturePlacements: FurniturePlacement[];
}

interface FurniturePlacement {
  item: string;
  position: { x: number; y: number };   // Percentage-based position
  rotation: number;                     // degrees
  dimensions: { width: number; depth: number };
}
```

**AI Model**: Gemini 2.5 Flash for analysis + FLUX.2 Pro for visualization

---

## 1.4 Furniture Suggestion

**POST** `/api/interior/furniture/suggest`

Get AI-powered furniture recommendations based on room and style.

**Request:**
```typescript
interface FurnitureSuggestionRequest {
  roomImage?: string;                   // Optional room photo for context
  styleReference?: string;              // Optional style reference image
  furnitureType: FurnitureType;
  designStyle: InteriorDesignStyle;
  budgetLevel: 'budget' | 'mid' | 'premium' | 'luxury';
  roomDimensions?: { length: number; width: number };
  colorPreferences?: string[];
  excludeBrands?: string[];
}

type FurnitureType =
  | 'sofa' | 'sectional' | 'armchair' | 'ottoman'
  | 'diningTable' | 'diningChairs' | 'coffeeTable' | 'sideTable' | 'console'
  | 'bed' | 'nightstand' | 'dresser' | 'wardrobe'
  | 'desk' | 'officeChair' | 'bookshelf' | 'cabinet'
  | 'lighting' | 'rug' | 'mirror' | 'storage'
  | 'all';                              // Return multiple categories
```

**Response:**
```typescript
interface FurnitureSuggestionResponse {
  suggestions: FurnitureSuggestion[];
  moodboard?: string;                   // Generated furniture moodboard image
  styleNotes: string;
}

interface FurnitureSuggestion {
  id: string;
  name: string;
  category: FurnitureType;
  style: string;
  description: string;
  generatedImage: string;               // AI-generated visualization
  dimensions?: { width: number; height: number; depth: number };
  priceRange: string;                   // "$500-800"
  materials: string[];
  colors: string[];
  searchTerms: string[];                // For shopping integration
  similarProducts?: ExternalProduct[];  // Optional real product matches
}

interface ExternalProduct {
  name: string;
  retailer: string;
  price: number;
  url: string;
  imageUrl: string;
}
```

**AI Model**: Gemini 2.5 Flash for recommendations + FLUX.2 Pro for visualization

---

## 1.5 Material Palette

**POST** `/api/interior/materials/palette`

Generate cohesive material palettes for interior finishes.

**Request:**
```typescript
interface MaterialPaletteRequest {
  roomImage?: string;                   // Reference room
  styleReference?: string;              // Style inspiration
  designStyle: InteriorDesignStyle;
  includeFlooring: boolean;
  includeWalls: boolean;
  includeCountertops: boolean;
  includeCabinetry?: boolean;
  includeFixtures?: boolean;            // Faucets, hardware
  colorFamily?: string;                 // "warm", "cool", "neutral", "bold"
}
```

**Response:**
```typescript
interface MaterialPaletteResponse {
  palette: MaterialPalette;
  visualization: string;                // Rendered visualization image
  alternativePalettes?: MaterialPalette[];
}

interface MaterialPalette {
  id: string;
  name: string;
  style: string;
  materials: MaterialItem[];
  colorHarmony: string;                 // "warm earthy", "cool modern", etc.
}

interface MaterialItem {
  category: 'flooring' | 'wall' | 'countertop' | 'cabinetry' | 'tile' | 'fixture';
  name: string;
  type: string;                         // "hardwood", "porcelain tile", "quartz"
  color: string;
  hexCode: string;
  finish: string;                       // "matte", "satin", "polished"
  texture: string;
  sampleImage: string;
  priceRange?: string;
}
```

**AI Model**: Gemini 2.5 Flash + FLUX.2 Pro

---

## 1.6 3D Room Visualizer

**POST** `/api/interior/3d/visualize`

Convert floor plans to 3D room visualizations.

**Request:**
```typescript
interface Room3DRequest {
  floorPlan: string;                    // Floor plan image URL
  materials?: MaterialItem[];           // From material palette
  ceilingHeight: number;                // feet
  includeFurniture: boolean;
  furnitureStyle?: InteriorDesignStyle;
  lighting: 'natural' | 'evening' | 'studio' | 'dramatic';
  cameraAngles?: ('eye-level' | 'birds-eye' | 'corner' | 'detail')[];
  outputFormat: '3d-model' | 'renders' | 'both';
}
```

**Response:**
```typescript
interface Room3DResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  model3d?: {
    glbUrl: string;                     // GLTF/GLB 3D model
    usdzUrl?: string;                   // For iOS AR
  };
  renders?: {
    angle: string;
    imageUrl: string;
  }[];
  walkthroughVideo?: string;            // Optional generated walkthrough
}
```

**AI Model**: Meshy 6 for 3D, FLUX.2 Pro for renders

---

# Part 2: Moodboard & Brand Identity APIs

## 2.1 Moodboard Generator

**POST** `/api/moodboard/generate`

Generate cohesive visual moodboards from themes or references.

**Request:**
```typescript
interface MoodboardRequest {
  theme: string;                        // "Coastal summer wedding"
  referenceImages?: string[];           // Inspiration images
  moodboardStyle: MoodboardStyle;
  mood: MoodTone;
  imageCount: number;                   // 3-12 images
  includeTypography: boolean;
  includeColorPalette: boolean;
  aspectRatio?: '4:3' | '16:9' | '1:1' | 'pinterest';
  outputFormat?: 'collage' | 'grid' | 'scattered';
}

type MoodboardStyle =
  | 'collage' | 'pinterest' | 'minimal' | 'magazine' | 'scattered'
  | 'editorial' | 'professional' | 'artistic';

type MoodTone =
  | 'light' | 'dark' | 'warm' | 'cool' | 'vibrant'
  | 'muted' | 'balanced' | 'dramatic' | 'serene' | 'energetic';
```

**Response:**
```typescript
interface MoodboardResponse {
  moodboard: string;                    // Generated moodboard image URL
  individualImages: string[];           // Separate image URLs
  colorPalette?: ColorPalette;
  typographySuggestions?: TypographySuggestion[];
  keywords: string[];                   // Extracted style keywords
  aiNotes: string;                      // Design direction notes
}
```

**AI Model**: FLUX.2 Pro for image generation, Gemini 2.5 Flash for curation

---

## 2.2 Color Palette Extractor

**POST** `/api/moodboard/colors/extract`

Extract and generate color palettes from images.

**Request:**
```typescript
interface ColorPaletteExtractRequest {
  sourceImage: string;                  // URL of source image
  colorCount: number;                   // 3-10 colors
  paletteType: PaletteType;
  includeNeutrals: boolean;
  generateVariations: boolean;          // Complementary, analogous, etc.
}

type PaletteType =
  | 'dominant'        // Most prominent colors
  | 'harmonious'      // Balanced selection
  | 'complementary'   // Opposing colors
  | 'analogous'       // Adjacent on color wheel
  | 'triadic'         // Three equidistant
  | 'split-complementary'
  | 'tetradic';
```

**Response:**
```typescript
interface ColorPaletteResponse {
  palette: ColorPalette;
  variations?: ColorPalette[];          // Different harmony types
  visualization: string;                // Palette swatch image
}

interface ColorPalette {
  id: string;
  name: string;
  colors: ColorSwatch[];
  harmony: string;
  mood: string;
}

interface ColorSwatch {
  name: string;                         // "Ocean Blue", "Sunset Coral"
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk?: { c: number; m: number; y: number; k: number };
  pantone?: string;                     // Closest Pantone match
  usage: 'primary' | 'secondary' | 'accent' | 'neutral' | 'background';
  percentage: number;                   // Dominance in source image
}
```

**AI Model**: Gemini 2.5 Flash for extraction

---

## 2.3 Brand Kit Generator

**POST** `/api/moodboard/brand-kit/generate`

Generate complete brand identity kits.

**Request:**
```typescript
interface BrandKitRequest {
  brandDescription: string;             // "Modern sustainable fashion brand"
  industry: IndustryType;
  brandPersonality: BrandPersonality;
  inspirationImages?: string[];
  includeTypography: boolean;
  includePatterns: boolean;
  includeIconography: boolean;
  colorPreferences?: string[];          // "earth tones", "bold primary"
}

type IndustryType =
  | 'tech' | 'fashion' | 'food' | 'health' | 'finance'
  | 'creative' | 'ecommerce' | 'nonprofit' | 'education'
  | 'entertainment' | 'travel' | 'beauty' | 'sports';

type BrandPersonality =
  | 'professional' | 'playful' | 'luxury' | 'modern'
  | 'organic' | 'bold' | 'minimal' | 'vintage' | 'futuristic';
```

**Response:**
```typescript
interface BrandKitResponse {
  brandKit: BrandKit;
  moodboard: string;                    // Brand moodboard image
  presentationUrl?: string;             // Optional PDF/presentation
}

interface BrandKit {
  id: string;
  name: string;
  colorPalette: ColorPalette;
  typography: TypographySystem;
  patterns?: PatternAsset[];
  icons?: string[];                     // Icon set URLs
  usageGuidelines: string;
  voiceAndTone: string;
}

interface TypographySystem {
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

interface FontPairing {
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'script' | 'monospace';
  weights: number[];
  googleFontsUrl?: string;
  sampleImage: string;
}

interface TypographySpec {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
}

interface PatternAsset {
  name: string;
  style: string;
  imageUrl: string;
  seamless: boolean;
  usage: string;                        // "backgrounds", "accents", etc.
}
```

**AI Model**: Gemini 2.5 Flash for strategy + FLUX.2 Pro for visuals

---

## 2.4 Typography Suggester

**POST** `/api/moodboard/typography/suggest`

Get font pairing suggestions for brand/project.

**Request:**
```typescript
interface TypographySuggestRequest {
  brandStyle?: string;                  // Reference image
  colorPalette?: ColorPalette;
  style: TypographyStyle;
  useCase: TypographyUseCase;
  mood?: string;                        // "elegant", "playful", "corporate"
}

type TypographyStyle =
  | 'modern' | 'classic' | 'playful' | 'elegant'
  | 'geometric' | 'minimal' | 'bold' | 'handwritten';

type TypographyUseCase =
  | 'web' | 'print' | 'social' | 'branding' | 'editorial' | 'packaging';
```

**Response:**
```typescript
interface TypographySuggestResponse {
  suggestions: TypographyPairing[];
  sampleImages: string[];               // Rendered typography samples
}

interface TypographyPairing {
  id: string;
  name: string;
  description: string;
  headingFont: FontPairing;
  bodyFont: FontPairing;
  accentFont?: FontPairing;
  compatibility: number;                // 0-100 pairing score
  sampleImage: string;
}
```

**AI Model**: Gemini 2.5 Flash

---

## 2.5 Aesthetic Analyzer

**POST** `/api/moodboard/aesthetic/analyze`

Analyze visual aesthetic qualities of images.

**Request:**
```typescript
interface AestheticAnalyzeRequest {
  images: string[];                     // 1-10 image URLs
  analysisDepth: 'quick' | 'standard' | 'deep';
  compareToTrends: boolean;
  extractStyles: boolean;
}
```

**Response:**
```typescript
interface AestheticAnalyzeResponse {
  analysis: AestheticAnalysis;
  styleTags: string[];
  colorPalette: ColorPalette;
  trendComparison?: TrendComparison;
}

interface AestheticAnalysis {
  overallStyle: string;                 // "Minimalist Scandinavian with warm accents"
  dominantMood: string;
  colorAnalysis: {
    temperature: 'warm' | 'cool' | 'neutral';
    saturation: 'muted' | 'balanced' | 'vibrant';
    contrast: 'low' | 'medium' | 'high';
  };
  compositionStyle: string;
  lightingStyle: string;
  textureQualities: string[];
  influences: string[];                 // Design movement influences
  targetAudience: string;
  strengthsAndWeaknesses: {
    strengths: string[];
    improvements: string[];
  };
}

interface TrendComparison {
  alignedTrends: string[];
  emergingTrends: string[];
  timelessElements: string[];
}
```

**AI Model**: Gemini 2.5 Flash

---

## 2.6 Texture Generator

**POST** `/api/moodboard/texture/generate`

Generate seamless textures and patterns.

**Request:**
```typescript
interface TextureGenerateRequest {
  description: string;                  // "Linen fabric texture, natural beige"
  reference?: string;                   // Reference image
  textureType: TextureType;
  scale: 'small' | 'medium' | 'large';
  seamless: boolean;
  resolution: '512' | '1024' | '2048' | '4096';
  colorOverride?: string;               // Hex color to tint texture
}

type TextureType =
  | 'fabric' | 'wood' | 'stone' | 'metal' | 'paper'
  | 'leather' | 'concrete' | 'ceramic' | 'glass'
  | 'organic' | 'abstract' | 'geometric' | 'noise';
```

**Response:**
```typescript
interface TextureGenerateResponse {
  texture: string;                      // Generated texture URL
  variations: string[];                 // Color/style variations
  seamlessTile?: string;               // Perfectly tileable version
  normalMap?: string;                   // For 3D use
  metadata: {
    dimensions: { width: number; height: number };
    seamless: boolean;
    textureType: string;
  };
}
```

**AI Model**: FLUX.2 Pro

---

# Part 3: Social Media Content APIs

## 3.1 Social Post Generator

**POST** `/api/social/post/generate`

Generate platform-optimized social media posts.

**Request:**
```typescript
interface SocialPostRequest {
  topic: string;                        // "New summer collection launch"
  brandKit?: string;                    // Brand kit ID for consistency
  productImage?: string;                // Product/subject image
  platform: SocialPlatform;
  contentType: SocialContentType;
  tone: ContentTone;
  includeCaption: boolean;
  includeHashtags: boolean;
  hashtagCount?: number;
}

type SocialPlatform =
  | 'instagram' | 'instagramStory' | 'tiktok'
  | 'facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'threads';

type SocialContentType =
  | 'promotional' | 'educational' | 'bts' | 'ugc'
  | 'announcement' | 'inspirational' | 'testimonial' | 'lifestyle';

type ContentTone =
  | 'professional' | 'casual' | 'playful' | 'luxury'
  | 'edgy' | 'warm' | 'authoritative' | 'friendly';
```

**Response:**
```typescript
interface SocialPostResponse {
  postImage: string;                    // Generated post image URL
  caption?: Caption;
  hashtags?: string[];
  alternativeVersions?: {
    imageUrl: string;
    style: string;
  }[];
  platformSpecs: PlatformSpecs;
}

interface Caption {
  text: string;
  characterCount: number;
  emojiCount: number;
  callToAction?: string;
}

interface PlatformSpecs {
  platform: SocialPlatform;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  maxCaptionLength: number;
  recommendedHashtags: number;
}
```

**AI Model**: FLUX.2 Pro for image, Gemini 2.5 Flash for caption

---

## 3.2 Carousel Generator

**POST** `/api/social/carousel/generate`

Create multi-slide carousel posts.

**Request:**
```typescript
interface CarouselRequest {
  topic: string;
  brandKit?: string;
  sourceImages?: string[];              // Optional source images to incorporate
  platform: 'instagram' | 'linkedin' | 'facebook';
  slideCount: number;                   // 2-10
  carouselType: CarouselType;
  visualStyle: VisualStyle;
  includeCaption: boolean;
}

type CarouselType =
  | 'educational' | 'product' | 'beforeAfter' | 'steps'
  | 'listicle' | 'story' | 'comparison' | 'quotes';

type VisualStyle =
  | 'modern' | 'bold' | 'professional' | 'playful'
  | 'minimal' | 'colorful' | 'elegant' | 'casual';
```

**Response:**
```typescript
interface CarouselResponse {
  slides: CarouselSlide[];
  caption?: Caption;
  coverSlide: string;                   // First slide optimized for feed
  metadata: {
    totalSlides: number;
    platform: string;
    dimensions: { width: number; height: number };
  };
}

interface CarouselSlide {
  slideNumber: number;
  imageUrl: string;
  headline?: string;
  bodyText?: string;
  isCallToAction: boolean;
}
```

**AI Model**: FLUX.2 Pro for visuals, Gemini 2.5 Flash for copy

---

## 3.3 Caption Generator

**POST** `/api/social/caption/generate`

Generate engaging captions with hashtags and CTAs.

**Request:**
```typescript
interface CaptionRequest {
  postImage?: string;                   // Image for context
  context: string;                      // What the post is about
  brandKit?: string;
  platform: SocialPlatform;
  tone: ContentTone;
  length: 'short' | 'medium' | 'long';
  includeEmojis: boolean;
  includeCTA: boolean;
  hashtagCount: number;
  hashtagStrategy?: 'niche' | 'popular' | 'mixed' | 'branded';
}
```

**Response:**
```typescript
interface CaptionResponse {
  caption: Caption;
  hashtags: HashtagSet;
  alternatives: Caption[];              // 2-3 alternative captions
  engagementTips: string[];
}

interface HashtagSet {
  hashtags: string[];
  categories: {
    niche: string[];
    popular: string[];
    branded: string[];
  };
  totalReach: string;                   // "Est. reach: 1.2M"
}
```

**AI Model**: Gemini 2.5 Flash

---

## 3.4 Content Scheduler / Calendar

**POST** `/api/social/content/schedule`

Plan content with AI-optimized posting times.

**Request:**
```typescript
interface ContentScheduleRequest {
  posts: ContentQueueItem[];
  platforms: SocialPlatform[];
  frequency: PostingFrequency;
  planDuration: 'week' | 'twoWeeks' | 'month';
  optimizeTimings: boolean;
  timezone: string;
  audienceData?: AudienceInsights;
}

interface ContentQueueItem {
  id: string;
  type: 'image' | 'carousel' | 'video' | 'story';
  content: string;                      // Description or post ID
  platforms: SocialPlatform[];
  priority?: 'high' | 'medium' | 'low';
}

type PostingFrequency =
  | 'multiple'    // 2-3x per day
  | 'daily'       // 1x per day
  | 'frequent'    // 3-4x per week
  | 'weekly';     // 1-2x per week

interface AudienceInsights {
  peakEngagementTimes: string[];
  topPerformingDays: string[];
  audienceTimezone: string;
}
```

**Response:**
```typescript
interface ContentScheduleResponse {
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

interface ScheduledPost {
  id: string;
  contentId: string;
  platform: SocialPlatform;
  scheduledTime: string;                // ISO datetime
  optimizationReason: string;           // "Peak engagement for your audience"
  estimatedEngagement: 'low' | 'medium' | 'high';
}

interface CalendarView {
  weeks: CalendarWeek[];
  summary: {
    postsPerDay: Record<string, number>;
    gaps: string[];                     // Days with no content
    overlaps: string[];                 // Days with multiple posts
  };
}

interface ContentSuggestion {
  type: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}
```

**AI Model**: Gemini 2.5 Flash

---

## 3.5 Story/Reel Creator

**POST** `/api/social/story/create`

Create vertical video content for Stories/Reels/TikTok.

**Request:**
```typescript
interface StoryCreateRequest {
  concept: string;                      // Story concept/script
  sourceImages?: string[];              // Images to animate
  brandKit?: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  duration: '15s' | '30s' | '60s';
  storyType: StoryType;
  includeMusic: boolean;
  includeTextOverlays: boolean;
  musicMood?: 'upbeat' | 'chill' | 'dramatic' | 'inspiring' | 'trending';
}

type StoryType =
  | 'showcase' | 'bts' | 'tutorial' | 'announcement'
  | 'testimonial' | 'dayInLife' | 'transformation' | 'trend';
```

**Response:**
```typescript
interface StoryCreateResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video?: {
    url: string;
    duration: number;
    dimensions: { width: number; height: number };
    fileSize: number;
  };
  frames?: string[];                    // Individual frame images
  audioTrack?: {
    name: string;
    artist?: string;
    url: string;
  };
}
```

**AI Model**: Kling 2.6 Pro for video, FLUX.2 Pro for frames

---

## 3.6 Template Customizer

**POST** `/api/social/template/customize`

Customize social media templates with brand assets.

**Request:**
```typescript
interface TemplateCustomizeRequest {
  templateId: string;                   // Template from library
  brandKit?: string;
  content?: string;                     // Text content
  featureImage?: string;
  platform: SocialPlatform;
  generateVariations: boolean;          // Color variations
}
```

**Response:**
```typescript
interface TemplateCustomizeResponse {
  customizedPost: string;               // Main result image
  colorVariations?: string[];           // Alternative color schemes
  editableTemplate?: {                  // For further editing
    format: 'figma' | 'canva' | 'psd';
    url: string;
  };
}
```

**AI Model**: FLUX.2 Pro

---

# Part 4: Common Types & Enums

## Shared Response Types

```typescript
// Standard job response for async operations
interface AsyncJobResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;                    // 0-100
  estimatedCompletion?: string;         // ISO datetime
  result?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

// Standard pagination
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Cost tracking
interface CostEstimate {
  credits: number;
  usdEquivalent: number;
  breakdown?: {
    model: string;
    units: number;
    costPerUnit: number;
  }[];
}
```

## Webhook Events

For async operations, the API should support webhooks:

```typescript
// POST to user-configured webhook URL
interface WebhookPayload {
  event: 'job.completed' | 'job.failed' | 'job.progress';
  jobId: string;
  timestamp: string;
  data: {
    status: string;
    result?: unknown;
    error?: string;
  };
}
```

---

# Part 5: AI Model Mapping

| Node Type | Primary Model | Fallback Model | Estimated Cost |
|-----------|--------------|----------------|----------------|
| Room Redesign | FLUX.2 Pro | FLUX.2 Dev | $0.05-0.10 |
| Virtual Staging | FLUX.2 Pro | FLUX.2 Dev | $0.05-0.10 |
| Floor Plan Generator | Gemini 2.5 Flash | GPT-4V | $0.01-0.02 |
| Furniture Suggestion | Gemini 2.5 Flash + FLUX.2 Pro | - | $0.03-0.08 |
| Material Palette | Gemini 2.5 Flash + FLUX.2 Pro | - | $0.03-0.08 |
| 3D Room Visualizer | Meshy 6 | Tripo V2.5 | $0.15-0.30 |
| Moodboard Generator | FLUX.2 Pro | FLUX.2 Dev | $0.10-0.20 |
| Color Palette Extractor | Gemini 2.5 Flash | Claude 3.5 | $0.01-0.02 |
| Brand Kit Generator | Gemini 2.5 Flash + FLUX.2 Pro | - | $0.15-0.25 |
| Typography Suggester | Gemini 2.5 Flash | GPT-4 | $0.01-0.02 |
| Aesthetic Analyzer | Gemini 2.5 Flash | GPT-4V | $0.01-0.03 |
| Texture Generator | FLUX.2 Pro | FLUX.2 Dev | $0.05-0.10 |
| Social Post Generator | FLUX.2 Pro + Gemini 2.5 Flash | - | $0.05-0.10 |
| Carousel Generator | FLUX.2 Pro + Gemini 2.5 Flash | - | $0.15-0.30 |
| Caption Generator | Gemini 2.5 Flash | GPT-4 | $0.01-0.02 |
| Content Scheduler | Gemini 2.5 Flash | GPT-4 | $0.02-0.05 |
| Story Creator | Kling 2.6 Pro | VEO 3.1 | $0.30-0.80 |
| Template Customizer | FLUX.2 Pro | FLUX.2 Dev | $0.05-0.10 |

---

# Part 6: Implementation Notes

## Authentication

All endpoints require:
- `Authorization: Bearer {token}` header
- `X-User-Id: {userId}` header

## Rate Limits

| Tier | Requests/min | Concurrent Jobs |
|------|-------------|-----------------|
| Free | 10 | 2 |
| Pro | 60 | 10 |
| Enterprise | 300 | 50 |

## Async Job Pattern

For operations > 30 seconds:

1. Initial POST returns `{ jobId, status: 'pending' }`
2. Poll `GET /api/jobs/{jobId}` for status
3. Or configure webhook for completion notification
4. Results cached for 24 hours

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_IMAGE` | Image URL invalid or inaccessible |
| `UNSUPPORTED_FORMAT` | File format not supported |
| `QUOTA_EXCEEDED` | Usage limits reached |
| `MODEL_UNAVAILABLE` | AI model temporarily unavailable |
| `CONTENT_POLICY` | Content violates usage policy |
| `PROCESSING_ERROR` | General processing failure |

---

# Part 7: Endpoint Implementation Status

## Status Key
- `REQUESTED` - Documented, pending implementation
- `IN_PROGRESS` - Being implemented
- `READY` - Implemented and tested

## Implementation Summary

All 18 endpoints have been implemented by the API team with the following fixes applied:
- `Position` → `FloorPosition` (Interior models) - disambiguated from generic Position type
- `VisualStyle` → `SocialVisualStyle` (Social models) - disambiguated from generic VisualStyle type
- `JobStatus` conflict → Consolidated to `Common.JobStatus` shared across all services

| Endpoint | Method | Status | Priority | Implemented |
|----------|--------|--------|----------|-------------|
| `/api/interior/room-redesign` | POST | ✅ READY | P0 | Dec 2025 |
| `/api/interior/virtual-staging` | POST | ✅ READY | P0 | Dec 2025 |
| `/api/interior/floor-plan` | POST | ✅ READY | P1 | Dec 2025 |
| `/api/interior/furniture/suggest` | POST | ✅ READY | P2 | Dec 2025 |
| `/api/interior/materials/palette` | POST | ✅ READY | P3 | Dec 2025 |
| `/api/interior/3d/visualize` | POST | ✅ READY | P3 | Dec 2025 |
| `/api/moodboard/generate` | POST | ✅ READY | P0 | Dec 2025 |
| `/api/moodboard/colors/extract` | POST | ✅ READY | P1 | Dec 2025 |
| `/api/moodboard/brand-kit/generate` | POST | ✅ READY | P2 | Dec 2025 |
| `/api/moodboard/typography/suggest` | POST | ✅ READY | P3 | Dec 2025 |
| `/api/moodboard/aesthetic/analyze` | POST | ✅ READY | P3 | Dec 2025 |
| `/api/moodboard/texture/generate` | POST | ✅ READY | P3 | Dec 2025 |
| `/api/social/post/generate` | POST | ✅ READY | P0 | Dec 2025 |
| `/api/social/carousel/generate` | POST | ✅ READY | P1 | Dec 2025 |
| `/api/social/caption/generate` | POST | ✅ READY | P1 | Dec 2025 |
| `/api/social/content/schedule` | POST | ✅ READY | P3 | Dec 2025 |
| `/api/social/story/create` | POST | ✅ READY | P2 | Dec 2025 |
| `/api/social/template/customize` | POST | ✅ READY | P2 | Dec 2025 |

## Frontend Service Integration

Frontend services have been created with full type alignment:
- `src/services/interiorDesignService.ts` - 6 endpoints
- `src/services/moodboardService.ts` - 6 endpoints
- `src/services/socialMediaService.ts` - 6 endpoints

---

**Document Maintainer**: Frontend Team
**API Team Contact**: Request implementation via GitHub issues
**Last Updated**: December 20, 2025
