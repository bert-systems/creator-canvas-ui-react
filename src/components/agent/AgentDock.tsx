/**
 * AgentDock - Floating panel for AI agent status and interaction
 * Per UX Strategy Section 6.2 - Shows agent status, plan, tools, and actions
 *
 * Features:
 * - Collapsible panel
 * - Status indicator with 7 states
 * - Plan summary (1-3 bullets)
 * - Tool transparency (shows which tools will be used)
 * - Clear action buttons (Cancel/Proceed)
 * - Trust UI patterns (undo/rollback visible)
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Remove as MinimizeIcon,
  Add as ExpandIcon,
  Close as CloseIcon,
  Undo as UndoIcon,
  CheckCircleOutline as ApproveIcon,
  Cancel as CancelIcon,
  Build as ToolIcon,
  PlaylistAddCheck as PlanIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { brandColors, darkNeutrals, creativeCardTokens } from '@/theme';
import { AgentStatusIndicator, AgentDotIndicator, type AgentStatus } from './AgentStatusIndicator';
import { focusRing, entranceAnimation } from '@/styles/microInteractions';

// ============================================================================
// Types
// ============================================================================

export interface AgentPlanItem {
  id: string;
  text: string;
  completed?: boolean;
}

export interface AgentTool {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

export interface AgentAction {
  id: string;
  description: string;
  timestamp: Date;
  canUndo?: boolean;
}

export interface AgentDockProps {
  /** Current agent status */
  status: AgentStatus;
  /** Agent name/title */
  agentName?: string;
  /** Custom status message */
  statusMessage?: string;
  /** Plan items to display (1-3 bullets) */
  plan?: AgentPlanItem[];
  /** Tools the agent will use */
  tools?: AgentTool[];
  /** Recent actions for undo/history */
  recentActions?: AgentAction[];
  /** Whether agent needs user approval */
  needsApproval?: boolean;
  /** Called when user approves action */
  onApprove?: () => void;
  /** Called when user cancels/rejects */
  onCancel?: () => void;
  /** Called when user wants to undo last action */
  onUndo?: () => void;
  /** Called when dock is closed */
  onClose?: () => void;
  /** Whether the dock is visible */
  visible?: boolean;
  /** Position of the dock */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

// ============================================================================
// Component
// ============================================================================

