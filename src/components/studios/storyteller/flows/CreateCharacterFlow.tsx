/**
 * CreateCharacterFlow - Step-by-step character creation wizard
 * Steps: Concept → Traits → Voice → Generate → Review
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Button,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import {
  storyGenerationService,
  type CharacterProfile,
  type CharacterArchetype,
  type CharacterRole,
  type CharacterGenerateResponse,
} from '@/services/storyGenerationService';
import { imageGenerationService } from '@/services/imageGenerationService';
import { useCharacterStore, type StandaloneCharacter } from '@/stores/characterStore';
import { useStoryStore } from '@/stores/storyStore';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'concept', label: 'Concept', description: 'Describe your character' },
  { id: 'role', label: 'Role', description: 'Define their role in the story' },
  { id: 'traits', label: 'Traits', description: 'Set personality and archetype' },
  { id: 'generate', label: 'Generate', description: 'AI creates your character' },
  { id: 'review', label: 'Review', description: 'Review and save' },
];

// Role options
const ROLES: { id: CharacterRole; label: string; description: string }[] = [
  { id: 'protagonist', label: 'Protagonist', description: 'The main character driving the story' },
  { id: 'antagonist', label: 'Antagonist', description: 'The primary opposition to the protagonist' },
  { id: 'deuteragonist', label: 'Deuteragonist', description: 'The secondary main character' },
  { id: 'mentor', label: 'Mentor', description: 'Guide and teacher to the protagonist' },
  { id: 'sidekick', label: 'Sidekick', description: 'Loyal companion to the protagonist' },
  { id: 'love-interest', label: 'Love Interest', description: 'Romantic partner or interest' },
  { id: 'foil', label: 'Foil', description: 'Contrast to highlight protagonist traits' },
  { id: 'comic-relief', label: 'Comic Relief', description: 'Provides humor and levity' },
];

// Archetype options
const ARCHETYPES: { id: CharacterArchetype; label: string }[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'mentor', label: 'Mentor' },
  { id: 'rebel', label: 'Rebel' },
  { id: 'lover', label: 'Lover' },
  { id: 'creator', label: 'Creator' },
  { id: 'ruler', label: 'Ruler' },
  { id: 'caregiver', label: 'Caregiver' },
  { id: 'sage', label: 'Sage' },
  { id: 'innocent', label: 'Innocent' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'everyman', label: 'Everyman' },
  { id: 'jester', label: 'Jester' },
  { id: 'magician', label: 'Magician' },
  { id: 'outlaw', label: 'Outlaw' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'trickster', label: 'Trickster' },
];

// Personality traits
const PERSONALITY_TRAITS = [
  'Brave', 'Cautious', 'Clever', 'Compassionate', 'Confident',
  'Creative', 'Curious', 'Determined', 'Empathetic', 'Honest',
  'Humorous', 'Idealistic', 'Independent', 'Intuitive', 'Loyal',
  'Mysterious', 'Optimistic', 'Patient', 'Pragmatic', 'Resourceful',
  'Stubborn', 'Ambitious', 'Cynical', 'Impulsive', 'Reserved',
];

// Character depth
const DEPTHS: { id: 'basic' | 'standard' | 'deep' | 'comprehensive'; label: string; description: string }[] = [
  { id: 'basic', label: 'Basic', description: 'Essential details only' },
  { id: 'standard', label: 'Standard', description: 'Balanced profile' },
  { id: 'deep', label: 'Deep', description: 'Rich backstory and psychology' },
  { id: 'comprehensive', label: 'Comprehensive', description: 'Full character bible' },
];

interface CreateCharacterFlowProps {
  onCancel: () => void;
  onComplete: (character: CharacterProfile) => void;
}

export const CreateCharacterFlow: React.FC<CreateCharacterFlowProps> = ({ onCancel, onComplete }) => {
  // Stores
  const { createCharacter: saveToCharacterLibrary, createStoryCharacter } = useCharacterStore();
  const { currentStory } = useStoryStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [concept, setConcept] = useState('');
  const [role, setRole] = useState<CharacterRole>('protagonist');
  const [archetype, setArchetype] = useState<CharacterArchetype>('hero');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [depth, setDepth] = useState<'basic' | 'standard' | 'deep' | 'comprehensive'>('standard');

  // Generation state
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState<'character' | 'portrait'>('character');
  const [result, setResult] = useState<CharacterGenerateResponse | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [portraitGenerating, setPortraitGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [savedCharacterId, setSavedCharacterId] = useState<string | null>(null);
  const [isRegeneratingPortrait, setIsRegeneratingPortrait] = useState(false);

  // Toggle trait selection
  const toggleTrait = useCallback((trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait)
        ? prev.filter((t) => t !== trait)
        : prev.length < 5
        ? [...prev, trait]
        : prev
    );
  }, []);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return concept.trim().length >= 10;
      case 1: return true;
      case 2: return selectedTraits.length >= 2;
      case 3: return result !== null;
      case 4: return true;
      default: return false;
    }
  }, [currentStep, concept, selectedTraits, result]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!concept.trim()) return;

    setIsProcessing(true);
    setError(null);
    setGenerationProgress(0);
    setGenerationPhase('character');
    setPortraitUrl(null);

    try {
      // Phase 1: Generate character profile
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 3, 45));
      }, 400);

      const response = await storyGenerationService.generateCharacter({
        concept: `${concept}. Personality traits: ${selectedTraits.join(', ')}`,
        archetype,
        role,
        depth,
        generatePortrait: false,
        generateSheet: false,
      });

      clearInterval(progressInterval);
      setGenerationProgress(50);
      setResult(response);

      // Phase 2: Generate portrait image using the portraitPrompt
      if (response.portraitPrompt) {
        setGenerationPhase('portrait');
        setPortraitGenerating(true);

        const portraitInterval = setInterval(() => {
          setGenerationProgress(prev => Math.min(prev + 5, 95));
        }, 500);

        try {
          const imageResponse = await imageGenerationService.generateFluxPro({
            prompt: response.portraitPrompt,
            width: 1024,
            height: 1024,
            numImages: 1,
            guidanceScale: 3.5,
          });

          clearInterval(portraitInterval);

          if (imageResponse.images && imageResponse.images.length > 0) {
            setPortraitUrl(imageResponse.images[0].url);
          }
        } catch (imgErr) {
          console.error('Portrait generation failed:', imgErr);
          // Don't fail the whole flow if portrait fails
        } finally {
          setPortraitGenerating(false);
        }
      }

      setGenerationProgress(100);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate character');
    } finally {
      setIsProcessing(false);
    }
  }, [concept, selectedTraits, archetype, role, depth]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 3 && currentStep === 2) {
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle save to library
  const handleSaveToLibrary = useCallback(async () => {
    if (!result?.character) return;

    setIsSaving(true);
    try {
      const char = result.character;

      if (currentStory) {
        // Save to current story (uses existing API)
        const savedChar = await createStoryCharacter(currentStory.id, {
          name: char.name,
          fullName: char.name,
          age: char.age,
          gender: char.gender,
          role: char.role,
          archetype: char.archetype,
          briefDescription: char.motivation || char.backstory?.origin,
          fullProfile: {
            personality: char.personality ? {
              traits: char.personality.traits,
              fears: char.fear ? [char.fear] : undefined,
              desires: char.goal ? [char.goal] : undefined,
            } : undefined,
            backstory: char.backstory?.origin,
            motivation: char.motivation,
            arc: char.arc,
          },
          portraitUrl: portraitUrl || undefined,
        });
        setSavedCharacterId(savedChar.id);
      } else {
        // Save as standalone character (local until API available)
        const standaloneChar: Omit<StandaloneCharacter, 'id' | 'createdAt' | 'updatedAt'> = {
          name: char.name,
          fullName: char.name,
          age: char.age,
          gender: char.gender,
          role: char.role,
          archetype: char.archetype,
          briefDescription: char.motivation || char.backstory?.origin,
          fullProfile: {
            personality: char.personality ? {
              traits: char.personality.traits,
              fears: char.fear ? [char.fear] : undefined,
              desires: char.goal ? [char.goal] : undefined,
            } : undefined,
            backstory: char.backstory?.origin,
            motivation: char.motivation,
            arc: char.arc,
          },
          portraitUrl: portraitUrl || undefined,
          portraitPrompt: result.portraitPrompt,
        };
        const saved = await saveToCharacterLibrary(standaloneChar);
        setSavedCharacterId(saved.id);
      }
    } catch (err) {
      console.error('Failed to save character:', err);
      setError(err instanceof Error ? err.message : 'Failed to save character');
    } finally {
      setIsSaving(false);
    }
  }, [result, currentStory, portraitUrl, createStoryCharacter, saveToCharacterLibrary]);

  // Handle regenerate portrait
  const handleRegeneratePortrait = useCallback(async () => {
    if (!result?.portraitPrompt) return;

    setIsRegeneratingPortrait(true);
    try {
      const imageResponse = await imageGenerationService.generateFluxPro({
        prompt: result.portraitPrompt,
        width: 1024,
        height: 1024,
        numImages: 1,
        guidanceScale: 3.5,
      });

      if (imageResponse.images && imageResponse.images.length > 0) {
        setPortraitUrl(imageResponse.images[0].url);
        // Reset saved state since portrait changed
        setSavedCharacterId(null);
      }
    } catch (err) {
      console.error('Failed to regenerate portrait:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate portrait');
    } finally {
      setIsRegeneratingPortrait(false);
    }
  }, [result?.portraitPrompt]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (result) {
      // Include portraitUrl in the character data passed to onComplete
      const characterWithPortrait = {
        ...result.character,
        portraitUrl: portraitUrl || undefined,
      };
      onComplete(characterWithPortrait as CharacterProfile);
    }
  }, [result, portraitUrl, onComplete]);

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
              Describe your character
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={5}
              placeholder="Who is your character? Describe their appearance, background, or what makes them unique. For example: 'A weathered sea captain in her 50s with salt-and-pepper hair, haunted by a shipwreck that claimed her crew twenty years ago.'"
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
                {concept.length} characters (min. 10)
              </Typography>
              {concept.length >= 10 && (
                <Chip
                  label="Ready to continue"
                  size="small"
                  sx={{ background: `${studioColors.accent}20`, color: studioColors.accent }}
                />
              )}
            </Box>
          </Box>
        );

      case 1: // Role
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
              What role does this character play?
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {ROLES.map((r) => (
                <SurfaceCard
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  interactive
                  sx={{
                    p: 2.5,
                    border: role === r.id
                      ? `2px solid ${studioColors.accent}`
                      : `1px solid ${studioColors.border}`,
                    background: role === r.id ? studioColors.surface2 : studioColors.surface1,
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
                    {r.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      color: studioColors.textSecondary,
                    }}
                  >
                    {r.description}
                  </Typography>
                </SurfaceCard>
              ))}
            </Box>
          </Box>
        );

      case 2: // Traits
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
              Define personality and archetype
            </Typography>

            {/* Archetype */}
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1.5,
                }}
              >
                Archetype
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ARCHETYPES.map((a) => (
                  <Chip
                    key={a.id}
                    label={a.label}
                    onClick={() => setArchetype(a.id)}
                    sx={{
                      background: archetype === a.id ? studioColors.accent : studioColors.surface2,
                      color: archetype === a.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${archetype === a.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: archetype === a.id ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Personality Traits */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.sm,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textSecondary,
                  }}
                >
                  Personality Traits
                </Typography>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.xs,
                    color: studioColors.textMuted,
                  }}
                >
                  Select 2-5 traits
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {PERSONALITY_TRAITS.map((trait) => (
                  <Chip
                    key={trait}
                    label={trait}
                    onClick={() => toggleTrait(trait)}
                    size="small"
                    sx={{
                      background: selectedTraits.includes(trait) ? studioColors.accent : studioColors.surface2,
                      color: selectedTraits.includes(trait) ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${selectedTraits.includes(trait) ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: selectedTraits.includes(trait) ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Depth */}
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1.5,
                }}
              >
                Character Depth
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {DEPTHS.map((d) => (
                  <Chip
                    key={d.id}
                    label={d.label}
                    onClick={() => setDepth(d.id)}
                    sx={{
                      background: depth === d.id ? studioColors.accent : studioColors.surface2,
                      color: depth === d.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${depth === d.id ? studioColors.accent : studioColors.border}`,
                    }}
                  />
                ))}
              </Box>
            </Box>
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
                  {generationPhase === 'character' ? 'Creating Your Character' : 'Generating Portrait'}
                </Typography>
                <Typography sx={{ color: studioColors.textSecondary, textAlign: 'center' }}>
                  {generationPhase === 'character'
                    ? `AI is building a ${archetype} ${role} with ${selectedTraits.join(', ')} traits...`
                    : 'Creating a unique portrait based on character details...'}
                </Typography>

                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      {generationPhase === 'character' ? 'Building Profile' : 'Rendering Portrait'}
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
                        background: generationPhase === 'portrait' ? '#8b5cf6' : studioColors.accent,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Phase indicators */}
                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: generationPhase === 'character' ? studioColors.accent : '#10b981'
                    }} />
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      Character Profile
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: generationPhase === 'portrait' ? '#8b5cf6' : studioColors.surface3
                    }} />
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      Portrait Image
                    </Typography>
                  </Box>
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

      case 4: // Review
        const character = result?.character;
        const voiceProfile = result?.voiceProfile;
        const detailedArc = result?.arc;
        const backstoryText = result?.backstory;
        const portraitPrompt = result?.portraitPrompt;

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto', pb: 4 }}>
            {character && (
              <>
                {/* Header with portrait and name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${studioColors.accent}40, ${studioColors.surface3})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `3px solid ${studioColors.accent}`,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {portraitUrl ? (
                      <Box
                        component="img"
                        src={portraitUrl}
                        alt={`Portrait of ${character.name}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : portraitGenerating ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          sx={{
                            width: 60,
                            height: 4,
                            borderRadius: 2,
                            background: studioColors.surface2,
                            '& .MuiLinearProgress-bar': { background: '#8b5cf6' },
                          }}
                        />
                        <Typography sx={{ fontSize: 10, color: studioColors.textMuted }}>
                          Rendering...
                        </Typography>
                      </Box>
                    ) : (
                      <PersonIcon sx={{ fontSize: 50, color: studioColors.accent }} />
                    )}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize['2xl'],
                        fontWeight: studioTypography.fontWeight.bold,
                        color: studioColors.textPrimary,
                      }}
                    >
                      {character.name}
                    </Typography>
                    {character.fullName && character.fullName !== character.name && (
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, mb: 0.5 }}>
                        {character.fullName}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={character.role} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                      <Chip label={character.archetype} size="small" sx={{ background: studioColors.surface3, color: studioColors.textPrimary }} />
                    </Box>
                  </Box>
                </Box>

                {/* Basic Info Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                  <SurfaceCard sx={{ p: 2, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Age</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.lg, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.textPrimary }}>
                      {character.age}
                    </Typography>
                  </SurfaceCard>
                  <SurfaceCard sx={{ p: 2, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Gender</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                      {character.gender}
                    </Typography>
                  </SurfaceCard>
                  {character.appearance?.height && (
                    <SurfaceCard sx={{ p: 2, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Height</Typography>
                      <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                        {character.appearance.height}
                      </Typography>
                    </SurfaceCard>
                  )}
                  {character.appearance?.build && (
                    <SurfaceCard sx={{ p: 2, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Build</Typography>
                      <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                        {character.appearance.build}
                      </Typography>
                    </SurfaceCard>
                  )}
                </Box>

                {/* Appearance Section */}
                {character.appearance && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                      Appearance
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                      {character.appearance.hairColor && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Hair</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                            {character.appearance.hairColor} {character.appearance.hairStyle && `(${character.appearance.hairStyle})`}
                          </Typography>
                        </Box>
                      )}
                      {character.appearance.eyeColor && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Eyes</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                            {character.appearance.eyeColor}
                          </Typography>
                        </Box>
                      )}
                      {character.appearance.skinTone && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Skin</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                            {character.appearance.skinTone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    {character.appearance.style && (
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Style</Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                          {character.appearance.style}
                        </Typography>
                      </Box>
                    )}
                    {character.appearance.distinguishingFeatures && character.appearance.distinguishingFeatures.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Distinguishing Features</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {character.appearance.distinguishingFeatures.map((feature, i) => (
                            <Chip key={i} label={feature} size="small" sx={{ background: studioColors.surface2, fontSize: studioTypography.fontSize.xs }} />
                          ))}
                        </Box>
                      </Box>
                    )}
                    {character.appearance.mannerisms && character.appearance.mannerisms.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Mannerisms</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {character.appearance.mannerisms.map((mannerism, i) => (
                            <Chip key={i} label={mannerism} size="small" variant="outlined" sx={{ borderColor: studioColors.border, fontSize: studioTypography.fontSize.xs }} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </SurfaceCard>
                )}

                {/* Core Traits Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <SurfaceCard sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Motivation</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{character.motivation}</Typography>
                  </SurfaceCard>
                  <SurfaceCard sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Goal</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{character.goal}</Typography>
                  </SurfaceCard>
                  <SurfaceCard sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Greatest Fear</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{character.fear}</Typography>
                  </SurfaceCard>
                  <SurfaceCard sx={{ p: 2.5 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Fatal Flaw</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{character.flaw}</Typography>
                  </SurfaceCard>
                </Box>

                {/* Personality Section */}
                {character.personality && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                      Personality
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {character.personality.traits && character.personality.traits.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Core Traits</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {character.personality.traits.map((trait, i) => (
                              <Chip key={i} label={trait} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {character.personality.strengths && character.personality.strengths.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Strengths</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {character.personality.strengths.map((s, i) => (
                              <Chip key={i} label={s} size="small" sx={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b981' }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {character.personality.weaknesses && character.personality.weaknesses.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Weaknesses</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {character.personality.weaknesses.map((w, i) => (
                              <Chip key={i} label={w} size="small" sx={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef4444' }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {character.personality.quirks && character.personality.quirks.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Quirks</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {character.personality.quirks.map((q, i) => (
                              <Chip key={i} label={q} size="small" variant="outlined" sx={{ borderColor: studioColors.border }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {character.personality.values && character.personality.values.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Values</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {character.personality.values.map((v, i) => (
                              <Chip key={i} label={v} size="small" sx={{ background: studioColors.surface3 }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {(character.personality.mbtiType || character.personality.enneagramType) && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          {character.personality.mbtiType && (
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                              <strong>MBTI:</strong> {character.personality.mbtiType}
                            </Typography>
                          )}
                          {character.personality.enneagramType && (
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                              <strong>Enneagram:</strong> {character.personality.enneagramType}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Backstory Section */}
                {(backstoryText || character.backstory) && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                      Backstory
                    </Typography>
                    {backstoryText && (
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.7, mb: 2, whiteSpace: 'pre-wrap' }}>
                        {backstoryText}
                      </Typography>
                    )}
                    {character.backstory?.origin && !backstoryText && (
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.7 }}>
                        {character.backstory.origin}
                      </Typography>
                    )}
                    {character.backstory?.formativeExperiences && character.backstory.formativeExperiences.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Formative Experiences</Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                          {character.backstory.formativeExperiences.map((exp, i) => (
                            <Typography component="li" key={i} sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, mb: 0.5 }}>
                              {exp}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                    {character.backstory?.secrets && character.backstory.secrets.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Hidden Secrets</Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                          {character.backstory.secrets.map((secret, i) => (
                            <Typography component="li" key={i} sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, fontStyle: 'italic', mb: 0.5 }}>
                              {secret}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </SurfaceCard>
                )}

                {/* Character Arc Section */}
                {detailedArc && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                      Character Arc
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Starting State</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{detailedArc.startingState}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Ending State</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{detailedArc.endingState}</Typography>
                        </Box>
                      </Box>
                      {detailedArc.trigger && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Inciting Trigger</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{detailedArc.trigger}</Typography>
                        </Box>
                      )}
                      {detailedArc.progression && detailedArc.progression.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Progression Steps</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {detailedArc.progression.map((step, i) => (
                              <Chip key={i} label={`${i + 1}. ${step}`} size="small" sx={{ background: studioColors.surface2 }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {detailedArc.climaxChange && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Climax Change</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{detailedArc.climaxChange}</Typography>
                        </Box>
                      )}
                      {detailedArc.lessonLearned && (
                        <Box sx={{ background: `${studioColors.accent}10`, p: 2, borderRadius: 1, borderLeft: `3px solid ${studioColors.accent}` }}>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Lesson Learned</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, fontStyle: 'italic' }}>
                            "{detailedArc.lessonLearned}"
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Voice Profile Section */}
                {voiceProfile && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                      Voice & Speech
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                        {voiceProfile.tone && (
                          <Box>
                            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Tone</Typography>
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{voiceProfile.tone}</Typography>
                          </Box>
                        )}
                        {voiceProfile.pace && (
                          <Box>
                            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Pace</Typography>
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, textTransform: 'capitalize' }}>{voiceProfile.pace}</Typography>
                          </Box>
                        )}
                        {voiceProfile.accent && (
                          <Box>
                            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Accent</Typography>
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{voiceProfile.accent}</Typography>
                          </Box>
                        )}
                      </Box>
                      {voiceProfile.sentenceStructure && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Speech Pattern</Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>{voiceProfile.sentenceStructure}</Typography>
                        </Box>
                      )}
                      {voiceProfile.verbalQuirks && voiceProfile.verbalQuirks.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Verbal Quirks</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {voiceProfile.verbalQuirks.map((q, i) => (
                              <Chip key={i} label={q} size="small" variant="outlined" sx={{ borderColor: studioColors.accent, color: studioColors.accent }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                      {voiceProfile.favoriteExpressions && voiceProfile.favoriteExpressions.length > 0 && (
                        <Box>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Favorite Expressions</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {voiceProfile.favoriteExpressions.map((exp, i) => (
                              <Chip key={i} label={`"${exp}"`} size="small" sx={{ background: studioColors.surface2, fontStyle: 'italic' }} />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Portrait Section with Full Image */}
                {(portraitUrl || portraitPrompt) && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase' }}>
                        Character Portrait
                      </Typography>
                      {portraitUrl && !portraitGenerating && (
                        <Button
                          size="small"
                          onClick={async () => {
                            if (!result?.portraitPrompt) return;
                            setPortraitGenerating(true);
                            try {
                              const imageResponse = await imageGenerationService.generateFluxPro({
                                prompt: result.portraitPrompt,
                                width: 1024,
                                height: 1024,
                                numImages: 1,
                                guidanceScale: 3.5,
                              });
                              if (imageResponse.images && imageResponse.images.length > 0) {
                                setPortraitUrl(imageResponse.images[0].url);
                              }
                            } catch (err) {
                              console.error('Portrait regeneration failed:', err);
                            } finally {
                              setPortraitGenerating(false);
                            }
                          }}
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: studioColors.accent,
                            '&:hover': { background: `${studioColors.accent}20` },
                          }}
                        >
                          Regenerate
                        </Button>
                      )}
                    </Box>

                    {portraitUrl ? (
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box
                          sx={{
                            width: 300,
                            height: 300,
                            borderRadius: 2,
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: `1px solid ${studioColors.border}`,
                          }}
                        >
                          <Box
                            component="img"
                            src={portraitUrl}
                            alt={`Full portrait of ${character.name}`}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        {portraitPrompt && (
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>
                              Generation Prompt
                            </Typography>
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: studioColors.surface2, p: 2, borderRadius: 1 }}>
                              {portraitPrompt}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : portraitGenerating ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
                        <LinearProgress sx={{ width: 200, height: 6, borderRadius: 3, background: studioColors.surface2, '& .MuiLinearProgress-bar': { background: '#8b5cf6' } }} />
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                          Generating portrait with FLUX Pro...
                        </Typography>
                      </Box>
                    ) : portraitPrompt ? (
                      <Box>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>
                          Portrait prompt (image generation pending)
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: studioColors.surface2, p: 2, borderRadius: 1 }}>
                          {portraitPrompt}
                        </Typography>
                        <Button
                          size="small"
                          onClick={async () => {
                            if (!result?.portraitPrompt) return;
                            setPortraitGenerating(true);
                            try {
                              const imageResponse = await imageGenerationService.generateFluxPro({
                                prompt: result.portraitPrompt,
                                width: 1024,
                                height: 1024,
                                numImages: 1,
                                guidanceScale: 3.5,
                              });
                              if (imageResponse.images && imageResponse.images.length > 0) {
                                setPortraitUrl(imageResponse.images[0].url);
                              }
                            } catch (err) {
                              console.error('Portrait generation failed:', err);
                            } finally {
                              setPortraitGenerating(false);
                            }
                          }}
                          sx={{
                            mt: 2,
                            background: studioColors.accent,
                            color: '#fff',
                            '&:hover': { background: studioColors.accentMuted },
                          }}
                        >
                          Generate Portrait Now
                        </Button>
                      </Box>
                    ) : null}
                  </SurfaceCard>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 4 }}>
                  {/* Primary Actions */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={
                        savedCharacterId ? <CheckCircleIcon /> :
                        isSaving ? <CircularProgress size={18} color="inherit" /> :
                        <SaveIcon />
                      }
                      disabled={isSaving || !!savedCharacterId}
                      sx={{
                        px: 3,
                        py: 1.5,
                        background: savedCharacterId
                          ? '#4CAF50'
                          : `linear-gradient(135deg, ${studioColors.accent} 0%, #9C27B0 100%)`,
                        color: '#fff',
                        fontWeight: 600,
                        '&:hover': {
                          background: savedCharacterId
                            ? '#43A047'
                            : `linear-gradient(135deg, ${studioColors.accentMuted} 0%, #7B1FA2 100%)`,
                        },
                        '&.Mui-disabled': {
                          background: savedCharacterId ? '#4CAF50' : studioColors.surface3,
                          color: savedCharacterId ? '#fff' : studioColors.textMuted,
                        },
                      }}
                      onClick={handleSaveToLibrary}
                    >
                      {savedCharacterId
                        ? (currentStory ? 'Added to Story' : 'Saved to Library')
                        : isSaving
                        ? 'Saving...'
                        : (currentStory ? 'Add to Current Story' : 'Save to Character Library')}
                    </Button>

                    {result?.portraitPrompt && (
                      <Button
                        variant="outlined"
                        startIcon={
                          isRegeneratingPortrait ? <CircularProgress size={18} color="inherit" /> :
                          <ImageIcon />
                        }
                        disabled={isRegeneratingPortrait}
                        sx={{
                          borderColor: studioColors.accent,
                          color: studioColors.accent,
                          '&:hover': {
                            borderColor: studioColors.accent,
                            background: `${studioColors.accent}10`,
                          },
                        }}
                        onClick={handleRegeneratePortrait}
                      >
                        {isRegeneratingPortrait ? 'Generating...' : 'Regenerate Portrait'}
                      </Button>
                    )}
                  </Box>

                  {/* Info note */}
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
                      }}
                    >
                      {currentStory
                        ? `Character will be added to "${currentStory.title}"`
                        : 'Standalone characters can be linked to stories later'}
                    </Typography>
                  </Box>

                  {/* Error display */}
                  {error && (
                    <Box
                      sx={{
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
      title="Create Character"
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onCancel={onCancel}
      canProceed={canProceed()}
      isProcessing={isProcessing}
      nextLabel={currentStep === 2 ? 'Generate Character' : undefined}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default CreateCharacterFlow;
