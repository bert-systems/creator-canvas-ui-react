/**
 * Unified Node Architecture Types
 *
 * Single data model for ALL nodes in Creative Canvas Studio.
 * Replaces: CanvasCard, CanvasNodeData, CreativeCardData
 *
 * @module unifiedNode
 * @version 4.0
 */

import type { Node  } from '@xyflow/react';
import type { NodeType, NodeCategory, PortType, NodeParameter, NodeResult } from './canvas';

// ============================================================================
// DISPLAY MODES
// ============================================================================

/**
 * Node display modes for different levels of detail
 */
export type DisplayMode = 'compact' | 'standard' | 'expanded';

/**
 * Mode dimensions configuration
 */
export const MODE_DIMENSIONS: Record<DisplayMode, { minHeight: number; maxHeight: number; defaultWidth: number }> = {
  compact: { minHeight: 80, maxHeight: 120, defaultWidth: 280 },
  standard: { minHeight: 200, maxHeight: 400, defaultWidth: 320 },
  expanded: { minHeight: 400, maxHeight: 800, defaultWidth: 400 },
};

// ============================================================================
// PORT SYSTEM
// ============================================================================

/**
 * Extended port type with all domain-specific types
 */
export type ExtendedPortType = PortType;

/**
 * Port definition with full metadata
 */
export interface UnifiedPort {
  id: string;
  name: string;
  type: ExtendedPortType;
  required: boolean;
  multi: boolean;                  // Accepts multiple connections
  description?: string;            // Tooltip text
}

/**
 * Port compatibility matrix - defines what can connect to what
 */
export const PORT_COMPATIBILITY: Record<ExtendedPortType, ExtendedPortType[]> = {
  // Core types connect to themselves + any
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

  // Style types
  style: ['style', 'image', 'any'],
  character: ['character', 'text', 'model', 'any'],

  // Fashion types are image-compatible
  garment: ['garment', 'image', 'any'],
  fabric: ['fabric', 'image', 'any'],
  pattern: ['pattern', 'image', 'any'],
  model: ['model', 'image', 'character', 'any'],
  outfit: ['outfit', 'image', 'any'],
  collection: ['collection', 'any'],
  techPack: ['techPack', 'text', 'any'],
  lookbook: ['lookbook', 'image', 'any'],

  // Story types are text-compatible
  story: ['story', 'text', 'any'],
  scene: ['scene', 'text', 'any'],
  plotPoint: ['plotPoint', 'scene', 'text', 'any'],
  location: ['location', 'text', 'any'],
  dialogue: ['dialogue', 'text', 'any'],
  treatment: ['treatment', 'text', 'any'],
  outline: ['outline', 'text', 'any'],
  lore: ['lore', 'text', 'any'],
  timeline: ['timeline', 'text', 'any'],

  // Interior Design types are image-compatible
  room: ['room', 'image', 'any'],
  floorPlan: ['floorPlan', 'image', 'any'],
  material: ['material', 'image', 'any'],
  furniture: ['furniture', 'image', 'any'],
  designStyle: ['designStyle', 'text', 'any'],
  roomLayout: ['roomLayout', 'floorPlan', 'any'],

  // Moodboard types
  moodboard: ['moodboard', 'image', 'any'],
  colorPalette: ['colorPalette', 'any'],
  brandKit: ['brandKit', 'any'],
  typography: ['typography', 'text', 'any'],
  texture: ['texture', 'image', 'any'],
  aesthetic: ['aesthetic', 'text', 'any'],

  // Social Media types
  post: ['post', 'image', 'any'],
  carousel: ['carousel', 'image', 'any'],
  caption: ['caption', 'text', 'any'],
  template: ['template', 'image', 'any'],
  platform: ['platform', 'any'],
};

/**
 * Port colors for visual differentiation
 */
