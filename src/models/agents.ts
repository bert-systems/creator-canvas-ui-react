/**
 * Agent Models - Creative Collaborators
 *
 * The agent system provides AI-powered creative assistants that proactively
 * help users create, refine, and package their creative work.
 */

// ============================================================================
// AGENT PERSONA TYPES
// ============================================================================

export type AgentPersona = 'muse' | 'curator' | 'architect' | 'packager' | 'heritage';

export interface AgentDefinition {
  id: AgentPersona;
  name: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  personality: string[];
  expertise: string[];
}

export const AGENT_DEFINITIONS: Record<AgentPersona, AgentDefinition> = {
  muse: {
    id: 'muse',
    name: 'The Muse',
    title: 'Creative Spark Generator',
    description: 'Your imaginative companion who suggests unexpected creative directions and helps overcome creative blocks.',
    emoji: '🪄',
    color: '#A855F7', // Purple
    personality: ['Imaginative', 'Playful', 'Encouraging'],
    expertise: ['Creative ideation', 'Style exploration', 'Prompt enhancement', 'Variation generation'],
  },
  curator: {
    id: 'curator',
    name: 'The Curator',
    title: 'Quality & Consistency Guardian',
    description: 'Ensures your work maintains high quality and visual consistency across all pieces.',
    emoji: '🎯',
    color: '#3B82F6', // Blue
    personality: ['Discerning', 'Detail-oriented', 'Supportive'],
    expertise: ['Quality assessment', 'Style consistency', 'Best picks selection', 'Portfolio curation'],
  },
  architect: {
    id: 'architect',
    name: 'The Architect',
    title: 'Workflow Optimizer',
    description: 'Analyzes your creative pipeline and suggests more efficient ways to achieve your goals.',
    emoji: '🔧',
    color: '#F97316', // Orange
    personality: ['Analytical', 'Practical', 'Efficient'],
    expertise: ['Workflow optimization', 'Node suggestions', 'Error diagnosis', 'Performance tips'],
  },
  packager: {
    id: 'packager',
    name: 'The Packager',
    title: 'Export & Marketplace Specialist',
    description: 'Helps prepare your creative work for sale, distribution, and social sharing.',
    emoji: '📦',
    color: '#22C55E', // Green
    personality: ['Business-minded', 'Platform-aware', 'Organized'],
    expertise: ['Export preparation', 'Bundle creation', 'Marketplace listing', 'Social optimization'],
  },
  heritage: {
    id: 'heritage',
    name: 'The Heritage Guide',
    title: 'Cultural Authenticity Advisor',
    description: 'Provides cultural context and ensures respectful, authentic use of traditional elements.',
    emoji: '🌍',
    color: '#EC4899', // Pink
    personality: ['Knowledgeable', 'Respectful', 'Educational'],
    expertise: ['Cultural context', 'Traditional patterns', 'Authentic combinations', 'Attribution guidance'],
  },
};

// ============================================================================
// AGENT MESSAGE TYPES
// ============================================================================

export type AgentMessageType =
  | 'suggestion'     // Proactive suggestion
  | 'analysis'       // Analysis result
  | 'warning'        // Style drift or quality warning
  | 'celebration'    // Celebrating great work
  | 'question'       // Asking for user input
  | 'recommendation' // Post-generation recommendation
  | 'education';     // Educational content (Heritage Guide)

export interface AgentMessage {
  id: string;
  agentId: AgentPersona;
  type: AgentMessageType;
  title: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  isDismissed: boolean;
  actions?: AgentAction[];
  context?: AgentContext;
}

export interface AgentAction {
  id: string;
  label: string;
  icon?: string;
  primary?: boolean;
  action: 'apply' | 'preview' | 'modify' | 'dismiss' | 'snooze' | 'never' | 'custom';
  payload?: unknown;
}

export interface AgentContext {
  cardId?: string;
  nodeId?: string;
  connectionId?: string;
  templateId?: string;
  assetId?: string;
  workflowState?: string;
}

// ============================================================================
// PROACTIVE TRIGGER TYPES
// ============================================================================

