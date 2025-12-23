/**
 * CreateLookbookFlow - Step-by-step wizard for creating fashion lookbooks
 * Steps: Concept → Style → Generate → Refine
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Slider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioRadii, studioTypography } from '../../shared';
import { imageGenerationService } from '@/services/imageGenerationService';
import { downloadService } from '@/services/downloadService';

// ============================================================================
// Types
// ============================================================================

interface LookbookConfig {
  concept: string;
  aesthetic: string;
  lookCount: number;
  colorPalette: string[];
  modelDiversity: boolean;
}

interface GeneratedLook {
  id: string;
  imageUrl: string;
  prompt: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

export interface CreateLookbookFlowProps {
  /** Callback when flow is cancelled */
  onCancel: () => void;
  /** Callback when lookbook is created */
  onComplete: (looks: GeneratedLook[]) => void;
}

// ============================================================================
// Step Components
// ============================================================================

const aestheticOptions = [
  { id: 'minimalist', label: 'Minimalist', description: 'Clean lines, neutral tones' },
  { id: 'maximalist', label: 'Maximalist', description: 'Bold patterns, rich colors' },
  { id: 'streetwear', label: 'Streetwear', description: 'Urban, casual edge' },
  { id: 'bohemian', label: 'Bohemian', description: 'Free-spirited, relaxed' },
  { id: 'avant-garde', label: 'Avant-Garde', description: 'Experimental, artistic' },
  { id: 'classic', label: 'Classic', description: 'Timeless elegance' },
];

const colorPaletteOptions = [
  { id: 'earth', label: 'Earth Tones', colors: ['#8B7355', '#6B5344', '#A08060', '#C4A77D'] },
  { id: 'monochrome', label: 'Monochrome', colors: ['#1a1a1a', '#4a4a4a', '#7a7a7a', '#ffffff'] },
  { id: 'pastels', label: 'Soft Pastels', colors: ['#E8D5D5', '#D5E8E8', '#E8E5D5', '#D5D5E8'] },
  { id: 'bold', label: 'Bold & Vibrant', colors: ['#E63946', '#2A9D8F', '#E9C46A', '#264653'] },
  { id: 'neutral', label: 'Neutral Palette', colors: ['#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242'] },
];

