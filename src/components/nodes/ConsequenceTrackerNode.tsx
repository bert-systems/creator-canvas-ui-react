/**
 * ConsequenceTrackerNode - Track branching story consequences
 * Manages accumulated choices with:
 * - Choice history tracking
 * - Character state changes
 * - World state changes
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  AccountBalance as TrackerIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Circle as BulletIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 280;


const TRACKER_COLOR = '#6366f1';

// Evaluation types
const EVALUATION_TYPES = [
  { value: 'narrative', label: 'Narrative (Story impact)' },
  { value: 'character', label: 'Character (Relationship changes)' },
  { value: 'world', label: 'World (Setting changes)' },
  { value: 'comprehensive', label: 'Comprehensive (All)' },
];

// ===== Types =====

export interface ConsequenceTrackerNodeData extends CanvasNodeData {
  nodeType: 'consequenceTracker';
  trackedConsequences?: string[];
  characterChanges?: string[];
  worldChanges?: string[];
}

export interface ConsequenceTrackerNodeProps {
  id: string;
  data: ConsequenceTrackerNodeData;
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

export const ConsequenceTrackerNode = memo(function ConsequenceTrackerNode({
  data,
  selected,
  isConnectable = true,
}: ConsequenceTrackerNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const evaluationType = (data.parameters?.evaluationType as string) ?? 'comprehensive';

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

  const consequences = data.trackedConsequences || [];

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${TRACKER_COLOR}` : '1px solid',
        borderColor: selected ? TRACKER_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(TRACKER_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TRACKER_COLOR} 0%, ${alpha(TRACKER_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TrackerIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Consequence Tracker'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Track choice impacts
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
            '& .MuiLinearProgress-bar': { backgroundColor: TRACKER_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Input Indicator */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(TRACKER_COLOR, 0.05), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Connect choice points to track accumulated consequences
          </Typography>
        </Box>

        {/* Evaluation Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Evaluation Type</InputLabel>
          <Select value={evaluationType} label="Evaluation Type" sx={{ fontSize: '0.8rem' }}>
            {EVALUATION_TYPES.map((e) => (
              <MenuItem key={e.value} value={e.value} sx={{ fontSize: '0.8rem' }}>
                {e.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Tracks: Character relationships, world state, and story trajectory
            </Typography>
          </Box>
        </Collapse>

        {/* Tracked Consequences */}
        {consequences.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(TRACKER_COLOR, 0.08),
              border: `1px solid ${alpha(TRACKER_COLOR, 0.2)}`,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
              Accumulated Consequences
            </Typography>
            <List dense sx={{ py: 0 }}>
              {consequences.slice(0, 5).map((consequence, index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 20 }}>
                    <BulletIcon sx={{ fontSize: 8, color: TRACKER_COLOR }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        {consequence}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
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
              bgcolor: alpha(TRACKER_COLOR, 0.15),
              color: TRACKER_COLOR,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Tooltip title="Evaluate Consequences">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: TRACKER_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(TRACKER_COLOR, 0.8) },
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

export default ConsequenceTrackerNode;
