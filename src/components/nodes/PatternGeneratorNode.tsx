/**
 * PatternGeneratorNode - AI sewing pattern generator
 * Creates technical sewing patterns with:
 * - Size grading
 * - Pattern pieces
 * - Construction markings
 * - Seam allowances
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
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  GridOn as PatternIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, PortType } from '@/models/canvas';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const PORT_COLORS: Record<PortType, string> = {
  image: '#3b82f6',
  video: '#8b5cf6',
  audio: '#ec4899',
  text: '#f97316',
  style: '#06b6d4',
  character: '#a855f7',
  mesh3d: '#f59e0b',
  any: '#6b7280',
  story: '#10b981',
  scene: '#14b8a6',
  plotPoint: '#f59e0b',
  location: '#84cc16',
  dialogue: '#f472b6',
  treatment: '#a78bfa',
  outline: '#22d3ee',
  lore: '#c084fc',
  timeline: '#fbbf24',
  garment: '#ec4899',
  fabric: '#f472b6',
  pattern: '#f9a8d4',
  model: '#c084fc',
  outfit: '#a855f7',
  collection: '#8b5cf6',
  techPack: '#6366f1',
  lookbook: '#7c3aed',
};

const PATTERN_COLOR = '#f9a8d4';

// Size standards
const SIZE_STANDARDS = [
  { value: 'us', label: 'US (0-20)' },
  { value: 'uk', label: 'UK (4-24)' },
  { value: 'eu', label: 'EU (32-52)' },
  { value: 'asian', label: 'Asian (S-3XL)' },
  { value: 'custom', label: 'Custom Measurements' },
];

// Size ranges
const SIZE_RANGES = [
  { value: 'xs-xl', label: 'XS - XL (5 sizes)' },
  { value: 's-3xl', label: 'S - 3XL (6 sizes)' },
  { value: '0-20', label: '0 - 20 (11 sizes)' },
  { value: 'single', label: 'Single Size' },
];

// Pattern formats
const PATTERN_FORMATS = [
  { value: 'technical', label: 'Technical Flat' },
  { value: 'home-sewing', label: 'Home Sewing' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'digital', label: 'Digital Print' },
];

// Seam allowance options
const SEAM_ALLOWANCES = [
  { value: '0.5', label: '1/2" (1.3cm)' },
  { value: '0.625', label: '5/8" (1.6cm)' },
  { value: '1', label: '1" (2.5cm)' },
  { value: 'included', label: 'Included' },
  { value: 'none', label: 'Cut Line Only' },
];

// ===== Types =====

export interface PatternGeneratorNodeData extends CanvasNodeData {
  nodeType: 'patternGenerator';
  generatedPattern?: string;
  pieceCount?: number;
  sizes?: string[];
}

export interface PatternGeneratorNodeProps {
  id: string;
  data: PatternGeneratorNodeData;
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

export const PatternGeneratorNode = memo(function PatternGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: PatternGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const sizeStandard = (data.parameters?.sizeStandard as string) ?? 'us';
  const sizeRange = (data.parameters?.sizeRange as string) ?? 'xs-xl';
  const patternFormat = (data.parameters?.patternFormat as string) ?? 'technical';
  const seamAllowance = (data.parameters?.seamAllowance as string) ?? '0.625';
  const includeNotches = (data.parameters?.includeNotches as boolean) ?? true;
  const includeGrainLines = (data.parameters?.includeGrainLines as boolean) ?? true;

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
        border: selected ? `2px solid ${PATTERN_COLOR}` : '1px solid',
        borderColor: selected ? PATTERN_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(PATTERN_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PATTERN_COLOR} 0%, ${alpha(PATTERN_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PatternIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Pattern Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create sewing patterns
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
            '& .MuiLinearProgress-bar': { backgroundColor: PATTERN_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Size Standard */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Size Standard</InputLabel>
          <Select value={sizeStandard} label="Size Standard" sx={{ fontSize: '0.8rem' }}>
            {SIZE_STANDARDS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Size Range */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Size Range</InputLabel>
          <Select value={sizeRange} label="Size Range" sx={{ fontSize: '0.8rem' }}>
            {SIZE_RANGES.map((r) => (
              <MenuItem key={r.value} value={r.value} sx={{ fontSize: '0.8rem' }}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Pattern Format */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Pattern Format</InputLabel>
          <Select value={patternFormat} label="Pattern Format" sx={{ fontSize: '0.8rem' }}>
            {PATTERN_FORMATS.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.8rem' }}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Seam Allowance */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Seam Allowance</InputLabel>
              <Select value={seamAllowance} label="Seam Allowance" sx={{ fontSize: '0.8rem' }}>
                {SEAM_ALLOWANCES.map((s) => (
                  <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Toggles */}
            <Stack spacing={0}>
              <FormControlLabel
                control={<Switch checked={includeNotches} size="small" />}
                label={<Typography variant="caption">Include Notches</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={includeGrainLines} size="small" />}
                label={<Typography variant="caption">Include Grain Lines</Typography>}
              />
            </Stack>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedPattern && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(PATTERN_COLOR, 0.08),
              border: `1px solid ${alpha(PATTERN_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Pattern
            </Typography>
            <Box
              component="img"
              src={data.generatedPattern}
              alt="Generated pattern"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'contain',
                mt: 1,
                borderRadius: 1,
                bgcolor: 'white',
              }}
            />
            {data.pieceCount && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {data.pieceCount} pattern pieces
              </Typography>
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
            label="Pattern"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(PATTERN_COLOR, 0.15),
              color: '#be185d',
              fontWeight: 600,
            }}
          />
          <Chip
            label={SIZE_STANDARDS.find(s => s.value === sizeStandard)?.label.split(' ')[0] || sizeStandard}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Pattern">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: PATTERN_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(PATTERN_COLOR, 0.8) },
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

export default PatternGeneratorNode;
