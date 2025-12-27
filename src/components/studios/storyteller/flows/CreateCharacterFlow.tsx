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
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography } from '../../shared';
import {
  storyGenerationService,
  type CharacterProfile,
  type CharacterArchetype,
  type CharacterRole,
} from '@/services/storyGenerationService';

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
  const [result, setResult] = useState<CharacterProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      // Generate character
      const response = await storyGenerationService.generateCharacter({
        concept: `${concept}. Personality traits: ${selectedTraits.join(', ')}`,
        archetype,
        role,
        depth,
        generatePortrait: false,
        generateSheet: false,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setResult(response.character);
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
                  Creating Your Character
                </Typography>
                <Typography sx={{ color: studioColors.textSecondary, textAlign: 'center' }}>
                  AI is building a {archetype} {role} with {selectedTraits.join(', ')} traits...
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

      case 4: // Review
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 800, mx: 'auto' }}>
            {result && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: studioColors.surface3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 40, color: studioColors.accent }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize['2xl'],
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textPrimary,
                      }}
                    >
                      {result.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip label={result.role} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                      <Chip label={result.archetype} size="small" sx={{ background: studioColors.surface3 }} />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <SurfaceCard sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>
                      Age
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                      {result.age} years old
                    </Typography>
                  </SurfaceCard>
                  <SurfaceCard sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>
                      Gender
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                      {result.gender}
                    </Typography>
                  </SurfaceCard>
                </Box>

                <SurfaceCard sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textTertiary,
                      textTransform: 'uppercase',
                      mb: 1,
                    }}
                  >
                    Motivation
                  </Typography>
                  <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                    {result.motivation}
                  </Typography>
                </SurfaceCard>

                <SurfaceCard sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textTertiary,
                      textTransform: 'uppercase',
                      mb: 1,
                    }}
                  >
                    Character Arc
                  </Typography>
                  <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                    {result.arc}
                  </Typography>
                </SurfaceCard>

                {result.personality && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textTertiary,
                        textTransform: 'uppercase',
                        mb: 1.5,
                      }}
                    >
                      Personality Traits
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.personality.traits.map((trait, i) => (
                        <Chip key={i} label={trait} size="small" sx={{ background: studioColors.surface3 }} />
                      ))}
                    </Box>
                  </SurfaceCard>
                )}
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
