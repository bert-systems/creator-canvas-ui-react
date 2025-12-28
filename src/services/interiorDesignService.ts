/**
 * interiorDesignService.ts - Interior Design API Service Layer
 * Provides API integration for all interior design-related nodes
 * Aligns with API endpoints from NEW_CATEGORIES_API_REQUIREMENTS.md
 */

import api from './api';

// ==================== TYPE DEFINITIONS ====================

// ===== Enums (aligned with API schema) =====

export type RoomType =
  | 'livingRoom' | 'bedroom' | 'kitchen' | 'bathroom'
  | 'diningRoom' | 'homeOffice' | 'nursery' | 'outdoor'
  | 'basement' | 'attic' | 'studio' | 'openPlan';

export type InteriorDesignStyle =
  | 'modern' | 'scandinavian' | 'industrial' | 'midCentury'
  | 'bohemian' | 'traditional' | 'coastal' | 'farmhouse'
  | 'japandi' | 'artDeco' | 'mediterranean' | 'transitional'
  | 'minimalist' | 'maximalist' | 'rustic' | 'contemporary';

export type StagingStyle =
  | 'modern' | 'contemporary' | 'traditional' | 'scandinavian' | 'luxury'
  | 'transitional' | 'coastal' | 'urban' | 'familyFriendly';

export type FurnishingLevel = 'minimal' | 'standard' | 'full' | 'luxury';

export type FurnitureType =
  | 'sofa' | 'sectional' | 'armchair' | 'ottoman'
  | 'diningTable' | 'diningChairs' | 'coffeeTable' | 'sideTable' | 'console'
  | 'bed' | 'nightstand' | 'dresser' | 'wardrobe'
  | 'desk' | 'officeChair' | 'bookshelf' | 'cabinet'
  | 'lighting' | 'rug' | 'mirror' | 'storage' | 'all';

export type FurnitureCategory = 'seating' | 'tables' | 'storage' | 'lighting' | 'decor' | 'rugs' | 'art';

export type MaterialCategory = 'flooring' | 'wall' | 'countertop' | 'cabinetry' | 'tile' | 'fixture';

export type LightingType = 'natural' | 'evening' | 'studio' | 'dramatic';

export type BudgetLevel = 'budget' | 'mid' | 'premium' | 'luxury';

export type TargetAudience = 'luxury' | 'family' | 'youngProfessional' | 'retiree' | 'firstTimeBuyer';

// New enhancement types for more customization
export type ColorPalette = 'warm' | 'cool' | 'neutral' | 'monochromatic' | 'vibrant' | 'earthTones' | 'pastels';

export type LightingPreference = 'natural' | 'ambient' | 'dramatic' | 'bright' | 'cozy' | 'layered';

export type DesignMood = 'relaxing' | 'energizing' | 'sophisticated' | 'playful' | 'romantic' | 'productive' | 'cozy' | 'minimalist';

export type DesignEra = 'contemporary' | 'midCentury' | 'artDeco' | 'victorian' | 'rustic' | 'futuristic' | 'vintage' | 'eclectic';

export type MaterialType = 'wood' | 'metal' | 'glass' | 'stone' | 'leather' | 'fabric' | 'rattan' | 'marble' | 'concrete' | 'velvet' | 'linen' | 'ceramic';

export type FocusArea = 'seating' | 'storage' | 'lighting' | 'decor' | 'plants' | 'textiles' | 'artwork' | 'entertainment';

export type FocalPoint = 'fireplace' | 'windows' | 'entertainment' | 'dining' | 'bed' | 'kitchen' | 'artwork' | 'view';

export type AccessoryType = 'art' | 'plants' | 'books' | 'textiles' | 'lighting' | 'mirrors' | 'sculptures' | 'vases';

export type PhotographyStyle = 'realEstate' | 'editorial' | 'lifestyle' | 'twilight' | 'architectural';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ===== Interfaces =====

export interface ProductSuggestion {
  name: string;
  category: string;
  description: string;
  estimatedPrice?: string;
  searchTerms: string[];
}

export interface StagedFurnitureItem {
  name: string;
  category: FurnitureCategory;
  position: string;
  style: string;
}

