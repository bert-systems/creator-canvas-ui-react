/**
 * CharacterCreatorNode - Deep character profile generator
 * Creates detailed character profiles with:
 * - Jungian archetypes (hero, mentor, shadow, etc.)
 * - Personality traits, flaws, quirks
 * - Backstory and character arc
 * - Voice and speech patterns
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  Person as CharacterIcon,
  PlayArrow as GenerateIcon,
  Psychology as ArchetypeIcon,
  Face as AppearanceIcon,
  AutoStories as BackstoryIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, CharacterArchetype, CharacterProfile } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 340;
const NODE_MIN_HEIGHT = 320;


// Character category color (pink/magenta)
const CHARACTER_COLOR = '#ec4899';

// Character roles
const ROLES = [
  { value: 'protagonist', label: 'Protagonist', color: '#22c55e' },
  { value: 'antagonist', label: 'Antagonist', color: '#ef4444' },
  { value: 'supporting', label: 'Supporting', color: '#3b82f6' },
  { value: 'minor', label: 'Minor', color: '#9ca3af' },
];

// Jungian archetypes - values must match CharacterArchetype type in canvas.ts
const ARCHETYPES: { value: CharacterArchetype; label: string; description: string }[] = [
  { value: 'hero', label: 'Hero', description: 'The protagonist who rises to meet a challenge' },
  { value: 'mentor', label: 'Mentor', description: 'The guide who helps the hero' },
  { value: 'shadow', label: 'Shadow', description: 'The dark reflection or antagonist' },
  { value: 'herald', label: 'Herald', description: 'Announces the need for change' },
  { value: 'guardian', label: 'Guardian', description: 'Tests the hero\'s resolve' },
  { value: 'shapeshifter', label: 'Shapeshifter', description: 'Character with shifting loyalties' },
  { value: 'trickster', label: 'Trickster', description: 'Comic relief and catalyst for change' },
  { value: 'ally', label: 'Ally', description: 'Loyal companion to the hero' },
  { value: 'innocent', label: 'Innocent', description: 'Pure and trusting, seeks safety' },
  { value: 'orphan', label: 'Orphan', description: 'Seeks belonging, connects with others' },
  { value: 'rebel', label: 'Rebel', description: 'Revolution and liberation' },
  { value: 'lover', label: 'Lover', description: 'Passion and commitment' },
  { value: 'creator', label: 'Creator', description: 'Imagination and artistic vision' },
  { value: 'ruler', label: 'Ruler', description: 'Control and responsibility' },
  { value: 'caregiver', label: 'Caregiver', description: 'Nurturing, protective figure' },
  { value: 'sage', label: 'Sage', description: 'Knowledge and wisdom seeker' },
];

// ===== Types =====

export interface CharacterCreatorNodeData extends CanvasNodeData {
  nodeType: 'characterCreator';
  characterProfile?: CharacterProfile;
  generatedTraits?: string[];
}

export interface CharacterCreatorNodeProps {
  id: string;
  data: CharacterCreatorNodeData;
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

const getRoleColor = (role: string): string => {
  return ROLES.find(r => r.value === role)?.color || '#9ca3af';
};

// ===== Component =====

export const CharacterCreatorNode = memo(function CharacterCreatorNode({
  data,
  selected,
  isConnectable = true,
}: CharacterCreatorNodeProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Get current parameter values with defaults
  const characterName = (data.parameters?.characterName as string) ?? '';
  const role = (data.parameters?.role as string) ?? 'supporting';
  const archetype = (data.parameters?.archetype as CharacterArchetype) ?? 'hero';
  const age = (data.parameters?.age as string) ?? '';
  const gender = (data.parameters?.gender as string) ?? '';
  const occupation = (data.parameters?.occupation as string) ?? '';
  const briefDescription = (data.parameters?.briefDescription as string) ?? '';
  const traits = (data.parameters?.traits as string) ?? '';
  const flaws = (data.parameters?.flaws as string) ?? '';
  const motivation = (data.parameters?.motivation as string) ?? '';

  const selectedArchetype = ARCHETYPES.find(a => a.value === archetype);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
        border: selected ? `2px solid ${CHARACTER_COLOR}` : '1px solid',
        borderColor: selected ? CHARACTER_COLOR : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 6,
          borderColor: alpha(CHARACTER_COLOR, 0.5),
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${CHARACTER_COLOR} 0%, ${alpha(CHARACTER_COLOR, 0.7)} 100%)`,
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha('#fff', 0.2),
              border: '2px solid white',
            }}
          >
            <CharacterIcon sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {characterName || 'Character Creator'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Build deep character profile
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {getStatusIcon(data.status)}
        </Stack>
      </Box>

      {/* Progress bar */}
      {data.status === 'running' && (
        <LinearProgress
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': { backgroundColor: CHARACTER_COLOR },
          }}
        />
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          minHeight: 36,
          '& .MuiTab-root': { minHeight: 36, py: 0, fontSize: '0.7rem' },
          '& .Mui-selected': { color: CHARACTER_COLOR },
          '& .MuiTabs-indicator': { bgcolor: CHARACTER_COLOR },
        }}
      >
        <Tab icon={<AppearanceIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Basic" />
        <Tab icon={<ArchetypeIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Archetype" />
        <Tab icon={<BackstoryIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Depth" />
      </Tabs>

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Basic Tab */}
        {activeTab === 0 && (
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label="Character Name"
              value={characterName}
              placeholder="Enter character name"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.85rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Role</InputLabel>
                <Select value={role} label="Role" sx={{ fontSize: '0.8rem' }}>
                  {ROLES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: r.color,
                          }}
                        />
                        <Typography variant="body2">{r.label}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Age"
                value={age}
                placeholder="e.g., 35"
                sx={{
                  width: 80,
                  '& .MuiInputBase-input': { fontSize: '0.8rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Gender</InputLabel>
                <Select value={gender} label="Gender" sx={{ fontSize: '0.8rem' }}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="non-binary">Non-binary</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Occupation"
                value={occupation}
                placeholder="e.g., Detective"
                sx={{
                  flex: 1.5,
                  '& .MuiInputBase-input': { fontSize: '0.8rem' },
                  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                }}
              />
            </Stack>

            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Brief Description"
              value={briefDescription}
              placeholder="A quick description of your character..."
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Stack>
        )}

        {/* Archetype Tab */}
        {activeTab === 1 && (
          <Stack spacing={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Archetype</InputLabel>
              <Select value={archetype} label="Archetype" sx={{ fontSize: '0.8rem' }}>
                {ARCHETYPES.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    <Box>
                      <Typography variant="body2">{a.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedArchetype && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(CHARACTER_COLOR, 0.08),
                  border: `1px solid ${alpha(CHARACTER_COLOR, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedArchetype.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedArchetype.description}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              size="small"
              label="Core Traits (comma separated)"
              value={traits}
              placeholder="e.g., brave, stubborn, loyal"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Flaws (comma separated)"
              value={flaws}
              placeholder="e.g., arrogant, impulsive"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Stack>
        )}

        {/* Depth Tab */}
        {activeTab === 2 && (
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              multiline
              rows={2}
              size="small"
              label="Motivation / Goal"
              value={motivation}
              placeholder="What drives this character?"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Backstory Seeds"
              placeholder="Key events or experiences that shaped them..."
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              The AI will expand these seeds into a full backstory and character arc.
            </Typography>
          </Stack>
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
            label="Character"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(CHARACTER_COLOR, 0.15),
              color: CHARACTER_COLOR,
              fontWeight: 600,
            }}
          />
          {role && (
            <Chip
              label={ROLES.find(r => r.value === role)?.label || role}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: alpha(getRoleColor(role), 0.15),
                color: getRoleColor(role),
              }}
            />
          )}
        </Stack>

        <Tooltip title="Generate Character Profile">
          <IconButton
            size="small"
            disabled={data.status === 'running' || !characterName}
            sx={{
              bgcolor: CHARACTER_COLOR,
              color: 'white',
              '&:hover': { bgcolor: alpha(CHARACTER_COLOR, 0.8) },
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

export default CharacterCreatorNode;
