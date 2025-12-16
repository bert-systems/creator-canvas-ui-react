/**
 * AgentPanel Component
 *
 * Full slide-in panel for active engagement with Creative Collaborator agents.
 * Features:
 * - Agent persona tabs
 * - Analysis progress visualization
 * - Suggestion cards with actions
 * - Message history
 * - Settings
 */

import { memo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  TextField,
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Switch,
  FormControlLabel,
  Fade,
  Slide,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Lightbulb as SuggestionIcon,
} from '@mui/icons-material';
import { agentOrchestrator } from '../../services/agentOrchestrator';
import type { AgentState, AgentPersona, AgentSuggestion } from '../../models/agents';
import { AGENT_DEFINITIONS } from '../../models/agents';
import { creativeCardTokens } from '../../theme';

// ============================================================================
// TYPES
// ============================================================================

interface AgentPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Initial agent to show */
  initialAgent?: AgentPersona;
  /** Width of the panel */
  width?: number;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SuggestionCardProps {
  suggestion: AgentSuggestion;
  onAction: (suggestionId: string, actionId: string) => void;
}

const SuggestionCard = memo(function SuggestionCard({
  suggestion,
  onAction,
}: SuggestionCardProps) {
  const agent = AGENT_DEFINITIONS[suggestion.agentId];

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: alpha(agent.color, 0.05),
        border: `1px solid ${alpha(agent.color, 0.15)}`,
        borderRadius: `${creativeCardTokens.radius.inner}px`,
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <SuggestionIcon sx={{ color: agent.color, fontSize: 20, mt: 0.25 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {suggestion.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {suggestion.description}
            </Typography>
          </Box>
          <Chip
            label={`${Math.round(suggestion.confidence * 100)}%`}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: alpha(agent.color, 0.15),
              color: agent.color,
            }}
          />
        </Box>

        {suggestion.preview && (
          <Box
            component="img"
            src={suggestion.preview}
            alt="Preview"
            sx={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: `${creativeCardTokens.radius.thumbnail}px`,
              mt: 1,
            }}
          />
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 1 }}>
        {suggestion.actions.map((action) => (
          <Button
            key={action.id}
            size="small"
            variant={action.primary ? 'contained' : 'outlined'}
            onClick={() => onAction(suggestion.id, action.id)}
            sx={{
              borderRadius: `${creativeCardTokens.radius.button}px`,
              textTransform: 'none',
              ...(action.primary
                ? {
                    bgcolor: agent.color,
                    '&:hover': { bgcolor: alpha(agent.color, 0.85) },
                  }
                : {
                    borderColor: alpha(agent.color, 0.3),
                    color: agent.color,
                    '&:hover': {
                      borderColor: agent.color,
                      bgcolor: alpha(agent.color, 0.1),
                    },
                  }),
            }}
          >
            {action.label}
          </Button>
        ))}
      </CardActions>
    </Card>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AgentPanel = memo(function AgentPanel({
  open,
  onClose,
  initialAgent = 'muse',
  width = 380,
}: AgentPanelProps) {
  const [state, setState] = useState<AgentState>(agentOrchestrator.getState());
  const [activeTab, setActiveTab] = useState<AgentPersona>(initialAgent);
  const [inputValue, setInputValue] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = agentOrchestrator.subscribe(setState);
    return unsubscribe;
  }, []);

  // Update active tab when initialAgent changes
  useEffect(() => {
    if (initialAgent) {
      setActiveTab(initialAgent);
    }
  }, [initialAgent]);

  const activeAgent = AGENT_DEFINITIONS[activeTab];
  const agentSuggestions = state.suggestions.filter((s) => s.agentId === activeTab);
  const agentMessages = state.messages.filter((m) => m.agentId === activeTab && !m.isDismissed);

  const handleTabChange = useCallback((_: unknown, newValue: AgentPersona) => {
    setActiveTab(newValue);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim()) return;

    // Create a user request message and trigger agent response
    // This would integrate with AI backend
    console.log(`Asking ${activeTab}:`, inputValue);
    setInputValue('');

    // Simulate agent thinking
    agentOrchestrator.startAnalysis(activeTab);
    setTimeout(() => {
      agentOrchestrator.completeAnalysis();
      agentOrchestrator.addSuggestion({
        agentId: activeTab,
        title: `${activeAgent.emoji} Response`,
        description: `Based on your request: "${inputValue.slice(0, 50)}...", here's what I suggest...`,
        confidence: 0.8,
        actions: [
          { id: 'apply', label: 'Apply', primary: true, action: 'apply' },
          { id: 'modify', label: 'Modify', action: 'modify' },
        ],
      });
    }, 1500);
  }, [inputValue, activeTab, activeAgent.emoji]);

  const handleSuggestionAction = useCallback((suggestionId: string, actionId: string) => {
    const suggestion = state.suggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      const action = suggestion.actions.find((a) => a.id === actionId);
      if (action?.action === 'dismiss') {
        agentOrchestrator.removeSuggestion(suggestionId);
      }
      // Other actions would be handled here
    }
  }, [state.suggestions]);

  const handleToggleAgent = useCallback((agentId: AgentPersona) => {
    const currentEnabled = state.preferences.enabledAgents;
    const newEnabled = currentEnabled.includes(agentId)
      ? currentEnabled.filter((id) => id !== agentId)
      : [...currentEnabled, agentId];
    agentOrchestrator.savePreferences({ enabledAgents: newEnabled });
  }, [state.preferences.enabledAgents]);

  const handleRefresh = useCallback(() => {
    agentOrchestrator.startAnalysis(activeTab);
    setTimeout(() => {
      agentOrchestrator.completeAnalysis();
    }, 1000);
  }, [activeTab]);

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={16}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderLeft: `1px solid ${alpha('#fff', 0.08)}`,
          zIndex: 1300,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            borderBottom: `1px solid ${alpha(activeAgent.color, 0.15)}`,
            background: `linear-gradient(135deg, ${alpha(activeAgent.color, 0.1)} 0%, transparent 100%)`,
          }}
        >
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: alpha(activeAgent.color, 0.2),
              fontSize: '1.5rem',
            }}
          >
            {activeAgent.emoji}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: activeAgent.color }}>
              {activeAgent.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeAgent.title}
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={state.isAnalyzing}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton
              size="small"
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Agent Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid ${alpha('#fff', 0.08)}`,
            '& .MuiTab-root': {
              minWidth: 64,
              px: 1.5,
            },
          }}
        >
          {Object.values(AGENT_DEFINITIONS).map((agent) => (
            <Tab
              key={agent.id}
              value={agent.id}
              label={
                <Tooltip title={agent.name}>
                  <span style={{ fontSize: '1.25rem' }}>{agent.emoji}</span>
                </Tooltip>
              }
              disabled={!state.preferences.enabledAgents.includes(agent.id)}
              sx={{
                '&.Mui-selected': {
                  color: agent.color,
                },
              }}
            />
          ))}
        </Tabs>

        {/* Settings Panel */}
        <Fade in={showSettings}>
          <Box
            sx={{
              position: 'absolute',
              top: 120,
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderBottom: `1px solid ${alpha('#fff', 0.08)}`,
              p: 2,
              zIndex: 1,
              display: showSettings ? 'block' : 'none',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Agent Settings
            </Typography>
            {Object.values(AGENT_DEFINITIONS).map((agent) => (
              <FormControlLabel
                key={agent.id}
                control={
                  <Switch
                    size="small"
                    checked={state.preferences.enabledAgents.includes(agent.id)}
                    onChange={() => handleToggleAgent(agent.id)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{agent.emoji}</span>
                    <Typography variant="body2">{agent.name}</Typography>
                  </Box>
                }
                sx={{ mb: 0.5 }}
              />
            ))}
          </Box>
        </Fade>

        {/* Analysis Progress */}
        {state.isAnalyzing && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Analyzing...
              </Typography>
              <Typography variant="caption" sx={{ color: activeAgent.color }}>
                {state.analysisProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={state.analysisProgress}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(activeAgent.color, 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: activeAgent.color,
                },
              }}
            />
          </Box>
        )}

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Agent Description */}
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {activeAgent.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
              {activeAgent.expertise.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: alpha(activeAgent.color, 0.1),
                    color: activeAgent.color,
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Suggestions */}
          {agentSuggestions.length > 0 && (
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <SuggestionIcon sx={{ fontSize: 16 }} />
                Suggestions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                {agentSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAction={handleSuggestionAction}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Recent Messages */}
          {agentMessages.length > 0 && (
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <HistoryIcon sx={{ fontSize: 16 }} />
                Recent
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {agentMessages.slice(0, 5).map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      p: 1.5,
                      borderRadius: `${creativeCardTokens.radius.thumbnail}px`,
                      bgcolor: alpha(activeAgent.color, 0.05),
                      border: `1px solid ${alpha(activeAgent.color, 0.1)}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {message.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {message.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Empty State */}
          {agentSuggestions.length === 0 && agentMessages.length === 0 && !state.isAnalyzing && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: 4,
              }}
            >
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>{activeAgent.emoji}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Ask {activeAgent.name} anything
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 240 }}>
                Type a question below or drop content here for analysis
              </Typography>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${alpha('#fff', 0.08)}`,
            bgcolor: alpha(activeAgent.color, 0.02),
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={`Ask ${activeAgent.name}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={state.isAnalyzing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: `${creativeCardTokens.radius.button}px`,
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || state.isAnalyzing}
              sx={{
                bgcolor: activeAgent.color,
                color: 'white',
                '&:hover': { bgcolor: alpha(activeAgent.color, 0.85) },
                '&.Mui-disabled': { bgcolor: alpha(activeAgent.color, 0.3) },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
});

export default AgentPanel;
