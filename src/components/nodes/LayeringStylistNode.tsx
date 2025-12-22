/**
 * LayeringStylistNode - Outfit layering specialist
 * Creates stylized layered outfits:
 * - Smart garment layering
 * - Seasonal layering suggestions
 * - Visual layer order
 * - Styling tips
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
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Layers as LayerIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  FilterNone as StackIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;

const LAYER_COLOR = '#6366f1'; // Indigo for layering

// Season options
const SEASONS = [
  { value: 'spring', label: 'Spring', layers: 2 },
  { value: 'summer', label: 'Summer', layers: 1 },
  { value: 'fall', label: 'Fall', layers: 3 },
  { value: 'winter', label: 'Winter', layers: 4 },
  { value: 'transitional', label: 'Transitional', layers: 3 },
];

// Occasion options
const OCCASIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work/Office' },
  { value: 'evening', label: 'Evening Out' },
  { value: 'outdoor', label: 'Outdoor/Active' },
  { value: 'travel', label: 'Travel' },
  { value: 'formal', label: 'Formal' },
];

// Layering styles
const LAYERING_STYLES = [
  { value: 'minimal', label: 'Minimal', description: 'Clean, essential layers' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, comfortable' },
  { value: 'sophisticated', label: 'Sophisticated', description: 'Polished, refined' },
  { value: 'streetwear', label: 'Streetwear', description: 'Urban, edgy' },
  { value: 'bohemian', label: 'Bohemian', description: 'Free-spirited, artistic' },
];

// ===== Types =====

export interface LayeringStylistNodeData extends CanvasNodeData {
  nodeType: 'layeringStylist';
  layeredOutfit?: string;
  layerOrder?: string[];
  stylingTips?: string[];
}

export interface LayeringStylistNodeProps {
  id: string;
  data: LayeringStylistNodeData;
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

export const LayeringStylistNode = memo(function LayeringStylistNode({
  data,
  selected,
  isConnectable = true,
}: LayeringStylistNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const season = (data.parameters?.season as string) ?? 'fall';
  const occasion = (data.parameters?.occasion as string) ?? 'casual';
  const layeringStyle = (data.parameters?.layeringStyle as string) ?? 'casual';
  const layerCount = (data.parameters?.layerCount as number) ?? 3;
  const includeStylingTips = (data.parameters?.includeStylingTips as boolean) ?? true;

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
        border: selected ? `2px solid ${LAYER_COLOR}` : '1px solid',
        borderColor: selected ? LAYER_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(LAYER_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${LAYER_COLOR} 0%, ${alpha(LAYER_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LayerIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Layering Stylist'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Smart outfit layering
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
            '& .MuiLinearProgress-bar': { backgroundColor: LAYER_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Season */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Season</InputLabel>
          <Select value={season} label="Season" sx={{ fontSize: '0.8rem' }}>
            {SEASONS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
                  <span>{s.label}</span>
                  <Chip label={`${s.layers} layers`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Occasion */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Occasion</InputLabel>
          <Select value={occasion} label="Occasion" sx={{ fontSize: '0.8rem' }}>
            {OCCASIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.8rem' }}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Layering Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Layering Style</InputLabel>
          <Select value={layeringStyle} label="Layering Style" sx={{ fontSize: '0.8rem' }}>
            {LAYERING_STYLES.map((s) => (
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

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Layer Count */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Layer Count: {layerCount}
              </Typography>
              <Slider
                value={layerCount}
                min={1}
                max={5}
                step={1}
                size="small"
                sx={{ color: LAYER_COLOR }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Layer Order Visualization */}
        {data.layerOrder && data.layerOrder.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(LAYER_COLOR, 0.08),
              border: `1px solid ${alpha(LAYER_COLOR, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <StackIcon sx={{ fontSize: 14, color: LAYER_COLOR }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Layer Order
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {data.layerOrder.map((layer, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 0.75,
                    borderRadius: 0.5,
                    bgcolor: alpha(LAYER_COLOR, 0.05 + (i * 0.05)),
                    border: '1px solid',
                    borderColor: alpha(LAYER_COLOR, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: LAYER_COLOR, fontWeight: 600, minWidth: 20 }}>
                    {i + 1}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {layer}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Styling Tips */}
        {includeStylingTips && data.stylingTips && data.stylingTips.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha('#f59e0b', 0.08),
              border: `1px solid ${alpha('#f59e0b', 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
              Styling Tips
            </Typography>
            {data.stylingTips.map((tip, i) => (
              <Typography key={i} variant="caption" sx={{ fontSize: '0.7rem', display: 'block', color: 'text.secondary' }}>
                • {tip}
              </Typography>
            ))}
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
            label="Layers"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(LAYER_COLOR, 0.15),
              color: LAYER_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${layerCount} pieces`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Layered Outfit">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: LAYER_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(LAYER_COLOR, 0.8) },
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

export default LayeringStylistNode;
