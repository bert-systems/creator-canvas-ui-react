/**
 * CreateCarouselFlow - Step-by-step carousel creation wizard
 * Steps: Topic → Slides → Generate → Review
 *
 * Uses parallel API calls for fast generation:
 * 1. /api/social/carousel/plan - Get style seed + slide content (~3-5s)
 * 2. /api/social/carousel/slide/generate - Generate all slides IN PARALLEL (~15-20s)
 * Total: ~20-25s instead of 75-200s sequential
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
  LinearProgress,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import {
  socialMediaService,
  type CarouselResponse,
  type CarouselType,
  type ParallelCarouselResult,
} from '@/services/socialMediaService';
import { downloadService } from '@/services/downloadService';

// Task status for progress tracking
type TaskStatus = 'pending' | 'running' | 'completed' | 'error';

interface SlideTask {
  slideNumber: number;
  status: TaskStatus;
  imageUrl?: string;
  headline?: string;
}

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
  { id: 'modern', label: 'Modern', description: 'Clean contemporary look' },
  { id: 'minimal', label: 'Minimal', description: 'Simple, focused design' },
  { id: 'bold', label: 'Bold', description: 'High impact, vibrant' },
  { id: 'elegant', label: 'Elegant', description: 'Refined, sophisticated' },
  { id: 'playful', label: 'Playful', description: 'Fun, energetic feel' },
  { id: 'editorial', label: 'Editorial', description: 'Magazine-style layout' },
];

// Color schemes
const COLOR_SCHEMES = [
  { id: 'brand', label: 'Brand Colors', colors: ['#3B9B94', '#2D7A74', '#1E5A55'] },
  { id: 'vibrant', label: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] },
  { id: 'pastel', label: 'Pastel', colors: ['#F8B4D9', '#A7D8DE', '#FFEAA7'] },
  { id: 'monochrome', label: 'Monochrome', colors: ['#2D3436', '#636E72', '#B2BEC3'] },
  { id: 'warm', label: 'Warm', colors: ['#E17055', '#FDCB6E', '#FAB1A0'] },
  { id: 'cool', label: 'Cool', colors: ['#74B9FF', '#81ECEC', '#A29BFE'] },
];

// Text overlay styles
const TEXT_OVERLAY_STYLES = [
  { id: 'centered', label: 'Centered', description: 'Text in the center' },
  { id: 'top', label: 'Top Banner', description: 'Header at the top' },
  { id: 'bottom', label: 'Bottom Strip', description: 'Footer caption style' },
  { id: 'split', label: 'Split Screen', description: 'Text on one side' },
  { id: 'minimal', label: 'Minimal', description: 'Small, subtle text' },
];

// Background styles
const BACKGROUND_STYLES = [
  { id: 'solid', label: 'Solid Color', description: 'Clean solid background' },
  { id: 'gradient', label: 'Gradient', description: 'Smooth color blend' },
  { id: 'photo', label: 'Photo', description: 'Full background image' },
  { id: 'pattern', label: 'Pattern', description: 'Textured pattern' },
  { id: 'blur', label: 'Blur Effect', description: 'Blurred background' },
];

// CTA types for carousel
const CTA_TYPES = [
  { id: 'none', label: 'No CTA', description: 'Informational only' },
  { id: 'swipe', label: 'Swipe for More', description: 'Encourage engagement' },
  { id: 'link', label: 'Link in Bio', description: 'Drive traffic' },
  { id: 'shop', label: 'Shop Now', description: 'E-commerce focused' },
  { id: 'learn', label: 'Learn More', description: 'Educational content' },
  { id: 'save', label: 'Save This', description: 'Encourage saves' },
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
  const [colorScheme, setColorScheme] = useState('brand');
  const [textOverlay, setTextOverlay] = useState('centered');
  const [backgroundStyle, setBackgroundStyle] = useState('gradient');
  const [ctaType, setCtaType] = useState('swipe');

  // Progress tracking state
  const [planningComplete, setPlanningComplete] = useState(false);
  const [slideTasks, setSlideTasks] = useState<SlideTask[]>([]);
  const [completedSlides, setCompletedSlides] = useState(0);

  // Generated result
  const [generatedCarousel, setGeneratedCarousel] = useState<CarouselResponse | null>(null);
  const [parallelResult, setParallelResult] = useState<ParallelCarouselResult | null>(null);
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

  // Handle parallel generation
  const handleGenerate = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setPlanningComplete(false);
    setCompletedSlides(0);

    // Initialize slide tasks
    const initialTasks: SlideTask[] = Array.from({ length: slideCount }, (_, i) => ({
      slideNumber: i + 1,
      status: 'pending',
    }));
    setSlideTasks(initialTasks);

    try {
      // Use parallel generation with progress callback
      const result = await socialMediaService.generateCarouselParallel(
        {
          topic,
          platform: 'instagram',
          slideCount,
          carouselType,
          visualStyle: visualStyle as 'modern' | 'minimal' | 'bold' | 'elegant' | 'playful',
          includeCaption: true,
        },
        // Callback when each slide completes
        (slideNumber, slide) => {
          setSlideTasks(prev => prev.map(t =>
            t.slideNumber === slideNumber
              ? { ...t, status: 'completed', imageUrl: slide.imageUrl, headline: slide.headline }
              : t
          ));
          setCompletedSlides(prev => prev + 1);
        }
      );

      // Planning is complete once we have slides
      setPlanningComplete(true);

      // Mark any failed slides
      if (result.errors.length > 0) {
        setSlideTasks(prev => prev.map(t => {
          const hasSlide = result.slides.some(s => s.slideNumber === t.slideNumber);
          return hasSlide ? t : { ...t, status: 'error' };
        }));
      }

      setParallelResult(result);

      // Convert to CarouselResponse format for compatibility
      if (result.slides.length > 0) {
        setGeneratedCarousel({
          slides: result.slides,
          caption: result.caption,
          coverSlide: result.slides[0]?.imageUrl || '',
          metadata: {
            totalSlides: result.slides.length,
            platform: 'instagram',
            dimensions: { width: 1080, height: 1080 },
          },
        });
        setCurrentSlide(0);
        setCurrentStep(3); // Move to review step
      } else {
        setError('No slides were generated. Please try again.');
      }
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto' }}>
            {/* Two-column layout for options */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Left Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Slide Count */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 2,
                    }}
                  >
                    Number of Slides: <strong style={{ color: studioColors.accent }}>{slideCount}</strong>
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
                </SurfaceCard>

                {/* Visual Style */}
                <SurfaceCard sx={{ p: 2.5 }}>
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
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {VISUAL_STYLES.map((style) => (
                      <Box
                        key={style.id}
                        onClick={() => setVisualStyle(style.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          background: visualStyle === style.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${visualStyle === style.id ? studioColors.accent : studioColors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: visualStyle === style.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: visualStyle === style.id ? studioColors.textPrimary : studioColors.textSecondary,
                          }}
                        >
                          {style.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: visualStyle === style.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted,
                          }}
                        >
                          {style.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Color Scheme */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Color Scheme
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {COLOR_SCHEMES.map((scheme) => (
                      <Box
                        key={scheme.id}
                        onClick={() => setColorScheme(scheme.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          background: colorScheme === scheme.id ? studioColors.surface3 : studioColors.surface2,
                          border: `2px solid ${colorScheme === scheme.id ? studioColors.accent : 'transparent'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                          {scheme.colors.map((color, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '4px',
                                background: color,
                                border: '1px solid rgba(255,255,255,0.2)',
                              }}
                            />
                          ))}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: studioColors.textPrimary,
                          }}
                        >
                          {scheme.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>
              </Box>

              {/* Right Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Text Overlay Style */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Text Placement
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {TEXT_OVERLAY_STYLES.map((style) => (
                      <Chip
                        key={style.id}
                        label={style.label}
                        onClick={() => setTextOverlay(style.id)}
                        sx={{
                          background: textOverlay === style.id ? studioColors.accent : studioColors.surface2,
                          color: textOverlay === style.id ? studioColors.textPrimary : studioColors.textSecondary,
                          border: `1px solid ${textOverlay === style.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': {
                            background: textOverlay === style.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Background Style */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Background Style
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {BACKGROUND_STYLES.map((style) => (
                      <Chip
                        key={style.id}
                        label={style.label}
                        onClick={() => setBackgroundStyle(style.id)}
                        sx={{
                          background: backgroundStyle === style.id ? studioColors.accent : studioColors.surface2,
                          color: backgroundStyle === style.id ? studioColors.textPrimary : studioColors.textSecondary,
                          border: `1px solid ${backgroundStyle === style.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': {
                            background: backgroundStyle === style.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* CTA Type */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Call-to-Action Style
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {CTA_TYPES.map((cta) => (
                      <Box
                        key={cta.id}
                        onClick={() => setCtaType(cta.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          background: ctaType === cta.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${ctaType === cta.id ? studioColors.accent : studioColors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: ctaType === cta.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: ctaType === cta.id ? studioColors.textPrimary : studioColors.textSecondary,
                          }}
                        >
                          {cta.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: ctaType === cta.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted,
                          }}
                        >
                          {cta.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>
              </Box>
            </Box>

            {/* Summary Card */}
            <SurfaceCard sx={{ p: 2.5, background: studioColors.surface2 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.xs,
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textTertiary,
                  textTransform: 'uppercase',
                  mb: 1.5,
                }}
              >
                Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip size="small" label={`${slideCount} Slides`} sx={{ background: studioColors.accent, color: '#fff', fontSize: 11 }} />
                <Chip size="small" label={VISUAL_STYLES.find(s => s.id === visualStyle)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                <Chip size="small" label={COLOR_SCHEMES.find(s => s.id === colorScheme)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                <Chip size="small" label={TEXT_OVERLAY_STYLES.find(s => s.id === textOverlay)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                <Chip size="small" label={BACKGROUND_STYLES.find(s => s.id === backgroundStyle)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                {ctaType !== 'none' && (
                  <Chip size="small" label={CTA_TYPES.find(s => s.id === ctaType)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                )}
              </Box>
            </SurfaceCard>
          </Box>
        );

      case 2:
        const progress = slideTasks.length > 0 ? (completedSlides / slideTasks.length) * 100 : 0;

        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              gap: 4,
              maxWidth: 700,
              mx: 'auto',
            }}
          >
            {isProcessing ? (
              <>
                {/* Header */}
                <Box sx={{ textAlign: 'center' }}>
                  <AutoAwesomeIcon sx={{ fontSize: 48, color: studioColors.accent, mb: 2 }} />
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.lg,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                    }}
                  >
                    Creating Your Carousel
                  </Typography>
                  <Typography sx={{ color: studioColors.textSecondary, mt: 1 }}>
                    {!planningComplete
                      ? 'Planning content and style...'
                      : `Generating ${slideTasks.length} slides in parallel`}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      {planningComplete ? 'Generating slides' : 'Planning'}
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      {completedSlides} / {slideTasks.length} complete
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant={planningComplete ? 'determinate' : 'indeterminate'}
                    value={progress}
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

                {/* Slide Grid - Live Preview */}
                {slideTasks.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(slideTasks.length, 5)}, 1fr)`,
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    {slideTasks.map((task) => (
                      <Box
                        key={task.slideNumber}
                        sx={{
                          position: 'relative',
                          aspectRatio: '1/1',
                          borderRadius: `${studioRadii.md}px`,
                          overflow: 'hidden',
                          background: studioColors.surface2,
                          border: `1px solid ${studioColors.border}`,
                        }}
                      >
                        {/* Status overlay or image */}
                        {task.status === 'completed' && task.imageUrl ? (
                          <Box
                            component="img"
                            src={task.imageUrl}
                            alt={`Slide ${task.slideNumber}`}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                            }}
                          >
                            {task.status === 'running' || task.status === 'pending' ? (
                              <CircularProgress size={24} sx={{ color: studioColors.accent }} />
                            ) : task.status === 'error' ? (
                              <ErrorOutlineIcon sx={{ fontSize: 24, color: studioColors.error || '#f44336' }} />
                            ) : null}
                          </Box>
                        )}

                        {/* Slide number badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            left: 4,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: task.status === 'completed'
                              ? (studioColors.success || '#4CAF50')
                              : studioColors.surface3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircleIcon sx={{ fontSize: 14, color: '#fff' }} />
                          ) : (
                            <Typography sx={{ fontSize: 10, color: studioColors.textSecondary, fontWeight: 600 }}>
                              {task.slideNumber}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Performance note */}
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, textAlign: 'center' }}>
                  Generating all slides in parallel for faster results
                </Typography>
              </>
            ) : error ? (
              <>
                <ErrorOutlineIcon sx={{ fontSize: 48, color: studioColors.error || '#f44336' }} />
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

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto' }}>
            {generatedCarousel && (
              <>
                {/* Generation time badge */}
                {parallelResult && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Chip
                      size="small"
                      label={`Generated in ${(parallelResult.totalTimeMs / 1000).toFixed(1)}s`}
                      sx={{
                        background: studioColors.surface2,
                        color: studioColors.textSecondary,
                        fontSize: 11,
                      }}
                    />
                  </Box>
                )}

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

                  <Box sx={{ flex: 1, position: 'relative' }}>
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
