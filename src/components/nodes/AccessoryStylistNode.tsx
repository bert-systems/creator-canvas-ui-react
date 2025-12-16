/**
 * AccessoryStylistNode - AI accessory stylist
 * Adds and styles accessories with:
 * - Jewelry selection
 * - Bags and shoes
 * - Hats and scarves
 * - Coordination with outfit
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
  Checkbox,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Diamond as AccessoryIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 340;

const ACCESSORY_COLOR = '#f59e0b';

// Accessory categories
const ACCESSORY_CATEGORIES = [
  { value: 'jewelry', label: 'Jewelry', icon: 'ring' },
  { value: 'bags', label: 'Bags', icon: 'bag' },
  { value: 'shoes', label: 'Shoes', icon: 'shoe' },
  { value: 'hats', label: 'Hats/Headwear', icon: 'hat' },
  { value: 'scarves', label: 'Scarves/Wraps', icon: 'scarf' },
  { value: 'belts', label: 'Belts', icon: 'belt' },
  { value: 'sunglasses', label: 'Eyewear', icon: 'glasses' },
  { value: 'watches', label: 'Watches', icon: 'watch' },
];

// Style levels
const STYLE_LEVELS = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'statement', label: 'Statement' },
  { value: 'maximal', label: 'Maximal' },
];

// Metal finishes (for jewelry)
const METAL_FINISHES = [
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'rose-gold', label: 'Rose Gold' },
  { value: 'mixed', label: 'Mixed Metals' },
  { value: 'gunmetal', label: 'Gunmetal' },
];

// ===== Types =====

export interface AccessoryStylistNodeData extends CanvasNodeData {
  nodeType: 'accessoryStylist';
  styledOutfit?: string;
  accessoriesAdded?: string[];
}

export interface AccessoryStylistNodeProps {
  id: string;
  data: AccessoryStylistNodeData;
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

export const AccessoryStylistNode = memo(function AccessoryStylistNode({
  data,
  selected,
  isConnectable = true,
}: AccessoryStylistNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const selectedCategories = (data.parameters?.selectedCategories as string[]) ?? ['jewelry', 'bags'];
  const styleLevel = (data.parameters?.styleLevel as string) ?? 'moderate';
  const metalFinish = (data.parameters?.metalFinish as string) ?? 'gold';
  const coordinateColors = (data.parameters?.coordinateColors as boolean) ?? true;
  const accessoryCount = (data.parameters?.accessoryCount as number) ?? 3;

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
        border: selected ? `2px solid ${ACCESSORY_COLOR}` : '1px solid',
        borderColor: selected ? ACCESSORY_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(ACCESSORY_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${ACCESSORY_COLOR} 0%, ${alpha(ACCESSORY_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessoryIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Accessory Stylist'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Style with accessories
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
            '& .MuiLinearProgress-bar': { backgroundColor: ACCESSORY_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Accessory Categories */}
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
          Accessory Types
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5, mb: 1.5 }}>
          {ACCESSORY_CATEGORIES.slice(0, 4).map((cat) => (
            <FormControlLabel
              key={cat.value}
              control={
                <Checkbox
                  checked={selectedCategories.includes(cat.value)}
                  size="small"
                  sx={{ p: 0.5 }}
                />
              }
              label={<Typography variant="caption">{cat.label}</Typography>}
              sx={{ m: 0, mr: 1 }}
            />
          ))}
        </Stack>

        {/* Style Level */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Style Level</InputLabel>
          <Select value={styleLevel} label="Style Level" sx={{ fontSize: '0.8rem' }}>
            {STYLE_LEVELS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Metal Finish */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Metal Finish</InputLabel>
          <Select value={metalFinish} label="Metal Finish" sx={{ fontSize: '0.8rem' }}>
            {METAL_FINISHES.map((m) => (
              <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.8rem' }}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* More Categories */}
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
              More Accessories
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5, mb: 1.5 }}>
              {ACCESSORY_CATEGORIES.slice(4).map((cat) => (
                <FormControlLabel
                  key={cat.value}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(cat.value)}
                      size="small"
                      sx={{ p: 0.5 }}
                    />
                  }
                  label={<Typography variant="caption">{cat.label}</Typography>}
                  sx={{ m: 0, mr: 1 }}
                />
              ))}
            </Stack>

            {/* Accessory Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Max Accessories: {accessoryCount}
              </Typography>
              <Slider
                value={accessoryCount}
                min={1}
                max={8}
                step={1}
                size="small"
                sx={{ color: ACCESSORY_COLOR }}
              />
            </Box>

            {/* Coordinate Colors */}
            <FormControlLabel
              control={<Checkbox checked={coordinateColors} size="small" />}
              label={<Typography variant="caption">Coordinate with Outfit Colors</Typography>}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.styledOutfit && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(ACCESSORY_COLOR, 0.08),
              border: `1px solid ${alpha(ACCESSORY_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Styled Outfit
            </Typography>
            <Box
              component="img"
              src={data.styledOutfit}
              alt="Styled outfit with accessories"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'contain',
                mt: 1,
                borderRadius: 1,
              }}
            />
            {data.accessoriesAdded && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Added: {data.accessoriesAdded.join(', ')}
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
            label="Accessories"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(ACCESSORY_COLOR, 0.15),
              color: ACCESSORY_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={STYLE_LEVELS.find(s => s.value === styleLevel)?.label || styleLevel}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Add Accessories">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: ACCESSORY_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(ACCESSORY_COLOR, 0.8) },
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

export default AccessoryStylistNode;
