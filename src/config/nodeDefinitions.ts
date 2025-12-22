/**
 * Node Definitions - Main entry point
 *
 * This file aggregates node definitions from category-specific files
 * and exports helper functions and category configurations.
 *
 * Individual node definitions are now organized in:
 * - src/config/nodes/inputNodes.ts
 * - src/config/nodes/imageGenNodes.ts
 * - src/config/nodes/videoGenNodes.ts
 * - src/config/nodes/styleNodes.ts
 * - src/config/nodes/outputNodes.ts
 * - src/config/nodes/storytellingNodes.ts
 * - src/config/nodes/interiorDesignNodes.ts
 * - src/config/nodes/moodboardNodes.ts
 * - src/config/nodes/socialMediaNodes.ts
 */
import type { NodeDefinition } from '@/models/canvas';
import { allNodeDefinitions } from './nodes';

// Re-export individual node collections for direct access
export {
  inputNodes,
  imageGenNodes,
  videoGenNodes,
  styleNodes,
  outputNodes,
  storytellingNodes,
  interiorDesignNodes,
  moodboardNodes,
  socialMediaNodes,
  audioNodes,
} from './nodes';

// Main aggregated node definitions array
export const nodeDefinitions: NodeDefinition[] = allNodeDefinitions;

// Helper functions
export const getNodesByCategory = (category: string): NodeDefinition[] => {
  return nodeDefinitions.filter((node) => node.category === category);
};

export const getNodeDefinition = (type: string): NodeDefinition | undefined => {
  return nodeDefinitions.find((node) => node.type === type);
};

// Node category definitions
export const nodeCategories = [
  { id: 'input', label: 'Input', icon: 'Input', color: '#22c55e' },
  { id: 'imageGen', label: 'Image Gen', icon: 'Image', color: '#3b82f6' },
  { id: 'videoGen', label: 'Video Gen', icon: 'Videocam', color: '#8b5cf6' },
  { id: 'audio', label: 'Audio', icon: 'VolumeUp', color: '#f97316' },
  { id: 'threeD', label: '3D', icon: 'ViewInAr', color: '#fb923c' },
  { id: 'multiFrame', label: 'Multi-Frame', icon: 'GridView', color: '#14b8a6' },
  { id: 'character', label: 'Character', icon: 'Person', color: '#ec4899' },
  { id: 'style', label: 'Style', icon: 'Palette', color: '#06b6d4' },
  { id: 'composite', label: 'Composite', icon: 'AutoAwesome', color: '#6366f1' },
  { id: 'output', label: 'Output', icon: 'Output', color: '#ef4444' },
  // Enhancement categories
  { id: 'enhancement', label: 'Enhancement', icon: 'AutoFixHigh', color: '#f59e0b' },
  // Storytelling categories
  { id: 'narrative', label: 'Narrative', icon: 'AutoStories', color: '#10b981' },
  { id: 'worldBuilding', label: 'World Building', icon: 'Public', color: '#84cc16' },
  { id: 'dialogue', label: 'Dialogue', icon: 'Forum', color: '#f472b6' },
  { id: 'branching', label: 'Branching', icon: 'AccountTree', color: '#a78bfa' },
  // Interior Design categories
  { id: 'interiorDesign', label: 'Interior Design', icon: 'Home', color: '#8b5cf6' },
  { id: 'spacePlanning', label: 'Space Planning', icon: 'Dashboard', color: '#7dd3fc' },
  // Moodboard & Brand Identity categories
  { id: 'moodboard', label: 'Moodboard', icon: 'ColorLens', color: '#f472b6' },
  { id: 'brandIdentity', label: 'Brand Identity', icon: 'Business', color: '#38bdf8' },
  // Social Media categories
  { id: 'socialMedia', label: 'Social Media', icon: 'Share', color: '#4ade80' },
  { id: 'contentCreation', label: 'Content', icon: 'Article', color: '#22d3ee' },
];

/**
 * Node Category Groups - Higher-level organization of node categories
 * Groups related categories together for a cleaner, less sprawling palette UI
 */
export interface NodeCategoryGroup {
  id: string;
  label: string;
  icon: string;
  color: string;
  categories: string[]; // IDs of nodeCategories that belong to this group
  description?: string;
}

export const nodeCategoryGroups: NodeCategoryGroup[] = [
  {
    id: 'sourcesOutputs',
    label: 'Sources & Outputs',
    icon: 'SwapHoriz',
    color: '#22c55e',
    categories: ['input', 'output'],
    description: 'Text, image, video inputs and export destinations',
  },
  {
    id: 'aiGeneration',
    label: 'AI Generation',
    icon: 'AutoAwesome',
    color: '#3b82f6',
    categories: ['imageGen', 'videoGen', 'audio', 'threeD', 'multiFrame'],
    description: 'Image, video, audio, 3D model, and multi-frame generation',
  },
  {
    id: 'characterStyle',
    label: 'Character & Style',
    icon: 'Face',
    color: '#ec4899',
    categories: ['character', 'style', 'composite', 'enhancement'],
    description: 'Character consistency, styling, compositing, upscaling',
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    icon: 'AutoStories',
    color: '#10b981',
    categories: ['narrative', 'worldBuilding', 'dialogue', 'branching'],
    description: 'Story creation, world building, dialogue, choices',
  },
  {
    id: 'designStudios',
    label: 'Design Studios',
    icon: 'Palette',
    color: '#8b5cf6',
    categories: ['interiorDesign', 'spacePlanning', 'moodboard', 'brandIdentity'],
    description: 'Interior design, space planning, moodboards, branding',
  },
  {
    id: 'socialContent',
    label: 'Social & Content',
    icon: 'Share',
    color: '#4ade80',
    categories: ['socialMedia', 'contentCreation'],
    description: 'Platform-specific content and social media tools',
  },
];

/**
 * Get the group that contains a specific category
 */
export const getCategoryGroup = (categoryId: string): NodeCategoryGroup | undefined => {
  return nodeCategoryGroups.find(group => group.categories.includes(categoryId));
};

/**
 * Get all categories within a group
 */
export const getCategoriesInGroup = (groupId: string): typeof nodeCategories => {
  const group = nodeCategoryGroups.find(g => g.id === groupId);
  if (!group) return [];
  return nodeCategories.filter(cat => group.categories.includes(cat.id));
};
