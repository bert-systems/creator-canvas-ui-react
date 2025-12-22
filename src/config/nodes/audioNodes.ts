/**
 * Audio Generation Nodes
 * Voiceover, Dialogue, Music, and Sound Effects nodes
 * API: /api/audio endpoints
 */
import type { NodeDefinition } from '@/models/canvas';

export const audioNodes: NodeDefinition[] = [
  // ===== VOICEOVER NODES =====
  {
    type: 'voiceoverGen',
    category: 'audio',
    label: 'Voiceover',
    displayName: 'Text-to-Speech',
    description: 'Convert text to natural-sounding speech using AI voices.',
    quickHelp: 'Text → Spoken audio',
    useCase: 'Narration, video voiceovers, audiobooks, podcasts',
    icon: 'RecordVoiceOver',
    inputs: [
      { id: 'text', name: 'Text Input', type: 'text', required: true },
    ],
    outputs: [
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'text', name: 'Script', type: 'text', default: '', placeholder: 'Enter text to speak...' },
      { id: 'voice', name: 'Voice', type: 'select', default: 'male-narrator', options: [
        { label: 'Male Narrator (Deep)', value: 'male-narrator' },
        { label: 'Female Narrator (Warm)', value: 'female-narrator' },
        { label: 'Male Character (Versatile)', value: 'male-character' },
        { label: 'Female Character (Expressive)', value: 'female-character' },
        { label: 'Child Voice', value: 'child' },
        { label: 'Elderly Male', value: 'elderly-male' },
        { label: 'Default (George)', value: 'default' },
      ]},
      { id: 'language', name: 'Language', type: 'select', default: 'en', options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
        { label: 'German', value: 'de' },
        { label: 'Italian', value: 'it' },
        { label: 'Portuguese', value: 'pt' },
        { label: 'Japanese', value: 'ja' },
        { label: 'Korean', value: 'ko' },
        { label: 'Chinese', value: 'zh' },
      ]},
      { id: 'stability', name: 'Voice Stability', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'similarityBoost', name: 'Clarity', type: 'slider', default: 0.75, min: 0, max: 1, step: 0.05 },
      { id: 'style', name: 'Style Intensity', type: 'slider', default: 0.0, min: 0, max: 1, step: 0.1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'audio' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['text', 'voice'] },
      actions: { primary: 'execute', secondary: ['download'] },
    },
    agentBinding: {
      agentType: 'audio-voiceover',
      endpoint: '/api/audio/voiceover',
      config: {},
    },
    aiModel: 'eleven-multilingual-v2',
    tier: 'production',
  },

  // ===== DIALOGUE NODES =====
  {
    type: 'dialogueGen',
    category: 'audio',
    label: 'Dialogue',
    displayName: 'Multi-Character Dialogue',
    description: 'Generate conversations between multiple characters with distinct voices.',
    quickHelp: 'Script → Character voices',
    useCase: 'Animation dialogue, video games, storytelling, drama',
    icon: 'Forum',
    inputs: [
      { id: 'dialogue', name: 'Dialogue Input', type: 'text' },
    ],
    outputs: [
      { id: 'audio', name: 'Combined Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'character1Name', name: 'Character 1 Name', type: 'text', default: 'Alice' },
      { id: 'character1Voice', name: 'Character 1 Voice', type: 'select', default: 'female-character', options: [
        { label: 'Female Character', value: 'female-character' },
        { label: 'Male Character', value: 'male-character' },
        { label: 'Child', value: 'child' },
        { label: 'Elderly Male', value: 'elderly-male' },
      ]},
      { id: 'character2Name', name: 'Character 2 Name', type: 'text', default: 'Bob' },
      { id: 'character2Voice', name: 'Character 2 Voice', type: 'select', default: 'male-character', options: [
        { label: 'Female Character', value: 'female-character' },
        { label: 'Male Character', value: 'male-character' },
        { label: 'Child', value: 'child' },
        { label: 'Elderly Male', value: 'elderly-male' },
      ]},
      { id: 'script', name: 'Dialogue Script', type: 'text', default: '', placeholder: 'ALICE: Hello!\nBOB: Hi there!' },
      { id: 'emotion', name: 'Default Emotion', type: 'select', default: 'neutral', options: [
        { label: 'Neutral', value: 'neutral' },
        { label: 'Happy', value: 'happy' },
        { label: 'Sad', value: 'sad' },
        { label: 'Angry', value: 'angry' },
        { label: 'Excited', value: 'excited' },
        { label: 'Calm', value: 'calm' },
        { label: 'Scared', value: 'scared' },
      ]},
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'audio' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'] },
    },
    agentBinding: {
      agentType: 'audio-dialogue',
      endpoint: '/api/audio/dialogue',
      config: {},
    },
    aiModel: 'eleven-multilingual-v2',
    tier: 'production',
  },

  // ===== MUSIC NODES =====
  {
    type: 'musicGen',
    category: 'audio',
    label: 'Music',
    displayName: 'Music Generator',
    description: 'Generate background music, scores, and soundtracks for your content.',
    quickHelp: 'Description → Music track',
    useCase: 'Video soundtracks, podcasts, social media, games',
    icon: 'MusicNote',
    inputs: [],
    outputs: [
      { id: 'audio', name: 'Music Track', type: 'audio' },
    ],
    parameters: [
      { id: 'description', name: 'Music Description', type: 'text', default: '', placeholder: 'Describe the music you want...' },
      { id: 'duration', name: 'Duration (seconds)', type: 'slider', default: 30, min: 5, max: 120, step: 5 },
      { id: 'genre', name: 'Genre', type: 'select', default: 'ambient', options: [
        { label: 'Ambient', value: 'ambient' },
        { label: 'Cinematic', value: 'cinematic' },
        { label: 'Electronic', value: 'electronic' },
        { label: 'Orchestral', value: 'orchestral' },
        { label: 'Lo-Fi', value: 'lo-fi' },
        { label: 'Rock', value: 'rock' },
        { label: 'Jazz', value: 'jazz' },
        { label: 'Pop', value: 'pop' },
        { label: 'Dramatic', value: 'dramatic' },
        { label: 'Upbeat', value: 'upbeat' },
      ]},
      { id: 'mood', name: 'Mood', type: 'select', default: 'relaxing', options: [
        { label: 'Relaxing', value: 'relaxing' },
        { label: 'Energetic', value: 'energetic' },
        { label: 'Melancholic', value: 'melancholic' },
        { label: 'Triumphant', value: 'triumphant' },
        { label: 'Mysterious', value: 'mysterious' },
        { label: 'Romantic', value: 'romantic' },
        { label: 'Tense', value: 'tense' },
        { label: 'Playful', value: 'playful' },
      ]},
      { id: 'tempo', name: 'Tempo', type: 'select', default: 'medium', options: [
        { label: 'Slow', value: 'slow' },
        { label: 'Medium', value: 'medium' },
        { label: 'Fast', value: 'fast' },
      ]},
      { id: 'instruments', name: 'Instruments', type: 'text', default: '', placeholder: 'piano, strings, drums...' },
      { id: 'instrumental', name: 'Instrumental Only', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'audio' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['description', 'genre', 'mood'] },
      actions: { primary: 'execute', secondary: ['download'] },
    },
    agentBinding: {
      agentType: 'audio-music',
      endpoint: '/api/audio/music',
      config: {},
    },
    aiModel: 'music-gen',
    tier: 'production',
  },

  // Scene Music Presets
  {
    type: 'sceneMusic',
    category: 'audio',
    label: 'Scene Music',
    displayName: 'Scene Soundtrack',
    description: 'Generate music tailored for specific scene types with one click.',
    quickHelp: 'Scene type → Perfect soundtrack',
    useCase: 'Quick scoring for video scenes, instant mood music',
    icon: 'Movie',
    inputs: [
      { id: 'scene', name: 'Scene Description', type: 'text' },
    ],
    outputs: [
      { id: 'audio', name: 'Scene Music', type: 'audio' },
    ],
    parameters: [
      { id: 'sceneType', name: 'Scene Type', type: 'select', default: 'drama', options: [
        { label: 'Action/Chase', value: 'action' },
        { label: 'Romance', value: 'romance' },
        { label: 'Suspense/Thriller', value: 'suspense' },
        { label: 'Comedy', value: 'comedy' },
        { label: 'Drama', value: 'drama' },
        { label: 'Nature/Documentary', value: 'nature' },
        { label: 'Horror', value: 'horror' },
        { label: 'Epic/Triumph', value: 'epic' },
      ]},
      { id: 'duration', name: 'Duration (seconds)', type: 'slider', default: 30, min: 10, max: 60, step: 5 },
      { id: 'intensity', name: 'Intensity', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
    ],
    defaultDisplayMode: 'compact',
    slots: {
      preview: { type: 'audio' },
      parameters: { layout: 'inline', visibleInModes: ['compact', 'standard', 'expanded'], priorityParams: ['sceneType'] },
      actions: { primary: 'execute' },
    },
    agentBinding: {
      agentType: 'audio-music',
      endpoint: '/api/audio/music',
      config: { usePresets: true },
    },
    aiModel: 'music-gen',
    tier: 'production',
  },

  // ===== SOUND EFFECTS NODES =====
  {
    type: 'sfxGen',
    category: 'audio',
    label: 'Sound Effect',
    displayName: 'Sound Effect Generator',
    description: 'Generate any sound effect from a text description.',
    quickHelp: 'Description → Sound effect',
    useCase: 'Foley, ambience, game sounds, video effects',
    icon: 'VolumeUp',
    inputs: [],
    outputs: [
      { id: 'audio', name: 'Sound Effect', type: 'audio' },
    ],
    parameters: [
      { id: 'description', name: 'Sound Description', type: 'text', default: '', placeholder: 'Describe the sound you want...' },
      { id: 'duration', name: 'Duration (seconds)', type: 'slider', default: 5, min: 1, max: 30, step: 1 },
      { id: 'category', name: 'Category', type: 'select', default: 'general', options: [
        { label: 'General', value: 'general' },
        { label: 'Nature', value: 'nature' },
        { label: 'Urban/City', value: 'urban' },
        { label: 'Mechanical', value: 'mechanical' },
        { label: 'UI/Interface', value: 'ui' },
        { label: 'Impact/Collision', value: 'impact' },
        { label: 'Ambient', value: 'ambient' },
        { label: 'Sci-Fi', value: 'scifi' },
        { label: 'Fantasy/Magic', value: 'fantasy' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'audio' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['description', 'category'] },
      actions: { primary: 'execute', secondary: ['download'] },
    },
    agentBinding: {
      agentType: 'audio-sfx',
      endpoint: '/api/audio/sfx',
      config: {},
    },
    aiModel: 'sfx-gen',
    tier: 'production',
  },

  // Ambient Sound Node
  {
    type: 'ambientSound',
    category: 'audio',
    label: 'Ambient',
    displayName: 'Ambient Soundscape',
    description: 'Generate immersive ambient backgrounds and atmospheric sounds.',
    quickHelp: 'Environment → Ambient audio',
    useCase: 'Background ambience, meditation, ASMR, scene setting',
    icon: 'Waves',
    inputs: [],
    outputs: [
      { id: 'audio', name: 'Ambient Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'environment', name: 'Environment', type: 'select', default: 'forest', options: [
        { label: 'Forest', value: 'forest' },
        { label: 'Ocean/Beach', value: 'ocean' },
        { label: 'Rain', value: 'rain' },
        { label: 'Thunderstorm', value: 'thunderstorm' },
        { label: 'City', value: 'city' },
        { label: 'Cafe', value: 'cafe' },
        { label: 'Office', value: 'office' },
        { label: 'Space', value: 'space' },
        { label: 'Underwater', value: 'underwater' },
        { label: 'Fireplace', value: 'fireplace' },
      ]},
      { id: 'duration', name: 'Duration (seconds)', type: 'slider', default: 30, min: 10, max: 120, step: 10 },
      { id: 'intensity', name: 'Intensity', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'additionalElements', name: 'Additional Elements', type: 'text', default: '', placeholder: 'birds, wind, distant traffic...' },
    ],
    defaultDisplayMode: 'compact',
    slots: {
      preview: { type: 'audio' },
      parameters: { layout: 'inline', visibleInModes: ['compact', 'standard', 'expanded'], priorityParams: ['environment'] },
      actions: { primary: 'execute' },
    },
    agentBinding: {
      agentType: 'audio-sfx',
      endpoint: '/api/audio/sfx',
      config: { ambient: true },
    },
    aiModel: 'sfx-gen',
    tier: 'production',
  },

  // ===== AUDIO UTILITY NODES =====
  {
    type: 'audioMixer',
    category: 'audio',
    label: 'Audio Mixer',
    displayName: 'Mix Audio Tracks',
    description: 'Combine multiple audio tracks with volume control.',
    quickHelp: 'Multiple audio → Mixed track',
    useCase: 'Layering voiceover with music, combining sound effects',
    icon: 'Tune',
    inputs: [
      { id: 'track1', name: 'Track 1', type: 'audio', required: true },
      { id: 'track2', name: 'Track 2', type: 'audio' },
      { id: 'track3', name: 'Track 3', type: 'audio' },
    ],
    outputs: [
      { id: 'mixed', name: 'Mixed Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'volume1', name: 'Track 1 Volume', type: 'slider', default: 1.0, min: 0, max: 1.5, step: 0.1 },
      { id: 'volume2', name: 'Track 2 Volume', type: 'slider', default: 0.5, min: 0, max: 1.5, step: 0.1 },
      { id: 'volume3', name: 'Track 3 Volume', type: 'slider', default: 0.5, min: 0, max: 1.5, step: 0.1 },
      { id: 'fadeIn', name: 'Fade In (sec)', type: 'slider', default: 0, min: 0, max: 5, step: 0.5 },
      { id: 'fadeOut', name: 'Fade Out (sec)', type: 'slider', default: 0, min: 0, max: 5, step: 0.5 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'audio' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'] },
    },
    agentBinding: {
      agentType: 'audio-mixer',
      endpoint: '/api/audio/mix',
      config: {},
    },
    tier: 'creative',
  },

  // Lip Sync Node (connects to video)
  {
    type: 'lipSync',
    category: 'audio',
    label: 'Lip Sync',
    displayName: 'Audio to Lip Sync',
    description: 'Generate lip sync data from audio for animation.',
    quickHelp: 'Audio → Lip movement data',
    useCase: 'Character animation, avatar videos, dubbing',
    icon: 'SpeakerNotes',
    inputs: [
      { id: 'audio', name: 'Audio Input', type: 'audio', required: true },
      { id: 'face', name: 'Face Image', type: 'image' },
    ],
    outputs: [
      { id: 'video', name: 'Synced Video', type: 'video' },
    ],
    parameters: [
      { id: 'expressionIntensity', name: 'Expression Intensity', type: 'slider', default: 0.7, min: 0, max: 1, step: 0.1 },
      { id: 'headMotion', name: 'Head Motion', type: 'boolean', default: true },
      { id: 'eyeContact', name: 'Eye Contact', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'video' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute' },
    },
    agentBinding: {
      agentType: 'video-lipsync',
      endpoint: '/api/video-generation/kling-avatar/generate',
      config: {},
    },
    aiModel: 'kling-avatar-v2',
    tier: 'production',
  },
];
