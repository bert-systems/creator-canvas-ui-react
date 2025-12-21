/**
 * TextileDesignerNode - AI fabric pattern designer
 * Creates seamless textile patterns with:
 * - Multiple pattern types
 * - Scale and repeat options
 * - Color variations
 * - On-garment preview
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
  Texture as TextileIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;

const TEXTILE_COLOR = '#f472b6';

// Pattern types
const PATTERN_TYPES = [
  { value: 'geometric', label: 'Geometric' },
  { value: 'floral', label: 'Floral' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'animal', label: 'Animal Print' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'paisley', label: 'Paisley' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'ethnic', label: 'Ethnic/Tribal' },
  { value: 'damask', label: 'Damask' },
  { value: 'dots', label: 'Polka Dots' },
];

// Scale options
const SCALE_OPTIONS = [
  { value: 'micro', label: 'Micro' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'oversized', label: 'Oversized' },
];

// Repeat types
const REPEAT_TYPES = [
  { value: 'full-drop', label: 'Full Drop' },
  { value: 'half-drop', label: 'Half Drop' },
  { value: 'brick', label: 'Brick' },
  { value: 'mirror', label: 'Mirror' },
  { value: 'random', label: 'Random' },
];

// ===== Types =====

export interface TextileDesignerNodeData extends CanvasNodeData {
  nodeType: 'textileDesigner';
  generatedPattern?: string;
  colorVariations?: string[];
}

export interface TextileDesignerNodeProps {
  id: string;
  data: TextileDesignerNodeData;
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

export const TextileDesignerNode = memo(function TextileDesignerNode({
  data,
  selected,
  isConnectable = true,
}: TextileDesignerNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const patternConcept = (data.parameters?.patternConcept as string) ?? '';
  const patternType = (data.parameters?.patternType as string) ?? 'geometric';
  const scale = (data.parameters?.scale as string) ?? 'medium';
  const repeatType = (data.parameters?.repeatType as string) ?? 'full-drop';
  const colorVariants = (data.parameters?.colorVariants as number) ?? 4;

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
        border: selected ? `2px solid ${TEXTILE_COLOR}` : '1px solid',
        borderColor: selected ? TEXTILE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(TEXTILE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TEXTILE_COLOR} 0%, ${alpha(TEXTILE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextileIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Textile Designer'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create fabric patterns
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
            '& .MuiLinearProgress-bar': { backgroundColor: TEXTILE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Pattern Concept */}
        <TextField
          fullWidth
          size="small"
          label="Pattern Description"
          value={patternConcept}
          placeholder="Describe your pattern..."
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Pattern Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Pattern Type</InputLabel>
          <Select value={patternType} label="Pattern Type" sx={{ fontSize: '0.8rem' }}>
            {PATTERN_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Scale */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Scale</InputLabel>
          <Select value={scale} label="Scale" sx={{ fontSize: '0.8rem' }}>
            {SCALE_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Repeat Type */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Repeat Type</InputLabel>
              <Select value={repeatType} label="Repeat Type" sx={{ fontSize: '0.8rem' }}>
                {REPEAT_TYPES.map((r) => (
                  <MenuItem key={r.value} value={r.value} sx={{ fontSize: '0.8rem' }}>
                    {r.label}
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
                max={8}
                step={1}
                size="small"
                sx={{ color: TEXTILE_COLOR }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedPattern && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(TEXTILE_COLOR, 0.08),
              border: `1px solid ${alpha(TEXTILE_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Pattern
            </Typography>
            <Box
              component="img"
              src={data.generatedPattern}
              alt="Generated pattern"
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
            label="Textile"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(TEXTILE_COLOR, 0.15),
              color: TEXTILE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={PATTERN_TYPES.find(t => t.value === patternType)?.label || patternType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Pattern">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: TEXTILE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(TEXTILE_COLOR, 0.8) },
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

export default TextileDesignerNode;
