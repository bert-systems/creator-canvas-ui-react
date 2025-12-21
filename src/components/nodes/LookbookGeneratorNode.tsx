/**
 * LookbookGeneratorNode - AI lookbook creator
 * Creates professional lookbook spreads with:
 * - Layout templates
 * - Brand styling
 * - Multiple page formats
 * - Export options
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
  MenuBook as LookbookIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 340;

const LOOKBOOK_COLOR = '#7c3aed';

// Layout styles
const LAYOUT_STYLES = [
  { value: 'editorial', label: 'Editorial' },
  { value: 'catalog', label: 'Catalog' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'grid', label: 'Grid' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'digital', label: 'Digital/Social' },
];

// Page formats
const PAGE_FORMATS = [
  { value: 'a4-portrait', label: 'A4 Portrait' },
  { value: 'a4-landscape', label: 'A4 Landscape' },
  { value: 'letter', label: 'US Letter' },
  { value: 'square', label: 'Square (1:1)' },
  { value: 'instagram', label: 'Instagram (4:5)' },
];

// Brand aesthetics
const BRAND_AESTHETICS = [
  { value: 'luxury', label: 'Luxury' },
  { value: 'modern', label: 'Modern' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'classic', label: 'Classic' },
  { value: 'edgy', label: 'Edgy' },
];

// ===== Types =====

export interface LookbookGeneratorNodeData extends CanvasNodeData {
  nodeType: 'lookbookGenerator';
  generatedLookbook?: string;
  pageCount?: number;
  spreads?: string[];
}

export interface LookbookGeneratorNodeProps {
  id: string;
  data: LookbookGeneratorNodeData;
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

export const LookbookGeneratorNode = memo(function LookbookGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: LookbookGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const lookbookTitle = (data.parameters?.lookbookTitle as string) ?? '';
  const layoutStyle = (data.parameters?.layoutStyle as string) ?? 'editorial';
  const pageFormat = (data.parameters?.pageFormat as string) ?? 'a4-portrait';
  const brandAesthetic = (data.parameters?.brandAesthetic as string) ?? 'modern';
  const pageCount = (data.parameters?.pageCount as number) ?? 12;
  const includeCover = (data.parameters?.includeCover as boolean) ?? true;
  const includeCredits = (data.parameters?.includeCredits as boolean) ?? true;

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
        border: selected ? `2px solid ${LOOKBOOK_COLOR}` : '1px solid',
        borderColor: selected ? LOOKBOOK_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(LOOKBOOK_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${LOOKBOOK_COLOR} 0%, ${alpha(LOOKBOOK_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LookbookIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Lookbook Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create fashion lookbooks
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
            '& .MuiLinearProgress-bar': { backgroundColor: LOOKBOOK_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Lookbook Title */}
        <TextField
          fullWidth
          size="small"
          label="Lookbook Title"
          value={lookbookTitle}
          placeholder="e.g., 'SS25 Collection'"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Layout Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Layout Style</InputLabel>
          <Select value={layoutStyle} label="Layout Style" sx={{ fontSize: '0.8rem' }}>
            {LAYOUT_STYLES.map((l) => (
              <MenuItem key={l.value} value={l.value} sx={{ fontSize: '0.8rem' }}>
                {l.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Page Format */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Page Format</InputLabel>
          <Select value={pageFormat} label="Page Format" sx={{ fontSize: '0.8rem' }}>
            {PAGE_FORMATS.map((p) => (
              <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.8rem' }}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Brand Aesthetic */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Brand Aesthetic</InputLabel>
              <Select value={brandAesthetic} label="Brand Aesthetic" sx={{ fontSize: '0.8rem' }}>
                {BRAND_AESTHETICS.map((b) => (
                  <MenuItem key={b.value} value={b.value} sx={{ fontSize: '0.8rem' }}>
                    {b.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Page Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Pages: {pageCount}
              </Typography>
              <Slider
                value={pageCount}
                min={4}
                max={32}
                step={2}
                size="small"
                sx={{ color: LOOKBOOK_COLOR }}
              />
            </Box>

            {/* Include Options */}
            <Stack spacing={0}>
              <FormControlLabel
                control={<Switch checked={includeCover} size="small" />}
                label={<Typography variant="caption">Include Cover</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={includeCredits} size="small" />}
                label={<Typography variant="caption">Include Credits Page</Typography>}
              />
            </Stack>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedLookbook && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(LOOKBOOK_COLOR, 0.08),
              border: `1px solid ${alpha(LOOKBOOK_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Lookbook
            </Typography>
            <Box
              component="img"
              src={data.generatedLookbook}
              alt="Generated lookbook spread"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                mt: 1,
                borderRadius: 1,
              }}
            />
            {data.spreads && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {data.spreads.length} spreads • {pageCount} pages
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
            label="Lookbook"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(LOOKBOOK_COLOR, 0.15),
              color: LOOKBOOK_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={LAYOUT_STYLES.find(l => l.value === layoutStyle)?.label || layoutStyle}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Lookbook">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: LOOKBOOK_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(LOOKBOOK_COLOR, 0.8) },
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

export default LookbookGeneratorNode;