export const PORT_COLORS: Record<ExtendedPortType, string> = {
  // Core
  image: '#3b82f6',      // Blue
  video: '#22c55e',      // Green
  audio: '#a855f7',      // Purple
  text: '#f97316',       // Orange
  mesh3d: '#ec4899',     // Pink
  any: '#6b7280',        // Gray

  // Style
  style: '#06b6d4',      // Cyan
  character: '#a78bfa',  // Violet

  // Fashion
  garment: '#d946ef',    // Fuchsia
  fabric: '#f59e0b',     // Amber
  pattern: '#84cc16',    // Lime
  model: '#f472b6',      // Pink
  outfit: '#8b5cf6',     // Purple
  collection: '#14b8a6', // Teal
  techPack: '#64748b',   // Slate
  lookbook: '#06b6d4',   // Cyan

  // Story
  story: '#10b981',      // Emerald
  scene: '#84cc16',      // Lime
  plotPoint: '#fbbf24',  // Yellow
  location: '#34d399',   // Green
  dialogue: '#f472b6',   // Pink
  treatment: '#818cf8',  // Indigo
  outline: '#a3e635',    // Lime
  lore: '#c084fc',       // Purple
  timeline: '#fb923c',   // Orange

  // Interior Design
  room: '#8B5CF6',       // Purple
  floorPlan: '#64748B',  // Slate
  material: '#A78BFA',   // Light violet
  furniture: '#C084FC',  // Light purple
  designStyle: '#818CF8', // Indigo
  roomLayout: '#7DD3FC', // Sky blue

  // Moodboard
  moodboard: '#F472B6',  // Pink
  colorPalette: '#FB7185', // Rose
  brandKit: '#38BDF8',   // Sky blue
  typography: '#A5B4FC', // Periwinkle
  texture: '#FCD34D',    // Amber
  aesthetic: '#D946EF',  // Fuchsia

  // Social Media
  post: '#4ADE80',       // Green
  carousel: '#22D3EE',   // Cyan
  caption: '#94A3B8',    // Gray
  template: '#F97316',   // Orange
  platform: '#6366F1',   // Indigo
};

// ============================================================================
// CONNECTION TRACKING
// ============================================================================

/**
 * Reference to a connected node/port
 */
export interface ConnectionRef {
  nodeId: string;
  portId: string;
  portType: ExtendedPortType;
}

// ============================================================================
// NODE OUTPUT
// ============================================================================

/**
 * Output from node execution
 */
export interface NodeOutput {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d' | 'data';
  url?: string;                    // For media outputs
  urls?: string[];                 // For multiple outputs
  text?: string;                   // For text outputs
  data?: Record<string, unknown>;  // For structured data outputs
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    fileSize?: number;
  };
}

// ============================================================================
// NODE STATUS
// ============================================================================

/**
 * Node execution status
 */
export type NodeStatus = 'idle' | 'queued' | 'running' | 'completed' | 'error';

// ============================================================================
// SLOT CONFIGURATION
// ============================================================================

/**
 * Preview slot configuration
 */
export interface PreviewSlotConfig {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d' | 'gallery';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'auto';
  showZoom?: boolean;
  showDownload?: boolean;
  showVariations?: boolean;
  showFullscreen?: boolean;
}

/**
 * Parameter slot configuration
 */
export interface ParameterSlotConfig {
  layout: 'inline' | 'grid' | 'accordion';
  visibleInModes: DisplayMode[];
  priorityParams?: string[];       // Which params show in compact view
  groupBy?: string;                // Group parameters by category
}

/**
 * Action slot configuration
 */
export interface ActionSlotConfig {
  primary: 'execute' | 'download' | 'preview';
  secondary?: ('execute' | 'download' | 'duplicate' | 'delete' | 'expand')[];
  showProgress?: boolean;
  showCost?: boolean;
}

/**
 * Metadata slot configuration
 */
export interface MetadataSlotConfig {
  show: ('model' | 'cost' | 'duration' | 'timestamp')[];
  position: 'footer' | 'header';
}

/**
 * Complete slot configuration for a node
 */
export interface NodeSlotConfig {
  preview?: PreviewSlotConfig;
  parameters?: ParameterSlotConfig;
  actions?: ActionSlotConfig;
  metadata?: MetadataSlotConfig;
  customContent?: string;          // Component name for escape hatch
}

/**
 * Default slot configurations per category
 */
