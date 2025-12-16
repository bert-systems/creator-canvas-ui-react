/**
 * MonologueGeneratorNode - Powerful speech and monologue creator
 * Creates compelling monologues with:
 * - Different types (dramatic, villain, inspirational, etc.)
 * - Emotional intensity control
 * - Character voice integration
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
  Mic as MonologueIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 300;


const MONOLOGUE_COLOR = '#7c3aed';

// Monologue types
const MONOLOGUE_TYPES = [
  { value: 'internal', label: 'Internal/Stream of Consciousness' },
  { value: 'dramatic', label: 'Dramatic Speech' },
  { value: 'villain', label: 'Villain Reveal' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'confession', label: 'Confession' },
  { value: 'eulogy', label: 'Eulogy/Memorial' },
  { value: 'love', label: 'Declaration of Love' },
  { value: 'philosophical', label: 'Philosophical' },
];

// Length options
const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (30-60 seconds)' },
  { value: 'medium', label: 'Medium (1-2 minutes)' },
  { value: 'extended', label: 'Extended (2-5 minutes)' },
];

// ===== Types =====

export interface MonologueGeneratorNodeData extends CanvasNodeData {
  nodeType: 'monologueGenerator';
  generatedMonologue?: string;
}

export interface MonologueGeneratorNodeProps {
  id: string;
  data: MonologueGeneratorNodeData;
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

export const MonologueGeneratorNode = memo(function MonologueGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: MonologueGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const theme = (data.parameters?.theme as string) ?? '';
  const monologueType = (data.parameters?.monologueType as string) ?? 'dramatic';
  const length = (data.parameters?.length as string) ?? 'medium';
  const emotionalIntensity = (data.parameters?.emotionalIntensity as number) ?? 70;

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
        border: selected ? `2px solid ${MONOLOGUE_COLOR}` : '1px solid',
        borderColor: selected ? MONOLOGUE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(MONOLOGUE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${MONOLOGUE_COLOR} 0%, ${alpha(MONOLOGUE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <MonologueIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Monologue Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Powerful speeches
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
            '& .MuiLinearProgress-bar': { backgroundColor: MONOLOGUE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Theme/Topic */}
        <TextField
          fullWidth
          size="small"
          label="Theme/Topic"
          value={theme}
          placeholder="What is the monologue about?"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.85rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Monologue Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Monologue Type</InputLabel>
          <Select value={monologueType} label="Monologue Type" sx={{ fontSize: '0.8rem' }}>
            {MONOLOGUE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Length */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Length</InputLabel>
          <Select value={length} label="Length" sx={{ fontSize: '0.8rem' }}>
            {LENGTH_OPTIONS.map((l) => (
              <MenuItem key={l.value} value={l.value} sx={{ fontSize: '0.8rem' }}>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Emotional Intensity
            </Typography>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Intensity: {emotionalIntensity}%
              </Typography>
              <Slider
                value={emotionalIntensity}
                size="small"
                sx={{
                  color: MONOLOGUE_COLOR,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedMonologue && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(MONOLOGUE_COLOR, 0.08),
              border: `1px solid ${alpha(MONOLOGUE_COLOR, 0.2)}`,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Monologue
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontSize: '0.75rem', fontStyle: 'italic' }}
            >
              "{data.generatedMonologue.substring(0, 200)}..."
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
            label="Dialogue"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(MONOLOGUE_COLOR, 0.15),
              color: MONOLOGUE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={MONOLOGUE_TYPES.find(t => t.value === monologueType)?.label?.split('/')[0] || monologueType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Monologue">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !theme}
            sx={{
              bgcolor: MONOLOGUE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(MONOLOGUE_COLOR, 0.8) },
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

export default MonologueGeneratorNode;
