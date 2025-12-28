/**
 * ModelSettingsPanel.tsx - Model Settings Panel for Node Inspector
 * Provides a collapsible panel for AI model configuration in nodes
 * Can be embedded in NodeInspector or used standalone
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { darkNeutrals, brandColors, creativeCardTokens } from '@/theme';
import { ModelSelector } from './ModelSelector';
import type { ModelSelection } from './ModelSelector';
import { getDefaultPreset } from '@/config/modelConfig';

// ==================== TYPES ====================

export interface ModelSettingsPanelProps {
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
  /** Whether to use custom models (advanced mode enabled) */
  useCustomModels?: boolean;
  /** Callback when custom models toggle changes */
  onUseCustomModelsChange?: (enabled: boolean) => void;
  /** Panel is expanded by default */
  defaultExpanded?: boolean;
  /** Disable the panel */
  disabled?: boolean;
  /** Show as a simple inline component without accordion */
  inline?: boolean;
}

// ==================== HELPER ====================

function getSelectionSummary(selection: ModelSelection): string {
  const parts: string[] = [];
  if (selection.imageModel) parts.push(`Image: ${selection.imageModel}`);
  if (selection.llmModel) parts.push(`LLM: ${selection.llmModel}`);
  if (selection.videoModel) parts.push(`Video: ${selection.videoModel}`);

  if (parts.length === 0) {
    const defaultPreset = getDefaultPreset();
    return `Using ${defaultPreset.name} preset`;
  }

  return parts.join(' | ');
}

// ==================== COMPONENT ====================

export const ModelSettingsPanel = memo(function ModelSettingsPanel({
  value,
  onChange,
  showModels = { image: true, llm: true, video: false },
  useCustomModels = false,
  onUseCustomModelsChange,
  defaultExpanded = false,
  disabled = false,
  inline = false,
}: ModelSettingsPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpandChange = useCallback((_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  }, []);

  const handleToggleCustomModels = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    if (onUseCustomModelsChange) {
      onUseCustomModelsChange(enabled);
    }
    // If disabling custom models, reset to defaults
    if (!enabled) {
      onChange({});
    }
  }, [onUseCustomModelsChange, onChange]);

  // Inline mode - just render the ModelSelector directly
  if (inline) {
    return (
      <Box>
        {onUseCustomModelsChange && (
          <FormControlLabel
            control={
              <Switch
                checked={useCustomModels}
                onChange={handleToggleCustomModels}
                size="small"
                disabled={disabled}
              />
            }
            label={
              <Typography variant="caption" color="textSecondary">
                Use custom models
              </Typography>
            }
            sx={{ mb: 1 }}
          />
        )}
        {(useCustomModels || !onUseCustomModelsChange) && (
          <ModelSelector
            value={value}
            onChange={onChange}
            showModels={showModels}
            defaultAdvanced={false}
            compact
            disabled={disabled}
          />
        )}
      </Box>
    );
  }

  // Accordion mode
  return (
    <Accordion
      expanded={expanded}
      onChange={handleExpandChange}
      disabled={disabled}
      sx={{
        bgcolor: darkNeutrals.surface1,
        border: `1px solid ${darkNeutrals.border}`,
        borderRadius: `${creativeCardTokens.radius.control}px !important`,
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          margin: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: darkNeutrals.textSecondary }} />}
        sx={{
          minHeight: 48,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 1,
          },
        }}
      >
        <TuneIcon sx={{ fontSize: 18, color: darkNeutrals.textSecondary }} />
        <Typography variant="body2" fontWeight={500}>
          AI Model Settings
        </Typography>
        {!expanded && (
          <Chip
            label={useCustomModels ? 'Custom' : 'Default'}
            size="small"
            sx={{
              ml: 'auto',
              mr: 1,
              height: 20,
              fontSize: '0.65rem',
              bgcolor: useCustomModels ? `${brandColors.tealPulse}20` : darkNeutrals.surface2,
              color: useCustomModels ? brandColors.tealPulse : darkNeutrals.textSecondary,
            }}
          />
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>
        {/* Toggle for custom models */}
        {onUseCustomModelsChange && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              pb: 2,
              borderBottom: `1px solid ${darkNeutrals.border}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useCustomModels}
                    onChange={handleToggleCustomModels}
                    size="small"
                    disabled={disabled}
                  />
                }
                label={
                  <Typography variant="body2">
                    Override default models
                  </Typography>
                }
                sx={{ m: 0 }}
              />
              <Tooltip title="When enabled, you can select specific AI models for this node instead of using system defaults">
                <InfoIcon sx={{ fontSize: 16, color: darkNeutrals.textTertiary }} />
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* Model Selector */}
        {(useCustomModels || !onUseCustomModelsChange) ? (
          <ModelSelector
            value={value}
            onChange={onChange}
            showModels={showModels}
            defaultAdvanced={false}
            disabled={disabled}
          />
        ) : (
          <Box
            sx={{
              p: 2,
              bgcolor: darkNeutrals.surface2,
              borderRadius: `${creativeCardTokens.radius.control}px`,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Using system default models
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
              Enable override to customize model selection
            </Typography>
          </Box>
        )}

        {/* Current selection summary */}
        {useCustomModels && (value.imageModel || value.llmModel || value.videoModel) && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: `${brandColors.tealPulse}10`,
              borderRadius: `${creativeCardTokens.radius.control}px`,
              border: `1px solid ${brandColors.tealPulse}30`,
            }}
          >
            <Typography variant="caption" color="textSecondary">
              Current selection:
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: brandColors.tealPulse }}>
              {getSelectionSummary(value)}
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
});

export default ModelSettingsPanel;
