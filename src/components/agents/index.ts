/**
 * Creative Collaborators (Agents) - Component Exports
 *
 * The agent system provides AI-powered creative assistants that proactively
 * help users create, refine, and package their creative work.
 *
 * Agent Personas:
 * - The Muse: Creative spark generator
 * - The Curator: Quality & consistency guardian
 * - The Architect: Workflow optimizer
 * - The Packager: Export & marketplace specialist
 * - The Heritage Guide: Cultural authenticity advisor
 */

// Components
export { AgentPresence, default as AgentPresenceComponent } from './AgentPresence';
export { AgentPanel, default as AgentPanelComponent } from './AgentPanel';

// Re-export models for convenience
export type {
  AgentPersona,
  AgentDefinition,
  AgentMessage,
  AgentMessageType,
  AgentAction,
  AgentContext,
  AgentState,
  AgentSuggestion,
  AgentPreferences,
  TriggerType,
  ProactiveTrigger,
} from '../../models/agents';

export {
  AGENT_DEFINITIONS,
  DEFAULT_AGENT_PREFERENCES,
  AGENT_SYSTEM_PROMPTS,
} from '../../models/agents';

// Re-export orchestrator
export { agentOrchestrator } from '../../services/agentOrchestrator';
