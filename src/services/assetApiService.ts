/**
 * Asset API Service
 * Client for the Assets API endpoints
 */

import api from './api';
import type {
  Asset,
  AssetSearchParams,
  AssetUploadParams,
  AssetUpdateParams,
  PagedResult,
} from '@/models/assetSystem';

const ASSETS_BASE = '/api/Assets';

// ============================================================================
// Asset API Service
// ============================================================================

export const assetApiService = {
  /**
   * Search assets with filters
   * GET /api/Assets/search
   */
  async search(params: AssetSearchParams = {}): Promise<PagedResult<Asset>> {
    const response = await api.get<PagedResult<Asset>>(`${ASSETS_BASE}/search`, {
      params: {
        query: params.query,
        assetType: params.assetType,
        source: params.source,
        sourceAction: params.sourceAction,
        visibility: params.visibility,
        isGenerated: params.isGenerated,
        isFeatured: params.isFeatured,
        tags: params.tags,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        sortBy: params.sortBy ?? 'created_at',
        sortDescending: params.sortDescending ?? true,
      },
    });
    return response.data;
  },

  /**
   * Get featured assets for inspiration gallery
   * GET /api/Assets/featured
   */
  async getFeatured(params: {
    assetType?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PagedResult<Asset>> {
    const response = await api.get<PagedResult<Asset>>(`${ASSETS_BASE}/featured`, {
      params: {
        assetType: params.assetType,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Get current user's assets
   * GET /api/Assets/my
   */
  async getMyAssets(params: {
    assetType?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PagedResult<Asset>> {
    const response = await api.get<PagedResult<Asset>>(`${ASSETS_BASE}/my`, {
      params: {
        assetType: params.assetType,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Get single asset by ID
   * GET /api/Assets/{assetId}
   */
  async getById(assetId: string): Promise<Asset> {
    const response = await api.get<Asset>(`${ASSETS_BASE}/${assetId}`);
    return response.data;
  },

  /**
   * Find similar assets
   * GET /api/Assets/{assetId}/similar
   */
  async findSimilar(assetId: string, limit: number = 20): Promise<Asset[]> {
    const response = await api.get<Asset[]>(`${ASSETS_BASE}/${assetId}/similar`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Upload a new asset
   * POST /api/Assets/upload
   */
  async upload(params: AssetUploadParams): Promise<Asset> {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.title) formData.append('title', params.title);
    if (params.description) formData.append('description', params.description);
    if (params.tags) formData.append('tags', params.tags);
    if (params.visibility) formData.append('visibility', params.visibility);

    const response = await api.post<Asset>(`${ASSETS_BASE}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update asset metadata
   * PATCH /api/Assets/{assetId}
   */
  async update(assetId: string, params: AssetUpdateParams): Promise<Asset> {
    const response = await api.patch<Asset>(`${ASSETS_BASE}/${assetId}`, params);
    return response.data;
  },

  /**
   * Like an asset
   * POST /api/Assets/{assetId}/like
   */
  async like(assetId: string): Promise<{ liked: boolean }> {
    const response = await api.post<{ liked: boolean }>(`${ASSETS_BASE}/${assetId}/like`);
    return response.data;
  },

  /**
   * Unlike an asset
   * DELETE /api/Assets/{assetId}/like
   */
  async unlike(assetId: string): Promise<{ liked: boolean }> {
    const response = await api.delete<{ liked: boolean }>(`${ASSETS_BASE}/${assetId}/like`);
    return response.data;
  },

  /**
   * Toggle like on an asset
   */
  async toggleLike(assetId: string, currentlyLiked: boolean): Promise<{ liked: boolean }> {
    return currentlyLiked ? this.unlike(assetId) : this.like(assetId);
  },

  /**
   * Archive an asset (soft delete)
   * POST /api/Assets/{assetId}/archive
   */
  async archive(assetId: string): Promise<void> {
    await api.post(`${ASSETS_BASE}/${assetId}/archive`);
  },

  /**
   * Delete an asset permanently
   * DELETE /api/Assets/{assetId}
   */
  async delete(assetId: string): Promise<void> {
    await api.delete(`${ASSETS_BASE}/${assetId}`);
  },

  /**
   * Get download URL for asset
   * GET /api/Assets/{assetId}/download
   */
  async getDownloadUrl(assetId: string): Promise<{ url: string }> {
    const response = await api.get<{ url: string }>(`${ASSETS_BASE}/${assetId}/download`);
    return response.data;
  },
};

export default assetApiService;
