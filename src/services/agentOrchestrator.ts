/**
 * Agent Orchestrator Service
 *
 * Manages the lifecycle of Creative Collaborator agents, including:
 * - Proactive trigger detection and firing
 * - Agent message generation and queuing
 * - State management for agent interactions
 * - Integration with canvas events
 */

import type {
  AgentPersona,
  AgentMessage,
  AgentMessageType,
  AgentSuggestion,
  AgentAction,
  AgentContext,
  AgentState,
  AgentPreferences,
  ProactiveTrigger,
} from '../models/agents';

// Simple UUID generator using crypto API
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
import {
  AGENT_DEFINITIONS,
  DEFAULT_AGENT_PREFERENCES,
  AGENT_SYSTEM_PROMPTS,
} from '../models/agents';

// ============================================================================
// TYPES
// ============================================================================

type AgentEventType =
  | 'canvas_empty'
  | 'card_created'
  | 'card_deleted'
  | 'generation_started'
  | 'generation_completed'
  | 'generation_failed'
  | 'connection_created'
  | 'connection_deleted'
  | 'style_applied'
  | 'textile_dropped'
  | 'workflow_completed'
  | 'user_idle'
  | 'quality_assessed';

interface AgentEvent {
  type: AgentEventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

type AgentStateListener = (state: AgentState) => void;
type AgentMessageListener = (message: AgentMessage) => void;

// ============================================================================
// PROACTIVE TRIGGERS CONFIGURATION
// ============================================================================

const PROACTIVE_TRIGGERS: ProactiveTrigger[] = [
  // Muse triggers
  {
    id: 'muse-empty-canvas',
    type: 'empty_canvas',
    agentId: 'muse',
    condition: { type: 'state', params: { cardCount: 0, idleTimeMs: 5000 } },
    cooldownMs: 300000, // 5 minutes
    priority: 'medium',
  },
  {
    id: 'muse-long-pause',
    type: 'long_pause',
    agentId: 'muse',
    condition: { type: 'time', params: { idleTimeMs: 60000 } },
    cooldownMs: 180000, // 3 minutes
    priority: 'low',
  },
  {
    id: 'muse-post-generation',
    type: 'post_generation',
    agentId: 'muse',
    condition: { type: 'event', params: { event: 'generation_completed' } },
    cooldownMs: 30000, // 30 seconds
    priority: 'medium',
  },

  // Curator triggers
  {
    id: 'curator-style-drift',
    type: 'style_drift',
    agentId: 'curator',
    condition: { type: 'content', params: { styleVariance: 0.3 } },
    cooldownMs: 120000, // 2 minutes
    priority: 'medium',
  },
  {
    id: 'curator-collection-ready',
    type: 'collection_ready',
    agentId: 'curator',
    condition: { type: 'state', params: { completedCards: 5 } },
    cooldownMs: 600000, // 10 minutes
    priority: 'high',
  },

  // Architect triggers
  {
    id: 'architect-inefficient',
    type: 'inefficient_flow',
    agentId: 'architect',
    condition: { type: 'state', params: { redundantNodes: 2 } },
    cooldownMs: 300000, // 5 minutes
    priority: 'medium',
  },
  {
    id: 'architect-error',
    type: 'error_occurred',
    agentId: 'architect',
    condition: { type: 'event', params: { event: 'generation_failed' } },
    cooldownMs: 0, // No cooldown for errors
    priority: 'high',
  },

  // Packager triggers
  {
    id: 'packager-workflow-complete',
    type: 'workflow_complete',
    agentId: 'packager',
    condition: { type: 'event', params: { event: 'workflow_completed' } },
    cooldownMs: 60000, // 1 minute
    priority: 'medium',
  },
  {
    id: 'packager-bundle-opportunity',
    type: 'bundle_opportunity',
    agentId: 'packager',
    condition: { type: 'state', params: { completedCards: 3 } },
    cooldownMs: 600000, // 10 minutes
    priority: 'low',
  },

  // Heritage triggers
  {
    id: 'heritage-textile',
    type: 'african_textile_used',
    agentId: 'heritage',
    condition: { type: 'event', params: { event: 'textile_dropped' } },
    cooldownMs: 0, // Always show for textiles
    priority: 'high',
  },
  {
    id: 'heritage-cultural',
    type: 'cultural_element',
    agentId: 'heritage',
    condition: { type: 'content', params: { hasCulturalElement: true } },
    cooldownMs: 120000, // 2 minutes
    priority: 'medium',
  },
];

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

class AgentOrchestrator {
  private state: AgentState;
  private stateListeners: Set<AgentStateListener> = new Set();
  private messageListeners: Set<AgentMessageListener> = new Set();
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime: number = Date.now();

