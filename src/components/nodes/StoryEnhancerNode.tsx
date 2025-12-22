/**
 * StoryEnhancerNode - Comprehensive story enhancement
 * Improves overall narrative quality with:
 * - Enhancement focus (prose, pacing, emotion, atmosphere)
 * - Style refinement
 * - Quality analysis
 */

import { memo, useState, useCallback } from 'react';
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
  InputLabel,
  Collapse,
  Slider,
  FormControlLabel,
  Switch,
  FormGroup,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  AutoAwesome as EnhanceIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;


const ENHANCE_COLOR = '#eab308';

// Enhancement focus areas
const ENHANCEMENT_FOCUS = [
  { value: 'prose', label: 'Prose Quality', description: 'Improve writing style and flow' },
  { value: 'pacing', label: 'Pacing', description: 'Optimize narrative rhythm' },
  { value: 'emotion', label: 'Emotional Depth', description: 'Deepen emotional resonance' },
  { value: 'atmosphere', label: 'Atmosphere', description: 'Enhance mood and setting' },
  { value: 'dialogue', label: 'Dialogue Polish', description: 'Refine conversations' },
  { value: 'sensory', label: 'Sensory Details', description: 'Add vivid descriptions' },
  { value: 'comprehensive', label: 'Comprehensive', description: 'All-around enhancement' },
];

// Enhancement intensity
const INTENSITY_LEVELS = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'significant', label: 'Significant' },
  { value: 'transformative', label: 'Transformative' },
];

// ===== Types =====

export interface StoryEnhancerNodeData extends CanvasNodeData {
  nodeType: 'storyEnhancer';
  enhancedContent?: string;
  qualityScore?: number;
  improvements?: string[];
}

export interface StoryEnhancerNodeProps {
  id: string;
  data: StoryEnhancerNodeData;
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

// ===== Component =====

export const StoryEnhancerNode = memo(function StoryEnhancerNode({
  data,
  selected,
  isConnectable = true,
}: StoryEnhancerNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const focusArea = (data.parameters?.focusArea as string) ?? 'comprehensive';
  const intensityLevel = (data.parameters?.intensityLevel as string) ?? 'moderate';
  const preserveVoice = (data.parameters?.preserveVoice as boolean) ?? true;
  const showThinking = (data.parameters?.showThinking as boolean) ?? false;

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render connection handles
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((input: Port, index: number) => {
      const totalInputs = data.inputs?.length || 1;
      const spacing = 100 / (totalInputs + 1);
      const topPosition = spacing * (index + 1);

      return (
        <Tooltip key={input.id} title={`${input.name} (${input.type})`} placement="left">
          <Handle
            type="target"
            position={Position.Left}
            id={input.id}
            isConnectable={isConnectable}
            style={{
              top: `${topPosition}%`,
              width: 12,
              height: 12,
              background: PORT_COLORS[input.type] || PORT_COLORS.any,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </Tooltip>
      );
    });
  };

  const renderOutputHandles = () => {
    if (!data.outputs || data.outputs.length === 0) return null;

    return data.outputs.map((output: Port, index: number) => {
      const totalOutputs = data.outputs?.length || 1;
      const spacing = 100 / (totalOutputs + 1);
      const topPosition = spacing * (index + 1);

      return (
        <Tooltip key={output.id} title={`${output.name} (${output.type})`} placement="right">
          <Handle
            type="source"
            position={Position.Right}
            id={output.id}
            isConnectable={isConnectable}
            style={{
              top: `${topPosition}%`,
              width: 12,
              height: 12,
              background: PORT_COLORS[output.type] || PORT_COLORS.any,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          />
        </Tooltip>
      );
    });
  };

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${ENHANCE_COLOR}` : '1px solid',
        borderColor: selected ? ENHANCE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(ENHANCE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${ENHANCE_COLOR} 0%, ${alpha(ENHANCE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <EnhanceIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Story Enhancer'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Elevate narrative quality
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {getStatusIcon(data.status)}
          <IconButton size="small" onClick={handleToggleSettings} sx={{ color: 'white' }}>
            {showSettings ? <CollapseIcon /> : <SettingsIcon />}
          </IconButton>
        </Stack>
      </Box>

      {/* Progress bar */}
      {data.status === 'running' && (
        <LinearProgress
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': { backgroundColor: ENHANCE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Input Indicator */}
        <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(ENHANCE_COLOR, 0.05), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Connect any story content to enhance it
          </Typography>
        </Box>

        {/* Enhancement Focus */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Enhancement Focus</InputLabel>
          <Select value={focusArea} label="Enhancement Focus" sx={{ fontSize: '0.8rem' }}>
            {ENHANCEMENT_FOCUS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                <Box>
                  <Typography variant="body2">{f.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {f.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Intensity Level */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Intensity</InputLabel>
          <Select value={intensityLevel} label="Intensity" sx={{ fontSize: '0.8rem' }}>
            {INTENSITY_LEVELS.map((i) => (
              <MenuItem key={i.value} value={i.value} sx={{ fontSize: '0.8rem' }}>
                {i.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={preserveVoice} size="small" />}
                label={<Typography variant="caption">Preserve Author Voice</Typography>}
              />
              <FormControlLabel
                control={<Switch checked={showThinking} size="small" />}
                label={<Typography variant="caption">Show Enhancement Reasoning</Typography>}
              />
            </FormGroup>
          </Box>
        </Collapse>

        {/* Quality Score */}
        {data.qualityScore !== undefined && (
          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Quality Score
              </Typography>
              <Typography variant="caption" fontWeight={600} color={ENHANCE_COLOR}>
                {data.qualityScore}/100
              </Typography>
            </Stack>
            <Slider
              value={data.qualityScore}
              size="small"
              disabled
              sx={{
                color: ENHANCE_COLOR,
                '& .MuiSlider-thumb': { display: 'none' },
              }}
            />
          </Box>
        )}

        {/* Generated Preview */}
        {data.enhancedContent && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(ENHANCE_COLOR, 0.08),
              border: `1px solid ${alpha(ENHANCE_COLOR, 0.2)}`,
              maxHeight: 100,
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Enhanced Content
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
              {data.enhancedContent.substring(0, 200)}...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" spacing={1}>
          <Chip
            label="Enhancement"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(ENHANCE_COLOR, 0.15),
              color: ENHANCE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={ENHANCEMENT_FOCUS.find(f => f.value === focusArea)?.label || focusArea}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Enhance Story">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: ENHANCE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(ENHANCE_COLOR, 0.8) },
              '&.Mui-disabled': { bgcolor: 'grey.300' },
            }}
          >
            <GenerateIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Connection Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}
    </Paper>
  );
});

export default StoryEnhancerNode;
