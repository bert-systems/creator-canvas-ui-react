/**
 * Generation API Service
 * Client for the Generations API endpoints (history & usage tracking)
 */

import api from './api';
import type {
  Generation,
  GenerationSearchParams,
  UsageStatistics,
  UsageBySource,
  UsageByModel,
  CostSummary,
  UsageQueryParams,
  PagedResult,
} from '@/models/assetSystem';

const GENERATIONS_BASE = '/api/Generations';

// ============================================================================
// Generation API Service
// ============================================================================

export const generationApiService = {
  /**
   * Get generation history with filters
   * GET /api/Generations
   */
  async getHistory(params: GenerationSearchParams = {}): Promise<PagedResult<Generation>> {
    const response = await api.get<PagedResult<Generation>>(GENERATIONS_BASE, {
      params: {
        source: params.source,
        sourceAction: params.sourceAction,
        provider: params.provider,
        model: params.model,
        generationType: params.generationType,
        status: params.status,
        fromDate: params.fromDate,
        toDate: params.toDate,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        sortBy: params.sortBy ?? 'created_at',
        sortDescending: params.sortDescending ?? true,
      },
    });
    return response.data;
  },

  /**
   * Get single generation by ID
   * GET /api/Generations/{generationId}
   */
  async getById(generationId: string): Promise<Generation> {
    const response = await api.get<Generation>(`${GENERATIONS_BASE}/${generationId}`);
    return response.data;
  },

  /**
   * Get usage statistics
   * GET /api/Generations/usage
   */
  async getUsageStatistics(params: UsageQueryParams = {}): Promise<UsageStatistics> {
    const response = await api.get<UsageStatistics>(`${GENERATIONS_BASE}/usage`, {
      params: {
        period: params.period ?? 'month',
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
    return response.data;
  },

  /**
   * Get usage breakdown by source
   * GET /api/Generations/usage/by-source
   */
  async getUsageBySource(params: UsageQueryParams = {}): Promise<UsageBySource[]> {
    const response = await api.get<UsageBySource[]>(`${GENERATIONS_BASE}/usage/by-source`, {
      params: {
        period: params.period ?? 'month',
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
    return response.data;
  },

  /**
   * Get usage breakdown by model
   * GET /api/Generations/usage/by-model
   */
  async getUsageByModel(params: UsageQueryParams = {}): Promise<UsageByModel[]> {
    const response = await api.get<UsageByModel[]>(`${GENERATIONS_BASE}/usage/by-model`, {
      params: {
        period: params.period ?? 'month',
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
    return response.data;
  },

  /**
   * Get cost summary
   * GET /api/Generations/usage/cost
   */
  async getCostSummary(params: UsageQueryParams = {}): Promise<CostSummary> {
    const response = await api.get<CostSummary>(`${GENERATIONS_BASE}/usage/cost`, {
      params: {
        period: params.period ?? 'month',
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
    return response.data;
  },
};

export default generationApiService;
