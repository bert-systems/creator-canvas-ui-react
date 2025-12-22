/**
 * Auto-Layout Utility
 * Uses Dagre for hierarchical DAG layout of workflow nodes
 */

import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import { resolveAllCollisions, hasAnyCollisions } from './collisionDetection';

// ============================================================================
// TYPES
// ============================================================================

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT';

export interface LayoutOptions {
  /** Layout direction: LR (left-right), TB (top-bottom), etc. */
  direction?: LayoutDirection;
  /** Horizontal spacing between nodes */
  nodeSpacing?: number;
  /** Vertical spacing between ranks/levels */
  rankSpacing?: number;
  /** Snap positions to grid (e.g., 20 for 20x20 grid) */
  gridSnap?: number;
}

export interface LayoutResult {
  nodes: Node[];
  /** The bounding box of the laid out nodes */
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: 'LR',
  nodeSpacing: 80,   // Horizontal gap between nodes
  rankSpacing: 120,  // Vertical gap between levels/ranks
  gridSnap: 20,      // Snap to 20x20 grid (matches existing grid)
};

// Default node dimensions if not specified
const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 400;

// ============================================================================
// LAYOUT FUNCTIONS
// ============================================================================

/**
 * Apply Dagre hierarchical layout to a set of nodes
 *
 * @param nodes - React Flow nodes to layout
 * @param edges - React Flow edges (connections between nodes)
 * @param options - Layout configuration options
 * @returns Updated nodes with new positions and layout bounds
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): LayoutResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();

  // Set graph options
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: opts.direction,
    nodesep: opts.nodeSpacing,
    ranksep: opts.rankSpacing,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    const width = node.width ?? node.measured?.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? node.measured?.height ?? DEFAULT_NODE_HEIGHT;

    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    // Only add edges where both source and target are in our node set
    const hasSource = nodes.some((n) => n.id === edge.source);
    const hasTarget = nodes.some((n) => n.id === edge.target);

    if (hasSource && hasTarget) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Calculate bounds
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.width ?? node.measured?.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? node.measured?.height ?? DEFAULT_NODE_HEIGHT;

    // Dagre returns center coordinates, convert to top-left
    let x = nodeWithPosition.x - width / 2;
    let y = nodeWithPosition.y - height / 2;

    // Apply grid snap
    if (opts.gridSnap > 0) {
      x = Math.round(x / opts.gridSnap) * opts.gridSnap;
      y = Math.round(y / opts.gridSnap) * opts.gridSnap;
    }

    // Update bounds
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);

    return {
      ...node,
      position: { x, y },
    };
  });

  return {
    nodes: layoutedNodes,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
  };
}

/**
 * Calculate the bounding box of a set of nodes
 */
function getNodesBounds(nodes: Node[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodes.forEach((node) => {
    const width = node.width ?? node.measured?.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? node.measured?.height ?? DEFAULT_NODE_HEIGHT;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Apply layout to selected nodes only, preserving positions of unselected nodes
 *
 * @param allNodes - All nodes in the canvas
 * @param selectedNodeIds - IDs of nodes to layout
 * @param edges - All edges in the canvas
 * @param options - Layout options
 * @returns All nodes with selected nodes repositioned
 */
export function applyLayoutToSelection(
  allNodes: Node[],
  selectedNodeIds: string[],
  edges: Edge[],
  options: LayoutOptions = {}
): LayoutResult {
  // Separate selected and unselected nodes
  const selectedNodes = allNodes.filter((n) => selectedNodeIds.includes(n.id));
  const unselectedNodes = allNodes.filter((n) => !selectedNodeIds.includes(n.id));

  // If no selection, layout all nodes
  if (selectedNodes.length === 0) {
    return applyDagreLayout(allNodes, edges, options);
  }

  // Filter edges to only those connecting selected nodes
  const relevantEdges = edges.filter(
    (e) => selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
  );

  // Get the bounding box of selected nodes for positioning
  const selectionBounds = getNodesBounds(selectedNodes);

  // Apply layout to selected nodes
  const layoutResult = applyDagreLayout(selectedNodes, relevantEdges, options);

  // Calculate offset to keep layout near original position
  const layoutBounds = layoutResult.bounds;
  const offsetX = selectionBounds.minX - layoutBounds.minX;
  const offsetY = selectionBounds.minY - layoutBounds.minY;

  // Apply offset to keep nodes in roughly the same area
  const repositionedNodes = layoutResult.nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));

  // Recalculate bounds with offset
  const adjustedBounds = {
    minX: layoutBounds.minX + offsetX,
    minY: layoutBounds.minY + offsetY,
    maxX: layoutBounds.maxX + offsetX,
    maxY: layoutBounds.maxY + offsetY,
    width: layoutBounds.width,
    height: layoutBounds.height,
  };

  // Combine with unselected nodes
  return {
    nodes: [...unselectedNodes, ...repositionedNodes],
    bounds: adjustedBounds,
  };
}

/**
 * Apply layout with collision resolution
 * First applies Dagre layout, then resolves any remaining collisions
 */
export function applyLayoutWithCollisionResolution(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): LayoutResult {
  // Apply Dagre layout first
  const layoutResult = applyDagreLayout(nodes, edges, options);

  // Check for collisions (shouldn't happen with proper Dagre spacing, but safety check)
  if (hasAnyCollisions(layoutResult.nodes)) {
    console.warn('[autoLayout] Dagre layout produced collisions, resolving...');
    const resolved = resolveAllCollisions(layoutResult.nodes);

    // Recalculate bounds after collision resolution
    const bounds = getNodesBounds(resolved.nodes);

    return {
      nodes: resolved.nodes,
      bounds: {
        minX: bounds.minX,
        minY: bounds.minY,
        maxX: bounds.maxX,
        maxY: bounds.maxY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      },
    };
  }

  return layoutResult;
}

export default {
  applyDagreLayout,
  applyLayoutToSelection,
  applyLayoutWithCollisionResolution,
};
