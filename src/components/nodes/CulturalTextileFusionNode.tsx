/**
 * CulturalTextileFusionNode - Heritage textile fusion designer
 * Fuses traditional cultural textiles with modern designs:
 * - African textiles (Kente, Ankara, Mudcloth, etc.)
 * - Global heritage patterns
 * - Respectful cultural integration
 * - Contemporary interpretations
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
  TextField,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Public as CultureIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Favorite as HeritageIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;

const CULTURE_COLOR = '#d97706'; // Amber for cultural heritage

// Textile origins
const TEXTILE_ORIGINS = [
  { value: 'kente', label: 'Kente (Ghana)', region: 'West Africa' },
  { value: 'ankara', label: 'Ankara (West Africa)', region: 'West Africa' },
  { value: 'mudcloth', label: 'Bogolan/Mudcloth (Mali)', region: 'West Africa' },
  { value: 'kitenge', label: 'Kitenge (East Africa)', region: 'East Africa' },
  { value: 'shweshwe', label: 'Shweshwe (South Africa)', region: 'South Africa' },
  { value: 'adire', label: 'Adire (Nigeria)', region: 'West Africa' },
  { value: 'aso-oke', label: 'Aso Oke (Nigeria)', region: 'West Africa' },
  { value: 'kanga', label: 'Kanga (East Africa)', region: 'East Africa' },
  { value: 'korhogo', label: 'Korhogo (Ivory Coast)', region: 'West Africa' },
  { value: 'ndebele', label: 'Ndebele (South Africa)', region: 'South Africa' },
  { value: 'custom', label: 'Custom/Other', region: 'Global' },
];

// Fusion styles
const FUSION_STYLES = [
  { value: 'traditional', label: 'Traditional Authentic' },
  { value: 'contemporary', label: 'Contemporary Interpretation' },
  { value: 'abstract', label: 'Abstract Reference' },
  { value: 'color', label: 'Color Story Only' },
];

// Placement options
const PLACEMENT_OPTIONS = [
  { value: 'all-over', label: 'All-Over' },
  { value: 'panel', label: 'Accent Panel' },
  { value: 'border', label: 'Border/Trim' },
  { value: 'yoke', label: 'Yoke/Collar' },
];

// ===== Types =====

export interface CulturalTextileFusionNodeData extends CanvasNodeData {
  nodeType: 'culturalTextileFusion';
  fusedDesign?: string;
  culturalContext?: string;
  usageGuidelines?: string;
}

export interface CulturalTextileFusionNodeProps {
  id: string;
  data: CulturalTextileFusionNodeData;
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

export const CulturalTextileFusionNode = memo(function CulturalTextileFusionNode({
  data,
  selected,
  isConnectable = true,
}: CulturalTextileFusionNodeProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const textileOrigin = (data.parameters?.textileOrigin as string) ?? 'kente';
  const fusionStyle = (data.parameters?.fusionStyle as string) ?? 'contemporary';
  const placement = (data.parameters?.placement as string) ?? 'all-over';
  const customDescription = (data.parameters?.customDescription as string) ?? '';

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Get region for selected origin
  const selectedOrigin = TEXTILE_ORIGINS.find(t => t.value === textileOrigin);

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
        border: selected ? `2px solid ${CULTURE_COLOR}` : '1px solid',
        borderColor: selected ? CULTURE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(CULTURE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${CULTURE_COLOR} 0%, ${alpha(CULTURE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <CultureIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Cultural Textile Fusion'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Heritage pattern integration
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
            '& .MuiLinearProgress-bar': { backgroundColor: CULTURE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Textile Origin */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Heritage Textile</InputLabel>
          <Select value={textileOrigin} label="Heritage Textile" sx={{ fontSize: '0.8rem' }}>
            {TEXTILE_ORIGINS.map((t) => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.8rem' }}>
                <Box>
                  <Typography variant="body2">{t.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.region}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Selected Region Badge */}
        {selectedOrigin && (
          <Box sx={{ mb: 1.5 }}>
            <Chip
              icon={<HeritageIcon sx={{ fontSize: 14 }} />}
              label={selectedOrigin.region}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 22,
                bgcolor: alpha(CULTURE_COLOR, 0.15),
                color: CULTURE_COLOR,
              }}
            />
          </Box>
        )}

        {/* Fusion Style */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Fusion Approach</InputLabel>
          <Select value={fusionStyle} label="Fusion Approach" sx={{ fontSize: '0.8rem' }}>
            {FUSION_STYLES.map((s) => (
              <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.8rem' }}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Placement */}
        <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Pattern Placement</InputLabel>
          <Select value={placement} label="Pattern Placement" sx={{ fontSize: '0.8rem' }}>
            {PLACEMENT_OPTIONS.map((p) => (
              <MenuItem key={p.value} value={p.value} sx={{ fontSize: '0.8rem' }}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {/* Custom Description */}
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Custom Description"
              value={customDescription}
              placeholder="Describe any specific cultural elements or fusion ideas..."
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Box>
        </Collapse>

        {/* Generated Preview */}
        {data.fusedDesign && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(CULTURE_COLOR, 0.08),
              border: `1px solid ${alpha(CULTURE_COLOR, 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Fused Design Preview
            </Typography>
            <Box
              component="img"
              src={data.fusedDesign}
              alt="Fused textile design"
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                mt: 1,
                borderRadius: 1,
              }}
            />
          </Box>
        )}

        {/* Cultural Context */}
        {data.culturalContext && (
          <Box
            sx={{
              mt: 1.5,
              p: 1,
              borderRadius: 1,
              bgcolor: alpha('#10b981', 0.08),
              border: `1px solid ${alpha('#10b981', 0.2)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', mb: 0.5 }}>
              Cultural Context
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              {data.culturalContext}
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
            label="Heritage"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(CULTURE_COLOR, 0.15),
              color: CULTURE_COLOR,
              fontWeight: 600,
            }}
          />
          <Chip
            label={FUSION_STYLES.find(s => s.value === fusionStyle)?.label || fusionStyle}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha('#6b7280', 0.1),
            }}
          />
        </Stack>

        <Tooltip title="Create Fusion Design">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: CULTURE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(CULTURE_COLOR, 0.8) },
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

export default CulturalTextileFusionNode;
