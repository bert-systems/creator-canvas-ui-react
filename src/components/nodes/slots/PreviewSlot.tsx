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
  Chip,
  Stack,
  Collapse,
  Button,
  alpha,
} from '@mui/material';
import {
  ZoomIn as ZoomIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  ViewInAr as ThreeDIcon,
  AutoStories as StoryIcon,
  Person as CharacterIcon,
  Timeline as OutlineIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  AccountTree as WorkflowIcon,
  BookmarkAdd as SaveLibraryIcon,
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
// STORY PREVIEW TYPES (for enhanced narrative nodes)
// ============================================================================

interface StoryCharacter {
  name: string;
  role: string;
  archetype: string;
  briefDescription: string;
  motivation?: string;
}

interface StoryAct {
  actNumber: number;
  title: string;
  summary: string;
}

interface StoryOutline {
  acts: StoryAct[];
  majorBeats?: string[];
}

interface StoryData {
  id?: string;
  title: string;
  premise: string;
  themes?: string[];
  genre?: string;
  tone?: string;
  logline?: string;
  tagline?: string;
  centralConflict?: string;
  hook?: string;
}

// Story-specific colors
const STORY_COLOR = '#10b981';
const CHARACTER_COLOR = '#8b5cf6';
const OUTLINE_COLOR = '#3b82f6';

// ============================================================================
// PROPS
// ============================================================================

interface PreviewSlotProps {
  config: PreviewSlotConfig;
  result?: NodeOutput | NodeResult;
  /** Raw cached output from API (may have images[] format) */
  cachedOutput?: Record<string, unknown>;
  status: NodeStatus;
  progress?: number;
  /** Node type for specialized rendering (e.g., storyGenesis) */
  nodeType?: string;
  onZoom?: () => void;
  onDownload?: () => void;
  onFullscreen?: () => void;
  /** Callback to generate workflow nodes from Story Genesis output */
  onAutoGenerateWorkflow?: () => void;
  /** Callback to save story to library */
  onSaveToLibrary?: () => void;
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
  cachedOutput,
  status,
  progress,
  nodeType,
  onZoom,
  onDownload,
  onFullscreen,
  onAutoGenerateWorkflow,
  onSaveToLibrary,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showOutline, setShowOutline] = useState(false);

  // Check if this is story data with rich preview
  const isStoryNode = nodeType === 'storyGenesis';
  const storyData = cachedOutput?.story as StoryData | undefined;
  const characters = cachedOutput?.characters as StoryCharacter[] | undefined;
  const outline = cachedOutput?.outline as StoryOutline | undefined;
  const hasRichStoryData = isStoryNode && storyData?.title;

  // Get the URL from various result formats
  const getResultUrl = (): string | undefined => {
    // First try the properly formatted result object
    if (result) {
      if ('url' in result && result.url) return result.url;
      if ('urls' in result && result.urls && result.urls.length > 0) return result.urls[0];
    }

    // Fallback to cachedOutput (raw API response format)
    if (cachedOutput) {
      // Handle { images: [{ url: '...' }] } format
      if (cachedOutput.images && Array.isArray(cachedOutput.images) && cachedOutput.images.length > 0) {
        const firstImage = cachedOutput.images[0] as Record<string, unknown>;
        if (typeof firstImage === 'string') return firstImage;
        if (firstImage && typeof firstImage.url === 'string') return firstImage.url;
      }
      // Handle direct imageUrl
      if (typeof cachedOutput.imageUrl === 'string') return cachedOutput.imageUrl;
      // Handle { video: '...' } or { videoUrl: '...' } format
      if (typeof cachedOutput.video === 'string') return cachedOutput.video;
      if (typeof cachedOutput.videoUrl === 'string') return cachedOutput.videoUrl;
    }

    return undefined;
  };

  // Get text content from result or cachedOutput
  const getTextContent = (): string | undefined => {
    // First try the formatted result
    if (result) {
      if ('text' in result && result.text) return result.text;
      if ('data' in result && result.data) {
        const data = result.data as Record<string, unknown>;
        if (typeof data.enhancedPrompt === 'string') return data.enhancedPrompt;
        if (typeof data.text === 'string') return data.text;
        if (typeof data.content === 'string') return data.content;
      }
    }

    // Fallback to cachedOutput
    if (cachedOutput) {
      if (typeof cachedOutput.enhancedPrompt === 'string') return cachedOutput.enhancedPrompt;
      if (typeof cachedOutput.text === 'string') return cachedOutput.text;
      if (typeof cachedOutput.result === 'string') return cachedOutput.result;
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
    // For text types (input nodes), don't show placeholder - wait for content
    if (config.type === 'text') {
      return null; // No empty state for text - will show content when provided
    }

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

  // Render enhanced story preview (Moment of Delight for Story Genesis)
  if (hasRichStoryData && storyData) {
    return (
      <Box
        sx={{
          ...containerSx,
          bgcolor: alpha(STORY_COLOR, 0.03),
          border: `1px solid ${alpha(STORY_COLOR, 0.2)}`,
          borderRadius: 1.5,
          overflow: 'hidden',
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {/* Story Header with Title */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(STORY_COLOR, 0.15)} 0%, ${alpha('#6366f1', 0.1)} 100%)`,
            p: 1.5,
            borderBottom: `1px solid ${alpha(STORY_COLOR, 0.15)}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <StoryIcon sx={{ fontSize: 18, color: STORY_COLOR }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                fontSize: '0.9rem',
                background: `linear-gradient(135deg, ${STORY_COLOR} 0%, #6366f1 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {storyData.title}
            </Typography>
          </Stack>
          {storyData.tagline && (
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', display: 'block' }}>
              "{storyData.tagline}"
            </Typography>
          )}
          {/* Genre & Tone Chips */}
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
            {storyData.genre && (
              <Chip
                label={storyData.genre}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: alpha(STORY_COLOR, 0.15),
                  color: STORY_COLOR,
                  fontWeight: 600,
                }}
              />
            )}
            {storyData.tone && (
              <Chip
                label={storyData.tone}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: alpha('#6366f1', 0.15),
                  color: '#6366f1',
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Logline */}
        {storyData.logline && (
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(STORY_COLOR, 0.1)}` }}>
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                color: 'text.primary',
                borderLeft: `3px solid ${STORY_COLOR}`,
                pl: 1.5,
              }}
            >
              {storyData.logline}
            </Typography>
          </Box>
        )}

        {/* Themes */}
        {storyData.themes && storyData.themes.length > 0 && (
          <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${alpha(STORY_COLOR, 0.1)}` }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              THEMES
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {storyData.themes.slice(0, 4).map((theme, i) => (
                <Chip
                  key={i}
                  label={theme}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                    bgcolor: alpha('#f59e0b', 0.1),
                    color: '#d97706',
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Characters Section (Collapsible) */}
        {characters && characters.length > 0 && (
          <Box sx={{ borderBottom: `1px solid ${alpha(STORY_COLOR, 0.1)}` }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(CHARACTER_COLOR, 0.05) },
              }}
              onClick={() => setShowCharacters(!showCharacters)}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <CharacterIcon sx={{ fontSize: 14, color: CHARACTER_COLOR }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  CHARACTERS ({characters.length})
                </Typography>
              </Stack>
              <IconButton size="small" sx={{ p: 0.25 }}>
                {showCharacters ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={showCharacters}>
              <Box sx={{ px: 1.5, pb: 1 }}>
                {characters.slice(0, 4).map((char, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.5,
                      borderBottom: i < Math.min(characters.length - 1, 3) ? `1px dashed ${alpha('#000', 0.1)}` : 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: alpha(CHARACTER_COLOR, 0.15),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="caption" fontWeight={700} sx={{ color: CHARACTER_COLOR }}>
                        {char.name[0]}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={600} sx={{ display: 'block' }}>
                        {char.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                        {char.role} • {char.archetype}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Outline Section (Collapsible) */}
        {outline && outline.acts && outline.acts.length > 0 && (
          <Box>
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: alpha(OUTLINE_COLOR, 0.05) },
              }}
              onClick={() => setShowOutline(!showOutline)}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <OutlineIcon sx={{ fontSize: 14, color: OUTLINE_COLOR }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  OUTLINE ({outline.acts.length} Acts)
                </Typography>
              </Stack>
              <IconButton size="small" sx={{ p: 0.25 }}>
                {showOutline ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
              </IconButton>
            </Box>
            <Collapse in={showOutline}>
              <Box sx={{ px: 1.5, pb: 1 }}>
                {outline.acts.map((act) => (
                  <Box key={act.actNumber} sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          bgcolor: OUTLINE_COLOR,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                        }}
                      >
                        {act.actNumber}
                      </Box>
                      <Typography variant="caption" fontWeight={600}>
                        {act.title}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        fontSize: '0.65rem',
                        pl: 3,
                        lineHeight: 1.3,
                      }}
                    >
                      {act.summary.length > 100 ? act.summary.substring(0, 100) + '...' : act.summary}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Story Action Buttons */}
        {(onAutoGenerateWorkflow || onSaveToLibrary) && (
          <Box sx={{ p: 1.5, borderTop: `1px solid ${alpha(STORY_COLOR, 0.1)}` }}>
            <Stack direction="row" spacing={1}>
              {onAutoGenerateWorkflow && (
                <Tooltip title="Auto-create Character, Structure, and Scene nodes connected to this story">
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<WorkflowIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAutoGenerateWorkflow();
                    }}
                    sx={{
                      background: `linear-gradient(135deg, ${STORY_COLOR} 0%, #6366f1 100%)`,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      py: 0.6,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(STORY_COLOR, 0.85)} 0%, ${alpha('#6366f1', 0.85)} 100%)`,
                      },
                    }}
                  >
                    Workflow
                  </Button>
                </Tooltip>
              )}
              {onSaveToLibrary && (
                <Tooltip title="Save this story to your Story Library for later use">
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<SaveLibraryIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveToLibrary();
                    }}
                    sx={{
                      borderColor: alpha(STORY_COLOR, 0.5),
                      color: STORY_COLOR,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      py: 0.6,
                      '&:hover': {
                        borderColor: STORY_COLOR,
                        bgcolor: alpha(STORY_COLOR, 0.1),
                      },
                    }}
                  >
                    Save
                  </Button>
                </Tooltip>
              )}
            </Stack>
          </Box>
        )}
      </Box>
    );
  }

  // Render text content with enhanced styling
  if ((resultType === 'text' || config.type === 'text') && textContent) {
    // Truncate text for preview (show first 300 chars)
    const displayText = textContent.length > 300
      ? textContent.substring(0, 300) + '...'
      : textContent;
    const isLongText = textContent.length > 100;

    return (
      <Box
        sx={{
          ...containerSx,
          p: 1.5,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid',
          borderColor: alpha('#6366f1', 0.15),
          borderRadius: 1.5,
          maxHeight: 180,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: alpha('#6366f1', 0.2),
            borderRadius: 2,
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: isLongText ? '0.8rem' : '0.9rem',
            lineHeight: 1.6,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: 400,
            color: 'text.primary',
            letterSpacing: '-0.01em',
            // Add a subtle quote style for storytelling text
            ...(isLongText && {
              fontStyle: 'normal',
              borderLeft: `3px solid ${alpha('#6366f1', 0.3)}`,
              pl: 1.5,
            }),
          }}
        >
          {displayText}
        </Typography>
        {textContent.length > 300 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
          >
            {textContent.length} characters total
          </Typography>
        )}
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
