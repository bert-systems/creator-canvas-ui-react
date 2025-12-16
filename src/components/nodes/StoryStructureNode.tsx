/**
 * StoryStructureNode - Apply story structure frameworks
 * Transforms story concepts into structured outlines using:
 * - Save the Cat (15 beats)
 * - Hero's Journey (12 stages)
 * - Three-Act Structure
 * - Story Circle (8 steps)
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  AccountTree as StructureIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Circle as BeatIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, StoryFramework, OutlineData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 300;


const NARRATIVE_COLOR = '#10b981';

// Story framework definitions - keys match StoryFramework type in canvas.ts
const FRAMEWORKS: Record<StoryFramework, { name: string; description: string; beats: string[] }> = {
  saveTheCat: {
    name: 'Save the Cat',
    description: 'Blake Snyder\'s 15-beat structure',
    beats: [
      'Opening Image', 'Theme Stated', 'Set-Up', 'Catalyst', 'Debate',
      'Break Into Two', 'B Story', 'Fun and Games', 'Midpoint', 'Bad Guys Close In',
      'All Is Lost', 'Dark Night of the Soul', 'Break Into Three', 'Finale', 'Final Image'
    ],
  },
  herosJourney: {
    name: "Hero's Journey",
    description: "Campbell's 12-stage monomyth",
    beats: [
      'Ordinary World', 'Call to Adventure', 'Refusal of the Call', 'Meeting the Mentor',
      'Crossing the Threshold', 'Tests, Allies, Enemies', 'Approach to the Inmost Cave',
      'Ordeal', 'Reward', 'The Road Back', 'Resurrection', 'Return with the Elixir'
    ],
  },
  threeAct: {
    name: 'Three-Act Structure',
    description: 'Classic beginning-middle-end',
    beats: [
      'Act 1: Setup', 'Inciting Incident', 'First Plot Point',
      'Act 2: Confrontation', 'Rising Action', 'Midpoint', 'Plot Point Two',
      'Act 3: Resolution', 'Pre-Climax', 'Climax', 'Denouement'
    ],
  },
  storyCircle: {
    name: 'Story Circle',
    description: "Dan Harmon's 8-step structure",
    beats: [
      'You (Comfort Zone)', 'Need (Desire)', 'Go (Unfamiliar Situation)', 'Search (Adaptation)',
      'Find (What They Wanted)', 'Take (Heavy Price)', 'Return (Back to Familiar)', 'Change (Transformed)'
    ],
  },
  fiveAct: {
    name: 'Five-Act Structure',
    description: 'Shakespearean dramatic structure',
    beats: [
      'Act 1: Exposition', 'Act 2: Rising Action', 'Act 3: Climax',
      'Act 4: Falling Action', 'Act 5: Resolution'
    ],
  },
  sevenPoint: {
    name: 'Seven-Point Structure',
    description: 'Concise story plotting',
    beats: [
      'Hook', 'Plot Turn 1', 'Pinch Point 1', 'Midpoint',
      'Pinch Point 2', 'Plot Turn 2', 'Resolution'
    ],
  },
  kishotenketsu: {
    name: 'Kishotenketsu',
    description: 'East Asian four-act structure',
    beats: ['Ki (Introduction)', 'Sho (Development)', 'Ten (Twist)', 'Ketsu (Conclusion)'],
  },
  freytag: {
    name: "Freytag's Pyramid",
    description: 'Classic dramatic arc',
    beats: ['Exposition', 'Rising Action', 'Climax', 'Falling Action', 'Denouement'],
  },
  fichtean: {
    name: 'Fichtean Curve',
    description: 'Crisis-driven structure',
    beats: ['Crisis 1', 'Crisis 2', 'Crisis 3', 'Climax', 'Resolution'],
  },
  inMediasRes: {
    name: 'In Medias Res',
    description: 'Start in the middle of action',
    beats: ['Action Opening', 'Flashback/Context', 'Return to Present', 'Resolution'],
  },
};

// ===== Types =====

export interface StoryStructureNodeData extends CanvasNodeData {
  nodeType: 'storyStructure';
  outlineData?: OutlineData;
  selectedBeats?: number[];
}

export interface StoryStructureNodeProps {
  id: string;
  data: StoryStructureNodeData;
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

export const StoryStructureNode = memo(function StoryStructureNode({
  data,
  selected,
  isConnectable = true,
}: StoryStructureNodeProps) {
  const [showBeats, setShowBeats] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Get current parameter values with defaults
  const framework = (data.parameters?.framework as StoryFramework) ?? 'saveTheCat';

  const currentFramework = FRAMEWORKS[framework] || FRAMEWORKS.saveTheCat;

  const handleToggleBeats = useCallback(() => {
    setShowBeats(prev => !prev);
  }, []);

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
        border: selected ? `2px solid ${NARRATIVE_COLOR}` : '1px solid',
        borderColor: selected ? NARRATIVE_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(NARRATIVE_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${NARRATIVE_COLOR} 0%, ${alpha(NARRATIVE_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <StructureIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Story Structure'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Apply framework to story
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {getStatusIcon(data.status)}
          <IconButton size="small" onClick={handleToggleSettings} sx={{ color: 'white' }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Progress bar when running */}
      {data.status === 'running' && (
        <LinearProgress
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': { backgroundColor: NARRATIVE_COLOR },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Framework Selector */}
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Story Framework</InputLabel>
          <Select
            value={framework}
            label="Story Framework"
            sx={{ fontSize: '0.8rem' }}
          >
            {Object.entries(FRAMEWORKS).map(([key, fw]) => (
              <MenuItem key={key} value={key} sx={{ fontSize: '0.8rem' }}>
                <Box>
                  <Typography variant="body2">{fw.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fw.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Framework Info */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: alpha(NARRATIVE_COLOR, 0.08),
            border: `1px solid ${alpha(NARRATIVE_COLOR, 0.2)}`,
            mb: 2,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {currentFramework.name}
            </Typography>
            <Chip
              label={`${currentFramework.beats.length} beats`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: alpha(NARRATIVE_COLOR, 0.2),
                color: NARRATIVE_COLOR,
              }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {currentFramework.description}
          </Typography>
        </Box>

        {/* Story Beats List */}
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: 'pointer', mb: 1 }}
            onClick={handleToggleBeats}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Story Beats
            </Typography>
            <IconButton size="small">
              {showBeats ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
            </IconButton>
          </Stack>

          <Collapse in={showBeats}>
            <List dense sx={{ py: 0 }}>
              {currentFramework.beats.map((beat, index) => (
                <ListItem
                  key={index}
                  sx={{
                    py: 0.25,
                    px: 0,
                    '&:hover': { bgcolor: alpha(NARRATIVE_COLOR, 0.05) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <BeatIcon
                      sx={{
                        fontSize: 8,
                        color: data.selectedBeats?.includes(index)
                          ? NARRATIVE_COLOR
                          : 'grey.400',
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        {index + 1}. {beat}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>

        {/* Settings Panel */}
        <Collapse in={showSettings}>
          <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', mt: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Advanced Settings
            </Typography>
            {/* Add custom settings here */}
          </Box>
        </Collapse>
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
            label="Narrative"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(NARRATIVE_COLOR, 0.15),
              color: NARRATIVE_COLOR,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Tooltip title="Generate Outline">
          <IconButton
            size="small"
            disabled={data.status === 'running'}
            sx={{
              bgcolor: NARRATIVE_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(NARRATIVE_COLOR, 0.8) },
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

export default StoryStructureNode;
