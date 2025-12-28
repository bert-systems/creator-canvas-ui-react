/**
 * StatusIndicator - Minimal, refined status states
 * No dramatic glows or pulses - subtle, professional indicators
 */

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { studioColors, studioTypography } from './studioTokens';

export type StatusState = 'idle' | 'active' | 'processing' | 'success' | 'warning' | 'error';

const stateColors: Record<StatusState, string> = {
  idle: studioColors.textMuted,
  active: studioColors.blue,
  processing: studioColors.accent,
  success: studioColors.success,
  warning: studioColors.warning,
  error: studioColors.error,
};

const stateLabels: Record<StatusState, string> = {
  idle: 'Idle',
  active: 'Active',
  processing: 'Processing',
  success: 'Complete',
  warning: 'Warning',
  error: 'Error',
};

// Subtle pulse animation for processing state
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

export interface StatusIndicatorProps {
  /** Current status state */
  state: StatusState;
  /** Size of the indicator dot */
  size?: number;
  /** Whether to show pulse animation for processing */
  animated?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  state,
  size = 8,
  animated = true,
}) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      bgcolor: stateColors[state],
      flexShrink: 0,
      ...(state === 'processing' && animated && {
        animation: `${pulse} 1.5s ease-in-out infinite`,
      }),
    }}
  />
);

export interface StatusBadgeProps {
  /** Current status state */
  state: StatusState;
  /** Custom label (defaults to state name) */
  label?: string;
  /** Size of the indicator dot */
  dotSize?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  state,
  label,
  dotSize = 6,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <StatusIndicator state={state} size={dotSize} />
    <Typography
      sx={{
        color: stateColors[state],
        fontSize: studioTypography.fontSize.sm,
        fontWeight: studioTypography.fontWeight.medium,
        lineHeight: 1,
      }}
    >
      {label || stateLabels[state]}
    </Typography>
  </Box>
);

export interface StatusChipProps {
  /** Current status state */
  state: StatusState;
  /** Custom label (defaults to state name) */
  label?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  state,
  label,
}) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      px: 1.5,
      py: 0.5,
      borderRadius: 999,
      bgcolor: `${stateColors[state]}15`, // 15% opacity background
      border: `1px solid ${stateColors[state]}30`,
    }}
  >
    <StatusIndicator state={state} size={6} />
    <Typography
      sx={{
        color: stateColors[state],
        fontSize: studioTypography.fontSize.xs,
        fontWeight: studioTypography.fontWeight.medium,
        lineHeight: 1,
      }}
    >
      {label || stateLabels[state]}
    </Typography>
  </Box>
);

export default StatusIndicator;
