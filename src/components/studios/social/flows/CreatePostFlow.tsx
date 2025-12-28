/**
 * CreatePostFlow - Step-by-step social media post creation wizard
 * Steps: Platform → Content → Generate → Publish
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
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import PinterestIcon from '@mui/icons-material/Pinterest';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import { socialMediaService, type SocialPlatform, type SocialPostResponse } from '@/services/socialMediaService';
import { downloadService } from '@/services/downloadService';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'platform', label: 'Platform', description: 'Choose where to post' },
  { id: 'content', label: 'Content', description: 'Describe your post' },
  { id: 'generate', label: 'Generate', description: 'AI creates your post' },
  { id: 'publish', label: 'Publish', description: 'Review and export' },
];

// Platform options
type PlatformOption = {
  id: SocialPlatform;
  label: string;
  icon: React.ReactNode;
  dimensions: string;
};

const PLATFORMS: PlatformOption[] = [
  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon />, dimensions: '1080×1080' },
  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon />, dimensions: '1200×630' },
  { id: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon />, dimensions: '1200×627' },
  { id: 'twitter', label: 'Twitter/X', icon: <TwitterIcon />, dimensions: '1200×675' },
  { id: 'pinterest', label: 'Pinterest', icon: <PinterestIcon />, dimensions: '1000×1500' },
];

// Content type options
const CONTENT_TYPES = [
  { id: 'promotional', label: 'Promotional' },
  { id: 'educational', label: 'Educational' },
  { id: 'bts', label: 'Behind the Scenes' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'inspirational', label: 'Inspirational' },
];

// Tone options
const TONES = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'playful', label: 'Playful' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'edgy', label: 'Bold' },
];

// Visual style options
const VISUAL_STYLES = [
  { id: 'minimal', label: 'Minimal', description: 'Clean, simple' },
  { id: 'bold', label: 'Bold', description: 'High contrast' },
  { id: 'soft', label: 'Soft', description: 'Muted, gentle' },
  { id: 'vibrant', label: 'Vibrant', description: 'Colorful, energetic' },
  { id: 'moody', label: 'Moody', description: 'Dark, atmospheric' },
  { id: 'natural', label: 'Natural', description: 'Organic, authentic' },
];

// Color scheme options
const COLOR_SCHEMES = [
  { id: 'brand', label: 'Brand Colors', colors: ['#3B9B94', '#1A1A2E', '#EAEAEA'] },
  { id: 'warm', label: 'Warm', colors: ['#FF6B6B', '#FFA07A', '#FFE66D'] },
  { id: 'cool', label: 'Cool', colors: ['#48CAE4', '#90E0EF', '#CAF0F8'] },
  { id: 'neutral', label: 'Neutral', colors: ['#F5F5F5', '#9E9E9E', '#424242'] },
  { id: 'pastel', label: 'Pastel', colors: ['#FFD6E8', '#C1E1C1', '#D4E4ED'] },
  { id: 'earth', label: 'Earth Tones', colors: ['#8D6E63', '#A1887F', '#D7CCC8'] },
];

// CTA type options
const CTA_TYPES = [
  { id: 'none', label: 'No CTA' },
  { id: 'learn-more', label: 'Learn More' },
  { id: 'shop-now', label: 'Shop Now' },
  { id: 'sign-up', label: 'Sign Up' },
  { id: 'contact', label: 'Contact Us' },
  { id: 'link-bio', label: 'Link in Bio' },
];

// Text overlay options
const TEXT_OVERLAY_OPTIONS = [
  { id: 'none', label: 'No Text' },
  { id: 'headline', label: 'Headline Only' },
  { id: 'headline-sub', label: 'Headline + Subtext' },
  { id: 'quote', label: 'Quote/Testimonial' },
  { id: 'stats', label: 'Statistics/Numbers' },
];

interface CreatePostFlowProps {
  onCancel: () => void;
  onComplete: (result: SocialPostResponse) => void;
}

export const CreatePostFlow: React.FC<CreatePostFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('promotional');
  const [tone, setTone] = useState('casual');
  const [includeCaption, setIncludeCaption] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  // Enhanced customization state
  const [visualStyle, setVisualStyle] = useState('minimal');
  const [colorScheme, setColorScheme] = useState('brand');
  const [ctaType, setCtaType] = useState('none');
  const [textOverlay, setTextOverlay] = useState('none');

  // Generated result
  const [generatedPost, setGeneratedPost] = useState<SocialPostResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return selectedPlatform !== null;
      case 1: return topic.trim().length > 10;
      case 2: return generatedPost !== null;
      case 3: return true;
      default: return false;
    }
  }, [currentStep, selectedPlatform, topic, generatedPost]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!selectedPlatform) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await socialMediaService.generatePost({
        topic,
        platform: selectedPlatform,
        contentType: contentType as 'promotional' | 'educational' | 'bts' | 'announcement' | 'inspirational',
        tone: tone as 'professional' | 'casual' | 'playful' | 'luxury' | 'edgy',
        includeCaption,
        includeHashtags,
        hashtagCount: socialMediaService.getRecommendedHashtagCount(selectedPlatform),
      });

      setGeneratedPost(result);
      setCurrentStep(3); // Move to publish step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate post');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlatform, topic, contentType, tone, includeCaption, includeHashtags]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 2 && currentStep === 1) {
      // Trigger generation when entering generate step
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (generatedPost) {
      onComplete(generatedPost);
    }
  }, [generatedPost, onComplete]);

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
              Which platform are you creating for?
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
              {PLATFORMS.map((platform) => (
                <SurfaceCard
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  interactive
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    border: selectedPlatform === platform.id
                      ? `2px solid ${studioColors.accent}`
                      : `1px solid ${studioColors.border}`,
                    background: selectedPlatform === platform.id
                      ? studioColors.surface2
                      : studioColors.surface1,
                  }}
                >
                  <Box sx={{ color: selectedPlatform === platform.id ? studioColors.accent : studioColors.textSecondary }}>
                    {platform.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textPrimary,
                    }}
                  >
                    {platform.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      color: studioColors.textTertiary,
                    }}
                  >
                    {platform.dimensions}
                  </Typography>
                </SurfaceCard>
              ))}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto', pb: 4 }}>
            {/* Topic Input */}
            <SurfaceCard sx={{ p: 2 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1 }}>
                What's your post about?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Describe your post topic, product, or message..."
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
            </SurfaceCard>

            {/* Two column layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Left column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Content Type */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Content Type
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {CONTENT_TYPES.map((type) => (
                      <Chip
                        key={type.id}
                        label={type.label}
                        onClick={() => setContentType(type.id)}
                        sx={{
                          background: contentType === type.id ? studioColors.accent : studioColors.surface2,
                          color: contentType === type.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${contentType === type.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: contentType === type.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Tone */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
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
                          color: tone === t.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${tone === t.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: tone === t.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Visual Style */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Visual Style
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {VISUAL_STYLES.map((style) => (
                      <Box
                        key={style.id}
                        onClick={() => setVisualStyle(style.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.md}px`,
                          cursor: 'pointer',
                          background: visualStyle === style.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${visualStyle === style.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: visualStyle === style.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      >
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: visualStyle === style.id ? '#fff' : studioColors.textPrimary }}>
                          {style.label}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: visualStyle === style.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted }}>
                          {style.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>
              </Box>

              {/* Right column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Color Scheme */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Color Scheme
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {COLOR_SCHEMES.map((scheme) => (
                      <Chip
                        key={scheme.id}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.25 }}>
                              {scheme.colors.map((color, i) => (
                                <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                              ))}
                            </Box>
                            <span style={{ marginLeft: 4 }}>{scheme.label}</span>
                          </Box>
                        }
                        onClick={() => setColorScheme(scheme.id)}
                        sx={{
                          background: colorScheme === scheme.id ? studioColors.accent : studioColors.surface2,
                          color: colorScheme === scheme.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${colorScheme === scheme.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: colorScheme === scheme.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Text Overlay */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Text Overlay
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {TEXT_OVERLAY_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.id}
                        label={opt.label}
                        onClick={() => setTextOverlay(opt.id)}
                        sx={{
                          background: textOverlay === opt.id ? studioColors.accent : studioColors.surface2,
                          color: textOverlay === opt.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${textOverlay === opt.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: textOverlay === opt.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* CTA Type */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Call to Action
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {CTA_TYPES.map((cta) => (
                      <Chip
                        key={cta.id}
                        label={cta.label}
                        onClick={() => setCtaType(cta.id)}
                        sx={{
                          background: ctaType === cta.id ? studioColors.accent : studioColors.surface2,
                          color: ctaType === cta.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${ctaType === cta.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: ctaType === cta.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Caption & Hashtags toggles */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Output Options
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Chip
                      label="Include Caption"
                      onClick={() => setIncludeCaption(!includeCaption)}
                      sx={{
                        background: includeCaption ? studioColors.accent : studioColors.surface2,
                        color: includeCaption ? '#fff' : studioColors.textSecondary,
                        border: `1px solid ${includeCaption ? studioColors.accent : studioColors.border}`,
                      }}
                    />
                    <Chip
                      label="Include Hashtags"
                      onClick={() => setIncludeHashtags(!includeHashtags)}
                      sx={{
                        background: includeHashtags ? studioColors.accent : studioColors.surface2,
                        color: includeHashtags ? '#fff' : studioColors.textSecondary,
                        border: `1px solid ${includeHashtags ? studioColors.accent : studioColors.border}`,
                      }}
                    />
                  </Box>
                </SurfaceCard>
              </Box>
            </Box>

            {/* Summary */}
            <SurfaceCard sx={{ p: 2 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textTertiary, textTransform: 'uppercase', mb: 1 }}>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={selectedPlatform} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                <Chip label={CONTENT_TYPES.find(c => c.id === contentType)?.label} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={TONES.find(t => t.id === tone)?.label} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={VISUAL_STYLES.find(v => v.id === visualStyle)?.label} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={COLOR_SCHEMES.find(c => c.id === colorScheme)?.label} size="small" sx={{ background: studioColors.surface3 }} />
                {textOverlay !== 'none' && <Chip label={TEXT_OVERLAY_OPTIONS.find(t => t.id === textOverlay)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {ctaType !== 'none' && <Chip label={CTA_TYPES.find(c => c.id === ctaType)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {includeCaption && <Chip label="Caption" size="small" sx={{ background: studioColors.success, color: '#fff' }} />}
                {includeHashtags && <Chip label="Hashtags" size="small" sx={{ background: studioColors.success, color: '#fff' }} />}
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
                  Creating your {selectedPlatform} post...
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, mx: 'auto' }}>
            {generatedPost && (
              <>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  {/* Post preview */}
                  <Box sx={{ flex: 1 }}>
                    <SurfaceCard sx={{ p: 0, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          aspectRatio: selectedPlatform === 'pinterest' ? '2/3' : '1/1',
                          background: studioColors.surface2,
                          backgroundImage: generatedPost.postImage ? `url(${generatedPost.postImage})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    </SurfaceCard>
                  </Box>

                  {/* Caption & hashtags */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {generatedPost.caption && (
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
                            onClick={() => navigator.clipboard.writeText(generatedPost.caption?.text || '')}
                            sx={{ color: studioColors.textSecondary, fontSize: 12 }}
                          >
                            Copy
                          </Button>
                        </Box>
                        <Typography sx={{ color: studioColors.textPrimary, fontSize: studioTypography.fontSize.sm }}>
                          {generatedPost.caption.text}
                        </Typography>
                      </SurfaceCard>
                    )}

                    {generatedPost.hashtags && generatedPost.hashtags.length > 0 && (
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
                            Hashtags
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                            onClick={() => navigator.clipboard.writeText(generatedPost.hashtags?.join(' ') || '')}
                            sx={{ color: studioColors.textSecondary, fontSize: 12 }}
                          >
                            Copy
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {generatedPost.hashtags.map((tag, i) => (
                            <Chip
                              key={i}
                              label={tag.startsWith('#') ? tag : `#${tag}`}
                              size="small"
                              sx={{
                                background: studioColors.surface2,
                                color: studioColors.accent,
                                fontSize: studioTypography.fontSize.xs,
                              }}
                            />
                          ))}
                        </Box>
                      </SurfaceCard>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                      <Button
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={() => {
                          if (generatedPost?.postImage) {
                            downloadService.downloadImage(generatedPost.postImage, {
                              filename: downloadService.generateFilename(
                                selectedPlatform || 'social',
                                'post',
                                { addTimestamp: true }
                              ),
                            });
                          }
                        }}
                        sx={{
                          background: studioColors.accent,
                          color: studioColors.textPrimary,
                          '&:hover': { background: studioColors.accentMuted },
                        }}
                      >
                        Download Image
                      </Button>
                    </Box>
                  </Box>
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
      title="Create Social Post"
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

export default CreatePostFlow;
