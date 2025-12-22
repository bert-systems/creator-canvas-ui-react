/**
 * Connection Generation Service - "Moments of Delight" API
 *
 * Handles image fusion and generation when nodes are connected.
 * Powers the "Moments of Delight" feature with backend AI models.
 *
 * @see architectureDesign.md - "Connection Actions (Moments of Delight)"
 */

import { api } from './api';
import type { ApiResponse } from './nodeService';

// ============================================================================
// Types - Aligned with backend ConnectionGenerate schema
// ============================================================================

export interface ConnectionGeneratedImage {
  url: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface ConnectionGenerateRequest {
  prompt: string;
  imageUrls: string[];
  model: string;
  resolution?: string;
  aspectRatio?: string;
  numImages?: number;      // 1-4
  outputFormat?: string;
  boardId?: string;
  cardId?: string;         // Legacy - for card-based results
}

export interface ConnectionGenerateResponse {
  images?: ConnectionGeneratedImage[];
  model?: string;
  resolution?: string;
  aspectRatio?: string;
  cost?: number;
  inputImageCount?: number;
  processingTimeMs?: number;
}

export interface ConnectionModel {
  id: string;
  name: string;
  description?: string;
  supportsMultipleImages: boolean;
  maxImages?: number;
  supportedResolutions?: string[];
  costPerImage?: number;
}

// ============================================================================
// Connection Action Types (Moments of Delight)
// ============================================================================

export type ConnectionActionType =
  | 'creative-dna-fusion'   // Merge creative elements from both sources
  | 'style-transplant'      // Apply style from source to target
  | 'element-transfer'      // Selective element transfer (colors, textures)
  | 'variation-bridge'      // Generate spectrum between concepts
  | 'character-inject';     // Place character into scene

export interface ConnectionActionConfig {
  type: ConnectionActionType;
  name: string;
  description: string;
  icon: string;
  defaultModel: string;
  defaultNumImages: number;
  promptTemplate: string;
}

export const CONNECTION_ACTIONS: Record<ConnectionActionType, ConnectionActionConfig> = {
  'creative-dna-fusion': {
    type: 'creative-dna-fusion',
    name: 'Creative DNA Fusion',
    description: 'Merge creative elements from both sources into new combinations',
    icon: '🧬',
    defaultModel: 'nano-banana-pro',
    defaultNumImages: 4,
    promptTemplate: 'Create a fusion combining elements from both reference images. {customPrompt}',
  },
  'style-transplant': {
    type: 'style-transplant',
    name: 'Style Transplant',
    description: 'Apply the visual style of one image to the content of another',
    icon: '🎨',
    defaultModel: 'flux-redux-dev',
    defaultNumImages: 2,
    promptTemplate: 'Apply the style, colors, and artistic treatment from reference 1 to the subject in reference 2. {customPrompt}',
  },
  'element-transfer': {
    type: 'element-transfer',
    name: 'Element Transfer',
    description: 'Transfer specific elements like colors, textures, or patterns',
    icon: '🔄',
    defaultModel: 'nano-banana-pro',
    defaultNumImages: 4,
    promptTemplate: 'Transfer the {elements} from reference 1 to reference 2. {customPrompt}',
  },
  'variation-bridge': {
    type: 'variation-bridge',
    name: 'Variation Bridge',
    description: 'Generate a spectrum of variations between two concepts',
    icon: '🌈',
    defaultModel: 'nano-banana-pro',
    defaultNumImages: 4,
    promptTemplate: 'Create variations that bridge between the two reference images. {customPrompt}',
  },
  'character-inject': {
    type: 'character-inject',
    name: 'Character Inject',
    description: 'Place a character from one image into the scene of another',
    icon: '👤',
    defaultModel: 'nano-banana-pro',
    defaultNumImages: 2,
    promptTemplate: 'Place the character from reference 1 into the scene/setting of reference 2. {customPrompt}',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

const API_BASE = '/api/creative-canvas';

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

// ============================================================================
// Connection Generation Service
// ============================================================================

export const connectionGenerationService = {
  /**
   * Generate fusion images from connected nodes
   * POST /api/creative-canvas/connections/generate
   */
  async generate(request: ConnectionGenerateRequest): Promise<ApiResponse<ConnectionGenerateResponse>> {
    const response = await api.post<ApiResponse<ConnectionGenerateResponse>>(
      `${API_BASE}/connections/generate`,
      {
        prompt: request.prompt,
        imageUrls: request.imageUrls,
        model: request.model,
        resolution: request.resolution || '1024x1024',
        aspectRatio: request.aspectRatio || '1:1',
        numImages: request.numImages || 4,
        outputFormat: request.outputFormat || 'png',
        boardId: request.boardId,
        cardId: request.cardId,
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get available fusion models
   * GET /api/creative-canvas/connections/models
   */
  async getModels(): Promise<ApiResponse<{ models: ConnectionModel[] }>> {
    const response = await api.get<ApiResponse<{ models: ConnectionModel[] }>>(
      `${API_BASE}/connections/models`
    );
    return response.data;
  },

  /**
   * Execute a connection action (Moment of Delight)
   * High-level helper that combines prompt generation and image generation
   */
  async executeAction(
    actionType: ConnectionActionType,
    sourceImages: string[],
    targetImages: string[],
    options?: {
      customPrompt?: string;
      elements?: string;    // For element-transfer: "colors", "textures", "patterns"
      numImages?: number;
      model?: string;
      resolution?: string;
      boardId?: string;
    }
  ): Promise<ApiResponse<ConnectionGenerateResponse>> {
    const actionConfig = CONNECTION_ACTIONS[actionType];

    // Build the prompt from template
    let prompt = actionConfig.promptTemplate
      .replace('{customPrompt}', options?.customPrompt || '')
      .replace('{elements}', options?.elements || 'colors, textures, and patterns');

    // Combine images (source first, then target)
    const imageUrls = [...sourceImages, ...targetImages];

    return this.generate({
      prompt: prompt.trim(),
      imageUrls,
      model: options?.model || actionConfig.defaultModel,
      numImages: options?.numImages || actionConfig.defaultNumImages,
      resolution: options?.resolution || '1024x1024',
      boardId: options?.boardId,
    });
  },
};

// ============================================================================
// Utility: Generate Fusion Prompt
// ============================================================================

/**
 * Generate a fusion prompt based on action type and node data
 */
export function generateFusionPrompt(
  actionType: ConnectionActionType,
  sourceNodeData: Record<string, unknown>,
  targetNodeData: Record<string, unknown>,
  customInstructions?: string
): string {
  const actionConfig = CONNECTION_ACTIONS[actionType];

  // Extract relevant info from node data
  const sourceLabel = sourceNodeData.label as string || 'source';
  const targetLabel = targetNodeData.label as string || 'target';
  const sourceParams = sourceNodeData.parameters as Record<string, unknown> | undefined;
  const targetParams = targetNodeData.parameters as Record<string, unknown> | undefined;
  const sourcePrompt = sourceParams?.prompt as string || '';
  const targetPrompt = targetParams?.prompt as string || '';

  // Build context-aware prompt
  let contextPrompt = '';
  if (sourcePrompt || targetPrompt) {
    contextPrompt = `Context: Source "${sourceLabel}" (${sourcePrompt}), Target "${targetLabel}" (${targetPrompt}). `;
  }

  const basePrompt = actionConfig.promptTemplate
    .replace('{customPrompt}', customInstructions || '')
    .replace('{elements}', 'colors, textures, and patterns');

  return `${contextPrompt}${basePrompt}`.trim();
}

export default connectionGenerationService;
