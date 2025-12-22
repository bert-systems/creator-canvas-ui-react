/**
 * Node Service - Unified Node System API
 *
 * Handles all node CRUD operations for the Unified Node System (v3.1).
 * Replaces the legacy Card-based persistence with full typed port support.
 *
 * @see architectureDesign.md - "Unified Node System Architecture"
 */

import { api } from './api';

// ============================================================================
// Types - Aligned with backend CanvasNode schema
// ============================================================================

export interface NodePort {
  id: string;
  name: string;
  type: string;        // PortType: 'image' | 'video' | 'text' | 'garment' | etc.
  required: boolean;
  multi: boolean;      // Accepts multiple connections
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export interface NodeExecution {
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface AgentBinding {
  agentType: string;
  endpoint: string;
  config?: Record<string, unknown>;
}

export interface CanvasNode {
  id: string;
  boardId: string;
  nodeType: string;
  category: string;
  label: string;
  position: NodePosition;
  dimensions: NodeDimensions;
  inputs: NodePort[];
  outputs: NodePort[];
  parameters: Record<string, unknown>;
  status: 'idle' | 'running' | 'completed' | 'error';
  lastExecution?: NodeExecution;
  agentBinding?: AgentBinding;
  cachedOutput?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNodeRequest {
  nodeType: string;
  templateId?: string;
  label?: string;
  category?: string;
  position: NodePosition;
  dimensions?: NodeDimensions;
  inputs?: NodePort[];
  outputs?: NodePort[];
  parameters?: Record<string, unknown>;
  agentBinding?: AgentBinding;
}

export interface UpdateNodeRequest {
  label?: string;
  position?: NodePosition;
  dimensions?: NodeDimensions;
  parameters?: Record<string, unknown>;
  status?: 'idle' | 'running' | 'completed' | 'error';
  agentBinding?: AgentBinding;
  cachedOutput?: Record<string, unknown>;
}

export interface NodePositionUpdate {
  nodeId: string;
  position?: NodePosition;
  dimensions?: NodeDimensions;
}

export interface BatchUpdateNodesRequest {
  updates: NodePositionUpdate[];
}

// Frontend interface (for callers)
export interface ExecuteNodeRequest {
  inputData?: Record<string, unknown>;
  overrideParameters?: Record<string, unknown>;
}

// Backend API expects these property names
interface ExecuteNodeApiRequest {
  inputs?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
}

// API Response types - matches backend response structure
// Backend returns { success, node/nodes/edge/edges, error } directly (no data wrapper)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;  // Legacy - some endpoints may use this
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  } | string | null;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Direct response types (how backend actually returns data)
export interface NodeResponse {
  success: boolean;
  node?: CanvasNode;
  error?: string | null;
}

export interface NodesListResponse {
  success: boolean;
  nodes?: CanvasNode[];
  totalCount?: number;
  error?: string | null;
}

export interface BatchUpdateResponse {
  processed: number;
  succeeded: number;
  failed: number;
  results?: Array<{
    nodeId: string;
    success: boolean;
    error?: string;
  }>;
}

// Image can be a URL string or an object with url property (from various APIs)
export type ImageOutput = string | { url?: string; width?: number; height?: number; contentType?: string };

export interface ExecuteNodeResponse {
  success: boolean;
  nodeId?: string;
  jobId?: string;
  status?: 'running' | 'completed' | 'error' | 'pending';
  output?: {
    // Text-based outputs (prompt enhancement, story generation, etc.)
    enhancedPrompt?: string;
    text?: string;
    result?: unknown;
    originalText?: string;
    outputType?: 'image' | 'video' | 'text' | 'audio';
    // Image outputs - can be strings or objects with url property
    imageUrl?: string;
    images?: ImageOutput[];
    // Video outputs
    videoUrl?: string;
    video?: string;
    // Generic
    success?: boolean;
    errors?: string[] | null;
    [key: string]: unknown;
  };
  execution?: {
    startedAt?: string;
    completedAt?: string;
    durationMs?: number;
    error?: string | null;
  };
  error?: string | null;
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
  // In production, this should trigger an auth flow
  console.warn('[nodeService] No user ID found, using development fallback');
  return 'dev-user-1';
};

const getAuthHeaders = () => ({
  headers: {
    'X-User-Id': getUserId(),
  },
});

// ============================================================================
// Node Service
// ============================================================================

export const nodeService = {
  /**
   * Create a new node on a board
   * POST /api/creative-canvas/boards/{boardId}/nodes
   * Backend returns: { success, node, error } directly
   */
  async create(boardId: string, request: CreateNodeRequest): Promise<NodeResponse> {
    const response = await api.post<NodeResponse>(
      `${API_BASE}/boards/${boardId}/nodes`,
      {
        nodeType: request.nodeType,
        templateId: request.templateId,
        label: request.label,
        category: request.category,
        position: request.position,
        dimensions: request.dimensions || { width: 320, height: 400 },
        inputs: request.inputs || [],
        outputs: request.outputs || [],
        parameters: request.parameters || {},
        agentBinding: request.agentBinding,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * List all nodes on a board
   * GET /api/creative-canvas/boards/{boardId}/nodes
   * Backend returns: { success, nodes, totalCount, error } directly
   */
  async list(boardId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<NodesListResponse> {
    const response = await api.get<NodesListResponse>(
      `${API_BASE}/boards/${boardId}/nodes`,
      {
        ...getAuthHeaders(),
        params: {
          page: params?.page || 1,
          limit: params?.limit || 100,
          category: params?.category,
        },
      }
    );
    return response.data;
  },

  /**
   * Get a specific node by ID
   * GET /api/creative-canvas/nodes/{nodeId}
   * Backend returns: { success, node, error } directly
   */
  async get(nodeId: string): Promise<NodeResponse> {
    const response = await api.get<NodeResponse>(
      `${API_BASE}/nodes/${nodeId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Update a node
   * PUT /api/creative-canvas/nodes/{nodeId}
   * Backend returns: { success, node, error } directly
   */
  async update(nodeId: string, request: UpdateNodeRequest): Promise<NodeResponse> {
    const response = await api.put<NodeResponse>(
      `${API_BASE}/nodes/${nodeId}`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Delete a node
   * DELETE /api/creative-canvas/nodes/{nodeId}
   * Backend returns: { success, deleted, error } directly
   */
  async delete(nodeId: string): Promise<{ success: boolean; deleted?: boolean; error?: string | null }> {
    const response = await api.delete<{ success: boolean; deleted?: boolean; error?: string | null }>(
      `${API_BASE}/nodes/${nodeId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Batch update node positions/dimensions
   * PATCH /api/creative-canvas/boards/{boardId}/nodes/batch
   */
  async batchUpdate(boardId: string, request: BatchUpdateNodesRequest): Promise<BatchUpdateResponse> {
    const response = await api.patch<BatchUpdateResponse>(
      `${API_BASE}/boards/${boardId}/nodes/batch`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Execute a node
   * POST /api/creative-canvas/nodes/{nodeId}/execute
   *
   * Note: Frontend uses inputData/overrideParameters, but backend expects inputs/parameters
   */
  async execute(nodeId: string, request?: ExecuteNodeRequest): Promise<ExecuteNodeResponse> {
    // Transform frontend property names to backend expected names
    const apiRequest: ExecuteNodeApiRequest = {
      inputs: request?.inputData,
      parameters: request?.overrideParameters,
    };

    console.log('[nodeService.execute] Sending to API:', {
      nodeId,
      apiRequest,
      originalRequest: request,
    });

    const response = await api.post<ExecuteNodeResponse>(
      `${API_BASE}/nodes/${nodeId}/execute`,
      apiRequest,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Reset a node's execution state
   * POST /api/creative-canvas/nodes/{nodeId}/reset
   */
  async reset(nodeId: string): Promise<NodeResponse> {
    const response = await api.post<NodeResponse>(
      `${API_BASE}/nodes/${nodeId}/reset`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },
};

// ============================================================================
// Node Template Service
// ============================================================================

export interface CanvasNodeTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  defaultInputs?: NodePort[];
  defaultOutputs?: NodePort[];
  parameterSchema?: Record<string, unknown>;
  agentBindingTemplate?: AgentBinding;
  defaultDimensions?: NodeDimensions;
  isSystem: boolean;
  createdAt: string;
}

export interface NodeTemplatesResponse {
  success: boolean;
  templates?: CanvasNodeTemplate[];
  error?: string;
}

export const nodeTemplateService = {
  /**
   * List all node templates
   * GET /api/creative-canvas/node-templates
   */
  async list(): Promise<ApiResponse<NodeTemplatesResponse>> {
    const response = await api.get<ApiResponse<NodeTemplatesResponse>>(
      `${API_BASE}/node-templates`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get a specific node template
   * GET /api/creative-canvas/node-templates/{templateId}
   */
  async get(templateId: string): Promise<ApiResponse<{ template: CanvasNodeTemplate }>> {
    const response = await api.get<ApiResponse<{ template: CanvasNodeTemplate }>>(
      `${API_BASE}/node-templates/${templateId}`,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ============================================================================
// Port Type Service
// ============================================================================

export interface PortTypeInfo {
  type: string;
  name: string;
  color: string;
  description?: string;
  compatibleWith: string[];
}

export const portTypeService = {
  /**
   * List all port types
   * GET /api/creative-canvas/port-types
   */
  async list(): Promise<ApiResponse<{ portTypes: PortTypeInfo[] }>> {
    const response = await api.get<ApiResponse<{ portTypes: PortTypeInfo[] }>>(
      `${API_BASE}/port-types`
    );
    return response.data;
  },

  /**
   * Check if two port types are compatible
   * GET /api/creative-canvas/port-types/compatible
   */
  async checkCompatibility(sourceType: string, targetType: string): Promise<ApiResponse<{ compatible: boolean }>> {
    const response = await api.get<ApiResponse<{ compatible: boolean }>>(
      `${API_BASE}/port-types/compatible`,
      {
        params: { sourceType, targetType },
      }
    );
    return response.data;
  },
};

// ============================================================================
// Utility: Convert API Node to React Flow Node
// ============================================================================

import type { Node as FlowNode } from '@xyflow/react';

export interface FlowNodeData extends Record<string, unknown> {
  nodeType: string;
  category: string;
  label: string;
  inputs: NodePort[];
  outputs: NodePort[];
  parameters: Record<string, unknown>;
  status: string;
  lastExecution?: NodeExecution;
  agentBinding?: AgentBinding;
  cachedOutput?: Record<string, unknown>;
}

/**
 * Convert backend CanvasNode to React Flow Node format
 */
export function apiNodeToFlowNode(apiNode: CanvasNode): FlowNode<FlowNodeData> {
  return {
    id: apiNode.id,
    type: apiNode.nodeType,  // Use nodeType for component routing
    position: apiNode.position,
    data: {
      nodeType: apiNode.nodeType,
      category: apiNode.category,
      label: apiNode.label,
      inputs: apiNode.inputs,
      outputs: apiNode.outputs,
      parameters: apiNode.parameters,
      status: apiNode.status,
      lastExecution: apiNode.lastExecution,
      agentBinding: apiNode.agentBinding,
      cachedOutput: apiNode.cachedOutput,
    },
    width: apiNode.dimensions?.width,
    height: apiNode.dimensions?.height,
  };
}

/**
 * Convert React Flow Node to backend CreateNodeRequest format
 */
export function flowNodeToCreateRequest(
  flowNode: FlowNode<FlowNodeData>
): CreateNodeRequest {
  return {
    nodeType: flowNode.data.nodeType,
    label: flowNode.data.label,
    category: flowNode.data.category,
    position: flowNode.position,
    dimensions: {
      width: flowNode.width || 320,
      height: flowNode.height || 400,
    },
    inputs: flowNode.data.inputs,
    outputs: flowNode.data.outputs,
    parameters: flowNode.data.parameters,
    agentBinding: flowNode.data.agentBinding,
  };
}

export default nodeService;
