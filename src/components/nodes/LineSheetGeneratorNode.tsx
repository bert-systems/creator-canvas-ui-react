/**
 * LineSheetGeneratorNode - Wholesale line sheet creator
 * Generates professional wholesale line sheets:
 * - Product cards with images
 * - Wholesale pricing
 * - Fabric swatches
 * - Order form generation
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
  TextField,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Description as LineSheetIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const LINESHEET_COLOR = '#059669'; // Emerald for business/wholesale

// Format options
const FORMATS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'web', label: 'Web/Digital' },
  { value: 'excel', label: 'Excel Spreadsheet' },
];

// Layout styles
const LAYOUT_STYLES = [
  { value: 'grid', label: 'Grid Layout', description: '4-6 items per page' },
  { value: 'catalog', label: 'Catalog Style', description: 'Large images with details' },
  { value: 'minimal', label: 'Minimal', description: 'Clean, simple layout' },
  { value: 'detailed', label: 'Detailed', description: 'Full specs and pricing tiers' },
];

// ===== Types =====

export interface LineSheetGeneratorNodeData extends CanvasNodeData {
  nodeType: 'lineSheetGenerator';
  lineSheetUrl?: string;
  productCards?: string[];
  pageCount?: number;
}

export interface LineSheetGeneratorNodeProps {
  id: string;
  data: LineSheetGeneratorNodeData;
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

export const LineSheetGeneratorNode = memo(function LineSheetGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: LineSheetGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const format = (data.parameters?.format as string) ?? 'pdf';
  const layoutStyle = (data.parameters?.layoutStyle as string) ?? 'grid';
  const includeWholesalePricing = (data.parameters?.includeWholesalePricing as boolean) ?? true;
  const includeFabricSwatches = (data.parameters?.includeFabricSwatches as boolean) ?? true;
  const includeOrderForm = (data.parameters?.includeOrderForm as boolean) ?? true;
  const brandName = (data.parameters?.brandName as string) ?? '';
  const contactInfo = (data.parameters?.contactInfo as string) ?? '';

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
        border: selected ? `2px solid ${LINESHEET_COLOR}` : '1px solid',
        borderColor: selected ? LINESHEET_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(LINESHEET_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${LINESHEET_COLOR} 0%, ${alpha(LINESHEET_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LineSheetIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Line Sheet Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Wholesale catalog creation
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
            '& .MuiLinearProgress-bar': { backgroundColor: LINESHEET_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Format */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Export Format</InputLabel>
          <Select value={format} label="Export Format" sx={{ fontSize: '0.8rem' }}>
            {FORMATS.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.8rem' }}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Layout Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Layout Style</InputLabel>
          <Select value={layoutStyle} label="Layout Style" sx={{ fontSize: '0.8rem' }}>
            {LAYOUT_STYLES.map((l) => (
              <MenuItem key={l.value} value={l.value} sx={{ fontSize: '0.8rem' }}>
                <Box>
                  <Typography variant="body2">{l.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {l.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Include Options */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
            Include in Line Sheet
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Chip
              label="Wholesale Pricing"
              size="small"
              variant={includeWholesalePricing ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.65rem',
                height: 22,
                bgcolor: includeWholesalePricing ? alpha(LINESHEET_COLOR, 0.2) : 'transparent',
                borderColor: alpha(LINESHEET_COLOR, 0.5),
                color: includeWholesalePricing ? LINESHEET_COLOR : 'text.secondary',
              }}
            />
            <Chip
              label="Fabric Swatches"
              size="small"
              variant={includeFabricSwatches ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.65rem',
                height: 22,
                bgcolor: includeFabricSwatches ? alpha(LINESHEET_COLOR, 0.2) : 'transparent',
                borderColor: alpha(LINESHEET_COLOR, 0.5),
                color: includeFabricSwatches ? LINESHEET_COLOR : 'text.secondary',
              }}
            />
            <Chip
              label="Order Form"
              size="small"
              variant={includeOrderForm ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.65rem',
                height: 22,
                bgcolor: includeOrderForm ? alpha(LINESHEET_COLOR, 0.2) : 'transparent',
                borderColor: alpha(LINESHEET_COLOR, 0.5),
                color: includeOrderForm ? LINESHEET_COLOR : 'text.secondary',
              }}
            />
          </Stack>
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Brand Name */}
            <TextField
              fullWidth
              size="small"
              label="Brand Name"
              value={brandName}
              placeholder="Your brand name"
              sx={{
                mb: 1.5,
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            {/* Contact Info */}
            <TextField
              fullWidth
              size="small"
              label="Contact Information"
              value={contactInfo}
              placeholder="email@example.com"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Box>
        </Collapse>

        {/* Generated Line Sheet Info */}
        {data.pageCount && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(LINESHEET_COLOR, 0.08),
              border: `1px solid ${alpha(LINESHEET_COLOR, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <BusinessIcon sx={{ fontSize: 14, color: LINESHEET_COLOR }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Line Sheet Generated
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Stack alignItems="center">
                <Typography variant="h6" color={LINESHEET_COLOR} sx={{ fontWeight: 600, lineHeight: 1 }}>
                  {data.pageCount}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  pages
                </Typography>
              </Stack>
              {data.productCards && (
                <Stack alignItems="center">
                  <Typography variant="h6" color={LINESHEET_COLOR} sx={{ fontWeight: 600, lineHeight: 1 }}>
                    {data.productCards.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    products
                  </Typography>
                </Stack>
              )}
            </Stack>
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
            label="Wholesale"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(LINESHEET_COLOR, 0.15),
              color: LINESHEET_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={FORMATS.find(f => f.value === format)?.label.split(' ')[0] || format}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Stack direction="row" spacing={0.5}>
          {data.lineSheetUrl && (
            <Tooltip title="Download Line Sheet">
              <IconButton
                size="small"
                component="a"
                href={data.lineSheetUrl}
                download
                sx={{
                  bgcolor: alpha(LINESHEET_COLOR, 0.1),
                  '&:hover': { bgcolor: alpha(LINESHEET_COLOR, 0.2) },
                }}
              >
                <DownloadIcon sx={{ fontSize: 16, color: LINESHEET_COLOR }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Generate Line Sheet">
            <IconButton
              size="small"
              disabled={data.status === 'running'}
              sx={{
                bgcolor: LINESHEET_COLOR,
                color: 'white',
                '&:hover': { bgcolor: alpha(LINESHEET_COLOR, 0.8) },
                '&.Mui-disabled': { bgcolor: 'grey.300' },
              }}
            >
              <GenerateIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Connection Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}
    </Paper>
  );
});

export default LineSheetGeneratorNode;
