/**
 * AssetLibraryPage - Main page for managing user's AI-generated assets and collections
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import LabelIcon from '@mui/icons-material/Label';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ShareIcon from '@mui/icons-material/Share';
import {
  studioColors,
  studioRadii,
  studioTypography,
} from '../studios/shared/studioTokens';
import { AssetGrid } from './AssetGrid';
import { CollectionCard } from './CollectionCard';
import { AssetDetailModal } from './AssetDetailModal';
import { useAssetStore } from '@/stores/assetStore';
import type { Asset, Collection, AssetType, AssetUpdateParams } from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

type TabValue = 'all' | 'images' | 'videos' | 'audio' | 'collections';
type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'popular' | 'name';

interface FilterState {
  assetType?: AssetType;
  source?: string;
  isGenerated?: boolean;
  isLiked?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const AssetLibraryPage: React.FC = () => {
  // Store
  const {
    myAssets,
    myCollections,
    currentCollection,
    collectionAssets,
    selectedAssetIds,
    assetsLoading,
    collectionsLoading,
    assetsHasMore,
    fetchMyAssets,
    fetchMyCollections,
    fetchCollection,
    fetchCollectionAssets,
    selectAsset,
    deselectAsset,
    clearSelection,
    selectAll,
    deleteAssets,
    deleteAsset,
    likeAsset,
    unlikeAsset,
    updateAsset,
    createCollection,
    updateCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
  } = useAssetStore();

  // Local state
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterState>({});
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  // Asset detail modal state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetDetailOpen, setAssetDetailOpen] = useState(false);

  // Collection view state
  const [viewingCollectionId, setViewingCollectionId] = useState<string | null>(null);

  // Edit collection state
  const [editCollectionOpen, setEditCollectionOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editCollectionName, setEditCollectionName] = useState('');
  const [editCollectionDescription, setEditCollectionDescription] = useState('');

  // Batch operations state
  const [batchTagDialogOpen, setBatchTagDialogOpen] = useState(false);
  const [batchTags, setBatchTags] = useState('');
  const [addToCollectionDialogOpen, setAddToCollectionDialogOpen] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchMyAssets({ page: 1 });
    fetchMyCollections();
  }, [fetchMyAssets, fetchMyCollections]);

  // Fetch collection assets when viewing a collection
  useEffect(() => {
    if (viewingCollectionId) {
      fetchCollection(viewingCollectionId);
      fetchCollectionAssets(viewingCollectionId);
    }
  }, [viewingCollectionId, fetchCollection, fetchCollectionAssets]);

  // Filter assets based on tab and filters
  const filteredAssets = myAssets.filter((asset) => {
    // Tab filter
    if (activeTab === 'images' && asset.assetType !== 'image') return false;
    if (activeTab === 'videos' && asset.assetType !== 'video') return false;
    if (activeTab === 'audio' && asset.assetType !== 'audio') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = asset.title?.toLowerCase().includes(query);
      const matchesPrompt = asset.prompt?.toLowerCase().includes(query);
      const matchesTags = asset.tags?.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesPrompt && !matchesTags) return false;
    }

    // Additional filters
    if (filters.isGenerated !== undefined && asset.isGenerated !== filters.isGenerated) return false;
    if (filters.isLiked && !asset.isLikedByUser) return false;
    if (filters.source && asset.source !== filters.source) return false;

    return true;
  });

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'popular':
        return (b.likesCount + b.viewsCount) - (a.likesCount + a.viewsCount);
      case 'name':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return 0;
    }
  });

  // Handlers
  const handleTabChange = (_: React.SyntheticEvent, value: TabValue) => {
    setActiveTab(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Get the active assets list based on context
  const activeAssets = viewingCollectionId ? collectionAssets : sortedAssets;

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
    const currentIndex = activeAssets.findIndex((a) => a.id === selectedAsset.id);
    if (currentIndex > 0) {
      setSelectedAsset(activeAssets[currentIndex - 1]);
    }
  }, [selectedAsset, activeAssets]);

  const handleNavigateNext = useCallback(() => {
    if (!selectedAsset) return;
    const currentIndex = activeAssets.findIndex((a) => a.id === selectedAsset.id);
    if (currentIndex < activeAssets.length - 1) {
      setSelectedAsset(activeAssets[currentIndex + 1]);
    }
  }, [selectedAsset, activeAssets]);

  const hasPrevAsset = selectedAsset
    ? activeAssets.findIndex((a) => a.id === selectedAsset.id) > 0
    : false;
  const hasNextAsset = selectedAsset
    ? activeAssets.findIndex((a) => a.id === selectedAsset.id) < activeAssets.length - 1
    : false;

  const handleAssetUpdate = async (assetId: string, updates: AssetUpdateParams) => {
    await updateAsset(assetId, updates);
    // Update selected asset if it's the one being edited
    if (selectedAsset?.id === assetId) {
      const updatedAsset = activeAssets.find((a) => a.id === assetId);
      if (updatedAsset) setSelectedAsset(updatedAsset);
    }
  };

  const handleAssetDelete = async (assetId: string) => {
    await deleteAsset(assetId);
    handleAssetDetailClose();
  };

  const handleAddAssetToCollection = async (assetId: string, collectionId: string) => {
    await addToCollection(collectionId, [assetId]);
  };

  const handleAssetSelect = (assetId: string, selected: boolean) => {
    if (selected) {
      selectAsset(assetId);
    } else {
      deselectAsset(assetId);
    }
  };

  const handleSelectAll = () => {
    if (selectedAssetIds.length === sortedAssets.length) {
      clearSelection();
    } else {
      selectAll(sortedAssets.map((a) => a.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedAssetIds.length === 0) return;
    if (confirm(`Delete ${selectedAssetIds.length} selected assets?`)) {
      await deleteAssets(selectedAssetIds);
    }
  };

  const handleLike = async (assetId: string) => {
    await likeAsset(assetId);
  };

  const handleUnlike = async (assetId: string) => {
    await unlikeAsset(assetId);
  };

  const handleDownload = (asset: Asset) => {
    window.open(asset.publicUrl, '_blank');
  };

  const handleLoadMore = useCallback(() => {
    // Calculate next page based on current assets
    const nextPage = Math.floor(myAssets.length / 20) + 1;
    fetchMyAssets({ page: nextPage });
  }, [myAssets.length, fetchMyAssets]);

  const handleCollectionClick = (collection: Collection) => {
    setViewingCollectionId(collection.id);
  };

  const handleBackToCollections = () => {
    setViewingCollectionId(null);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setEditCollectionName(collection.name);
    setEditCollectionDescription(collection.description || '');
    setEditCollectionOpen(true);
  };

  const handleSaveCollectionEdit = async () => {
    if (!editingCollection || !editCollectionName.trim()) return;
    await updateCollection(editingCollection.id, {
      name: editCollectionName,
      description: editCollectionDescription || undefined,
    });
    setEditCollectionOpen(false);
    setEditingCollection(null);
  };

  const handleRemoveFromCollection = async (assetId: string) => {
    if (!viewingCollectionId) return;
    await removeFromCollection(viewingCollectionId, assetId);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    await createCollection({
      name: newCollectionName,
      description: newCollectionDescription || undefined,
      visibility: 'private',
    });
    setCreateCollectionOpen(false);
    setNewCollectionName('');
    setNewCollectionDescription('');
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (confirm('Delete this collection?')) {
      await deleteCollection(collectionId);
    }
  };

  // Batch operations handlers
  const handleBatchDownload = useCallback(async () => {
    if (selectedAssetIds.length === 0) return;
    setBatchProcessing(true);
    try {
      // Get the selected assets
      const selectedAssets = activeAssets.filter((a) => selectedAssetIds.includes(a.id));

      // For single asset, direct download
      if (selectedAssets.length === 1) {
        window.open(selectedAssets[0].publicUrl, '_blank');
        return;
      }

      // For multiple assets, download each (browser will handle multiple downloads)
      // In a production app, this would use a zip service
      for (const asset of selectedAssets) {
        const link = document.createElement('a');
        link.href = asset.publicUrl;
        link.download = asset.title || `asset-${asset.id}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      setBatchProcessing(false);
    }
  }, [selectedAssetIds, activeAssets]);

  const handleBatchAddTags = async () => {
    if (selectedAssetIds.length === 0 || !batchTags.trim()) return;
    setBatchProcessing(true);
    try {
      const newTags = batchTags.split(',').map((t) => t.trim()).filter(Boolean);
      // Update each selected asset with the new tags
      for (const assetId of selectedAssetIds) {
        const asset = activeAssets.find((a) => a.id === assetId);
        if (asset) {
          const updatedTags = [...new Set([...(asset.tags || []), ...newTags])];
          await updateAsset(assetId, { tags: updatedTags });
        }
      }
      setBatchTagDialogOpen(false);
      setBatchTags('');
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleBatchAddToCollection = async (collectionId: string) => {
    if (selectedAssetIds.length === 0) return;
    setBatchProcessing(true);
    try {
      await addToCollection(collectionId, selectedAssetIds);
      setAddToCollectionDialogOpen(false);
      clearSelection();
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleBatchShare = useCallback(() => {
    if (selectedAssetIds.length === 0) return;
    const selectedAssets = activeAssets.filter((a) => selectedAssetIds.includes(a.id));
    const urls = selectedAssets.map((a) => a.publicUrl).join('\n');
    navigator.clipboard.writeText(urls);
    alert(`${selectedAssets.length} asset URLs copied to clipboard`);
  }, [selectedAssetIds, activeAssets]);

  const handleFilterChange = (key: keyof FilterState, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
          py: 2,
          borderBottom: `1px solid ${studioColors.border}`,
          background: studioColors.surface1,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize['2xl'],
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
            }}
          >
            My Library
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                color: studioColors.textSecondary,
                borderColor: studioColors.border,
                '&:hover': { borderColor: studioColors.accent },
              }}
            >
              Upload
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateCollectionOpen(true)}
              sx={{
                background: studioColors.accent,
                '&:hover': { background: studioColors.accentMuted },
              }}
            >
              New Collection
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontSize: studioTypography.fontSize.sm,
              color: studioColors.textSecondary,
              '&.Mui-selected': { color: studioColors.accent },
            },
            '& .MuiTabs-indicator': { background: studioColors.accent },
          }}
        >
          <Tab
            value="all"
            label="All Assets"
            icon={<ViewModuleIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            value="images"
            label="Images"
            icon={<ImageIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            value="videos"
            label="Videos"
            icon={<VideocamIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            value="audio"
            label="Audio"
            icon={<AudiotrackIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            value="collections"
            label="Collections"
            icon={<CreateNewFolderIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${studioColors.border}`,
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search assets..."
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          sx={{
            width: 280,
            '& .MuiOutlinedInput-root': {
              background: studioColors.surface1,
              '& fieldset': { borderColor: studioColors.border },
              '&:hover fieldset': { borderColor: studioColors.borderHover },
              '&.Mui-focused fieldset': { borderColor: studioColors.accent },
            },
            '& .MuiInputBase-input': {
              color: studioColors.textPrimary,
              fontSize: studioTypography.fontSize.sm,
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
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Button */}
        <Tooltip title="Filter">
          <IconButton
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            sx={{
              color: activeFilterCount > 0 ? studioColors.accent : studioColors.textSecondary,
              border: `1px solid ${activeFilterCount > 0 ? studioColors.accent : studioColors.border}`,
              borderRadius: `${studioRadii.sm}px`,
            }}
          >
            <FilterListIcon sx={{ fontSize: 20 }} />
            {activeFilterCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: studioColors.accent,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: studioColors.textPrimary,
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </IconButton>
        </Tooltip>

        {/* Sort Button */}
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

        {/* View Toggle */}
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

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Selection Actions */}
        {selectedAssetIds.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              background: studioColors.surface2,
              borderRadius: `${studioRadii.md}px`,
              border: `1px solid ${studioColors.accent}`,
            }}
          >
            <Chip
              label={`${selectedAssetIds.length} selected`}
              size="small"
              sx={{
                background: studioColors.accent,
                color: studioColors.textPrimary,
                fontWeight: studioTypography.fontWeight.medium,
              }}
            />

            <Divider orientation="vertical" flexItem sx={{ borderColor: studioColors.border, mx: 0.5 }} />

            {/* Download Selected */}
            <Tooltip title="Download selected">
              <IconButton
                onClick={handleBatchDownload}
                size="small"
                disabled={batchProcessing}
                sx={{ color: studioColors.textSecondary, '&:hover': { color: studioColors.accent } }}
              >
                <DownloadIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Add Tags */}
            <Tooltip title="Add tags to selected">
              <IconButton
                onClick={() => setBatchTagDialogOpen(true)}
                size="small"
                disabled={batchProcessing}
                sx={{ color: studioColors.textSecondary, '&:hover': { color: studioColors.accent } }}
              >
                <LabelIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Add to Collection */}
            <Tooltip title="Add to collection">
              <IconButton
                onClick={() => setAddToCollectionDialogOpen(true)}
                size="small"
                disabled={batchProcessing}
                sx={{ color: studioColors.textSecondary, '&:hover': { color: studioColors.accent } }}
              >
                <FolderZipIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Share Links */}
            <Tooltip title="Share selected">
              <IconButton
                onClick={handleBatchShare}
                size="small"
                disabled={batchProcessing}
                sx={{ color: studioColors.textSecondary, '&:hover': { color: studioColors.accent } }}
              >
                <ShareIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ borderColor: studioColors.border, mx: 0.5 }} />

            {/* Select All */}
            <Tooltip title="Select all">
              <IconButton
                onClick={handleSelectAll}
                size="small"
                sx={{ color: studioColors.textSecondary, '&:hover': { color: studioColors.accent } }}
              >
                <SelectAllIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Delete Selected */}
            <Tooltip title="Delete selected">
              <IconButton
                onClick={handleDeleteSelected}
                size="small"
                disabled={batchProcessing}
                sx={{ color: studioColors.error, '&:hover': { color: '#ff6b6b' } }}
              >
                <DeleteIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Button
              size="small"
              onClick={clearSelection}
              sx={{
                ml: 1,
                color: studioColors.textSecondary,
                fontSize: studioTypography.fontSize.xs,
                '&:hover': { color: studioColors.textPrimary },
              }}
            >
              Clear
            </Button>
          </Box>
        )}

        {/* Asset Count */}
        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textMuted }}>
          {activeTab === 'collections'
            ? `${myCollections.length} collections`
            : `${sortedAssets.length} assets`}
        </Typography>
      </Box>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <Box
          sx={{
            px: 3,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: `1px solid ${studioColors.border}`,
          }}
        >
          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
            Filters:
          </Typography>
          {filters.isGenerated && (
            <Chip
              label="AI Generated"
              size="small"
              onDelete={() => handleFilterChange('isGenerated', undefined)}
              sx={{
                background: studioColors.surface2,
                color: studioColors.textPrimary,
                fontSize: 11,
              }}
            />
          )}
          {filters.isLiked && (
            <Chip
              label="Liked"
              size="small"
              onDelete={() => handleFilterChange('isLiked', undefined)}
              sx={{
                background: studioColors.surface2,
                color: studioColors.textPrimary,
                fontSize: 11,
              }}
            />
          )}
          {filters.source && (
            <Chip
              label={filters.source}
              size="small"
              onDelete={() => handleFilterChange('source', undefined)}
              sx={{
                background: studioColors.surface2,
                color: studioColors.textPrimary,
                fontSize: 11,
              }}
            />
          )}
          <Button
            size="small"
            onClick={clearFilters}
            sx={{ fontSize: 11, color: studioColors.textSecondary }}
          >
            Clear all
          </Button>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {viewingCollectionId && currentCollection ? (
          // Collection Content View
          <Box>
            {/* Collection Header */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <IconButton onClick={handleBackToCollections} sx={{ color: studioColors.textSecondary }}>
                  <ArrowBackIcon />
                </IconButton>
                <Breadcrumbs sx={{ color: studioColors.textMuted }}>
                  <Link
                    component="button"
                    underline="hover"
                    onClick={handleBackToCollections}
                    sx={{ color: studioColors.textSecondary, cursor: 'pointer' }}
                  >
                    Collections
                  </Link>
                  <Typography sx={{ color: studioColors.textPrimary }}>
                    {currentCollection.name}
                  </Typography>
                </Breadcrumbs>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xl,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                      mb: 0.5,
                    }}
                  >
                    {currentCollection.name}
                  </Typography>
                  {currentCollection.description && (
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                      {currentCollection.description}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mt: 1 }}>
                    {collectionAssets.length} {collectionAssets.length === 1 ? 'asset' : 'assets'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Edit collection">
                    <IconButton
                      onClick={() => handleEditCollection(currentCollection)}
                      sx={{ color: studioColors.textSecondary }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download all">
                    <IconButton sx={{ color: studioColors.textSecondary }}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* Collection Assets */}
            <AssetGrid
              assets={collectionAssets}
              loading={collectionsLoading}
              hasMore={false}
              onAssetClick={handleAssetClick}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onDownload={handleDownload}
              onDelete={handleRemoveFromCollection}
              selectedAssetIds={selectedAssetIds}
              selectable
              onSelect={handleAssetSelect}
              columns={viewMode === 'grid' ? 5 : 3}
              emptyMessage="This collection is empty"
              emptyAction={{
                label: 'Add Assets',
                onClick: () => {
                  setViewingCollectionId(null);
                  setActiveTab('all');
                },
              }}
            />
          </Box>
        ) : activeTab === 'collections' ? (
          // Collections Grid
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
            {myCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={handleCollectionClick}
                onEdit={handleEditCollection}
                onDelete={handleDeleteCollection}
              />
            ))}
            {myCollections.length === 0 && !collectionsLoading && (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                <CreateNewFolderIcon sx={{ fontSize: 48, color: studioColors.textMuted, mb: 2 }} />
                <Typography sx={{ color: studioColors.textMuted, mb: 2 }}>
                  No collections yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateCollectionOpen(true)}
                  sx={{
                    color: studioColors.textSecondary,
                    borderColor: studioColors.border,
                  }}
                >
                  Create Collection
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          // Assets Grid
          <AssetGrid
            assets={sortedAssets}
            loading={assetsLoading}
            hasMore={assetsHasMore}
            onLoadMore={handleLoadMore}
            onAssetClick={handleAssetClick}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onDownload={handleDownload}
            onAddToCollection={(assetId) => {
              selectAsset(assetId);
              // Could open a collection picker modal here
            }}
            selectedAssetIds={selectedAssetIds}
            selectable
            onSelect={handleAssetSelect}
            columns={viewMode === 'grid' ? 5 : 3}
            emptyMessage="No assets found"
            emptyAction={{
              label: 'Start Creating',
              onClick: () => {
                // Navigate to creation
              },
            }}
          />
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        PaperProps={{
          sx: {
            background: studioColors.surface2,
            border: `1px solid ${studioColors.border}`,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleFilterChange('isGenerated', true)}>
          <ListItemIcon>
            <DescriptionIcon
              sx={{
                fontSize: 18,
                color: filters.isGenerated ? studioColors.accent : studioColors.textSecondary,
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="AI Generated"
            primaryTypographyProps={{
              sx: {
                fontSize: 13,
                color: filters.isGenerated ? studioColors.accent : studioColors.textPrimary,
              },
            }}
          />
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('isLiked', true)}>
          <ListItemIcon>
            <ImageIcon
              sx={{
                fontSize: 18,
                color: filters.isLiked ? studioColors.accent : studioColors.textSecondary,
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary="Liked"
            primaryTypographyProps={{
              sx: {
                fontSize: 13,
                color: filters.isLiked ? studioColors.accent : studioColors.textPrimary,
              },
            }}
          />
        </MenuItem>
        <Divider sx={{ borderColor: studioColors.border }} />
        <MenuItem onClick={clearFilters}>
          <ListItemText
            primary="Clear Filters"
            primaryTypographyProps={{
              sx: { fontSize: 13, color: studioColors.textSecondary },
            }}
          />
        </MenuItem>
      </Menu>

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
          { value: 'newest', label: 'Newest First' },
          { value: 'oldest', label: 'Oldest First' },
          { value: 'popular', label: 'Most Popular' },
          { value: 'name', label: 'Name (A-Z)' },
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

      {/* Create Collection Dialog */}
      <Dialog
        open={createCollectionOpen}
        onClose={() => setCreateCollectionOpen(false)}
        PaperProps={{
          sx: {
            background: studioColors.surface1,
            border: `1px solid ${studioColors.border}`,
            borderRadius: `${studioRadii.lg}px`,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: studioColors.textPrimary }}>Create Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Collection Name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            sx={{
              mt: 1,
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: studioColors.border },
                '&:hover fieldset': { borderColor: studioColors.borderHover },
              },
              '& .MuiInputLabel-root': { color: studioColors.textSecondary },
              '& .MuiInputBase-input': { color: studioColors.textPrimary },
            }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={newCollectionDescription}
            onChange={(e) => setNewCollectionDescription(e.target.value)}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: studioColors.border },
                '&:hover fieldset': { borderColor: studioColors.borderHover },
              },
              '& .MuiInputLabel-root': { color: studioColors.textSecondary },
              '& .MuiInputBase-input': { color: studioColors.textPrimary },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCreateCollectionOpen(false)}
            sx={{ color: studioColors.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCollection}
            variant="contained"
            disabled={!newCollectionName.trim()}
            sx={{
              background: studioColors.accent,
              '&:hover': { background: studioColors.accentMuted },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog
        open={editCollectionOpen}
        onClose={() => setEditCollectionOpen(false)}
        PaperProps={{
          sx: {
            background: studioColors.surface1,
            border: `1px solid ${studioColors.border}`,
            borderRadius: `${studioRadii.lg}px`,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: studioColors.textPrimary }}>Edit Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Collection Name"
            value={editCollectionName}
            onChange={(e) => setEditCollectionName(e.target.value)}
            sx={{
              mt: 1,
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: studioColors.border },
                '&:hover fieldset': { borderColor: studioColors.borderHover },
              },
              '& .MuiInputLabel-root': { color: studioColors.textSecondary },
              '& .MuiInputBase-input': { color: studioColors.textPrimary },
            }}
          />
          <TextField
            fullWidth
            label="Description (optional)"
            value={editCollectionDescription}
            onChange={(e) => setEditCollectionDescription(e.target.value)}
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: studioColors.border },
                '&:hover fieldset': { borderColor: studioColors.borderHover },
              },
              '& .MuiInputLabel-root': { color: studioColors.textSecondary },
              '& .MuiInputBase-input': { color: studioColors.textPrimary },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditCollectionOpen(false)}
            sx={{ color: studioColors.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCollectionEdit}
            variant="contained"
            disabled={!editCollectionName.trim()}
            sx={{
              background: studioColors.accent,
              '&:hover': { background: studioColors.accentMuted },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Tag Dialog */}
      <Dialog
        open={batchTagDialogOpen}
        onClose={() => {
          setBatchTagDialogOpen(false);
          setBatchTags('');
        }}
        PaperProps={{
          sx: {
            background: studioColors.surface1,
            border: `1px solid ${studioColors.border}`,
            borderRadius: `${studioRadii.lg}px`,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: studioColors.textPrimary }}>
          Add Tags to {selectedAssetIds.length} Assets
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: studioColors.textSecondary, fontSize: studioTypography.fontSize.sm, mb: 2 }}>
            Enter tags separated by commas. These will be added to all selected assets.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Tags"
            placeholder="e.g., fashion, summer, vibrant"
            value={batchTags}
            onChange={(e) => setBatchTags(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: studioColors.border },
                '&:hover fieldset': { borderColor: studioColors.borderHover },
                '&.Mui-focused fieldset': { borderColor: studioColors.accent },
              },
              '& .MuiInputLabel-root': { color: studioColors.textSecondary },
              '& .MuiInputBase-input': { color: studioColors.textPrimary },
            }}
          />
          {batchTags && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
              {batchTags.split(',').map((tag, index) => {
                const trimmedTag = tag.trim();
                if (!trimmedTag) return null;
                return (
                  <Chip
                    key={index}
                    label={trimmedTag}
                    size="small"
                    sx={{
                      background: studioColors.surface3,
                      color: studioColors.textSecondary,
                    }}
                  />
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setBatchTagDialogOpen(false);
              setBatchTags('');
            }}
            sx={{ color: studioColors.textSecondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBatchAddTags}
            variant="contained"
            disabled={!batchTags.trim() || batchProcessing}
            sx={{
              background: studioColors.accent,
              '&:hover': { background: studioColors.accentMuted },
            }}
          >
            {batchProcessing ? 'Adding...' : 'Add Tags'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add to Collection Dialog */}
      <Dialog
        open={addToCollectionDialogOpen}
        onClose={() => setAddToCollectionDialogOpen(false)}
        PaperProps={{
          sx: {
            background: studioColors.surface1,
            border: `1px solid ${studioColors.border}`,
            borderRadius: `${studioRadii.lg}px`,
            minWidth: 400,
            maxHeight: '60vh',
          },
        }}
      >
        <DialogTitle sx={{ color: studioColors.textPrimary }}>
          Add {selectedAssetIds.length} Assets to Collection
        </DialogTitle>
        <DialogContent>
          {myCollections.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography sx={{ color: studioColors.textSecondary, mb: 2 }}>
                No collections yet. Create one first!
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CreateNewFolderIcon />}
                onClick={() => {
                  setAddToCollectionDialogOpen(false);
                  setCreateCollectionOpen(true);
                }}
                sx={{
                  borderColor: studioColors.border,
                  color: studioColors.textSecondary,
                  '&:hover': {
                    borderColor: studioColors.accent,
                    color: studioColors.accent,
                  },
                }}
              >
                Create Collection
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {myCollections.map((collection) => (
                <Button
                  key={collection.id}
                  onClick={() => handleBatchAddToCollection(collection.id)}
                  disabled={batchProcessing}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    background: studioColors.surface2,
                    borderRadius: `${studioRadii.md}px`,
                    textTransform: 'none',
                    '&:hover': {
                      background: studioColors.surface3,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: `${studioRadii.sm}px`,
                      background: studioColors.surface3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {collection.coverImageUrl ? (
                      <Box
                        component="img"
                        src={collection.coverImageUrl}
                        alt=""
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <FolderZipIcon sx={{ fontSize: 24, color: studioColors.textMuted }} />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.medium,
                        color: studioColors.textPrimary,
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
                      {collection.assetCount || 0} assets
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button
            startIcon={<CreateNewFolderIcon />}
            onClick={() => {
              setAddToCollectionDialogOpen(false);
              setCreateCollectionOpen(true);
            }}
            sx={{ color: studioColors.textSecondary }}
          >
            New Collection
          </Button>
          <Button
            onClick={() => setAddToCollectionDialogOpen(false)}
            sx={{ color: studioColors.textSecondary }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        open={assetDetailOpen}
        asset={selectedAsset}
        onClose={handleAssetDetailClose}
        onLike={handleLike}
        onUnlike={handleUnlike}
        onDownload={handleDownload}
        onDelete={handleAssetDelete}
        onUpdate={handleAssetUpdate}
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

export default AssetLibraryPage;
