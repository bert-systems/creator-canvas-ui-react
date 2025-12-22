# Fashion System - API Requirements

**Version**: 1.1
**Date**: December 19, 2025
**Status**: Specification for Backend Implementation
**Related**: `docs/FASHION_NODE_STRATEGY.md`, `src/services/fashionService.ts`

---

## ✅ Recently Implemented Endpoints

> **Updated:** December 19, 2025
> **Status:** RESOLVED - Endpoints implemented by API team

The following endpoints were requested on Dec 19, 2025 and have been implemented:

| Endpoint | Method | Frontend Service | Node Type | Status |
|----------|--------|------------------|-----------|--------|
| `/api/fashion/clothes-swap` | POST | `virtualTryOnService.clothesSwap` | `clothesSwap` | ✅ Implemented |
| `/api/fashion/runway-animation` | POST | `fashionService.runwayAnimation` | `runwayAnimation` | ✅ Implemented |

### Request Format (Clothes Swap)

```typescript
POST /api/fashion/clothes-swap

interface ClothesSwapRequest {
  modelImage: string;        // URL of the model wearing original clothes
  garmentImage: string;      // URL of the new garment to swap in
  garmentDescription?: string;
  category?: 'tops' | 'bottoms' | 'dresses' | 'outerwear';
  modelId?: string;          // For consistency tracking
}

interface ClothesSwapResponse {
  images: string[];          // Generated swap result images
  jobId?: string;            // For async polling if needed
  cost?: number;
}
```

### Request Format (Runway Animation)

```typescript
POST /api/fashion/runway-animation

interface RunwayAnimationRequest {
  onModelImage: string;      // URL of styled model image
  model?: ModelData;
  garment?: GarmentData;
  walkStyle?: 'haute-couture' | 'rtw' | 'commercial' | 'editorial' | 'streetwear';
  duration?: '5s' | '10s';
  cameraStyle?: 'static' | 'follow' | 'crane' | 'multi-angle';
}

interface RunwayAnimationResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
}
```

**Note to API Team:** These endpoints should be implemented with the same provider infrastructure as Virtual Try-On endpoints. The frontend service layer (`virtualTryOnService.ts`) is already calling these endpoints correctly - only the backend implementation is missing.

---

## Executive Summary

This document specifies the backend API endpoints required to power the **Creative Canvas Studio Fashion System**. The system enables AI-powered fashion design, virtual try-on, lookbook generation, and collection management through 23+ specialized nodes.

### Key Integration Points

1. **Image Generation APIs** - Garment sketches, textile patterns, flat lays
2. **Virtual Try-On APIs** - Multiple provider support (FASHN, IDM-VTON, CAT-VTON, Leffa, Kling-Kolors)
3. **Video Generation APIs** - Runway animation, fabric motion, turnaround videos
4. **LLM Agent APIs** - Design suggestions, tech packs, styling recommendations
5. **Export APIs** - Lookbooks, line sheets, tech packs

### Existing Endpoints (Already Implemented)

The following endpoints already exist in Swagger v3:

| Endpoint | Status |
|----------|--------|
| `/api/ImageGeneration/virtual-tryon/fashn` | ✅ Implemented |
| `/api/ImageGeneration/virtual-tryon/idm-vton` | ✅ Implemented |
| `/api/ImageGeneration/virtual-tryon/cat-vton` | ✅ Implemented |
| `/api/ImageGeneration/virtual-tryon/leffa` | ✅ Implemented |
| `/api/ImageGeneration/virtual-tryon/kling-kolors` | ✅ Implemented |
| `/api/multi-agent/fashion/start` | ✅ Implemented |
| `/api/multi-agent/fashion-prompt/start` | ✅ Implemented |

---

## 1. Garment Design APIs

### 1.1 Design Garment

**POST** `/api/fashion/design/garment`

Generate fashion design sketches from concept descriptions.

