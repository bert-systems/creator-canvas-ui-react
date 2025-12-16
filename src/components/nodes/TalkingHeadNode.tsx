/**
 * TalkingHeadNode - Specialized node component for Kling Avatar v2
 * Generates talking head videos from portrait image + audio
 * Supports high-quality lip sync at 30/48 fps
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
  RecordVoiceOver as AvatarIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  VolumeUp as AudioIcon,
  VolumeOff as MuteIcon,
  Portrait as PortraitIcon,
  GraphicEq as WaveformIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 260;
const NODE_MIN_HEIGHT = 240;


// Avatar-specific accent color (warm pink/coral)
const AVATAR_COLOR = '#ec4899';

// ===== Types =====

export interface TalkingHeadNodeData extends CanvasNodeData {
  nodeType: 'klingAvatar';
  videoUrl?: string;
  thumbnailUrl?: string;
  portraitUrl?: string;
  audioUrl?: string;
  videoDuration?: number;
  jobId?: string;
}

export interface TalkingHeadNodeProps {
  id: string;
  data: TalkingHeadNodeData;
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
      return AVATAR_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const TalkingHeadNode = memo(function TalkingHeadNode({
  data,
  selected,
  isConnectable = true,
}: TalkingHeadNodeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);

  // Get current parameter values with defaults
  const resolution = (data.parameters?.resolution as string) ?? '1080p';
  const fps = (data.parameters?.fps as number) ?? 30;
  const lipSyncStrength = (data.parameters?.lipSyncStrength as number) ?? 0.8;
  const headMotion = (data.parameters?.headMotion as boolean) ?? true;

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

  // Render input section with portrait + audio indicators
  const renderInputSection = () => {
    const hasPortrait = !!data.portraitUrl;
    const hasAudio = !!data.audioUrl;

    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {/* Portrait indicator */}
          <Box
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: hasPortrait ? alpha(PORT_COLORS.image, 0.15) : alpha('#000', 0.05),
              border: '1px dashed',
              borderColor: hasPortrait ? PORT_COLORS.image : alpha('#000', 0.2),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {data.portraitUrl ? (
              <Box
                component="img"
                src={data.portraitUrl}
                alt="Portrait"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <PortraitIcon sx={{ fontSize: 28, color: alpha(PORT_COLORS.image, 0.5) }} />
            )}
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
              Portrait
              <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
          </Box>

          {/* Audio indicator */}
          <Box
            sx={{
              flex: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: hasAudio ? alpha(PORT_COLORS.audio, 0.15) : alpha('#000', 0.05),
              border: '1px dashed',
              borderColor: hasAudio ? PORT_COLORS.audio : alpha('#000', 0.2),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <WaveformIcon sx={{ fontSize: 28, color: hasAudio ? PORT_COLORS.audio : alpha(PORT_COLORS.audio, 0.5) }} />
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
              Audio
              <span style={{ color: '#ef4444' }}>*</span>
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  // Render video preview
  const renderVideoPreview = () => {
    if (!data.videoUrl && !data.thumbnailUrl) {
      // Placeholder with avatar icon
      return (
        <Box
          sx={{
            mx: 1.5,
            mb: 1,
            height: 100,
            borderRadius: 1,
            bgcolor: alpha('#000', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <PersonIcon sx={{ fontSize: 48, color: alpha(AVATAR_COLOR, 0.3) }} />
          <AvatarIcon
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              fontSize: 20,
              color: alpha(AVATAR_COLOR, 0.5),
            }}
          />
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
              height: 100,
              objectFit: 'cover',
              borderRadius: 1,
              bgcolor: '#000',
            }}
            autoPlay={isPlaying}
            loop
            muted={isMuted}
            controls={false}
          />
        ) : (
          <Box
            component="img"
            src={data.thumbnailUrl}
            alt="Video thumbnail"
            sx={{
              width: '100%',
              height: 100,
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
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={`${fps}fps`}
              size="small"
              sx={{
                height: 18,
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
          {/* Resolution */}
          <FormControl size="small" fullWidth>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Resolution
            </Typography>
            <Select
              value={resolution}
              size="small"
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              <MenuItem value="720p">720p</MenuItem>
              <MenuItem value="1080p">1080p (Recommended)</MenuItem>
            </Select>
          </FormControl>

          {/* FPS */}
          <FormControl size="small" fullWidth>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Frame Rate
            </Typography>
            <Select
              value={fps}
              size="small"
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              <MenuItem value={30}>30 fps (Standard)</MenuItem>
              <MenuItem value={48}>48 fps (Smooth)</MenuItem>
            </Select>
          </FormControl>

          {/* Lip Sync Strength */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Lip Sync Strength: {Math.round(lipSyncStrength * 100)}%
            </Typography>
            <Slider
              value={lipSyncStrength}
              min={0}
              max={1}
              step={0.1}
              size="small"
              sx={{ color: AVATAR_COLOR }}
            />
          </Box>

          {/* Head Motion */}
          <FormControlLabel
            control={<Switch size="small" checked={headMotion} />}
            label={<Typography variant="caption">Natural Head Motion</Typography>}
            sx={{ ml: 0 }}
          />
        </Stack>
      </Box>
    );
  };

  // Calculate node height
  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    75 + // Header
    90 + // Input section
    120 + // Video preview
    (showSettings ? 170 : 0) + // Settings panel
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
        borderColor: selected ? AVATAR_COLOR : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? AVATAR_COLOR : alpha(AVATAR_COLOR, 0.5),
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
          background: `linear-gradient(135deg, ${AVATAR_COLOR} 0%, ${alpha(AVATAR_COLOR, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status)}
          <AvatarIcon sx={{ fontSize: 16, color: 'white' }} />
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
            label="Avatar"
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

      {/* Input section (portrait + audio indicators) */}
      {renderInputSection()}

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

export default TalkingHeadNode;
