/**
 * CollectionCard - Display a collection with preview thumbnails
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import {
  studioColors,
  studioRadii,
  studioMotion,
  studioTypography,
} from '../studios/shared/studioTokens';
import type { Collection } from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

export interface CollectionCardProps {
  collection: Collection;
  onClick?: (collection: Collection) => void;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collectionId: string) => void;
  showPreview?: boolean;
  previewCount?: number;
  compact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onClick,
  onEdit,
  onDelete,
  showPreview = true,
  previewCount = 4,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const isFavorites = collection.collectionType === 'favorites';
  const previewAssets = collection.previewAssets?.slice(0, previewCount) || [];
  const hasPreview = previewAssets.length > 0;

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const getCollectionIcon = () => {
    switch (collection.collectionType) {
      case 'favorites':
        return <StarIcon sx={{ color: studioColors.warning }} />;
      case 'moodboard':
        return <FolderIcon sx={{ color: studioColors.accent }} />;
      case 'project':
        return <FolderIcon sx={{ color: studioColors.blue }} />;
      default:
        return <FolderIcon sx={{ color: studioColors.textSecondary }} />;
    }
  };

  if (compact) {
    return (
      <Box
        onClick={() => onClick?.(collection)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1.5,
          borderRadius: `${studioRadii.md}px`,
          background: studioColors.surface1,
          border: `1px solid ${studioColors.border}`,
          cursor: onClick ? 'pointer' : 'default',
          transition: `all ${studioMotion.fast}`,
          '&:hover': {
            background: studioColors.surface2,
            borderColor: studioColors.borderHover,
          },
        }}
      >
        {getCollectionIcon()}
        <Box sx={{ flex: 1, minWidth: 0 }}>
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
            {collection.name}
          </Typography>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.xs,
              color: studioColors.textMuted,
            }}
          >
            {collection.assetCount} {collection.assetCount === 1 ? 'item' : 'items'}
          </Typography>
        </Box>
        {collection.visibility === 'private' ? (
          <LockIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
        ) : (
          <PublicIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
        )}
      </Box>
    );
  }

  return (
    <Box
      onClick={() => onClick?.(collection)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: `${studioRadii.md}px`,
        overflow: 'hidden',
        background: studioColors.surface1,
        border: `1px solid ${studioColors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${studioMotion.fast}`,
        '&:hover': {
          borderColor: studioColors.borderHover,
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
      }}
    >
      {/* Preview Grid */}
      {showPreview && (
        <Box
          sx={{
            aspectRatio: '16/9',
            background: studioColors.surface2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {hasPreview ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: '2px',
                height: '100%',
              }}
            >
              {previewAssets.map((asset, i) => (
                <Box
                  key={asset.id}
                  sx={{
                    backgroundImage: `url(${asset.thumbnailUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    gridColumn: i === 0 && previewAssets.length === 1 ? 'span 2' : undefined,
                    gridRow: i === 0 && previewAssets.length === 1 ? 'span 2' : undefined,
                  }}
                />
              ))}
              {/* Fill empty slots */}
              {previewAssets.length < 4 &&
                Array.from({ length: 4 - previewAssets.length }).map((_, i) => (
                  <Box
                    key={`empty-${i}`}
                    sx={{ background: studioColors.surface3 }}
                  />
                ))}
            </Box>
          ) : collection.coverImageUrl ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${collection.coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getCollectionIcon()}
            </Box>
          )}

          {/* Hover Actions */}
          {(onEdit || onDelete) && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                opacity: isHovered ? 1 : 0,
                transition: `opacity ${studioMotion.fast}`,
              }}
            >
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  background: 'rgba(0,0,0,0.5)',
                  color: studioColors.textPrimary,
                  '&:hover': { background: 'rgba(0,0,0,0.7)' },
                }}
              >
                <MoreVertIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )}

          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5 }}>
            {isFavorites && (
              <Chip
                icon={<StarIcon sx={{ fontSize: 14 }} />}
                label="Favorites"
                size="small"
                sx={{
                  background: studioColors.warning,
                  color: studioColors.ink,
                  fontSize: 10,
                  height: 22,
                  '& .MuiChip-icon': { color: studioColors.ink },
                }}
              />
            )}
            {collection.isFeatured && (
              <Chip
                label="Featured"
                size="small"
                sx={{
                  background: studioColors.accent,
                  color: studioColors.textPrimary,
                  fontSize: 10,
                  height: 22,
                }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Metadata */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mb: 0.25,
              }}
            >
              {collection.name}
            </Typography>
            {collection.description && (
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.xs,
                  color: studioColors.textMuted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {collection.description}
              </Typography>
            )}
          </Box>
          {collection.visibility === 'private' ? (
            <Tooltip title="Private">
              <LockIcon sx={{ fontSize: 16, color: studioColors.textMuted, ml: 1 }} />
            </Tooltip>
          ) : (
            <Tooltip title="Public">
              <PublicIcon sx={{ fontSize: 16, color: studioColors.textMuted, ml: 1 }} />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.xs,
              color: studioColors.textSecondary,
            }}
          >
            {collection.assetCount} {collection.assetCount === 1 ? 'item' : 'items'}
          </Typography>
          {collection.viewsCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon sx={{ fontSize: 12, color: studioColors.textMuted }} />
              <Typography sx={{ fontSize: 10, color: studioColors.textMuted }}>
                {collection.viewsCount}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

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
            minWidth: 140,
          },
        }}
      >
        {onEdit && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onEdit(collection);
            }}
          >
            <ListItemIcon>
              <EditIcon sx={{ fontSize: 18, color: studioColors.textSecondary }} />
            </ListItemIcon>
            <ListItemText
              primary="Edit"
              primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
            />
          </MenuItem>
        )}
        {onDelete && !isFavorites && (
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDelete(collection.id);
            }}
          >
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

export default CollectionCard;
