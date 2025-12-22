/**
 * Node Inspector - Right sidebar for viewing and editing node properties
 * Supports dynamic parameter editing based on node definition
 * Enhanced with model chooser, prompt enhancer, and comprehensive metadata display
 *
 * Models are fetched dynamically from API discovery endpoints:
 * - /api/imagegeneration/providers
 * - /api/videogeneration/providers
 * - /api/prompt/agents
 */

import { useCallback, useMemo, useState } from 'react';
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
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
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
  AutoAwesome as EnhanceIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as TipIcon,
  Code as ModelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, NodeParameter, Port, NodeType } from '@/models/canvas';
import { getNodeDefinition, nodeCategories } from '@/config/nodeDefinitions';
import { hoverIconButton, focusRing, timing, easing } from '@/styles/microInteractions';
import { brandColors } from '@/theme';
import { useModelDiscovery, type DiscoveredModel } from '@/hooks/useModelDiscovery';

// ===== Model Option Type =====
interface ModelOption {
  value: string;
  label: string;
  description: string;
  tier?: 'flagship' | 'production' | 'creative' | 'fast';
  cost?: string;
  hasAudio?: boolean;
  bestFor?: string;
}

// Convert DiscoveredModel to ModelOption for UI
const toModelOption = (model: DiscoveredModel): ModelOption => ({
  value: model.id,
  label: model.name,
  description: model.description || '',
  tier: model.tier,
  cost: model.cost,
  hasAudio: model.hasAudio,
  bestFor: model.bestFor,
});

// Model tier colors for UI badges
export const MODEL_TIER_COLORS = {
  flagship: '#FFD700',   // Gold - premium flagship models
  production: '#26CABF', // Teal Pulse - production-ready
  creative: '#85E7AE',   // Mint Glow - creative/experimental
  fast: '#FC7D21',       // Sunset Orange - speed-optimized
} as const;

// ===== Prompt Enhancement Agents =====
const PROMPT_AGENTS = [
  { id: 'muse', name: 'Muse', description: 'Expands ideas with creative flourishes', icon: '✨' },
  { id: 'curator', name: 'Curator', description: 'Adds technical precision and detail', icon: '🎯' },
  { id: 'architect', name: 'Architect', description: 'Structures prompts for best results', icon: '📐' },
  { id: 'heritage', name: 'Heritage Guide', description: 'Adds cultural and historical context', icon: '🌍' },
  { id: 'critic', name: 'Critic', description: 'Refines and improves clarity', icon: '🔍' },
];

// ===== Types =====

interface SelectedNode {
  id: string;
  data: CanvasNodeData;
}

interface NodeInspectorProps {
  node: SelectedNode | null;
  onParameterChange?: (nodeId: string, paramId: string, value: unknown) => void;
  onModelChange?: (nodeId: string, model: string) => void;
  onPromptEnhance?: (nodeId: string, prompt: string, agentId: string) => Promise<string>;
  onExecute?: (nodeId: string) => void;
  onStop?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onClose?: () => void;
  width?: number;
}

// Helper to check if node category supports model selection
const isGenerationCategory = (category: string): category is 'imageGen' | 'videoGen' | 'threeD' => {
  return ['imageGen', 'videoGen', 'threeD'].includes(category);
};

// Helper to check if node uses LLM model (for text-based nodes)
const isLlmNode = (nodeType: NodeType): boolean => {
  const def = getNodeDefinition(nodeType);
  if (!def?.aiModel) return false;
  // LLM models don't start with 'fal-ai/' and aren't multi-provider
  const aiModel = def.aiModel;
  return !aiModel.startsWith('fal-ai/') && aiModel !== 'multi-provider';
};

// Get model category for a node
const getModelCategory = (node: SelectedNode): 'imageGen' | 'videoGen' | 'threeD' | 'llm' | null => {
  if (isGenerationCategory(node.data.category)) {
    return node.data.category as 'imageGen' | 'videoGen' | 'threeD';
  }
  if (isLlmNode(node.data.nodeType)) {
    return 'llm';
  }
  return null;
};

