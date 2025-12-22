/**
 * Audio Generation Service
 * Handles Voiceover, Dialogue, Music, and Sound Effects API calls
 * API: /api/audio endpoints (Swagger v9)
 *
 * Uses ElevenLabs for TTS and music generation capabilities
 */

import { api } from './api';

const AUDIO_API_BASE = '/api/audio';

// ===== Voice Types =====

export type VoiceCategory =
  | 'male-narrator'      // Josh - deep male narrator
  | 'female-narrator'    // Sarah - warm female narrator
  | 'male-character'     // Adam - versatile male character
  | 'female-character'   // Rachel - expressive female character
  | 'child'              // Gigi - child voice
  | 'elderly-male'       // Callum - elderly male voice
  | 'default';           // George - default male voice

export type Emotion =
  | 'happy'
  | 'joyful'
  | 'sad'
  | 'melancholy'
  | 'angry'
  | 'furious'
  | 'calm'
  | 'peaceful'
  | 'excited'
  | 'enthusiastic'
  | 'scared'
  | 'fearful'
  | 'neutral';

export type AudioFormat =
  | 'mp3_44100_128'
  | 'mp3_44100_192'
  | 'pcm_16000'
  | 'pcm_22050'
  | 'pcm_24000'
  | 'pcm_44100';

export type MusicGenre =
  | 'ambient'
  | 'cinematic'
  | 'electronic'
  | 'orchestral'
  | 'rock'
  | 'jazz'
  | 'pop'
  | 'lo-fi'
  | 'dramatic'
  | 'upbeat';

export type MusicMood =
  | 'relaxing'
  | 'energetic'
  | 'melancholic'
  | 'triumphant'
  | 'mysterious'
  | 'romantic'
  | 'tense'
  | 'playful';

export type MusicTempo = 'slow' | 'medium' | 'fast';

// ===== Request Types =====

export interface VoiceoverRequest {
  /** Text to convert to speech */
  text: string;
  /** Voice category or specific voice ID */
  voice?: VoiceCategory | string;
  /** TTS model to use */
  model?: string;
  /** Language code (e.g., 'en', 'es', 'fr') */
  language?: string;
  /** Voice stability (0.0-1.0) */
  stability?: number;
  /** Similarity boost (0.0-1.0) */
  similarityBoost?: number;
  /** Style intensity (0.0-1.0) */
  style?: number;
  /** Output format */
  format?: AudioFormat;
}

export interface DialogueLine {
  /** Character name */
  character: string;
  /** Line text */
  text: string;
  /** Voice category for this character */
  voice?: VoiceCategory | string;
  /** Emotional delivery */
  emotion?: Emotion;
}

export interface DialogueRequest {
  /** Array of dialogue lines */
  lines: DialogueLine[];
  /** TTS model to use */
  model?: string;
  /** Language code */
  language?: string;
}

export interface MusicTrackRequest {
  /** Duration in seconds */
  duration: number;
  /** Music genre */
  genre?: MusicGenre | string;
  /** Mood of the track */
  mood?: MusicMood | string;
  /** Tempo */
  tempo?: MusicTempo;
  /** Comma-separated instruments (e.g., 'piano, strings, drums') */
  instruments?: string;
  /** Detailed description of desired music */
  description?: string;
  /** Whether to generate without vocals */
  instrumental?: boolean;
  /** Output format */
  format?: AudioFormat;
}

export interface SoundEffectRequest {
  /** Description of the sound effect */
  description: string;
  /** Duration in seconds */
  duration?: number;
  /** Output format */
  format?: AudioFormat;
}

// ===== Response Types =====

export interface VoiceoverResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  format?: string;
  voiceId?: string;
  model?: string;
  characterCount?: number;
  error?: string;
}

export interface DialogueResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  format?: string;
  lineCount?: number;
  lines?: Array<{
    character: string;
    audioUrl: string;
    duration: number;
  }>;
  error?: string;
}

export interface MusicTrackResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  format?: string;
  genre?: string;
  mood?: string;
  tempo?: string;
  error?: string;
}

export interface SoundEffectResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  format?: string;
  description?: string;
  error?: string;
}

export interface VoiceInfo {
  id: string;
  name: string;
  category: VoiceCategory;
  description?: string;
  previewUrl?: string;
  labels?: Record<string, string>;
}

export interface VoicesResponse {
  success: boolean;
  voices?: VoiceInfo[];
  error?: string;
}

// ===== Helper Functions =====

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

/**
 * Map emotion to ElevenLabs style parameter
 */
