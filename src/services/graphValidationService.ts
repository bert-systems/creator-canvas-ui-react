/**
 * Graph Validation Service
 *
 * API service for graph validation, port compatibility, and execution order.
 *
 * @module graphValidationService
 */

import api from './api';
import type {
  GraphValidationResult,
  ValidationIssue,
  PortCompatibilityResponse,
  ExecutionOrderResponse,
  ExtendedPortType,
  BoardFullGraphResponse,
} from '../models/unifiedNode';

// ============================================================================
// TYPES
// ============================================================================

interface ValidateGraphRequest {
  includeWarnings?: boolean;
  validateConnections?: boolean;
  checkCycles?: boolean;
}

interface GraphValidationApiResponse {
  success: boolean;
  data?: GraphValidationResult;
  error?: string;
}

interface PortCompatibilityApiResponse {
  success: boolean;
  data?: PortCompatibilityResponse;
  error?: string;
}

interface ExecutionOrderApiResponse {
  success: boolean;
  data?: ExecutionOrderResponse;
  error?: string;
}

interface BoardFullGraphApiResponse {
  success: boolean;
  data?: BoardFullGraphResponse;
  error?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Validate the entire graph of a board
 *
 * Checks for:
 * - Missing required inputs
 * - Cycle detection
 * - Port compatibility
 * - Isolated nodes
 */
export async function validateGraph(
  boardId: string,
  options: ValidateGraphRequest = {}
): Promise<GraphValidationResult> {
  try {
    const response = await api.post<GraphValidationApiResponse>(
      `/api/creative-canvas/boards/${boardId}/validate`,
      options
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error || 'Validation failed');
  } catch (error) {
    console.error('[graphValidationService] Failed to validate graph:', error);
    // Return a default "unknown" validation result
    return {
      valid: false,
      issues: [
        {
          type: 'MISSING_REQUIRED_INPUT',
          severity: 'error',
          message: 'Failed to validate graph - please try again',
        },
      ],
      stats: {
        totalNodes: 0,
        connectedNodes: 0,
        isolatedNodes: 0,
      },
    };
  }
}

/**
 * Check if two port types are compatible
 */
export async function checkPortCompatibility(
  boardId: string,
  sourceType: ExtendedPortType,
  targetType: ExtendedPortType
): Promise<PortCompatibilityResponse> {
  try {
    const response = await api.post<PortCompatibilityApiResponse>(
      `/api/creative-canvas/boards/${boardId}/check-compatibility`,
      { sourceType, targetType }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error || 'Compatibility check failed');
  } catch (error) {
    console.error('[graphValidationService] Failed to check compatibility:', error);
    // Fall back to local compatibility check
    return checkPortCompatibilityLocal(sourceType, targetType);
  }
}

/**
 * Get execution order for a board's graph
 *
 * Returns nodes in topological order with parallel execution groups
 */
export async function getExecutionOrder(boardId: string): Promise<ExecutionOrderResponse> {
  try {
    const response = await api.get<ExecutionOrderApiResponse>(
      `/api/creative-canvas/boards/${boardId}/execution-order`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error || 'Failed to get execution order');
  } catch (error) {
    console.error('[graphValidationService] Failed to get execution order:', error);
    return {
      order: [],
      parallelGroups: [],
      hasCycles: false,
    };
  }
}

/**
 * Get full graph data for a board (nodes, edges, toolbar, templates)
 */
export async function getBoardFullGraph(boardId: string): Promise<BoardFullGraphResponse> {
  try {
    const response = await api.get<BoardFullGraphApiResponse>(
      `/api/creative-canvas/boards/${boardId}/full-graph`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error || 'Failed to get full graph');
  } catch (error) {
    console.error('[graphValidationService] Failed to get full graph:', error);
    throw error;
  }
}

// ============================================================================
// LOCAL VALIDATION (Fallback)
// ============================================================================

/**
 * Local port compatibility check (fallback when API unavailable)
 */
export function checkPortCompatibilityLocal(
  sourceType: ExtendedPortType,
  targetType: ExtendedPortType
): PortCompatibilityResponse {
  // Import compatibility matrix from unified node types
  const compatibilityMatrix: Record<ExtendedPortType, ExtendedPortType[]> = {
    image: ['image', 'any'],
    video: ['video', 'any'],
    audio: ['audio', 'any'],
    text: ['text', 'any'],
    mesh3d: ['mesh3d', 'any'],
    any: [
      'image', 'video', 'audio', 'text', 'mesh3d', 'any',
      'garment', 'fabric', 'pattern', 'model', 'outfit', 'collection', 'techPack', 'lookbook',
      'story', 'scene', 'plotPoint', 'location', 'dialogue', 'treatment', 'outline', 'lore', 'timeline',
      'style', 'character',
      'room', 'floorPlan', 'material', 'furniture', 'designStyle', 'roomLayout',
      'moodboard', 'colorPalette', 'brandKit', 'typography', 'texture', 'aesthetic',
      'post', 'carousel', 'caption', 'template', 'platform',
    ],
    style: ['style', 'image', 'any'],
    character: ['character', 'text', 'model', 'any'],
    garment: ['garment', 'image', 'any'],
    fabric: ['fabric', 'image', 'any'],
    pattern: ['pattern', 'image', 'any'],
    model: ['model', 'image', 'character', 'any'],
    outfit: ['outfit', 'image', 'any'],
    collection: ['collection', 'any'],
    techPack: ['techPack', 'text', 'any'],
    lookbook: ['lookbook', 'image', 'any'],
    story: ['story', 'text', 'any'],
    scene: ['scene', 'text', 'any'],
    plotPoint: ['plotPoint', 'scene', 'text', 'any'],
    location: ['location', 'text', 'any'],
    dialogue: ['dialogue', 'text', 'any'],
    treatment: ['treatment', 'text', 'any'],
    outline: ['outline', 'text', 'any'],
    lore: ['lore', 'text', 'any'],
    timeline: ['timeline', 'text', 'any'],
    // Interior Design port types
    room: ['room', 'image', 'any'],
    floorPlan: ['floorPlan', 'image', 'any'],
    material: ['material', 'image', 'any'],
    furniture: ['furniture', 'image', 'any'],
    designStyle: ['designStyle', 'text', 'any'],
    roomLayout: ['roomLayout', 'floorPlan', 'any'],
    // Moodboard port types
    moodboard: ['moodboard', 'image', 'any'],
    colorPalette: ['colorPalette', 'any'],
    brandKit: ['brandKit', 'any'],
    typography: ['typography', 'text', 'any'],
    texture: ['texture', 'image', 'any'],
    aesthetic: ['aesthetic', 'text', 'any'],
    // Social Media port types
    post: ['post', 'image', 'any'],
    carousel: ['carousel', 'image', 'any'],
    caption: ['caption', 'text', 'any'],
    template: ['template', 'image', 'any'],
    platform: ['platform', 'any'],
  };

  const compatibleTypes = compatibilityMatrix[targetType] || [];
  const compatible = compatibleTypes.includes(sourceType);

  return {
    compatible,
    sourceType,
    targetType,
    reason: compatible
      ? `${sourceType} is compatible with ${targetType}`
      : `${sourceType} cannot connect to ${targetType}`,
  };
}

/**
 * Local validation for a single connection
 */
export function validateConnection(
  sourceType: ExtendedPortType,
  targetType: ExtendedPortType
): ValidationIssue | null {
  const result = checkPortCompatibilityLocal(sourceType, targetType);

  if (!result.compatible) {
    return {
      type: 'PORT_INCOMPATIBLE',
      severity: 'error',
      message: result.reason || `Cannot connect ${sourceType} to ${targetType}`,
    };
  }

  return null;
}

/**
 * Check if a graph has any critical issues (errors)
 */
export function hasBlockingIssues(result: GraphValidationResult): boolean {
  return result.issues.some(issue => issue.severity === 'error');
}

/**
 * Filter issues by severity
 */
export function filterIssuesBySeverity(
  issues: ValidationIssue[],
  severity: 'error' | 'warning' | 'info'
): ValidationIssue[] {
  return issues.filter(issue => issue.severity === severity);
}

/**
 * Get issues for a specific node
 */
export function getIssuesForNode(
  issues: ValidationIssue[],
  nodeId: string
): ValidationIssue[] {
  return issues.filter(issue => issue.nodeId === nodeId);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const graphValidationService = {
  validateGraph,
  checkPortCompatibility,
  getExecutionOrder,
  getBoardFullGraph,
  // Local helpers
  checkPortCompatibilityLocal,
  validateConnection,
  hasBlockingIssues,
  filterIssuesBySeverity,
  getIssuesForNode,
};

export default graphValidationService;
