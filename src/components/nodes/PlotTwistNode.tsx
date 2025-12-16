/**
 * PlotTwistNode - Surprising plot twist generator
 * Creates unexpected revelations with:
 * - Twist types (identity, betrayal, reality, etc.)
 * - Foreshadowing hints
 * - Aftermath implications
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
  Shuffle as TwistIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


const TWIST_COLOR = '#ef4444';

// Twist types
const TWIST_TYPES = [
  { value: 'identity', label: 'Hidden Identity Reveal' },
  { value: 'betrayal', label: 'Betrayal' },
  { value: 'reality', label: 'False Memory/Reality' },
  { value: 'allegiance', label: 'Unexpected Ally/Enemy' },
  { value: 'temporal', label: 'Time-Related' },
  { value: 'connection', label: 'Hidden Connection' },
  { value: 'genre', label: 'Genre Subversion' },
  { value: 'villain', label: 'The Real Villain' },
  { value: 'sacrifice', label: 'Sacrifice/Cost' },
];

// ===== Types =====

export interface PlotTwistNodeData extends CanvasNodeData {
  nodeType: 'plotTwist';
  generatedTwist?: string;
  foreshadowing?: string[];
}

export interface PlotTwistNodeProps {
  id: string;
  data: PlotTwistNodeData;
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

export const PlotTwistNode = memo(function PlotTwistNode({
  data,
  selected,
  isConnectable = true,
}: PlotTwistNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const twistType = (data.parameters?.twistType as string) ?? 'revelation';
  const intensity = (data.parameters?.intensity as number) ?? 70;
  const includeForeshadowing = (data.parameters?.includeForeshadowing as boolean) ?? true;

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
        border: selected ? `2px solid ${TWIST_COLOR}` : '1px solid',
        borderColor: selected ? TWIST_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(TWIST_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TWIST_COLOR} 0%, ${alpha(TWIST_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TwistIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Plot Twist'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Surprising revelations
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
            '& .MuiLinearProgress-bar': { backgroundColor: TWIST_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Input Indicator */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(TWIST_COLOR, 0.05), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Connect a story or outline to generate a twist
          </Typography>
        </Box>

        {/* Twist Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Twist Type</InputLabel>
          <Select value={twistType} label="Twist Type" sx={{ fontSize: '0.8rem' }}>
            {TWIST_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Twist Intensity */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Twist Intensity: {intensity}%
          </Typography>
          <Slider
            value={intensity}
            size="small"
            sx={{
              color: TWIST_COLOR,
              '& .MuiSlider-thumb': { width: 14, height: 14 },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Higher = more shocking and unexpected
          </Typography>
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <FormControlLabel
              control={<Switch checked={includeForeshadowing} size="small" />}
              label={<Typography variant="caption">Include Foreshadowing Hints</Typography>}
              sx={{ display: 'block' }}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedTwist && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(TWIST_COLOR, 0.08),
              border: `1px solid ${alpha(TWIST_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Twist
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.generatedTwist.substring(0, 150)}...
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
            label="Narrative"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(TWIST_COLOR, 0.15),
              color: TWIST_COLOR,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Tooltip title="Generate Twist">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: TWIST_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(TWIST_COLOR, 0.8) },
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

export default PlotTwistNode;
