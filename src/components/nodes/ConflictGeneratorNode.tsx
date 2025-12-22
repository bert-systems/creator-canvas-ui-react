/**
 * ConflictGeneratorNode - Story conflict creator
 * Generates compelling conflicts with:
 * - Conflict types (person vs. person, self, nature, etc.)
 * - Escalation paths
 * - Resolution possibilities
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
  Bolt as ConflictIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


const CONFLICT_COLOR = '#dc2626';

// Conflict types
const CONFLICT_TYPES = [
  { value: 'interpersonal', label: 'Person vs. Person' },
  { value: 'internal', label: 'Person vs. Self (Internal)' },
  { value: 'nature', label: 'Person vs. Nature' },
  { value: 'society', label: 'Person vs. Society' },
  { value: 'technology', label: 'Person vs. Technology' },
  { value: 'supernatural', label: 'Person vs. Supernatural' },
  { value: 'fate', label: 'Person vs. Fate/Time' },
];

// ===== Types =====

export interface ConflictGeneratorNodeData extends CanvasNodeData {
  nodeType: 'conflictGenerator';
  generatedConflict?: string;
  escalations?: string[];
}

export interface ConflictGeneratorNodeProps {
  id: string;
  data: ConflictGeneratorNodeData;
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

export const ConflictGeneratorNode = memo(function ConflictGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: ConflictGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const conflictType = (data.parameters?.conflictType as string) ?? 'interpersonal';
  const intensity = (data.parameters?.intensity as number) ?? 60;
  const includeEscalation = (data.parameters?.includeEscalation as boolean) ?? true;

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
        border: selected ? `2px solid ${CONFLICT_COLOR}` : '1px solid',
        borderColor: selected ? CONFLICT_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(CONFLICT_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${CONFLICT_COLOR} 0%, ${alpha(CONFLICT_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ConflictIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Conflict Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create compelling obstacles
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
            '& .MuiLinearProgress-bar': { backgroundColor: CONFLICT_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Input Indicator */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(CONFLICT_COLOR, 0.05), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Connect story, characters, or location to generate conflict
          </Typography>
        </Box>

        {/* Conflict Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Conflict Type</InputLabel>
          <Select value={conflictType} label="Conflict Type" sx={{ fontSize: '0.8rem' }}>
            {CONFLICT_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Conflict Intensity */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Conflict Intensity: {intensity}%
          </Typography>
          <Slider
            value={intensity}
            size="small"
            sx={{
              color: CONFLICT_COLOR,
              '& .MuiSlider-thumb': { width: 14, height: 14 },
            }}
          />
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <FormControlLabel
              control={<Switch checked={includeEscalation} size="small" />}
              label={<Typography variant="caption">Include Escalation Path</Typography>}
              sx={{ display: 'block' }}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedConflict && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(CONFLICT_COLOR, 0.08),
              border: `1px solid ${alpha(CONFLICT_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Conflict
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.generatedConflict.substring(0, 150)}...
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
              bgcolor: alpha(CONFLICT_COLOR, 0.15),
              color: CONFLICT_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={CONFLICT_TYPES.find(t => t.value === conflictType)?.label?.split(' vs. ')[1] || conflictType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Conflict">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: CONFLICT_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(CONFLICT_COLOR, 0.8) },
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

export default ConflictGeneratorNode;
