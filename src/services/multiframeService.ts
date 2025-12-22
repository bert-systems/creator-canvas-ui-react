/**
 * Multi-Frame Service
 * Handles Stacks, Queues, and Grids API calls for multi-image generation
 * API: /api/MultiFrame endpoints (Swagger v9)
 *
 * Stacks = Vertical sequences (9:16 aspect)
 * Queues = Horizontal sequences (16:9 aspect)
 * Grids = Matrix layouts (1:1 aspect)
 */

import { api } from './api';

const MULTIFRAME_API_BASE = '/api/MultiFrame';

// ===== Stack Types =====

export type StackType =
  | 'multiverse'      // Parallel reality variations
  | 'time'            // Temporal evolution
  | 'style'           // Style variations
  | 'character'       // Character variations
  | 'environment'     // Environment variations
  | 'emotion'         // Emotional range
  | 'perspective'     // Viewpoint variations
  | 'transformation'  // Metamorphosis sequences
  | 'dialogue'        // Conversation sequences
  | 'concept';        // Conceptual exploration

// ===== Queue Types =====

export type QueueType =
  | 'timeline'        // Chronological progression
  | 'parallel'        // Simultaneous events
  | 'comparison'      // Side-by-side comparison
  | 'process'         // Step-by-step process
  | 'storyboard'      // Cinematic storyboard
  | 'progression'     // Skill/growth progression
  | 'reaction'        // Action-reaction sequences
  | 'transformation'; // Before/during/after

// ===== Grid Types =====

export type GridType =
  | 'contact'         // Contact sheet layout
  | 'turnaround'      // Character turnaround views
  | 'lighting'        // Lighting studies
  | 'expression'      // Facial expressions
  | 'pose'            // Pose sheet
  | 'color'           // Color studies
  | 'material'        // Material/texture studies
  | 'scale'           // Scale comparison
  | 'moodboard'       // Visual mood exploration
  | 'composition'     // Compositional variations
  | 'technical'       // Technical specifications
  | 'fashion'         // Fashion lookbook
  | 'interior';       // Interior design variations

// ===== Common Types =====

export type FrameOrientation = 'vertical' | 'horizontal' | 'grid';

export interface FrameDefinition {
  index: number;
  prompt?: string;
  style?: string;
  parameters?: Record<string, unknown>;
}

export interface GeneratedFrame {
  index: number;
  imageUrl: string;
  definition?: FrameDefinition;
  width?: number;
  height?: number;
}

export interface OutputOptions {
  createComposite?: boolean;
  compositeLayout?: 'vertical' | 'horizontal' | 'grid';
  gapWidth?: number;
}

// ===== Request Types =====

export interface BaseMultiframeRequest {
  basePrompt?: string;
  negativePrompt?: string;
  frameCount?: number;
  model?: string;
  size?: string;
  referenceImageUrl?: string;
  referenceStrength?: number;
  seed?: number;
  parallel?: boolean;
  frames?: FrameDefinition[];
  parameters?: Record<string, unknown>;
  outputOptions?: OutputOptions;
}

export interface StackWorkflowRequest extends BaseMultiframeRequest {
  stackType?: StackType;
  stackParameters?: {
    timeSpan?: string;
    styles?: string[];
    startState?: string;
    endState?: string;
    emotionArc?: string;
  };
}

export interface QueueWorkflowRequest extends BaseMultiframeRequest {
  queueType?: QueueType;
  queueParameters?: {
    direction?: 'left-to-right' | 'right-to-left';
    continuity?: 'high' | 'medium' | 'low';
    overlap?: number;
  };
}

export interface GridWorkflowRequest extends BaseMultiframeRequest {
  gridType?: GridType;
  columns?: number;
  rows?: number;
  gridParameters?: {
    cellPadding?: number;
    labelCells?: boolean;
    uniformSize?: boolean;
  };
}

export interface SimpleStackRequest {
  prompt: string;
  negativePrompt?: string;
  frameCount?: number;
  model?: string;
  width?: number;
  height?: number;
  referenceImage?: string;
  seed?: number;
  outputOptions?: OutputOptions;
}

export interface SimpleQueueRequest extends SimpleStackRequest {}
export interface SimpleGridRequest extends SimpleStackRequest {
  rows?: number;
  columns?: number;
}

// ===== Response Types =====

export interface MultiframeResponse {
  success: boolean;
  error?: string;
  frames?: GeneratedFrame[];
  compositeImageUrl?: string;
  orientation?: FrameOrientation;
  totalWidth?: number;
  totalHeight?: number;
  generationTime?: string;
  metadata?: Record<string, unknown>;
}