**Request:**
```typescript
interface DesignGarmentRequest {
  concept: string;                    // "A flowing maxi dress with African print"
  garmentType: GarmentType;
  silhouette?: SilhouetteType;
  season?: Season;
  audience?: string;                  // "young professionals", "luxury market"
  references?: string[];              // Reference image URLs
  fabricData?: Partial<FabricData>;
  culturalInspiration?: CulturalTextileOrigin;
  generateVariations?: number;        // 1-4 color/style variations
  visualStyle?: 'sketch' | 'rendered' | 'technical' | 'editorial';
}

type GarmentType =
  | 'dress' | 'gown' | 'jumpsuit' | 'romper'
  | 'top' | 'blouse' | 'shirt' | 'tshirt' | 'tank' | 'crop-top' | 'bodysuit'
  | 'pants' | 'jeans' | 'shorts' | 'skirt' | 'leggings'
  | 'jacket' | 'coat' | 'blazer' | 'cardigan' | 'vest' | 'cape'
  | 'suit' | 'co-ord' | 'set'
  | 'swimsuit' | 'bikini' | 'cover-up'
  | 'activewear-top' | 'activewear-bottom' | 'sports-bra';

type SilhouetteType =
  | 'fitted' | 'a-line' | 'empire' | 'mermaid' | 'ballgown'
  | 'shift' | 'wrap' | 'asymmetrical' | 'column' | 'trapeze'
  | 'straight' | 'wide-leg' | 'flared' | 'tapered' | 'skinny'
  | 'oversized' | 'boxy' | 'cropped' | 'longline';

type Season =
  | 'spring' | 'summer' | 'fall' | 'winter'
  | 'resort' | 'pre-fall' | 'spring-summer' | 'fall-winter';

type CulturalTextileOrigin =
  | 'kente' | 'ankara' | 'mudcloth' | 'kitenge' | 'shweshwe'
  | 'adire' | 'aso-oke' | 'kanga' | 'korhogo' | 'ndebele' | 'custom';
```

**Response:**
```typescript
interface DesignGarmentResponse {
  garmentData: GarmentData;
  sketches: {
    frontView: string;              // Image URL
    backView: string;
    detailViews: string[];
  };
  colorVariations: string[];        // Variation image URLs
  designNotes: string;
  suggestedFabrics: FabricSuggestion[];
  estimatedCost?: CostEstimate;
}

interface GarmentData {
  id: string;
  type: GarmentType;
  category: string;
  subCategory?: string;
  name: string;
  description: string;
  construction: {
    silhouette: SilhouetteType;
    fit: string;
    length: string;
    neckline?: string;
    sleeves?: string;
    closure?: string;
    details: string[];
  };
  materials: {
    primary: FabricData;
    secondary?: FabricData;
    lining?: FabricData;
  };
}

interface FabricData {
  type: string;
  composition: string;
  weight: 'sheer' | 'light' | 'medium' | 'heavy' | 'structured';
  texture: string;
  pattern?: PatternData;
  color: string;
  colorName?: string;
  pantone?: string;
  drape: 'stiff' | 'structured' | 'soft' | 'fluid' | 'flowing';
  stretch?: boolean;
  sheen: 'matte' | 'satin' | 'shiny' | 'metallic' | 'iridescent';
}
```

---

### 1.2 Analyze Garment

**POST** `/api/fashion/design/analyze`

Analyze an existing garment image to extract construction details.

**Request:**
```typescript
interface AnalyzeGarmentRequest {
  garmentImage: string;              // URL or base64
  garmentType?: GarmentType;
  targetFit?: string;
  extractColors?: boolean;
  extractPattern?: boolean;
  extractConstruction?: boolean;
}
```

**Response:**
```typescript
interface AnalyzeGarmentResponse {
  garmentData: GarmentData;
  fitAdjustments: string[];
  detectedFeatures: string[];
  colorPalette?: ColorPalette;
  patternAnalysis?: PatternAnalysis;
  similarGarments?: string[];       // Suggested similar styles
}

interface ColorPalette {
  primary: string;
  secondary?: string;
  accent?: string[];
  neutrals?: string[];
  pantones?: string[];
}
```

---

### 1.3 Generate Pattern

**POST** `/api/fashion/design/pattern`

Generate sewing pattern from garment sketch.

**Request:**
```typescript
interface GeneratePatternRequest {
  garmentSketch: string;            // Image URL
  garmentData?: GarmentData;
  size: string;                     // "S", "M", "L", "8", "10", etc.
  seamAllowance?: string;           // "0.5 inch", "1.5 cm"
  includeGrading?: boolean;
  customMeasurements?: Record<string, string>;
  format: 'pdf' | 'svg' | 'dxf';
}
```

**Response:**
```typescript
interface GeneratePatternResponse {
  patternPieces: PatternPiece[];
  layoutGuide: string;              // Image URL
  sewingInstructions: string;       // Markdown
  materialRequirements: string;
  sizeGrading?: PatternPiece[];     // Additional sizes
  downloadUrl: string;
}

interface PatternPiece {
  name: string;
  quantity: number;
  grainLine: string;
  imageUrl: string;
}
```

