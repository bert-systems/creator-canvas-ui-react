/**
 * ElementLibraryNode - Kling O1 Element Library for video generation
 * Stores consistent characters/objects/environments for use in video generation
 * Each element can have up to 7 reference images
 */

import { memo, useMemo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Tooltip,
  alpha,
  Stack,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  HourglassEmpty as IdleIcon,
  Refresh as RunningIcon,
  LibraryBooks as LibraryIcon,
  Person as CharacterIcon,
  Category as ObjectIcon,
  Landscape as EnvironmentIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Videocam as VideoIcon,
} from '@mui/icons-material';
import type { Port, PortType } from '@/models/canvas';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 340;
const MAX_ELEMENTS = 5;

const PORT_COLORS: Record<PortType, string> = {
  image: '#3b82f6',
  video: '#8b5cf6',
  audio: '#ec4899',
  text: '#f97316',
  style: '#06b6d4',
  character: '#a855f7',
  mesh3d: '#f59e0b',
  any: '#6b7280',
};

// Element library accent color (amber/orange)
const LIBRARY_COLOR = '#f59e0b';

// ===== Types =====

export type ElementType = 'character' | 'object' | 'environment';

export interface LibraryElement {
  id: string;
  name: string;
  type: ElementType;
  thumbnailUrl?: string;
  imageCount: number;
  klingElementId?: string;
}

export interface ElementLibraryNodeData {
  nodeType: 'elementLibrary';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  // Library data
  libraryId?: string;
  libraryName?: string;
  elements?: LibraryElement[];
  selectedElementIds?: string[];
}

