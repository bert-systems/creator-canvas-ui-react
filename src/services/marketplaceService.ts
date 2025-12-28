/**
 * Marketplace Service
 * API integration for the creative assets marketplace
 */

import api from './api';
import type {
  MarketplaceListing,
  ListingCategory,
  LicenseType,
  SellerStats,
  Asset,
  PagedResult,
} from '@/models/assetSystem';

// ============================================================================
// API Types
// ============================================================================

// Browse/Search
export interface MarketplaceBrowseParams {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  licenseType?: string;
  rating?: number;
  sortBy?: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating';
  search?: string;
  page?: number;
  limit?: number;
}

export interface MarketplaceSearchParams {
  q: string;
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface MarketplaceBrowseResponse {
  items: MarketplaceListingResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  featuredItems?: MarketplaceListingResponse[];
  categories?: CategoryInfo[];
}

export interface MarketplaceListingResponse {
  id: string;
  libraryId: string;
  sellerId: string;
  sellerName: string;
  sellerAvatarUrl: string | null;
  isSellerVerified: boolean;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  priceUsd: number;
  originalPriceUsd: number | null;
  licenseType: string;
  licenseDetails: string | null;
  thumbnailUrl: string;
  previewUrls: string[];
  assetType: string;
  tags: string[];
  rating: number | null;
  reviewCount: number;
  salesCount: number;
  viewsCount: number;
  downloadsCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isFavorited: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  name: string;
  displayName: string;
  icon: string;
  count: number;
  subcategories?: string[];
}

// Create Listing
export interface ListForSaleRequest {
  libraryId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priceUsd: number;
  licenseType: string;
  licenseDetails?: string;
  tags?: string[];
}

export interface ListingResponse {
  listingId: string;
  libraryId: string;
  status: string;
  message: string;
  listing: MarketplaceListingResponse;
}

// Update Listing
export interface UpdateListingRequest {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  priceUsd?: number;
  licenseType?: string;
  licenseDetails?: string;
  tags?: string[];
  status?: string;
}

// Purchase
export interface PurchaseRequest {
  libraryId: string;
  paymentMethodId?: string; // Optional for now (no payment integration)
}

export interface PurchaseResponse {
  transactionId: string;
  libraryId: string;
  amount: number;
  currency: string;
  status: string;
  licenseKey: string;
  downloadUrl: string;
  downloadExpiresAt: string;
  message: string;
}

export interface PurchaseHistoryResponse {
  items: PurchaseRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PurchaseRecord {
  transactionId: string;
  libraryId: string;
  listing: MarketplaceListingResponse;
  amount: number;
  currency: string;
  licenseType: string;
  licenseKey: string;
  downloadCount: number;
  maxDownloads: number;
  purchasedAt: string;
}

export interface DownloadResponse {
  url: string;
  expiresAt: string;
  remainingDownloads: number;
}

// Seller Dashboard
export interface SellerDashboardResponse {
  earnings: {
    totalRevenue: number;
    pendingPayout: number;
    lifetimeEarnings: number;
    periodEarnings: number;
    platformFees: number;
  };
  stats: {
    totalListings: number;
    activeListings: number;
    totalSales: number;
    totalViews: number;
    conversionRate: number;
    averageRating: number;
    reviewCount: number;
  };
  recentSales: {
    transactionId: string;
    listingId: string;
    listingTitle: string;
    buyerName: string;
    amount: number;
    date: string;
  }[];
  topListings: {
    listingId: string;
    title: string;
    thumbnailUrl: string;
    sales: number;
    views: number;
    revenue: number;
    rating: number | null;
  }[];
  salesByDay: {
    date: string;
    sales: number;
    revenue: number;
  }[];
}

// Reviews
export interface SubmitReviewRequest {
  rating: number;
  title?: string;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  libraryId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ReviewsListResponse {
  items: ReviewResponse[];
  totalCount: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
}

// Favorites
export interface FavoriteResponse {
  libraryId: string;
  listing: MarketplaceListingResponse;
  addedAt: string;
}

// Discovery/Inspiration
export interface TrendingParams {
  assetType?: string;
  days?: number;
  page?: number;
  pageSize?: number;
}

export interface PopularParams {
  assetType?: string;
  page?: number;
  pageSize?: number;
}

export interface CreatorGalleryParams {
  creatorId: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// API Service
// ============================================================================

const MARKETPLACE_BASE = '/api/creative-canvas/marketplace';
const ASSETS_BASE = '/api/Assets';

/**
 * Browse marketplace listings with filters
 */
export async function browseMarketplace(params: MarketplaceBrowseParams = {}): Promise<MarketplaceBrowseResponse> {
  const response = await api.get<{ data: MarketplaceBrowseResponse }>(`${MARKETPLACE_BASE}/browse`, {
    params: {
      Category: params.category,
      Subcategory: params.subcategory,
      PriceMin: params.priceMin,
      PriceMax: params.priceMax,
      LicenseType: params.licenseType,
      Rating: params.rating,
      SortBy: params.sortBy,
      Search: params.search,
      Page: params.page,
      Limit: params.limit,
    },
  });
  return response.data.data;
}

/**
 * Search marketplace listings
 */
export async function searchMarketplace(params: MarketplaceSearchParams): Promise<PagedResult<MarketplaceListingResponse>> {
  const response = await api.get<{ data: PagedResult<MarketplaceListingResponse> }>(`${MARKETPLACE_BASE}/search`, {
    params: {
      Q: params.q,
      Type: params.type,
      Category: params.category,
      Page: params.page,
      Limit: params.limit,
    },
  });
  return response.data.data;
}

/**
 * Get a single marketplace listing by ID
 */
export async function getListing(libraryId: string): Promise<MarketplaceListingResponse> {
  const response = await api.get<{ data: MarketplaceListingResponse }>(`${MARKETPLACE_BASE}/listings/${libraryId}`);
  return response.data.data;
}

/**
 * Create a new marketplace listing
 */
export async function createListing(request: ListForSaleRequest): Promise<ListingResponse> {
  const response = await api.post<{ data: ListingResponse }>(`${MARKETPLACE_BASE}/list`, request);
  return response.data.data;
}

/**
 * Update an existing listing
 */
export async function updateListing(listingId: string, request: UpdateListingRequest): Promise<MarketplaceListingResponse> {
  const response = await api.put<{ data: MarketplaceListingResponse }>(`${MARKETPLACE_BASE}/listings/${listingId}`, request);
  return response.data.data;
}

/**
 * Remove a listing
 */
export async function removeListing(listingId: string): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<{ data: { success: boolean; message: string } }>(`${MARKETPLACE_BASE}/listings/${listingId}`);
  return response.data.data;
}

/**
 * Purchase a listing
 */
export async function purchaseListing(request: PurchaseRequest): Promise<PurchaseResponse> {
  const response = await api.post<{ data: PurchaseResponse }>(`${MARKETPLACE_BASE}/purchase`, request);
  return response.data.data;
}

/**
 * Get purchase history
 */
export async function getPurchaseHistory(page = 1, limit = 20): Promise<PurchaseHistoryResponse> {
  const response = await api.get<{ data: PurchaseHistoryResponse }>(`${MARKETPLACE_BASE}/purchases`, {
    params: { page, limit },
  });
  return response.data.data;
}

/**
 * Get download URL for a purchase
 */
export async function getDownloadUrl(transactionId: string): Promise<DownloadResponse> {
  const response = await api.get<{ data: DownloadResponse }>(`${MARKETPLACE_BASE}/purchases/${transactionId}/download`);
  return response.data.data;
}

/**
 * Get seller dashboard data
 */
export async function getSellerDashboard(period = '30d'): Promise<SellerDashboardResponse> {
  const response = await api.get<{ data: SellerDashboardResponse }>(`${MARKETPLACE_BASE}/seller/dashboard`, {
    params: { period },
  });
  return response.data.data;
}

/**
 * Submit a review for a listing
 */
export async function submitReview(libraryId: string, request: SubmitReviewRequest): Promise<ReviewResponse> {
  const response = await api.post<{ data: ReviewResponse }>(`${MARKETPLACE_BASE}/listings/${libraryId}/reviews`, request);
  return response.data.data;
}

/**
 * Get reviews for a listing
 */
export async function getReviews(libraryId: string, page = 1, limit = 10): Promise<ReviewsListResponse> {
  const response = await api.get<{ data: ReviewsListResponse }>(`${MARKETPLACE_BASE}/listings/${libraryId}/reviews`, {
    params: { page, limit },
  });
  return response.data.data;
}

/**
 * Add a listing to favorites
 */
export async function addFavorite(libraryId: string): Promise<{ success: boolean }> {
  const response = await api.post<{ data: { success: boolean } }>(`${MARKETPLACE_BASE}/favorites/${libraryId}`);
  return response.data.data;
}

/**
 * Remove a listing from favorites
 */
export async function removeFavorite(libraryId: string): Promise<{ success: boolean }> {
  const response = await api.delete<{ data: { success: boolean } }>(`${MARKETPLACE_BASE}/favorites/${libraryId}`);
  return response.data.data;
}

/**
 * Get user's favorite listings
 */
export async function getFavorites(page = 1, limit = 20): Promise<PagedResult<FavoriteResponse>> {
  const response = await api.get<{ data: PagedResult<FavoriteResponse> }>(`${MARKETPLACE_BASE}/favorites`, {
    params: { page, limit },
  });
  return response.data.data;
}

// ============================================================================
// Discovery/Inspiration API
// ============================================================================

/**
 * Get trending assets
 */
export async function getTrendingAssets(params: TrendingParams = {}): Promise<PagedResult<Asset>> {
  const response = await api.get<PagedResult<Asset>>(`${ASSETS_BASE}/trending`, {
    params: {
      assetType: params.assetType,
      days: params.days ?? 7,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });
  return response.data;
}

/**
 * Get popular assets (all-time)
 */
export async function getPopularAssets(params: PopularParams = {}): Promise<PagedResult<Asset>> {
  const response = await api.get<PagedResult<Asset>>(`${ASSETS_BASE}/popular`, {
    params: {
      assetType: params.assetType,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });
  return response.data;
}

/**
 * Get asset categories with counts
 */
export async function getCategories(): Promise<CategoryInfo[]> {
  const response = await api.get<CategoryInfo[]>(`${ASSETS_BASE}/categories`);
  return response.data;
}

/**
 * Get assets by category
 */
export async function getAssetsByCategory(category: string, page = 1, pageSize = 20): Promise<PagedResult<Asset>> {
  const response = await api.get<PagedResult<Asset>>(`${ASSETS_BASE}/category/${encodeURIComponent(category)}`, {
    params: { page, pageSize },
  });
  return response.data;
}

/**
 * Get creator's public gallery
 */
export async function getCreatorGallery(creatorId: string, page = 1, pageSize = 20): Promise<PagedResult<Asset>> {
  const response = await api.get<PagedResult<Asset>>(`${ASSETS_BASE}/creator/${creatorId}`, {
    params: { page, pageSize },
  });
  return response.data;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert API listing response to frontend MarketplaceListing type
 */
export function toMarketplaceListing(response: MarketplaceListingResponse): MarketplaceListing {
  return {
    id: response.id,
    assetId: response.libraryId,
    asset: {
      id: response.libraryId,
      assetType: response.assetType as 'image' | 'video' | 'audio' | 'document',
      title: response.title,
      description: response.description,
      publicUrl: response.previewUrls[0] || response.thumbnailUrl,
      thumbnailUrl: response.thumbnailUrl,
      width: null,
      height: null,
      aspectRatio: null,
      durationSeconds: null,
      fileSizeBytes: 0,
      mimeType: 'image/png',
      visibility: 'public',
      isGenerated: true,
      source: null,
      sourceAction: null,
      provider: null,
      model: null,
      prompt: null,
      tags: response.tags,
      autoTags: [],
      likesCount: 0,
      viewsCount: response.viewsCount,
      downloadsCount: response.downloadsCount,
      isFeatured: response.isFeatured,
      isLikedByUser: response.isFavorited,
      userId: response.sellerId,
      generationId: null,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    },
    creatorId: response.sellerId,
    creator: {
      id: response.sellerId,
      userId: response.sellerId,
      displayName: response.sellerName,
      username: response.sellerName.toLowerCase().replace(/\s+/g, '_'),
      bio: null,
      avatarUrl: response.sellerAvatarUrl,
      coverImageUrl: null,
      location: null,
      website: null,
      socialLinks: {},
      isVerified: response.isSellerVerified,
      isPro: false,
      totalSales: response.salesCount,
      totalListings: 0,
      followersCount: 0,
      followingCount: 0,
      rating: response.rating,
      reviewCount: response.reviewCount,
      specialties: [],
      joinedAt: response.createdAt,
    },
    title: response.title,
    description: response.description,
    category: response.category as ListingCategory,
    subcategory: response.subcategory,
    tags: response.tags,
    priceUsd: response.priceUsd,
    originalPriceUsd: response.originalPriceUsd,
    licenseType: response.licenseType as LicenseType,
    licenseDetails: response.licenseDetails,
    isFree: response.priceUsd === 0,
    isExclusive: response.licenseType === 'exclusive',
    downloadCount: response.downloadsCount,
    salesCount: response.salesCount,
    viewsCount: response.viewsCount,
    likesCount: 0,
    rating: response.rating,
    reviewCount: response.reviewCount,
    status: response.status as 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected' | 'removed',
    isFeatured: response.isFeatured,
    isTrending: response.isTrending,
    isNewArrival: response.isNewArrival,
    previewImages: response.previewUrls,
    watermarkedPreviewUrl: null,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    publishedAt: response.createdAt,
  };
}

/**
 * Convert seller dashboard response to frontend SellerStats type
 */
export function toSellerStats(response: SellerDashboardResponse): SellerStats {
  return {
    totalSales: response.stats.totalSales,
    totalRevenue: response.earnings.totalRevenue,
    totalViews: response.stats.totalViews,
    totalDownloads: 0, // Not in API response
    conversionRate: response.stats.conversionRate,
    averageRating: response.stats.averageRating,
    listingsCount: response.stats.totalListings,
    activeListingsCount: response.stats.activeListings,
  };
}

export default {
  browseMarketplace,
  searchMarketplace,
  getListing,
  createListing,
  updateListing,
  removeListing,
  purchaseListing,
  getPurchaseHistory,
  getDownloadUrl,
  getSellerDashboard,
  submitReview,
  getReviews,
  addFavorite,
  removeFavorite,
  getFavorites,
  getTrendingAssets,
  getPopularAssets,
  getCategories,
  getAssetsByCategory,
  getCreatorGallery,
  toMarketplaceListing,
  toSellerStats,
};
