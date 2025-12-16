/**
 * CreativePalette Component
 *
 * The redesigned creative palette with three-tab organization.
 * Replaces the technical model-based NodePalette with intent-based navigation.
 *
 * Tabs:
 * - CREATE: Intent-based node organization (Images, Videos, Fashion, 3D, etc.)
 * - STYLE: Brand DNA, Heritage Collection, Presets
 * - ASSETS: Recent Outputs, Collections, Characters, Uploads
 *
 * Features:
 * - Unified search across all tabs
 * - Capability-based search (e.g., "make video" finds video generators)
 * - Drag-to-canvas for nodes and assets
 * - Trending section for popular workflows
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  alpha,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as CreateIcon,
  Palette as StyleIcon,
  Collections as AssetsIcon,
} from '@mui/icons-material';
import { creativeCardTokens } from '../../theme';
import { CreateTab } from './CreateTab';
import { StyleTab } from './StyleTab';
import { AssetsTab } from './AssetsTab';
import { searchByCapability } from './paletteData';

// ============================================================================
// TYPES
// ============================================================================

export interface CreativePaletteProps {
  /** Callback when a node is dragged from the palette */
  onNodeDragStart?: (nodeType: string, event: React.DragEvent) => void;
  /** Callback when an asset is selected or dragged */
  onAssetSelect?: (assetId: string, assetType: string, url: string) => void;
  /** Callback when a style is selected */
  onStyleSelect?: (styleId: string, keywords: string[]) => void;
  /** Callback when a color palette is selected */
  onColorPaletteSelect?: (paletteId: string, colors: string[]) => void;
  /** Initial tab to show */
  defaultTab?: 'create' | 'style' | 'assets';
  /** Palette width */
  width?: number;
}

type PaletteTab = 'create' | 'style' | 'assets';

// ============================================================================
// TAB PANEL
// ============================================================================

interface TabPanelProps {
  children?: React.ReactNode;
  value: PaletteTab;
  activeTab: PaletteTab;
}

const TabPanel = memo(function TabPanel({ children, value, activeTab }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== activeTab}
      sx={{
        flex: 1,
        overflow: 'hidden',
        display: value === activeTab ? 'flex' : 'none',
        flexDirection: 'column',
      }}
    >
      {value === activeTab && children}
    </Box>
  );
});

// ============================================================================
// SEARCH BAR
// ============================================================================

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

const SearchBar = memo(function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  resultCount,
}: SearchBarProps) {
  return (
    <Box sx={{ px: 1.5, py: 1.25 }}>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                {resultCount !== undefined && (
                  <Chip
                    label={resultCount}
                    size="small"
                    sx={{ height: 18, fontSize: '0.65rem', mr: 0.5 }}
                  />
                )}
                <IconButton size="small" onClick={() => onChange('')} sx={{ p: 0.25 }}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: `${creativeCardTokens.radius.button}px`,
            bgcolor: 'background.default',
            '& fieldset': {
              borderColor: 'divider',
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
          '& .MuiInputBase-input': {
            py: 0.75,
            fontSize: '0.875rem',
          },
        }}
      />
    </Box>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CreativePalette = memo(function CreativePalette({
  onNodeDragStart,
  onAssetSelect,
  onStyleSelect,
  onColorPaletteSelect,
  defaultTab = 'create',
  width = 280,
}: CreativePaletteProps) {
  const [activeTab, setActiveTab] = useState<PaletteTab>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle tab change
  const handleTabChange = useCallback((_: React.SyntheticEvent, newTab: PaletteTab) => {
    setActiveTab(newTab);
  }, []);

  // Get search placeholder based on active tab
  const getSearchPlaceholder = useCallback(() => {
    switch (activeTab) {
      case 'create':
        return 'Search nodes or describe what you want to create...';
      case 'style':
        return 'Search styles, presets, or heritage...';
      case 'assets':
        return 'Search collections, characters, or files...';
      default:
        return 'Search...';
    }
  }, [activeTab]);

  // Get capability-based search results count for CREATE tab
  const getSearchResultCount = useCallback(() => {
    if (!searchQuery || activeTab !== 'create') return undefined;
    const capabilityResults = searchByCapability(searchQuery);
    return capabilityResults.length > 0 ? capabilityResults.length : undefined;
  }, [searchQuery, activeTab]);

  return (
    <Box
      sx={{
        width,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          Creative Palette
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              minHeight: 40,
              py: 0.5,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.8rem',
              '&.Mui-selected': {
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab
            value="create"
            icon={<CreateIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Create"
            sx={{
              '& .MuiTab-iconWrapper': { mr: 0.5 },
            }}
          />
          <Tab
            value="style"
            icon={<StyleIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Style"
            sx={{
              '& .MuiTab-iconWrapper': { mr: 0.5 },
            }}
          />
          <Tab
            value="assets"
            icon={<AssetsIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Assets"
            sx={{
              '& .MuiTab-iconWrapper': { mr: 0.5 },
            }}
          />
        </Tabs>
      </Box>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={getSearchPlaceholder()}
        resultCount={getSearchResultCount()}
      />

      {/* Tab Panels */}
      <TabPanel value="create" activeTab={activeTab}>
        <CreateTab onDragStart={onNodeDragStart} searchQuery={searchQuery} />
      </TabPanel>

      <TabPanel value="style" activeTab={activeTab}>
        <StyleTab
          onStyleSelect={onStyleSelect}
          onColorPaletteSelect={onColorPaletteSelect}
          searchQuery={searchQuery}
        />
      </TabPanel>

      <TabPanel value="assets" activeTab={activeTab}>
        <AssetsTab onAssetSelect={onAssetSelect} searchQuery={searchQuery} />
      </TabPanel>

      {/* Capability Search Hint */}
      {activeTab === 'create' && searchQuery && (
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha('#6366f1', 0.05),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Tip: Try searching by what you want to create, like "make a video" or "generate 3D model"
          </Typography>
        </Box>
      )}
    </Box>
  );
});

export default CreativePalette;
