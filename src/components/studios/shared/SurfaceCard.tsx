/**
 * SurfaceCard - Clean, minimal card component
 * Solid backgrounds, subtle hover states - no glassmorphism
 */

import React from 'react';
import { Box, type BoxProps } from '@mui/material';
import { studioColors, studioRadii, studioMotion, studioShadows } from './studioTokens';

export interface SurfaceCardProps extends Omit<BoxProps, 'component'> {
  /** Elevation level affects background brightness */
  elevation?: 0 | 1 | 2 | 3;
  /** Whether the card is interactive (shows hover states) */
  interactive?: boolean;
  /** Whether the card is currently selected */
  selected?: boolean;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Optional click handler */
  onClick?: () => void;
}

const elevationMap = {
  0: studioColors.carbon,
  1: studioColors.surface1,
  2: studioColors.surface2,
  3: studioColors.surface3,
};

const paddingMap = {
  none: 0,
  sm: 2,
  md: 3,
  lg: 4,
};

export const SurfaceCard: React.FC<SurfaceCardProps> = ({
  elevation = 1,
  interactive = false,
  selected = false,
  padding = 'md',
  onClick,
  children,
  sx,
  ...props
}) => {
  const isClickable = interactive || !!onClick;

  return (
    <Box
      onClick={onClick}
      sx={{
        background: selected ? studioColors.surface2 : elevationMap[elevation],
        border: `1px solid ${selected ? studioColors.borderHover : studioColors.border}`,
        borderRadius: `${studioRadii.md}px`,
        padding: paddingMap[padding],
        transition: `all ${studioMotion.fast}`,
        cursor: isClickable ? 'pointer' : 'default',

        ...(isClickable && {
          '&:hover': {
            background: studioColors.surface2,
            borderColor: studioColors.borderHover,
          },
        }),

        ...(selected && {
          boxShadow: studioShadows.sm,
        }),

        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * GlassPanel - For overlays, modals, and dropdowns only
 * Uses backdrop blur - reserved for floating elements
 */
export const GlassPanel: React.FC<BoxProps> = ({ children, sx, ...props }) => (
  <Box
    sx={{
      background: 'rgba(15, 15, 17, 0.90)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: `${studioRadii.lg}px`,
      boxShadow: studioShadows.xl,
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

export default SurfaceCard;
