/**
 * Shared port color constants for all node components
 * Centralized here to maintain consistency across all nodes
 */

import type { PortType } from '@/models/canvas';

/**
 * Colors for different port types in the node connection handles
 * Used to visually distinguish between different data types
 */
export const PORT_COLORS: Record<PortType, string> = {
  // Core media types
  image: '#3b82f6',
  video: '#8b5cf6',
  audio: '#ec4899',
  text: '#f97316',

  // Creative types
  style: '#06b6d4',
  character: '#a855f7',
  mesh3d: '#f59e0b',
  any: '#6b7280',

  // Storytelling types
  story: '#10b981',
  scene: '#14b8a6',
  plotPoint: '#f59e0b',
  location: '#84cc16',
  dialogue: '#f472b6',
  treatment: '#a78bfa',
  outline: '#22d3ee',
  lore: '#c084fc',
  timeline: '#fbbf24',

  // Fashion types
  garment: '#ec4899',
  fabric: '#f472b6',
  pattern: '#f9a8d4',
  model: '#c084fc',
  outfit: '#a855f7',
  collection: '#8b5cf6',
  techPack: '#6366f1',
  lookbook: '#7c3aed',
};

export default PORT_COLORS;
