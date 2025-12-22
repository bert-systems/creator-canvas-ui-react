/**
 * TreatmentGeneratorNode - Professional treatment and synopsis generator
 * Creates industry-standard story treatments with:
 * - Loglines and taglines
 * - Short and long synopses
 * - Film/TV/Novel formats
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
  Description as TreatmentIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, TreatmentData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


// Treatment color (light purple)
const TREATMENT_COLOR = '#a78bfa';

// Treatment formats
const FORMATS = [
  { value: 'film', label: 'Film Treatment', description: '2-5 page film treatment' },
  { value: 'tvBible', label: 'TV Series Bible', description: 'Series overview and pilot' },
  { value: 'novelSynopsis', label: 'Novel Synopsis', description: 'Publishing-ready synopsis' },
  { value: 'shortPitch', label: 'Short Pitch', description: 'Elevator pitch format' },
  { value: 'gameNarrative', label: 'Game Narrative', description: 'Game story document' },
];

// Writing tones
const TONES = [
  { value: 'professional', label: 'Professional/Industry' },
  { value: 'enthusiastic', label: 'Enthusiastic/Pitch' },
  { value: 'literary', label: 'Literary/Artistic' },
];

// ===== Types =====

export interface TreatmentGeneratorNodeData extends CanvasNodeData {
  nodeType: 'treatmentGenerator';
  treatmentData?: TreatmentData;
  generatedLogline?: string;
  generatedSynopsis?: string;
}

export interface TreatmentGeneratorNodeProps {
  id: string;
  data: TreatmentGeneratorNodeData;
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

export const TreatmentGeneratorNode = memo(function TreatmentGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: TreatmentGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const storyTitle = (data.parameters?.storyTitle as string) ?? '';
  const storyConcept = (data.parameters?.storyConcept as string) ?? '';
  const format = (data.parameters?.format as string) ?? 'film';
  const tone = (data.parameters?.tone as string) ?? 'professional';
  const includeLogline = (data.parameters?.includeLogline as boolean) ?? true;
  const includeSynopsis = (data.parameters?.includeSynopsis as boolean) ?? true;
  const includeComparables = (data.parameters?.includeComparables as boolean) ?? false;

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
        border: selected ? `2px solid ${TREATMENT_COLOR}` : '1px solid',
        borderColor: selected ? TREATMENT_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(TREATMENT_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TREATMENT_COLOR} 0%, ${alpha(TREATMENT_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TreatmentIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Treatment Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Professional story pitches
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
            '& .MuiLinearProgress-bar': { backgroundColor: TREATMENT_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Story Title */}
        <TextField
          fullWidth
          size="small"
          label="Story Title"
          value={storyTitle}
          placeholder="Your story title"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.85rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Story Concept */}
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Story Concept"
          value={storyConcept}
          placeholder="Brief description of your story..."
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Format Selection */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Treatment Format</InputLabel>
          <Select value={format} label="Treatment Format" sx={{ fontSize: '0.8rem' }}>
            {FORMATS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                <Box>
                  <Typography variant="body2">{f.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {f.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tone Selection */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Writing Tone</InputLabel>
          <Select value={tone} label="Writing Tone" sx={{ fontSize: '0.8rem' }}>
            {TONES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
              Include Sections
            </Typography>

            <FormControlLabel
              control={<Switch checked={includeLogline} size="small" />}
              label={<Typography variant="caption">Logline</Typography>}
              sx={{ display: 'block', mb: 0.5 }}
            />
            <FormControlLabel
              control={<Switch checked={includeSynopsis} size="small" />}
              label={<Typography variant="caption">Full Synopsis</Typography>}
              sx={{ display: 'block', mb: 0.5 }}
            />
            <FormControlLabel
              control={<Switch checked={includeComparables} size="small" />}
              label={<Typography variant="caption">Comparables ("X meets Y")</Typography>}
              sx={{ display: 'block' }}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedLogline && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(TREATMENT_COLOR, 0.08),
              border: `1px solid ${alpha(TREATMENT_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Logline
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem', fontStyle: 'italic' }}>
              "{data.generatedLogline}"
            </Typography>
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
            label="Narrative"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(TREATMENT_COLOR, 0.15),
              color: TREATMENT_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={FORMATS.find(f => f.value === format)?.label || format}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Treatment">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !storyConcept}
            sx={{
              bgcolor: TREATMENT_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(TREATMENT_COLOR, 0.8) },
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

export default TreatmentGeneratorNode;
