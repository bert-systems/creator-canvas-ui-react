/**
 * RunwayAnimationNode - Specialized node for fashion show/runway animations
 * Uses Kling 2.6 to animate lookbook images with catwalk, spin, or fabric flow effects
 * Includes audio support for fashion show music
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
  TheaterComedy as RunwayIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  VolumeUp as AudioIcon,
  VolumeOff as MuteIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  DirectionsWalk as CatwalkIcon,
  ThreeSixty as SpinIcon,
  Waves as FabricIcon,
} from '@mui/icons-material';
import type { Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import type { RunwayAnimationType } from '@/services/virtualTryOnService';

// ===== Constants =====

const NODE_WIDTH = 290;
const NODE_MIN_HEIGHT = 280;


// Runway animation accent color (purple/violet)
const RUNWAY_COLOR = '#8b5cf6';

// Animation type info
const ANIMATION_INFO: Record<RunwayAnimationType, { label: string; icon: React.ReactNode; desc: string }> = {
  'catwalk': { label: 'Catwalk', icon: <CatwalkIcon sx={{ fontSize: 14 }} />, desc: 'Model walking on runway' },
  'spin': { label: '360° Spin', icon: <SpinIcon sx={{ fontSize: 14 }} />, desc: 'Rotating product view' },
  'fabric-flow': { label: 'Fabric Flow', icon: <FabricIcon sx={{ fontSize: 14 }} />, desc: 'Flowing fabric animation' },
  'pose-to-pose': { label: 'Pose Flow', icon: <RunwayIcon sx={{ fontSize: 14 }} />, desc: 'Dynamic pose transitions' },
};

// ===== Types =====

export interface RunwayAnimationNodeData {
  nodeType: 'runwayAnimation';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  // Input preview
  lookbookImageUrl?: string;
  // Output preview
  videoUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: number;
  hasAudio?: boolean;
  // Job tracking
  jobId?: string;
}

export interface RunwayAnimationNodeProps {
  id: string;
  data: RunwayAnimationNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// ===== Helper Functions =====

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
      return RUNWAY_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const RunwayAnimationNode = memo(function RunwayAnimationNode({
  data,
  selected,
  isConnectable = true,
}: RunwayAnimationNodeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);

  // Get current parameter values with defaults
  const animationType = (data.parameters?.animationType as RunwayAnimationType) ?? 'catwalk';
  const duration = (data.parameters?.duration as number) ?? 5;
  const audioEnabled = (data.parameters?.audioEnabled as boolean) ?? false;
  const musicStyle = (data.parameters?.musicStyle as string) ?? 'electronic';

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
      const topOffset = 80 + index * 45;
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
      const topOffset = 80 + index * 45;
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

  // Render input preview (lookbook image)
  const renderInputPreview = () => {
    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Box
          sx={{
            height: 70,
            borderRadius: 1,
            bgcolor: data.lookbookImageUrl ? 'transparent' : alpha('#000', 0.05),
            border: '1px dashed',
            borderColor: data.lookbookImageUrl ? PORT_COLORS.image : alpha('#000', 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {data.lookbookImageUrl ? (
            <Box
              component="img"
              src={data.lookbookImageUrl}
              alt="Lookbook"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <ImageIcon sx={{ fontSize: 28, color: alpha(PORT_COLORS.image, 0.5) }} />
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', display: 'block' }}>
                Lookbook Image*
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // Render video preview
  const renderVideoPreview = () => {
    return (
      <Box sx={{ px: 1.5, pb: 1, mt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
          Animation Preview
        </Typography>
        <Box
          sx={{
            height: 100,
            borderRadius: 1,
            bgcolor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {data.videoUrl ? (
            <>
              <Box
                component="video"
                src={data.videoUrl}
                poster={data.thumbnailUrl}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                autoPlay={isPlaying}
                loop
                muted={isMuted || !audioEnabled}
                controls={false}
              />
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
                    {isPlaying ? <StopIcon sx={{ fontSize: 14 }} /> : <PlayIcon sx={{ fontSize: 14 }} />}
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
                      {isMuted ? <MuteIcon sx={{ fontSize: 12 }} /> : <AudioIcon sx={{ fontSize: 12 }} />}
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip
                    label={`${data.videoDuration || duration}s`}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.55rem',
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
                    <FullscreenIcon sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <VideoIcon sx={{ fontSize: 32, color: alpha(RUNWAY_COLOR, 0.4) }} />
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: alpha('#fff', 0.5), display: 'block' }}>
                Animation preview
              </Typography>
            </Box>
          )}
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
          {/* Animation Type */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Animation Style
            </Typography>
            <ToggleButtonGroup
              value={animationType}
              exclusive
              size="small"
              fullWidth
              sx={{ height: 32 }}
            >
              {Object.entries(ANIMATION_INFO).map(([key, info]) => (
                <Tooltip key={key} title={info.desc}>
                  <ToggleButton value={key} sx={{ fontSize: '0.6rem', py: 0.5, px: 0.5 }}>
                    {info.icon}
                    <Box sx={{ ml: 0.5, display: { xs: 'none', sm: 'block' } }}>{info.label}</Box>
                  </ToggleButton>
                </Tooltip>
              ))}
            </ToggleButtonGroup>
          </Box>

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
              <MenuItem value={5}>5 seconds ($0.25)</MenuItem>
              <MenuItem value={10}>10 seconds ($0.45)</MenuItem>
            </Select>
          </FormControl>

          {/* Audio */}
          <FormControlLabel
            control={<Switch size="small" checked={audioEnabled} />}
            label={<Typography variant="caption">Add Fashion Music</Typography>}
            sx={{ ml: 0 }}
          />

          {/* Music Style (if audio enabled) */}
          {audioEnabled && (
            <FormControl size="small" fullWidth>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                Music Style
              </Typography>
              <Select
                value={musicStyle}
                size="small"
                sx={{ fontSize: '0.75rem', height: 28 }}
              >
                <MenuItem value="electronic">Electronic</MenuItem>
                <MenuItem value="classical">Classical</MenuItem>
                <MenuItem value="ambient">Ambient</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Info */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(RUNWAY_COLOR, 0.1),
              border: '1px solid',
              borderColor: alpha(RUNWAY_COLOR, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Animation: <strong>{ANIMATION_INFO[animationType].label}</strong>
              <br />
              {ANIMATION_INFO[animationType].desc}
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
    90 + // Input preview
    120 + // Video preview
    (showSettings ? 200 : 0) + // Settings panel
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
        borderColor: selected ? RUNWAY_COLOR : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? RUNWAY_COLOR : alpha(RUNWAY_COLOR, 0.5),
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
          background: `linear-gradient(135deg, ${RUNWAY_COLOR} 0%, ${alpha(RUNWAY_COLOR, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status)}
          <RunwayIcon sx={{ fontSize: 16, color: 'white' }} />
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
            label={ANIMATION_INFO[animationType].label}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.55rem',
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

      {/* Input preview */}
      {renderInputPreview()}

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

export default RunwayAnimationNode;
