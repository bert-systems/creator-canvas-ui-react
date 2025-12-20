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

import { memo, useState, useCallback, useRef, useEffect } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as CreateIcon,
  Palette as StyleIcon,
  Collections as AssetsIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
} from '@mui/icons-material';
import { darkNeutrals, brandColors } from '../../theme';
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
  /** Palette width (controlled mode if onWidthChange provided) */
  width?: number;
  /** Callback when width changes via resize handle */
  onWidthChange?: (width: number) => void;
  /** Minimum width for resize */
  minWidth?: number;
  /** Maximum width for resize */
  maxWidth?: number;
  /** Whether the palette is collapsed (controlled mode if onCollapsedChange provided) */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Width of collapsed state */
  collapsedWidth?: number;
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
  width: controlledWidth = 280,
  onWidthChange,
  minWidth = 200,
  maxWidth = 450,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  collapsedWidth = 48,
}: CreativePaletteProps) {
  const [activeTab, setActiveTab] = useState<PaletteTab>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Internal state for uncontrolled mode
  const [internalWidth, setInternalWidth] = useState(controlledWidth);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Determine if using controlled mode
  const isWidthControlled = onWidthChange !== undefined;
  const isCollapsedControlled = onCollapsedChange !== undefined;

  // Get actual values (controlled or internal)
  const currentWidth = isWidthControlled ? controlledWidth : internalWidth;
  const isCollapsed = isCollapsedControlled ? (controlledCollapsed ?? false) : internalCollapsed;

  // Resize handling
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(currentWidth);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = currentWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [currentWidth, isCollapsed]);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      const delta = e.clientX - startX.current;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth.current + delta));

      if (isWidthControlled) {
        onWidthChange?.(newWidth);
      } else {
        setInternalWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minWidth, maxWidth, isWidthControlled, onWidthChange]);

  // Handle collapse toggle
  const handleCollapseToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    if (isCollapsedControlled) {
      onCollapsedChange?.(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  }, [isCollapsed, isCollapsedControlled, onCollapsedChange]);

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

  // Calculate actual display width
  const displayWidth = isCollapsed ? collapsedWidth : currentWidth;

  return (
    <Box
      sx={{
        width: displayWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        position: 'relative',
        transition: isResizing.current ? 'none' : 'width 200ms ease',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: isCollapsed ? 0.5 : 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: 1,
          minHeight: 48,
        }}
      >
        {!isCollapsed && (
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
            Creative Palette
          </Typography>
        )}
        <Tooltip title={isCollapsed ? 'Expand Palette' : 'Collapse Palette'}>
          <IconButton
            size="small"
            onClick={handleCollapseToggle}
            sx={{
              color: darkNeutrals.textSecondary,
              '&:hover': {
                color: brandColors.tealPulse,
                bgcolor: alpha(brandColors.tealPulse, 0.1),
              },
            }}
          >
            {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Collapsed State - Vertical Icon Bar */}
      {isCollapsed && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            py: 2,
          }}
        >
          <Tooltip title="Create" placement="right">
            <IconButton
              size="small"
              onClick={() => {
                handleCollapseToggle();
                setActiveTab('create');
              }}
              sx={{
                color: activeTab === 'create' ? brandColors.tealPulse : darkNeutrals.textSecondary,
                '&:hover': { bgcolor: alpha(brandColors.tealPulse, 0.1) },
              }}
            >
              <CreateIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Style" placement="right">
            <IconButton
              size="small"
              onClick={() => {
                handleCollapseToggle();
                setActiveTab('style');
              }}
              sx={{
                color: activeTab === 'style' ? brandColors.tealPulse : darkNeutrals.textSecondary,
                '&:hover': { bgcolor: alpha(brandColors.tealPulse, 0.1) },
              }}
            >
              <StyleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Assets" placement="right">
            <IconButton
              size="small"
              onClick={() => {
                handleCollapseToggle();
                setActiveTab('assets');
              }}
              sx={{
                color: activeTab === 'assets' ? brandColors.tealPulse : darkNeutrals.textSecondary,
                '&:hover': { bgcolor: alpha(brandColors.tealPulse, 0.1) },
              }}
            >
              <AssetsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Expanded Content */}
      {!isCollapsed && (
        <>
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
        </>
      )}

      {/* Resize Handle - Only show when expanded */}
      {!isCollapsed && (
        <Box
          onMouseDown={handleResizeStart}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 6,
            cursor: 'ew-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'transparent',
            transition: 'background-color 150ms ease',
            '&:hover': {
              bgcolor: alpha(brandColors.tealPulse, 0.15),
            },
            '&:hover .resize-indicator': {
              opacity: 1,
            },
          }}
        >
          <Box
            className="resize-indicator"
            sx={{
              width: 2,
              height: 32,
              borderRadius: 1,
              bgcolor: brandColors.tealPulse,
              opacity: 0,
              transition: 'opacity 150ms ease',
            }}
          />
        </Box>
      )}
    </Box>
  );
});

export default CreativePalette;
