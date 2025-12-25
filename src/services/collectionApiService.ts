/**
 * Collection API Service
 * Client for the Collections API endpoints
 */

import api from './api';
import type {
  Asset,
  Collection,
  CollectionSearchParams,
  CreateCollectionParams,
  UpdateCollectionParams,
  AddAssetsToCollectionParams,
  PagedResult,
} from '@/models/assetSystem';

const COLLECTIONS_BASE = '/api/Collections';

// ============================================================================
// Collection API Service
// ============================================================================

export const collectionApiService = {
  /**
   * Get public collections
   * GET /api/Collections
   */
  async getPublic(params: CollectionSearchParams = {}): Promise<PagedResult<Collection>> {
    const response = await api.get<PagedResult<Collection>>(COLLECTIONS_BASE, {
      params: {
        collectionType: params.collectionType,
        featured: params.featured,
        query: params.query,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        sortBy: params.sortBy,
        sortDescending: params.sortDescending,
      },
    });
    return response.data;
  },

  /**
   * Get current user's collections
   * GET /api/Collections/my
   */
  async getMyCollections(params: { page?: number; pageSize?: number } = {}): Promise<PagedResult<Collection>> {
    const response = await api.get<PagedResult<Collection>>(`${COLLECTIONS_BASE}/my`, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 50,
      },
    });
    return response.data;
  },

  /**
   * Get user's favorites collection
   * GET /api/Collections/favorites
   */
  async getFavorites(): Promise<Collection> {
    const response = await api.get<Collection>(`${COLLECTIONS_BASE}/favorites`);
    return response.data;
  },

  /**
   * Create a new collection
   * POST /api/Collections
   */
  async create(params: CreateCollectionParams): Promise<Collection> {
    const response = await api.post<Collection>(COLLECTIONS_BASE, params);
    return response.data;
  },

  /**
   * Get collection by ID
   * GET /api/Collections/{collectionId}
   */
  async getById(collectionId: string): Promise<Collection> {
    const response = await api.get<Collection>(`${COLLECTIONS_BASE}/${collectionId}`);
    return response.data;
  },

  /**
   * Update collection
   * PATCH /api/Collections/{collectionId}
   */
  async update(collectionId: string, params: UpdateCollectionParams): Promise<Collection> {
    const response = await api.patch<Collection>(`${COLLECTIONS_BASE}/${collectionId}`, params);
    return response.data;
  },

  /**
   * Delete collection
   * DELETE /api/Collections/{collectionId}
   */
  async delete(collectionId: string): Promise<void> {
    await api.delete(`${COLLECTIONS_BASE}/${collectionId}`);
  },

  /**
   * Get assets in a collection
   * GET /api/Collections/{collectionId}/assets
   */
  async getAssets(
    collectionId: string,
    params: { page?: number; pageSize?: number } = {}
  ): Promise<PagedResult<Asset>> {
    const response = await api.get<PagedResult<Asset>>(`${COLLECTIONS_BASE}/${collectionId}/assets`, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    });
    return response.data;
  },

  /**
   * Add assets to collection
   * POST /api/Collections/{collectionId}/assets
   */
  async addAssets(collectionId: string, params: AddAssetsToCollectionParams): Promise<{ added: number }> {
    const response = await api.post<{ added: number }>(
      `${COLLECTIONS_BASE}/${collectionId}/assets`,
      params
    );
    return response.data;
  },

  /**
   * Remove asset from collection
   * DELETE /api/Collections/{collectionId}/assets/{assetId}
   */
  async removeAsset(collectionId: string, assetId: string): Promise<void> {
    await api.delete(`${COLLECTIONS_BASE}/${collectionId}/assets/${assetId}`);
  },

  /**
   * Reorder assets in collection
   * PUT /api/Collections/{collectionId}/assets/order
   */
  async reorderAssets(collectionId: string, assetIds: string[]): Promise<void> {
    await api.put(`${COLLECTIONS_BASE}/${collectionId}/assets/order`, { assetIds });
  },

  /**
   * Quick add to favorites
   * POST /api/Collections/favorites/add/{assetId}
   */
  async addToFavorites(assetId: string): Promise<{ added: boolean; collectionId: string }> {
    const response = await api.post<{ added: boolean; collectionId: string }>(
      `${COLLECTIONS_BASE}/favorites/add/${assetId}`
    );
    return response.data;
  },

  /**
   * Quick remove from favorites
   * DELETE /api/Collections/favorites/remove/{assetId}
   */
  async removeFromFavorites(assetId: string): Promise<void> {
    await api.delete(`${COLLECTIONS_BASE}/favorites/remove/${assetId}`);
  },

  /**
   * Get collections containing a specific asset
   * GET /api/Collections/containing/{assetId}
   */
  async getContainingAsset(assetId: string): Promise<Collection[]> {
    const response = await api.get<Collection[]>(`${COLLECTIONS_BASE}/containing/${assetId}`);
    return response.data;
  },
};

export default collectionApiService;
