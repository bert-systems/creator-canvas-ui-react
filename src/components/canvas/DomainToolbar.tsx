/**
 * DomainToolbar - Context-aware toolbar showing domain-specific quick actions
 * Shows relevant tools based on the current board category (Fashion, Story, etc.)
 */

import { memo, useMemo } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  alpha,
} from '@mui/material';
import {
  // Fashion icons
  Checkroom as TryOnIcon,
  SwapHoriz as SwapIcon,
  DirectionsWalk as RunwayIcon,
  Palette as ColorwayIcon,
  GridOn as PatternIcon,
  CameraAlt as EcommerceIcon,
  PhotoAlbum as LookbookIcon,
  Collections as CollectionIcon,
  // Storytelling icons
  AutoStories as StoryIcon,
  Person as CharacterIcon,
  Movie as SceneIcon,
  Place as LocationIcon,
  Forum as DialogueIcon,
  Psychology as PlotTwistIcon,
  Architecture as WorldIcon,
  Timeline as TimelineIcon,
  // Interior icons
  Weekend as FurnitureIcon,
  Lightbulb as LightingIcon,
  Texture as MaterialIcon,
  ViewInAr as Room3DIcon,
  // Stock/General icons
  Image as ImageGenIcon,
  Videocam as VideoGenIcon,
  ThreeDRotation as ThreeDIcon,
  AutoFixHigh as EnhanceIcon,
} from '@mui/icons-material';
import type { CardCategory } from '@/models/creativeCanvas';
import type { NodeType } from '@/models/canvas';
import { brandColors, darkNeutrals } from '@/theme';

// ===== Types =====

interface ToolbarAction {
  id: string;
  nodeType: NodeType;
  label: string;
  icon: React.ReactNode;
  color: string;
  tooltip: string;
}

interface DomainToolbarProps {
  category: CardCategory | null;
  onQuickAdd: (nodeType: NodeType) => void;
}

// ===== Domain-specific toolbar configurations =====

const FASHION_TOOLS: ToolbarAction[] = [
  {
    id: 'virtualTryOn',
    nodeType: 'virtualTryOn',
    label: 'Try-On',
    icon: <TryOnIcon />,
    color: '#EC4899',
    tooltip: 'Virtual Try-On: See clothes on a model',
  },
  {
    id: 'clothesSwap',
    nodeType: 'clothesSwap',
    label: 'Swap',
    icon: <SwapIcon />,
    color: '#EC4899',
    tooltip: 'Clothes Swap: Change outfit with image',
  },
  {
    id: 'runwayAnimation',
    nodeType: 'runwayAnimation',
    label: 'Runway',
    icon: <RunwayIcon />,
    color: '#EC4899',
    tooltip: 'Runway Animation: Create catwalk video',
  },
  {
    id: 'colorwayGenerator',
    nodeType: 'colorwayGenerator',
    label: 'Colorway',
    icon: <ColorwayIcon />,
    color: '#F472B6',
    tooltip: 'Generate color variations',
  },
  {
    id: 'patternGenerator',
    nodeType: 'patternGenerator',
    label: 'Pattern',
    icon: <PatternIcon />,
    color: '#F472B6',
    tooltip: 'Generate textile patterns',
  },
  {
    id: 'ecommerceShot',
    nodeType: 'ecommerceShot',
    label: 'E-comm',
    icon: <EcommerceIcon />,
    color: '#F472B6',
    tooltip: 'E-commerce product shot',
  },
  {
    id: 'lookbookGenerator',
    nodeType: 'lookbookGenerator',
    label: 'Lookbook',
    icon: <LookbookIcon />,
    color: '#DB2777',
    tooltip: 'Generate lookbook pages',
  },
  {
    id: 'collectionBuilder',
    nodeType: 'collectionBuilder',
    label: 'Collection',
    icon: <CollectionIcon />,
    color: '#DB2777',
    tooltip: 'Build fashion collection',
  },
];

const STORY_TOOLS: ToolbarAction[] = [
  {
    id: 'storyGenesis',
    nodeType: 'storyGenesis',
    label: 'Story',
    icon: <StoryIcon />,
    color: '#8B5CF6',
    tooltip: 'Story Genesis: Create story concept',
  },
  {
    id: 'characterCreator',
    nodeType: 'characterCreator',
    label: 'Character',
    icon: <CharacterIcon />,
    color: '#8B5CF6',
    tooltip: 'Create detailed character',
  },
  {
    id: 'sceneGenerator',
    nodeType: 'sceneGenerator',
    label: 'Scene',
    icon: <SceneIcon />,
    color: '#8B5CF6',
    tooltip: 'Generate scene',
  },
  {
    id: 'locationCreator',
    nodeType: 'locationCreator',
    label: 'Location',
    icon: <LocationIcon />,
    color: '#A78BFA',
    tooltip: 'Create story location',
  },
  {
    id: 'dialogueGenerator',
    nodeType: 'dialogueGenerator',
    label: 'Dialogue',
    icon: <DialogueIcon />,
    color: '#A78BFA',
    tooltip: 'Generate character dialogue',
  },
  {
    id: 'plotTwist',
    nodeType: 'plotTwist',
    label: 'Twist',
    icon: <PlotTwistIcon />,
    color: '#A78BFA',
    tooltip: 'Add plot twist',
  },
  {
    id: 'worldLore',
    nodeType: 'worldLore',
    label: 'World',
    icon: <WorldIcon />,
    color: '#7C3AED',
    tooltip: 'Build world lore',
  },
  {
    id: 'storyTimeline',
    nodeType: 'storyTimeline',
    label: 'Timeline',
    icon: <TimelineIcon />,
    color: '#7C3AED',
    tooltip: 'Create story timeline',
  },
];

