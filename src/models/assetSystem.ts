/**
 * Asset System Models
 * Types for the Generation Tracking & Asset Indexing System
 */

// ============================================================================
// Common Types
// ============================================================================

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

// ============================================================================
// Asset Types
// ============================================================================

export type AssetType = 'image' | 'video' | 'audio' | 'document';
export type AssetVisibility = 'private' | 'unlisted' | 'public' | 'team';
export type AssetStatus = 'processing' | 'active' | 'archived' | 'deleted';

export interface Asset {
  id: string;
  assetType: AssetType;
  title: string | null;
  description: string | null;
  publicUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number;
  mimeType: string;
  visibility: AssetVisibility;
  isGenerated: boolean;
  source: string | null;
  sourceAction: string | null;
  provider: string | null;
  model: string | null;
  prompt: string | null;
  tags: string[];
  autoTags: string[];
  likesCount: number;
  viewsCount: number;
  downloadsCount: number;
  isFeatured: boolean;
  isLikedByUser: boolean;
  userId: string;
  generationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetSearchParams extends PaginationParams {
  query?: string;
  assetType?: AssetType;
  source?: string;
  sourceAction?: string;
  visibility?: AssetVisibility;
  isGenerated?: boolean;
  isFeatured?: boolean;
  tags?: string;
}

export interface AssetUploadParams {
  file: File;
  title?: string;
  description?: string;
  tags?: string;
  visibility?: AssetVisibility;
}

export interface AssetUpdateParams {
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: AssetVisibility;
}

// ============================================================================
// Collection Types
// ============================================================================

export type CollectionType =
  | 'general'
  | 'project'
  | 'moodboard'
  | 'favorites'
  | 'inspiration'
  | 'curated'
  | 'smart';

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  collectionType: CollectionType;
  visibility: AssetVisibility;
  assetCount: number;
  coverImageUrl: string | null;
  previewAssets: AssetPreview[];
  isFeatured: boolean;
  viewsCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetPreview {
  id: string;
  thumbnailUrl: string;
}

export interface CreateCollectionParams {
  name: string;
  description?: string;
  collectionType?: CollectionType;
  visibility?: AssetVisibility;
  coverImageUrl?: string;
  tags?: string[];
}

export interface UpdateCollectionParams {
  name?: string;
  description?: string;
  visibility?: AssetVisibility;
  coverImageUrl?: string;
}

export interface AddAssetsToCollectionParams {
  assetIds: string[];
  notes?: string;
}

export interface CollectionSearchParams extends PaginationParams {
  collectionType?: CollectionType;
  featured?: boolean;
  query?: string;
}

// ============================================================================
// Generation Types
// ============================================================================

export type GenerationType = 'image' | 'video' | 'audio' | 'text' | 'multimodal';
export type GenerationStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Generation {
  id: string;
  status: GenerationStatus;
  source: string;
  sourceAction: string;
  provider: string;
  model: string;
  generationType: GenerationType;
  prompt: string | null;
  negativePrompt: string | null;
  inputParameters: Record<string, unknown>;
  outputAssetId: string | null;
  outputText: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  estimatedCostUsd: number | null;
  actualCostUsd: number | null;
  processingTimeMs: number | null;
  queueTimeMs: number | null;
  totalTimeMs: number | null;
  errorMessage: string | null;
  errorCode: string | null;
  createdAt: string;
  queuedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface GenerationSearchParams extends PaginationParams {
  source?: string;
  sourceAction?: string;
  provider?: string;
  model?: string;
  generationType?: GenerationType;
  status?: GenerationStatus;
  fromDate?: string;
  toDate?: string;
}

export interface UsageStatistics {
  period: string;
  fromDate: string;
  toDate: string;
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  totalTokens: number;
  totalCostUsd: number;
  byType: Record<string, UsageBreakdown>;
  bySource: Record<string, UsageBreakdown>;
  byModel: Record<string, UsageBreakdown>;
}

export interface UsageBreakdown {
  count: number;
  cost: number;
  tokens?: number;
}

export interface UsageBySource {
  source: string;
  count: number;
  cost: number;
  successRate: number;
}

export interface UsageByModel {
  provider: string;
  model: string;
  generationType: string;
  count: number;
  cost: number;
  avgLatencyMs: number;
}

export interface CostSummary {
  period: string;
  totalCost: number;
  costByType: Record<string, number>;
  costByProvider: Record<string, number>;
  dailyCosts: DailyCost[];
}

export interface DailyCost {
  date: string;
  cost: number;
  generationCount: number;
}

export type UsagePeriod = 'day' | 'week' | 'month' | 'year' | 'all';

export interface UsageQueryParams {
  period?: UsagePeriod;
  fromDate?: string;
  toDate?: string;
}

// ============================================================================
// Source/Action Taxonomy
// ============================================================================

export const ASSET_SOURCES = [
  'studio-fashion',
  'studio-moodboard',
  'studio-interior',
  'studio-social',
  'canvas-fashion',
  'canvas-moodboard',
  'canvas-interior',
  'canvas-social',
  'canvas-core',
  'canvas-audio',
  'canvas-multiframe',
  'canvas-llm',
  'api-direct',
  'batch-processing',
  'system',
] as const;

export const ASSET_ACTIONS = {
  image: [
    'image-generation',
    'image-edit',
    'image-variation',
    'image-upscale',
    'background-removal',
    'background-replace',
    'face-swap',
    'style-transfer',
    'image-composite',
  ],
  fashion: [
    'virtual-try-on',
    'clothes-swap',
    'outfit-generation',
    'fashion-edit',
    'garment-generation',
  ],
  video: [
    'video-generation',
    'image-to-video',
    'video-extension',
    'lip-sync',
    'video-edit',
  ],
  audio: [
    'text-to-speech',
    'voice-clone',
    'music-generation',
    'sfx-generation',
    'dialogue-generation',
    'audio-enhancement',
  ],
  llm: [
    'text-generation',
    'prompt-enhancement',
    'image-analysis',
    'content-moderation',
    'translation',
    'summarization',
  ],
  moodboard: [
    'mood-generation',
    'palette-extraction',
    'style-analysis',
  ],
  interior: [
    'room-redesign',
    'furniture-placement',
    'material-swap',
  ],
} as const;

export type AssetSource = typeof ASSET_SOURCES[number];

// ============================================================================
// Marketplace Types
// ============================================================================

export type LicenseType = 'personal' | 'commercial' | 'extended' | 'exclusive';
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected' | 'removed';
export type ListingCategory =
  | 'fashion'
  | 'interior'
  | 'art'
  | 'photography'
  | 'illustration'
  | 'pattern'
  | 'texture'
  | 'stock'
  | 'template'
  | 'other';

export interface MarketplaceListing {
  id: string;
  assetId: string;
  asset: Asset;
  creatorId: string;
  creator: CreatorProfile;
  title: string;
  description: string;
  category: ListingCategory;
  subcategory: string | null;
  tags: string[];
  priceUsd: number;
  originalPriceUsd: number | null; // For showing discounts
  licenseType: LicenseType;
  licenseDetails: string | null;
  isFree: boolean;
  isExclusive: boolean;
  downloadCount: number;
  salesCount: number;
  viewsCount: number;
  likesCount: number;
  rating: number | null;
  reviewCount: number;
  status: ListingStatus;
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  previewImages: string[];
  watermarkedPreviewUrl: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  location: string | null;
  website: string | null;
  socialLinks: SocialLinks;
  isVerified: boolean;
  isPro: boolean;
  totalSales: number;
  totalListings: number;
  followersCount: number;
  followingCount: number;
  rating: number | null;
  reviewCount: number;
  specialties: string[];
  joinedAt: string;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  behance?: string;
  dribbble?: string;
  linkedin?: string;
}

export interface MarketplaceSearchParams extends PaginationParams {
  query?: string;
  category?: ListingCategory;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  licenseType?: LicenseType;
  isFree?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  creatorId?: string;
  tags?: string;
}

export interface CreateListingParams {
  assetId: string;
  title: string;
  description: string;
  category: ListingCategory;
  subcategory?: string;
  tags?: string[];
  priceUsd: number;
  licenseType: LicenseType;
  licenseDetails?: string;
  previewImages?: string[];
}

export interface UpdateListingParams {
  title?: string;
  description?: string;
  category?: ListingCategory;
  subcategory?: string;
  tags?: string[];
  priceUsd?: number;
  originalPriceUsd?: number;
  licenseType?: LicenseType;
  licenseDetails?: string;
  status?: ListingStatus;
  previewImages?: string[];
}

// Seller Dashboard Types
export interface SellerStats {
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  totalDownloads: number;
  conversionRate: number;
  averageRating: number;
  listingsCount: number;
  activeListingsCount: number;
}

export interface SalesData {
  date: string;
  sales: number;
  revenue: number;
}

export interface TopListing {
  listing: MarketplaceListing;
  views: number;
  sales: number;
  revenue: number;
}
