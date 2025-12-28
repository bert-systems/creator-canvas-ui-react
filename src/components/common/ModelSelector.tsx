/**
 * ModelSelector.tsx - AI Model Selection Component
 * Allows users to select image, LLM, and video models for API requests
 * Supports both preset modes and individual model selection
 */

import { memo, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Collapse,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Balance as BalanceIcon,
  AutoAwesome as QualityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Image as ImageIcon,
  SmartToy as LlmIcon,
  Videocam as VideoIcon,
  Star as StarIcon,
  AttachMoney as CostIcon,
} from '@mui/icons-material';
import { darkNeutrals, brandColors, creativeCardTokens } from '@/theme';
import type { ModelInfo, ModelPreset } from '@/config/modelConfig';
import {
  modelPresets,
  imageModels,
  llmModels,
  videoModels,
  getPresetById,
  getDefaultPreset,
  getQualityStars,
  getSpeedBars,
  getCostDollars,
} from '@/config/modelConfig';

// ==================== TYPES ====================

export interface ModelSelection {
  imageModel?: string;
  llmModel?: string;
  videoModel?: string;
}

export interface ModelSelectorProps {
  /** Current model selection */
  value: ModelSelection;
  /** Callback when selection changes */
  onChange: (selection: ModelSelection) => void;
  /** Which model types to show */
  showModels?: {
    image?: boolean;
    llm?: boolean;
    video?: boolean;
  };
  /** Start in advanced mode */
  defaultAdvanced?: boolean;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Disable the selector */
  disabled?: boolean;
}

// ==================== SUB-COMPONENTS ====================