---

### 1.4 Create Tech Pack

**POST** `/api/fashion/design/tech-pack`

Generate manufacturing-ready technical specification.

**Request:**
```typescript
interface CreateTechPackRequest {
  garmentSketch: string;
  garmentData?: GarmentData;
  fabricData?: FabricData;
  format?: 'standard' | 'detailed' | 'factory';
  includeCosting?: boolean;
  sizeRange?: string;               // "XS-XL", "0-14"
  brandInfo?: {
    name: string;
    logo?: string;
    season: string;
    styleNumber?: string;
  };
}
```

**Response:**
```typescript
interface CreateTechPackResponse {
  techPackUrl: string;              // PDF download
  flatSketch: string;               // Technical flat image
  callouts: string;                 // Callout diagram
  colorwaySheet: string;            // Color options image
  billOfMaterials: BOMItem[];
  gradingSpecs?: string;
  costingData?: CostingBreakdown;
}

interface BOMItem {
  component: string;
  material: string;
  quantity: string;
  supplier?: string;
  unitCost?: number;
}

interface CostingBreakdown {
  materials: number;
  labor: number;
  overhead: number;
  totalCost: number;
  suggestedRetail: number;
  margin: number;
}
```

---

## 2. Textile & Material APIs

### 2.1 Design Textile Pattern

**POST** `/api/fashion/textile/design`

Create seamless textile patterns.

**Request:**
```typescript
interface DesignTextileRequest {
  patternType: PatternType;
  scale: ScaleType;
  repeat: RepeatType;
  colors?: ColorPalette;
  inspiration?: string[];           // Reference image URLs
  description?: string;             // Natural language description
  heritageReference?: CulturalTextileOrigin;
  outputSize?: { width: number; height: number };
}

type PatternType =
  | 'geometric' | 'floral' | 'abstract' | 'animal' | 'stripes'
  | 'paisley' | 'tropical' | 'ethnic' | 'damask' | 'dots' | 'solid';

type ScaleType = 'micro' | 'small' | 'medium' | 'large' | 'oversized';

type RepeatType =
  | 'full-drop' | 'half-drop' | 'brick' | 'mirror' | 'random'
  | 'all-over' | 'placement' | 'border' | 'engineered';
```

**Response:**
```typescript
interface DesignTextileResponse {
  seamlessPattern: string;          // Tileable pattern image
  patternVariations: string[];      // Color/scale variations
  onFabricPreview: string;          // Mockup on fabric
  onGarmentPreview?: string;        // Mockup on garment
  textileData: PatternData;
  repeatInfo: {
    width: number;
    height: number;
    seamless: boolean;
  };
}

interface PatternData {
  type: PatternType;
  name?: string;
  scale: ScaleType;
  repeat?: RepeatType;
  culturalOrigin?: string;
  imageUrl?: string;
}
```

---

### 2.2 Generate Colorways

**POST** `/api/fashion/textile/colorways`

Generate color variations of a textile pattern.

**Request:**
```typescript
interface GenerateColorwaysRequest {
  basePattern: string;              // Pattern image URL
  colorScheme: ColorSchemeType;
  customColors?: string[];          // Hex codes
  variationCount: number;           // 1-8
  seasonalInfluence?: Season;
  maintainContrast?: boolean;
}

type ColorSchemeType =
  | 'analogous' | 'complementary' | 'triadic'
  | 'split-complementary' | 'tetradic' | 'monochromatic' | 'custom';
```

**Response:**
```typescript
interface GenerateColorwaysResponse {
  colorways: Colorway[];
  recommendedForSeason?: string[];
  bestSellers?: string[];           // IDs of likely popular colorways
}

interface Colorway {
  id: string;
  name: string;                     // "Ocean Breeze", "Sunset Coral"
  preview: string;                  // Image URL
  colors: ColorPalette;
  hexCodes: string[];
  pantones?: string[];
}
```

---

### 2.3 Cultural Textile Fusion

**POST** `/api/fashion/textile/cultural-fusion`

Blend heritage textiles with modern fashion.

**Request:**
```typescript
interface CulturalFusionRequest {
  baseGarment?: string;             // Garment image to apply textile
  heritageTextile: CulturalTextileOrigin;
  fusionStyle: FusionStyle;
  placement: PatternPlacement;
  modernElements?: string[];        // ["minimalist", "color-blocking"]
  customTextileDescription?: string;
  respectfulAdaptation?: boolean;   // Ensure cultural sensitivity
}

type FusionStyle = 'traditional' | 'contemporary' | 'abstract' | 'color';
type PatternPlacement = 'all-over' | 'panel' | 'border' | 'yoke' | 'trim';
```

