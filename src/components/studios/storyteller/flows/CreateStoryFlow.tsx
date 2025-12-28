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
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlaceIcon from '@mui/icons-material/Place';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ImageIcon from '@mui/icons-material/Image';
import MovieCreationIcon from '@mui/icons-material/MovieCreation';
import SaveIcon from '@mui/icons-material/Save';
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
  type GenerationProgress,
  type FullStoryGenerationResult,
} from '@/services/storyGenerationService';
import { storyLibraryService } from '@/services/storyLibraryService';
import { useStoryStore } from '@/stores/storyStore';
import { imageGenerationService } from '@/services/imageGenerationService';

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

// Helper to convert lowercase genre/tone to PascalCase for library service
const toPascalCase = (str: string): string => {
  if (!str) return str;
  // Handle special cases
  if (str.toLowerCase() === 'scifi') return 'SciFi';
  if (str.toLowerCase() === 'ya') return 'YA';
  // Standard PascalCase conversion
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const CreateStoryFlow: React.FC<CreateStoryFlowProps> = ({ onCancel, onComplete }) => {
  const { fetchStories } = useStoryStore();
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

  // Library and generation state
  const [isSaving, setIsSaving] = useState(false);
  const [savedStoryId, setSavedStoryId] = useState<string | null>(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null);
  const [isGeneratingFullStory, setIsGeneratingFullStory] = useState(false);
  const [fullStoryProgress, setFullStoryProgress] = useState({ current: 0, total: 0, status: '', phase: '' });
  const [fullStoryResult, setFullStoryResult] = useState<FullStoryGenerationResult | null>(null);
  const [fullStoryJobId, setFullStoryJobId] = useState<string | null>(null);

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

  // Handle Save to Library
  const handleSaveToLibrary = useCallback(async () => {
    if (!result || !fullResponse) return;

    setIsSaving(true);
    try {
      // Use the saveFromNodeOutput helper which handles the data transformation
      // Convert characters to plain objects for saveFromNodeOutput
      const charactersAsRecords = fullResponse.characters?.map(c => ({
        name: c.name,
        role: c.role,
        archetype: c.archetype || '',
        briefDescription: c.briefDescription,
        motivation: c.motivation,
      })) as Record<string, unknown>[] | undefined;

      const savedStory = await storyLibraryService.saveFromNodeOutput(
        {
          title: result.title,
          premise: result.premise,
          themes: result.themes,
          genre: toPascalCase(result.genre),
          tone: toPascalCase(result.tone),
          centralConflict: result.centralConflict,
          stakes: result.stakes,
          hook: result.hook,
          logline: fullResponse.logline,
          tagline: fullResponse.tagline,
        },
        charactersAsRecords,
        fullResponse.outline as unknown as Record<string, unknown> | undefined,
        [toPascalCase(result.genre), toPascalCase(result.tone), audience, length].filter(Boolean) as string[]
      );

      setSavedStoryId(savedStory.id);
      // Refresh the store so the story appears in the library
      await fetchStories();
    } catch (err) {
      console.error('Failed to save story:', err);
      setError(err instanceof Error ? err.message : 'Failed to save story to library');
    } finally {
      setIsSaving(false);
    }
  }, [result, fullResponse, audience, length, fetchStories]);

  // Handle Generate Cover Art
  const handleGenerateCoverArt = useCallback(async () => {
    if (!result || !fullResponse) return;

    setIsGeneratingCover(true);
    try {
      // Build a cover art prompt from story data
      const coverPrompt = fullResponse.coverPrompt ||
        `Book cover art for "${result.title}". ${fullResponse.tagline || result.premise}. ` +
        `Genre: ${result.genre}. Tone: ${result.tone}. ` +
        `Professional book cover design, dramatic lighting, cinematic composition, no text.`;

      const response = await imageGenerationService.generateFluxPro({
        prompt: coverPrompt,
        width: 768,
        height: 1024, // Portrait for book cover
        aspectRatio: '3:4',
      });

      // ImageGenerationResponse has images array with url property
      if (response.images && response.images.length > 0) {
        const generatedCoverUrl = response.images[0].url;
        setCoverArtUrl(generatedCoverUrl);

        // If story was already saved, update it with the cover art URL
        if (savedStoryId) {
          try {
            await storyLibraryService.updateStory(savedStoryId, {
              coverImageUrl: generatedCoverUrl,
            });
          } catch (updateErr) {
            console.warn('Failed to update story with cover art:', updateErr);
            // Don't fail the whole operation if update fails
          }
        }
      }
    } catch (err) {
      console.error('Failed to generate cover art:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate cover art');
    } finally {
      setIsGeneratingCover(false);
    }
  }, [result, fullResponse, savedStoryId]);

  // Handle Generate Full Story with Images using backend async job API
  // POST /api/storytelling/generate-full - starts async job
  // GET /api/storytelling/generate-full/{jobId} - polls for status
  const handleGenerateFullStory = useCallback(async () => {
    if (!result || !savedStoryId) {
      // Need to save the story first to get a valid story ID
      if (!savedStoryId && result && fullResponse) {
        await handleSaveToLibrary();
      }
      if (!savedStoryId) {
        setError('Please save the story to library first before generating full content');
        return;
      }
    }

    setIsGeneratingFullStory(true);
    setError(null);
    setFullStoryProgress({ current: 0, total: 100, status: 'Starting full story generation...', phase: 'initializing' });

    try {
      // Start the async generation job
      const startResponse = await storyGenerationService.startFullStoryGeneration({
        storyId: savedStoryId!,
        options: {
          generateChapterImages: true,
          imagesPerChapter: 1,
          imageStyle: fullResponse?.visualStyle?.visual || 'cinematic',
          generateCoverArt: !coverArtUrl, // Only generate if we don't have one
          includeCharacterPortraits: true,
        },
      });

      if (!startResponse.success || !startResponse.jobId) {
        throw new Error(startResponse.error || 'Failed to start story generation job');
      }

      setFullStoryJobId(startResponse.jobId);
      setFullStoryProgress({
        current: 0,
        total: 100,
        status: `Job started. Estimated: ${Math.ceil(startResponse.estimatedDuration / 60)} minutes`,
        phase: 'queued',
      });

      // Poll for completion using the helper method
      const generationResult = await storyGenerationService.pollFullStoryGeneration(
        startResponse.jobId,
        (progress: GenerationProgress, status: string) => {
          setFullStoryProgress({
            current: progress.percentage,
            total: 100,
            status: progress.phase
              ? `${progress.phase}${progress.currentChapter ? ` (Chapter ${progress.currentChapter}/${progress.totalChapters})` : ''}`
              : status,
            phase: progress.phase || status,
          });
        },
        3000, // Poll every 3 seconds
        200   // Max 200 attempts (~10 minutes)
      );

      // Store the result
      setFullStoryResult(generationResult);

      // Update cover art if generated
      if (generationResult.coverArtUrl && !coverArtUrl) {
        setCoverArtUrl(generationResult.coverArtUrl);
      }

      setFullStoryProgress({
        current: 100,
        total: 100,
        status: `Complete! Generated ${generationResult.totalWordCount.toLocaleString()} words and ${generationResult.totalImages} images`,
        phase: 'completed',
      });

      // Refresh the store to show updated story
      await fetchStories();

    } catch (err) {
      console.error('Failed to generate full story:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate full story');
      setFullStoryProgress({ current: 0, total: 0, status: '', phase: '' });
    } finally {
      setIsGeneratingFullStory(false);
    }
  }, [result, fullResponse, savedStoryId, coverArtUrl, fetchStories, handleSaveToLibrary]);

  // Handle canceling an in-progress full story generation
  const handleCancelFullStoryGeneration = useCallback(async () => {
    if (!fullStoryJobId) return;

    try {
      await storyGenerationService.cancelFullStoryGeneration(fullStoryJobId);
      setFullStoryJobId(null);
      setIsGeneratingFullStory(false);
      setFullStoryProgress({ current: 0, total: 0, status: 'Cancelled', phase: '' });
    } catch (err) {
      console.error('Failed to cancel generation:', err);
    }
  }, [fullStoryJobId]);

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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                  {/* Primary Actions */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Save to Library - Required first */}
                    <Button
                      variant={savedStoryId ? 'outlined' : 'contained'}
                      startIcon={
                        savedStoryId ? <CheckCircleIcon /> :
                        isSaving ? <CircularProgress size={18} color="inherit" /> :
                        <SaveIcon />
                      }
                      disabled={isSaving || !!savedStoryId}
                      sx={{
                        px: 3,
                        py: 1.5,
                        ...(savedStoryId ? {
                          borderColor: '#4CAF50',
                          color: '#4CAF50',
                        } : {
                          background: studioColors.accent,
                          color: '#fff',
                        }),
                        '&:hover': {
                          borderColor: savedStoryId ? '#4CAF50' : studioColors.accentMuted,
                          background: savedStoryId ? `#4CAF5010` : studioColors.accentMuted,
                        },
                        '&.Mui-disabled': {
                          borderColor: savedStoryId ? '#4CAF50' : studioColors.border,
                          color: savedStoryId ? '#4CAF50' : studioColors.textMuted,
                          background: savedStoryId ? 'transparent' : studioColors.surface3,
                        },
                      }}
                      onClick={handleSaveToLibrary}
                    >
                      {savedStoryId ? 'Saved to Library' : isSaving ? 'Saving...' : '1. Save to Library'}
                    </Button>

                    {/* Generate Full Story - Requires save first */}
                    <Button
                      variant="contained"
                      startIcon={isGeneratingFullStory ? <CircularProgress size={18} color="inherit" /> : <MovieCreationIcon />}
                      disabled={isGeneratingFullStory || !savedStoryId || !!fullStoryResult}
                      sx={{
                        px: 3,
                        py: 1.5,
                        background: fullStoryResult
                          ? '#4CAF50'
                          : `linear-gradient(135deg, ${studioColors.accent} 0%, #9C27B0 100%)`,
                        color: '#fff',
                        fontWeight: 600,
                        '&:hover': {
                          background: fullStoryResult
                            ? '#43A047'
                            : `linear-gradient(135deg, ${studioColors.accentMuted} 0%, #7B1FA2 100%)`,
                        },
                        '&.Mui-disabled': {
                          background: !savedStoryId ? studioColors.surface3 : (fullStoryResult ? '#4CAF50' : studioColors.surface3),
                          color: fullStoryResult ? '#fff' : studioColors.textMuted,
                        },
                      }}
                      onClick={handleGenerateFullStory}
                    >
                      {fullStoryResult
                        ? `Generated ${fullStoryResult.totalWordCount.toLocaleString()} words`
                        : isGeneratingFullStory
                          ? 'Generating...'
                          : savedStoryId
                            ? '2. Generate Full Story with Images'
                            : '2. Save first to enable'}
                    </Button>

                    {/* Cancel button - only shown during generation */}
                    {isGeneratingFullStory && fullStoryJobId && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleCancelFullStoryGeneration}
                        sx={{
                          px: 2,
                          py: 1.5,
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>

                  {/* Secondary Actions */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
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

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        coverArtUrl ? <CheckCircleIcon /> :
                        isGeneratingCover ? <CircularProgress size={16} color="inherit" /> :
                        <ImageIcon />
                      }
                      disabled={isGeneratingCover || !!coverArtUrl}
                      sx={{
                        borderColor: coverArtUrl ? '#4CAF50' : studioColors.border,
                        color: coverArtUrl ? '#4CAF50' : studioColors.textSecondary,
                        '&:hover': {
                          borderColor: studioColors.accent,
                          background: `${studioColors.accent}10`,
                        },
                        '&.Mui-disabled': {
                          borderColor: coverArtUrl ? '#4CAF50' : studioColors.border,
                          color: coverArtUrl ? '#4CAF50' : studioColors.textMuted,
                        },
                      }}
                      onClick={handleGenerateCoverArt}
                    >
                      {coverArtUrl ? 'Cover Generated' : isGeneratingCover ? 'Generating...' : 'Generate Cover Art'}
                    </Button>
                  </Box>

                  {/* Info note about full story generation */}
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      background: `${studioColors.accent}10`,
                      borderRadius: `${studioRadii.md}px`,
                      border: `1px solid ${studioColors.accent}30`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        color: studioColors.textSecondary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 16, color: studioColors.accent }} />
                      {savedStoryId
                        ? 'Ready to generate full story with chapters, cover art, and character portraits'
                        : 'Save your story first, then generate complete chapters with AI-generated illustrations'}
                    </Typography>
                  </Box>

                  {/* Full Story Progress */}
                  {isGeneratingFullStory && fullStoryProgress.total > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                          {fullStoryProgress.status}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                          {fullStoryProgress.current}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={fullStoryProgress.current}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          background: studioColors.surface2,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${studioColors.accent} 0%, #9C27B0 100%)`,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Generated Chapters Display */}
                  {fullStoryResult && fullStoryResult.chapters && fullStoryResult.chapters.length > 0 && (
                    <SurfaceCard sx={{ p: 3, mt: 3 }}>
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
                          Generated Chapters ({fullStoryResult.chapters.length})
                        </Typography>
                        <Chip
                          label={`${fullStoryResult.totalWordCount.toLocaleString()} words`}
                          size="small"
                          sx={{
                            ml: 'auto',
                            background: studioColors.accent,
                            color: '#fff',
                            fontSize: 10,
                          }}
                        />
                        <Chip
                          label={`${fullStoryResult.totalImages} images`}
                          size="small"
                          sx={{
                            background: '#9C27B0',
                            color: '#fff',
                            fontSize: 10,
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {fullStoryResult.chapters.map((chapter) => (
                          <Box
                            key={chapter.chapterNumber}
                            sx={{
                              display: 'flex',
                              gap: 2,
                              p: 2,
                              borderRadius: `${studioRadii.md}px`,
                              background: studioColors.surface2,
                              border: `1px solid ${studioColors.border}`,
                            }}
                          >
                            {/* Chapter Image */}
                            {chapter.headerImageUrl && (
                              <Box
                                component="img"
                                src={chapter.headerImageUrl}
                                alt={`Chapter ${chapter.chapterNumber}`}
                                sx={{
                                  width: 120,
                                  height: 80,
                                  borderRadius: `${studioRadii.sm}px`,
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                }}
                              />
                            )}

                            {/* Chapter Info */}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
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
                                      fontSize: studioTypography.fontSize.xs,
                                      fontWeight: studioTypography.fontWeight.bold,
                                      color: '#fff',
                                    }}
                                  >
                                    {chapter.chapterNumber}
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: studioTypography.fontSize.sm,
                                    fontWeight: studioTypography.fontWeight.semibold,
                                    color: studioColors.textPrimary,
                                  }}
                                >
                                  {chapter.title || `Chapter ${chapter.chapterNumber}`}
                                </Typography>
                                <Chip
                                  label={`${chapter.wordCount.toLocaleString()} words`}
                                  size="small"
                                  sx={{
                                    ml: 'auto',
                                    height: 20,
                                    fontSize: 10,
                                    background: studioColors.surface3,
                                    color: studioColors.textSecondary,
                                  }}
                                />
                              </Box>

                              {chapter.content && (
                                <Typography
                                  sx={{
                                    fontSize: studioTypography.fontSize.xs,
                                    color: studioColors.textSecondary,
                                    lineHeight: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {chapter.content.substring(0, 300)}...
                                </Typography>
                              )}

                              {/* Scene Images */}
                              {chapter.sceneImages && chapter.sceneImages.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                                  {chapter.sceneImages.slice(0, 4).map((scene, idx) => (
                                    scene.imageUrl && (
                                      <Tooltip key={idx} title={scene.caption || scene.prompt || `Scene ${idx + 1}`}>
                                        <Box
                                          component="img"
                                          src={scene.imageUrl}
                                          alt={scene.caption || `Scene ${idx + 1}`}
                                          sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: `${studioRadii.sm}px`,
                                            objectFit: 'cover',
                                            cursor: 'pointer',
                                            '&:hover': {
                                              transform: 'scale(1.1)',
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                            },
                                            transition: 'all 0.2s ease',
                                          }}
                                        />
                                      </Tooltip>
                                    )
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>

                      {/* Character Portraits */}
                      {fullStoryResult.characterPortraits && Object.keys(fullStoryResult.characterPortraits).length > 0 && (
                        <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${studioColors.border}` }}>
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.xs,
                              fontWeight: studioTypography.fontWeight.semibold,
                              color: studioColors.textSecondary,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              mb: 2,
                            }}
                          >
                            Character Portraits
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {Object.entries(fullStoryResult.characterPortraits).map(([name, url]) => (
                              <Tooltip key={name} title={name}>
                                <Box
                                  component="img"
                                  src={url}
                                  alt={name}
                                  sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: `2px solid ${studioColors.accent}`,
                                  }}
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </SurfaceCard>
                  )}

                  {/* Cover Art Preview */}
                  {coverArtUrl && (
                    <Box
                      sx={{
                        mt: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textPrimary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Cover Art
                      </Typography>
                      <Box
                        component="img"
                        src={coverArtUrl}
                        alt={`Cover art for ${result.title}`}
                        sx={{
                          maxWidth: 300,
                          height: 'auto',
                          borderRadius: `${studioRadii.md}px`,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                          border: `1px solid ${studioColors.border}`,
                        }}
                      />
                    </Box>
                  )}

                  {/* Error display */}
                  {error && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: `${studioRadii.md}px`,
                        border: '1px solid rgba(244,67,54,0.3)',
                      }}
                    >
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: '#f44336' }}>
                        {error}
                      </Typography>
                    </Box>
                  )}
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
