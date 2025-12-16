/**
 * AgentPresence Component
 *
 * Floating bottom-right presence panel that shows:
 * - Proactive agent suggestions
 * - Quick agent access buttons
 * - Unread message count
 *
 * Like Intercom but smarter - provides contextual creative assistance.
 */

import { memo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Badge,
  Collapse,
  Button,
  Avatar,
  Fade,
  Tooltip,
  alpha,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { agentOrchestrator } from '../../services/agentOrchestrator';
import type { AgentMessage, AgentState, AgentPersona } from '../../models/agents';
import { AGENT_DEFINITIONS } from '../../models/agents';
import { creativeCardTokens } from '../../theme';
import { glassStyles, transitions } from '../cards/cardAnimations';

// ============================================================================
// TYPES
// ============================================================================

interface AgentPresenceProps {
  /** Callback when panel should open */
  onOpenPanel?: (agentId?: AgentPersona) => void;
  /** Callback when a message action is clicked */
  onAction?: (message: AgentMessage, actionId: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AgentPresence = memo(function AgentPresence({
  onOpenPanel,
  onAction,
}: AgentPresenceProps) {
  const [state, setState] = useState<AgentState>(agentOrchestrator.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<AgentMessage | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = agentOrchestrator.subscribe(setState);
    return unsubscribe;
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = agentOrchestrator.subscribeToMessages((message) => {
      if (!message.isDismissed && !message.isRead) {
        setCurrentMessage(message);
        setShowMessage(true);
      }
    });
    return unsubscribe;
  }, []);

  // Auto-hide message after 10 seconds
  useEffect(() => {
    if (showMessage && currentMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showMessage, currentMessage]);

  const handleDismissMessage = useCallback(() => {
    if (currentMessage) {
      agentOrchestrator.dismissMessage(currentMessage.id);
      setShowMessage(false);
    }
  }, [currentMessage]);

  const handleActionClick = useCallback((actionId: string) => {
    if (currentMessage) {
      const action = currentMessage.actions?.find((a) => a.id === actionId);
      if (action) {
        agentOrchestrator.executeAction(currentMessage, action);
        onAction?.(currentMessage, actionId);
      }
      setShowMessage(false);
    }
  }, [currentMessage, onAction]);

  const handleAgentClick = useCallback((agentId: AgentPersona) => {
    onOpenPanel?.(agentId);
  }, [onOpenPanel]);

  if (!state.isPresenceVisible) {
    return null;
  }

  const agent = currentMessage ? AGENT_DEFINITIONS[currentMessage.agentId] : null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1.5,
      }}
    >
      {/* Proactive Message Card */}
      <Fade in={showMessage && !!currentMessage}>
        <Paper
          elevation={8}
          sx={{
            width: 340,
            maxWidth: 'calc(100vw - 48px)',
            borderRadius: `${creativeCardTokens.radius.card}px`,
            overflow: 'hidden',
            ...glassStyles.background,
            border: agent ? `1px solid ${alpha(agent.color, 0.3)}` : undefined,
          }}
        >
          {agent && currentMessage && (
            <>
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  pb: 1,
                  borderBottom: `1px solid ${alpha(agent.color, 0.1)}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(agent.color, 0.2),
                    fontSize: '1.25rem',
                  }}
                >
                  {agent.emoji}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: agent.color }}
                  >
                    {currentMessage.title}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={handleDismissMessage}
                  sx={{ ml: 'auto' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Content */}
              <Box sx={{ p: 1.5, pt: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {currentMessage.content}
                </Typography>
              </Box>

              {/* Actions */}
              {currentMessage.actions && currentMessage.actions.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    p: 1.5,
                    pt: 0.5,
                    borderTop: `1px solid ${alpha(agent.color, 0.1)}`,
                  }}
                >
                  {currentMessage.actions.map((action) => (
                    <Button
                      key={action.id}
                      size="small"
                      variant={action.primary ? 'contained' : 'text'}
                      onClick={() => handleActionClick(action.id)}
                      sx={{
                        borderRadius: `${creativeCardTokens.radius.button}px`,
                        textTransform: 'none',
                        fontWeight: 500,
                        ...(action.primary
                          ? {
                              bgcolor: agent.color,
                              '&:hover': { bgcolor: alpha(agent.color, 0.85) },
                            }
                          : {
                              color: 'text.secondary',
                              '&:hover': { bgcolor: alpha(agent.color, 0.1) },
                            }),
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              )}
            </>
          )}
        </Paper>
      </Fade>

      {/* Agent Quick Access Bar */}
      <Collapse in={isExpanded} orientation="vertical">
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 1,
            borderRadius: `${creativeCardTokens.radius.card}px`,
            ...glassStyles.background,
            mb: 1,
          }}
        >
          {Object.values(AGENT_DEFINITIONS).map((agentDef) => {
            const isEnabled = state.preferences.enabledAgents.includes(agentDef.id);
            return (
              <Tooltip key={agentDef.id} title={agentDef.title} placement="left">
                <IconButton
                  onClick={() => handleAgentClick(agentDef.id)}
                  disabled={!isEnabled}
                  sx={{
                    width: 44,
                    height: 44,
                    fontSize: '1.5rem',
                    opacity: isEnabled ? 1 : 0.4,
                    '&:hover': {
                      bgcolor: alpha(agentDef.color, 0.15),
                    },
                  }}
                >
                  {agentDef.emoji}
                </IconButton>
              </Tooltip>
            );
          })}

          <Divider sx={{ my: 0.5 }} />

          <IconButton
            onClick={() => setIsExpanded(false)}
            size="small"
            sx={{ alignSelf: 'center' }}
          >
            <CollapseIcon />
          </IconButton>
        </Paper>
      </Collapse>

      {/* Main Presence Button */}
      <Badge
        badgeContent={state.unreadCount}
        color="primary"
        overlap="circular"
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.7rem',
            height: 18,
            minWidth: 18,
          },
        }}
      >
        <Paper
          elevation={6}
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${alpha('#6366f1', 0.9)} 0%, ${alpha('#a855f7', 0.9)} 100%)`,
            boxShadow: `0 4px 20px ${alpha('#6366f1', 0.4)}`,
            transition: transitions.fast,
            '&:hover': {
              transform: 'scale(1.08)',
              boxShadow: `0 6px 24px ${alpha('#6366f1', 0.5)}`,
            },
          }}
        >
          <Typography sx={{ fontSize: '1.75rem' }}>
            {isExpanded ? '✨' : '🪄'}
          </Typography>
        </Paper>
      </Badge>

      {/* Helper Text */}
      <Fade in={!isExpanded && state.unreadCount === 0}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            textAlign: 'right',
            maxWidth: 150,
            lineHeight: 1.3,
          }}
        >
          Click for creative assistants
        </Typography>
      </Fade>
    </Box>
  );
});

export default AgentPresence;
