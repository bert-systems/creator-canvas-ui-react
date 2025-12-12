/**
 * ClothesSwapNode - Specialized node for FLUX Kontext clothes swapping
 * Uses AI to change clothing while preserving identity and background
 * Accepts person image + text prompt describing new clothing
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
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  SwapHoriz as SwapIcon,
  Person as PersonIcon,
  TextFields as TextIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';
import type { Port, PortType } from '@/models/canvas';

// ===== Constants =====

const NODE_WIDTH = 280;
const NODE_MIN_HEIGHT = 260;

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

// Clothes swap accent color (teal/cyan)
const SWAP_COLOR = '#06b6d4';

// ===== Types =====

export interface ClothesSwapNodeData {
  nodeType: 'clothesSwap';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  // Input preview
  personImageUrl?: string;
  // Output preview
  resultImageUrl?: string;
  // Job tracking
  jobId?: string;
}

export interface ClothesSwapNodeProps {
  id: string;
  data: ClothesSwapNodeData;
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return '#22c55e';
    case 'running':
      return SWAP_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const ClothesSwapNode = memo(function ClothesSwapNode({
  data,
  selected,
  isConnectable = true,
}: ClothesSwapNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);

  // Get current parameter values with defaults
  const prompt = (data.parameters?.prompt as string) ?? '';
  const preserveIdentity = (data.parameters?.preserveIdentity as boolean) ?? true;
  const preserveBackground = (data.parameters?.preserveBackground as boolean) ?? true;
  const guidanceScale = (data.parameters?.guidanceScale as number) ?? 7.5;

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render input handles (left side)
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topOffset = 80 + index * 50;
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
      const topOffset = 80 + index * 50;
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

  // Render input preview and prompt
  const renderInputSection = () => {
    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Stack spacing={1}>
          {/* Person Image */}
          <Box
            sx={{
              height: 70,
              borderRadius: 1,
              bgcolor: data.personImageUrl ? 'transparent' : alpha('#000', 0.05),
              border: '1px dashed',
              borderColor: data.personImageUrl ? PORT_COLORS.image : alpha('#000', 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {data.personImageUrl ? (
              <Box
                component="img"
                src={data.personImageUrl}
                alt="Person"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 28, color: alpha(PORT_COLORS.image, 0.5) }} />
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', display: 'block' }}>
                  Person Image*
                </Typography>
              </Box>
            )}
          </Box>

          {/* Prompt Input */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(SWAP_COLOR, 0.05),
              border: '1px solid',
              borderColor: alpha(SWAP_COLOR, 0.2),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <TextIcon sx={{ fontSize: 12, color: SWAP_COLOR }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Clothing Description*
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.primary' }}>
              {prompt || 'Enter clothing description...'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  // Render result preview
  const renderResultPreview = () => {
    return (
      <Box sx={{ px: 1.5, pb: 1, mt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
          Result
        </Typography>
        <Box
          sx={{
            height: 80,
            borderRadius: 1,
            bgcolor: data.resultImageUrl ? 'transparent' : alpha('#000', 0.05),
            border: data.resultImageUrl ? 'none' : '1px dashed',
            borderColor: alpha(SWAP_COLOR, 0.3),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {data.resultImageUrl ? (
            <>
              <Box
                component="img"
                src={data.resultImageUrl}
                alt="Swap result"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  bgcolor: '#f5f5f5',
                }}
              />
              <IconButton
                size="small"
                onClick={() => window.open(data.resultImageUrl, '_blank')}
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  bgcolor: alpha('#000', 0.6),
                  color: 'white',
                  '&:hover': { bgcolor: alpha('#000', 0.8) },
                }}
              >
                <FullscreenIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <SwapIcon sx={{ fontSize: 28, color: alpha(SWAP_COLOR, 0.3) }} />
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.disabled', display: 'block' }}>
                Swapped image appears here
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // Render parameters panel
  const renderParameters = () => {
    if (!showSettings) return null;

    return (
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Stack spacing={1.5}>
          {/* Preserve Identity */}
          <FormControlLabel
            control={<Switch size="small" checked={preserveIdentity} />}
            label={<Typography variant="caption">Preserve Identity</Typography>}
            sx={{ ml: 0 }}
          />

          {/* Preserve Background */}
          <FormControlLabel
            control={<Switch size="small" checked={preserveBackground} />}
            label={<Typography variant="caption">Preserve Background</Typography>}
            sx={{ ml: 0 }}
          />

          {/* Guidance Scale */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Guidance Scale: {guidanceScale.toFixed(1)}
            </Typography>
            <Slider
              value={guidanceScale}
              min={1}
              max={20}
              step={0.5}
              size="small"
              sx={{ color: SWAP_COLOR }}
            />
          </Box>

          {/* Info */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(SWAP_COLOR, 0.1),
              border: '1px solid',
              borderColor: alpha(SWAP_COLOR, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Uses FLUX Kontext for context-aware clothing replacement.
              Higher guidance = closer to prompt but may affect quality.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  // Calculate node height
  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    75 + // Header
    140 + // Input section
    100 + // Result preview
    (showSettings ? 160 : 0) + // Settings panel
    (data.error ? 30 : 0) // Error message
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
        borderColor: selected ? SWAP_COLOR : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? SWAP_COLOR : alpha(SWAP_COLOR, 0.5),
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
          background: `linear-gradient(135deg, ${SWAP_COLOR} 0%, ${alpha(SWAP_COLOR, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status)}
          <SwapIcon sx={{ fontSize: 16, color: 'white' }} />
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
            label="Kontext"
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

      {/* Input section */}
      {renderInputSection()}

      {/* Result preview */}
      {renderResultPreview()}

      {/* Parameters panel */}
      {renderParameters()}

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
          opacity: data.status === 'idle' ? 0.3 : 1,
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

export default ClothesSwapNode;