// Helper to check if node has a prompt parameter
const hasPromptParameter = (nodeType: NodeType): boolean => {
  const def = getNodeDefinition(nodeType);
  return def?.parameters.some(p => p.id === 'prompt') ||
         def?.inputs.some(i => i.type === 'text') || false;
};

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
  onModelChange,
  onPromptEnhance,
  onExecute,
  onStop,
  onDelete,
  onDuplicate,
  onClose,
  width = 320,
}: NodeInspectorProps) {
  // Local state for prompt enhancement
  const [selectedAgent, setSelectedAgent] = useState<string>('muse');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [showEnhancedPrompt, setShowEnhancedPrompt] = useState(false);
  const [metadataExpanded, setMetadataExpanded] = useState(true);

  // Fetch models from API discovery endpoints
  const {
    imageModels,
    videoModels,
    llmModels,
    threeDModels,
    isLoading: modelsLoading,
    error: modelsError,
    refresh: refreshModels,
  } = useModelDiscovery();

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

  // Check if this node supports model selection
  const supportsModelSelection = useMemo(() => {
    if (!node) return false;
    const category = getModelCategory(node);
    return category !== null && definition?.aiModel;
  }, [node, definition]);

  // Get the model category (imageGen, videoGen, threeD, or llm)
  const modelCategory = useMemo(() => {
    if (!node) return null;
    return getModelCategory(node);
  }, [node]);

  // Get available models for this node's category (from API discovery)
  const availableModels = useMemo((): ModelOption[] => {
    if (!node || !supportsModelSelection || !modelCategory) return [];

    // Map discovered models to ModelOptions based on category
    let models: DiscoveredModel[] = [];
    switch (modelCategory) {
      case 'imageGen':
        models = imageModels;
        break;
      case 'videoGen':
        models = videoModels;
        break;
      case 'llm':
        models = llmModels;
        break;
      case 'threeD':
        models = threeDModels;
        break;
    }

    return models.map(toModelOption);
  }, [node, supportsModelSelection, modelCategory, imageModels, videoModels, llmModels, threeDModels]);

  // Check if node has prompt capability
  const supportsPromptEnhancement = useMemo(() => {
    if (!node) return false;
    return hasPromptParameter(node.data.nodeType);
  }, [node]);

  // Get current prompt value
  const currentPrompt = useMemo(() => {
    if (!node) return '';
    return (node.data.parameters?.prompt as string) || '';
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

  // Handle model change
  const handleModelChange = useCallback(
    (newModel: string) => {
      if (node && onModelChange) {
        onModelChange(node.id, newModel);
      }
    },
    [node, onModelChange]
  );

  // Handle prompt enhancement
  const handleEnhancePrompt = useCallback(async () => {
    if (!node || !currentPrompt || !onPromptEnhance) return;

    setIsEnhancing(true);
    try {
      const enhanced = await onPromptEnhance(node.id, currentPrompt, selectedAgent);
      setEnhancedPrompt(enhanced);
      setShowEnhancedPrompt(true);
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [node, currentPrompt, selectedAgent, onPromptEnhance]);

  // Apply enhanced prompt
  const handleApplyEnhancedPrompt = useCallback(() => {
    if (enhancedPrompt) {
      handleParamChange('prompt', enhancedPrompt);
      setShowEnhancedPrompt(false);
      setEnhancedPrompt('');
    }
  }, [enhancedPrompt, handleParamChange]);

  // File upload handling
  const handleFileUpload = useCallback((paramId: string, file: File) => {
    // Convert file to base64 data URL for preview and storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      handleParamChange(paramId, dataUrl);
      // Also store file metadata
      handleParamChange(`${paramId}_filename`, file.name);
      handleParamChange(`${paramId}_type`, file.type);
    };
    reader.readAsDataURL(file);
  }, [handleParamChange]);

  // Create hidden file input ref
  const fileInputRef = useCallback((paramId: string) => {
    return `file-input-${paramId}`;
  }, []);

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
        const fileValue = currentValue as string;
        const isDataUrl = fileValue?.startsWith('data:');
        const isHttpUrl = fileValue?.startsWith('http://') || fileValue?.startsWith('https://');
        const hasValue = fileValue && (isDataUrl || isHttpUrl);
        const fileName = (node?.data.parameters[`${param.id}_filename`] as string) || 'Uploaded file';

        return (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {param.name}
            </Typography>

            {/* Image preview if we have a value */}
            {hasValue && (
              <Box sx={{ mb: 1.5, position: 'relative' }}>
                <Box
                  component="img"
                  src={fileValue}
                  alt={fileName}
                  sx={{
                    width: '100%',
                    maxHeight: 150,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                  onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleParamChange(param.id, '')}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14, color: 'white' }} />
                </IconButton>
                {isDataUrl && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {fileName}
                  </Typography>
                )}
              </Box>
            )}

            {/* Upload button with hidden file input */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <input
                type="file"
                id={fileInputRef(param.id)}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(param.id, file);
                  }
                  // Reset input so same file can be selected again
                  e.target.value = '';
                }}
              />
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  const input = document.getElementById(fileInputRef(param.id)) as HTMLInputElement;
                  input?.click();
                }}
                startIcon={<InputIcon />}
                sx={{ flex: 1 }}
              >
                {hasValue ? 'Replace' : 'Upload'}
              </Button>
              {hasValue && (
                <Tooltip title="Copy URL">
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard.writeText(fileValue)}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* URL input for internet-hosted images */}
            <TextField
              fullWidth
              size="small"
              placeholder="Or paste image URL..."
              value={isHttpUrl ? fileValue : ''}
              onChange={(e) => {
                const url = e.target.value.trim();
                if (url) {
                  handleParamChange(param.id, url);
                  // Clear file metadata since this is a URL
                  handleParamChange(`${param.id}_filename`, '');
                  handleParamChange(`${param.id}_type`, '');
                }
              }}
              slotProps={{
                input: {
                  sx: { fontSize: '0.8rem' },
                  startAdornment: (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                      URL:
                    </Typography>
                  ),
                },
              }}
            />
          </Box>
        );

      // Image type - same as file but specifically for images
      case 'image': {
        const imgValue = currentValue as string;
        const imgIsDataUrl = imgValue?.startsWith('data:');
        const imgIsHttpUrl = imgValue?.startsWith('http://') || imgValue?.startsWith('https://');
        const imgHasValue = imgValue && (imgIsDataUrl || imgIsHttpUrl);
        const imgFileName = (node?.data.parameters[`${param.id}_filename`] as string) || 'Image';

        return (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {param.name}
            </Typography>

            {/* Image preview */}
            {imgHasValue && (
              <Box sx={{ mb: 1.5, position: 'relative' }}>
                <Box
                  component="img"
                  src={imgValue}
                  alt={imgFileName}
                  sx={{
                    width: '100%',
                    maxHeight: 150,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: `2px solid ${brandColors.tealPulse}`,
                    bgcolor: 'background.paper',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleParamChange(param.id, '')}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14, color: 'white' }} />
                </IconButton>
                {imgIsDataUrl && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {imgFileName}
                  </Typography>
                )}
              </Box>
            )}

            {/* Upload button */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <input
                type="file"
                id={fileInputRef(param.id)}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(param.id, file);
                  }
                  e.target.value = '';
                }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const input = document.getElementById(fileInputRef(param.id)) as HTMLInputElement;
                  input?.click();
                }}
                startIcon={<InputIcon />}
                sx={{ flex: 1 }}
              >
                {imgHasValue ? 'Replace Image' : 'Upload Image'}
              </Button>
              {imgHasValue && (
                <Tooltip title="Copy URL">
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard.writeText(imgValue)}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* URL input */}
            <TextField
              fullWidth
              size="small"
              placeholder="Or paste image URL..."
              value={imgIsHttpUrl ? imgValue : ''}
              onChange={(e) => {
                const url = e.target.value.trim();
                if (url) {
                  handleParamChange(param.id, url);
                  handleParamChange(`${param.id}_filename`, '');
                  handleParamChange(`${param.id}_type`, '');
                }
              }}
              slotProps={{
                input: {
                  sx: { fontSize: '0.8rem' },
                  startAdornment: (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                      URL:
                    </Typography>
                  ),
                },
              }}
            />
          </Box>
        );
      }

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

  // Use definition inputs/outputs as fallback if node data doesn't have them
  const displayInputs = (nodeData.inputs && nodeData.inputs.length > 0) ? nodeData.inputs : (definition?.inputs || []);
  const displayOutputs = (nodeData.outputs && nodeData.outputs.length > 0) ? nodeData.outputs : (definition?.outputs || []);

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

        {/* Action buttons - with micro-interactions */}
        <Stack direction="row" spacing={0.5}>
          {nodeData.status === 'running' ? (
            <Tooltip title="Stop Execution">
              <IconButton
                size="small"
                onClick={() => onStop?.(node.id)}
                sx={{
                  color: brandColors.coralSpark,
                  transition: `all ${timing.fast}ms ${easing.smooth}`,
                  ...focusRing,
                  '&:hover': {
                    backgroundColor: alpha(brandColors.coralSpark, 0.15),
                    transform: 'scale(1.1)',
                  },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Execute Node">
              <IconButton
                size="small"
                onClick={() => onExecute?.(node.id)}
                sx={{
                  color: brandColors.tealPulse,
                  transition: `all ${timing.fast}ms ${easing.smooth}`,
                  ...focusRing,
                  '&:hover': {
                    backgroundColor: alpha(brandColors.tealPulse, 0.15),
                    transform: 'scale(1.1)',
                  },
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <PlayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Duplicate">
            <IconButton
              size="small"
              onClick={() => onDuplicate?.(node.id)}
              sx={{
                ...focusRing,
                ...hoverIconButton,
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => onDelete?.(node.id)}
              sx={{
                color: brandColors.coralSpark,
                transition: `all ${timing.fast}ms ${easing.smooth}`,
                ...focusRing,
                '&:hover': {
                  backgroundColor: alpha(brandColors.coralSpark, 0.15),
                },
              }}
            >
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
        {/* Enhanced Node Info Section */}
        {definition && (
          <Accordion
            expanded={metadataExpanded}
            onChange={() => setMetadataExpanded(!metadataExpanded)}
            sx={{ mb: 2, '&:before': { display: 'none' } }}
            elevation={0}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: alpha(categoryColor, 0.08),
                borderRadius: 1,
                minHeight: 'auto',
                '& .MuiAccordionSummary-content': { my: 1 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon fontSize="small" sx={{ color: categoryColor }} />
                <Typography variant="subtitle2">
                  {definition.displayName || definition.label}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 1.5 }}>
              {/* Description */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {definition.description}
              </Typography>

              {/* Quick Help Tip */}
              {definition.quickHelp && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1,
                    mb: 1.5,
                    bgcolor: alpha(categoryColor, 0.04),
                    borderColor: alpha(categoryColor, 0.2),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <TipIcon fontSize="small" sx={{ color: categoryColor, mt: 0.25 }} />
                    <Typography variant="caption" color="text.secondary">
                      {definition.quickHelp}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Use Case Example */}
              {definition.useCase && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  <strong>Example:</strong> {definition.useCase}
                </Typography>
              )}

              {/* Node Type Badge */}
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                <Chip
                  label={nodeData.nodeType}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
                {definition.aiModel && (
                  <Tooltip title="Current AI Model">
                    <Chip
                      icon={<ModelIcon sx={{ fontSize: 14 }} />}
                      label={definition.aiModel.split('/').pop()}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Model Chooser Section - for generation nodes */}
        {supportsModelSelection && (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <ModelIcon fontSize="small" sx={{ color: categoryColor }} />
              <Typography variant="subtitle2">AI Model</Typography>
              {modelsLoading ? (
                <CircularProgress size={14} sx={{ color: categoryColor }} />
              ) : (
                <Tooltip title="Refresh models from API">
                  <IconButton
                    size="small"
                    onClick={refreshModels}
                    sx={{ p: 0.25, '&:hover': { bgcolor: alpha(categoryColor, 0.1) } }}
                  >
                    <RefreshIcon sx={{ fontSize: 14, color: categoryColor }} />
                  </IconButton>
                </Tooltip>
              )}
              <Chip
                label={modelsLoading ? 'Loading...' : `${availableModels.length} models`}
                size="small"
                sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha(categoryColor, 0.1), color: categoryColor }}
              />
            </Box>
            {modelsError && (
              <Alert severity="warning" sx={{ mb: 1, py: 0 }}>
                <Typography variant="caption">{modelsError}</Typography>
              </Alert>
            )}
            <FormControl fullWidth size="small" disabled={modelsLoading || availableModels.length === 0}>
              <Select
                value={(nodeData.parameters?.selectedModel as string) || definition?.aiModel || ''}
                onChange={(e) => handleModelChange(e.target.value)}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    sx: { maxHeight: 400 }
                  }
                }}
              >
                {availableModels.length === 0 && !modelsLoading && (
                  <MenuItem value="" disabled>
                    <Typography variant="caption" color="text.secondary">
                      No models available - check API connection
                    </Typography>
                  </MenuItem>
                )}
                {availableModels.map((model) => (
                  <MenuItem key={model.value} value={model.value} sx={{ py: 1 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>{model.label}</Typography>
                        {/* Tier Badge */}
                        {model.tier && (
                          <Chip
                            label={model.tier}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              bgcolor: MODEL_TIER_COLORS[model.tier as keyof typeof MODEL_TIER_COLORS],
                              color: model.tier === 'flagship' ? '#000' : '#fff',
                            }}
                          />
                        )}
                        {/* Audio Badge */}
                        {model.hasAudio && (
                          <Chip
                            label="Audio"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.6rem',
                              bgcolor: '#ec4899',
                              color: '#fff',
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {model.description}
                      </Typography>
                      {/* Cost Badge */}
                      {model.cost && (
                        <Typography variant="caption" sx={{ color: '#85E7AE', fontWeight: 500 }}>
                          {model.cost}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Current Selection Info */}
            {(() => {
              const currentModel = availableModels.find(
                m => m.value === ((nodeData.parameters?.selectedModel as string) || definition?.aiModel)
              );
              return currentModel && (
                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {currentModel.tier && (
                    <Chip
                      label={currentModel.tier}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        bgcolor: MODEL_TIER_COLORS[currentModel.tier as keyof typeof MODEL_TIER_COLORS],
                        color: currentModel.tier === 'flagship' ? '#000' : '#fff',
                      }}
                    />
                  )}
                  {currentModel.hasAudio && (
                    <Chip
                      label="Native Audio"
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ec4899', color: '#fff' }}
                    />
                  )}
                  {currentModel.cost && (
                    <Chip
                      label={currentModel.cost}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem', borderColor: '#85E7AE', color: '#85E7AE' }}
                    />
                  )}
                  {currentModel.bestFor && (
                    <Chip
                      label={`Best for: ${currentModel.bestFor}`}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              );
            })()}
          </Paper>
        )}

        {/* Prompt Enhancer Section */}
        {supportsPromptEnhancement && onPromptEnhance && (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <EnhanceIcon fontSize="small" sx={{ color: categoryColor }} />
              <Typography variant="subtitle2">Prompt Enhancer</Typography>
              <Tooltip title="Use AI agents to improve your prompt">
                <InfoIcon fontSize="small" sx={{ color: 'text.disabled', ml: 'auto' }} />
              </Tooltip>
            </Box>

            {/* Agent Selection */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Select Enhancement Agent
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {PROMPT_AGENTS.map((agent) => (
                  <Tooltip key={agent.id} title={agent.description}>
                    <Chip
                      icon={<span style={{ fontSize: 14 }}>{agent.icon}</span>}
                      label={agent.name}
                      size="small"
                      variant={selectedAgent === agent.id ? 'filled' : 'outlined'}
                      onClick={() => setSelectedAgent(agent.id)}
                      sx={{
                        bgcolor: selectedAgent === agent.id ? alpha(categoryColor, 0.2) : undefined,
                        borderColor: selectedAgent === agent.id ? categoryColor : undefined,
                        '&:hover': { bgcolor: alpha(categoryColor, 0.1) },
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            </Box>

            {/* Enhance Button */}
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={isEnhancing ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <EnhanceIcon />}
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !currentPrompt}
              sx={{
                borderColor: categoryColor,
                color: categoryColor,
                '&:hover': { borderColor: categoryColor, bgcolor: alpha(categoryColor, 0.08) },
              }}
            >
              {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
            </Button>

            {/* Enhanced Prompt Preview */}
            <Collapse in={showEnhancedPrompt}>
              <Paper
                variant="outlined"
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  bgcolor: alpha(categoryColor, 0.04),
                  borderColor: alpha(categoryColor, 0.3),
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Enhanced Prompt:
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  {enhancedPrompt}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleApplyEnhancedPrompt}
                    sx={{ bgcolor: categoryColor }}
                  >
                    Apply
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowEnhancedPrompt(false)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Paper>
            </Collapse>
          </Paper>
        )}

        {/* Prominent Image Preview for Input Nodes */}
        {nodeData.category === 'input' && (() => {
          // Check for image in parameters
          const imageParams = ['file', 'image', 'imageUrl', 'url', 'referenceImage'];
          let imageUrl: string | null = null;
          for (const paramId of imageParams) {
            const value = nodeData.parameters?.[paramId];
            if (value && typeof value === 'string' &&
                (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image'))) {
              imageUrl = value;
              break;
            }
          }
          if (!imageUrl) return null;

          return (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: alpha(brandColors.tealPulse, 0.04),
                borderColor: brandColors.tealPulse,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: brandColors.mintGlow,
                    animation: 'pulse 2s infinite',
                  }}
                />
                <Typography variant="subtitle2" sx={{ color: brandColors.tealPulse }}>
                  Image Loaded
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: `2px solid ${brandColors.tealPulse}`,
                  boxShadow: `0 0 16px ${alpha(brandColors.tealPulse, 0.25)}`,
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt="Input image"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    display: 'block',
                    bgcolor: 'background.paper',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => navigator.clipboard.writeText(imageUrl!)}
                  sx={{ flex: 1, fontSize: '0.7rem' }}
                >
                  Copy URL
                </Button>
                <Tooltip title="Open in new tab">
                  <IconButton
                    size="small"
                    onClick={() => window.open(imageUrl!, '_blank')}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <OutputIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          );
        })()}

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
        {displayInputs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No inputs
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {displayInputs.map((input) => renderPort(input, 'input'))}
          </Stack>
        )}

        {/* Outputs */}
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <OutputIcon fontSize="small" />
          Outputs
        </Typography>
        {displayOutputs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No outputs
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {displayOutputs.map((output) => renderPort(output, 'output'))}
          </Stack>
        )}

        {/* Result preview */}
        {nodeData.result && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SuccessIcon sx={{ color: brandColors.mintGlow, fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ color: brandColors.mintGlow }}>
                Result Ready ✨
              </Typography>
            </Box>

            {/* Text result (enhanced prompts, etc.) */}
            {nodeData.result.type === 'text' && nodeData.result.data && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: alpha(brandColors.mintGlow, 0.04),
                  borderColor: alpha(brandColors.mintGlow, 0.3),
                  borderRadius: 2,
                  animation: 'fadeIn 0.5s ease-out',
                }}
              >
                {/* Header with copy button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {(nodeData.result.data as { outputType?: string })?.outputType === 'image'
                      ? '🎨 Enhanced Image Prompt'
                      : '📝 Generated Text'}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const text = typeof nodeData.result?.data === 'string'
                          ? nodeData.result.data
                          : (nodeData.result?.data as { text?: string; enhancedPrompt?: string })?.text ||
                            (nodeData.result?.data as { text?: string; enhancedPrompt?: string })?.enhancedPrompt ||
                            '';
                        navigator.clipboard.writeText(text);
                      }}
                      sx={{
                        color: brandColors.tealPulse,
                        '&:hover': { bgcolor: alpha(brandColors.tealPulse, 0.1) },
                      }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Original text (if available) */}
                {(nodeData.result.data as { originalText?: string })?.originalText && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                      Original:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontStyle: 'italic',
                        fontSize: '0.8rem',
                      }}
                    >
                      "{(nodeData.result.data as { originalText?: string }).originalText}"
                    </Typography>
                  </Box>
                )}

                {/* Enhanced/Result text */}
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                    {(nodeData.result.data as { originalText?: string })?.originalText ? 'Enhanced:' : 'Result:'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {typeof nodeData.result.data === 'string'
                      ? nodeData.result.data
                      : (nodeData.result.data as { text?: string; enhancedPrompt?: string })?.text ||
                        (nodeData.result.data as { text?: string; enhancedPrompt?: string })?.enhancedPrompt ||
                        JSON.stringify(nodeData.result.data, null, 2)}
                  </Typography>
                </Box>

                {/* Quick action to use the enhanced prompt */}
                {((nodeData.result.data as { enhancedPrompt?: string })?.enhancedPrompt ||
                  (nodeData.result.data as { text?: string })?.text) && (
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EnhanceIcon />}
                      onClick={() => {
                        const text = (nodeData.result?.data as { text?: string; enhancedPrompt?: string })?.text ||
                          (nodeData.result?.data as { text?: string; enhancedPrompt?: string })?.enhancedPrompt || '';
                        navigator.clipboard.writeText(text);
                      }}
                      sx={{
                        bgcolor: brandColors.tealPulse,
                        '&:hover': { bgcolor: alpha(brandColors.tealPulse, 0.85) },
                        textTransform: 'none',
                        fontSize: '0.75rem',
                      }}
                    >
                      Copy Enhanced
                    </Button>
                  </Box>
                )}
              </Paper>
            )}

            {/* Image result */}
            {nodeData.result.url && nodeData.result.type !== 'text' && (
              <Box
                component="img"
                src={nodeData.result.url}
                alt="Result"
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  border: `2px solid ${brandColors.mintGlow}`,
                  boxShadow: `0 0 12px ${alpha(brandColors.mintGlow, 0.3)}`,
                }}
              />
            )}
            {nodeData.result.urls && nodeData.result.urls.length > 0 && nodeData.result.type !== 'text' && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
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
                      border: `1px solid ${brandColors.mintGlow}`,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.05)' },
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

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes successPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(133, 231, 174, 0.4);
          }
          50% {
            box-shadow: 0 0 12px 4px rgba(133, 231, 174, 0.2);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
    </Box>
  );
}

export default NodeInspector;
