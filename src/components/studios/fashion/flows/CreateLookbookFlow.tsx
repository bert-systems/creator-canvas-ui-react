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
  // Enhanced customization options
  photographyStyle: string;
  modelType: string;
  setting: string;
  season: string;
  occasions: string[];
  lighting: string;
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
  { id: 'jewel', label: 'Jewel Tones', colors: ['#50C878', '#4169E1', '#9400D3', '#DC143C'] },
  { id: 'muted', label: 'Muted Tones', colors: ['#8B8589', '#B5B0AC', '#A49E9A', '#C4BFC0'] },
];

// Photography styles
const photographyStyles = [
  { id: 'editorial', label: 'Editorial', description: 'High fashion magazine' },
  { id: 'commercial', label: 'Commercial', description: 'Clean product focus' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Natural, in-context' },
  { id: 'street', label: 'Street Style', description: 'Urban, candid' },
  { id: 'studio', label: 'Studio', description: 'Controlled lighting' },
  { id: 'runway', label: 'Runway', description: 'Fashion show style' },
];

// Model types
const modelTypes = [
  { id: 'diverse', label: 'Diverse', description: 'Mixed representation' },
  { id: 'female', label: 'Female', description: 'Women\'s fashion' },
  { id: 'male', label: 'Male', description: 'Men\'s fashion' },
  { id: 'androgynous', label: 'Androgynous', description: 'Gender-fluid' },
  { id: 'plus', label: 'Plus Size', description: 'Size-inclusive' },
  { id: 'mature', label: 'Mature', description: '40+ models' },
];

// Settings/Backdrops
const settingOptions = [
  { id: 'studio-white', label: 'White Studio' },
  { id: 'studio-colored', label: 'Colored Backdrop' },
  { id: 'urban', label: 'Urban/City' },
  { id: 'nature', label: 'Nature/Outdoor' },
  { id: 'interior', label: 'Interior/Home' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'beach', label: 'Beach/Coastal' },
  { id: 'abstract', label: 'Abstract/Artistic' },
];

// Seasons
const seasonOptions = [
  { id: 'spring', label: 'Spring/Summer' },
  { id: 'fall', label: 'Fall/Winter' },
  { id: 'resort', label: 'Resort/Cruise' },
  { id: 'transitional', label: 'Transitional' },
];

// Occasions
const occasionOptions = [
  { id: 'casual', label: 'Casual' },
  { id: 'formal', label: 'Formal' },
  { id: 'business', label: 'Business' },
  { id: 'evening', label: 'Evening/Event' },
  { id: 'active', label: 'Activewear' },
  { id: 'lounge', label: 'Loungewear' },
];

// Lighting styles
const lightingOptions = [
  { id: 'natural', label: 'Natural Light', icon: '☀️' },
  { id: 'soft', label: 'Soft/Diffused', icon: '💡' },
  { id: 'dramatic', label: 'Dramatic', icon: '🎭' },
  { id: 'golden', label: 'Golden Hour', icon: '🌅' },
  { id: 'flash', label: 'Flash/High Key', icon: '⚡' },
  { id: 'moody', label: 'Moody/Low Key', icon: '🌙' },
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

// Step 2: Style - Enhanced with more customization options
const StyleStep: React.FC<{
  aesthetic: string;
  colorPalette: string[];
  lookCount: number;
  photographyStyle: string;
  modelType: string;
  setting: string;
  season: string;
  occasions: string[];
  lighting: string;
  onAestheticChange: (aesthetic: string) => void;
  onColorPaletteChange: (colors: string[]) => void;
  onLookCountChange: (count: number) => void;
  onPhotographyStyleChange: (style: string) => void;
  onModelTypeChange: (type: string) => void;
  onSettingChange: (setting: string) => void;
  onSeasonChange: (season: string) => void;
  onOccasionsChange: (occasions: string[]) => void;
  onLightingChange: (lighting: string) => void;
}> = ({
  aesthetic,
  colorPalette,
  lookCount,
  photographyStyle,
  modelType,
  setting,
  season,
  occasions,
  lighting,
  onAestheticChange,
  onColorPaletteChange,
  onLookCountChange,
  onPhotographyStyleChange,
  onModelTypeChange,
  onSettingChange,
  onSeasonChange,
  onOccasionsChange,
  onLightingChange,
}) => (
  <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 4 }}>
    {/* Two-column layout */}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      {/* Left column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Aesthetic selection */}
        <SurfaceCard sx={{ p: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
            Aesthetic
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {aestheticOptions.map((option) => (
              <Box
                key={option.id}
                onClick={() => onAestheticChange(option.id)}
                sx={{
                  p: 1.5,
                  borderRadius: `${studioRadii.md}px`,
                  cursor: 'pointer',
                  border: aesthetic === option.id ? `2px solid ${studioColors.accent}` : `1px solid ${studioColors.border}`,
                  background: aesthetic === option.id ? studioColors.surface2 : studioColors.surface1,
                  transition: 'all 0.15s ease',
                  '&:hover': { background: studioColors.surface2 },
                }}
              >
                <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textPrimary }}>
                  {option.label}
                </Typography>
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textTertiary }}>
                  {option.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </SurfaceCard>

        {/* Color palette selection */}
        <SurfaceCard sx={{ p: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
            Color Palette
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {colorPaletteOptions.map((palette) => {
              const isSelected = JSON.stringify(colorPalette) === JSON.stringify(palette.colors);
              return (
                <Chip
                  key={palette.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        {palette.colors.slice(0, 4).map((color, idx) => (
                          <Box key={idx} sx={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                        ))}
                      </Box>
                      <span style={{ marginLeft: 4 }}>{palette.label}</span>
                    </Box>
                  }
                  onClick={() => onColorPaletteChange(palette.colors)}
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
            {photographyStyles.map((style) => (
              <Box
                key={style.id}
                onClick={() => onPhotographyStyleChange(style.id)}
                sx={{
                  p: 1.5,
                  borderRadius: `${studioRadii.md}px`,
                  cursor: 'pointer',
                  background: photographyStyle === style.id ? studioColors.accent : studioColors.surface2,
                  border: `1px solid ${photographyStyle === style.id ? studioColors.accent : studioColors.border}`,
                  '&:hover': { background: photographyStyle === style.id ? studioColors.accentMuted : studioColors.surface3 },
                }}
              >
                <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: photographyStyle === style.id ? '#fff' : studioColors.textPrimary }}>
                  {style.label}
                </Typography>
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: photographyStyle === style.id ? 'rgba(255,255,255,0.7)' : studioColors.textMuted }}>
                  {style.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </SurfaceCard>

        {/* Model Type */}
        <SurfaceCard sx={{ p: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
            Model Type
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {modelTypes.map((type) => (
              <Chip
                key={type.id}
                label={type.label}
                onClick={() => onModelTypeChange(type.id)}
                sx={{
                  background: modelType === type.id ? studioColors.accent : studioColors.surface2,
                  color: modelType === type.id ? '#fff' : studioColors.textSecondary,
                  border: `1px solid ${modelType === type.id ? studioColors.accent : studioColors.border}`,
                  '&:hover': { background: modelType === type.id ? studioColors.accentMuted : studioColors.surface3 },
                }}
              />
            ))}
          </Box>
        </SurfaceCard>
      </Box>

      {/* Right column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Look count */}
        <SurfaceCard sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary }}>
              Number of Looks
            </Typography>
            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.accent, fontWeight: studioTypography.fontWeight.semibold }}>
              {lookCount}
            </Typography>
          </Box>
          <Slider
            value={lookCount}
            onChange={(_, value) => onLookCountChange(value as number)}
            min={3}
            max={12}
            step={1}
            marks={[{ value: 3, label: '3' }, { value: 6, label: '6' }, { value: 9, label: '9' }, { value: 12, label: '12' }]}
            sx={{
              color: studioColors.accent,
              '& .MuiSlider-track': { background: studioColors.accent },
              '& .MuiSlider-rail': { background: studioColors.border },
              '& .MuiSlider-thumb': { background: studioColors.accent },
              '& .MuiSlider-mark': { background: studioColors.border },
              '& .MuiSlider-markLabel': { color: studioColors.textTertiary, fontSize: studioTypography.fontSize.xs },
            }}
          />
        </SurfaceCard>

        {/* Setting/Backdrop */}
        <SurfaceCard sx={{ p: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
            Setting / Backdrop
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {settingOptions.map((opt) => (
              <Chip
                key={opt.id}
                label={opt.label}
                onClick={() => onSettingChange(opt.id)}
                sx={{
                  background: setting === opt.id ? studioColors.accent : studioColors.surface2,
                  color: setting === opt.id ? '#fff' : studioColors.textSecondary,
                  border: `1px solid ${setting === opt.id ? studioColors.accent : studioColors.border}`,
                  '&:hover': { background: setting === opt.id ? studioColors.accentMuted : studioColors.surface3 },
                }}
              />
            ))}
          </Box>
        </SurfaceCard>

        {/* Season */}
        <SurfaceCard sx={{ p: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
            Season
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {seasonOptions.map((opt) => (
              <Chip
                key={opt.id}
                label={opt.label}
                onClick={() => onSeasonChange(opt.id)}
                sx={{
                  background: season === opt.id ? studioColors.accent : studioColors.surface2,
                  color: season === opt.id ? '#fff' : studioColors.textSecondary,
                  border: `1px solid ${season === opt.id ? studioColors.accent : studioColors.border}`,
                  '&:hover': { background: season === opt.id ? studioColors.accentMuted : studioColors.surface3 },
                }}
              />
            ))}
          </Box>
        </SurfaceCard>

        {/* Occasions (multi-select) */}
        <SurfaceCard sx={{ p: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 0.5 }}>
            Occasions
          </Typography>
          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1.5 }}>
            Select multiple
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {occasionOptions.map((opt) => {
              const isSelected = occasions.includes(opt.id);
              return (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  onClick={() => {
                    if (isSelected) {
                      onOccasionsChange(occasions.filter(o => o !== opt.id));
                    } else {
                      onOccasionsChange([...occasions, opt.id]);
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

        {/* Lighting */}
        <SurfaceCard sx={{ p: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.medium, color: studioColors.textSecondary, mb: 1.5 }}>
            Lighting
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {lightingOptions.map((opt) => (
              <Chip
                key={opt.id}
                label={`${opt.icon} ${opt.label}`}
                onClick={() => onLightingChange(opt.id)}
                sx={{
                  background: lighting === opt.id ? studioColors.accent : studioColors.surface2,
                  color: lighting === opt.id ? '#fff' : studioColors.textSecondary,
                  border: `1px solid ${lighting === opt.id ? studioColors.accent : studioColors.border}`,
                  '&:hover': { background: lighting === opt.id ? studioColors.accentMuted : studioColors.surface3 },
                }}
              />
            ))}
          </Box>
        </SurfaceCard>
      </Box>
    </Box>

    {/* Summary */}
    <SurfaceCard sx={{ p: 2, mt: 3 }}>
      <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textTertiary, textTransform: 'uppercase', mb: 1 }}>
        Summary
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip label={aestheticOptions.find(a => a.id === aesthetic)?.label || aesthetic} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
        <Chip label={`${lookCount} looks`} size="small" sx={{ background: studioColors.surface3 }} />
        <Chip label={photographyStyles.find(p => p.id === photographyStyle)?.label || photographyStyle} size="small" sx={{ background: studioColors.surface3 }} />
        <Chip label={modelTypes.find(m => m.id === modelType)?.label || modelType} size="small" sx={{ background: studioColors.surface3 }} />
        <Chip label={settingOptions.find(s => s.id === setting)?.label || setting} size="small" sx={{ background: studioColors.surface3 }} />
        <Chip label={seasonOptions.find(s => s.id === season)?.label || season} size="small" sx={{ background: studioColors.surface3 }} />
        <Chip label={lightingOptions.find(l => l.id === lighting)?.label || lighting} size="small" sx={{ background: studioColors.surface3 }} />
        {occasions.map(o => (
          <Chip key={o} label={occasionOptions.find(opt => opt.id === o)?.label} size="small" sx={{ background: studioColors.blue, color: '#fff' }} />
        ))}
      </Box>
    </SurfaceCard>
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
    aesthetic: 'modern',
    colorPalette: [],
    lookCount: 6,
    modelDiversity: true,
    // Enhanced defaults
    photographyStyle: 'editorial',
    modelType: 'diverse',
    setting: 'studio-white',
    season: 'spring',
    occasions: [],
    lighting: 'natural',
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
            photographyStyle={config.photographyStyle}
            modelType={config.modelType}
            setting={config.setting}
            season={config.season}
            occasions={config.occasions}
            lighting={config.lighting}
            onAestheticChange={(aesthetic) => setConfig((prev) => ({ ...prev, aesthetic }))}
            onColorPaletteChange={(colorPalette) => setConfig((prev) => ({ ...prev, colorPalette }))}
            onLookCountChange={(lookCount) => setConfig((prev) => ({ ...prev, lookCount }))}
            onPhotographyStyleChange={(photographyStyle) => setConfig((prev) => ({ ...prev, photographyStyle }))}
            onModelTypeChange={(modelType) => setConfig((prev) => ({ ...prev, modelType }))}
            onSettingChange={(setting) => setConfig((prev) => ({ ...prev, setting }))}
            onSeasonChange={(season) => setConfig((prev) => ({ ...prev, season }))}
            onOccasionsChange={(occasions) => setConfig((prev) => ({ ...prev, occasions }))}
            onLightingChange={(lighting) => setConfig((prev) => ({ ...prev, lighting }))}
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
