/**
 * FlowNode - Base node component for workflow nodes
 * Supports multiple states: idle, running, completed, error
 * Handles typed ports with visual feedback
 *
 * @deprecated v4.0 - Use UnifiedNode instead
 * This component is part of the legacy node system (v3.1).
 * New boards should use UnifiedNode which provides:
 * - Three display modes (compact/standard/expanded)
 * - Slot-based composition (preview, parameters, actions)
 * - Unified API integration via unifiedNodeService
 * - Better performance with React.memo and virtualization
 *
 * Migration: Enable useUnifiedPalette flag in CreativeCanvasStudio
 */

import { memo, useMemo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Tooltip,
  alpha,
  Stack,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  VolumeUp as AudioIcon,
  TextFields as TextIcon,
  Palette as StyleIcon,
  Person as CharacterIcon,
  ViewInAr as Mesh3DIcon,
  MoreHoriz as AnyIcon,
  // Storytelling icons
  AutoStories as StoryIcon,
  Movie as SceneIcon,
  Flag as PlotPointIcon,
  Place as LocationIcon,
  Forum as DialogueIcon,
  Description as TreatmentIcon,
  FormatListNumbered as OutlineIcon,
  MenuBook as LoreIcon,
  Timeline as TimelineIcon,
  // Fashion icons
  Draw as GarmentIcon,
  Texture as FabricIcon,
  GridOn as PatternIcon,
  PersonOutline as ModelIcon,
  Style as OutfitIcon,
  Collections as CollectionIcon,
  Assignment as TechPackIcon,
  PhotoAlbum as LookbookIcon,
  // Interior Design icons
  Home as RoomIcon,
  Dashboard as FloorPlanIcon,
  Layers as MaterialIcon,
  Weekend as FurnitureIcon,
  Brush as DesignStyleIcon,
  GridView as RoomLayoutIcon,
  // Moodboard icons
  ColorLens as MoodboardIcon,
  Palette as ColorPaletteIcon,
  Business as BrandKitIcon,
  FontDownload as TypographyIcon,
  Wallpaper as TextureIcon,
  AutoAwesome as AestheticIcon,
  // Social Media icons
  Article as PostIcon,
  ViewCarousel as CarouselIcon,
  Notes as CaptionIcon,
  CropPortrait as TemplateIcon,
  Share as PlatformIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, PortType } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import { nodeCategories, getNodeDefinition } from '@/config/nodeDefinitions';
import { brandColors, darkNeutrals, creativeCardTokens, agentStateColors } from '@/theme';

// ===== Constants =====

const NODE_WIDTH_DEFAULT = 220;
const NODE_WIDTH_MIN = 180;
const NODE_WIDTH_MAX = 400;
const NODE_MIN_HEIGHT = 100;
const NODE_MAX_HEIGHT = 600;


