/**
 * CollectionBuilderNode - AI fashion collection builder
 * Creates cohesive fashion collections with:
 * - Season/theme definition
 * - Piece count and categories
 * - Color story
 * - Collection narrative
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
  Collections as CollectionIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 360;

const COLLECTION_COLOR = '#8b5cf6';

// Collection types
const COLLECTION_TYPES = [
  { value: 'ready-to-wear', label: 'Ready-to-Wear' },
  { value: 'haute-couture', label: 'Haute Couture' },
  { value: 'resort', label: 'Resort/Cruise' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'bridal', label: 'Bridal' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'sustainable', label: 'Sustainable' },
];

// Season options
const SEASON_OPTIONS = [
  { value: 'spring-summer', label: 'Spring/Summer' },
  { value: 'fall-winter', label: 'Fall/Winter' },
  { value: 'pre-fall', label: 'Pre-Fall' },
  { value: 'resort', label: 'Resort' },
  { value: 'holiday', label: 'Holiday' },
];

// Market segments
const MARKET_SEGMENTS = [
  { value: 'luxury', label: 'Luxury' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'mass-market', label: 'Mass Market' },
  { value: 'fast-fashion', label: 'Fast Fashion' },
];

// Garment categories
const GARMENT_CATEGORIES = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'footwear', label: 'Footwear' },
];

// ===== Types =====

export interface CollectionBuilderNodeData extends CanvasNodeData {
  nodeType: 'collectionBuilder';
  collectionOverview?: string;
  pieceCount?: number;
  generatedPieces?: string[];
}

export interface CollectionBuilderNodeProps {
  id: string;
  data: CollectionBuilderNodeData;
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

export const CollectionBuilderNode = memo(function CollectionBuilderNode({
  data,
  selected,
  isConnectable = true,
}: CollectionBuilderNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const collectionName = (data.parameters?.collectionName as string) ?? '';
  const collectionTheme = (data.parameters?.collectionTheme as string) ?? '';
  const collectionType = (data.parameters?.collectionType as string) ?? 'ready-to-wear';
  const season = (data.parameters?.season as string) ?? 'spring-summer';
  const marketSegment = (data.parameters?.marketSegment as string) ?? 'contemporary';
  const pieceCount = (data.parameters?.pieceCount as number) ?? 20;

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
        border: selected ? `2px solid ${COLLECTION_COLOR}` : '1px solid',
        borderColor: selected ? COLLECTION_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(COLLECTION_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLLECTION_COLOR} 0%, ${alpha(COLLECTION_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CollectionIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Collection Builder'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Build fashion collections
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
            '& .MuiLinearProgress-bar': { backgroundColor: COLLECTION_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Collection Name */}
        <TextField
          fullWidth
          size="small"
          label="Collection Name"
          value={collectionName}
          placeholder="e.g., 'Urban Nomad'"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Theme/Inspiration */}
        <TextField
          fullWidth
          size="small"
          label="Theme/Inspiration"
          value={collectionTheme}
          placeholder="Describe collection theme..."
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Collection Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Collection Type</InputLabel>
          <Select value={collectionType} label="Collection Type" sx={{ fontSize: '0.8rem' }}>
            {COLLECTION_TYPES.map((c) => (
              <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.8rem' }}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Season */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Season</InputLabel>
          <Select value={season} label="Season" sx={{ fontSize: '0.8rem' }}>
            {SEASON_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Market Segment */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Market Segment</InputLabel>
              <Select value={marketSegment} label="Market Segment" sx={{ fontSize: '0.8rem' }}>
                {MARKET_SEGMENTS.map((m) => (
                  <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.8rem' }}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Piece Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Pieces: {pieceCount}
              </Typography>
              <Slider
                value={pieceCount}
                min={5}
                max={50}
                step={5}
                size="small"
                sx={{ color: COLLECTION_COLOR }}
              />
            </Box>

            {/* Category Distribution Preview */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
                Category Mix
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                {GARMENT_CATEGORIES.slice(0, 4).map((cat) => (
                  <Chip
                    key={cat.value}
                    label={cat.label}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      bgcolor: alpha(COLLECTION_COLOR, 0.1),
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.collectionOverview && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(COLLECTION_COLOR, 0.08),
              border: `1px solid ${alpha(COLLECTION_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Collection Overview
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.collectionOverview}
            </Typography>
            {data.generatedPieces && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {data.generatedPieces.length} pieces generated
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
            label="Collection"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(COLLECTION_COLOR, 0.15),
              color: COLLECTION_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={SEASON_OPTIONS.find(s => s.value === season)?.label || season}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Build Collection">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !collectionTheme}
            sx={{
              bgcolor: COLLECTION_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(COLLECTION_COLOR, 0.8) },
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

export default CollectionBuilderNode;
