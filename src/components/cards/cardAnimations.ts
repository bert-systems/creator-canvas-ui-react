/**
 * Card Animation System
 * Provides animation keyframes, timing, and utility functions for Creative Cards
 */

import { keyframes } from '@mui/system';
import { creativeCardTokens } from '../../theme';

// ============================================================================
// KEYFRAME ANIMATIONS
// ============================================================================

/** Subtle shimmer effect for generating state */
export const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

/** Gentle pulse for waiting/queued state */
export const gentlePulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.995);
  }
`;

/** Border glow animation for selected state */
export const borderGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 12px var(--glow-color, rgba(99, 102, 241, 0.4));
  }
  50% {
    box-shadow: 0 0 20px var(--glow-color, rgba(99, 102, 241, 0.6));
  }
`;

/** Celebration burst for completion */
export const celebrationBurst = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  20% {
    opacity: 1;
    transform: scale(1.05);
  }
  40% {
    transform: scale(0.98);
  }
  60% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
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

/** Scale in animation */
export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

/** Slide in from bottom */
export const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/** Gentle shake for error */
export const gentleShake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
`;

/** Float up effect for card lift */
export const floatUp = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-4px);
  }
`;

/** Connection spark animation */
export const connectionSpark = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
`;

/** Flow dots animation for connections */
export const flowDots = keyframes`
  0% {
    stroke-dashoffset: 24;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

// ============================================================================
// ANIMATION STYLES
// ============================================================================

export const cardAnimationStyles = {
  /** Shimmer effect for generating state */
  shimmer: {
    background: `linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 20%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 80%,
      transparent 100%
    )`,
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s ease-in-out infinite`,
  },

  /** Pulsing border for queued state */
  queuedPulse: {
    animation: `${gentlePulse} 2s ease-in-out infinite`,
  },

  /** Selected glow effect */
  selectedGlow: {
    animation: `${borderGlow} 2s ease-in-out infinite`,
  },

  /** Celebration for completion */
  celebration: {
    animation: `${celebrationBurst} ${creativeCardTokens.timing.celebration}ms ${creativeCardTokens.easing.bounce}`,
  },

  /** Fade in */
  fadeIn: {
    animation: `${fadeIn} ${creativeCardTokens.timing.normal}ms ${creativeCardTokens.easing.smooth}`,
  },

  /** Scale in */
  scaleIn: {
    animation: `${scaleIn} ${creativeCardTokens.timing.normal}ms ${creativeCardTokens.easing.smooth}`,
  },

  /** Slide up */
  slideUp: {
    animation: `${slideInUp} ${creativeCardTokens.timing.fast}ms ${creativeCardTokens.easing.out}`,
  },

  /** Error shake */
  errorShake: {
    animation: `${gentleShake} 400ms ease-in-out`,
  },

  /** Hover lift */
  hoverLift: {
    transition: `all ${creativeCardTokens.timing.fast}ms ${creativeCardTokens.easing.smooth}`,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: creativeCardTokens.shadows.cardHover,
    },
  },
};

// ============================================================================
// TRANSITION HELPERS
// ============================================================================

export const transitions = {
  /** Fast transition for instant feedback */
  instant: `all ${creativeCardTokens.timing.instant}ms ${creativeCardTokens.easing.smooth}`,
  /** Fast transition for quick interactions */
  fast: `all ${creativeCardTokens.timing.fast}ms ${creativeCardTokens.easing.smooth}`,
  /** Normal transition for most animations */
  normal: `all ${creativeCardTokens.timing.normal}ms ${creativeCardTokens.easing.smooth}`,
  /** Slow transition for dramatic effects */
  slow: `all ${creativeCardTokens.timing.slow}ms ${creativeCardTokens.easing.smooth}`,
  /** Bouncy transition for celebrations */
  bounce: `all ${creativeCardTokens.timing.normal}ms ${creativeCardTokens.easing.bounce}`,
};

// ============================================================================
// GLASSMORPHISM HELPERS
// ============================================================================

export const glassStyles = {
  /** Standard glassmorphism background */
  background: {
    background: creativeCardTokens.glass.background,
    backdropFilter: `blur(${creativeCardTokens.glass.blur}px)`,
    WebkitBackdropFilter: `blur(${creativeCardTokens.glass.blur}px)`,
    border: `1px solid ${creativeCardTokens.glass.border}`,
  },

  /** Light glassmorphism for overlays */
  backgroundLight: {
    background: creativeCardTokens.glass.backgroundLight,
    backdropFilter: `blur(${creativeCardTokens.glass.blur}px)`,
    WebkitBackdropFilter: `blur(${creativeCardTokens.glass.blur}px)`,
    border: `1px solid ${creativeCardTokens.glass.border}`,
  },

  /** Active/selected glassmorphism */
  backgroundActive: {
    background: creativeCardTokens.glass.background,
    backdropFilter: `blur(${creativeCardTokens.glass.blur}px)`,
    WebkitBackdropFilter: `blur(${creativeCardTokens.glass.blur}px)`,
    border: `1px solid ${creativeCardTokens.glass.borderActive}`,
  },
};

// ============================================================================
// CARD STATE UTILITIES
// ============================================================================

export type CardDisplayMode = 'hero' | 'craft' | 'mini';
export type CardState = 'idle' | 'queued' | 'generating' | 'completed' | 'error';

/** Get dimensions for a card mode */
export const getCardDimensions = (mode: CardDisplayMode) => {
  switch (mode) {
    case 'mini':
      return creativeCardTokens.dimensions.mini;
    case 'craft':
      return creativeCardTokens.dimensions.expanded;
    case 'hero':
    default:
      return creativeCardTokens.dimensions.default;
  }
};

/** Get animation style for a card state */
export const getStateAnimationStyle = (state: CardState) => {
  switch (state) {
    case 'queued':
      return cardAnimationStyles.queuedPulse;
    case 'generating':
      return cardAnimationStyles.shimmer;
    case 'completed':
      return cardAnimationStyles.celebration;
    case 'error':
      return cardAnimationStyles.errorShake;
    case 'idle':
    default:
      return {};
  }
};

/** Get border color for a category */
export const getCategoryBorderColor = (category: string, alpha = 0.5): string => {
  const colors: Record<string, string> = {
    input: `rgba(139, 92, 246, ${alpha})`,
    imageGen: `rgba(59, 130, 246, ${alpha})`,
    videoGen: `rgba(34, 197, 94, ${alpha})`,
    threeD: `rgba(249, 115, 22, ${alpha})`,
    character: `rgba(236, 72, 153, ${alpha})`,
    style: `rgba(6, 182, 212, ${alpha})`,
    fashion: `rgba(236, 72, 153, ${alpha})`,
    story: `rgba(245, 158, 11, ${alpha})`,
    logic: `rgba(107, 114, 128, ${alpha})`,
    audio: `rgba(168, 85, 247, ${alpha})`,
    output: `rgba(6, 182, 212, ${alpha})`,
    composite: `rgba(99, 102, 241, ${alpha})`,
    agent: `rgba(232, 10, 222, ${alpha})`,
  };
  return colors[category] || `rgba(99, 102, 241, ${alpha})`;
};