**Response:**
```typescript
interface CulturalFusionResponse {
  fusedDesign: string;              // Result image
  textileApplied: string;           // Textile pattern used
  culturalContext: string;          // Educational context
  respectfulUsageGuidelines: string;
  patternDetails: PatternData;
  attributionText: string;          // Suggested attribution
}
```

---

## 3. Model & Casting APIs

### 3.1 Cast Model

**POST** `/api/fashion/model/cast`

Generate AI fashion models with diverse representation.

**Request:**
```typescript
interface CastModelRequest {
  gender: Gender;
  bodyType: BodyType;
  skinTone: SkinTone;
  age: AgeRange;
  hairStyle?: string;
  hairColor?: string;
  pose?: PoseCategory;
  expression?: string;
  referenceImage?: string;          // For consistency
  generateVariations?: number;      // 1-4
  outputResolution?: '512' | '1024' | '2048';
}

type Gender = 'female' | 'male' | 'non-binary';
type AgeRange = 'young-adult' | 'adult' | 'mature';

interface BodyType {
  shape: 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted-triangle' | 'athletic';
  height: 'petite' | 'average' | 'tall' | 'very-tall';
  size: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'plus';
  bust?: string;
  waist?: string;
  hips?: string;
}

interface SkinTone {
  category: 'fair' | 'light' | 'medium' | 'olive' | 'tan' | 'brown' | 'deep';
  undertone: 'warm' | 'cool' | 'neutral';
  hex?: string;
}

type PoseCategory = 'editorial' | 'commercial' | 'runway' | 'lifestyle' | 'athletic' | 'seated';
```

**Response:**
```typescript
interface CastModelResponse {
  modelData: ModelData;
  modelImage: string;
  poseVariations: string[];
  expressionVariations: string[];
  modelId: string;                  // For reuse in try-on
}

interface ModelData {
  id?: string;
  type: 'ai-generated' | 'reference' | 'ghost-mannequin';
  bodyType: BodyType;
  skinTone: SkinTone;
  hairStyle?: string;
  hairColor?: string;
  pose?: PoseData;
  expression?: string;
  age: AgeRange;
  gender: Gender;
}
```

---

### 3.2 Generate Poses

**POST** `/api/fashion/model/poses`

Generate model pose variations.

**Request:**
```typescript
interface GeneratePosesRequest {
  model?: ModelData;
  modelImage?: string;
  poseCategory: PoseCategory;
  garmentType?: GarmentType;        // Inform pose selection
  cameraAngle: CameraAngle;
  variationCount: number;           // 1-9
  includeHandPoses?: boolean;
  atmosphere?: string;              // "confident", "relaxed", "dynamic"
}

type CameraAngle =
  | 'front' | 'three-quarter' | 'side' | 'back'
  | 'overhead' | 'low-angle' | 'high-angle';
```

**Response:**
```typescript
interface GeneratePosesResponse {
  posedModel: string;               // Primary image
  poseVariations: string[];         // All variations
  poseData: PoseData[];
}

interface PoseData {
  category: PoseCategory;
  angle: CameraAngle;
  description?: string;
  referenceUrl?: string;
}
```

---

### 3.3 Scale Size

**POST** `/api/fashion/model/scale-size`

Visualize garment across different body sizes.

**Request:**
```typescript
interface ScaleSizeRequest {
  garmentImage: string;
  originalSize: BodySize;
  targetSize: BodySize;
  garmentType: GarmentType;
  maintainProportions?: boolean;
  showFitNotes?: boolean;
}

type BodySize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'plus';
```

**Response:**
```typescript
interface ScaleSizeResponse {
  scaledImage: string;
  fitNotes: string[];
  adjustmentDetails: string;
  sizeComparison?: string;          // Side-by-side image
}
```

---

## 4. Styling APIs

### 4.1 Compose Outfit

**POST** `/api/fashion/style/compose-outfit`

Create styled complete looks.

**Request:**
```typescript
interface ComposeOutfitRequest {
  mainGarment: string;              // Primary garment image
  secondaryGarments?: string[];     // Additional pieces
  model?: ModelData;
  occasion: string;                 // "business casual", "evening gala"
  styleVibe?: string;               // "minimalist", "bohemian", "streetwear"
  includeAccessories?: boolean;
  seasonality?: Season;
  budget?: 'budget' | 'mid-range' | 'luxury';
}
```

