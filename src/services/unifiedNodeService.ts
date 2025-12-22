/**
 * Unified Node Service
 *
 * API service for CRUD operations on unified nodes.
 * Uses new API endpoints from Swagger v4.
 *
 * @module unifiedNodeService
 */

import api from './api';
import type {
  UnifiedNodeData,
  UnifiedPort,
  DisplayMode,
  NodeOutput,
} from '../models/unifiedNode';
import type { NodeType, NodeCategory } from '../models/canvas';

// ============================================================================
// TYPES
// ============================================================================

interface CreateNodeRequest {
  nodeType: NodeType;
  category: NodeCategory;
  label: string;
  displayMode?: DisplayMode;
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  inputs?: UnifiedPort[];
  outputs?: UnifiedPort[];
  parameters?: Record<string, unknown>;
  aiModel?: string;
}

// The actual graph data structure
interface FullGraphData {
  board?: {
    id: string;
    name: string;
    category: string;
    viewportState?: { x: number; y: number; zoom: number };
  };
  nodes?: UnifiedNodeData[];
  edges?: {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
    edgeType?: string;
  }[];
  toolbar?: {
    category: string;
    actions: {
      id: string;
      label: string;
      icon?: string;
      action?: string;
      nodeType?: string;
    }[];
  };
  stats?: {
    nodeCount: number;
    edgeCount: number;
    executedCount: number;
    pendingCount: number;
    runningCount: number;
    errorCount: number;
  };
}

// API response wrapper with nested data
interface FullGraphApiResponse {
  success: boolean;
  message?: string | null;
  data?: FullGraphData;
  error?: string;
}

// What we return to consumers (unwrapped)
interface FullGraphResponse extends FullGraphData {
  success: boolean;
  error?: string;
}

interface UpdateNodeRequest {
  label?: string;
  displayMode?: DisplayMode;
  position?: { x: number; y: number };
  dimensions?: { width: number; height: number };
  parameters?: Record<string, unknown>;
  status?: string;
  cachedOutput?: NodeOutput;
  aiModel?: string;
  isLocked?: boolean;
  isFavorite?: boolean;
}

interface BatchUpdateRequest {
  updates: {
    nodeId: string;
    position?: { x: number; y: number };
    dimensions?: { width: number; height: number };
  }[];
}

interface NodeResponse {
  success: boolean;
  node?: UnifiedNodeData;
  error?: string;
}

interface NodesListResponse {
  success: boolean;
  nodes?: UnifiedNodeData[];
  count?: number;
  error?: string;
}

interface DisplayModeResponse {
  success: boolean;
  displayMode?: DisplayMode;
  error?: string;
}

// ============================================================================
// FULL GRAPH (Board + Nodes + Edges + Toolbar)
// ============================================================================

/**
 * Get the full graph for a board including nodes, edges, and toolbar
 *
 * API returns: { success, message, data: { nodes, edges, board, toolbar, stats } }
 * We unwrap and return: { success, nodes, edges, board, toolbar, stats }
 */
export async function getFullGraph(
  boardId: string
): Promise<FullGraphResponse> {
  try {
    const response = await api.get<FullGraphApiResponse>(
      `/api/creative-canvas/boards/${boardId}/full-graph`
    );

    if (response.data.success && response.data.data) {
      // Unwrap the nested data structure
      return {
        success: true,
        ...response.data.data,
      };
    }

    throw new Error(response.data.error || 'Failed to get full graph');
  } catch (error) {
    console.error('[unifiedNodeService] Failed to get full graph:', error);
    throw error;
  }
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new node on a board
 */
export async function createNode(
  boardId: string,
  request: CreateNodeRequest
): Promise<UnifiedNodeData> {
  try {
    const response = await api.post<NodeResponse>(
      `/api/creative-canvas/boards/${boardId}/nodes`,
      request
    );

    if (response.data.success && response.data.node) {
      return response.data.node;
    }

    throw new Error(response.data.error || 'Failed to create node');
  } catch (error) {
    console.error('[unifiedNodeService] Failed to create node:', error);
    throw error;
  }
}

/**
 * Get all nodes for a board
 */
export async function getNodes(
  boardId: string,
  options?: {
    category?: NodeCategory;
    status?: string;
    includeOutput?: boolean;
  }
): Promise<UnifiedNodeData[]> {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.status) params.append('status', options.status);
    if (options?.includeOutput) params.append('includeOutput', 'true');

    const url = `/api/creative-canvas/boards/${boardId}/nodes${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get<NodesListResponse>(url);

    if (response.data.success && response.data.nodes) {
      return response.data.nodes;
    }

    throw new Error(response.data.error || 'Failed to get nodes');
  } catch (error) {
    console.error('[unifiedNodeService] Failed to get nodes:', error);
    throw error;
  }
}

/**
 * Get a single node by ID
 */
export async function getNode(
  nodeId: string,
  options?: {
    includeOutput?: boolean;
    includeVariations?: boolean;
  }
): Promise<UnifiedNodeData> {
  try {
    const params = new URLSearchParams();
    if (options?.includeOutput) params.append('includeOutput', 'true');
    if (options?.includeVariations) params.append('includeVariations', 'true');

    const url = `/api/creative-canvas/nodes/${nodeId}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get<NodeResponse>(url);

    if (response.data.success && response.data.node) {
      return response.data.node;
    }

    throw new Error(response.data.error || 'Failed to get node');
  } catch (error) {
    console.error('[unifiedNodeService] Failed to get node:', error);
    throw error;
  }
}

