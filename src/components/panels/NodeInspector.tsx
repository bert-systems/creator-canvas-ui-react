/**
 * Node Inspector - Right sidebar for viewing and editing node properties
 * Supports dynamic parameter editing based on node definition
 */

import { useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Switch,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  IconButton,
  Button,
  Tooltip,
  Paper,
  alpha,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Input as InputIcon,
  Output as OutputIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, NodeParameter, Port } from '@/models/canvas';
import { getNodeDefinition, nodeCategories } from '@/config/nodeDefinitions';

// ===== Types =====

interface SelectedNode {
  id: string;
  data: CanvasNodeData;
}

interface NodeInspectorProps {
  node: SelectedNode | null;
  onParameterChange?: (nodeId: string, paramId: string, value: unknown) => void;
  onExecute?: (nodeId: string) => void;
  onStop?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onClose?: () => void;
  width?: number;
}

// ===== Helper Functions =====

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <SuccessIcon color="success" fontSize="small" />;
    case 'running':
      return <RefreshIcon color="primary" fontSize="small" sx={{ animation: 'spin 1s linear infinite' }} />;
    case 'error':
      return <ErrorIcon color="error" fontSize="small" />;
    default:
      return <PendingIcon color="disabled" fontSize="small" />;
  }
};

const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'running':
      return 'primary';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

const getCategoryColor = (category: string): string => {
  const cat = nodeCategories.find(c => c.id === category);
  return cat?.color || '#6b7280';
};

// ===== Component =====

