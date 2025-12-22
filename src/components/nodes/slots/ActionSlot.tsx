/**
 * ActionSlot Component
 *
 * Displays action buttons (execute, download, etc.) within UnifiedNode footer.
 *
 * @module ActionSlot
 */

import { memo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as ExecuteIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Fullscreen as ExpandIcon,
} from '@mui/icons-material';

import type { ActionSlotConfig, NodeStatus } from '../../../models/unifiedNode';

// ============================================================================
// PROPS
// ============================================================================

interface ActionSlotProps {
  config?: ActionSlotConfig;
  status: NodeStatus;
  isLocked?: boolean;
  onExecute?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExpand?: () => void;
}

// ============================================================================
// ICON MAPPING
// ============================================================================

const getActionIcon = (action: string) => {
  switch (action) {
    case 'execute': return <ExecuteIcon sx={{ fontSize: 18 }} />;
    case 'download': return <DownloadIcon sx={{ fontSize: 18 }} />;
    case 'preview': return <PreviewIcon sx={{ fontSize: 18 }} />;
    case 'duplicate': return <DuplicateIcon sx={{ fontSize: 18 }} />;
    case 'delete': return <DeleteIcon sx={{ fontSize: 18 }} />;
    case 'expand': return <ExpandIcon sx={{ fontSize: 18 }} />;
    default: return <ExecuteIcon sx={{ fontSize: 18 }} />;
  }
};

const getActionLabel = (action: string) => {
  switch (action) {
    case 'execute': return 'Execute';
    case 'download': return 'Download';
    case 'preview': return 'Preview';
    case 'duplicate': return 'Duplicate';
    case 'delete': return 'Delete';
    case 'expand': return 'Expand';
    default: return action;
  }
};

const getActionHandler = (
  action: string,
  handlers: {
    onExecute?: () => void;
    onDownload?: () => void;
    onPreview?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onExpand?: () => void;
  }
) => {
  switch (action) {
    case 'execute': return handlers.onExecute;
    case 'download': return handlers.onDownload;
    case 'preview': return handlers.onPreview;
    case 'duplicate': return handlers.onDuplicate;
    case 'delete': return handlers.onDelete;
    case 'expand': return handlers.onExpand;
    default: return undefined;
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ActionSlot = memo<ActionSlotProps>(({
  config,
  status,
  isLocked,
  onExecute,
  onDownload,
  onPreview,
  onDuplicate,
  onDelete,
  onExpand,
}) => {
  const handlers = { onExecute, onDownload, onPreview, onDuplicate, onDelete, onExpand };

  // Default config if not provided
  const primaryAction = config?.primary || 'execute';
  const secondaryActions = config?.secondary || [];

  const isRunning = status === 'running';
  const isDisabled = isRunning || isLocked;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {/* Secondary action buttons (icons only) */}
      {secondaryActions.map((action) => {
        const handler = getActionHandler(action, handlers);
        if (!handler) return null;

        return (
          <Tooltip key={action} title={getActionLabel(action)}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handler();
                }}
                disabled={isDisabled && action === 'execute'}
                sx={{
                  p: 0.5,
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                {getActionIcon(action)}
              </IconButton>
            </span>
          </Tooltip>
        );
      })}

      {/* Primary action button */}
      <Button
        size="small"
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          const handler = getActionHandler(primaryAction, handlers);
          handler?.();
        }}
        disabled={isDisabled && primaryAction === 'execute'}
        startIcon={
          isRunning && primaryAction === 'execute' ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            getActionIcon(primaryAction)
          )
        }
        sx={{
          minWidth: 'auto',
          px: 1.5,
          py: 0.5,
          fontSize: '0.7rem',
          fontWeight: 600,
          textTransform: 'none',
          bgcolor: primaryAction === 'execute' ? 'primary.main' : 'action.selected',
          color: primaryAction === 'execute' ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            bgcolor: primaryAction === 'execute' ? 'primary.dark' : 'action.hover',
          },
          '&.Mui-disabled': {
            bgcolor: 'action.disabledBackground',
            color: 'text.disabled',
          },
        }}
      >
        {isRunning && primaryAction === 'execute' ? 'Running' : getActionLabel(primaryAction)}
      </Button>
    </Box>
  );
});

ActionSlot.displayName = 'ActionSlot';

export default ActionSlot;
