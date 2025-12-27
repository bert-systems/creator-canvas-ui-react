/**
 * CreateStoryFlow - Step-by-step story creation wizard
 * Steps: Concept → Characters → Structure → Generate → Refine
 *
 * Features a beautiful "moment of delight" presentation of generated stories
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlaceIcon from '@mui/icons-material/Place';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import {
  storyGenerationService,
  type StoryData,
  type StoryGenre,
  type StoryTone,
  type TargetLength,
  type Audience,
  type StoryFramework,
  type StoryStartResponse,
} from '@/services/storyGenerationService';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'concept', label: 'Concept', description: 'Describe your story idea' },
  { id: 'details', label: 'Details', description: 'Set genre, tone, and audience' },
  { id: 'structure', label: 'Structure', description: 'Choose story framework' },
  { id: 'generate', label: 'Generate', description: 'AI creates your story' },
  { id: 'refine', label: 'Refine', description: 'Review and export' },
];

// Genre options
const GENRES: { id: StoryGenre; label: string }[] = [
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'scifi', label: 'Sci-Fi' },
  { id: 'thriller', label: 'Thriller' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'romance', label: 'Romance' },
  { id: 'horror', label: 'Horror' },
  { id: 'drama', label: 'Drama' },
  { id: 'comedy', label: 'Comedy' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'literary', label: 'Literary' },
  { id: 'historical', label: 'Historical' },
  { id: 'contemporary', label: 'Contemporary' },
];

// Tone options
const TONES: { id: StoryTone; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'lighthearted', label: 'Light-hearted' },
  { id: 'serious', label: 'Serious' },
  { id: 'whimsical', label: 'Whimsical' },
  { id: 'gritty', label: 'Gritty' },
  { id: 'hopeful', label: 'Hopeful' },
  { id: 'melancholic', label: 'Melancholic' },
  { id: 'suspenseful', label: 'Suspenseful' },
];

// Audience options
const AUDIENCES: { id: Audience; label: string }[] = [
  { id: 'children', label: 'Children' },
  { id: 'middle-grade', label: 'Middle Grade' },
  { id: 'ya', label: 'Young Adult' },
  { id: 'new-adult', label: 'New Adult' },
  { id: 'adult', label: 'Adult' },
  { id: 'general', label: 'General' },
];

// Length options
const LENGTHS: { id: TargetLength; label: string; wordCount: string }[] = [
  { id: 'flash', label: 'Flash Fiction', wordCount: '< 1,000' },
  { id: 'short-story', label: 'Short Story', wordCount: '1,000 - 7,500' },
  { id: 'novella', label: 'Novella', wordCount: '17,500 - 40,000' },
  { id: 'novel', label: 'Novel', wordCount: '50,000 - 100,000' },
  { id: 'series', label: 'Series', wordCount: '100,000+' },
];

// Story framework options
const FRAMEWORKS: { id: StoryFramework; label: string; description: string }[] = [
  { id: 'three-act', label: 'Three-Act', description: 'Classic setup, confrontation, resolution' },
  { id: 'heros-journey', label: "Hero's Journey", description: "Mythic structure of the hero's transformation" },
  { id: 'save-the-cat', label: 'Save the Cat', description: '15-beat structure for compelling stories' },
  { id: 'story-circle', label: 'Story Circle', description: "Dan Harmon's simplified hero's journey" },
  { id: 'seven-point', label: 'Seven Point', description: 'Hook, plot turns, pinch points, resolution' },
  { id: 'freytags-pyramid', label: "Freytag's Pyramid", description: 'Exposition, rising action, climax, falling action' },
  { id: 'kishotenketsu', label: 'Kishotenketsu', description: 'Japanese 4-act structure without conflict' },
];

interface CreateStoryFlowProps {
  onCancel: () => void;
  onComplete: (story: StoryData) => void;
}

export const CreateStoryFlow: React.FC<CreateStoryFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [concept, setConcept] = useState('');
  const [genre, setGenre] = useState<StoryGenre>('fantasy');
  const [tone, setTone] = useState<StoryTone>('hopeful');
  const [audience, setAudience] = useState<Audience>('adult');
  const [length, setLength] = useState<TargetLength>('novel');
  const [framework, setFramework] = useState<StoryFramework>('three-act');

  // Generation state
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState<StoryData | null>(null);
  const [fullResponse, setFullResponse] = useState<StoryStartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return concept.trim().length >= 20;
      case 1: return true;
      case 2: return true;
      case 3: return result !== null;
      case 4: return true;
      default: return false;
    }
  }, [currentStep, concept, result]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!concept.trim()) return;

    setIsProcessing(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      // Start story generation
      const response = await storyGenerationService.startStory({
        starterPrompt: concept,
        genre,
        tone,
        pointOfView: 'third-limited',
        targetLength: length,
        targetAudience: audience,
        complexity: 3, // Medium complexity
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Store the full response for the beautiful presentation
      setFullResponse(response);

      // Create story data from response - the response contains a story object
      const storyData: StoryData = {
        id: response.story.id,
        title: response.story.title,
        premise: response.logline || response.story.premise,
        themes: response.story.themes || [],
        genre: response.story.genre as StoryGenre,
        tone: response.story.tone as StoryTone,
        setting: response.story.setting || {
          world: 'Contemporary setting',
          era: 'Present day',
          location: 'Various locations',
        },
        centralConflict: response.story.centralConflict || response.logline,
        stakes: response.story.stakes || 'High personal stakes',
        hook: response.story.hook || response.logline?.split('.')[0] || '',
        targetWordCount: response.story.targetWordCount || (length === 'novel' ? 80000 : length === 'novella' ? 30000 : length === 'short-story' ? 5000 : 1000),
        estimatedChapters: response.story.estimatedChapters || (length === 'novel' ? 20 : length === 'novella' ? 10 : length === 'short-story' ? 3 : 1),
      };

      setResult(storyData);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setIsProcessing(false);
    }
  }, [concept, genre, tone, length, audience]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 3 && currentStep === 2) {
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (result) {
      onComplete(result);
    }
  }, [result, onComplete]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Concept
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 700, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
              }}
            >
              Describe your story idea
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="What's your story about? Describe the main concept, characters, or scenario you have in mind. For example: 'A young wizard discovers she's the last of an ancient lineage, tasked with preventing a prophecy that could destroy both the magical and human worlds.'"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: studioColors.surface2,
                  color: studioColors.textPrimary,
                  fontSize: studioTypography.fontSize.md,
                  '& fieldset': { borderColor: studioColors.border },
                  '&:hover fieldset': { borderColor: studioColors.borderHover },
                  '&.Mui-focused fieldset': { borderColor: studioColors.accent },
                },
                '& .MuiInputBase-input::placeholder': { color: studioColors.textMuted },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textMuted }}>
                {concept.length} characters (min. 20)
              </Typography>
              {concept.length >= 20 && (
                <Chip
                  label="Ready to continue"
                  size="small"
                  sx={{ background: `${studioColors.accent}20`, color: studioColors.accent }}
                />
              )}
            </Box>
          </Box>
        );

      case 1: // Details
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 900, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
              }}
            >
              Set your story details
            </Typography>

            {/* Genre */}
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1.5,
                }}
              >
                Genre
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {GENRES.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.label}
                    onClick={() => setGenre(g.id)}
                    sx={{
                      background: genre === g.id ? studioColors.accent : studioColors.surface2,
                      color: genre === g.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${genre === g.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: genre === g.id ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Tone */}
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1.5,
                }}
              >
                Tone
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {TONES.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    onClick={() => setTone(t.id)}
                    sx={{
                      background: tone === t.id ? studioColors.accent : studioColors.surface2,
                      color: tone === t.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${tone === t.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: tone === t.id ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Audience & Length */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.sm,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textSecondary,
                    mb: 1.5,
                  }}
                >
                  Target Audience
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {AUDIENCES.map((a) => (
                    <Chip
                      key={a.id}
                      label={a.label}
                      onClick={() => setAudience(a.id)}
                      size="small"
                      sx={{
                        background: audience === a.id ? studioColors.accent : studioColors.surface2,
                        color: audience === a.id ? studioColors.textPrimary : studioColors.textSecondary,
                        border: `1px solid ${audience === a.id ? studioColors.accent : studioColors.border}`,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.sm,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textSecondary,
                    mb: 1.5,
                  }}
                >
                  Length
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {LENGTHS.map((l) => (
                    <Chip
                      key={l.id}
                      label={`${l.label} (${l.wordCount})`}
                      onClick={() => setLength(l.id)}
                      size="small"
                      sx={{
                        background: length === l.id ? studioColors.accent : studioColors.surface2,
                        color: length === l.id ? studioColors.textPrimary : studioColors.textSecondary,
                        border: `1px solid ${length === l.id ? studioColors.accent : studioColors.border}`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        );

      case 2: // Structure
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
              }}
            >
              Choose your story framework
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {FRAMEWORKS.map((f) => (
                <SurfaceCard
                  key={f.id}
                  onClick={() => setFramework(f.id)}
                  interactive
                  sx={{
                    p: 2.5,
                    border: framework === f.id
                      ? `2px solid ${studioColors.accent}`
                      : `1px solid ${studioColors.border}`,
                    background: framework === f.id ? studioColors.surface2 : studioColors.surface1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.md,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    {f.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      color: studioColors.textSecondary,
                    }}
                  >
                    {f.description}
                  </Typography>
                </SurfaceCard>
              ))}
            </Box>

            {/* Summary */}
            <SurfaceCard sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.xs,
                  color: studioColors.textTertiary,
                  textTransform: 'uppercase',
                  mb: 1,
                }}
              >
                Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={genre} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                <Chip label={tone} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={audience} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={length} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={framework} size="small" sx={{ background: studioColors.surface3 }} />
              </Box>
            </SurfaceCard>
          </Box>
        );

      case 3: // Generate
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              gap: 4,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            {isProcessing ? (
              <>
                <AutoAwesomeIcon sx={{ fontSize: 48, color: studioColors.accent }} />
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.lg,
                    fontWeight: studioTypography.fontWeight.semibold,
                    color: studioColors.textPrimary,
                  }}
                >
                  Crafting Your Story
                </Typography>
                <Typography sx={{ color: studioColors.textSecondary, textAlign: 'center' }}>
                  AI is creating a {genre} story with a {tone} tone...
                </Typography>

                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      Progress
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      {generationProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={generationProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: studioColors.surface2,
                      '& .MuiLinearProgress-bar': {
                        background: studioColors.accent,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </>
            ) : error ? (
              <>
                <Typography sx={{ color: studioColors.error || '#f44336', textAlign: 'center' }}>
                  {error}
                </Typography>
                <Button
                  onClick={handleGenerate}
                  sx={{
                    background: studioColors.accent,
                    color: studioColors.textPrimary,
                    '&:hover': { background: studioColors.accentMuted },
                  }}
                >
                  Try Again
                </Button>
              </>
            ) : null}
          </Box>
        );

      case 4: // Refine - "Moment of Delight" presentation
        // Helper to clean markdown from character names
        const cleanName = (name: string) => name?.replace(/\*\*/g, '').trim() || 'Unknown';

        // Get setting data - API returns different field names
        const settingData = fullResponse?.story?.setting as {
          world?: string;
          timePeriod?: string;
          primaryLocation?: string;
          keyLocations?: string[];
        } | undefined;

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1000, mx: 'auto', pb: 4 }}>
            {result && fullResponse && (
              <>
                {/* Hero Section - Title & Tagline */}
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: `${studioRadii.lg}px`,
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${studioColors.surface1} 0%, ${studioColors.surface2} 50%, ${studioColors.surface1} 100%)`,
                    border: `1px solid ${studioColors.border}`,
                    p: 4,
                    textAlign: 'center',
                  }}
                >
                  {/* Genre & Tone badges */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                    <Chip
                      label={result.genre}
                      size="small"
                      sx={{
                        background: studioColors.accent,
                        color: '#fff',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                    <Chip
                      label={result.tone}
                      size="small"
                      sx={{
                        background: studioColors.surface3,
                        color: studioColors.textPrimary,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>

                  {/* Title */}
                  <Typography
                    sx={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: studioColors.textPrimary,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      mb: 2,
                    }}
                  >
                    {result.title}
                  </Typography>

                  {/* Tagline */}
                  {fullResponse.tagline && (
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.lg,
                        fontStyle: 'italic',
                        color: studioColors.accent,
                        fontWeight: studioTypography.fontWeight.medium,
                      }}
                    >
                      "{fullResponse.tagline}"
                    </Typography>
                  )}
                </Box>

                {/* Logline / Hook Section */}
                <SurfaceCard
                  sx={{
                    p: 3,
                    background: `linear-gradient(90deg, ${studioColors.accent}15 0%, transparent 100%)`,
                    borderLeft: `4px solid ${studioColors.accent}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <FormatQuoteIcon sx={{ fontSize: 32, color: studioColors.accent, opacity: 0.7, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.md,
                          fontWeight: studioTypography.fontWeight.medium,
                          color: studioColors.textPrimary,
                          lineHeight: 1.6,
                        }}
                      >
                        {fullResponse.logline || result.premise}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.xs,
                          color: studioColors.textMuted,
                          mt: 1,
                          textTransform: 'uppercase',
                        }}
                      >
                        Logline
                      </Typography>
                    </Box>
                    <Tooltip title="Copy logline">
                      <IconButton
                        size="small"
                        onClick={() => navigator.clipboard.writeText(fullResponse.logline || result.premise)}
                        sx={{ color: studioColors.textMuted }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </SurfaceCard>

                {/* Two-column layout for Setting and Themes */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {/* Setting Section */}
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <PlaceIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textPrimary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Setting
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {settingData?.world && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>
                            World
                          </Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.5 }}>
                            {settingData.world}
                          </Typography>
                        </Box>
                      )}

                      {settingData?.timePeriod && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>
                            Time Period
                          </Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                            {settingData.timePeriod}
                          </Typography>
                        </Box>
                      )}

                      {settingData?.primaryLocation && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>
                            Primary Location
                          </Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                            {settingData.primaryLocation}
                          </Typography>
                        </Box>
                      )}

                      {settingData?.keyLocations && settingData.keyLocations.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>
                            Key Locations
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {settingData.keyLocations.map((loc, i) => (
                              <Typography
                                key={i}
                                sx={{
                                  fontSize: studioTypography.fontSize.xs,
                                  color: studioColors.textSecondary,
                                  pl: 1.5,
                                  borderLeft: `2px solid ${studioColors.border}`,
                                }}
                              >
                                {loc}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </SurfaceCard>

                  {/* Themes & Stakes */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Themes */}
                    {result.themes.length > 0 && (
                      <SurfaceCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                          <LightbulbIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.sm,
                              fontWeight: studioTypography.fontWeight.semibold,
                              color: studioColors.textPrimary,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Themes
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {result.themes.map((theme, i) => (
                            <Chip
                              key={i}
                              label={theme}
                              size="small"
                              sx={{
                                background: studioColors.surface3,
                                color: studioColors.textPrimary,
                                fontSize: 11,
                              }}
                            />
                          ))}
                        </Box>
                      </SurfaceCard>
                    )}

                    {/* Stakes */}
                    {result.stakes && (
                      <SurfaceCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <WarningIcon sx={{ fontSize: 20, color: '#FF9800' }} />
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.sm,
                              fontWeight: studioTypography.fontWeight.semibold,
                              color: studioColors.textPrimary,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            Stakes
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, lineHeight: 1.6 }}>
                          {result.stakes}
                        </Typography>
                      </SurfaceCard>
                    )}
                  </Box>
                </Box>

                {/* Central Conflict */}
                {result.centralConflict && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <EmojiObjectsIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textPrimary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Central Conflict
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, lineHeight: 1.6 }}>
                      {result.centralConflict}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Characters Section */}
                {fullResponse.characters && fullResponse.characters.length > 0 && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <TheaterComedyIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textPrimary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Characters ({fullResponse.characters.length})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      {fullResponse.characters.map((char, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: `${studioRadii.md}px`,
                            background: studioColors.surface2,
                            border: `1px solid ${studioColors.border}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                background: studioColors.accent,
                                fontSize: studioTypography.fontSize.md,
                              }}
                            >
                              {cleanName(char.name).charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: studioTypography.fontSize.sm,
                                  fontWeight: studioTypography.fontWeight.semibold,
                                  color: studioColors.textPrimary,
                                }}
                              >
                                {cleanName(char.name)}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                <Chip
                                  label={char.role}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: 10,
                                    background: char.role === 'protagonist' ? studioColors.accent : studioColors.surface3,
                                    color: char.role === 'protagonist' ? '#fff' : studioColors.textSecondary,
                                    textTransform: 'capitalize',
                                  }}
                                />
                                {char.archetype && (
                                  <Chip
                                    label={char.archetype}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: 10,
                                      background: 'transparent',
                                      border: `1px solid ${studioColors.border}`,
                                      color: studioColors.textMuted,
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                          {char.briefDescription && (
                            <Typography
                              sx={{
                                fontSize: studioTypography.fontSize.xs,
                                color: studioColors.textSecondary,
                                lineHeight: 1.5,
                              }}
                            >
                              {char.briefDescription}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Story Outline / Acts */}
                {fullResponse.outline && fullResponse.outline.acts && fullResponse.outline.acts.length > 0 && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <MenuBookIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textPrimary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Story Outline
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {fullResponse.outline.acts.map((act, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            p: 2,
                            borderRadius: `${studioRadii.md}px`,
                            background: studioColors.surface2,
                            border: `1px solid ${studioColors.border}`,
                          }}
                        >
                          {/* Act Number */}
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: studioColors.accent,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: studioTypography.fontSize.md,
                                fontWeight: studioTypography.fontWeight.bold,
                                color: '#fff',
                              }}
                            >
                              {act.actNumber}
                            </Typography>
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: studioTypography.fontSize.sm,
                                fontWeight: studioTypography.fontWeight.semibold,
                                color: studioColors.textPrimary,
                                mb: 0.5,
                              }}
                            >
                              {act.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: studioTypography.fontSize.xs,
                                color: studioColors.textSecondary,
                                lineHeight: 1.6,
                              }}
                            >
                              {act.summary}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Hook */}
                {result.hook && (
                  <SurfaceCard
                    sx={{
                      p: 3,
                      background: `linear-gradient(135deg, ${studioColors.surface2} 0%, ${studioColors.surface1} 100%)`,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textTertiary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        mb: 1.5,
                      }}
                    >
                      The Hook
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.md,
                        fontWeight: studioTypography.fontWeight.medium,
                        color: studioColors.textPrimary,
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                      }}
                    >
                      {result.hook}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const storyText = `${result.title}\n\n"${fullResponse.tagline}"\n\n${fullResponse.logline}\n\nGenre: ${result.genre}\nTone: ${result.tone}\n\nThemes: ${result.themes.join(', ')}\n\nCentral Conflict:\n${result.centralConflict}\n\nStakes:\n${result.stakes}`;
                      navigator.clipboard.writeText(storyText);
                    }}
                    startIcon={<ContentCopyIcon />}
                    sx={{
                      borderColor: studioColors.border,
                      color: studioColors.textSecondary,
                      '&:hover': {
                        borderColor: studioColors.accent,
                        background: `${studioColors.accent}10`,
                      },
                    }}
                  >
                    Copy Story Brief
                  </Button>
                </Box>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <FlowMode
      title="Create Story"
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onCancel={onCancel}
      canProceed={canProceed()}
      isProcessing={isProcessing}
      nextLabel={currentStep === 2 ? 'Generate Story' : undefined}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default CreateStoryFlow;
