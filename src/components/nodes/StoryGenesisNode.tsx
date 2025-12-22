/**
 * StoryGenesisNode - Transform ideas into story concepts
 * The starting point for story creation workflows
 * Outputs a complete StoryData object with genre, tone, themes
 *
 * Enhanced "Moment of Delight" version with rich story preview
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
  Collapse,
  Divider,
  Avatar,
  Card,
  CardContent,
  Button,
  Fade,
  Zoom,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  AutoStories as StoryIcon,
  Lightbulb as IdeaIcon,
  ExpandLess as CollapseIcon,
  ExpandMore as ExpandIcon,
  PlayArrow as GenerateIcon,
  Settings as SettingsIcon,
  Person as CharacterIcon,
  Public as WorldIcon,
  Timeline as OutlineIcon,
  FormatQuote as QuoteIcon,
  Theaters as GenreIcon,
  Mood as ToneIcon,
  LocalOffer as ThemeIcon,
  AutoFixHigh as MagicIcon,
  AccountTree as BranchIcon,
} from '@mui/icons-material';
import type { CanvasNodeData, Port, StoryData } from '@/models/canvas';
import { PORT_COLORS } from './portColors';

// ===== Constants =====

const NODE_WIDTH = 380;
const NODE_MIN_HEIGHT = 280;
const NODE_EXPANDED_HEIGHT = 'auto';

// Story Genesis accent color (emerald green)
const NARRATIVE_COLOR = '#10b981';
const CHARACTER_COLOR = '#8b5cf6';
const SETTING_COLOR = '#f59e0b';
const OUTLINE_COLOR = '#3b82f6';

// Genre options
const GENRES = [
  'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Action',
  'Sci-Fi', 'Fantasy', 'Mystery', 'Adventure', 'Historical', 'Documentary'
];

// Tone options
const TONES = [
  'Serious', 'Light-hearted', 'Dark', 'Hopeful', 'Melancholic',
  'Suspenseful', 'Whimsical', 'Gritty', 'Epic', 'Intimate'
];

// Target length options
const TARGET_LENGTHS = [
  { value: 'short', label: 'Short (< 30 min)' },
  { value: 'feature', label: 'Feature (90-120 min)' },
  { value: 'series', label: 'Series (Multi-episode)' },
];

// Character role colors
const ROLE_COLORS: Record<string, string> = {
  'Protagonist': '#10b981',
  'Antagonist': '#ef4444',
  'Supporting': '#3b82f6',
  'Mentor': '#f59e0b',
  'Love Interest': '#ec4899',
  'Comic Relief': '#f97316',
};

// ===== Types =====

export interface StoryCharacter {
  name: string;
  role: string;
  archetype: string;
  briefDescription: string;
  motivation: string;
}

export interface StoryAct {
  actNumber: number;
  title: string;
  summary: string;
}

export interface StorySetting {
  world: string;
  timePeriod: string;
  primaryLocation: string;
  keyLocations: string[];
}

export interface StoryOutline {
  acts: StoryAct[];
  majorBeats: string[];
}

export interface StoryResponse {
  id: string;
  title: string;
  premise: string;
  themes: string[];
  genre: string;
  subGenre?: string;
  tone: string;
  setting: StorySetting;
  centralConflict: string;
  stakes: string;
  hook: string;
  logline?: string;
  tagline?: string;
}

export interface StoryGenesisNodeData extends CanvasNodeData {
  nodeType: 'storyGenesis';
  storyData?: StoryData;
  generatedLogline?: string;
  storyResponse?: StoryResponse;
  characters?: StoryCharacter[];
  outline?: StoryOutline;
}

export interface StoryGenesisNodeProps {
  id: string;
  data: StoryGenesisNodeData;
  selected?: boolean;
  isConnectable?: boolean;
  onAutoGenerateNodes?: (nodeId: string, storyResponse: StoryResponse, characters: StoryCharacter[], outline: StoryOutline) => void;
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
  return ROLE_COLORS[role] || '#6b7280';
};

// ===== Sub-Components =====

// Character Card Component
const CharacterCard = memo(({ character, index }: { character: StoryCharacter; index: number }) => {
  const roleColor = getRoleColor(character.role);
  // Clean up character name (remove ** markdown)
  const cleanName = character.name.replace(/\*\*/g, '');

  return (
    <Zoom in style={{ transitionDelay: `${index * 100}ms` }}>
      <Card
        variant="outlined"
        sx={{
          minWidth: 140,
          maxWidth: 160,
          flexShrink: 0,
          bgcolor: alpha(roleColor, 0.05),
          borderColor: alpha(roleColor, 0.3),
          '&:hover': {
            borderColor: roleColor,
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(roleColor, 0.2)}`,
          },
          transition: 'all 0.2s ease',
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: roleColor,
                fontSize: '0.7rem',
              }}
            >
              {cleanName.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {cleanName}
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={character.role}
            size="small"
            sx={{
              height: 16,
              fontSize: '0.6rem',
              bgcolor: alpha(roleColor, 0.15),
              color: roleColor,
              fontWeight: 600,
              mb: 0.5,
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '0.65rem',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              display: '-webkit-box',
            }}
          >
            {character.archetype}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
});

// Act Timeline Component
const ActTimeline = memo(({ acts }: { acts: StoryAct[] }) => (
  <Box sx={{ position: 'relative' }}>
    {acts.map((act, index) => (
      <Fade in key={act.actNumber} style={{ transitionDelay: `${index * 150}ms` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            mb: index < acts.length - 1 ? 1.5 : 0,
            position: 'relative',
          }}
        >
          {/* Timeline connector */}
          {index < acts.length - 1 && (
            <Box
              sx={{
                position: 'absolute',
                left: 11,
                top: 24,
                bottom: -12,
                width: 2,
                bgcolor: alpha(OUTLINE_COLOR, 0.3),
              }}
            />
          )}

          {/* Act number badge */}
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: OUTLINE_COLOR,
              fontSize: '0.7rem',
              fontWeight: 700,
              mr: 1.5,
              flexShrink: 0,
            }}
          >
            {act.actNumber}
          </Avatar>

          {/* Act content */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" fontWeight={600} sx={{ display: 'block' }}>
              {act.title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.65rem',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {act.summary}
            </Typography>
          </Box>
        </Box>
      </Fade>
    ))}
  </Box>
));

// ===== Main Component =====

export const StoryGenesisNode = memo(function StoryGenesisNode({
  data,
  selected,
  isConnectable = true,
  onAutoGenerateNodes,
}: StoryGenesisNodeProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showFullStory, setShowFullStory] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('story');

  // Get current parameter values with defaults
  const idea = (data.parameters?.idea as string) ?? '';
  const genre = (data.parameters?.genre as string) ?? 'Drama';
  const secondaryGenre = (data.parameters?.secondaryGenre as string) ?? '';
  const tone = (data.parameters?.tone as string) ?? 'Serious';
  const targetLength = (data.parameters?.targetLength as string) ?? 'feature';
  const targetAudience = (data.parameters?.targetAudience as string) ?? 'General';
  const themes = (data.parameters?.themes as string) ?? '';

  // Story response data
  const storyResponse = data.storyResponse;
  const characters = data.characters || [];
  const outline = data.outline;
  const hasStoryData = !!storyResponse;

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  const handleToggleFullStory = useCallback(() => {
    setShowFullStory(prev => !prev);
  }, []);

  const handleExpandSection = useCallback((section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

  const handleAutoGenerate = useCallback(() => {
    if (storyResponse && onAutoGenerateNodes) {
      const nodeId = typeof data.id === 'string' ? data.id : String(data.id || '');
      onAutoGenerateNodes(nodeId, storyResponse, characters || [], outline!);
    }
  }, [data.id, storyResponse, characters, outline, onAutoGenerateNodes]);

  // Render input handles (left side)
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

  // Render output handles (right side)
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

  // Render the enhanced story preview (Moment of Delight)
  const renderStoryPreview = () => {
    if (!storyResponse) return null;

    return (
      <Fade in timeout={500}>
        <Box
          sx={{
            mt: 2,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: alpha(NARRATIVE_COLOR, 0.03),
            border: `1px solid ${alpha(NARRATIVE_COLOR, 0.2)}`,
          }}
        >
          {/* Story Title & Tagline Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha(NARRATIVE_COLOR, 0.15)} 0%, ${alpha('#6366f1', 0.1)} 100%)`,
              p: 2,
              borderBottom: `1px solid ${alpha(NARRATIVE_COLOR, 0.15)}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    background: `linear-gradient(135deg, ${NARRATIVE_COLOR} 0%, #6366f1 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  {storyResponse.title}
                </Typography>
                {storyResponse.tagline && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      display: 'block',
                    }}
                  >
                    "{storyResponse.tagline}"
                  </Typography>
                )}
              </Box>
              <IconButton size="small" onClick={handleToggleFullStory}>
                {showFullStory ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            </Stack>

            {/* Genre & Tone Chips */}
            <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<GenreIcon sx={{ fontSize: 14 }} />}
                label={storyResponse.genre}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: alpha(NARRATIVE_COLOR, 0.15),
                  color: NARRATIVE_COLOR,
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: NARRATIVE_COLOR },
                }}
              />
              <Chip
                icon={<ToneIcon sx={{ fontSize: 14 }} />}
                label={storyResponse.tone}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  bgcolor: alpha('#6366f1', 0.15),
                  color: '#6366f1',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#6366f1' },
                }}
              />
            </Stack>
          </Box>

          {/* Expandable Content */}
          <Collapse in={showFullStory}>
            <Box sx={{ p: 2 }}>
              {/* Logline */}
              {storyResponse.logline && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <QuoteIcon sx={{ fontSize: 16, color: NARRATIVE_COLOR }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      LOGLINE
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: 'italic',
                      pl: 3,
                      borderLeft: `3px solid ${NARRATIVE_COLOR}`,
                      py: 0.5,
                      color: 'text.primary',
                      lineHeight: 1.5,
                    }}
                  >
                    {storyResponse.logline}
                  </Typography>
                </Box>
              )}

              {/* Themes */}
              {storyResponse.themes && storyResponse.themes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <ThemeIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      THEMES
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ pl: 3 }}>
                    {storyResponse.themes.map((theme, i) => (
                      <Chip
                        key={i}
                        label={theme}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: alpha('#f59e0b', 0.1),
                          color: '#92400e',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Premise (Collapsible) */}
              <Box sx={{ mb: 1.5 }}>
                <Button
                  size="small"
                  onClick={() => handleExpandSection('premise')}
                  startIcon={<IdeaIcon sx={{ fontSize: 16 }} />}
                  endIcon={expandedSection === 'premise' ? <CollapseIcon /> : <ExpandIcon />}
                  sx={{
                    textTransform: 'none',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    mb: 0.5,
                  }}
                >
                  Premise
                </Button>
                <Collapse in={expandedSection === 'premise'}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      pl: 3,
                      lineHeight: 1.5,
                      color: 'text.secondary',
                    }}
                  >
                    {storyResponse.premise}
                  </Typography>
                </Collapse>
              </Box>

              {/* Setting (Collapsible) */}
              {storyResponse.setting && (
                <Box sx={{ mb: 1.5 }}>
                  <Button
                    size="small"
                    onClick={() => handleExpandSection('setting')}
                    startIcon={<WorldIcon sx={{ fontSize: 16, color: SETTING_COLOR }} />}
                    endIcon={expandedSection === 'setting' ? <CollapseIcon /> : <ExpandIcon />}
                    sx={{
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      mb: 0.5,
                    }}
                  >
                    Setting: {storyResponse.setting.timePeriod}
                  </Button>
                  <Collapse in={expandedSection === 'setting'}>
                    <Box sx={{ pl: 3 }}>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                        <strong>World:</strong> {storyResponse.setting.world}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        <strong>Primary Location:</strong> {storyResponse.setting.primaryLocation}
                      </Typography>
                    </Box>
                  </Collapse>
                </Box>
              )}

              <Divider sx={{ my: 1.5 }} />

              {/* Characters */}
              {characters && characters.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <CharacterIcon sx={{ fontSize: 16, color: CHARACTER_COLOR }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      CHARACTERS ({characters.length})
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      overflowX: 'auto',
                      pb: 1,
                      '&::-webkit-scrollbar': { height: 4 },
                      '&::-webkit-scrollbar-thumb': {
                        bgcolor: alpha(CHARACTER_COLOR, 0.3),
                        borderRadius: 2,
                      },
                    }}
                  >
                    {characters.map((char, i) => (
                      <CharacterCard key={i} character={char} index={i} />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Story Outline */}
              {outline && outline.acts && outline.acts.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <OutlineIcon sx={{ fontSize: 16, color: OUTLINE_COLOR }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      STORY STRUCTURE
                    </Typography>
                  </Stack>
                  <ActTimeline acts={outline.acts} />
                </Box>
              )}

              {/* Hook */}
              {storyResponse.hook && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(NARRATIVE_COLOR, 0.08),
                    border: `1px dashed ${alpha(NARRATIVE_COLOR, 0.3)}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <MagicIcon sx={{ fontSize: 14, color: NARRATIVE_COLOR }} />
                    <Typography variant="caption" fontWeight={600} sx={{ color: NARRATIVE_COLOR }}>
                      THE HOOK
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                    {storyResponse.hook}
                  </Typography>
                </Box>
              )}

              {/* Auto-Generate Nodes Button */}
              {onAutoGenerateNodes && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<BranchIcon />}
                  onClick={handleAutoGenerate}
                  sx={{
                    mt: 2,
                    background: `linear-gradient(135deg, ${NARRATIVE_COLOR} 0%, #6366f1 100%)`,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(NARRATIVE_COLOR, 0.9)} 0%, ${alpha('#6366f1', 0.9)} 100%)`,
                    },
                  }}
                >
                  Generate Story Workflow Nodes
                </Button>
              )}
            </Box>
          </Collapse>
        </Box>
      </Fade>
    );
  };

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: hasStoryData ? NODE_WIDTH : 320,
        minHeight: NODE_MIN_HEIGHT,
        maxHeight: hasStoryData ? NODE_EXPANDED_HEIGHT : undefined,
        borderRadius: 2,
        overflow: 'hidden',
        border: selected ? `2px solid ${NARRATIVE_COLOR}` : '1px solid',
        borderColor: selected ? NARRATIVE_COLOR : 'divider',
        transition: 'all 0.3s ease',
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
          <StoryIcon sx={{ color: 'white', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
              {data.label || 'Story Genesis'}
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
              Transform idea into story
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {getStatusIcon(data.status)}
          <IconButton
            size="small"
            onClick={handleToggleSettings}
            sx={{ color: 'white' }}
          >
            {showSettings ? <CollapseIcon /> : <SettingsIcon />}
          </IconButton>
        </Stack>
      </Box>

      {/* Progress bar when running */}
      {data.status === 'running' && (
        <LinearProgress
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': {
              backgroundColor: NARRATIVE_COLOR,
            },
          }}
        />
      )}

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {/* Story Idea Input - Only show when no story data */}
        {!hasStoryData && (
          <>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IdeaIcon sx={{ fontSize: 18, color: NARRATIVE_COLOR }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Story Idea
                </Typography>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                placeholder="Enter your story idea, premise, or concept..."
                value={idea}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.85rem',
                    '&:hover fieldset': { borderColor: NARRATIVE_COLOR },
                    '&.Mui-focused fieldset': { borderColor: NARRATIVE_COLOR },
                  },
                }}
              />
            </Box>

            {/* Genre & Tone Row */}
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Genre</InputLabel>
                <Select
                  value={genre}
                  label="Genre"
                  sx={{ fontSize: '0.8rem' }}
                >
                  {GENRES.map((g) => (
                    <MenuItem key={g} value={g} sx={{ fontSize: '0.8rem' }}>{g}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontSize: '0.75rem' }}>Tone</InputLabel>
                <Select
                  value={tone}
                  label="Tone"
                  sx={{ fontSize: '0.8rem' }}
                >
                  {TONES.map((t) => (
                    <MenuItem key={t} value={t} sx={{ fontSize: '0.8rem' }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Target Length */}
            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Target Length</InputLabel>
              <Select
                value={targetLength}
                label="Target Length"
                sx={{ fontSize: '0.8rem' }}
              >
                {TARGET_LENGTHS.map((tl) => (
                  <MenuItem key={tl.value} value={tl.value} sx={{ fontSize: '0.8rem' }}>
                    {tl.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        {/* Settings Panel (Collapsible) */}
        <Collapse in={showSettings && !hasStoryData}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ mb: 1, display: 'block' }}>
              Advanced Settings
            </Typography>

            {/* Secondary Genre */}
            <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Secondary Genre</InputLabel>
              <Select
                value={secondaryGenre}
                label="Secondary Genre"
                sx={{ fontSize: '0.8rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8rem' }}>None</MenuItem>
                {GENRES.map((g) => (
                  <MenuItem key={g} value={g} sx={{ fontSize: '0.8rem' }}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Target Audience */}
            <TextField
              fullWidth
              size="small"
              label="Target Audience"
              value={targetAudience}
              placeholder="e.g., Young Adults, Families"
              sx={{
                mb: 1.5,
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />

            {/* Themes */}
            <TextField
              fullWidth
              size="small"
              label="Themes (comma separated)"
              value={themes}
              placeholder="e.g., redemption, family, identity"
              sx={{
                '& .MuiInputBase-input': { fontSize: '0.8rem' },
                '& .MuiInputLabel-root': { fontSize: '0.75rem' },
              }}
            />
          </Box>
        </Collapse>

        {/* Enhanced Story Preview - "Moment of Delight" */}
        {renderStoryPreview()}

        {/* Simple Logline Preview (fallback when no full story data) */}
        {!hasStoryData && data.generatedLogline && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(NARRATIVE_COLOR, 0.1),
              border: `1px solid ${alpha(NARRATIVE_COLOR, 0.3)}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Generated Logline
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
              "{data.generatedLogline}"
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer with Status */}
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
          {(storyResponse?.genre || genre) && (
            <Chip
              label={storyResponse?.genre || genre}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: alpha('#6b7280', 0.1),
              }}
            />
          )}
        </Stack>

        {!hasStoryData && (
          <Tooltip title="Generate Story Concept">
            <IconButton
              size="small"
              disabled={data.status === 'running' || !idea}
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
        )}
      </Box>

      {/* Connection Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}
    </Paper>
  );
});

export default StoryGenesisNode;
