/**
 * PlotPointNode - Story beat and event creator
 * Creates structured plot points with:
 * - Beat types (inciting, turning point, climax, etc.)
 * - Stakes and consequences
 * - Emotional impact
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
  TrendingUp as PlotIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, PlotPointData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


const PLOT_COLOR = '#f59e0b';

// Beat types
const BEAT_TYPES = [
  { value: 'inciting', label: 'Inciting Incident' },
  { value: 'complication', label: 'Complication' },
  { value: 'turning-point', label: 'Turning Point' },
  { value: 'revelation', label: 'Revelation' },
  { value: 'confrontation', label: 'Confrontation' },
  { value: 'crisis', label: 'Crisis' },
  { value: 'climax', label: 'Climax' },
  { value: 'resolution', label: 'Resolution' },
  { value: 'cliffhanger', label: 'Cliffhanger' },
];

// Emotional impact types
const EMOTIONAL_IMPACTS = [
  { value: 'positive', label: 'Positive/Triumphant' },
  { value: 'negative', label: 'Negative/Devastating' },
  { value: 'mixed', label: 'Mixed/Bittersweet' },
  { value: 'neutral', label: 'Neutral/Informational' },
];

// ===== Types =====

export interface PlotPointNodeData extends CanvasNodeData {
  nodeType: 'plotPoint';
  plotPointData?: PlotPointData;
  generatedContent?: string;
}

export interface PlotPointNodeProps {
  id: string;
  data: PlotPointNodeData;
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

export const PlotPointNode = memo(function PlotPointNode({
  data,
  selected,
  isConnectable = true,
}: PlotPointNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const eventConcept = (data.parameters?.eventConcept as string) ?? '';
  const beatType = (data.parameters?.beatType as string) ?? 'turning-point';
  const stakes = (data.parameters?.stakes as number) ?? 50;
  const emotionalImpact = (data.parameters?.emotionalImpact as string) ?? 'mixed';

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
        border: selected ? `2px solid ${PLOT_COLOR}` : '1px solid',
        borderColor: selected ? PLOT_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(PLOT_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PLOT_COLOR} 0%, ${alpha(PLOT_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PlotIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Plot Point'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Story beats & events
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
            '& .MuiLinearProgress-bar': { backgroundColor: PLOT_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Event Concept */}
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Event Concept"
          value={eventConcept}
          placeholder="What happens at this story beat?"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Beat Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Beat Type</InputLabel>
          <Select value={beatType} label="Beat Type" sx={{ fontSize: '0.8rem' }}>
            {BEAT_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Stakes Level */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Stakes Level: {stakes}%
          </Typography>
          <Slider
            value={stakes}
            size="small"
            sx={{
              color: PLOT_COLOR,
              '& .MuiSlider-thumb': { width: 14, height: 14 },
            }}
          />
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Emotional Impact
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Impact</InputLabel>
              <Select value={emotionalImpact} label="Impact" sx={{ fontSize: '0.8rem' }}>
                {EMOTIONAL_IMPACTS.map((e) => (
                  <MenuItem key={e.value} value={e.value} sx={{ fontSize: '0.8rem' }}>
                    {e.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedContent && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(PLOT_COLOR, 0.08),
              border: `1px solid ${alpha(PLOT_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Plot Point
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.generatedContent.substring(0, 150)}...
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
              bgcolor: alpha(PLOT_COLOR, 0.15),
              color: PLOT_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={BEAT_TYPES.find(t => t.value === beatType)?.label || beatType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Plot Point">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !eventConcept}
            sx={{
              bgcolor: PLOT_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(PLOT_COLOR, 0.8) },
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

export default PlotPointNode;
