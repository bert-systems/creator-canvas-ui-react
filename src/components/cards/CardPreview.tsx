/**
 * CardPreview Component
 * Hero preview area with variations strip for Creative Cards
 */

import { memo, useState, useCallback } from 'react';
import { Box, IconButton, Typography, Tooltip, alpha, Skeleton } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  Collections as VariationsIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { creativeCardTokens, categoryColors } from '../../theme';
import { cardAnimationStyles, transitions, glassStyles } from './cardAnimations';

// ============================================================================
// TYPES
// ============================================================================

interface CardPreviewProps {
  /** Array of image URLs for variations */
  images: string[];
  /** Currently selected image index */
  selectedIndex: number;
  /** Callback when an image is selected */
  onSelectImage: (index: number) => void;
  /** Optional thumbnail/placeholder when no images */
  placeholder?: string;
  /** Whether the card is in generating state */
  isGenerating?: boolean;
  /** Progress percentage (0-100) when generating */
  progress?: number;
  /** Category for theming */
  category?: string;
  /** Card display mode */
  mode?: 'hero' | 'craft' | 'mini';
  /** Callback to generate more variations */
  onGenerateMore?: () => void;
  /** Callback to download current image */
  onDownload?: () => void;
  /** Callback to open image in new tab */
  onOpenFullSize?: () => void;
  /** Title for the card */
  title?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CardPreview = memo(function CardPreview({
  images,
  selectedIndex,
  onSelectImage,
  placeholder,
  isGenerating = false,
  progress = 0,
  category = 'imageGen',
  mode = 'hero',
  onGenerateMore,
  onDownload,
  onOpenFullSize,
  title,
}: CardPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentImage = images[selectedIndex] || placeholder;
  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const categoryColor = categoryColors[category as keyof typeof categoryColors]?.main || categoryColors.imageGen.main;

  // Get preview height based on mode
  const getPreviewHeight = () => {
    if (mode === 'mini') return 48;
    if (mode === 'craft') return creativeCardTokens.dimensions.expanded.height * creativeCardTokens.preview.heroRatio;
    return creativeCardTokens.dimensions.default.height * creativeCardTokens.preview.heroRatio;
  };

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // ============================================================================
  // MINI MODE RENDER
  // ============================================================================

  if (mode === 'mini') {
    return (
      <Box
        sx={{
          width: creativeCardTokens.preview.thumbnailSize,
          height: creativeCardTokens.preview.thumbnailSize,
          borderRadius: `${creativeCardTokens.radius.thumbnail}px`,
          overflow: 'hidden',
          flexShrink: 0,
          bgcolor: 'background.default',
          position: 'relative',
        }}
      >
        {isGenerating ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
            sx={{ bgcolor: alpha(categoryColor, 0.2) }}
          />
        ) : currentImage ? (
          <Box
            component="img"
            src={currentImage}
            alt={title || 'Preview'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(categoryColor, 0.1),
            }}
          >
            <VariationsIcon sx={{ fontSize: 20, color: alpha(categoryColor, 0.5) }} />
          </Box>
        )}
      </Box>
    );
  }

  // ============================================================================
  // HERO/CRAFT MODE RENDER
  // ============================================================================

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* Main Preview Area */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: getPreviewHeight(),
          borderRadius: `${creativeCardTokens.radius.inner}px`,
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image or Placeholder */}
        {isGenerating ? (
          // Generating State
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(categoryColor, 0.05),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer Effect */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                ...cardAnimationStyles.shimmer,
              }}
            />

            {/* Progress Ring */}
            <Box
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke={alpha(categoryColor, 0.2)}
                  strokeWidth="4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke={categoryColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  fontWeight: 600,
                  color: categoryColor,
                }}
              >
                {progress}%
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                mt: 1.5,
                color: 'text.secondary',
              }}
            >
              Creating magic...
            </Typography>
          </Box>
        ) : currentImage ? (
          // Image Display
          <>
            {!imageLoaded && (
              <Skeleton
                variant="rectangular"
                width="100%"
                height="100%"
                animation="wave"
                sx={{ position: 'absolute', bgcolor: alpha(categoryColor, 0.1) }}
              />
            )}
            <Box
              component="img"
              src={currentImage}
              alt={title || 'Preview'}
              onLoad={handleImageLoad}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: transitions.normal,
                cursor: 'pointer',
              }}
              onClick={onOpenFullSize}
            />
          </>
        ) : (
          // Empty Placeholder
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(categoryColor, 0.05),
              border: `2px dashed ${alpha(categoryColor, 0.2)}`,
              borderRadius: `${creativeCardTokens.radius.inner}px`,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: alpha(categoryColor, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <PlayIcon sx={{ fontSize: 28, color: categoryColor }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Ready to create
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Click generate to start
            </Typography>
          </Box>
        )}

        {/* Hover Overlay with Quick Actions */}
        {hasImages && !isGenerating && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              ...glassStyles.backgroundLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              opacity: isHovered ? 1 : 0,
              transition: transitions.fast,
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
          >
            <Tooltip title="View Full Size">
              <IconButton
                size="small"
                onClick={onOpenFullSize}
                sx={{
                  bgcolor: alpha('#fff', 0.15),
                  '&:hover': { bgcolor: alpha('#fff', 0.25) },
                }}
              >
                <ZoomInIcon sx={{ color: 'white' }} />
              </IconButton>
            </Tooltip>

            {onDownload && (
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  onClick={onDownload}
                  sx={{
                    bgcolor: alpha('#fff', 0.15),
                    '&:hover': { bgcolor: alpha('#fff', 0.25) },
                  }}
                >
                  <DownloadIcon sx={{ color: 'white' }} />
                </IconButton>
              </Tooltip>
            )}

            {onGenerateMore && (
              <Tooltip title="Generate Variations">
                <IconButton
                  size="small"
                  onClick={onGenerateMore}
                  sx={{
                    bgcolor: alpha('#fff', 0.15),
                    '&:hover': { bgcolor: alpha('#fff', 0.25) },
                  }}
                >
                  <VariationsIcon sx={{ color: 'white' }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Variations Strip (only show in craft mode or when multiple images) */}
      {(mode === 'craft' || hasMultipleImages) && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            height: creativeCardTokens.preview.variationStripHeight,
            overflow: 'hidden',
          }}
        >
          {images.slice(0, 5).map((img, idx) => (
            <Box
              key={idx}
              onClick={() => onSelectImage(idx)}
              sx={{
                width: creativeCardTokens.preview.thumbnailSize,
                height: creativeCardTokens.preview.thumbnailSize,
                borderRadius: `${creativeCardTokens.radius.thumbnail}px`,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: selectedIndex === idx ? categoryColor : 'transparent',
                opacity: selectedIndex === idx ? 1 : 0.6,
                transition: transitions.fast,
                '&:hover': {
                  opacity: 1,
                  borderColor: alpha(categoryColor, 0.5),
                },
              }}
            >
              <Box
                component="img"
                src={img}
                alt={`Variation ${idx + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}

          {/* Generate More Button */}
          {onGenerateMore && (
            <Box
              onClick={onGenerateMore}
              sx={{
                width: creativeCardTokens.preview.thumbnailSize,
                height: creativeCardTokens.preview.thumbnailSize,
                borderRadius: `${creativeCardTokens.radius.thumbnail}px`,
                border: `2px dashed ${alpha(categoryColor, 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: transitions.fast,
                '&:hover': {
                  borderColor: categoryColor,
                  bgcolor: alpha(categoryColor, 0.1),
                },
              }}
            >
              <AddIcon sx={{ color: alpha(categoryColor, 0.7) }} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
});

export default CardPreview;
