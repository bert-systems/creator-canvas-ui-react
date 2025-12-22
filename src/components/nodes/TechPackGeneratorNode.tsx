/**
 * TechPackGeneratorNode - AI technical specification generator
 * Creates comprehensive tech packs with:
 * - Measurement specs
 * - Construction details
 * - Material specifications
 * - Cost breakdown
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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Description as TechPackIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 340;

const TECHPACK_COLOR = '#6366f1';

// Output formats
const OUTPUT_FORMATS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'excel', label: 'Excel Spreadsheet' },
  { value: 'illustrator', label: 'Adobe Illustrator' },
  { value: 'json', label: 'Structured JSON' },
];

// Measurement units
const MEASUREMENT_UNITS = [
  { value: 'inches', label: 'Inches' },
  { value: 'cm', label: 'Centimeters' },
  { value: 'both', label: 'Both (Dual)' },
];

// Detail levels
const DETAIL_LEVELS = [
  { value: 'basic', label: 'Basic (Key specs)' },
  { value: 'standard', label: 'Standard' },
  { value: 'comprehensive', label: 'Comprehensive' },
  { value: 'production', label: 'Production Ready' },
];

// ===== Types =====

export interface TechPackGeneratorNodeData extends CanvasNodeData {
  nodeType: 'techPackGenerator';
  generatedTechPack?: string;
  pageCount?: number;
}

export interface TechPackGeneratorNodeProps {
  id: string;
  data: TechPackGeneratorNodeData;
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

export const TechPackGeneratorNode = memo(function TechPackGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: TechPackGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const styleName = (data.parameters?.styleName as string) ?? '';
  const styleNumber = (data.parameters?.styleNumber as string) ?? '';
  const outputFormat = (data.parameters?.outputFormat as string) ?? 'pdf';
  const measurementUnit = (data.parameters?.measurementUnit as string) ?? 'inches';
  const detailLevel = (data.parameters?.detailLevel as string) ?? 'standard';
  const includeCostSheet = (data.parameters?.includeCostSheet as boolean) ?? true;
  const includeBOM = (data.parameters?.includeBOM as boolean) ?? true;
  const includeColorways = (data.parameters?.includeColorways as boolean) ?? true;

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
        border: selected ? `2px solid ${TECHPACK_COLOR}` : '1px solid',
        borderColor: selected ? TECHPACK_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(TECHPACK_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TECHPACK_COLOR} 0%, ${alpha(TECHPACK_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TechPackIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Tech Pack Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create technical specs
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
            '& .MuiLinearProgress-bar': { backgroundColor: TECHPACK_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Style Name */}
        <TextField
          fullWidth
          size="small"
          label="Style Name"
          value={styleName}
          placeholder="e.g., 'Classic Blazer'"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Style Number */}
        <TextField
          fullWidth
          size="small"
          label="Style Number"
          value={styleNumber}
          placeholder="e.g., 'BLZ-2025-001'"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Output Format */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Output Format</InputLabel>
          <Select value={outputFormat} label="Output Format" sx={{ fontSize: '0.8rem' }}>
            {OUTPUT_FORMATS.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.8rem' }}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Detail Level */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Detail Level</InputLabel>
          <Select value={detailLevel} label="Detail Level" sx={{ fontSize: '0.8rem' }}>
            {DETAIL_LEVELS.map((d) => (
              <MenuItem key={d.value} value={d.value} sx={{ fontSize: '0.8rem' }}>
                {d.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Measurement Unit */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Measurement Unit</InputLabel>
              <Select value={measurementUnit} label="Measurement Unit" sx={{ fontSize: '0.8rem' }}>
                {MEASUREMENT_UNITS.map((u) => (
                  <MenuItem key={u.value} value={u.value} sx={{ fontSize: '0.8rem' }}>
                    {u.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Include Options */}
            <Stack spacing={0}>
              <FormControlLabel
                control={<Switch checked={includeCostSheet} size="small" />}
                label={<Typography variant="caption">Include Cost Sheet</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={includeBOM} size="small" />}
                label={<Typography variant="caption">Include Bill of Materials</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={includeColorways} size="small" />}
                label={<Typography variant="caption">Include Colorways</Typography>}
              />
            </Stack>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedTechPack && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(TECHPACK_COLOR, 0.08),
              border: `1px solid ${alpha(TECHPACK_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Tech Pack
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <TechPackIcon sx={{ fontSize: 40, color: TECHPACK_COLOR }} />
              <Box>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                  {styleName || 'Tech Pack'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.pageCount || 8} pages • {outputFormat.toUpperCase()}
                </Typography>
              </Box>
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
            label="Tech Pack"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(TECHPACK_COLOR, 0.15),
              color: TECHPACK_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={DETAIL_LEVELS.find(d => d.value === detailLevel)?.label.split(' ')[0] || detailLevel}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Tech Pack">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: TECHPACK_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(TECHPACK_COLOR, 0.8) },
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

export default TechPackGeneratorNode;
