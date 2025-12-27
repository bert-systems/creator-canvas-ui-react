/**
 * VirtualStagingFlow - Step-by-step virtual staging wizard
 * Steps: Upload → Room Type → Style → Generate → Export
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import {
  interiorDesignService,
  type VirtualStagingRequest,
  type VirtualStagingResponse,
  type RoomType,
  type StagingStyle,
  type FurnishingLevel,
  type BudgetLevel,
  type TargetAudience,
  type ColorPalette,
  type FocalPoint,
  type LightingPreference,
  type AccessoryType,
  type PhotographyStyle,
} from '@/services/interiorDesignService';
import { downloadService } from '@/services/downloadService';
import { BeforeAfterSlider } from '../../shared/BeforeAfterSlider';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'upload', label: 'Upload', description: 'Add empty room photo' },
  { id: 'room-type', label: 'Room Type', description: 'Select room function' },
  { id: 'style', label: 'Style', description: 'Choose staging style' },
  { id: 'generate', label: 'Generate', description: 'AI stages your room' },
  { id: 'export', label: 'Export', description: 'Download staged images' },
];

// Room types for staging
const STAGING_ROOM_TYPES: { id: RoomType; label: string; description: string }[] = [
  { id: 'livingRoom', label: 'Living Room', description: 'Main gathering space' },
  { id: 'bedroom', label: 'Bedroom', description: 'Master or guest bedroom' },
  { id: 'kitchen', label: 'Kitchen', description: 'Cooking and dining area' },
  { id: 'diningRoom', label: 'Dining Room', description: 'Formal dining space' },
  { id: 'homeOffice', label: 'Home Office', description: 'Work from home setup' },
];

// Staging styles
const STAGING_STYLES: { id: StagingStyle; label: string; description: string }[] = [
  { id: 'modern', label: 'Modern', description: 'Clean lines, contemporary feel' },
  { id: 'contemporary', label: 'Contemporary', description: 'Current trends, stylish' },
  { id: 'traditional', label: 'Traditional', description: 'Classic, timeless elegance' },
  { id: 'scandinavian', label: 'Scandinavian', description: 'Light, minimal, functional' },
  { id: 'luxury', label: 'Luxury', description: 'High-end, premium finishes' },
  { id: 'transitional', label: 'Transitional', description: 'Blend of modern & traditional' },
  { id: 'coastal', label: 'Coastal', description: 'Beach-inspired, relaxed' },
  { id: 'urban', label: 'Urban', description: 'City loft aesthetic' },
];

// Furnishing levels
const FURNISHING_LEVELS: { id: FurnishingLevel; label: string; description: string }[] = [
  { id: 'minimal', label: 'Minimal', description: 'Essential pieces only' },
  { id: 'standard', label: 'Standard', description: 'Balanced furnishing' },
  { id: 'full', label: 'Full', description: 'Complete room setup' },
  { id: 'luxury', label: 'Luxury', description: 'Premium with accessories' },
];

// Budget tiers
const BUDGET_LEVELS: { id: BudgetLevel; label: string }[] = [
  { id: 'budget', label: 'Budget-Friendly' },
  { id: 'mid', label: 'Mid-Range' },
  { id: 'premium', label: 'Premium' },
  { id: 'luxury', label: 'Luxury' },
];

// Target audience options
const TARGET_AUDIENCE_OPTIONS: { id: TargetAudience; label: string; description: string }[] = [
  { id: 'firstTimeBuyer', label: 'First-Time Buyers', description: 'Affordable, welcoming' },
  { id: 'luxury', label: 'Luxury Buyers', description: 'High-end, premium' },
  { id: 'family', label: 'Families', description: 'Practical, spacious' },
  { id: 'youngProfessional', label: 'Young Professionals', description: 'Modern, trendy' },
  { id: 'retiree', label: 'Retirees', description: 'Comfortable, accessible' },
];

// Color scheme options
const COLOR_SCHEME_OPTIONS: { id: ColorPalette; label: string; colors: string[] }[] = [
  { id: 'warm', label: 'Warm', colors: ['#D35400', '#E74C3C', '#F39C12'] },
  { id: 'cool', label: 'Cool', colors: ['#3498DB', '#2980B9', '#1ABC9C'] },
  { id: 'neutral', label: 'Neutral', colors: ['#BDC3C7', '#95A5A6', '#7F8C8D'] },
  { id: 'earthTones', label: 'Earth Tones', colors: ['#8D6E63', '#A1887F', '#795548'] },
  { id: 'pastels', label: 'Pastels', colors: ['#FADBD8', '#D5F5E3', '#D6EAF8'] },
  { id: 'vibrant', label: 'Vibrant', colors: ['#E91E63', '#9C27B0', '#00BCD4'] },
];

// Focal point options
const FOCAL_POINT_OPTIONS: { id: FocalPoint; label: string }[] = [
  { id: 'fireplace', label: 'Fireplace' },
  { id: 'windows', label: 'Windows/View' },
  { id: 'entertainment', label: 'Entertainment Center' },
  { id: 'dining', label: 'Dining Area' },
  { id: 'bed', label: 'Bed' },
  { id: 'kitchen', label: 'Kitchen Island' },
  { id: 'artwork', label: 'Artwork' },
  { id: 'view', label: 'Scenic View' },
];

// Lighting style options
const LIGHTING_STYLE_OPTIONS: { id: LightingPreference; label: string; icon: string }[] = [
  { id: 'natural', label: 'Natural Light', icon: '☀️' },
  { id: 'bright', label: 'Bright & Airy', icon: '✨' },
  { id: 'cozy', label: 'Warm & Cozy', icon: '🕯️' },
  { id: 'layered', label: 'Layered', icon: '🔆' },
  { id: 'dramatic', label: 'Dramatic', icon: '🎭' },
];

// Accessory options
const ACCESSORY_OPTIONS: { id: AccessoryType; label: string }[] = [
  { id: 'art', label: 'Wall Art' },
  { id: 'plants', label: 'Plants & Greenery' },
  { id: 'books', label: 'Books & Shelving' },
  { id: 'textiles', label: 'Textiles & Throws' },
  { id: 'lighting', label: 'Accent Lighting' },
  { id: 'mirrors', label: 'Mirrors' },
  { id: 'sculptures', label: 'Sculptures' },
  { id: 'vases', label: 'Vases & Decor' },
];

// Photography style options
const PHOTOGRAPHY_STYLE_OPTIONS: { id: PhotographyStyle; label: string; description: string }[] = [
  { id: 'realEstate', label: 'Real Estate Standard', description: 'Clean, professional' },
  { id: 'editorial', label: 'Editorial/Magazine', description: 'Stylized, artistic' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Lived-in, inviting' },
  { id: 'twilight', label: 'Twilight', description: 'Evening ambiance' },
  { id: 'architectural', label: 'Architectural', description: 'Space-focused' },
];

interface VirtualStagingFlowProps {
  onCancel: () => void;
  onComplete: (result: VirtualStagingResponse & { originalUrl: string; stagingStyle: string }) => void;
}

export const VirtualStagingFlow: React.FC<VirtualStagingFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomType>('livingRoom');
  const [stagingStyle, setStagingStyle] = useState<StagingStyle>('modern');
  const [furnishingLevel, setFurnishingLevel] = useState<FurnishingLevel>('standard');
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('mid');

  // Enhanced customization state
  const [targetAudience, setTargetAudience] = useState<TargetAudience | null>(null);
  const [colorScheme, setColorScheme] = useState<ColorPalette | null>(null);
  const [focalPoint, setFocalPoint] = useState<FocalPoint | null>(null);
  const [lightingStyle, setLightingStyle] = useState<LightingPreference | null>(null);
  const [accessories, setAccessories] = useState<AccessoryType[]>([]);
  const [photographyStyle, setPhotographyStyle] = useState<PhotographyStyle>('realEstate');

  // Generation state
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState<VirtualStagingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return uploadedImage !== null;
      case 1: return true;
      case 2: return true;
      case 3: return result !== null;
      case 4: return true;
      default: return false;
    }
  }, [currentStep, uploadedImage, result]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const request: VirtualStagingRequest = {
        emptyRoomImage: uploadedImage,
        roomType,
        stagingStyle,
        furnishingLevel,
        budgetTier: budgetLevel,
        // Enhanced customization options
        targetAudience: targetAudience || undefined,
        colorScheme: colorScheme || undefined,
        focalPoint: focalPoint || undefined,
        lightingStyle: lightingStyle || undefined,
        accessories: accessories.length > 0 ? accessories : undefined,
        photographyStyle: photographyStyle || undefined,
      };

      const response = await interiorDesignService.stageRoom(request);

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setResult(response);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage room');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, roomType, stagingStyle, furnishingLevel, budgetLevel]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 3 && currentStep === 2) {
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (result && uploadedImage) {
      onComplete({
        ...result,
        originalUrl: uploadedImage,
        stagingStyle,
      });
    }
  }, [result, uploadedImage, stagingStyle, onComplete]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Upload
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
              Upload your empty room photo
            </Typography>

            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              For best results, upload a photo of an unfurnished or empty room
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {!uploadedImage ? (
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                sx={{
                  border: `2px dashed ${studioColors.border}`,
                  borderRadius: `${studioRadii.lg}px`,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: studioColors.accent,
                    background: `${studioColors.accent}10`,
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: studioColors.textMuted, mb: 2 }} />
                <Typography sx={{ color: studioColors.textSecondary, mb: 1 }}>
                  Drag and drop your empty room photo here
                </Typography>
                <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textMuted }}>
                  or click to browse
                </Typography>
              </Box>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={uploadedImage}
                  alt="Uploaded room"
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                    borderRadius: `${studioRadii.lg}px`,
                    border: `1px solid ${studioColors.border}`,
                  }}
                />
                <Button
                  onClick={() => setUploadedImage(null)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    minWidth: 'auto',
                    px: 2,
                    '&:hover': { background: 'rgba(0,0,0,0.8)' },
                  }}
                >
                  Replace
                </Button>
              </Box>
            )}
          </Box>
        );

      case 1: // Room Type
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
              What type of room is this?
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {STAGING_ROOM_TYPES.map((type) => (
                <SurfaceCard
                  key={type.id}
                  onClick={() => setRoomType(type.id)}
                  interactive
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: roomType === type.id
                      ? `2px solid ${studioColors.accent}`
                      : `1px solid ${studioColors.border}`,
                    background: roomType === type.id ? studioColors.surface2 : studioColors.surface1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.md,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textPrimary,
                    }}
                  >
                    {type.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      color: studioColors.textTertiary,
                      mt: 0.5,
                    }}
                  >
                    {type.description}
                  </Typography>
                </SurfaceCard>
              ))}
            </Box>

            {/* Preview thumbnail */}
            {uploadedImage && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={uploadedImage}
                  alt="Room preview"
                  sx={{
                    width: 180,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: `${studioRadii.md}px`,
                    border: `1px solid ${studioColors.border}`,
                  }}
                />
              </Box>
            )}
          </Box>
        );

      case 2: // Style
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1000, mx: 'auto', pb: 4 }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
              }}
            >
              Configure your staging
            </Typography>

            {/* Staging Style Grid */}
            <SurfaceCard sx={{ p: 2 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                Staging Style
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                {STAGING_STYLES.map((style) => (
                  <Box
                    key={style.id}
                    onClick={() => setStagingStyle(style.id)}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      borderRadius: `${studioRadii.md}px`,
                      cursor: 'pointer',
                      border: stagingStyle === style.id ? `2px solid ${studioColors.accent}` : `1px solid ${studioColors.border}`,
                      background: stagingStyle === style.id ? studioColors.surface2 : studioColors.surface1,
                      transition: 'all 0.15s ease',
                      '&:hover': { background: studioColors.surface2 },
                    }}
                  >
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textPrimary }}>
                      {style.label}
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textTertiary, mt: 0.25 }}>
                      {style.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </SurfaceCard>

            {/* Two column layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Left column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Target Audience */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Target Audience
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {TARGET_AUDIENCE_OPTIONS.map((option) => (
                      <Box
                        key={option.id}
                        onClick={() => setTargetAudience(targetAudience === option.id ? null : option.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.md}px`,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: targetAudience === option.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${targetAudience === option.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: targetAudience === option.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      >
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: targetAudience === option.id ? '#fff' : studioColors.textPrimary }}>
                          {option.label}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: targetAudience === option.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted }}>
                          {option.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Color Scheme */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Color Scheme
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {COLOR_SCHEME_OPTIONS.map((scheme) => (
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
                        onClick={() => setColorScheme(colorScheme === scheme.id ? null : scheme.id)}
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

                {/* Focal Point */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Focal Point
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {FOCAL_POINT_OPTIONS.map((option) => (
                      <Chip
                        key={option.id}
                        label={option.label}
                        onClick={() => setFocalPoint(focalPoint === option.id ? null : option.id)}
                        sx={{
                          background: focalPoint === option.id ? studioColors.accent : studioColors.surface2,
                          color: focalPoint === option.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${focalPoint === option.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: focalPoint === option.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>
              </Box>

              {/* Right column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Furnishing & Budget */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Furnishing Level
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {FURNISHING_LEVELS.map((level) => (
                      <Chip
                        key={level.id}
                        label={level.label}
                        onClick={() => setFurnishingLevel(level.id)}
                        sx={{
                          background: furnishingLevel === level.id ? studioColors.accent : studioColors.surface2,
                          color: furnishingLevel === level.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${furnishingLevel === level.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: furnishingLevel === level.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Budget Tier
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {BUDGET_LEVELS.map((level) => (
                      <Chip
                        key={level.id}
                        label={level.label}
                        onClick={() => setBudgetLevel(level.id)}
                        sx={{
                          background: budgetLevel === level.id ? studioColors.accent : studioColors.surface2,
                          color: budgetLevel === level.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${budgetLevel === level.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: budgetLevel === level.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Lighting Style */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Lighting Style
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {LIGHTING_STYLE_OPTIONS.map((option) => (
                      <Chip
                        key={option.id}
                        label={`${option.icon} ${option.label}`}
                        onClick={() => setLightingStyle(lightingStyle === option.id ? null : option.id)}
                        sx={{
                          background: lightingStyle === option.id ? studioColors.accent : studioColors.surface2,
                          color: lightingStyle === option.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${lightingStyle === option.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: lightingStyle === option.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Accessories (multi-select) */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 0.5 }}>
                    Accessories
                  </Typography>
                  <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1.5 }}>
                    Select multiple to include
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ACCESSORY_OPTIONS.map((accessory) => {
                      const isSelected = accessories.includes(accessory.id);
                      return (
                        <Chip
                          key={accessory.id}
                          label={accessory.label}
                          onClick={() => {
                            if (isSelected) {
                              setAccessories(accessories.filter(a => a !== accessory.id));
                            } else {
                              setAccessories([...accessories, accessory.id]);
                            }
                          }}
                          sx={{
                            background: isSelected ? studioColors.accent : studioColors.surface2,
                            color: isSelected ? '#fff' : studioColors.textSecondary,
                            border: `1px solid ${isSelected ? studioColors.accent : studioColors.border}`,
                            '&:hover': { background: isSelected ? studioColors.accentMuted : studioColors.surface3 },
                          }}
                        />
                      );
                    })}
                  </Box>
                </SurfaceCard>

                {/* Photography Style */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Photography Style
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {PHOTOGRAPHY_STYLE_OPTIONS.map((option) => (
                      <Box
                        key={option.id}
                        onClick={() => setPhotographyStyle(option.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.md}px`,
                          cursor: 'pointer',
                          background: photographyStyle === option.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${photographyStyle === option.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: photographyStyle === option.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      >
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: photographyStyle === option.id ? '#fff' : studioColors.textPrimary }}>
                          {option.label}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: photographyStyle === option.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted }}>
                          {option.description}
                        </Typography>
                      </Box>
                    ))}
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
                <Chip label={stagingStyle} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                <Chip label={furnishingLevel} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={budgetLevel} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={PHOTOGRAPHY_STYLE_OPTIONS.find(p => p.id === photographyStyle)?.label} size="small" sx={{ background: studioColors.surface3 }} />
                {targetAudience && <Chip label={TARGET_AUDIENCE_OPTIONS.find(t => t.id === targetAudience)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {colorScheme && <Chip label={COLOR_SCHEME_OPTIONS.find(c => c.id === colorScheme)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {focalPoint && <Chip label={FOCAL_POINT_OPTIONS.find(f => f.id === focalPoint)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {lightingStyle && <Chip label={LIGHTING_STYLE_OPTIONS.find(l => l.id === lightingStyle)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {accessories.map(a => (
                  <Chip key={a} label={ACCESSORY_OPTIONS.find(acc => acc.id === a)?.label} size="small" sx={{ background: studioColors.blue, color: '#fff' }} />
                ))}
              </Box>
            </SurfaceCard>
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
                  Staging Your Room
                </Typography>
                <Typography sx={{ color: studioColors.textSecondary, textAlign: 'center' }}>
                  AI is furnishing your {roomType.replace(/([A-Z])/g, ' $1').toLowerCase()} with {stagingStyle} style...
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

                {/* Original image preview */}
                {uploadedImage && (
                  <Box
                    component="img"
                    src={uploadedImage}
                    alt="Original room"
                    sx={{
                      width: 200,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: `${studioRadii.md}px`,
                      opacity: 0.5,
                    }}
                  />
                )}
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

      case 4: // Export
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1000, mx: 'auto', pb: 4 }}>
            {result && uploadedImage && (
              <>
                {/* Before/After Comparison */}
                <BeforeAfterSlider
                  beforeImage={uploadedImage}
                  afterImage={result.stagedRoomImage}
                  beforeLabel="Empty"
                  afterLabel="Staged"
                />

                {/* Furniture List */}
                {result.furnitureList && result.furnitureList.length > 0 && (
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
                      Staged Furniture ({result.furnitureList.length} items)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.furnitureList.map((item, i) => (
                        <Chip
                          key={i}
                          label={`${item.name} (${item.category})`}
                          size="small"
                          sx={{ background: studioColors.surface3 }}
                        />
                      ))}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Estimated Cost */}
                {result.estimatedStagingCost && (
                  <SurfaceCard sx={{ p: 2 }}>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textTertiary,
                        textTransform: 'uppercase',
                        mb: 1,
                      }}
                    >
                      Estimated Staging Cost
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.lg, color: studioColors.textPrimary }}>
                      {result.estimatedStagingCost}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      if (result?.stagedRoomImage) {
                        downloadService.downloadImage(result.stagedRoomImage, {
                          filename: downloadService.generateFilename(
                            `staged-${roomType}-${stagingStyle}`,
                            'interior',
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
                    Download Staged Image
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
      title="Virtual Staging"
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onCancel={onCancel}
      canProceed={canProceed()}
      isProcessing={isProcessing}
      nextLabel={currentStep === 2 ? 'Stage Room' : undefined}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default VirtualStagingFlow;