const PORT_ICONS: Record<PortType, React.ReactNode> = {
  image: <ImageIcon sx={{ fontSize: 12 }} />,
  video: <VideoIcon sx={{ fontSize: 12 }} />,
  audio: <AudioIcon sx={{ fontSize: 12 }} />,
  text: <TextIcon sx={{ fontSize: 12 }} />,
  style: <StyleIcon sx={{ fontSize: 12 }} />,
  character: <CharacterIcon sx={{ fontSize: 12 }} />,
  mesh3d: <Mesh3DIcon sx={{ fontSize: 12 }} />,
  any: <AnyIcon sx={{ fontSize: 12 }} />,
  // Storytelling port types
  story: <StoryIcon sx={{ fontSize: 12 }} />,
  scene: <SceneIcon sx={{ fontSize: 12 }} />,
  plotPoint: <PlotPointIcon sx={{ fontSize: 12 }} />,
  location: <LocationIcon sx={{ fontSize: 12 }} />,
  dialogue: <DialogueIcon sx={{ fontSize: 12 }} />,
  treatment: <TreatmentIcon sx={{ fontSize: 12 }} />,
  outline: <OutlineIcon sx={{ fontSize: 12 }} />,
  lore: <LoreIcon sx={{ fontSize: 12 }} />,
  timeline: <TimelineIcon sx={{ fontSize: 12 }} />,
  // Fashion port types
  garment: <GarmentIcon sx={{ fontSize: 12 }} />,
  fabric: <FabricIcon sx={{ fontSize: 12 }} />,
  pattern: <PatternIcon sx={{ fontSize: 12 }} />,
  model: <ModelIcon sx={{ fontSize: 12 }} />,
  outfit: <OutfitIcon sx={{ fontSize: 12 }} />,
  collection: <CollectionIcon sx={{ fontSize: 12 }} />,
  techPack: <TechPackIcon sx={{ fontSize: 12 }} />,
  lookbook: <LookbookIcon sx={{ fontSize: 12 }} />,
  // Interior Design port types
  room: <RoomIcon sx={{ fontSize: 12 }} />,
  floorPlan: <FloorPlanIcon sx={{ fontSize: 12 }} />,
  material: <MaterialIcon sx={{ fontSize: 12 }} />,
  furniture: <FurnitureIcon sx={{ fontSize: 12 }} />,
  designStyle: <DesignStyleIcon sx={{ fontSize: 12 }} />,
  roomLayout: <RoomLayoutIcon sx={{ fontSize: 12 }} />,
  // Moodboard port types
  moodboard: <MoodboardIcon sx={{ fontSize: 12 }} />,
  colorPalette: <ColorPaletteIcon sx={{ fontSize: 12 }} />,
  brandKit: <BrandKitIcon sx={{ fontSize: 12 }} />,
  typography: <TypographyIcon sx={{ fontSize: 12 }} />,
  texture: <TextureIcon sx={{ fontSize: 12 }} />,
  aesthetic: <AestheticIcon sx={{ fontSize: 12 }} />,
  // Social Media port types
  post: <PostIcon sx={{ fontSize: 12 }} />,
  carousel: <CarouselIcon sx={{ fontSize: 12 }} />,
  caption: <CaptionIcon sx={{ fontSize: 12 }} />,
  template: <TemplateIcon sx={{ fontSize: 12 }} />,
  platform: <PlatformIcon sx={{ fontSize: 12 }} />,
};

// ===== Helper Functions =====

const getCategoryColor = (category: string): string => {
  const cat = nodeCategories.find((c) => c.id === category);
  return cat?.color || '#6b7280';
};

// Brand-aligned status icons using agent state colors
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <SuccessIcon sx={{ fontSize: 16, color: agentStateColors.done }} />;
    case 'running':
      return <RunningIcon sx={{ fontSize: 16, color: agentStateColors.executing, animation: 'spin 1s linear infinite' }} />;
    case 'error':
      return <ErrorIcon sx={{ fontSize: 16, color: agentStateColors.error }} />;
    default:
      return <IdleIcon sx={{ fontSize: 16, color: agentStateColors.idle }} />;
  }
};

// Brand-aligned status colors using semantic colors
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return brandColors.mintGlow;  // Success
    case 'running':
      return brandColors.tealPulse; // Primary action
    case 'error':
      return brandColors.coralSpark; // Error
    default:
      return darkNeutrals.textTertiary; // Idle
  }
};

// ===== Component =====

