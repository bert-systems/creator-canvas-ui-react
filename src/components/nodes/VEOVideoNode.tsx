/**
 * VEOVideoNode - Specialized node component for VEO 3.1 video generation
 * Supports Standard and Fast modes, plus Frames-to-Video scene extension
 * Includes cinematic video preview with native audio
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
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Movie as MovieIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  VolumeUp as AudioIcon,
  VolumeOff as MuteIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  Speed as SpeedIcon,
  HighQuality as QualityIcon,
} from '@mui/icons-material';
import type { Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 300;
const NODE_MIN_HEIGHT = 220;


// VEO-specific accent color (Google blue-ish)
const VEO_COLOR = '#4285f4';

// ===== Types =====

// VEO video node specific data - extends CanvasNodeData
export interface VEOVideoNodeData {
  nodeType: 'veo31' | 'veo31Fast';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: number;
  hasAudio?: boolean;
  jobId?: string;
}

export interface VEOVideoNodeProps {
  id: string;
  data: VEOVideoNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// ===== Helper Functions =====

const getCategoryColor = (_category: string): string => {
  return VEO_COLOR; // VEO nodes always use the VEO brand color
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
      return VEO_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const VEOVideoNode = memo(function VEOVideoNode({
  data,
  selected,
  isConnectable = true,
}: VEOVideoNodeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const categoryColor = useMemo(() => getCategoryColor(data.category), [data.category]);
  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);

  // Get current parameter values with defaults
  const aspectRatio = (data.parameters?.aspectRatio as string) ?? '16:9';
  const mode = (data.parameters?.mode as string) ?? 'fast';
  const audioEnabled = (data.parameters?.audioEnabled as boolean) ?? true;

  const isFastMode = mode === 'fast';

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render input handles (left side)
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topOffset = 75 + index * 38;
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
      const topOffset = 75 + index * 38;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, pt: 1.5 }}>
        {/* Input labels */}
        <Stack spacing={1.25}>
          {data.inputs?.map((port: Port) => (
            <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 28 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
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
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {port.name}
                {port.required && <span style={{ color: '#ef4444' }}>*</span>}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Output labels */}
        <Stack spacing={1.25} alignItems="flex-end">
          {data.outputs?.map((port: Port) => (
            <Box key={port.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 28 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {port.name}
              </Typography>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: alpha(PORT_COLORS[port.type] || PORT_COLORS.any, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: PORT_COLORS[port.type] || PORT_COLORS.any,
                }}
              >
                {port.type === 'video' && <MovieIcon sx={{ fontSize: 12 }} />}
                {port.type === 'audio' && <AudioIcon sx={{ fontSize: 12 }} />}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  // Render video preview with cinematic aspect
  const renderVideoPreview = () => {
    if (!data.videoUrl && !data.thumbnailUrl) {
      // Cinematic placeholder
      return (
        <Box
          sx={{
            mx: 1.5,
            mb: 1.5,
            height: aspectRatio === '16:9' ? 100 : 140,
            borderRadius: 1,
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Cinematic bars for 16:9 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 8,
              bgcolor: '#111',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 8,
              bgcolor: '#111',
            }}
          />
          <MovieIcon sx={{ fontSize: 48, color: alpha(VEO_COLOR, 0.4) }} />
        </Box>
      );
    }

    return (
      <Box sx={{ mx: 1.5, mb: 1.5, position: 'relative' }}>
        {data.videoUrl ? (
          <Box
            component="video"
            src={data.videoUrl}
            poster={data.thumbnailUrl}
            sx={{
              width: '100%',
              height: aspectRatio === '16:9' ? 100 : 140,
              objectFit: 'cover',
              borderRadius: 1,
              bgcolor: '#000',
            }}
            autoPlay={isPlaying}
            loop
            muted={isMuted || !audioEnabled}
            controls={false}
          />
        ) : (
          <Box
            component="img"
            src={data.thumbnailUrl}
            alt="Video thumbnail"
            sx={{
              width: '100%',
              height: aspectRatio === '16:9' ? 100 : 140,
              objectFit: 'cover',
              borderRadius: 1,
            }}
          />
        )}

        {/* Controls overlay */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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

            {data.hasAudio && (
              <IconButton
                size="small"
                onClick={handleToggleMute}
                sx={{
                  bgcolor: alpha('#000', 0.6),
                  color: 'white',
                  '&:hover': { bgcolor: alpha('#000', 0.8) },
                }}
              >
                {isMuted ? <MuteIcon sx={{ fontSize: 14 }} /> : <AudioIcon sx={{ fontSize: 14 }} />}
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label="8s"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: alpha('#000', 0.6),
                color: 'white',
              }}
            />
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
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Stack spacing={1.5}>
          {/* Mode Toggle */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Generation Mode
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              size="small"
              fullWidth
              sx={{ height: 28 }}
            >
              <ToggleButton value="fast" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                <SpeedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Fast ($0.15/s)
              </ToggleButton>
              <ToggleButton value="standard" sx={{ fontSize: '0.7rem', py: 0.5 }}>
                <QualityIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Standard ($0.40/s)
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

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
              <MenuItem value="16:9">16:9 (Landscape)</MenuItem>
              <MenuItem value="9:16">9:16 (Portrait)</MenuItem>
            </Select>
          </FormControl>

          {/* Audio toggle */}
          <FormControlLabel
            control={<Switch size="small" checked={audioEnabled} />}
            label={
              <Typography variant="caption">
                Native Audio {audioEnabled && '(included)'}
              </Typography>
            }
            sx={{ ml: 0 }}
          />

          {/* Cost estimate */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(VEO_COLOR, 0.1),
              border: '1px solid',
              borderColor: alpha(VEO_COLOR, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Estimated cost: <strong>${isFastMode ? '1.20' : '3.20'}</strong> for 8s video
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  // Calculate node height
  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    75 + // Header
    Math.max(data.inputs?.length || 0, data.outputs?.length || 0) * 38 + // Ports
    (aspectRatio === '16:9' ? 120 : 160) + // Video preview
    (showSettings ? 180 : 0) + // Settings panel
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

      {/* Header with VEO branding */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          background: `linear-gradient(135deg, ${VEO_COLOR} 0%, ${alpha(VEO_COLOR, 0.8)} 100%)`,
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
            sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}
            noWrap
          >
            {data.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={isFastMode ? 'Fast' : 'HQ'}
            size="small"
            icon={isFastMode ? <SpeedIcon sx={{ fontSize: 12, color: 'white !important' }} /> : <QualityIcon sx={{ fontSize: 12, color: 'white !important' }} />}
            sx={{
              height: 20,
              fontSize: '0.6rem',
              bgcolor: alpha('#fff', 0.2),
              color: 'white',
              '& .MuiChip-icon': { color: 'white' },
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

export default VEOVideoNode;