export interface ElementLibraryNodeProps {
  id: string;
  data: ElementLibraryNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// ===== Helper Functions =====

const getStatusIcon = (status: string, hasElements?: boolean) => {
  if (hasElements) {
    return <LibraryIcon sx={{ fontSize: 16, color: LIBRARY_COLOR }} />;
  }
  switch (status) {
    case 'completed':
      return <SuccessIcon sx={{ fontSize: 16, color: 'success.main' }} />;
    case 'running':
      return <RunningIcon sx={{ fontSize: 16, color: 'primary.main', animation: 'spin 1s linear infinite' }} />;
    case 'error':
      return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />;
    default:
      return <IdleIcon sx={{ fontSize: 16, color: 'text.disabled' }} />;
  }
};

const getStatusColor = (status: string, hasElements?: boolean): string => {
  if (hasElements) return LIBRARY_COLOR;
  switch (status) {
    case 'completed':
      return '#22c55e';
    case 'running':
      return LIBRARY_COLOR;
    case 'error':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getElementIcon = (type: ElementType) => {
  switch (type) {
    case 'character':
      return <CharacterIcon sx={{ fontSize: 20 }} />;
    case 'object':
      return <ObjectIcon sx={{ fontSize: 20 }} />;
    case 'environment':
      return <EnvironmentIcon sx={{ fontSize: 20 }} />;
    default:
      return <ObjectIcon sx={{ fontSize: 20 }} />;
  }
};

const getElementColor = (type: ElementType): string => {
  switch (type) {
    case 'character':
      return '#a855f7';
    case 'object':
      return '#3b82f6';
    case 'environment':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

// ===== Component =====

export const ElementLibraryNode = memo(function ElementLibraryNode({
  data,
  selected,
  isConnectable = true,
}: ElementLibraryNodeProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [newElementType, setNewElementType] = useState<ElementType>('character');

  const elements = data.elements || [];
  const hasElements = elements.length > 0;
  const selectedIds = data.selectedElementIds || [];

  const statusColor = useMemo(
    () => getStatusColor(data.status, hasElements),
    [data.status, hasElements]
  );

  const handleToggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Render input handles (left side)
  const renderInputHandles = () => {
    if (!data.inputs || data.inputs.length === 0) return null;

    return data.inputs.map((port: Port, index: number) => {
      const topOffset = 100 + index * 50;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip key={port.id} title={`${port.name} (${port.type})`} placement="left">
          <Handle
            type="target"
            position={Position.Left}
            id={port.id}
            isConnectable={isConnectable}
            style={{
              top: topOffset,
              width: 14,
              height: 14,
              backgroundColor: portColor,
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render output handles (right side)
  const renderOutputHandles = () => {
    if (!data.outputs || data.outputs.length === 0) return null;

    return data.outputs.map((port: Port, index: number) => {
      const topOffset = 100 + index * 50;
      const portColor = PORT_COLORS[port.type] || PORT_COLORS.any;

      return (
        <Tooltip key={port.id} title={`${port.name} (${port.type})`} placement="right">
          <Handle
            type="source"
            position={Position.Right}
            id={port.id}
            isConnectable={isConnectable}
            style={{
              top: topOffset,
              width: 14,
              height: 14,
              backgroundColor: portColor,
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        </Tooltip>
      );
    });
  };

  // Render element list
  const renderElementList = () => {
    return (
      <Box sx={{ px: 1.5, pt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LibraryIcon sx={{ fontSize: 14, color: LIBRARY_COLOR }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Elements ({elements.length}/{MAX_ELEMENTS})
            </Typography>
          </Box>
          <IconButton
            size="small"
            disabled={elements.length >= MAX_ELEMENTS}
            sx={{ p: 0.25, color: LIBRARY_COLOR }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {elements.length === 0 ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: alpha('#000', 0.02),
              border: '1px dashed',
              borderColor: alpha('#000', 0.2),
              textAlign: 'center',
            }}
          >
            <LibraryIcon sx={{ fontSize: 32, color: alpha('#000', 0.2), mb: 0.5 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              No elements yet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Add characters, objects, or environments
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {elements.map(element => {
              const isSelected = selectedIds.includes(element.id);
              const elementColor = getElementColor(element.type);

              return (
                <ListItem
                  key={element.id}
                  sx={{
                    px: 1,
                    py: 0.5,
                    mb: 0.5,
                    borderRadius: 1,
                    bgcolor: isSelected ? alpha(elementColor, 0.1) : alpha('#000', 0.02),
                    border: '1px solid',
                    borderColor: isSelected ? elementColor : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(elementColor, 0.05),
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    {element.thumbnailUrl ? (
                      <Avatar
                        src={element.thumbnailUrl}
                        sx={{
                          width: 32,
                          height: 32,
                          border: '2px solid',
                          borderColor: elementColor,
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: alpha(elementColor, 0.2),
                          color: elementColor,
                        }}
                      >
                        {getElementIcon(element.type)}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={element.name}
                    secondary={`${element.type} • ${element.imageCount} refs`}
                    primaryTypographyProps={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      noWrap: true,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.6rem',
                      sx: { textTransform: 'capitalize' },
                    }}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={element.type.charAt(0).toUpperCase()}
                      size="small"
                      sx={{
                        height: 18,
                        minWidth: 18,
                        fontSize: '0.6rem',
                        bgcolor: elementColor,
                        color: 'white',
                        '& .MuiChip-label': { px: 0.5 },
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    );
  };

  // Render add element form
  const renderAddElement = () => {
    if (!showSettings) return null;

    return (
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Stack spacing={1.5}>
          {/* Element type selector */}
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Element Type</InputLabel>
            <Select
              value={newElementType}
              onChange={(e) => setNewElementType(e.target.value as ElementType)}
              label="Element Type"
              sx={{ fontSize: '0.8rem' }}
            >
              <MenuItem value="character">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CharacterIcon sx={{ fontSize: 16, color: '#a855f7' }} />
                  Character
                </Box>
              </MenuItem>
              <MenuItem value="object">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ObjectIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                  Object
                </Box>
              </MenuItem>
              <MenuItem value="environment">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EnvironmentIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                  Environment
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Video generation hint */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(PORT_COLORS.video, 0.1),
              border: '1px solid',
              borderColor: alpha(PORT_COLORS.video, 0.3),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <VideoIcon sx={{ fontSize: 18, color: PORT_COLORS.video }} />
            <Box>
              <Typography variant="caption" fontWeight={500} sx={{ display: 'block' }}>
                Kling O1 Integration
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Selected elements will be consistent in generated videos
              </Typography>
            </Box>
          </Box>

          {/* Info */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: alpha(LIBRARY_COLOR, 0.05),
              border: '1px solid',
              borderColor: alpha(LIBRARY_COLOR, 0.2),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Add up to 7 reference images per element.
              Elements maintain visual consistency across video generations.
              Works with Kling O1 video generation nodes.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };

  // Calculate node height
  const nodeHeight = Math.max(
    NODE_MIN_HEIGHT,
    85 + // Header
    Math.max(120, elements.length * 52 + 50) + // Element list
    (showSettings ? 180 : 0) +
    (data.error ? 30 : 0)
  );

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: nodeHeight,
        borderRadius: 2,
        overflow: 'visible',
        border: '2px solid',
        borderColor: selected ? LIBRARY_COLOR : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
        '&:hover': {
          borderColor: selected ? LIBRARY_COLOR : alpha(LIBRARY_COLOR, 0.5),
          boxShadow: 4,
        },
      }}
    >
      {/* Handles */}
      {renderInputHandles()}
      {renderOutputHandles()}

      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          background: `linear-gradient(135deg, ${LIBRARY_COLOR} 0%, ${alpha(LIBRARY_COLOR, 0.8)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
          {getStatusIcon(data.status, hasElements)}
          <LibraryIcon sx={{ fontSize: 16, color: 'white' }} />
          <Typography
            variant="subtitle2"
            sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
            noWrap
          >
            {data.label}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip
            label="Kling O1"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.55rem',
              bgcolor: alpha('#fff', 0.2),
              color: 'white',
            }}
          />
          <IconButton
            size="small"
            onClick={handleToggleSettings}
            sx={{ color: 'white', p: 0.25 }}
          >
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Progress bar */}
      {data.status === 'running' && (
        <LinearProgress
          variant={data.progress ? 'determinate' : 'indeterminate'}
          value={data.progress}
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': {
              backgroundColor: statusColor,
            },
          }}
        />
      )}

      {/* Error message */}
      {data.error && (
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: alpha('#ef4444', 0.1) }}>
          <Typography variant="caption" color="error" sx={{ fontSize: '0.65rem' }}>
            {data.error}
          </Typography>
        </Box>
      )}

      {/* Element list */}
      {renderElementList()}

      {/* Add element form */}
      {renderAddElement()}

      {/* Status indicator bar at bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: statusColor,
          borderBottomLeftRadius: 6,
          borderBottomRightRadius: 6,
          opacity: data.status === 'idle' && !hasElements ? 0.3 : 1,
          transition: 'opacity 0.3s',
        }}
      />

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Paper>
  );
});

export default ElementLibraryNode;
