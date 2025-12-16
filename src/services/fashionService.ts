/**
 * fashionService.ts - Fashion API Service Layer
 * Provides comprehensive API integration for all fashion-related nodes
 * Based on FASHION_NODE_STRATEGY.md requirements
 */

import api from './api';

// ==================== TYPE DEFINITIONS ====================

// ===== Core Fashion Types =====

export type GarmentType =
  | 'dress' | 'gown' | 'jumpsuit' | 'romper'
  | 'top' | 'blouse' | 'shirt' | 'tshirt' | 'tank' | 'crop-top' | 'bodysuit'
  | 'pants' | 'jeans' | 'shorts' | 'skirt' | 'leggings'
  | 'jacket' | 'coat' | 'blazer' | 'cardigan' | 'vest' | 'cape'
  | 'suit' | 'co-ord' | 'set'
  | 'swimsuit' | 'bikini' | 'cover-up'
  | 'activewear-top' | 'activewear-bottom' | 'sports-bra';

export type SilhouetteType =
  | 'fitted' | 'a-line' | 'empire' | 'mermaid' | 'ballgown'
  | 'shift' | 'wrap' | 'asymmetrical' | 'column' | 'trapeze'
  | 'straight' | 'wide-leg' | 'flared' | 'tapered' | 'skinny'
  | 'oversized' | 'boxy' | 'cropped' | 'longline';

export type PatternType =
  | 'geometric' | 'floral' | 'abstract' | 'animal' | 'stripes'
  | 'paisley' | 'tropical' | 'ethnic' | 'damask' | 'dots' | 'solid';

export type ScaleType = 'micro' | 'small' | 'medium' | 'large' | 'oversized';

export type RepeatType = 'full-drop' | 'half-drop' | 'brick' | 'mirror' | 'random' | 'all-over' | 'placement' | 'border' | 'engineered';

export type FabricWeight = 'sheer' | 'light' | 'medium' | 'heavy' | 'structured';

export type FabricDrape = 'stiff' | 'structured' | 'soft' | 'fluid' | 'flowing';

export type FabricSheen = 'matte' | 'satin' | 'shiny' | 'metallic' | 'iridescent';

export type BodyShape = 'hourglass' | 'pear' | 'apple' | 'rectangle' | 'inverted-triangle' | 'athletic';

export type BodyHeight = 'petite' | 'average' | 'tall' | 'very-tall';

export type BodySize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'plus';

export type SkinToneCategory = 'fair' | 'light' | 'medium' | 'olive' | 'tan' | 'brown' | 'deep';

export type SkinToneUndertone = 'warm' | 'cool' | 'neutral';

export type AgeRange = 'young-adult' | 'adult' | 'mature';

export type Gender = 'female' | 'male' | 'non-binary';

export type ShotType =
  | 'full-body' | 'three-quarter' | 'half-body' | 'close-up' | 'detail'
  | 'front' | 'back' | 'side' | 'three-quarter-front' | 'three-quarter-back'
  | 'walking' | 'action' | 'lifestyle' | 'editorial'
  | 'flat-lay' | 'hanging' | 'ghost-mannequin';

export type PoseCategory = 'editorial' | 'commercial' | 'runway' | 'lifestyle' | 'athletic' | 'seated';

export type CameraAngle = 'front' | 'three-quarter' | 'side' | 'back' | 'overhead' | 'low-angle' | 'high-angle';

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'resort' | 'pre-fall' | 'spring-summer' | 'fall-winter';

export type AccessoryLevel = 'minimal' | 'balanced' | 'statement' | 'maximalist';

export type MetalTone = 'gold' | 'silver' | 'rose-gold' | 'mixed';

export type MotionType = 'gentle-breeze' | 'wind' | 'twirl' | 'walking' | 'underwater' | 'falling';

export type WalkStyle = 'haute-couture' | 'rtw' | 'commercial' | 'editorial' | 'streetwear';

export type CameraStyle = 'static' | 'follow' | 'crane' | 'multi-angle';

export type CulturalTextileOrigin =
  | 'kente' | 'ankara' | 'mudcloth' | 'kitenge' | 'shweshwe'
  | 'adire' | 'aso-oke' | 'kanga' | 'korhogo' | 'ndebele' | 'custom';