const INTERIOR_TOOLS: ToolbarAction[] = [
  {
    id: 'flux2Pro',
    nodeType: 'flux2Pro',
    label: 'Room',
    icon: <FurnitureIcon />,
    color: '#10B981',
    tooltip: 'Generate room design',
  },
  {
    id: 'flux2Dev',
    nodeType: 'flux2Dev',
    label: 'Lighting',
    icon: <LightingIcon />,
    color: '#10B981',
    tooltip: 'Design lighting setup',
  },
  {
    id: 'textileDesigner',
    nodeType: 'textileDesigner',
    label: 'Materials',
    icon: <MaterialIcon />,
    color: '#34D399',
    tooltip: 'Design materials & textures',
  },
  {
    id: 'meshy6',
    nodeType: 'meshy6',
    label: '3D Room',
    icon: <Room3DIcon />,
    color: '#34D399',
    tooltip: 'Generate 3D room model',
  },
];

const STOCK_TOOLS: ToolbarAction[] = [
  {
    id: 'flux2Pro',
    nodeType: 'flux2Pro',
    label: 'FLUX Pro',
    icon: <ImageGenIcon />,
    color: '#3B82F6',
    tooltip: 'FLUX.2 Pro: High-quality images',
  },
  {
    id: 'flux2Dev',
    nodeType: 'flux2Dev',
    label: 'FLUX Dev',
    icon: <ImageGenIcon />,
    color: '#3B82F6',
    tooltip: 'FLUX.2 Dev: Fast generation',
  },
  {
    id: 'recraftV3',
    nodeType: 'recraftV3',
    label: 'Recraft',
    icon: <ImageGenIcon />,
    color: '#60A5FA',
    tooltip: 'Recraft V3: Vectors & icons',
  },
  {
    id: 'kling26T2V',
    nodeType: 'kling26T2V',
    label: 'Video',
    icon: <VideoGenIcon />,
    color: '#60A5FA',
    tooltip: 'Kling: Text-to-video',
  },
  {
    id: 'meshy6',
    nodeType: 'meshy6',
    label: '3D',
    icon: <ThreeDIcon />,
    color: '#93C5FD',
    tooltip: 'Meshy: 3D generation',
  },
  {
    id: 'enhancePrompt',
    nodeType: 'enhancePrompt',
    label: 'Enhance',
    icon: <EnhanceIcon />,
    color: '#93C5FD',
    tooltip: 'Enhance prompts with AI',
  },
];

// ===== Component =====

export const DomainToolbar = memo(function DomainToolbar({
  category,
  onQuickAdd,
}: DomainToolbarProps) {
  // Get tools for current category
  const tools = useMemo(() => {
    switch (category) {
      case 'fashion':
        return FASHION_TOOLS;
      case 'story':
        return STORY_TOOLS;
      case 'interior':
        return INTERIOR_TOOLS;
      case 'stock':
        return STOCK_TOOLS;
      default:
        return STOCK_TOOLS; // Default to stock/general tools
    }
  }, [category]);

  // Get category color
  const categoryColor = useMemo(() => {
    switch (category) {
      case 'fashion':
        return '#EC4899';
      case 'story':
        return '#8B5CF6';
      case 'interior':
        return '#10B981';
      case 'stock':
        return '#3B82F6';
      default:
        return brandColors.tealPulse;
    }
  }, [category]);

  if (!category) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        bgcolor: alpha(darkNeutrals.surface1, 0.95),
        borderRadius: 2,
        border: `1px solid ${alpha(categoryColor, 0.3)}`,
        boxShadow: `0 2px 8px ${alpha('#000', 0.2)}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Category indicator */}
      <Box
        sx={{
          width: 4,
          height: 24,
          borderRadius: 1,
          bgcolor: categoryColor,
          mr: 0.5,
        }}
      />

      {/* Tool buttons */}
      {tools.map((tool, index) => (
        <Box key={tool.id} sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Add divider between groups (every 3 items) */}
          {index > 0 && index % 3 === 0 && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 0.5,
                height: 20,
                alignSelf: 'center',
                borderColor: alpha(categoryColor, 0.2),
              }}
            />
          )}
          <Tooltip title={tool.tooltip} placement="bottom">
            <IconButton
              size="small"
              onClick={() => onQuickAdd(tool.nodeType)}
              sx={{
                color: tool.color,
                borderRadius: 1,
                p: 0.75,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: alpha(tool.color, 0.15),
                  transform: 'scale(1.1)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              {tool.icon}
            </IconButton>
          </Tooltip>
        </Box>
      ))}
    </Box>
  );
});

export default DomainToolbar;
