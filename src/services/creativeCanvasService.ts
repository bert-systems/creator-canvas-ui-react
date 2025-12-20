/**
 * Creative Canvas Studio - API Service
 * Handles all API interactions for boards, cards, libraries, templates, and marketplace
 */

import { api } from './api';
import type {
  CanvasBoard,
  CanvasCard,
  CardGroup,
  AssetLibrary,
  CanvasAsset,
  MarketplaceListing,
  MarketplaceReview,
  CardTemplate,
  ApiResponse,
  CreateBoardRequest,
  UpdateBoardRequest,
  DuplicateBoardRequest,
  BoardListResponse,
  BoardExportResponse,
  CreateCardRequest,
  UpdateCardRequest,
  BatchUpdateRequest,
  ExecuteWorkflowRequest,
  ExecuteStageRequest,
  ExecuteJobResponse,
  JobStatusResponse,
  CreateGroupRequest,
  CreateLibraryRequest,
  UpdateLibraryRequest,
  AddAssetsRequest,
  RemoveAssetsRequest,
  LibraryListResponse,
  MarketplaceSearchParams,
  MarketplaceSearchResponse,
  PurchaseRequest,
  CreateReviewRequest,
  TemplateListResponse,
  CardCategory,
  WorkflowJobResponse,
  WorkflowStatusResponse,
} from '../models/creativeCanvas';

const API_BASE = '/api/creative-canvas';

// Helper to get user ID from auth context or localStorage
// IMPORTANT: Must return same fallback as nodeService.ts and edgeService.ts
const getUserId = (): string => {
  // Check multiple possible auth storage locations
  const authData = localStorage.getItem('authData');
  const userId = localStorage.getItem('userId');
  const userSession = localStorage.getItem('userSession');

  // Try authData first
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.userId || parsed.id) {
        return parsed.userId || parsed.id;
      }
    } catch {
      // Continue to fallbacks
    }
  }

  // Try direct userId
  if (userId) {
    return userId;
  }

  // Try userSession
  if (userSession) {
    try {
      const parsed = JSON.parse(userSession);
      if (parsed.userId || parsed.id) {
        return parsed.userId || parsed.id;
      }
    } catch {
      // Continue to fallback
    }
  }

  // Development fallback - must match nodeService.ts and edgeService.ts
  console.warn('[creativeCanvasService] No user ID found, using development fallback');
  return 'dev-user-1';
};

// Helper to create headers with X-User-Id
const getAuthHeaders = () => ({
  headers: {
    'X-User-Id': getUserId(),
  },
});

// ===== Board Operations =====

