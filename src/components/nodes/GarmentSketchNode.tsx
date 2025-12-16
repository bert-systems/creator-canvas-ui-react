/**
 * GarmentSketchNode - AI garment design sketcher
 * Creates fashion design sketches from concepts with:
 * - Multiple garment types
 * - Silhouette options
 * - Color variations
 * - Front/back views
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
  Draw as SketchIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const SKETCH_COLOR = '#ec4899';

// Garment types
const GARMENT_TYPES = [
  { value: 'dress', label: 'Dress' },
  { value: 'top', label: 'Top/Blouse' },
  { value: 'pants', label: 'Pants/Trousers' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'jacket', label: 'Jacket/Coat' },
  { value: 'jumpsuit', label: 'Jumpsuit' },
  { value: 'suit', label: 'Suit' },
  { value: 'swimwear', label: 'Swimwear' },
  { value: 'activewear', label: 'Activewear' },
];

// Silhouette types
const SILHOUETTES = [
  { value: 'fitted', label: 'Fitted' },
  { value: 'a-line', label: 'A-Line' },
  { value: 'oversized', label: 'Oversized' },
  { value: 'bodycon', label: 'Bodycon' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'structured', label: 'Structured' },
];

// Sketch styles
const SKETCH_STYLES = [
  { value: 'fashion-illustration', label: 'Fashion Illustration' },
  { value: 'technical-flat', label: 'Technical Flat' },
  { value: 'croquis', label: 'Croquis' },
  { value: 'artistic', label: 'Artistic' },
];

// ===== Types =====

export interface GarmentSketchNodeData extends CanvasNodeData {
  nodeType: 'garmentSketch';
  generatedSketch?: string;
  colorVariations?: string[];
}

export interface GarmentSketchNodeProps {
  id: string;
  data: GarmentSketchNodeData;
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

export const GarmentSketchNode = memo(function GarmentSketchNode({
  data,
  selected,
  isConnectable = true,
}: GarmentSketchNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const designConcept = (data.parameters?.designConcept as string) ?? '';
  const garmentType = (data.parameters?.garmentType as string) ?? 'dress';
  const silhouette = (data.parameters?.silhouette as string) ?? 'fitted';
  const sketchStyle = (data.parameters?.sketchStyle as string) ?? 'fashion-illustration';
  const colorVariants = (data.parameters?.colorVariants as number) ?? 3;

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
        border: selected ? `2px solid ${SKETCH_COLOR}` : '1px solid',
        borderColor: selected ? SKETCH_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(SKETCH_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${SKETCH_COLOR} 0%, ${alpha(SKETCH_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SketchIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Garment Sketch'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Design fashion sketches
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
            '& .MuiLinearProgress-bar': { backgroundColor: SKETCH_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Design Concept */}
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Design Concept"
          value={designConcept}
          placeholder="Describe your garment design..."
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Garment Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Garment Type</InputLabel>
          <Select value={garmentType} label="Garment Type" sx={{ fontSize: '0.8rem' }}>
            {GARMENT_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Silhouette */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Silhouette</InputLabel>
          <Select value={silhouette} label="Silhouette" sx={{ fontSize: '0.8rem' }}>
            {SILHOUETTES.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Sketch Style */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Sketch Style</InputLabel>
              <Select value={sketchStyle} label="Sketch Style" sx={{ fontSize: '0.8rem' }}>
                {SKETCH_STYLES.map((s) => (
                  <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                    {s.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Color Variations */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Color Variations: {colorVariants}
              </Typography>
              <Slider
                value={colorVariants}
                min={1}
                max={6}
                step={1}
                size="small"
                sx={{ color: SKETCH_COLOR }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedSketch && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(SKETCH_COLOR, 0.08),
              border: `1px solid ${alpha(SKETCH_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Sketch
            </Typography>
            <Box
              component="img"
              src={data.generatedSketch}
              alt="Generated sketch"
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
            label="Design"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(SKETCH_COLOR, 0.15),
              color: SKETCH_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={GARMENT_TYPES.find(t => t.value === garmentType)?.label || garmentType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Sketch">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !designConcept}
            sx={{
              bgcolor: SKETCH_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(SKETCH_COLOR, 0.8) },
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

export default GarmentSketchNode;
