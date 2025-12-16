/**
 * VirtualTryOnNode - Specialized node for virtual garment try-on
 * Supports multiple providers: FASHN, IDM-VTON, CAT-VTON, Leffa, Kling-Kolors
 * Shows model image, garment image, and result preview
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
  Select,
  MenuItem,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Checkroom as GarmentIcon,
  Person as ModelIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  Speed as SpeedIcon,
  HighQuality as QualityIcon,
  Balance as BalanceIcon,
} from '@mui/icons-material';
import type { Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import type { TryOnProvider, TryOnCategory } from '@/services/virtualTryOnService';

// ===== Constants =====

const NODE_WIDTH = 300;
const NODE_MIN_HEIGHT = 280;


// Fashion-specific accent color (pink)
const FASHION_COLOR = '#ec4899';

// Provider display info
const PROVIDER_INFO: Record<TryOnProvider, { label: string; speed: string; quality: string }> = {
  'fashn': { label: 'FASHN', speed: '~15s', quality: 'High' },
  'idm-vton': { label: 'IDM-VTON', speed: '~25s', quality: 'Very High' },
  'cat-vton': { label: 'CAT-VTON', speed: '~8s', quality: 'Good' },
  'leffa': { label: 'Leffa', speed: '~12s', quality: 'Good' },
  'kling-kolors': { label: 'Kling-Kolors', speed: '~20s', quality: 'High' },
};

// ===== Types =====

export interface VirtualTryOnNodeData {
  nodeType: 'virtualTryOn';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  // Input previews
  modelImageUrl?: string;
  garmentImageUrl?: string;
  // Output preview
  resultImageUrl?: string;
  // Job tracking
  jobId?: string;
  provider?: TryOnProvider;
}

export interface VirtualTryOnNodeProps {
  id: string;
  data: VirtualTryOnNodeData;
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
      return FASHION_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const VirtualTryOnNode = memo(function VirtualTryOnNode({
  data,
  selected,
  isConnectable = true,
}: VirtualTryOnNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  const statusColor = useMemo(() => getStatusColor(data.status), [data.status]);

  // Get current parameter values with defaults
  const provider = (data.parameters?.provider as TryOnProvider) ?? 'fashn';
  const garmentCategory = (data.parameters?.category as TryOnCategory) ?? 'tops';
  const qualityMode = (data.parameters?.mode as string) ?? 'quality';

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render input handles (left side)
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topOffset = 85 + index * 55;
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
      const topOffset = 85 + index * 55;
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

  // Render input previews (model + garment side by side)
  const renderInputPreviews = () => {
    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Stack direction="row" spacing={1}>
          {/* Model Image */}
          <Box
            sx={{
              flex: 1,
              height: 80,
              borderRadius: 1,
              bgcolor: data.modelImageUrl ? 'transparent' : alpha('#000', 0.05),
              border: '1px dashed',
              borderColor: data.modelImageUrl ? PORT_COLORS.image : alpha('#000', 0.2),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {data.modelImageUrl ? (
              <Box
                component="img"
                src={data.modelImageUrl}
                alt="Model"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <>
                <ModelIcon sx={{ fontSize: 24, color: alpha(PORT_COLORS.image, 0.5) }} />
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', mt: 0.5 }}>
                  Model*
                </Typography>
              </>
            )}
          </Box>

          {/* Garment Image */}
          <Box
            sx={{
              flex: 1,
              height: 80,
              borderRadius: 1,
              bgcolor: data.garmentImageUrl ? 'transparent' : alpha('#000', 0.05),
              border: '1px dashed',
              borderColor: data.garmentImageUrl ? FASHION_COLOR : alpha('#000', 0.2),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {data.garmentImageUrl ? (
              <Box
                component="img"
                src={data.garmentImageUrl}
                alt="Garment"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <>
                <GarmentIcon sx={{ fontSize: 24, color: alpha(FASHION_COLOR, 0.5) }} />
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary', mt: 0.5 }}>
                  Garment*
                </Typography>
              </>
            )}
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
          Result Preview
        </Typography>
        <Box
          sx={{
            height: 100,
            borderRadius: 1,
            bgcolor: data.resultImageUrl ? 'transparent' : alpha('#000', 0.05),
            border: data.resultImageUrl ? 'none' : '1px dashed',
            borderColor: alpha(FASHION_COLOR, 0.3),
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
                alt="Try-on result"
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
              <ImageIcon sx={{ fontSize: 32, color: alpha(FASHION_COLOR, 0.3) }} />
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled', display: 'block' }}>
                Result will appear here
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
          {/* Quality Mode */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Quality Mode
            </Typography>
            <ToggleButtonGroup
              value={qualityMode}
              exclusive
              size="small"
              fullWidth
              sx={{ height: 28 }}
            >
              <ToggleButton value="speed" sx={{ fontSize: '0.65rem', py: 0.5 }}>
                <SpeedIcon sx={{ fontSize: 12, mr: 0.5 }} />
                Fast
              </ToggleButton>
              <ToggleButton value="balanced" sx={{ fontSize: '0.65rem', py: 0.5 }}>
                <BalanceIcon sx={{ fontSize: 12, mr: 0.5 }} />
                Balanced
              </ToggleButton>
              <ToggleButton value="quality" sx={{ fontSize: '0.65rem', py: 0.5 }}>
                <QualityIcon sx={{ fontSize: 12, mr: 0.5 }} />
                Quality
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Provider Selection */}
          <FormControl size="small" fullWidth>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Provider
            </Typography>
            <Select
              value={provider}
              size="small"
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                <MenuItem key={key} value={key}>
                  {info.label} ({info.speed})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Garment Category */}
          <FormControl size="small" fullWidth>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
              Garment Type
            </Typography>
            <Select
              value={garmentCategory}
              size="small"
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              <MenuItem value="tops">Tops</MenuItem>
              <MenuItem value="bottoms">Bottoms</MenuItem>
              <MenuItem value="one-pieces">Dresses/One-pieces</MenuItem>
            </Select>
          </FormControl>

          {/* Cost estimate */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(FASHION_COLOR, 0.1),
              border: '1px solid',
              borderColor: alpha(FASHION_COLOR, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Provider: <strong>{PROVIDER_INFO[provider].label}</strong>
              <br />
              Quality: {PROVIDER_INFO[provider].quality} | Time: {PROVIDER_INFO[provider].speed}
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
    100 + // Input previews
    120 + // Result preview
    (showSettings ? 200 : 0) + // Settings panel
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
        borderColor: selected ? FASHION_COLOR : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? FASHION_COLOR : alpha(FASHION_COLOR, 0.5),
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
          background: `linear-gradient(135deg, ${FASHION_COLOR} 0%, ${alpha(FASHION_COLOR, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status)}
          <GarmentIcon sx={{ fontSize: 16, color: 'white' }} />
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
            label="Try-On"
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

      {/* Input previews (model + garment) */}
      {renderInputPreviews()}

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

export default VirtualTryOnNode;
