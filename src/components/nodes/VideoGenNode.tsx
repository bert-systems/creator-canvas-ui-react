/**
 * VideoGenNode - Specialized node component for Kling 2.6 video generation
 * Supports Text-to-Video and Image-to-Video modes
 * Includes video preview player and progress tracking
 */

import { memo, useMemo, useState, useCallback } from 'react';
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
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Videocam as VideoIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  VolumeUp as AudioIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import { nodeCategories } from '@/config/nodeDefinitions';

// ===== Constants =====

const NODE_WIDTH = 280;
const NODE_MIN_HEIGHT = 200;


// ===== Types =====

export interface VideoGenNodeData extends CanvasNodeData {
  nodeType: 'kling26T2V' | 'kling26I2V';
  videoUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: number;
  hasAudio?: boolean;
  jobId?: string;
}

export interface VideoGenNodeProps {
  id: string;
  data: VideoGenNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// ===== Helper Functions =====

const getCategoryColor = (category: string): string => {
  const cat = nodeCategories.find((c) => c.id === category);
  return cat?.color || '#8b5cf6'; // Default to video purple
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
      return '#8b5cf6';
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const VideoGenNode = memo(function VideoGenNode({
  data,
  selected,
  isConnectable = true,
}: VideoGenNodeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const categoryColor = useMemo(() => getCategoryColor(data.category), [data.category]);
  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);
  const isT2V = data.nodeType === 'kling26T2V';

  // Get current parameter values with defaults
  const duration = (data.parameters?.duration as number) ?? 5;
  const aspectRatio = (data.parameters?.aspectRatio as string) ?? '16:9';
  const enableAudio = (data.parameters?.enableAudio as boolean) ?? true;
  const motionIntensity = (data.parameters?.motionIntensity as number) ?? 0.5;

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render input handles (left side)
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topOffset = 70 + index * 36;
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
      const topOffset = 70 + index * 36;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, pt: 1 }}>
        {/* Input labels */}
        <Stack spacing={1}>
          {data.inputs?.map((port: Port) => (
            <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 28 }}>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: alpha(PORT_COLORS[port.type] || PORT_COLORS.any, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORT_COLORS[port.type] || PORT_COLORS.any,
                }}
              >
                {port.type === 'text' && <TextIcon sx={{ fontSize: 12 }} />}
                {port.type === 'image' && <ImageIcon sx={{ fontSize: 12 }} />}
                {port.type === 'audio' && <AudioIcon sx={{ fontSize: 12 }} />}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {port.name}
                {port.required && <span style={{ color: '#ef4444' }}>*</span>}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Output labels */}
        <Stack spacing={1} alignItems="flex-end">
          {data.outputs?.map((port: Port) => (
            <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 28 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {port.name}
              </Typography>
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  bgcolor: alpha(PORT_COLORS[port.type] || PORT_COLORS.any, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORT_COLORS[port.type] || PORT_COLORS.any,
                }}
              >
                {port.type === 'video' && <VideoIcon sx={{ fontSize: 12 }} />}
                {port.type === 'audio' && <AudioIcon sx={{ fontSize: 12 }} />}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  // Render video preview
  const renderVideoPreview = () => {
    if (!data.videoUrl && !data.thumbnailUrl) {
      // Placeholder when no video
      return (
        <Box
          sx={{
            mx: 1.5,
            mb: 1,
            height: 120,
            borderRadius: 1,
            bgcolor: alpha('#000', 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderColor: alpha(categoryColor, 0.3),
          }}
        >
          <VideoIcon sx={{ fontSize: 40, color: alpha(categoryColor, 0.5) }} />
        </Box>
      );
    }

    return (
      <Box sx={{ mx: 1.5, mb: 1, position: 'relative' }}>
        {data.videoUrl ? (
          <Box
            component="video"
            src={data.videoUrl}
            poster={data.thumbnailUrl}
            sx={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: 1,
              bgcolor: '#000',
            }}
            autoPlay={isPlaying}
            loop
            muted={!enableAudio}
            controls={false}
          />
        ) : (
          <Box
            component="img"
            src={data.thumbnailUrl}
            alt="Video thumbnail"
            sx={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        )}

        {/* Play/Pause overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            right: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton
            size="small"
            onClick={handlePlayPause}
            sx={{
              bgcolor: alpha('#000', 0.6),
              color: 'white',
              '&:hover': { bgcolor: alpha('#000', 0.8) },
            }}
          >
            {isPlaying ? <StopIcon sx={{ fontSize: 16 }} /> : <PlayIcon sx={{ fontSize: 16 }} />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {data.hasAudio && (
              <AudioIcon sx={{ fontSize: 14, color: 'white', opacity: 0.8 }} />
            )}
            {data.videoDuration && (
              <Chip
                label={`${data.videoDuration}s`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#000', 0.6),
                  color: 'white',
                }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => data.videoUrl && window.open(data.videoUrl, '_blank')}
              sx={{
                bgcolor: alpha('#000', 0.6),
                color: 'white',
                '&:hover': { bgcolor: alpha('#000', 0.8) },
              }}
            >
              <FullscreenIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render parameters panel
  const renderParameters = () => {
    if (!showSettings) return null;

    return (
      <Box sx={{ px: 1.5, pb: 1 }}>
        <Stack spacing={1}>
          {/* Duration */}
          <FormControl size="small" fullWidth>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Duration
            </Typography>
            <Select
              value={duration}
              size="small"
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              <MenuItem value={5}>5 seconds</MenuItem>
              <MenuItem value={10}>10 seconds</MenuItem>
            </Select>
          </FormControl>

          {/* Aspect Ratio */}
          <FormControl size="small" fullWidth>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Aspect Ratio
            </Typography>
            <Select
              value={aspectRatio}
              size="small"
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              <MenuItem value="16:9">16:9</MenuItem>
              <MenuItem value="9:16">9:16</MenuItem>
              <MenuItem value="1:1">1:1</MenuItem>
            </Select>
          </FormControl>

          {/* T2V specific: Audio toggle */}
          {isT2V && (
            <FormControlLabel
              control={<Switch size="small" checked={enableAudio} />}
              label={<Typography variant="caption">Generate Audio</Typography>}
              sx={{ ml: 0 }}
            />
          )}

          {/* I2V specific: Motion intensity */}
          {!isT2V && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Motion Intensity: {Math.round(motionIntensity * 100)}%
              </Typography>
              <Slider
                value={motionIntensity}
                min={0}
                max={1}
                step={0.1}
                size="small"
                sx={{ color: categoryColor }}
              />
            </Box>
          )}
        </Stack>
      </Box>
    );
  };

  // Calculate node height based on content
  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    70 + // Header
    Math.max(data.inputs?.length || 0, data.outputs?.length || 0) * 36 + // Ports
    140 + // Video preview
    (showSettings ? 150 : 0) + // Settings panel
    (data.error ? 30 : 0) // Error message
  );

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={isT2V ? 'T2V' : 'I2V'}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              bgcolor: alpha('#fff', 0.2),
              color: 'white',
            }}
          />
          <IconButton
            size="small"
            onClick={handleToggleSettings}
            sx={{ color: 'white', p: 0.25 }}
          >
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
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
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: alpha('#ef4444', 0.1) }}>
          <Typography variant="caption" color="error" sx={{ fontSize: '0.65rem' }}>
            {data.error}
          </Typography>
        </Box>
      )}

      {/* Port labels */}
      {renderPortLabels()}

      {/* Video preview */}
      {renderVideoPreview()}

      {/* Parameters panel */}
      {renderParameters()}

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

export default VideoGenNode;
