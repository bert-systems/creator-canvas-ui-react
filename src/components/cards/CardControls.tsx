/**
 * CardControls Component
 * Glassmorphic control overlay for Creative Cards
 */

import { memo, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Download as DownloadIcon,
  OpenInNew as OpenIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Folder as FolderIcon,
  AutoAwesome as EnhanceIcon,
} from '@mui/icons-material';
import { categoryColors } from '../../theme';
import { glassStyles } from './cardAnimations';

// ============================================================================
// TYPES
// ============================================================================

export interface CardControlsProps {
  /** Card title */
  title: string;
  /** Card prompt/description */
  prompt: string;
  /** Whether the card is locked */
  isLocked: boolean;
  /** Whether the card is favorited */
  isFavorite?: boolean;
  /** Whether the card is executing */
  isExecuting: boolean;
  /** Current execution stage name */
  currentStage?: string | null;
  /** Category for theming */
  category?: string;
  /** Card display mode */
  mode?: 'hero' | 'craft' | 'mini';
  /** Whether editing is active */
  isEditing?: boolean;
  /** Callback to save edits */
  onSave?: (title: string, prompt: string) => void;
  /** Callback to cancel editing */
  onCancel?: () => void;
  /** Callback to toggle edit mode */
  onToggleEdit?: () => void;
  /** Callback to execute workflow */
  onExecute?: () => void;
  /** Callback to toggle lock */
  onToggleLock?: () => void;
  /** Callback to toggle favorite */
  onToggleFavorite?: () => void;
  /** Callback to duplicate */
  onDuplicate?: () => void;
  /** Callback to delete */
  onDelete?: () => void;
  /** Callback to download */
  onDownload?: () => void;
  /** Callback to add to collection */
  onAddToCollection?: () => void;
  /** Callback to enhance prompt */
  onEnhancePrompt?: () => void;
  /** Has generated content */
  hasContent?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CardControls = memo(function CardControls({
  title,
  prompt,
  isLocked,
  isFavorite = false,
  isExecuting,
  currentStage,
  category = 'imageGen',
  mode = 'hero',
  isEditing = false,
  onSave,
  onCancel,
  onToggleEdit,
  onExecute,
  onToggleLock,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onDownload,
  onAddToCollection,
  onEnhancePrompt,
  hasContent = false,
}: CardControlsProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedPrompt, setEditedPrompt] = useState(prompt);

  const categoryColor = categoryColors[category as keyof typeof categoryColors]?.main || categoryColors.imageGen.main;

  const handleSave = () => {
    onSave?.(editedTitle, editedPrompt);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setEditedPrompt(prompt);
    onCancel?.();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuAction = (action: () => void) => {
    handleMenuClose();
    action();
  };

  // ============================================================================
  // MINI MODE - Minimal controls
  // ============================================================================

  if (mode === 'mini') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: 1,
          minWidth: 0,
          px: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {prompt || 'No prompt'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
          {isExecuting ? (
            <Chip
              label={currentStage || 'Working...'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: alpha(categoryColor, 0.2),
                color: categoryColor,
              }}
            />
          ) : (
            <>
              {isLocked && <LockIcon sx={{ fontSize: 14, color: 'text.disabled' }} />}
              {hasContent && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    );
  }

  // ============================================================================
  // HEADER - Title and Actions
  // ============================================================================

  const renderHeader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        pb: 1,
        borderBottom: `1px solid ${alpha(categoryColor, 0.1)}`,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
        {isEditing ? (
          <TextField
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            size="small"
            fullWidth
            autoFocus
            variant="standard"
            placeholder="Card title"
            sx={{
              '& .MuiInput-root': {
                fontSize: '0.875rem',
                fontWeight: 600,
              },
            }}
          />
        ) : (
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600 }}
            noWrap
          >
            {title}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isEditing ? (
          <>
            <Tooltip title="Save">
              <IconButton size="small" onClick={handleSave} color="primary">
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton size="small" onClick={handleCancel}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            {isLocked && (
              <Tooltip title="Locked">
                <LockIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </Tooltip>
            )}
            <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton size="small" onClick={onToggleFavorite}>
                {isFavorite ? (
                  <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                ) : (
                  <StarBorderIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            ...glassStyles.background,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => handleMenuAction(onToggleEdit!)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuAction(onToggleLock!)}>
          <ListItemIcon>
            {isLocked ? <UnlockIcon fontSize="small" /> : <LockIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{isLocked ? 'Unlock' : 'Lock'}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleMenuAction(onDuplicate!)}>
          <ListItemIcon><DuplicateIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>

        {hasContent && onAddToCollection && (
          <MenuItem onClick={() => handleMenuAction(onAddToCollection)}>
            <ListItemIcon><FolderIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Add to Collection</ListItemText>
          </MenuItem>
        )}

        {hasContent && onDownload && (
          <MenuItem onClick={() => handleMenuAction(onDownload)}>
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem
          onClick={() => handleMenuAction(onDelete!)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );

  // ============================================================================
  // PROMPT SECTION
  // ============================================================================

  const renderPromptSection = () => (
    <Box sx={{ p: 1.5, pt: 1 }}>
      {mode === 'craft' && (
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5, display: 'block' }}
        >
          CRAFT YOUR VISION
        </Typography>
      )}

      {isEditing ? (
        <TextField
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={mode === 'craft' ? 4 : 2}
          placeholder="Describe what you want to create..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.8125rem',
              bgcolor: alpha('#000', 0.2),
            },
          }}
          InputProps={{
            endAdornment: onEnhancePrompt && (
              <Tooltip title="Enhance with AI">
                <IconButton size="small" onClick={onEnhancePrompt} sx={{ mr: -1 }}>
                  <EnhanceIcon sx={{ fontSize: 18, color: categoryColor }} />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: mode === 'craft' ? 4 : 2,
            WebkitBoxOrient: 'vertical',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
          }}
        >
          {prompt || 'Click edit to add a prompt...'}
        </Typography>
      )}
    </Box>
  );

  // ============================================================================
  // ACTION BAR
  // ============================================================================

  const renderActionBar = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        p: 1.5,
        pt: 0.5,
        borderTop: `1px solid ${alpha(categoryColor, 0.1)}`,
      }}
    >
      {/* Generate Button */}
      <Tooltip title={isExecuting ? 'Generating...' : 'Generate'}>
        <span>
          <IconButton
            size="medium"
            color="primary"
            onClick={onExecute}
            disabled={isExecuting || isLocked}
            sx={{
              bgcolor: isExecuting ? undefined : alpha(categoryColor, 0.1),
              '&:hover': { bgcolor: alpha(categoryColor, 0.2) },
              '&.Mui-disabled': { opacity: 0.5 },
            }}
          >
            <PlayIcon sx={{ color: categoryColor }} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Edit Button */}
      {!isEditing && (
        <Tooltip title="Edit">
          <IconButton
            size="medium"
            onClick={onToggleEdit}
            disabled={isLocked}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* Open Full Size (if has content) */}
      {hasContent && (
        <Tooltip title="Open Full Size">
          <IconButton
            size="medium"
            onClick={onDownload}
          >
            <OpenIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // ============================================================================
  // EXECUTION STATUS
  // ============================================================================

  const renderExecutionStatus = () => {
    if (!isExecuting) return null;

    return (
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: alpha(categoryColor, 0.05),
          borderTop: `1px solid ${alpha(categoryColor, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: categoryColor, fontWeight: 500 }}>
            {currentStage || 'Processing...'}
          </Typography>
        </Box>
      </Box>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      {renderHeader()}
      {renderPromptSection()}
      {renderExecutionStatus()}
      {!isEditing && renderActionBar()}
    </Box>
  );
});

export default CardControls;
