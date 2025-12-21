/**
 * Top Menu Bar
 *
 * Global application menu with file operations, view controls, and settings.
 *
 * @module TopMenuBar
 * @version 4.0
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  FolderOpen as OpenIcon,
  Save as SaveIcon,
  SaveAs as SaveAsIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitViewIcon,
  GridOn as GridIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  PlayArrow as ExecuteIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import type { BoardCategory } from '@/models/canvas';
import { brandColors } from '@/theme';

// ============================================================================
// TYPES
// ============================================================================

interface TopMenuBarProps {
  boardName?: string;
  boardCategory?: BoardCategory | null;
  onSave?: () => void;
  onSaveAs?: () => void;
  onOpen?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onToggleGrid?: () => void;
  onToggleMinimap?: () => void;
  onSettings?: () => void;
  onExecuteAll?: () => void;
  onStopAll?: () => void;
  isExecuting?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  showMinimap?: boolean;
  zoomLevel?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TopMenuBar = memo<TopMenuBarProps>(({
  boardName = 'Untitled Board',
  boardCategory,
  onSave,
  onSaveAs,
  onOpen,
  onExport,
  onImport,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleGrid,
  onToggleMinimap,
  onSettings,
  onExecuteAll,
  onStopAll,
  isExecuting = false,
  canUndo = false,
  canRedo = false,
  showGrid = true,
  showMinimap = true,
  zoomLevel = 100,
}) => {
  const [fileMenuAnchor, setFileMenuAnchor] = useState<null | HTMLElement>(null);
  const [viewMenuAnchor, setViewMenuAnchor] = useState<null | HTMLElement>(null);

  const handleFileMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFileMenuAnchor(event.currentTarget);
  }, []);

  const handleViewMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setViewMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setFileMenuAnchor(null);
    setViewMenuAnchor(null);
  }, []);

  const handleAction = useCallback((action?: () => void) => {
    handleMenuClose();
    action?.();
  }, [handleMenuClose]);

  // Get category color
  const getCategoryColor = (): string => {
    switch (boardCategory) {
      case 'fashion': return '#d946ef';
      case 'story': return '#10b981';
      case 'interior': return '#f59e0b';
      case 'stock': return '#3b82f6';
      default: return brandColors.tealPulse;
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 40, gap: 1 }}>
        {/* Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: getCategoryColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            C
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* File Menu */}
        <Button
          size="small"
          onClick={handleFileMenuOpen}
          sx={{ minWidth: 'auto', px: 1, fontSize: '0.8125rem', textTransform: 'none' }}
        >
          File
        </Button>
        <Menu
          anchorEl={fileMenuAnchor}
          open={Boolean(fileMenuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <MenuItem onClick={() => handleAction(onOpen)}>
            <ListItemIcon><OpenIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Open Board</ListItemText>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>⌘O</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction(onSave)}>
            <ListItemIcon><SaveIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Save</ListItemText>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>⌘S</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onSaveAs)}>
            <ListItemIcon><SaveAsIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Save As...</ListItemText>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>⇧⌘S</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction(onImport)}>
            <ListItemIcon><ImportIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Import...</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onExport)}>
            <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Export...</ListItemText>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>⌘E</Typography>
          </MenuItem>
        </Menu>

        {/* View Menu */}
        <Button
          size="small"
          onClick={handleViewMenuOpen}
          sx={{ minWidth: 'auto', px: 1, fontSize: '0.8125rem', textTransform: 'none' }}
        >
          View
        </Button>
        <Menu
          anchorEl={viewMenuAnchor}
          open={Boolean(viewMenuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <MenuItem onClick={() => handleAction(onZoomIn)}>
            <ListItemIcon><ZoomInIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Zoom In</ListItemText>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>⌘+</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onZoomOut)}>
            <ListItemIcon><ZoomOutIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Zoom Out</ListItemText>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>⌘-</Typography>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onFitView)}>
            <ListItemIcon><FitViewIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Fit to View</ListItemText>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>⌘0</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction(onToggleGrid)}>
            <ListItemIcon><GridIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{showGrid ? 'Hide' : 'Show'} Grid</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction(onToggleMinimap)}>
            <ListItemIcon><LayersIcon fontSize="small" /></ListItemIcon>
            <ListItemText>{showMinimap ? 'Hide' : 'Show'} Minimap</ListItemText>
          </MenuItem>
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Undo (⌘Z)">
            <span>
              <IconButton size="small" onClick={onUndo} disabled={!canUndo}>
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (⇧⌘Z)">
            <span>
              <IconButton size="small" onClick={onRedo} disabled={!canRedo}>
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Board Title */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            {boardName}
          </Typography>
          {boardCategory && (
            <Chip
              label={boardCategory}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                textTransform: 'capitalize',
                bgcolor: `${getCategoryColor()}20`,
                color: getCategoryColor(),
                fontWeight: 600,
              }}
            />
          )}
        </Box>

        {/* Zoom Level */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={onZoomOut}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              minWidth: 40,
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            {Math.round(zoomLevel)}%
          </Typography>
          <IconButton size="small" onClick={onZoomIn}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
          <Tooltip title="Fit to View">
            <IconButton size="small" onClick={onFitView}>
              <FitViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

        {/* Execute Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isExecuting ? (
            <Tooltip title="Stop All">
              <IconButton size="small" onClick={onStopAll} color="error">
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Execute All Nodes">
              <IconButton size="small" onClick={onExecuteAll} color="primary">
                <ExecuteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Settings & Help */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Settings">
            <IconButton size="small" onClick={onSettings}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

TopMenuBar.displayName = 'TopMenuBar';

export default TopMenuBar;
