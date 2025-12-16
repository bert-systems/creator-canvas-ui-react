/**
 * EcommerceShotNode - AI e-commerce product photography generator
 * Creates professional product photos for online stores with:
 * - Multiple shot types (ghost mannequin, on-model, detail)
 * - Background options
 * - Lighting presets
 * - Multiple angle generation
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
  CameraAlt as EcommerceIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 340;

const ECOMMERCE_COLOR = '#3b82f6';

// Shot types
const SHOT_TYPES = [
  { value: 'ghost-mannequin', label: 'Ghost Mannequin' },
  { value: 'on-model', label: 'On Model' },
  { value: 'hanger', label: 'On Hanger' },
  { value: 'flat-lay', label: 'Flat Lay' },
  { value: 'detail', label: 'Detail Shot' },
  { value: 'packshot', label: 'Packshot' },
];

// Background options
const BACKGROUND_OPTIONS = [
  { value: 'white', label: 'Pure White' },
  { value: 'light-gray', label: 'Light Gray' },
  { value: 'studio', label: 'Studio Gradient' },
  { value: 'lifestyle', label: 'Lifestyle Setting' },
  { value: 'transparent', label: 'Transparent (PNG)' },
];

// Lighting presets
const LIGHTING_PRESETS = [
  { value: 'studio-soft', label: 'Studio Soft Box' },
  { value: 'natural', label: 'Natural Light' },
  { value: 'dramatic', label: 'Dramatic' },
  { value: 'flat', label: 'Flat/Even' },
  { value: 'rim', label: 'Rim Light' },
];

// Camera angles
const CAMERA_ANGLES = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
  { value: 'side', label: 'Side' },
  { value: '45-degree', label: '45° Angle' },
  { value: 'detail-close', label: 'Detail Close-up' },
];

// ===== Types =====

export interface EcommerceShotNodeData extends CanvasNodeData {
  nodeType: 'ecommerceShot';
  generatedShots?: string[];
  primaryShot?: string;
}

export interface EcommerceShotNodeProps {
  id: string;
  data: EcommerceShotNodeData;
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

export const EcommerceShotNode = memo(function EcommerceShotNode({
  data,
  selected,
  isConnectable = true,
}: EcommerceShotNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const shotType = (data.parameters?.shotType as string) ?? 'ghost-mannequin';
  const background = (data.parameters?.background as string) ?? 'white';
  const lighting = (data.parameters?.lighting as string) ?? 'studio-soft';
  const cameraAngle = (data.parameters?.cameraAngle as string) ?? 'front';
  const angleCount = (data.parameters?.angleCount as number) ?? 4;
  const includeDetail = (data.parameters?.includeDetail as boolean) ?? true;
  const highResolution = (data.parameters?.highResolution as boolean) ?? true;

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
        border: selected ? `2px solid ${ECOMMERCE_COLOR}` : '1px solid',
        borderColor: selected ? ECOMMERCE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(ECOMMERCE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${ECOMMERCE_COLOR} 0%, ${alpha(ECOMMERCE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <EcommerceIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'E-commerce Shot'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Professional product photos
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
            '& .MuiLinearProgress-bar': { backgroundColor: ECOMMERCE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Shot Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Shot Type</InputLabel>
          <Select value={shotType} label="Shot Type" sx={{ fontSize: '0.8rem' }}>
            {SHOT_TYPES.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Background */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Background</InputLabel>
          <Select value={background} label="Background" sx={{ fontSize: '0.8rem' }}>
            {BACKGROUND_OPTIONS.map((b) => (
              <MenuItem key={b.value} value={b.value} sx={{ fontSize: '0.8rem' }}>
                {b.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Lighting */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Lighting</InputLabel>
          <Select value={lighting} label="Lighting" sx={{ fontSize: '0.8rem' }}>
            {LIGHTING_PRESETS.map((l) => (
              <MenuItem key={l.value} value={l.value} sx={{ fontSize: '0.8rem' }}>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Camera Angle */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Primary Angle</InputLabel>
              <Select value={cameraAngle} label="Primary Angle" sx={{ fontSize: '0.8rem' }}>
                {CAMERA_ANGLES.map((c) => (
                  <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.8rem' }}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Angle Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Angles: {angleCount}
              </Typography>
              <Slider
                value={angleCount}
                min={1}
                max={8}
                step={1}
                size="small"
                sx={{ color: ECOMMERCE_COLOR }}
              />
            </Box>

            {/* Toggles */}
            <Stack spacing={0}>
              <FormControlLabel
                control={<Switch checked={includeDetail} size="small" />}
                label={<Typography variant="caption">Include Detail Shots</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={highResolution} size="small" />}
                label={<Typography variant="caption">High Resolution (4K)</Typography>}
              />
            </Stack>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.primaryShot && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(ECOMMERCE_COLOR, 0.08),
              border: `1px solid ${alpha(ECOMMERCE_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Primary Shot
            </Typography>
            <Box
              component="img"
              src={data.primaryShot}
              alt="Generated product shot"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'contain',
                mt: 1,
                borderRadius: 1,
                bgcolor: 'white',
              }}
            />
            {data.generatedShots && data.generatedShots.length > 1 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                +{data.generatedShots.length - 1} more angles
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
            label="E-commerce"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(ECOMMERCE_COLOR, 0.15),
              color: ECOMMERCE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={SHOT_TYPES.find(s => s.value === shotType)?.label || shotType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Photos">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: ECOMMERCE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(ECOMMERCE_COLOR, 0.8) },
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

export default EcommerceShotNode;
