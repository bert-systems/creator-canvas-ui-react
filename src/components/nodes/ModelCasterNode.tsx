/**
 * ModelCasterNode - AI model generation with diversity
 * Creates fashion models with:
 * - Body type options
 * - Skin tone diversity
 * - Age ranges
 * - Pose selection
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
  Switch,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Person as ModelIcon,
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

const MODEL_COLOR = '#c084fc';

// Gender options
const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-Binary' },
];

// Body types
const BODY_TYPES = [
  { value: 'petite', label: 'Petite' },
  { value: 'slim', label: 'Slim' },
  { value: 'average', label: 'Average' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'curvy', label: 'Curvy' },
  { value: 'plus', label: 'Plus Size' },
];

// Skin tones
const SKIN_TONES = [
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'tan', label: 'Tan' },
  { value: 'brown', label: 'Brown' },
  { value: 'deep', label: 'Deep' },
];

// Age ranges
const AGE_RANGES = [
  { value: 'young-adult', label: 'Young Adult (18-25)' },
  { value: 'adult', label: 'Adult (25-40)' },
  { value: 'mature', label: 'Mature (40+)' },
];

// Pose types
const POSE_TYPES = [
  { value: 'standing', label: 'Standing Relaxed' },
  { value: 'walking', label: 'Walking' },
  { value: 'editorial', label: 'Editorial Pose' },
  { value: 'dynamic', label: 'Action/Dynamic' },
  { value: 'seated', label: 'Seated' },
];

// ===== Types =====

export interface ModelCasterNodeData extends CanvasNodeData {
  nodeType: 'modelCaster';
  generatedModel?: string;
  poseVariations?: string[];
}

export interface ModelCasterNodeProps {
  id: string;
  data: ModelCasterNodeData;
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

export const ModelCasterNode = memo(function ModelCasterNode({
  data,
  selected,
  isConnectable = true,
}: ModelCasterNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const gender = (data.parameters?.gender as string) ?? 'female';
  const bodyType = (data.parameters?.bodyType as string) ?? 'average';
  const skinTone = (data.parameters?.skinTone as string) ?? 'medium';
  const ageRange = (data.parameters?.ageRange as string) ?? 'adult';
  const pose = (data.parameters?.pose as string) ?? 'standing';
  const variations = (data.parameters?.variations as number) ?? 4;
  const diverseSet = (data.parameters?.diverseSet as boolean) ?? false;

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
        border: selected ? `2px solid ${MODEL_COLOR}` : '1px solid',
        borderColor: selected ? MODEL_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(MODEL_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${MODEL_COLOR} 0%, ${alpha(MODEL_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ModelIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Model Caster'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Generate diverse AI models
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
            '& .MuiLinearProgress-bar': { backgroundColor: MODEL_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Gender */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Gender</InputLabel>
          <Select value={gender} label="Gender" sx={{ fontSize: '0.8rem' }}>
            {GENDER_OPTIONS.map((g) => (
              <MenuItem key={g.value} value={g.value} sx={{ fontSize: '0.8rem' }}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Body Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Body Type</InputLabel>
          <Select value={bodyType} label="Body Type" sx={{ fontSize: '0.8rem' }}>
            {BODY_TYPES.map((b) => (
              <MenuItem key={b.value} value={b.value} sx={{ fontSize: '0.8rem' }}>
                {b.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Skin Tone */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Skin Tone</InputLabel>
          <Select value={skinTone} label="Skin Tone" sx={{ fontSize: '0.8rem' }}>
            {SKIN_TONES.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Age Range */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Age Range</InputLabel>
              <Select value={ageRange} label="Age Range" sx={{ fontSize: '0.8rem' }}>
                {AGE_RANGES.map((a) => (
                  <MenuItem key={a.value} value={a.value} sx={{ fontSize: '0.8rem' }}>
                    {a.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Pose */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Pose</InputLabel>
              <Select value={pose} label="Pose" sx={{ fontSize: '0.8rem' }}>
                {POSE_TYPES.map((p) => (
                  <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.8rem' }}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Variations */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Variations: {variations}
              </Typography>
              <Slider
                value={variations}
                min={1}
                max={8}
                step={1}
                size="small"
                sx={{ color: MODEL_COLOR }}
              />
            </Box>

            {/* Diverse Set */}
            <FormControlLabel
              control={<Switch checked={diverseSet} size="small" />}
              label={<Typography variant="caption">Generate Diverse Set</Typography>}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedModel && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(MODEL_COLOR, 0.08),
              border: `1px solid ${alpha(MODEL_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Model
            </Typography>
            <Box
              component="img"
              src={data.generatedModel}
              alt="Generated model"
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
            label="Model"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(MODEL_COLOR, 0.15),
              color: MODEL_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={BODY_TYPES.find(b => b.value === bodyType)?.label || bodyType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Model">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: MODEL_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(MODEL_COLOR, 0.8) },
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

export default ModelCasterNode;
