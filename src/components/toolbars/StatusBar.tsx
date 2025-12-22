/**
 * Status Bar
 *
 * Bottom status bar showing canvas stats, validation status, and execution progress.
 *
 * @module StatusBar
 * @version 4.0
 */

import { memo } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  CheckCircle as ValidIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Memory as MemoryIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import type { GraphValidationResult, ValidationIssue } from '@/models/unifiedNode';
import { brandColors } from '@/theme';

// ============================================================================
// TYPES
// ============================================================================

interface StatusBarProps {
  // Canvas stats
  nodeCount?: number;
  edgeCount?: number;
  selectedCount?: number;

  // Validation
  validationResult?: GraphValidationResult;

  // Execution
  isExecuting?: boolean;
  executingNodeCount?: number;
  executionProgress?: number;
  estimatedCost?: number;

  // Connection
  isOnline?: boolean;
  isSyncing?: boolean;
  lastSavedAt?: Date;

  // Callbacks
  onValidationClick?: () => void;
  onStatsClick?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function getValidationIcon(issues: ValidationIssue[]): React.ReactNode {
  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');

  if (hasErrors) {
    return <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />;
  }
  if (hasWarnings) {
    return <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />;
  }
  return <ValidIcon sx={{ fontSize: 14, color: 'success.main' }} />;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${diffHour}h ago`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const StatusBar = memo<StatusBarProps>(({
  nodeCount = 0,
  edgeCount = 0,
  selectedCount = 0,
  validationResult,
  isExecuting = false,
  executingNodeCount = 0,
  executionProgress,
  estimatedCost,
  isOnline = true,
  isSyncing = false,
  lastSavedAt,
  onValidationClick,
  onStatsClick,
}) => {
  const issues = validationResult?.issues || [];
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 0.5,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        minHeight: 28,
      }}
    >
      {/* Execution Progress */}
      {isExecuting && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant={executionProgress !== undefined ? 'determinate' : 'indeterminate'}
              value={executionProgress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(brandColors.tealPulse, 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: brandColors.tealPulse,
                },
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {executingNodeCount} running
          </Typography>
        </Box>
      )}

      {/* Validation Status */}
      <Tooltip
        title={
          validationResult
            ? `${errorCount} errors, ${warningCount} warnings`
            : 'No validation data'
        }
      >
        <Chip
          icon={validationResult ? getValidationIcon(issues) as React.ReactElement : <InfoIcon sx={{ fontSize: 14 }} />}
          label={
            validationResult
              ? validationResult.valid
                ? 'Valid'
                : `${errorCount + warningCount} issues`
              : 'Not validated'
          }
          size="small"
          onClick={onValidationClick}
          sx={{
            height: 22,
            fontSize: '0.7rem',
            cursor: onValidationClick ? 'pointer' : 'default',
            bgcolor: validationResult?.valid
              ? alpha('#10b981', 0.1)
              : errorCount > 0
                ? alpha('#ef4444', 0.1)
                : alpha('#6b7280', 0.1),
            color: validationResult?.valid
              ? '#10b981'
              : errorCount > 0
                ? '#ef4444'
                : '#6b7280',
            '&:hover': onValidationClick
              ? { bgcolor: validationResult?.valid ? alpha('#10b981', 0.2) : alpha('#ef4444', 0.2) }
              : undefined,
          }}
        />
      </Tooltip>

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Estimated Cost */}
      {estimatedCost !== undefined && estimatedCost > 0 && (
        <Tooltip title="Estimated execution cost">
          <Typography
            variant="caption"
            sx={{
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: alpha('#f59e0b', 0.1),
              color: '#f59e0b',
              fontWeight: 500,
            }}
          >
            ~${estimatedCost.toFixed(2)}
          </Typography>
        </Tooltip>
      )}

      {/* Canvas Stats */}
      <Tooltip title="Click for detailed stats">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'action.hover',
            cursor: onStatsClick ? 'pointer' : 'default',
            '&:hover': onStatsClick ? { bgcolor: 'action.selected' } : undefined,
          }}
          onClick={onStatsClick}
        >
          <Typography variant="caption" color="text.secondary">
            {nodeCount} nodes
          </Typography>
          <Typography variant="caption" color="text.disabled">•</Typography>
          <Typography variant="caption" color="text.secondary">
            {edgeCount} edges
          </Typography>
          {selectedCount > 0 && (
            <>
              <Typography variant="caption" color="text.disabled">•</Typography>
              <Typography variant="caption" color="primary.main" fontWeight={500}>
                {selectedCount} selected
              </Typography>
            </>
          )}
        </Box>
      </Tooltip>

      {/* Sync Status */}
      <Tooltip
        title={
          !isOnline
            ? 'Offline - changes saved locally'
            : isSyncing
              ? 'Syncing...'
              : lastSavedAt
                ? `Last saved ${formatRelativeTime(lastSavedAt)}`
                : 'Not saved'
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {!isOnline ? (
            <CloudOffIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          ) : isSyncing ? (
            <SyncIcon sx={{ fontSize: 14, color: 'info.main', animation: 'spin 1s linear infinite', '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } } }} />
          ) : (
            <CloudIcon sx={{ fontSize: 14, color: 'success.main' }} />
          )}
          {lastSavedAt && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {formatRelativeTime(lastSavedAt)}
            </Typography>
          )}
        </Box>
      </Tooltip>

      {/* Memory Usage (Development only) */}
      {import.meta.env.DEV && (
        <Tooltip title="Memory usage">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MemoryIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
              DEV
            </Typography>
          </Box>
        </Tooltip>
      )}
    </Box>
  );
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;
