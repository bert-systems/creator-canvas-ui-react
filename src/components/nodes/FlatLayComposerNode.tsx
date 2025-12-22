/**
 * FlatLayComposerNode - AI flat lay product photography composer
 * Creates styled flat lay product shots with:
 * - Layout arrangements
 * - Background surfaces
 * - Props and styling
 * - Shadow and lighting
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
  ViewQuilt as FlatLayIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const FLATLAY_COLOR = '#f472b6';

// Layout arrangements
const LAYOUT_ARRANGEMENTS = [
  { value: 'centered', label: 'Centered Hero' },
  { value: 'diagonal', label: 'Diagonal' },
  { value: 'grid', label: 'Grid' },
  { value: 'scattered', label: 'Scattered' },
  { value: 'knolling', label: 'Knolling' },
  { value: 'layered', label: 'Layered' },
  { value: 'asymmetric', label: 'Asymmetric' },
];

// Background surfaces
const BACKGROUND_SURFACES = [
  { value: 'marble', label: 'White Marble' },
  { value: 'wood', label: 'Wood Grain' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'fabric', label: 'Fabric/Linen' },
  { value: 'paper', label: 'Paper/Card' },
  { value: 'seamless', label: 'Seamless White' },
  { value: 'colored', label: 'Solid Color' },
  { value: 'gradient', label: 'Gradient' },
];

// Prop styles
const PROP_STYLES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'botanical', label: 'Botanical' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'clean', label: 'Clean/None' },
];

// Shadow styles
const SHADOW_STYLES = [
  { value: 'soft', label: 'Soft Drop' },
  { value: 'hard', label: 'Hard Shadow' },
  { value: 'natural', label: 'Natural Light' },
  { value: 'none', label: 'No Shadow' },
];

// ===== Types =====

export interface FlatLayComposerNodeData extends CanvasNodeData {
  nodeType: 'flatLayComposer';
  generatedFlatLay?: string;
  alternateAngles?: string[];
}

export interface FlatLayComposerNodeProps {
  id: string;
  data: FlatLayComposerNodeData;
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

export const FlatLayComposerNode = memo(function FlatLayComposerNode({
  data,
  selected,
  isConnectable = true,
}: FlatLayComposerNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const layoutArrangement = (data.parameters?.layoutArrangement as string) ?? 'centered';
  const backgroundSurface = (data.parameters?.backgroundSurface as string) ?? 'marble';
  const propStyle = (data.parameters?.propStyle as string) ?? 'minimal';
  const shadowStyle = (data.parameters?.shadowStyle as string) ?? 'soft';
  const itemCount = (data.parameters?.itemCount as number) ?? 3;
  const includeHands = (data.parameters?.includeHands as boolean) ?? false;

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
        border: selected ? `2px solid ${FLATLAY_COLOR}` : '1px solid',
        borderColor: selected ? FLATLAY_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(FLATLAY_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${FLATLAY_COLOR} 0%, ${alpha(FLATLAY_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <FlatLayIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Flat Lay Composer'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create product flat lays
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
            '& .MuiLinearProgress-bar': { backgroundColor: FLATLAY_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Layout Arrangement */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Layout</InputLabel>
          <Select value={layoutArrangement} label="Layout" sx={{ fontSize: '0.8rem' }}>
            {LAYOUT_ARRANGEMENTS.map((l) => (
              <MenuItem key={l.value} value={l.value} sx={{ fontSize: '0.8rem' }}>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Background Surface */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Background</InputLabel>
          <Select value={backgroundSurface} label="Background" sx={{ fontSize: '0.8rem' }}>
            {BACKGROUND_SURFACES.map((b) => (
              <MenuItem key={b.value} value={b.value} sx={{ fontSize: '0.8rem' }}>
                {b.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Prop Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Props Style</InputLabel>
          <Select value={propStyle} label="Props Style" sx={{ fontSize: '0.8rem' }}>
            {PROP_STYLES.map((p) => (
              <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.8rem' }}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Shadow Style */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Shadow</InputLabel>
              <Select value={shadowStyle} label="Shadow" sx={{ fontSize: '0.8rem' }}>
                {SHADOW_STYLES.map((s) => (
                  <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Item Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Items: {itemCount}
              </Typography>
              <Slider
                value={itemCount}
                min={1}
                max={8}
                step={1}
                size="small"
                sx={{ color: FLATLAY_COLOR }}
              />
            </Box>

            {/* Include Hands */}
            <FormControlLabel
              control={<Switch checked={includeHands} size="small" />}
              label={<Typography variant="caption">Include Hands</Typography>}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedFlatLay && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(FLATLAY_COLOR, 0.08),
              border: `1px solid ${alpha(FLATLAY_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Flat Lay
            </Typography>
            <Box
              component="img"
              src={data.generatedFlatLay}
              alt="Generated flat lay"
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
            label="Flat Lay"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(FLATLAY_COLOR, 0.15),
              color: FLATLAY_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={LAYOUT_ARRANGEMENTS.find(l => l.value === layoutArrangement)?.label || layoutArrangement}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Flat Lay">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: FLATLAY_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(FLATLAY_COLOR, 0.8) },
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

export default FlatLayComposerNode;
