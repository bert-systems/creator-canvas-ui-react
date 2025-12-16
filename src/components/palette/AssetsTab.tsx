/**
 * AssetsTab Component
 *
 * The ASSETS tab for managing creative assets.
 * Features:
 * - Recent Outputs: Latest generated content
 * - Collections: Organized asset groupings
 * - Characters: Saved character references for consistency
 * - Uploads: User-uploaded assets
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Collapse,
  Chip,
  alpha,
  Grid,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Collections as CollectionIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  ViewInAr as Model3DIcon,
  AudioFile as AudioIcon,
  Folder as FolderIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { creativeCardTokens } from '../../theme';
import type { RecentAsset, AssetCollection } from './paletteData';

// ============================================================================
// TYPES
// ============================================================================

interface AssetsTabProps {
  onAssetSelect?: (assetId: string, assetType: string, url: string) => void;
  onDragStart?: (assetId: string, assetType: string, url: string, event: React.DragEvent) => void;
  searchQuery?: string;
}

// ============================================================================
// MOCK DATA - In production, these come from user's storage
// ============================================================================

const RECENT_OUTPUTS: RecentAsset[] = [
  {
    id: 'recent-1',
    type: 'image',
    url: '/outputs/image1.png',
    thumbnailUrl: '/outputs/thumb1.png',
    createdAt: Date.now() - 3600000,
    cardId: 'card-123',
  },
  {
    id: 'recent-2',
    type: 'video',
    url: '/outputs/video1.mp4',
    thumbnailUrl: '/outputs/thumb2.png',
    createdAt: Date.now() - 7200000,
    cardId: 'card-124',
  },
  {
    id: 'recent-3',
    type: 'image',
    url: '/outputs/image2.png',
    thumbnailUrl: '/outputs/thumb3.png',
    createdAt: Date.now() - 10800000,
  },
  {
    id: 'recent-4',
    type: '3d',
    url: '/outputs/model1.glb',
    thumbnailUrl: '/outputs/thumb4.png',
    createdAt: Date.now() - 14400000,
  },
];

const USER_COLLECTIONS: AssetCollection[] = [
  {
    id: 'collection-1',
    name: 'Spring Campaign',
    emoji: '🌸',
    itemCount: 24,
    thumbnails: ['/thumb1.png', '/thumb2.png', '/thumb3.png', '/thumb4.png'],
  },
  {
    id: 'collection-2',
    name: 'Product Shots',
    emoji: '📦',
    itemCount: 18,
    thumbnails: ['/thumb5.png', '/thumb6.png', '/thumb7.png'],
  },
  {
    id: 'collection-3',
    name: 'Brand Assets',
    emoji: '✨',
    itemCount: 45,
    thumbnails: ['/thumb8.png', '/thumb9.png'],
  },
];

interface SavedCharacter {
  id: string;
  name: string;
  thumbnailUrl: string;
  usageCount: number;
  lastUsed: number;
}

const SAVED_CHARACTERS: SavedCharacter[] = [
  {
    id: 'char-1',
    name: 'Maya',
    thumbnailUrl: '/characters/maya.png',
    usageCount: 42,
    lastUsed: Date.now() - 86400000,
  },
  {
    id: 'char-2',
    name: 'Amara',
    thumbnailUrl: '/characters/amara.png',
    usageCount: 28,
    lastUsed: Date.now() - 172800000,
  },
  {
    id: 'char-3',
    name: 'Brand Model A',
    thumbnailUrl: '/characters/model-a.png',
    usageCount: 15,
    lastUsed: Date.now() - 259200000,
  },
];

// ============================================================================
// ASSET TYPE ICON HELPER
// ============================================================================

function getAssetIcon(type: RecentAsset['type']) {
  switch (type) {
    case 'image':
      return <ImageIcon sx={{ fontSize: 16 }} />;
    case 'video':
      return <VideoIcon sx={{ fontSize: 16 }} />;
    case '3d':
      return <Model3DIcon sx={{ fontSize: 16 }} />;
    case 'audio':
      return <AudioIcon sx={{ fontSize: 16 }} />;
    default:
      return <ImageIcon sx={{ fontSize: 16 }} />;
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================================================
// RECENT OUTPUTS SECTION
// ============================================================================

interface RecentOutputsSectionProps {
  assets: RecentAsset[];
  onAssetSelect?: (assetId: string, assetType: string, url: string) => void;
  onDragStart?: (assetId: string, assetType: string, url: string, event: React.DragEvent) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const RecentOutputsSection = memo(function RecentOutputsSection({
  assets,
  onAssetSelect,
  onDragStart,
  isExpanded,
  onToggle,
}: RecentOutputsSectionProps) {
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
        <HistoryIcon sx={{ fontSize: 20, color: 'info.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Recent Outputs
        </Typography>
        <Chip label={assets.length} size="small" sx={{ height: 20 }} />
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Grid container spacing={1}>
            {assets.map((asset) => (
              <Grid size={{ xs: 4 }} key={asset.id}>
                <AssetThumbnail
                  asset={asset}
                  onSelect={onAssetSelect}
                  onDragStart={onDragStart}
                />
              </Grid>
            ))}
          </Grid>
          {assets.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No recent outputs yet. Start creating!
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

interface AssetThumbnailProps {
  asset: RecentAsset;
  onSelect?: (assetId: string, assetType: string, url: string) => void;
  onDragStart?: (assetId: string, assetType: string, url: string, event: React.DragEvent) => void;
}

const AssetThumbnail = memo(function AssetThumbnail({
  asset,
  onSelect,
  onDragStart,
}: AssetThumbnailProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('assetId', asset.id);
    e.dataTransfer.setData('assetType', asset.type);
    e.dataTransfer.setData('assetUrl', asset.url);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(asset.id, asset.type, asset.url, e);
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect?.(asset.id, asset.type, asset.url)}
      sx={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: `${creativeCardTokens.radius.button}px`,
        overflow: 'hidden',
        cursor: 'grab',
        bgcolor: alpha('#6366f1', 0.1),
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          '& .asset-overlay': {
            opacity: 1,
          },
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {/* Placeholder - in production would show actual thumbnail */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        {getAssetIcon(asset.type)}
      </Box>

      {/* Type badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 4,
          left: 4,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: 'white',
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {getAssetIcon(asset.type)}
      </Box>

      {/* Hover overlay */}
      <Box
        className="asset-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DragIcon sx={{ color: 'white' }} />
      </Box>

      {/* Time badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: 'white',
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          fontSize: '0.6rem',
        }}
      >
        {formatTimeAgo(asset.createdAt)}
      </Box>
    </Box>
  );
});

// ============================================================================
// COLLECTIONS SECTION
// ============================================================================

interface CollectionsSectionProps {
  collections: AssetCollection[];
  onCollectionSelect?: (collectionId: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}

const CollectionsSection = memo(function CollectionsSection({
  collections,
  onCollectionSelect,
  isExpanded,
  onToggle,
  searchQuery,
}: CollectionsSectionProps) {
  const filteredCollections = searchQuery
    ? collections.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : collections;

  if (searchQuery && filteredCollections.length === 0) {
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
        <CollectionIcon sx={{ fontSize: 20, color: 'warning.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Collections
        </Typography>
        <Chip label={collections.length} size="small" sx={{ height: 20 }} />
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded || !!searchQuery}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {/* Create Collection Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ mb: 1.5, textTransform: 'none' }}
          >
            New Collection
          </Button>

          {/* Collection Cards */}
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onSelect={onCollectionSelect}
            />
          ))}

          {collections.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No collections yet. Create one to organize your assets.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

interface CollectionCardProps {
  collection: AssetCollection;
  onSelect?: (collectionId: string) => void;
}

const CollectionCard = memo(function CollectionCard({
  collection,
  onSelect,
}: CollectionCardProps) {
  return (
    <Box
      onClick={() => onSelect?.(collection.id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
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
      {/* Icon */}
      <Box
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${creativeCardTokens.radius.button}px`,
          bgcolor: alpha('#F59E0B', 0.1),
        }}
      >
        <Typography sx={{ fontSize: '1.2rem' }}>{collection.emoji}</Typography>
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {collection.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {collection.itemCount} items
        </Typography>
      </Box>

      {/* Preview Thumbnails */}
      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20 } }}>
        {collection.thumbnails.slice(0, 3).map((thumb, i) => (
          <Avatar key={i} src={thumb} sx={{ bgcolor: 'grey.300' }}>
            <FolderIcon sx={{ fontSize: 12 }} />
          </Avatar>
        ))}
      </AvatarGroup>
    </Box>
  );
});

// ============================================================================
// CHARACTERS SECTION
// ============================================================================

interface CharactersSectionProps {
  characters: SavedCharacter[];
  onCharacterSelect?: (characterId: string) => void;
  onDragStart?: (characterId: string, event: React.DragEvent) => void;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery?: string;
}

const CharactersSection = memo(function CharactersSection({
  characters,
  onCharacterSelect,
  onDragStart,
  isExpanded,
  onToggle,
  searchQuery,
}: CharactersSectionProps) {
  const filteredCharacters = searchQuery
    ? characters.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : characters;

  if (searchQuery && filteredCharacters.length === 0) {
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
        <PersonIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Characters
        </Typography>
        <Chip label={characters.length} size="small" sx={{ height: 20 }} />
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded || !!searchQuery}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {/* Add Character Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ mb: 1.5, textTransform: 'none' }}
          >
            Add Character
          </Button>

          {/* Character Cards */}
          <Grid container spacing={1}>
            {filteredCharacters.map((character) => (
              <Grid size={{ xs: 6 }} key={character.id}>
                <CharacterCard
                  character={character}
                  onSelect={onCharacterSelect}
                  onDragStart={onDragStart}
                />
              </Grid>
            ))}
          </Grid>

          {characters.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No saved characters. Add characters to maintain consistency across generations.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
});

interface CharacterCardProps {
  character: SavedCharacter;
  onSelect?: (characterId: string) => void;
  onDragStart?: (characterId: string, event: React.DragEvent) => void;
}

const CharacterCard = memo(function CharacterCard({
  character,
  onSelect,
  onDragStart,
}: CharacterCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('characterId', character.id);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(character.id, e);
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect?.(character.id)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 1,
        borderRadius: `${creativeCardTokens.radius.button}px`,
        cursor: 'grab',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'secondary.main',
          bgcolor: alpha('#8B5CF6', 0.05),
          transform: 'translateY(-2px)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {/* Avatar */}
      <Avatar
        src={character.thumbnailUrl}
        sx={{
          width: 48,
          height: 48,
          mb: 0.5,
          border: '2px solid',
          borderColor: 'secondary.main',
        }}
      >
        <PersonIcon />
      </Avatar>

      {/* Name */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: '100%',
        }}
      >
        {character.name}
      </Typography>

      {/* Usage Count */}
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
        Used {character.usageCount}x
      </Typography>
    </Box>
  );
});

// ============================================================================
// UPLOADS SECTION
// ============================================================================

interface UploadsSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const UploadsSection = memo(function UploadsSection({
  isExpanded,
  onToggle,
}: UploadsSectionProps) {
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
        <UploadIcon sx={{ fontSize: 20, color: 'success.main' }} />
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          Uploads
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {/* Upload Area */}
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: `${creativeCardTokens.radius.inner}px`,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'success.main',
                bgcolor: alpha('#22C55E', 0.05),
              },
            }}
          >
            <UploadIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Drop files here or click to upload
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Images, videos, audio, or 3D models
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AssetsTab = memo(function AssetsTab({
  onAssetSelect,
  onDragStart,
  searchQuery,
}: AssetsTabProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    recent: true,
    collections: true,
    characters: false,
    uploads: false,
  });

  const handleToggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleCollectionSelect = useCallback((collectionId: string) => {
    console.log('Collection selected:', collectionId);
    // In production, this would open the collection view
  }, []);

  const handleCharacterSelect = useCallback((characterId: string) => {
    console.log('Character selected:', characterId);
    // In production, this would apply character to workflow
  }, []);

  const handleCharacterDragStart = useCallback(
    (characterId: string, _event: React.DragEvent) => {
      console.log('Character drag started:', characterId);
    },
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Recent Outputs */}
      <RecentOutputsSection
        assets={RECENT_OUTPUTS}
        onAssetSelect={onAssetSelect}
        onDragStart={onDragStart}
        isExpanded={expandedSections.recent}
        onToggle={() => handleToggleSection('recent')}
      />

      {/* Collections */}
      <CollectionsSection
        collections={USER_COLLECTIONS}
        onCollectionSelect={handleCollectionSelect}
        isExpanded={expandedSections.collections}
        onToggle={() => handleToggleSection('collections')}
        searchQuery={searchQuery}
      />

      {/* Characters */}
      <CharactersSection
        characters={SAVED_CHARACTERS}
        onCharacterSelect={handleCharacterSelect}
        onDragStart={handleCharacterDragStart}
        isExpanded={expandedSections.characters}
        onToggle={() => handleToggleSection('characters')}
        searchQuery={searchQuery}
      />

      {/* Uploads */}
      <UploadsSection
        isExpanded={expandedSections.uploads}
        onToggle={() => handleToggleSection('uploads')}
      />
    </Box>
  );
});

export default AssetsTab;