**Response:**
```typescript
interface ComposeOutfitResponse {
  styledLook: LookData;
  outfitImage: string;
  flatLay: string;
  styleNotes: string;
  alternativeStyles: string[];      // Variation images
  shoppingList?: ShoppingItem[];
}

interface LookData {
  id: string;
  lookNumber: number;
  garments: string[];
  styling?: StylingData;
  images: string[];
}

interface StylingData {
  accessories: AccessoryData[];
  shoes?: FootwearData;
  hair?: string;
  makeup?: string;
}
```

---

### 4.2 Suggest Accessories

**POST** `/api/fashion/style/accessories`

Generate accessory recommendations and visualizations.

**Request:**
```typescript
interface SuggestAccessoriesRequest {
  outfitImage: string;
  outfit?: LookData;
  accessoryLevel: AccessoryLevel;
  includeJewelry?: boolean;
  includeBag?: boolean;
  includeShoes?: boolean;
  includeHeadwear?: boolean;
  metalTone?: MetalTone;
  style?: string;                   // "classic", "trendy", "statement"
}

type AccessoryLevel = 'minimal' | 'balanced' | 'statement' | 'maximalist';
type MetalTone = 'gold' | 'silver' | 'rose-gold' | 'mixed';
```

**Response:**
```typescript
interface SuggestAccessoriesResponse {
  styledOutfit: string;             // Outfit with accessories
  accessoryList: AccessoryData[];
  detailShots: string[];            // Close-up images
  alternatives: string[];           // Alternative accessory combinations
}

interface AccessoryData {
  type: string;                     // "necklace", "earrings", "bag"
  name: string;
  imageUrl?: string;
  description: string;
  style: string;
}
```

---

### 4.3 Style Layering

**POST** `/api/fashion/style/layering`

Create smart outfit layering combinations.

**Request:**
```typescript
interface StyleLayeringRequest {
  garments: string[];               // Garment images to layer
  season: Season;
  occasion: string;
  layerCount?: number;              // 2-5
  includeStylingTips?: boolean;
  weatherCondition?: string;        // "cold", "mild", "transitional"
}
```

**Response:**
```typescript
interface StyleLayeringResponse {
  layeredOutfit: string;            // Final layered look
  layeringOrder: LayeringData;
  stylingTips: string[];
  alternativeCombinations: string[];
}

interface LayeringData {
  items: LayeringItem[];
  order: string[];                  // Garment IDs in order
}

interface LayeringItem {
  garmentId: string;
  layer: number;                    // 1 = innermost
  visible: boolean;
}
```

---

## 5. Photography & E-Commerce APIs

### 5.1 Virtual Try-On

> **Note:** These endpoints already exist in Swagger. See section on existing endpoints.

**POST** `/api/ImageGeneration/virtual-tryon/{provider}`

Where `{provider}` is one of: `fashn`, `idm-vton`, `cat-vton`, `leffa`, `kling-kolors`

---

### 5.2 Create Flat Lay

**POST** `/api/fashion/photo/flat-lay`

Generate styled flat lay product photography.

**Request:**
```typescript
interface CreateFlatLayRequest {
  garments: string[];               // Garment images
  accessories?: string[];
  layout: FlatLayLayout;
  background: string;               // "marble", "wood", "white", hex code
  includeProps?: boolean;           // Flowers, coffee cup, etc.
  variants?: number;                // 1-4 layout variations
  outputSize?: { width: number; height: number };
}

type FlatLayLayout = 'styled' | 'folded' | 'casual' | 'minimalist' | 'grid';
```

**Response:**
```typescript
interface CreateFlatLayResponse {
  flatLay: string;                  // Primary image
  alternativeLayouts: string[];
  layoutData: {
    items: PlacementItem[];
    background: string;
  };
}

interface PlacementItem {
  itemId: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
}
```

---

### 5.3 Create E-Commerce Shots

**POST** `/api/fashion/photo/ecommerce`

Generate multi-angle product photography for e-commerce.

