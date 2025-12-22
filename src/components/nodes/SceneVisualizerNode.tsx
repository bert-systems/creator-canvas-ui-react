/**
 * SceneVisualizerNode - Storyboard generation from scene content
 * Creates visual storyboard frames with:
 * - Automatic frame extraction from scene text
 * - Camera angle and shot type selection
 * - Multiple visual styles
 * - Character consistency via portraits
 */

import { memo, useState, useCallback } from 'react';
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
  InputLabel,
  Collapse,
  Grid,
  Slider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  PhotoLibrary as StoryboardIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  CameraAlt as CameraIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import type { StoryboardFrame, VisualStyle } from '@/services/storyGenerationService';

// ===== Constants =====

const NODE_WIDTH = 360;
const NODE_MIN_HEIGHT = 320;

const VISUALIZER_COLOR = '#06b6d4'; // Cyan for visualization

// Visual style options
const VISUAL_STYLES: { value: VisualStyle; label: string }[] = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'anime', label: 'Anime' },
  { value: 'comic', label: 'Comic Book' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'noir', label: 'Film Noir' },
  { value: 'vintage', label: 'Vintage' },
];

// Aspect ratio options
const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 (Widescreen)' },
  { value: '2.39:1', label: '2.39:1 (Cinemascope)' },
  { value: '4:3', label: '4:3 (Classic)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '9:16', label: '9:16 (Vertical)' },
];

// ===== Types =====

export interface SceneVisualizerNodeData extends CanvasNodeData {
  nodeType: 'sceneVisualizer';
  frames?: StoryboardFrame[];
  frameUrls?: string[];
  selectedFrameIndex?: number;
}

