/**
 * ScreenplayFormatterNode - Industry-standard screenplay formatting
 * Converts story scenes to professional screenplay format with:
 * - Standard screenplay formatting (Courier 12pt)
 * - Sluglines (scene headings)
 * - Action lines, dialogue, parentheticals
 * - Export to Fountain, FDX, PDF formats
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
  Switch,
  TextField,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Movie as ScreenplayIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Download as ExportIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const SCREENPLAY_COLOR = '#8b5cf6'; // Purple for screenplay

// Export format options
const EXPORT_FORMATS = [
  { value: 'fountain', label: 'Fountain (.fountain)', description: 'Plain text format' },
  { value: 'fdx', label: 'Final Draft (.fdx)', description: 'Industry standard' },
  { value: 'pdf', label: 'PDF', description: 'Print-ready document' },
  { value: 'celtx', label: 'Celtx', description: 'Free screenwriting tool' },
];

// Scene heading styles
const SCENE_HEADING_STYLES = [
  { value: 'standard', label: 'Standard (INT./EXT.)' },
  { value: 'master', label: 'Master Scene' },
  { value: 'continuous', label: 'With CONTINUOUS' },
];

// ===== Types =====

export interface ScreenplayFormatterNodeData extends CanvasNodeData {
  nodeType: 'screenplayFormatter';
  previewText?: string;
  pageCount?: number;
  estimatedRuntime?: string;
  downloadUrl?: string;
  authorName?: string;
  title?: string;
}

export interface ScreenplayFormatterNodeProps {
  id: string;
  data: ScreenplayFormatterNodeData;
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

export const ScreenplayFormatterNode = memo(function ScreenplayFormatterNode({
  data,
  selected,
  isConnectable = true,
}: ScreenplayFormatterNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const exportFormat = (data.parameters?.exportFormat as string) ?? 'fountain';
  const headingStyle = (data.parameters?.headingStyle as string) ?? 'standard';
  const includeTitlePage = (data.parameters?.includeTitlePage as boolean) ?? true;
  const includeSceneNumbers = (data.parameters?.includeSceneNumbers as boolean) ?? false;
  const authorName = (data.parameters?.authorName as string) ?? '';
  const basedOn = (data.parameters?.basedOn as string) ?? '';

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

  // Render screenplay preview
  const renderPreview = () => {
    const previewText = data.previewText || `INT. COFFEE SHOP - DAY

A busy downtown coffee shop. SARAH (30s, determined) sits at a corner table, laptop open.

JAMES (40s, weathered) approaches with two cups of coffee.

                    JAMES
          You look like you could use this.

                    SARAH
              (surprised)
          How did you know I was here?

                    JAMES
          I didn't. Just lucky, I guess.

He sits across from her. A beat of uncomfortable silence.`;

    return (
      <Box
        sx={{
          mx: 1.5,
          p: 1.5,
          borderRadius: 1,
          bgcolor: '#fffef5',
          border: '1px solid',
          borderColor: alpha(SCREENPLAY_COLOR, 0.2),
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: '0.65rem',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          maxHeight: 140,
          overflow: 'auto',
          color: '#333',
        }}
      >
        {previewText}
      </Box>
    );
  };

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${SCREENPLAY_COLOR}` : '1px solid',
        borderColor: selected ? SCREENPLAY_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(SCREENPLAY_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${SCREENPLAY_COLOR} 0%, ${alpha(SCREENPLAY_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ScreenplayIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Screenplay Formatter'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Industry-standard format
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
            '& .MuiLinearProgress-bar': { backgroundColor: SCREENPLAY_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 1.5 }}>
        {/* Export Format */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Export Format</InputLabel>
          <Select value={exportFormat} label="Export Format" sx={{ fontSize: '0.8rem' }}>
            {EXPORT_FORMATS.map((format) => (
              <MenuItem key={format.value} value={format.value}>
                <Box>
                  <Typography variant="body2">{format.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Scene Heading Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Scene Heading Style</InputLabel>
          <Select value={headingStyle} label="Scene Heading Style" sx={{ fontSize: '0.8rem' }}>
            {SCENE_HEADING_STYLES.map((style) => (
              <MenuItem key={style.value} value={style.value} sx={{ fontSize: '0.8rem' }}>
                {style.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', mb: 1.5 }}>
            {/* Title Page Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={includeTitlePage}
                  size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: SCREENPLAY_COLOR } }}
                />
              }
              label={<Typography variant="caption">Include Title Page</Typography>}
              sx={{ display: 'block', mb: 1 }}
            />

            {/* Scene Numbers Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={includeSceneNumbers}
                  size="small"
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: SCREENPLAY_COLOR } }}
                />
              }
              label={<Typography variant="caption">Include Scene Numbers</Typography>}
              sx={{ display: 'block', mb: 1 }}
            />

            {/* Author Name */}
            <TextField
              fullWidth
              size="small"
              label="Author Name"
              value={authorName}
              placeholder="Written by..."
              sx={{
                mb: 1,
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            {/* Based On */}
            <TextField
              fullWidth
              size="small"
              label="Based On"
              value={basedOn}
              placeholder="Based on the novel by..."
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Box>
        </Collapse>

        {/* Preview */}
        {renderPreview()}

        {/* Stats */}
        {(data.pageCount || data.estimatedRuntime) && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(SCREENPLAY_COLOR, 0.08),
              border: `1px solid ${alpha(SCREENPLAY_COLOR, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={2} justifyContent="center">
              {data.pageCount && (
                <Stack alignItems="center">
                  <Typography variant="h6" color={SCREENPLAY_COLOR} sx={{ fontWeight: 600, lineHeight: 1 }}>
                    {data.pageCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    pages
                  </Typography>
                </Stack>
              )}
              {data.estimatedRuntime && (
                <Stack alignItems="center">
                  <Typography variant="h6" color={SCREENPLAY_COLOR} sx={{ fontWeight: 600, lineHeight: 1 }}>
                    {data.estimatedRuntime}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    runtime
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
            label="Export"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(SCREENPLAY_COLOR, 0.15),
              color: SCREENPLAY_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={EXPORT_FORMATS.find(f => f.value === exportFormat)?.label.split(' ')[0] || exportFormat}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Preview">
            <IconButton
              size="small"
              disabled={data.status === 'running'}
              sx={{
                bgcolor: alpha(SCREENPLAY_COLOR, 0.1),
                '&:hover': { bgcolor: alpha(SCREENPLAY_COLOR, 0.2) },
              }}
            >
              <PreviewIcon sx={{ fontSize: 16, color: SCREENPLAY_COLOR }} />
            </IconButton>
          </Tooltip>
          {data.downloadUrl && (
            <Tooltip title="Download">
              <IconButton
                size="small"
                component="a"
                href={data.downloadUrl}
                download
                sx={{
                  bgcolor: alpha(SCREENPLAY_COLOR, 0.1),
                  '&:hover': { bgcolor: alpha(SCREENPLAY_COLOR, 0.2) },
                }}
              >
                <ExportIcon sx={{ fontSize: 16, color: SCREENPLAY_COLOR }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Format Screenplay">
            <IconButton
              size="small"
              disabled={data.status === 'running'}
              sx={{
                bgcolor: SCREENPLAY_COLOR,
                color: 'white',
                '&:hover': { bgcolor: alpha(SCREENPLAY_COLOR, 0.8) },
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

export default ScreenplayFormatterNode;