export const DEFAULT_SLOT_CONFIGS: Partial<Record<NodeCategory, NodeSlotConfig>> = {
  imageGen: {
    preview: { type: 'image', aspectRatio: '1:1', showZoom: true, showVariations: true },
    parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
    actions: { primary: 'execute', secondary: ['download', 'duplicate'] },
  },
  videoGen: {
    preview: { type: 'video', aspectRatio: '16:9', showFullscreen: true },
    parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
    actions: { primary: 'execute', secondary: ['download'], showProgress: true },
  },
  fashion: {
    preview: { type: 'image', aspectRatio: '3:4', showZoom: true },
    parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
    actions: { primary: 'execute', secondary: ['download', 'duplicate'] },
  },
  narrative: {
    preview: { type: 'text', aspectRatio: 'auto' },
    parameters: { layout: 'accordion', visibleInModes: ['expanded'] },
    actions: { primary: 'execute', secondary: ['duplicate'] },
  },
  input: {
    // Text preview for input nodes - shows entered text with nice styling
    preview: { type: 'text', aspectRatio: 'auto' },
    parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
    actions: { primary: 'preview' },
  },
  output: {
    preview: { type: 'gallery', aspectRatio: 'auto', showDownload: true },
    parameters: { layout: 'inline', visibleInModes: ['expanded'] },
    actions: { primary: 'download', secondary: ['duplicate'] },
  },
};

// ============================================================================
// UNIFIED NODE DATA
// ============================================================================

/**
 * Single data model for ALL nodes in Creative Canvas Studio.
 * This replaces CanvasCard, CanvasNodeData, and CreativeCardData.
 */
export interface UnifiedNodeData extends Record<string, unknown> {
  // === IDENTITY ===
  id: string;
  nodeType: NodeType;              // e.g., 'flux2Pro', 'virtualTryOn', 'storyGenesis'
  category: NodeCategory;          // e.g., 'imageGen', 'fashion', 'narrative'

  // === DISPLAY ===
  label: string;                   // User-editable title
  displayMode: DisplayMode;

  // === TYPED PORTS ===
  inputs: UnifiedPort[];
  outputs: UnifiedPort[];

  // === PARAMETERS ===
  parameters: Record<string, unknown>;  // User-configured values

  // === EXECUTION STATE ===
  status: NodeStatus;
  progress?: number;               // 0-100 for running nodes
  error?: string;                  // Error message if failed

  // === RESULTS ===
  cachedOutput?: NodeOutput;       // Last execution result
  result?: NodeResult;             // Legacy result format for compatibility
  variations?: NodeOutput[];       // Alternative outputs (for selection)

  // === CONNECTIONS (Denormalized for quick access) ===
  connectedInputs?: Record<string, ConnectionRef>;    // portId -> source
  connectedOutputs?: Record<string, ConnectionRef[]>; // portId -> targets

  // === METADATA ===
  aiModel?: string;                // Selected AI model
  estimatedCost?: number;          // Estimated execution cost
  lastExecutedAt?: string;         // ISO timestamp
  executionDurationMs?: number;    // How long execution took

  // === FLAGS ===
  isLocked?: boolean;              // Prevent changes
  isFavorite?: boolean;            // User marked as favorite

  // === SLOTS (Optional - can be derived from node definition) ===
  slots?: NodeSlotConfig;
}

/**
 * React Flow node type for UnifiedNode
 */
export type UnifiedCanvasNode = Node<UnifiedNodeData, 'unifiedNode'>;

// ============================================================================
// NODE DEFINITION EXTENSION
// ============================================================================

/**
 * Extended node definition with slot configuration
 */
export interface UnifiedNodeDefinition {
  type: NodeType;
  category: NodeCategory;
  label: string;
  displayName?: string;
  description: string;
  quickHelp?: string;
  useCase?: string;
  icon: string;
  inputs: UnifiedPort[];
  outputs: UnifiedPort[];
  parameters: NodeParameter[];
  aiModel?: string;
  tier?: 'flagship' | 'production' | 'creative' | 'fast';
  cost?: string;
  hasAudio?: boolean;
  bestFor?: string;

  // NEW: Slot configuration
  slots?: NodeSlotConfig;
  defaultDisplayMode?: DisplayMode;
}

// ============================================================================
// TOOLBAR TYPES
// ============================================================================

/**
 * Toolbar action item
 */
export interface ToolbarAction {
  id: string;
  icon: string;                    // Emoji or icon name
  label: string;
  nodeType: NodeType;              // Node to create on click
  tooltip: string;
  shortcut?: string;
  badge?: 'new' | 'pro';
  disabled?: boolean;
}

