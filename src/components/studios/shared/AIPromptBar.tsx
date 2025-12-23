/**
 * AIPromptBar - Clean, minimal AI prompt input
 * Focus on the text, not the chrome
 */

import React, { useState, useCallback, type KeyboardEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SendIcon from '@mui/icons-material/Send';
import { studioColors, studioRadii, studioMotion, studioTypography } from './studioTokens';
import { promptService } from '@/services/promptService';

export interface AIPromptBarProps {
  /** Callback when prompt is submitted */
  onSubmit: (prompt: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Enable prompt enhancement button */
  enableEnhance?: boolean;
  /** Show loading state */
  isLoading?: boolean;
  /** Disable input */
  disabled?: boolean;
  /** Initial value */
  defaultValue?: string;
  /** Submit button label */
  submitLabel?: string;
  /** Compact mode - smaller height */
  compact?: boolean;
}

export const AIPromptBar: React.FC<AIPromptBarProps> = ({
  onSubmit,
  placeholder = 'Describe what you want to create...',
  enableEnhance = true,
  isLoading = false,
  disabled = false,
  defaultValue = '',
  submitLabel = 'Generate',
  compact = false,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = useCallback(async () => {
    if (!value.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const enhanced = await promptService.quickImprove(value);
      if (enhanced && enhanced !== value) {
        setValue(enhanced);
      }
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [value, isEnhancing]);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isLoading || disabled) return;
    onSubmit(value.trim());
  }, [value, isLoading, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      // Cmd/Ctrl + E to enhance
      if (e.key === 'e' && (e.metaKey || e.ctrlKey) && enableEnhance) {
        e.preventDefault();
        handleEnhance();
      }
    },
    [handleSubmit, handleEnhance, enableEnhance]
  );

  const canSubmit = value.trim().length > 0 && !isLoading && !disabled;

  return (
    <Box
      sx={{
        background: studioColors.surface1,
        border: `1px solid ${studioColors.border}`,
        borderRadius: `${studioRadii.md}px`,
        transition: `border-color ${studioMotion.fast}`,
        '&:focus-within': {
          borderColor: studioColors.borderHover,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: compact ? 1.5 : 2,
          gap: 1.5,
        }}
      >
        {/* Input field */}
        <TextField
          fullWidth
          multiline={!compact}
          maxRows={compact ? 1 : 4}
          variant="standard"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: compact ? studioTypography.fontSize.md : studioTypography.fontSize.base,
              color: studioColors.textPrimary,
              fontFamily: studioTypography.fontFamily,
              '& ::placeholder': {
                color: studioColors.textTertiary,
                opacity: 1,
              },
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              background: 'transparent',
              padding: 0,
            },
          }}
        />

        {/* Enhance button */}
        {enableEnhance && value.trim() && (
          <Tooltip title="Enhance prompt (⌘E)" placement="top">
            <IconButton
              onClick={handleEnhance}
              disabled={isEnhancing || isLoading || disabled}
              size="small"
              sx={{
                color: studioColors.textTertiary,
                '&:hover': {
                  color: studioColors.textSecondary,
                  background: studioColors.surface2,
                },
              }}
            >
              {isEnhancing ? (
                <CircularProgress size={18} sx={{ color: studioColors.textTertiary }} />
              ) : (
                <AutoFixHighIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
        )}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size={compact ? 'small' : 'medium'}
          sx={{
            px: compact ? 2 : 2.5,
            py: compact ? 0.5 : 0.75,
            minWidth: compact ? 'auto' : 100,
            borderRadius: `${studioRadii.md - 2}px`,
            fontSize: compact ? studioTypography.fontSize.sm : studioTypography.fontSize.md,
            fontWeight: studioTypography.fontWeight.semibold,
            textTransform: 'none',
            background: canSubmit ? studioColors.accent : studioColors.surface3,
            color: canSubmit ? studioColors.textPrimary : studioColors.textMuted,
            transition: `all ${studioMotion.fast}`,
            '&:hover': {
              background: canSubmit ? studioColors.accentMuted : studioColors.surface3,
            },
            '&.Mui-disabled': {
              background: studioColors.surface3,
              color: studioColors.textMuted,
            },
          }}
          endIcon={
            isLoading ? (
              <CircularProgress size={16} sx={{ color: 'inherit' }} />
            ) : compact ? (
              <SendIcon sx={{ fontSize: 16 }} />
            ) : null
          }
        >
          {compact ? '' : submitLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default AIPromptBar;