**Request:**
```typescript
interface CreateEcommerceShotsRequest {
  garmentImage: string;
  model?: ModelData;
  modelImage?: string;
  shotStyle: EcommerceShotStyle;
  background: string;               // "white", "studio", "lifestyle"
  angles: number;                   // 1-8
  includeDetails?: boolean;
  includeZoom?: boolean;
  platform?: 'amazon' | 'shopify' | 'etsy' | 'general';
}

type EcommerceShotStyle = 'on-model' | 'ghost' | 'flat' | 'hanger' | 'mixed';
```

**Response:**
```typescript
interface CreateEcommerceShotsResponse {
  heroShot: string;
  allAngles: string[];
  detailShots: string[];
  zoomViews: string[];
  ghostMannequin?: string;
  imageSpecs: {
    width: number;
    height: number;
    format: string;
    optimizedFor: string;
  };
}
```

---

### 5.4 Create Ghost Mannequin

**POST** `/api/fashion/photo/ghost-mannequin`

Generate invisible mannequin product shots.

**Request:**
```typescript
interface CreateGhostMannequinRequest {
  garmentImage: string;
  garmentType: GarmentType;
  views: GhostView[];
  background?: string;              // Default: white
  shadowStyle?: 'soft' | 'hard' | 'none';
  showInterior?: boolean;           // Show inside of garment
}

type GhostView = 'front' | 'back' | 'side' | 'interior';
```

**Response:**
```typescript
interface CreateGhostMannequinResponse {
  ghostMannequinImages: string[];   // One per view
  compositedView: string;           // Combined view
  editableLayer?: string;           // PNG with transparency
}
```

---

## 6. Video & Animation APIs

### 6.1 Create Runway Animation

**POST** `/api/fashion/video/runway`

Generate runway walk videos from lookbook images.

**Request:**
```typescript
interface CreateRunwayAnimationRequest {
  onModelImage: string;
  model?: ModelData;
  garment?: GarmentData;
  walkStyle: WalkStyle;
  duration: '5s' | '10s';
  cameraStyle: CameraStyle;
  includeTurnaround?: boolean;
  addMusic?: boolean;
  musicMood?: string;               // "upbeat", "dramatic", "elegant"
  runway?: RunwayStyle;
}

type WalkStyle = 'haute-couture' | 'rtw' | 'commercial' | 'editorial' | 'streetwear';
type CameraStyle = 'static' | 'follow' | 'crane' | 'multi-angle';
type RunwayStyle = 'minimal-white' | 'industrial' | 'garden' | 'urban' | 'studio';
```

**Response:**
```typescript
interface CreateRunwayAnimationResponse {
  jobId: string;                    // For async polling
  status: JobStatus;
  runwayVideo?: string;
  turnaroundVideo?: string;
  slowMotion?: string;
  stillFrames: string[];
  audioTrack?: string;
  duration: number;
}

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

---

### 6.2 Create Fabric Motion

**POST** `/api/fashion/video/fabric-motion`

Animate fabric movement and drape.

**Request:**
```typescript
interface CreateFabricMotionRequest {
  garmentImage: string;
  fabricData?: FabricData;
  motionType: MotionType;
  intensity: number;                // 0-100
  duration: '3s' | '5s' | '10s';
  loopable?: boolean;
  windDirection?: 'left' | 'right' | 'front' | 'back';
}

type MotionType =
  | 'gentle-breeze' | 'wind' | 'twirl'
  | 'walking' | 'underwater' | 'falling';
```

**Response:**
```typescript
interface CreateFabricMotionResponse {
  jobId: string;
  status: JobStatus;
  fabricMotionVideo?: string;
  loopableClip?: string;
  stillFrames: string[];
  duration: number;
}
```

---

### 6.3 Create Turnaround Video

**POST** `/api/fashion/video/turnaround`

Generate 360-degree product rotation videos.

**Request:**
```typescript
interface CreateTurnaroundVideoRequest {
  onModelImage: string;
  model?: ModelData;
  rotationSpeed: 'slow' | 'medium' | 'fast';
  duration: '5s' | '10s' | '15s';
  includePauses?: boolean;          // Pause at key angles
  pauseAngles?: number[];           // Degrees to pause at
  background?: string;
  lighting?: 'studio' | 'natural' | 'dramatic';
}
```

**Response:**
```typescript
interface CreateTurnaroundVideoResponse {
  jobId: string;
  status: JobStatus;
  turnaroundVideo?: string;
  angleStills: string[];            // Key angle frames
  exportFormats: ExportFormat[];
}