const emotionToStyle = (emotion?: Emotion): number => {
  const styleMap: Record<Emotion, number> = {
    happy: 0.8,
    joyful: 0.8,
    sad: 0.3,
    melancholy: 0.3,
    angry: 0.9,
    furious: 0.9,
    calm: 0.2,
    peaceful: 0.2,
    excited: 0.85,
    enthusiastic: 0.85,
    scared: 0.7,
    fearful: 0.7,
    neutral: 0.0,
  };
  return emotion ? styleMap[emotion] ?? 0.0 : 0.0;
};

// ===== Voiceover Service =====

export const voiceoverService = {
  /**
   * Generate voiceover from text
   * POST /api/audio/voiceover
   */
  async generate(request: VoiceoverRequest): Promise<VoiceoverResponse> {
    const response = await api.post<VoiceoverResponse>(
      `${AUDIO_API_BASE}/voiceover`,
      {
        text: request.text,
        voice: request.voice ?? 'default',
        model: request.model ?? 'eleven_multilingual_v2',
        language: request.language ?? 'en',
        stability: request.stability ?? 0.5,
        similarityBoost: request.similarityBoost ?? 0.75,
        style: request.style ?? 0.0,
        format: request.format ?? 'mp3_44100_128',
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate voiceover with a specific voice category
   */
  async generateWithVoice(
    text: string,
    voice: VoiceCategory,
    options?: Partial<Omit<VoiceoverRequest, 'text' | 'voice'>>
  ): Promise<VoiceoverResponse> {
    return this.generate({
      text,
      voice,
      ...options,
    });
  },

  /**
   * Generate narration (uses narrator voice)
   */
  async narrate(
    text: string,
    gender: 'male' | 'female' = 'male',
    options?: Partial<Omit<VoiceoverRequest, 'text' | 'voice'>>
  ): Promise<VoiceoverResponse> {
    const voice = gender === 'male' ? 'male-narrator' : 'female-narrator';
    return this.generate({
      text,
      voice,
      stability: 0.6,
      similarityBoost: 0.8,
      ...options,
    });
  },

  /**
   * Generate character dialogue (uses character voice with emotion)
   */
  async characterVoice(
    text: string,
    gender: 'male' | 'female',
    emotion?: Emotion,
    options?: Partial<Omit<VoiceoverRequest, 'text' | 'voice' | 'style'>>
  ): Promise<VoiceoverResponse> {
    const voice = gender === 'male' ? 'male-character' : 'female-character';
    return this.generate({
      text,
      voice,
      style: emotionToStyle(emotion),
      ...options,
    });
  },
};

// ===== Dialogue Service =====

export const dialogueService = {
  /**
   * Generate multi-character dialogue
   * POST /api/audio/dialogue
   */
  async generate(request: DialogueRequest): Promise<DialogueResponse> {
    // Apply emotion-based style to each line
    const linesWithStyle = request.lines.map((line) => ({
      ...line,
      style: emotionToStyle(line.emotion),
    }));

    const response = await api.post<DialogueResponse>(
      `${AUDIO_API_BASE}/dialogue`,
      {
        lines: linesWithStyle,
        model: request.model ?? 'eleven_multilingual_v2',
        language: request.language ?? 'en',
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate a two-person conversation
   */
  async conversation(
    exchanges: Array<{ speaker: 'A' | 'B'; text: string; emotion?: Emotion }>,
    speakerA: { name: string; voice: VoiceCategory },
    speakerB: { name: string; voice: VoiceCategory },
    options?: Partial<Omit<DialogueRequest, 'lines'>>
  ): Promise<DialogueResponse> {
    const lines = exchanges.map((exchange) => ({
      character: exchange.speaker === 'A' ? speakerA.name : speakerB.name,
      text: exchange.text,
      voice: exchange.speaker === 'A' ? speakerA.voice : speakerB.voice,
      emotion: exchange.emotion,
    }));

    return this.generate({
      lines,
      ...options,
    });
  },
};

// ===== Music Service =====

export const musicService = {
  /**
   * Generate music track
   * POST /api/audio/music
   */
  async generate(request: MusicTrackRequest): Promise<MusicTrackResponse> {
    const response = await api.post<MusicTrackResponse>(
      `${AUDIO_API_BASE}/music`,
      {
        duration: request.duration,
        genre: request.genre ?? 'ambient',
        mood: request.mood ?? 'relaxing',
        tempo: request.tempo ?? 'medium',
        instruments: request.instruments,
        description: request.description,
        instrumental: request.instrumental ?? true,
        format: request.format ?? 'mp3_44100_128',
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate background music for a specific scene type
   */
  async backgroundMusic(
    sceneType: 'action' | 'romance' | 'suspense' | 'comedy' | 'drama' | 'nature',
    duration: number = 30
  ): Promise<MusicTrackResponse> {
    const presets: Record<string, Partial<MusicTrackRequest>> = {
      action: { genre: 'electronic', mood: 'energetic', tempo: 'fast' },
      romance: { genre: 'orchestral', mood: 'romantic', tempo: 'slow' },
      suspense: { genre: 'cinematic', mood: 'tense', tempo: 'slow' },
      comedy: { genre: 'pop', mood: 'playful', tempo: 'fast' },
      drama: { genre: 'cinematic', mood: 'melancholic', tempo: 'medium' },
      nature: { genre: 'ambient', mood: 'relaxing', tempo: 'slow' },
    };

    return this.generate({
      duration,
      instrumental: true,
      ...presets[sceneType],
    });
  },

  /**
   * Generate lo-fi beats for content creation
   */
  async lofi(duration: number = 60): Promise<MusicTrackResponse> {
    return this.generate({
      duration,
      genre: 'lo-fi',
      mood: 'relaxing',
      tempo: 'slow',
      instruments: 'piano, vinyl crackle, soft drums',
      instrumental: true,
    });
  },
};

// ===== Sound Effects Service =====

export const sfxService = {
  /**
   * Generate sound effect
   * POST /api/audio/sfx
   */
  async generate(request: SoundEffectRequest): Promise<SoundEffectResponse> {
    const response = await api.post<SoundEffectResponse>(
      `${AUDIO_API_BASE}/sfx`,
      {
        description: request.description,
        duration: request.duration ?? 5,
        format: request.format ?? 'mp3_44100_128',
      },
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Generate common sound effects by category
   */
  async common(
    category: 'nature' | 'urban' | 'mechanical' | 'ui' | 'impact' | 'ambient',
    description: string,
    duration?: number
  ): Promise<SoundEffectResponse> {
    const prefixes: Record<string, string> = {
      nature: 'Natural sound of',
      urban: 'City ambience with',
      mechanical: 'Mechanical sound of',
      ui: 'User interface sound:',
      impact: 'Impact sound of',
      ambient: 'Background ambience of',
    };

    return this.generate({
      description: `${prefixes[category]} ${description}`,
      duration,
    });
  },
};

// ===== Voice Catalog Service =====

export const voiceCatalogService = {
  /**
   * Get available voices
   * GET /api/audio/voices
   */
  async getVoices(): Promise<VoicesResponse> {
    const response = await api.get<VoicesResponse>(
      `${AUDIO_API_BASE}/voices`,
      getAuthHeaders()
    );
    return response.data;
  },

  /**
   * Get voices by category
   */
  async getVoicesByCategory(category: VoiceCategory): Promise<VoiceInfo[]> {
    const response = await this.getVoices();
    if (!response.success || !response.voices) {
      return [];
    }
    return response.voices.filter((v) => v.category === category);
  },
};

// ===== Unified Audio Service =====

export const audioService = {
  voiceover: voiceoverService,
  dialogue: dialogueService,
  music: musicService,
  sfx: sfxService,
  voices: voiceCatalogService,

  /**
   * Map frontend node type to API endpoint
   */
  getEndpointForNodeType(
    nodeType: string
  ): 'voiceover' | 'dialogue' | 'music' | 'sfx' | null {
    const mapping: Record<string, 'voiceover' | 'dialogue' | 'music' | 'sfx'> = {
      voiceover: 'voiceover',
      voiceoverGen: 'voiceover',
      audioVoiceover: 'voiceover',
      dialogue: 'dialogue',
      dialogueGen: 'dialogue',
      audioDialogue: 'dialogue',
      characterDialogue: 'dialogue',
      music: 'music',
      musicGen: 'music',
      audioMusic: 'music',
      backgroundMusic: 'music',
      sfx: 'sfx',
      soundEffect: 'sfx',
      audioSfx: 'sfx',
      foley: 'sfx',
    };
    return mapping[nodeType] ?? null;
  },

  /**
   * Execute audio generation based on node type
   */
  async executeByNodeType(
    nodeType: string,
    request: VoiceoverRequest | DialogueRequest | MusicTrackRequest | SoundEffectRequest
  ): Promise<VoiceoverResponse | DialogueResponse | MusicTrackResponse | SoundEffectResponse> {
    const endpoint = this.getEndpointForNodeType(nodeType);
    if (!endpoint) {
      throw new Error(`Unknown audio node type: ${nodeType}`);
    }

    switch (endpoint) {
      case 'voiceover':
        return voiceoverService.generate(request as VoiceoverRequest);
      case 'dialogue':
        return dialogueService.generate(request as DialogueRequest);
      case 'music':
        return musicService.generate(request as MusicTrackRequest);
      case 'sfx':
        return sfxService.generate(request as SoundEffectRequest);
    }
  },
};

export default audioService;
