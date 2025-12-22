/**
 * CharacterLockNode - Lock character identity across generations
 * Accepts up to 7 reference images to create a consistent character profile
 * Outputs character embedding for use in generation nodes
 */

import { memo, useMemo, useState, useCallback } from 'react';
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
  Slider,
  Badge,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RunningIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 300;
const NODE_MIN_HEIGHT = 320;
const MAX_REFERENCES = 7;


// Character node accent color (purple)
const CHARACTER_COLOR = '#a855f7';

// ===== Types =====

export interface CharacterLockNodeData {
  nodeType: 'characterLock';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  // Character data
  characterName?: string;
  characterId?: string;
  referenceImages?: string[];
  isLocked?: boolean;
  preserveStrength?: number;
  // Extracted traits
  traits?: {
    age?: string;
    gender?: string;
    hairColor?: string;
    eyeColor?: string;
  };
}

export interface CharacterLockNodeProps {
  id: string;
  data: CharacterLockNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// ===== Helper Functions =====

const getStatusIcon = (status: string, isLocked?: boolean) => {
  if (isLocked) {
    return <LockIcon sx={{ fontSize: 16, color: CHARACTER_COLOR }} />;
  }
  switch (status) {
    case 'completed':
      return <SuccessIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    case 'running':
      return <RunningIcon sx={{ fontSize: 16, color: 'primary.main', animation: 'spin 1s linear infinite' }} />;
    case 'error':
      return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    default:
      return <UnlockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />;
  }
};

const getStatusColor = (status: string, isLocked?: boolean): string => {
  if (isLocked) return CHARACTER_COLOR;
  switch (status) {
    case 'completed':
      return '#22c55e';
    case 'running':
      return CHARACTER_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const CharacterLockNode = memo(function CharacterLockNode({
  data,
  selected,
  isConnectable = true,
}: CharacterLockNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  const statusColor = useMemo(
    () => getStatusColor(data.status, data.isLocked),
    [data.status, data.isLocked]
  );

  // Get current values
  const characterName = (data.parameters?.characterName as string) ?? data.characterName ?? '';
  const preserveStrength = (data.parameters?.preserveStrength as number) ?? data.preserveStrength ?? 0.8;
  const referenceImages = data.referenceImages || [];
  const isLocked = data.isLocked ?? false;

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render input handles (left side)
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topOffset = 100 + index * 50;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip key={port.id} title={`${port.name} (${port.type})`} placement="left">
          <Handle
            type="target"
            position={Position.Left}
            id={port.id}
            isConnectable={isConnectable}
            style={{
              top: topOffset,
              width: 14,
              height: 14,
              backgroundColor: portColor,
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render output handles (right side)
  const renderOutputHandles = () => {
    if (!data.outputs || data.outputs.length === 0) return null;

    return data.outputs.map((port: Port, index: number) => {
      const topOffset = 100 + index * 50;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip key={port.id} title={`${port.name} (${port.type})`} placement="right">
          <Handle
            type="source"
            position={Position.Right}
            id={port.id}
            isConnectable={isConnectable}
            style={{
              top: topOffset,
              width: 14,
              height: 14,
              backgroundColor: portColor,
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render reference images grid
  const renderReferenceImages = () => {
    const slots = Array(MAX_REFERENCES).fill(null);
    referenceImages.forEach((url, idx) => {
      if (idx < MAX_REFERENCES) slots[idx] = url;
    });

    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <PersonIcon sx={{ fontSize: 14, color: CHARACTER_COLOR }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Reference Images ({referenceImages.length}/{MAX_REFERENCES})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {slots.map((url, idx) => (
            <Box
              key={idx}
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: url ? 'transparent' : alpha('#000', 0.05),
                border: '1px dashed',
                borderColor: url ? CHARACTER_COLOR : alpha('#000', 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {url ? (
                <Box
                  component="img"
                  src={url}
                  alt={`Ref ${idx + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <AddIcon sx={{ fontSize: 16, color: alpha('#000', 0.2) }} />
              )}
              {url && (
                <Badge
                  badgeContent={idx + 1}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    '& .MuiBadge-badge': {
                      fontSize: '0.5rem',
                      minWidth: 12,
                      height: 12,
                      bgcolor: CHARACTER_COLOR,
                      color: 'white',
                    },
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Render character info
  const renderCharacterInfo = () => {
    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <TextField
          size="small"
          label="Character Name"
          value={characterName}
          fullWidth
          sx={{
            '& .MuiInputBase-input': { fontSize: '0.8rem' },
            '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          }}
        />

        {data.traits && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {data.traits.age && (
              <Chip label={data.traits.age} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            )}
            {data.traits.gender && (
              <Chip label={data.traits.gender} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            )}
            {data.traits.hairColor && (
              <Chip label={data.traits.hairColor} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            )}
            {data.traits.eyeColor && (
              <Chip label={data.traits.eyeColor} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Render settings panel
  const renderSettings = () => {
    if (!showSettings) return null;

    return (
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Stack spacing={1.5}>
          {/* Preserve Strength */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Identity Preservation: {Math.round(preserveStrength * 100)}%
            </Typography>
            <Slider
              value={preserveStrength}
              min={0}
              max={1}
              step={0.05}
              size="small"
              sx={{ color: CHARACTER_COLOR }}
            />
          </Box>

          {/* Lock Status */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: isLocked ? alpha(CHARACTER_COLOR, 0.1) : alpha('#000', 0.05),
              border: '1px solid',
              borderColor: isLocked ? CHARACTER_COLOR : alpha('#000', 0.1),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {isLocked ? (
              <LockIcon sx={{ fontSize: 18, color: CHARACTER_COLOR }} />
            ) : (
              <UnlockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            )}
            <Box>
              <Typography variant="caption" fontWeight={500}>
                {isLocked ? 'Character Locked' : 'Character Unlocked'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem' }}>
                {isLocked
                  ? 'Identity will be preserved in generations'
                  : 'Add references and lock to preserve identity'}
              </Typography>
            </Box>
          </Box>

          {/* Info */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(CHARACTER_COLOR, 0.05),
              border: '1px solid',
              borderColor: alpha(CHARACTER_COLOR, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Upload up to 7 reference images of the same person from different angles.
              The character profile will preserve identity across all connected generation nodes.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  // Calculate node height
  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    85 + // Header
    80 + // Reference images
    70 + // Character info
    (showSettings ? 180 : 0) +
    (data.error ? 30 : 0)
  );

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: nodeHeight,
        borderRadius: 2,
        overflow: 'visible',
        border: '2px solid',
        borderColor: selected ? CHARACTER_COLOR : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? CHARACTER_COLOR : alpha(CHARACTER_COLOR, 0.5),
          boxShadow: 4,
        },
      }}
    >
      {/* Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}

      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          background: `linear-gradient(135deg, ${CHARACTER_COLOR} 0%, ${alpha(CHARACTER_COLOR, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status, isLocked)}
          <LockIcon sx={{ fontSize: 16, color: 'white' }} />
          <Typography
            variant="subtitle2"
            sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
            noWrap
          >
            {data.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label={isLocked ? 'Locked' : 'Unlocked'}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.55rem',
              bgcolor: isLocked ? alpha('#fff', 0.3) : alpha('#fff', 0.2),
              color: 'white',
            }}
          />
          <IconButton
            size="small"
            onClick={handleToggleSettings}
            sx={{ color: 'white', p: 0.25 }}
          >
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Progress bar */}
      {data.status === 'running' && (
        <LinearProgress
          variant={data.progress ? 'determinate' : 'indeterminate'}
          value={data.progress}
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': {
              backgroundColor: statusColor,
            },
          }}
        />
      )}

      {/* Error message */}
      {data.error && (
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: alpha('#ef4444', 0.1) }}>
          <Typography variant="caption" color="error" sx={{ fontSize: '0.65rem' }}>
            {data.error}
          </Typography>
        </Box>
      )}

      {/* Reference images */}
      {renderReferenceImages()}

      {/* Character info */}
      {renderCharacterInfo()}

      {/* Settings panel */}
      {renderSettings()}

      {/* Status indicator bar at bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: statusColor,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          opacity: data.status === 'idle' && !isLocked ? 0.3 : 1,
          transition: 'opacity 0.3s',
        }}
      />

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Paper>
  );
});

export default CharacterLockNode;