interface ExportFormat {
  format: 'mp4' | 'webm' | 'gif';
  url: string;
  size: number;
}
```

---

## 7. Collection APIs

### 7.1 Build Collection

**POST** `/api/fashion/collection/build`

Assemble garments into a cohesive collection.

**Request:**
```typescript
interface BuildCollectionRequest {
  garments: GarmentData[];
  colorStory?: ColorPalette;
  moodBoard?: string;               // Mood board image URL
  season: Season;
  year: number;
  theme: string;                    // "Urban Safari", "Neo-Victorian"
  collectionSize: CollectionSize;
  generateLooks?: boolean;
  includeLineSheet?: boolean;
}

type CollectionSize = 'mini' | 'capsule' | 'standard' | 'full';
// mini: 3-5 pieces, capsule: 8-12, standard: 15-25, full: 30+
```

**Response:**
```typescript
interface BuildCollectionResponse {
  collection: CollectionData;
  looks: LookData[];
  lookbookPage: string;             // Overview image
  collectionOverview: string;       // PDF/image
  lineSheet?: string;               // PDF URL
  merchandisingPlan?: MerchandisingPlan;
}

interface CollectionData {
  id: string;
  name: string;
  season: Season;
  year: number;
  theme: string;
  colorStory: ColorPalette;
  moodBoard: string[];
  looks: LookData[];
  pieceCount: number;
}

interface MerchandisingPlan {
  categories: CategoryBreakdown[];
  pricePoints: PriceRange;
  deliveryWindows: DeliveryWindow[];
}
```

---

### 7.2 Generate Lookbook

**POST** `/api/fashion/collection/lookbook`

Create professional lookbook from collection.

**Request:**
```typescript
interface GenerateLookbookRequest {
  collection: CollectionData;
  looks?: LookData[];
  onModelImages: string[];
  brandGuidelines?: BrandGuidelines;
  style: LookbookStyle;
  format: LookbookFormat;
  includeDetails?: boolean;
  generateVideo?: boolean;
  pageCount?: number;
}

type LookbookStyle = 'editorial' | 'commercial' | 'minimal' | 'artistic' | 'street';
type LookbookFormat = 'digital' | 'print' | 'social' | 'video';

interface BrandGuidelines {
  logo?: string;
  primaryFont?: string;
  secondaryFont?: string;
  primaryColor?: string;
  secondaryColor?: string;
}
```

**Response:**
```typescript
interface GenerateLookbookResponse {
  lookbookPages: string[];          // Individual page images
  coverPage: string;
  digitalLookbook?: string;         // PDF download
  socialAssets?: SocialAsset[];     // Instagram/TikTok ready
  videoLookbook?: string;           // Video URL
}

interface SocialAsset {
  platform: 'instagram' | 'tiktok' | 'pinterest';
  format: 'post' | 'story' | 'reel';
  url: string;
  dimensions: { width: number; height: number };
}
```

---

### 7.3 Generate Line Sheet

**POST** `/api/fashion/collection/line-sheet`

Create wholesale line sheet for buyers.

**Request:**
```typescript
interface GenerateLineSheetRequest {
  collection: CollectionData;
  looks: LookData[];
  includeWholesalePricing?: boolean;
  includeFabricSwatches?: boolean;
  format: 'pdf' | 'web' | 'excel';
  brandInfo?: {
    name: string;
    logo?: string;
    contact: string;
    minimumOrder?: string;
    paymentTerms?: string;
  };
  currency?: string;
}
```

**Response:**
```typescript
interface GenerateLineSheetResponse {
  lineSheetUrl: string;             // Download URL
  productCards: string[];           // Individual product images
  fabricSwatches?: string[];        // Swatch images
  orderForm?: string;               // Downloadable order form
  priceList?: PriceListItem[];
}

interface PriceListItem {
  styleNumber: string;
  name: string;
  wholesale: number;
  retail: number;
  sizes: string[];
  colors: string[];
  minimumOrder: number;
}
```

---

## 8. Utility APIs

### 8.1 Get Diverse Models

**POST** `/api/fashion/utility/diverse-models`

Generate a set of diverse models for inclusive representation.

**Request:**
```typescript
interface DiverseModelsRequest {
  count: number;                    // 1-10
  bodyTypes?: BodyShape[];
  skinTones?: SkinToneCategory[];
  ageRange?: AgeRange[];
  gender?: Gender[];
  purpose?: 'fashion' | 'beauty' | 'lifestyle';
}

