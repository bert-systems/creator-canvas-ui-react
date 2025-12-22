/**
 * ParameterSlot Component
 *
 * Displays inline parameter controls within UnifiedNode.
 *
 * @module ParameterSlot
 */

import { memo, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import type { ParameterSlotConfig, DisplayMode } from '../../../models/unifiedNode';
import type { NodeParameter, NodeType } from '../../../models/canvas';
import { getNodeDefinition } from '../../../config/nodeDefinitions';

// ============================================================================
// PROPS
// ============================================================================

interface ParameterSlotProps {
  config: ParameterSlotConfig;
  parameters: Record<string, unknown>;
  nodeType: NodeType;
  displayMode: DisplayMode;
  onParameterChange?: (paramId: string, value: unknown) => void;
}

// ============================================================================
// PARAMETER RENDERER
// ============================================================================

interface ParameterFieldProps {
  param: NodeParameter;
  value: unknown;
  onChange?: (value: unknown) => void;
  compact?: boolean;
}

const ParameterField = memo<ParameterFieldProps>(({ param, value, onChange, compact }) => {
  const handleChange = (newValue: unknown) => {
    onChange?.(newValue);
  };

  // Text input
  if (param.type === 'text') {
    return (
      <TextField
        size="small"
        fullWidth
        placeholder={param.name}
        value={(value as string) || param.default || ''}
        onChange={(e) => handleChange(e.target.value)}
        variant="outlined"
        sx={{
          '& .MuiInputBase-input': {
            fontSize: compact ? '0.7rem' : '0.8rem',
            py: compact ? 0.5 : 1,
          },
        }}
      />
    );
  }

  // Number input
  if (param.type === 'number') {
    return (
      <TextField
        size="small"
        type="number"
        fullWidth
        placeholder={param.name}
        value={(value as number) ?? param.default ?? ''}
        onChange={(e) => handleChange(Number(e.target.value))}
        inputProps={{
          min: param.min,
          max: param.max,
          step: param.step,
        }}
        variant="outlined"
        sx={{
          '& .MuiInputBase-input': {
            fontSize: compact ? '0.7rem' : '0.8rem',
            py: compact ? 0.5 : 1,
          },
        }}
      />
    );
  }

  // Select dropdown
  if (param.type === 'select' && param.options) {
    return (
      <Select
        size="small"
        fullWidth
        value={(value as string) ?? param.default ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        sx={{
          fontSize: compact ? '0.7rem' : '0.8rem',
          '& .MuiSelect-select': {
            py: compact ? 0.5 : 1,
          },
        }}
      >
        {param.options.map((opt) => (
          <MenuItem key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  // Slider
  if (param.type === 'slider') {
    return (
      <Box sx={{ px: 1 }}>
        <Slider
          size="small"
          value={(value as number) ?? param.default ?? param.min ?? 0}
          onChange={(_, newValue) => handleChange(newValue)}
          min={param.min ?? 0}
          max={param.max ?? 100}
          step={param.step ?? 1}
          valueLabelDisplay="auto"
          sx={{ py: 0 }}
        />
      </Box>
    );
  }

  // Boolean toggle
  if (param.type === 'boolean') {
    return (
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={Boolean(value ?? param.default)}
            onChange={(e) => handleChange(e.target.checked)}
          />
        }
        label={
          <Typography variant="caption" sx={{ fontSize: compact ? '0.65rem' : '0.75rem' }}>
            {param.name}
          </Typography>
        }
        sx={{ m: 0 }}
      />
    );
  }

  // Color picker
  if (param.type === 'color') {
    return (
      <TextField
        size="small"
        type="color"
        fullWidth
        value={(value as string) || param.default || '#000000'}
        onChange={(e) => handleChange(e.target.value)}
        sx={{
          '& .MuiInputBase-input': {
            height: compact ? 24 : 32,
            padding: 0.5,
          },
        }}
      />
    );
  }

  // File/image parameter - show thumbnail or filename
  if (param.type === 'file' || param.type === 'image') {
    const strValue = value as string;
    if (strValue && (strValue.startsWith('data:image') || strValue.startsWith('http'))) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={strValue}
            alt="Preview"
            sx={{
              width: compact ? 32 : 40,
              height: compact ? 32 : 40,
              objectFit: 'cover',
              borderRadius: 0.5,
              border: '1px solid',
              borderColor: 'divider',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <Chip
            size="small"
            label="Image loaded"
            color="success"
            variant="outlined"
            sx={{ fontSize: compact ? '0.6rem' : '0.7rem' }}
          />
        </Box>
      );
    }
    return (
      <Chip
        size="small"
        label="No file"
        variant="outlined"
        sx={{ fontSize: compact ? '0.65rem' : '0.75rem' }}
      />
    );
  }

  // Default: show value as chip (truncate long values like data URLs)
  const displayValue = (() => {
    if (value === undefined || value === null) return 'Not set';
    const strVal = String(value);
    // Truncate data URLs and very long strings
    if (strVal.startsWith('data:')) {
      return 'Data URL';
    }
    if (strVal.length > 30) {
      return strVal.substring(0, 27) + '...';
    }
    return strVal;
  })();

  return (
    <Chip
      size="small"
      label={displayValue}
      variant="outlined"
      sx={{ fontSize: compact ? '0.65rem' : '0.75rem' }}
    />
  );
});

ParameterField.displayName = 'ParameterField';

// ============================================================================
// COMPONENT
// ============================================================================

export const ParameterSlot = memo<ParameterSlotProps>(({
  config,
  parameters,
  nodeType,
  displayMode,
  onParameterChange,
}) => {
  // Get node definition for parameter metadata
  const definition = useMemo(() => getNodeDefinition(nodeType), [nodeType]);
  const paramDefs = definition?.parameters || [];

  // Check if this display mode should show parameters
  if (!config.visibleInModes.includes(displayMode)) {
    return null;
  }

  // Get priority params for compact display
  const priorityParamIds = config.priorityParams || [];
  const visibleParams = displayMode === 'standard'
    ? paramDefs.filter(p => priorityParamIds.includes(p.id) || priorityParamIds.length === 0).slice(0, 3)
    : paramDefs;

  // No parameters to show
  if (visibleParams.length === 0) {
    return null;
  }

  const isCompact = displayMode === 'standard';

  // Inline layout
  if (config.layout === 'inline') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          py: 0.5,
        }}
      >
        {visibleParams.map((param) => (
          <Box key={param.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                minWidth: 60,
                fontSize: isCompact ? '0.65rem' : '0.7rem',
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              {param.name}
            </Typography>
            <Box sx={{ flex: 1 }}>
              <ParameterField
                param={param}
                value={parameters[param.id]}
                onChange={onParameterChange ? (v) => onParameterChange(param.id, v) : undefined}
                compact={isCompact}
              />
            </Box>
          </Box>
        ))}

        {/* Show "more" indicator if there are hidden params */}
        {displayMode === 'standard' && paramDefs.length > visibleParams.length && (
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ textAlign: 'center', fontSize: '0.6rem' }}
          >
            +{paramDefs.length - visibleParams.length} more (expand for all)
          </Typography>
        )}
      </Box>
    );
  }

  // Grid layout
  if (config.layout === 'grid') {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          py: 0.5,
        }}
      >
        {visibleParams.map((param) => (
          <Box key={param.id}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 0.25,
                fontSize: '0.65rem',
                color: 'text.secondary',
              }}
            >
              {param.name}
            </Typography>
            <ParameterField
              param={param}
              value={parameters[param.id]}
              onChange={onParameterChange ? (v) => onParameterChange(param.id, v) : undefined}
              compact={isCompact}
            />
          </Box>
        ))}
      </Box>
    );
  }

  // Accordion layout (for expanded mode)
  if (config.layout === 'accordion') {
    // Group parameters by category if specified
    const groupedParams = useMemo(() => {
      if (!config.groupBy) {
        return { 'Parameters': visibleParams };
      }
      // For now, just use a single group
      return { 'All Parameters': visibleParams };
    }, [visibleParams, config.groupBy]);

    return (
      <Box sx={{ py: 0.5 }}>
        {Object.entries(groupedParams).map(([groupName, params]: [string, NodeParameter[]]) => (
          <Accordion
            key={groupName}
            defaultExpanded={displayMode === 'expanded'}
            disableGutters
            sx={{
              bgcolor: 'transparent',
              boxShadow: 'none',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandIcon sx={{ fontSize: 16 }} />}
              sx={{
                minHeight: 32,
                px: 1,
                '& .MuiAccordionSummary-content': { my: 0.5 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SettingsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" fontWeight={600}>
                  {groupName}
                </Typography>
                <Chip
                  size="small"
                  label={params.length}
                  sx={{ height: 16, fontSize: '0.6rem' }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 1, py: 0.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {params.map((param) => (
                  <Box key={param.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        minWidth: 80,
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                      }}
                    >
                      {param.name}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <ParameterField
                        param={param}
                        value={parameters[param.id]}
                        onChange={onParameterChange ? (v) => onParameterChange(param.id, v) : undefined}
                        compact={false}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

  return null;
});

ParameterSlot.displayName = 'ParameterSlot';

export default ParameterSlot;
