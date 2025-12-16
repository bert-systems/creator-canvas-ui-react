/**
 * FlowNode - Base node component for workflow nodes
 * Supports multiple states: idle, running, completed, error
 * Handles typed ports with visual feedback
 */

import { memo, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
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
} from '@mui/icons-material';
import type { CanvasNodeData, Port, PortType } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import { nodeCategories } from '@/config/nodeDefinitions';

// ===== Constants =====

const NODE_WIDTH_COLLAPSED = 200;
const NODE_MIN_HEIGHT = 100;


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
};

// ===== Helper Functions =====

const getCategoryColor = (category: string): string => {
  const cat = nodeCategories.find((c) => c.id === category);
  return cat?.color || '#6b7280';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <SuccessIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    case 'running':
      return <RunningIcon sx={{ fontSize: 16, color: 'primary.main', animation: 'spin 1s linear infinite' }} />;
    case 'error':
      return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    default:
      return <IdleIcon sx={{ fontSize: 16, color: 'text.disabled' }} />;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return '#22c55e';
    case 'running':
      return '#3b82f6';
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
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

export const FlowNode = memo(function FlowNode({
  data,
  selected,
  isConnectable = true,
}: FlowNodeProps) {
  const categoryColor = useMemo(() => getCategoryColor(data.category), [data.category]);
  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);

  // Render input handles (left side)
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topOffset = 60 + index * 28;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip key={port.id} title={`${port.name} (${port.type})`} placement="left">
          <Handle
            type="target"
            position={Position.Left}
            id={port.id}
            isConnectable={isConnectable}
            style={{
              top: topOffset,
              width: 14,
              height: 14,
              backgroundColor: portColor,
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render output handles (right side)
  const renderOutputHandles = () => {
    if (!data.outputs || data.outputs.length === 0) return null;

    return data.outputs.map((port: Port, index: number) => {
      const topOffset = 60 + index * 28;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip key={port.id} title={`${port.name} (${port.type})`} placement="right">
          <Handle
            type="source"
            position={Position.Right}
            id={port.id}
            isConnectable={isConnectable}
            style={{
              top: topOffset,
              width: 14,
              height: 14,
              backgroundColor: portColor,
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render port labels
  const renderPortLabels = () => {
    const maxPorts = Math.max(data.inputs?.length || 0, data.outputs?.length || 0);
    if (maxPorts === 0) return null;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, pt: 1 }}>
        {/* Input labels */}
        <Stack spacing={0.5}>
          {data.inputs?.map((port: Port) => (
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
          {data.outputs?.map((port: Port) => (
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
    if (!data.result) return null;

    const { type, url, urls } = data.result;
    const displayUrl = url || urls?.[0];

    if (!displayUrl) return null;

    if (type === 'image') {
      return (
        <Box sx={{ px: 1, pb: 1 }}>
          <Box
            component="img"
            src={displayUrl}
            alt="Result"
            sx={{
              width: '100%',
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
              cursor: 'pointer',
            }}
            onClick={() => window.open(displayUrl, '_blank')}
          />
          {urls && urls.length > 1 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {urls.slice(0, 4).map((imgUrl: string, idx: number) => (
                <Box
                  key={idx}
                  component="img"
                  src={imgUrl}
                  alt={`Result ${idx + 1}`}
                  sx={{
                    width: 32,
                    height: 32,
                    objectFit: 'cover',
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    opacity: 0.8,
                    '&:hover': { opacity: 1 },
                  }}
                  onClick={() => window.open(imgUrl, '_blank')}
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }

    if (type === 'video') {
      return (
        <Box sx={{ px: 1, pb: 1 }}>
          <Box
            component="video"
            src={displayUrl}
            controls
            sx={{
              width: '100%',
              height: 80,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        </Box>
      );
    }

    return null;
  };

  // Calculate node height based on ports
  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    60 + Math.max(data.inputs?.length || 0, data.outputs?.length || 0) * 28 + (data.result ? 100 : 0)
  );

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH_COLLAPSED,
        minHeight: nodeHeight,
        borderRadius: 2,
        overflow: 'visible',
        border: '2px solid',
        borderColor: selected ? categoryColor : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? categoryColor : alpha(categoryColor, 0.5),
          boxShadow: 4,
        },
      }}
    >
      {/* Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}

      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          backgroundColor: categoryColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
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

      {/* Error message */}
      {data.error && (
        <Box sx={{ px: 1, py: 0.5, bgcolor: alpha('#ef4444', 0.1) }}>
          <Typography variant="caption" color="error" sx={{ fontSize: '0.65rem' }}>
            {data.error}
          </Typography>
        </Box>
      )}

      {/* Port labels */}
      {renderPortLabels()}

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

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Paper>
  );
});

export default FlowNode;
