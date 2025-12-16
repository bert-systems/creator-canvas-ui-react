/**
 * CharacterSheetNode - Multi-angle character reference sheet generator
 * Creates consistent visual references with:
 * - Multiple view angles (front, 3/4, side, back)
 * - Expression sheets
 * - Outfit variations
 * - Style consistency across views
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
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Person as CharacterIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Face as FaceIcon,
  Checkroom as OutfitIcon,
  CameraFront as ViewIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import type { VisualStyle, CharacterView } from '@/services/storyGenerationService';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;

const SHEET_COLOR = '#f472b6'; // Pink for character sheets

// Visual style options
const VISUAL_STYLES: { value: VisualStyle; label: string }[] = [
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'anime', label: 'Anime' },
  { value: 'comic', label: 'Comic Book' },
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'oil-painting', label: 'Oil Painting' },
];

// View angle options
const VIEW_OPTIONS: { value: CharacterView; label: string; icon: string }[] = [
  { value: 'front', label: 'Front', icon: '⬛' },
  { value: 'three-quarter', label: '3/4 View', icon: '◧' },
  { value: 'side', label: 'Side', icon: '▶' },
  { value: 'back', label: 'Back', icon: '◻' },
  { value: 'full-body', label: 'Full Body', icon: '🧍' },
  { value: 'bust', label: 'Bust', icon: '👤' },
];

// Expression options
const EXPRESSIONS = [
  'neutral', 'happy', 'sad', 'angry', 'surprised', 'thoughtful', 'smirking', 'crying'
];

// ===== Types =====

export interface CharacterSheetNodeData extends CanvasNodeData {
  nodeType: 'characterSheet';
  sheetUrl?: string;
  viewUrls?: Record<CharacterView, string>;
  expressionUrls?: Record<string, string>;
  outfitUrls?: string[];
  characterName?: string;
}

export interface CharacterSheetNodeProps {
  id: string;
  data: CharacterSheetNodeData;
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

export const CharacterSheetNode = memo(function CharacterSheetNode({
  data,
  selected,
  isConnectable = true,
}: CharacterSheetNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const visualStyle = (data.parameters?.visualStyle as VisualStyle) ?? 'digital-art';
  const selectedViews = (data.parameters?.selectedViews as CharacterView[]) ?? ['front', 'three-quarter', 'side'];
  const includeExpressions = (data.parameters?.includeExpressions as boolean) ?? true;
  const expressionCount = (data.parameters?.expressionCount as number) ?? 4;
  const includeOutfits = (data.parameters?.includeOutfits as boolean) ?? false;
  const outfitCount = (data.parameters?.outfitCount as number) ?? 2;

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

  // Render sheet preview
  const renderSheetPreview = () => {
    if (data.sheetUrl) {
      return (
        <Box
          sx={{
            mx: 1.5,
            borderRadius: 1,
            overflow: 'hidden',
            border: `1px solid ${alpha(SHEET_COLOR, 0.3)}`,
          }}
        >
          <Box
            component="img"
            src={data.sheetUrl}
            alt="Character Sheet"
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>
      );
    }

    // Placeholder grid showing view layout
    return (
      <Grid container spacing={0.5} sx={{ px: 1.5 }}>
        {selectedViews.slice(0, 4).map((view) => (
          <Grid key={view} size={{ xs: 6 }}>
            <Box
              sx={{
                aspectRatio: '3/4',
                bgcolor: alpha(SHEET_COLOR, 0.08),
                borderRadius: 1,
                border: '1px dashed',
                borderColor: alpha(SHEET_COLOR, 0.3),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.5,
              }}
            >
              <CharacterIcon sx={{ fontSize: 24, color: alpha(SHEET_COLOR, 0.4) }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem', mt: 0.5 }}>
                {VIEW_OPTIONS.find(v => v.value === view)?.label || view}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${SHEET_COLOR}` : '1px solid',
        borderColor: selected ? SHEET_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(SHEET_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${SHEET_COLOR} 0%, ${alpha(SHEET_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CharacterIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Character Sheet'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              {data.characterName || 'Multi-angle reference'}
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
            '& .MuiLinearProgress-bar': { backgroundColor: SHEET_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 1.5 }}>
        {/* Visual Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Visual Style</InputLabel>
          <Select value={visualStyle} label="Visual Style" sx={{ fontSize: '0.8rem' }}>
            {VISUAL_STYLES.map((style) => (
              <MenuItem key={style.value} value={style.value} sx={{ fontSize: '0.8rem' }}>
                {style.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* View Angles Selection */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
            View Angles
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {VIEW_OPTIONS.map((view) => (
              <Chip
                key={view.value}
                label={view.label}
                size="small"
                variant={selectedViews.includes(view.value) ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.65rem',
                  height: 22,
                  bgcolor: selectedViews.includes(view.value) ? alpha(SHEET_COLOR, 0.2) : 'transparent',
                  borderColor: alpha(SHEET_COLOR, 0.5),
                  color: selectedViews.includes(view.value) ? SHEET_COLOR : 'text.secondary',
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', mb: 1.5 }}>
            {/* Expressions */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeExpressions}
                  size="small"
                  sx={{ color: SHEET_COLOR, '&.Mui-checked': { color: SHEET_COLOR } }}
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <FaceIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">Include Expressions ({expressionCount})</Typography>
                </Stack>
              }
              sx={{ mb: 1 }}
            />

            {includeExpressions && (
              <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }} useFlexGap>
                {EXPRESSIONS.slice(0, expressionCount).map((exp) => (
                  <Chip
                    key={exp}
                    label={exp}
                    size="small"
                    sx={{
                      fontSize: '0.6rem',
                      height: 18,
                      bgcolor: alpha(SHEET_COLOR, 0.1),
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Outfits */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeOutfits}
                  size="small"
                  sx={{ color: SHEET_COLOR, '&.Mui-checked': { color: SHEET_COLOR } }}
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <OutfitIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption">Include Outfits ({outfitCount})</Typography>
                </Stack>
              }
            />
          </Box>
        </Collapse>

        {/* Sheet Preview */}
        {renderSheetPreview()}

        {/* Output Info */}
        <Box
          sx={{
            mt: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(SHEET_COLOR, 0.08),
            border: `1px solid ${alpha(SHEET_COLOR, 0.2)}`,
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="center">
            <Stack alignItems="center">
              <ViewIcon sx={{ fontSize: 16, color: SHEET_COLOR }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                {selectedViews.length} views
              </Typography>
            </Stack>
            {includeExpressions && (
              <Stack alignItems="center">
                <FaceIcon sx={{ fontSize: 16, color: SHEET_COLOR }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  {expressionCount} expressions
                </Typography>
              </Stack>
            )}
            {includeOutfits && (
              <Stack alignItems="center">
                <OutfitIcon sx={{ fontSize: 16, color: SHEET_COLOR }} />
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  {outfitCount} outfits
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
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
            label="Visual"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(SHEET_COLOR, 0.15),
              color: SHEET_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={VISUAL_STYLES.find(s => s.value === visualStyle)?.label || visualStyle}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Character Sheet">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: SHEET_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(SHEET_COLOR, 0.8) },
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

export default CharacterSheetNode;
