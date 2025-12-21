/**
 * UnifiedNode Component
 *
 * Single node component for ALL node types in Creative Canvas Studio.
 * Replaces: CanvasNode, FlowNode, CreativeCard
 *
 * Features:
 * - Three display modes: compact, standard, expanded
 * - Slot-based composition for flexible layouts
 * - Typed ports with visual differentiation
 * - Status animations and progress indicators
 * - Mode switching via double-click or keyboard
 *
 * @module UnifiedNode
 * @version 4.0
 */

import { memo, useMemo, useCallback, useState, useContext } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';
import { CanvasActionsContext } from '../canvas/CreativeCanvasStudio';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  PlayArrow as ExecuteIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  Schedule as IdleIcon,
  Autorenew as RunningIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Star as FavoriteIcon,
  StarBorder as UnfavoriteIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Download as DownloadIcon,
  ZoomIn as ExpandIcon,
  ZoomOut as CompactIcon,
  ViewModule as StandardIcon,
  AddCircleOutline as AddIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  AutoStories as AutoStoriesIcon,
  AutoAwesome as AutoAwesomeIcon,
  Science as ScienceIcon,
  Videocam as VideocamIcon,
  Animation as AnimationIcon,
  Collections as CollectionsIcon,
  PersonAdd as PersonAddIcon,
  Movie as MovieIcon,
  AudioFile as AudioFileIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

import type {
  DisplayMode,
  UnifiedPort,
  NodeStatus,
  UnifiedCanvasNode,
} from '../../models/unifiedNode';
import {
  getPortColor,
  getModeDimensions,
  getDefaultSlotConfig,
} from '../../models/unifiedNode';
import { getNodeDefinition } from '../../config/nodeDefinitions';
import { categoryColors } from '../../theme';
import type { NodeCategory } from '../../models/canvas';

import { PreviewSlot } from './slots/PreviewSlot';
import { ParameterSlot } from './slots/ParameterSlot';
import { ActionSlot } from './slots/ActionSlot';

// ============================================================================
// ANIMATIONS
// ============================================================================

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const runningBorderAnimation = keyframes`
  0% { border-color: #26CABF; }
  50% { border-color: #85E7AE; }
  100% { border-color: #26CABF; }
`;

const celebrateBorderAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(133, 231, 174, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(133, 231, 174, 0); }
  100% { box-shadow: 0 0 0 0 rgba(133, 231, 174, 0); }
`;

const errorShakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
`;

// ============================================================================
// PROPS
// ============================================================================

