/**
 * Node Inspector - Right sidebar for viewing and editing node properties
 * Supports dynamic parameter editing based on node definition
 * Enhanced with model chooser, prompt enhancer, and comprehensive metadata display
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

// ===== AI Model Options =====
// Available models for generation nodes
const AI_MODEL_OPTIONS = {
  imageGen: [
    { value: 'fal-ai/flux-pro/v1.1', label: 'FLUX.2 Pro', description: 'Highest quality, commercial-ready' },
    { value: 'fal-ai/flux/dev', label: 'FLUX.2 Dev', description: 'LoRA support, custom styles' },
    { value: 'fal-ai/nano-banana-pro', label: 'Nano Banana Pro', description: 'Multi-face generation' },
    { value: 'fal-ai/flux-kontext/pro', label: 'FLUX Kontext', description: 'Image editing' },
  ],
  videoGen: [
    { value: 'fal-ai/kling-video/v2.6/pro/text-to-video', label: 'Kling 2.6 T2V', description: 'Text to video' },
    { value: 'fal-ai/kling-video/v2.6/pro/image-to-video', label: 'Kling 2.6 I2V', description: 'Image animation' },
    { value: 'fal-ai/veo3', label: 'VEO 3.1', description: 'Cinematic quality' },
    { value: 'fal-ai/kling-video/v2/avatar', label: 'Kling Avatar', description: 'Talking head' },
  ],
  threeD: [
    { value: 'fal-ai/meshy', label: 'Meshy 6', description: 'High-detail 3D models' },
    { value: 'fal-ai/tripo', label: 'Tripo v2.5', description: 'Fast game-ready 3D' },
  ],
};

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
    return isGenerationCategory(node.data.category) && definition?.aiModel;
  }, [node, definition]);

  // Get available models for this node's category
  const availableModels = useMemo(() => {
    if (!node || !supportsModelSelection) return [];
    const category = node.data.category as 'imageGen' | 'videoGen' | 'threeD';
    return AI_MODEL_OPTIONS[category] || [];
  }, [node, supportsModelSelection]);

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
        {supportsModelSelection && availableModels.length > 0 && (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ModelIcon fontSize="small" sx={{ color: categoryColor }} />
              <Typography variant="subtitle2">AI Model</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                value={definition?.aiModel || ''}
                onChange={(e) => handleModelChange(e.target.value)}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 0.75,
                  },
                }}
              >
                {availableModels.map((model) => (
                  <MenuItem key={model.value} value={model.value}>
                    <Box>
                      <Typography variant="body2">{model.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
