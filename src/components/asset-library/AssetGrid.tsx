/**
 * AssetGrid - Responsive grid display for assets
 * Supports infinite scroll, filters, and masonry layout
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress, Skeleton, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AssetCard } from './AssetCard';
import { studioColors, studioTypography } from '../studios/shared/studioTokens';
import type { Asset } from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

export interface AssetGridProps {
  assets: Asset[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAssetClick?: (asset: Asset) => void;
  onLike?: (assetId: string) => void;
  onUnlike?: (assetId: string) => void;
  onAddToCollection?: (assetId: string) => void;
  onDownload?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onShare?: (asset: Asset) => void;
  selectedAssetIds?: string[];
  selectable?: boolean;
  onSelect?: (assetId: string, selected: boolean) => void;
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: number;
  cardSize?: 'small' | 'medium' | 'large';
  showMetadata?: boolean;
  infiniteScroll?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  loading = false,
  hasMore = false,
  onLoadMore,
  onAssetClick,
  onLike,
  onUnlike,
  onAddToCollection,
  onDownload,
  onDelete,
  onShare,
  selectedAssetIds = [],
  selectable = false,
  onSelect,
  emptyMessage = 'No assets found',
  emptyAction,
  columns = 4,
  gap = 16,
  cardSize = 'medium',
  showMetadata = true,
  infiniteScroll = true,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    if (!infiniteScroll || !onLoadMore) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, infiniteScroll, onLoadMore]);

  // Loading skeleton
  if (loading && assets.length === 0) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            sx={{
              aspectRatio: '1/1',
              borderRadius: 2,
              background: studioColors.surface2,
            }}
          />
        ))}
      </Box>
    );
  }

  // Empty state
  if (!loading && assets.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.lg,
            color: studioColors.textMuted,
          }}
        >
          {emptyMessage}
        </Typography>
        {emptyAction && (
          <Button
            variant="outlined"
            onClick={emptyAction.onClick}
            sx={{
              color: studioColors.textSecondary,
              borderColor: studioColors.border,
              '&:hover': {
                borderColor: studioColors.accent,
                color: studioColors.textPrimary,
              },
            }}
          >
            {emptyAction.label}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Asset Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: `repeat(${Math.min(columns, 3)}, 1fr)`,
            md: `repeat(${Math.min(columns, 4)}, 1fr)`,
            lg: `repeat(${columns}, 1fr)`,
          },
          gap: `${gap}px`,
        }}
      >
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            selected={selectedAssetIds.includes(asset.id)}
            selectable={selectable}
            onSelect={onSelect}
            onClick={onAssetClick}
            onLike={onLike}
            onUnlike={onUnlike}
            onAddToCollection={onAddToCollection}
            onDownload={onDownload}
            onDelete={onDelete}
            onShare={onShare}
            showMetadata={showMetadata}
            size={cardSize}
          />
        ))}
      </Box>

      {/* Load More / Infinite Scroll Trigger */}
      {hasMore && (
        <Box
          ref={loadMoreRef}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 4,
          }}
        >
          {loading ? (
            <CircularProgress size={32} sx={{ color: studioColors.accent }} />
          ) : !infiniteScroll && onLoadMore ? (
            <Button
              onClick={onLoadMore}
              startIcon={<RefreshIcon />}
              sx={{
                color: studioColors.textSecondary,
                '&:hover': { color: studioColors.textPrimary },
              }}
            >
              Load More
            </Button>
          ) : null}
        </Box>
      )}

      {/* Loading indicator for append */}
      {loading && assets.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} sx={{ color: studioColors.accent }} />
        </Box>
      )}
    </Box>
  );
};

export default AssetGrid;
