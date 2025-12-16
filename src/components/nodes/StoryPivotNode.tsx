/**
 * StoryPivotNode - Redirect story direction
 * Creates pivotal moments that shift narrative with:
 * - Pivot types (genre shift, tone change, revelation)
 * - Smoothness control
 * - Impact analysis
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Slider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  SwapHoriz as PivotIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


const PIVOT_COLOR = '#0891b2';

// Pivot types
const PIVOT_TYPES = [
  { value: 'genreShift', label: 'Genre Shift', description: 'Change genre mid-story' },
  { value: 'toneChange', label: 'Tone Change', description: 'Shift emotional tone' },
  { value: 'revelation', label: 'Major Revelation', description: 'Game-changing information' },
  { value: 'timeJump', label: 'Time Jump', description: 'Leap forward or backward' },
  { value: 'pov', label: 'POV Shift', description: 'Change perspective' },
  { value: 'reality', label: 'Reality Shift', description: 'Change what is "real"' },
];

// ===== Types =====

export interface StoryPivotNodeData extends CanvasNodeData {
  nodeType: 'storyPivot';
  pivotDescription?: string;
  impactAnalysis?: string;
}

export interface StoryPivotNodeProps {
  id: string;
  data: StoryPivotNodeData;
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

export const StoryPivotNode = memo(function StoryPivotNode({
  data,
  selected,
  isConnectable = true,
}: StoryPivotNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const pivotType = (data.parameters?.pivotType as string) ?? 'revelation';
  const targetState = (data.parameters?.targetState as string) ?? '';
  const smoothness = (data.parameters?.smoothness as number) ?? 50;

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
        border: selected ? `2px solid ${PIVOT_COLOR}` : '1px solid',
        borderColor: selected ? PIVOT_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(PIVOT_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PIVOT_COLOR} 0%, ${alpha(PIVOT_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PivotIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Story Pivot'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Redirect narrative
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
            '& .MuiLinearProgress-bar': { backgroundColor: PIVOT_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Target State */}
        <TextField
          fullWidth
          size="small"
          label="Target State"
          value={targetState}
          placeholder="Where should the story pivot to?"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.85rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Pivot Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Pivot Type</InputLabel>
          <Select value={pivotType} label="Pivot Type" sx={{ fontSize: '0.8rem' }}>
            {PIVOT_TYPES.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                <Box>
                  <Typography variant="body2">{p.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
              Transition Smoothness
            </Typography>
            <Box>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Abrupt</Typography>
                <Typography variant="caption" color="text.secondary">Gradual</Typography>
              </Stack>
              <Slider
                value={smoothness}
                size="small"
                sx={{
                  color: PIVOT_COLOR,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.pivotDescription && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(PIVOT_COLOR, 0.08),
              border: `1px solid ${alpha(PIVOT_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Pivot Description
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.pivotDescription.substring(0, 150)}...
            </Typography>
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
            label="Enhancement"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(PIVOT_COLOR, 0.15),
              color: PIVOT_COLOR,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Tooltip title="Generate Pivot">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !targetState}
            sx={{
              bgcolor: PIVOT_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(PIVOT_COLOR, 0.8) },
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

export default StoryPivotNode;
