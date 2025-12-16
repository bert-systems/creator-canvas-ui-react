/**
 * ColorwayGeneratorNode - AI color variation generator
 * Creates color variations for patterns and textiles:
 * - Color scheme generation
 * - Seasonal color palettes
 * - Trend-based colorways
 * - Pantone matching
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
  Grid,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Palette as ColorIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  ColorLens as SwatchIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const COLORWAY_COLOR = '#06b6d4'; // Cyan for color

// Color schemes
const COLOR_SCHEMES = [
  { value: 'analogous', label: 'Analogous', description: 'Adjacent colors' },
  { value: 'complementary', label: 'Complementary', description: 'Opposite colors' },
  { value: 'triadic', label: 'Triadic', description: 'Three equidistant' },
  { value: 'split-complementary', label: 'Split Complementary', description: 'Y-shape' },
  { value: 'monochromatic', label: 'Monochromatic', description: 'Single hue' },
  { value: 'custom', label: 'Custom', description: 'User-defined' },
];

// Season options
const SEASONS = [
  { value: 'spring', label: 'Spring', colors: ['#fde68a', '#a7f3d0', '#fbcfe8'] },
  { value: 'summer', label: 'Summer', colors: ['#67e8f9', '#fca5a5', '#fde047'] },
  { value: 'fall', label: 'Fall', colors: ['#f97316', '#b45309', '#a16207'] },
  { value: 'winter', label: 'Winter', colors: ['#1e3a5f', '#6b7280', '#e5e7eb'] },
  { value: 'resort', label: 'Resort', colors: ['#22d3ee', '#f472b6', '#fcd34d'] },
  { value: 'transitional', label: 'Transitional', colors: ['#8b5cf6', '#10b981', '#f59e0b'] },
];

// Mood options
const MOODS = [
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'muted', label: 'Muted' },
  { value: 'earthy', label: 'Earthy' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'bold', label: 'Bold' },
  { value: 'neutral', label: 'Neutral' },
];

// ===== Types =====

export interface ColorwayGeneratorNodeData extends CanvasNodeData {
  nodeType: 'colorwayGenerator';
  generatedColorways?: Array<{
    id: string;
    name: string;
    preview: string;
    colors: string[];
  }>;
}

export interface ColorwayGeneratorNodeProps {
  id: string;
  data: ColorwayGeneratorNodeData;
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

export const ColorwayGeneratorNode = memo(function ColorwayGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: ColorwayGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const colorScheme = (data.parameters?.colorScheme as string) ?? 'analogous';
  const seasonalInfluence = (data.parameters?.seasonalInfluence as string) ?? 'transitional';
  const mood = (data.parameters?.mood as string) ?? 'vibrant';
  const variationCount = (data.parameters?.variationCount as number) ?? 4;

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Get seasonal preview colors
  const selectedSeason = SEASONS.find(s => s.value === seasonalInfluence);

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
        border: selected ? `2px solid ${COLORWAY_COLOR}` : '1px solid',
        borderColor: selected ? COLORWAY_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(COLORWAY_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORWAY_COLOR} 0%, ${alpha(COLORWAY_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ColorIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Colorway Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Color palette variations
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
            '& .MuiLinearProgress-bar': { backgroundColor: COLORWAY_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Color Scheme */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Color Scheme</InputLabel>
          <Select value={colorScheme} label="Color Scheme" sx={{ fontSize: '0.8rem' }}>
            {COLOR_SCHEMES.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                <Box>
                  <Typography variant="body2">{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Season */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Seasonal Influence</InputLabel>
          <Select value={seasonalInfluence} label="Seasonal Influence" sx={{ fontSize: '0.8rem' }}>
            {SEASONS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">{s.label}</Typography>
                  <Stack direction="row" spacing={0.25}>
                    {s.colors.map((c, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: c,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Season Color Preview */}
        {selectedSeason && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
              Season Palette Preview
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {selectedSeason.colors.map((color, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: 1,
                    height: 24,
                    bgcolor: color,
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: alpha('#000', 0.1),
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Mood */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Color Mood</InputLabel>
              <Select value={mood} label="Color Mood" sx={{ fontSize: '0.8rem' }}>
                {MOODS.map((m) => (
                  <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.8rem' }}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Variation Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Variations: {variationCount}
              </Typography>
              <Slider
                value={variationCount}
                min={2}
                max={8}
                step={1}
                size="small"
                sx={{ color: COLORWAY_COLOR }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Generated Colorways Preview */}
        {data.generatedColorways && data.generatedColorways.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(COLORWAY_COLOR, 0.08),
              border: `1px solid ${alpha(COLORWAY_COLOR, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <SwatchIcon sx={{ fontSize: 14, color: COLORWAY_COLOR }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Generated Colorways ({data.generatedColorways.length})
              </Typography>
            </Stack>
            <Grid container spacing={0.5}>
              {data.generatedColorways.slice(0, 4).map((cw) => (
                <Grid key={cw.id} size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 0.5,
                      borderRadius: 0.5,
                      bgcolor: 'white',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={0}>
                      {cw.colors.slice(0, 4).map((c, i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: 16,
                            bgcolor: c,
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', mt: 0.25, display: 'block' }}>
                      {cw.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
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
            label="Color"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(COLORWAY_COLOR, 0.15),
              color: COLORWAY_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${variationCount} variants`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Colorways">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: COLORWAY_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(COLORWAY_COLOR, 0.8) },
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

export default ColorwayGeneratorNode;
