/**
 * LocationCreatorNode - Vivid setting and location generator
 * Creates detailed location profiles with:
 * - Atmosphere and sensory details
 * - History and secrets
 * - Points of interest
 * - Visual description for AI image generation
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
  Place as LocationIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, LocationData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;


// World-building color (lime green)
const WORLD_COLOR = '#84cc16';

// Location types
const LOCATION_TYPES = [
  'Interior', 'Exterior', 'Urban', 'Rural', 'Wilderness',
  'Underground', 'Underwater', 'Aerial', 'Space', 'Fantasy Realm'
];

// Atmosphere options
const ATMOSPHERES = [
  'Welcoming', 'Foreboding', 'Mysterious', 'Peaceful', 'Chaotic',
  'Oppressive', 'Magical', 'Desolate', 'Vibrant', 'Sacred'
];

// Time of day
const TIMES_OF_DAY = [
  { value: 'dawn', label: 'Dawn' },
  { value: 'morning', label: 'Morning' },
  { value: 'noon', label: 'Noon' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'dusk', label: 'Dusk' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'midnight', label: 'Midnight' },
];

// Weather conditions
const WEATHER_OPTIONS = [
  'Clear', 'Sunny', 'Cloudy', 'Overcast', 'Rainy', 'Stormy',
  'Snowy', 'Foggy', 'Windy', 'Humid'
];

// ===== Types =====

export interface LocationCreatorNodeData extends CanvasNodeData {
  nodeType: 'locationCreator';
  locationData?: LocationData;
  generatedDescription?: string;
}

export interface LocationCreatorNodeProps {
  id: string;
  data: LocationCreatorNodeData;
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

export const LocationCreatorNode = memo(function LocationCreatorNode({
  data,
  selected,
  isConnectable = true,
}: LocationCreatorNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const locationName = (data.parameters?.locationName as string) ?? '';
  const locationType = (data.parameters?.locationType as string) ?? 'Interior';
  const briefDescription = (data.parameters?.briefDescription as string) ?? '';
  const atmosphere = (data.parameters?.atmosphere as string) ?? 'Mysterious';
  const timeOfDay = (data.parameters?.timeOfDay as string) ?? 'afternoon';
  const weather = (data.parameters?.weather as string) ?? 'Clear';
  const sensoryDetails = (data.parameters?.sensoryDetails as string) ?? '';
  const secrets = (data.parameters?.secrets as string) ?? '';

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
        border: selected ? `2px solid ${WORLD_COLOR}` : '1px solid',
        borderColor: selected ? WORLD_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(WORLD_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${WORLD_COLOR} 0%, ${alpha(WORLD_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LocationIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {locationName || 'Location Creator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Build vivid settings
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
            '& .MuiLinearProgress-bar': { backgroundColor: WORLD_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Location Name */}
        <TextField
          fullWidth
          size="small"
          label="Location Name"
          value={locationName}
          placeholder="e.g., The Abandoned Lighthouse"
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.85rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Type & Atmosphere */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Type</InputLabel>
            <Select value={locationType} label="Type" sx={{ fontSize: '0.8rem' }}>
              {LOCATION_TYPES.map((t) => (
                <MenuItem key={t} value={t} sx={{ fontSize: '0.8rem' }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Atmosphere</InputLabel>
            <Select value={atmosphere} label="Atmosphere" sx={{ fontSize: '0.8rem' }}>
              {ATMOSPHERES.map((a) => (
                <MenuItem key={a} value={a} sx={{ fontSize: '0.8rem' }}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Brief Description */}
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          label="Brief Description"
          value={briefDescription}
          placeholder="Describe this location..."
          sx={{
            mb: 1.5,
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {/* Time & Weather Row */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Time</InputLabel>
            <Select value={timeOfDay} label="Time" sx={{ fontSize: '0.8rem' }}>
              {TIMES_OF_DAY.map((t) => (
                <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Weather</InputLabel>
            <Select value={weather} label="Weather" sx={{ fontSize: '0.8rem' }}>
              {WEATHER_OPTIONS.map((w) => (
                <MenuItem key={w} value={w} sx={{ fontSize: '0.8rem' }}>{w}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1.5, display: 'block' }}>
              Advanced Settings
            </Typography>

            {/* Sensory Details */}
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Sensory Details"
              value={sensoryDetails}
              placeholder="Sights, sounds, smells, textures..."
              sx={{
                mb: 1.5,
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            {/* Secrets */}
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Hidden Secrets"
              value={secrets}
              placeholder="What secrets does this place hold?"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.generatedDescription && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(WORLD_COLOR, 0.08),
              border: `1px solid ${alpha(WORLD_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Description
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.generatedDescription.substring(0, 150)}...
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
              bgcolor: alpha(WORLD_COLOR, 0.15),
              color: WORLD_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={locationType}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Location">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !locationName}
            sx={{
              bgcolor: WORLD_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(WORLD_COLOR, 0.8) },
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

export default LocationCreatorNode;
