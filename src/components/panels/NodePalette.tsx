/**
 * Node Palette - Left sidebar with draggable nodes and category-specific tools
 * Synthesizes node definitions with fashion swatches, African textiles, and creative tools
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Badge,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Avatar,
  CircularProgress,
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
  Palette as PaletteIcon,
  AutoAwesome as CompositeIcon,
  Output as OutputIcon,
  DragIndicator as DragIcon,
  Star as StarIcon,
  Texture as TextureIcon,
  GridView as GridViewIcon,
  Style as StyleIcon,
  FormatColorFill as ColorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { nodeDefinitions, nodeCategories } from '@/config/nodeDefinitions';
import type { BoardCategory, NodeDefinition, NodeParameter } from '@/models/canvas';
import {
  getToolbarConfig,
  type ToolDefinition,
  type ToolbarItem,
  type ColorSwatch,
  type AfricanTextile,
  type AdinkraSymbol,
  type AfricanGarment,
} from '@/services/canvasToolbarService';
import { focusRing, timing, easing } from '@/styles/microInteractions';
import { brandColors, darkNeutrals } from '@/theme';

// ===== Types =====

interface NodePaletteProps {
  boardCategory?: BoardCategory | null;
  onClose?: () => void;
  width?: number;
}

type PaletteTab = 'nodes' | 'tools';

// ===== Category Icons =====

const categoryIcons: Record<string, React.ReactNode> = {
  input: <InputIcon />,
  imageGen: <ImageIcon />,
  videoGen: <VideoIcon />,
  threeD: <ThreeDIcon />,
  character: <CharacterIcon />,
  style: <PaletteIcon />,
  composite: <CompositeIcon />,
  output: <OutputIcon />,
};

const toolIcons: Record<string, React.ReactNode> = {
  'fabric-swatch': <TextureIcon />,
  'color-palette': <ColorIcon />,
  'pattern-library': <GridViewIcon />,
  'style-preset': <StyleIcon />,
  'african-textile': <TextureIcon />,
  'adinkra-symbol': <CompositeIcon />,
  'african-color': <ColorIcon />,
  'african-garment': <StyleIcon />,
  'prompt-agents': <CompositeIcon />,
};

// ===== Component =====

export function NodePalette({ boardCategory, onClose, width = 300 }: NodePaletteProps) {
  // State
  const [activeTab, setActiveTab] = useState<PaletteTab>('nodes');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['input', 'imageGen']);
  const [expandedTools, setExpandedTools] = useState<string[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);

  // Load category-specific tools when board category changes
  useEffect(() => {
    if (boardCategory) {
      setLoadingTools(true);
      getToolbarConfig(boardCategory)
        .then(config => {
          setTools(config.tools);
          // Auto-expand first tool
          if (config.tools.length > 0) {
            setExpandedTools([config.tools[0].id]);
          }
        })
        .finally(() => setLoadingTools(false));
    } else {
      setTools([]);
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

  // Toggle tool expansion
  const toggleTool = useCallback((toolId: string) => {
    setExpandedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  }, []);

  // Filter nodes by search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodeDefinitions;
    const query = searchQuery.toLowerCase();
    return nodeDefinitions.filter(
      node =>
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Filter tools by search query
  const filteredTools = useMemo(() => {
    if (!searchQuery) return tools;
    const query = searchQuery.toLowerCase();
    return tools.map(tool => ({
      ...tool,
      items: tool.items.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          item.promptKeywords?.some(kw => kw.toLowerCase().includes(query))
      ),
    })).filter(tool => tool.items.length > 0);
  }, [searchQuery, tools]);

  // Drag start handler for nodes
  const handleNodeDragStart = useCallback(
    (event: React.DragEvent, node: NodeDefinition) => {
      const nodeData = {
        nodeType: node.type,
        category: node.category,
        label: node.label,
        inputs: node.inputs,
        outputs: node.outputs,
        parameters: node.parameters.reduce<Record<string, unknown>>(
          (acc, param: NodeParameter) => ({
            ...acc,
            [param.id]: param.default,
          }),
          {}
        ),
        status: 'idle',
      };

      event.dataTransfer.setData('application/reactflow', 'canvasNode');
      event.dataTransfer.setData('nodeData', JSON.stringify(nodeData));
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  // Drag start handler for swatch/tool items
  const handleSwatchDragStart = useCallback(
    (event: React.DragEvent, item: ToolbarItem, toolType: string) => {
      const swatchData = {
        type: 'swatch',
        swatchType: item.type,
        toolType,
        item,
        promptKeywords: item.promptKeywords,
      };

      event.dataTransfer.setData('application/swatch', JSON.stringify(swatchData));
      event.dataTransfer.effectAllowed = 'copy';
    },
    []
  );

  // Render color swatch
  const renderColorSwatch = (item: ColorSwatch) => (
    <Tooltip title={`${item.name} - ${item.hex}`} key={item.id}>
      <Box
        draggable
        onDragStart={(e) => handleSwatchDragStart(e, item, 'color')}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          backgroundColor: item.hex,
          border: '2px solid',
          borderColor: 'divider',
          cursor: 'grab',
          transition: 'transform 0.2s, box-shadow 0.2s',
          position: 'relative',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: 2,
            zIndex: 1,
          },
          '&:active': { cursor: 'grabbing' },
        }}
      >
        {item.isPremium && (
          <StarIcon
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              fontSize: 14,
              color: 'warning.main',
            }}
          />
        )}
      </Box>
    </Tooltip>
  );

  // Render African textile item
  const renderAfricanTextile = (item: AfricanTextile) => (
    <Box
      key={item.id}
      draggable
      onDragStart={(e) => handleSwatchDragStart(e, item, 'african-textile')}
      sx={{
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'grab',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: alpha('#000', 0.02),
        },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
          {item.colors.slice(0, 4).map((color, idx) => (
            <Box
              key={idx}
              sx={{
                width: 12,
                height: 24,
                backgroundColor: color,
                borderRadius: idx === 0 ? '4px 0 0 4px' : idx === 3 ? '0 4px 4px 0' : 0,
              }}
            />
          ))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {item.name}
            </Typography>
            {item.isPremium && <StarIcon sx={{ fontSize: 12, color: 'warning.main' }} />}
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.country} - {item.technique}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Render Adinkra symbol
  const renderAdinkraSymbol = (item: AdinkraSymbol) => (
    <Box
      key={item.id}
      draggable
      onDragStart={(e) => handleSwatchDragStart(e, item, 'adinkra-symbol')}
      sx={{
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'grab',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: alpha('#000', 0.02),
        },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'grey.900',
            color: 'warning.main',
            fontSize: '0.75rem',
          }}
        >
          {item.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.meaning.substring(0, 30)}...
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Render African garment
  const renderAfricanGarment = (item: AfricanGarment) => (
    <Box
      key={item.id}
      draggable
      onDragStart={(e) => handleSwatchDragStart(e, item, 'african-garment')}
      sx={{
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'grab',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: alpha('#000', 0.02),
        },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: item.isPremium ? 'warning.light' : 'primary.light',
            fontSize: '0.75rem',
          }}
        >
          <StyleIcon fontSize="small" />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontWeight={500} noWrap>
              {item.name}
            </Typography>
            {item.isPremium && <StarIcon sx={{ fontSize: 12, color: 'warning.main' }} />}
          </Box>
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.region.replace('-', ' ')} - {item.occasion}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Render generic item
  const renderGenericItem = (item: ToolbarItem, toolType: string) => (
    <Box
      key={item.id}
      draggable
      onDragStart={(e) => handleSwatchDragStart(e, item, toolType)}
      sx={{
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'grab',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: alpha('#000', 0.02),
        },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {item.isPremium && <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />}
        <Typography variant="body2" fontWeight={500} noWrap>
          {item.name}
        </Typography>
      </Box>
      {item.description && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.description.substring(0, 40)}...
        </Typography>
      )}
    </Box>
  );

  // Render tool items based on type
  const renderToolItems = (tool: ToolDefinition) => {
    const items = tool.items;

    // For color-based tools, render as a grid of swatches
    if (tool.type === 'color-palette' || tool.type === 'african-color') {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1 }}>
          {items.map(item => renderColorSwatch(item as ColorSwatch))}
        </Box>
      );
    }

    // For African textiles
    if (tool.type === 'african-textile') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1 }}>
          {items.map(item => renderAfricanTextile(item as AfricanTextile))}
        </Box>
      );
    }

    // For Adinkra symbols
    if (tool.type === 'adinkra-symbol') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1 }}>
          {items.map(item => renderAdinkraSymbol(item as AdinkraSymbol))}
        </Box>
      );
    }

    // For African garments
    if (tool.type === 'african-garment') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1 }}>
          {items.map(item => renderAfricanGarment(item as AfricanGarment))}
        </Box>
      );
    }

    // Generic items
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 1 }}>
        {items.map(item => renderGenericItem(item, tool.type))}
      </Box>
    );
  };

  // Render nodes tab
  const renderNodesTab = () => (
    <Box sx={{ flex: 1, overflow: 'auto' }}>
      <List disablePadding>
        {nodeCategories.map(category => {
          const categoryNodes = filteredNodes.filter(node => node.category === category.id);
          if (searchQuery && categoryNodes.length === 0) return null;

          return (
            <Box key={category.id}>
              <ListItemButton
                onClick={() => toggleCategory(category.id)}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha(category.color, 0.1),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: category.color }}>
                  {categoryIcons[category.id]}
                </ListItemIcon>
                <ListItemText
                  primary={category.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                />
                <Badge
                  badgeContent={categoryNodes.length}
                  color="default"
                  sx={{ mr: 1, '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                />
                {expandedCategories.includes(category.id) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={expandedCategories.includes(category.id) || !!searchQuery} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {categoryNodes.map((node, index) => (
                    <ListItem
                      key={node.type}
                      disablePadding
                      draggable
                      onDragStart={(e) => handleNodeDragStart(e, node)}
                      sx={{
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                        // Staggered entrance animation
                        animation: `fadeInUp ${timing.standard}ms ${easing.decelerate}`,
                        animationDelay: `${index * 30}ms`,
                        animationFillMode: 'backwards',
                        '@keyframes fadeInUp': {
                          from: { opacity: 0, transform: 'translateY(8px)' },
                          to: { opacity: 1, transform: 'translateY(0)' },
                        },
                      }}
                    >
                      <ListItemButton
                        sx={{
                          pl: 4,
                          py: 0.75,
                          borderLeft: '3px solid transparent',
                          transition: `all ${timing.fast}ms ${easing.smooth}`,
                          ...focusRing,
                          '&:hover': {
                            backgroundColor: alpha(category.color, 0.1),
                            borderLeftColor: category.color,
                            pl: 3.625, // Compensate for border
                            '& .drag-icon': {
                              color: category.color,
                            },
                            '& .node-dot': {
                              transform: 'scale(1.2)',
                            },
                          },
                          '&:active': {
                            backgroundColor: alpha(category.color, 0.15),
                          },
                        }}
                      >
                        <DragIcon className="drag-icon" sx={{ fontSize: 16, mr: 0.5, color: 'text.disabled', transition: `color ${timing.fast}ms` }} />
                        <Box
                          className="node-dot"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: category.color,
                            mr: 1.5,
                            transition: `transform ${timing.fast}ms ${easing.smooth}`,
                          }}
                        />
                        <ListItemText
                          primary={node.label}
                          secondary={node.description}
                          primaryTypographyProps={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.7rem',
                            noWrap: true,
                            sx: { color: darkNeutrals.textTertiary },
                          }}
                        />
                        {node.aiModel && (
                          <Chip
                            label="AI"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              ml: 0.5,
                              bgcolor: alpha(brandColors.tealPulse, 0.15),
                              color: brandColors.tealPulse,
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </Box>
  );

  // Render tools tab
  const renderToolsTab = () => {
    if (!boardCategory) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Select a board to see category-specific tools
          </Typography>
        </Box>
      );
    }

    if (loadingTools) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading tools...
          </Typography>
        </Box>
      );
    }

    if (filteredTools.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'No matching tools found' : 'No tools available for this category'}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List disablePadding>
          {filteredTools.map(tool => (
            <Box key={tool.id}>
              <ListItemButton
                onClick={() => toggleTool(tool.id)}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#3b82f6', 0.1),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  {toolIcons[tool.type] || <PaletteIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={tool.name}
                  secondary={tool.description}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.7rem', noWrap: true }}
                />
                <Badge
                  badgeContent={tool.items.length}
                  color="primary"
                  sx={{ mr: 1, '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                />
                {expandedTools.includes(tool.id) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={expandedTools.includes(tool.id)} timeout="auto" unmountOnExit>
                {renderToolItems(tool)}
              </Collapse>
            </Box>
          ))}
        </List>
      </Box>
    );
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
      }}
    >
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Node Palette
          </Typography>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <TextField
          size="small"
          fullWidth
          placeholder="Search nodes & tools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        variant="fullWidth"
        sx={{ minHeight: 40, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab
          label="Nodes"
          value="nodes"
          sx={{ minHeight: 40, fontSize: '0.8125rem' }}
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Tools
              {boardCategory && (
                <Chip
                  label={boardCategory}
                  size="small"
                  sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize' }}
                />
              )}
            </Box>
          }
          value="tools"
          sx={{ minHeight: 40, fontSize: '0.8125rem' }}
        />
      </Tabs>

      {/* Content */}
      {activeTab === 'nodes' ? renderNodesTab() : renderToolsTab()}

      {/* Footer hint */}
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Drag items onto the canvas
        </Typography>
      </Box>
    </Box>
  );
}

export default NodePalette;
