/**
 * Creative Palette Data
 *
 * Defines the intent-based organization of creative tools,
 * trending items, and capability-based search terms.
 */

import type { NodeType } from '../../models/canvas';

// ============================================================================
// CREATE TAB - Intent-Based Categories
// ============================================================================

export interface IntentCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  subcategories: IntentSubcategory[];
}

export interface IntentSubcategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  nodeTypes: NodeType[];
}

export const INTENT_CATEGORIES: IntentCategory[] = [
  {
    id: 'images',
    name: 'Images',
    emoji: '📸',
    description: 'Create and transform images',
    color: '#3B82F6',
    subcategories: [
      {
        id: 'text-to-image',
        name: 'From Your Imagination',
        emoji: '🎨',
        description: 'Text → Image generation',
        nodeTypes: ['flux2Pro', 'flux2Dev', 'nanoBananaPro', 'fluxKontext'],
      },
      {
        id: 'image-to-image',
        name: 'From References',
        emoji: '🔄',
        description: 'Image → Image transformation',
        nodeTypes: ['styleTransfer', 'referenceImage'],
      },
      {
        id: 'enhancements',
        name: 'Enhancements',
        emoji: '✨',
        description: 'Upscale, fix, extend images',
        nodeTypes: ['upscaleImage', 'enhancePrompt'],
      },
    ],
  },
  {
    id: 'videos',
    name: 'Videos',
    emoji: '🎬',
    description: 'Generate and animate videos',
    color: '#8B5CF6',
    subcategories: [
      {
        id: 'text-to-video',
        name: 'From Your Words',
        emoji: '🎭',
        description: 'Text → Video generation',
        nodeTypes: ['kling26T2V', 'veo31', 'veo31Fast'],
      },
      {
        id: 'image-to-video',
        name: 'From Still Images',
        emoji: '🖼️',
        description: 'Image → Video animation',
        nodeTypes: ['kling26I2V', 'klingO1Ref2V', 'klingO1V2VEdit'],
      },
      {
        id: 'talking-faces',
        name: 'Talking Faces',
        emoji: '🗣️',
        description: 'Avatar and lip sync',
        nodeTypes: ['klingAvatar', 'lipSync'],
      },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion',
    emoji: '👗',
    description: 'Fashion design and production',
    color: '#EC4899',
    subcategories: [
      {
        id: 'garment-design',
        name: 'Garment Design',
        emoji: '✏️',
        description: 'Design sketches and patterns',
        nodeTypes: ['garmentSketch', 'patternGenerator', 'techPackGenerator'],
      },
      {
        id: 'textiles',
        name: 'Textiles & Fabrics',
        emoji: '🧵',
        description: 'Design fabric patterns',
        nodeTypes: ['textileDesigner'],
      },
      {
        id: 'model-casting',
        name: 'Model & Casting',
        emoji: '👤',
        description: 'AI models with diversity',
        nodeTypes: ['modelCaster'],
      },
      {
        id: 'styling',
        name: 'Styling',
        emoji: '💎',
        description: 'Complete outfit styling',
        nodeTypes: ['outfitComposer', 'accessoryStylist'],
      },
      {
        id: 'try-on',
        name: 'Virtual Try-On',
        emoji: '👚',
        description: 'Garment on model',
        nodeTypes: ['virtualTryOn', 'clothesSwap'],
      },
      {
        id: 'fashion-photo',
        name: 'Fashion Photography',
        emoji: '📸',
        description: 'Product and lookbook shots',
        nodeTypes: ['flatLayComposer', 'ecommerceShot'],
      },
      {
        id: 'fashion-video',
        name: 'Fashion Video',
        emoji: '🎬',
        description: 'Fabric motion and runway',
        nodeTypes: ['fabricMotion', 'runwayAnimation'],
      },
      {
        id: 'collections',
        name: 'Collections & Lookbooks',
        emoji: '📖',
        description: 'Build fashion collections',
        nodeTypes: ['collectionBuilder', 'lookbookGenerator', 'collectionSlideshow'],
      },
    ],
  },
  {
    id: '3d',
    name: '3D',
    emoji: '🧊',
    description: '3D model generation',
    color: '#F97316',
    subcategories: [
      {
        id: 'image-to-3d',
        name: 'Image to 3D',
        emoji: '🎨',
        description: 'Create 3D models',
        nodeTypes: ['meshy6', 'tripoV25', 'tripoSR'],
      },
      {
        id: 'retexture',
        name: 'Retexture',
        emoji: '🔄',
        description: 'Change materials',
        nodeTypes: [],
      },
      {
        id: 'product-view',
        name: 'Product View',
        emoji: '📦',
        description: '360° spins',
        nodeTypes: [],
      },
    ],
  },
  {
    id: 'storytelling',
    name: 'Visual Stories',
    emoji: '🎬',
    description: 'Character and scene consistency',
    color: '#F59E0B',
    subcategories: [
      {
        id: 'character-lock',
        name: 'Character Lock',
        emoji: '👤',
        description: 'Maintain consistency',
        nodeTypes: ['characterLock', 'faceMemory'],
      },
      {
        id: 'scene-sequence',
        name: 'Scene Sequence',
        emoji: '🎬',
        description: 'Multi-shot stories',
        nodeTypes: ['storyboardAutopilot', 'elementLibrary'],
      },
      {
        id: 'dialogue',
        name: 'Dialogue Creation',
        emoji: '🗣️',
        description: 'Voice + Face',
        nodeTypes: ['voiceClone', 'lipSync'],
      },
    ],
  },
  {
    id: 'narrative',
    name: 'Story Writing',
    emoji: '📖',
    description: 'AI-powered narrative creation',
    color: '#10B981',
    subcategories: [
      {
        id: 'story-foundation',
        name: 'Story Foundation',
        emoji: '✨',
        description: 'Create story concepts and structure',
        nodeTypes: ['storyGenesis', 'storyStructure', 'treatmentGenerator'],
      },
      {
        id: 'characters',
        name: 'Characters',
        emoji: '👥',
        description: 'Deep character development',
        nodeTypes: ['characterCreator', 'characterRelationship', 'characterVoice'],
      },
      {
        id: 'world-building',
        name: 'World Building',
        emoji: '🌍',
        description: 'Locations, lore, and timelines',
        nodeTypes: ['locationCreator', 'worldLore', 'storyTimeline'],
      },
      {
        id: 'plot-narrative',
        name: 'Plot & Narrative',
        emoji: '📝',
        description: 'Scenes, plot points, and twists',
        nodeTypes: ['sceneGenerator', 'plotPoint', 'plotTwist', 'conflictGenerator'],
      },
      {
        id: 'dialogue-speech',
        name: 'Dialogue & Speech',
        emoji: '💬',
        description: 'Conversations and monologues',
        nodeTypes: ['dialogueGenerator', 'monologueGenerator'],
      },
      {
        id: 'branching',
        name: 'Branching Narratives',
        emoji: '🔀',
        description: 'Interactive choice-based stories',
        nodeTypes: ['choicePoint', 'consequenceTracker', 'pathMerge'],
      },
      {
        id: 'enhancement',
        name: 'Story Enhancement',
        emoji: '🚀',
        description: 'Polish and improve your narrative',
        nodeTypes: ['storyPivot', 'intrigueLift', 'storyEnhancer'],
      },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    emoji: '🔧',
    description: 'Input, output, and logic',
    color: '#6B7280',
    subcategories: [
      {
        id: 'inputs',
        name: 'Inputs',
        emoji: '📥',
        description: 'Image, Video, Text, Audio',
        nodeTypes: ['textInput', 'imageUpload', 'videoUpload', 'audioUpload', 'characterReference'],
      },
      {
        id: 'outputs',
        name: 'Outputs',
        emoji: '📤',
        description: 'Export, Save, Publish',
        nodeTypes: ['preview', 'export', 'publish'],
      },
      {
        id: 'logic',
        name: 'Logic',
        emoji: '⚙️',
        description: 'Batch, Merge, Split',
        nodeTypes: ['switch', 'merge', 'split', 'loop', 'conditional'],
      },
    ],
  },
  {
    id: 'multiframe',
    name: 'Multi-Frame',
    emoji: '🎞️',
    description: 'Stacks, Queues, and Grids for variations',
    color: '#14B8A6',
    subcategories: [
      {
        id: 'stacks',
        name: 'Stacks (Vertical 9:16)',
        emoji: '📚',
        description: 'Sequential progression frames',
        nodeTypes: ['stackTime', 'stackMultiverse', 'stackChrono', 'stackSubconscious', 'stackZAxis', 'stackCauseEffect'],
      },
      {
        id: 'queues',
        name: 'Queues (Horizontal 16:9+)',
        emoji: '🎬',
        description: 'Spatial continuity frames',
        nodeTypes: ['queuePanorama', 'queueWalkCycle', 'queueDialogueBeat', 'queueMotionTrail', 'queueMirror'],
      },
      {
        id: 'grids',
        name: 'Grids (Matrix 1:1)',
        emoji: '🔲',
        description: 'Comparative variation matrices',
        nodeTypes: ['gridContact', 'gridTurnaround', 'gridLighting', 'gridExpression', 'gridStylePrism', 'gridEntropy'],
      },
    ],
  },
];

// ============================================================================
// TRENDING ITEMS
// ============================================================================

export interface TrendingItem {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  nodeType: NodeType;
  usageCount: number;
  isNew?: boolean;
  isPremium?: boolean;
}

export const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 'trend-1',
    name: 'Talking Avatar',
    description: 'Create lifelike talking head videos',
    thumbnail: '/images/trending/avatar.png',
    nodeType: 'klingAvatar',
    usageCount: 12500,
    isNew: true,
  },
  {
    id: 'trend-2',
    name: 'Virtual Try-On',
    description: 'Try garments on any model',
    thumbnail: '/images/trending/tryon.png',
    nodeType: 'virtualTryOn',
    usageCount: 9800,
  },
  {
    id: 'trend-3',
    name: '3D Product',
    description: 'Turn images into 3D models',
    thumbnail: '/images/trending/3d.png',
    nodeType: 'meshy6',
    usageCount: 7200,
  },
  {
    id: 'trend-4',
    name: 'VEO 3.1',
    description: 'Cinematic video generation',
    thumbnail: '/images/trending/veo.png',
    nodeType: 'veo31',
    usageCount: 15000,
    isPremium: true,
  },
];

