/**
 * FaceMemoryNode - 5-face memory system for multi-character scenes
 * Enables consistent multi-character compositions with named slots
 * Each slot holds a face that can be referenced in prompts
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
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Face as FaceIcon,
  Person as PersonIcon,
  Remove as RemoveIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { Port, PortType } from '@/models/canvas';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 360;
const MAX_FACES = 5;

const PORT_COLORS: Record<PortType, string> = {
  image: '#3b82f6',
  video: '#8b5cf6',
  audio: '#ec4899',
  text: '#f97316',
  style: '#06b6d4',
  character: '#a855f7',
  mesh3d: '#f59e0b',
  any: '#6b7280',
};

// Face memory accent color (pink/magenta)
const FACE_COLOR = '#ec4899';

// ===== Types =====

export interface FaceSlot {
  slotIndex: number;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
}

export interface FaceMemoryNodeData {
  nodeType: 'faceMemory';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  // Face memory state
  sessionId?: string;
  slots?: FaceSlot[];
  isInitialized?: boolean;
}

export interface FaceMemoryNodeProps {
  id: string;
  data: FaceMemoryNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// ===== Helper Functions =====

const getStatusIcon = (status: string, isInitialized?: boolean) => {
  if (isInitialized) {
    return <FaceIcon sx={{ fontSize: 16, color: FACE_COLOR }} />;
  }
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

const getStatusColor = (status: string, isInitialized?: boolean): string => {
  if (isInitialized) return FACE_COLOR;
  switch (status) {
    case 'completed':
      return '#22c55e';
    case 'running':
      return FACE_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const defaultSlots: FaceSlot[] = Array(MAX_FACES).fill(null).map((_, idx) => ({
  slotIndex: idx,
  name: `Face ${idx + 1}`,
  imageUrl: null,
  isActive: false,
}));

// ===== Component =====

export const FaceMemoryNode = memo(function FaceMemoryNode({
  data,
  selected,
  isConnectable = true,
}: FaceMemoryNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  const statusColor = useMemo(
    () => getStatusColor(data.status, data.isInitialized),
    [data.status, data.isInitialized]
  );

  // Get slots with defaults
  const slots = data.slots || defaultSlots;
  const activeCount = slots.filter(s => s.isActive && s.imageUrl).length;
  const isInitialized = data.isInitialized ?? false;

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

  // Render a single face slot
  const renderFaceSlot = (slot: FaceSlot) => {
    const hasImage = !!slot.imageUrl;
    const isActive = slot.isActive && hasImage;

    return (
      <Box
        key={slot.slotIndex}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 0.75,
          borderRadius: 1,
          bgcolor: isActive ? alpha(FACE_COLOR, 0.1) : alpha('#000', 0.02),
          border: '1px solid',
          borderColor: isActive ? FACE_COLOR : alpha('#000', 0.1),
          transition: 'all 0.2s',
        }}
      >
        {/* Face Image */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            bgcolor: hasImage ? 'transparent' : alpha('#000', 0.05),
            border: '2px solid',
            borderColor: isActive ? FACE_COLOR : alpha('#000', 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {slot.imageUrl ? (
            <Box
              component="img"
              src={slot.imageUrl}
              alt={slot.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <PersonIcon sx={{ fontSize: 20, color: alpha('#000', 0.3) }} />
          )}
        </Box>

        {/* Slot Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextField
            size="small"
            value={slot.name}
            placeholder={`Face ${slot.slotIndex + 1}`}
            variant="standard"
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.75rem',
                fontWeight: 500,
                py: 0,
              },
              '& .MuiInput-underline:before': {
                borderBottom: 'none',
              },
              '& .MuiInput-underline:hover:before': {
                borderBottom: '1px solid',
                borderColor: FACE_COLOR,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            {hasImage ? (isActive ? 'Active' : 'Inactive') : 'No image'}
          </Typography>
        </Box>

        {/* Toggle */}
        {hasImage && (
          <IconButton
            size="small"
            sx={{
              color: isActive ? FACE_COLOR : 'text.disabled',
              p: 0.5,
            }}
          >
            {isActive ? (
              <FaceIcon sx={{ fontSize: 18 }} />
            ) : (
              <RemoveIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        )}

        {/* Slot number badge */}
        <Chip
          label={slot.slotIndex + 1}
          size="small"
          sx={{
            height: 18,
            minWidth: 18,
            fontSize: '0.6rem',
            bgcolor: isActive ? FACE_COLOR : alpha('#000', 0.1),
            color: isActive ? 'white' : 'text.secondary',
            '& .MuiChip-label': { px: 0.5 },
          }}
        />
      </Box>
    );
  };

  // Render face slots section
  const renderFaceSlots = () => {
    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FaceIcon sx={{ fontSize: 14, color: FACE_COLOR }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Face Memory Slots ({activeCount}/{MAX_FACES})
            </Typography>
          </Box>
          <Chip
            label={isInitialized ? 'Ready' : 'Not initialized'}
            size="small"
            sx={{
              height: 16,
              fontSize: '0.55rem',
              bgcolor: isInitialized ? alpha(FACE_COLOR, 0.2) : alpha('#000', 0.1),
              color: isInitialized ? FACE_COLOR : 'text.secondary',
            }}
          />
        </Box>
        <Stack spacing={0.75}>
          {slots.map(slot => renderFaceSlot(slot))}
        </Stack>
      </Box>
    );
  };

  // Render settings panel
  const renderSettings = () => {
    if (!showSettings) return null;

    return (
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Stack spacing={1.5}>
          {/* Session ID */}
          {data.sessionId && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Session: {data.sessionId.substring(0, 8)}...
              </Typography>
            </Box>
          )}

          {/* Clear all button */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha('#ef4444', 0.05),
              border: '1px solid',
              borderColor: alpha('#ef4444', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Clear all face slots
            </Typography>
            <IconButton size="small" sx={{ color: 'error.main' }}>
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Info */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(FACE_COLOR, 0.05),
              border: '1px solid',
              borderColor: alpha(FACE_COLOR, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Each slot can hold one face for multi-character scenes.
              Reference faces by name in your prompts:
              "Face 1 and Face 2 having a conversation"
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
    (MAX_FACES * 58) + // Face slots
    20 + // Padding
    (showSettings ? 140 : 0) +
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
        borderColor: selected ? FACE_COLOR : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? FACE_COLOR : alpha(FACE_COLOR, 0.5),
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
          background: `linear-gradient(135deg, ${FACE_COLOR} 0%, ${alpha(FACE_COLOR, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status, isInitialized)}
          <FaceIcon sx={{ fontSize: 16, color: 'white' }} />
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
            label={`${activeCount} active`}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.55rem',
              bgcolor: alpha('#fff', 0.2),
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

      {/* Face slots */}
      {renderFaceSlots()}

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
          opacity: data.status === 'idle' && !isInitialized ? 0.3 : 1,
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

export default FaceMemoryNode;
