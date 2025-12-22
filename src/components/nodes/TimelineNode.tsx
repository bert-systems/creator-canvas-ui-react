/**
 * TimelineNode - Chronological event timeline generator
 * Creates organized timelines with:
 * - Story events
 * - Character lifetimes
 * - World history
 * - Parallel plotlines
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
  Timeline as TimelineIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Circle as EventIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, TimelineData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 280;


const TIMELINE_COLOR = '#fbbf24';

// Timeline scope options
const SCOPE_OPTIONS = [
  { value: 'story', label: 'Story Events Only' },
  { value: 'characters', label: 'Character Lifetimes' },
  { value: 'world', label: 'World History' },
  { value: 'comprehensive', label: 'Comprehensive (All)' },
];

// Granularity options
const GRANULARITY_OPTIONS = [
  { value: 'major', label: 'Major Events Only' },
  { value: 'scenes', label: 'Scene-Level' },
  { value: 'detailed', label: 'Detailed (Hour by hour)' },
];

// ===== Types =====

export interface TimelineNodeData extends CanvasNodeData {
  nodeType: 'storyTimeline';
  timelineData?: TimelineData;
  events?: Array<{ date: string; event: string }>;
}

export interface TimelineNodeProps {
  id: string;
  data: TimelineNodeData;
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

export const TimelineNode = memo(function TimelineNode({
  data,
  selected,
  isConnectable = true,
}: TimelineNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const scope = (data.parameters?.scope as string) ?? 'story';
  const granularity = (data.parameters?.granularity as string) ?? 'scenes';

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

  // Sample events for display
  const sampleEvents = data.events || [];

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${TIMELINE_COLOR}` : '1px solid',
        borderColor: selected ? TIMELINE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(TIMELINE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${TIMELINE_COLOR} 0%, ${alpha(TIMELINE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TimelineIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Timeline'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Chronological events
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
            '& .MuiLinearProgress-bar': { backgroundColor: TIMELINE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Scope Selection */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Timeline Scope</InputLabel>
          <Select value={scope} label="Timeline Scope" sx={{ fontSize: '0.8rem' }}>
            {SCOPE_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Granularity Selection */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Event Granularity</InputLabel>
          <Select value={granularity} label="Event Granularity" sx={{ fontSize: '0.8rem' }}>
            {GRANULARITY_OPTIONS.map((g) => (
              <MenuItem key={g.value} value={g.value} sx={{ fontSize: '0.8rem' }}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
              Connect story, lore, or characters to generate timeline
            </Typography>
          </Box>
        </Collapse>

        {/* Events Preview */}
        {sampleEvents.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(TIMELINE_COLOR, 0.08),
              border: `1px solid ${alpha(TIMELINE_COLOR, 0.2)}`,
              maxHeight: 120,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 0.5, display: 'block' }}>
              Generated Events
            </Typography>
            <List dense sx={{ py: 0 }}>
              {sampleEvents.slice(0, 5).map((event, index) => (
                <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    <EventIcon sx={{ fontSize: 8, color: TIMELINE_COLOR }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        <strong>{event.date}</strong>: {event.event}
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
            label="World"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(TIMELINE_COLOR, 0.15),
              color: TIMELINE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={SCOPE_OPTIONS.find(s => s.value === scope)?.label || scope}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Timeline">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: TIMELINE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(TIMELINE_COLOR, 0.8) },
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

export default TimelineNode;
