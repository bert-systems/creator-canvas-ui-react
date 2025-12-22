/**
 * Context Toolbar
 *
 * Category-aware toolbar that shows domain-specific quick actions.
 * Changes based on the current board category (fashion, story, interior, stock).
 *
 * @module ContextToolbar
 * @version 4.0
 */

import { memo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Tooltip,
  Divider,
  IconButton,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  MoreHoriz as MoreIcon,
} from '@mui/icons-material';
import type { BoardCategory, NodeType } from '@/models/canvas';
import type { CategoryToolbar, ToolbarAction } from '@/models/unifiedNode';
import { toolbarService } from '@/services/toolbarService';

// ============================================================================
// TYPES
// ============================================================================

interface ContextToolbarProps {
  boardCategory?: BoardCategory | null;
  onActionClick?: (action: ToolbarAction) => void;
  maxVisibleActions?: number;
}

// ============================================================================
// DEFAULT TOOLBARS (Fallback)
// ============================================================================

const DEFAULT_ACTIONS: Record<BoardCategory, ToolbarAction[]> = {
  fashion: [
    { id: 'tryOn', icon: '👗', label: 'Try-On', nodeType: 'virtualTryOn' as NodeType, tooltip: 'Virtual Try-On' },
    { id: 'colorway', icon: '🎨', label: 'Colorway', nodeType: 'colorwayGenerator' as NodeType, tooltip: 'Generate Colorways' },
    { id: 'pattern', icon: '📐', label: 'Pattern', nodeType: 'patternGenerator' as NodeType, tooltip: 'Sewing Pattern' },
    { id: 'lookbook', icon: '📖', label: 'Lookbook', nodeType: 'lookbookGenerator' as NodeType, tooltip: 'Create Lookbook' },
  ],
  story: [
    { id: 'genesis', icon: '✨', label: 'Genesis', nodeType: 'storyGenesis' as NodeType, tooltip: 'Start New Story' },
    { id: 'character', icon: '👤', label: 'Character', nodeType: 'characterCreator' as NodeType, tooltip: 'Create Character' },
    { id: 'scene', icon: '🎬', label: 'Scene', nodeType: 'sceneGenerator' as NodeType, tooltip: 'Generate Scene' },
    { id: 'dialogue', icon: '💬', label: 'Dialogue', nodeType: 'dialogueGenerator' as NodeType, tooltip: 'Write Dialogue' },
  ],
  interior: [
    { id: 'roomRedesign', icon: '🏠', label: 'Redesign', nodeType: 'roomRedesign' as NodeType, tooltip: 'AI Room Redesign' },
    { id: 'virtualStaging', icon: '🛋️', label: 'Stage', nodeType: 'virtualStaging' as NodeType, tooltip: 'Virtual Staging' },
    { id: 'floorPlan', icon: '📐', label: 'Floor Plan', nodeType: 'floorPlanGenerator' as NodeType, tooltip: 'Generate Floor Plan' },
    { id: 'furniture', icon: '🪑', label: 'Furniture', nodeType: 'furnitureSuggestion' as NodeType, tooltip: 'Furniture Suggestions' },
  ],
  moodboard: [
    { id: 'moodboard', icon: '🎨', label: 'Moodboard', nodeType: 'moodboardGenerator' as NodeType, tooltip: 'Generate Moodboard' },
    { id: 'colorPalette', icon: '🌈', label: 'Colors', nodeType: 'colorPaletteExtractor' as NodeType, tooltip: 'Extract Color Palette' },
    { id: 'brandKit', icon: '🏷️', label: 'Brand Kit', nodeType: 'brandKitGenerator' as NodeType, tooltip: 'Generate Brand Kit' },
    { id: 'aesthetic', icon: '✨', label: 'Aesthetic', nodeType: 'aestheticAnalyzer' as NodeType, tooltip: 'Analyze Aesthetic' },
    { id: 'texture', icon: '🧱', label: 'Texture', nodeType: 'textureGenerator' as NodeType, tooltip: 'Generate Texture' },
    { id: 'typography', icon: '🔤', label: 'Type', nodeType: 'typographySuggester' as NodeType, tooltip: 'Suggest Typography' },
    { id: 'theme', icon: '🎭', label: 'Theme', nodeType: 'visualThemeGenerator' as NodeType, tooltip: 'Generate Visual Theme' },
    { id: 'inspiration', icon: '💡', label: 'Inspire', nodeType: 'inspirationCurator' as NodeType, tooltip: 'Curate Inspiration' },
  ],
  social: [
    { id: 'postGenerator', icon: '📱', label: 'Post', nodeType: 'socialPostGenerator' as NodeType, tooltip: 'Generate Social Post' },
    { id: 'carousel', icon: '🎠', label: 'Carousel', nodeType: 'carouselGenerator' as NodeType, tooltip: 'Create Carousel' },
    { id: 'caption', icon: '✍️', label: 'Caption', nodeType: 'captionGenerator' as NodeType, tooltip: 'Generate Caption' },
    { id: 'reel', icon: '🎬', label: 'Reel', nodeType: 'reelGenerator' as NodeType, tooltip: 'Generate Reel/Short' },
    { id: 'thumbnail', icon: '🖼️', label: 'Thumb', nodeType: 'thumbnailGenerator' as NodeType, tooltip: 'Generate Thumbnail' },
    { id: 'hook', icon: '🪝', label: 'Hook', nodeType: 'hookGenerator' as NodeType, tooltip: 'Generate Viral Hook' },
    { id: 'hashtags', icon: '#️⃣', label: 'Tags', nodeType: 'hashtagOptimizer' as NodeType, tooltip: 'Optimize Hashtags' },
    { id: 'trends', icon: '📈', label: 'Trends', nodeType: 'trendSpotter' as NodeType, tooltip: 'Spot Trends' },
  ],
  stock: [
    { id: 'fluxPro', icon: '⚡', label: 'FLUX Pro', nodeType: 'flux2Pro' as NodeType, tooltip: 'FLUX.2 Pro Generation' },
    { id: 'video', icon: '🎬', label: 'Video', nodeType: 'kling26Pro' as NodeType, tooltip: 'Kling 2.6 Video' },
    { id: 'upscale', icon: '🔍', label: 'Upscale', nodeType: 'upscaleImage' as NodeType, tooltip: '4x Upscale' },
    { id: 'enhance', icon: '✨', label: 'Enhance', nodeType: 'enhancePrompt' as NodeType, tooltip: 'Enhance Prompt' },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ContextToolbar = memo<ContextToolbarProps>(({
  boardCategory,
  onActionClick,
  maxVisibleActions = 8,
}) => {
  const [toolbar, setToolbar] = useState<CategoryToolbar | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Load toolbar from API
  useEffect(() => {
    if (boardCategory) {
      setLoading(true);
      toolbarService.getToolbarByCategory(boardCategory)
        .then(setToolbar)
        .catch(() => {
          // Fall back to default actions
          setToolbar({
            category: boardCategory,
            actions: DEFAULT_ACTIONS[boardCategory] || [],
          });
        })
        .finally(() => setLoading(false));
    } else {
      setToolbar(null);
    }
  }, [boardCategory]);

  // Handle action click
  const handleActionClick = useCallback((action: ToolbarAction) => {
    onActionClick?.(action);
  }, [onActionClick]);

  // Get visible and overflow actions
  const visibleActions = toolbar?.actions.slice(0, maxVisibleActions) || [];
  const overflowActions = toolbar?.actions.slice(maxVisibleActions) || [];
  const hasOverflow = overflowActions.length > 0;

  // Get category color
  const getCategoryColor = (): string => {
    switch (boardCategory) {
      case 'fashion': return '#d946ef';
      case 'story': return '#10b981';
      case 'interior': return '#8b5cf6';
      case 'moodboard': return '#f472b6';
      case 'social': return '#4ade80';
      case 'stock': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (!boardCategory || (!loading && !toolbar)) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.75,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Category Label */}
      <Box
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: alpha(getCategoryColor(), 0.1),
          color: getCategoryColor(),
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'capitalize',
          mr: 1,
        }}
      >
        {boardCategory}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Loading State */}
      {loading && (
        <CircularProgress size={16} sx={{ mx: 2 }} />
      )}

      {/* Action Buttons */}
      {!loading && visibleActions.map((action) => (
        <Tooltip key={action.id} title={action.tooltip} arrow>
          <Button
            size="small"
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            startIcon={<span style={{ fontSize: '1rem' }}>{action.icon}</span>}
            sx={{
              minWidth: 'auto',
              px: 1.25,
              py: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'none',
              color: 'text.primary',
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                borderColor: getCategoryColor(),
                bgcolor: alpha(getCategoryColor(), 0.1),
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            {action.label}
            {action.badge && (
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  px: 0.5,
                  py: 0.125,
                  borderRadius: 0.5,
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  bgcolor: action.badge === 'pro' ? 'warning.main' : 'success.main',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}
              >
                {action.badge}
              </Box>
            )}
          </Button>
        </Tooltip>
      ))}

      {/* More Button */}
      {hasOverflow && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="More actions">
            <IconButton
              size="small"
              onClick={() => setShowMore(!showMore)}
              sx={{
                bgcolor: showMore ? alpha(getCategoryColor(), 0.1) : 'transparent',
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}

      {/* Overflow Actions (Expandable) */}
      {showMore && hasOverflow && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            ml: 0.5,
          }}
        >
          {overflowActions.map((action) => (
            <Tooltip key={action.id} title={action.tooltip} arrow>
              <Button
                size="small"
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                startIcon={<span style={{ fontSize: '1rem' }}>{action.icon}</span>}
                sx={{
                  minWidth: 'auto',
                  px: 1.25,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  color: 'text.primary',
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'transparent',
                  '&:hover': {
                    borderColor: getCategoryColor(),
                    bgcolor: alpha(getCategoryColor(), 0.1),
                  },
                }}
              >
                {action.label}
              </Button>
            </Tooltip>
          ))}
        </Box>
      )}

      {/* Keyboard Shortcut Hint */}
      {visibleActions.some(a => a.shortcut) && (
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {visibleActions
            .filter(a => a.shortcut)
            .slice(0, 3)
            .map((action) => (
              <Tooltip key={action.id} title={`${action.label}: ${action.shortcut}`}>
                <Box
                  sx={{
                    px: 0.5,
                    py: 0.125,
                    borderRadius: 0.5,
                    bgcolor: 'action.selected',
                    fontSize: '0.6rem',
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                  }}
                >
                  {action.shortcut}
                </Box>
              </Tooltip>
            ))}
        </Box>
      )}
    </Box>
  );
});

ContextToolbar.displayName = 'ContextToolbar';

export default ContextToolbar;