export type FusionStyle = 'traditional' | 'contemporary' | 'abstract' | 'color';

export type PatternPlacement = 'all-over' | 'panel' | 'border' | 'yoke';

// ===== Interfaces =====

export interface FabricData {
  type: string;
  composition: string;
  weight: FabricWeight;
  texture: string;
  pattern?: PatternData;
  color: string;
  colorName?: string;
  pantone?: string;
  drape: FabricDrape;
  stretch?: boolean;
  sheen: FabricSheen;
}

export interface PatternData {
  type: PatternType;
  name?: string;
  scale: ScaleType;
  repeat?: RepeatType;
  culturalOrigin?: string;
  imageUrl?: string;
}

export interface BodyType {
  shape: BodyShape;
  height: BodyHeight;
  size: BodySize;
  bust?: string;
  waist?: string;
  hips?: string;
}

export interface SkinTone {
  category: SkinToneCategory;
  undertone: SkinToneUndertone;
  hex?: string;
}

export interface PoseData {
  category: PoseCategory;
  angle: CameraAngle;
  description?: string;
  referenceUrl?: string;
}

export interface ModelData {
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

export interface ColorPalette {
  primary: string;
  secondary?: string;
  accent?: string[];
  neutrals?: string[];
  pantones?: string[];
}

export interface GarmentData {
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

export interface CollectionData {
  id: string;
  name: string;
  season: Season;
  year: number;
  theme: string;
  colorStory: ColorPalette;
  moodBoard: string[];
  looks: LookData[];
}

export interface LookData {
  id: string;
  lookNumber: number;
  garments: string[];
  styling?: StylingData;
  images: string[];
}

export interface StylingData {
  accessories: AccessoryData[];
  shoes?: FootwearData;
  hair?: string;
  makeup?: string;
}

export interface AccessoryData {
  type: string;
  name: string;
  imageUrl?: string;
}

export interface FootwearData {
  type: string;
  style: string;
  heel?: string;
  color: string;
}

export interface LayeringItem {
  garmentId: string;
  layer: number;
  visible: boolean;
}

export interface LayeringData {
  items: LayeringItem[];
  order: string[];
}

// ==================== REQUEST/RESPONSE TYPES ====================

// ===== Garment Design =====

export interface DesignGarmentRequest {
  concept: string;
  garmentType: GarmentType;
  silhouette?: SilhouetteType;
  season?: Season;
  audience?: string;
  references?: string[];
  fabricData?: Partial<FabricData>;
}

export interface DesignGarmentResponse {
  garmentData: GarmentData;
  sketches: {
    frontView: string;
    backView: string;
    detailViews: string[];
  };
  colorVariations: string[];
  designNotes: string;
}

export interface AnalyzeGarmentRequest {
  garmentImage: string;
  garmentType?: GarmentType;
  targetFit?: string;
}

export interface AnalyzeGarmentResponse {
  garmentData: GarmentData;
  fitAdjustments: string[];
  detectedFeatures: string[];
}

export interface GeneratePatternRequest {
  garmentSketch: string;
  garmentData?: GarmentData;
  size: string;
  seamAllowance?: string;
  includeGrading?: boolean;
  customMeasurements?: Record<string, string>;
}

export interface GeneratePatternResponse {
  patternPieces: string[];
  layoutGuide: string;
  sewingInstructions: string;
  materialRequirements: string;
  sizeGrading?: string[];
}

export interface CreateTechPackRequest {
  garmentSketch: string;
  garmentData?: GarmentData;
  fabricData?: FabricData;
  format?: 'standard' | 'detailed' | 'factory';
  includeCosting?: boolean;
  sizeRange?: string;
}

export interface CreateTechPackResponse {
  techPackUrl: string;
  flatSketch: string;
  callouts: string;
  colorwaySheet: string;
  billOfMaterials: string;
  gradingSpecs?: string;
  costingData?: Record<string, number>;
}

// ===== Textiles & Materials =====

export interface DesignTextileRequest {
  patternType: PatternType;
  scale: ScaleType;
  repeat: RepeatType;
  colors?: ColorPalette;
  inspiration?: string[];
  description?: string;
  heritageReference?: string;
}

export interface DesignTextileResponse {
  seamlessPattern: string;
  patternVariations: string[];
  onFabricPreview: string;
  onGarmentPreview?: string;
  textileData: PatternData;
}

export interface GenerateColorwaysRequest {
  basePattern: string;
  colorScheme: 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'custom';
  customColors?: string[];
  variationCount: number;
  seasonalInfluence?: Season;
}

export interface GenerateColorwaysResponse {
  colorways: Array<{
    id: string;
    name: string;
    preview: string;
    colors: ColorPalette;
  }>;
  recommendedForSeason?: string[];
}

export interface CulturalFusionRequest {
  baseGarment?: string;
  heritageTextile: CulturalTextileOrigin;
  fusionStyle: FusionStyle;
  placement: PatternPlacement;
  modernElements?: string[];
  customTextileDescription?: string;
}

export interface CulturalFusionResponse {
  fusedDesign: string;
  textileApplied: string;
  culturalContext: string;
  respectfulUsageGuidelines: string;
  patternDetails: PatternData;
}

// ===== Model & Casting =====

export interface CastModelRequest {
  gender: Gender;
  bodyType: BodyType;
  skinTone: SkinTone;
  age: AgeRange;
  hairStyle?: string;
  hairColor?: string;
  pose?: PoseCategory;
  expression?: string;
  referenceImage?: string;
  generateVariations?: number;
}

export interface CastModelResponse {
  modelData: ModelData;
  modelImage: string;
  poseVariations: string[];
  expressionVariations: string[];
}

export interface GeneratePosesRequest {
  model?: ModelData;
  modelImage?: string;
  poseCategory: PoseCategory;
  garmentType?: GarmentType;
  cameraAngle: CameraAngle;
  variationCount: number;
}

export interface GeneratePosesResponse {
  posedModel: string;
  poseVariations: string[];
  poseData: PoseData[];
}

export interface ScaleSizeRequest {
  garmentImage: string;
  originalSize: BodySize;
  targetSize: BodySize;
  garmentType: GarmentType;
  maintainProportions?: boolean;
}

export interface ScaleSizeResponse {
  scaledImage: string;
  fitNotes: string[];
  adjustmentDetails: string;
}

// ===== Styling =====

export interface ComposeOutfitRequest {
  mainGarment: string;
  secondaryGarments?: string[];
  model?: ModelData;
  occasion: string;
  styleVibe?: string;
  includeAccessories?: boolean;
  seasonality?: Season;
}

export interface ComposeOutfitResponse {
  styledLook: LookData;
  outfitImage: string;
  flatLay: string;
  styleNotes: string;
  alternativeStyles: string[];
}

export interface SuggestAccessoriesRequest {
  outfitImage: string;
  outfit?: LookData;
  accessoryLevel: AccessoryLevel;
  includeJewelry?: boolean;
  includeBag?: boolean;
  includeShoes?: boolean;
  includeHeadwear?: boolean;
  metalTone?: MetalTone;
}

export interface SuggestAccessoriesResponse {
  styledOutfit: string;
  accessoryList: AccessoryData[];
  detailShots: string[];
  alternatives: string[];
}

export interface StyleLayeringRequest {
  garments: string[];
  season: Season;
  occasion: string;
  layerCount?: number;
  includeStylingTips?: boolean;
}

export interface StyleLayeringResponse {
  layeredOutfit: string;
  layeringOrder: LayeringData;
  stylingTips: string[];
  alternativeCombinations: string[];
}

// ===== Photography & E-commerce =====

export interface VirtualTryOnRequest {
  garmentImage: string;
  modelImage?: string;
  model?: ModelData;
  fit?: string;
  generateViews?: boolean;
  backgroundStyle?: string;
  lighting?: string;
}

export interface VirtualTryOnResponse {
  tryOnResult: string;
  frontView: string;
  backView?: string;
  sideView?: string;
  detailViews: string[];
}

export interface CreateFlatLayRequest {
  garments: string[];
  accessories?: string[];
  layout: 'styled' | 'folded' | 'casual' | 'minimalist' | 'grid';
  background: string;
  includeProps?: boolean;
  variants?: number;
}

export interface CreateFlatLayResponse {
  flatLay: string;
  alternativeLayouts: string[];
}

export interface CreateEcommerceShotsRequest {
  garmentImage: string;
  model?: ModelData;
  modelImage?: string;
  shotStyle: 'on-model' | 'ghost' | 'flat' | 'hanger' | 'mixed';
  background: string;
  angles: number;
  includeDetails?: boolean;
}

export interface CreateEcommerceShotsResponse {
  heroShot: string;
  allAngles: string[];
  detailShots: string[];
  zoomViews: string[];
  ghostMannequin?: string;
}

export interface CreateGhostMannequinRequest {
  garmentImage: string;
  garmentType: GarmentType;
  views: ('front' | 'back' | 'side' | 'interior')[];
  background?: string;
  shadowStyle?: 'soft' | 'hard' | 'none';
}

export interface CreateGhostMannequinResponse {
  ghostMannequinImages: string[];
  compositedView: string;
  editableLayer?: string;
}

// ===== Video & Animation =====

export interface CreateRunwayAnimationRequest {
  onModelImage: string;
  model?: ModelData;
  garment?: GarmentData;
  walkStyle: WalkStyle;
  duration: string;
  cameraStyle: CameraStyle;
  includeTurnaround?: boolean;
  addMusic?: boolean;
  musicMood?: string;
}

export interface CreateRunwayAnimationResponse {
  runwayVideo: string;
  turnaroundVideo?: string;
  slowMotion?: string;
  stillFrames: string[];
  audioTrack?: string;
}

export interface CreateFabricMotionRequest {
  garmentImage: string;
  fabricData?: FabricData;
  motionType: MotionType;
  intensity: number;
  duration: string;
  loopable?: boolean;
}

export interface CreateFabricMotionResponse {
  fabricMotionVideo: string;
  loopableClip?: string;
  stillFrames: string[];
}

export interface CreateTurnaroundVideoRequest {
  onModelImage: string;
  model?: ModelData;
  rotationSpeed: 'slow' | 'medium' | 'fast';
  duration: string;
  includePauses?: boolean;
  pauseAngles?: number[];
}

export interface CreateTurnaroundVideoResponse {
  turnaroundVideo: string;
  angleStills: string[];
  exportFormats: string[];
}

// ===== Collection =====

export interface BuildCollectionRequest {
  garments: GarmentData[];
  colorStory?: ColorPalette;
  moodBoard?: string;
  season: Season;
  year: number;
  theme: string;
  collectionSize: 'mini' | 'capsule' | 'standard' | 'full';
  generateLooks?: boolean;
  includeLineSheet?: boolean;
}

export interface BuildCollectionResponse {
  collection: CollectionData;
  looks: LookData[];
  lookbookPage: string;
  collectionOverview: string;
  lineSheet?: string;
}

export interface GenerateLookbookRequest {
  collection: CollectionData;
  looks?: LookData[];
  onModelImages: string[];
  brandGuidelines?: string;
  style: 'editorial' | 'commercial' | 'minimal' | 'artistic' | 'street';
  format: 'digital' | 'print' | 'social' | 'video';
  includeDetails?: boolean;
  generateVideo?: boolean;
}

export interface GenerateLookbookResponse {
  lookbookPages: string[];
  coverPage: string;
  digitalLookbook?: string;
}

export interface GenerateLineSheetRequest {
  collection: CollectionData;
  looks: LookData[];
  includeWholesalePricing?: boolean;
  includeFabricSwatches?: boolean;
  format: 'pdf' | 'web' | 'excel';
  brandInfo?: {
    name: string;
    logo?: string;
    contact: string;
  };
}

export interface GenerateLineSheetResponse {
  lineSheetUrl: string;
  productCards: string[];
  fabricSwatches?: string[];
  orderForm?: string;
}

// ==================== SERVICE CLASS ====================

class FashionService {
  private baseUrl = '/api';

