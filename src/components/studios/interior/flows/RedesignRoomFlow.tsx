/**
 * RedesignRoomFlow - Step-by-step room redesign wizard
 * Steps: Upload → Style → Customize → Generate → Compare
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Button,
  LinearProgress,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CompareIcon from '@mui/icons-material/Compare';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import {
  interiorDesignService,
  type RoomRedesignRequest,
  type RoomRedesignResponse,
  type RoomType,
  type InteriorDesignStyle,
  type ColorPalette,
  type LightingPreference,
  type MaterialType,
  type DesignMood,
  type DesignEra,
  type FocusArea,
} from '@/services/interiorDesignService';
import { downloadService } from '@/services/downloadService';
import { BeforeAfterSlider } from '../../shared/BeforeAfterSlider';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'upload', label: 'Upload', description: 'Add your room photo' },
  { id: 'style', label: 'Style', description: 'Choose design direction' },
  { id: 'customize', label: 'Customize', description: 'Fine-tune preferences' },
  { id: 'generate', label: 'Generate', description: 'AI redesigns your room' },
  { id: 'compare', label: 'Compare', description: 'Before/after comparison' },
];

// Room types
const ROOM_TYPES: { id: RoomType; label: string }[] = [
  { id: 'livingRoom', label: 'Living Room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'diningRoom', label: 'Dining Room' },
  { id: 'homeOffice', label: 'Home Office' },
  { id: 'nursery', label: 'Nursery' },
  { id: 'outdoor', label: 'Outdoor' },
];

// Design styles
const DESIGN_STYLES: { id: InteriorDesignStyle; label: string; description: string }[] = [
  { id: 'modern', label: 'Modern', description: 'Clean lines, minimal decor' },
  { id: 'scandinavian', label: 'Scandinavian', description: 'Light, airy, functional' },
  { id: 'industrial', label: 'Industrial', description: 'Raw materials, exposed elements' },
  { id: 'midCentury', label: 'Mid-Century', description: 'Retro elegance, organic curves' },
  { id: 'bohemian', label: 'Bohemian', description: 'Eclectic, colorful, layered' },
  { id: 'traditional', label: 'Traditional', description: 'Classic, ornate details' },
  { id: 'coastal', label: 'Coastal', description: 'Beach-inspired, light blues' },
  { id: 'farmhouse', label: 'Farmhouse', description: 'Rustic charm, natural materials' },
  { id: 'japandi', label: 'Japandi', description: 'Japanese minimalism meets Scandi' },
  { id: 'minimalist', label: 'Minimalist', description: 'Essential, clutter-free' },
];

// Color palettes
const COLOR_PALETTES: { id: ColorPalette; label: string; colors: string[] }[] = [
  { id: 'warm', label: 'Warm Tones', colors: ['#D35400', '#E74C3C', '#F39C12', '#E67E22'] },
  { id: 'cool', label: 'Cool Tones', colors: ['#3498DB', '#2980B9', '#1ABC9C', '#9B59B6'] },
  { id: 'neutral', label: 'Neutral', colors: ['#BDC3C7', '#95A5A6', '#7F8C8D', '#ECF0F1'] },
  { id: 'monochromatic', label: 'Monochromatic', colors: ['#2C3E50', '#34495E', '#5D6D7E', '#85929E'] },
  { id: 'vibrant', label: 'Vibrant', colors: ['#E91E63', '#9C27B0', '#00BCD4', '#4CAF50'] },
  { id: 'earthTones', label: 'Earth Tones', colors: ['#8D6E63', '#A1887F', '#795548', '#4E342E'] },
  { id: 'pastels', label: 'Pastels', colors: ['#FADBD8', '#D5F5E3', '#D6EAF8', '#FCF3CF'] },
];

// Lighting preferences
const LIGHTING_OPTIONS: { id: LightingPreference; label: string; icon: string }[] = [
  { id: 'natural', label: 'Natural Light', icon: '☀️' },
  { id: 'ambient', label: 'Ambient', icon: '💡' },
  { id: 'dramatic', label: 'Dramatic', icon: '🎭' },
  { id: 'bright', label: 'Bright & Airy', icon: '✨' },
  { id: 'cozy', label: 'Cozy & Warm', icon: '🕯️' },
  { id: 'layered', label: 'Layered', icon: '🔆' },
];

// Material options
const MATERIAL_OPTIONS: { id: MaterialType; label: string }[] = [
  { id: 'wood', label: 'Wood' },
  { id: 'metal', label: 'Metal' },
  { id: 'glass', label: 'Glass' },
  { id: 'stone', label: 'Stone' },
  { id: 'leather', label: 'Leather' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'rattan', label: 'Rattan' },
  { id: 'marble', label: 'Marble' },
  { id: 'concrete', label: 'Concrete' },
  { id: 'velvet', label: 'Velvet' },
  { id: 'linen', label: 'Linen' },
  { id: 'ceramic', label: 'Ceramic' },
];

// Mood options
const MOOD_OPTIONS: { id: DesignMood; label: string; description: string }[] = [
  { id: 'relaxing', label: 'Relaxing', description: 'Calm, peaceful atmosphere' },
  { id: 'energizing', label: 'Energizing', description: 'Vibrant, stimulating space' },
  { id: 'sophisticated', label: 'Sophisticated', description: 'Refined, elegant feel' },
  { id: 'playful', label: 'Playful', description: 'Fun, whimsical vibe' },
  { id: 'romantic', label: 'Romantic', description: 'Soft, intimate ambiance' },
  { id: 'productive', label: 'Productive', description: 'Focused, work-friendly' },
  { id: 'cozy', label: 'Cozy', description: 'Warm, inviting comfort' },
  { id: 'minimalist', label: 'Minimalist', description: 'Clean, uncluttered zen' },
];

// Era options
const ERA_OPTIONS: { id: DesignEra; label: string }[] = [
  { id: 'contemporary', label: 'Contemporary' },
  { id: 'midCentury', label: 'Mid-Century' },
  { id: 'artDeco', label: 'Art Deco' },
  { id: 'victorian', label: 'Victorian' },
  { id: 'rustic', label: 'Rustic' },
  { id: 'futuristic', label: 'Futuristic' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'eclectic', label: 'Eclectic' },
];

// Focus area options
const FOCUS_AREA_OPTIONS: { id: FocusArea; label: string }[] = [
  { id: 'seating', label: 'Seating' },
  { id: 'storage', label: 'Storage' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'decor', label: 'Decor' },
  { id: 'plants', label: 'Plants' },
  { id: 'textiles', label: 'Textiles' },
  { id: 'artwork', label: 'Artwork' },
  { id: 'entertainment', label: 'Entertainment' },
];

interface RedesignRoomFlowProps {
  onCancel: () => void;
  onComplete: (result: RoomRedesignResponse & { originalUrl: string; style: InteriorDesignStyle; roomType: string }) => void;
}

export const RedesignRoomFlow: React.FC<RedesignRoomFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomType>('livingRoom');
  const [designStyle, setDesignStyle] = useState<InteriorDesignStyle>('modern');
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [intensity, setIntensity] = useState(70);
  const [customPrompt, setCustomPrompt] = useState('');

  // Enhanced customization state
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [lightingPreference, setLightingPreference] = useState<LightingPreference | null>(null);
  const [materialPreferences, setMaterialPreferences] = useState<MaterialType[]>([]);
  const [mood, setMood] = useState<DesignMood | null>(null);
  const [era, setEra] = useState<DesignEra | null>(null);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);

  // Generation state
  const [generationProgress, setGenerationProgress] = useState(0);
  const [result, setResult] = useState<RoomRedesignResponse | null>(null);
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

      const request: RoomRedesignRequest = {
        roomImage: uploadedImage,
        roomType,
        designStyle,
        preserveStructure,
        intensity: intensity / 100,
        customPrompt: customPrompt || undefined,
        // Enhanced customization options
        colorPalette: colorPalette || undefined,
        lightingPreference: lightingPreference || undefined,
        materialPreferences: materialPreferences.length > 0 ? materialPreferences : undefined,
        mood: mood || undefined,
        era: era || undefined,
        focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
      };

      const response = await interiorDesignService.redesignRoom(request);

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setResult(response);
      setCurrentStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redesign room');
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, roomType, designStyle, preserveStructure, intensity, customPrompt]);

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
        style: designStyle,
        roomType,
      });
    }
  }, [result, uploadedImage, designStyle, roomType, onComplete]);

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
              Upload your room photo
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
                  Drag and drop your room photo here
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

            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1.5,
                }}
              >
                Room Type
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ROOM_TYPES.map((type) => (
                  <Chip
                    key={type.id}
                    label={type.label}
                    onClick={() => setRoomType(type.id)}
                    sx={{
                      background: roomType === type.id ? studioColors.accent : studioColors.surface2,
                      color: roomType === type.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${roomType === type.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: roomType === type.id ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        );

      case 1: // Style
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 900, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
              }}
            >
              Choose your design style
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5 }}>
              {DESIGN_STYLES.map((style) => (
                <SurfaceCard
                  key={style.id}
                  onClick={() => setDesignStyle(style.id)}
                  interactive
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    border: designStyle === style.id
                      ? `2px solid ${studioColors.accent}`
                      : `1px solid ${studioColors.border}`,
                    background: designStyle === style.id ? studioColors.surface2 : studioColors.surface1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textPrimary,
                    }}
                  >
                    {style.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      color: studioColors.textTertiary,
                      mt: 0.5,
                    }}
                  >
                    {style.description}
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
                    width: 200,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: `${studioRadii.md}px`,
                    border: `1px solid ${studioColors.border}`,
                  }}
                />
              </Box>
            )}
          </Box>
        );

      case 2: // Customize
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900, mx: 'auto', pb: 4 }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
              }}
            >
              Fine-tune your redesign
            </Typography>

            {/* Two column layout for controls */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Left column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Intensity slider */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary }}>
                      Transformation Intensity
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.accent, fontWeight: studioTypography.fontWeight.semibold }}>
                      {intensity}%
                    </Typography>
                  </Box>
                  <Slider
                    value={intensity}
                    onChange={(_, v) => setIntensity(v as number)}
                    min={10}
                    max={100}
                    sx={{
                      color: studioColors.accent,
                      '& .MuiSlider-rail': { background: studioColors.surface3 },
                      '& .MuiSlider-track': { background: studioColors.accent },
                      '& .MuiSlider-thumb': { background: studioColors.accent },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Subtle</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Complete</Typography>
                  </Box>
                </SurfaceCard>

                {/* Color Palette */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Color Palette
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {COLOR_PALETTES.map((palette) => (
                      <Chip
                        key={palette.id}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', gap: 0.25 }}>
                              {palette.colors.slice(0, 4).map((color, i) => (
                                <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                              ))}
                            </Box>
                            <span style={{ marginLeft: 4 }}>{palette.label}</span>
                          </Box>
                        }
                        onClick={() => setColorPalette(colorPalette === palette.id ? null : palette.id)}
                        sx={{
                          background: colorPalette === palette.id ? studioColors.accent : studioColors.surface2,
                          color: colorPalette === palette.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${colorPalette === palette.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: colorPalette === palette.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Lighting Preference */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Lighting
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {LIGHTING_OPTIONS.map((option) => (
                      <Chip
                        key={option.id}
                        label={`${option.icon} ${option.label}`}
                        onClick={() => setLightingPreference(lightingPreference === option.id ? null : option.id)}
                        sx={{
                          background: lightingPreference === option.id ? studioColors.accent : studioColors.surface2,
                          color: lightingPreference === option.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${lightingPreference === option.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: lightingPreference === option.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Mood */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Mood & Atmosphere
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    {MOOD_OPTIONS.map((option) => (
                      <Box
                        key={option.id}
                        onClick={() => setMood(mood === option.id ? null : option.id)}
                        sx={{
                          p: 1.5,
                          borderRadius: `${studioRadii.md}px`,
                          cursor: 'pointer',
                          background: mood === option.id ? studioColors.accent : studioColors.surface2,
                          border: `1px solid ${mood === option.id ? studioColors.accent : studioColors.border}`,
                          transition: 'all 0.15s ease',
                          '&:hover': { background: mood === option.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      >
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: mood === option.id ? '#fff' : studioColors.textPrimary }}>
                          {option.label}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: mood === option.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted }}>
                          {option.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </SurfaceCard>
              </Box>

              {/* Right column */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Preserve Structure */}
                <SurfaceCard sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preserveStructure}
                        onChange={(e) => setPreserveStructure(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: studioColors.accent },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: studioColors.accentMuted },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>Preserve room structure</Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Keep walls, windows, and architecture</Typography>
                      </Box>
                    }
                    sx={{ alignItems: 'flex-start', ml: 0, width: '100%' }}
                  />
                </SurfaceCard>

                {/* Era/Period */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
                    Design Era
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ERA_OPTIONS.map((option) => (
                      <Chip
                        key={option.id}
                        label={option.label}
                        onClick={() => setEra(era === option.id ? null : option.id)}
                        sx={{
                          background: era === option.id ? studioColors.accent : studioColors.surface2,
                          color: era === option.id ? '#fff' : studioColors.textSecondary,
                          border: `1px solid ${era === option.id ? studioColors.accent : studioColors.border}`,
                          '&:hover': { background: era === option.id ? studioColors.accentMuted : studioColors.surface3 },
                        }}
                      />
                    ))}
                  </Box>
                </SurfaceCard>

                {/* Materials (multi-select) */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 0.5 }}>
                    Preferred Materials
                  </Typography>
                  <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1.5 }}>
                    Select multiple
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {MATERIAL_OPTIONS.map((material) => {
                      const isSelected = materialPreferences.includes(material.id);
                      return (
                        <Chip
                          key={material.id}
                          label={material.label}
                          onClick={() => {
                            if (isSelected) {
                              setMaterialPreferences(materialPreferences.filter(m => m !== material.id));
                            } else {
                              setMaterialPreferences([...materialPreferences, material.id]);
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

                {/* Focus Areas (multi-select) */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 0.5 }}>
                    Focus Areas
                  </Typography>
                  <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1.5 }}>
                    Emphasize these elements
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {FOCUS_AREA_OPTIONS.map((area) => {
                      const isSelected = focusAreas.includes(area.id);
                      return (
                        <Chip
                          key={area.id}
                          label={area.label}
                          onClick={() => {
                            if (isSelected) {
                              setFocusAreas(focusAreas.filter(a => a !== area.id));
                            } else {
                              setFocusAreas([...focusAreas, area.id]);
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

                {/* Custom Instructions */}
                <SurfaceCard sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1 }}>
                    Additional Instructions
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="e.g., 'Add more plants', 'Include a reading nook'"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
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
            </Box>

            {/* Summary */}
            <SurfaceCard sx={{ p: 2, mt: 1 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textTertiary, textTransform: 'uppercase', mb: 1 }}>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={roomType} size="small" sx={{ background: studioColors.surface3 }} />
                <Chip label={designStyle} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                <Chip label={`${intensity}% intensity`} size="small" sx={{ background: studioColors.surface3 }} />
                {preserveStructure && <Chip label="Preserve structure" size="small" sx={{ background: studioColors.surface3 }} />}
                {colorPalette && <Chip label={COLOR_PALETTES.find(p => p.id === colorPalette)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {lightingPreference && <Chip label={LIGHTING_OPTIONS.find(l => l.id === lightingPreference)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {mood && <Chip label={MOOD_OPTIONS.find(m => m.id === mood)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {era && <Chip label={ERA_OPTIONS.find(e => e.id === era)?.label} size="small" sx={{ background: studioColors.surface3 }} />}
                {materialPreferences.map(m => (
                  <Chip key={m} label={MATERIAL_OPTIONS.find(mat => mat.id === m)?.label} size="small" sx={{ background: studioColors.blue, color: '#fff' }} />
                ))}
                {focusAreas.map(a => (
                  <Chip key={a} label={FOCUS_AREA_OPTIONS.find(area => area.id === a)?.label} size="small" sx={{ background: studioColors.success, color: '#fff' }} />
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
                  Redesigning Your Room
                </Typography>
                <Typography sx={{ color: studioColors.textSecondary, textAlign: 'center' }}>
                  AI is transforming your space with {designStyle} style...
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

      case 4: // Compare
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1000, mx: 'auto', pb: 4 }}>
            {result && uploadedImage && (
              <>
                {/* Before/After Comparison */}
                <BeforeAfterSlider
                  beforeImage={uploadedImage}
                  afterImage={result.redesignedRoom}
                  beforeLabel="Original"
                  afterLabel={designStyle}
                />

                {/* Design Notes */}
                {result.designNotes && (
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
                      Design Notes
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                      {result.designNotes}
                    </Typography>
                  </SurfaceCard>
                )}

                {/* Product Suggestions */}
                {result.suggestedProducts && result.suggestedProducts.length > 0 && (
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
                      Suggested Products
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.suggestedProducts.slice(0, 6).map((product, i) => (
                        <Chip
                          key={i}
                          label={product.name}
                          size="small"
                          sx={{ background: studioColors.surface3 }}
                        />
                      ))}
                    </Box>
                  </SurfaceCard>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      if (result?.redesignedRoom) {
                        downloadService.downloadImage(result.redesignedRoom, {
                          filename: downloadService.generateFilename(
                            `${roomType}-${designStyle}`,
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
                    Download Redesign
                  </Button>
                  <Button
                    startIcon={<CompareIcon />}
                    onClick={() => {
                      // Could open a full-screen comparison modal
                    }}
                    sx={{
                      color: studioColors.textSecondary,
                      border: `1px solid ${studioColors.border}`,
                      '&:hover': { background: studioColors.surface2 },
                    }}
                  >
                    Full Comparison
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
      title="Redesign Room"
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onCancel={onCancel}
      canProceed={canProceed()}
      isProcessing={isProcessing}
      nextLabel={currentStep === 2 ? 'Generate' : undefined}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default RedesignRoomFlow;