  constructor() {
    this.state = {
      activeAgent: null,
      isPanelOpen: false,
      isPresenceVisible: true,
      messages: [],
      unreadCount: 0,
      isAnalyzing: false,
      analysisProgress: 0,
      suggestions: [],
      preferences: { ...DEFAULT_AGENT_PREFERENCES },
    };

    // Load preferences from localStorage
    this.loadPreferences();
  }

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  getState(): AgentState {
    return { ...this.state };
  }

  private setState(updates: Partial<AgentState>) {
    this.state = { ...this.state, ...updates };
    this.notifyStateListeners();
  }

  subscribe(listener: AgentStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  subscribeToMessages(listener: AgentMessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  private notifyStateListeners() {
    const state = this.getState();
    this.stateListeners.forEach((listener) => listener(state));
  }

  private notifyMessageListeners(message: AgentMessage) {
    this.messageListeners.forEach((listener) => listener(message));
  }

  // ==========================================================================
  // PREFERENCES
  // ==========================================================================

  private loadPreferences() {
    try {
      const stored = localStorage.getItem('agentPreferences');
      if (stored) {
        const prefs = JSON.parse(stored) as AgentPreferences;
        this.state.preferences = { ...DEFAULT_AGENT_PREFERENCES, ...prefs };
      }
    } catch (e) {
      console.warn('Failed to load agent preferences:', e);
    }
  }

  savePreferences(preferences: Partial<AgentPreferences>) {
    this.setState({
      preferences: { ...this.state.preferences, ...preferences },
    });
    try {
      localStorage.setItem('agentPreferences', JSON.stringify(this.state.preferences));
    } catch (e) {
      console.warn('Failed to save agent preferences:', e);
    }
  }

  // ==========================================================================
  // AGENT PANEL CONTROL
  // ==========================================================================

  openPanel(agentId?: AgentPersona) {
    this.setState({
      isPanelOpen: true,
      activeAgent: agentId || this.state.activeAgent || 'muse',
    });
  }

  closePanel() {
    this.setState({
      isPanelOpen: false,
    });
  }

  setActiveAgent(agentId: AgentPersona) {
    this.setState({
      activeAgent: agentId,
    });
  }

  togglePresence(visible: boolean) {
    this.setState({
      isPresenceVisible: visible,
    });
  }

  // ==========================================================================
  // MESSAGE MANAGEMENT
  // ==========================================================================

  createMessage(
    agentId: AgentPersona,
    type: AgentMessageType,
    title: string,
    content: string,
    actions?: AgentAction[],
    context?: AgentContext
  ): AgentMessage {
    const message: AgentMessage = {
      id: generateId(),
      agentId,
      type,
      title,
      content,
      timestamp: Date.now(),
      isRead: false,
      isDismissed: false,
      actions,
      context,
    };

    this.addMessage(message);
    return message;
  }

  private addMessage(message: AgentMessage) {
    const messages = [message, ...this.state.messages].slice(0, 50); // Keep last 50
    const unreadCount = messages.filter((m) => !m.isRead && !m.isDismissed).length;

    this.setState({ messages, unreadCount });
    this.notifyMessageListeners(message);
  }

  markAsRead(messageId: string) {
    const messages = this.state.messages.map((m) =>
      m.id === messageId ? { ...m, isRead: true } : m
    );
    const unreadCount = messages.filter((m) => !m.isRead && !m.isDismissed).length;
    this.setState({ messages, unreadCount });
  }

  dismissMessage(messageId: string) {
    const messages = this.state.messages.map((m) =>
      m.id === messageId ? { ...m, isDismissed: true } : m
    );
    const unreadCount = messages.filter((m) => !m.isRead && !m.isDismissed).length;
    this.setState({ messages, unreadCount });
  }

  clearMessages() {
    this.setState({ messages: [], unreadCount: 0 });
  }

  // ==========================================================================
  // SUGGESTION MANAGEMENT
  // ==========================================================================

  addSuggestion(suggestion: Omit<AgentSuggestion, 'id' | 'createdAt'>) {
    const newSuggestion: AgentSuggestion = {
      ...suggestion,
      id: generateId(),
      createdAt: Date.now(),
    };

    const suggestions = [newSuggestion, ...this.state.suggestions].slice(0, 10);
    this.setState({ suggestions });
    return newSuggestion;
  }

  removeSuggestion(suggestionId: string) {
    const suggestions = this.state.suggestions.filter((s) => s.id !== suggestionId);
    this.setState({ suggestions });
  }

  clearSuggestions() {
    this.setState({ suggestions: [] });
  }

  // ==========================================================================
  // ANALYSIS STATE
  // ==========================================================================

  startAnalysis(agentId: AgentPersona) {
    this.setState({
      isAnalyzing: true,
      analysisProgress: 0,
      activeAgent: agentId,
    });
  }

  updateAnalysisProgress(progress: number) {
    this.setState({ analysisProgress: Math.min(100, Math.max(0, progress)) });
  }

  completeAnalysis() {
    this.setState({
      isAnalyzing: false,
      analysisProgress: 100,
    });
  }

  // ==========================================================================
  // EVENT HANDLING
  // ==========================================================================

  handleEvent(event: AgentEvent) {
    this.lastActivityTime = Date.now();

    // Reset idle timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    // Check triggers for this event
    this.checkEventTriggers(event);

    // Set up new idle timer
    this.idleTimer = setTimeout(() => {
      this.handleEvent({
        type: 'user_idle',
        payload: { idleTimeMs: Date.now() - this.lastActivityTime },
        timestamp: Date.now(),
      });
    }, this.state.preferences.autoSuggestDelay);
  }

  private checkEventTriggers(event: AgentEvent) {
    const { preferences } = this.state;

    PROACTIVE_TRIGGERS.forEach((trigger) => {
      // Skip if agent is disabled
      if (!preferences.enabledAgents.includes(trigger.agentId)) return;

      // Skip if trigger is muted
      if (preferences.mutedTriggers.includes(trigger.type)) return;

      // Skip if on cooldown
      if (trigger.lastTriggeredAt) {
        const elapsed = Date.now() - trigger.lastTriggeredAt;
        if (elapsed < trigger.cooldownMs) return;
      }

      // Check if trigger condition matches event
      if (this.shouldTrigger(trigger, event)) {
        this.fireTrigger(trigger, event);
      }
    });
  }

  private shouldTrigger(trigger: ProactiveTrigger, event: AgentEvent): boolean {
    const { condition } = trigger;

    switch (condition.type) {
      case 'event':
        return event.type === condition.params.event;

      case 'time':
        return event.type === 'user_idle' &&
          (event.payload.idleTimeMs as number) >= (condition.params.idleTimeMs as number);

      case 'state':
        // State-based triggers need to check current canvas state
        // This would integrate with canvasStore
        return false; // Placeholder

      case 'content':
        // Content-based triggers need to analyze card content
        return false; // Placeholder

      default:
        return false;
    }
  }

  private fireTrigger(trigger: ProactiveTrigger, event: AgentEvent) {
    const agent = AGENT_DEFINITIONS[trigger.agentId];

    // Mark trigger as fired
    trigger.lastTriggeredAt = Date.now();

    // Generate message based on trigger type
    const message = this.generateTriggerMessage(trigger, event, agent);
    if (message) {
      this.addMessage(message);
    }
  }

  private generateTriggerMessage(
    trigger: ProactiveTrigger,
    _event: AgentEvent,
    agent: typeof AGENT_DEFINITIONS[AgentPersona]
  ): AgentMessage | null {
    const baseMessage = {
      id: generateId(),
      agentId: trigger.agentId,
      timestamp: Date.now(),
      isRead: false,
      isDismissed: false,
    };

    switch (trigger.type) {
      case 'empty_canvas':
        return {
          ...baseMessage,
          type: 'suggestion',
          title: `${agent.emoji} ${agent.name} noticed something...`,
          content: "Your canvas is looking a bit empty! Want me to suggest some starting points for your next creative project?",
          actions: [
            { id: 'show', label: 'Show Me Ideas ✨', primary: true, action: 'apply' },
            { id: 'later', label: 'Maybe Later', action: 'dismiss' },
          ],
        };

      case 'long_pause':
        return {
          ...baseMessage,
          type: 'suggestion',
          title: `${agent.emoji} Need a creative spark?`,
          content: "I noticed you've been thinking for a while. Would you like me to suggest some variations or new directions?",
          actions: [
            { id: 'suggest', label: 'Surprise Me', primary: true, action: 'apply' },
            { id: 'not-now', label: 'Not Now', action: 'snooze' },
          ],
        };

      case 'post_generation':
        return {
          ...baseMessage,
          type: 'recommendation',
          title: `${agent.emoji} Nice work! Here's what I noticed...`,
          content: "That generation turned out well! I have some ideas for variations that could make it even more striking.",
          actions: [
            { id: 'show-variations', label: 'Show Variations', primary: true, action: 'apply' },
            { id: 'curate', label: 'Help Me Curate', action: 'custom', payload: { switchTo: 'curator' } },
            { id: 'skip', label: 'Skip', action: 'dismiss' },
          ],
        };

      case 'error_occurred':
        return {
          ...baseMessage,
          type: 'suggestion',
          title: `${agent.emoji} I can help with that error`,
          content: "Something went wrong, but don't worry - I've seen this before. Let me analyze what happened and suggest a fix.",
          actions: [
            { id: 'diagnose', label: 'Diagnose Issue', primary: true, action: 'apply' },
            { id: 'retry', label: 'Just Retry', action: 'custom', payload: { action: 'retry' } },
          ],
        };

      case 'workflow_complete':
        return {
          ...baseMessage,
          type: 'suggestion',
          title: `${agent.emoji} Your workflow is complete!`,
          content: "Great work! This looks ready to share or sell. Want me to help you package it for your favorite marketplace?",
          actions: [
            { id: 'package', label: 'Package for Sale', primary: true, action: 'apply' },
            { id: 'export', label: 'Quick Export', action: 'custom', payload: { action: 'export' } },
            { id: 'later', label: 'Later', action: 'dismiss' },
          ],
        };

      case 'african_textile_used':
        return {
          ...baseMessage,
          type: 'education',
          title: `${agent.emoji} Cultural Context`,
          content: "I see you're using a traditional African textile! Would you like to learn about its cultural significance and how to use it respectfully?",
          actions: [
            { id: 'learn', label: 'Tell Me More', primary: true, action: 'apply' },
            { id: 'skip', label: 'Skip', action: 'dismiss' },
            { id: 'never', label: "Don't show again", action: 'never' },
          ],
        };

      default:
        return null;
    }
  }

  // ==========================================================================
  // AGENT ACTIONS
  // ==========================================================================

  async executeAction(
    message: AgentMessage,
    action: AgentAction
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    try {
      switch (action.action) {
        case 'apply':
          // Apply the suggestion
          return await this.applySuggestion(message, action);

        case 'preview':
          // Preview the suggestion
          return { success: true, result: { preview: true } };

        case 'modify':
          // Open modification panel
          this.openPanel(message.agentId);
          return { success: true };

        case 'dismiss':
          this.dismissMessage(message.id);
          return { success: true };

        case 'snooze':
          // Snooze for 5 minutes
          this.dismissMessage(message.id);
          // Could implement actual snooze logic here
          return { success: true };

        case 'never':
          // Add trigger to muted list
          // Would need to map message to trigger type
          this.dismissMessage(message.id);
          return { success: true };

        case 'custom':
          return await this.handleCustomAction(message, action);

        default:
          return { success: false, error: 'Unknown action' };
      }
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private async applySuggestion(
    message: AgentMessage,
    _action: AgentAction
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    // Start analysis
    this.startAnalysis(message.agentId);

    // Simulate AI processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.updateAnalysisProgress(i);
    }

    // Complete analysis
    this.completeAnalysis();

    // Generate suggestions based on agent type
    const agent = AGENT_DEFINITIONS[message.agentId];
    const suggestion = this.addSuggestion({
      agentId: message.agentId,
      title: `${agent.emoji} ${agent.name}'s Recommendation`,
      description: this.generateSuggestionContent(message.agentId),
      confidence: 0.85,
      actions: [
        { id: 'apply', label: 'Apply', primary: true, action: 'apply' },
        { id: 'modify', label: 'Modify', action: 'modify' },
        { id: 'skip', label: 'Skip', action: 'dismiss' },
      ],
    });

    this.markAsRead(message.id);
    return { success: true, result: suggestion };
  }

  private generateSuggestionContent(agentId: AgentPersona): string {
    switch (agentId) {
      case 'muse':
        return 'Try adding dramatic lighting and a shallow depth of field to create a more editorial feel. Consider a warmer color grade to evoke emotion.';
      case 'curator':
        return 'This piece stands out from your collection. I recommend featuring it prominently and generating 2-3 variations to offer options.';
      case 'architect':
        return 'You could save processing time by connecting the style node directly to the output, skipping the intermediate merge step.';
      case 'packager':
        return 'This is ready for marketplace! I suggest creating a bundle with the original, a transparent background version, and social media crops.';
      case 'heritage':
        return 'The Kente pattern you selected originates from Ghana and represents royalty and achievement. Consider adding this context to your product description.';
      default:
        return 'I have some suggestions for improving your work.';
    }
  }

  private async handleCustomAction(
    _message: AgentMessage,
    action: AgentAction
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    const payload = action.payload as Record<string, unknown>;

    if (payload?.switchTo) {
      this.setActiveAgent(payload.switchTo as AgentPersona);
      this.openPanel();
      return { success: true };
    }

    if (payload?.action === 'retry') {
      // Would trigger workflow retry
      return { success: true, result: { action: 'retry' } };
    }

    if (payload?.action === 'export') {
      // Would trigger export
      return { success: true, result: { action: 'export' } };
    }

    return { success: true };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  getAgentDefinition(agentId: AgentPersona) {
    return AGENT_DEFINITIONS[agentId];
  }

  getSystemPrompt(agentId: AgentPersona): string {
    return AGENT_SYSTEM_PROMPTS[agentId];
  }

  getAllAgents() {
    return Object.values(AGENT_DEFINITIONS);
  }

  getEnabledAgents() {
    return this.state.preferences.enabledAgents.map((id) => AGENT_DEFINITIONS[id]);
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
export default agentOrchestrator;
