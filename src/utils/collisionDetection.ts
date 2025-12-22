/**
 * Collision Detection Utility
 * Provides collision detection and resolution for canvas nodes
 */

import type { Node } from '@xyflow/react';
import { MODE_DIMENSIONS, type DisplayMode } from '../models/unifiedNode';

// ============================================================================
// TYPES
// ============================================================================

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

export interface CollisionResult {
  hasCollision: boolean;
  collidingNodeIds: string[];
}

export interface SnapResult {
  position: { x: number; y: number };
  wasAdjusted: boolean;
}

export interface CollisionResolutionResult {
  nodes: Node[];
  adjustedCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 400;
const DEFAULT_PADDING = 20; // Minimum gap between nodes
const GRID_SNAP = 20; // Match existing grid

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Snap position to grid
 */
function snapToGrid(value: number, gridSize = GRID_SNAP): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Get the bounding box for a node
 */
export function getNodeBounds(node: Node, padding = 0): NodeBounds {
  // Priority: measured > explicit width/height > displayMode dimensions > defaults
  let width = node.measured?.width ?? node.width ?? DEFAULT_NODE_WIDTH;
  let height = node.measured?.height ?? node.height ?? DEFAULT_NODE_HEIGHT;

  // If using UnifiedNode, check displayMode for dimensions
  const displayMode = (node.data as Record<string, unknown>)?.displayMode as DisplayMode | undefined;
  if (displayMode && MODE_DIMENSIONS[displayMode]) {
    const modeDims = MODE_DIMENSIONS[displayMode];
    width = node.measured?.width ?? modeDims.defaultWidth;
    height = node.measured?.height ?? (modeDims.minHeight + modeDims.maxHeight) / 2;
  }

  return {
    x: node.position.x - padding,
    y: node.position.y - padding,
    width: width + padding * 2,
    height: height + padding * 2,
    right: node.position.x + width + padding,
    bottom: node.position.y + height + padding,
  };
}

/**
 * Check if two nodes overlap (AABB collision detection)
 */
export function detectCollision(
  node1: Node,
  node2: Node,
  padding = DEFAULT_PADDING
): boolean {
  if (node1.id === node2.id) return false;

  const bounds1 = getNodeBounds(node1, 0);
  const bounds2 = getNodeBounds(node2, 0);

  // Add padding to create minimum gap requirement
  return !(
    bounds1.right + padding <= bounds2.x ||
    bounds2.right + padding <= bounds1.x ||
    bounds1.bottom + padding <= bounds2.y ||
    bounds2.bottom + padding <= bounds1.y
  );
}

/**
 * Find all nodes colliding with a target node
 */
export function findCollisions(
  nodes: Node[],
  targetNode: Node,
  padding = DEFAULT_PADDING
): CollisionResult {
  const collidingNodeIds: string[] = [];

  for (const node of nodes) {
    if (node.id !== targetNode.id && detectCollision(targetNode, node, padding)) {
      collidingNodeIds.push(node.id);
    }
  }

  return {
    hasCollision: collidingNodeIds.length > 0,
    collidingNodeIds,
  };
}

/**
 * Find the nearest non-overlapping position for a node
 * Uses a spiral search pattern from the original position
 */
export function findNearestFreePosition(
  nodes: Node[],
  targetNode: Node,
  originalPosition: { x: number; y: number },
  padding = DEFAULT_PADDING
): SnapResult {
  // Create a test node at the original position
  const testNode: Node = {
    ...targetNode,
    position: { ...originalPosition },
  };

  // Check if original position is free
  const initialCollision = findCollisions(nodes, testNode, padding);
  if (!initialCollision.hasCollision) {
    return {
      position: {
        x: snapToGrid(originalPosition.x),
        y: snapToGrid(originalPosition.y),
      },
      wasAdjusted: false,
    };
  }

  // Spiral search for free position
  const stepSize = GRID_SNAP * 2; // Search in grid-aligned steps
  const maxRadius = 2000; // Maximum search radius

  for (let radius = stepSize; radius <= maxRadius; radius += stepSize) {
    // Try positions in a square pattern around original
    const positions = [
      { x: originalPosition.x + radius, y: originalPosition.y }, // Right
      { x: originalPosition.x - radius, y: originalPosition.y }, // Left
      { x: originalPosition.x, y: originalPosition.y + radius }, // Down
      { x: originalPosition.x, y: originalPosition.y - radius }, // Up
      { x: originalPosition.x + radius, y: originalPosition.y + radius }, // Down-Right
      { x: originalPosition.x - radius, y: originalPosition.y + radius }, // Down-Left
      { x: originalPosition.x + radius, y: originalPosition.y - radius }, // Up-Right
      { x: originalPosition.x - radius, y: originalPosition.y - radius }, // Up-Left
    ];

    for (const pos of positions) {
      testNode.position = pos;
      const collision = findCollisions(nodes, testNode, padding);
      if (!collision.hasCollision) {
        return {
          position: {
            x: snapToGrid(pos.x),
            y: snapToGrid(pos.y),
          },
          wasAdjusted: true,
        };
      }
    }
  }

  // Fallback: push to the right of rightmost colliding node
  const collidingNodes = nodes.filter((n) =>
    initialCollision.collidingNodeIds.includes(n.id)
  );
  const rightmost = collidingNodes.reduce((max, n) => {
    const bounds = getNodeBounds(n);
    return bounds.right > max ? bounds.right : max;
  }, 0);

  return {
    position: {
      x: snapToGrid(rightmost + padding),
      y: snapToGrid(originalPosition.y),
    },
    wasAdjusted: true,
  };
}

/**
 * Resolve all overlapping nodes in a board
 * Uses a greedy algorithm: process nodes left-to-right, top-to-bottom
 */
export function resolveAllCollisions(
  nodes: Node[],
  padding = DEFAULT_PADDING
): CollisionResolutionResult {
  if (nodes.length <= 1) {
    return { nodes, adjustedCount: 0 };
  }

  // Sort nodes by position (left-to-right, then top-to-bottom)
  const sortedNodes = [...nodes].sort((a, b) => {
    if (Math.abs(a.position.x - b.position.x) < 50) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });

  const resolvedNodes: Node[] = [];
  let adjustedCount = 0;

  for (const node of sortedNodes) {
    if (resolvedNodes.length === 0) {
      resolvedNodes.push(node);
      continue;
    }

    const collision = findCollisions(resolvedNodes, node, padding);
    if (!collision.hasCollision) {
      resolvedNodes.push(node);
    } else {
      // Find new position
      const snapResult = findNearestFreePosition(
        resolvedNodes,
        node,
        node.position,
        padding
      );

      if (snapResult.wasAdjusted) {
        adjustedCount++;
      }

      resolvedNodes.push({
        ...node,
        position: snapResult.position,
      });
    }
  }

  return { nodes: resolvedNodes, adjustedCount };
}

/**
 * Check if any collisions exist in a set of nodes
 */
export function hasAnyCollisions(
  nodes: Node[],
  padding = DEFAULT_PADDING
): boolean {
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (detectCollision(nodes[i], nodes[j], padding)) {
        return true;
      }
    }
  }
  return false;
}

export default {
  getNodeBounds,
  detectCollision,
  findCollisions,
  findNearestFreePosition,
  resolveAllCollisions,
  hasAnyCollisions,
};
