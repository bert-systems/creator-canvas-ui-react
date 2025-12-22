/**
 * CreateTab Component
 *
 * The CREATE tab organized by creative intent rather than technical models.
 * Features:
 * - Trending section with popular workflows
 * - Intent-based categories (Images, Videos, Fashion, 3D, Storytelling, Utilities)
 * - Subcategories with specific node types
 * - Drag-to-canvas functionality
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
  alpha,
  Badge,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  DragIndicator as DragIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import { nodeDefinitions } from '../../config/nodeDefinitions';
import { creativeCardTokens } from '../../theme';
import {
  INTENT_CATEGORIES,
  TRENDING_ITEMS,
  type IntentCategory,
  type IntentSubcategory,
  type TrendingItem,
} from './paletteData';

// ============================================================================
// TYPES
// ============================================================================

interface CreateTabProps {
  onDragStart?: (nodeType: string, event: React.DragEvent) => void;
  searchQuery?: string;
}

// ============================================================================
// TRENDING ITEM CARD
// ============================================================================

interface TrendingCardProps {
  item: TrendingItem;
  onDragStart?: (nodeType: string, event: React.DragEvent) => void;
}

const TrendingCard = memo(function TrendingCard({
  item,
  onDragStart,
}: TrendingCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // Look up the full node definition
    const node = nodeDefinitions.find((n) => n.type === item.nodeType);

    if (node) {
      // Build the full nodeData object that the canvas expects
      const nodeData = {
        nodeType: node.type,
        category: node.category,
        label: node.label,
        inputs: node.inputs,
        outputs: node.outputs,
        parameters: node.parameters.reduce<Record<string, unknown>>(
          (acc, param) => ({
            ...acc,
            [param.id]: param.default,
          }),
          {}
        ),
        status: 'idle',
      };

      // Set the data in the format the canvas expects
      e.dataTransfer.setData('application/reactflow', 'canvasNode');
      e.dataTransfer.setData('nodeData', JSON.stringify(nodeData));
      e.dataTransfer.effectAllowed = 'move';
    }

    onDragStart?.(item.nodeType, e);
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      sx={{
        width: 100,
        flexShrink: 0,
        cursor: 'grab',
        borderRadius: `${creativeCardTokens.radius.inner}px`,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: 70,
          bgcolor: alpha('#6366f1', 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Placeholder for image */}
        <Typography sx={{ fontSize: '2rem' }}>
          {item.nodeType.includes('video') || item.nodeType.includes('veo') || item.nodeType.includes('kling')
            ? '🎬'
            : item.nodeType.includes('3d') || item.nodeType.includes('mesh') || item.nodeType.includes('tripo')
            ? '🧊'
            : item.nodeType.includes('tryOn') || item.nodeType.includes('fashion')
            ? '👗'
            : '📸'}
        </Typography>

        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
          {item.isNew && (
            <Chip
              label="NEW"
              size="small"
              sx={{
                height: 16,
                fontSize: '0.6rem',
                bgcolor: 'success.main',
                color: 'white',
              }}
            />
          )}
          {item.isPremium && (
            <PremiumIcon sx={{ fontSize: 14, color: 'warning.main' }} />
          )}
        </Box>
      </Box>

      {/* Label */}
      <Box sx={{ p: 0.75, textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            display: 'block',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {item.name}
        </Typography>
      </Box>
    </Box>
  );
});

// ============================================================================
// INTENT CATEGORY
// ============================================================================

interface IntentCategoryItemProps {
  category: IntentCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onDragStart?: (nodeType: string, event: React.DragEvent) => void;
  searchQuery?: string;
}

