/**
 * CharacterVoiceNode - Define unique character speaking styles
 * Creates distinctive voice profiles with:
 * - Speech patterns and vocabulary
 * - Verbal quirks and mannerisms
 * - Sample dialogue generation
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
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  RecordVoiceOver as VoiceIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 260;


const DIALOGUE_COLOR = '#f472b6';

// Speech patterns
const SPEECH_PATTERNS = [
  { value: 'standard', label: 'Standard/Neutral' },
  { value: 'formal', label: 'Formal/Educated' },
  { value: 'casual', label: 'Casual/Colloquial' },
  { value: 'street', label: 'Street/Slang' },
  { value: 'archaic', label: 'Archaic/Period' },
  { value: 'technical', label: 'Technical/Jargon' },
  { value: 'poetic', label: 'Poetic/Flowery' },
  { value: 'terse', label: 'Terse/Minimal' },
];

// ===== Types =====

export interface CharacterVoiceNodeData extends CanvasNodeData {
  nodeType: 'characterVoice';
  generatedVoiceProfile?: string;
  sampleDialogue?: string;
}

export interface CharacterVoiceNodeProps {
  id: string;
  data: CharacterVoiceNodeData;
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

export const CharacterVoiceNode = memo(function CharacterVoiceNode({
  data,
  selected,
  isConnectable = true,
}: CharacterVoiceNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const speechPattern = (data.parameters?.speechPattern as string) ?? 'standard';
  const addQuirks = (data.parameters?.addQuirks as boolean) ?? true;
  const generateCatchphrase = (data.parameters?.generateCatchphrase as boolean) ?? false;

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
          <VoiceIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Character Voice'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Define unique speaking style
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
        {/* Input Indicator */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(DIALOGUE_COLOR, 0.05), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Connect a character to generate their unique voice
          </Typography>
        </Box>

        {/* Speech Pattern */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Speech Pattern</InputLabel>
          <Select value={speechPattern} label="Speech Pattern" sx={{ fontSize: '0.8rem' }}>
            {SPEECH_PATTERNS.map((p) => (
              <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.8rem' }}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
              Voice Features
            </Typography>

            <FormControlLabel
              control={<Switch checked={addQuirks} size="small" />}
              label={<Typography variant="caption">Add Verbal Quirks</Typography>}
              sx={{ display: 'block', mb: 0.5 }}
            />
            <FormControlLabel
              control={<Switch checked={generateCatchphrase} size="small" />}
              label={<Typography variant="caption">Generate Catchphrase</Typography>}
              sx={{ display: 'block' }}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.sampleDialogue && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(DIALOGUE_COLOR, 0.08),
              border: `1px solid ${alpha(DIALOGUE_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Sample Dialogue
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, fontSize: '0.75rem', fontStyle: 'italic' }}
            >
              "{data.sampleDialogue}"
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
        </Stack>

        <Tooltip title="Generate Voice Profile">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
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

export default CharacterVoiceNode;
