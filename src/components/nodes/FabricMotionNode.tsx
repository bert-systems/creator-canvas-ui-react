/**
 * FabricMotionNode - AI fabric motion animator
 * Creates fabric movement animations with:
 * - Flow and drape simulation
 * - Wind effects
 * - Walking movement
 * - Runway animation
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
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Air as FabricMotionIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const MOTION_COLOR = '#8b5cf6';

// Motion types
const MOTION_TYPES = [
  { value: 'gentle-sway', label: 'Gentle Sway' },
  { value: 'wind-blown', label: 'Wind Blown' },
  { value: 'walking', label: 'Walking Motion' },
  { value: 'runway-walk', label: 'Runway Walk' },
  { value: 'spin', label: 'Spin/Twirl' },
  { value: 'dramatic', label: 'Dramatic Flow' },
  { value: 'static-drape', label: 'Static Drape' },
];

// Fabric behaviors
const FABRIC_BEHAVIORS = [
  { value: 'light-flowy', label: 'Light & Flowy' },
  { value: 'structured', label: 'Structured' },
  { value: 'heavy-drape', label: 'Heavy Drape' },
  { value: 'crisp', label: 'Crisp' },
  { value: 'stretchy', label: 'Stretchy' },
  { value: 'sheer', label: 'Sheer' },
];

// Wind directions
const WIND_DIRECTIONS = [
  { value: 'left', label: 'From Left' },
  { value: 'right', label: 'From Right' },
  { value: 'front', label: 'From Front' },
  { value: 'behind', label: 'From Behind' },
  { value: 'swirling', label: 'Swirling' },
];

// Duration options
const DURATION_OPTIONS = [
  { value: '2', label: '2 seconds' },
  { value: '3', label: '3 seconds' },
  { value: '5', label: '5 seconds' },
  { value: '8', label: '8 seconds' },
  { value: '10', label: '10 seconds' },
];

// ===== Types =====

export interface FabricMotionNodeData extends CanvasNodeData {
  nodeType: 'fabricMotion';
  generatedVideo?: string;
  thumbnailFrame?: string;
}

export interface FabricMotionNodeProps {
  id: string;
  data: FabricMotionNodeData;
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

export const FabricMotionNode = memo(function FabricMotionNode({
  data,
  selected,
  isConnectable = true,
}: FabricMotionNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const motionType = (data.parameters?.motionType as string) ?? 'gentle-sway';
  const fabricBehavior = (data.parameters?.fabricBehavior as string) ?? 'light-flowy';
  const windDirection = (data.parameters?.windDirection as string) ?? 'right';
  const duration = (data.parameters?.duration as string) ?? '3';
  const intensity = (data.parameters?.intensity as number) ?? 50;
  const loopVideo = (data.parameters?.loopVideo as boolean) ?? true;

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

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${MOTION_COLOR}` : '1px solid',
        borderColor: selected ? MOTION_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(MOTION_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${MOTION_COLOR} 0%, ${alpha(MOTION_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FabricMotionIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Fabric Motion'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Animate fabric movement
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
            '& .MuiLinearProgress-bar': { backgroundColor: MOTION_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Motion Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Motion Type</InputLabel>
          <Select value={motionType} label="Motion Type" sx={{ fontSize: '0.8rem' }}>
            {MOTION_TYPES.map((m) => (
              <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.8rem' }}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Fabric Behavior */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Fabric Behavior</InputLabel>
          <Select value={fabricBehavior} label="Fabric Behavior" sx={{ fontSize: '0.8rem' }}>
            {FABRIC_BEHAVIORS.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.8rem' }}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Duration */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Duration</InputLabel>
          <Select value={duration} label="Duration" sx={{ fontSize: '0.8rem' }}>
            {DURATION_OPTIONS.map((d) => (
              <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.8rem' }}>
                {d.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Wind Direction */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Wind Direction</InputLabel>
              <Select value={windDirection} label="Wind Direction" sx={{ fontSize: '0.8rem' }}>
                {WIND_DIRECTIONS.map((w) => (
                  <MenuItem key={w.value} value={w.value} sx={{ fontSize: '0.8rem' }}>
                    {w.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Motion Intensity */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Intensity: {intensity}%
              </Typography>
              <Slider
                value={intensity}
                min={10}
                max={100}
                step={10}
                size="small"
                sx={{ color: MOTION_COLOR }}
              />
            </Box>

            {/* Loop Video */}
            <FormControlLabel
              control={<Switch checked={loopVideo} size="small" />}
              label={<Typography variant="caption">Loop Video</Typography>}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.thumbnailFrame && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(MOTION_COLOR, 0.08),
              border: `1px solid ${alpha(MOTION_COLOR, 0.2)}`,
              position: 'relative',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Animation
            </Typography>
            <Box
              component="img"
              src={data.thumbnailFrame}
              alt="Animation thumbnail"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                mt: 1,
                borderRadius: 1,
              }}
            />
            <Chip
              label={`${duration}s`}
              size="small"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                height: 18,
                fontSize: '0.6rem',
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
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
            label="Video"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(MOTION_COLOR, 0.15),
              color: MOTION_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={MOTION_TYPES.find(m => m.value === motionType)?.label || motionType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Animation">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: MOTION_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(MOTION_COLOR, 0.8) },
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

export default FabricMotionNode;
