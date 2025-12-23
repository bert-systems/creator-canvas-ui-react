/**
 * CreateMoodboardFlow - Step-by-step moodboard creation wizard
 * Steps: Theme → Style → Generate → Refine
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import { moodboardService, type MoodboardStyle, type MoodTone } from '@/services/moodboardService';
import { downloadService } from '@/services/downloadService';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'theme', label: 'Theme', description: 'Describe your vision' },
  { id: 'style', label: 'Style', description: 'Choose layout and mood' },
  { id: 'generate', label: 'Generate', description: 'AI creates your moodboard' },
  { id: 'refine', label: 'Refine', description: 'Review and export' },
];

// Moodboard styles
const MOODBOARD_STYLES: { id: MoodboardStyle; label: string; description: string }[] = [
  { id: 'collage', label: 'Collage', description: 'Layered, organic layout' },
  { id: 'pinterest', label: 'Pinterest', description: 'Masonry grid layout' },
  { id: 'minimal', label: 'Minimal', description: 'Clean, structured' },
  { id: 'magazine', label: 'Magazine', description: 'Editorial spread' },
  { id: 'scattered', label: 'Scattered', description: 'Creative chaos' },
  { id: 'editorial', label: 'Editorial', description: 'Fashion-forward' },
];

// Mood tones
const MOOD_TONES: { id: MoodTone; label: string }[] = [
  { id: 'light', label: 'Light & Airy' },
  { id: 'dark', label: 'Dark & Moody' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'muted', label: 'Muted' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'serene', label: 'Serene' },
];

// Generated moodboard type
interface GeneratedMoodboard {
  id: string;
  imageUrl: string;
  individualImages: string[];
  colors: { hex: string; name: string }[];
  keywords: string[];
}

interface CreateMoodboardFlowProps {
  onCancel: () => void;
  onComplete: (result: GeneratedMoodboard) => void;
}

export const CreateMoodboardFlow: React.FC<CreateMoodboardFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [theme, setTheme] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState<MoodboardStyle>('collage');
  const [tone, setTone] = useState<MoodTone>('balanced');

  // Generated result
  const [generatedMoodboard, setGeneratedMoodboard] = useState<GeneratedMoodboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return theme.trim().length > 5;
      case 1: return true;
      case 2: return generatedMoodboard !== null;
      case 3: return true;
      default: return false;
    }
  }, [currentStep, theme, generatedMoodboard]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await moodboardService.generateMoodboard({
        theme,
        moodboardStyle: style,
        mood: tone,
        aspectRatio: '16:9',
        imageCount: 9,
        includeTypography: false,
        includeColorPalette: true,
      });

      setGeneratedMoodboard({
        id: `moodboard-${Date.now()}`,
        imageUrl: result.moodboard,
        individualImages: result.individualImages || [],
        colors: result.colorPalette?.colors?.map((c) => ({ hex: c.hex, name: c.name })) || [],
        keywords: result.keywords || [],
      });
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate moodboard');
    } finally {
      setIsProcessing(false);
    }
  }, [theme, keywords, style, tone]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 2 && currentStep === 1) {
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (generatedMoodboard) {
      onComplete(generatedMoodboard);
    }
  }, [generatedMoodboard, onComplete]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
                mb: 2,
              }}
            >
              What's your moodboard about?
            </Typography>

            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                Theme
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., 'Scandinavian winter wedding with natural textures and soft lighting'"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
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
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                Keywords (optional, comma-separated)
              </Typography>
              <TextField
                fullWidth
                placeholder="minimalist, cozy, organic, natural light"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
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
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 700, mx: 'auto' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 2,
                }}
              >
                Layout Style
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {MOODBOARD_STYLES.map((s) => (
                  <SurfaceCard
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    interactive
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      border: style === s.id
                        ? `2px solid ${studioColors.accent}`
                        : `1px solid ${studioColors.border}`,
                      background: style === s.id ? studioColors.surface2 : studioColors.surface1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.medium,
                        color: studioColors.textPrimary,
                      }}
                    >
                      {s.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        color: studioColors.textTertiary,
                        mt: 0.5,
                      }}
                    >
                      {s.description}
                    </Typography>
                  </SurfaceCard>
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
                Mood Tone
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {MOOD_TONES.map((t) => (
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
                  Creating your {style} moodboard...
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
            {generatedMoodboard && (
              <>
                {/* Moodboard preview */}
                <SurfaceCard sx={{ p: 0, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      aspectRatio: '16/9',
                      background: studioColors.surface2,
                      backgroundImage: generatedMoodboard.imageUrl
                        ? `url(${generatedMoodboard.imageUrl})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </SurfaceCard>

                {/* Individual images grid */}
                {generatedMoodboard.individualImages.length > 0 && (
                  <SurfaceCard sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.xs,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textTertiary,
                          textTransform: 'uppercase',
                        }}
                      >
                        Individual Images ({generatedMoodboard.individualImages.length})
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                        onClick={async () => {
                          for (let i = 0; i < generatedMoodboard.individualImages.length; i++) {
                            await downloadService.downloadImage(generatedMoodboard.individualImages[i], {
                              filename: downloadService.generateFilename(
                                `${theme.slice(0, 20) || 'moodboard'}-${i + 1}`,
                                'image',
                                { addTimestamp: i === 0 }
                              ),
                            });
                            // Small delay between downloads
                            if (i < generatedMoodboard.individualImages.length - 1) {
                              await new Promise(resolve => setTimeout(resolve, 300));
                            }
                          }
                        }}
                        sx={{
                          color: studioColors.textSecondary,
                          fontSize: studioTypography.fontSize.xs,
                          '&:hover': {
                            color: studioColors.textPrimary,
                            background: studioColors.surface3,
                          },
                        }}
                      >
                        Download All
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 1.5,
                      }}
                    >
                      {generatedMoodboard.individualImages.map((imgUrl, i) => (
                        <Box
                          key={i}
                          sx={{
                            position: 'relative',
                            aspectRatio: '1/1',
                            borderRadius: `${studioRadii.md}px`,
                            overflow: 'hidden',
                            background: studioColors.surface2,
                            border: `1px solid ${studioColors.border}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: studioColors.accent,
                              transform: 'scale(1.02)',
                              '& .download-overlay': {
                                opacity: 1,
                              },
                            },
                          }}
                          onClick={() => {
                            downloadService.downloadImage(imgUrl, {
                              filename: downloadService.generateFilename(
                                `${theme.slice(0, 20) || 'moodboard'}-${i + 1}`,
                                'image',
                                { addTimestamp: true }
                              ),
                            });
                          }}
                        >
                          <Box
                            component="img"
                            src={imgUrl}
                            alt={`Moodboard image ${i + 1}`}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <Box
                            className="download-overlay"
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.2s ease',
                            }}
                          >
                            <DownloadIcon sx={{ color: studioColors.textPrimary }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Color palette */}
                {generatedMoodboard.colors.length > 0 && (
                  <SurfaceCard sx={{ p: 2 }}>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textTertiary,
                        textTransform: 'uppercase',
                        mb: 2,
                      }}
                    >
                      Extracted Colors
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {generatedMoodboard.colors.map((color, i) => (
                        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: `${studioRadii.sm}px`,
                              background: color.hex,
                              border: `1px solid ${studioColors.border}`,
                            }}
                          />
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                            {color.hex}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Keywords */}
                {generatedMoodboard.keywords.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {generatedMoodboard.keywords.map((keyword, i) => (
                      <Chip
                        key={i}
                        label={keyword}
                        size="small"
                        sx={{
                          background: studioColors.surface2,
                          color: studioColors.textSecondary,
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      if (generatedMoodboard?.imageUrl) {
                        downloadService.downloadImage(generatedMoodboard.imageUrl, {
                          filename: downloadService.generateFilename(
                            theme.slice(0, 30) || 'moodboard',
                            'moodboard',
                            { addTimestamp: true }
                          ),
                        });
                      }
                    }}
                    sx={{
                      background: studioColors.accent,
                      color: studioColors.textPrimary,
                      px: 4,
                      '&:hover': { background: studioColors.accentMuted },
                    }}
                  >
                    Download Moodboard
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
      title="Create Moodboard"
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

export default CreateMoodboardFlow;
