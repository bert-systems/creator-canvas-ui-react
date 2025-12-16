/**
 * OutfitComposerNode - AI outfit styling composer
 * Creates complete styled outfits with:
 * - Multiple garment layering
 * - Style direction
 * - Season and occasion
 * - Color coordination
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Style as OutfitIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, PortType } from '@/models/canvas';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 340;

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

const OUTFIT_COLOR = '#a855f7';

// Style directions
const STYLE_DIRECTIONS = [
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'business', label: 'Business' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'avant-garde', label: 'Avant-Garde' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'sporty', label: 'Sporty' },
];

// Seasons
const SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall/Autumn' },
  { value: 'winter', label: 'Winter' },
  { value: 'transitional', label: 'Transitional' },
];

// Occasions
const OCCASIONS = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'work', label: 'Work' },
  { value: 'evening', label: 'Evening Out' },
  { value: 'special-event', label: 'Special Event' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'date-night', label: 'Date Night' },
];

// Color palettes
const COLOR_PALETTES = [
  { value: 'monochrome', label: 'Monochrome' },
  { value: 'complementary', label: 'Complementary' },
  { value: 'analogous', label: 'Analogous' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'bold', label: 'Bold Colors' },
  { value: 'pastel', label: 'Pastel' },
  { value: 'earth-tones', label: 'Earth Tones' },
];

// ===== Types =====

export interface OutfitComposerNodeData extends CanvasNodeData {
  nodeType: 'outfitComposer';
  generatedOutfit?: string;
  layerCount?: number;
}

export interface OutfitComposerNodeProps {
  id: string;
  data: OutfitComposerNodeData;
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

export const OutfitComposerNode = memo(function OutfitComposerNode({
  data,
  selected,
  isConnectable = true,
}: OutfitComposerNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const styleNotes = (data.parameters?.styleNotes as string) ?? '';
  const styleDirection = (data.parameters?.styleDirection as string) ?? 'casual';
  const season = (data.parameters?.season as string) ?? 'spring';
  const occasion = (data.parameters?.occasion as string) ?? 'everyday';
  const colorPalette = (data.parameters?.colorPalette as string) ?? 'neutral';
  const layerCount = (data.parameters?.layerCount as number) ?? 3;
  const includeAccessories = (data.parameters?.includeAccessories as boolean) ?? true;

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
        border: selected ? `2px solid ${OUTFIT_COLOR}` : '1px solid',
        borderColor: selected ? OUTFIT_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(OUTFIT_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${OUTFIT_COLOR} 0%, ${alpha(OUTFIT_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <OutfitIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Outfit Composer'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Style complete outfits
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
            '& .MuiLinearProgress-bar': { backgroundColor: OUTFIT_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Style Notes */}
        <TextField
          fullWidth
          size="small"
          label="Style Notes"
          value={styleNotes}
          placeholder="Additional styling notes..."
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Style Direction */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Style Direction</InputLabel>
          <Select value={styleDirection} label="Style Direction" sx={{ fontSize: '0.8rem' }}>
            {STYLE_DIRECTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Season */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Season</InputLabel>
          <Select value={season} label="Season" sx={{ fontSize: '0.8rem' }}>
            {SEASONS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
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

            {/* Color Palette */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Color Palette</InputLabel>
              <Select value={colorPalette} label="Color Palette" sx={{ fontSize: '0.8rem' }}>
                {COLOR_PALETTES.map((c) => (
                  <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.8rem' }}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Layer Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Layers: {layerCount}
              </Typography>
              <Slider
                value={layerCount}
                min={1}
                max={5}
                step={1}
                size="small"
                sx={{ color: OUTFIT_COLOR }}
              />
            </Box>

            {/* Include Accessories */}
            <FormControlLabel
              control={<Switch checked={includeAccessories} size="small" />}
              label={<Typography variant="caption">Include Accessories</Typography>}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedOutfit && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(OUTFIT_COLOR, 0.08),
              border: `1px solid ${alpha(OUTFIT_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Styled Outfit
            </Typography>
            <Box
              component="img"
              src={data.generatedOutfit}
              alt="Generated outfit"
              sx={{
                width: '100%',
                height: 120,
                objectFit: 'contain',
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
            label="Outfit"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(OUTFIT_COLOR, 0.15),
              color: OUTFIT_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={STYLE_DIRECTIONS.find(s => s.value === styleDirection)?.label || styleDirection}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Compose Outfit">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: OUTFIT_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(OUTFIT_COLOR, 0.8) },
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

export default OutfitComposerNode;
