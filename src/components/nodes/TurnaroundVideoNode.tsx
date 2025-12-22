/**
 * TurnaroundVideoNode - 360-degree product rotation video
 * Creates rotating product videos:
 * - Smooth 360-degree rotation
 * - Configurable speed and pauses
 * - Multiple export formats
 * - Angle stills extraction
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
  FormControlLabel,
  Switch,
  Slider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  ThreeSixty as RotateIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Videocam as VideoIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;

const ROTATE_COLOR = '#f59e0b'; // Amber for rotation

// Rotation speed options
const ROTATION_SPEEDS = [
  { value: 'slow', label: 'Slow', duration: '12s' },
  { value: 'medium', label: 'Medium', duration: '8s' },
  { value: 'fast', label: 'Fast', duration: '4s' },
];

// Duration options
const DURATIONS = [
  { value: '4s', label: '4 seconds' },
  { value: '6s', label: '6 seconds' },
  { value: '8s', label: '8 seconds' },
  { value: '10s', label: '10 seconds' },
  { value: '12s', label: '12 seconds' },
];

// Pause angle presets
const PAUSE_PRESETS = [
  { value: 'none', label: 'No Pauses', angles: [] },
  { value: 'quarters', label: 'Quarter Turns', angles: [0, 90, 180, 270] },
  { value: 'front-back', label: 'Front & Back', angles: [0, 180] },
  { value: 'all-sides', label: 'All Sides', angles: [0, 45, 90, 135, 180, 225, 270, 315] },
];

// ===== Types =====

export interface TurnaroundVideoNodeData extends CanvasNodeData {
  nodeType: 'turnaroundVideo';
  turnaroundVideo?: string;
  angleStills?: string[];
}

export interface TurnaroundVideoNodeProps {
  id: string;
  data: TurnaroundVideoNodeData;
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

export const TurnaroundVideoNode = memo(function TurnaroundVideoNode({
  data,
  selected,
  isConnectable = true,
}: TurnaroundVideoNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const rotationSpeed = (data.parameters?.rotationSpeed as string) ?? 'medium';
  const duration = (data.parameters?.duration as string) ?? '8s';
  const pausePreset = (data.parameters?.pausePreset as string) ?? 'quarters';
  const smoothLoop = (data.parameters?.smoothLoop as boolean) ?? true;
  const extractStills = (data.parameters?.extractStills as boolean) ?? true;
  const pauseDuration = (data.parameters?.pauseDuration as number) ?? 0.5;

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Get pause angles for display
  const selectedPausePreset = PAUSE_PRESETS.find(p => p.value === pausePreset);

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

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${ROTATE_COLOR}` : '1px solid',
        borderColor: selected ? ROTATE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(ROTATE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${ROTATE_COLOR} 0%, ${alpha(ROTATE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <RotateIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Turnaround Video'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              360° product rotation
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
            '& .MuiLinearProgress-bar': { backgroundColor: ROTATE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Rotation Speed */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Rotation Speed</InputLabel>
          <Select value={rotationSpeed} label="Rotation Speed" sx={{ fontSize: '0.8rem' }}>
            {ROTATION_SPEEDS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label} ({s.duration})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Duration */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Video Duration</InputLabel>
          <Select value={duration} label="Video Duration" sx={{ fontSize: '0.8rem' }}>
            {DURATIONS.map((d) => (
              <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.8rem' }}>
                {d.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Pause Angles */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Pause Points</InputLabel>
          <Select value={pausePreset} label="Pause Points" sx={{ fontSize: '0.8rem' }}>
            {PAUSE_PRESETS.map((p) => (
              <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.8rem' }}>
                <Box>
                  <Typography variant="body2">{p.label}</Typography>
                  {p.angles.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      {p.angles.map(a => `${a}°`).join(', ')}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Rotation visualization */}
        <Box
          sx={{
            mb: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(ROTATE_COLOR, 0.08),
            border: `1px solid ${alpha(ROTATE_COLOR, 0.2)}`,
          }}
        >
          <Box sx={{ position: 'relative', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: `2px solid ${alpha(ROTATE_COLOR, 0.3)}`,
                position: 'relative',
              }}
            >
              {selectedPausePreset?.angles.map((angle) => (
                <Box
                  key={angle}
                  sx={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: ROTATE_COLOR,
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-21px)`,
                  }}
                />
              ))}
              <RotateIcon
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 20,
                  color: ROTATE_COLOR,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Pause Duration */}
            {pausePreset !== 'none' && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Pause Duration: {pauseDuration}s
                </Typography>
                <Slider
                  value={pauseDuration}
                  min={0.25}
                  max={2}
                  step={0.25}
                  size="small"
                  sx={{ color: ROTATE_COLOR }}
                />
              </Box>
            )}

            {/* Smooth Loop */}
            <FormControlLabel
              control={
                <Switch
                  checked={smoothLoop}
                  size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ROTATE_COLOR } }}
                />
              }
              label={<Typography variant="caption">Seamless Loop</Typography>}
              sx={{ display: 'block', mb: 1 }}
            />

            {/* Extract Stills */}
            <FormControlLabel
              control={
                <Switch
                  checked={extractStills}
                  size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ROTATE_COLOR } }}
                />
              }
              label={<Typography variant="caption">Extract Still Images</Typography>}
            />
          </Box>
        </Collapse>

        {/* Video Preview */}
        {data.turnaroundVideo && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(ROTATE_COLOR, 0.08),
              border: `1px solid ${alpha(ROTATE_COLOR, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <VideoIcon sx={{ fontSize: 14, color: ROTATE_COLOR }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Turnaround Video
              </Typography>
            </Stack>
            <Box
              component="video"
              src={data.turnaroundVideo}
              controls
              loop
              muted
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 0.5,
              }}
            />
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
            label="360°"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(ROTATE_COLOR, 0.15),
              color: ROTATE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={duration}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Turnaround Video">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: ROTATE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(ROTATE_COLOR, 0.8) },
              '&.Mui-disabled': { bgcolor: 'grey.300' },
            }}
          >
            <GenerateIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Connection Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}
    </Paper>
  );
});

export default TurnaroundVideoNode;
