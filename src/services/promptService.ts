/**
 * Prompt Agent Service
 * Unified API service for prompt enhancement and generation
 * Aligned with swagger v5 API schema: /api/prompt endpoints
 */

import { api } from './api';

// ============================================================================
// Type Definitions - Aligned with swagger v5 schema
// ============================================================================

export interface RagContext {
  enabled?: boolean;
  sources?: string[];
  maxResults?: number;
}

// ===== Improve Prompt Request/Response =====

export interface ImprovePromptRequest {
  /** LLM model to use */
  model?: string;
  /** Temperature for generation (0-2) */
  temperature?: number;
  /** Max tokens for input */
  maxTokens?: number;
  /** Top-p sampling */
  topP?: number;
  /** Top-k sampling */
  topK?: number;
  /** Provider-specific options */
  providerOptions?: Record<string, unknown>;
  /** RAG context configuration */
  rag?: RagContext;
  /** The original prompt to improve */
  originalPrompt?: string;
  /** Agent type (e.g., 'image', 'video', 'fashion') */
  agentType?: string;
  /** Max tokens for response */
  maxResponseTokens?: number;
}

export interface ImagePromptResponse {
  success: boolean;
  errors?: string[];
  /** The improved prompt */
  improvedPrompt?: string;
  /** The original prompt that was submitted */
  originalPrompt?: string;
  /** Agent type used */
  agentType?: string;
}

// ===== Generate Prompt Request/Response =====

export interface GeneratePromptRequest {
  /** LLM model to use */
  model?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Max tokens for input */
  maxTokens?: number;
  /** Top-p sampling */
  topP?: number;
  /** Top-k sampling */
  topK?: number;
  /** Provider-specific options */
  providerOptions?: Record<string, unknown>;
  /** RAG context configuration */
  rag?: RagContext;
  /** Input text to generate prompt from */
  text?: string;
  /** Style for the prompt (e.g., 'cinematic', 'editorial') */
  style?: string;
  /** Output type (e.g., 'image', 'video') */
  outputType?: string;
  /** Max tokens for response */
  maxResponseTokens?: number;
}

export interface GeneratePromptResponse {
  success: boolean;
  errors?: string[];
  /** The generated/enhanced prompt */
  enhancedPrompt?: string;
  /** The original input text */
  originalText?: string;
  /** Output type */
  outputType?: string;
}

// ===== Niche Prompt Request/Response =====

export interface NichePromptRequest {
  /** LLM model to use */
  model?: string;
  /** Temperature for generation */
  temperature?: number;
  /** Max tokens for input */
  maxTokens?: number;
  /** Top-p sampling */
  topP?: number;
  /** Top-k sampling */
  topK?: number;
  /** Provider-specific options */
  providerOptions?: Record<string, unknown>;
  /** RAG context configuration */
  rag?: RagContext;
  /** The concept to generate prompt for */
  concept?: string;
  /** Target niche (e.g., 'fashion', 'product', 'portrait') */
  niche?: string;
  /** Artistic style (e.g., 'minimalist', 'maximalist', 'vintage') */
  artisticStyle?: string;
  /** Atmosphere/mood (e.g., 'dramatic', 'serene', 'energetic') */
  atmosphere?: string;
  /** Key elements to include */
  keyElements?: string;
  /** Max tokens for response */
  maxResponseTokens?: number;
}

export interface NichePromptResponse {
  success: boolean;
  errors?: string[];
  /** The generated prompt */
  generatedPrompt?: string;
  /** Input concept */
  concept?: string;
  /** Target niche */
  niche?: string;
  /** Artistic style applied */
  artisticStyle?: string;
  /** Atmosphere/mood applied */
  atmosphere?: string;
}

// ===== Agent Info =====

export interface PromptAgentInfo {
  id: string;
  name: string;
  description?: string;
  capabilities?: string[];
  tier?: 'flagship' | 'production' | 'creative' | 'fast';
}

export interface PromptAgentsResponse {
  success: boolean;
  agents?: PromptAgentInfo[];
  error?: string | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

const API_BASE = '/api/prompt';

const getUserId = (): string => {
  const authData = localStorage.getItem('authData');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.userId || parsed.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }
  return 'anonymous';
};

const getAuthHeaders = () => ({
  headers: {
    'X-User-Id': getUserId(),
  },
});

// ============================================================================
// Prompt Agent Service
// ============================================================================

