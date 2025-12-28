/**
 * SellerDashboard - Analytics and management dashboard for marketplace sellers
 * Shows sales stats, listings performance, and revenue tracking
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tooltip,
  Select,
  FormControl,
  Tab,
  Tabs,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import {
  studioColors,
  studioRadii,
  studioTypography,
} from '../studios/shared/studioTokens';
import type {
  SellerStats,
  MarketplaceListing,
  SalesData,
} from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

interface SellerDashboardProps {
  onCreateListing?: () => void;
  onEditListing?: (listingId: string) => void;
  onViewStorefront?: () => void;
}

type TabValue = 'overview' | 'listings' | 'sales' | 'analytics';
type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_STATS: SellerStats = {
  totalSales: 1247,
  totalRevenue: 24589.5,
  totalViews: 156789,
  totalDownloads: 3421,
  conversionRate: 2.18,
  averageRating: 4.8,
  listingsCount: 89,
  activeListingsCount: 76,
};

const MOCK_SALES_DATA: SalesData[] = [
  { date: '2024-01-01', sales: 12, revenue: 234.5 },
  { date: '2024-01-02', sales: 8, revenue: 156.0 },
  { date: '2024-01-03', sales: 15, revenue: 312.0 },
  { date: '2024-01-04', sales: 10, revenue: 189.5 },
  { date: '2024-01-05', sales: 18, revenue: 423.0 },
  { date: '2024-01-06', sales: 22, revenue: 489.5 },
  { date: '2024-01-07', sales: 14, revenue: 267.0 },
];

const MOCK_LISTINGS: (MarketplaceListing & { performanceScore: number })[] = Array.from({ length: 10 }, (_, i) => ({
  id: `listing-${i + 1}`,
  assetId: `asset-${i + 1}`,
  asset: {
    id: `asset-${i + 1}`,
    assetType: 'image',
    title: `Creative Asset ${i + 1}`,
    description: 'A beautiful AI-generated creative asset',
    publicUrl: `https://picsum.photos/seed/${i + 400}/100/100`,
    thumbnailUrl: `https://picsum.photos/seed/${i + 400}/100/100`,
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
    tags: [],
    autoTags: [],
    likesCount: 0,
    viewsCount: 0,
    downloadsCount: 0,
    isFeatured: false,
    isLikedByUser: false,
    userId: 'user-1',
    generationId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  creatorId: 'creator-1',
  creator: {} as never, // Simplified for dashboard
  title: `Premium Asset ${i + 1}`,
  description: 'A beautifully crafted AI-generated creative asset',
  category: ['fashion', 'interior', 'art', 'photography'][i % 4] as 'fashion' | 'interior' | 'art' | 'photography',
  subcategory: null,
  tags: [],
  priceUsd: Math.floor(Math.random() * 50) + 10,
  originalPriceUsd: null,
  licenseType: 'commercial',
  licenseDetails: null,
  isFree: i === 0,
  isExclusive: false,
  downloadCount: Math.floor(Math.random() * 500),
  salesCount: Math.floor(Math.random() * 100),
  viewsCount: Math.floor(Math.random() * 5000),
  likesCount: Math.floor(Math.random() * 300),
  rating: 3.5 + Math.random() * 1.5,
  reviewCount: Math.floor(Math.random() * 50),
  status: i === 9 ? 'paused' : 'active',
  isFeatured: i < 2,
  isTrending: i >= 2 && i < 4,
  isNewArrival: i >= 4 && i < 6,
  previewImages: [],
  watermarkedPreviewUrl: null,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  performanceScore: Math.floor(Math.random() * 100),
}));

const MOCK_RECENT_SALES = [
  { id: 's1', listing: MOCK_LISTINGS[0], buyer: 'john_doe', amount: 29.0, date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 's2', listing: MOCK_LISTINGS[1], buyer: 'jane_smith', amount: 19.0, date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 's3', listing: MOCK_LISTINGS[2], buyer: 'design_pro', amount: 49.0, date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { id: 's4', listing: MOCK_LISTINGS[3], buyer: 'creative_co', amount: 35.0, date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 's5', listing: MOCK_LISTINGS[4], buyer: 'art_lover', amount: 25.0, date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

// ============================================================================
// Component
// ============================================================================

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  onCreateListing,
  onEditListing,
  onViewStorefront,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [listingMenuAnchor, setListingMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // Mock data
  const stats = MOCK_STATS;
  const listings = MOCK_LISTINGS;
  const recentSales = MOCK_RECENT_SALES;
  const salesData = MOCK_SALES_DATA;

  // Calculate trends (mock - would be calculated from actual data)
  const trends = useMemo(() => ({
    revenue: 12.5,
    sales: 8.3,
    views: -2.1,
    downloads: 15.7,
  }), []);

  // Format helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  // Handlers
  const handleListingMenuOpen = (event: React.MouseEvent<HTMLElement>, listingId: string) => {
    setListingMenuAnchor(event.currentTarget);
    setSelectedListingId(listingId);
  };

  const handleListingMenuClose = () => {
    setListingMenuAnchor(null);
    setSelectedListingId(null);
  };

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    trend?: number,
    subtitle?: string
  ) => (
    <Card
      sx={{
        background: studioColors.surface1,
        border: `1px solid ${studioColors.border}`,
        borderRadius: `${studioRadii.lg}px`,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: `${studioRadii.md}px`,
              background: studioColors.surface2,
              '& svg': { fontSize: 24, color: studioColors.accent },
            }}
          >
            {icon}
          </Box>
          {trend !== undefined && (
            <Chip
              icon={trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
              label={`${trend >= 0 ? '+' : ''}${trend}%`}
              size="small"
              sx={{
                background: trend >= 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                color: trend >= 0 ? '#4CAF50' : '#F44336',
                fontWeight: 500,
              }}
            />
          )}
        </Box>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize['2xl'],
            fontWeight: studioTypography.fontWeight.bold,
            color: studioColors.textPrimary,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textMuted }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderOverviewTab = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderStatCard(
            'Total Revenue',
            formatCurrency(stats.totalRevenue),
            <AttachMoneyIcon />,
            trends.revenue,
            `${stats.totalSales} total sales`
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderStatCard(
            'Sales This Period',
            formatNumber(stats.totalSales),
            <ShoppingCartIcon />,
            trends.sales
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderStatCard(
            'Total Views',
            formatNumber(stats.totalViews),
            <VisibilityIcon />,
            trends.views
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {renderStatCard(
            'Downloads',
            formatNumber(stats.totalDownloads),
            <DownloadIcon />,
            trends.downloads
          )}
        </Grid>
      </Grid>

      {/* Revenue Chart Placeholder */}
      <Card
        sx={{
          background: studioColors.surface1,
          border: `1px solid ${studioColors.border}`,
          borderRadius: `${studioRadii.lg}px`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChartIcon sx={{ color: studioColors.accent }} />
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.lg,
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textPrimary,
                }}
              >
                Revenue Overview
              </Typography>
            </Box>
            <FormControl size="small">
              <Select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                sx={{
                  background: studioColors.surface2,
                  color: studioColors.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: studioColors.border },
                }}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
                <MenuItem value="all">All time</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Simple bar chart visualization */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 200 }}>
            {salesData.map((day, index) => {
              const maxRevenue = Math.max(...salesData.map((d) => d.revenue));
              const height = (day.revenue / maxRevenue) * 100;

              return (
                <Tooltip key={index} title={`${day.date}: ${formatCurrency(day.revenue)} (${day.sales} sales)`}>
                  <Box
                    sx={{
                      flex: 1,
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${studioColors.accent} 0%, ${studioColors.accentMuted} 100%)`,
                      borderRadius: `${studioRadii.sm}px ${studioRadii.sm}px 0 0`,
                      transition: 'height 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            {salesData.map((day, index) => (
              <Typography key={index} sx={{ fontSize: 10, color: studioColors.textMuted }}>
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Recent Sales & Top Performers */}
      <Grid container spacing={3}>
        {/* Recent Sales */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: studioColors.surface1,
              border: `1px solid ${studioColors.border}`,
              borderRadius: `${studioRadii.lg}px`,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.lg,
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textPrimary,
                  mb: 2,
                }}
              >
                Recent Sales
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentSales.map((sale) => (
                  <Box
                    key={sale.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      background: studioColors.surface2,
                      borderRadius: `${studioRadii.md}px`,
                    }}
                  >
                    <Avatar
                      src={sale.listing.asset.thumbnailUrl || undefined}
                      variant="rounded"
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          color: studioColors.textPrimary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sale.listing.title}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                        by @{sale.buyer} - {formatTimeAgo(sale.date)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: '#4CAF50',
                      }}
                    >
                      +{formatCurrency(sale.amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              background: studioColors.surface1,
              border: `1px solid ${studioColors.border}`,
              borderRadius: `${studioRadii.lg}px`,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.lg,
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textPrimary,
                  mb: 2,
                }}
              >
                Top Performers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {listings
                  .sort((a, b) => b.salesCount - a.salesCount)
                  .slice(0, 5)
                  .map((listing, index) => (
                    <Box
                      key={listing.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          width: 20,
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: 600,
                          color: index < 3 ? studioColors.accent : studioColors.textMuted,
                        }}
                      >
                        #{index + 1}
                      </Typography>
                      <Avatar
                        src={listing.asset.thumbnailUrl || undefined}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            color: studioColors.textPrimary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {listing.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                            {listing.salesCount} sales
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                            {formatNumber(listing.viewsCount)} views
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: 500,
                          color: studioColors.textPrimary,
                        }}
                      >
                        {formatCurrency(listing.salesCount * listing.priceUsd)}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderListingsTab = () => (
    <Card
      sx={{
        background: studioColors.surface1,
        border: `1px solid ${studioColors.border}`,
        borderRadius: `${studioRadii.lg}px`,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }}>
                  Asset
                </TableCell>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }}>
                  Price
                </TableCell>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }}>
                  Sales
                </TableCell>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }}>
                  Views
                </TableCell>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }}>
                  Rating
                </TableCell>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }}>
                  Performance
                </TableCell>
                <TableCell sx={{ color: studioColors.textSecondary, borderColor: studioColors.border }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((listing) => (
                <TableRow
                  key={listing.id}
                  sx={{
                    '&:hover': { background: studioColors.surface2 },
                    '& td': { borderColor: studioColors.border },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={listing.asset.thumbnailUrl || undefined}
                        variant="rounded"
                        sx={{ width: 48, height: 48 }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            color: studioColors.textPrimary,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {listing.title}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>
                          {listing.category}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={listing.status}
                      size="small"
                      sx={{
                        background:
                          listing.status === 'active'
                            ? 'rgba(76, 175, 80, 0.2)'
                            : listing.status === 'paused'
                            ? 'rgba(255, 152, 0, 0.2)'
                            : 'rgba(158, 158, 158, 0.2)',
                        color:
                          listing.status === 'active'
                            ? '#4CAF50'
                            : listing.status === 'paused'
                            ? '#FF9800'
                            : '#9E9E9E',
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: studioColors.textPrimary }}>
                      {listing.isFree ? 'Free' : formatCurrency(listing.priceUsd)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: studioColors.textPrimary }}>{listing.salesCount}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: studioColors.textPrimary }}>
                      {formatNumber(listing.viewsCount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: '#FFB300' }} />
                      <Typography sx={{ color: studioColors.textPrimary }}>
                        {listing.rating?.toFixed(1) || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={listing.performanceScore}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          background: studioColors.surface3,
                          '& .MuiLinearProgress-bar': {
                            background:
                              listing.performanceScore >= 70
                                ? '#4CAF50'
                                : listing.performanceScore >= 40
                                ? '#FF9800'
                                : '#F44336',
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: 11, color: studioColors.textMuted, minWidth: 28 }}>
                        {listing.performanceScore}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleListingMenuOpen(e, listing.id)}
                      sx={{ color: studioColors.textSecondary }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
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
            Seller Dashboard
          </Typography>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              color: studioColors.textMuted,
            }}
          >
            Track your sales, manage listings, and grow your audience
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<StorefrontIcon />}
            onClick={onViewStorefront}
            sx={{
              borderColor: studioColors.border,
              color: studioColors.textSecondary,
              '&:hover': { borderColor: studioColors.accent, color: studioColors.accent },
            }}
          >
            View Storefront
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateListing}
            sx={{
              background: studioColors.accent,
              '&:hover': { background: studioColors.accentMuted },
            }}
          >
            Create Listing
          </Button>
        </Box>
      </Box>

      {/* Quick Stats Bar */}
      <Box
        sx={{
          px: 4,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          borderBottom: `1px solid ${studioColors.border}`,
          background: studioColors.surface1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon sx={{ fontSize: 20, color: studioColors.textMuted }} />
          <Typography sx={{ fontSize: 13, color: studioColors.textMuted }}>
            Active Listings: <strong style={{ color: studioColors.textPrimary }}>{stats.activeListingsCount}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon sx={{ fontSize: 20, color: '#FFB300' }} />
          <Typography sx={{ fontSize: 13, color: studioColors.textMuted }}>
            Avg Rating: <strong style={{ color: studioColors.textPrimary }}>{stats.averageRating.toFixed(1)}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ fontSize: 20, color: '#4CAF50' }} />
          <Typography sx={{ fontSize: 13, color: studioColors.textMuted }}>
            Conversion Rate: <strong style={{ color: studioColors.textPrimary }}>{stats.conversionRate}%</strong>
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 4, borderBottom: `1px solid ${studioColors.border}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{
            '& .MuiTab-root': {
              color: studioColors.textSecondary,
              textTransform: 'none',
              fontSize: studioTypography.fontSize.md,
              '&.Mui-selected': { color: studioColors.textPrimary },
            },
            '& .MuiTabs-indicator': { background: studioColors.accent },
          }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="listings" label="Listings" />
          <Tab value="sales" label="Sales History" />
          <Tab value="analytics" label="Analytics" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: 4, py: 4, overflow: 'auto' }}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'listings' && renderListingsTab()}
        {activeTab === 'sales' && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: studioColors.textMuted }}>
              Sales history coming soon
            </Typography>
          </Box>
        )}
        {activeTab === 'analytics' && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: studioColors.textMuted }}>
              Advanced analytics coming soon
            </Typography>
          </Box>
        )}
      </Box>

      {/* Listing Menu */}
      <Menu
        anchorEl={listingMenuAnchor}
        open={Boolean(listingMenuAnchor)}
        onClose={handleListingMenuClose}
        PaperProps={{
          sx: {
            background: studioColors.surface2,
            border: `1px solid ${studioColors.border}`,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onEditListing?.(selectedListingId || '');
            handleListingMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon sx={{ fontSize: 18, color: studioColors.textSecondary }} />
          </ListItemIcon>
          <ListItemText
            primary="Edit Listing"
            primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
          />
        </MenuItem>
        <MenuItem onClick={handleListingMenuClose}>
          <ListItemIcon>
            <PauseIcon sx={{ fontSize: 18, color: studioColors.textSecondary }} />
          </ListItemIcon>
          <ListItemText
            primary="Pause Listing"
            primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
          />
        </MenuItem>
        <MenuItem onClick={handleListingMenuClose}>
          <ListItemIcon>
            <VisibilityIcon sx={{ fontSize: 18, color: studioColors.textSecondary }} />
          </ListItemIcon>
          <ListItemText
            primary="View in Marketplace"
            primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
          />
        </MenuItem>
        <MenuItem onClick={handleListingMenuClose} sx={{ color: studioColors.error }}>
          <ListItemIcon>
            <DeleteIcon sx={{ fontSize: 18, color: studioColors.error }} />
          </ListItemIcon>
          <ListItemText
            primary="Delete Listing"
            primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.error } }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SellerDashboard;