export const AgentDock = memo(function AgentDock({
  status,
  agentName = 'SmartAI Agent',
  statusMessage,
  plan = [],
  tools = [],
  recentActions = [],
  needsApproval = false,
  onApprove,
  onCancel,
  onUndo,
  onClose,
  visible = true,
  position = 'bottom-right',
}: AgentDockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleToggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  // Position styles
  const positionStyles = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 80, right: 24 },
    'top-left': { top: 80, left: 24 },
  };

  if (!visible) return null;

  const canUndo = recentActions.some((action) => action.canUndo);
  const showActions = needsApproval || status === 'needsApproval';

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        ...positionStyles[position],
        width: 320,
        maxHeight: '70vh',
        borderRadius: `${creativeCardTokens.radius.card}px`,
        bgcolor: darkNeutrals.surface2,
        border: `1px solid ${darkNeutrals.border}`,
        overflow: 'hidden',
        zIndex: 1000,
        ...entranceAnimation,
        boxShadow: `0 8px 32px ${alpha('#000', 0.3)}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: darkNeutrals.surface1,
          borderBottom: `1px solid ${darkNeutrals.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AgentIcon sx={{ color: brandColors.tealPulse, fontSize: 24 }} />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: darkNeutrals.textPrimary,
              fontFamily: '"Comfortaa", sans-serif',
            }}
          >
            {agentName}
          </Typography>
          {!isExpanded && <AgentDotIndicator status={status} size={8} />}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={isExpanded ? 'Minimize' : 'Expand'}>
            <IconButton
              size="small"
              onClick={handleToggleExpand}
              sx={{ ...focusRing, color: darkNeutrals.textSecondary }}
            >
              {isExpanded ? <MinimizeIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {onClose && (
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ ...focusRing, color: darkNeutrals.textSecondary }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Expandable Content */}
      <Collapse in={isExpanded} timeout={200}>
        <Box sx={{ p: 2 }}>
          {/* Status Indicator */}
          <Box sx={{ mb: 2 }}>
            <AgentStatusIndicator
              status={status}
              size="medium"
              label={statusMessage}
            />
          </Box>

          {/* Plan Section */}
          {plan.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <PlanIcon sx={{ fontSize: 16, color: darkNeutrals.textTertiary }} />
                <Typography
                  variant="caption"
                  sx={{ color: darkNeutrals.textTertiary, fontWeight: 600 }}
                >
                  Plan:
                </Typography>
              </Box>
              <List dense disablePadding>
                {plan.slice(0, 3).map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      py: 0.25,
                      px: 0,
                      '&::before': {
                        content: '"•"',
                        color: item.completed ? brandColors.mintGlow : darkNeutrals.textSecondary,
                        mr: 1,
                      },
                    }}
                  >
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: {
                          color: item.completed
                            ? darkNeutrals.textTertiary
                            : darkNeutrals.textSecondary,
                          textDecoration: item.completed ? 'line-through' : 'none',
                          fontSize: '0.8125rem',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Tools Section */}
          {tools.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <ToolIcon sx={{ fontSize: 16, color: darkNeutrals.textTertiary }} />
                <Typography
                  variant="caption"
                  sx={{ color: darkNeutrals.textTertiary, fontWeight: 600 }}
                >
                  Tools:
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tools.map((tool) => (
                  <Chip
                    key={tool.id}
                    label={tool.name}
                    size="small"
                    icon={tool.icon as React.ReactElement}
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: alpha(brandColors.tealPulse, 0.1),
                      color: brandColors.tealPulse,
                      '& .MuiChip-icon': {
                        color: brandColors.tealPulse,
                        fontSize: 14,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 1.5, borderColor: darkNeutrals.border }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Undo Button */}
            {canUndo && onUndo && (
              <Tooltip title="Undo last action">
                <IconButton
                  size="small"
                  onClick={onUndo}
                  sx={{
                    ...focusRing,
                    color: darkNeutrals.textSecondary,
                    '&:hover': {
                      color: brandColors.sunsetOrange,
                      bgcolor: alpha(brandColors.sunsetOrange, 0.1),
                    },
                  }}
                >
                  <UndoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* History Button */}
            {recentActions.length > 0 && (
              <Tooltip title="View history">
                <IconButton
                  size="small"
                  onClick={handleToggleHistory}
                  sx={{
                    ...focusRing,
                    color: showHistory ? brandColors.tealPulse : darkNeutrals.textSecondary,
                    bgcolor: showHistory ? alpha(brandColors.tealPulse, 0.1) : 'transparent',
                  }}
                >
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Box sx={{ flex: 1 }} />

            {/* Cancel/Proceed Buttons for approval states */}
            {showActions && (
              <>
                {onCancel && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={onCancel}
                    sx={{
                      borderColor: darkNeutrals.border,
                      color: darkNeutrals.textSecondary,
                      textTransform: 'none',
                      fontSize: '0.8125rem',
                      ...focusRing,
                      '&:hover': {
                        borderColor: brandColors.coralSpark,
                        color: brandColors.coralSpark,
                        bgcolor: alpha(brandColors.coralSpark, 0.05),
                      },
                    }}
                  >
                    Cancel
                  </Button>
                )}
                {onApprove && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ApproveIcon />}
                    onClick={onApprove}
                    sx={{
                      bgcolor: brandColors.tealPulse,
                      color: darkNeutrals.ink,
                      textTransform: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      ...focusRing,
                      '&:hover': {
                        bgcolor: brandColors.mintGlow,
                      },
                    }}
                  >
                    Proceed
                  </Button>
                )}
              </>
            )}
          </Box>

          {/* History Panel */}
          <Collapse in={showHistory} timeout={200}>
            <Box
              sx={{
                mt: 1.5,
                p: 1,
                bgcolor: darkNeutrals.surface1,
                borderRadius: 1,
                maxHeight: 150,
                overflowY: 'auto',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: darkNeutrals.textTertiary, fontWeight: 600, mb: 0.5, display: 'block' }}
              >
                Recent Actions
              </Typography>
              {recentActions.slice(0, 5).map((action) => (
                <Box
                  key={action.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.5,
                    borderBottom: `1px solid ${alpha(darkNeutrals.border, 0.5)}`,
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: darkNeutrals.textSecondary, flex: 1 }}
                  >
                    {action.description}
                  </Typography>
                  {action.canUndo && (
                    <IconButton
                      size="small"
                      onClick={onUndo}
                      sx={{
                        p: 0.25,
                        color: darkNeutrals.textTertiary,
                        '&:hover': { color: brandColors.sunsetOrange },
                      }}
                    >
                      <UndoIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      </Collapse>
    </Paper>
  );
});

export default AgentDock;
