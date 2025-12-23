/**
 * CreatePostFlow - Step-by-step social media post creation wizard
 * Steps: Platform → Content → Generate → Publish
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
import { SurfaceCard, studioColors, studioTypography } from '../../shared';
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 600, mx: 'auto' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
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
                      color: contentType === type.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${contentType === type.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: contentType === type.id ? studioColors.accentMuted : studioColors.surface3,
                      },
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
                Tone
              </Typography>
              <ToggleButtonGroup
                value={tone}
                exclusive
                onChange={(_, value) => value && setTone(value)}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  '& .MuiToggleButton-root': {
                    border: `1px solid ${studioColors.border}`,
                    color: studioColors.textSecondary,
                    '&.Mui-selected': {
                      background: studioColors.accent,
                      color: studioColors.textPrimary,
                      borderColor: studioColors.accent,
                      '&:hover': { background: studioColors.accentMuted },
                    },
                    '&:hover': { background: studioColors.surface2 },
                  },
                }}
              >
                {TONES.map((t) => (
                  <ToggleButton key={t.id} value={t.id}>
                    {t.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip
                label="Include Caption"
                onClick={() => setIncludeCaption(!includeCaption)}
                sx={{
                  background: includeCaption ? studioColors.accent : studioColors.surface2,
                  color: includeCaption ? studioColors.textPrimary : studioColors.textSecondary,
                }}
              />
              <Chip
                label="Include Hashtags"
                onClick={() => setIncludeHashtags(!includeHashtags)}
                sx={{
                  background: includeHashtags ? studioColors.accent : studioColors.surface2,
                  color: includeHashtags ? studioColors.textPrimary : studioColors.textSecondary,
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
