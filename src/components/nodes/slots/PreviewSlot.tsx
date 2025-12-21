/**
 * PreviewSlot Component
 *
 * Displays preview content (image, video, text, 3D) within UnifiedNode.
 *
 * @module PreviewSlot
 */

import { memo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  ZoomIn as ZoomIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  TextFields as TextIcon,
  ViewInAr as ThreeDIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

import type { PreviewSlotConfig, NodeOutput, NodeStatus } from '../../../models/unifiedNode';
import type { NodeResult } from '../../../models/canvas';

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeInAnimation = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

// ============================================================================
// PROPS
// ============================================================================

interface PreviewSlotProps {
  config: PreviewSlotConfig;
  result?: NodeOutput | NodeResult;
  status: NodeStatus;
  progress?: number;
  onZoom?: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
}

// ============================================================================
// ASPECT RATIO HELPERS
// ============================================================================

const getAspectRatioPadding = (aspectRatio: string): string => {
  switch (aspectRatio) {
    case '1:1': return '100%';
    case '4:3': return '75%';
    case '3:4': return '133.33%';
    case '16:9': return '56.25%';
    case '9:16': return '177.78%';
    default: return '75%';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export const PreviewSlot = memo<PreviewSlotProps>(({
  config,
  result,
  status,
  progress,
  onZoom,
  onDownload,
  onFullscreen,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get the URL from various result formats
  const getResultUrl = (): string | undefined => {
    if (!result) return undefined;
    if ('url' in result && result.url) return result.url;
    if ('urls' in result && result.urls && result.urls.length > 0) return result.urls[0];
    return undefined;
  };

  // Get text content from result
  const getTextContent = (): string | undefined => {
    if (!result) return undefined;
    if ('text' in result && result.text) return result.text;
    if ('data' in result && result.data) {
      // Check common text fields
      const data = result.data as Record<string, unknown>;
      if (typeof data.enhancedPrompt === 'string') return data.enhancedPrompt;
      if (typeof data.text === 'string') return data.text;
      if (typeof data.content === 'string') return data.content;
    }
    return undefined;
  };

  const resultUrl = getResultUrl();
  const textContent = getTextContent();
  const resultType = result?.type || config.type;

  // Determine what to render
  const hasContent = resultUrl || textContent;
  const isLoading = status === 'running' || status === 'queued';
  const hasError = status === 'error' || imageError;

  // Container styles - conditionally add paddingTop and minHeight based on aspectRatio
  const containerSx = {
    position: 'relative' as const,
    width: '100%',
    bgcolor: 'action.hover',
    borderRadius: 1,
    overflow: 'hidden',
    mb: 1,
    ...(config.aspectRatio !== 'auto' && { paddingTop: getAspectRatioPadding(config.aspectRatio || '4:3') }),
    ...(config.aspectRatio === 'auto' && { minHeight: 80 }),
  };

  // Content wrapper (positioned absolute for aspect ratio boxes)
  const contentWrapperSx = {
    position: (config.aspectRatio !== 'auto' ? 'absolute' : 'relative') as 'absolute' | 'relative',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Render loading state
  if (isLoading) {
    return (
      <Box sx={containerSx}>
        <Box sx={contentWrapperSx}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CircularProgress
              size={32}
              variant={progress !== undefined ? 'determinate' : 'indeterminate'}
              value={progress}
              sx={{ color: '#26CABF' }}
            />
            {progress !== undefined && (
              <Typography variant="caption" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // Render empty state
  if (!hasContent && !hasError) {
    return (
      <Box sx={containerSx}>
        <Box sx={contentWrapperSx}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.disabled',
            }}
          >
            {config.type === 'image' && <ImageIcon sx={{ fontSize: 32 }} />}
            {config.type === 'video' && <VideoIcon sx={{ fontSize: 32 }} />}
            {config.type === 'text' && <TextIcon sx={{ fontSize: 32 }} />}
            {config.type === 'mesh3d' && <ThreeDIcon sx={{ fontSize: 32 }} />}
            <Typography variant="caption">
              Ready to generate
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // Render error state
  if (hasError && !hasContent) {
    return (
      <Box sx={{ ...containerSx, bgcolor: 'error.main', opacity: 0.1 }}>
        <Box sx={contentWrapperSx}>
          <Typography variant="caption" color="error">
            Generation failed
          </Typography>
        </Box>
      </Box>
    );
  }

  // Render image content
  if ((resultType === 'image' || config.type === 'image') && resultUrl) {
    return (
      <Box
        sx={containerSx}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={contentWrapperSx}>
          <Box
            component="img"
            src={resultUrl}
            alt="Generated result"
            onError={() => setImageError(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: `${fadeInAnimation} 0.3s ease-out`,
            }}
          />

          {/* Hover overlay */}
          {isHovered && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              {config.showZoom && (
                <Tooltip title="Zoom">
                  <IconButton size="small" onClick={onZoom} sx={{ color: 'white' }}>
                    <ZoomIcon />
                  </IconButton>
                </Tooltip>
              )}
              {config.showDownload && (
                <Tooltip title="Download">
                  <IconButton size="small" onClick={onDownload} sx={{ color: 'white' }}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
              {config.showFullscreen && (
                <Tooltip title="Fullscreen">
                  <IconButton size="small" onClick={onFullscreen} sx={{ color: 'white' }}>
                    <FullscreenIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // Render video content
  if ((resultType === 'video' || config.type === 'video') && resultUrl) {
    return (
      <Box
        sx={containerSx}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box sx={contentWrapperSx}>
          <Box
            component="video"
            src={resultUrl}
            loop
            muted
            playsInline
            autoPlay={false}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            ref={(el: HTMLVideoElement | null) => {
              if (el) {
                if (isPlaying) el.play();
                else el.pause();
              }
            }}
          />

          {/* Play/Pause overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: isHovered ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
              transition: 'background-color 0.2s',
            }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {(isHovered || !isPlaying) && (
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // Render text content
  if ((resultType === 'text' || config.type === 'text') && textContent) {
    return (
      <Box
        sx={{
          ...containerSx,
          p: 1.5,
          bgcolor: 'action.selected',
          maxHeight: 200,
          overflowY: 'auto',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '0.75rem',
            lineHeight: 1.5,
          }}
        >
          {textContent}
        </Typography>
      </Box>
    );
  }

  // Fallback: show placeholder
  return (
    <Box sx={containerSx}>
      <Box sx={contentWrapperSx}>
        <Typography variant="caption" color="text.secondary">
          No preview available
        </Typography>
      </Box>
    </Box>
  );
});

PreviewSlot.displayName = 'PreviewSlot';

export default PreviewSlot;
