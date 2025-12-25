/**
 * FlowMode - Base component for guided step-by-step workflows
 * Provides step navigation, progress indicator, and consistent layout
 */

import React, { useCallback, type ReactNode } from 'react';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import { studioColors, studioMotion, studioTypography } from '../shared/studioTokens';

export interface FlowStep {
  id: string;
  label: string;
  description?: string;
  /** Whether this step can be skipped */
  optional?: boolean;
  /** Validation function - returns true if step is complete */
  isComplete?: () => boolean;
}

export interface FlowModeProps {
  /** Steps configuration */
  steps: FlowStep[];
  /** Current step index */
  currentStep: number;
  /** Step change callback */
  onStepChange: (step: number) => void;
  /** Completion callback */
  onComplete: () => void;
  /** Cancel/back callback */
  onCancel?: () => void;
  /** Title displayed above steps */
  title?: string;
  /** Render function for current step content */
  children: ReactNode;
  /** Whether the current step is valid/complete */
  canProceed?: boolean;
  /** Custom next button label */
  nextLabel?: string;
  /** Whether currently processing */
  isProcessing?: boolean;
}

export const FlowMode: React.FC<FlowModeProps> = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  onCancel,
  title,
  children,
  canProceed = true,
  nextLabel,
  isProcessing = false,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    } else if (onCancel) {
      onCancel();
    }
  }, [currentStep, onStepChange, onCancel]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, isLastStep, onStepChange, onComplete]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        background: studioColors.ink,
      }}
    >
      {/* Header with progress */}
      <Box
        sx={{
          px: 4,
          pt: 4,
          pb: 3,
        }}
      >
        {/* Title */}
        {title && (
          <Typography
            sx={{
              fontSize: studioTypography.fontSize['2xl'],
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
              mb: 3,
              textAlign: 'center',
            }}
          >
            {title}
          </Typography>
        )}

        {/* Step indicators */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* Connector line */}
                {index > 0 && (
                  <Box
                    sx={{
                      width: 40,
                      height: 2,
                      background: isCompleted ? studioColors.accent : studioColors.border,
                      transition: `background ${studioMotion.standard}`,
                    }}
                  />
                )}

                {/* Step dot */}
                <Box
                  onClick={() => isCompleted && onStepChange(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isActive
                      ? studioColors.accent
                      : isCompleted
                      ? studioColors.accentMuted
                      : studioColors.surface2,
                    border: `2px solid ${
                      isActive ? studioColors.accent : isCompleted ? studioColors.accentMuted : studioColors.border
                    }`,
                    cursor: isCompleted ? 'pointer' : 'default',
                    transition: `all ${studioMotion.standard}`,
                    '&:hover': isCompleted
                      ? {
                          background: studioColors.accent,
                          borderColor: studioColors.accent,
                        }
                      : {},
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon sx={{ fontSize: 16, color: studioColors.textPrimary }} />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: isActive ? studioColors.textPrimary : studioColors.textTertiary,
                      }}
                    >
                      {index + 1}
                    </Typography>
                  )}
                </Box>
              </React.Fragment>
            );
          })}
        </Box>

        {/* Current step label */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.md,
              fontWeight: studioTypography.fontWeight.medium,
              color: studioColors.textPrimary,
            }}
          >
            {steps[currentStep]?.label}
          </Typography>
          {steps[currentStep]?.description && (
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textTertiary,
                mt: 0.5,
              }}
            >
              {steps[currentStep].description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 2,
          background: studioColors.border,
          '& .MuiLinearProgress-bar': {
            background: studioColors.accent,
            transition: `transform ${studioMotion.standard}`,
          },
        }}
      />

      {/* Content area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          px: 4,
          py: 4,
        }}
      >
        {children}
      </Box>

      {/* Footer with navigation */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 3,
          borderTop: `1px solid ${studioColors.borderSubtle}`,
          background: studioColors.carbon,
        }}
      >
        {/* Back button */}
        <Button
          onClick={handleBack}
          disabled={isProcessing}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: studioColors.textSecondary,
            '&:hover': {
              background: studioColors.surface2,
              color: studioColors.textPrimary,
            },
          }}
        >
          {isFirstStep && onCancel ? 'Cancel' : 'Back'}
        </Button>

        {/* Step counter */}
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.sm,
            color: studioColors.textMuted,
          }}
        >
          Step {currentStep + 1} of {steps.length}
        </Typography>

        {/* Next/Complete button */}
        <Button
          onClick={handleNext}
          disabled={!canProceed || isProcessing}
          endIcon={isLastStep ? <CheckIcon /> : <ArrowForwardIcon />}
          sx={{
            px: 3,
            background: canProceed ? studioColors.accent : studioColors.surface3,
            color: canProceed ? studioColors.textPrimary : studioColors.textMuted,
            '&:hover': {
              background: canProceed ? studioColors.accentMuted : studioColors.surface3,
            },
            '&.Mui-disabled': {
              background: studioColors.surface3,
              color: studioColors.textMuted,
            },
          }}
        >
          {nextLabel || (isLastStep ? 'Complete' : 'Next')}
        </Button>
      </Box>
    </Box>
  );
};

export default FlowMode;
