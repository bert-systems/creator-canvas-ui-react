/**
 * StyleTab Component
 *
 * The STYLE tab for brand DNA and heritage preservation.
 * Features:
 * - Style DNA: Create and manage brand styles
 * - Heritage Collection: Cultural and traditional elements
 * - Style Presets: Quick-apply visual styles
 * - Color Palettes: Curated color schemes
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Collapse,
  Chip,
  Tooltip,
  alpha,
  Grid,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Upload as UploadIcon,
  AutoAwesome as MagicIcon,
  Palette as PaletteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { creativeCardTokens } from '../../theme';
import { STYLE_PRESETS, COLOR_PALETTES, type StylePreset, type ColorPalette } from './paletteData';

// ============================================================================
// TYPES
// ============================================================================

interface StyleTabProps {
  onStyleSelect?: (styleId: string, keywords: string[]) => void;
  onColorPaletteSelect?: (paletteId: string, colors: string[]) => void;
  searchQuery?: string;
}

interface StyleDNA {
  id: string;
  name: string;
  thumbnail?: string;
  keywords: string[];
  colors: string[];
  createdAt: number;
}

// Mock style DNA data - in production this would come from user's saved styles
const USER_STYLE_DNA: StyleDNA[] = [
  {
    id: 'my-brand-1',
    name: 'My Brand Style',
    keywords: ['modern', 'clean', 'minimal', 'professional'],
    colors: ['#2563EB', '#F59E0B', '#10B981', '#F3F4F6'],
    createdAt: Date.now() - 86400000,
  },
];

// Heritage collection for cultural styles
interface HeritageItem {
  id: string;
  name: string;
  region: string;
  description: string;
  keywords: string[];
  thumbnail?: string;
}

const HERITAGE_COLLECTION: HeritageItem[] = [
  {
    id: 'kente',
    name: 'Kente Cloth',
    region: 'Ghana',
    description: 'Vibrant woven patterns symbolizing status and identity',
    keywords: ['kente', 'woven', 'geometric', 'Ghana', 'vibrant', 'traditional African'],
  },
  {
    id: 'adinkra',
    name: 'Adinkra Symbols',
    region: 'Akan',
    description: 'Visual symbols representing concepts and aphorisms',
    keywords: ['adinkra', 'symbols', 'Akan', 'wisdom', 'philosophical', 'stamped patterns'],
  },
  {
    id: 'mudcloth',
    name: 'Mud Cloth (Bògòlanfini)',
    region: 'Mali',
    description: 'Hand-dyed cotton with symbolic geometric patterns',
    keywords: ['mudcloth', 'bogolan', 'Mali', 'earth tones', 'hand-dyed', 'geometric'],
  },
  {
    id: 'shweshwe',
    name: 'Shweshwe',
    region: 'South Africa',
    description: 'Distinctive printed cotton with intricate geometric patterns',
    keywords: ['shweshwe', 'South Africa', 'indigo', 'geometric', 'printed cotton'],
  },
  {
    id: 'ankara',
    name: 'Ankara (African Wax Print)',
    region: 'West Africa',
    description: 'Bold, colorful wax-printed fabric patterns',
    keywords: ['ankara', 'wax print', 'bold', 'colorful', 'West Africa', 'vibrant patterns'],
  },
];

// ============================================================================
// STYLE DNA SECTION
// ============================================================================

interface StyleDNASectionProps {
  styleDNA: StyleDNA[];
  onStyleSelect?: (styleId: string, keywords: string[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const StyleDNASection = memo(function StyleDNASection({
  styleDNA,
  onStyleSelect,
  isExpanded,
  onToggle,
}: StyleDNASectionProps) {
  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <MagicIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Style DNA
        </Typography>
        <Chip label={styleDNA.length} size="small" sx={{ height: 20 }} />
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              Create New
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadIcon />}
              sx={{ flex: 1, textTransform: 'none' }}
            >
              From Image
            </Button>
          </Box>

          {/* Existing Styles */}
          {styleDNA.map((style) => (
            <Box
              key={style.id}
              onClick={() => onStyleSelect?.(style.id, style.keywords)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                mb: 0.5,
                borderRadius: `${creativeCardTokens.radius.button}px`,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha('#6366f1', 0.05),
                },
              }}
            >
              {/* Color Preview */}
              <Box sx={{ display: 'flex', gap: 0.25 }}>
                {style.colors.slice(0, 4).map((color, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: color,
                      borderRadius: i === 0 ? '4px 0 0 4px' : i === 3 ? '0 4px 4px 0' : 0,
                    }}
                  />
                ))}
              </Box>

              {/* Name & Keywords */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {style.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {style.keywords.join(', ')}
                </Typography>
              </Box>
            </Box>
          ))}

          {styleDNA.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No style DNA yet. Create one to maintain brand consistency.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

// ============================================================================
// HERITAGE COLLECTION SECTION
// ============================================================================

interface HeritageCollectionSectionProps {
  onStyleSelect?: (styleId: string, keywords: string[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}

const HeritageCollectionSection = memo(function HeritageCollectionSection({
  onStyleSelect,
  isExpanded,
  onToggle,
  searchQuery,
}: HeritageCollectionSectionProps) {
  const filteredItems = searchQuery
    ? HERITAGE_COLLECTION.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : HERITAGE_COLLECTION;

  if (searchQuery && filteredItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Typography sx={{ fontSize: '1.1rem' }}>🌍</Typography>
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Heritage Collection
        </Typography>
        <Chip label={filteredItems.length} size="small" sx={{ height: 20 }} />
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded || !!searchQuery}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {filteredItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => onStyleSelect?.(item.id, item.keywords)}
              sx={{
                p: 1,
                mb: 0.75,
                borderRadius: `${creativeCardTokens.radius.button}px`,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'warning.main',
                  bgcolor: alpha('#F59E0B', 0.05),
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.region}
                  </Typography>
                </Box>
                <Tooltip title="Apply style keywords">
                  <IconButton size="small">
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5, lineHeight: 1.3 }}
              >
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
});

// ============================================================================
// STYLE PRESETS SECTION
// ============================================================================

interface StylePresetsSectionProps {
  onStyleSelect?: (styleId: string, keywords: string[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}

const StylePresetsSection = memo(function StylePresetsSection({
  onStyleSelect,
  isExpanded,
  onToggle,
  searchQuery,
}: StylePresetsSectionProps) {
  const filteredPresets = searchQuery
    ? STYLE_PRESETS.filter(
        (preset) =>
          preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          preset.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : STYLE_PRESETS;

  if (searchQuery && filteredPresets.length === 0) {
    return null;
  }

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Typography sx={{ fontSize: '1.1rem' }}>🎨</Typography>
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Style Presets
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded || !!searchQuery}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Grid container spacing={1}>
            {filteredPresets.map((preset) => (
              <Grid size={{ xs: 6 }} key={preset.id}>
                <StylePresetCard preset={preset} onSelect={onStyleSelect} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
});

interface StylePresetCardProps {
  preset: StylePreset;
  onSelect?: (styleId: string, keywords: string[]) => void;
}

const StylePresetCard = memo(function StylePresetCard({
  preset,
  onSelect,
}: StylePresetCardProps) {
  return (
    <Box
      onClick={() => onSelect?.(preset.id, preset.keywords)}
      sx={{
        p: 1,
        borderRadius: `${creativeCardTokens.radius.button}px`,
        cursor: 'pointer',
        border: '2px solid',
        borderColor: alpha(preset.color, 0.3),
        bgcolor: alpha(preset.color, 0.05),
        textAlign: 'center',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: preset.color,
          bgcolor: alpha(preset.color, 0.1),
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          mx: 'auto',
          mb: 0.5,
          borderRadius: '50%',
          bgcolor: preset.color,
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
        {preset.name}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
      >
        {preset.description}
      </Typography>
    </Box>
  );
});

// ============================================================================
// COLOR PALETTES SECTION
// ============================================================================

interface ColorPalettesSectionProps {
  onColorPaletteSelect?: (paletteId: string, colors: string[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}

const ColorPalettesSection = memo(function ColorPalettesSection({
  onColorPaletteSelect,
  isExpanded,
  onToggle,
  searchQuery,
}: ColorPalettesSectionProps) {
  const filteredPalettes = searchQuery
    ? COLOR_PALETTES.filter((palette) =>
        palette.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : COLOR_PALETTES;

  if (searchQuery && filteredPalettes.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <PaletteIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Color Palettes
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded || !!searchQuery}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {filteredPalettes.map((palette) => (
            <ColorPaletteCard
              key={palette.id}
              palette={palette}
              onSelect={onColorPaletteSelect}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
});

interface ColorPaletteCardProps {
  palette: ColorPalette;
  onSelect?: (paletteId: string, colors: string[]) => void;
}

const ColorPaletteCard = memo(function ColorPaletteCard({
  palette,
  onSelect,
}: ColorPaletteCardProps) {
  return (
    <Box
      onClick={() => onSelect?.(palette.id, palette.colors)}
      sx={{
        mb: 1,
        borderRadius: `${creativeCardTokens.radius.button}px`,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Color Strips */}
      <Box sx={{ display: 'flex', height: 32 }}>
        {palette.colors.map((color, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              bgcolor: color,
            }}
          />
        ))}
      </Box>
      {/* Name */}
      <Box sx={{ px: 1, py: 0.5, bgcolor: 'background.paper' }}>
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          {palette.name}
        </Typography>
      </Box>
    </Box>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const StyleTab = memo(function StyleTab({
  onStyleSelect,
  onColorPaletteSelect,
  searchQuery,
}: StyleTabProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    styleDNA: true,
    heritage: false,
    presets: true,
    palettes: false,
  });

  const handleToggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Style DNA */}
      <StyleDNASection
        styleDNA={USER_STYLE_DNA}
        onStyleSelect={onStyleSelect}
        isExpanded={expandedSections.styleDNA}
        onToggle={() => handleToggleSection('styleDNA')}
      />

      {/* Heritage Collection */}
      <HeritageCollectionSection
        onStyleSelect={onStyleSelect}
        isExpanded={expandedSections.heritage}
        onToggle={() => handleToggleSection('heritage')}
        searchQuery={searchQuery}
      />

      {/* Style Presets */}
      <StylePresetsSection
        onStyleSelect={onStyleSelect}
        isExpanded={expandedSections.presets}
        onToggle={() => handleToggleSection('presets')}
        searchQuery={searchQuery}
      />

      {/* Color Palettes */}
      <ColorPalettesSection
        onColorPaletteSelect={onColorPaletteSelect}
        isExpanded={expandedSections.palettes}
        onToggle={() => handleToggleSection('palettes')}
        searchQuery={searchQuery}
      />
    </Box>
  );
});

export default StyleTab;
