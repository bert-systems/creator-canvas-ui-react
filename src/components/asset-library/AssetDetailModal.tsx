/**
 * AssetDetailModal - Full-screen modal for viewing and editing asset details
 * Shows preview, metadata, generation info, and actions
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  Slide,
  CircularProgress,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import InfoIcon from '@mui/icons-material/Info';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import {
  studioColors,
  studioRadii,
  studioMotion,
  studioTypography,
} from '../studios/shared/studioTokens';
import type { Asset, Collection } from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

export interface AssetDetailModalProps {
  open: boolean;
  asset: Asset | null;
  onClose: () => void;
  onLike?: (assetId: string) => Promise<void>;
  onUnlike?: (assetId: string) => Promise<void>;
  onDownload?: (asset: Asset) => void;
  onShare?: (asset: Asset) => void;
  onDelete?: (assetId: string) => Promise<void>;
  onUpdate?: (assetId: string, updates: AssetUpdates) => Promise<void>;
  onAddToCollection?: (assetId: string, collectionId: string) => Promise<void>;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  collections?: Collection[];
}

interface AssetUpdates {
  title?: string;
  description?: string;
  tags?: string[];
}

// ============================================================================
// Transition
// ============================================================================

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// ============================================================================
// Component
// ============================================================================

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  open,
  asset,
  onClose,
  onLike,
  onUnlike,
  onDownload,
  onShare,
  onDelete,
  onUpdate,
  onAddToCollection,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
  collections = [],
}) => {
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // UI state
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [collectionMenuAnchor, setCollectionMenuAnchor] = useState<null | HTMLElement>(null);
  const [showInfo, setShowInfo] = useState(true);

  // Media state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize edit state when asset changes
  React.useEffect(() => {
    if (asset) {
      setEditTitle(asset.title || '');
      setEditDescription(asset.description || '');
      setEditTags(asset.tags?.join(', ') || '');
    }
    setIsEditing(false);
  }, [asset]);

  // Handlers
  const handleLikeClick = useCallback(async () => {
    if (!asset) return;
    if (asset.isLikedByUser) {
      await onUnlike?.(asset.id);
    } else {
      await onLike?.(asset.id);
    }
  }, [asset, onLike, onUnlike]);

  const handleDownload = useCallback(() => {
    if (!asset) return;
    if (onDownload) {
      onDownload(asset);
    } else {
      window.open(asset.publicUrl, '_blank');
    }
  }, [asset, onDownload]);

  const handleShare = useCallback(() => {
    if (!asset) return;
    if (onShare) {
      onShare(asset);
    } else {
      navigator.clipboard.writeText(asset.publicUrl);
    }
  }, [asset, onShare]);

  const handleCopyPrompt = useCallback(() => {
    if (!asset?.prompt) return;
    navigator.clipboard.writeText(asset.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }, [asset]);

  const handleStartEdit = useCallback(() => {
    if (!asset) return;
    setEditTitle(asset.title || '');
    setEditDescription(asset.description || '');
    setEditTags(asset.tags?.join(', ') || '');
    setIsEditing(true);
  }, [asset]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!asset || !onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(asset.id, {
        title: editTitle || undefined,
        description: editDescription || undefined,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }, [asset, editTitle, editDescription, editTags, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!asset || !onDelete) return;
    if (confirm('Are you sure you want to delete this asset?')) {
      await onDelete(asset.id);
      onClose();
    }
  }, [asset, onDelete, onClose]);

  const handleAddToCollection = useCallback(async (collectionId: string) => {
    if (!asset || !onAddToCollection) return;
    await onAddToCollection(asset.id, collectionId);
    setCollectionMenuAnchor(null);
  }, [asset, onAddToCollection]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowLeft' && hasPrev) {
        onNavigatePrev?.();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNavigateNext?.();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasPrev, hasNext, onNavigatePrev, onNavigateNext, onClose]);

  if (!asset) return null;

  // Format helpers
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} bytes`;
  };

  const renderMediaPreview = () => {
    switch (asset.assetType) {
      case 'video':
        return (
          <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box
              component="video"
              src={asset.publicUrl}
              poster={asset.thumbnailUrl || undefined}
              controls={false}
              autoPlay={isPlaying}
              muted={isMuted}
              loop
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: `${studioRadii.md}px`,
              }}
            />
            {/* Video Controls Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                background: 'rgba(0,0,0,0.7)',
                borderRadius: `${studioRadii.lg}px`,
                px: 2,
                py: 1,
              }}
            >
              <IconButton size="small" onClick={() => setIsPlaying(!isPlaying)} sx={{ color: studioColors.textPrimary }}>
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <IconButton size="small" onClick={() => setIsMuted(!isMuted)} sx={{ color: studioColors.textPrimary }}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  const video = document.querySelector('video');
                  video?.requestFullscreen();
                }}
                sx={{ color: studioColors.textPrimary }}
              >
                <FullscreenIcon />
              </IconButton>
            </Box>
          </Box>
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
              gap: 3,
            }}
          >
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${studioColors.accent} 0%, ${studioColors.blue} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <VolumeUpIcon sx={{ fontSize: 80, color: studioColors.textPrimary }} />
            </Box>
            <Box
              component="audio"
              src={asset.publicUrl}
              controls
              sx={{
                width: '100%',
                maxWidth: 400,
              }}
            />
          </Box>
        );

      default:
        return (
          <Box
            component="img"
            src={asset.publicUrl}
            alt={asset.title || 'Asset'}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: `${studioRadii.md}px`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          background: 'rgba(10, 11, 13, 0.98)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: `1px solid ${studioColors.border}`,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onClose} sx={{ color: studioColors.textSecondary }}>
              <CloseIcon />
            </IconButton>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              {isEditing ? 'Edit Asset' : asset.title || 'Untitled Asset'}
            </Typography>
            {asset.isGenerated && (
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                label="AI Generated"
                size="small"
                sx={{
                  background: 'rgba(59, 155, 148, 0.2)',
                  color: studioColors.accent,
                  fontSize: 11,
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={asset.isLikedByUser ? 'Unlike' : 'Like'}>
              <IconButton onClick={handleLikeClick} sx={{ color: asset.isLikedByUser ? studioColors.error : studioColors.textSecondary }}>
                {asset.isLikedByUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>

            {onAddToCollection && collections.length > 0 && (
              <>
                <Tooltip title="Add to collection">
                  <IconButton onClick={(e) => setCollectionMenuAnchor(e.currentTarget)} sx={{ color: studioColors.textSecondary }}>
                    <CreateNewFolderIcon />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={collectionMenuAnchor}
                  open={Boolean(collectionMenuAnchor)}
                  onClose={() => setCollectionMenuAnchor(null)}
                  PaperProps={{
                    sx: {
                      background: studioColors.surface2,
                      border: `1px solid ${studioColors.border}`,
                      minWidth: 200,
                    },
                  }}
                >
                  {collections.map((collection) => (
                    <MenuItem key={collection.id} onClick={() => handleAddToCollection(collection.id)}>
                      <ListItemText
                        primary={collection.name}
                        primaryTypographyProps={{ sx: { fontSize: 13, color: studioColors.textPrimary } }}
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            <Tooltip title="Download">
              <IconButton onClick={handleDownload} sx={{ color: studioColors.textSecondary }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Share">
              <IconButton onClick={handleShare} sx={{ color: studioColors.textSecondary }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Toggle info panel">
              <IconButton onClick={() => setShowInfo(!showInfo)} sx={{ color: showInfo ? studioColors.accent : studioColors.textSecondary }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>

            {onUpdate && !isEditing && (
              <Tooltip title="Edit">
                <IconButton onClick={handleStartEdit} sx={{ color: studioColors.textSecondary }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip title="Delete">
                <IconButton onClick={handleDelete} sx={{ color: studioColors.error }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Navigation - Previous */}
          {hasPrev && (
            <Box
              onClick={onNavigatePrev}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: `all ${studioMotion.fast}`,
                '&:hover': { background: 'rgba(0,0,0,0.7)' },
              }}
            >
              <NavigateBeforeIcon sx={{ color: studioColors.textPrimary, fontSize: 28 }} />
            </Box>
          )}

          {/* Main Preview */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              position: 'relative',
            }}
          >
            {renderMediaPreview()}
          </Box>

          {/* Navigation - Next */}
          {hasNext && (
            <Box
              onClick={onNavigateNext}
              sx={{
                position: 'absolute',
                right: showInfo ? 360 : 16,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: `all ${studioMotion.fast}`,
                '&:hover': { background: 'rgba(0,0,0,0.7)' },
              }}
            >
              <NavigateNextIcon sx={{ color: studioColors.textPrimary, fontSize: 28 }} />
            </Box>
          )}

          {/* Info Panel */}
          {showInfo && (
            <Box
              sx={{
                width: 340,
                borderLeft: `1px solid ${studioColors.border}`,
                background: studioColors.carbon,
                overflow: 'auto',
                flexShrink: 0,
              }}
            >
              {isEditing ? (
                // Edit Mode
                <Box sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                      mb: 2,
                    }}
                  >
                    Edit Details
                  </Typography>

                  <TextField
                    fullWidth
                    label="Title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    sx={{ mb: 2, ...textFieldStyles }}
                  />

                  <TextField
                    fullWidth
                    label="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    multiline
                    rows={3}
                    sx={{ mb: 2, ...textFieldStyles }}
                  />

                  <TextField
                    fullWidth
                    label="Tags (comma separated)"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="fashion, portrait, elegant"
                    sx={{ mb: 3, ...textFieldStyles }}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      sx={{
                        flex: 1,
                        color: studioColors.textSecondary,
                        borderColor: studioColors.border,
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      sx={{
                        flex: 1,
                        background: studioColors.accent,
                        '&:hover': { background: studioColors.accentMuted },
                      }}
                    >
                      {isSaving ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                // View Mode
                <>
                  {/* Description */}
                  {asset.description && (
                    <Box sx={{ p: 3, borderBottom: `1px solid ${studioColors.border}` }}>
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                        {asset.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Stats */}
                  <Box sx={{ p: 3, borderBottom: `1px solid ${studioColors.border}` }}>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.lg, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.textPrimary }}>
                          {asset.likesCount}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
                          Likes
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.lg, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.textPrimary }}>
                          {asset.viewsCount}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
                          Views
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.lg, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.textPrimary }}>
                          {asset.downloadsCount}
                        </Typography>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
                          Downloads
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <Box sx={{ p: 3, borderBottom: `1px solid ${studioColors.border}` }}>
                      <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {asset.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              background: studioColors.surface2,
                              color: studioColors.textSecondary,
                              fontSize: 11,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Generation Info */}
                  {asset.isGenerated && asset.prompt && (
                    <Box sx={{ p: 3, borderBottom: `1px solid ${studioColors.border}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
                          Prompt
                        </Typography>
                        <Tooltip title={copiedPrompt ? 'Copied!' : 'Copy prompt'}>
                          <IconButton size="small" onClick={handleCopyPrompt}>
                            {copiedPrompt ? (
                              <CheckIcon sx={{ fontSize: 16, color: studioColors.success }} />
                            ) : (
                              <ContentCopyIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          color: studioColors.textSecondary,
                          background: studioColors.surface1,
                          p: 1.5,
                          borderRadius: `${studioRadii.sm}px`,
                          fontStyle: 'italic',
                        }}
                      >
                        "{asset.prompt}"
                      </Typography>

                      {(asset.provider || asset.model) && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          {asset.provider && (
                            <Chip
                              label={asset.provider}
                              size="small"
                              sx={{
                                background: studioColors.surface2,
                                color: studioColors.textSecondary,
                                fontSize: 10,
                              }}
                            />
                          )}
                          {asset.model && (
                            <Chip
                              label={asset.model}
                              size="small"
                              sx={{
                                background: studioColors.surface2,
                                color: studioColors.textSecondary,
                                fontSize: 10,
                              }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Technical Details */}
                  <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 2 }}>
                      Details
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <DetailRow icon={<AccessTimeIcon />} label="Created" value={formatDate(asset.createdAt)} />
                      {asset.width && asset.height && (
                        <DetailRow icon={<AspectRatioIcon />} label="Dimensions" value={`${asset.width} × ${asset.height}`} />
                      )}
                      <DetailRow icon={<StorageIcon />} label="Size" value={formatFileSize(asset.fileSizeBytes)} />
                      <DetailRow icon={<VisibilityIcon />} label="Visibility" value={asset.visibility} />
                      {asset.source && (
                        <DetailRow icon={<AutoAwesomeIcon />} label="Source" value={asset.source} />
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{ color: studioColors.textMuted, display: 'flex', '& svg': { fontSize: 16 } }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, minWidth: 80 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary, textTransform: 'capitalize' }}>
      {value}
    </Typography>
  </Box>
);

// TextField styles
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: studioColors.border },
    '&:hover fieldset': { borderColor: studioColors.borderHover },
    '&.Mui-focused fieldset': { borderColor: studioColors.accent },
  },
  '& .MuiInputLabel-root': { color: studioColors.textSecondary },
  '& .MuiInputBase-input': { color: studioColors.textPrimary },
};

export default AssetDetailModal;