interface PresetButtonProps {
  preset: ModelPreset;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const PresetButton = memo(function PresetButton({
  preset,
  selected,
  onClick,
  disabled,
}: PresetButtonProps) {
  const getIcon = () => {
    switch (preset.icon) {
      case 'speed': return <SpeedIcon />;
      case 'balance': return <BalanceIcon />;
      case 'quality': return <QualityIcon />;
      default: return <BalanceIcon />;
    }
  };

  return (
    <ToggleButton
      value={preset.id}
      selected={selected}
      onClick={onClick}
      disabled={disabled}
      sx={{
        flex: 1,
        py: 1.5,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        border: `1px solid ${darkNeutrals.border}`,
        bgcolor: selected ? `${brandColors.tealPulse}20` : darkNeutrals.surface1,
        color: selected ? brandColors.tealPulse : darkNeutrals.textSecondary,
        '&:hover': {
          bgcolor: selected ? `${brandColors.tealPulse}30` : darkNeutrals.surface2,
        },
        '&.Mui-selected': {
          borderColor: brandColors.tealPulse,
        },
        borderRadius: `${creativeCardTokens.radius.control}px !important`,
      }}
    >
      {getIcon()}
      <Typography variant="caption" fontWeight={600}>
        {preset.name}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>
        {preset.description}
      </Typography>
    </ToggleButton>
  );
});

interface ModelIndicatorsProps {
  model: ModelInfo;
}

const ModelIndicators = memo(function ModelIndicators({ model }: ModelIndicatorsProps) {
  const qualityStars = getQualityStars(model.quality);
  const speedBars = getSpeedBars(model.speed);
  const costDollars = getCostDollars(model.cost);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
      <Tooltip title={`Quality: ${model.quality}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {[1, 2, 3].map(i => (
            <StarIcon
              key={i}
              sx={{
                fontSize: 10,
                color: i <= qualityStars ? brandColors.tealPulse : darkNeutrals.border,
              }}
            />
          ))}
        </Box>
      </Tooltip>
      <Tooltip title={`Speed: ${model.speed}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {[1, 2, 3].map(i => (
            <SpeedIcon
              key={i}
              sx={{
                fontSize: 10,
                color: i <= speedBars ? brandColors.mintGlow : darkNeutrals.border,
              }}
            />
          ))}
        </Box>
      </Tooltip>
      <Tooltip title={`Cost: ${model.cost}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {[1, 2, 3].map(i => (
            <CostIcon
              key={i}
              sx={{
                fontSize: 10,
                color: i <= costDollars ? brandColors.sunsetOrange : darkNeutrals.border,
              }}
            />
          ))}
        </Box>
      </Tooltip>
    </Box>
  );
});

interface ModelSelectProps {
  label: string;
  icon: React.ReactNode;
  models: ModelInfo[];
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const ModelSelect = memo(function ModelSelect({
  label,
  icon,
  models,
  value,
  onChange,
  disabled,
  compact,
}: ModelSelectProps) {
  const selectedModel = models.find(m => m.id === value);

  return (
    <Box sx={{ mb: compact ? 1 : 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ color: darkNeutrals.textSecondary, display: 'flex' }}>
          {icon}
        </Box>
        <Typography variant="caption" color="textSecondary">
          {label}
        </Typography>
      </Box>
      <FormControl fullWidth size="small" disabled={disabled}>
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          displayEmpty
          sx={{
            bgcolor: darkNeutrals.surface1,
            '& .MuiSelect-select': {
              py: compact ? 0.75 : 1,
            },
          }}
          renderValue={(selected) => {
            if (!selected) {
              return <Typography color="textSecondary">Default</Typography>;
            }
            const model = models.find(m => m.id === selected);
            return model ? model.name : selected;
          }}
        >
          <MenuItem value="">
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography>Default</Typography>
              <Typography variant="caption" color="textSecondary">
                Use system default model
              </Typography>
            </Box>
          </MenuItem>
          {models.map(model => (
            <MenuItem key={model.id} value={model.id}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>{model.name}</Typography>
                  <Chip
                    label={model.provider}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      bgcolor: darkNeutrals.surface2,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ maxWidth: '60%' }}>
                    {model.description}
                  </Typography>
                  <ModelIndicators model={model} />
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedModel && !compact && (
        <Box sx={{ mt: 0.5 }}>
          <ModelIndicators model={selectedModel} />
        </Box>
      )}
    </Box>
  );
});

// ==================== MAIN COMPONENT ====================

export const ModelSelector = memo(function ModelSelector({
  value,
  onChange,
  showModels = { image: true, llm: true, video: false },
  defaultAdvanced = false,
  compact = false,
  disabled = false,
}: ModelSelectorProps) {
  const [isAdvanced, setIsAdvanced] = useState(defaultAdvanced);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(() => {
    // Check if current selection matches a preset
    const defaultPreset = getDefaultPreset();
    if (!value.imageModel && !value.llmModel && !value.videoModel) {
      return defaultPreset.id;
    }
    const matching = modelPresets.find(
      p =>
        p.imageModel === value.imageModel &&
        p.llmModel === value.llmModel &&
        p.videoModel === value.videoModel
    );
    return matching?.id || null;
  });

  const handlePresetChange = useCallback((presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) {
      setSelectedPreset(presetId);
      onChange({
        imageModel: showModels.image ? preset.imageModel : undefined,
        llmModel: showModels.llm ? preset.llmModel : undefined,
        videoModel: showModels.video ? preset.videoModel : undefined,
      });
    }
  }, [onChange, showModels]);

  const handleModelChange = useCallback((category: 'image' | 'llm' | 'video', modelId: string) => {
    const newValue = { ...value };
    if (category === 'image') {
      newValue.imageModel = modelId || undefined;
    } else if (category === 'llm') {
      newValue.llmModel = modelId || undefined;
    } else if (category === 'video') {
      newValue.videoModel = modelId || undefined;
    }
    setSelectedPreset(null); // Clear preset when manually selecting
    onChange(newValue);
  }, [value, onChange]);

  const toggleAdvanced = useCallback(() => {
    setIsAdvanced(prev => !prev);
  }, []);

  // Determine current preset display
  const currentPresetLabel = useMemo(() => {
    if (selectedPreset) {
      const preset = getPresetById(selectedPreset);
      return preset?.name || 'Custom';
    }
    return 'Custom';
  }, [selectedPreset]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 1.5 : 2,
        bgcolor: darkNeutrals.surface2,
        borderRadius: `${creativeCardTokens.radius.control}px`,
        border: `1px solid ${darkNeutrals.border}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: isAdvanced ? 2 : 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" fontWeight={600} color="textSecondary">
            AI Models
          </Typography>
          {!isAdvanced && (
            <Chip
              label={currentPresetLabel}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: selectedPreset ? `${brandColors.tealPulse}20` : darkNeutrals.surface1,
                color: selectedPreset ? brandColors.tealPulse : darkNeutrals.textSecondary,
              }}
            />
          )}
        </Box>
        <Tooltip title={isAdvanced ? 'Use presets' : 'Advanced settings'}>
          <IconButton size="small" onClick={toggleAdvanced} disabled={disabled}>
            {isAdvanced ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Preset Mode */}
      {!isAdvanced && (
        <ToggleButtonGroup
          exclusive
          value={selectedPreset}
          sx={{
            display: 'flex',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              '&:not(:first-of-type)': {
                borderRadius: `${creativeCardTokens.radius.control}px`,
                ml: 0,
              },
              '&:first-of-type': {
                borderRadius: `${creativeCardTokens.radius.control}px`,
              },
            },
          }}
        >
          {modelPresets.map(preset => (
            <PresetButton
              key={preset.id}
              preset={preset}
              selected={selectedPreset === preset.id}
              onClick={() => handlePresetChange(preset.id)}
              disabled={disabled}
            />
          ))}
        </ToggleButtonGroup>
      )}

      {/* Advanced Mode */}
      <Collapse in={isAdvanced}>
        <Box>
          {showModels.image && (
            <ModelSelect
              label="Image Generation"
              icon={<ImageIcon sx={{ fontSize: 16 }} />}
              models={imageModels}
              value={value.imageModel}
              onChange={(v) => handleModelChange('image', v)}
              disabled={disabled}
              compact={compact}
            />
          )}
          {showModels.llm && (
            <ModelSelect
              label="Text Generation (LLM)"
              icon={<LlmIcon sx={{ fontSize: 16 }} />}
              models={llmModels}
              value={value.llmModel}
              onChange={(v) => handleModelChange('llm', v)}
              disabled={disabled}
              compact={compact}
            />
          )}
          {showModels.video && (
            <ModelSelect
              label="Video Generation"
              icon={<VideoIcon sx={{ fontSize: 16 }} />}
              models={videoModels}
              value={value.videoModel}
              onChange={(v) => handleModelChange('video', v)}
              disabled={disabled}
              compact={compact}
            />
          )}
        </Box>
      </Collapse>
    </Paper>
  );
});

export default ModelSelector;