// Step 1: Concept
const ConceptStep: React.FC<{
  concept: string;
  onChange: (concept: string) => void;
}> = ({ concept, onChange }) => (
  <Box sx={{ maxWidth: 600, mx: 'auto' }}>
    <Typography
      sx={{
        fontSize: studioTypography.fontSize.lg,
        fontWeight: studioTypography.fontWeight.medium,
        color: studioColors.textPrimary,
        mb: 1,
        textAlign: 'center',
      }}
    >
      Describe your collection concept
    </Typography>
    <Typography
      sx={{
        fontSize: studioTypography.fontSize.sm,
        color: studioColors.textTertiary,
        mb: 4,
        textAlign: 'center',
      }}
    >
      Tell us about your vision, target audience, or inspiration
    </Typography>

    <TextField
      fullWidth
      multiline
      rows={4}
      placeholder="E.g., A sustainable luxury collection for conscious consumers, featuring organic materials and timeless silhouettes..."
      value={concept}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          background: studioColors.surface1,
          borderRadius: `${studioRadii.md}px`,
          '& fieldset': {
            borderColor: studioColors.border,
          },
          '&:hover fieldset': {
            borderColor: studioColors.borderHover,
          },
          '&.Mui-focused fieldset': {
            borderColor: studioColors.accent,
            borderWidth: 1,
          },
        },
        '& .MuiInputBase-input': {
          color: studioColors.textPrimary,
          fontSize: studioTypography.fontSize.base,
          '&::placeholder': {
            color: studioColors.textTertiary,
            opacity: 1,
          },
        },
      }}
    />

    <Box sx={{ mt: 3 }}>
      <Typography
        sx={{
          fontSize: studioTypography.fontSize.sm,
          color: studioColors.textMuted,
          mb: 1.5,
        }}
      >
        Quick suggestions
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {[
          'Resort wear for summer getaways',
          'Urban professional capsule wardrobe',
          'Gender-neutral streetwear collection',
          'Vintage-inspired evening wear',
        ].map((suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            onClick={() => onChange(suggestion)}
            sx={{
              background: studioColors.surface2,
              color: studioColors.textSecondary,
              borderRadius: `${studioRadii.md}px`,
              '&:hover': {
                background: studioColors.surface3,
                color: studioColors.textPrimary,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  </Box>
);

// Step 2: Style
const StyleStep: React.FC<{
  aesthetic: string;
  colorPalette: string[];
  lookCount: number;
  onAestheticChange: (aesthetic: string) => void;
  onColorPaletteChange: (colors: string[]) => void;
  onLookCountChange: (count: number) => void;
}> = ({
  aesthetic,
  colorPalette,
  lookCount,
  onAestheticChange,
  onColorPaletteChange,
  onLookCountChange,
}) => (
  <Box sx={{ maxWidth: 700, mx: 'auto' }}>
    {/* Aesthetic selection */}
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontSize: studioTypography.fontSize.md,
          fontWeight: studioTypography.fontWeight.medium,
          color: studioColors.textPrimary,
          mb: 2,
        }}
      >
        Choose your aesthetic
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {aestheticOptions.map((option) => (
          <SurfaceCard
            key={option.id}
            interactive
            selected={aesthetic === option.id}
            padding="md"
            onClick={() => onAestheticChange(option.id)}
            sx={{ flex: '1 1 calc(33.333% - 12px)', minWidth: 150 }}
          >
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.semibold,
                color: aesthetic === option.id ? studioColors.textPrimary : studioColors.textSecondary,
                mb: 0.5,
              }}
            >
              {option.label}
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textTertiary,
              }}
            >
              {option.description}
            </Typography>
          </SurfaceCard>
        ))}
      </Box>
    </Box>

    {/* Color palette selection */}
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontSize: studioTypography.fontSize.md,
          fontWeight: studioTypography.fontWeight.medium,
          color: studioColors.textPrimary,
          mb: 2,
        }}
      >
        Color palette
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {colorPaletteOptions.map((palette) => {
          const isSelected = JSON.stringify(colorPalette) === JSON.stringify(palette.colors);
          return (
            <SurfaceCard
              key={palette.id}
              interactive
              selected={isSelected}
              padding="sm"
              onClick={() => onColorPaletteChange(palette.colors)}
              sx={{ flex: '1 1 calc(20% - 12px)', minWidth: 120 }}
            >
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                {palette.colors.map((color, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      background: color,
                      border: `1px solid ${studioColors.border}`,
                    }}
                  />
                ))}
              </Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  color: isSelected ? studioColors.textPrimary : studioColors.textSecondary,
                }}
              >
                {palette.label}
              </Typography>
            </SurfaceCard>
          );
        })}
      </Box>
    </Box>

    {/* Look count */}
    <Box>
      <Typography
        sx={{
          fontSize: studioTypography.fontSize.md,
          fontWeight: studioTypography.fontWeight.medium,
          color: studioColors.textPrimary,
          mb: 2,
        }}
      >
        Number of looks: {lookCount}
      </Typography>
      <Slider
        value={lookCount}
        onChange={(_, value) => onLookCountChange(value as number)}
        min={3}
        max={12}
        step={1}
        marks={[
          { value: 3, label: '3' },
          { value: 6, label: '6' },
          { value: 9, label: '9' },
          { value: 12, label: '12' },
        ]}
        sx={{
          color: studioColors.accent,
          '& .MuiSlider-track': {
            background: studioColors.accent,
          },
          '& .MuiSlider-rail': {
            background: studioColors.border,
          },
          '& .MuiSlider-thumb': {
            background: studioColors.accent,
            '&:hover': {
              boxShadow: `0 0 0 8px ${studioColors.accentSubtle}`,
            },
          },
          '& .MuiSlider-mark': {
            background: studioColors.border,
          },
          '& .MuiSlider-markLabel': {
            color: studioColors.textTertiary,
            fontSize: studioTypography.fontSize.sm,
          },
        }}
      />
    </Box>
  </Box>
);

