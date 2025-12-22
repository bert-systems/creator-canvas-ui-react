/**
 * QuickStyles Component
 * One-click style buttons for Creative Cards
 */

import { memo } from 'react';
import { Box, Chip, Typography, Tooltip, alpha, IconButton } from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  MovieFilter as CinematicIcon,
  Camera as EditorialIcon,
  Contrast as DramaticIcon,
  Spa as SoftIcon,
  Palette as VibrantIcon,
  FilterVintage as VintageIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { creativeCardTokens, categoryColors } from '../../theme';
import { transitions } from './cardAnimations';

// ============================================================================
// STYLE DEFINITIONS
// ============================================================================

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  color?: string;
}

export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: 'Film-like, dramatic lighting, shallow depth of field',
    icon: <CinematicIcon sx={{ fontSize: 16 }} />,
    keywords: ['cinematic', 'film look', 'dramatic lighting', 'shallow depth of field', 'anamorphic'],
    color: '#F97316',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-ready, clean, professional',
    icon: <EditorialIcon sx={{ fontSize: 16 }} />,
    keywords: ['editorial', 'magazine style', 'clean', 'professional', 'high fashion'],
    color: '#3B82F6',
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'High contrast, bold shadows, intense',
    icon: <DramaticIcon sx={{ fontSize: 16 }} />,
    keywords: ['dramatic', 'high contrast', 'bold shadows', 'chiaroscuro', 'intense'],
    color: '#1F2937',
  },
  {
    id: 'soft',
    name: 'Soft',
    description: 'Gentle lighting, dreamy, romantic',
    icon: <SoftIcon sx={{ fontSize: 16 }} />,
    keywords: ['soft', 'gentle lighting', 'dreamy', 'romantic', 'ethereal'],
    color: '#EC4899',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold colors, high saturation, energetic',
    icon: <VibrantIcon sx={{ fontSize: 16 }} />,
    keywords: ['vibrant', 'bold colors', 'high saturation', 'energetic', 'pop art'],
    color: '#22C55E',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Nostalgic, warm tones, film grain',
    icon: <VintageIcon sx={{ fontSize: 16 }} />,
    keywords: ['vintage', 'nostalgic', 'warm tones', 'film grain', 'retro'],
    color: '#A16207',
  },
];

// ============================================================================
// TYPES
// ============================================================================

interface QuickStylesProps {
  /** Currently selected style IDs */
  selectedStyles: string[];
  /** Callback when a style is toggled */
  onToggleStyle: (styleId: string) => void;
  /** Category for theming */
  category?: string;
  /** Whether to show expanded view */
  expanded?: boolean;
  /** Callback when expansion is toggled */
  onToggleExpanded?: () => void;
  /** Custom style presets (optional) */
  stylePresets?: StylePreset[];
  /** Whether the card is locked */
  isLocked?: boolean;
  /** Callback to add custom style */
  onAddCustomStyle?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const QuickStyles = memo(function QuickStyles({
  selectedStyles,
  onToggleStyle,
  category = 'imageGen',
  expanded = false,
  onToggleExpanded,
  stylePresets = DEFAULT_STYLE_PRESETS,
  isLocked = false,
  onAddCustomStyle,
}: QuickStylesProps) {
  const categoryColor = categoryColors[category as keyof typeof categoryColors]?.main || categoryColors.imageGen.main;

  const displayedPresets = expanded ? stylePresets : stylePresets.slice(0, 4);

  return (
    <Box sx={{ px: 1.5, pb: 1 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 500 }}
        >
          QUICK STYLE
        </Typography>

        {stylePresets.length > 4 && (
          <IconButton
            size="small"
            onClick={onToggleExpanded}
            sx={{ p: 0.25 }}
          >
            {expanded ? (
              <CollapseIcon sx={{ fontSize: 16 }} />
            ) : (
              <ExpandIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        )}
      </Box>

      {/* Style Chips */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
        }}
      >
        {displayedPresets.map((preset) => {
          const isSelected = selectedStyles.includes(preset.id);
          const chipColor = preset.color || categoryColor;

          return (
            <Tooltip key={preset.id} title={preset.description} placement="top">
              <Chip
                size="small"
                label={preset.name}
                icon={preset.icon as React.ReactElement}
                onClick={() => !isLocked && onToggleStyle(preset.id)}
                disabled={isLocked}
                sx={{
                  height: 28,
                  borderRadius: `${creativeCardTokens.radius.button}px`,
                  bgcolor: isSelected ? alpha(chipColor, 0.2) : alpha('#fff', 0.05),
                  border: `1px solid ${isSelected ? chipColor : 'transparent'}`,
                  color: isSelected ? chipColor : 'text.secondary',
                  fontWeight: isSelected ? 600 : 400,
                  transition: transitions.fast,
                  '&:hover': {
                    bgcolor: alpha(chipColor, 0.15),
                  },
                  '& .MuiChip-icon': {
                    color: isSelected ? chipColor : 'text.secondary',
                  },
                }}
              />
            </Tooltip>
          );
        })}

        {/* Add Custom Style Button */}
        {onAddCustomStyle && (
          <Tooltip title="Add custom style">
            <Chip
              size="small"
              label="Add"
              icon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={onAddCustomStyle}
              disabled={isLocked}
              sx={{
                height: 28,
                borderRadius: `${creativeCardTokens.radius.button}px`,
                bgcolor: 'transparent',
                border: `1px dashed ${alpha(categoryColor, 0.3)}`,
                color: 'text.disabled',
                transition: transitions.fast,
                '&:hover': {
                  bgcolor: alpha(categoryColor, 0.1),
                  borderColor: categoryColor,
                  color: categoryColor,
                },
                '& .MuiChip-icon': {
                  color: 'inherit',
                },
              }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Selected Style Keywords Preview */}
      {selectedStyles.length > 0 && (
        <Box
          sx={{
            mt: 1,
            p: 1,
            borderRadius: `${creativeCardTokens.radius.thumbnail}px`,
            bgcolor: alpha(categoryColor, 0.05),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {selectedStyles
              .map((id) => stylePresets.find((p) => p.id === id)?.keywords.slice(0, 2).join(', '))
              .filter(Boolean)
              .join(' • ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export default QuickStyles;
