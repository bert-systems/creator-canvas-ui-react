/**
 * EnhancedNode - Production-ready node component with resize, metadata, and responsive design
 * Follows the strategy document's Node Card Design v2 specification
 *
 * @deprecated v4.0 - Use UnifiedNode instead
 * This component is part of the legacy node system (v3.1).
 * New boards should use UnifiedNode which provides:
 * - Three display modes (compact/standard/expanded)
 * - Slot-based composition (preview, parameters, actions)
 * - Unified API integration via unifiedNodeService
 * - Better performance with React.memo and virtualization
 *
 * Migration: Enable useUnifiedPalette flag in CreativeCanvasStudio
 */

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position, NodeResizeControl } from '@xyflow/react';
import type { ResizeDragEvent, ResizeParams } from '@xyflow/react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Tooltip,
  alpha,
  IconButton,
  Collapse,
  Stack,
  Divider,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Lock as LockIcon,
  ZoomOutMap as ResizeIcon,
} from '@mui/icons-material';
import type { Port, NodeCategory, NodeType } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const MIN_WIDTH = 180;
const MIN_HEIGHT = 120;
const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 280;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 800;

// Port colors by type

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  input: '#8b5cf6',
  imageGen: '#3b82f6',
  videoGen: '#22c55e',
  audio: '#a855f7',
  '3d': '#f97316',
  fashion: '#ec4899',
  story: '#f59e0b',
  processing: '#eab308',
  agent: '#e80ade',
  output: '#06b6d4',
  character: '#a855f7',
  style: '#06b6d4',
  composite: '#f97316',
};

// ===== Types =====

// Fully typed interface - not extending Record<string, unknown> base
export interface EnhancedNodeData {
  nodeType: NodeType;
  category: NodeCategory;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  // Extended metadata
  modelName?: string;
  estimatedCost?: number;
  executionTime?: number;
  isLocked?: boolean;
}

