/**
 * Shared port color constants for all node components
 * Centralized here to maintain consistency across all nodes
 *
 * Updated to use brand colors from Creator's Toolbox + SmartAI guide
 */

import type { PortType } from '@/models/canvas';
import { brandColors, portColors as themePortColors } from '@/theme';

/**
 * Colors for different port types in the node connection handles
 * Uses brand-aligned colors for visual consistency
 *
 * Brand Color Reference:
 * - Teal Pulse (#26CABF) - Primary action, image data
 * - Mint Glow (#85E7AE) - Success, video data
 * - Tech Blue (#0A6EB9) - Info, audio data
 * - Deep Ocean (#154366) - Text, sophisticated data
 * - Sunset Orange (#FC7D21) - Attention, 3D data
 * - Coral Spark (#F2492A) - Character, identity
 */
export const PORT_COLORS: Record<PortType, string> = {
  // Core media types - Brand aligned
  image: themePortColors.image,      // Teal Pulse
  video: themePortColors.video,      // Mint Glow
  audio: themePortColors.audio,      // Tech Blue
  text: themePortColors.text,        // Deep Ocean

  // Creative types - Brand aligned
  style: themePortColors.style,      // Indigo
  character: themePortColors.character, // Pink
  mesh3d: themePortColors.mesh3d,    // Sunset Orange
  any: themePortColors.any,          // Neutral gray

  // Storytelling types - Brand aligned
  story: themePortColors.story,      // Emerald
  scene: themePortColors.scene,      // Light emerald
  plotPoint: themePortColors.plotPoint, // Lime
  location: themePortColors.location,   // Amber
  dialogue: themePortColors.dialogue,   // Pink
  treatment: themePortColors.treatment, // Violet
  outline: themePortColors.outline,     // Purple
  lore: themePortColors.lore,           // Yellow
  timeline: themePortColors.timeline,   // Orange

  // Fashion types - Brand aligned
  garment: themePortColors.garment,     // Coral Spark
  fabric: brandColors.sunsetOrange,     // Sunset Orange for fabric/textile
  pattern: '#F9A8D4',                   // Light pink for patterns
  model: themePortColors.model,         // Pink
  outfit: themePortColors.outfit,       // Light coral
  collection: themePortColors.collection, // Deep Ocean
  techPack: '#6366F1',                  // Indigo for technical
  lookbook: '#7C3AED',                  // Purple for lookbooks

  // Interior Design types
  room: '#8B5CF6',                      // Purple for room data
  floorPlan: '#64748B',                 // Slate for floor plans
  material: '#A78BFA',                  // Light violet for materials
  furniture: '#C084FC',                 // Light purple for furniture
  designStyle: '#818CF8',               // Indigo for design styles
  roomLayout: '#7DD3FC',                // Sky blue for layouts

  // Moodboard types
  moodboard: '#F472B6',                 // Pink for moodboards
  colorPalette: '#FB7185',              // Rose for color palettes
  brandKit: '#38BDF8',                  // Sky blue for brand kits
  typography: '#A5B4FC',                // Periwinkle for typography
  texture: '#FCD34D',                   // Amber for textures
  aesthetic: '#D946EF',                 // Fuchsia for aesthetics

  // Social Media types
  post: '#4ADE80',                      // Green for posts
  carousel: '#22D3EE',                  // Cyan for carousels
  caption: '#94A3B8',                   // Gray for captions
  template: '#F97316',                  // Orange for templates
  platform: '#6366F1',                  // Indigo for platforms
};

export default PORT_COLORS;