/**
 * Update a node
 */
export async function updateNode(
  nodeId: string,
  request: UpdateNodeRequest
): Promise<UnifiedNodeData> {
  try {
    const response = await api.put<NodeResponse>(
      `/api/creative-canvas/nodes/${nodeId}`,
      request
    );

    if (response.data.success && response.data.node) {
      return response.data.node;
    }

    throw new Error(response.data.error || 'Failed to update node');
  } catch (error) {
    console.error('[unifiedNodeService] Failed to update node:', error);
    throw error;
  }
}

/**
 * Delete a node
 */
export async function deleteNode(
  nodeId: string,
  deleteConnections: boolean = true
): Promise<void> {
  try {
    const params = new URLSearchParams();
    if (deleteConnections) params.append('deleteConnections', 'true');

    const url = `/api/creative-canvas/nodes/${nodeId}${params.toString() ? '?' + params.toString() : ''}`;
    await api.delete(url);
  } catch (error) {
    console.error('[unifiedNodeService] Failed to delete node:', error);
    throw error;
  }
}

/**
 * Batch update node positions/dimensions
 */
export async function batchUpdateNodes(
  boardId: string,
  updates: BatchUpdateRequest['updates']
): Promise<void> {
  try {
    await api.patch(
      `/api/creative-canvas/boards/${boardId}/nodes/batch`,
      { updates }
    );
  } catch (error) {
    console.error('[unifiedNodeService] Failed to batch update nodes:', error);
    throw error;
  }
}

// ============================================================================
// DISPLAY MODE
// ============================================================================

/**
 * Update node display mode
 */
export async function updateDisplayMode(
  nodeId: string,
  displayMode: DisplayMode
): Promise<DisplayMode> {
  try {
    const response = await api.put<DisplayModeResponse>(
      `/api/creative-canvas/nodes/${nodeId}/display-mode`,
      { displayMode }
    );

    if (response.data.success && response.data.displayMode) {
      return response.data.displayMode;
    }

    throw new Error(response.data.error || 'Failed to update display mode');
  } catch (error) {
    console.error('[unifiedNodeService] Failed to update display mode:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert API node to React Flow node format
 */
export function toReactFlowNode(node: UnifiedNodeData): {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: UnifiedNodeData;
} {
  return {
    id: node.id,
    type: 'unifiedNode',
    position: (node as any).position || { x: 0, y: 0 },
    data: node,
  };
}

/**
 * Convert multiple API nodes to React Flow format
 */
export function toReactFlowNodes(nodes: UnifiedNodeData[]): {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: UnifiedNodeData;
}[] {
  return nodes.map(toReactFlowNode);
}

/**
 * Create a node data object from a node definition
 */
export function createNodeData(
  nodeType: NodeType,
  category: NodeCategory,
  label: string,
  definition?: {
    inputs?: UnifiedPort[];
    outputs?: UnifiedPort[];
    parameters?: { id: string; default?: unknown }[];
    aiModel?: string;
  }
): Omit<UnifiedNodeData, 'id'> {
  return {
    nodeType,
    category,
    label,
    displayMode: 'standard',
    inputs: definition?.inputs || [],
    outputs: definition?.outputs || [],
    parameters: definition?.parameters?.reduce((acc, p) => {
      if (p.default !== undefined) acc[p.id] = p.default;
      return acc;
    }, {} as Record<string, unknown>) || {},
    status: 'idle',
    aiModel: definition?.aiModel,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const unifiedNodeService = {
  // Full graph
  getFullGraph,
  // CRUD
  createNode,
  getNodes,
  getNode,
  updateNode,
  deleteNode,
  batchUpdateNodes,
  // Display mode
  updateDisplayMode,
  // Helpers
  toReactFlowNode,
  toReactFlowNodes,
  createNodeData,
};

export default unifiedNodeService;
