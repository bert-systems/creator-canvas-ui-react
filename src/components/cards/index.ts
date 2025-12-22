/**
 * Creative Cards - Component Exports
 *
 * The Creative Card system is the visual heart of the Canvas Studio.
 * Cards are designed to feel like collectible trading cards that
 * inspire creativity and showcase results beautifully.
 */

// Main Card Component
export { CreativeCard, default } from './CreativeCard';

// Sub-components
export { CardPreview } from './CardPreview';
export { CardControls } from './CardControls';
export type { CardControlsProps } from './CardControls';
export { QuickStyles, DEFAULT_STYLE_PRESETS } from './QuickStyles';
export type { StylePreset } from './QuickStyles';

// Animation System
export {
  // Keyframe animations
  shimmer,
  gentlePulse,
  borderGlow,
  celebrationBurst,
  fadeIn,
  scaleIn,
  slideInUp,
  gentleShake,
  floatUp,
  connectionSpark,
  flowDots,
  // Animation styles
  cardAnimationStyles,
  // Transitions
  transitions,
  // Glass effects
  glassStyles,
  // Utilities
  getCardDimensions,
  getStateAnimationStyle,
  getCategoryBorderColor,
} from './cardAnimations';

export type { CardDisplayMode, CardState } from './cardAnimations';

// Connection Lines
export {
  ConnectionLine,
  StandardEdge,
  FlowingEdge,
  StyleEdge,
  CharacterEdge,
  DelightEdge,
} from './ConnectionLine';
export type { PortDataType, ConnectionLineData } from './ConnectionLine';
