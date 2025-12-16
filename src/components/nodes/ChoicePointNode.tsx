/**
 * ChoicePointNode - Branching decision points for interactive stories
 * Creates story forks with:
 * - Multiple choice paths
 * - Consequence tracking
 * - Convergence options
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
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  CallSplit as BranchIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;


const BRANCH_COLOR = '#0ea5e9';

// Number of choices
const NUM_CHOICES = [
  { value: '2', label: 'Binary (2 choices)' },
  { value: '3', label: 'Triple (3 choices)' },
  { value: '4', label: 'Multiple (4 choices)' },
];

// Choice nature types
const CHOICE_TYPES = [
  { value: 'moral', label: 'Moral Dilemma' },
  { value: 'action', label: 'Action Choice' },
  { value: 'dialogue', label: 'Dialogue Response' },
  { value: 'strategic', label: 'Strategic Decision' },
  { value: 'relationship', label: 'Relationship Choice' },
];

// Convergence options
const CONVERGENCE_OPTIONS = [
  { value: 'immediate', label: 'Immediate (Next scene)' },
  { value: 'delayed', label: 'Delayed (Few scenes)' },
  { value: 'major', label: 'Major Branch (Long divergence)' },
  { value: 'permanent', label: 'Permanent (Different endings)' },
];

// ===== Types =====

export interface ChoicePointNodeData extends CanvasNodeData {
  nodeType: 'choicePoint';
  generatedChoices?: string[];
}

export interface ChoicePointNodeProps {
  id: string;
  data: ChoicePointNodeData;
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

export const ChoicePointNode = memo(function ChoicePointNode({
  data,
  selected,
  isConnectable = true,
}: ChoicePointNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const numChoices = (data.parameters?.numChoices as string) ?? '2';
  const choiceType = (data.parameters?.choiceType as string) ?? 'moral';
  const consequenceWeight = (data.parameters?.consequenceWeight as number) ?? 50;
  const convergence = (data.parameters?.convergence as string) ?? 'delayed';

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
        border: selected ? `2px solid ${BRANCH_COLOR}` : '1px solid',
        borderColor: selected ? BRANCH_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(BRANCH_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${BRANCH_COLOR} 0%, ${alpha(BRANCH_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <BranchIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Choice Point'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Branching decisions
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
            '& .MuiLinearProgress-bar': { backgroundColor: BRANCH_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Number of Choices */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Number of Choices</InputLabel>
          <Select value={numChoices} label="Number of Choices" sx={{ fontSize: '0.8rem' }}>
            {NUM_CHOICES.map((n) => (
              <MenuItem key={n.value} value={n.value} sx={{ fontSize: '0.8rem' }}>
                {n.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Choice Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Choice Nature</InputLabel>
          <Select value={choiceType} label="Choice Nature" sx={{ fontSize: '0.8rem' }}>
            {CHOICE_TYPES.map((c) => (
              <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.8rem' }}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Consequence Weight */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Consequence Impact: {consequenceWeight}%
          </Typography>
          <Slider
            value={consequenceWeight}
            size="small"
            sx={{
              color: BRANCH_COLOR,
              '& .MuiSlider-thumb': { width: 14, height: 14 },
            }}
          />
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Path Convergence
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Convergence</InputLabel>
              <Select value={convergence} label="Convergence" sx={{ fontSize: '0.8rem' }}>
                {CONVERGENCE_OPTIONS.map((c) => (
                  <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.8rem' }}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedChoices && data.generatedChoices.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(BRANCH_COLOR, 0.08),
              border: `1px solid ${alpha(BRANCH_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Choices
            </Typography>
            {data.generatedChoices.map((choice, idx) => (
              <Typography key={idx} variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                {String.fromCharCode(65 + idx)}. {choice}
              </Typography>
            ))}
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
            label="Branching"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(BRANCH_COLOR, 0.15),
              color: BRANCH_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={`${numChoices} paths`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Choices">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: BRANCH_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(BRANCH_COLOR, 0.8) },
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

export default ChoicePointNode;
