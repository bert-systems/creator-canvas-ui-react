/**
 * Edge Service - Unified Node System API
 *
 * Handles all edge (connection) CRUD operations for the Unified Node System (v3.1).
 * Supports port-level connections with typed source/target ports.
 *
 * @see architectureDesign.md - "Unified Node System Architecture"
 */

import { api } from './api';
import type { ApiResponse } from './nodeService';

// ============================================================================
// Types - Aligned with backend CanvasEdge schema
// ============================================================================

export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  animated?: boolean;
  labelBgStyle?: Record<string, unknown>;
}

export interface CanvasEdge {
  id: string;
  boardId: string;
  sourceNodeId: string;
  sourcePortId?: string;
  targetNodeId: string;
  targetPortId?: string;
  edgeType?: string;
  label?: string;
  style?: EdgeStyle;
  createdAt: string;
}

export interface CreateEdgeRequest {
  sourceNodeId: string;
  sourcePortId?: string;
  targetNodeId: string;
  targetPortId?: string;
  edgeType?: string;
  label?: string;
  style?: EdgeStyle;
}

export interface UpdateEdgeRequest {
  label?: string;
  edgeType?: string;
  style?: EdgeStyle;
}

// API Response types
export interface EdgeResponse {
  success: boolean;
  edge?: CanvasEdge;
  error?: string;
}

export interface EdgesListResponse {
  success: boolean;
  edges?: CanvasEdge[];
  totalCount?: number;
  error?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const API_BASE = '/api/creative-canvas';

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

  // Development fallback - use a consistent dev user ID
  return 'dev-user-1';
};

const getAuthHeaders = () => ({
  headers: {
    'X-User-Id': getUserId(),
  },
});

// ============================================================================
// Edge Service
// ============================================================================

export const edgeService = {
  /**
   * Create a new edge (connection) between nodes
   * POST /api/creative-canvas/boards/{boardId}/edges
   * Backend returns: { success, edge, error } directly
   */
  async create(boardId: string, request: CreateEdgeRequest): Promise<EdgeResponse> {
    const response = await api.post<EdgeResponse>(
      `${API_BASE}/boards/${boardId}/edges`,
      {
        sourceNodeId: request.sourceNodeId,
        sourcePortId: request.sourcePortId,
        targetNodeId: request.targetNodeId,
        targetPortId: request.targetPortId,
        edgeType: request.edgeType,
        label: request.label,
        style: request.style,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * List all edges on a board
   * GET /api/creative-canvas/boards/{boardId}/edges
   * Backend returns: { success, edges, totalCount, error } directly
   */
  async list(boardId: string, params?: {
    nodeId?: string;
    page?: number;
    limit?: number;
  }): Promise<EdgesListResponse> {
    const response = await api.get<EdgesListResponse>(
      `${API_BASE}/boards/${boardId}/edges`,
      {
        ...getAuthHeaders(),
        params: {
          nodeId: params?.nodeId,
          page: params?.page || 1,
          limit: params?.limit || 500,
        },
      }
    );
    return response.data;
  },

  /**
   * Update an edge
   * PUT /api/creative-canvas/edges/{edgeId}
   */
  async update(edgeId: string, request: UpdateEdgeRequest): Promise<ApiResponse<EdgeResponse>> {
    const response = await api.put<ApiResponse<EdgeResponse>>(
      `${API_BASE}/edges/${edgeId}`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Delete an edge
   * DELETE /api/creative-canvas/edges/{edgeId}
   */
  async delete(edgeId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const response = await api.delete<ApiResponse<{ deleted: boolean }>>(
      `${API_BASE}/edges/${edgeId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ============================================================================
// Utility: Convert API Edge to React Flow Edge
// ============================================================================

import type { Edge as FlowEdge } from '@xyflow/react';

/**
 * Convert backend CanvasEdge to React Flow Edge format
 */
export function apiEdgeToFlowEdge(apiEdge: CanvasEdge): FlowEdge {
  return {
    id: apiEdge.id,
    source: apiEdge.sourceNodeId,
    sourceHandle: apiEdge.sourcePortId || undefined,
    target: apiEdge.targetNodeId,
    targetHandle: apiEdge.targetPortId || undefined,
    type: apiEdge.edgeType || 'default',
    label: apiEdge.label,
    style: apiEdge.style ? {
      stroke: apiEdge.style.stroke,
      strokeWidth: apiEdge.style.strokeWidth,
    } : undefined,
    animated: apiEdge.style?.animated || false,
  };
}

/**
 * Convert React Flow Edge to backend CreateEdgeRequest format
 */
export function flowEdgeToCreateRequest(flowEdge: FlowEdge): CreateEdgeRequest {
  return {
    sourceNodeId: flowEdge.source,
    sourcePortId: flowEdge.sourceHandle || undefined,
    targetNodeId: flowEdge.target,
    targetPortId: flowEdge.targetHandle || undefined,
    edgeType: flowEdge.type,
    label: typeof flowEdge.label === 'string' ? flowEdge.label : undefined,
    style: flowEdge.style ? {
      stroke: flowEdge.style.stroke as string | undefined,
      strokeWidth: flowEdge.style.strokeWidth as number | undefined,
      animated: flowEdge.animated,
    } : undefined,
  };
}

/**
 * Determine edge type based on source/target port types
 */
export function determineEdgeType(
  sourcePortType?: string,
  targetPortType?: string
): string {
  // Style-related connections get special styling
  if (sourcePortType === 'style' || targetPortType === 'style' ||
      sourcePortType === 'styleDna' || targetPortType === 'styleDna') {
    return 'styleEdge';
  }

  // Character/face connections
  if (sourcePortType === 'character' || targetPortType === 'character' ||
      sourcePortType === 'face' || targetPortType === 'face') {
    return 'characterEdge';
  }

  // Video connections get animated edge
  if (sourcePortType === 'video' || targetPortType === 'video') {
    return 'flowingEdge';
  }

  // Image connections
  if (sourcePortType === 'image' || targetPortType === 'image') {
    return 'standardEdge';
  }

  // Default
  return 'default';
}

export default edgeService;
