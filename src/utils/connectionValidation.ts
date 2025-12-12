/**
 * Connection Validation Utility
 * Validates connections between nodes based on port types
 */

import type { Connection, Node, Edge } from '@xyflow/react';
import type { CanvasNodeData, PortType, Port } from '@/models/canvas';

// ===== Type Compatibility Matrix =====

// Defines which port types can connect to which
// Key = source type, Value = array of compatible target types
const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
  image: ['image', 'any'],
  video: ['video', 'any'],
  audio: ['audio', 'any'],
  text: ['text', 'any'],
  style: ['style', 'any'],
  character: ['character', 'any'],
  mesh3d: ['mesh3d', 'any'],
  any: ['image', 'video', 'audio', 'text', 'style', 'character', 'mesh3d', 'any'],
};

// ===== Interfaces =====

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  sourcePort?: Port;
  targetPort?: Port;
}

export interface ConnectionValidatorOptions {
  allowSelfConnection?: boolean;
  allowMultipleConnections?: boolean;
  strictTypeChecking?: boolean;
}

// ===== Validation Functions =====

/**
 * Check if two port types are compatible
 */
export const arePortTypesCompatible = (
  sourceType: PortType,
  targetType: PortType,
  strict = false
): boolean => {
  // In strict mode, types must match exactly or one must be 'any'
  if (strict) {
    return sourceType === targetType || sourceType === 'any' || targetType === 'any';
  }

  // In relaxed mode, use compatibility matrix
  const compatibleTypes = PORT_COMPATIBILITY[sourceType] || [];
  return compatibleTypes.includes(targetType) || targetType === 'any';
};

/**
 * Get a port from a node by its ID
 */
export const getPort = (node: Node<CanvasNodeData>, portId: string, type: 'input' | 'output'): Port | undefined => {
  const ports = type === 'input' ? node.data?.inputs : node.data?.outputs;
  return ports?.find((p: Port) => p.id === portId);
};

/**
 * Validate a connection between two nodes
 */
export const validateConnection = (
  connection: Connection,
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  options: ConnectionValidatorOptions = {}
): ValidationResult => {
  const {
    allowSelfConnection = false,
    allowMultipleConnections = false,
    strictTypeChecking = false,
  } = options;

  // Check for required fields
  if (!connection.source || !connection.target) {
    return { isValid: false, reason: 'Missing source or target' };
  }

  // Check for self-connection
  if (!allowSelfConnection && connection.source === connection.target) {
    return { isValid: false, reason: 'Cannot connect a node to itself' };
  }

  // Find source and target nodes
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) {
    return { isValid: false, reason: 'Source or target node not found' };
  }

  // Check if nodes have CanvasNodeData
  if (!sourceNode.data || !targetNode.data) {
    // Allow connection if we can't validate (legacy nodes)
    return { isValid: true };
  }

  // Get ports
  const sourcePort = connection.sourceHandle
    ? getPort(sourceNode, connection.sourceHandle, 'output')
    : sourceNode.data.outputs?.[0];

  const targetPort = connection.targetHandle
    ? getPort(targetNode, connection.targetHandle, 'input')
    : targetNode.data.inputs?.[0];

  // If we can't find ports, allow connection (might be legacy node)
  if (!sourcePort || !targetPort) {
    return { isValid: true, sourcePort, targetPort };
  }

  // Check port type compatibility
  if (!arePortTypesCompatible(sourcePort.type, targetPort.type, strictTypeChecking)) {
    return {
      isValid: false,
      reason: `Incompatible types: ${sourcePort.type} cannot connect to ${targetPort.type}`,
      sourcePort,
      targetPort,
    };
  }

  // Check for existing connections (if not allowing multiple)
  if (!allowMultipleConnections && !targetPort.multiple) {
    const existingConnection = edges.find(
      (e) => e.target === connection.target && e.targetHandle === connection.targetHandle
    );

    if (existingConnection) {
      return {
        isValid: false,
        reason: 'Target port already has a connection',
        sourcePort,
        targetPort,
      };
    }
  }

  return { isValid: true, sourcePort, targetPort };
};

/**
 * Create a validation function for React Flow's isValidConnection prop
 */
export const createConnectionValidator = (
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  options: ConnectionValidatorOptions = {}
) => {
  return (connection: Connection): boolean => {
    const result = validateConnection(connection, nodes, edges, options);
    return result.isValid;
  };
};

/**
 * Get validation styles for a handle based on connection attempt
 */
export const getHandleValidationStyle = (
  isValidating: boolean,
  isValid: boolean | null
): React.CSSProperties => {
  if (!isValidating) return {};

  if (isValid === true) {
    return {
      boxShadow: '0 0 8px #22c55e',
      transform: 'scale(1.2)',
    };
  }

  if (isValid === false) {
    return {
      boxShadow: '0 0 8px #ef4444',
      opacity: 0.5,
    };
  }

  return {};
};

/**
 * Get edge style based on port types
 */
export const getEdgeStyle = (
  sourceType: PortType,
  _targetType?: PortType,
  _isAnimated = false
): React.CSSProperties => {
  // Use source port color for edge
  const portColors: Record<PortType, string> = {
    image: '#3b82f6',
    video: '#8b5cf6',
    audio: '#ec4899',
    text: '#f97316',
    style: '#06b6d4',
    character: '#a855f7',
    mesh3d: '#f59e0b',
    any: '#6b7280',
  };

  return {
    stroke: portColors[sourceType] || portColors.any,
    strokeWidth: 2,
  };
};

/**
 * Validate all edges in a graph
 */
export const validateAllEdges = (
  nodes: Node<CanvasNodeData>[],
  edges: Edge[],
  options: ConnectionValidatorOptions = {}
): Map<string, ValidationResult> => {
  const results = new Map<string, ValidationResult>();

  edges.forEach((edge) => {
    const connection: Connection = {
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle ?? null,
      targetHandle: edge.targetHandle ?? null,
    };

    results.set(edge.id, validateConnection(connection, nodes, edges, options));
  });

  return results;
};

/**
 * Get compatible port types for a given port type
 */
export const getCompatibleTypes = (portType: PortType): PortType[] => {
  return PORT_COMPATIBILITY[portType] || [];
};

/**
 * Check if a node can accept more connections on a port
 */
export const canAcceptConnection = (
  node: Node<CanvasNodeData>,
  portId: string,
  edges: Edge[],
  isInput: boolean
): boolean => {
  const port = getPort(node, portId, isInput ? 'input' : 'output');

  if (!port) return false;

  // If port allows multiple, always return true
  if (port.multiple) return true;

  // Check existing connections
  const existingConnections = edges.filter((e) =>
    isInput
      ? e.target === node.id && e.targetHandle === portId
      : e.source === node.id && e.sourceHandle === portId
  );

  return existingConnections.length === 0;
};

export default {
  arePortTypesCompatible,
  validateConnection,
  createConnectionValidator,
  getEdgeStyle,
  validateAllEdges,
  getCompatibleTypes,
  canAcceptConnection,
};