// Step 3: Generate
const GenerateStep: React.FC<{
  looks: GeneratedLook[];
  isGenerating: boolean;
  onRegenerate: (lookId: string) => void;
  onDelete: (lookId: string) => void;
}> = ({ looks, isGenerating, onRegenerate, onDelete }) => (
  <Box>
    {isGenerating && looks.length === 0 ? (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress sx={{ color: studioColors.accent, mb: 3 }} />
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.lg,
            color: studioColors.textPrimary,
            mb: 1,
          }}
        >
          Generating your lookbook...
        </Typography>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.sm,
            color: studioColors.textTertiary,
          }}
        >
          This may take a few moments
        </Typography>
      </Box>
    ) : (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {looks.map((look) => (
          <Box
            key={look.id}
            sx={{
              flex: '1 1 calc(25% - 16px)',
              minWidth: 200,
              maxWidth: 280,
            }}
          >
            <SurfaceCard padding="none" sx={{ overflow: 'hidden' }}>
              {/* Image */}
              <Box
                sx={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  background: studioColors.surface2,
                }}
              >
                {look.status === 'generating' ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={32} sx={{ color: studioColors.accent }} />
                  </Box>
                ) : look.status === 'complete' && look.imageUrl ? (
                  <Box
                    component="img"
                    src={look.imageUrl}
                    alt={`Look ${look.id}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : look.status === 'error' ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ color: studioColors.error, fontSize: studioTypography.fontSize.sm }}>
                      Generation failed
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => onRegenerate(look.id)}
                      sx={{ color: studioColors.textSecondary }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                ) : null}

                {/* Overlay actions */}
                {look.status === 'complete' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onRegenerate(look.id)}
                      sx={{
                        background: 'rgba(0,0,0,0.6)',
                        color: studioColors.textPrimary,
                        '&:hover': { background: 'rgba(0,0,0,0.8)' },
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(look.id)}
                      sx={{
                        background: 'rgba(0,0,0,0.6)',
                        color: studioColors.textPrimary,
                        '&:hover': { background: 'rgba(0,0,0,0.8)' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Label */}
              <Box sx={{ p: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.sm,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textPrimary,
                  }}
                >
                  Look {look.id}
                </Typography>
              </Box>
            </SurfaceCard>
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

// Step 4: Refine
const RefineStep: React.FC<{
  looks: GeneratedLook[];
  onDownloadAll: () => void;
}> = ({ looks, onDownloadAll }) => {
  const completedLooks = looks.filter((l) => l.status === 'complete');

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <AutoAwesomeIcon sx={{ fontSize: 48, color: studioColors.accent, mb: 2 }} />
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.xl,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
            mb: 1,
          }}
        >
          Your lookbook is ready!
        </Typography>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.md,
            color: studioColors.textSecondary,
          }}
        >
          {completedLooks.length} looks generated successfully
        </Typography>
      </Box>

      {/* Preview grid */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
        {completedLooks.slice(0, 6).map((look) => (
          <Box
            key={look.id}
            sx={{
              width: 120,
              height: 160,
              borderRadius: `${studioRadii.md}px`,
              overflow: 'hidden',
              border: `1px solid ${studioColors.border}`,
            }}
          >
            <Box
              component="img"
              src={look.imageUrl}
              alt={`Look ${look.id}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        ))}
        {completedLooks.length > 6 && (
          <Box
            sx={{
              width: 120,
              height: 160,
              borderRadius: `${studioRadii.md}px`,
              background: studioColors.surface2,
              border: `1px solid ${studioColors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: studioColors.textSecondary }}>
              +{completedLooks.length - 6} more
            </Typography>
          </Box>
        )}
      </Box>

      {/* Download button */}
      <Box sx={{ textAlign: 'center' }}>
        <IconButton
          onClick={onDownloadAll}
          sx={{
            background: studioColors.surface2,
            color: studioColors.textSecondary,
            p: 2,
            '&:hover': {
              background: studioColors.surface3,
              color: studioColors.textPrimary,
            },
          }}
        >
          <DownloadIcon />
        </IconButton>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.sm,
            color: studioColors.textTertiary,
            mt: 1,
          }}
        >
          Download all images
        </Typography>
      </Box>
    </Box>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const FLOW_STEPS: FlowStep[] = [
  { id: 'concept', label: 'Concept', description: 'Describe your collection vision' },
  { id: 'style', label: 'Style', description: 'Choose aesthetic and colors' },
  { id: 'generate', label: 'Generate', description: 'AI creates your looks' },
  { id: 'refine', label: 'Refine', description: 'Review and export' },
];

export const CreateLookbookFlow: React.FC<CreateLookbookFlowProps> = ({
  onCancel,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<LookbookConfig>({
    concept: '',
    aesthetic: '',
    colorPalette: [],
    lookCount: 6,
    modelDiversity: true,
  });
  const [looks, setLooks] = useState<GeneratedLook[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate looks using image generation service
  const generateLooks = useCallback(async () => {
    setIsGenerating(true);

    // Create placeholder looks
    const placeholderLooks: GeneratedLook[] = Array.from({ length: config.lookCount }, (_, i) => ({
      id: String(i + 1).padStart(2, '0'),
      imageUrl: '',
      prompt: '',
      status: 'generating' as const,
    }));
    setLooks(placeholderLooks);

    // Generate each look
    for (let i = 0; i < config.lookCount; i++) {
      try {
        const aesthetic = aestheticOptions.find((a) => a.id === config.aesthetic);
        const prompt = `Fashion lookbook photo, ${aesthetic?.label || 'modern'} style, ${config.concept}, professional fashion photography, studio lighting, full body shot, high fashion, editorial style`;

        const result = await imageGenerationService.generate({
          prompt,
          model: 'flux-2-pro',
          width: 768,
          height: 1024,
        });

        const imageUrl = result.images?.[0]?.url || '';
        setLooks((prev) =>
          prev.map((look, idx) =>
            idx === i
              ? {
                  ...look,
                  imageUrl,
                  prompt,
                  status: imageUrl ? 'complete' : 'error',
                }
              : look
          )
        );
      } catch (error) {
        console.error(`Failed to generate look ${i + 1}:`, error);
        setLooks((prev) =>
          prev.map((look, idx) =>
            idx === i
              ? {
                  ...look,
                  status: 'error',
                }
              : look
          )
        );
      }
    }

    setIsGenerating(false);
  }, [config]);

  // Handle step change
  const handleStepChange = useCallback(
    (step: number) => {
      // Trigger generation when entering generate step
      if (step === 2 && currentStep === 1) {
        generateLooks();
      }
      setCurrentStep(step);
    },
    [currentStep, generateLooks]
  );

  // Regenerate a single look
  const handleRegenerate = useCallback(
    async (lookId: string) => {
      const lookIndex = looks.findIndex((l) => l.id === lookId);
      if (lookIndex === -1) return;

      setLooks((prev) =>
        prev.map((look) =>
          look.id === lookId ? { ...look, status: 'generating' as const } : look
        )
      );

      try {
        const aesthetic = aestheticOptions.find((a) => a.id === config.aesthetic);
        const prompt = `Fashion lookbook photo, ${aesthetic?.label || 'modern'} style, ${config.concept}, professional fashion photography, studio lighting, full body shot`;

        const result = await imageGenerationService.generate({
          prompt,
          model: 'flux-2-pro',
          width: 768,
          height: 1024,
        });

        const imageUrl = result.images?.[0]?.url || '';
        setLooks((prev) =>
          prev.map((look) =>
            look.id === lookId
              ? {
                  ...look,
                  imageUrl,
                  prompt,
                  status: imageUrl ? 'complete' : 'error',
                }
              : look
          )
        );
      } catch (error) {
        console.error(`Failed to regenerate look ${lookId}:`, error);
        setLooks((prev) =>
          prev.map((look) =>
            look.id === lookId ? { ...look, status: 'error' as const } : look
          )
        );
      }
    },
    [config, looks]
  );

  // Delete a look
  const handleDelete = useCallback((lookId: string) => {
    setLooks((prev) => prev.filter((look) => look.id !== lookId));
  }, []);

  // Download all images
  const handleDownloadAll = useCallback(async () => {
    const completedLooks = looks.filter((l) => l.status === 'complete' && l.imageUrl);

    await downloadService.exportLookbook(
      config.concept || 'lookbook',
      completedLooks.map((l) => l.imageUrl),
      {
        concept: config.concept,
        style: config.aesthetic,
        createdAt: new Date(),
      }
    );
  }, [looks, config]);

  // Complete the flow
  const handleComplete = useCallback(() => {
    onComplete(looks.filter((l) => l.status === 'complete'));
  }, [looks, onComplete]);

  // Determine if current step can proceed
  const canProceed = (() => {
    switch (currentStep) {
      case 0:
        return config.concept.trim().length > 10;
      case 1:
        return config.aesthetic !== '' && config.colorPalette.length > 0;
      case 2:
        return looks.some((l) => l.status === 'complete');
      case 3:
        return true;
      default:
        return true;
    }
  })();

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConceptStep
            concept={config.concept}
            onChange={(concept) => setConfig((prev) => ({ ...prev, concept }))}
          />
        );
      case 1:
        return (
          <StyleStep
            aesthetic={config.aesthetic}
            colorPalette={config.colorPalette}
            lookCount={config.lookCount}
            onAestheticChange={(aesthetic) => setConfig((prev) => ({ ...prev, aesthetic }))}
            onColorPaletteChange={(colorPalette) => setConfig((prev) => ({ ...prev, colorPalette }))}
            onLookCountChange={(lookCount) => setConfig((prev) => ({ ...prev, lookCount }))}
          />
        );
      case 2:
        return (
          <GenerateStep
            looks={looks}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            onDelete={handleDelete}
          />
        );
      case 3:
        return <RefineStep looks={looks} onDownloadAll={handleDownloadAll} />;
      default:
        return null;
    }
  };

  return (
    <FlowMode
      title="Create Lookbook"
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onCancel={onCancel}
      canProceed={canProceed}
      isProcessing={isGenerating}
      nextLabel={currentStep === 1 ? 'Generate' : currentStep === 3 ? 'Save Lookbook' : undefined}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default CreateLookbookFlow;