export interface EnhancedNodeProps {
  data: EnhancedNodeData;
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
      return '#3b82f6';
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const formatCost = (cost?: number): string => {
  if (!cost) return '';
  return `$${cost.toFixed(3)}`;
};

const formatDuration = (ms?: number): string => {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

// ===== Component =====

export const EnhancedNode = memo(function EnhancedNode({
  data,
  selected,
  isConnectable = true,
}: EnhancedNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  });
  const nodeRef = useRef<HTMLDivElement>(null);

  const categoryColor = CATEGORY_COLORS[data.category] || '#6b7280';
  const statusColor = getStatusColor(data.status);

  // Determine if we're in compact mode based on size
  const isCompact = dimensions.width < 240 || dimensions.height < 200;

  // Handle resize
  const handleResize = useCallback((_event: ResizeDragEvent, params: ResizeParams) => {
    setDimensions({
      width: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, params.width)),
      height: Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, params.height)),
    });
  }, []);

  // Toggle expand/collapse
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
    setDimensions(prev => ({
      ...prev,
      height: isExpanded ? DEFAULT_HEIGHT : DEFAULT_HEIGHT * 1.5,
    }));
  }, [isExpanded]);

  // Render input ports (left side)
  const renderInputPorts = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topPercent = ((index + 1) / (data.inputs.length + 1)) * 100;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Box key={port.id} sx={{ position: 'absolute', left: -8, top: `${topPercent}%`, transform: 'translateY(-50%)' }}>
          <Tooltip title={`${port.name} (${port.type})`} placement="left" arrow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Handle
                type="target"
                position={Position.Left}
                id={port.id}
                isConnectable={isConnectable}
                style={{
                  position: 'relative',
                  transform: 'none',
                  width: 14,
                  height: 14,
                  backgroundColor: portColor,
                  border: '2px solid white',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                }}
              />
              {!isCompact && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 0.5,
                    fontSize: '0.6rem',
                    color: 'text.secondary',
                    maxWidth: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {port.name}
                </Typography>
              )}
            </Box>
          </Tooltip>
        </Box>
      );
    });
  };

  // Render output ports (right side)
  const renderOutputPorts = () => {
    if (!data.outputs || data.outputs.length === 0) return null;

    return data.outputs.map((port: Port, index: number) => {
      const topPercent = ((index + 1) / (data.outputs.length + 1)) * 100;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Box key={port.id} sx={{ position: 'absolute', right: -8, top: `${topPercent}%`, transform: 'translateY(-50%)' }}>
          <Tooltip title={`${port.name} (${port.type})`} placement="right" arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row-reverse' }}>
              <Handle
                type="source"
                position={Position.Right}
                id={port.id}
                isConnectable={isConnectable}
                style={{
                  position: 'relative',
                  transform: 'none',
                  width: 14,
                  height: 14,
                  backgroundColor: portColor,
                  border: '2px solid white',
                  boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                }}
              />
              {!isCompact && (
                <Typography
                  variant="caption"
                  sx={{
                    mr: 0.5,
                    fontSize: '0.6rem',
                    color: 'text.secondary',
                    maxWidth: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {port.name}
                </Typography>
              )}
            </Box>
          </Tooltip>
        </Box>
      );
    });
  };

  // Render body content
  const renderBody = () => {
    const prompt = data.parameters?.prompt as string | undefined;

    return (
      <Box sx={{ px: 1.5, py: 1 }}>
        {/* Prompt snippet */}
        {prompt && !isCompact && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: isExpanded ? 4 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.7rem',
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            {prompt}
          </Typography>
        )}

        {/* Metadata chips */}
        {!isCompact && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {data.modelName && (
              <Chip
                label={data.modelName}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: alpha(categoryColor, 0.1),
                  color: categoryColor,
                }}
              />
            )}
            {data.estimatedCost !== undefined && data.estimatedCost > 0 && (
              <Chip
                label={formatCost(data.estimatedCost)}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#22c55e', 0.1),
                  color: '#22c55e',
                }}
              />
            )}
            {data.executionTime && (
              <Chip
                label={formatDuration(data.executionTime)}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#6b7280', 0.1),
                }}
              />
            )}
          </Stack>
        )}
      </Box>
    );
  };

  // Render settings panel
  const renderSettings = () => {
    if (!showSettings || isCompact) return null;

    return (
      <Collapse in={showSettings}>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Parameters
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {Object.entries(data.parameters || {}).slice(0, 4).map(([key, value]) => (
              <Box key={key}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                  {key}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }} noWrap>
                  {String(value).substring(0, 50)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Collapse>
    );
  };

  return (
    <Paper
      ref={nodeRef}
      elevation={selected ? 8 : 2}
      sx={{
        width: dimensions.width,
        minHeight: dimensions.height,
        borderRadius: 2,
        overflow: 'visible',
        border: '2px solid',
        borderColor: selected ? categoryColor : 'transparent',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? categoryColor : alpha(categoryColor, 0.5),
          boxShadow: 4,
        },
      }}
    >
      {/* Resize Handle */}
      <NodeResizeControl
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        maxWidth={MAX_WIDTH}
        maxHeight={MAX_HEIGHT}
        onResize={handleResize}
        style={{
          background: 'transparent',
          border: 'none',
        }}
      >
        <ResizeIcon
          sx={{
            position: 'absolute',
            right: 4,
            bottom: 4,
            fontSize: 16,
            color: 'text.disabled',
            cursor: 'se-resize',
          }}
        />
      </NodeResizeControl>

      {/* Input Ports */}
      {renderInputPorts()}

      {/* Output Ports */}
      {renderOutputPorts()}

      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: isCompact ? 0.5 : 0.75,
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${alpha(categoryColor, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status)}
          <Typography
            variant="subtitle2"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: isCompact ? '0.7rem' : '0.8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {data.isLocked && <LockIcon sx={{ fontSize: 14, color: 'white' }} />}

          {!isCompact && (
            <>
              <IconButton
                size="small"
                onClick={() => setShowSettings(prev => !prev)}
                sx={{ color: 'white', p: 0.25 }}
              >
                <SettingsIcon sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleToggleExpand}
                sx={{ color: 'white', p: 0.25 }}
              >
                {isExpanded ? <CollapseIcon sx={{ fontSize: 14 }} /> : <ExpandIcon sx={{ fontSize: 14 }} />}
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Progress Bar */}
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

      {/* Error Message */}
      {data.error && (
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: alpha('#ef4444', 0.1) }}>
          <Typography variant="caption" color="error" sx={{ fontSize: '0.65rem' }}>
            {data.error}
          </Typography>
        </Box>
      )}

      {/* Body Content */}
      {renderBody()}

      {/* Settings Panel */}
      {renderSettings()}

      {/* Status Indicator Bar */}
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

      {/* Spinner Animation CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Paper>
  );
});

export default EnhancedNode;
