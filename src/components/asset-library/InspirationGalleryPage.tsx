/**
 * InspirationGalleryPage - Community gallery showing featured and public assets
 * For discovering inspiration from AI-generated content
 * Enhanced with curated sections and hero features
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
  Skeleton,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import GridViewIcon from '@mui/icons-material/GridView';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import WeekendIcon from '@mui/icons-material/Weekend';
import BrushIcon from '@mui/icons-material/Brush';
import {
  studioColors,
  studioRadii,
  studioMotion,
  studioTypography,
} from '../studios/shared/studioTokens';
import { AssetGrid } from './AssetGrid';
import { AssetCard } from './AssetCard';
import { CollectionCard } from './CollectionCard';
import { AssetDetailModal } from './AssetDetailModal';
import { useAssetStore } from '@/stores/assetStore';
import type { Asset, Collection, AssetSearchParams } from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

type SortMode = 'featured' | 'trending' | 'recent';
type ContentType = 'all' | 'image' | 'video' | 'audio';
type ViewSection = 'home' | 'browse';

const CATEGORY_TAGS = [
  'Fashion',
  'Interior',
  'Product',
  'Portrait',
  'Landscape',
  'Abstract',
  'Fantasy',
  'Sci-Fi',
  'Minimalist',
  'Vintage',
];

// Curated category cards for the home section
const CATEGORY_CARDS = [
  {
    id: 'fashion',
    title: 'Fashion & Style',
    description: 'Discover stunning fashion photography and design',
    icon: CheckroomIcon,
    gradient: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
    tag: 'Fashion',
  },
  {
    id: 'interior',
    title: 'Interior Design',
    description: 'Explore beautiful spaces and room designs',
    icon: WeekendIcon,
    gradient: 'linear-gradient(135deg, #3F51B5 0%, #2196F3 100%)',
    tag: 'Interior',
  },
  {
    id: 'art',
    title: 'Digital Art',
    description: 'Creative artwork and illustrations',
    icon: BrushIcon,
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
    tag: 'Abstract',
  },
  {
    id: 'moodboards',
    title: 'Moodboards',
    description: 'Curated aesthetic collections',
    icon: ColorLensIcon,
    gradient: 'linear-gradient(135deg, #FF9800 0%, #F44336 100%)',
    tag: 'Minimalist',
  },
];

// ============================================================================
// Component
// ============================================================================

export const InspirationGalleryPage: React.FC = () => {
  // Store
  const {
    assets,
    featuredAssets,
    collections,
    myCollections,
    assetsLoading,
    assetsHasMore,
    searchAssets,
    fetchFeaturedAssets,
    fetchPublicCollections,
    fetchMyCollections,
    likeAsset,
    unlikeAsset,
    addToCollection,
  } = useAssetStore();

  // Local state
  const [viewSection, setViewSection] = useState<ViewSection>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('featured');
  const [contentType, setContentType] = useState<ContentType>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCollections, setShowCollections] = useState(false);

  // Asset detail modal state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetDetailOpen, setAssetDetailOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchFeaturedAssets();
    fetchPublicCollections();
    fetchMyCollections();
  }, [fetchFeaturedAssets, fetchPublicCollections, fetchMyCollections]);

  // Search when query or filters change
  useEffect(() => {
    const params: AssetSearchParams = {
      page: 1,
      pageSize: 24,
    };

    if (searchQuery) {
      params.query = searchQuery;
    }

    if (contentType !== 'all') {
      params.assetType = contentType;
    }

    if (selectedTags.length > 0) {
      params.tags = selectedTags.join(',');
    }

    // Sort mapping
    switch (sortMode) {
      case 'featured':
        params.isFeatured = true;
        break;
      case 'trending':
        params.sortBy = 'popularity';
        break;
      case 'recent':
        params.sortBy = 'newest';
        break;
    }

    searchAssets(params);
  }, [searchQuery, sortMode, contentType, selectedTags, searchAssets]);

  // Handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value) {
      setViewSection('browse');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setViewSection('home');
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setViewSection('browse');
  };

  const handleCategoryClick = (tag: string) => {
    setSelectedTags([tag]);
    setViewSection('browse');
  };

  const handleBrowseAll = () => {
    setSelectedTags([]);
    setSortMode('featured');
    setViewSection('browse');
  };

  const handleBackToHome = () => {
    setViewSection('home');
    setSearchQuery('');
    setSelectedTags([]);
  };

  // Display assets based on mode
  const displayAssets = sortMode === 'featured' && !searchQuery ? featuredAssets : assets;

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetDetailOpen(true);
  };

  const handleAssetDetailClose = () => {
    setAssetDetailOpen(false);
    setSelectedAsset(null);
  };

  // Navigate to previous/next asset in the list
  const handleNavigatePrev = useCallback(() => {
    if (!selectedAsset) return;
    const currentIndex = displayAssets.findIndex((a) => a.id === selectedAsset.id);
    if (currentIndex > 0) {
      setSelectedAsset(displayAssets[currentIndex - 1]);
    }
  }, [selectedAsset, displayAssets]);

  const handleNavigateNext = useCallback(() => {
    if (!selectedAsset) return;
    const currentIndex = displayAssets.findIndex((a) => a.id === selectedAsset.id);
    if (currentIndex < displayAssets.length - 1) {
      setSelectedAsset(displayAssets[currentIndex + 1]);
    }
  }, [selectedAsset, displayAssets]);

  const hasPrevAsset = selectedAsset
    ? displayAssets.findIndex((a) => a.id === selectedAsset.id) > 0
    : false;
  const hasNextAsset = selectedAsset
    ? displayAssets.findIndex((a) => a.id === selectedAsset.id) < displayAssets.length - 1
    : false;

  const handleAddAssetToCollection = async (assetId: string, collectionId: string) => {
    await addToCollection(collectionId, [assetId]);
  };

  const handleDownload = (asset: Asset) => {
    window.open(asset.publicUrl, '_blank');
  };

  const handleLike = async (assetId: string) => {
    await likeAsset(assetId);
  };

  const handleUnlike = async (assetId: string) => {
    await unlikeAsset(assetId);
  };

  const handleCollectionClick = (collection: Collection) => {
    // For inspiration gallery, we just show a preview - could expand to full collection view
    console.log('Collection clicked:', collection);
  };

  const handleLoadMore = useCallback(() => {
    const nextPage = Math.floor(assets.length / 24) + 1;
    searchAssets({
      page: nextPage,
      query: searchQuery || undefined,
      assetType: contentType !== 'all' ? contentType : undefined,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
    });
  }, [assets.length, searchQuery, contentType, selectedTags, searchAssets]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: studioColors.carbon,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 3,
          borderBottom: `1px solid ${studioColors.border}`,
          background: viewSection === 'home'
            ? `linear-gradient(135deg, ${studioColors.surface1} 0%, ${studioColors.ink} 100%)`
            : studioColors.surface1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {viewSection === 'browse' && (
              <IconButton onClick={handleBackToHome} sx={{ color: studioColors.textSecondary }}>
                <ClearIcon />
              </IconButton>
            )}
            <AutoAwesomeIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize['2xl'],
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textPrimary,
                }}
              >
                {viewSection === 'home' ? 'Inspiration Gallery' :
                  selectedTags.length > 0 ? selectedTags.join(', ') : 'Browse All'}
              </Typography>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  color: studioColors.textMuted,
                }}
              >
                {viewSection === 'home'
                  ? 'Discover amazing AI-generated content from the community'
                  : `${displayAssets.length} results`}
              </Typography>
            </Box>
          </Box>
          {viewSection === 'home' && (
            <Button
              variant="outlined"
              onClick={handleBrowseAll}
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: studioColors.textSecondary,
                borderColor: studioColors.border,
                '&:hover': { borderColor: studioColors.accent },
              }}
            >
              Browse All
            </Button>
          )}
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search for inspiration..."
          value={searchQuery}
          onChange={handleSearch}
          fullWidth
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              background: studioColors.surface1,
              borderRadius: `${studioRadii.lg}px`,
              '& fieldset': { borderColor: studioColors.border },
              '&:hover fieldset': { borderColor: studioColors.borderHover },
              '&.Mui-focused fieldset': { borderColor: studioColors.accent },
            },
            '& .MuiInputBase-input': {
              color: studioColors.textPrimary,
              fontSize: studioTypography.fontSize.md,
              py: 1.5,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: studioColors.textMuted }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon sx={{ fontSize: 18, color: studioColors.textMuted }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Filter Bar - Only show in browse mode */}
      {viewSection === 'browse' && (
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${studioColors.border}`,
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {/* Sort Mode */}
        <ToggleButtonGroup
          value={sortMode}
          exclusive
          onChange={(_, value) => value && setSortMode(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: `1px solid ${studioColors.border}`,
              color: studioColors.textSecondary,
              textTransform: 'none',
              px: 2,
              '&.Mui-selected': {
                background: studioColors.accent,
                color: studioColors.textPrimary,
                borderColor: studioColors.accent,
                '&:hover': { background: studioColors.accentMuted },
              },
            },
          }}
        >
          <ToggleButton value="featured">
            <WhatshotIcon sx={{ fontSize: 18, mr: 0.5 }} />
            Featured
          </ToggleButton>
          <ToggleButton value="trending">
            <TrendingUpIcon sx={{ fontSize: 18, mr: 0.5 }} />
            Trending
          </ToggleButton>
          <ToggleButton value="recent">
            <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5 }} />
            Recent
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Content Type */}
        <ToggleButtonGroup
          value={contentType}
          exclusive
          onChange={(_, value) => value && setContentType(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: `1px solid ${studioColors.border}`,
              color: studioColors.textSecondary,
              textTransform: 'none',
              '&.Mui-selected': {
                background: studioColors.surface2,
                color: studioColors.accent,
              },
            },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="image">Images</ToggleButton>
          <ToggleButton value="video">Videos</ToggleButton>
          <ToggleButton value="audio">Audio</ToggleButton>
        </ToggleButtonGroup>

        {/* View Toggle */}
        <Tooltip title={showCollections ? 'Show Assets' : 'Show Collections'}>
          <IconButton
            onClick={() => setShowCollections((prev) => !prev)}
            sx={{
              color: showCollections ? studioColors.accent : studioColors.textSecondary,
              border: `1px solid ${showCollections ? studioColors.accent : studioColors.border}`,
              borderRadius: `${studioRadii.sm}px`,
            }}
          >
            {showCollections ? (
              <ViewModuleIcon sx={{ fontSize: 20 }} />
            ) : (
              <GridViewIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Tooltip>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Result Count */}
        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textMuted }}>
          {displayAssets.length} items
        </Typography>
      </Box>
      )}

      {/* Category Tags - Only show in browse mode */}
      {viewSection === 'browse' && (
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          borderBottom: `1px solid ${studioColors.border}`,
          flexShrink: 0,
        }}
      >
        {CATEGORY_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => handleTagClick(tag)}
            sx={{
              background: selectedTags.includes(tag) ? studioColors.accent : studioColors.surface2,
              color: selectedTags.includes(tag) ? studioColors.textPrimary : studioColors.textSecondary,
              borderRadius: `${studioRadii.md}px`,
              fontSize: studioTypography.fontSize.xs,
              cursor: 'pointer',
              '&:hover': {
                background: selectedTags.includes(tag)
                  ? studioColors.accentMuted
                  : studioColors.surface3,
              },
            }}
          />
        ))}
        {selectedTags.length > 0 && (
          <Chip
            label="Clear all"
            onClick={() => setSelectedTags([])}
            sx={{
              background: 'transparent',
              color: studioColors.textMuted,
              borderRadius: `${studioRadii.md}px`,
              fontSize: studioTypography.fontSize.xs,
              cursor: 'pointer',
              '&:hover': { color: studioColors.textSecondary },
            }}
          />
        )}
      </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {viewSection === 'home' ? (
          // Home View - Curated sections
          <Box>
            {/* Category Cards */}
            <Box sx={{ mb: 5 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.lg,
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textPrimary,
                  mb: 2,
                }}
              >
                Explore Categories
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                {CATEGORY_CARDS.map((category) => (
                  <Card
                    key={category.id}
                    onClick={() => handleCategoryClick(category.tag)}
                    sx={{
                      background: category.gradient,
                      borderRadius: `${studioRadii.lg}px`,
                      cursor: 'pointer',
                      transition: `all ${studioMotion.fast}`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <category.icon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.9)', mb: 1 }} />
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.md,
                          fontWeight: studioTypography.fontWeight.semibold,
                          color: 'white',
                          mb: 0.5,
                        }}
                      >
                        {category.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.xs,
                          color: 'rgba(255,255,255,0.8)',
                        }}
                      >
                        {category.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* Editor's Picks */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ color: studioColors.warning }} />
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.lg,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                    }}
                  >
                    Editor's Picks
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={handleBrowseAll}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: studioColors.textSecondary }}
                >
                  See All
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                  gap: 2,
                }}
              >
                {featuredAssets.slice(0, 5).map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={handleAssetClick}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    size="medium"
                  />
                ))}
              </Box>
            </Box>

            {/* Trending Now */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalFireDepartmentIcon sx={{ color: studioColors.error }} />
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.lg,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                    }}
                  >
                    Trending Now
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => { setSortMode('trending'); setViewSection('browse'); }}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: studioColors.textSecondary }}
                >
                  See All
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                  gap: 2,
                }}
              >
                {featuredAssets.slice(5, 10).map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={handleAssetClick}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    size="medium"
                  />
                ))}
              </Box>
            </Box>

            {/* New This Week */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NewReleasesIcon sx={{ color: studioColors.accent }} />
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.lg,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                    }}
                  >
                    New This Week
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => { setSortMode('recent'); setViewSection('browse'); }}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ color: studioColors.textSecondary }}
                >
                  See All
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
                  gap: 2,
                }}
              >
                {featuredAssets.slice(10, 15).map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={handleAssetClick}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    size="medium"
                  />
                ))}
              </Box>
            </Box>

            {/* Featured Collections */}
            {collections.length > 0 && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.lg,
                    fontWeight: studioTypography.fontWeight.semibold,
                    color: studioColors.textPrimary,
                  }}
                >
                  Featured Collections
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                {collections.slice(0, 4).map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onClick={handleCollectionClick}
                  />
                ))}
              </Box>
            </Box>
            )}
          </Box>
        ) : showCollections ? (
          // Collections Grid
          <Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                mb: 2,
              }}
            >
              Featured Collections
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: 'repeat(3, 1fr)',
                  md: 'repeat(4, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: 2,
              }}
            >
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  onClick={handleCollectionClick}
                />
              ))}
              {collections.length === 0 &&
                !assetsLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    sx={{
                      aspectRatio: '16/9',
                      borderRadius: `${studioRadii.md}px`,
                      background: studioColors.surface2,
                    }}
                  />
                ))}
            </Box>
          </Box>
        ) : (
          // Assets Grid
          <AssetGrid
            assets={displayAssets}
            loading={assetsLoading}
            hasMore={assetsHasMore}
            onLoadMore={handleLoadMore}
            onAssetClick={handleAssetClick}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onDownload={handleDownload}
            columns={5}
            gap={16}
            emptyMessage={
              searchQuery
                ? `No results found for "${searchQuery}"`
                : 'No inspiration found'
            }
          />
        )}
      </Box>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        open={assetDetailOpen}
        asset={selectedAsset}
        onClose={handleAssetDetailClose}
        onLike={handleLike}
        onUnlike={handleUnlike}
        onDownload={handleDownload}
        onAddToCollection={handleAddAssetToCollection}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        hasPrev={hasPrevAsset}
        hasNext={hasNextAsset}
        collections={myCollections}
      />
    </Box>
  );
};

export default InspirationGalleryPage;
