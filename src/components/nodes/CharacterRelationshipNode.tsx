/**
 * CharacterRelationshipNode - Character relationship dynamics
 * Maps and generates relationships between characters with:
 * - Relationship types (romantic, rivals, family, etc.)
 * - Conflict potential
 * - Shared history generation
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
  People as RelationshipIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 260;


const CHARACTER_COLOR = '#a855f7';

// Relationship types
const RELATIONSHIP_TYPES = [
  { value: 'romantic', label: 'Romantic Partners' },
  { value: 'allies', label: 'Friends/Allies' },
  { value: 'rivals', label: 'Rivals/Enemies' },
  { value: 'family', label: 'Family' },
  { value: 'mentor', label: 'Mentor/Student' },
  { value: 'colleagues', label: 'Colleagues' },
  { value: 'complicated', label: 'Complicated/Ambiguous' },
];

// Evolution types
const EVOLUTION_TYPES = [
  { value: 'static', label: 'Static (Unchanging)' },
  { value: 'growing', label: 'Growing (Improving)' },
  { value: 'declining', label: 'Declining (Deteriorating)' },
  { value: 'transforming', label: 'Transforming (Major shift)' },
  { value: 'cyclical', label: 'Cyclical (On-again/off-again)' },
];

// ===== Types =====

export interface CharacterRelationshipNodeData extends CanvasNodeData {
  nodeType: 'characterRelationship';
  generatedRelationship?: string;
}

export interface CharacterRelationshipNodeProps {
  id: string;
  data: CharacterRelationshipNodeData;
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

export const CharacterRelationshipNode = memo(function CharacterRelationshipNode({
  data,
  selected,
  isConnectable = true,
}: CharacterRelationshipNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const relationshipType = (data.parameters?.relationshipType as string) ?? 'allies';
  const conflictLevel = (data.parameters?.conflictLevel as number) ?? 50;
  const evolution = (data.parameters?.evolution as string) ?? 'static';

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
        border: selected ? `2px solid ${CHARACTER_COLOR}` : '1px solid',
        borderColor: selected ? CHARACTER_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(CHARACTER_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${CHARACTER_COLOR} 0%, ${alpha(CHARACTER_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <RelationshipIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Character Relationship'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Define character dynamics
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
            '& .MuiLinearProgress-bar': { backgroundColor: CHARACTER_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Input Indicators */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(CHARACTER_COLOR, 0.05), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Connect two characters to define their relationship
          </Typography>
        </Box>

        {/* Relationship Type */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Relationship Type</InputLabel>
          <Select value={relationshipType} label="Relationship Type" sx={{ fontSize: '0.8rem' }}>
            {RELATIONSHIP_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Conflict Level */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Conflict Intensity: {conflictLevel}%
          </Typography>
          <Slider
            value={conflictLevel}
            size="small"
            sx={{
              color: CHARACTER_COLOR,
              '& .MuiSlider-thumb': { width: 14, height: 14 },
            }}
          />
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Relationship Evolution
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Evolution</InputLabel>
              <Select value={evolution} label="Evolution" sx={{ fontSize: '0.8rem' }}>
                {EVOLUTION_TYPES.map((e) => (
                  <MenuItem key={e.value} value={e.value} sx={{ fontSize: '0.8rem' }}>
                    {e.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedRelationship && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(CHARACTER_COLOR, 0.08),
              border: `1px solid ${alpha(CHARACTER_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Relationship Summary
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.generatedRelationship.substring(0, 150)}...
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
            label="Character"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(CHARACTER_COLOR, 0.15),
              color: CHARACTER_COLOR,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Tooltip title="Generate Relationship">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: CHARACTER_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(CHARACTER_COLOR, 0.8) },
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

export default CharacterRelationshipNode;
