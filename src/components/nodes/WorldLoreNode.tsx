/**
 * WorldLoreNode - World-building lore generator
 * Creates rich mythology, history, and rules with:
 * - Historical timelines
 * - Factions and power structures
 * - Magic/tech systems
 * - Cultural customs
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
  MenuBook as LoreIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, WorldLoreData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


const LORE_COLOR = '#c084fc';

// Lore focus types
const LORE_TYPES = [
  { value: 'comprehensive', label: 'Comprehensive', description: 'All aspects of world-building' },
  { value: 'historical', label: 'Historical', description: 'Events, eras, and conflicts' },
  { value: 'mythological', label: 'Mythological', description: 'Gods, legends, and creation myths' },
  { value: 'political', label: 'Political', description: 'Factions, power, and governance' },
  { value: 'systems', label: 'Magic/Tech Systems', description: 'Rules and capabilities' },
  { value: 'cultural', label: 'Cultural', description: 'Customs, beliefs, and traditions' },
];

// Depth levels
const DEPTH_LEVELS = [
  { value: 'surface', label: 'Surface', description: 'Key facts only' },
  { value: 'standard', label: 'Standard', description: 'Main elements' },
  { value: 'deep', label: 'Deep', description: 'Detailed history' },
  { value: 'encyclopedic', label: 'Encyclopedic', description: 'Everything' },
];

// ===== Types =====

export interface WorldLoreNodeData extends CanvasNodeData {
  nodeType: 'worldLore';
  loreData?: WorldLoreData;
  generatedLore?: string;
}

export interface WorldLoreNodeProps {
  id: string;
  data: WorldLoreNodeData;
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

export const WorldLoreNode = memo(function WorldLoreNode({
  data,
  selected,
  isConnectable = true,
}: WorldLoreNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const worldConcept = (data.parameters?.worldConcept as string) ?? '';
  const loreType = (data.parameters?.loreType as string) ?? 'comprehensive';
  const depth = (data.parameters?.depth as string) ?? 'standard';

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
        border: selected ? `2px solid ${LORE_COLOR}` : '1px solid',
        borderColor: selected ? LORE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(LORE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${LORE_COLOR} 0%, ${alpha(LORE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LoreIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'World Lore'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Build mythology & history
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
            '& .MuiLinearProgress-bar': { backgroundColor: LORE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* World Concept */}
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="World Concept"
          value={worldConcept}
          placeholder="Describe your world..."
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Lore Focus */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Lore Focus</InputLabel>
          <Select value={loreType} label="Lore Focus" sx={{ fontSize: '0.8rem' }}>
            {LORE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                <Box>
                  <Typography variant="body2">{t.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Lore Depth
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Depth Level</InputLabel>
              <Select value={depth} label="Depth Level" sx={{ fontSize: '0.8rem' }}>
                {DEPTH_LEVELS.map((d) => (
                  <MenuItem key={d.value} value={d.value}>
                    <Box>
                      <Typography variant="body2">{d.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedLore && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(LORE_COLOR, 0.08),
              border: `1px solid ${alpha(LORE_COLOR, 0.2)}`,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Lore
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.generatedLore.substring(0, 200)}...
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
            label="World"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(LORE_COLOR, 0.15),
              color: LORE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={LORE_TYPES.find(t => t.value === loreType)?.label || loreType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Lore">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !worldConcept}
            sx={{
              bgcolor: LORE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(LORE_COLOR, 0.8) },
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

export default WorldLoreNode;
