/**
 * PoseLibraryNode - Model pose selection and generation
 * Provides pose options for fashion photography:
 * - Editorial poses
 * - Commercial poses
 * - Runway poses
 * - Custom pose generation
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
  Grid,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Accessibility as PoseIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const POSE_COLOR = '#a855f7'; // Purple for poses

// Pose categories
const POSE_CATEGORIES = [
  { value: 'editorial', label: 'Editorial/High Fashion', description: 'Dramatic, artistic poses' },
  { value: 'commercial', label: 'Commercial/E-commerce', description: 'Clean, product-focused' },
  { value: 'runway', label: 'Runway/Walking', description: 'Dynamic movement' },
  { value: 'lifestyle', label: 'Lifestyle/Candid', description: 'Natural, relaxed' },
  { value: 'athletic', label: 'Athletic/Active', description: 'Sporty, energetic' },
  { value: 'seated', label: 'Seated', description: 'Sitting poses' },
];

// Camera angles
const CAMERA_ANGLES = [
  { value: 'front', label: 'Front' },
  { value: 'three-quarter', label: 'Three-Quarter' },
  { value: 'side', label: 'Side Profile' },
  { value: 'back', label: 'Back' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'low-angle', label: 'Low Angle' },
];

// Body framing
const BODY_FRAMING = [
  { value: 'full-body', label: 'Full Body' },
  { value: 'three-quarter', label: 'Three-Quarter' },
  { value: 'half-body', label: 'Half Body/Waist Up' },
  { value: 'close-up', label: 'Close-Up' },
];

// Pose moods
const POSE_MOODS = [
  { value: 'confident', label: 'Confident' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'playful', label: 'Playful' },
  { value: 'powerful', label: 'Powerful' },
];

// ===== Types =====

export interface PoseLibraryNodeData extends CanvasNodeData {
  nodeType: 'poseLibrary';
  posedModel?: string;
  poseVariations?: string[];
}

export interface PoseLibraryNodeProps {
  id: string;
  data: PoseLibraryNodeData;
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

export const PoseLibraryNode = memo(function PoseLibraryNode({
  data,
  selected,
  isConnectable = true,
}: PoseLibraryNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const poseCategory = (data.parameters?.poseCategory as string) ?? 'editorial';
  const cameraAngle = (data.parameters?.cameraAngle as string) ?? 'front';
  const bodyFraming = (data.parameters?.bodyFraming as string) ?? 'full-body';
  const poseMood = (data.parameters?.poseMood as string) ?? 'confident';
  const variationCount = (data.parameters?.variationCount as number) ?? 6;

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
        border: selected ? `2px solid ${POSE_COLOR}` : '1px solid',
        borderColor: selected ? POSE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(POSE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${POSE_COLOR} 0%, ${alpha(POSE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PoseIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Pose Library'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Model pose selection
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
            '& .MuiLinearProgress-bar': { backgroundColor: POSE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Pose Category */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Pose Category</InputLabel>
          <Select value={poseCategory} label="Pose Category" sx={{ fontSize: '0.8rem' }}>
            {POSE_CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value} sx={{ fontSize: '0.8rem' }}>
                <Box>
                  <Typography variant="body2">{c.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Camera Angle */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Camera Angle</InputLabel>
          <Select value={cameraAngle} label="Camera Angle" sx={{ fontSize: '0.8rem' }}>
            {CAMERA_ANGLES.map((a) => (
              <MenuItem key={a.value} value={a.value} sx={{ fontSize: '0.8rem' }}>
                {a.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Body Framing */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Body Framing</InputLabel>
          <Select value={bodyFraming} label="Body Framing" sx={{ fontSize: '0.8rem' }}>
            {BODY_FRAMING.map((f) => (
              <MenuItem key={f.value} value={f.value} sx={{ fontSize: '0.8rem' }}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Pose Mood */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Pose Mood</InputLabel>
              <Select value={poseMood} label="Pose Mood" sx={{ fontSize: '0.8rem' }}>
                {POSE_MOODS.map((m) => (
                  <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.8rem' }}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Variation Count */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Pose Variations: {variationCount}
              </Typography>
              <Slider
                value={variationCount}
                min={2}
                max={12}
                step={1}
                size="small"
                sx={{ color: POSE_COLOR }}
              />
            </Box>
          </Box>
        </Collapse>

        {/* Pose Variations Preview */}
        {data.poseVariations && data.poseVariations.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(POSE_COLOR, 0.08),
              border: `1px solid ${alpha(POSE_COLOR, 0.2)}`,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
              <CameraIcon sx={{ fontSize: 14, color: POSE_COLOR }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Pose Variations ({data.poseVariations.length})
              </Typography>
            </Stack>
            <Grid container spacing={0.5}>
              {data.poseVariations.slice(0, 6).map((url, i) => (
                <Grid key={i} size={{ xs: 4 }}>
                  <Box
                    component="img"
                    src={url}
                    alt={`Pose ${i + 1}`}
                    sx={{
                      width: '100%',
                      aspectRatio: '3/4',
                      objectFit: 'cover',
                      borderRadius: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Selected Pose Info */}
        <Box
          sx={{
            mt: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: alpha(POSE_COLOR, 0.05),
            border: `1px solid ${alpha(POSE_COLOR, 0.15)}`,
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="center">
            <Stack alignItems="center">
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: POSE_COLOR, fontWeight: 600 }}>
                {POSE_CATEGORIES.find(c => c.value === poseCategory)?.label.split('/')[0] || poseCategory}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
                Category
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: POSE_COLOR, fontWeight: 600 }}>
                {CAMERA_ANGLES.find(a => a.value === cameraAngle)?.label || cameraAngle}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
                Angle
              </Typography>
            </Stack>
            <Stack alignItems="center">
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: POSE_COLOR, fontWeight: 600 }}>
                {variationCount}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
                Poses
              </Typography>
            </Stack>
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
            label="Poses"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(POSE_COLOR, 0.15),
              color: POSE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={POSE_MOODS.find(m => m.value === poseMood)?.label || poseMood}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Generate Poses">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: POSE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(POSE_COLOR, 0.8) },
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

export default PoseLibraryNode;