// ============================================================================
// STYLE TAB - Style DNA & Heritage
// ============================================================================

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  color: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Film-like, dramatic lighting',
    keywords: ['cinematic', 'dramatic lighting', 'shallow depth of field', 'film look'],
    color: '#F97316',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-ready, clean',
    keywords: ['editorial', 'clean', 'professional', 'magazine style'],
    color: '#3B82F6',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold colors, high energy',
    keywords: ['vibrant', 'bold colors', 'high saturation', 'energetic'],
    color: '#22C55E',
  },
  {
    id: 'muted',
    name: 'Muted',
    description: 'Soft, sophisticated',
    keywords: ['muted', 'soft', 'sophisticated', 'desaturated'],
    color: '#9CA3AF',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Nostalgic, warm tones',
    keywords: ['vintage', 'nostalgic', 'warm', 'retro', 'film grain'],
    color: '#A16207',
  },
];

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'african-sunrise',
    name: 'African Sunrise',
    colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#1A659E'],
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    colors: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'],
  },
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    colors: ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#1B4332'],
  },
  {
    id: 'desert-dusk',
    name: 'Desert Dusk',
    colors: ['#D4A373', '#FAEDCD', '#E9EDC9', '#CCD5AE', '#8B5E3C'],
  },
];

// ============================================================================
// ASSETS TAB
// ============================================================================