export const promptService = {
  /**
   * Improve an existing prompt
   * POST /api/prompt/improve
   *
   * Takes a basic prompt and enhances it with better descriptive language,
   * structure, and details for AI image/video generation.
   */
  async improve(request: ImprovePromptRequest): Promise<ImagePromptResponse> {
    const response = await api.post<ImagePromptResponse>(
      `${API_BASE}/improve`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate an image prompt from text
   * POST /api/prompt/image/generate
   *
   * Transforms a simple text description into a detailed prompt
   * optimized for image generation.
   */
  async generateImagePrompt(request: GeneratePromptRequest): Promise<GeneratePromptResponse> {
    const response = await api.post<GeneratePromptResponse>(
      `${API_BASE}/image/generate`,
      { ...request, outputType: request.outputType ?? 'image' },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate a niche-specific prompt
   * POST /api/prompt/niche
   *
   * Creates specialized prompts for specific creative niches
   * like fashion, product photography, portraits, etc.
   */
  async generateNichePrompt(request: NichePromptRequest): Promise<NichePromptResponse> {
    const response = await api.post<NichePromptResponse>(
      `${API_BASE}/niche`,
      request,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get list of available prompt agents
   * GET /api/prompt/agents
   */
  async getAgents(): Promise<PromptAgentsResponse> {
    try {
      const response = await api.get<PromptAgentsResponse | PromptAgentInfo[]>(
        `${API_BASE}/agents`,
        getAuthHeaders()
      );
      // Handle both wrapped and direct array responses
      if (Array.isArray(response.data)) {
        return { success: true, agents: response.data };
      }
      return response.data;
    } catch (error) {
      console.error('[promptService.getAgents] Error:', error);
      return { success: false, agents: [], error: 'Failed to fetch agents' };
    }
  },

  /**
   * Health check for prompt service
   * GET /api/prompt/health
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get<{ status: string }>(
      `${API_BASE}/health`,
      getAuthHeaders()
    );
    return response.data;
  },

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  /**
   * Quick improve - improve a prompt with default settings
   */
  async quickImprove(prompt: string, agentType?: string): Promise<string> {
    const response = await this.improve({
      originalPrompt: prompt,
      agentType: agentType ?? 'image',
      temperature: 0.7,
    });

    if (!response.success || !response.improvedPrompt) {
      throw new Error(response.errors?.join(', ') || 'Failed to improve prompt');
    }

    return response.improvedPrompt;
  },

  /**
   * Generate a fashion-specific prompt
   */
  async generateFashionPrompt(
    concept: string,
    options?: {
      style?: string;
      atmosphere?: string;
      keyElements?: string;
    }
  ): Promise<string> {
    const response = await this.generateNichePrompt({
      concept,
      niche: 'fashion',
      artisticStyle: options?.style,
      atmosphere: options?.atmosphere,
      keyElements: options?.keyElements,
      temperature: 0.8,
    });

    if (!response.success || !response.generatedPrompt) {
      throw new Error(response.errors?.join(', ') || 'Failed to generate prompt');
    }

    return response.generatedPrompt;
  },

  /**
   * Generate a product photography prompt
   */
  async generateProductPrompt(
    concept: string,
    options?: {
      style?: string;
      atmosphere?: string;
    }
  ): Promise<string> {
    const response = await this.generateNichePrompt({
      concept,
      niche: 'product',
      artisticStyle: options?.style ?? 'clean',
      atmosphere: options?.atmosphere ?? 'professional',
      temperature: 0.7,
    });

    if (!response.success || !response.generatedPrompt) {
      throw new Error(response.errors?.join(', ') || 'Failed to generate prompt');
    }

    return response.generatedPrompt;
  },

  /**
   * Generate a cinematic/film prompt
   */
  async generateCinematicPrompt(
    concept: string,
    options?: {
      style?: string;
      atmosphere?: string;
    }
  ): Promise<string> {
    const response = await this.generateNichePrompt({
      concept,
      niche: 'cinematic',
      artisticStyle: options?.style ?? 'cinematic',
      atmosphere: options?.atmosphere ?? 'dramatic',
      temperature: 0.8,
    });

    if (!response.success || !response.generatedPrompt) {
      throw new Error(response.errors?.join(', ') || 'Failed to generate prompt');
    }

    return response.generatedPrompt;
  },

  /**
   * Generate a video prompt from text
   */
  async generateVideoPrompt(text: string, style?: string): Promise<GeneratePromptResponse> {
    return this.generateImagePrompt({
      text,
      style,
      outputType: 'video',
      temperature: 0.7,
    });
  },
};

export default promptService;
