/**
 * SkeletonNode - Loading placeholder for nodes
 * Shows animated skeleton while node data is loading
 */

import { memo } from 'react';
import { Box, Paper } from '@mui/material';
import { darkNeutrals, creativeCardTokens } from '@/theme';
import { skeletonText, skeletonRect, skeletonCircle } from '@/styles/microInteractions';

interface SkeletonNodeProps {
  /** Width of the skeleton node */
  width?: number;
  /** Height of the skeleton node */
  height?: number;
  /** Whether to show image placeholder */
  showImage?: boolean;
  /** Number of text lines to show */
  textLines?: number;
}

export const SkeletonNode = memo(function SkeletonNode({
  width = 220,
  height = 160,
  showImage = true,
  textLines = 2,
}: SkeletonNodeProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        width,
        height,
        borderRadius: `${creativeCardTokens.radius.card}px`,
        overflow: 'hidden',
        bgcolor: darkNeutrals.surface1,
        border: `1px solid ${darkNeutrals.border}`,
      }}
    >
      {/* Header skeleton */}
      <Box
        sx={{
          height: 36,
          bgcolor: darkNeutrals.surface2,
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          gap: 1,
        }}
      >
        {/* Icon placeholder */}
        <Box sx={skeletonCircle(20)} />
        {/* Title placeholder */}
        <Box sx={{ flex: 1 }}>
          <Box sx={skeletonText('70%')} />
        </Box>
      </Box>

      {/* Content area */}
      <Box sx={{ p: 1.5 }}>
        {/* Image placeholder */}
        {showImage && (
          <Box sx={{ ...skeletonRect('100%', 60), mb: 1.5 }} />
        )}

        {/* Text lines */}
        {Array.from({ length: textLines }).map((_, i) => (
          <Box
            key={i}
            sx={skeletonText(i === textLines - 1 ? '60%' : '100%')}
          />
        ))}
      </Box>

      {/* Port placeholders */}
      <Box
        sx={{
          position: 'absolute',
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <Box sx={{ ...skeletonCircle(12), mb: 1 }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <Box sx={skeletonCircle(12)} />
      </Box>
    </Paper>
  );
});

/**
 * SkeletonNodeList - Multiple skeleton nodes for list loading
 */
interface SkeletonNodeListProps {
  /** Number of skeleton nodes to show */
  count?: number;
  /** Layout direction */
  direction?: 'row' | 'column';
  /** Gap between items */
  gap?: number;
}

export const SkeletonNodeList = memo(function SkeletonNodeList({
  count = 3,
  direction = 'column',
  gap = 2,
}: SkeletonNodeListProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonNode key={i} />
      ))}
    </Box>
  );
});

/**
 * SkeletonPaletteItem - Loading placeholder for palette items
 */
export const SkeletonPaletteItem = memo(function SkeletonPaletteItem() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1,
        px: 2,
      }}
    >
      <Box sx={skeletonCircle(32)} />
      <Box sx={{ flex: 1 }}>
        <Box sx={skeletonText('60%')} />
        <Box sx={{ ...skeletonText('40%'), height: 10, mt: 0.5 }} />
      </Box>
    </Box>
  );
});

/**
 * SkeletonCard - Loading placeholder for cards
 */
interface SkeletonCardProps {
  width?: number | string;
  height?: number;
  showActions?: boolean;
}

export const SkeletonCard = memo(function SkeletonCard({
  width = '100%',
  height = 200,
  showActions = true,
}: SkeletonCardProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        width,
        borderRadius: `${creativeCardTokens.radius.card}px`,
        overflow: 'hidden',
        bgcolor: darkNeutrals.surface1,
        border: `1px solid ${darkNeutrals.border}`,
      }}
    >
      {/* Image area */}
      <Box sx={skeletonRect('100%', height * 0.6)} />

      {/* Content area */}
      <Box sx={{ p: 2 }}>
        <Box sx={skeletonText('80%')} />
        <Box sx={{ ...skeletonText('50%'), mt: 1 }} />

        {/* Actions */}
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Box sx={{ ...skeletonRect(60, 28), borderRadius: `${creativeCardTokens.radius.control}px` }} />
            <Box sx={{ ...skeletonRect(60, 28), borderRadius: `${creativeCardTokens.radius.control}px` }} />
          </Box>
        )}
      </Box>
    </Paper>
  );
});

export default SkeletonNode;
