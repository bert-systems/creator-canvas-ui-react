/**
 * CreatorStorefront - Public profile page for creators
 * Shows creator info, stats, listings, and social links
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Skeleton,
  Link,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LanguageIcon from '@mui/icons-material/Language';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  studioColors,
  studioRadii,
  studioTypography,
} from '../studios/shared/studioTokens';
import type {
  CreatorProfile,
  MarketplaceListing,
  ListingCategory,
} from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

interface CreatorStorefrontProps {
  creatorId: string;
  onBack?: () => void;
  onListingClick?: (listing: MarketplaceListing) => void;
}

type TabValue = 'listings' | 'collections' | 'about';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_CREATOR: CreatorProfile = {
  id: 'creator-1',
  userId: 'user-1',
  displayName: 'Creative Studio',
  username: 'creativestudio',
  bio: 'Professional AI artist specializing in fashion, interior design, and abstract art. Creating unique digital assets for creators and businesses worldwide. Passionate about pushing the boundaries of AI-generated art.',
  avatarUrl: 'https://i.pravatar.cc/200?u=creator1',
  coverImageUrl: 'https://picsum.photos/seed/cover/1200/400',
  location: 'San Francisco, CA',
  website: 'https://creativestudio.art',
  socialLinks: {
    instagram: '@creativestudio',
    twitter: '@creativestudio',
    behance: 'creativestudio',
    dribbble: 'creativestudio',
  },
  isVerified: true,
  isPro: true,
  totalSales: 1247,
  totalListings: 89,
  followersCount: 12500,
  followingCount: 340,
  rating: 4.8,
  reviewCount: 234,
  specialties: ['Fashion', 'Interior Design', 'Abstract Art', 'Textures'],
  joinedAt: '2023-06-15T00:00:00Z',
};

const MOCK_LISTINGS: MarketplaceListing[] = Array.from({ length: 12 }, (_, i) => ({
  id: `listing-${i + 1}`,
  assetId: `asset-${i + 1}`,
  asset: {
    id: `asset-${i + 1}`,
    assetType: 'image',
    title: `Creative Asset ${i + 1}`,
    description: 'A beautiful AI-generated creative asset',
    publicUrl: `https://picsum.photos/seed/${i + 300}/400/400`,
    thumbnailUrl: `https://picsum.photos/seed/${i + 300}/200/200`,
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
    isFeatured: i < 3,
    isLikedByUser: Math.random() > 0.7,
    userId: 'user-1',
    generationId: null,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  creatorId: 'creator-1',
  creator: MOCK_CREATOR,
  title: `Premium Asset ${i + 1}`,
  description: 'A beautifully crafted AI-generated creative asset perfect for your next project.',
  category: ['fashion', 'interior', 'art', 'photography'][i % 4] as ListingCategory,
  subcategory: null,
  tags: ['creative', 'ai-generated', 'modern', 'professional'],
  priceUsd: i === 0 ? 0 : Math.floor(Math.random() * 50) + 10,
  originalPriceUsd: i % 3 === 0 ? Math.floor(Math.random() * 100) + 50 : null,
  licenseType: ['personal', 'commercial', 'extended', 'exclusive'][i % 4] as 'personal' | 'commercial' | 'extended' | 'exclusive',
  licenseDetails: null,
  isFree: i === 0,
  isExclusive: i === 11,
  downloadCount: Math.floor(Math.random() * 500),
  salesCount: Math.floor(Math.random() * 100),
  viewsCount: Math.floor(Math.random() * 5000),
  likesCount: Math.floor(Math.random() * 300),
  rating: 3.5 + Math.random() * 1.5,
  reviewCount: Math.floor(Math.random() * 50),
  status: 'active',
  isFeatured: i < 3,
  isTrending: i >= 3 && i < 6,
  isNewArrival: i >= 6 && i < 9,
  previewImages: [],
  watermarkedPreviewUrl: null,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

// ============================================================================
// Component
// ============================================================================

export const CreatorStorefront: React.FC<CreatorStorefrontProps> = ({
  creatorId: _creatorId, // Will be used for API fetch
  onBack: _onBack, // Will be used for navigation
  onListingClick,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<TabValue>('listings');
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedListings, setLikedListings] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'all'>('all');
  const [loading] = useState(false); // Will be set when fetching data

  // Mock data - in production would fetch based on creatorId
  const creator = MOCK_CREATOR;
  const listings = MOCK_LISTINGS;

  // Filtered listings
  const filteredListings = useMemo(() => {
    if (selectedCategory === 'all') return listings;
    return listings.filter((l) => l.category === selectedCategory);
  }, [listings, selectedCategory]);

  // Get unique categories from listings
  const categories = useMemo(() => {
    const cats = new Set(listings.map((l) => l.category));
    return Array.from(cats);
  }, [listings]);

  // Handlers
  const handleFollow = useCallback(() => {
    setIsFollowing((prev) => !prev);
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

  const handleShare = useCallback(() => {
    // Copy profile URL to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/creators/${creator.username}`);
  }, [creator.username]);

  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format date
  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderListingCard = (listing: MarketplaceListing) => {
    const isLiked = likedListings.has(listing.id);

    return (
      <Card
        key={listing.id}
        onClick={() => onListingClick?.(listing)}
        sx={{
          background: studioColors.surface1,
          border: `1px solid ${studioColors.border}`,
          borderRadius: `${studioRadii.lg}px`,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
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
            sx={{ aspectRatio: '1/1', objectFit: 'cover' }}
          />

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
              '&:hover': { background: 'rgba(0,0,0,0.7)' },
            }}
            size="small"
          >
            {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
          </IconButton>

          {/* Price */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              background: listing.isFree ? '#4CAF50' : studioColors.surface1,
              borderRadius: `${studioRadii.sm}px`,
              px: 1.5,
              py: 0.5,
            }}
          >
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
        <CardContent sx={{ p: 2, pb: 1 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              fontWeight: studioTypography.fontWeight.medium,
              color: studioColors.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {listing.title}
          </Typography>
        </CardContent>

        {/* Stats */}
        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 14, color: studioColors.textMuted }} />
              <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                {formatNumber(listing.viewsCount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ShoppingCartIcon sx={{ fontSize: 14, color: studioColors.textMuted }} />
              <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                {listing.salesCount}
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
        </CardActions>
      </Card>
    );
  };

  const renderListingsTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Category filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <FilterListIcon sx={{ color: studioColors.textMuted, fontSize: 20 }} />
        <Chip
          label="All"
          size="small"
          onClick={() => setSelectedCategory('all')}
          sx={{
            background: selectedCategory === 'all' ? studioColors.accent : studioColors.surface2,
            color: selectedCategory === 'all' ? '#fff' : studioColors.textSecondary,
            '&:hover': { background: studioColors.surface3 },
          }}
        />
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat.charAt(0).toUpperCase() + cat.slice(1)}
            size="small"
            onClick={() => setSelectedCategory(cat)}
            sx={{
              background: selectedCategory === cat ? studioColors.accent : studioColors.surface2,
              color: selectedCategory === cat ? '#fff' : studioColors.textSecondary,
              '&:hover': { background: studioColors.surface3 },
            }}
          />
        ))}
      </Box>

      {/* Listings grid */}
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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: studioColors.textMuted }}>
            No listings found in this category
          </Typography>
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
    </Box>
  );

  const renderAboutTab = () => (
    <Box sx={{ maxWidth: 800 }}>
      {/* Bio */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.lg,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
            mb: 2,
          }}
        >
          About
        </Typography>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.md,
            color: studioColors.textSecondary,
            lineHeight: 1.7,
          }}
        >
          {creator.bio}
        </Typography>
      </Box>

      {/* Specialties */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.lg,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
            mb: 2,
          }}
        >
          Specialties
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {creator.specialties.map((specialty) => (
            <Chip
              key={specialty}
              label={specialty}
              sx={{
                background: studioColors.surface2,
                color: studioColors.textSecondary,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.lg,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
            mb: 2,
          }}
        >
          Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                background: studioColors.surface1,
                border: `1px solid ${studioColors.border}`,
                borderRadius: `${studioRadii.md}px`,
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: studioColors.textPrimary }}>
                {formatNumber(creator.totalListings)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Listings</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                background: studioColors.surface1,
                border: `1px solid ${studioColors.border}`,
                borderRadius: `${studioRadii.md}px`,
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: studioColors.textPrimary }}>
                {formatNumber(creator.totalSales)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Sales</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                background: studioColors.surface1,
                border: `1px solid ${studioColors.border}`,
                borderRadius: `${studioRadii.md}px`,
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: studioColors.accent }}>
                {creator.rating?.toFixed(1) || 'N/A'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Rating</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                background: studioColors.surface1,
                border: `1px solid ${studioColors.border}`,
                borderRadius: `${studioRadii.md}px`,
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: studioColors.textPrimary }}>
                {creator.reviewCount}
              </Typography>
              <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Reviews</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Member since */}
      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textMuted }}>
        Member since {formatJoinDate(creator.joinedAt)}
      </Typography>
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
      {/* Cover Image */}
      <Box
        sx={{
          position: 'relative',
          height: 200,
          background: creator.coverImageUrl
            ? `url(${creator.coverImageUrl}) center/cover`
            : `linear-gradient(135deg, ${studioColors.accent} 0%, ${studioColors.surface2} 100%)`,
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            background: `linear-gradient(transparent, ${studioColors.carbon})`,
          }}
        />
      </Box>

      {/* Profile Header */}
      <Box sx={{ px: 4, mt: -8, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 3,
            mb: 3,
          }}
        >
          {/* Avatar */}
          <Avatar
            src={creator.avatarUrl || undefined}
            sx={{
              width: 120,
              height: 120,
              border: `4px solid ${studioColors.carbon}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          />

          {/* Info */}
          <Box sx={{ flex: 1, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize['2xl'],
                  fontWeight: studioTypography.fontWeight.bold,
                  color: studioColors.textPrimary,
                }}
              >
                {creator.displayName}
              </Typography>
              {creator.isVerified && (
                <VerifiedIcon sx={{ fontSize: 24, color: studioColors.accent }} />
              )}
              {creator.isPro && (
                <Chip
                  label="PRO"
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#000',
                    fontWeight: 600,
                    fontSize: 10,
                    height: 20,
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textMuted }}>
              @{creator.username}
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Share profile">
              <IconButton
                onClick={handleShare}
                sx={{
                  border: `1px solid ${studioColors.border}`,
                  color: studioColors.textSecondary,
                  '&:hover': { borderColor: studioColors.accent, color: studioColors.accent },
                }}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              onClick={handleFollow}
              startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
              sx={
                isFollowing
                  ? {
                      borderColor: studioColors.border,
                      color: studioColors.textSecondary,
                      '&:hover': { borderColor: studioColors.error, color: studioColors.error },
                    }
                  : {
                      background: studioColors.accent,
                      '&:hover': { background: studioColors.accentMuted },
                    }
              }
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          </Box>
        </Box>

        {/* Stats & Links Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3,
          }}
        >
          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: studioColors.textPrimary }}>
                {formatNumber(creator.followersCount)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Followers</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: studioColors.textPrimary }}>
                {formatNumber(creator.followingCount)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Following</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: studioColors.textPrimary }}>
                {formatNumber(creator.totalSales)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>Sales</Typography>
            </Box>
            {creator.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StarIcon sx={{ fontSize: 20, color: '#FFB300' }} />
                <Typography sx={{ fontSize: 18, fontWeight: 600, color: studioColors.textPrimary }}>
                  {creator.rating.toFixed(1)}
                </Typography>
                <Typography sx={{ fontSize: 12, color: studioColors.textMuted }}>
                  ({creator.reviewCount})
                </Typography>
              </Box>
            )}
          </Box>

          {/* Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {creator.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
                <Typography sx={{ fontSize: 13, color: studioColors.textSecondary }}>
                  {creator.location}
                </Typography>
              </Box>
            )}
            {creator.website && (
              <Link
                href={creator.website}
                target="_blank"
                rel="noopener"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: studioColors.accent,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <LanguageIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: 13 }}>Website</Typography>
              </Link>
            )}
            {creator.socialLinks.instagram && (
              <Tooltip title={creator.socialLinks.instagram}>
                <IconButton size="small" sx={{ color: studioColors.textSecondary }}>
                  <InstagramIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            {creator.socialLinks.twitter && (
              <Tooltip title={creator.socialLinks.twitter}>
                <IconButton size="small" sx={{ color: studioColors.textSecondary }}>
                  <TwitterIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{
            borderBottom: `1px solid ${studioColors.border}`,
            '& .MuiTab-root': {
              color: studioColors.textSecondary,
              textTransform: 'none',
              fontSize: studioTypography.fontSize.md,
              '&.Mui-selected': { color: studioColors.textPrimary },
            },
            '& .MuiTabs-indicator': { background: studioColors.accent },
          }}
        >
          <Tab value="listings" label={`Listings (${creator.totalListings})`} />
          <Tab value="collections" label="Collections" />
          <Tab value="about" label="About" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, px: 4, py: 4 }}>
        {activeTab === 'listings' && renderListingsTab()}
        {activeTab === 'collections' && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: studioColors.textMuted }}>
              Collections coming soon
            </Typography>
          </Box>
        )}
        {activeTab === 'about' && renderAboutTab()}
      </Box>
    </Box>
  );
};

export default CreatorStorefront;
