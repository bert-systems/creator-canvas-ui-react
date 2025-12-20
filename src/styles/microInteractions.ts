/**
 * Micro-Interactions & Animation Utilities
 * Shared animation configurations for consistent UX polish
 *
 * Based on Creator's Toolbox + SmartAI brand guide
 */

import { keyframes, alpha } from '@mui/material';
import { brandColors, darkNeutrals, creativeCardTokens } from '@/theme';

// ============================================================================
// TIMING CONSTANTS (from brand guide)
// ============================================================================

export const timing = {
  instant: 100,      // Micro-feedback
  fast: 140,         // Hover states
  standard: 200,     // Most transitions
  emphasis: 300,     // Deliberate movements
  dramatic: 500,     // Major state changes
};

export const easing = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',     // Standard
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',   // Enter
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',   // Exit
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bounce
};

// ============================================================================
// KEYFRAME ANIMATIONS
// ============================================================================

/** Subtle pulse for attention */
export const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
`;

/** Shimmer effect for loading states */
export const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

/** Fade in animation */
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

/** Fade in with slide up */
export const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/** Fade in with scale */
export const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/** Gentle shake for errors */
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-4px);
  }
  40%, 80% {
    transform: translateX(4px);
  }
`;

/** Success checkmark animation */
export const checkmark = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

/** Ripple effect */
export const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

/** Glow pulse for running state */
export const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 ${alpha(brandColors.tealPulse, 0.4)};
  }
  50% {
    box-shadow: 0 0 16px 4px ${alpha(brandColors.tealPulse, 0.2)};
  }
`;

/** Skeleton loading gradient */
export const skeletonWave = keyframes`
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

// ============================================================================
// HOVER STYLES (MUI sx props)
// ============================================================================

/** Standard interactive element hover */
export const hoverLift = {
  transition: `all ${timing.fast}ms ${easing.smooth}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: creativeCardTokens.shadows.cardHover,
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: creativeCardTokens.shadows.card,
  },
};

/** Button-like hover with scale */
export const hoverScale = {
  transition: `all ${timing.fast}ms ${easing.smooth}`,
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
};

/** Icon button hover */
export const hoverIconButton = {
  transition: `all ${timing.fast}ms ${easing.smooth}`,
  '&:hover': {
    backgroundColor: alpha(brandColors.tealPulse, 0.1),
    color: brandColors.tealPulse,
  },
  '&:active': {
    backgroundColor: alpha(brandColors.tealPulse, 0.2),
  },
};

/** List item hover */
export const hoverListItem = {
  transition: `all ${timing.fast}ms ${easing.smooth}`,
  '&:hover': {
    backgroundColor: alpha(brandColors.tealPulse, 0.08),
    borderLeft: `3px solid ${brandColors.tealPulse}`,
    paddingLeft: '13px', // Compensate for border
  },
};

/** Card hover with glow */
export const hoverGlow = (color: string = brandColors.tealPulse) => ({
  transition: `all ${timing.standard}ms ${easing.smooth}`,
  '&:hover': {
    boxShadow: `0 0 20px ${alpha(color, 0.15)}`,
    borderColor: alpha(color, 0.5),
  },
});

// ============================================================================
// FOCUS STYLES (Accessibility)
// ============================================================================

/** Visible focus ring for keyboard navigation */
export const focusRing = {
  '&:focus-visible': {
    outline: `2px solid ${brandColors.tealPulse}`,
    outlineOffset: '2px',
  },
};

/** Focus ring for dark backgrounds */
export const focusRingLight = {
  '&:focus-visible': {
    outline: `2px solid ${brandColors.mintGlow}`,
    outlineOffset: '2px',
  },
};

// ============================================================================
// SKELETON LOADING STYLES
// ============================================================================

/** Base skeleton styling */
export const skeletonBase = {
  backgroundColor: darkNeutrals.surface2,
  borderRadius: `${creativeCardTokens.radius.control}px`,
  position: 'relative' as const,
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(90deg, transparent, ${alpha(darkNeutrals.textTertiary, 0.1)}, transparent)`,
    animation: `${skeletonWave} 1.5s infinite`,
  },
};

