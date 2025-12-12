/**
 * Canvas Node - Renders a card on the infinite canvas
 * Supports workflow execution, image display, and drag/drop functionality
 */

import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
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
  ZoomIn as ExpandIcon,
  ZoomOut as CollapseIcon,
  Download as DownloadIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import type { CanvasCard } from '../../models/creativeCanvas';
import { CATEGORY_INFO, getTemplateById } from '../../models/creativeCanvas';
import creativeCanvasService from '../../services/creativeCanvasService';

// Poll interval for workflow status
const POLL_INTERVAL = 2000;

interface CanvasNodeProps {
  data: {
    card: CanvasCard;
    onUpdate?: (card: CanvasCard) => void;
    onDelete?: (cardId: string) => void;
    onDuplicate?: (card: CanvasCard) => void;
    onError?: (message: string) => void;
    onSuccess?: (message: string) => void;
  };
  selected?: boolean;
}

export const CanvasNode = memo(function CanvasNode({
  data,
  selected,
}: CanvasNodeProps) {
  const { card, onUpdate, onDelete, onDuplicate, onError, onSuccess } = data;
  const template = getTemplateById(card.templateId);
  const categoryInfo = CATEGORY_INFO[card.type?.split('-')[0] as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.fashion;
  const cardColor = template?.color || categoryInfo.color;

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedPrompt, setEditedPrompt] = useState(card.prompt || '');
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(card.selectedImageIndex || 0);

  // Save edits
  const handleSaveEdit = async () => {
    try {
      const response = await creativeCanvasService.cards.update(card.id, {
        title: editedTitle,
        prompt: editedPrompt,
      });

      if (response.success && response.data) {
        onUpdate?.({
          ...card,
          title: editedTitle,
          prompt: editedPrompt,
        });
        setIsEditing(false);
        onSuccess?.('Card updated successfully');
      }
    } catch (err) {
      console.error('Failed to save card:', err);
      onError?.('Failed to save card');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditedTitle(card.title);
    setEditedPrompt(card.prompt || '');
    setIsEditing(false);
  };

  // Execute workflow
  const handleExecuteWorkflow = useCallback(async () => {
    setIsExecuting(true);
    setWorkflowProgress(0);
    setCurrentStage('Starting...');

    try {
      const response = await creativeCanvasService.cards.executeWorkflow(card.id);

      if (!response.success || !response.data) {
        throw new Error('Failed to start workflow');
      }

      // Poll for status
      const pollStatus = async () => {
        try {
          const statusResponse = await creativeCanvasService.cards.getWorkflowStatus(card.id);

          if (statusResponse.success && statusResponse.data) {
            const status = statusResponse.data;
            setWorkflowProgress(status.progress);

            const currentStageData = status.stages?.[status.currentStage];
            if (currentStageData) {
              setCurrentStage(currentStageData.name);
            }

            if (status.status === 'completed') {
              setIsExecuting(false);
              setCurrentStage(null);

              // Update card with generated assets
              const generatedImages = status.generatedAssets?.map(a => a.fullResolutionUrl || a.previewUrl) || [];
              const thumbnailUrl = status.generatedAssets?.[0]?.previewUrl || status.generatedAssets?.[0]?.thumbnailBase64;

              onUpdate?.({
                ...card,
                generatedImages,
                thumbnailUrl,
              });

              onSuccess?.('Images generated successfully!');
              return;
            }

            if (status.status === 'failed') {
              setIsExecuting(false);
              setCurrentStage(null);
              onError?.(status.errorMessage || 'Workflow failed');
              return;
            }

            // Continue polling
            setTimeout(pollStatus, POLL_INTERVAL);
          }
        } catch (err) {
          console.error('Failed to poll status:', err);
          setIsExecuting(false);
          setCurrentStage(null);
          onError?.('Failed to check workflow status');
        }
      };

      // Start polling
      setTimeout(pollStatus, POLL_INTERVAL);
    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setIsExecuting(false);
      setCurrentStage(null);
      onError?.('Failed to start workflow');
    }
  }, [card, onUpdate, onError, onSuccess]);

  // Toggle expanded state
  const handleToggleExpanded = async () => {
    const newExpanded = !card.isExpanded;
    try {
      await creativeCanvasService.cards.update(card.id, {
        isExpanded: newExpanded,
      });
      onUpdate?.({ ...card, isExpanded: newExpanded });
    } catch (err) {
      console.error('Failed to toggle expanded:', err);
    }
  };

  // Toggle locked state
  const handleToggleLocked = async () => {
    const newLocked = !card.isLocked;
    try {
      await creativeCanvasService.cards.update(card.id, {
        isLocked: newLocked,
      });
      onUpdate?.({ ...card, isLocked: newLocked });
    } catch (err) {
      console.error('Failed to toggle locked:', err);
    }
  };

  // Handle image selection
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    creativeCanvasService.cards.update(card.id, { selectedImageIndex: index }).catch(console.error);
  };

  // Download image
  const handleDownloadImage = () => {
    const imageUrl = card.generatedImages?.[selectedImageIndex];
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${card.title || 'image'}_${selectedImageIndex + 1}.png`;
      link.click();
    }
  };

  // Get display image
  const displayImage = card.generatedImages?.[selectedImageIndex] || card.thumbnailUrl;
  const hasImages = (card.generatedImages?.length ?? 0) > 0;

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: card.dimensions.width,
        minHeight: card.isExpanded ? card.dimensions.height * 2 : card.dimensions.height,
        borderRadius: 2,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: selected ? cardColor : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: selected ? cardColor : alpha(cardColor, 0.5),
        },
        opacity: card.isLocked ? 0.8 : 1,
      }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          backgroundColor: cardColor,
          width: 12,
          height: 12,
          border: '2px solid white',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          backgroundColor: cardColor,
          width: 12,
          height: 12,
          border: '2px solid white',
        }}
      />

      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          backgroundColor: cardColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <TextField
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              size="small"
              fullWidth
              autoFocus
              variant="standard"
              sx={{
                '& .MuiInput-root': { color: 'white' },
                '& .MuiInput-underline:before': { borderColor: 'rgba(255,255,255,0.5)' },
              }}
            />
          ) : (
            <Typography
              variant="subtitle2"
              sx={{ color: 'white', fontWeight: 600 }}
              noWrap
            >
              {card.title || template?.name || 'Untitled'}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {card.isLocked && (
            <Tooltip title="Locked">
              <LockIcon sx={{ color: 'white', fontSize: 16 }} />
            </Tooltip>
          )}

          {isEditing ? (
            <>
              <IconButton size="small" onClick={handleSaveEdit} sx={{ color: 'white' }}>
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancelEdit} sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ color: 'white' }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setIsEditing(true); setMenuAnchor(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleToggleExpanded(); setMenuAnchor(null); }}>
          <ListItemIcon>{card.isExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}</ListItemIcon>
          <ListItemText>{card.isExpanded ? 'Collapse' : 'Expand'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleToggleLocked(); setMenuAnchor(null); }}>
          <ListItemIcon>{card.isLocked ? <UnlockIcon fontSize="small" /> : <LockIcon fontSize="small" />}</ListItemIcon>
          <ListItemText>{card.isLocked ? 'Unlock' : 'Lock'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDuplicate?.(card); setMenuAnchor(null); }}>
          <ListItemIcon><DuplicateIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        {hasImages && (
          <MenuItem onClick={() => { handleDownloadImage(); setMenuAnchor(null); }}>
            <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Download Image</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { onDelete?.(card.id); setMenuAnchor(null); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Body */}
      <Box sx={{ p: 1.5 }}>
        {/* Prompt */}
        <Box sx={{ mb: 1.5 }}>
          {isEditing ? (
            <TextField
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              size="small"
              fullWidth
              multiline
              rows={3}
              label="Prompt"
              variant="outlined"
            />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: card.isExpanded ? 6 : 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {card.prompt || 'No prompt set'}
            </Typography>
          )}
        </Box>

        {/* Workflow Progress */}
        {isExecuting && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {currentStage || 'Processing...'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {workflowProgress}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={workflowProgress} />
          </Box>
        )}

        {/* Image Preview */}
        {displayImage && (
          <Box sx={{ mb: 1.5 }}>
            <Box
              component="img"
              src={displayImage}
              alt={card.title}
              sx={{
                width: '100%',
                height: card.isExpanded ? 200 : 120,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
              }}
              onClick={() => window.open(displayImage, '_blank')}
            />

            {/* Image thumbnails */}
            {hasImages && card.generatedImages!.length > 1 && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                {card.generatedImages!.slice(0, 6).map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img}
                    alt={`Generated ${idx + 1}`}
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 0.5,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedImageIndex === idx ? cardColor : 'transparent',
                      opacity: selectedImageIndex === idx ? 1 : 0.7,
                      '&:hover': { opacity: 1 },
                    }}
                    onClick={() => handleImageClick(idx)}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Actions */}
        {!isEditing && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Tooltip title={isExecuting ? 'Running...' : 'Generate'}>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting || card.isLocked}
                  sx={{
                    bgcolor: isExecuting ? undefined : alpha(cardColor, 0.1),
                    '&:hover': { bgcolor: alpha(cardColor, 0.2) },
                  }}
                >
                  {isExecuting ? (
                    <CircularProgress size={20} />
                  ) : (
                    <PlayIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                disabled={card.isLocked}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

            {hasImages && (
              <Tooltip title="View Full Size">
                <IconButton
                  size="small"
                  onClick={() => window.open(displayImage, '_blank')}
                >
                  <OpenIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <Box sx={{ px: 1.5, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {card.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
});

export default CanvasNode;
