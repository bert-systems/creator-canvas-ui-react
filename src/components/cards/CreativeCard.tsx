/**
 * CreativeCard Component
 * Main card component for the Creative Canvas with 3 modes: hero, craft, mini
 *
 * Design Philosophy:
 * - Cards should feel like trading cards you collect
 * - Visual result is hero, controls are secondary
 * - Every card tells a story (what it does, what it made)
 * - Cards should be beautiful even empty (anticipation design)
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Paper, LinearProgress, alpha, Collapse } from '@mui/material';
import type { CanvasCard } from '../../models/creativeCanvas';
import { CATEGORY_INFO, getTemplateById } from '../../models/creativeCanvas';
import { creativeCardTokens } from '../../theme';
import creativeCanvasService from '../../services/creativeCanvasService';
import type { CardDisplayMode, CardState } from './cardAnimations';
import {
  getCardDimensions,
  transitions,
  cardAnimationStyles,
} from './cardAnimations';
import { CardPreview } from './CardPreview';
import { CardControls } from './CardControls';
import { QuickStyles } from './QuickStyles';

// ============================================================================
// CONSTANTS
// ============================================================================

const POLL_INTERVAL = 2000;

// ============================================================================
// TYPES
// ============================================================================

interface CreativeCardProps {
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

// ============================================================================
// COMPONENT
// ============================================================================

export const CreativeCard = memo(function CreativeCard({
  data,
  selected = false,
}: CreativeCardProps) {
  const { card, onUpdate, onDelete, onDuplicate, onError, onSuccess } = data;

  // Get template and category info
  const template = getTemplateById(card.templateId);
  const categoryKey = card.type?.split('-')[0] as keyof typeof CATEGORY_INFO;
  const categoryInfo = CATEGORY_INFO[categoryKey] || CATEGORY_INFO.fashion;
  const categoryColor = template?.color || categoryInfo.color;
  const categoryName = categoryKey || 'fashion';

  // ============================================================================
  // STATE
  // ============================================================================

  const [mode, setMode] = useState<CardDisplayMode>(card.isExpanded ? 'craft' : 'hero');
  const [isEditing, setIsEditing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(card.selectedImageIndex || 0);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showQuickStyles, setShowQuickStyles] = useState(false);
  const [cardState, setCardState] = useState<CardState>('idle');
  const [showCelebration, setShowCelebration] = useState(false);

  // Sync mode with card expansion state
  useEffect(() => {
    setMode(card.isExpanded ? 'craft' : 'hero');
  }, [card.isExpanded]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const dimensions = getCardDimensions(mode);
  const hasImages = (card.generatedImages?.length ?? 0) > 0;
  const displayImage = card.generatedImages?.[selectedImageIndex] || card.thumbnailUrl;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /** Save card edits */
  const handleSaveEdit = useCallback(async (title: string, prompt: string) => {
    try {
      const response = await creativeCanvasService.cards.update(card.id, {
        title,
        prompt,
      });

      if (response.success && response.data) {
        onUpdate?.({
          ...card,
          title,
          prompt,
        });
        setIsEditing(false);
        onSuccess?.('Card updated successfully');
      }
    } catch (err) {
      console.error('Failed to save card:', err);
      onError?.('Failed to save card');
    }
  }, [card, onUpdate, onSuccess, onError]);

  /** Cancel editing */
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  /** Execute workflow */
  const handleExecuteWorkflow = useCallback(async () => {
    setIsExecuting(true);
    setWorkflowProgress(0);
    setCurrentStage('Starting...');
    setCardState('generating');

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
              setCardState('completed');
              setShowCelebration(true);

              // Reset celebration after animation
              setTimeout(() => setShowCelebration(false), 1000);

              // Update card with generated assets
              const generatedImages = status.generatedAssets?.map(
                (a) => a.fullResolutionUrl || a.previewUrl
              ) || [];
              const thumbnailUrl = status.generatedAssets?.[0]?.previewUrl ||
                status.generatedAssets?.[0]?.thumbnailBase64;

              onUpdate?.({
                ...card,
                generatedImages,
                thumbnailUrl,
              });

              onSuccess?.('Images generated successfully!');
              setTimeout(() => setCardState('idle'), 2000);
              return;
            }

            if (status.status === 'failed') {
              setIsExecuting(false);
              setCurrentStage(null);
              setCardState('error');
              onError?.(status.errorMessage || 'Workflow failed');
              setTimeout(() => setCardState('idle'), 3000);
              return;
            }

            // Continue polling
            setTimeout(pollStatus, POLL_INTERVAL);
          }
        } catch (err) {
          console.error('Failed to poll status:', err);
          setIsExecuting(false);
          setCurrentStage(null);
          setCardState('error');
          onError?.('Failed to check workflow status');
          setTimeout(() => setCardState('idle'), 3000);
        }
      };

      // Start polling
      setTimeout(pollStatus, POLL_INTERVAL);
    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setIsExecuting(false);
      setCurrentStage(null);
      setCardState('error');
      onError?.('Failed to start workflow');
      setTimeout(() => setCardState('idle'), 3000);
    }
  }, [card, onUpdate, onError, onSuccess]);

  /** Toggle expanded/craft mode */
  const handleToggleMode = useCallback(async () => {
    const newExpanded = mode !== 'craft';
    setMode(newExpanded ? 'craft' : 'hero');

    try {
      await creativeCanvasService.cards.update(card.id, {
        isExpanded: newExpanded,
      });
      onUpdate?.({ ...card, isExpanded: newExpanded });
    } catch (err) {
      console.error('Failed to toggle mode:', err);
    }
  }, [mode, card, onUpdate]);

  /** Toggle locked state */
  const handleToggleLocked = useCallback(async () => {
    const newLocked = !card.isLocked;
    try {
      await creativeCanvasService.cards.update(card.id, {
        isLocked: newLocked,
      });
      onUpdate?.({ ...card, isLocked: newLocked });
    } catch (err) {
      console.error('Failed to toggle locked:', err);
    }
  }, [card, onUpdate]);

  /** Handle image selection */
  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    creativeCanvasService.cards.update(card.id, { selectedImageIndex: index }).catch(console.error);
  }, [card.id]);

  /** Download current image */
  const handleDownloadImage = useCallback(() => {
    const imageUrl = card.generatedImages?.[selectedImageIndex];
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${card.title || 'image'}_${selectedImageIndex + 1}.png`;
      link.click();
    }
  }, [card.generatedImages, card.title, selectedImageIndex]);

  /** Open image in new tab */
  const handleOpenFullSize = useCallback(() => {
    if (displayImage) {
      window.open(displayImage, '_blank');
    }
  }, [displayImage]);

  /** Toggle style selection */
  const handleToggleStyle = useCallback((styleId: string) => {
    setSelectedStyles((prev) =>
      prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId]
    );
  }, []);

  /** Handle delete */
  const handleDelete = useCallback(() => {
    onDelete?.(card.id);
  }, [card.id, onDelete]);

  /** Handle duplicate */
  const handleDuplicate = useCallback(() => {
    onDuplicate?.(card);
  }, [card, onDuplicate]);

  // ============================================================================
  // GET PORT STYLE
  // ============================================================================

  const getHandleStyle = (_type: 'source' | 'target') => ({
    backgroundColor: categoryColor,
    width: 12,
    height: 12,
    border: '2px solid white',
    boxShadow: `0 0 8px ${alpha(categoryColor, 0.4)}`,
    transition: transitions.fast,
  });

  // ============================================================================
  // MINI MODE RENDER
  // ============================================================================

  if (mode === 'mini') {
    return (
      <Paper
        elevation={selected ? 4 : 1}
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: `${creativeCardTokens.radius.button}px`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 0.5,
          border: '2px solid',
          borderColor: selected ? categoryColor : 'transparent',
          bgcolor: 'background.paper',
          transition: transitions.fast,
          cursor: 'pointer',
          '&:hover': {
            borderColor: alpha(categoryColor, 0.5),
          },
        }}
        onDoubleClick={handleToggleMode}
      >
        <Handle type="target" position={Position.Left} style={getHandleStyle('target')} />
        <Handle type="source" position={Position.Right} style={getHandleStyle('source')} />

        <CardPreview
          images={card.generatedImages || []}
          selectedIndex={selectedImageIndex}
          onSelectImage={handleImageClick}
          placeholder={card.thumbnailUrl}
          isGenerating={isExecuting}
          category={categoryName}
          mode="mini"
          title={card.title}
        />

        <CardControls
          title={card.title || template?.name || 'Untitled'}
          prompt={card.prompt || ''}
          isLocked={card.isLocked}
          isExecuting={isExecuting}
          currentStage={currentStage}
          category={categoryName}
          mode="mini"
          hasContent={hasImages}
        />
      </Paper>
    );
  }

  // ============================================================================
  // HERO/CRAFT MODE RENDER
  // ============================================================================

  return (
    <Paper
      elevation={selected ? 8 : 3}
      sx={{
        width: dimensions.width,
        minHeight: dimensions.height,
        borderRadius: `${creativeCardTokens.radius.card}px`,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: selected ? categoryColor : alpha(categoryColor, 0.2),
        bgcolor: 'background.paper',
        boxShadow: selected
          ? `${creativeCardTokens.shadows.cardActive} ${categoryColor}, ${creativeCardTokens.shadows.cardHover}`
          : creativeCardTokens.shadows.card,
        transition: transitions.normal,
        opacity: card.isLocked ? 0.85 : 1,
        position: 'relative',
        '--glow-color': categoryColor,
        ...(showCelebration && cardAnimationStyles.celebration),
        ...(cardState === 'error' && cardAnimationStyles.errorShake),
        ...(selected && { animation: undefined }), // Disable glow animation when selected
        '&:hover': {
          boxShadow: creativeCardTokens.shadows.cardHover,
          transform: card.isLocked ? 'none' : 'translateY(-2px)',
        },
      }}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Left} style={getHandleStyle('target')} />
      <Handle type="source" position={Position.Right} style={getHandleStyle('source')} />

      {/* Category Color Bar */}
      <Box
        sx={{
          height: 4,
          width: '100%',
          background: `linear-gradient(90deg, ${categoryColor} 0%, ${alpha(categoryColor, 0.5)} 100%)`,
        }}
      />

      {/* Card Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Preview Section */}
        <Box sx={{ p: 1.5, pb: 0 }}>
          <CardPreview
            images={card.generatedImages || []}
            selectedIndex={selectedImageIndex}
            onSelectImage={handleImageClick}
            placeholder={card.thumbnailUrl}
            isGenerating={isExecuting}
            progress={workflowProgress}
            category={categoryName}
            mode={mode}
            onGenerateMore={mode === 'craft' ? handleExecuteWorkflow : undefined}
            onDownload={hasImages ? handleDownloadImage : undefined}
            onOpenFullSize={hasImages ? handleOpenFullSize : undefined}
            title={card.title}
          />
        </Box>

        {/* Controls Section */}
        <CardControls
          title={card.title || template?.name || 'Untitled'}
          prompt={card.prompt || ''}
          isLocked={card.isLocked}
          isFavorite={isFavorite}
          isExecuting={isExecuting}
          currentStage={currentStage}
          category={categoryName}
          mode={mode}
          isEditing={isEditing}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onExecute={handleExecuteWorkflow}
          onToggleLock={handleToggleLocked}
          onToggleFavorite={() => setIsFavorite(!isFavorite)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onDownload={hasImages ? handleDownloadImage : undefined}
          hasContent={hasImages}
        />

        {/* Quick Styles (only in craft mode) */}
        <Collapse in={mode === 'craft' && !isEditing}>
          <QuickStyles
            selectedStyles={selectedStyles}
            onToggleStyle={handleToggleStyle}
            category={categoryName}
            isLocked={card.isLocked}
            expanded={showQuickStyles}
            onToggleExpanded={() => setShowQuickStyles(!showQuickStyles)}
          />
        </Collapse>

        {/* Progress Bar */}
        {isExecuting && (
          <LinearProgress
            variant="determinate"
            value={workflowProgress}
            sx={{
              height: 3,
              borderRadius: 0,
              bgcolor: alpha(categoryColor, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: categoryColor,
              },
            }}
          />
        )}
      </Box>

      {/* Locked Overlay */}
      {card.isLocked && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            bgcolor: alpha('#000', 0.1),
          }}
        />
      )}
    </Paper>
  );
});

export default CreativeCard;
