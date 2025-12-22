/**
 * DialogueGeneratorNode - Authentic dialogue generator
 * Creates natural conversations between characters with:
 * - Character voice consistency
 * - Subtext and tension
 * - Different dialogue types (conversation, argument, interrogation)
 * - Screenplay or prose formatting
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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Forum as DialogueIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  RecordVoiceOver as VoiceIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, DialogueData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 300;


// Dialogue color (pink)
const DIALOGUE_COLOR = '#f472b6';

// Dialogue types
const DIALOGUE_TYPES = [
  { value: 'conversation', label: 'Conversation', description: 'Natural back-and-forth' },
  { value: 'argument', label: 'Argument', description: 'Heated conflict' },
  { value: 'negotiation', label: 'Negotiation', description: 'Give and take' },
  { value: 'interrogation', label: 'Interrogation', description: 'Questioning' },
  { value: 'confession', label: 'Confession', description: 'Revealing truth' },
  { value: 'flirtation', label: 'Flirtation', description: 'Romantic tension' },
  { value: 'exposition', label: 'Exposition', description: 'Information delivery' },
];

// Output formats
const OUTPUT_FORMATS = [
  { value: 'screenplay', label: 'Screenplay' },
  { value: 'prose', label: 'Prose' },
  { value: 'plain', label: 'Plain Text' },
];

// ===== Types =====

export interface DialogueGeneratorNodeData extends CanvasNodeData {
  nodeType: 'dialogueGenerator';
  dialogueData?: DialogueData;
  generatedDialogue?: string;
}

export interface DialogueGeneratorNodeProps {
  id: string;
  data: DialogueGeneratorNodeData;
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

export const DialogueGeneratorNode = memo(function DialogueGeneratorNode({
  data,
  selected,
  isConnectable = true,
}: DialogueGeneratorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const participants = (data.parameters?.participants as string) ?? '';
  const context = (data.parameters?.context as string) ?? '';
  const dialogueType = (data.parameters?.dialogueType as string) ?? 'conversation';
  const outputFormat = (data.parameters?.outputFormat as string) ?? 'screenplay';
  const emotionalGoal = (data.parameters?.emotionalGoal as string) ?? '';
  const subtextLevel = (data.parameters?.subtextLevel as number) ?? 50;
  const tensionLevel = (data.parameters?.tensionLevel as number) ?? 30;
  const lineCount = (data.parameters?.lineCount as number) ?? 10;

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
        border: selected ? `2px solid ${DIALOGUE_COLOR}` : '1px solid',
        borderColor: selected ? DIALOGUE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(DIALOGUE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${DIALOGUE_COLOR} 0%, ${alpha(DIALOGUE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <DialogueIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Dialogue Generator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Create authentic conversations
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
            '& .MuiLinearProgress-bar': { backgroundColor: DIALOGUE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Participants */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <VoiceIcon sx={{ fontSize: 18, color: DIALOGUE_COLOR }} />
          <TextField
            fullWidth
            size="small"
            label="Participants"
            value={participants}
            placeholder="e.g., Sarah, Detective Mills"
            sx={{
              '& .MuiInputBase-input': { fontSize: '0.85rem' },
              '& .MuiInputLabel-root': { fontSize: '0.75rem' },
            }}
          />
        </Stack>

        {/* Context */}
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Context / Situation"
          value={context}
          placeholder="What's happening? What do they want?"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Dialogue Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Dialogue Type</InputLabel>
          <Select value={dialogueType} label="Dialogue Type" sx={{ fontSize: '0.8rem' }}>
            {DIALOGUE_TYPES.map((dt) => (
              <MenuItem key={dt.value} value={dt.value}>
                <Box>
                  <Typography variant="body2">{dt.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dt.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Output Format */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
            Output Format
          </Typography>
          <ToggleButtonGroup
            value={outputFormat}
            exclusive
            size="small"
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                fontSize: '0.7rem',
                py: 0.5,
                '&.Mui-selected': {
                  bgcolor: alpha(DIALOGUE_COLOR, 0.15),
                  color: DIALOGUE_COLOR,
                  '&:hover': { bgcolor: alpha(DIALOGUE_COLOR, 0.25) },
                },
              },
            }}
          >
            {OUTPUT_FORMATS.map((f) => (
              <ToggleButton key={f.value} value={f.value}>
                {f.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Advanced Settings
            </Typography>

            {/* Emotional Goal */}
            <TextField
              fullWidth
              size="small"
              label="Emotional Goal"
              value={emotionalGoal}
              placeholder="What should the reader feel?"
              sx={{
                mb: 1.5,
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            {/* Subtext Level */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Subtext Level: {subtextLevel}%
              </Typography>
              <Slider
                value={subtextLevel}
                size="small"
                sx={{
                  color: DIALOGUE_COLOR,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Higher = more unspoken meaning between lines
              </Typography>
            </Box>

            {/* Tension Level */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Tension Level: {tensionLevel}%
              </Typography>
              <Slider
                value={tensionLevel}
                size="small"
                sx={{
                  color: DIALOGUE_COLOR,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                }}
              />
            </Box>

            {/* Line Count */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Approximate Lines: {lineCount}
              </Typography>
              <Slider
                value={lineCount}
                min={5}
                max={50}
                size="small"
                sx={{
                  color: DIALOGUE_COLOR,
                  '& .MuiSlider-thumb': { width: 14, height: 14 },
                }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedDialogue && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(DIALOGUE_COLOR, 0.08),
              border: `1px solid ${alpha(DIALOGUE_COLOR, 0.2)}`,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Dialogue
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                fontSize: '0.75rem',
                whiteSpace: 'pre-line',
                fontFamily: outputFormat === 'screenplay' ? 'monospace' : 'inherit',
              }}
            >
              {data.generatedDialogue.substring(0, 200)}...
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
            label="Dialogue"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(DIALOGUE_COLOR, 0.15),
              color: DIALOGUE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={DIALOGUE_TYPES.find(dt => dt.value === dialogueType)?.label || dialogueType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Dialogue">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !participants || !context}
            sx={{
              bgcolor: DIALOGUE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(DIALOGUE_COLOR, 0.8) },
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

export default DialogueGeneratorNode;