export const boardService = {
  async create(request: CreateBoardRequest): Promise<ApiResponse<CanvasBoard>> {
    const response = await api.post<ApiResponse<CanvasBoard>>(
      `${API_BASE}/boards`,
      {
        name: request.name,
        description: request.description,
        category: request.category,
        isPublic: request.isPublic ?? false,
        settings: request.settings || {
          gridEnabled: true,
          gridSize: 20,
          snapToGrid: true,
          backgroundColor: '#1a1a2e',
        },
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async list(params?: {
    page?: number;
    limit?: number;
    category?: CardCategory;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<BoardListResponse>> {
    const response = await api.get<ApiResponse<BoardListResponse>>(
      `${API_BASE}/boards`,
      {
        ...getAuthHeaders(),
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          category: params?.category,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }
    );
    return response.data;
  },

  async get(
    boardId: string,
    options?: { includeCards?: boolean; includeGroups?: boolean }
  ): Promise<ApiResponse<CanvasBoard>> {
    const response = await api.get<ApiResponse<CanvasBoard>>(
      `${API_BASE}/boards/${boardId}`,
      {
        ...getAuthHeaders(),
        params: {
          includeCards: options?.includeCards ?? true,
          includeGroups: options?.includeGroups ?? true,
        },
      }
    );
    return response.data;
  },

  async update(boardId: string, request: UpdateBoardRequest): Promise<ApiResponse<CanvasBoard>> {
    const response = await api.put<ApiResponse<CanvasBoard>>(
      `${API_BASE}/boards/${boardId}`,
      {
        name: request.name,
        description: request.description,
        isPublic: request.isPublic,
        settings: request.settings,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async delete(boardId: string, deleteAssets = false): Promise<ApiResponse<{ deleted: boolean; assetsDeleted: number }>> {
    const response = await api.delete<ApiResponse<{ deleted: boolean; assetsDeleted: number }>>(
      `${API_BASE}/boards/${boardId}`,
      {
        ...getAuthHeaders(),
        params: { deleteAssets },
      }
    );
    return response.data;
  },

  async duplicate(boardId: string, request: DuplicateBoardRequest): Promise<ApiResponse<CanvasBoard>> {
    const response = await api.post<ApiResponse<CanvasBoard>>(
      `${API_BASE}/boards/${boardId}/duplicate`,
      {
        name: request.name,
        includeAssets: request.includeAssets ?? false,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async export(
    boardId: string,
    options?: { format?: string; includeAssets?: boolean; quality?: string }
  ): Promise<ApiResponse<BoardExportResponse>> {
    const response = await api.get<ApiResponse<BoardExportResponse>>(
      `${API_BASE}/boards/${boardId}/export`,
      {
        ...getAuthHeaders(),
        params: {
          format: options?.format || 'json',
          includeAssets: options?.includeAssets ?? true,
          quality: options?.quality || 'high',
        },
      }
    );
    return response.data;
  },
};

// ===== Card Operations =====

export const cardService = {
  async create(boardId: string, request: CreateCardRequest): Promise<ApiResponse<CanvasCard>> {
    const response = await api.post<ApiResponse<CanvasCard>>(
      `${API_BASE}/boards/${boardId}/cards`,
      {
        type: request.type,
        templateId: request.templateId,
        position: request.position || { x: 100, y: 100 },
        dimensions: request.dimensions || { width: 320, height: 400 },
        config: {
          basePrompt: request.config?.basePrompt,
          style: request.config?.style,
          enhancementAgents: request.config?.enhancementAgents || ['fashion-prompt-enhancer'],
          generationParams: request.config?.generationParams || {
            model: 'flux-2-pro',
            width: 1024,
            height: 1024,
            numImages: 4,
          },
        },
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async get(cardId: string, options?: { includeAssets?: boolean; includeHistory?: boolean }): Promise<ApiResponse<CanvasCard>> {
    const response = await api.get<ApiResponse<CanvasCard>>(
      `${API_BASE}/cards/${cardId}`,
      {
        ...getAuthHeaders(),
        params: {
          includeAssets: options?.includeAssets ?? true,
          includeHistory: options?.includeHistory ?? false,
        },
      }
    );
    return response.data;
  },

  async update(cardId: string, request: UpdateCardRequest): Promise<ApiResponse<CanvasCard>> {
    const apiRequest: Record<string, unknown> = {};

    if (request.prompt !== undefined) {
      apiRequest.prompt = request.prompt;
      if (!apiRequest.config) {
        apiRequest.config = { basePrompt: request.prompt };
      }
    }

    if (request.position !== undefined) {
      apiRequest.position = request.position;
    }

    if (request.dimensions !== undefined) {
      apiRequest.dimensions = request.dimensions;
    }

    if (request.isExpanded !== undefined) {
      apiRequest.expanded = request.isExpanded;
    }

    if (request.config !== undefined) {
      apiRequest.config = {
        ...(apiRequest.config as Record<string, unknown> || {}),
        ...request.config,
        basePrompt: request.prompt ?? request.config.basePrompt,
      };
    }

    if (request.settings !== undefined) {
      apiRequest.settings = request.settings;
    }

    if (request.tags !== undefined) {
      apiRequest.tags = request.tags;
    }

    const response = await api.put<ApiResponse<CanvasCard>>(
      `${API_BASE}/cards/${cardId}`,
      apiRequest,
      getAuthHeaders()
    );
    return response.data;
  },

  async delete(cardId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
      `${API_BASE}/cards/${cardId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  async executeWorkflow(cardId: string, request?: ExecuteWorkflowRequest): Promise<ApiResponse<WorkflowJobResponse>> {
    const response = await api.post<ApiResponse<WorkflowJobResponse>>(
      `${API_BASE}/cards/${cardId}/execute`,
      request || {},
      getAuthHeaders()
    );
    return response.data;
  },

  async getWorkflowStatus(cardId: string): Promise<ApiResponse<WorkflowStatusResponse>> {
    const response = await api.get<ApiResponse<WorkflowStatusResponse>>(
      `${API_BASE}/cards/${cardId}/workflow/status`,
      getAuthHeaders()
    );
    return response.data;
  },

  async cancelWorkflow(cardId: string): Promise<ApiResponse<{ cancelled: boolean }>> {
    const response = await api.post<ApiResponse<{ cancelled: boolean }>>(
      `${API_BASE}/cards/${cardId}/workflow/cancel`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  async executeStage(
    cardId: string,
    stageId: string,
    request?: ExecuteStageRequest
  ): Promise<ApiResponse<ExecuteJobResponse>> {
    const response = await api.post<ApiResponse<ExecuteJobResponse>>(
      `${API_BASE}/cards/${cardId}/stages/${stageId}/execute`,
      request || {},
      getAuthHeaders()
    );
    return response.data;
  },

  async getJobStatus(jobId: string): Promise<ApiResponse<JobStatusResponse>> {
    const response = await api.get<ApiResponse<JobStatusResponse>>(
      `${API_BASE}/jobs/${jobId}/status`,
      getAuthHeaders()
    );
    return response.data;
  },

  async retryStage(cardId: string, stageId: string): Promise<ApiResponse<CanvasCard>> {
    const response = await api.post<ApiResponse<CanvasCard>>(
      `${API_BASE}/cards/${cardId}/stages/${stageId}/retry`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  async batchUpdate(boardId: string, request: BatchUpdateRequest): Promise<ApiResponse<{ updated: number }>> {
    const response = await api.patch<ApiResponse<{ updated: number }>>(
      `${API_BASE}/boards/${boardId}/cards/batch`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Group Operations =====

export const groupService = {
  async create(boardId: string, request: CreateGroupRequest): Promise<ApiResponse<CardGroup>> {
    const response = await api.post<ApiResponse<CardGroup>>(
      `${API_BASE}/boards/${boardId}/groups`,
      {
        name: request.name,
        color: request.color,
        cardIds: request.cardIds || [],
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async update(boardId: string, groupId: string, request: CreateGroupRequest): Promise<ApiResponse<CardGroup>> {
    const response = await api.put<ApiResponse<CardGroup>>(
      `${API_BASE}/boards/${boardId}/groups/${groupId}`,
      {
        name: request.name,
        color: request.color,
        cardIds: request.cardIds,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async delete(boardId: string, groupId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
      `${API_BASE}/boards/${boardId}/groups/${groupId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Template Operations =====

export interface TemplateCategory {
  id: string;
  name: string;
  subcategories: string[];
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: CardCategory;
  subcategory?: string;
  basePrompt: string;
  isPublic?: boolean;
  thumbnail?: string;
}

export const templateService = {
  async list(params?: {
    page?: number;
    limit?: number;
    category?: CardCategory;
  }): Promise<ApiResponse<TemplateListResponse>> {
    const response = await api.get<ApiResponse<TemplateListResponse>>(
      `${API_BASE}/templates`,
      {
        ...getAuthHeaders(),
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          category: params?.category,
        },
      }
    );
    return response.data;
  },

  async getCategories(): Promise<ApiResponse<TemplateCategory[]>> {
    const response = await api.get<ApiResponse<TemplateCategory[]>>(
      `${API_BASE}/templates/categories`
    );
    return response.data;
  },

  async getFeatured(params?: {
    category?: CardCategory;
    limit?: number;
  }): Promise<ApiResponse<TemplateListResponse>> {
    const response = await api.get<ApiResponse<TemplateListResponse>>(
      `${API_BASE}/templates/featured`,
      {
        params: {
          category: params?.category,
          limit: params?.limit || 5,
        },
      }
    );
    return response.data;
  },

  async get(templateId: string): Promise<ApiResponse<CardTemplate>> {
    const response = await api.get<ApiResponse<CardTemplate>>(
      `${API_BASE}/templates/${templateId}`
    );
    return response.data;
  },

  async create(request: CreateTemplateRequest): Promise<ApiResponse<CardTemplate>> {
    const response = await api.post<ApiResponse<CardTemplate>>(
      `${API_BASE}/templates`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Library Operations =====

export const libraryService = {
  async create(request: CreateLibraryRequest): Promise<ApiResponse<AssetLibrary>> {
    const response = await api.post<ApiResponse<AssetLibrary>>(
      `${API_BASE}/libraries`,
      {
        name: request.name,
        description: request.description,
        category: request.category,
        tags: request.tags || [],
        isPublic: request.isPublic ?? false,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async list(params?: {
    category?: CardCategory;
    isForSale?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<LibraryListResponse>> {
    const response = await api.get<ApiResponse<LibraryListResponse>>(
      `${API_BASE}/libraries`,
      {
        ...getAuthHeaders(),
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          category: params?.category,
          isForSale: params?.isForSale,
          search: params?.search,
        },
      }
    );
    return response.data;
  },

  async get(
    libraryId: string,
    options?: { includeAssets?: boolean; assetPage?: number; assetLimit?: number }
  ): Promise<ApiResponse<AssetLibrary>> {
    const response = await api.get<ApiResponse<AssetLibrary>>(
      `${API_BASE}/libraries/${libraryId}`,
      {
        ...getAuthHeaders(),
        params: {
          includeAssets: options?.includeAssets ?? true,
          assetPage: options?.assetPage || 1,
          assetLimit: options?.assetLimit || 50,
        },
      }
    );
    return response.data;
  },

  async update(libraryId: string, request: UpdateLibraryRequest): Promise<ApiResponse<AssetLibrary>> {
    const response = await api.put<ApiResponse<AssetLibrary>>(
      `${API_BASE}/libraries/${libraryId}`,
      {
        name: request.name,
        description: request.description,
        isPublic: request.isPublic,
        tags: request.tags,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  async delete(libraryId: string, deleteAssets = false): Promise<ApiResponse<{ deleted: boolean; assetsDeleted: number }>> {
    const response = await api.delete<ApiResponse<{ deleted: boolean; assetsDeleted: number }>>(
      `${API_BASE}/libraries/${libraryId}`,
      {
        ...getAuthHeaders(),
        params: { deleteAssets },
      }
    );
    return response.data;
  },

  async addAssets(libraryId: string, request: AddAssetsRequest): Promise<ApiResponse<{ added: number; assets: CanvasAsset[] }>> {
    const response = await api.post<ApiResponse<{ added: number; assets: CanvasAsset[] }>>(
      `${API_BASE}/libraries/${libraryId}/assets`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  async removeAssets(libraryId: string, request: RemoveAssetsRequest): Promise<ApiResponse<{ removed: number }>> {
    const response = await api.delete<ApiResponse<{ removed: number }>>(
      `${API_BASE}/libraries/${libraryId}/assets`,
      {
        ...getAuthHeaders(),
        data: request,
      }
    );
    return response.data;
  },

  async uploadAsset(
    libraryId: string,
    file: File,
    metadata: { name: string; type: string; tags?: string[]; folder?: string }
  ): Promise<ApiResponse<CanvasAsset>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name);
    formData.append('type', metadata.type);
    if (metadata.tags) {
      metadata.tags.forEach(tag => formData.append('tags', tag));
    }
    if (metadata.folder) {
      formData.append('folder', metadata.folder);
    }

    const response = await api.post<ApiResponse<CanvasAsset>>(
      `${API_BASE}/libraries/${libraryId}/assets/upload`,
      formData,
      {
        headers: {
          'X-User-Id': getUserId(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

// ===== Asset Operations =====

export const assetService = {
  async get(assetId: string): Promise<ApiResponse<CanvasAsset>> {
    const response = await api.get<ApiResponse<CanvasAsset>>(
      `${API_BASE}/assets/${assetId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  async delete(assetId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
      `${API_BASE}/assets/${assetId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Marketplace Operations =====

export interface MarketplaceBrowseResponse {
  listings: MarketplaceListing[];
  filters: {
    categories: string[];
    priceRanges: Array<{ min: number; max: number; label: string }>;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const marketplaceService = {
  async browse(params?: {
    category?: CardCategory;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }): Promise<ApiResponse<MarketplaceBrowseResponse>> {
    const response = await api.get<ApiResponse<MarketplaceBrowseResponse>>(
      `${API_BASE}/marketplace/browse`,
      {
        params: {
          category: params?.category,
          page: params?.page || 1,
          limit: params?.limit || 20,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          sortBy: params?.sortBy,
        },
      }
    );
    return response.data;
  },

  async search(params?: MarketplaceSearchParams): Promise<ApiResponse<MarketplaceSearchResponse>> {
    const response = await api.get<ApiResponse<MarketplaceSearchResponse>>(
      `${API_BASE}/marketplace/search`,
      {
        params: {
          q: params?.search,
          category: params?.category,
          itemType: params?.itemType,
          minPrice: params?.minPrice,
          maxPrice: params?.maxPrice,
          minRating: params?.minRating,
          sortBy: params?.sortBy,
          tags: params?.tags?.join(','),
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }
    );
    return response.data;
  },

  async getListing(listingId: string): Promise<ApiResponse<MarketplaceListing>> {
    const response = await api.get<ApiResponse<MarketplaceListing>>(
      `${API_BASE}/marketplace/listings/${listingId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  async getReviews(
    libraryId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<{ reviews: MarketplaceReview[]; total: number }>> {
    const response = await api.get<ApiResponse<{ reviews: MarketplaceReview[]; total: number }>>(
      `${API_BASE}/marketplace/listings/${libraryId}/reviews`,
      {
        ...getAuthHeaders(),
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
        },
      }
    );
    return response.data;
  },

  async purchase(request: PurchaseRequest): Promise<ApiResponse<{ success: boolean; purchaseId: string }>> {
    const response = await api.post<ApiResponse<{ success: boolean; purchaseId: string }>>(
      `${API_BASE}/marketplace/purchase`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  async createReview(libraryId: string, request: CreateReviewRequest): Promise<ApiResponse<MarketplaceReview>> {
    const response = await api.post<ApiResponse<MarketplaceReview>>(
      `${API_BASE}/marketplace/listings/${libraryId}/reviews`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Analytics Operations =====

export const analyticsService = {
  async getUserAnalytics(): Promise<ApiResponse<{
    boardCount: number;
    cardCount: number;
    assetCount: number;
    generationsThisMonth: number;
    storageUsedBytes: number;
  }>> {
    const response = await api.get<ApiResponse<{
      boardCount: number;
      cardCount: number;
      assetCount: number;
      generationsThisMonth: number;
      storageUsedBytes: number;
    }>>(
      `${API_BASE}/analytics/user`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Export default service object =====
const creativeCanvasService = {
  boards: boardService,
  cards: cardService,
  groups: groupService,
  templates: templateService,
  libraries: libraryService,
  assets: assetService,
  marketplace: marketplaceService,
  analytics: analyticsService,
};

export default creativeCanvasService;
