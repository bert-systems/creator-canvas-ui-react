/**
 * ListingCreator - Flow-based wizard for creating marketplace listings
 * Steps: Select Asset -> Details -> Pricing -> Preview & Publish
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Alert,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  studioColors,
  studioRadii,
  studioTypography,
} from '../studios/shared/studioTokens';
import { FlowMode, type FlowStep } from '../studios/modes/FlowMode';
import type {
  Asset,
  ListingCategory,
  LicenseType,
  CreateListingParams,
} from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

interface ListingCreatorProps {
  onComplete: (listing: CreateListingParams) => void;
  onCancel: () => void;
  preselectedAsset?: Asset | null;
}

interface ListingFormData {
  selectedAsset: Asset | null;
  title: string;
  description: string;
  category: ListingCategory;
  subcategory: string;
  tags: string[];
  priceUsd: number;
  licenseType: LicenseType;
  licenseDetails: string;
  isFree: boolean;
  previewImages: string[];
}

// ============================================================================
// Constants
// ============================================================================

const FLOW_STEPS: FlowStep[] = [
  { id: 'select', label: 'Select Asset', description: 'Choose an asset from your library' },
  { id: 'details', label: 'Add Details', description: 'Title, description, and tags' },
  { id: 'pricing', label: 'Set Pricing', description: 'Price and license type' },
  { id: 'preview', label: 'Preview & Publish', description: 'Review and publish your listing' },
];

const CATEGORIES: { value: ListingCategory; label: string; subcategories: string[] }[] = [
  { value: 'fashion', label: 'Fashion & Style', subcategories: ['Clothing', 'Accessories', 'Footwear', 'Jewelry'] },
  { value: 'interior', label: 'Interior Design', subcategories: ['Furniture', 'Decor', 'Lighting', 'Textiles'] },
  { value: 'art', label: 'Digital Art', subcategories: ['Abstract', 'Portraits', 'Landscapes', 'Conceptual'] },
  { value: 'photography', label: 'Photography', subcategories: ['Stock', 'Editorial', 'Product', 'Portrait'] },
  { value: 'illustration', label: 'Illustration', subcategories: ['Character', 'Icon', 'Pattern', 'Scene'] },
  { value: 'pattern', label: 'Patterns', subcategories: ['Geometric', 'Floral', 'Abstract', 'Textile'] },
  { value: 'texture', label: 'Textures', subcategories: ['Fabric', 'Wood', 'Metal', 'Stone'] },
  { value: 'stock', label: 'Stock Images', subcategories: ['Business', 'Nature', 'People', 'Technology'] },
  { value: 'template', label: 'Templates', subcategories: ['Social Media', 'Marketing', 'Presentation', 'Web'] },
  { value: 'other', label: 'Other', subcategories: [] },
];

const LICENSE_OPTIONS: { value: LicenseType; label: string; description: string; suggestedPrice: number }[] = [
  { value: 'personal', label: 'Personal License', description: 'For personal, non-commercial use only. Cannot be used in products for sale.', suggestedPrice: 9 },
  { value: 'commercial', label: 'Commercial License', description: 'For business and commercial projects. Can be used in client work and products.', suggestedPrice: 29 },
  { value: 'extended', label: 'Extended License', description: 'Unlimited commercial use with resale rights. Can be used in templates and merchandise.', suggestedPrice: 99 },
  { value: 'exclusive', label: 'Exclusive License', description: 'One-time sale with full ownership transfer. Asset will be removed from marketplace.', suggestedPrice: 299 },
];

// Mock user assets
const MOCK_USER_ASSETS: Asset[] = Array.from({ length: 12 }, (_, i) => ({
  id: `asset-${i + 1}`,
  assetType: 'image',
  title: `My Creative Asset ${i + 1}`,
  description: 'A beautiful AI-generated creative asset',
  publicUrl: `https://picsum.photos/seed/${i + 200}/400/400`,
  thumbnailUrl: `https://picsum.photos/seed/${i + 200}/200/200`,
  width: 1024,
  height: 1024,
  aspectRatio: '1:1',
  durationSeconds: null,
  fileSizeBytes: 1024 * 1024 * 2,
  mimeType: 'image/png',
  visibility: 'private',
  isGenerated: true,
  source: 'studio-fashion',
  sourceAction: 'image-generation',
  provider: 'fal.ai',
  model: 'flux-pro',
  prompt: 'A stunning fashion photograph with professional lighting',
  tags: ['fashion', 'style', 'creative'],
  autoTags: ['clothing', 'model'],
  likesCount: 0,
  viewsCount: 0,
  downloadsCount: 0,
  isFeatured: false,
  isLikedByUser: false,
  userId: 'user-1',
  generationId: null,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

// ============================================================================
// Component
// ============================================================================

export const ListingCreator: React.FC<ListingCreatorProps> = ({
  onComplete,
  onCancel,
  preselectedAsset,
}) => {
  // Flow state
  const [currentStep, setCurrentStep] = useState(preselectedAsset ? 1 : 0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ListingFormData>({
    selectedAsset: preselectedAsset || null,
    title: preselectedAsset?.title || '',
    description: preselectedAsset?.description || '',
    category: 'art',
    subcategory: '',
    tags: preselectedAsset?.tags || [],
    priceUsd: 19,
    licenseType: 'commercial',
    licenseDetails: '',
    isFree: false,
    previewImages: [],
  });

  // Asset search
  const [assetSearch, setAssetSearch] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Filtered assets
  const filteredAssets = useMemo(() => {
    if (!assetSearch) return MOCK_USER_ASSETS;
    const query = assetSearch.toLowerCase();
    return MOCK_USER_ASSETS.filter(
      (a) =>
        a.title?.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query))
    );
  }, [assetSearch]);

  // Validation
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!formData.selectedAsset;
      case 1:
        return formData.title.trim().length >= 3 && formData.description.trim().length >= 10 && !!formData.category;
      case 2:
        return formData.isFree || formData.priceUsd > 0;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Handlers
  const handleAssetSelect = useCallback((asset: Asset) => {
    setFormData((prev) => ({
      ...prev,
      selectedAsset: asset,
      title: prev.title || asset.title || '',
      description: prev.description || asset.description || '',
      tags: prev.tags.length > 0 ? prev.tags : asset.tags || [],
    }));
  }, []);

  const handleFieldChange = useCallback((field: keyof ListingFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const handleLicenseChange = useCallback((license: LicenseType) => {
    const option = LICENSE_OPTIONS.find((l) => l.value === license);
    setFormData((prev) => ({
      ...prev,
      licenseType: license,
      priceUsd: option?.suggestedPrice || prev.priceUsd,
    }));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!formData.selectedAsset) return;

    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const listing: CreateListingParams = {
        assetId: formData.selectedAsset.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        tags: formData.tags,
        priceUsd: formData.isFree ? 0 : formData.priceUsd,
        licenseType: formData.licenseType,
        licenseDetails: formData.licenseDetails || undefined,
        previewImages: formData.previewImages,
      };

      onComplete(listing);
    } finally {
      setIsProcessing(false);
    }
  }, [formData, onComplete]);

  // ============================================================================
  // Step Renders
  // ============================================================================

  const renderSelectAssetStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Search */}
      <TextField
        placeholder="Search your assets..."
        value={assetSearch}
        onChange={(e) => setAssetSearch(e.target.value)}
        size="small"
        sx={{
          maxWidth: 400,
          '& .MuiOutlinedInput-root': {
            background: studioColors.surface1,
            '& fieldset': { borderColor: studioColors.border },
            '&:hover fieldset': { borderColor: studioColors.borderHover },
          },
          '& .MuiInputBase-input': { color: studioColors.textPrimary },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: studioColors.textMuted, fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Asset Grid */}
      <Grid container spacing={2}>
        {filteredAssets.map((asset) => {
          const isSelected = formData.selectedAsset?.id === asset.id;
          return (
            <Grid key={asset.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <Card
                onClick={() => handleAssetSelect(asset)}
                sx={{
                  position: 'relative',
                  background: studioColors.surface1,
                  border: `2px solid ${isSelected ? studioColors.accent : studioColors.border}`,
                  borderRadius: `${studioRadii.md}px`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: studioColors.accent,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={asset.thumbnailUrl || asset.publicUrl}
                  alt={asset.title || ''}
                  sx={{ aspectRatio: '1/1', objectFit: 'cover' }}
                />
                {isSelected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: studioColors.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />
                  </Box>
                )}
                <Box sx={{ p: 1.5 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      color: studioColors.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {asset.title || 'Untitled'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      color: studioColors.textMuted,
                    }}
                  >
                    {asset.assetType} - {(asset.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredAssets.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ImageIcon sx={{ fontSize: 48, color: studioColors.textMuted, mb: 2 }} />
          <Typography sx={{ color: studioColors.textSecondary }}>
            No assets found. Upload some assets first!
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderDetailsStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
      {/* Title */}
      <TextField
        label="Title"
        value={formData.title}
        onChange={(e) => handleFieldChange('title', e.target.value)}
        placeholder="Enter a catchy title for your listing"
        fullWidth
        required
        error={formData.title.length > 0 && formData.title.length < 3}
        helperText={formData.title.length > 0 && formData.title.length < 3 ? 'Title must be at least 3 characters' : ''}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: studioColors.surface1,
            '& fieldset': { borderColor: studioColors.border },
          },
          '& .MuiInputLabel-root': { color: studioColors.textSecondary },
          '& .MuiInputBase-input': { color: studioColors.textPrimary },
        }}
      />

      {/* Description */}
      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => handleFieldChange('description', e.target.value)}
        placeholder="Describe your asset, its style, and potential use cases..."
        fullWidth
        required
        multiline
        rows={4}
        error={formData.description.length > 0 && formData.description.length < 10}
        helperText={formData.description.length > 0 && formData.description.length < 10 ? 'Description must be at least 10 characters' : ''}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: studioColors.surface1,
            '& fieldset': { borderColor: studioColors.border },
          },
          '& .MuiInputLabel-root': { color: studioColors.textSecondary },
          '& .MuiInputBase-input': { color: studioColors.textPrimary },
        }}
      />

      {/* Category */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: studioColors.textSecondary }}>Category</InputLabel>
            <Select
              value={formData.category}
              label="Category"
              onChange={(e) => {
                handleFieldChange('category', e.target.value as ListingCategory);
                handleFieldChange('subcategory', '');
              }}
              sx={{
                background: studioColors.surface1,
                color: studioColors.textPrimary,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: studioColors.border },
              }}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {CATEGORIES.find((c) => c.value === formData.category)?.subcategories.length ? (
            <FormControl fullWidth>
              <InputLabel sx={{ color: studioColors.textSecondary }}>Subcategory</InputLabel>
              <Select
                value={formData.subcategory}
                label="Subcategory"
                onChange={(e) => handleFieldChange('subcategory', e.target.value)}
                sx={{
                  background: studioColors.surface1,
                  color: studioColors.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: studioColors.border },
                }}
              >
                {CATEGORIES.find((c) => c.value === formData.category)?.subcategories.map((sub) => (
                  <MenuItem key={sub} value={sub}>
                    {sub}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Grid>
      </Grid>

      {/* Tags */}
      <Box>
        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, mb: 1 }}>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add a tag..."
            size="small"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                background: studioColors.surface1,
                '& fieldset': { borderColor: studioColors.border },
              },
              '& .MuiInputBase-input': { color: studioColors.textPrimary },
            }}
          />
          <Button
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            sx={{
              background: studioColors.surface2,
              color: studioColors.textSecondary,
              '&:hover': { background: studioColors.surface3 },
            }}
          >
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {formData.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onDelete={() => handleRemoveTag(tag)}
              sx={{
                background: studioColors.surface2,
                color: studioColors.textSecondary,
                '& .MuiChip-deleteIcon': { color: studioColors.textMuted },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  const renderPricingStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
      {/* Free option */}
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.isFree}
            onChange={(e) => handleFieldChange('isFree', e.target.checked)}
            sx={{ color: studioColors.textSecondary, '&.Mui-checked': { color: studioColors.accent } }}
          />
        }
        label={
          <Box>
            <Typography sx={{ color: studioColors.textPrimary }}>Offer this asset for free</Typography>
            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
              Build your following and get exposure with free downloads
            </Typography>
          </Box>
        }
      />

      {!formData.isFree && (
        <>
          {/* License Type */}
          <Box>
            <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: 500, color: studioColors.textPrimary, mb: 2 }}>
              License Type
            </Typography>
            <RadioGroup
              value={formData.licenseType}
              onChange={(e) => handleLicenseChange(e.target.value as LicenseType)}
            >
              <Grid container spacing={2}>
                {LICENSE_OPTIONS.map((option) => (
                  <Grid key={option.value} size={{ xs: 12, sm: 6 }}>
                    <Card
                      sx={{
                        p: 2,
                        background: formData.licenseType === option.value ? studioColors.surface2 : studioColors.surface1,
                        border: `2px solid ${formData.licenseType === option.value ? studioColors.accent : studioColors.border}`,
                        borderRadius: `${studioRadii.md}px`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: studioColors.accent },
                      }}
                      onClick={() => handleLicenseChange(option.value)}
                    >
                      <FormControlLabel
                        value={option.value}
                        control={
                          <Radio
                            sx={{
                              color: studioColors.textSecondary,
                              '&.Mui-checked': { color: studioColors.accent },
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: 500, color: studioColors.textPrimary }}>
                              {option.label}
                            </Typography>
                            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mt: 0.5 }}>
                              {option.description}
                            </Typography>
                            <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.accent, mt: 1 }}>
                              Suggested: ${option.suggestedPrice}
                            </Typography>
                          </Box>
                        }
                        sx={{ alignItems: 'flex-start', m: 0 }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </Box>

          {/* Price */}
          <TextField
            label="Price (USD)"
            type="number"
            value={formData.priceUsd}
            onChange={(e) => handleFieldChange('priceUsd', Math.max(0, parseFloat(e.target.value) || 0))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{
              maxWidth: 200,
              '& .MuiOutlinedInput-root': {
                background: studioColors.surface1,
                '& fieldset': { borderColor: studioColors.border },
              },
              '& .MuiInputLabel-root': { color: studioColors.textSecondary },
              '& .MuiInputBase-input': { color: studioColors.textPrimary },
            }}
          />

          {/* Earnings estimate */}
          <Alert
            icon={<InfoOutlinedIcon />}
            severity="info"
            sx={{
              background: studioColors.surface2,
              color: studioColors.textSecondary,
              border: `1px solid ${studioColors.border}`,
              '& .MuiAlert-icon': { color: studioColors.accent },
            }}
          >
            <Typography sx={{ fontSize: studioTypography.fontSize.sm }}>
              You'll earn <strong>${(formData.priceUsd * 0.8).toFixed(2)}</strong> per sale after platform fees (20%).
            </Typography>
          </Alert>
        </>
      )}

      {/* Custom license details */}
      <TextField
        label="Additional License Terms (Optional)"
        value={formData.licenseDetails}
        onChange={(e) => handleFieldChange('licenseDetails', e.target.value)}
        placeholder="Add any custom terms or restrictions..."
        multiline
        rows={2}
        sx={{
          '& .MuiOutlinedInput-root': {
            background: studioColors.surface1,
            '& fieldset': { borderColor: studioColors.border },
          },
          '& .MuiInputLabel-root': { color: studioColors.textSecondary },
          '& .MuiInputBase-input': { color: studioColors.textPrimary },
        }}
      />
    </Box>
  );

  const renderPreviewStep = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Preview Card */}
      <Card
        sx={{
          background: studioColors.surface1,
          border: `1px solid ${studioColors.border}`,
          borderRadius: `${studioRadii.lg}px`,
          overflow: 'hidden',
          maxWidth: 400,
        }}
      >
        {/* Image */}
        <CardMedia
          component="img"
          image={formData.selectedAsset?.publicUrl}
          alt={formData.title}
          sx={{ aspectRatio: '4/3', objectFit: 'cover' }}
        />

        {/* Price badge */}
        <Box
          sx={{
            position: 'relative',
            mt: -4,
            mx: 2,
            display: 'inline-flex',
          }}
        >
          <Chip
            label={formData.isFree ? 'FREE' : `$${formData.priceUsd}`}
            sx={{
              background: formData.isFree ? '#4CAF50' : studioColors.accent,
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              px: 1,
            }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.md,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
              mb: 1,
            }}
          >
            {formData.title}
          </Typography>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              color: studioColors.textSecondary,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {formData.description}
          </Typography>

          {/* Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            <Chip
              label={CATEGORIES.find((c) => c.value === formData.category)?.label}
              size="small"
              sx={{ background: studioColors.surface2, color: studioColors.textSecondary }}
            />
            {formData.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{ background: studioColors.surface2, color: studioColors.textMuted }}
              />
            ))}
          </Box>

          {/* License */}
          <Divider sx={{ borderColor: studioColors.border, mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOfferIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
              {LICENSE_OPTIONS.find((l) => l.value === formData.licenseType)?.label}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Summary */}
      <Box
        sx={{
          background: studioColors.surface2,
          borderRadius: `${studioRadii.md}px`,
          p: 3,
          maxWidth: 500,
        }}
      >
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.md,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
            mb: 2,
          }}
        >
          Listing Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Category</Typography>
            <Typography sx={{ fontSize: 14, color: studioColors.textPrimary }}>
              {CATEGORIES.find((c) => c.value === formData.category)?.label}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Price</Typography>
            <Typography sx={{ fontSize: 14, color: studioColors.textPrimary }}>
              {formData.isFree ? 'Free' : `$${formData.priceUsd}`}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>License</Typography>
            <Typography sx={{ fontSize: 14, color: studioColors.textPrimary }}>
              {LICENSE_OPTIONS.find((l) => l.value === formData.licenseType)?.label}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Tags</Typography>
            <Typography sx={{ fontSize: 14, color: studioColors.textPrimary }}>
              {formData.tags.length} tags
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Notice */}
      <Alert
        severity="info"
        sx={{
          maxWidth: 500,
          background: studioColors.surface2,
          color: studioColors.textSecondary,
          border: `1px solid ${studioColors.border}`,
        }}
      >
        Your listing will be reviewed before going live. This typically takes 24-48 hours.
      </Alert>
    </Box>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderSelectAssetStep();
      case 1:
        return renderDetailsStep();
      case 2:
        return renderPricingStep();
      case 3:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <FlowMode
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onComplete={handleComplete}
      onCancel={onCancel}
      title="Create Listing"
      canProceed={canProceed}
      nextLabel={currentStep === 3 ? 'Publish Listing' : undefined}
      isProcessing={isProcessing}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default ListingCreator;
