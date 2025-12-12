import type { Node, Edge } from '@xyflow/react';

// ============================================================================
// BOARD TYPES
// ============================================================================

export type BoardCategory = 'fashion' | 'story' | 'interior' | 'stock';

export interface Board {
  id: string;
  name: string;
  category: BoardCategory;
  description?: string;
  thumbnail?: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NODE TYPES
// ============================================================================

export type NodeCategory =
  | 'input'
  | 'imageGen'
  | 'videoGen'
  | 'threeD'
  | 'character'
  | 'style'
  | 'logic'
  | 'audio'
  | 'output'
  | 'composite';

export type NodeType =
  // Input nodes
  | 'textInput'
  | 'imageUpload'
  | 'videoUpload'
  | 'audioUpload'
  | 'referenceImage'
  | 'characterReference'
  // Image generation nodes
  | 'flux2Pro'
  | 'flux2Dev'
  | 'nanoBananaPro'
  | 'fluxKontext'
  // Video generation nodes
  | 'kling26T2V'
  | 'kling26I2V'
  | 'klingO1Ref2V'
  | 'klingO1V2VEdit'
  | 'veo31'
  | 'veo31Fast'
  | 'klingAvatar'
  // 3D generation nodes
  | 'meshy6'
  | 'tripoV25'
  | 'tripoSR'
  // Character consistency nodes
  | 'characterLock'
  | 'faceMemory'
  | 'elementLibrary'
  // Style nodes
  | 'styleDNA'
  | 'styleTransfer'
  | 'loraTraining'
  // Logic nodes
  | 'switch'
  | 'merge'
  | 'split'
  | 'loop'
  | 'conditional'
  // Audio nodes
  | 'audioGen'
  | 'voiceClone'
  | 'lipSync'
  | 'musicGen'
  // Output nodes
  | 'preview'
  | 'export'
  | 'publish'
  // Composite nodes
  | 'virtualTryOn'
  | 'clothesSwap'
  | 'runwayAnimation'
  | 'storyboardAutopilot'
  | 'collectionSlideshow';

export type PortType = 'image' | 'video' | 'audio' | 'text' | 'style' | 'character' | 'mesh3d' | 'any';

export interface Port {
  id: string;
  name: string;
  type: PortType;
  required?: boolean;
  multiple?: boolean;
}

export interface NodeDefinition {
  type: NodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  inputs: Port[];
  outputs: Port[];
  parameters: NodeParameter[];
  aiModel?: string;
}

export interface NodeParameter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'slider' | 'boolean' | 'color' | 'file';
  default?: unknown;
  options?: { label: string; value: unknown }[];
  min?: number;
  max?: number;
  step?: number;
}

// ============================================================================
// CANVAS NODE & EDGE (React Flow compatible)
// ============================================================================

export interface CanvasNodeData extends Record<string, unknown> {
  nodeType: NodeType;
  category: NodeCategory;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  result?: NodeResult;
  error?: string;
}

export interface NodeResult {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d';
  url?: string;
  urls?: string[];
  data?: unknown;
  metadata?: Record<string, unknown>;
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge<{ animated?: boolean }>;

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

export interface WorkflowExecution {
  id: string;
  boardId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  nodeStates: Record<string, NodeExecutionState>;
  error?: string;
}

export interface NodeExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  result?: NodeResult;
  error?: string;
}

// ============================================================================
// MOMENTS OF DELIGHT (Connection Actions)
// ============================================================================

export type MomentOfDelight =
  // Fashion moments
  | 'virtualTryOn'
  | 'runwayAnimation'
  | 'textileDNAFusion'
  | 'collectionSlideshow'
  | 'fabricMotion'
  // Story moments
  | 'characterLock'
  | 'sceneToCinematic'
  | 'storyboardAutopilot'
  | 'dialogueSync'
  | 'genreShift'
  // Interior moments
  | 'roomSpin360'
  | 'beforeAfterWalk'
  | 'materialSwap'
  | 'lightingTimelapse'
  // Stock moments
  | 'multiAspectBurst'
  | 'lifestyleExtension'
  | 'seasonalVariants'
  | 'audioMoodMatch'
  // Universal moments
  | 'styleDNAFusion'
  | 'styleTransplant'
  | 'elementTransfer'
  | 'variationBridge'
  | 'characterInject';

export interface ConnectionAction {
  id: MomentOfDelight;
  label: string;
  description: string;
  icon: string;
  applicableCategories: BoardCategory[];
  sourceNodeTypes: NodeType[];
  targetNodeTypes: NodeType[];
  resultType: 'image' | 'video' | 'audio';
}

// ============================================================================
// ASSET LIBRARY
// ============================================================================

export interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio' | 'mesh3d' | 'style' | 'character';
  name: string;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  boardId?: string;
  nodeId?: string;
  createdAt: string;
}

// ============================================================================
// TEMPLATES
// ============================================================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: BoardCategory;
  thumbnail: string;
  nodes: Omit<CanvasNode, 'id'>[];
  edges: Omit<CanvasEdge, 'id'>[];
  tags: string[];
  featured?: boolean;
}

// ============================================================================
// AFRICAN FASHION SWATCHES (from original implementation)
// ============================================================================

export interface TextileSwatch {
  id: string;
  name: string;
  origin: string;
  description: string;
  patternUrl: string;
  colors: string[];
}

export interface AdinkraSwatch {
  id: string;
  name: string;
  meaning: string;
  symbolUrl: string;
}

export interface GarmentType {
  id: string;
  name: string;
  region: string;
  description: string;
}

export const AFRICAN_TEXTILES: TextileSwatch[] = [
  { id: 'kente', name: 'Kente', origin: 'Ghana', description: 'Woven silk and cotton fabric', patternUrl: '', colors: ['gold', 'green', 'red', 'black'] },
  { id: 'ankara', name: 'Ankara', origin: 'West Africa', description: 'Colorful wax print fabric', patternUrl: '', colors: ['orange', 'blue', 'yellow', 'green'] },
  { id: 'mudcloth', name: 'Bogolan (Mudcloth)', origin: 'Mali', description: 'Hand-dyed fermented mud cloth', patternUrl: '', colors: ['brown', 'black', 'white', 'ochre'] },
  { id: 'kitenge', name: 'Kitenge', origin: 'East Africa', description: 'Vibrant printed cotton', patternUrl: '', colors: ['purple', 'orange', 'blue', 'green'] },
  { id: 'shweshwe', name: 'Shweshwe', origin: 'South Africa', description: 'Indigo-dyed printed cotton', patternUrl: '', colors: ['indigo', 'white', 'brown', 'red'] },
  { id: 'adire', name: 'Adire', origin: 'Nigeria', description: 'Indigo tie-dye fabric', patternUrl: '', colors: ['indigo', 'white', 'blue'] },
  { id: 'aso-oke', name: 'Aso Oke', origin: 'Nigeria', description: 'Hand-woven ceremonial cloth', patternUrl: '', colors: ['white', 'blue', 'purple', 'gold'] },
  { id: 'kanga', name: 'Kanga', origin: 'East Africa', description: 'Printed cotton with proverbs', patternUrl: '', colors: ['red', 'green', 'yellow', 'blue'] },
  { id: 'korhogo', name: 'Korhogo', origin: 'Ivory Coast', description: 'Hand-painted cotton cloth', patternUrl: '', colors: ['black', 'brown', 'white'] },
  { id: 'ndebele', name: 'Ndebele', origin: 'South Africa', description: 'Geometric painted patterns', patternUrl: '', colors: ['blue', 'red', 'yellow', 'green', 'white'] },
];

export const ADINKRA_SYMBOLS: AdinkraSwatch[] = [
  { id: 'sankofa', name: 'Sankofa', meaning: 'Return and get it - learn from the past', symbolUrl: '' },
  { id: 'gye-nyame', name: 'Gye Nyame', meaning: 'Except for God - supremacy of God', symbolUrl: '' },
  { id: 'adinkrahene', name: 'Adinkrahene', meaning: 'King of Adinkra symbols - leadership', symbolUrl: '' },
  { id: 'dwennimmen', name: 'Dwennimmen', meaning: 'Ram\'s horns - humility and strength', symbolUrl: '' },
  { id: 'nyame-dua', name: 'Nyame Dua', meaning: 'Tree of God - divine presence', symbolUrl: '' },
];

export const AFRICAN_COLORS = [
  { id: 'kente-gold', name: 'Kente Gold', hex: '#FFD700' },
  { id: 'sahara-sand', name: 'Sahara Sand', hex: '#D2B48C' },
  { id: 'congo-green', name: 'Congo Green', hex: '#228B22' },
  { id: 'nile-blue', name: 'Nile Blue', hex: '#1E90FF' },
  { id: 'serengeti-orange', name: 'Serengeti Orange', hex: '#FF8C00' },
  { id: 'kilimanjaro-brown', name: 'Kilimanjaro Brown', hex: '#8B4513' },
  { id: 'masai-red', name: 'Masai Red', hex: '#DC143C' },
  { id: 'ivory-coast-cream', name: 'Ivory Coast Cream', hex: '#FFFDD0' },
  { id: 'ebony-black', name: 'Ebony Black', hex: '#1C1C1C' },
  { id: 'victoria-falls-teal', name: 'Victoria Falls Teal', hex: '#008080' },
];