type BodyShape = 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted-triangle' | 'athletic';
type SkinToneCategory = 'fair' | 'light' | 'medium' | 'olive' | 'tan' | 'brown' | 'deep';
```

**Response:**
```typescript
interface DiverseModelsResponse {
  models: CastModelResponse[];
  diversityMetrics: {
    skinToneDistribution: Record<string, number>;
    bodySizeDistribution: Record<string, number>;
    ageDistribution: Record<string, number>;
  };
}
```

---

### 8.2 Get Product Details

**POST** `/api/fashion/utility/product-details`

Extract product information for e-commerce listing.

**Request:**
```typescript
interface ProductDetailsRequest {
  garmentImage: string;
  extractPrice?: boolean;
  extractCategory?: boolean;
  extractKeywords?: boolean;
  platform?: 'amazon' | 'shopify' | 'etsy';
}
```

**Response:**
```typescript
interface ProductDetailsResponse {
  garmentData: GarmentData;
  suggestedPrice?: PriceSuggestion;
  marketCategory?: string;
  keywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
  bulletPoints?: string[];
}

interface PriceSuggestion {
  low: number;
  mid: number;
  high: number;
  currency: string;
  basis: string;                    // Explanation
}
```

---

## 9. Job Status & Polling

### 9.1 Get Job Status

**GET** `/api/fashion/jobs/{jobId}`

Check status of async video/animation jobs.

**Response:**
```typescript
interface JobStatusResponse {
  jobId: string;
  type: 'runway' | 'fabric-motion' | 'turnaround';
  status: JobStatus;
  progress?: number;                // 0-100
  estimatedTime?: number;           // Seconds remaining
  result?: {
    url: string;
    thumbnailUrl?: string;
    duration?: number;
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}
```

---

## 10. Webhook Events

For async job completion notifications:

```typescript
interface FashionWebhookPayload {
  eventType: FashionEventType;
  jobId: string;
  timestamp: string;
  data: any;
}

type FashionEventType =
  | 'tryon.completed'
  | 'runway.completed'
  | 'turnaround.completed'
  | 'lookbook.generated'
  | 'collection.built'
  | 'job.failed';
```

---

## 11. Rate Limits & Pricing

| Endpoint Category | Rate Limit | Estimated Cost |
|-------------------|------------|----------------|
| Design Garment | 10/min | $0.08/request |
| Generate Pattern | 5/min | $0.15/request |
| Tech Pack | 5/min | $0.20/request |
| Textile Design | 10/min | $0.10/request |
| Colorways | 20/min | $0.05/request |
| Cultural Fusion | 10/min | $0.12/request |
| Cast Model | 10/min | $0.10/request |
| Virtual Try-On | 10/min | $0.03-0.08/request |
| E-Commerce Shots | 5/min | $0.15/request |
| Ghost Mannequin | 10/min | $0.08/request |
| Runway Animation (5s) | 3/min | $0.25/request |
| Runway Animation (10s) | 2/min | $0.45/request |
| Turnaround Video | 3/min | $0.30/request |
| Lookbook Generation | 2/min | $0.50/request |
| Line Sheet | 5/min | $0.25/request |

---

## 12. Implementation Priority

### Phase 1: Core Design (High Priority)
1. `/api/fashion/design/garment`
2. `/api/fashion/design/analyze`
3. `/api/fashion/textile/design`
4. `/api/fashion/textile/colorways`

### Phase 2: Styling & Photography (High Priority)
1. `/api/fashion/style/compose-outfit`
2. `/api/fashion/photo/flat-lay`
3. `/api/fashion/photo/ecommerce`
4. `/api/fashion/photo/ghost-mannequin`

### Phase 3: Model & Casting (Medium Priority)
1. `/api/fashion/model/cast`
2. `/api/fashion/model/poses`
3. `/api/fashion/model/scale-size`
4. `/api/fashion/utility/diverse-models`

### Phase 4: Video Generation (Medium Priority)
1. `/api/fashion/video/runway`
2. `/api/fashion/video/turnaround`
3. `/api/fashion/video/fabric-motion`

### Phase 5: Collection & Export (Medium Priority)
1. `/api/fashion/collection/build`
2. `/api/fashion/collection/lookbook`
3. `/api/fashion/collection/line-sheet`

### Phase 6: Advanced Features (Lower Priority)
1. `/api/fashion/design/tech-pack`
2. `/api/fashion/design/pattern`
3. `/api/fashion/textile/cultural-fusion`
4. `/api/fashion/style/accessories`
5. `/api/fashion/style/layering`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 17, 2025 | Claude | Initial comprehensive API specification |
