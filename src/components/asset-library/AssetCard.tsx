/**
 * AssetCard - Display a single asset with actions
 * Supports image, video, and audio assets with like, favorite, and collection features
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  studioColors,
  studioRadii,
  studioMotion,
  studioTypography,
} from '../studios/shared/studioTokens';
import type { Asset } from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

export interface AssetCardProps {
  asset: Asset;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: (assetId: string, selected: boolean) => void;
  onClick?: (asset: Asset) => void;
  onLike?: (assetId: string) => void;
  onUnlike?: (assetId: string) => void;
  onAddToCollection?: (assetId: string) => void;
  onDownload?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onShare?: (asset: Asset) => void;
  showActions?: boolean;
  showMetadata?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// ============================================================================
// Size Configuration
// ============================================================================

const sizeConfig = {
  small: { minHeight: 120, fontSize: 10, iconSize: 16 },
  medium: { minHeight: 180, fontSize: 11, iconSize: 18 },
  large: { minHeight: 240, fontSize: 12, iconSize: 20 },
};

// ============================================================================
// Component
// ============================================================================

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  selected = false,
  selectable = false,
  onSelect,
  onClick,
  onLike,
  onUnlike,
  onAddToCollection,
  onDownload,
  onDelete,
  onShare,
  showActions = true,
  showMetadata = true,
  size = 'medium',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const config = sizeConfig[size];

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (asset.isLikedByUser) {
      onUnlike?.(asset.id);
    } else {
      onLike?.(asset.id);
    }
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action: () => void) => {
    handleMenuClose();
    action();
  };

  const renderThumbnail = () => {
    switch (asset.assetType) {
      case 'video':
        return (
          <>
            <Box
              component="img"
              src={asset.thumbnailUrl || asset.publicUrl}
              alt={asset.title || 'Video asset'}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                background: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayArrowIcon sx={{ color: studioColors.textPrimary, fontSize: 20 }} />
            </Box>
            {asset.durationSeconds && (
              <Chip
                label={formatDuration(asset.durationSeconds)}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  background: 'rgba(0,0,0,0.7)',
                  color: studioColors.textPrimary,
                  fontSize: 10,
                  height: 20,
                }}
              />
            )}
          </>
        );

      case 'audio':
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${studioColors.surface2} 0%, ${studioColors.surface3} 100%)`,
            }}
          >
            <AudiotrackIcon sx={{ fontSize: 48, color: studioColors.accent, mb: 1 }} />
            {asset.durationSeconds && (
              <Typography sx={{ fontSize: 11, color: studioColors.textSecondary }}>
                {formatDuration(asset.durationSeconds)}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box
            component="img"
            src={asset.thumbnailUrl || asset.publicUrl}
            alt={asset.title || 'Image asset'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        );
    }
  };

  return (
    <Box
      onClick={() => onClick?.(asset)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        borderRadius: `${studioRadii.md}px`,
        overflow: 'hidden',
        background: studioColors.surface1,
        border: `1px solid ${selected ? studioColors.accent : studioColors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${studioMotion.fast}`,
        '&:hover': {
          borderColor: studioColors.borderHover,
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: asset.aspectRatio || '1/1',
          minHeight: config.minHeight,
          background: studioColors.surface2,
        }}
      >
        {renderThumbnail()}

        {/* Hover Overlay */}
        {showActions && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${studioMotion.fast}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Tooltip title={asset.isLikedByUser ? 'Unlike' : 'Like'}>
              <IconButton
                onClick={handleLikeClick}
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  color: asset.isLikedByUser ? studioColors.error : studioColors.textPrimary,
                  '&:hover': { background: 'rgba(255,255,255,0.2)' },
                }}
              >
                {asset.isLikedByUser ? (
                  <FavoriteIcon sx={{ fontSize: config.iconSize }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: config.iconSize }} />
                )}
              </IconButton>
            </Tooltip>

            {onAddToCollection && (
              <Tooltip title="Add to collection">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCollection(asset.id);
                  }}
                  size="small"
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    color: studioColors.textPrimary,
                    '&:hover': { background: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  <CreateNewFolderIcon sx={{ fontSize: config.iconSize }} />
                </IconButton>
              </Tooltip>
            )}

            {onDownload && (
              <Tooltip title="Download">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(asset);
                  }}
                  size="small"
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    color: studioColors.textPrimary,
                    '&:hover': { background: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  <DownloadIcon sx={{ fontSize: config.iconSize }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="More options">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  color: studioColors.textPrimary,
                  '&:hover': { background: 'rgba(255,255,255,0.2)' },
                }}
              >
                <MoreVertIcon sx={{ fontSize: config.iconSize }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Selection Checkbox */}
        {selectable && (
          <Checkbox
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.(asset.id, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              opacity: isHovered || selected ? 1 : 0,
              transition: `opacity ${studioMotion.fast}`,
              color: studioColors.textPrimary,
              '&.Mui-checked': { color: studioColors.accent },
            }}
          />
        )}

        {/* AI Generated Badge */}
        {asset.isGenerated && (
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 12 }} />}
            label="AI"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(59, 155, 148, 0.9)',
              color: studioColors.textPrimary,
              fontSize: 10,
              height: 20,
              '& .MuiChip-icon': { color: studioColors.textPrimary },
            }}
          />
        )}

        {/* Featured Badge */}
        {asset.isFeatured && (
          <Chip
            label="Featured"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: selectable ? 36 : 8,
              background: studioColors.warning,
              color: studioColors.ink,
              fontSize: 10,
              height: 20,
            }}
          />
        )}
      </Box>

      {/* Metadata */}
      {showMetadata && (
        <Box sx={{ p: 1.5 }}>
          {asset.title && (
            <Typography
              sx={{
                fontSize: config.fontSize,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.5,
              }}
            >
              {asset.title}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon sx={{ fontSize: 12, color: studioColors.textMuted }} />
              <Typography sx={{ fontSize: 10, color: studioColors.textMuted }}>
                {formatCount(asset.likesCount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 12, color: studioColors.textMuted }} />
              <Typography sx={{ fontSize: 10, color: studioColors.textMuted }}>
                {formatCount(asset.viewsCount)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            background: studioColors.surface2,
            border: `1px solid ${studioColors.border}`,
            minWidth: 160,
          },
        }}
      >
        {onAddToCollection && (
          <MenuItem onClick={() => handleAction(() => onAddToCollection(asset.id))}>
            <ListItemIcon>
              <CreateNewFolderIcon sx={{ fontSize: 18, color: studioColors.textSecondary }} />
            </ListItemIcon>
            <ListItemText
              primary="Add to Collection"
              primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
            />
          </MenuItem>
        )}
        {onDownload && (
          <MenuItem onClick={() => handleAction(() => onDownload(asset))}>
            <ListItemIcon>
              <DownloadIcon sx={{ fontSize: 18, color: studioColors.textSecondary }} />
            </ListItemIcon>
            <ListItemText
              primary="Download"
              primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
            />
          </MenuItem>
        )}
        {onShare && (
          <MenuItem onClick={() => handleAction(() => onShare(asset))}>
            <ListItemIcon>
              <ShareIcon sx={{ fontSize: 18, color: studioColors.textSecondary }} />
            </ListItemIcon>
            <ListItemText
              primary="Share"
              primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
            />
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => handleAction(() => onDelete(asset.id))}>
            <ListItemIcon>
              <DeleteIcon sx={{ fontSize: 18, color: studioColors.error }} />
            </ListItemIcon>
            <ListItemText
              primary="Delete"
              primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.error } }}
            />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatCount(count: number | undefined | null): string {
  if (count == null) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export default AssetCard;
