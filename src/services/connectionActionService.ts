/**
 * Connection Action Service
 * Handles "Moments of Delight" - creative operations when two nodes are connected
 * Supports image analysis, prompt generation, and multi-image synthesis
 */

import { api } from './api';
import type {
  ConnectionActionType,
  ConnectionActionOptions,
  TransferableElement,
  CanvasCard,
} from '../models/creativeCanvas';

// ===== API Endpoints =====

const CONNECTION_API_BASE = '/api/creative-canvas/connections';
const IMAGE_ANALYSIS_API = '/api/image-analysis/analyze';

// ===== Type Definitions =====

export interface ImageTraitAnalysis {
  colors: string[];
  textures: string[];
  mood: string;
  style: string;
  composition: string;
  lighting: string;
  subjects: string[];
  tags: string[];
  dominantColor: string;
  colorPalette: Array<{ hex: string; name: string; percentage: number }>;
}

export interface ConnectionActionRequest {
  sourceCardId: string;
  targetCardId: string;
  actionType: ConnectionActionType;
  options: ConnectionActionOptions;
  boardId: string;
  category: string;
}

export interface ConnectionActionResponse {
  success: boolean;
  childCardIds: string[];
  generatedImages: GeneratedImage[];
  fusedPrompt: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface GeneratedImage {
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  model: string;
  seed?: number;
}

export interface MultiImageGenerationRequest {
  sourceImageUrl: string;
  targetImageUrl: string;
  prompt: string;
  model: 'nano-banana-pro' | 'flux-redux';
  options: {
    fusionStrength?: number;
    numImages?: number;
    resolution?: '1K' | '2K' | '4K';
    seed?: number;
  };
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

/**
 * Generate a fusion prompt based on action type and image analysis
 */
const generateActionPrompt = (
  actionType: ConnectionActionType,
  options: ConnectionActionOptions,
  sourceAnalysis?: ImageTraitAnalysis,
  targetAnalysis?: ImageTraitAnalysis
): string => {
  const sourceTraits = sourceAnalysis
    ? `Source: ${sourceAnalysis.mood} ${sourceAnalysis.style} with ${sourceAnalysis.colors.slice(0, 3).join(', ')} colors. ${sourceAnalysis.subjects.join(', ')}.`
    : '';

  const targetTraits = targetAnalysis
    ? `Target: ${targetAnalysis.mood} ${targetAnalysis.style} with ${targetAnalysis.colors.slice(0, 3).join(', ')} colors. ${targetAnalysis.subjects.join(', ')}.`
    : '';

  const customInstructions = options.customInstructions || '';
  const fusionStrength = options.fusionStrength ?? 0.5;
  const fusionDirection = fusionStrength > 0.5 ? 'source-dominant' : fusionStrength < 0.5 ? 'target-dominant' : 'balanced';

  switch (actionType) {
    case 'creative-dna-fusion':
      return `Create a harmonious fusion of two creative concepts. ${sourceTraits} ${targetTraits}
        Blend these elements with ${fusionDirection} emphasis (${Math.round(fusionStrength * 100)}% source influence).
        ${customInstructions}
        Generate a cohesive new design that captures the essence of both.`;

    case 'style-transplant':
      return `Apply the visual style from the source to the content of the target.
        ${sourceTraits}
        Transform the target content while preserving its core subject matter.
        Style transfer strength: ${Math.round(fusionStrength * 100)}%.
        ${customInstructions}`;

    case 'element-transfer': {
      const elements = options.elementsToTransfer || ['colors', 'mood'];
      const elementDescriptions: Record<TransferableElement, string> = {
        colors: 'color palette and tones',
        textures: 'surface textures and materials',
        style: 'artistic style and technique',
        mood: 'emotional atmosphere and feeling',
        composition: 'layout and visual arrangement',
        lighting: 'lighting conditions and shadows',
        subject: 'main subject matter',
      };
      const transferList = elements.map(e => elementDescriptions[e]).join(', ');
      return `Selectively transfer specific elements from source to target.
        Elements to transfer: ${transferList}.
        ${sourceTraits} ${targetTraits}
        Maintain the target's identity while infusing the selected source elements.
        ${customInstructions}`;
    }

    case 'variation-bridge': {
      const numVariations = options.numVariations || 3;
      return `Generate ${numVariations} variations that bridge between two concepts.
        ${sourceTraits} ${targetTraits}
        Create a smooth transition spectrum from source characteristics to target characteristics.
        Each variation should represent a different point along this creative continuum.
        ${customInstructions}`;
    }

    case 'character-inject':
      return `Place the character from the source into the scene of the target.
        Preserve the character's identity, pose, and distinctive features.
        ${sourceTraits}
        Integrate naturally into the target environment: ${targetAnalysis?.subjects.join(', ') || 'scene'}.
        Maintain consistent lighting and perspective.
        ${customInstructions}`;

    default:
      return `Combine elements from source and target images.
        ${sourceTraits} ${targetTraits}
        ${customInstructions}`;
  }
};

/**
 * Select the appropriate AI model based on action type
 */
const selectModel = (
  actionType: ConnectionActionType,
  _options: ConnectionActionOptions
): 'nano-banana-pro' | 'flux-redux' => {
  // Style transplant works best with FLUX Redux
  if (actionType === 'style-transplant') {
    return 'flux-redux';
  }
  // Everything else uses Nano Banana Pro for multi-reference support
  return 'nano-banana-pro';
};

/**
 * Get the primary image URL from a card
 */
const getCardImageUrl = (card: CanvasCard): string | null => {
  if (card.generatedImages && card.generatedImages.length > 0) {
    return card.generatedImages[0];
  }
  if (card.thumbnailUrl) {
    return card.thumbnailUrl;
  }
  return null;
};

// ===== Connection Action Service =====

export const connectionActionService = {
  /**
   * Analyze an image to extract visual traits
   */
  async analyzeImage(imageUrl: string): Promise<ImageTraitAnalysis | null> {
    try {
      const response = await api.post<ImageTraitAnalysis>(
        IMAGE_ANALYSIS_API,
        { imageUrl },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.warn('Image analysis failed:', error);
      return null;
    }
  },

  /**
   * Execute a connection action between two cards
   */
  async executeConnectionAction(
    request: ConnectionActionRequest,
    sourceCard: CanvasCard,
    targetCard: CanvasCard
  ): Promise<ConnectionActionResponse> {
    const { actionType, options, boardId } = request;

    // Get image URLs
    const sourceImageUrl = getCardImageUrl(sourceCard);
    const targetImageUrl = getCardImageUrl(targetCard);

    if (!sourceImageUrl || !targetImageUrl) {
      return {
        success: false,
        childCardIds: [],
        generatedImages: [],
        fusedPrompt: '',
        error: 'Both cards must have generated images to execute connection actions',
      };
    }

    try {
      // Step 1: Analyze images (optional - continue without if fails)
      let sourceAnalysis: ImageTraitAnalysis | null = null;
      let targetAnalysis: ImageTraitAnalysis | null = null;

      try {
        [sourceAnalysis, targetAnalysis] = await Promise.all([
          this.analyzeImage(sourceImageUrl),
          this.analyzeImage(targetImageUrl),
        ]);
      } catch {
        console.warn('Image analysis skipped - continuing without traits');
      }

      // Step 2: Generate the fusion prompt
      const fusedPrompt = generateActionPrompt(
        actionType,
        options,
        sourceAnalysis || undefined,
        targetAnalysis || undefined
      );

      // Step 3: Determine the model to use
      const model = selectModel(actionType, options);

      // Step 4: Determine number of images
      const numImages = actionType === 'variation-bridge'
        ? (options.numVariations || 3)
        : 1;

      // Step 5: Execute the image generation
      const generationRequest: MultiImageGenerationRequest = {
        sourceImageUrl,
        targetImageUrl,
        prompt: fusedPrompt,
        model,
        options: {
          fusionStrength: options.fusionStrength ?? 0.5,
          numImages,
          resolution: options.resolution || '2K',
        },
      };

      const response = await api.post<{
        images: GeneratedImage[];
        requestId: string;
      }>(
        `${CONNECTION_API_BASE}/generate`,
        generationRequest,
        getAuthHeaders()
      );

      const generatedImages = response.data.images || [];

      // Step 6: Create child cards from generated images
      const childCardIds: string[] = [];

      for (let i = 0; i < generatedImages.length; i++) {
        const image = generatedImages[i];

        // Calculate position between source and target
        const midX = (sourceCard.position.x + targetCard.position.x) / 2;
        const midY = (sourceCard.position.y + targetCard.position.y) / 2;
        const offsetY = (i - (generatedImages.length - 1) / 2) * 80;

        const childCardRequest = {
          type: sourceCard.type,
          templateId: sourceCard.templateId,
          position: { x: midX, y: midY + 200 + offsetY },
          dimensions: sourceCard.dimensions,
          title: `${actionType.replace(/-/g, ' ')} ${i + 1}`,
          prompt: fusedPrompt,
          generatedImages: [image.url],
          thumbnailUrl: image.thumbnailUrl || image.url,
          config: {
            parentCardIds: [sourceCard.id, targetCard.id],
            connectionActionType: actionType,
            generationMetadata: {
              model,
              seed: image.seed,
            },
          },
        };

        const createResponse = await api.post<{ id: string }>(
          `/api/creative-canvas/boards/${boardId}/cards`,
          childCardRequest,
          getAuthHeaders()
        );

        if (createResponse.data?.id) {
          childCardIds.push(createResponse.data.id);
        }
      }

      return {
        success: true,
        childCardIds,
        generatedImages,
        fusedPrompt,
        metadata: {
          model,
          sourceAnalysis,
          targetAnalysis,
        },
      };
    } catch (error) {
      console.error('Connection action failed:', error);
      return {
        success: false,
        childCardIds: [],
        generatedImages: [],
        fusedPrompt: '',
        error: error instanceof Error ? error.message : 'Connection action failed',
      };
    }
  },

  /**
   * Get estimated cost for a connection action
   */
  getEstimatedCost(
    actionType: ConnectionActionType,
    options: ConnectionActionOptions
  ): number {
    const model = selectModel(actionType, options);
    const numImages = actionType === 'variation-bridge'
      ? (options.numVariations || 3)
      : 1;

    // Base costs per image
    const baseCosts: Record<string, number> = {
      'nano-banana-pro': 0.08,
      'flux-redux': 0.05,
    };

    // Resolution multipliers
    const resolutionMultipliers: Record<string, number> = {
      '1K': 0.5,
      '2K': 1.0,
      '4K': 2.0,
    };

    const baseCost = baseCosts[model] || 0.08;
    const resolution = options.resolution || '2K';
    const multiplier = resolutionMultipliers[resolution] || 1.0;

    // Add image analysis cost if applicable
    const analysisCost = 0.02; // Per image analyzed

    return (baseCost * numImages * multiplier) + (analysisCost * 2);
  },

  /**
   * Check if a connection action can be executed
   */
  canExecute(sourceCard: CanvasCard, targetCard: CanvasCard): {
    canExecute: boolean;
    reason?: string;
  } {
    const sourceImage = getCardImageUrl(sourceCard);
    const targetImage = getCardImageUrl(targetCard);

    if (!sourceImage && !targetImage) {
      return {
        canExecute: false,
        reason: 'Both cards need generated images to create a connection action',
      };
    }

    if (!sourceImage) {
      return {
        canExecute: false,
        reason: 'Source card needs a generated image',
      };
    }

    if (!targetImage) {
      return {
        canExecute: false,
        reason: 'Target card needs a generated image',
      };
    }

    return { canExecute: true };
  },
};

export default connectionActionService;