export interface FloorPosition {
  x: number;
  y: number;
}

export interface FurniturePlacement {
  item: string;
  position: FloorPosition;
  rotation: number;
  dimensions: { width: number; depth: number };
}

export interface FloorPlanLayout {
  id: string;
  name: string;
  description: string;
  layoutImage: string;
  furniturePlacements: FurniturePlacement[];
}

export interface Dimensions {
  length: number;
  width: number;
  area?: number;
  unit: string;
}

export interface FurnitureSuggestion {
  id: string;
  name: string;
  category: FurnitureType;
  style: string;
  description: string;
  generatedImage: string;
  dimensions?: { width: number; height: number; depth: number };
  priceRange: string;
  materials: string[];
  colors: string[];
  searchTerms: string[];
}

export interface MaterialItem {
  category: MaterialCategory;
  name: string;
  type: string;
  color: string;
  hexCode: string;
  finish: string;
  texture: string;
  sampleImage: string;
  priceRange?: string;
}

export interface MaterialPalette {
  id: string;
  name: string;
  style: string;
  materials: MaterialItem[];
  colorHarmony: string;
}

export interface Room3DRender {
  angle: string;
  imageUrl: string;
}

// ===== Request Interfaces =====

export interface RoomRedesignRequest {
  roomImage: string;
  styleReference?: string;
  roomType: RoomType;
  designStyle: InteriorDesignStyle;
  preserveStructure: boolean;
  intensity: number;
  customPrompt?: string;
  // Enhanced customization options
  colorPalette?: ColorPalette;
  lightingPreference?: LightingPreference;
  materialPreferences?: MaterialType[];
  mood?: DesignMood;
  era?: DesignEra;
  focusAreas?: FocusArea[];
}

export interface VirtualStagingRequest {
  emptyRoomImage: string;
  roomType: RoomType;
  stagingStyle: StagingStyle;
  furnishingLevel: FurnishingLevel;
  targetAudience?: TargetAudience;
  budgetTier?: BudgetLevel;
  // Enhanced customization options
  colorScheme?: ColorPalette;
  focalPoint?: FocalPoint;
  lightingStyle?: LightingPreference;
  accessories?: AccessoryType[];
  photographyStyle?: PhotographyStyle;
}

export interface FloorPlanRequest {
  dimensions?: {
    length: number;
    width: number;
    unit: 'feet' | 'meters';
  };
  roomPhoto?: string;
  roomType: RoomType;
  includeLayout: boolean;
  layoutCount?: number;
  requirements?: string[];
}

export interface FurnitureSuggestionRequest {
  roomImage?: string;
  styleReference?: string;
  furnitureType: FurnitureType;
  designStyle: InteriorDesignStyle;
  budgetLevel: BudgetLevel;
  roomDimensions?: { length: number; width: number };
  colorPreferences?: string[];
  excludeBrands?: string[];
}

export interface MaterialPaletteRequest {
  roomImage?: string;
  styleReference?: string;
  designStyle: InteriorDesignStyle;
  includeFlooring: boolean;
  includeWalls: boolean;
  includeCountertops: boolean;
  includeCabinetry?: boolean;
  includeFixtures?: boolean;
  colorFamily?: string;
}

export interface Room3DRequest {
  floorPlan: string;
  materials?: MaterialItem[];
  ceilingHeight: number;
  includeFurniture: boolean;
  furnitureStyle?: InteriorDesignStyle;
  lighting: LightingType;
  cameraAngles?: ('eyeLevel' | 'birdsEye' | 'corner' | 'detail')[];
  outputFormat: '3dModel' | 'renders' | 'both';
}

// ===== Response Interfaces =====

export interface RoomRedesignResponse {
  jobId: string;
  status: JobStatus;
  redesignedRoom: string;
  beforeAfterComparison?: string;
  designNotes?: string;
  suggestedProducts?: ProductSuggestion[];
  cost?: number;
}

export interface VirtualStagingResponse {
  jobId: string;
  status: JobStatus;
  stagedRoomImage: string;
  furnitureList?: StagedFurnitureItem[];
  estimatedStagingCost?: string;
}

