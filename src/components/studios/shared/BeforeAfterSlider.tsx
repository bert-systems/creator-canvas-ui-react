/**
 * BeforeAfterSlider - Interactive comparison slider for before/after images
 * Allows users to drag a slider to reveal the transformation
 */

import React, { useState, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { studioColors, studioTypography, studioRadii } from './studioTokens';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  aspectRatio = '16/9',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  // Also handle mouse leave to stop dragging
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      sx={{
        position: 'relative',
        aspectRatio,
        borderRadius: `${studioRadii.lg}px`,
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        border: `1px solid ${studioColors.border}`,
      }}
    >
      {/* After Image (full width, underneath) */}
      <Box
        component="img"
        src={afterImage}
        alt={afterLabel}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Before Image (clipped) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
      >
        <Box
          component="img"
          src={beforeImage}
          alt={beforeLabel}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Slider Line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          transform: 'translateX(-50%)',
          width: 3,
          background: '#fff',
          boxShadow: '0 0 8px rgba(0,0,0,0.5)',
          zIndex: 2,
        }}
      />

      {/* Slider Handle */}
      <Box
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        sx={{
          position: 'absolute',
          top: '50%',
          left: `${sliderPosition}%`,
          transform: 'translate(-50%, -50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          zIndex: 3,
          transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          },
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        {/* Arrows */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: `8px solid ${studioColors.textMuted}`,
            }}
          />
          <Box
            sx={{
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: `8px solid ${studioColors.textMuted}`,
            }}
          />
        </Box>
      </Box>

      {/* Labels */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: 'rgba(0,0,0,0.7)',
          px: 1.5,
          py: 0.5,
          borderRadius: `${studioRadii.sm}px`,
          opacity: sliderPosition > 15 ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: '#fff', fontWeight: 500 }}>
          {beforeLabel}
        </Typography>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(0,0,0,0.7)',
          px: 1.5,
          py: 0.5,
          borderRadius: `${studioRadii.sm}px`,
          opacity: sliderPosition < 85 ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: '#fff', fontWeight: 500 }}>
          {afterLabel}
        </Typography>
      </Box>

      {/* Instructions (shown briefly) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          px: 2,
          py: 0.75,
          borderRadius: `${studioRadii.md}px`,
          pointerEvents: 'none',
        }}
      >
        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: 'rgba(255,255,255,0.9)' }}>
          Drag to compare
        </Typography>
      </Box>
    </Box>
  );
};

export default BeforeAfterSlider;
