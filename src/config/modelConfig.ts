/**
 * modelConfig.ts - AI Model Configuration
 * Defines available models for image generation, LLM, and video generation
 * Used for model override functionality in Moodboard and Social Media APIs
 */

// ==================== MODEL TYPES ====================

export type ModelCategory = 'image' | 'llm' | 'video';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  quality: 'medium' | 'high' | 'very-high';
  speed: 'very-fast' | 'fast' | 'medium';
  cost: '$' | '$$' | '$$$';
  description: string;
  isDefault?: boolean;
}

export interface ModelPreset {
  id: string;
  name: string;
  description: string;
  imageModel: string;
  llmModel: string;
  videoModel?: string;
  icon: 'speed' | 'balance' | 'quality';
}

// ==================== IMAGE GENERATION MODELS ====================

export const imageModels: ModelInfo[] = [
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    provider: 'fal.ai',
    category: 'image',
    quality: 'high',
    speed: 'fast',
    cost: '$',
    description: 'Fast, high-quality image generation. Great balance of speed and quality.',
    isDefault: true,
  },
  {
    id: 'flux-pro',
    name: 'FLUX Pro',
    provider: 'fal.ai',
    category: 'image',
    quality: 'very-high',
    speed: 'medium',
    cost: '$$',
    description: 'Premium quality for final productions and professional work.',
  },
  {
    id: 'flux-dev',
    name: 'FLUX Dev',
    provider: 'fal.ai',
    category: 'image',
    quality: 'high',
    speed: 'fast',
    cost: '$',
    description: 'Development version with good quality and fast generation.',
  },
  {
    id: 'flux-schnell',
    name: 'FLUX Schnell',
    provider: 'fal.ai',
    category: 'image',
    quality: 'medium',
    speed: 'very-fast',
    cost: '$',
    description: 'Ultra-fast generation for quick iterations and previews.',
  },
];

// ==================== LLM MODELS ====================

export const llmModels: ModelInfo[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    category: 'llm',
    quality: 'high',
    speed: 'fast',
    cost: '$',
    description: 'Fast and capable. Great for most creative writing tasks.',
    isDefault: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    category: 'llm',
    quality: 'high',
    speed: 'very-fast',
    cost: '$',
    description: 'Ultra-fast responses for real-time interactions.',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: 'llm',
    quality: 'very-high',
    speed: 'medium',
    cost: '$$',
    description: 'Premium quality for complex creative and analytical tasks.',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: 'llm',
    quality: 'very-high',
    speed: 'medium',
    cost: '$$$',
    description: 'Top-tier reasoning and creative capabilities.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: 'llm',
    quality: 'high',
    speed: 'fast',
    cost: '$',
    description: 'Efficient and cost-effective for everyday tasks.',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'llm',
    quality: 'very-high',
    speed: 'medium',
    cost: '$$$',
    description: 'Excellent for nuanced writing and brand voice.',
  },
];

// ==================== VIDEO MODELS ====================

export const videoModels: ModelInfo[] = [
  {
    id: 'kling-2.6',
    name: 'Kling 2.6',
    provider: 'Kuaishou',
    category: 'video',
    quality: 'high',
    speed: 'medium',
    cost: '$$',
    description: 'High-quality video generation with good motion.',
    isDefault: true,
  },
  {
    id: 'veo-3.1',
    name: 'VEO 3.1',
    provider: 'Google',
    category: 'video',
    quality: 'very-high',
    speed: 'medium',
    cost: '$$$',
    description: 'Premium cinematic video quality.',
  },
];

// ==================== PRESETS ====================

export const modelPresets: ModelPreset[] = [
  {
    id: 'fast',
    name: 'Fast',
    description: 'Quick iterations and previews',
    imageModel: 'flux-schnell',
    llmModel: 'gemini-2.0-flash',
    videoModel: 'kling-2.6',
    icon: 'speed',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Best for everyday use',
    imageModel: 'nano-banana-pro',
    llmModel: 'gemini-2.5-flash',
    videoModel: 'kling-2.6',
    icon: 'balance',
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Final production work',
    imageModel: 'flux-pro',
    llmModel: 'gemini-2.5-pro',
    videoModel: 'veo-3.1',
    icon: 'quality',
  },
];

// ==================== HELPER FUNCTIONS ====================

export function getModelById(id: string): ModelInfo | undefined {
  return [...imageModels, ...llmModels, ...videoModels].find(m => m.id === id);
}

export function getDefaultImageModel(): ModelInfo {
  return imageModels.find(m => m.isDefault) || imageModels[0];
}

export function getDefaultLlmModel(): ModelInfo {
  return llmModels.find(m => m.isDefault) || llmModels[0];
}

export function getDefaultVideoModel(): ModelInfo {
  return videoModels.find(m => m.isDefault) || videoModels[0];
}

export function getPresetById(id: string): ModelPreset | undefined {
  return modelPresets.find(p => p.id === id);
}

export function getDefaultPreset(): ModelPreset {
  return modelPresets.find(p => p.id === 'balanced') || modelPresets[0];
}

export function getModelsByCategory(category: ModelCategory): ModelInfo[] {
  switch (category) {
    case 'image':
      return imageModels;
    case 'llm':
      return llmModels;
    case 'video':
      return videoModels;
    default:
      return [];
  }
}

// Quality/Speed/Cost indicator helpers
export function getQualityStars(quality: ModelInfo['quality']): number {
  switch (quality) {
    case 'very-high': return 3;
    case 'high': return 2;
    case 'medium': return 1;
    default: return 1;
  }
}

export function getSpeedBars(speed: ModelInfo['speed']): number {
  switch (speed) {
    case 'very-fast': return 3;
    case 'fast': return 2;
    case 'medium': return 1;
    default: return 1;
  }
}

export function getCostDollars(cost: ModelInfo['cost']): number {
  switch (cost) {
    case '$$$': return 3;
    case '$$': return 2;
    case '$': return 1;
    default: return 1;
  }
}
