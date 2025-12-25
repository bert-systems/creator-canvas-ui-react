/**
 * MarketplaceBrowsePage - Browse and discover assets from creators
 * Features curated collections, categories, search/filter, and creator spotlights
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemText,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  Skeleton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  FormControlLabel,
  Checkbox,
  Collapse,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import WeekendIcon from '@mui/icons-material/Weekend';
import BrushIcon from '@mui/icons-material/Brush';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PatternIcon from '@mui/icons-material/Pattern';
import TextureIcon from '@mui/icons-material/Texture';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  studioColors,
  studioRadii,
  studioTypography,
} from '../studios/shared/studioTokens';
import type {
  MarketplaceListing,
  ListingCategory,
  LicenseType,
  CreatorProfile,
} from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'trending';
type ViewSection = 'home' | 'browse' | 'category';

interface CategoryCard {
  id: ListingCategory;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  count: number;
}

interface FilterState {
  category?: ListingCategory;
  licenseType?: LicenseType;
  priceRange: [number, number];
  isFree: boolean;
  isFeatured: boolean;
  isTrending: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'fashion',
    title: 'Fashion & Style',
    description: 'Runway looks, outfits, and fashion photography',
    icon: CheckroomIcon,
    gradient: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
    count: 1234,
  },
  {
    id: 'interior',
    title: 'Interior Design',
    description: 'Room designs, furniture, and home decor',
    icon: WeekendIcon,
    gradient: 'linear-gradient(135deg, #FF9800 0%, #F44336 100%)',
    count: 856,
  },
  {
    id: 'art',
    title: 'Digital Art',
    description: 'Abstract, portraits, and creative artwork',
    icon: BrushIcon,
    gradient: 'linear-gradient(135deg, #673AB7 0%, #3F51B5 100%)',
    count: 2145,
  },
  {
    id: 'photography',
    title: 'Photography',
    description: 'Stock photos and professional imagery',
    icon: PhotoCameraIcon,
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #009688 100%)',
    count: 3421,
  },
  {
    id: 'pattern',
    title: 'Patterns',
    description: 'Seamless patterns and repeating designs',
    icon: PatternIcon,
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    count: 567,
  },
  {
    id: 'texture',
    title: 'Textures',
    description: 'Backgrounds, materials, and surface textures',
    icon: TextureIcon,
    gradient: 'linear-gradient(135deg, #795548 0%, #607D8B 100%)',
    count: 892,
  },
];

const LICENSE_OPTIONS: { value: LicenseType; label: string; description: string }[] = [
  { value: 'personal', label: 'Personal', description: 'For personal, non-commercial use' },
  { value: 'commercial', label: 'Commercial', description: 'For business and commercial projects' },
  { value: 'extended', label: 'Extended', description: 'Unlimited commercial use with resale rights' },
  { value: 'exclusive', label: 'Exclusive', description: 'One-time sale, full ownership transfer' },
];

// Mock data for demo
const MOCK_LISTINGS: MarketplaceListing[] = Array.from({ length: 20 }, (_, i) => ({
  id: `listing-${i + 1}`,
  assetId: `asset-${i + 1}`,
  asset: {
    id: `asset-${i + 1}`,
    assetType: 'image',
    title: `Creative Asset ${i + 1}`,
    description: 'A beautiful AI-generated creative asset',
    publicUrl: `https://picsum.photos/seed/${i + 100}/400/400`,
    thumbnailUrl: `https://picsum.photos/seed/${i + 100}/200/200`,
    width: 1024,
    height: 1024,
    aspectRatio: '1:1',
    durationSeconds: null,
    fileSizeBytes: 1024 * 1024,
    mimeType: 'image/png',
    visibility: 'public',
    isGenerated: true,
    source: 'studio-fashion',
    sourceAction: 'image-generation',
    provider: 'fal.ai',
    model: 'flux-pro',
    prompt: 'A stunning fashion photograph',
    tags: ['fashion', 'style', 'creative'],
    autoTags: [],
    likesCount: Math.floor(Math.random() * 500),
    viewsCount: Math.floor(Math.random() * 5000),
    downloadsCount: Math.floor(Math.random() * 200),
    isFeatured: i < 4,
    isLikedByUser: Math.random() > 0.7,
    userId: `user-${(i % 5) + 1}`,
    generationId: null,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  creatorId: `creator-${(i % 5) + 1}`,
  creator: {
    id: `creator-${(i % 5) + 1}`,
    userId: `user-${(i % 5) + 1}`,
    displayName: ['Alex Studio', 'Maya Designs', 'Creative Lab', 'Design Co', 'Art House'][i % 5],
    username: ['alexstudio', 'mayadesigns', 'creativelab', 'designco', 'arthouse'][i % 5],
    bio: 'Creative designer specializing in AI-generated artwork',
    avatarUrl: `https://i.pravatar.cc/150?u=${(i % 5) + 1}`,
    coverImageUrl: null,
    location: 'San Francisco, CA',
    website: 'https://example.com',
    socialLinks: {},
    isVerified: i % 3 === 0,
    isPro: i % 4 === 0,
    totalSales: Math.floor(Math.random() * 1000),
    totalListings: Math.floor(Math.random() * 50),
    followersCount: Math.floor(Math.random() * 10000),
    followingCount: Math.floor(Math.random() * 500),
    rating: 4 + Math.random(),
    reviewCount: Math.floor(Math.random() * 200),
    specialties: ['Fashion', 'Digital Art'],
    joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  title: `Creative Asset ${i + 1}`,
  description: 'A beautifully crafted AI-generated creative asset perfect for your next project.',
  category: CATEGORY_CARDS[i % 6].id,
  subcategory: null,
  tags: ['creative', 'ai-generated', 'modern'],
  priceUsd: i === 0 ? 0 : Math.floor(Math.random() * 50) + 5,
  originalPriceUsd: i % 3 === 0 ? Math.floor(Math.random() * 100) + 50 : null,
  licenseType: LICENSE_OPTIONS[i % 4].value,
  licenseDetails: null,
  isFree: i === 0,
  isExclusive: i % 10 === 0,
  downloadCount: Math.floor(Math.random() * 500),
  salesCount: Math.floor(Math.random() * 100),
  viewsCount: Math.floor(Math.random() * 5000),
  likesCount: Math.floor(Math.random() * 300),
  rating: 3.5 + Math.random() * 1.5,
  reviewCount: Math.floor(Math.random() * 50),
  status: 'active',
  isFeatured: i < 4,
  isTrending: i >= 4 && i < 8,
  isNewArrival: i >= 8 && i < 12,
  previewImages: [],
  watermarkedPreviewUrl: null,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

const FEATURED_CREATORS: CreatorProfile[] = MOCK_LISTINGS.slice(0, 5).map((l) => l.creator);

// ============================================================================
// Component
// ============================================================================

export const MarketplaceBrowsePage: React.FC = () => {
  // View state
  const [viewSection, setViewSection] = useState<ViewSection>('home');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(null);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    isFree: false,
    isFeatured: false,
    isTrending: false,
  });

  // Data state (mock for now - will integrate with API later)
  const [listings] = useState<MarketplaceListing[]>(MOCK_LISTINGS);
  const [loading] = useState(false);
  const [likedListings, setLikedListings] = useState<Set<string>>(new Set());

  // Initialize liked listings from mock data
  useEffect(() => {
    const liked = new Set(MOCK_LISTINGS.filter((l) => l.asset.isLikedByUser).map((l) => l.id));
    setLikedListings(liked);
  }, []);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.description.toLowerCase().includes(query) ||
          l.tags.some((t) => t.toLowerCase().includes(query)) ||
          l.creator.displayName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((l) => l.category === selectedCategory);
    }

    // License filter
    if (filters.licenseType) {
      result = result.filter((l) => l.licenseType === filters.licenseType);
    }

    // Price filter
    result = result.filter(
      (l) =>
        (l.isFree && filters.isFree) ||
        (l.priceUsd >= filters.priceRange[0] && l.priceUsd <= filters.priceRange[1])
    );

    // Free filter
    if (filters.isFree) {
      result = result.filter((l) => l.isFree);
    }

    // Featured filter
    if (filters.isFeatured) {
      result = result.filter((l) => l.isFeatured);
    }

    // Trending filter
    if (filters.isTrending) {
      result = result.filter((l) => l.isTrending);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.viewsCount - a.viewsCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.priceUsd - b.priceUsd);
        break;
      case 'price-high':
        result.sort((a, b) => b.priceUsd - a.priceUsd);
        break;
      case 'trending':
        result.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0) || b.salesCount - a.salesCount);
        break;
    }

    return result;
  }, [listings, searchQuery, selectedCategory, filters, sortBy]);

  // Handlers
  const handleCategoryClick = useCallback((category: ListingCategory) => {
    setSelectedCategory(category);
    setViewSection('category');
  }, []);

  const handleBackToHome = useCallback(() => {
    setViewSection('home');
    setSelectedCategory(null);
    setSearchQuery('');
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      setViewSection('browse');
    }
  }, []);

  const handleLike = useCallback((listingId: string) => {
    setLikedListings((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      priceRange: [0, 100],
      isFree: false,
      isFeatured: false,
      isTrending: false,
    });
    setSelectedCategory(null);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.licenseType) count++;
    if (filters.isFree) count++;
    if (filters.isFeatured) count++;
    if (filters.isTrending) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderListingCard = (listing: MarketplaceListing) => {
    const isLiked = likedListings.has(listing.id);

    return (
      <Card
        key={listing.id}
        sx={{
          background: studioColors.surface1,
          border: `1px solid ${studioColors.border}`,
          borderRadius: `${studioRadii.lg}px`,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            borderColor: studioColors.accent,
          },
        }}
      >
        {/* Image */}
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={listing.asset.publicUrl}
            alt={listing.title}
            sx={{
              aspectRatio: '4/3',
              objectFit: 'cover',
            }}
          />

          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
            {listing.isFeatured && (
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                label="Featured"
                size="small"
                sx={{
                  background: studioColors.accent,
                  color: studioColors.textPrimary,
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
            {listing.isTrending && (
              <Chip
                icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                label="Trending"
                size="small"
                sx={{
                  background: '#FF5722',
                  color: '#fff',
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
            {listing.isNewArrival && (
              <Chip
                icon={<NewReleasesIcon sx={{ fontSize: 14 }} />}
                label="New"
                size="small"
                sx={{
                  background: '#4CAF50',
                  color: '#fff',
                  fontSize: 11,
                  height: 22,
                }}
              />
            )}
          </Box>

          {/* Like button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleLike(listing.id);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.5)',
              color: isLiked ? '#FF4081' : '#fff',
              '&:hover': {
                background: 'rgba(0,0,0,0.7)',
              },
            }}
            size="small"
          >
            {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>

          {/* Price tag */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              background: listing.isFree ? '#4CAF50' : studioColors.surface1,
              borderRadius: `${studioRadii.sm}px`,
              px: 1.5,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {listing.originalPriceUsd && (
              <Typography
                sx={{
                  fontSize: 11,
                  color: studioColors.textMuted,
                  textDecoration: 'line-through',
                }}
              >
                ${listing.originalPriceUsd}
              </Typography>
            )}
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                fontWeight: studioTypography.fontWeight.semibold,
                color: listing.isFree ? '#fff' : studioColors.textPrimary,
              }}
            >
              {listing.isFree ? 'FREE' : `$${listing.priceUsd}`}
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 2 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              fontWeight: studioTypography.fontWeight.medium,
              color: studioColors.textPrimary,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {listing.title}
          </Typography>

          {/* Creator info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Avatar
              src={listing.creator.avatarUrl || undefined}
              sx={{ width: 20, height: 20 }}
            />
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.xs,
                color: studioColors.textSecondary,
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {listing.creator.displayName}
            </Typography>
            {listing.creator.isVerified && (
              <VerifiedIcon sx={{ fontSize: 14, color: studioColors.accent }} />
            )}
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 14, color: studioColors.textMuted }} />
              <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                {listing.viewsCount > 1000 ? `${(listing.viewsCount / 1000).toFixed(1)}k` : listing.viewsCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DownloadIcon sx={{ fontSize: 14, color: studioColors.textMuted }} />
              <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                {listing.downloadCount}
              </Typography>
            </Box>
            {listing.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ fontSize: 14, color: '#FFB300' }} />
                <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                  {listing.rating.toFixed(1)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        {/* License badge */}
        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Chip
            label={LICENSE_OPTIONS.find((l) => l.value === listing.licenseType)?.label || listing.licenseType}
            size="small"
            sx={{
              background: studioColors.surface3,
              color: studioColors.textSecondary,
              fontSize: 10,
              height: 20,
            }}
          />
        </CardActions>
      </Card>
    );
  };

  const renderCreatorCard = (creator: CreatorProfile) => (
    <Card
      key={creator.id}
      sx={{
        background: studioColors.surface1,
        border: `1px solid ${studioColors.border}`,
        borderRadius: `${studioRadii.lg}px`,
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: studioColors.accent,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={creator.avatarUrl || undefined}
          sx={{ width: 48, height: 48 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              {creator.displayName}
            </Typography>
            {creator.isVerified && (
              <VerifiedIcon sx={{ fontSize: 14, color: studioColors.accent }} />
            )}
            {creator.isPro && (
              <Chip
                label="PRO"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#000',
                  fontSize: 9,
                  height: 16,
                  ml: 0.5,
                }}
              />
            )}
          </Box>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.xs,
              color: studioColors.textMuted,
            }}
          >
            @{creator.username}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>Listings</Typography>
          <Typography sx={{ fontSize: 13, color: studioColors.textPrimary, fontWeight: 500 }}>
            {creator.totalListings}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>Sales</Typography>
          <Typography sx={{ fontSize: 13, color: studioColors.textPrimary, fontWeight: 500 }}>
            {creator.totalSales}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>Followers</Typography>
          <Typography sx={{ fontSize: 13, color: studioColors.textPrimary, fontWeight: 500 }}>
            {creator.followersCount > 1000
              ? `${(creator.followersCount / 1000).toFixed(1)}k`
              : creator.followersCount}
          </Typography>
        </Box>
      </Box>
    </Card>
  );

  const renderHomeView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${studioColors.surface2} 0%, ${studioColors.surface1} 100%)`,
          borderRadius: `${studioRadii.xl}px`,
          p: 6,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 30% 50%, ${studioColors.accent}20 0%, transparent 50%)`,
          }}
        />
        <Typography
          sx={{
            fontSize: studioTypography.fontSize['3xl'],
            fontWeight: studioTypography.fontWeight.bold,
            color: studioColors.textPrimary,
            mb: 2,
            position: 'relative',
          }}
        >
          Discover Creative Assets
        </Typography>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.md,
            color: studioColors.textSecondary,
            mb: 4,
            maxWidth: 500,
            mx: 'auto',
            position: 'relative',
          }}
        >
          Explore thousands of AI-generated assets from talented creators worldwide
        </Typography>
        <TextField
          placeholder="Search for fashion, art, textures..."
          value={searchQuery}
          onChange={handleSearch}
          sx={{
            width: '100%',
            maxWidth: 500,
            position: 'relative',
            '& .MuiOutlinedInput-root': {
              background: studioColors.surface1,
              borderRadius: `${studioRadii.lg}px`,
              '& fieldset': { borderColor: studioColors.border },
              '&:hover fieldset': { borderColor: studioColors.accent },
              '&.Mui-focused fieldset': { borderColor: studioColors.accent },
            },
            '& .MuiInputBase-input': {
              color: studioColors.textPrimary,
              py: 1.5,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: studioColors.textMuted }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category Cards */}
      <Box>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.xl,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
            mb: 3,
          }}
        >
          Browse by Category
        </Typography>
        <Grid container spacing={2}>
          {CATEGORY_CARDS.map((category) => (
            <Grid key={category.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <Card
                onClick={() => handleCategoryClick(category.id)}
                sx={{
                  background: category.gradient,
                  borderRadius: `${studioRadii.lg}px`,
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
                  },
                }}
              >
                <Box sx={{ '& svg': { fontSize: 32, color: '#fff', mb: 1 } }}>
                  <category.icon />
                </Box>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.md,
                    fontWeight: studioTypography.fontWeight.semibold,
                    color: '#fff',
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
                  {category.count.toLocaleString()} items
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Featured Listings */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.xl,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
            }}
          >
            Featured Assets
          </Typography>
          <Button
            onClick={() => {
              setFilters((prev) => ({ ...prev, isFeatured: true }));
              setViewSection('browse');
            }}
            sx={{ color: studioColors.accent }}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={2}>
          {listings
            .filter((l) => l.isFeatured)
            .slice(0, 4)
            .map((listing) => (
              <Grid key={listing.id} size={{ xs: 12, sm: 6, md: 3 }}>
                {renderListingCard(listing)}
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Trending */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#FF5722' }} />
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.xl,
                fontWeight: studioTypography.fontWeight.semibold,
                color: studioColors.textPrimary,
              }}
            >
              Trending Now
            </Typography>
          </Box>
          <Button
            onClick={() => {
              setFilters((prev) => ({ ...prev, isTrending: true }));
              setViewSection('browse');
            }}
            sx={{ color: studioColors.accent }}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={2}>
          {listings
            .filter((l) => l.isTrending)
            .slice(0, 4)
            .map((listing) => (
              <Grid key={listing.id} size={{ xs: 12, sm: 6, md: 3 }}>
                {renderListingCard(listing)}
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Featured Creators */}
      <Box>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.xl,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
            mb: 3,
          }}
        >
          Featured Creators
        </Typography>
        <Grid container spacing={2}>
          {FEATURED_CREATORS.slice(0, 4).map((creator) => (
            <Grid key={creator.id} size={{ xs: 12, sm: 6, md: 3 }}>
              {renderCreatorCard(creator)}
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  const renderBrowseView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search assets..."
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={{
            flex: 1,
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              background: studioColors.surface1,
              '& fieldset': { borderColor: studioColors.border },
              '&:hover fieldset': { borderColor: studioColors.borderHover },
              '&.Mui-focused fieldset': { borderColor: studioColors.accent },
            },
            '& .MuiInputBase-input': {
              color: studioColors.textPrimary,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: studioColors.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Filter toggle */}
        <Button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          startIcon={<FilterListIcon />}
          endIcon={filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            color: activeFilterCount > 0 ? studioColors.accent : studioColors.textSecondary,
            border: `1px solid ${activeFilterCount > 0 ? studioColors.accent : studioColors.border}`,
            borderRadius: `${studioRadii.sm}px`,
          }}
        >
          Filters
          {activeFilterCount > 0 && (
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              sx={{ ml: 1, '& .MuiBadge-badge': { background: studioColors.accent } }}
            />
          )}
        </Button>

        {/* Sort */}
        <Tooltip title="Sort">
          <IconButton
            onClick={(e) => setSortAnchor(e.currentTarget)}
            sx={{
              color: studioColors.textSecondary,
              border: `1px solid ${studioColors.border}`,
              borderRadius: `${studioRadii.sm}px`,
            }}
          >
            <SortIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* View mode */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              border: `1px solid ${studioColors.border}`,
              color: studioColors.textSecondary,
              '&.Mui-selected': {
                background: studioColors.surface2,
                color: studioColors.accent,
              },
            },
          }}
        >
          <ToggleButton value="grid">
            <ViewModuleIcon sx={{ fontSize: 20 }} />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon sx={{ fontSize: 20 }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters Panel */}
      <Collapse in={filtersExpanded}>
        <Box
          sx={{
            background: studioColors.surface1,
            border: `1px solid ${studioColors.border}`,
            borderRadius: `${studioRadii.md}px`,
            p: 3,
          }}
        >
          <Grid container spacing={3}>
            {/* Category */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                Category
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {CATEGORY_CARDS.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.title}
                    size="small"
                    onClick={() =>
                      handleFilterChange('category', filters.category === cat.id ? undefined : cat.id)
                    }
                    sx={{
                      background: filters.category === cat.id ? studioColors.accent : studioColors.surface2,
                      color: filters.category === cat.id ? studioColors.textPrimary : studioColors.textSecondary,
                      '&:hover': { background: studioColors.surface3 },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* License */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                License Type
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {LICENSE_OPTIONS.map((license) => (
                  <Chip
                    key={license.value}
                    label={license.label}
                    size="small"
                    onClick={() =>
                      handleFilterChange('licenseType', filters.licenseType === license.value ? undefined : license.value)
                    }
                    sx={{
                      background: filters.licenseType === license.value ? studioColors.accent : studioColors.surface2,
                      color: filters.licenseType === license.value ? studioColors.textPrimary : studioColors.textSecondary,
                      '&:hover': { background: studioColors.surface3 },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Price Range */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(_, value) => handleFilterChange('priceRange', value as [number, number])}
                min={0}
                max={100}
                sx={{
                  color: studioColors.accent,
                  '& .MuiSlider-thumb': {
                    background: studioColors.accent,
                  },
                }}
              />
            </Grid>

            {/* Quick filters */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                Quick Filters
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isFree}
                      onChange={(e) => handleFilterChange('isFree', e.target.checked)}
                      size="small"
                      sx={{ color: studioColors.textSecondary, '&.Mui-checked': { color: studioColors.accent } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: studioColors.textSecondary }}>Free only</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isFeatured}
                      onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                      size="small"
                      sx={{ color: studioColors.textSecondary, '&.Mui-checked': { color: studioColors.accent } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: studioColors.textSecondary }}>Featured</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isTrending}
                      onChange={(e) => handleFilterChange('isTrending', e.target.checked)}
                      size="small"
                      sx={{ color: studioColors.textSecondary, '&.Mui-checked': { color: studioColors.accent } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 13, color: studioColors.textSecondary }}>Trending</Typography>}
                />
              </Box>
            </Grid>
          </Grid>

          {activeFilterCount > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${studioColors.border}` }}>
              <Button onClick={clearFilters} size="small" sx={{ color: studioColors.textSecondary }}>
                Clear all filters
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Results count */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textMuted }}>
          {filteredListings.length} results
          {selectedCategory && ` in ${CATEGORY_CARDS.find((c) => c.id === selectedCategory)?.title}`}
        </Typography>
        {selectedCategory && (
          <Button
            onClick={handleBackToHome}
            size="small"
            sx={{ color: studioColors.textSecondary }}
          >
            Back to Home
          </Button>
        )}
      </Box>

      {/* Listings Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton
                variant="rounded"
                height={280}
                sx={{ background: studioColors.surface2, borderRadius: `${studioRadii.lg}px` }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredListings.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography sx={{ color: studioColors.textMuted, mb: 2 }}>
            No assets found matching your criteria
          </Typography>
          <Button onClick={clearFilters} sx={{ color: studioColors.accent }}>
            Clear filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredListings.map((listing) => (
            <Grid key={listing.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              {renderListingCard(listing)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchor}
        open={Boolean(sortAnchor)}
        onClose={() => setSortAnchor(null)}
        PaperProps={{
          sx: {
            background: studioColors.surface2,
            border: `1px solid ${studioColors.border}`,
            minWidth: 160,
          },
        }}
      >
        {[
          { value: 'popular', label: 'Most Popular' },
          { value: 'newest', label: 'Newest First' },
          { value: 'trending', label: 'Trending' },
          { value: 'price-low', label: 'Price: Low to High' },
          { value: 'price-high', label: 'Price: High to Low' },
        ].map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => {
              setSortBy(option.value as SortOption);
              setSortAnchor(null);
            }}
            selected={sortBy === option.value}
          >
            <ListItemText
              primary={option.label}
              primaryTypographyProps={{
                sx: {
                  fontSize: 13,
                  color: sortBy === option.value ? studioColors.accent : studioColors.textPrimary,
                },
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: studioColors.carbon,
        minHeight: 0,
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 4,
          py: 3,
          borderBottom: `1px solid ${studioColors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize['2xl'],
              fontWeight: studioTypography.fontWeight.bold,
              color: studioColors.textPrimary,
            }}
          >
            Marketplace
          </Typography>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              color: studioColors.textMuted,
            }}
          >
            Discover and download creative assets from talented creators
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {viewSection !== 'home' && (
            <Button
              onClick={handleBackToHome}
              sx={{
                color: studioColors.textSecondary,
                '&:hover': { color: studioColors.textPrimary },
              }}
            >
              Home
            </Button>
          )}
          <Button
            variant="contained"
            sx={{
              background: studioColors.accent,
              '&:hover': { background: studioColors.accentMuted },
            }}
          >
            Become a Creator
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 4, py: 4, overflow: 'auto' }}>
        {viewSection === 'home' ? renderHomeView() : renderBrowseView()}
      </Box>
    </Box>
  );
};

export default MarketplaceBrowsePage;
