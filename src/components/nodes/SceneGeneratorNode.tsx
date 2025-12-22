/**
 * SceneGeneratorNode - Complete scene generation
 * Creates fully-realized scenes with:
 * - Prose, screenplay, or treatment format
 * - Dialogue, action, description
 * - Scene beats and pacing
 * - Storyboard prompts for visualization
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
  ToggleButton,
  ToggleButtonGroup,
  Slider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Movie as SceneIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, SceneData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 300;


// Scene color (teal)
const SCENE_COLOR = '#14b8a6';

// Scene formats
const FORMATS = [
  { value: 'prose', label: 'Prose', description: 'Narrative prose style' },
  { value: 'screenplay', label: 'Screenplay', description: 'Industry screenplay format' },
  { value: 'treatment', label: 'Treatment', description: 'Synopsis style' },
];

// Mood options
const MOODS = [
  'Tense', 'Romantic', 'Melancholic', 'Hopeful', 'Suspenseful',
  'Comedic', 'Dark', 'Peaceful', 'Chaotic', 'Mysterious'
];

// POV options
const POV_OPTIONS = [
  { value: 'third-limited', label: 'Third Person Limited' },
  { value: 'third-omniscient', label: 'Third Person Omniscient' },
  { value: 'first-person', label: 'First Person' },
  { value: 'objective', label: 'Objective (Screenplay)' },
];

// ===== Types =====

export interface SceneGeneratorNodeData extends CanvasNodeData {
  nodeType: 'sceneGenerator';
  sceneData?: SceneData;
  generatedContent?: string;
}

export interface SceneGeneratorNodeProps {
  id: string;
  data: SceneGeneratorNodeData;
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

export const SceneGeneratorNode = memo(function SceneGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: SceneGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const sceneTitle = (data.parameters?.sceneTitle as string) ?? '';
  const sceneSummary = (data.parameters?.sceneSummary as string) ?? '';
  const format = (data.parameters?.format as string) ?? 'prose';
  const pov = (data.parameters?.pov as string) ?? 'third-limited';
  const mood = (data.parameters?.mood as string) ?? 'Tense';
  const setting = (data.parameters?.setting as string) ?? '';
  const dialogueIntensity = (data.parameters?.dialogueIntensity as number) ?? 50;
  const actionIntensity = (data.parameters?.actionIntensity as number) ?? 50;

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
        border: selected ? `2px solid ${SCENE_COLOR}` : '1px solid',
        borderColor: selected ? SCENE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(SCENE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${SCENE_COLOR} 0%, ${alpha(SCENE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <SceneIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Scene Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create complete scenes
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
            '& .MuiLinearProgress-bar': { backgroundColor: SCENE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Scene Title */}
        <TextField
          fullWidth
          size="small"
          label="Scene Title"
          value={sceneTitle}
          placeholder="e.g., The Confrontation"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.85rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Scene Summary */}
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Scene Summary"
          value={sceneSummary}
          placeholder="What happens in this scene?"
          sx={{
            mb: 2,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Format Selection */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
            Output Format
          </Typography>
          <ToggleButtonGroup
            value={format}
            exclusive
            size="small"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                fontSize: '0.7rem',
                py: 0.5,
                '&.Mui-selected': {
                  bgcolor: alpha(SCENE_COLOR, 0.15),
                  color: SCENE_COLOR,
                  '&:hover': { bgcolor: alpha(SCENE_COLOR, 0.25) },
                },
              },
            }}
          >
            {FORMATS.map((f) => (
              <ToggleButton key={f.value} value={f.value}>
                {f.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Mood & Setting */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Mood</InputLabel>
            <Select value={mood} label="Mood" sx={{ fontSize: '0.8rem' }}>
              {MOODS.map((m) => (
                <MenuItem key={m} value={m} sx={{ fontSize: '0.8rem' }}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Setting"
            value={setting}
            placeholder="Where?"
            sx={{
              flex: 1,
              '& .MuiInputBase-input': { fontSize: '0.8rem' },
              '& .MuiInputLabel-root': { fontSize: '0.75rem' },
            }}
          />
        </Stack>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Advanced Settings
            </Typography>

            {/* POV */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Point of View</InputLabel>
              <Select value={pov} label="Point of View" sx={{ fontSize: '0.8rem' }}>
                {POV_OPTIONS.map((p) => (
                  <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.8rem' }}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Dialogue Intensity */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Dialogue Intensity: {dialogueIntensity}%
              </Typography>
              <Slider
                value={dialogueIntensity}
                size="small"
                sx={{
                  color: SCENE_COLOR,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                }}
              />
            </Box>

            {/* Action Intensity */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Action Intensity: {actionIntensity}%
              </Typography>
              <Slider
                value={actionIntensity}
                size="small"
                sx={{
                  color: SCENE_COLOR,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedContent && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(SCENE_COLOR, 0.08),
              border: `1px solid ${alpha(SCENE_COLOR, 0.2)}`,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Scene Preview
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.generatedContent.substring(0, 200)}...
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
              bgcolor: alpha(SCENE_COLOR, 0.15),
              color: SCENE_COLOR,
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

        <Tooltip title="Generate Scene">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !sceneSummary}
            sx={{
              bgcolor: SCENE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(SCENE_COLOR, 0.8) },
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

export default SceneGeneratorNode;