export function NodeInspector({
  node,
  onParameterChange,
  onExecute,
  onStop,
  onDelete,
  onDuplicate,
  onClose,
  width = 320,
}: NodeInspectorProps) {
  // Get node definition
  const definition = useMemo(() => {
    if (!node) return null;
    return getNodeDefinition(node.data.nodeType);
  }, [node]);

  // Get category color
  const categoryColor = useMemo(() => {
    if (!node) return '#6b7280';
    return getCategoryColor(node.data.category);
  }, [node]);

  // Handle parameter change
  const handleParamChange = useCallback(
    (paramId: string, value: unknown) => {
      if (node && onParameterChange) {
        onParameterChange(node.id, paramId, value);
      }
    },
    [node, onParameterChange]
  );

  // Render parameter input based on type
  const renderParameter = (param: NodeParameter) => {
    const currentValue = node?.data.parameters[param.id];

    switch (param.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            label={param.name}
            value={(currentValue as string) ?? param.default ?? ''}
            onChange={(e) => handleParamChange(param.id, e.target.value)}
            multiline={param.id === 'prompt' || param.id === 'text' || param.id === 'script'}
            rows={param.id === 'prompt' || param.id === 'text' || param.id === 'script' ? 4 : 1}
            placeholder={`Enter ${param.name.toLowerCase()}...`}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            size="small"
            type="number"
            label={param.name}
            value={(currentValue as number) ?? param.default ?? 0}
            onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
            slotProps={{
              htmlInput: {
                min: param.min,
                max: param.max,
                step: param.step || 1,
              },
            }}
          />
        );

      case 'slider':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {param.name}
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {String((currentValue as number) ?? param.default ?? 0)}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={(currentValue as number) ?? (param.default as number) ?? 0}
              min={param.min ?? 0}
              max={param.max ?? 100}
              step={param.step ?? 1}
              onChange={(_, value) => handleParamChange(param.id, value)}
              valueLabelDisplay="auto"
              sx={{
                color: categoryColor,
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0 0 0 8px ${alpha(categoryColor, 0.16)}`,
                  },
                },
              }}
            />
          </Box>
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{param.name}</InputLabel>
            <Select
              label={param.name}
              value={(currentValue as string) ?? param.default ?? ''}
              onChange={(e) => handleParamChange(param.id, e.target.value)}
            >
              {param.options?.map((option) => (
                <MenuItem key={String(option.value)} value={option.value as string}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={(currentValue as boolean) ?? (param.default as boolean) ?? false}
                onChange={(e) => handleParamChange(param.id, e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: categoryColor,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: categoryColor,
                  },
                }}
              />
            }
            label={param.name}
          />
        );

      case 'color':
        return (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {param.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="input"
                type="color"
                value={(currentValue as string) ?? param.default ?? '#000000'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleParamChange(param.id, e.target.value)}
                sx={{
                  width: 40,
                  height: 32,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  p: 0,
                }}
              />
              <TextField
                size="small"
                value={(currentValue as string) ?? param.default ?? '#000000'}
                onChange={(e) => handleParamChange(param.id, e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        );

      case 'file':
        return (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {param.name}
            </Typography>
            <Button variant="outlined" size="small" fullWidth>
              Upload File
            </Button>
          </Box>
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={param.name}
            value={String(currentValue ?? param.default ?? '')}
            onChange={(e) => handleParamChange(param.id, e.target.value)}
          />
        );
    }
  };

  // Render port chip
  const renderPort = (port: Port, type: 'input' | 'output') => {
    const portColors: Record<string, string> = {
      image: '#3b82f6',
      video: '#8b5cf6',
      audio: '#ec4899',
      text: '#f97316',
      style: '#06b6d4',
      character: '#a855f7',
      mesh3d: '#f59e0b',
      any: '#6b7280',
    };

    return (
      <Chip
        key={port.id}
        icon={type === 'input' ? <InputIcon fontSize="small" /> : <OutputIcon fontSize="small" />}
        label={`${port.name} (${port.type})`}
        size="small"
        variant="outlined"
        sx={{
          borderColor: portColors[port.type] || '#6b7280',
          color: portColors[port.type] || '#6b7280',
          '& .MuiChip-icon': {
            color: portColors[port.type] || '#6b7280',
          },
        }}
      />
    );
  };

  // Empty state
  if (!node) {
    return (
      <Box
        sx={{
          width,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Node Inspector
            </Typography>
            {onClose && (
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Select a node on the canvas to view and edit its properties
          </Typography>
        </Box>
      </Box>
    );
  }

  const nodeData = node.data;

  return (
    <Box
      sx={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: categoryColor,
              }}
            />
            <Typography variant="subtitle1" fontWeight={600}>
              {nodeData.label}
            </Typography>
          </Box>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip
            label={nodeData.category}
            size="small"
            sx={{ bgcolor: categoryColor, color: 'white', textTransform: 'capitalize' }}
          />
          <Chip
            icon={getStatusIcon(nodeData.status)}
            label={nodeData.status}
            size="small"
            color={getStatusColor(nodeData.status)}
            variant="outlined"
          />
        </Stack>

        {/* Action buttons */}
        <Stack direction="row" spacing={0.5}>
          {nodeData.status === 'running' ? (
            <Tooltip title="Stop Execution">
              <IconButton size="small" color="error" onClick={() => onStop?.(node.id)}>
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Execute Node">
              <IconButton size="small" color="primary" onClick={() => onExecute?.(node.id)}>
                <PlayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Duplicate">
            <IconButton size="small" onClick={() => onDuplicate?.(node.id)}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete?.(node.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Progress indicator */}
      {nodeData.status === 'running' && (
        <LinearProgress
          variant={nodeData.progress ? 'determinate' : 'indeterminate'}
          value={nodeData.progress}
          sx={{
            '& .MuiLinearProgress-bar': {
              backgroundColor: categoryColor,
            },
          }}
        />
      )}

      {/* Error display */}
      {nodeData.error && (
        <Alert severity="error" sx={{ m: 1, py: 0.5 }} icon={<ErrorIcon fontSize="small" />}>
          {nodeData.error}
        </Alert>
      )}

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Description */}
        {definition && (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {definition.description}
            </Typography>
            {definition.aiModel && (
              <Chip
                label={definition.aiModel}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        )}

        {/* Parameters */}
        {definition && definition.parameters.length > 0 && (
          <>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Parameters
              <Chip label={definition.parameters.length} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
            </Typography>

            <Stack spacing={2} sx={{ mb: 2 }}>
              {definition.parameters.map((param) => (
                <Box key={param.id}>{renderParameter(param)}</Box>
              ))}
            </Stack>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Inputs */}
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <InputIcon fontSize="small" />
          Inputs
        </Typography>
        {nodeData.inputs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No inputs
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {nodeData.inputs.map((input) => renderPort(input, 'input'))}
          </Stack>
        )}

        {/* Outputs */}
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <OutputIcon fontSize="small" />
          Outputs
        </Typography>
        {nodeData.outputs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No outputs
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {nodeData.outputs.map((output) => renderPort(output, 'output'))}
          </Stack>
        )}

        {/* Result preview */}
        {nodeData.result && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Result
            </Typography>
            {nodeData.result.url && (
              <Box
                component="img"
                src={nodeData.result.url}
                alt="Result"
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}
            {nodeData.result.urls && nodeData.result.urls.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {nodeData.result.urls.map((url, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={url}
                    alt={`Result ${idx + 1}`}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                    }}
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Node ID: {node.id.substring(0, 8)}...
        </Typography>
      </Box>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}

export default NodeInspector;
