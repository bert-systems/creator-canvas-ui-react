/**
 * GhostMannequinNode - Invisible mannequin product shots
 * Creates professional product photography without visible mannequin:
 * - Ghost/invisible mannequin effect
 * - Interior view compositing
 * - Multiple angle support
 * - Professional e-commerce ready
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
  Checkbox,
  Grid,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  PersonOff as GhostIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;

const GHOST_COLOR = '#64748b'; // Slate for ghost mannequin

// Garment types
const GARMENT_TYPES = [
  { value: 'dress', label: 'Dress' },
  { value: 'top', label: 'Top/Blouse' },
  { value: 'shirt', label: 'Shirt' },
  { value: 'jacket', label: 'Jacket/Coat' },
  { value: 'pants', label: 'Pants' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'jumpsuit', label: 'Jumpsuit' },
];

// View options
const VIEW_OPTIONS = [
  { value: 'front', label: 'Front View' },
  { value: 'back', label: 'Back View' },
  { value: 'side', label: 'Side View' },
  { value: 'interior', label: 'Interior/Neck View' },
];

// Background options
const BACKGROUNDS = [
  { value: 'pure-white', label: 'Pure White' },
  { value: 'light-gray', label: 'Light Gray' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'transparent', label: 'Transparent (PNG)' },
];

// Shadow styles
const SHADOW_STYLES = [
  { value: 'soft', label: 'Soft Shadow' },
  { value: 'hard', label: 'Hard Shadow' },
  { value: 'natural', label: 'Natural Drop Shadow' },
  { value: 'none', label: 'No Shadow' },
];

// ===== Types =====

export interface GhostMannequinNodeData extends CanvasNodeData {
  nodeType: 'ghostMannequin';
  ghostImages?: string[];
  compositedView?: string;
}

export interface GhostMannequinNodeProps {
  id: string;
  data: GhostMannequinNodeData;
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

export const GhostMannequinNode = memo(function GhostMannequinNode({
  data,
  selected,
  isConnectable = true,
}: GhostMannequinNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const garmentType = (data.parameters?.garmentType as string) ?? 'dress';
  const selectedViews = (data.parameters?.selectedViews as string[]) ?? ['front', 'back'];
  const background = (data.parameters?.background as string) ?? 'pure-white';
  const shadowStyle = (data.parameters?.shadowStyle as string) ?? 'soft';
  const includeInterior = (data.parameters?.includeInterior as boolean) ?? true;

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
        border: selected ? `2px solid ${GHOST_COLOR}` : '1px solid',
        borderColor: selected ? GHOST_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(GHOST_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${GHOST_COLOR} 0%, ${alpha(GHOST_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <GhostIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Ghost Mannequin'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Invisible mannequin shots
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
            '& .MuiLinearProgress-bar': { backgroundColor: GHOST_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
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

        {/* Views Selection */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
            Views to Generate
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {VIEW_OPTIONS.map((view) => (
              <Chip
                key={view.value}
                label={view.label}
                size="small"
                variant={selectedViews.includes(view.value) ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.65rem',
                  height: 22,
                  bgcolor: selectedViews.includes(view.value) ? alpha(GHOST_COLOR, 0.2) : 'transparent',
                  borderColor: alpha(GHOST_COLOR, 0.5),
                  color: selectedViews.includes(view.value) ? GHOST_COLOR : 'text.secondary',
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Background */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Background</InputLabel>
          <Select value={background} label="Background" sx={{ fontSize: '0.8rem' }}>
            {BACKGROUNDS.map((b) => (
              <MenuItem key={b.value} value={b.value} sx={{ fontSize: '0.8rem' }}>
                {b.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Shadow Style */}
            <FormControl size="small" fullWidth sx={{ mb: 1 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Shadow Style</InputLabel>
              <Select value={shadowStyle} label="Shadow Style" sx={{ fontSize: '0.8rem' }}>
                {SHADOW_STYLES.map((s) => (
                  <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Include Interior */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeInterior}
                  size="small"
                  sx={{ color: GHOST_COLOR, '&.Mui-checked': { color: GHOST_COLOR } }}
                />
              }
              label={<Typography variant="caption">Include interior/neck composite</Typography>}
            />
          </Box>
        </Collapse>

        {/* Generated Images Preview */}
        {data.ghostImages && data.ghostImages.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(GHOST_COLOR, 0.08),
              border: `1px solid ${alpha(GHOST_COLOR, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <ViewIcon sx={{ fontSize: 14, color: GHOST_COLOR }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Ghost Mannequin Views ({data.ghostImages.length})
              </Typography>
            </Stack>
            <Grid container spacing={0.5}>
              {data.ghostImages.slice(0, 4).map((url, i) => (
                <Grid key={i} size={{ xs: 6 }}>
                  <Box
                    component="img"
                    src={url}
                    alt={`Ghost view ${i + 1}`}
                    sx={{
                      width: '100%',
                      aspectRatio: '3/4',
                      objectFit: 'cover',
                      borderRadius: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'white',
                    }}
                  />
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
            label="Ghost"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(GHOST_COLOR, 0.15),
              color: GHOST_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${selectedViews.length} views`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Ghost Mannequin">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: GHOST_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(GHOST_COLOR, 0.8) },
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

export default GhostMannequinNode;
