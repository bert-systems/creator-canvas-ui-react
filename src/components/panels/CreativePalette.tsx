/**
 * Creative Palette v4.0
 *
 * Redesigned left sidebar with vertical-first UX for the UnifiedNode system.
 *
 * Features:
 * - Vertical-first layout (no horizontal scrolling)
 * - Category quick-access buttons at top
 * - Compact node list with search
 * - Recently used and favorites sections
 * - Drag-and-drop to canvas
 * - Category-aware toolbar items
 *
 * @module CreativePalette
 * @version 4.0
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  Collapse,
  Chip,
  Tooltip,
  IconButton,
  Divider,
  Button,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandLess,
  ExpandMore,
  Input as InputIcon,
  Image as ImageIcon,
  Videocam as VideoIcon,
  ViewInAr as ThreeDIcon,
  Person as CharacterIcon,
  Palette as StyleIcon,
  AutoAwesome as CompositeIcon,
  Output as OutputIcon,
  DragIndicator as DragIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  History as RecentIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  Checkroom as FashionIcon,
  MenuBook as NarrativeIcon,
  Brush as CreativeIcon,
} from '@mui/icons-material';
import { nodeDefinitions, nodeCategories, getNodeDefinition } from '@/config/nodeDefinitions';
import type { BoardCategory, NodeDefinition, NodeCategory, NodeType } from '@/models/canvas';
import type { DisplayMode } from '@/models/unifiedNode';
import { getDefaultSlotConfig } from '@/models/unifiedNode';
import { toolbarService } from '@/services/toolbarService';
import type { CategoryToolbar, ToolbarAction } from '@/models/unifiedNode';
import { brandColors, categoryColors } from '@/theme';

// ============================================================================
// TYPES
// ============================================================================

interface CreativePaletteProps {
  boardCategory?: BoardCategory | null;
  onClose?: () => void;
  width?: number;
  onNodeDrag?: (nodeType: NodeType, category: NodeCategory) => void;
  onToolbarAction?: (action: ToolbarAction) => void;
}

interface RecentNode {
  nodeType: NodeType;
  label: string;
  timestamp: number;
}

// ============================================================================
// CATEGORY ICONS
// ============================================================================

const categoryIcons: Record<string, React.ReactNode> = {
  input: <InputIcon fontSize="small" />,
  imageGen: <ImageIcon fontSize="small" />,
  videoGen: <VideoIcon fontSize="small" />,
  threeD: <ThreeDIcon fontSize="small" />,
  character: <CharacterIcon fontSize="small" />,
  style: <StyleIcon fontSize="small" />,
  composite: <CompositeIcon fontSize="small" />,
  output: <OutputIcon fontSize="small" />,
  fashion: <FashionIcon fontSize="small" />,
  narrative: <NarrativeIcon fontSize="small" />,
  creative: <CreativeIcon fontSize="small" />,
};

const getCategoryIcon = (categoryId: string): React.ReactNode => {
  return categoryIcons[categoryId] || <CategoryIcon fontSize="small" />;
};

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const FAVORITES_KEY = 'creative-palette-favorites';
const RECENT_KEY = 'creative-palette-recent';
const MAX_RECENT = 10;

function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore localStorage errors
  }
}

function getRecentNodes(): RecentNode[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentNode(nodeType: NodeType, label: string): void {
  try {
    const recent = getRecentNodes().filter(r => r.nodeType !== nodeType);
    recent.unshift({ nodeType, label, timestamp: Date.now() });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // Ignore localStorage errors
  }
}

// ============================================================================
// NODE ITEM COMPONENT
// ============================================================================

interface NodeItemProps {
  node: NodeDefinition;
  isFavorite: boolean;
  onFavoriteToggle: (nodeType: string) => void;
  onDragStart: (event: React.DragEvent, node: NodeDefinition) => void;
  categoryColor: string;
}

const NodeItem = memo<NodeItemProps>(({ node, isFavorite, onFavoriteToggle, onDragStart, categoryColor }) => (
  <ListItemButton
    draggable
    onDragStart={(e) => onDragStart(e, node)}
    sx={{
      py: 0.75,
      px: 1.5,
      gap: 1,
      cursor: 'grab',
      borderLeft: '3px solid transparent',
      transition: 'all 0.15s ease',
      '&:hover': {
        backgroundColor: alpha(categoryColor, 0.1),
        borderLeftColor: categoryColor,
        '& .favorite-btn': {
          opacity: 1,
        },
      },
      '&:active': {
        cursor: 'grabbing',
      },
    }}
  >
    <DragIcon sx={{ fontSize: 14, color: 'text.disabled' }} />

    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: categoryColor,
        flexShrink: 0,
      }}
    />

    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="body2"
        fontWeight={500}
        noWrap
        sx={{ fontSize: '0.8125rem' }}
      >
        {node.label}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        sx={{ fontSize: '0.7rem', display: 'block' }}
      >
        {node.description}
      </Typography>
    </Box>

    {node.aiModel && (
      <Chip
        label="AI"
        size="small"
        sx={{
          height: 16,
          fontSize: '0.6rem',
          bgcolor: alpha(brandColors.tealPulse, 0.15),
          color: brandColors.tealPulse,
          fontWeight: 600,
        }}
      />
    )}

    <IconButton
      className="favorite-btn"
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onFavoriteToggle(node.type);
      }}
      sx={{
        p: 0.25,
        opacity: isFavorite ? 1 : 0,
        transition: 'opacity 0.15s',
      }}
    >
      {isFavorite ? (
        <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
      ) : (
        <StarBorderIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
      )}
    </IconButton>
  </ListItemButton>
));

NodeItem.displayName = 'NodeItem';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CreativePalette = memo<CreativePaletteProps>(({
  boardCategory,
  onClose,
  width = 280,
  onToolbarAction,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['input', 'imageGen']);
  const [favorites, setFavoritesState] = useState<string[]>(() => getFavorites());
  const [recentNodes, setRecentNodes] = useState<RecentNode[]>(() => getRecentNodes());
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [toolbar, setToolbar] = useState<CategoryToolbar | null>(null);
  const [loadingToolbar, setLoadingToolbar] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Load category-specific toolbar
  useEffect(() => {
    if (boardCategory) {
      setLoadingToolbar(true);
      toolbarService.getToolbarByCategory(boardCategory)
        .then(setToolbar)
        .catch(() => setToolbar(null))
        .finally(() => setLoadingToolbar(false));
    } else {
      setToolbar(null);
    }
  }, [boardCategory]);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((nodeType: string) => {
    setFavoritesState(prev => {
      const next = prev.includes(nodeType)
        ? prev.filter(f => f !== nodeType)
        : [...prev, nodeType];
      setFavorites(next);
      return next;
    });
  }, []);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    let nodes = nodeDefinitions;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(
        node =>
          node.label.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query) ||
          node.category.toLowerCase().includes(query)
      );
    }

    // Filter by selected category
    if (selectedCategoryFilter) {
      nodes = nodes.filter(node => node.category === selectedCategoryFilter);
    }

    return nodes;
  }, [searchQuery, selectedCategoryFilter]);

  // Get favorite nodes
  const favoriteNodes = useMemo(() => {
    return nodeDefinitions.filter(node => favorites.includes(node.type));
  }, [favorites]);

  // Get recent node definitions
  const recentNodeDefs = useMemo(() => {
    return recentNodes
      .map(r => nodeDefinitions.find(n => n.type === r.nodeType))
      .filter((n): n is NodeDefinition => n !== undefined);
  }, [recentNodes]);

  // Drag start handler
  const handleNodeDragStart = useCallback((event: React.DragEvent, node: NodeDefinition) => {
    // Create UnifiedNode-compatible data
    const nodeData = {
      nodeType: node.type,
      category: node.category,
      label: node.label,
      displayMode: 'standard' as DisplayMode,
      inputs: node.inputs?.map(p => ({
        ...p,
        required: p.required ?? false,
        multi: p.multiple ?? false,
      })) || [],
      outputs: node.outputs?.map(p => ({
        ...p,
        required: p.required ?? false,
        multi: p.multiple ?? false,
      })) || [],
      parameters: node.parameters?.reduce<Record<string, unknown>>(
        (acc, param) => ({
          ...acc,
          [param.id]: param.default,
        }),
        {}
      ) || {},
      status: 'idle',
      aiModel: node.aiModel,
      slots: getDefaultSlotConfig(node.category as NodeCategory),
    };

    // Use unifiedNode type for new nodes
    event.dataTransfer.setData('application/reactflow', 'unifiedNode');
    event.dataTransfer.setData('nodeData', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';

    // Track as recent
    addRecentNode(node.type, node.label);
    setRecentNodes(getRecentNodes());
  }, []);

  // Handle toolbar action click
  const handleToolbarAction = useCallback((action: ToolbarAction) => {
    if (onToolbarAction) {
      onToolbarAction(action);
    } else {
      // Default behavior: create node at center of viewport
      const nodeDef = getNodeDefinition(action.nodeType);
      if (nodeDef) {
        const event = new CustomEvent('createNode', {
          detail: {
            nodeType: action.nodeType,
            label: nodeDef.label,
          }
        });
        window.dispatchEvent(event);
      }
    }
  }, [onToolbarAction]);

  // Get category color
  const getCategoryColor = (categoryId: string): string => {
    const cat = categoryColors[categoryId as keyof typeof categoryColors];
    return cat?.main || categoryColors.imageGen.main;
  };

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
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Creative Palette
          </Typography>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Search */}
        <TextField
          size="small"
          fullWidth
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'action.hover',
              '& fieldset': { border: 'none' },
            },
          }}
        />
      </Box>

      {/* Category-Specific Quick Actions (Toolbar) */}
      {boardCategory && !loadingToolbar && toolbar && toolbar.actions.length > 0 && (
        <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {toolbar.actions.slice(0, 8).map((action) => (
              <Tooltip key={action.id} title={action.tooltip} arrow>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleToolbarAction(action)}
                  startIcon={<span style={{ fontSize: '1rem' }}>{action.icon}</span>}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    py: 0.25,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {action.label}
                </Button>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}

      {/* Category Quick Filter */}
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          <Chip
            label="All"
            size="small"
            variant={selectedCategoryFilter === null ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategoryFilter(null)}
            sx={{
              height: 24,
              fontSize: '0.7rem',
              bgcolor: selectedCategoryFilter === null ? 'primary.main' : 'transparent',
              color: selectedCategoryFilter === null ? 'primary.contrastText' : 'text.primary',
            }}
          />
          {nodeCategories.slice(0, 6).map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              size="small"
              variant={selectedCategoryFilter === cat.id ? 'filled' : 'outlined'}
              icon={getCategoryIcon(cat.id) as React.ReactElement}
              onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.id ? null : cat.id)}
              sx={{
                height: 24,
                fontSize: '0.65rem',
                bgcolor: selectedCategoryFilter === cat.id ? cat.color : 'transparent',
                color: selectedCategoryFilter === cat.id ? '#fff' : 'text.primary',
                borderColor: selectedCategoryFilter === cat.id ? cat.color : 'divider',
                '& .MuiChip-icon': {
                  color: selectedCategoryFilter === cat.id ? '#fff' : cat.color,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Favorites & Recent Toggles */}
      <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Button
          size="small"
          startIcon={<StarIcon sx={{ fontSize: 14 }} />}
          onClick={() => setShowFavorites(!showFavorites)}
          sx={{
            flex: 1,
            py: 0.5,
            fontSize: '0.7rem',
            textTransform: 'none',
            color: showFavorites ? 'warning.main' : 'text.secondary',
            bgcolor: showFavorites ? alpha('#F59E0B', 0.1) : 'transparent',
            borderRadius: 0,
          }}
        >
          Favorites ({favoriteNodes.length})
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          size="small"
          startIcon={<RecentIcon sx={{ fontSize: 14 }} />}
          onClick={() => setShowRecent(!showRecent)}
          sx={{
            flex: 1,
            py: 0.5,
            fontSize: '0.7rem',
            textTransform: 'none',
            color: showRecent ? 'primary.main' : 'text.secondary',
            bgcolor: showRecent ? alpha(brandColors.tealPulse, 0.1) : 'transparent',
            borderRadius: 0,
          }}
        >
          Recent ({recentNodeDefs.length})
        </Button>
      </Box>

      {/* Favorites Section */}
      <Collapse in={showFavorites}>
        <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: alpha('#F59E0B', 0.05) }}>
          {favoriteNodes.length === 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', p: 2, textAlign: 'center' }}
            >
              No favorites yet. Star nodes to add them here.
            </Typography>
          ) : (
            <List disablePadding dense>
              {favoriteNodes.map((node) => (
                <NodeItem
                  key={node.type}
                  node={node}
                  isFavorite={true}
                  onFavoriteToggle={toggleFavorite}
                  onDragStart={handleNodeDragStart}
                  categoryColor={getCategoryColor(node.category)}
                />
              ))}
            </List>
          )}
        </Box>
        <Divider />
      </Collapse>

      {/* Recent Section */}
      <Collapse in={showRecent}>
        <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: alpha(brandColors.tealPulse, 0.05) }}>
          {recentNodeDefs.length === 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', p: 2, textAlign: 'center' }}
            >
              No recent nodes yet. Drag nodes to add them here.
            </Typography>
          ) : (
            <List disablePadding dense>
              {recentNodeDefs.map((node) => (
                <NodeItem
                  key={`recent-${node.type}`}
                  node={node}
                  isFavorite={favorites.includes(node.type)}
                  onFavoriteToggle={toggleFavorite}
                  onDragStart={handleNodeDragStart}
                  categoryColor={getCategoryColor(node.category)}
                />
              ))}
            </List>
          )}
        </Box>
        <Divider />
      </Collapse>

      {/* Main Node List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {selectedCategoryFilter ? (
          // Flat list when category is selected
          <List disablePadding dense>
            {filteredNodes.map((node) => (
              <NodeItem
                key={node.type}
                node={node}
                isFavorite={favorites.includes(node.type)}
                onFavoriteToggle={toggleFavorite}
                onDragStart={handleNodeDragStart}
                categoryColor={getCategoryColor(node.category)}
              />
            ))}
          </List>
        ) : (
          // Grouped by category
          <List disablePadding>
            {nodeCategories.map((category) => {
              const categoryNodes = filteredNodes.filter(node => node.category === category.id);
              if (searchQuery && categoryNodes.length === 0) return null;

              return (
                <Box key={category.id}>
                  <ListItemButton
                    onClick={() => toggleCategory(category.id)}
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      gap: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: expandedCategories.includes(category.id)
                        ? alpha(category.color, 0.05)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(category.color, 0.1),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(category.color, 0.15),
                        color: category.color,
                      }}
                    >
                      {getCategoryIcon(category.id)}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ flex: 1, fontSize: '0.8125rem' }}
                    >
                      {category.label}
                    </Typography>
                    <Chip
                      label={categoryNodes.length}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        bgcolor: alpha(category.color, 0.15),
                        color: category.color,
                      }}
                    />
                    {expandedCategories.includes(category.id) ? (
                      <ExpandLess sx={{ fontSize: 18, color: 'text.secondary' }} />
                    ) : (
                      <ExpandMore sx={{ fontSize: 18, color: 'text.secondary' }} />
                    )}
                  </ListItemButton>

                  <Collapse
                    in={expandedCategories.includes(category.id) || !!searchQuery}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List disablePadding dense>
                      {categoryNodes.map((node) => (
                        <NodeItem
                          key={node.type}
                          node={node}
                          isFavorite={favorites.includes(node.type)}
                          onFavoriteToggle={toggleFavorite}
                          onDragStart={handleNodeDragStart}
                          categoryColor={category.color}
                        />
                      ))}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Drag nodes onto the canvas • Double-click to expand
        </Typography>
      </Box>
    </Box>
  );
});

CreativePalette.displayName = 'CreativePalette';

export default CreativePalette;