const IntentCategoryItem = memo(function IntentCategoryItem({
  category,
  isExpanded,
  onToggle,
  onDragStart,
  searchQuery,
}: IntentCategoryItemProps) {
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  // Filter subcategories based on search
  const filteredSubcategories = searchQuery
    ? category.subcategories.filter((sub) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.nodeTypes.some((nt) => nt.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : category.subcategories;

  if (searchQuery && filteredSubcategories.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* Category Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          cursor: 'pointer',
          borderRadius: `${creativeCardTokens.radius.button}px`,
          '&:hover': {
            bgcolor: alpha(category.color, 0.1),
          },
        }}
      >
        <Typography sx={{ fontSize: '1.25rem' }}>{category.emoji}</Typography>
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          {category.name}
        </Typography>
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Subcategories */}
      <Collapse in={isExpanded || !!searchQuery}>
        <Box sx={{ pl: 2, pr: 1, pb: 1 }}>
          {filteredSubcategories.map((sub) => (
            <SubcategoryItem
              key={sub.id}
              subcategory={sub}
              categoryColor={category.color}
              isExpanded={expandedSub === sub.id}
              onToggle={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
              onDragStart={onDragStart}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
});

// ============================================================================
// SUBCATEGORY ITEM
// ============================================================================

interface SubcategoryItemProps {
  subcategory: IntentSubcategory;
  categoryColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDragStart?: (nodeType: string, event: React.DragEvent) => void;
}

const SubcategoryItem = memo(function SubcategoryItem({
  subcategory,
  categoryColor,
  isExpanded,
  onToggle,
  onDragStart,
}: SubcategoryItemProps) {
  const nodes = subcategory.nodeTypes
    .map((nt) => nodeDefinitions.find((n) => n.type === nt))
    .filter(Boolean);

  if (nodes.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.75,
          pl: 1,
          opacity: 0.5,
        }}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>{subcategory.emoji}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subcategory.name}
        </Typography>
        <Chip label="Coming Soon" size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Subcategory Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 0.75,
          pl: 1,
          cursor: 'pointer',
          borderRadius: `${creativeCardTokens.radius.button}px`,
          '&:hover': {
            bgcolor: alpha(categoryColor, 0.05),
          },
        }}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>{subcategory.emoji}</Typography>
        <Typography variant="body2" sx={{ flex: 1 }}>
          {subcategory.name}
        </Typography>
        <Badge badgeContent={nodes.length} color="primary" sx={{ mr: 1 }} />
        <IconButton size="small" sx={{ p: 0 }}>
          {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>

      {/* Node List */}
      <Collapse in={isExpanded}>
        <Box sx={{ pl: 3, py: 0.5 }}>
          {nodes.map((node) => (
            <NodeItem
              key={node!.type}
              node={node!}
              color={categoryColor}
              onDragStart={onDragStart}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
});

// ============================================================================
// NODE ITEM
// ============================================================================

interface NodeItemProps {
  node: typeof nodeDefinitions[0];
  color: string;
  onDragStart?: (nodeType: string, event: React.DragEvent) => void;
}

const NodeItem = memo(function NodeItem({
  node,
  color,
  onDragStart,
}: NodeItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // Build the full nodeData object that the canvas expects
    const nodeData = {
      nodeType: node.type,
      category: node.category,
      label: node.label,
      inputs: node.inputs,
      outputs: node.outputs,
      parameters: node.parameters.reduce<Record<string, unknown>>(
        (acc, param) => ({
          ...acc,
          [param.id]: param.default,
        }),
        {}
      ),
      status: 'idle',
    };

    // Set the data in the format the canvas expects
    e.dataTransfer.setData('application/reactflow', 'canvasNode');
    e.dataTransfer.setData('nodeData', JSON.stringify(nodeData));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(node.type, e);
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.5,
        px: 1,
        cursor: 'grab',
        borderRadius: `${creativeCardTokens.radius.button}px`,
        border: '1px solid transparent',
        '&:hover': {
          bgcolor: alpha(color, 0.08),
          borderColor: alpha(color, 0.2),
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <DragIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
      <Typography variant="body2" sx={{ flex: 1 }}>
        {node.label}
      </Typography>
      {node.aiModel && (
        <Chip
          label={node.aiModel.split('/').pop()}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.6rem',
            bgcolor: alpha(color, 0.1),
            color: color,
          }}
        />
      )}
    </Box>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CreateTab = memo(function CreateTab({
  onDragStart,
  searchQuery,
}: CreateTabProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('images');

  const handleToggleCategory = useCallback((categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  // Filter trending items based on search
  const filteredTrending = searchQuery
    ? TRENDING_ITEMS.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TRENDING_ITEMS;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Trending Section */}
      {!searchQuery && (
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
          >
            🔥 Trending Now
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'divider',
                borderRadius: 2,
              },
            }}
          >
            {filteredTrending.map((item) => (
              <TrendingCard key={item.id} item={item} onDragStart={onDragStart} />
            ))}
          </Box>
        </Box>
      )}

      {/* Intent Categories */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {INTENT_CATEGORIES.map((category) => (
          <IntentCategoryItem
            key={category.id}
            category={category}
            isExpanded={expandedCategory === category.id}
            onToggle={() => handleToggleCategory(category.id)}
            onDragStart={onDragStart}
            searchQuery={searchQuery}
          />
        ))}
      </Box>
    </Box>
  );
});

export default CreateTab;