// React Flow custom node receives data prop typed as the Node's data property
export interface FlowNodeProps {
  id: string;
  data: CanvasNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// Callback for when an input port is double-clicked (to add input node)
// This is stored in window as a workaround for React Flow's custom node prop limitations
declare global {
  interface Window {
    onPortDoubleClick?: (nodeId: string, portId: string, portType: PortType) => void;
  }
}

export const FlowNode = memo(function FlowNode({
  id,
  data,
  selected,
  isConnectable = true,
}: FlowNodeProps) {
  const categoryColor = useMemo(() => getCategoryColor(data.category), [data.category]);
  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);

  // Get node definition for fallback inputs/outputs if data is missing them
  const definition = useMemo(() => getNodeDefinition(data.nodeType), [data.nodeType]);

  // Use data inputs/outputs if available, otherwise fall back to definition
  const inputs: Port[] = useMemo(() => {
    if (data.inputs && data.inputs.length > 0) return data.inputs;
    if (definition?.inputs) return definition.inputs;
    return [];
  }, [data.inputs, definition]);

  const outputs: Port[] = useMemo(() => {
    if (data.outputs && data.outputs.length > 0) return data.outputs;
    if (definition?.outputs) return definition.outputs;
    return [];
  }, [data.outputs, definition]);

  // Handle double-click on input port to add input node
  const handlePortDoubleClick = (portId: string, portType: PortType) => {
    if (window.onPortDoubleClick) {
      window.onPortDoubleClick(id, portId, portType);
    }
  };

  // Render input handles (left side) - "Bead" style per UX strategy
  const renderInputHandles = () => {
    if (inputs.length === 0) return null;

    return inputs.map((port: Port, index: number) => {
      const topOffset = 60 + index * 28;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip
          key={port.id}
          title={
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {port.name} ({port.type})
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, fontSize: '0.65rem' }}>
                Double-click to add input
              </Typography>
            </Box>
          }
          placement="left"
        >
          <Box
            onDoubleClick={() => handlePortDoubleClick(port.id, port.type)}
            sx={{
              position: 'absolute',
              left: -6,
              top: topOffset - 6,
              width: 24,
              height: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover .port-handle': {
                transform: 'scale(1.2)',
                boxShadow: `0 0 8px ${portColor}`,
              },
            }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={port.id}
              isConnectable={isConnectable}
              className="port-handle-bead port-handle"
              style={{
                position: 'relative',
                top: 0,
                left: 0,
                width: 12,
                height: 12,
                backgroundColor: darkNeutrals.surface1,
                border: `2px solid ${portColor}`,
                boxShadow: `0 0 0 2px ${darkNeutrals.ink}`,
                transition: 'all 140ms ease',
              }}
            />
          </Box>
        </Tooltip>
      );
    });
  };

  // Render output handles (right side) - "Bead" style per UX strategy
  const renderOutputHandles = () => {
    if (outputs.length === 0) return null;

    return outputs.map((port: Port, index: number) => {
      const topOffset = 60 + index * 28;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip key={port.id} title={`${port.name} (${port.type})`} placement="right">
          <Handle
            type="source"
            position={Position.Right}
            id={port.id}
            isConnectable={isConnectable}
            className="port-handle-bead"
            style={{
              top: topOffset,
              width: 12,
              height: 12,
              backgroundColor: darkNeutrals.surface1,
              border: `2px solid ${portColor}`,
              boxShadow: `0 0 0 2px ${darkNeutrals.ink}`,
              transition: 'all 140ms ease',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render port labels
  const renderPortLabels = () => {
    const maxPorts = Math.max(inputs.length, outputs.length);
    if (maxPorts === 0) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, pt: 1 }}>
        {/* Input labels */}
        <Stack spacing={0.5}>
          {inputs.map((port: Port) => (
            <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 24 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: alpha(PORT_COLORS[port.type] || PORT_COLORS.any, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORT_COLORS[port.type] || PORT_COLORS.any,
                }}
              >
                {PORT_ICONS[port.type]}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {port.name}
                {port.required && <span style={{ color: '#ef4444' }}>*</span>}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Output labels */}
        <Stack spacing={0.5} alignItems="flex-end">
          {outputs.map((port: Port) => (
            <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 24 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                {port.name}
              </Typography>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: alpha(PORT_COLORS[port.type] || PORT_COLORS.any, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORT_COLORS[port.type] || PORT_COLORS.any,
                }}
              >
                {PORT_ICONS[port.type]}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  // Render result preview
  const renderResultPreview = () => {
    // Debug logging for image result display
    console.log('[FlowNode] renderResultPreview called:', {
      nodeId: id,
      nodeType: data.nodeType,
      hasResult: !!data.result,
      result: data.result,
    });

    if (!data.result) return null;

    const { type, url, urls, data: resultData } = data.result;
    const displayUrl = url || urls?.[0];

    console.log('[FlowNode] Result details:', { type, url, urls, displayUrl });

    // Handle text results (like enhanced prompts)
    if (type === 'text' && resultData) {
      const textContent = typeof resultData === 'string'
        ? resultData
        : (resultData as { text?: string; enhancedPrompt?: string }).text ||
          (resultData as { text?: string; enhancedPrompt?: string }).enhancedPrompt ||
          JSON.stringify(resultData);

      // Truncate for preview
      const previewText = textContent.length > 150
        ? `${textContent.substring(0, 150)}...`
        : textContent;

      return (
        <Box
          sx={{
            px: 1,
            pb: 1,
            animation: 'fadeInResult 0.5s ease-out',
          }}
        >
          {/* Success badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: brandColors.mintGlow,
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: brandColors.mintGlow,
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Enhanced ✨
            </Typography>
          </Box>
          {/* Text preview */}
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(brandColors.mintGlow, 0.08),
              borderRadius: 1,
              border: `1px solid ${alpha(brandColors.mintGlow, 0.2)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: darkNeutrals.textPrimary,
                fontSize: '0.7rem',
                lineHeight: 1.4,
                display: 'block',
                wordBreak: 'break-word',
              }}
            >
              {previewText}
            </Typography>
            {/* Gradient fade at bottom if truncated */}
            {textContent.length > 150 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 20,
                  background: `linear-gradient(transparent, ${alpha(darkNeutrals.surface1, 0.9)})`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </Box>
        </Box>
      );
    }

    if (!displayUrl) return null;

    // IMAGE RESULT - "Moment of Delight"
    if (type === 'image') {
      return (
        <Box sx={{ px: 1, pb: 1, animation: 'fadeInResult 0.5s ease-out' }}>
          {/* Success badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: brandColors.mintGlow,
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: brandColors.mintGlow,
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Generated ✨
            </Typography>
            {urls && urls.length > 1 && (
              <Chip
                label={`${urls.length} images`}
                size="small"
                sx={{
                  height: 14,
                  fontSize: '0.55rem',
                  bgcolor: alpha(brandColors.tealPulse, 0.2),
                  color: brandColors.tealPulse,
                }}
              />
            )}
          </Box>
          {/* Main image */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              border: `2px solid ${brandColors.mintGlow}`,
              boxShadow: `0 0 16px ${alpha(brandColors.mintGlow, 0.4)}`,
              animation: 'celebrateBorder 1.5s ease-out',
            }}
          >
            <Box
              component="img"
              src={displayUrl}
              alt="Generated image"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                cursor: 'pointer',
                display: 'block',
              }}
              onClick={() => window.open(displayUrl, '_blank')}
            />
          </Box>
          {/* Thumbnail strip for multiple images */}
          {urls && urls.length > 1 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {urls.slice(0, 4).map((imgUrl: string, idx: number) => (
                <Box
                  key={idx}
                  sx={{
                    position: 'relative',
                    borderRadius: 0.5,
                    overflow: 'hidden',
                    border: imgUrl === displayUrl ? `2px solid ${brandColors.mintGlow}` : '1px solid transparent',
                  }}
                >
                  <Box
                    component="img"
                    src={imgUrl}
                    alt={`Result ${idx + 1}`}
                    sx={{
                      width: 32,
                      height: 32,
                      objectFit: 'cover',
                      cursor: 'pointer',
                      display: 'block',
                      '&:hover': { opacity: 0.8 },
                    }}
                    onClick={() => window.open(imgUrl, '_blank')}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      );
    }

    // VIDEO RESULT - "Moment of Delight"
    if (type === 'video') {
      return (
        <Box sx={{ px: 1, pb: 1, animation: 'fadeInResult 0.5s ease-out' }}>
          {/* Success badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#8b5cf6', // Purple for video
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: '#8b5cf6',
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Video Ready 🎬
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              border: `2px solid #8b5cf6`,
              boxShadow: `0 0 16px ${alpha('#8b5cf6', 0.4)}`,
            }}
          >
            <Box
              component="video"
              src={displayUrl}
              controls
              poster=""
              sx={{
                width: '100%',
                height: 80,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        </Box>
      );
    }

    // 3D MESH RESULT
    if (type === 'mesh3d') {
      return (
        <Box sx={{ px: 1, pb: 1, animation: 'fadeInResult 0.5s ease-out' }}>
          {/* Success badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#f59e0b', // Amber for 3D
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: '#f59e0b',
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              3D Model Ready 🎨
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 1,
              overflow: 'hidden',
              border: `2px solid #f59e0b`,
              boxShadow: `0 0 16px ${alpha('#f59e0b', 0.4)}`,
              bgcolor: alpha('#f59e0b', 0.05),
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 60,
              cursor: 'pointer',
            }}
            onClick={() => window.open(displayUrl, '_blank')}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 24, mb: 0.25 }}>🎲</Typography>
              <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '0.6rem' }}>
                Click to view 3D
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    return null;
  };

  // Calculate node height based on ports and result type
  const getResultHeight = () => {
    if (!data.result) return 0;
    // Text results need more vertical space
    if (data.result.type === 'text') return 140;
    // Image/video results
    return 100;
  };

  // Check if this is an input node with an image
  const hasInputImage = () => {
    if (data.category !== 'input') return false;
    const imageParams = ['file', 'image', 'imageUrl', 'url', 'referenceImage'];
    for (const paramId of imageParams) {
      const value = data.parameters?.[paramId];
      if (value && typeof value === 'string' &&
          (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image'))) {
        return true;
      }
    }
    return false;
  };

  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    60 + Math.max(data.inputs?.length || 0, data.outputs?.length || 0) * 28 + getResultHeight() + (hasInputImage() ? 120 : 0)
  );

  // Render input image preview for input nodes (imageUpload, etc.)
  const renderInputImagePreview = () => {
    // Check if this is an input node with file/image parameters
    if (data.category !== 'input') return null;

    // Look for image URLs in parameters (file, image, url, imageUrl, etc.)
    const imageParams = ['file', 'image', 'imageUrl', 'url', 'referenceImage'];
    let imageUrl: string | null = null;

    for (const paramId of imageParams) {
      const value = data.parameters?.[paramId];
      if (value && typeof value === 'string') {
        // Check if it's a valid image URL or data URL
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image')) {
          imageUrl = value;
          break;
        }
      }
    }

    // Also check cachedOutput for executed image
    if (!imageUrl && data.cachedOutput) {
      const cached = data.cachedOutput as Record<string, unknown>;
      imageUrl = (cached.imageUrl as string) || (cached.url as string) || (cached.image as string) || null;
    }

    if (!imageUrl) return null;

    return (
      <Box
        sx={{
          px: 1,
          py: 1,
          animation: 'fadeInResult 0.3s ease-out',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden',
            border: `2px solid ${brandColors.tealPulse}`,
            boxShadow: `0 0 12px ${alpha(brandColors.tealPulse, 0.3)}`,
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt="Input image"
            sx={{
              width: '100%',
              height: 100,
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              // Hide broken images
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Image loaded badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              bgcolor: alpha(brandColors.tealPulse, 0.9),
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'white',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontSize: '0.6rem',
                fontWeight: 600,
              }}
            >
              Ready
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Determine border styling based on state
  const getBorderStyle = () => {
    if (data.status === 'error') {
      return { borderColor: brandColors.coralSpark, boxShadow: `0 0 12px ${alpha(brandColors.coralSpark, 0.3)}` };
    }
    if (data.status === 'running') {
      return { borderColor: brandColors.tealPulse, animation: 'pulse-border 1000ms ease infinite' };
    }
    if (data.status === 'completed') {
      // Celebration animation for successful completion - plays once
      return {
        borderColor: brandColors.mintGlow,
        boxShadow: `0 0 16px ${alpha(brandColors.mintGlow, 0.35)}`,
        animation: data.result ? 'celebrateBorder 1.5s ease-out' : undefined,
      };
    }
    if (selected) {
      return { borderColor: categoryColor, boxShadow: creativeCardTokens.shadows.cardActive };
    }
    return { borderColor: darkNeutrals.border };
  };

  const borderStyle = getBorderStyle();

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH_DEFAULT,
        minWidth: NODE_WIDTH_MIN,
        maxWidth: NODE_WIDTH_MAX,
        minHeight: nodeHeight,
        maxHeight: NODE_MAX_HEIGHT,
        borderRadius: `${creativeCardTokens.radius.card}px`,
        overflow: 'visible',
        border: '2px solid',
        borderColor: borderStyle.borderColor,
        bgcolor: darkNeutrals.surface1,
        transition: `all ${creativeCardTokens.timing.standard}ms ${creativeCardTokens.easing.smooth}`,
        position: 'relative',
        boxShadow: borderStyle.boxShadow || creativeCardTokens.shadows.card,
        animation: borderStyle.animation,
        '&:hover': {
          borderColor: selected || data.status !== 'idle' ? borderStyle.borderColor : alpha(categoryColor, 0.5),
          boxShadow: selected ? creativeCardTokens.shadows.cardActive : creativeCardTokens.shadows.cardHover,
        },
      }}
    >
      {/* Node Resizer - Only show when selected */}
      <NodeResizer
        color={categoryColor}
        isVisible={selected}
        minWidth={NODE_WIDTH_MIN}
        maxWidth={NODE_WIDTH_MAX}
        minHeight={NODE_MIN_HEIGHT}
        maxHeight={NODE_MAX_HEIGHT}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: categoryColor,
          border: `1px solid ${darkNeutrals.ink}`,
        }}
        lineStyle={{
          borderWidth: 1,
          borderColor: alpha(categoryColor, 0.5),
        }}
      />
      {/* Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}

      {/* Header - Gradient based on category */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          background: `linear-gradient(135deg, ${alpha(categoryColor, 0.9)} 0%, ${alpha(categoryColor, 0.7)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: creativeCardTokens.radius.card - 2,
          borderTopRightRadius: creativeCardTokens.radius.card - 2,
          borderBottom: `1px solid ${darkNeutrals.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status)}
          <Typography
            variant="subtitle2"
            sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
            noWrap
          >
            {data.label}
          </Typography>
        </Box>

        <Chip
          label={data.category}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.6rem',
            bgcolor: alpha('#fff', 0.2),
            color: 'white',
            textTransform: 'capitalize',
          }}
        />
      </Box>

      {/* Progress bar */}
      {data.status === 'running' && (
        <LinearProgress
          variant={data.progress ? 'determinate' : 'indeterminate'}
          value={data.progress}
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': {
              backgroundColor: statusColor,
            },
          }}
        />
      )}

      {/* Error message - Brand styled with left accent */}
      {data.error && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: alpha(brandColors.coralSpark, 0.08),
            borderLeft: `3px solid ${brandColors.coralSpark}`,
          }}
        >
          <Typography variant="caption" sx={{ fontSize: '0.65rem', color: brandColors.coralSpark }}>
            {data.error}
          </Typography>
        </Box>
      )}

      {/* Port labels */}
      {renderPortLabels()}

      {/* Input image preview - for input nodes with image/file parameters */}
      {renderInputImagePreview()}

      {/* Result preview */}
      {renderResultPreview()}

      {/* Status indicator bar at bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: statusColor,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          opacity: data.status === 'idle' ? 0.3 : 1,
          transition: 'opacity 0.3s',
        }}
      />

      {/* CSS for animations and port handle hover states */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(38, 202, 191, 0.4);
          }
          50% {
            box-shadow: 0 0 12px 4px rgba(38, 202, 191, 0.2);
          }
        }
        @keyframes fadeInResult {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
        @keyframes celebrateBorder {
          0% {
            box-shadow: 0 0 0 0 rgba(133, 231, 174, 0.6);
          }
          50% {
            box-shadow: 0 0 20px 8px rgba(133, 231, 174, 0.3);
          }
          100% {
            box-shadow: 0 0 8px 2px rgba(133, 231, 174, 0.15);
          }
        }
        /* Port handle "bead" hover states */
        .port-handle-bead:hover {
          transform: scale(1.3);
          background-color: currentColor !important;
        }
        .port-handle-bead.connecting,
        .port-handle-bead.valid {
          background-color: currentColor !important;
          box-shadow: 0 0 8px currentColor !important;
        }
        /* React Flow handle connection feedback */
        .react-flow__handle-connecting {
          background-color: currentColor !important;
        }
        .react-flow__handle-valid {
          background-color: currentColor !important;
          box-shadow: 0 0 8px currentColor !important;
        }
      `}</style>
    </Paper>
  );
});

export default FlowNode;
