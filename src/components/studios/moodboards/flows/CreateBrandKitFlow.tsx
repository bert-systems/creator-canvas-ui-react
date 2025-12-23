/**
 * CreateBrandKitFlow - Step-by-step brand kit creation wizard
 * Steps: Brand → Colors → Typography → Export
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import { moodboardService, type IndustryType, type BrandPersonality, type BrandKit } from '@/services/moodboardService';
import { downloadService } from '@/services/downloadService';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'brand', label: 'Brand', description: 'Tell us about your brand' },
  { id: 'personality', label: 'Personality', description: 'Define your brand voice' },
  { id: 'generate', label: 'Generate', description: 'AI creates your kit' },
  { id: 'export', label: 'Export', description: 'Download your assets' },
];

// Industry types
const INDUSTRIES: { id: IndustryType; label: string }[] = [
  { id: 'tech', label: 'Technology' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'health', label: 'Health & Wellness' },
  { id: 'finance', label: 'Finance' },
  { id: 'creative', label: 'Creative Agency' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'education', label: 'Education' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'travel', label: 'Travel' },
];

// Brand personalities
const PERSONALITIES: { id: BrandPersonality; label: string; description: string }[] = [
  { id: 'professional', label: 'Professional', description: 'Trustworthy and reliable' },
  { id: 'playful', label: 'Playful', description: 'Fun and approachable' },
  { id: 'luxury', label: 'Luxury', description: 'Premium and exclusive' },
  { id: 'modern', label: 'Modern', description: 'Contemporary and innovative' },
  { id: 'organic', label: 'Organic', description: 'Natural and authentic' },
  { id: 'bold', label: 'Bold', description: 'Confident and striking' },
  { id: 'minimal', label: 'Minimal', description: 'Clean and focused' },
  { id: 'vintage', label: 'Vintage', description: 'Classic and timeless' },
];

interface CreateBrandKitFlowProps {
  onCancel: () => void;
  onComplete: (result: BrandKit) => void;
}

export const CreateBrandKitFlow: React.FC<CreateBrandKitFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('creative');
  const [personality, setPersonality] = useState<BrandPersonality>('modern');
  const [targetAudience, setTargetAudience] = useState('');

  // Generated result
  const [generatedKit, setGeneratedKit] = useState<BrandKit | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return brandName.trim().length > 1 && brandDescription.trim().length > 10;
      case 1: return true;
      case 2: return generatedKit !== null;
      case 3: return true;
      default: return false;
    }
  }, [currentStep, brandName, brandDescription, generatedKit]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await moodboardService.generateBrandKit({
        brandDescription: `${brandName}: ${brandDescription}${targetAudience ? ` Target audience: ${targetAudience}` : ''}`,
        industry,
        brandPersonality: personality,
        includeTypography: true,
        includePatterns: true,
        includeIconography: false,
      });

      // Extract brandKit from response and ensure it has the brandName we used
      const kit = result.brandKit;
      if (kit) {
        kit.name = kit.name || brandName;
      }
      setGeneratedKit(kit);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brand kit');
    } finally {
      setIsProcessing(false);
    }
  }, [brandName, brandDescription, industry, personality, targetAudience]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 2 && currentStep === 1) {
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (generatedKit) {
      onComplete(generatedKit);
    }
  }, [generatedKit, onComplete]);

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
              Tell us about your brand
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
                Brand Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Your brand or company name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
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
                Brand Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="What does your brand do? What makes it unique?"
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
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
                  mb: 1.5,
                }}
              >
                Industry
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {INDUSTRIES.map((ind) => (
                  <Chip
                    key={ind.id}
                    label={ind.label}
                    onClick={() => setIndustry(ind.id)}
                    sx={{
                      background: industry === ind.id ? studioColors.accent : studioColors.surface2,
                      color: industry === ind.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${industry === ind.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: industry === ind.id ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
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
                Brand Personality
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                {PERSONALITIES.map((p) => (
                  <SurfaceCard
                    key={p.id}
                    onClick={() => setPersonality(p.id)}
                    interactive
                    sx={{
                      p: 2,
                      border: personality === p.id
                        ? `2px solid ${studioColors.accent}`
                        : `1px solid ${studioColors.border}`,
                      background: personality === p.id ? studioColors.surface2 : studioColors.surface1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.medium,
                        color: studioColors.textPrimary,
                      }}
                    >
                      {p.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        color: studioColors.textTertiary,
                        mt: 0.5,
                      }}
                    >
                      {p.description}
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
                  mb: 1,
                }}
              >
                Target Audience (optional)
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g., Young professionals aged 25-40 interested in sustainability"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
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
                  Creating brand kit for {brandName}...
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
            {generatedKit && (
              <>
                {/* Brand name header */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize['2xl'],
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                    }}
                  >
                    {generatedKit.name}
                  </Typography>
                </Box>

                {/* Color palette */}
                <SurfaceCard sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textTertiary,
                      textTransform: 'uppercase',
                      mb: 2,
                    }}
                  >
                    Color Palette
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {generatedKit.colorPalette?.colors?.map((color, i) => (
                      <Box
                        key={i}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            aspectRatio: '1/1',
                            borderRadius: `${studioRadii.md}px`,
                            background: color.hex,
                            border: `1px solid ${studioColors.border}`,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: studioColors.textSecondary,
                            fontFamily: 'monospace',
                          }}
                        >
                          {color.hex}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: studioColors.textTertiary,
                            textTransform: 'capitalize',
                          }}
                        >
                          {color.usage}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Typography */}
                {generatedKit.typography && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textTertiary,
                        textTransform: 'uppercase',
                        mb: 2,
                      }}
                    >
                      Typography
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.xs, mb: 0.5 }}>
                          Primary Font
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.lg,
                            fontWeight: studioTypography.fontWeight.semibold,
                            color: studioColors.textPrimary,
                          }}
                        >
                          {generatedKit.typography.primary?.family || 'Inter'}
                        </Typography>
                      </Box>
                      {generatedKit.typography.secondary && (
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.xs, mb: 0.5 }}>
                            Secondary Font
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.lg,
                              fontWeight: studioTypography.fontWeight.semibold,
                              color: studioColors.textPrimary,
                            }}
                          >
                            {generatedKit.typography.secondary.family}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Voice and tone */}
                {generatedKit.voiceAndTone && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.xs,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textTertiary,
                          textTransform: 'uppercase',
                        }}
                      >
                        Voice & Tone
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigator.clipboard.writeText(generatedKit.voiceAndTone || '')}
                        sx={{ color: studioColors.textSecondary, fontSize: 12 }}
                      >
                        Copy
                      </Button>
                    </Box>
                    <Typography sx={{ color: studioColors.textSecondary, fontSize: studioTypography.fontSize.sm }}>
                      {generatedKit.voiceAndTone}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      if (generatedKit) {
                        downloadService.exportBrandKit(
                          generatedKit.name || brandName,
                          generatedKit.colorPalette?.colors?.map(c => ({
                            name: c.name,
                            hex: c.hex,
                          })) || [],
                          {
                            primary: generatedKit.typography?.primary?.family,
                            secondary: generatedKit.typography?.secondary?.family,
                          },
                          generatedKit.voiceAndTone
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
                    Download Brand Kit
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
      title="Create Brand Kit"
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

export default CreateBrandKitFlow;
