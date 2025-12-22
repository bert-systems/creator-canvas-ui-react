/**
 * Floating Toolbar
 *
 * Canvas-positioned toolbar with selection actions and quick tools.
 * Appears when nodes are selected or when hovering over canvas.
 *
 * @module FloatingToolbar
 * @version 4.0
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Group as GroupIcon,
  CallSplit as UngroupIcon,
  SelectAll as SelectAllIcon,
  ClearAll as DeselectIcon,
  PlayArrow as ExecuteIcon,
  Download as DownloadIcon,
  ZoomIn as ExpandIcon,
  ZoomOut as CompactIcon,
  ViewModule as StandardIcon,
  Add as AddIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import type { DisplayMode } from '@/models/unifiedNode';
import { brandColors } from '@/theme';

// ============================================================================
// TYPES
// ============================================================================

interface FloatingToolbarProps {
  selectedCount: number;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onExecuteSelected?: () => void;
  onDownloadSelected?: () => void;
  onChangeDisplayMode?: (mode: DisplayMode) => void;
  onQuickAddNode?: (type: 'text' | 'image' | 'ai') => void;
  hasLockedNodes?: boolean;
  hasGroupedNodes?: boolean;
  position?: { x: number; y: number };
  variant?: 'selection' | 'canvas';
}

// ============================================================================
// SELECTION TOOLBAR
// ============================================================================

const SelectionToolbar = memo<Omit<FloatingToolbarProps, 'variant' | 'position'>>(({
  selectedCount,
  onDelete,
  onDuplicate,
  onLock,
  onUnlock,
  onGroup,
  onUngroup,
  onExecuteSelected,
  onDownloadSelected,
  onChangeDisplayMode,
  hasLockedNodes = false,
  hasGroupedNodes = false,
}) => {
  const [modeMenuAnchor, setModeMenuAnchor] = useState<null | HTMLElement>(null);

  const handleModeMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setModeMenuAnchor(event.currentTarget);
  }, []);

  const handleModeMenuClose = useCallback(() => {
    setModeMenuAnchor(null);
  }, []);

  const handleModeChange = useCallback((mode: DisplayMode) => {
    onChangeDisplayMode?.(mode);
    handleModeMenuClose();
  }, [onChangeDisplayMode, handleModeMenuClose]);

  if (selectedCount === 0) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Selection Count */}
      <Box
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: alpha(brandColors.tealPulse, 0.15),
          color: brandColors.tealPulse,
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        {selectedCount} selected
      </Box>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Execute */}
      <Tooltip title="Execute Selected">
        <IconButton size="small" onClick={onExecuteSelected}>
          <ExecuteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Download */}
      <Tooltip title="Download Selected">
        <IconButton size="small" onClick={onDownloadSelected}>
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Display Mode */}
      <Tooltip title="Change Display Mode">
        <IconButton size="small" onClick={handleModeMenuOpen}>
          <StandardIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={modeMenuAnchor}
        open={Boolean(modeMenuAnchor)}
        onClose={handleModeMenuClose}
      >
        <MenuItem onClick={() => handleModeChange('compact')}>
          <ListItemIcon><CompactIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Compact</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeChange('standard')}>
          <ListItemIcon><StandardIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Standard</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeChange('expanded')}>
          <ListItemIcon><ExpandIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Expanded</ListItemText>
        </MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Duplicate */}
      <Tooltip title="Duplicate">
        <IconButton size="small" onClick={onDuplicate}>
          <DuplicateIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Lock/Unlock */}
      {hasLockedNodes ? (
        <Tooltip title="Unlock">
          <IconButton size="small" onClick={onUnlock}>
            <UnlockIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Lock">
          <IconButton size="small" onClick={onLock}>
            <LockIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Group/Ungroup */}
      {selectedCount > 1 && (
        hasGroupedNodes ? (
          <Tooltip title="Ungroup">
            <IconButton size="small" onClick={onUngroup}>
              <UngroupIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Group">
            <IconButton size="small" onClick={onGroup}>
              <GroupIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      )}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Delete */}
      <Tooltip title="Delete">
        <IconButton size="small" onClick={onDelete} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
});

SelectionToolbar.displayName = 'SelectionToolbar';

// ============================================================================
// CANVAS SPEED DIAL
// ============================================================================

const CanvasSpeedDial = memo<Pick<FloatingToolbarProps, 'onQuickAddNode' | 'onSelectAll' | 'onDeselectAll'>>(({
  onQuickAddNode,
  onSelectAll,
  onDeselectAll,
}) => {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: <TextIcon />, name: 'Text Input', onClick: () => onQuickAddNode?.('text') },
    { icon: <ImageIcon />, name: 'Image Upload', onClick: () => onQuickAddNode?.('image') },
    { icon: <AIIcon />, name: 'AI Generate', onClick: () => onQuickAddNode?.('ai') },
    { icon: <SelectAllIcon />, name: 'Select All', onClick: onSelectAll },
    { icon: <DeselectIcon />, name: 'Deselect All', onClick: onDeselectAll },
  ];

  return (
    <SpeedDial
      ariaLabel="Quick Actions"
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        '& .MuiSpeedDial-fab': {
          width: 44,
          height: 44,
          bgcolor: brandColors.tealPulse,
          '&:hover': {
            bgcolor: alpha(brandColors.tealPulse, 0.9),
          },
        },
      }}
      icon={<SpeedDialIcon icon={<AddIcon />} />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={() => {
            action.onClick?.();
            setOpen(false);
          }}
        />
      ))}
    </SpeedDial>
  );
});

CanvasSpeedDial.displayName = 'CanvasSpeedDial';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const FloatingToolbar = memo<FloatingToolbarProps>(({
  variant = 'selection',
  position,
  ...props
}) => {
  if (variant === 'canvas') {
    return (
      <CanvasSpeedDial
        onQuickAddNode={props.onQuickAddNode}
        onSelectAll={props.onSelectAll}
        onDeselectAll={props.onDeselectAll}
      />
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        left: position?.x ?? '50%',
        top: position?.y ?? 60,
        transform: position ? 'none' : 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: props.selectedCount > 0 ? 'auto' : 'none',
        opacity: props.selectedCount > 0 ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      <SelectionToolbar {...props} />
    </Box>
  );
});

FloatingToolbar.displayName = 'FloatingToolbar';

export default FloatingToolbar;