/**
 * Category-specific toolbar
 */
export interface CategoryToolbar {
  category: string;
  actions: ToolbarAction[];
  moreActions?: ToolbarAction[];
}

// ============================================================================
// GRAPH VALIDATION
// ============================================================================

/**
 * Validation issue severity
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation issue type
 */
export type ValidationIssueType =
  | 'MISSING_REQUIRED_INPUT'
  | 'CYCLE_DETECTED'
  | 'PORT_INCOMPATIBLE'
  | 'UNUSED_OUTPUT'
  | 'ISOLATED_NODE'
  | 'MISSING_PARAMETER';

/**
 * Single validation issue
 */
export interface ValidationIssue {
  type: ValidationIssueType;
  severity: ValidationSeverity;
  nodeId?: string;
  portId?: string;
  message: string;
  suggestion?: string;
}

/**
 * Complete graph validation result
 */
export interface GraphValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    totalNodes: number;
    connectedNodes: number;
    isolatedNodes: number;
    executionOrder?: string[];
    parallelGroups?: string[][];
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Full graph response from API
 */
export interface BoardFullGraphResponse {
  success: boolean;
  board: {
    id: string;
    name: string;
    category: string;
    useUnifiedNodes?: boolean;
    stats?: {
      nodeCount: number;
      edgeCount: number;
      executedCount?: number;
      lastExecutedAt?: string;
    };
  };
  nodes: UnifiedNodeData[];
  edges: {
    id: string;
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
    sourcePortType?: ExtendedPortType;
    targetPortType?: ExtendedPortType;
  }[];
  toolbar?: CategoryToolbar;
}

/**
 * Port compatibility check response
 */
export interface PortCompatibilityResponse {
  compatible: boolean;
  sourceType: ExtendedPortType;
  targetType: ExtendedPortType;
  reason?: string;
}

/**
 * Execution order response
 */
export interface ExecutionOrderResponse {
  order: string[];
  parallelGroups: string[][];
  hasCycles: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if two port types are compatible
 */
export function arePortsCompatible(sourceType: ExtendedPortType, targetType: ExtendedPortType): boolean {
  const compatibleTypes = PORT_COMPATIBILITY[targetType];
  return compatibleTypes?.includes(sourceType) || false;
}

/**
 * Get port color for a given type
 */
export function getPortColor(type: ExtendedPortType): string {
  return PORT_COLORS[type] || PORT_COLORS.any;
}

/**
 * Get dimensions for a display mode
 */
export function getModeDimensions(mode: DisplayMode): { minHeight: number; maxHeight: number; defaultWidth: number } {
  return MODE_DIMENSIONS[mode];
}

/**
 * Get default slot config for a category
 */
export function getDefaultSlotConfig(category: NodeCategory): NodeSlotConfig {
  return DEFAULT_SLOT_CONFIGS[category] || {
    preview: { type: 'image', aspectRatio: 'auto' },
    parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
    actions: { primary: 'execute' },
  };
}

/**
 * Convert legacy CanvasNodeData to UnifiedNodeData
 */
export function convertToUnifiedNodeData(
  legacyData: Record<string, unknown>,
  id: string
): UnifiedNodeData {
  return {
    id,
    nodeType: (legacyData.nodeType as NodeType) || 'textInput',
    category: (legacyData.category as NodeCategory) || 'input',
    label: (legacyData.label as string) || 'Untitled',
    displayMode: (legacyData.displayMode as DisplayMode) || 'standard',
    inputs: (legacyData.inputs as UnifiedPort[]) || [],
    outputs: (legacyData.outputs as UnifiedPort[]) || [],
    parameters: (legacyData.parameters as Record<string, unknown>) || {},
    status: (legacyData.status as NodeStatus) || 'idle',
    progress: legacyData.progress as number | undefined,
    error: legacyData.error as string | undefined,
    cachedOutput: legacyData.cachedOutput as NodeOutput | undefined,
    result: legacyData.result as NodeResult | undefined,
    aiModel: legacyData.aiModel as string | undefined,
    isLocked: legacyData.isLocked as boolean | undefined,
    isFavorite: legacyData.isFavorite as boolean | undefined,
  };
}