export interface UnifiedNodeProps extends NodeProps<UnifiedCanvasNode> {
  onExecute?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onDownload?: (nodeId: string) => void;
  onModeChange?: (nodeId: string, mode: DisplayMode) => void;
  onLockToggle?: (nodeId: string) => void;
  onFavoriteToggle?: (nodeId: string) => void;
  onParameterChange?: (nodeId: string, paramId: string, value: unknown) => void;
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

const getStatusIcon = (status: NodeStatus) => {
  switch (status) {
    case 'completed':
      return <CompletedIcon sx={{ fontSize: 16, color: '#85E7AE' }} />;
    case 'running':
      return <RunningIcon sx={{ fontSize: 16, color: '#26CABF', animation: `${pulseAnimation} 1s infinite` }} />;
    case 'error':
      return <ErrorIcon sx={{ fontSize: 16, color: '#F2492A' }} />;
    case 'queued':
      return <IdleIcon sx={{ fontSize: 16, color: '#F59E0B' }} />;
    default:
      return <IdleIcon sx={{ fontSize: 16, color: '#6B7280' }} />;
  }
};

const getStatusColor = (status: NodeStatus): string => {
  switch (status) {
    case 'completed': return '#85E7AE';
    case 'running': return '#26CABF';
    case 'error': return '#F2492A';
    case 'queued': return '#F59E0B';
    default: return '#6B7280';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

// Icon map for dynamic icon rendering
const iconMap: Record<string, React.ReactNode> = {
  TextFields: <TextFieldsIcon fontSize="small" />,
  Image: <ImageIcon fontSize="small" />,
  VideoFile: <VideoFileIcon fontSize="small" />,
  Person: <PersonIcon fontSize="small" />,
  Palette: <PaletteIcon fontSize="small" />,
  AutoStories: <AutoStoriesIcon fontSize="small" />,
  AutoAwesome: <AutoAwesomeIcon fontSize="small" />,
  Science: <ScienceIcon fontSize="small" />,
  Videocam: <VideocamIcon fontSize="small" />,
  Animation: <AnimationIcon fontSize="small" />,
  Collections: <CollectionsIcon fontSize="small" />,
  PersonAdd: <PersonAddIcon fontSize="small" />,
  Movie: <MovieIcon fontSize="small" />,
  AudioFile: <AudioFileIcon fontSize="small" />,
};

export const UnifiedNode = memo<UnifiedNodeProps>(({
  id,
  data,
  selected,
  onExecute,
  onDelete,
  onDuplicate,
  onDownload,
  onModeChange,
  onLockToggle,
  onFavoriteToggle,
  onParameterChange,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Port context menu state for auto-create input node feature
  const [portMenuAnchor, setPortMenuAnchor] = useState<null | HTMLElement>(null);
  const [portMenuContext, setPortMenuContext] = useState<{
    portId: string;
    portType: string;
  } | null>(null);

  // Get canvas actions from context
  const { onCreateConnectedInputNode, getCompatibleInputNodes } = useContext(CanvasActionsContext);

  // Get node definition for fallback values
  const definition = useMemo(() => getNodeDefinition(data.nodeType), [data.nodeType]);

  // Merge data with definition fallbacks
  const inputs: UnifiedPort[] = useMemo(() => {
    if (data.inputs && data.inputs.length > 0) return data.inputs;
    if (definition?.inputs) {
      return definition.inputs.map(p => ({
        ...p,
        required: p.required ?? false,
        multi: p.multiple ?? false,
      }));
    }
    return [];
  }, [data.inputs, definition]);

  const outputs: UnifiedPort[] = useMemo(() => {
    if (data.outputs && data.outputs.length > 0) return data.outputs;
    if (definition?.outputs) {
      return definition.outputs.map(p => ({
        ...p,
        required: p.required ?? false,
        multi: p.multiple ?? false,
      }));
    }
    return [];
  }, [data.outputs, definition]);

  // Get slot configuration
  const slotConfig = useMemo(() => {
    return data.slots || getDefaultSlotConfig(data.category);
  }, [data.slots, data.category]);

  // Get display mode
  const displayMode = data.displayMode || 'standard';
  const dimensions = getModeDimensions(displayMode);

  // Get category color
  const category = data.category as NodeCategory;
  const categoryColor = categoryColors[category] || categoryColors.imageGen;

  // Mode cycling on double-click
  const handleDoubleClick = useCallback(() => {
    if (onModeChange) {
      const modes: DisplayMode[] = ['compact', 'standard', 'expanded'];
      const currentIndex = modes.indexOf(displayMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      onModeChange(id, modes[nextIndex]);
    }
  }, [id, displayMode, onModeChange]);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleExecute = () => {
    handleMenuClose();
    onExecute?.(id);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.(id);
  };

  const handleDuplicate = () => {
    handleMenuClose();
    onDuplicate?.(id);
  };

  const handleDownload = () => {
    handleMenuClose();
    onDownload?.(id);
  };

  const handleModeSelect = (mode: DisplayMode) => {
    handleMenuClose();
    onModeChange?.(id, mode);
  };

  // Node container styles based on status
  const containerSx = useMemo(() => {
    const base = {
      minWidth: dimensions.defaultWidth,
      minHeight: dimensions.minHeight,
      maxHeight: displayMode === 'expanded' ? dimensions.maxHeight : 'auto',
      bgcolor: 'background.paper',
      borderRadius: 2,
      border: '2px solid',
      borderColor: selected ? 'primary.main' : 'divider',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: selected ? 'primary.main' : 'primary.light',
        boxShadow: 2,
      },
    };

    // Status-specific animations
    if (data.status === 'running') {
      return {
        ...base,
        animation: `${runningBorderAnimation} 2s infinite`,
      };
    }
    if (data.status === 'completed') {
      return {
        ...base,
        animation: `${celebrateBorderAnimation} 1.5s ease-out`,
      };
    }
    if (data.status === 'error') {
      return {
        ...base,
        borderColor: '#F2492A',
        animation: `${errorShakeAnimation} 0.5s ease-out`,
      };
    }

    return base;
  }, [dimensions, displayMode, selected, data.status]);

  return (
    <>
      {/* Node Resizer for selected nodes */}
      {selected && displayMode !== 'compact' && (
        <NodeResizer
          minWidth={200}
          minHeight={dimensions.minHeight}
          maxHeight={dimensions.maxHeight}
          handleStyle={{
            width: 8,
            height: 8,
            borderRadius: 2,
            backgroundColor: '#26CABF',
          }}
        />
      )}

      <Box sx={containerSx} onDoubleClick={handleDoubleClick}>
        {/* === HEADER === */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            background: `linear-gradient(135deg, ${categoryColor}15 0%, transparent 100%)`,
          }}
        >
          {/* Category icon/badge */}
          <Chip
            label={definition?.icon || '📦'}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.875rem',
              bgcolor: `${categoryColor}20`,
              border: `1px solid ${categoryColor}40`,
            }}
          />

          {/* Label */}
          <Typography
            variant="subtitle2"
            sx={{
              flex: 1,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.label || definition?.label || 'Untitled'}
          </Typography>

          {/* Status indicator */}
          <Tooltip title={data.status || 'idle'}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon(data.status || 'idle')}
            </Box>
          </Tooltip>

          {/* Lock indicator */}
          {data.isLocked && (
            <LockIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          )}

          {/* Favorite indicator */}
          {data.isFavorite && (
            <FavoriteIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
          )}

          {/* Menu button */}
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* === CONTENT === */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            minHeight: displayMode === 'compact' ? 40 : 100,
          }}
        >
          {/* Input ports column */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.5,
              py: 1,
              pl: 0.5,
              minWidth: 20,
            }}
          >
            {inputs.map((port) => (
              <Tooltip
                key={port.id}
                title={`${port.name} (${port.type})${port.required ? ' *' : ''} - Right-click to add input`}
                placement="left"
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 20,
                    cursor: 'context-menu',
                    '&:hover .port-add-icon': {
                      opacity: 1,
                    },
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPortMenuAnchor(e.currentTarget as HTMLElement);
                    setPortMenuContext({ portId: port.id, portType: port.type });
                  }}
                >
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={port.id}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      border: `2px solid ${getPortColor(port.type)}`,
                      backgroundColor: 'transparent',
                      left: -6,
                      cursor: 'pointer',
                    }}
                  />
                  {displayMode !== 'compact' && (
                    <>
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 1.5,
                          color: 'text.secondary',
                          fontSize: '0.65rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {port.name}
                      </Typography>
                      <AddIcon
                        className="port-add-icon"
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: 12,
                          color: getPortColor(port.type),
                          opacity: 0,
                          transition: 'opacity 0.2s',
                        }}
                      />
                    </>
                  )}
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Main content zone */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              p: displayMode === 'compact' ? 0.5 : 1,
              overflow: 'hidden',
            }}
          >
            {/* Preview slot */}
            {displayMode !== 'compact' && slotConfig.preview && (
              <PreviewSlot
                config={slotConfig.preview}
                result={data.cachedOutput || data.result}
                status={data.status || 'idle'}
                progress={data.progress}
              />
            )}

            {/* Parameters slot (standard & expanded modes) */}
            {displayMode !== 'compact' && slotConfig.parameters && (
              <ParameterSlot
                config={slotConfig.parameters}
                parameters={data.parameters}
                nodeType={data.nodeType}
                displayMode={displayMode}
                onParameterChange={onParameterChange ? (paramId, value) => onParameterChange(id, paramId, value) : undefined}
              />
            )}

            {/* Compact mode: just show status text */}
            {displayMode === 'compact' && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {data.status === 'completed' ? 'Ready' : data.status || 'Idle'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Output ports column */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.5,
              py: 1,
              pr: 0.5,
              minWidth: 20,
            }}
          >
            {outputs.map((port) => (
              <Tooltip
                key={port.id}
                title={`${port.name} (${port.type})`}
                placement="right"
              >
                <Box sx={{ position: 'relative', height: 20, display: 'flex', justifyContent: 'flex-end' }}>
                  {displayMode !== 'compact' && (
                    <Typography
                      variant="caption"
                      sx={{
                        mr: 1.5,
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {port.name}
                    </Typography>
                  )}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={port.id}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      border: `2px solid ${getPortColor(port.type)}`,
                      backgroundColor: 'transparent',
                      right: -6,
                    }}
                  />
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* === FOOTER === */}
        {displayMode !== 'compact' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            {/* Progress bar for running nodes */}
            {data.status === 'running' && data.progress !== undefined && (
              <LinearProgress
                variant="determinate"
                value={data.progress}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'action.disabledBackground',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#26CABF',
                  },
                }}
              />
            )}

            {/* Execution info */}
            {data.status !== 'running' && (
              <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                {data.aiModel || definition?.aiModel || 'No model'}
                {data.executionDurationMs && ` • ${(data.executionDurationMs / 1000).toFixed(1)}s`}
              </Typography>
            )}

            {/* Action slot */}
            <ActionSlot
              config={slotConfig.actions}
              status={data.status || 'idle'}
              isLocked={data.isLocked}
              onExecute={() => onExecute?.(id)}
              onDownload={() => onDownload?.(id)}
            />
          </Box>
        )}

        {/* Status bar at bottom */}
        <Box
          sx={{
            height: 3,
            bgcolor: getStatusColor(data.status || 'idle'),
            transition: 'background-color 0.3s ease',
          }}
        />
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleExecute} disabled={data.status === 'running' || data.isLocked}>
          <ListItemIcon>
            {data.status === 'running' ? <CircularProgress size={16} /> : <ExecuteIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>Execute</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => handleModeSelect('compact')}>
          <ListItemIcon><CompactIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Compact View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeSelect('standard')}>
          <ListItemIcon><StandardIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Standard View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeSelect('expanded')}>
          <ListItemIcon><ExpandIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Expanded View</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => { handleMenuClose(); onLockToggle?.(id); }}>
          <ListItemIcon>
            {data.isLocked ? <UnlockIcon fontSize="small" /> : <LockIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{data.isLocked ? 'Unlock' : 'Lock'}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { handleMenuClose(); onFavoriteToggle?.(id); }}>
          <ListItemIcon>
            {data.isFavorite ? <UnfavoriteIcon fontSize="small" /> : <FavoriteIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{data.isFavorite ? 'Unfavorite' : 'Favorite'}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon><DuplicateIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>

        {data.cachedOutput?.url && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Port context menu for auto-creating input nodes */}
      <Menu
        anchorEl={portMenuAnchor}
        open={Boolean(portMenuAnchor)}
        onClose={() => {
          setPortMenuAnchor(null);
          setPortMenuContext(null);
        }}
        anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
        transformOrigin={{ vertical: 'center', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              maxWidth: 280,
              boxShadow: 3,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Add input for <strong>{portMenuContext?.portId}</strong> ({portMenuContext?.portType})
          </Typography>
        </Box>

        {portMenuContext && getCompatibleInputNodes?.(portMenuContext.portType).map((nodeOption) => (
          <MenuItem
            key={nodeOption.type}
            onClick={() => {
              onCreateConnectedInputNode?.(id, portMenuContext.portId, portMenuContext.portType, nodeOption.type);
              setPortMenuAnchor(null);
              setPortMenuContext(null);
            }}
          >
            <ListItemIcon>
              {iconMap[nodeOption.icon] || <AddIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={nodeOption.label}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </MenuItem>
        ))}

        {(!getCompatibleInputNodes || getCompatibleInputNodes(portMenuContext?.portType || 'any').length === 0) && (
          <MenuItem disabled>
            <ListItemText
              primary="No compatible nodes"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
});

UnifiedNode.displayName = 'UnifiedNode';

export default UnifiedNode;
