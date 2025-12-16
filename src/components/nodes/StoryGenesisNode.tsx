/**
 * StoryGenesisNode - Transform ideas into story concepts
 * The starting point for story creation workflows
 * Outputs a complete StoryData object with genre, tone, themes
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
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  AutoStories as StoryIcon,
  Lightbulb as IdeaIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, StoryData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


// Story Genesis accent color (emerald green)
const NARRATIVE_COLOR = '#10b981';

// Genre options
const GENRES = [
  'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Action',
  'Sci-Fi', 'Fantasy', 'Mystery', 'Adventure', 'Historical', 'Documentary'
];

// Tone options
const TONES = [
  'Serious', 'Light-hearted', 'Dark', 'Hopeful', 'Melancholic',
  'Suspenseful', 'Whimsical', 'Gritty', 'Epic', 'Intimate'
];

// Target length options
const TARGET_LENGTHS = [
  { value: 'short', label: 'Short (< 30 min)' },
  { value: 'feature', label: 'Feature (90-120 min)' },
  { value: 'series', label: 'Series (Multi-episode)' },
];

// ===== Types =====

export interface StoryGenesisNodeData extends CanvasNodeData {
  nodeType: 'storyGenesis';
  storyData?: StoryData;
  generatedLogline?: string;
}

export interface StoryGenesisNodeProps {
  id: string;
  data: StoryGenesisNodeData;
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

export const StoryGenesisNode = memo(function StoryGenesisNode({
  data,
  selected,
  isConnectable = true,
}: StoryGenesisNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const idea = (data.parameters?.idea as string) ?? '';
  const genre = (data.parameters?.genre as string) ?? 'Drama';
  const secondaryGenre = (data.parameters?.secondaryGenre as string) ?? '';
  const tone = (data.parameters?.tone as string) ?? 'Serious';
  const targetLength = (data.parameters?.targetLength as string) ?? 'feature';
  const targetAudience = (data.parameters?.targetAudience as string) ?? 'General';
  const themes = (data.parameters?.themes as string) ?? '';

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render input handles (left side)
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

  // Render output handles (right side)
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
        border: selected ? `2px solid ${NARRATIVE_COLOR}` : '1px solid',
        borderColor: selected ? NARRATIVE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(NARRATIVE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${NARRATIVE_COLOR} 0%, ${alpha(NARRATIVE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <StoryIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Story Genesis'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Transform idea into story
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {getStatusIcon(data.status)}
          <IconButton
            size="small"
            onClick={handleToggleSettings}
            sx={{ color: 'white' }}
          >
            {showSettings ? <CollapseIcon /> : <SettingsIcon />}
          </IconButton>
        </Stack>
      </Box>

      {/* Progress bar when running */}
      {data.status === 'running' && (
        <LinearProgress
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': {
              backgroundColor: NARRATIVE_COLOR,
            },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Story Idea Input */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <IdeaIcon sx={{ fontSize: 18, color: NARRATIVE_COLOR }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Story Idea
            </Typography>
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Enter your story idea, premise, or concept..."
            value={idea}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.85rem',
                '&:hover fieldset': { borderColor: NARRATIVE_COLOR },
                '&.Mui-focused fieldset': { borderColor: NARRATIVE_COLOR },
              },
            }}
          />
        </Box>

        {/* Genre & Tone Row */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Genre</InputLabel>
            <Select
              value={genre}
              label="Genre"
              sx={{ fontSize: '0.8rem' }}
            >
              {GENRES.map((g) => (
                <MenuItem key={g} value={g} sx={{ fontSize: '0.8rem' }}>{g}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Tone</InputLabel>
            <Select
              value={tone}
              label="Tone"
              sx={{ fontSize: '0.8rem' }}
            >
              {TONES.map((t) => (
                <MenuItem key={t} value={t} sx={{ fontSize: '0.8rem' }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Target Length */}
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Target Length</InputLabel>
          <Select
            value={targetLength}
            label="Target Length"
            sx={{ fontSize: '0.8rem' }}
          >
            {TARGET_LENGTHS.map((tl) => (
              <MenuItem key={tl.value} value={tl.value} sx={{ fontSize: '0.8rem' }}>
                {tl.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel (Collapsible) */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
              Advanced Settings
            </Typography>

            {/* Secondary Genre */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Secondary Genre</InputLabel>
              <Select
                value={secondaryGenre}
                label="Secondary Genre"
                sx={{ fontSize: '0.8rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8rem' }}>None</MenuItem>
                {GENRES.map((g) => (
                  <MenuItem key={g} value={g} sx={{ fontSize: '0.8rem' }}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Target Audience */}
            <TextField
              fullWidth
              size="small"
              label="Target Audience"
              value={targetAudience}
              placeholder="e.g., Young Adults, Families"
              sx={{
                mb: 1.5,
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            {/* Themes */}
            <TextField
              fullWidth
              size="small"
              label="Themes (comma separated)"
              value={themes}
              placeholder="e.g., redemption, family, identity"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Box>
        </Collapse>

        {/* Generated Logline Preview */}
        {data.generatedLogline && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(NARRATIVE_COLOR, 0.1),
              border: `1px solid ${alpha(NARRATIVE_COLOR, 0.3)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Logline
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              "{data.generatedLogline}"
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer with Status */}
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
              bgcolor: alpha(NARRATIVE_COLOR, 0.15),
              color: NARRATIVE_COLOR,
              fontWeight: 600,
            }}
          />
          {genre && (
            <Chip
              label={genre}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: alpha('#6b7280', 0.1),
              }}
            />
          )}
        </Stack>

        <Tooltip title="Generate Story Concept">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !idea}
            sx={{
              bgcolor: NARRATIVE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(NARRATIVE_COLOR, 0.8) },
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

export default StoryGenesisNode;