  // ===== Garment Design Endpoints =====

  async designGarment(request: DesignGarmentRequest): Promise<DesignGarmentResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/design-garment`, request);
    return response.data;
  }

  async analyzeGarment(request: AnalyzeGarmentRequest): Promise<AnalyzeGarmentResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/analyze-garment`, request);
    return response.data;
  }

  async generatePattern(request: GeneratePatternRequest): Promise<GeneratePatternResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/generate-pattern`, request);
    return response.data;
  }

  async createTechPack(request: CreateTechPackRequest): Promise<CreateTechPackResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/create-tech-pack`, request);
    return response.data;
  }

  // ===== Textiles & Materials Endpoints =====

  async designTextile(request: DesignTextileRequest): Promise<DesignTextileResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/design-textile`, request);
    return response.data;
  }

  async generateColorways(request: GenerateColorwaysRequest): Promise<GenerateColorwaysResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/generate-colorways`, request);
    return response.data;
  }

  async culturalFusion(request: CulturalFusionRequest): Promise<CulturalFusionResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/cultural-fusion`, request);
    return response.data;
  }

  // ===== Model & Casting Endpoints =====

  async castModel(request: CastModelRequest): Promise<CastModelResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/cast-model`, request);
    return response.data;
  }

  async generatePoses(request: GeneratePosesRequest): Promise<GeneratePosesResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/generate-poses`, request);
    return response.data;
  }

  async scaleSize(request: ScaleSizeRequest): Promise<ScaleSizeResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/scale-size`, request);
    return response.data;
  }

  // ===== Styling Endpoints =====

  async composeOutfit(request: ComposeOutfitRequest): Promise<ComposeOutfitResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/compose-outfit`, request);
    return response.data;
  }

  async suggestAccessories(request: SuggestAccessoriesRequest): Promise<SuggestAccessoriesResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/suggest-accessories`, request);
    return response.data;
  }

  async styleLayering(request: StyleLayeringRequest): Promise<StyleLayeringResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/style-layering`, request);
    return response.data;
  }

  // ===== Photography & E-commerce Endpoints =====

  async virtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    const response = await api.post(`${this.baseUrl}/fal/virtual-try-on`, request);
    return response.data;
  }

  async createFlatLay(request: CreateFlatLayRequest): Promise<CreateFlatLayResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/flat-lay`, request);
    return response.data;
  }

  async createEcommerceShots(request: CreateEcommerceShotsRequest): Promise<CreateEcommerceShotsResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/ecommerce-shots`, request);
    return response.data;
  }

  async createGhostMannequin(request: CreateGhostMannequinRequest): Promise<CreateGhostMannequinResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/ghost-mannequin`, request);
    return response.data;
  }

  // ===== Video & Animation Endpoints =====

  async createRunwayAnimation(request: CreateRunwayAnimationRequest): Promise<CreateRunwayAnimationResponse> {
    const response = await api.post(`${this.baseUrl}/fal/runway-animation`, request);
    return response.data;
  }

  async createFabricMotion(request: CreateFabricMotionRequest): Promise<CreateFabricMotionResponse> {
    const response = await api.post(`${this.baseUrl}/fal/fabric-motion`, request);
    return response.data;
  }

  async createTurnaroundVideo(request: CreateTurnaroundVideoRequest): Promise<CreateTurnaroundVideoResponse> {
    const response = await api.post(`${this.baseUrl}/fal/turnaround-video`, request);
    return response.data;
  }

  // ===== Collection Endpoints =====

  async buildCollection(request: BuildCollectionRequest): Promise<BuildCollectionResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/build-collection`, request);
    return response.data;
  }

  async generateLookbook(request: GenerateLookbookRequest): Promise<GenerateLookbookResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/generate-lookbook`, request);
    return response.data;
  }

  async generateLineSheet(request: GenerateLineSheetRequest): Promise<GenerateLineSheetResponse> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/line-sheet`, request);
    return response.data;
  }

  // ===== Utility Methods =====

  async getDiverseModels(count: number, bodyTypes?: BodyShape[], skinTones?: SkinToneCategory[]): Promise<CastModelResponse[]> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/diverse-models`, {
      count,
      bodyTypes,
      skinTones,
    });
    return response.data;
  }

  async getProductDetails(garmentImage: string): Promise<{
    garmentData: GarmentData;
    suggestedPrice?: number;
    marketCategory?: string;
  }> {
    const response = await api.post(`${this.baseUrl}/agent/fashion/product-details`, {
      garmentImage,
    });
    return response.data;
  }
}

export const fashionService = new FashionService();
export default fashionService;