export interface SceneVisualizerNodeProps {
  id: string;
  data: SceneVisualizerNodeData;
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

// ===== Component =====

export const SceneVisualizerNode = memo(function SceneVisualizerNode({
  data,
  selected,
  isConnectable = true,
}: SceneVisualizerNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const visualStyle = (data.parameters?.visualStyle as VisualStyle) ?? 'cinematic';
  const aspectRatio = (data.parameters?.aspectRatio as string) ?? '16:9';
  const frameCount = (data.parameters?.frameCount as number) ?? 4;
  const includeComposition = (data.parameters?.includeComposition as boolean) ?? true;

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render connection handles
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((input: Port, index: number) => {
      const totalInputs = data.inputs?.length || 1;
      const spacing = 100 / (totalInputs + 1);
      const topPosition = spacing * (index + 1);

      return (
        <Tooltip key={input.id} title={`${input.name} (${input.type})`} placement="left">
          <Handle
            type="target"
            position={Position.Left}
            id={input.id}
            isConnectable={isConnectable}
            style={{
              top: `${topPosition}%`,
              width: 12,
              height: 12,
              background: PORT_COLORS[input.type] || PORT_COLORS.any,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </Tooltip>
      );
    });
  };

  const renderOutputHandles = () => {
    if (!data.outputs || data.outputs.length === 0) return null;

    return data.outputs.map((output: Port, index: number) => {
      const totalOutputs = data.outputs?.length || 1;
      const spacing = 100 / (totalOutputs + 1);
      const topPosition = spacing * (index + 1);

      return (
        <Tooltip key={output.id} title={`${output.name} (${output.type})`} placement="right">
          <Handle
            type="source"
            position={Position.Right}
            id={output.id}
            isConnectable={isConnectable}
            style={{
              top: `${topPosition}%`,
              width: 12,
              height: 12,
              background: PORT_COLORS[output.type] || PORT_COLORS.any,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render frame thumbnails
  const renderFrameGrid = () => {
    const frames = data.frameUrls || [];
    const selectedIndex = data.selectedFrameIndex ?? 0;

    if (frames.length === 0) {
      // Empty placeholder grid
      return (
        <Grid container spacing={0.5} sx={{ px: 1.5, py: 1 }}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 6 }}>
              <Box
                sx={{
                  aspectRatio: '16/9',
                  bgcolor: alpha(VISUALIZER_COLOR, 0.1),
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: alpha(VISUALIZER_COLOR, 0.3),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CameraIcon sx={{ fontSize: 20, color: alpha(VISUALIZER_COLOR, 0.3) }} />
              </Box>
            </Grid>
          ))}
        </Grid>
      );
    }

    return (
      <Grid container spacing={0.5} sx={{ px: 1.5, py: 1 }}>
        {frames.slice(0, 4).map((url, index) => (
          <Grid key={index} size={{ xs: 6 }}>
            <Box
              sx={{
                aspectRatio: '16/9',
                borderRadius: 1,
                overflow: 'hidden',
                border: selectedIndex === index ? `2px solid ${VISUALIZER_COLOR}` : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`Frame ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Grid>
        ))}
        {frames.length > 4 && (
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
              +{frames.length - 4} more frames
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${VISUALIZER_COLOR}` : '1px solid',
        borderColor: selected ? VISUALIZER_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(VISUALIZER_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${VISUALIZER_COLOR} 0%, ${alpha(VISUALIZER_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <StoryboardIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Scene Visualizer'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Storyboard generation
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {getStatusIcon(data.status)}
          <IconButton size="small" onClick={handleToggleSettings} sx={{ color: 'white' }}>
            {showSettings ? <CollapseIcon /> : <SettingsIcon />}
          </IconButton>
        </Stack>
      </Box>

      {/* Progress bar */}
      {data.status === 'running' && (
        <LinearProgress
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': { backgroundColor: VISUALIZER_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 1.5 }}>
        {/* Visual Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Visual Style</InputLabel>
          <Select value={visualStyle} label="Visual Style" sx={{ fontSize: '0.8rem' }}>
            {VISUAL_STYLES.map((style) => (
              <MenuItem key={style.value} value={style.value} sx={{ fontSize: '0.8rem' }}>
                {style.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Aspect Ratio */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Aspect Ratio</InputLabel>
          <Select value={aspectRatio} label="Aspect Ratio" sx={{ fontSize: '0.8rem' }}>
            {ASPECT_RATIOS.map((ar) => (
              <MenuItem key={ar.value} value={ar.value} sx={{ fontSize: '0.8rem' }}>
                {ar.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', mb: 1.5 }}>
            {/* Frame Count */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Number of Frames: {frameCount}
            </Typography>
            <Slider
              value={frameCount}
              min={1}
              max={9}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 4, label: '4' },
                { value: 9, label: '9' },
              ]}
              sx={{
                color: VISUALIZER_COLOR,
                '& .MuiSlider-markLabel': { fontSize: '0.65rem' },
              }}
            />

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={includeComposition ? 'With Composition' : 'No Composition'}
                size="small"
                variant={includeComposition ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.65rem',
                  height: 20,
                  bgcolor: includeComposition ? alpha(VISUALIZER_COLOR, 0.2) : 'transparent',
                  color: includeComposition ? VISUALIZER_COLOR : 'text.secondary',
                }}
              />
            </Stack>
          </Box>
        </Collapse>

        {/* Frame Grid */}
        {renderFrameGrid()}

        {/* Frame Info */}
        {data.frames && data.frames.length > 0 && (
          <Box
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(VISUALIZER_COLOR, 0.08),
              border: `1px solid ${alpha(VISUALIZER_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" fontWeight={500} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Frame {(data.selectedFrameIndex ?? 0) + 1} of {data.frames.length}
            </Typography>
            {data.frames[data.selectedFrameIndex ?? 0] && (
              <>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                  <strong>Shot:</strong> {data.frames[data.selectedFrameIndex ?? 0].shotType}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem' }}>
                  <strong>Angle:</strong> {data.frames[data.selectedFrameIndex ?? 0].cameraAngle}
                </Typography>
                {data.frames[data.selectedFrameIndex ?? 0].dialogue && (
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', fontStyle: 'italic', mt: 0.5 }}>
                    "{data.frames[data.selectedFrameIndex ?? 0].dialogue}"
                  </Typography>
                )}
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={1}>
          <Chip
            label="Visual"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(VISUALIZER_COLOR, 0.15),
              color: VISUALIZER_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${frameCount} frames`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Add Frame">
            <IconButton
              size="small"
              disabled={data.status === 'running'}
              sx={{
                bgcolor: alpha(VISUALIZER_COLOR, 0.1),
                '&:hover': { bgcolor: alpha(VISUALIZER_COLOR, 0.2) },
              }}
            >
              <AddIcon sx={{ fontSize: 16, color: VISUALIZER_COLOR }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate Storyboard">
            <IconButton
              size="small"
              disabled={data.status === 'running'}
              sx={{
                bgcolor: VISUALIZER_COLOR,
                color: 'white',
                '&:hover': { bgcolor: alpha(VISUALIZER_COLOR, 0.8) },
                '&.Mui-disabled': { bgcolor: 'grey.300' },
              }}
            >
              <GenerateIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Connection Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}
    </Paper>
  );
});

export default SceneVisualizerNode;