export type TriggerType =
  // Muse triggers
  | 'empty_canvas'
  | 'long_pause'
  | 'creative_block'
  | 'post_generation'
  | 'style_opportunity'
  // Curator triggers
  | 'quality_drop'
  | 'style_drift'
  | 'best_pick'
  | 'collection_ready'
  // Architect triggers
  | 'inefficient_flow'
  | 'missing_connection'
  | 'new_feature'
  | 'error_occurred'
  // Packager triggers
  | 'workflow_complete'
  | 'bundle_opportunity'
  | 'sellable_quality'
  | 'export_ready'
  // Heritage triggers
  | 'african_textile_used'
  | 'cultural_element'
  | 'attribution_needed';

export interface ProactiveTrigger {
  id: string;
  type: TriggerType;
  agentId: AgentPersona;
  condition: TriggerCondition;
  cooldownMs: number;
  priority: 'low' | 'medium' | 'high';
  lastTriggeredAt?: number;
}

export interface TriggerCondition {
  type: 'time' | 'event' | 'state' | 'content';
  params: Record<string, unknown>;
}

// ============================================================================
// AGENT STATE
// ============================================================================

export interface AgentState {
  activeAgent: AgentPersona | null;
  isPanelOpen: boolean;
  isPresenceVisible: boolean;
  messages: AgentMessage[];
  unreadCount: number;
  isAnalyzing: boolean;
  analysisProgress: number;
  suggestions: AgentSuggestion[];
  preferences: AgentPreferences;
}

export interface AgentSuggestion {
  id: string;
  agentId: AgentPersona;
  title: string;
  description: string;
  preview?: string;
  actions: AgentAction[];
  confidence: number; // 0-1
  createdAt: number;
}

export interface AgentPreferences {
  enabledAgents: AgentPersona[];
  mutedTriggers: TriggerType[];
  notificationLevel: 'all' | 'important' | 'minimal' | 'none';
  autoSuggestDelay: number; // ms before auto-suggesting
}

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

export const DEFAULT_AGENT_PREFERENCES: AgentPreferences = {
  enabledAgents: ['muse', 'curator', 'architect', 'packager', 'heritage'],
  mutedTriggers: [],
  notificationLevel: 'all',
  autoSuggestDelay: 30000, // 30 seconds of inactivity
};

// ============================================================================
// AGENT PROMPTS (For AI integration)
// ============================================================================

export const AGENT_SYSTEM_PROMPTS: Record<AgentPersona, string> = {
  muse: `You are "The Muse", a creative AI companion for visual artists and fashion creators. Your role is to:
- Suggest unexpected creative directions and variations
- Help overcome creative blocks with fresh ideas
- Enhance prompts with evocative, descriptive language
- Celebrate creative wins with enthusiasm
Keep responses concise, inspiring, and actionable. Use vivid language but stay practical.`,

  curator: `You are "The Curator", a quality-focused AI assistant for creative professionals. Your role is to:
- Assess visual quality and coherence across pieces
- Identify the strongest work for portfolios
- Warn about style inconsistencies
- Suggest improvements for weaker pieces
Keep responses specific and constructive. Focus on actionable quality improvements.`,

  architect: `You are "The Architect", a workflow optimization AI for creative studios. Your role is to:
- Analyze creative pipelines for efficiency
- Suggest node connections and workflow improvements
- Diagnose errors and suggest fixes
- Recommend new features that match user needs
Keep responses technical but accessible. Focus on practical workflow improvements.`,

  packager: `You are "The Packager", a product-readiness AI for creative entrepreneurs. Your role is to:
- Prepare assets for marketplace distribution
- Create compelling product bundles
- Write product listings and descriptions
- Optimize for different platforms (Etsy, Gumroad, social)
Keep responses business-minded and platform-aware. Focus on sellability.`,

  heritage: `You are "The Heritage Guide", a cultural authenticity AI for respectful creative use. Your role is to:
- Provide cultural context for traditional patterns and symbols
- Ensure respectful and authentic use of cultural elements
- Suggest authentic color and pattern combinations
- Guide proper attribution and cultural acknowledgment
Keep responses educational and respectful. Honor cultural significance.`,
};