export interface AssetCollection {
  id: string;
  name: string;
  emoji: string;
  itemCount: number;
  thumbnails: string[];
}

export interface RecentAsset {
  id: string;
  type: 'image' | 'video' | 'audio' | '3d';
  url: string;
  thumbnailUrl: string;
  createdAt: number;
  cardId?: string;
}

// ============================================================================
// SEARCH CAPABILITIES
// ============================================================================

export interface SearchCapability {
  term: string;
  aliases: string[];
  nodeTypes: NodeType[];
}

export const SEARCH_CAPABILITIES: SearchCapability[] = [
  {
    term: 'generate image',
    aliases: ['create image', 'make image', 'image from text', 'text to image'],
    nodeTypes: ['flux2Pro', 'flux2Dev', 'nanoBananaPro'],
  },
  {
    term: 'generate video',
    aliases: ['create video', 'make video', 'text to video', 'video from text'],
    nodeTypes: ['kling26T2V', 'veo31', 'veo31Fast'],
  },
  {
    term: 'animate image',
    aliases: ['image to video', 'bring to life', 'make it move'],
    nodeTypes: ['kling26I2V', 'klingO1Ref2V'],
  },
  {
    term: 'try on clothes',
    aliases: ['virtual try on', 'wear clothes', 'outfit on model', 'garment'],
    nodeTypes: ['virtualTryOn', 'clothesSwap'],
  },
  {
    term: 'talking head',
    aliases: ['lip sync', 'avatar', 'speaking video', 'talking face'],
    nodeTypes: ['klingAvatar', 'lipSync'],
  },
  {
    term: 'create 3d',
    aliases: ['make 3d', '3d model', 'image to 3d', 'three dimensional'],
    nodeTypes: ['meshy6', 'tripoV25', 'tripoSR'],
  },
  {
    term: 'character consistency',
    aliases: ['same character', 'character lock', 'consistent face', 'same person'],
    nodeTypes: ['characterLock', 'faceMemory'],
  },
  {
    term: 'fashion video',
    aliases: ['runway', 'catwalk', 'fashion show', 'model walking'],
    nodeTypes: ['runwayAnimation'],
  },
  {
    term: 'style transfer',
    aliases: ['apply style', 'change style', 'stylize'],
    nodeTypes: ['styleTransfer', 'styleDNA'],
  },
  {
    term: 'upscale',
    aliases: ['enhance', 'higher resolution', 'upres', 'super resolution', 'make bigger'],
    nodeTypes: ['upscaleImage'],
  },
  {
    term: 'improve prompt',
    aliases: ['enhance prompt', 'better prompt', 'prompt engineering', 'rewrite prompt'],
    nodeTypes: ['enhancePrompt'],
  },
  {
    term: 'time progression',
    aliases: ['aging', 'time series', 'before after', 'evolution', 'timeline'],
    nodeTypes: ['stackTime', 'stackChrono', 'stackCauseEffect'],
  },
  {
    term: 'variations',
    aliases: ['alternatives', 'different versions', 'options', 'multiverse'],
    nodeTypes: ['stackMultiverse', 'gridStylePrism', 'gridEntropy'],
  },
  {
    term: 'lighting variations',
    aliases: ['different lighting', 'light directions', 'time of day'],
    nodeTypes: ['stackChrono', 'gridLighting'],
  },
  {
    term: 'panorama',
    aliases: ['wide shot', 'establishing shot', 'ultra wide', 'landscape'],
    nodeTypes: ['queuePanorama'],
  },
  {
    term: 'walk cycle',
    aliases: ['walking', 'locomotion', 'movement', 'motion'],
    nodeTypes: ['queueWalkCycle', 'queueMotionTrail'],
  },
  {
    term: 'character turnaround',
    aliases: ['turnaround', 'rotation', 'all angles', 'character sheet'],
    nodeTypes: ['gridTurnaround'],
  },
  {
    term: 'contact sheet',
    aliases: ['film strip', 'shot options', 'composition choices'],
    nodeTypes: ['gridContact'],
  },
  {
    term: 'expressions',
    aliases: ['emotions', 'facial expressions', 'emotion sheet', 'expression sheet'],
    nodeTypes: ['gridExpression'],
  },
  {
    term: 'dialogue',
    aliases: ['conversation', 'setup reaction', 'comic strip', 'dialogue beat'],
    nodeTypes: ['queueDialogueBeat'],
  },
  {
    term: 'reflection',
    aliases: ['mirror', 'reality vs reflection', 'dual perspective'],
    nodeTypes: ['queueMirror', 'stackSubconscious'],
  },
  // Story Writing capabilities
  {
    term: 'write story',
    aliases: ['create story', 'generate story', 'story idea', 'new story', 'story concept'],
    nodeTypes: ['storyGenesis', 'storyStructure', 'treatmentGenerator'],
  },
  {
    term: 'create character',
    aliases: ['new character', 'character development', 'character profile', 'design character'],
    nodeTypes: ['characterCreator', 'characterRelationship', 'characterVoice'],
  },
  {
    term: 'write scene',
    aliases: ['create scene', 'generate scene', 'scene writing', 'new scene'],
    nodeTypes: ['sceneGenerator', 'plotPoint'],
  },
  {
    term: 'dialogue',
    aliases: ['conversation', 'write dialogue', 'character dialogue', 'speech'],
    nodeTypes: ['dialogueGenerator', 'monologueGenerator', 'queueDialogueBeat'],
  },
  {
    term: 'plot twist',
    aliases: ['twist', 'surprise', 'revelation', 'unexpected turn'],
    nodeTypes: ['plotTwist', 'storyPivot'],
  },
  {
    term: 'world building',
    aliases: ['lore', 'mythology', 'history', 'setting', 'worldbuilding'],
    nodeTypes: ['worldLore', 'locationCreator', 'storyTimeline'],
  },
  {
    term: 'branching story',
    aliases: ['interactive story', 'choice', 'multiple endings', 'decision point'],
    nodeTypes: ['choicePoint', 'consequenceTracker', 'pathMerge'],
  },
  {
    term: 'improve story',
    aliases: ['enhance story', 'polish story', 'story quality', 'better writing'],
    nodeTypes: ['storyEnhancer', 'intrigueLift', 'storyPivot'],
  },
  {
    term: 'conflict',
    aliases: ['obstacle', 'challenge', 'tension', 'drama'],
    nodeTypes: ['conflictGenerator', 'intrigueLift'],
  },
  {
    term: 'treatment',
    aliases: ['synopsis', 'logline', 'pitch', 'script treatment'],
    nodeTypes: ['treatmentGenerator'],
  },
  {
    term: 'scale zoom',
    aliases: ['macro to wide', 'zoom levels', 'depth layers', 'z-axis'],
    nodeTypes: ['stackZAxis'],
  },
  // Fashion Design capabilities
  {
    term: 'garment design',
    aliases: ['fashion sketch', 'draw clothes', 'design clothes', 'fashion illustration'],
    nodeTypes: ['garmentSketch', 'patternGenerator', 'techPackGenerator'],
  },
  {
    term: 'sewing pattern',
    aliases: ['pattern making', 'cut pattern', 'size grading', 'pattern generator'],
    nodeTypes: ['patternGenerator'],
  },
  {
    term: 'tech pack',
    aliases: ['technical specification', 'garment specs', 'production specs', 'tech specs'],
    nodeTypes: ['techPackGenerator'],
  },
  {
    term: 'textile design',
    aliases: ['fabric pattern', 'print design', 'textile pattern', 'fabric design'],
    nodeTypes: ['textileDesigner'],
  },
  {
    term: 'fashion model',
    aliases: ['ai model', 'virtual model', 'diverse model', 'model casting', 'mannequin'],
    nodeTypes: ['modelCaster'],
  },
  {
    term: 'outfit styling',
    aliases: ['style outfit', 'compose outfit', 'fashion styling', 'wardrobe'],
    nodeTypes: ['outfitComposer', 'accessoryStylist'],
  },
  {
    term: 'accessories',
    aliases: ['jewelry', 'bags', 'shoes', 'accessorize', 'style accessories'],
    nodeTypes: ['accessoryStylist'],
  },
  {
    term: 'flat lay',
    aliases: ['product flat', 'flatlay', 'overhead shot', 'styled flat'],
    nodeTypes: ['flatLayComposer'],
  },
  {
    term: 'ecommerce photo',
    aliases: ['product photo', 'catalog photo', 'ghost mannequin', 'product shot'],
    nodeTypes: ['ecommerceShot'],
  },
  {
    term: 'fabric animation',
    aliases: ['fabric motion', 'cloth simulation', 'drape animation', 'flowing fabric'],
    nodeTypes: ['fabricMotion'],
  },
  {
    term: 'fashion collection',
    aliases: ['build collection', 'fashion line', 'clothing line', 'season collection'],
    nodeTypes: ['collectionBuilder'],
  },
  {
    term: 'lookbook',
    aliases: ['fashion lookbook', 'catalog', 'fashion book', 'style guide'],
    nodeTypes: ['lookbookGenerator'],
  },
  {
    term: 'grid',
    aliases: ['matrix', 'multi image', 'composite', 'batch variations'],
    nodeTypes: ['gridContact', 'gridTurnaround', 'gridLighting', 'gridExpression', 'gridStylePrism', 'gridEntropy'],
  },
  {
    term: 'stack',
    aliases: ['vertical sequence', 'film strip vertical', 'portrait sequence'],
    nodeTypes: ['stackTime', 'stackMultiverse', 'stackChrono', 'stackSubconscious', 'stackZAxis', 'stackCauseEffect'],
  },
  {
    term: 'queue',
    aliases: ['horizontal sequence', 'film strip horizontal', 'landscape sequence'],
    nodeTypes: ['queuePanorama', 'queueWalkCycle', 'queueDialogueBeat', 'queueMotionTrail', 'queueMirror'],
  },
];

/**
 * Search nodes by capability/intent
 */
export function searchByCapability(query: string): NodeType[] {
  const normalizedQuery = query.toLowerCase().trim();
  const matchedTypes = new Set<NodeType>();

  for (const capability of SEARCH_CAPABILITIES) {
    // Check main term
    if (capability.term.includes(normalizedQuery) || normalizedQuery.includes(capability.term)) {
      capability.nodeTypes.forEach((t) => matchedTypes.add(t));
      continue;
    }

    // Check aliases
    for (const alias of capability.aliases) {
      if (alias.includes(normalizedQuery) || normalizedQuery.includes(alias)) {
        capability.nodeTypes.forEach((t) => matchedTypes.add(t));
        break;
      }
    }
  }

  return Array.from(matchedTypes);
}