export interface FloorPlanResponse {
  floorPlan: string;
  dimensions: Dimensions;
  layoutSuggestions?: FloorPlanLayout[];
}

export interface FurnitureSuggestionResponse {
  suggestions: FurnitureSuggestion[];
  moodboard?: string;
  styleNotes: string;
}

export interface MaterialPaletteResponse {
  palette: MaterialPalette;
  visualization: string;
  alternativePalettes?: MaterialPalette[];
}

export interface Room3DResponse {
  jobId: string;
  status: JobStatus;
  model3d?: {
    glbUrl: string;
    usdzUrl?: string;
  };
  renders?: Room3DRender[];
  walkthroughVideo?: string;
}

// ==================== API SERVICE ====================

const INTERIOR_API_BASE = '/api/interior';

export const interiorDesignService = {
  // ===== Room Redesign =====

  /**
   * Transform room photos with AI-powered style changes
   * POST /api/interior/room-redesign
   */
  async redesignRoom(request: RoomRedesignRequest): Promise<RoomRedesignResponse> {
    const response = await api.post<RoomRedesignResponse>(
      `${INTERIOR_API_BASE}/room-redesign`,
      request
    );
    return response.data;
  },

  // ===== Virtual Staging =====

  /**
   * Add furniture and decor to empty rooms
   * POST /api/interior/virtual-staging
   */
  async stageRoom(request: VirtualStagingRequest): Promise<VirtualStagingResponse> {
    const response = await api.post<VirtualStagingResponse>(
      `${INTERIOR_API_BASE}/virtual-staging`,
      request
    );
    return response.data;
  },

  // ===== Floor Plan Generation =====

  /**
   * Generate 2D floor plans from dimensions or photos
   * POST /api/interior/floor-plan
   */
  async generateFloorPlan(request: FloorPlanRequest): Promise<FloorPlanResponse> {
    const response = await api.post<FloorPlanResponse>(
      `${INTERIOR_API_BASE}/floor-plan`,
      request
    );
    return response.data;
  },

  // ===== Furniture Suggestion =====

  /**
   * Get AI-powered furniture recommendations
   * POST /api/interior/furniture/suggest
   */
  async suggestFurniture(request: FurnitureSuggestionRequest): Promise<FurnitureSuggestionResponse> {
    const response = await api.post<FurnitureSuggestionResponse>(
      `${INTERIOR_API_BASE}/furniture/suggest`,
      request
    );
    return response.data;
  },

  // ===== Material Palette =====

  /**
   * Generate cohesive material palettes for interior finishes
   * POST /api/interior/materials/palette
   */
  async generateMaterialPalette(request: MaterialPaletteRequest): Promise<MaterialPaletteResponse> {
    const response = await api.post<MaterialPaletteResponse>(
      `${INTERIOR_API_BASE}/materials/palette`,
      request
    );
    return response.data;
  },

  // ===== 3D Visualization =====

  /**
   * Convert floor plans to 3D room visualizations
   * POST /api/interior/3d/visualize
   */
  async visualize3D(request: Room3DRequest): Promise<Room3DResponse> {
    const response = await api.post<Room3DResponse>(
      `${INTERIOR_API_BASE}/3d/visualize`,
      request
    );
    return response.data;
  },

  // ===== Job Status Polling =====

  /**
   * Poll for async job status
   * GET /api/jobs/{jobId}
   */
  async getJobStatus(jobId: string): Promise<{ status: JobStatus; result?: unknown; error?: string }> {
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
  },

  // ===== Helper Functions =====

  /**
   * Poll job until completion
   */
  async pollUntilComplete<T>(
    jobId: string,
    onProgress?: (status: JobStatus) => void,
    maxAttempts = 60,
    intervalMs = 2000
  ): Promise<T> {
    for (let i = 0; i < maxAttempts; i++) {
      const job = await this.getJobStatus(jobId);

      if (onProgress) {
        onProgress(job.status as JobStatus);
      }

      if (job.status === 'completed') {
        return job.result as T;
      }

      if (job.status === 'failed') {
        throw new Error(job.error || 'Job failed');
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Job timed out');
  },
};

export default interiorDesignService;