/** Skeleton text line */
export const skeletonText = (width: string = '100%') => ({
  ...skeletonBase,
  height: 14,
  width,
  marginBottom: 1,
});

/** Skeleton circle (avatar) */
export const skeletonCircle = (size: number = 40) => ({
  ...skeletonBase,
  width: size,
  height: size,
  borderRadius: '50%',
});

/** Skeleton rectangle (image/card) */
export const skeletonRect = (width: string | number = '100%', height: number = 100) => ({
  ...skeletonBase,
  width,
  height,
});

// ============================================================================
// STATE FEEDBACK STYLES
// ============================================================================

/** Success state styling */
export const successState = {
  borderColor: brandColors.mintGlow,
  backgroundColor: alpha(brandColors.mintGlow, 0.05),
  '& .MuiSvgIcon-root': {
    color: brandColors.mintGlow,
  },
};

/** Error state styling with shake */
export const errorState = {
  borderColor: brandColors.coralSpark,
  backgroundColor: alpha(brandColors.coralSpark, 0.05),
  animation: `${shake} 0.4s ease`,
  '& .MuiSvgIcon-root': {
    color: brandColors.coralSpark,
  },
};

/** Warning state styling */
export const warningState = {
  borderColor: brandColors.sunsetOrange,
  backgroundColor: alpha(brandColors.sunsetOrange, 0.05),
  '& .MuiSvgIcon-root': {
    color: brandColors.sunsetOrange,
  },
};

/** Running/Loading state styling */
export const runningState = {
  borderColor: brandColors.tealPulse,
  animation: `${glowPulse} 1.5s ease infinite`,
};

// ============================================================================
// ENTRANCE ANIMATIONS (for new elements)
// ============================================================================

/** Standard entrance */
export const entranceAnimation = {
  animation: `${fadeInUp} ${timing.standard}ms ${easing.decelerate}`,
};

/** Staggered entrance for lists */
export const staggeredEntrance = (index: number, baseDelay: number = 50) => ({
  animation: `${fadeInUp} ${timing.standard}ms ${easing.decelerate}`,
  animationDelay: `${index * baseDelay}ms`,
  animationFillMode: 'backwards' as const,
});

/** Scale entrance for modals/overlays */
export const scaleEntrance = {
  animation: `${fadeInScale} ${timing.emphasis}ms ${easing.spring}`,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Get animation CSS string */
export const getAnimation = (
  keyframe: ReturnType<typeof keyframes>,
  duration: number = timing.standard,
  easingFn: string = easing.smooth,
  iterations: number | 'infinite' = 1
) => `${keyframe} ${duration}ms ${easingFn} ${iterations === 'infinite' ? 'infinite' : iterations}`;

/** Create transition string for multiple properties */
export const createTransition = (
  properties: string[],
  duration: number = timing.standard,
  easingFn: string = easing.smooth
) => properties.map(prop => `${prop} ${duration}ms ${easingFn}`).join(', ');

export default {
  timing,
  easing,
  // Keyframes
  pulse,
  shimmer,
  fadeIn,
  fadeInUp,
  fadeInScale,
  shake,
  checkmark,
  ripple,
  glowPulse,
  skeletonWave,
  // Hover styles
  hoverLift,
  hoverScale,
  hoverIconButton,
  hoverListItem,
  hoverGlow,
  // Focus styles
  focusRing,
  focusRingLight,
  // Skeleton styles
  skeletonBase,
  skeletonText,
  skeletonCircle,
  skeletonRect,
  // State styles
  successState,
  errorState,
  warningState,
  runningState,
  // Entrance animations
  entranceAnimation,
  staggeredEntrance,
  scaleEntrance,
  // Utilities
  getAnimation,
  createTransition,
};
