/**
 * useModelDiscovery Hook
 * Fetches available AI models from the API model discovery endpoints
 * Uses local JSON files as fallback/cache for offline support
 * Replaces hardcoded model lists with dynamic data from backend
 */

import { useState, useEffect, useCallback } from 'react';
import { imageGenerationService } from '@/services/imageGenerationService';
import { videoGenerationService } from '@/services/videoGenerationService';

// Import local providers data as fallback
import imageProvidersData from '@/data/providers-image.json';

// ============================================================================
// Types
// ============================================================================

export interface DiscoveredModel {
  id: string;
  name: string;
  description?: string;
  tier?: 'flagship' | 'production' | 'creative' | 'fast';
  cost?: string;
  hasAudio?: boolean;
  bestFor?: string;
  capabilities?: string[];
}

export interface ModelDiscoveryState {
  imageModels: DiscoveredModel[];
  videoModels: DiscoveredModel[];
  llmModels: DiscoveredModel[];
  threeDModels: DiscoveredModel[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Module-level cache to avoid refetching on every component mount
let cachedState: ModelDiscoveryState | null = null;
let cacheTimestamp: number = 0;

// Valid model IDs set for quick validation
let validImageModelIds: Set<string> | null = null;
let validVideoModelIds: Set<string> | null = null;

// ============================================================================
// Helper: Parse local providers JSON to DiscoveredModel array
// ============================================================================

interface LocalProviderModel {
  modelId: string;
  displayName: string;
  description?: string;
  pricing?: { pricePerImage?: number; currency?: string };
  capabilities?: Record<string, unknown>;
}

interface LocalProvider {
  name: string;
  models: LocalProviderModel[];
}

function parseLocalImageProviders(): DiscoveredModel[] {
  const models: DiscoveredModel[] = [];
  const providers = imageProvidersData as LocalProvider[];

  for (const provider of providers) {
    for (const model of provider.models) {
      models.push({
        id: model.modelId,
        name: model.displayName,
        description: model.description,
        cost: model.pricing?.pricePerImage
          ? `$${model.pricing.pricePerImage.toFixed(3)}/image`
          : undefined,
        capabilities: Object.entries(model.capabilities || {})
          .filter(([, v]) => v === true)
          .map(([k]) => k.replace('supports', '')),
      });
    }
  }

  // Build valid model IDs set
  validImageModelIds = new Set(models.map(m => m.id));

  return models;
}

// ============================================================================
// Model Validation
// ============================================================================

/**
 * Validates if a model ID is known/valid for image generation
 */
export function isValidImageModel(modelId: string): boolean {
  if (!validImageModelIds) {
    parseLocalImageProviders();
  }
  return validImageModelIds?.has(modelId) ?? false;
}

/**
 * Validates if a model ID is known/valid for video generation
 */
export function isValidVideoModel(modelId: string): boolean {
  // TODO: Add video providers JSON when available
  return validVideoModelIds?.has(modelId) ?? true; // Allow all video models for now
}

/**
 * Gets all valid image model IDs
 */
export function getValidImageModelIds(): string[] {
  if (!validImageModelIds) {
    parseLocalImageProviders();
  }
  return Array.from(validImageModelIds || []);
}

// ============================================================================
// Hook
// ============================================================================

// Default fallback LLM models (also used in fetchModels when API returns empty)
const DEFAULT_LLM_MODELS: DiscoveredModel[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast & efficient (Default)', tier: 'fast' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Advanced reasoning', tier: 'production' },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Best balance of intelligence and speed', tier: 'production' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI multimodal flagship', tier: 'flagship' },
];

// Default fallback 3D models
const DEFAULT_3D_MODELS: DiscoveredModel[] = [
  { id: 'meshy', name: 'Meshy 6', description: 'High-detail 3D models', tier: 'production' },
  { id: 'tripo', name: 'Tripo v2.5', description: 'Fast game-ready 3D', tier: 'fast' },
];