export interface StackWorkflowResponse extends MultiframeResponse {
  stackType?: StackType;
}

export interface QueueWorkflowResponse extends MultiframeResponse {
  queueType?: QueueType;
}

export interface GridWorkflowResponse extends MultiframeResponse {
  gridType?: GridType;
  columns?: number;
  rows?: number;
}

export interface WorkflowTypeInfo {
  type: string;
  name: string;
  description: string;
  defaultFrameCount?: number;
  parameters?: string[];
}

export interface ExtractFramesRequest {
  compositeImageUrl: string;
  orientation: FrameOrientation;
  frameCount: number;
  gapWidth?: number;
  outputFormat?: 'png' | 'jpeg' | 'webp';
}

export interface ExtractFramesResponse {
  success: boolean;
  frames?: { index: number; imageUrl: string }[];
  error?: string;
}

// ===== Helper Functions =====

const getUserId = (): string => {
  const authData = localStorage.getItem('authData');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.userId || parsed.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
  return 'anonymous';
};

const getAuthHeaders = () => ({
  headers: {
    'X-User-Id': getUserId(),
  },
});

// ===== Stack Service =====

export const stackService = {
  /**
   * Generate a stack (vertical multi-frame sequence)
   * POST /api/MultiFrame/stacks
   */
  async generate(request: StackWorkflowRequest): Promise<StackWorkflowResponse> {
    const response = await api.post<StackWorkflowResponse>(
      `${MULTIFRAME_API_BASE}/stacks`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate a stack of a specific type
   * POST /api/MultiFrame/stacks/{stackType}
   */
  async generateByType(
    stackType: StackType,
    request: SimpleStackRequest
  ): Promise<StackWorkflowResponse> {
    const response = await api.post<StackWorkflowResponse>(
      `${MULTIFRAME_API_BASE}/stacks/${stackType}`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get available stack types
   * GET /api/MultiFrame/stacks/types
   */
  async getTypes(): Promise<WorkflowTypeInfo[]> {
    const response = await api.get<WorkflowTypeInfo[]>(
      `${MULTIFRAME_API_BASE}/stacks/types`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Convenience methods for specific stack types
  async multiverse(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('multiverse', request);
  },

  async time(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('time', request);
  },

  async style(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('style', request);
  },

  async character(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('character', request);
  },

  async environment(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('environment', request);
  },

  async emotion(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('emotion', request);
  },

  async perspective(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('perspective', request);
  },

  async transformation(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('transformation', request);
  },

  async dialogue(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('dialogue', request);
  },

  async concept(request: SimpleStackRequest): Promise<StackWorkflowResponse> {
    return this.generateByType('concept', request);
  },
};

// ===== Queue Service =====

export const queueService = {
  /**
   * Generate a queue (horizontal multi-frame sequence)
   * POST /api/MultiFrame/queues
   */
  async generate(request: QueueWorkflowRequest): Promise<QueueWorkflowResponse> {
    const response = await api.post<QueueWorkflowResponse>(
      `${MULTIFRAME_API_BASE}/queues`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate a queue of a specific type
   * POST /api/MultiFrame/queues/{queueType}
   */
  async generateByType(
    queueType: QueueType,
    request: SimpleQueueRequest
  ): Promise<QueueWorkflowResponse> {
    const response = await api.post<QueueWorkflowResponse>(
      `${MULTIFRAME_API_BASE}/queues/${queueType}`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get available queue types
   * GET /api/MultiFrame/queues/types
   */
  async getTypes(): Promise<WorkflowTypeInfo[]> {
    const response = await api.get<WorkflowTypeInfo[]>(
      `${MULTIFRAME_API_BASE}/queues/types`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Convenience methods for specific queue types
  async timeline(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('timeline', request);
  },

  async parallel(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('parallel', request);
  },

  async comparison(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('comparison', request);
  },

  async process(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('process', request);
  },

  async storyboard(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('storyboard', request);
  },

  async progression(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('progression', request);
  },

  async reaction(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('reaction', request);
  },

  async transformation(request: SimpleQueueRequest): Promise<QueueWorkflowResponse> {
    return this.generateByType('transformation', request);
  },
};

// ===== Grid Service =====

export const gridService = {
  /**
   * Generate a grid (matrix multi-frame layout)
   * POST /api/MultiFrame/grids
   */
  async generate(request: GridWorkflowRequest): Promise<GridWorkflowResponse> {
    const response = await api.post<GridWorkflowResponse>(
      `${MULTIFRAME_API_BASE}/grids`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate a grid of a specific type
   * POST /api/MultiFrame/grids/{gridType}
   */
  async generateByType(
    gridType: GridType,
    request: SimpleGridRequest
  ): Promise<GridWorkflowResponse> {
    const response = await api.post<GridWorkflowResponse>(
      `${MULTIFRAME_API_BASE}/grids/${gridType}`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get available grid types
   * GET /api/MultiFrame/grids/types
   */
  async getTypes(): Promise<WorkflowTypeInfo[]> {
    const response = await api.get<WorkflowTypeInfo[]>(
      `${MULTIFRAME_API_BASE}/grids/types`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Convenience methods for specific grid types
  async contact(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('contact', request);
  },

  async turnaround(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('turnaround', request);
  },

  async lighting(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('lighting', request);
  },

  async expression(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('expression', request);
  },

  async pose(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('pose', request);
  },

  async color(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('color', request);
  },

  async material(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('material', request);
  },

  async scale(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('scale', request);
  },

  async moodboard(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('moodboard', request);
  },

  async composition(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('composition', request);
  },

  async technical(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('technical', request);
  },

  async fashion(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('fashion', request);
  },

  async interior(request: SimpleGridRequest): Promise<GridWorkflowResponse> {
    return this.generateByType('interior', request);
  },
};

// ===== Frame Extraction Service =====

export const frameExtractionService = {
  /**
   * Extract individual frames from a composite image
   * POST /api/MultiFrame/extract
   */
  async extract(request: ExtractFramesRequest): Promise<ExtractFramesResponse> {
    const response = await api.post<ExtractFramesResponse>(
      `${MULTIFRAME_API_BASE}/extract`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },
};

// ===== Unified Multi-Frame Service =====

export const multiframeService = {
  stacks: stackService,
  queues: queueService,
  grids: gridService,
  extract: frameExtractionService,

  /**
   * Get all available types for all multiframe categories
   */
  async getAllTypes(): Promise<{
    stacks: WorkflowTypeInfo[];
    queues: WorkflowTypeInfo[];
    grids: WorkflowTypeInfo[];
  }> {
    const [stacks, queues, grids] = await Promise.all([
      stackService.getTypes(),
      queueService.getTypes(),
      gridService.getTypes(),
    ]);
    return { stacks, queues, grids };
  },

  /**
   * Map frontend node type to API stack/queue/grid type
   */
  getApiType(nodeType: string): { category: 'stack' | 'queue' | 'grid'; type: string } | null {
    // Stack mappings
    const stackMappings: Record<string, StackType> = {
      stackTime: 'time',
      stackMultiverse: 'multiverse',
      stackChrono: 'time', // Maps to time with different params
      stackSubconscious: 'concept',
      stackZAxis: 'perspective',
      stackCauseEffect: 'transformation',
    };

    // Queue mappings
    const queueMappings: Record<string, QueueType> = {
      queuePanorama: 'comparison',
      queueWalkCycle: 'process',
      queueDialogueBeat: 'storyboard',
      queueMotionTrail: 'process',
      queueMirror: 'comparison',
    };

    // Grid mappings
    const gridMappings: Record<string, GridType> = {
      gridContact: 'contact',
      gridTurnaround: 'turnaround',
      gridLighting: 'lighting',
      gridExpression: 'expression',
      gridStylePrism: 'moodboard',
      gridEntropy: 'material',
    };

    if (nodeType in stackMappings) {
      return { category: 'stack', type: stackMappings[nodeType] };
    }
    if (nodeType in queueMappings) {
      return { category: 'queue', type: queueMappings[nodeType] };
    }
    if (nodeType in gridMappings) {
      return { category: 'grid', type: gridMappings[nodeType] };
    }

    return null;
  },

  /**
   * Execute multiframe generation based on node type
   */
  async executeByNodeType(
    nodeType: string,
    request: SimpleStackRequest | SimpleQueueRequest | SimpleGridRequest
  ): Promise<MultiframeResponse> {
    const mapping = this.getApiType(nodeType);
    if (!mapping) {
      throw new Error(`Unknown multiframe node type: ${nodeType}`);
    }

    switch (mapping.category) {
      case 'stack':
        return stackService.generateByType(mapping.type as StackType, request);
      case 'queue':
        return queueService.generateByType(mapping.type as QueueType, request);
      case 'grid':
        return gridService.generateByType(mapping.type as GridType, request as SimpleGridRequest);
    }
  },
};

export default multiframeService;
