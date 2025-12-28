/**
 * CreateBrandKitFlow - Step-by-step brand kit creation wizard
 * Steps: Brand → Personality → Generate → Export
 *
 * Features beautiful presentation of generated brand kits with:
 * - Moodboard hero image
 * - Color palette swatches
 * - Typography preview with dynamic Google Fonts loading
 * - Voice & Tone section
 * - Usage Guidelines
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaletteIcon from '@mui/icons-material/Palette';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ImageIcon from '@mui/icons-material/Image';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import { moodboardService, type IndustryType, type BrandPersonality, type BrandKit } from '@/services/moodboardService';
import { downloadService } from '@/services/downloadService';

// ==================== HELPERS ====================

/**
 * Load Google Fonts dynamically for typography preview
 */
function loadGoogleFont(fontName: string): void {
  if (!fontName) return;
  const cleanName = fontName.replace(/[^a-zA-Z\s]/g, '').trim();
  if (!cleanName) return;

  const fontId = `google-font-${cleanName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/**
 * Check if brand kit has valid structured data
 */
function hasValidColorData(kit: BrandKit): boolean {
  return (kit.colorPalette?.colors?.length ?? 0) > 0;
}

function hasValidTypographyData(kit: BrandKit): boolean {
  const primary = kit.typography?.primary;
  return !!(primary?.name && !primary.name.includes('*'));
}

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

// Color preferences
const COLOR_PREFERENCES = [
  { id: 'warm', label: 'Warm Tones', colors: ['#E17055', '#FDCB6E', '#FAB1A0'], description: 'Inviting, friendly' },
  { id: 'cool', label: 'Cool Tones', colors: ['#74B9FF', '#81ECEC', '#A29BFE'], description: 'Calm, professional' },
  { id: 'neutral', label: 'Neutral', colors: ['#636E72', '#B2BEC3', '#DFE6E9'], description: 'Versatile, balanced' },
  { id: 'vibrant', label: 'Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'], description: 'Energetic, bold' },
  { id: 'earth', label: 'Earth Tones', colors: ['#8D6E63', '#A1887F', '#5D4037'], description: 'Natural, organic' },
  { id: 'monochrome', label: 'Monochrome', colors: ['#2D3436', '#636E72', '#B2BEC3'], description: 'Sophisticated, clean' },
];

// Typography style preferences
const TYPOGRAPHY_STYLES = [
  { id: 'modern-sans', label: 'Modern Sans', description: 'Clean, contemporary' },
  { id: 'classic-serif', label: 'Classic Serif', description: 'Elegant, traditional' },
  { id: 'geometric', label: 'Geometric', description: 'Bold, architectural' },
  { id: 'humanist', label: 'Humanist', description: 'Friendly, approachable' },
  { id: 'display', label: 'Display', description: 'Unique, statement' },
  { id: 'mixed', label: 'Mixed Pairing', description: 'Serif + Sans combo' },
];

// Visual weight
const VISUAL_WEIGHTS = [
  { id: 'light', label: 'Light & Airy', description: 'Minimal, breathing room' },
  { id: 'balanced', label: 'Balanced', description: 'Even visual weight' },
  { id: 'bold', label: 'Bold & Dense', description: 'Strong presence' },
];

// Design era influences
const DESIGN_ERAS = [
  { id: 'contemporary', label: 'Contemporary', description: '2020s design trends' },
  { id: 'midcentury', label: 'Mid-Century', description: '1950s-60s inspired' },
  { id: 'artdeco', label: 'Art Deco', description: '1920s glamour' },
  { id: 'minimalist', label: 'Minimalist', description: 'Less is more' },
  { id: 'maximalist', label: 'Maximalist', description: 'Bold and expressive' },
  { id: 'scandinavian', label: 'Scandinavian', description: 'Nordic simplicity' },
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
  const [colorPreference, setColorPreference] = useState('neutral');
  const [typographyStyle, setTypographyStyle] = useState('modern-sans');
  const [visualWeight, setVisualWeight] = useState('balanced');
  const [designEra, setDesignEra] = useState('contemporary');

  // Generated result - includes full API response for moodboard URL
  const [generatedKit, setGeneratedKit] = useState<BrandKit | null>(null);
  const [moodboardUrl, setMoodboardUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Load fonts when kit is generated
  useEffect(() => {
    if (generatedKit?.typography?.primary?.name) {
      loadGoogleFont(generatedKit.typography.primary.name);
    }
    if (generatedKit?.typography?.secondary?.name) {
      loadGoogleFont(generatedKit.typography.secondary.name);
    }
  }, [generatedKit]);

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
        // Use the user-provided brand name for display (API may embed markdown in name)
        kit.name = brandName;
      }
      setGeneratedKit(kit);
      // Store the moodboard URL from the response
      setMoodboardUrl(result.moodboard || '');
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brand kit');
    } finally {
      setIsProcessing(false);
    }
  }, [brandName, brandDescription, industry, personality, targetAudience]);

  // Copy text to clipboard with feedback
  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(`${label} copied!`);
  }, []);

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 950, mx: 'auto' }}>
            {/* Two-column layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Left Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Brand Personality */}
                <SurfaceCard sx={{ p: 2.5 }}>
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
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {PERSONALITIES.map((p) => (
                      <Box
                        key={p.id}
                        onClick={() => setPersonality(p.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          border: personality === p.id
                            ? `2px solid ${studioColors.accent}`
                            : `1px solid ${studioColors.border}`,
                          background: personality === p.id ? studioColors.accent : studioColors.surface2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: personality === p.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: personality === p.id ? studioColors.textPrimary : studioColors.textSecondary,
                          }}
                        >
                          {p.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: personality === p.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted,
                          }}
                        >
                          {p.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Color Preference */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Color Preference
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {COLOR_PREFERENCES.map((color) => (
                      <Box
                        key={color.id}
                        onClick={() => setColorPreference(color.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          background: colorPreference === color.id ? studioColors.surface3 : studioColors.surface2,
                          border: `2px solid ${colorPreference === color.id ? studioColors.accent : 'transparent'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                          {color.colors.map((c, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '4px',
                                background: c,
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
                          {color.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 10,
                            color: studioColors.textMuted,
                          }}
                        >
                          {color.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Target Audience */}
                <SurfaceCard sx={{ p: 2.5 }}>
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
                </SurfaceCard>
              </Box>

              {/* Right Column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Typography Style */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Typography Style
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {TYPOGRAPHY_STYLES.map((typo) => (
                      <Box
                        key={typo.id}
                        onClick={() => setTypographyStyle(typo.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          background: typographyStyle === typo.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${typographyStyle === typo.id ? studioColors.accent : studioColors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: typographyStyle === typo.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: typographyStyle === typo.id ? studioColors.textPrimary : studioColors.textSecondary,
                          }}
                        >
                          {typo.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: typographyStyle === typo.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted,
                          }}
                        >
                          {typo.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Visual Weight */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Visual Weight
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {VISUAL_WEIGHTS.map((weight) => (
                      <Chip
                        key={weight.id}
                        label={weight.label}
                        onClick={() => setVisualWeight(weight.id)}
                        sx={{
                          background: visualWeight === weight.id ? studioColors.accent : studioColors.surface2,
                          color: visualWeight === weight.id ? studioColors.textPrimary : studioColors.textSecondary,
                          border: `1px solid ${visualWeight === weight.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': {
                            background: visualWeight === weight.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Design Era */}
                <SurfaceCard sx={{ p: 2.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textSecondary,
                      mb: 1.5,
                    }}
                  >
                    Design Era / Influence
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {DESIGN_ERAS.map((era) => (
                      <Box
                        key={era.id}
                        onClick={() => setDesignEra(era.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          background: designEra === era.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${designEra === era.id ? studioColors.accent : studioColors.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: designEra === era.id ? studioColors.accentMuted : studioColors.surface3,
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: designEra === era.id ? studioColors.textPrimary : studioColors.textSecondary,
                          }}
                        >
                          {era.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: designEra === era.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted,
                          }}
                        >
                          {era.description}
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
                Brand Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip size="small" label={PERSONALITIES.find(p => p.id === personality)?.label} sx={{ background: studioColors.accent, color: '#fff', fontSize: 11 }} />
                <Chip size="small" label={COLOR_PREFERENCES.find(c => c.id === colorPreference)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                <Chip size="small" label={TYPOGRAPHY_STYLES.find(t => t.id === typographyStyle)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                <Chip size="small" label={VISUAL_WEIGHTS.find(w => w.id === visualWeight)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
                <Chip size="small" label={DESIGN_ERAS.find(e => e.id === designEra)?.label} sx={{ background: studioColors.surface3, color: studioColors.textPrimary, fontSize: 11 }} />
              </Box>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1000, mx: 'auto', pb: 4 }}>
            {generatedKit && (
              <>
                {/* Hero Section - Moodboard + Brand Name */}
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: `${studioRadii.lg}px`,
                    overflow: 'hidden',
                    background: studioColors.surface1,
                    border: `1px solid ${studioColors.border}`,
                  }}
                >
                  {/* Moodboard Image */}
                  {moodboardUrl ? (
                    <Box
                      component="img"
                      src={moodboardUrl}
                      alt={`${generatedKit.name} Moodboard`}
                      sx={{
                        width: '100%',
                        height: 320,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${studioColors.surface2} 0%, ${studioColors.surface1} 100%)`,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 64, color: studioColors.textMuted }} />
                    </Box>
                  )}

                  {/* Brand Name Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      p: 3,
                      pt: 6,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        letterSpacing: '-0.02em',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      {generatedKit.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        color: 'rgba(255,255,255,0.7)',
                        mt: 0.5,
                      }}
                    >
                      Brand Identity Kit
                    </Typography>
                  </Box>
                </Box>

                {/* Two-Column Layout for Colors and Typography */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {/* Color Palette Section */}
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <PaletteIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textPrimary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Color Palette
                      </Typography>
                    </Box>

                    {hasValidColorData(generatedKit) ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {generatedKit.colorPalette.colors.map((color, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 1.5,
                              borderRadius: `${studioRadii.md}px`,
                              background: studioColors.surface2,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                background: studioColors.surface3,
                                transform: 'translateX(4px)',
                              },
                            }}
                            onClick={() => handleCopy(color.hex, color.name)}
                          >
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: `${studioRadii.sm}px`,
                                background: color.hex,
                                border: `1px solid ${studioColors.border}`,
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: studioTypography.fontSize.sm,
                                  fontWeight: studioTypography.fontWeight.medium,
                                  color: studioColors.textPrimary,
                                }}
                              >
                                {color.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  fontFamily: 'monospace',
                                  color: studioColors.textSecondary,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {color.hex}
                              </Typography>
                            </Box>
                            <Tooltip title="Click to copy">
                              <ContentCopyIcon sx={{ fontSize: 14, color: studioColors.textMuted }} />
                            </Tooltip>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          background: studioColors.surface2,
                          borderRadius: `${studioRadii.md}px`,
                          border: `1px dashed ${studioColors.border}`,
                        }}
                      >
                        <Typography sx={{ color: studioColors.textMuted, fontSize: studioTypography.fontSize.sm }}>
                          Color data is being processed...
                        </Typography>
                        <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.xs, mt: 1 }}>
                          Check back soon for structured color values
                        </Typography>
                      </Box>
                    )}
                  </SurfaceCard>

                  {/* Typography Section */}
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                      <TextFieldsIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: studioColors.textPrimary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Typography
                      </Typography>
                    </Box>

                    {hasValidTypographyData(generatedKit) ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Primary Font */}
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: studioColors.textTertiary,
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              mb: 1,
                            }}
                          >
                            Primary Font
                          </Typography>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: `${studioRadii.md}px`,
                              background: studioColors.surface2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 28,
                                fontWeight: 600,
                                color: studioColors.textPrimary,
                                fontFamily: generatedKit.typography.primary?.name || 'inherit',
                                mb: 1,
                              }}
                            >
                              {generatedKit.typography.primary?.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: studioTypography.fontSize.sm,
                                fontFamily: generatedKit.typography.primary?.name || 'inherit',
                                color: studioColors.textSecondary,
                              }}
                            >
                              The quick brown fox jumps over the lazy dog
                            </Typography>
                          </Box>
                        </Box>

                        {/* Secondary Font */}
                        {generatedKit.typography.secondary?.name && (
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: studioColors.textTertiary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                mb: 1,
                              }}
                            >
                              Secondary Font
                            </Typography>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: `${studioRadii.md}px`,
                                background: studioColors.surface2,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 22,
                                  fontWeight: 500,
                                  color: studioColors.textPrimary,
                                  fontFamily: generatedKit.typography.secondary?.name || 'inherit',
                                  mb: 1,
                                }}
                              >
                                {generatedKit.typography.secondary?.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: studioTypography.fontSize.sm,
                                  fontFamily: generatedKit.typography.secondary?.name || 'inherit',
                                  color: studioColors.textSecondary,
                                }}
                              >
                                The quick brown fox jumps over the lazy dog
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          background: studioColors.surface2,
                          borderRadius: `${studioRadii.md}px`,
                          border: `1px dashed ${studioColors.border}`,
                        }}
                      >
                        <Typography sx={{ color: studioColors.textMuted, fontSize: studioTypography.fontSize.sm }}>
                          Typography data is being processed...
                        </Typography>
                        <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.xs, mt: 1 }}>
                          Check back soon for font recommendations
                        </Typography>
                      </Box>
                    )}
                  </SurfaceCard>
                </Box>

                {/* Voice and Tone Section */}
                {generatedKit.voiceAndTone && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <RecordVoiceOverIcon sx={{ fontSize: 20, color: studioColors.accent }} />
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.semibold,
                            color: studioColors.textPrimary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Voice & Tone
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(generatedKit.voiceAndTone || '', 'Voice & Tone')}
                        sx={{ color: studioColors.textSecondary }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        color: studioColors.textSecondary,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {generatedKit.voiceAndTone
                        .replace(/\*\*/g, '')
                        .replace(/\n---[\s\S]*$/i, '')
                        .trim()}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Usage Guidelines Section */}
                {generatedKit.usageGuidelines && (
                  <SurfaceCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                          Usage Guidelines
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(generatedKit.usageGuidelines || '', 'Usage Guidelines')}
                        sx={{ color: studioColors.textSecondary }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        color: studioColors.textSecondary,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {generatedKit.usageGuidelines
                        .replace(/\*\*/g, '')
                        .trim()}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                  {moodboardUrl && (
                    <Button
                      variant="outlined"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => window.open(moodboardUrl, '_blank')}
                      sx={{
                        borderColor: studioColors.border,
                        color: studioColors.textSecondary,
                        '&:hover': {
                          borderColor: studioColors.accent,
                          background: 'rgba(59, 155, 148, 0.1)',
                        },
                      }}
                    >
                      View Full Moodboard
                    </Button>
                  )}
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
                            primary: generatedKit.typography?.primary?.name || generatedKit.typography?.primary?.family,
                            secondary: generatedKit.typography?.secondary?.name || generatedKit.typography?.secondary?.family,
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

            {/* Copy Success Snackbar */}
            <Snackbar
              open={!!copySuccess}
              autoHideDuration={2000}
              onClose={() => setCopySuccess(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setCopySuccess(null)}
                severity="success"
                sx={{
                  background: studioColors.success,
                  color: '#FFFFFF',
                  '& .MuiAlert-icon': { color: '#FFFFFF' },
                }}
              >
                {copySuccess}
              </Alert>
            </Snackbar>
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