export function useModelDiscovery() {
  const [state, setState] = useState<ModelDiscoveryState>(() => {
    // Return cached state if valid
    if (cachedState && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return cachedState;
    }

    // Use local providers data as initial fallback
    const localImageModels = parseLocalImageProviders();

    return {
      imageModels: localImageModels,
      videoModels: [],
      llmModels: DEFAULT_LLM_MODELS, // Include defaults to prevent MUI Select warnings
      threeDModels: DEFAULT_3D_MODELS,
      isLoading: true,
      error: null,
      lastFetched: null,
    };
  });

  const fetchModels = useCallback(async (force = false) => {
    // Use cache if valid and not forcing refresh
    if (!force && cachedState && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setState(cachedState);
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch all model types in parallel
      // Note: We no longer fetch promptService.getAgents() here since those are prompt
      // enhancement agents, not LLM models. Prompt agents are used separately.
      const [imageResponse, videoResponse] = await Promise.allSettled([
        imageGenerationService.getProviders(),
        videoGenerationService.getProviders(),
      ]);

      // Process image models from API response
      let imageModels: DiscoveredModel[] = [];
      if (imageResponse.status === 'fulfilled' && imageResponse.value.success) {
        const providers = imageResponse.value.providers || [];
        for (const provider of providers) {
          if (provider.models) {
            for (const model of provider.models) {
              // Parse capabilities - can be object with booleans or string array
              let capabilitiesList: string[] = [];
              if (model.capabilities) {
                if (Array.isArray(model.capabilities)) {
                  capabilitiesList = model.capabilities as string[];
                } else if (typeof model.capabilities === 'object') {
                  capabilitiesList = Object.entries(model.capabilities)
                    .filter(([, v]) => v === true)
                    .map(([k]) => k.replace('supports', ''));
                }
              }

              imageModels.push({
                id: model.modelId || model.id || '',
                name: model.displayName || model.name || '',
                description: model.description,
                tier: model.tier,
                cost: model.pricing?.pricePerImage
                  ? `$${model.pricing.pricePerImage.toFixed(3)}/image`
                  : model.cost,
                capabilities: capabilitiesList,
              });
            }
          }
        }
        // Update valid model IDs from API
        validImageModelIds = new Set(imageModels.map(m => m.id));
      } else {
        // Fallback to local providers data
        imageModels = parseLocalImageProviders();
      }

      // Process video models
      const videoModels: DiscoveredModel[] = [];
      if (videoResponse.status === 'fulfilled' && videoResponse.value.success) {
        const providers = videoResponse.value.providers || [];
        for (const provider of providers) {
          if (provider.models) {
            for (const model of provider.models) {
              videoModels.push({
                id: model.id,
                name: model.name,
                description: model.description,
                tier: model.tier,
                cost: model.cost,
                hasAudio: model.hasAudio,
                capabilities: model.supportedResolutions,
              });
            }
          } else {
            // Provider without nested models
            videoModels.push({
              id: provider.id,
              name: provider.name,
              description: provider.description,
              capabilities: provider.capabilities,
            });
          }
        }
      }

      // LLM models - use static list since /api/prompt/agents returns prompt ENHANCEMENT agents,
      // not actual LLM models. The prompt agents are for enhancing prompts, not for model selection.
      // TODO: Add a proper /api/llm/models endpoint if dynamic LLM model discovery is needed.
      const llmModels: DiscoveredModel[] = [...DEFAULT_LLM_MODELS];

      // Note: promptAgentsResponse contains prompt enhancement agents (e.g., "Creative Expander")
      // These are NOT LLM models and should not be shown in the AI Model dropdown.
      // Prompt agents are used separately in the prompt enhancement feature.

      // 3D models (static for now - can be fetched from API when available)
      const threeDModels: DiscoveredModel[] = [...DEFAULT_3D_MODELS];

      const newState: ModelDiscoveryState = {
        imageModels,
        videoModels,
        llmModels,
        threeDModels,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      };

      // Update cache
      cachedState = newState;
      cacheTimestamp = Date.now();

      setState(newState);

      console.log('[useModelDiscovery] Fetched models:', {
        image: imageModels.length,
        video: videoModels.length,
        llm: llmModels.length,
        threeD: threeDModels.length,
      });

    } catch (err) {
      console.error('[useModelDiscovery] Failed to fetch models:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch models',
      }));
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Helper to get models by category
  const getModelsByCategory = useCallback((category: 'imageGen' | 'videoGen' | 'threeD' | 'llm'): DiscoveredModel[] => {
    switch (category) {
      case 'imageGen':
        return state.imageModels;
      case 'videoGen':
        return state.videoModels;
      case 'threeD':
        return state.threeDModels;
      case 'llm':
        return state.llmModels;
      default:
        return [];
    }
  }, [state]);

  // Helper to find a specific model
  const findModel = useCallback((modelId: string): DiscoveredModel | undefined => {
    const allModels = [
      ...state.imageModels,
      ...state.videoModels,
      ...state.llmModels,
      ...state.threeDModels,
    ];
    return allModels.find(m => m.id === modelId);
  }, [state]);

  return {
    ...state,
    fetchModels,
    getModelsByCategory,
    findModel,
    refresh: () => fetchModels(true),
  };
}

export default useModelDiscovery;
