/**
 * SizeScalerNode - Garment size visualization tool
 * Scales garment visualizations across sizes:
 * - Size-accurate fit visualization
 * - Proportional adjustments
 * - Fit notes and recommendations
 * - Multi-size preview
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
  Straighten as SizeIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  SwapVert as ScaleIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;

const SIZE_COLOR = '#10b981'; // Emerald for sizing

// Size options
const SIZES = [
  { value: 'xxs', label: 'XXS', description: 'Extra Extra Small' },
  { value: 'xs', label: 'XS', description: 'Extra Small' },
  { value: 's', label: 'S', description: 'Small' },
  { value: 'm', label: 'M', description: 'Medium' },
  { value: 'l', label: 'L', description: 'Large' },
  { value: 'xl', label: 'XL', description: 'Extra Large' },
  { value: 'xxl', label: 'XXL', description: 'Extra Extra Large' },
  { value: 'plus', label: 'Plus', description: 'Plus Size' },
];

// Garment types for fit
const GARMENT_TYPES = [
  { value: 'dress', label: 'Dress' },
  { value: 'top', label: 'Top/Blouse' },
  { value: 'pants', label: 'Pants' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'jumpsuit', label: 'Jumpsuit' },
  { value: 'activewear', label: 'Activewear' },
  { value: 'swimwear', label: 'Swimwear' },
];

// Fit styles
const FIT_STYLES = [
  { value: 'true-to-size', label: 'True to Size' },
  { value: 'slim', label: 'Slim Fit' },
  { value: 'relaxed', label: 'Relaxed Fit' },
  { value: 'oversized', label: 'Oversized' },
];

// ===== Types =====

export interface SizeScalerNodeData extends CanvasNodeData {
  nodeType: 'sizeScaler';
  scaledImage?: string;
  fitNotes?: string[];
}

export interface SizeScalerNodeProps {
  id: string;
  data: SizeScalerNodeData;
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

export const SizeScalerNode = memo(function SizeScalerNode({
  data,
  selected,
  isConnectable = true,
}: SizeScalerNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const originalSize = (data.parameters?.originalSize as string) ?? 'm';
  const targetSize = (data.parameters?.targetSize as string) ?? 'l';
  const garmentType = (data.parameters?.garmentType as string) ?? 'dress';
  const fitStyle = (data.parameters?.fitStyle as string) ?? 'true-to-size';
  const maintainProportions = (data.parameters?.maintainProportions as boolean) ?? true;
  const generateComparison = (data.parameters?.generateComparison as boolean) ?? false;

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
        border: selected ? `2px solid ${SIZE_COLOR}` : '1px solid',
        borderColor: selected ? SIZE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(SIZE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${SIZE_COLOR} 0%, ${alpha(SIZE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SizeIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Size Scaler'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Size visualization tool
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
            '& .MuiLinearProgress-bar': { backgroundColor: SIZE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Size Selection Row */}
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>From Size</InputLabel>
              <Select value={originalSize} label="From Size" sx={{ fontSize: '0.8rem' }}>
                {SIZES.map((s) => (
                  <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ScaleIcon sx={{ color: SIZE_COLOR, fontSize: 20 }} />

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>To Size</InputLabel>
              <Select value={targetSize} label="To Size" sx={{ fontSize: '0.8rem' }}>
                {SIZES.map((s) => (
                  <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Garment Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Garment Type</InputLabel>
          <Select value={garmentType} label="Garment Type" sx={{ fontSize: '0.8rem' }}>
            {GARMENT_TYPES.map((g) => (
              <MenuItem key={g.value} value={g.value} sx={{ fontSize: '0.8rem' }}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Fit Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Fit Style</InputLabel>
          <Select value={fitStyle} label="Fit Style" sx={{ fontSize: '0.8rem' }}>
            {FIT_STYLES.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.8rem' }}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Maintain Proportions */}
            <FormControlLabel
              control={
                <Switch
                  checked={maintainProportions}
                  size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: SIZE_COLOR } }}
                />
              }
              label={<Typography variant="caption">Maintain Proportions</Typography>}
              sx={{ display: 'block', mb: 1 }}
            />

            {/* Generate Comparison */}
            <FormControlLabel
              control={
                <Switch
                  checked={generateComparison}
                  size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: SIZE_COLOR } }}
                />
              }
              label={<Typography variant="caption">Generate Side-by-Side Comparison</Typography>}
            />
          </Box>
        </Collapse>

        {/* Scaled Preview */}
        {data.scaledImage && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(SIZE_COLOR, 0.08),
              border: `1px solid ${alpha(SIZE_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Scaled Result
            </Typography>
            <Box
              component="img"
              src={data.scaledImage}
              alt="Scaled garment"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                mt: 1,
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        {/* Fit Notes */}
        {data.fitNotes && data.fitNotes.length > 0 && (
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
              Fit Notes
            </Typography>
            {data.fitNotes.map((note, i) => (
              <Typography key={i} variant="caption" sx={{ fontSize: '0.7rem', display: 'block', color: 'text.secondary' }}>
                • {note}
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
            label="Size"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(SIZE_COLOR, 0.15),
              color: SIZE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${originalSize.toUpperCase()} → ${targetSize.toUpperCase()}`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Scale Size">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: SIZE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(SIZE_COLOR, 0.8) },
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

export default SizeScalerNode;
