/**
 * CreateCarouselFlow - Step-by-step carousel creation wizard
 * Steps: Topic → Slides → Generate → Review
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Chip,
  CircularProgress,
  Button,
  IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography } from '../../shared';
import { socialMediaService, type CarouselResponse, type CarouselType } from '@/services/socialMediaService';
import { downloadService } from '@/services/downloadService';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'topic', label: 'Topic', description: 'What is your carousel about?' },
  { id: 'slides', label: 'Slides', description: 'Configure your carousel' },
  { id: 'generate', label: 'Generate', description: 'AI creates your slides' },
  { id: 'review', label: 'Review', description: 'Preview and export' },
];

// Carousel types
const CAROUSEL_TYPES: { id: CarouselType; label: string; description: string }[] = [
  { id: 'educational', label: 'Educational', description: 'Tips, tutorials, how-tos' },
  { id: 'product', label: 'Product Showcase', description: 'Feature highlights' },
  { id: 'steps', label: 'Step-by-Step', description: 'Process walkthrough' },
  { id: 'listicle', label: 'Listicle', description: 'Numbered list content' },
  { id: 'story', label: 'Story', description: 'Narrative sequence' },
  { id: 'beforeAfter', label: 'Before/After', description: 'Transformation content' },
];

// Visual styles
const VISUAL_STYLES = [
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'playful', label: 'Playful' },
];

interface CreateCarouselFlowProps {
  onCancel: () => void;
  onComplete: (result: CarouselResponse) => void;
}

export const CreateCarouselFlow: React.FC<CreateCarouselFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [carouselType, setCarouselType] = useState<CarouselType>('educational');
  const [visualStyle, setVisualStyle] = useState('modern');

  // Generated result
  const [generatedCarousel, setGeneratedCarousel] = useState<CarouselResponse | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return topic.trim().length > 10;
      case 1: return true;
      case 2: return generatedCarousel !== null;
      case 3: return true;
      default: return false;
    }
  }, [currentStep, topic, generatedCarousel]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await socialMediaService.generateCarousel({
        topic,
        platform: 'instagram',
        slideCount,
        carouselType,
        visualStyle: visualStyle as 'modern' | 'minimal' | 'bold' | 'elegant' | 'playful',
        includeCaption: true,
      });

      setGeneratedCarousel(result);
      setCurrentSlide(0);
      setCurrentStep(3); // Move to review step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate carousel');
    } finally {
      setIsProcessing(false);
    }
  }, [topic, slideCount, carouselType, visualStyle]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 2 && currentStep === 1) {
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (generatedCarousel) {
      onComplete(generatedCarousel);
    }
  }, [generatedCarousel, onComplete]);

  // Slide navigation
  const nextSlide = () => {
    if (generatedCarousel && currentSlide < generatedCarousel.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
                mb: 2,
              }}
            >
              What's your carousel about?
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="e.g., '5 Tips for Better Product Photography' or 'How Our Product Solves Your Problem'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: studioColors.surface2,
                  color: studioColors.textPrimary,
                  '& fieldset': { borderColor: studioColors.border },
                  '&:hover fieldset': { borderColor: studioColors.borderHover },
                  '&.Mui-focused fieldset': { borderColor: studioColors.accent },
                },
                '& .MuiInputBase-input::placeholder': { color: studioColors.textMuted },
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1.5,
                }}
              >
                Carousel Type
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {CAROUSEL_TYPES.map((type) => (
                  <SurfaceCard
                    key={type.id}
                    onClick={() => setCarouselType(type.id)}
                    interactive
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      border: carouselType === type.id
                        ? `2px solid ${studioColors.accent}`
                        : `1px solid ${studioColors.border}`,
                      background: carouselType === type.id ? studioColors.surface2 : studioColors.surface1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.medium,
                        color: studioColors.textPrimary,
                      }}
                    >
                      {type.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        color: studioColors.textTertiary,
                        mt: 0.5,
                      }}
                    >
                      {type.description}
                    </Typography>
                  </SurfaceCard>
                ))}
              </Box>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 600, mx: 'auto' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 2,
                }}
              >
                Number of Slides: {slideCount}
              </Typography>
              <Slider
                value={slideCount}
                onChange={(_, value) => setSlideCount(value as number)}
                min={3}
                max={10}
                step={1}
                marks
                sx={{
                  color: studioColors.accent,
                  '& .MuiSlider-mark': { background: studioColors.border },
                  '& .MuiSlider-rail': { background: studioColors.surface3 },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>3</Typography>
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>10</Typography>
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
                Visual Style
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {VISUAL_STYLES.map((style) => (
                  <Chip
                    key={style.id}
                    label={style.label}
                    onClick={() => setVisualStyle(style.id)}
                    sx={{
                      background: visualStyle === style.id ? studioColors.accent : studioColors.surface2,
                      color: visualStyle === style.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${visualStyle === style.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: visualStyle === style.id ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <SurfaceCard sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  color: studioColors.textSecondary,
                  textAlign: 'center',
                }}
              >
                Your carousel will have <strong style={{ color: studioColors.textPrimary }}>{slideCount}</strong> slides
                in a <strong style={{ color: studioColors.accent }}>{visualStyle}</strong> style
              </Typography>
            </SurfaceCard>
          </Box>
        );

      case 2:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              gap: 3,
            }}
          >
            {isProcessing ? (
              <>
                <CircularProgress sx={{ color: studioColors.accent }} />
                <Typography sx={{ color: studioColors.textSecondary }}>
                  Creating {slideCount} carousel slides...
                </Typography>
              </>
            ) : error ? (
              <>
                <Typography sx={{ color: studioColors.error }}>{error}</Typography>
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

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto' }}>
            {generatedCarousel && (
              <>
                {/* Slide viewer */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    sx={{
                      color: studioColors.textSecondary,
                      '&.Mui-disabled': { color: studioColors.textMuted },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>

                  <Box sx={{ flex: 1 }}>
                    <SurfaceCard sx={{ p: 0, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          aspectRatio: '1/1',
                          background: studioColors.surface2,
                          backgroundImage: generatedCarousel.slides[currentSlide]?.imageUrl
                            ? `url(${generatedCarousel.slides[currentSlide].imageUrl})`
                            : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {!generatedCarousel.slides[currentSlide]?.imageUrl && (
                          <Typography sx={{ color: studioColors.textMuted }}>
                            Slide {currentSlide + 1}
                          </Typography>
                        )}
                      </Box>
                    </SurfaceCard>

                    {/* Slide info */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      {generatedCarousel.slides[currentSlide]?.headline && (
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.md,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: studioColors.textPrimary,
                          }}
                        >
                          {generatedCarousel.slides[currentSlide].headline}
                        </Typography>
                      )}
                      {generatedCarousel.slides[currentSlide]?.bodyText && (
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            color: studioColors.textSecondary,
                            mt: 0.5,
                          }}
                        >
                          {generatedCarousel.slides[currentSlide].bodyText}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <IconButton
                    onClick={nextSlide}
                    disabled={currentSlide === generatedCarousel.slides.length - 1}
                    sx={{
                      color: studioColors.textSecondary,
                      '&.Mui-disabled': { color: studioColors.textMuted },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Box>

                {/* Slide indicators */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  {generatedCarousel.slides.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: index === currentSlide ? studioColors.accent : studioColors.surface3,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </Box>

                {/* Caption */}
                {generatedCarousel.caption && (
                  <SurfaceCard sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.xs,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textTertiary,
                          textTransform: 'uppercase',
                        }}
                      >
                        Caption
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigator.clipboard.writeText(generatedCarousel.caption?.text || '')}
                        sx={{ color: studioColors.textSecondary, fontSize: 12 }}
                      >
                        Copy
                      </Button>
                    </Box>
                    <Typography sx={{ color: studioColors.textPrimary, fontSize: studioTypography.fontSize.sm }}>
                      {generatedCarousel.caption.text}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={async () => {
                      if (generatedCarousel) {
                        await downloadService.exportCarousel(
                          topic,
                          generatedCarousel.slides.map(s => ({
                            imageUrl: s.imageUrl,
                            headline: s.headline,
                            bodyText: s.bodyText,
                          })),
                          generatedCarousel.caption?.text
                        );
                      }
                    }}
                    sx={{
                      background: studioColors.accent,
                      color: studioColors.textPrimary,
                      px: 4,
                      '&:hover': { background: studioColors.accentMuted },
                    }}
                  >
                    Download All Slides
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
      title="Create Carousel"
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onCancel={onCancel}
      canProceed={canProceed()}
      isProcessing={isProcessing}
      nextLabel={currentStep === 1 ? 'Generate' : undefined}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default CreateCarouselFlow;
