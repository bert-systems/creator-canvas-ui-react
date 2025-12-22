/**
 * Toolbar Service
 *
 * API service for fetching category-aware toolbars.
 *
 * @module toolbarService
 */

import api from './api';
import type { CategoryToolbar } from '../models/unifiedNode';
import type { BoardCategory } from '../models/canvas';

// ============================================================================
// TYPES
// ============================================================================

interface ToolbarResponse {
  success: boolean;
  toolbar: CategoryToolbar;
  error?: string;
}

interface ToolbarsListResponse {
  success: boolean;
  toolbars: CategoryToolbar[];
  error?: string;
}

// ============================================================================
// CACHE
// ============================================================================

const toolbarCache = new Map<string, { toolbar: CategoryToolbar; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function getCachedToolbar(category: string): CategoryToolbar | null {
  const cached = toolbarCache.get(category);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return cached.toolbar;
  }
  return null;
}

function setCachedToolbar(category: string, toolbar: CategoryToolbar): void {
  toolbarCache.set(category, { toolbar, timestamp: Date.now() });
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all available toolbars
 */
export async function getAllToolbars(): Promise<CategoryToolbar[]> {
  try {
    const response = await api.get<ToolbarsListResponse>('/api/creative-canvas/toolbars');
    if (response.data.success) {
      // Cache all toolbars
      response.data.toolbars.forEach(toolbar => {
        setCachedToolbar(toolbar.category, toolbar);
      });
      return response.data.toolbars;
    }
    throw new Error(response.data.error || 'Failed to fetch toolbars');
  } catch (error) {
    console.error('[toolbarService] Failed to fetch all toolbars:', error);
    throw error;
  }
}

/**
 * Get toolbar for a specific category
 */
export async function getToolbarByCategory(category: BoardCategory | string): Promise<CategoryToolbar> {
  // Check cache first
  const cached = getCachedToolbar(category);
  if (cached) {
    return cached;
  }

  try {
    const response = await api.get<ToolbarResponse>(`/api/creative-canvas/toolbars/${category}`);
    if (response.data.success) {
      setCachedToolbar(category, response.data.toolbar);
      return response.data.toolbar;
    }
    throw new Error(response.data.error || 'Failed to fetch toolbar');
  } catch (error) {
    const fallbackToolbar = getDefaultToolbar(category as BoardCategory);
    console.warn(
      `[toolbarService] FALLBACK ACTIVATED for category "${category}"\n` +
      `  Reason: API request failed\n` +
      `  Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
      `  Fallback: Using client-side DEFAULT_${category.toUpperCase()}_TOOLBAR with ${fallbackToolbar.actions.length} actions\n` +
      `  Actions: ${fallbackToolbar.actions.map(a => a.label).join(', ')}\n` +
      `  Note: Request API team to implement GET /api/creative-canvas/toolbars/${category}`
    );
    return fallbackToolbar;
  }
}

/**
 * Get toolbar for a specific board (uses board's category)
 */
export async function getToolbarForBoard(boardId: string): Promise<CategoryToolbar> {
  try {
    const response = await api.get<ToolbarResponse>(`/api/creative-canvas/boards/${boardId}/toolbar`);
    if (response.data.success) {
      return response.data.toolbar;
    }
    throw new Error(response.data.error || 'Failed to fetch board toolbar');
  } catch (error) {
    console.error(`[toolbarService] Failed to fetch toolbar for board ${boardId}:`, error);
    throw error;
  }
}

/**
 * Clear toolbar cache
 */
export function clearToolbarCache(): void {
  toolbarCache.clear();
}

// ============================================================================
// DEFAULT TOOLBARS (Fallback)
// ============================================================================

const DEFAULT_FASHION_TOOLBAR: CategoryToolbar = {
  category: 'fashion',
  actions: [
    { id: 'tryOn', icon: '👗', label: 'Try-On', nodeType: 'virtualTryOn' as any, tooltip: 'Virtual Try-On' },
    { id: 'swap', icon: '🔄', label: 'Swap', nodeType: 'clothesSwap' as any, tooltip: 'Clothes Swap' },
    { id: 'runway', icon: '🎬', label: 'Runway', nodeType: 'runwayAnimation' as any, tooltip: 'Runway Animation' },
    { id: 'colorway', icon: '🎨', label: 'Colorway', nodeType: 'colorwayGenerator' as any, tooltip: 'Generate Colorways' },
    { id: 'pattern', icon: '📐', label: 'Pattern', nodeType: 'patternGenerator' as any, tooltip: 'Sewing Pattern' },
    { id: 'ecommerce', icon: '📸', label: 'E-com', nodeType: 'ecommerceShot' as any, tooltip: 'E-commerce Photos' },
    { id: 'lookbook', icon: '📖', label: 'Lookbook', nodeType: 'lookbookGenerator' as any, tooltip: 'Create Lookbook' },
    { id: 'collection', icon: '📦', label: 'Collection', nodeType: 'collectionBuilder' as any, tooltip: 'Build Collection' },
  ],
};

const DEFAULT_STORY_TOOLBAR: CategoryToolbar = {
  category: 'story',
  actions: [
    { id: 'genesis', icon: '✨', label: 'Genesis', nodeType: 'storyGenesis' as any, tooltip: 'Start New Story' },
    { id: 'character', icon: '👤', label: 'Character', nodeType: 'characterCreator' as any, tooltip: 'Create Character' },
    { id: 'scene', icon: '🎬', label: 'Scene', nodeType: 'sceneGenerator' as any, tooltip: 'Generate Scene' },
    { id: 'location', icon: '🏔', label: 'Location', nodeType: 'locationCreator' as any, tooltip: 'Create Location' },
    { id: 'dialogue', icon: '💬', label: 'Dialogue', nodeType: 'dialogueGenerator' as any, tooltip: 'Write Dialogue' },
    { id: 'twist', icon: '🔀', label: 'Twist', nodeType: 'plotTwist' as any, tooltip: 'Add Plot Twist' },
    { id: 'lore', icon: '📜', label: 'Lore', nodeType: 'worldLore' as any, tooltip: 'World Building' },
    { id: 'timeline', icon: '📅', label: 'Timeline', nodeType: 'storyTimeline' as any, tooltip: 'Story Timeline' },
  ],
};

const DEFAULT_INTERIOR_TOOLBAR: CategoryToolbar = {
  category: 'interior',
  actions: [
    { id: 'flux', icon: '⚡', label: 'FLUX Pro', nodeType: 'flux2Pro' as any, tooltip: 'FLUX.2 Pro Generation' },
    { id: 'recraft', icon: '✏️', label: 'Recraft', nodeType: 'recraftV3' as any, tooltip: 'Recraft V3' },
    { id: 'video', icon: '🎬', label: 'Video', nodeType: 'veo31' as any, tooltip: 'VEO 3.1 Video' },
    { id: 'mesh3d', icon: '🧊', label: '3D', nodeType: 'meshy6' as any, tooltip: 'Image to 3D' },
    { id: 'upscale', icon: '🔍', label: 'Upscale', nodeType: 'upscaleImage' as any, tooltip: '4x Upscale' },
    { id: 'enhance', icon: '✨', label: 'Enhance', nodeType: 'enhancePrompt' as any, tooltip: 'Enhance Prompt' },
  ],
};

const DEFAULT_STOCK_TOOLBAR: CategoryToolbar = {
  category: 'stock',
  actions: [
    { id: 'fluxPro', icon: '⚡', label: 'FLUX Pro', nodeType: 'flux2Pro' as any, tooltip: 'FLUX.2 Pro Generation' },
    { id: 'fluxDev', icon: '🔧', label: 'FLUX Dev', nodeType: 'flux2Dev' as any, tooltip: 'FLUX.2 Dev + LoRA' },
    { id: 'recraft', icon: '✏️', label: 'Recraft', nodeType: 'recraftV3' as any, tooltip: 'Recraft V3 (Text/Vector)' },
    { id: 'video', icon: '🎬', label: 'Video', nodeType: 'kling26Pro' as any, tooltip: 'Kling 2.6 Video' },
    { id: 'mesh3d', icon: '🧊', label: '3D', nodeType: 'meshy6' as any, tooltip: 'Image to 3D' },
    { id: 'upscale', icon: '🔍', label: 'Upscale', nodeType: 'upscaleImage' as any, tooltip: '4x Upscale' },
    { id: 'enhance', icon: '✨', label: 'Enhance', nodeType: 'enhancePrompt' as any, tooltip: 'Enhance Prompt' },
    { id: 'nanoBanana', icon: '🍌', label: 'Banana', nodeType: 'nanoBananaPro' as any, tooltip: 'Nano Banana Pro' },
  ],
};

const DEFAULT_MOODBOARD_TOOLBAR: CategoryToolbar = {
  category: 'moodboard',
  actions: [
    { id: 'moodboard', icon: '🎨', label: 'Moodboard', nodeType: 'moodboardGenerator' as any, tooltip: 'Generate Moodboard' },
    { id: 'colorPalette', icon: '🌈', label: 'Colors', nodeType: 'colorPaletteExtractor' as any, tooltip: 'Extract Color Palette' },
    { id: 'brandKit', icon: '🏷️', label: 'Brand Kit', nodeType: 'brandKitGenerator' as any, tooltip: 'Generate Brand Kit' },
    { id: 'aesthetic', icon: '✨', label: 'Aesthetic', nodeType: 'aestheticAnalyzer' as any, tooltip: 'Analyze Aesthetic' },
    { id: 'texture', icon: '🧱', label: 'Texture', nodeType: 'textureGenerator' as any, tooltip: 'Generate Texture' },
    { id: 'typography', icon: '🔤', label: 'Typography', nodeType: 'typographySuggester' as any, tooltip: 'Suggest Typography' },
    { id: 'layout', icon: '📐', label: 'Layout', nodeType: 'moodboardLayout' as any, tooltip: 'Arrange Layout' },
    { id: 'theme', icon: '🎭', label: 'Theme', nodeType: 'visualThemeGenerator' as any, tooltip: 'Generate Visual Theme' },
  ],
};

const DEFAULT_SOCIAL_TOOLBAR: CategoryToolbar = {
  category: 'social',
  actions: [
    { id: 'post', icon: '📱', label: 'Post', nodeType: 'socialPostGenerator' as any, tooltip: 'Generate Social Post' },
    { id: 'carousel', icon: '🎠', label: 'Carousel', nodeType: 'carouselGenerator' as any, tooltip: 'Create Carousel' },
    { id: 'caption', icon: '✍️', label: 'Caption', nodeType: 'captionGenerator' as any, tooltip: 'Generate Caption' },
    { id: 'reel', icon: '🎬', label: 'Reel', nodeType: 'reelGenerator' as any, tooltip: 'Generate Reel/Short' },
    { id: 'story', icon: '📖', label: 'Story', nodeType: 'storyCreator' as any, tooltip: 'Create Story' },
    { id: 'thumbnail', icon: '🖼️', label: 'Thumbnail', nodeType: 'thumbnailGenerator' as any, tooltip: 'Generate Thumbnail' },
    { id: 'hook', icon: '🪝', label: 'Hook', nodeType: 'hookGenerator' as any, tooltip: 'Generate Viral Hook' },
    { id: 'hashtags', icon: '#️⃣', label: 'Hashtags', nodeType: 'hashtagOptimizer' as any, tooltip: 'Optimize Hashtags' },
  ],
};

/**
 * Get default toolbar for a category (fallback)
 */
export function getDefaultToolbar(category: BoardCategory): CategoryToolbar {
  switch (category) {
    case 'fashion':
      return DEFAULT_FASHION_TOOLBAR;
    case 'story':
      return DEFAULT_STORY_TOOLBAR;
    case 'interior':
      return DEFAULT_INTERIOR_TOOLBAR;
    case 'moodboard':
      return DEFAULT_MOODBOARD_TOOLBAR;
    case 'social':
      return DEFAULT_SOCIAL_TOOLBAR;
    case 'stock':
    default:
      return DEFAULT_STOCK_TOOLBAR;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const toolbarService = {
  getAllToolbars,
  getToolbarByCategory,
  getToolbarForBoard,
  getDefaultToolbar,
  clearCache: clearToolbarCache,
};

export default toolbarService;
