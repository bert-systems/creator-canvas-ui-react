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
};

export default PORT_COLORS;
