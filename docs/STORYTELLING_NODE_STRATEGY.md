# Storytelling Node Strategy - Creative Canvas Studio

**Version:** 2.0 (Enhanced Context Architecture)
**Date:** December 15, 2025
**Status:** Implementation Phase

---

## Executive Summary

This document outlines a comprehensive strategy to transform Creative Canvas Studio into an innovative, AI-powered storytelling and narrative generation platform with **full context propagation** and **dual-execution architecture**.

### Key Innovations in v2.0

1. **Universal Context System** - Every node receives and propagates story context
2. **Dual Execution Architecture** - LLM agents for narrative + Image/Video generators for visuals
3. **Rich Port Ecosystem** - 20+ port types enabling complex workflow connections
4. **Multi-Output Nodes** - Single execution produces text, images, metadata, and downstream context
5. **Workflow Templates** - Pre-built patterns for novels, screenplays, storyboards, games

---

## Part 1: Universal Context Architecture

### 1.1 The Context Object

Every storytelling node receives and propagates a **StoryContext** object that accumulates knowledge as it flows through the workflow:

```typescript
interface StoryContext {
  // Core Story DNA
  story?: StoryData;
  outline?: OutlineData;
  treatment?: TreatmentData;

  // Characters (accumulated)
  characters: Map<string, CharacterProfile>;
  characterVoices: Map<string, CharacterVoiceProfile>;
  relationships: CharacterRelationship[];

  // World (accumulated)
  locations: Map<string, LocationData>;
  lore: WorldLoreData[];
  timeline: TimelineData;

  // Plot (accumulated)
  plotPoints: PlotPointData[];
  scenes: SceneData[];
  currentAct: number;
  currentScene: number;

  // Branching State
  choiceHistory: ChoiceRecord[];
  consequences: ConsequenceState;
  activeBranch: string;

  // Visual Assets (accumulated)
  characterPortraits: Map<string, string[]>;  // characterId -> image URLs
  locationVisuals: Map<string, string[]>;     // locationId -> image URLs
  storyboardFrames: StoryboardFrame[];

  // Generation Settings
  style: StyleProfile;
  tone: ToneProfile;
  targetFormat: 'novel' | 'screenplay' | 'game' | 'comic' | 'storyboard';

  // Metadata
  wordCount: number;
  estimatedReadTime: number;
  generationHistory: GenerationRecord[];
}
```

### 1.2 Context Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CONTEXT PROPAGATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────┐                                                                    │
│  │ StoryGenesis │──┬── story ──────────────────────────────────────────────────▶    │
│  │              │  │                                                                 │
│  │  IN: idea    │  ├── characters[] ──▶ CharacterCreator ──▶ CharacterVoice ──▶    │
│  │  IN: genre   │  │                                                                 │
│  │              │  ├── outline ──────▶ StoryStructure ──▶ PlotPoint ──▶             │
│  │ OUT: context │  │                                                                 │
│  └──────────────┘  └── context ──────▶ [ALL DOWNSTREAM NODES]                       │
│                                                                                       │
│  CONTEXT ACCUMULATES AT EACH NODE:                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │ Node A ──▶ Context + Node A Output ──▶ Node B ──▶ Context + A + B ──▶ ...  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Dual Execution Architecture

### 2.1 Every Node Makes Multiple Calls

Each storytelling node executes a **pipeline** of AI calls:

```typescript
interface NodeExecution {
  // Phase 1: LLM Agent Calls (Narrative Generation)
  narrativeAgents: AgentCall[];

  // Phase 2: Enhancement Agents (Optional)
  enhancementAgents?: AgentCall[];

  // Phase 3: Visual Generation (Optional)
  imageGeneration?: ImageGenCall[];
  videoGeneration?: VideoGenCall[];

  // Phase 4: Context Update
  contextMutation: ContextUpdate;
}

interface AgentCall {
  agentType: 'story' | 'character' | 'dialogue' | 'world' | 'plot' | 'enhance';
  endpoint: string;  // e.g., '/api/agent/story/start'
  payload: Record<string, unknown>;
  outputMapping: OutputMapping;
}

interface ImageGenCall {
  model: 'flux-2-pro' | 'flux-kontext' | 'kling-avatar' | string;
  promptSource: 'generated' | 'parameter' | 'context';
  referenceImages?: string[];  // From context or inputs
  outputTarget: 'characterPortrait' | 'locationVisual' | 'storyboardFrame' | 'sceneImage';
}
```

### 2.2 Execution Pipeline Example: SceneGenerator

```typescript
// SceneGenerator execution pipeline
const sceneGeneratorPipeline: NodeExecution = {
  // 1. Generate scene narrative via LLM
  narrativeAgents: [
    {
      agentType: 'story',
      endpoint: '/api/agent/story/generate-scene',
      payload: {
        scenePrompt: '${parameters.sceneConcept}',
        storyContext: '${context.story}',
        characters: '${context.characters}',
        location: '${inputs.location}',
        precedingScene: '${inputs.precedingScene}',
        format: '${parameters.format}',
        pov: '${parameters.pov}',
      },
      outputMapping: {
        'response.scene' -> 'outputs.scene',
        'response.dialogue' -> 'outputs.dialogue',
        'response.visualPrompts' -> 'internal.visualPrompts',
      }
    }
  ],

  // 2. Enhance dialogue with character voices
  enhancementAgents: [
    {
      agentType: 'dialogue',
      endpoint: '/api/agent/dialogue/apply-voices',
      payload: {
        dialogue: '${internal.dialogue}',
        characterVoices: '${context.characterVoices}',
      },
      outputMapping: {
        'response.enhancedDialogue' -> 'outputs.dialogue',
      }
    }
  ],

  // 3. Generate storyboard images (if enabled)
  imageGeneration: [
    {
      model: 'flux-2-pro',
      promptSource: 'generated',  // Uses internal.visualPrompts
      referenceImages: [
        '${context.characterPortraits[scene.characters[0]]}',
        '${context.locationVisuals[scene.location]}',
      ],
      outputTarget: 'storyboardFrame',
    }
  ],

  // 4. Update context with new scene
  contextMutation: {
    append: {
      'context.scenes': '${outputs.scene}',
      'context.storyboardFrames': '${outputs.storyboardFrames}',
    },
    increment: {
      'context.currentScene': 1,
      'context.wordCount': '${outputs.scene.wordCount}',
    }
  }
};
```

---

## Part 3: Complete Port Type Ecosystem

### 3.1 Port Types

```typescript
export type PortType =
  // === CONTEXT PORTS (Universal) ===
  | 'storyContext'    // Full accumulated context object
  | 'story'           // StoryData - core story concept
  | 'outline'         // OutlineData - structured beat sheet
  | 'treatment'       // TreatmentData - professional document

  // === CHARACTER PORTS ===
  | 'character'       // CharacterProfile - full character data
  | 'characterVoice'  // CharacterVoiceProfile - speech patterns
  | 'relationship'    // CharacterRelationship - between two characters
  | 'characterArc'    // Character transformation data

  // === WORLD PORTS ===
  | 'location'        // LocationData - setting/place
  | 'lore'            // WorldLoreData - mythology/history
  | 'timeline'        // TimelineData - chronological events
  | 'worldRules'      // Magic/tech system rules

  // === NARRATIVE PORTS ===
  | 'scene'           // SceneData - complete scene
  | 'plotPoint'       // PlotPointData - story beat
  | 'dialogue'        // DialogueData - conversation
  | 'monologue'       // Single character speech
  | 'narration'       // Prose narration text

  // === BRANCHING PORTS ===
  | 'choice'          // ChoicePointData - decision point
  | 'consequence'     // ConsequenceData - choice result
  | 'branchState'     // Current branch position

  // === VISUAL PORTS ===
  | 'image'           // Generated image URL
  | 'imagePrompt'     // Prompt for image generation
  | 'video'           // Generated video URL
  | 'storyboard'      // Array of storyboard frames
  | 'characterSheet'  // Visual character reference
  | 'locationVisual'  // Visual location reference

  // === MEDIA PORTS ===
  | 'audio'           // Audio narration/music
  | 'voiceover'       // Character voice audio
  | 'soundtrack'      // Background music

  // === DOCUMENT PORTS ===
  | 'screenplay'      // Formatted screenplay
  | 'manuscript'      // Novel manuscript
  | 'gameScript'      // Interactive game script
  | 'comicScript'     // Comic/manga script

  // === PRIMITIVE PORTS ===
  | 'text'            // Raw text
  | 'prompt'          // Generation prompt
  | 'style'           // Style/tone settings
  | 'any';            // Universal connector
```

### 3.2 Port Compatibility Matrix

```
FROM ↓ / TO →      │ story │ scene │ character │ dialogue │ image │ video │
───────────────────┼───────┼───────┼───────────┼──────────┼───────┼───────┤
storyContext       │   ✓   │   ✓   │     ✓     │    ✓     │   ✓   │   ✓   │
story              │   ✓   │   ✓   │     ✓     │    ✓     │   -   │   -   │
outline            │   ✓   │   ✓   │     -     │    -     │   -   │   -   │
character          │   -   │   ✓   │     ✓     │    ✓     │   ✓   │   ✓   │
scene              │   -   │   ✓   │     -     │    ✓     │   ✓   │   ✓   │
plotPoint          │   -   │   ✓   │     -     │    -     │   -   │   -   │
imagePrompt        │   -   │   -   │     -     │    -     │   ✓   │   ✓   │
characterSheet     │   -   │   -   │     ✓     │    -     │   ✓   │   ✓   │
```

---

## Part 4: Enhanced Node Definitions

### 4.1 STORY FOUNDATION NODES

#### StoryGenesis Node (Enhanced)

```typescript
{
  type: 'storyGenesis',
  category: 'narrative',
  label: 'Story Genesis',
  displayName: 'Create Story Concept',

  // INPUTS
  inputs: [
    { id: 'idea', name: 'Core Idea', type: 'text', required: true },
    { id: 'genre', name: 'Genre Hints', type: 'text' },
    { id: 'tone', name: 'Tone/Style', type: 'style' },
    { id: 'referenceStory', name: 'Reference Story', type: 'story' },  // For "similar to X"
    { id: 'existingCharacters', name: 'Pre-existing Characters', type: 'character', multiple: true },
  ],

  // OUTPUTS
  outputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext' },  // UNIVERSAL OUTPUT
    { id: 'story', name: 'Story Concept', type: 'story' },
    { id: 'characters', name: 'Character Seeds', type: 'character', multiple: true },
    { id: 'outline', name: 'Basic Outline', type: 'outline' },
    { id: 'logline', name: 'Logline', type: 'text' },
    { id: 'visualStyle', name: 'Visual Style Guide', type: 'style' },
    { id: 'coverPrompt', name: 'Cover Art Prompt', type: 'imagePrompt' },  // For image gen
  ],

  // EXECUTION PIPELINE
  execution: {
    narrativeAgents: [
      {
        agentType: 'story',
        endpoint: '/api/agent/story/start',
        payload: {
          starterPrompt: '${parameters.idea}',
          themes: '${parameters.themes}',
          genre: '${parameters.genre}',
          tone: '${parameters.tone}',
          mood: '${parameters.mood}',
          pointOfView: '${parameters.pov}',
          targetLength: '${parameters.length}',
          targetAudience: '${parameters.audience}',
        }
      }
    ],
    enhancementAgents: [
      {
        agentType: 'enhance',
        endpoint: '/api/agent/prompt/enhance',
        payload: {
          basePrompt: '${internal.visualConcept}',
          style: '${parameters.visualStyle}',
          purpose: 'book-cover',
        },
        outputMapping: {
          'response.enhancedPrompt' -> 'outputs.coverPrompt'
        }
      }
    ],
    imageGeneration: [
      {
        condition: '${parameters.generateCoverArt}',
        model: 'flux-2-pro',
        promptSource: 'outputs.coverPrompt',
        outputTarget: 'coverArt',
      }
    ]
  },

  parameters: [
    { id: 'genre', name: 'Primary Genre', type: 'select', default: 'drama', options: [...] },
    { id: 'length', name: 'Target Length', type: 'select', default: 'short', options: [...] },
    { id: 'audience', name: 'Target Audience', type: 'select', default: 'general', options: [...] },
    { id: 'complexity', name: 'Narrative Complexity', type: 'slider', default: 0.5 },
    { id: 'generateCoverArt', name: 'Generate Cover Art', type: 'boolean', default: true },
    { id: 'visualStyle', name: 'Visual Style', type: 'select', default: 'cinematic', options: [...] },
  ],
}
```

#### StoryStructure Node (Enhanced)

```typescript
{
  type: 'storyStructure',
  category: 'narrative',
  label: 'Story Structure',

  inputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext' },  // Receives full context
    { id: 'story', name: 'Story Concept', type: 'story', required: true },
    { id: 'characters', name: 'Main Characters', type: 'character', multiple: true },
    { id: 'existingBeats', name: 'Existing Plot Points', type: 'plotPoint', multiple: true },
  ],

  outputs: [
    { id: 'context', name: 'Updated Context', type: 'storyContext' },  // Propagates context
    { id: 'outline', name: 'Structured Outline', type: 'outline' },
    { id: 'beats', name: 'Story Beats', type: 'plotPoint', multiple: true },
    { id: 'acts', name: 'Act Breakdown', type: 'scene', multiple: true },
    { id: 'actVisualPrompts', name: 'Act Visual Prompts', type: 'imagePrompt', multiple: true },
  ],

  execution: {
    narrativeAgents: [
      {
        agentType: 'story',
        endpoint: '/api/agent/story/structure',
        payload: {
          story: '${inputs.story}',
          framework: '${parameters.framework}',
          characters: '${inputs.characters}',
          detailLevel: '${parameters.detailLevel}',
        }
      }
    ],
    enhancementAgents: [
      {
        // Generate visual prompts for each act's key moment
        agentType: 'enhance',
        endpoint: '/api/agent/prompt/batch-enhance',
        payload: {
          scenes: '${internal.actKeyMoments}',
          style: '${context.style}',
        }
      }
    ]
  },
}
```

### 4.2 CHARACTER NODES (Enhanced)

#### CharacterCreator Node

```typescript
{
  type: 'characterCreator',
  category: 'character',
  label: 'Character Creator',

  inputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext' },
    { id: 'concept', name: 'Character Concept', type: 'text', required: true },
    { id: 'story', name: 'Story Context', type: 'story' },
    { id: 'role', name: 'Story Role', type: 'text' },
    { id: 'visualReference', name: 'Visual Reference', type: 'image' },  // For image-to-character
    { id: 'voiceReference', name: 'Voice Sample', type: 'audio' },       // For voice cloning
  ],

  outputs: [
    { id: 'context', name: 'Updated Context', type: 'storyContext' },
    { id: 'character', name: 'Character Profile', type: 'character' },
    { id: 'backstory', name: 'Backstory', type: 'narration' },
    { id: 'arc', name: 'Character Arc', type: 'characterArc' },
    { id: 'voiceProfile', name: 'Voice Profile', type: 'characterVoice' },
    { id: 'portraitPrompt', name: 'Portrait Prompt', type: 'imagePrompt' },
    { id: 'portrait', name: 'Character Portrait', type: 'image' },
    { id: 'characterSheet', name: 'Character Sheet', type: 'characterSheet' },
  ],

  execution: {
    narrativeAgents: [
      {
        agentType: 'character',
        endpoint: '/api/character-library/generate',
        payload: {
          concept: '${parameters.concept}',
          archetype: '${parameters.archetype}',
          storyContext: '${context.story}',
          depth: '${parameters.depth}',
        }
      }
    ],
    imageGeneration: [
      {
        condition: '${parameters.generatePortrait}',
        model: 'flux-2-pro',
        promptSource: 'internal.portraitPrompt',
        referenceImages: ['${inputs.visualReference}'],
        outputTarget: 'portrait',
      },
      {
        condition: '${parameters.generateSheet}',
        model: 'flux-2-pro',
        promptSource: 'internal.sheetPrompt',
        referenceImages: ['${outputs.portrait}'],  // Uses own portrait as reference
        outputTarget: 'characterSheet',
      }
    ],
    contextMutation: {
      set: {
        'context.characters[${outputs.character.id}]': '${outputs.character}',
        'context.characterPortraits[${outputs.character.id}]': '${outputs.portrait}',
      }
    }
  },

  parameters: [
    { id: 'archetype', name: 'Base Archetype', type: 'select', default: 'none', options: [...] },
    { id: 'depth', name: 'Character Depth', type: 'select', default: 'full', options: [...] },
    { id: 'generatePortrait', name: 'Generate Portrait', type: 'boolean', default: true },
    { id: 'generateSheet', name: 'Generate Character Sheet', type: 'boolean', default: false },
    { id: 'visualStyle', name: 'Portrait Style', type: 'select', default: 'realistic', options: [
      { label: 'Photorealistic', value: 'realistic' },
      { label: 'Digital Art', value: 'digital' },
      { label: 'Anime/Manga', value: 'anime' },
      { label: 'Comic Book', value: 'comic' },
      { label: 'Oil Painting', value: 'painting' },
    ]},
  ],
}
```

#### CharacterVoice Node

```typescript
{
  type: 'characterVoice',
  category: 'dialogue',
  label: 'Character Voice',

  inputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext' },
    { id: 'character', name: 'Character Profile', type: 'character', required: true },
    { id: 'sampleDialogue', name: 'Sample Dialogue', type: 'dialogue' },  // Learn from examples
    { id: 'voiceAudio', name: 'Voice Audio Sample', type: 'audio' },      // For voice cloning
  ],

  outputs: [
    { id: 'context', name: 'Updated Context', type: 'storyContext' },
    { id: 'voiceProfile', name: 'Voice Profile', type: 'characterVoice' },
    { id: 'sampleDialogue', name: 'Sample Lines', type: 'dialogue' },
    { id: 'catchphrases', name: 'Catchphrases', type: 'text', multiple: true },
    { id: 'voiceClone', name: 'Cloned Voice Model', type: 'audio' },  // For TTS
  ],

  execution: {
    narrativeAgents: [
      {
        agentType: 'character',
        endpoint: '/api/agent/character/voice-profile',
        payload: {
          character: '${inputs.character}',
          speechPattern: '${parameters.speechPattern}',
          generateQuirks: '${parameters.quirks}',
          generateCatchphrase: '${parameters.catchphrase}',
        }
      }
    ],
    audioGeneration: [
      {
        condition: '${inputs.voiceAudio && parameters.cloneVoice}',
        model: 'voice-clone',
        endpoint: '/api/audio/voice-clone',
        payload: {
          audioSample: '${inputs.voiceAudio}',
          characterId: '${inputs.character.id}',
        }
      }
    ],
    contextMutation: {
      set: {
        'context.characterVoices[${inputs.character.id}]': '${outputs.voiceProfile}',
      }
    }
  },
}
```

### 4.3 SCENE & PLOT NODES (Enhanced)

#### SceneGenerator Node

```typescript
{
  type: 'sceneGenerator',
  category: 'narrative',
  label: 'Scene Generator',

  inputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext', required: true },
    { id: 'sceneConcept', name: 'Scene Concept', type: 'text', required: true },
    { id: 'characters', name: 'Characters in Scene', type: 'character', multiple: true },
    { id: 'location', name: 'Location', type: 'location' },
    { id: 'precedingScene', name: 'Previous Scene', type: 'scene' },
    { id: 'plotPoint', name: 'Plot Point to Cover', type: 'plotPoint' },
    { id: 'referenceImages', name: 'Visual References', type: 'image', multiple: true },
    { id: 'musicMood', name: 'Music/Mood Reference', type: 'audio' },
  ],

  outputs: [
    { id: 'context', name: 'Updated Context', type: 'storyContext' },
    { id: 'scene', name: 'Complete Scene', type: 'scene' },
    { id: 'dialogue', name: 'Extracted Dialogue', type: 'dialogue' },
    { id: 'narration', name: 'Prose Narration', type: 'narration' },
    { id: 'storyboardPrompts', name: 'Storyboard Prompts', type: 'imagePrompt', multiple: true },
    { id: 'storyboardFrames', name: 'Storyboard Images', type: 'storyboard' },
    { id: 'keyFrame', name: 'Key Frame Image', type: 'image' },
    { id: 'sceneAudio', name: 'Narrated Audio', type: 'audio' },
  ],

  execution: {
    // Phase 1: Generate scene narrative
    narrativeAgents: [
      {
        agentType: 'story',
        endpoint: '/api/agent/story/generate-scene',
        payload: {
          concept: '${inputs.sceneConcept}',
          storyContext: '${context.story}',
          outline: '${context.outline}',
          characters: '${inputs.characters}',
          characterVoices: '${context.characterVoices}',  // Apply voice profiles
          location: '${inputs.location}',
          precedingScene: '${inputs.precedingScene}',
          plotPoint: '${inputs.plotPoint}',
          format: '${parameters.format}',
          pov: '${parameters.pov}',
          sceneType: '${parameters.sceneType}',
          length: '${parameters.length}',
        }
      }
    ],

    // Phase 2: Enhance dialogue with character voices
    enhancementAgents: [
      {
        agentType: 'dialogue',
        endpoint: '/api/agent/dialogue/apply-voices',
        payload: {
          dialogue: '${internal.rawDialogue}',
          characters: '${inputs.characters}',
          characterVoices: '${context.characterVoices}',
        }
      },
      {
        // Generate visual prompts for key moments
        agentType: 'enhance',
        endpoint: '/api/agent/prompt/scene-to-visuals',
        payload: {
          scene: '${internal.scene}',
          characters: '${inputs.characters}',
          characterPortraits: '${context.characterPortraits}',
          location: '${inputs.location}',
          locationVisual: '${context.locationVisuals[inputs.location.id]}',
          numFrames: '${parameters.numFrames}',
          style: '${context.style}',
        }
      }
    ],

    // Phase 3: Generate storyboard images
    imageGeneration: [
      {
        condition: '${parameters.generateStoryboard}',
        model: 'flux-kontext',  // Uses reference images for consistency
        promptSource: 'internal.storyboardPrompts',
        referenceImages: [
          '${context.characterPortraits}',  // Character consistency
          '${context.locationVisuals}',     // Location consistency
          '${inputs.referenceImages}',      // User-provided refs
        ],
        outputTarget: 'storyboardFrames',
        batchSize: '${parameters.numFrames}',
      }
    ],

    // Phase 4: Generate narration audio (optional)
    audioGeneration: [
      {
        condition: '${parameters.generateAudio}',
        model: 'tts-narrator',
        endpoint: '/api/audio/narrate',
        payload: {
          text: '${outputs.narration}',
          voice: '${parameters.narratorVoice}',
          dialogue: '${outputs.dialogue}',
          characterVoices: '${context.characterVoices}',  // Use cloned voices
        }
      }
    ],

    contextMutation: {
      append: {
        'context.scenes': '${outputs.scene}',
        'context.storyboardFrames': '${outputs.storyboardFrames}',
      },
      increment: {
        'context.currentScene': 1,
        'context.wordCount': '${outputs.scene.wordCount}',
      }
    }
  },

  parameters: [
    { id: 'format', name: 'Output Format', type: 'select', default: 'prose', options: [
      { label: 'Prose/Novel', value: 'prose' },
      { label: 'Screenplay', value: 'screenplay' },
      { label: 'Stage Play', value: 'stageplay' },
      { label: 'Comic Script', value: 'comicScript' },
    ]},
    { id: 'pov', name: 'Point of View', type: 'select', default: 'third-limited', options: [...] },
    { id: 'sceneType', name: 'Scene Type', type: 'select', default: 'dramatic', options: [...] },
    { id: 'length', name: 'Target Length', type: 'select', default: 'medium', options: [...] },
    { id: 'generateStoryboard', name: 'Generate Storyboard', type: 'boolean', default: true },
    { id: 'numFrames', name: 'Storyboard Frames', type: 'slider', default: 3, min: 1, max: 9 },
    { id: 'generateAudio', name: 'Generate Audio', type: 'boolean', default: false },
    { id: 'narratorVoice', name: 'Narrator Voice', type: 'select', default: 'morgan', options: [...] },
  ],
}
```

#### DialogueGenerator Node

```typescript
{
  type: 'dialogueGenerator',
  category: 'dialogue',
  label: 'Dialogue Generator',

  inputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext' },
    { id: 'characters', name: 'Characters Speaking', type: 'character', multiple: true, required: true },
    { id: 'situation', name: 'Situation/Context', type: 'text', required: true },
    { id: 'location', name: 'Location', type: 'location' },
    { id: 'precedingDialogue', name: 'Previous Dialogue', type: 'dialogue' },
    { id: 'precedingScene', name: 'Scene Context', type: 'scene' },
    { id: 'emotionalBeats', name: 'Emotional Journey', type: 'plotPoint', multiple: true },
  ],

  outputs: [
    { id: 'context', name: 'Updated Context', type: 'storyContext' },
    { id: 'dialogue', name: 'Dialogue Exchange', type: 'dialogue' },
    { id: 'subtext', name: 'Subtext Analysis', type: 'text' },
    { id: 'stageDirections', name: 'Stage Directions', type: 'text' },
    { id: 'dialogueAudio', name: 'Voiced Dialogue', type: 'audio', multiple: true },
    { id: 'lipSyncVideo', name: 'Lip Sync Video', type: 'video' },
  ],

  execution: {
    narrativeAgents: [
      {
        agentType: 'dialogue',
        endpoint: '/api/comicbook/dialogue/generate',
        payload: {
          characters: '${inputs.characters}',
          characterVoices: '${context.characterVoices}',
          situation: '${inputs.situation}',
          dialogueType: '${parameters.dialogueType}',
          subtextLevel: '${parameters.subtextLevel}',
          length: '${parameters.length}',
          format: '${parameters.format}',
        }
      }
    ],
    audioGeneration: [
      {
        condition: '${parameters.generateVoice}',
        model: 'multi-voice-tts',
        endpoint: '/api/audio/dialogue-to-speech',
        payload: {
          dialogue: '${outputs.dialogue}',
          characterVoices: '${context.characterVoices}',
        }
      }
    ],
    videoGeneration: [
      {
        condition: '${parameters.generateLipSync && context.characterPortraits}',
        model: 'kling-avatar',
        endpoint: '/api/video/lip-sync',
        payload: {
          dialogue: '${outputs.dialogue}',
          audio: '${outputs.dialogueAudio}',
          characterImages: '${context.characterPortraits}',
        }
      }
    ],
  },
}
```

### 4.4 WORLD-BUILDING NODES (Enhanced)

#### LocationCreator Node

```typescript
{
  type: 'locationCreator',
  category: 'worldBuilding',
  label: 'Location Creator',

  inputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext' },
    { id: 'concept', name: 'Location Concept', type: 'text', required: true },
    { id: 'story', name: 'Story Context', type: 'story' },
    { id: 'lore', name: 'World Lore', type: 'lore' },
    { id: 'referenceImage', name: 'Visual Reference', type: 'image' },
    { id: 'connectedLocations', name: 'Connected Locations', type: 'location', multiple: true },
  ],

  outputs: [
    { id: 'context', name: 'Updated Context', type: 'storyContext' },
    { id: 'location', name: 'Location Profile', type: 'location' },
    { id: 'description', name: 'Rich Description', type: 'narration' },
    { id: 'secrets', name: 'Hidden Elements', type: 'plotPoint', multiple: true },
    { id: 'visualPrompt', name: 'Location Visual Prompt', type: 'imagePrompt' },
    { id: 'locationImage', name: 'Location Image', type: 'image' },
    { id: 'panorama', name: '360 Panorama', type: 'image' },
    { id: 'ambientAudio', name: 'Ambient Sound', type: 'audio' },
  ],

  execution: {
    narrativeAgents: [
      {
        agentType: 'world',
        endpoint: '/api/agent/world/create-location',
        payload: {
          concept: '${inputs.concept}',
          storyContext: '${context.story}',
          lore: '${inputs.lore}',
          locationType: '${parameters.locationType}',
          mood: '${parameters.mood}',
          sensoryDetail: '${parameters.sensoryDetail}',
          includeHistory: '${parameters.includeHistory}',
        }
      }
    ],
    enhancementAgents: [
      {
        agentType: 'enhance',
        endpoint: '/api/agent/prompt/enhance',
        payload: {
          basePrompt: '${internal.visualConcept}',
          style: '${context.style}',
          purpose: 'environment',
        }
      }
    ],
    imageGeneration: [
      {
        condition: '${parameters.generateImage}',
        model: 'flux-2-pro',
        promptSource: 'outputs.visualPrompt',
        referenceImages: ['${inputs.referenceImage}'],
        outputTarget: 'locationImage',
      },
      {
        condition: '${parameters.generatePanorama}',
        model: 'flux-2-pro',
        promptSource: 'internal.panoramaPrompt',
        aspectRatio: '16:9',
        outputTarget: 'panorama',
      }
    ],
    audioGeneration: [
      {
        condition: '${parameters.generateAmbient}',
        model: 'audio-gen',
        endpoint: '/api/audio/ambient',
        payload: {
          locationDescription: '${outputs.description}',
          mood: '${parameters.mood}',
        }
      }
    ],
    contextMutation: {
      set: {
        'context.locations[${outputs.location.id}]': '${outputs.location}',
        'context.locationVisuals[${outputs.location.id}]': '${outputs.locationImage}',
      }
    }
  },
}
```

### 4.5 BRANCHING NARRATIVE NODES (Enhanced)

#### ChoicePoint Node

```typescript
{
  type: 'choicePoint',
  category: 'branching',
  label: 'Choice Point',

  inputs: [
    { id: 'context', name: 'Story Context', type: 'storyContext', required: true },
    { id: 'precedingScene', name: 'Preceding Scene', type: 'scene', required: true },
    { id: 'characters', name: 'Characters', type: 'character', multiple: true },
    { id: 'constraints', name: 'Choice Constraints', type: 'text' },
  ],

  outputs: [
    // Multiple context branches - one per choice
    { id: 'contextA', name: 'Context (Path A)', type: 'storyContext' },
    { id: 'contextB', name: 'Context (Path B)', type: 'storyContext' },
    { id: 'contextC', name: 'Context (Path C)', type: 'storyContext' },

    { id: 'choice', name: 'Choice Point', type: 'choice' },
    { id: 'optionA', name: 'Option A Scene', type: 'scene' },
    { id: 'optionB', name: 'Option B Scene', type: 'scene' },
    { id: 'optionC', name: 'Option C Scene', type: 'scene' },

    // Visual outputs for interactive media
    { id: 'choiceUI', name: 'Choice UI Layout', type: 'text' },
    { id: 'optionImages', name: 'Option Preview Images', type: 'image', multiple: true },
  ],

  execution: {
    narrativeAgents: [
      {
        agentType: 'story',
        endpoint: '/api/agent/story/generate-choice',
        payload: {
          context: '${inputs.context}',
          precedingScene: '${inputs.precedingScene}',
          characters: '${inputs.characters}',
          numChoices: '${parameters.numChoices}',
          choiceType: '${parameters.choiceType}',
          consequenceWeight: '${parameters.consequenceWeight}',
          convergence: '${parameters.convergence}',
        }
      },
      // Generate each branch path
      {
        agentType: 'story',
        endpoint: '/api/agent/story/generate-branch',
        payload: {
          choice: '${internal.choice}',
          selectedOption: 'A',
          context: '${inputs.context}',
        },
        outputMapping: { 'response.scene' -> 'outputs.optionA' }
      },
      {
        agentType: 'story',
        endpoint: '/api/agent/story/generate-branch',
        payload: {
          choice: '${internal.choice}',
          selectedOption: 'B',
          context: '${inputs.context}',
        },
        outputMapping: { 'response.scene' -> 'outputs.optionB' }
      },
      // Option C only if numChoices >= 3
      {
        condition: '${parameters.numChoices >= 3}',
        agentType: 'story',
        endpoint: '/api/agent/story/generate-branch',
        payload: {
          choice: '${internal.choice}',
          selectedOption: 'C',
          context: '${inputs.context}',
        },
        outputMapping: { 'response.scene' -> 'outputs.optionC' }
      }
    ],
    imageGeneration: [
      {
        condition: '${parameters.generatePreviews}',
        model: 'flux-2-pro',
        promptSource: 'internal.optionPrompts',
        batchSize: '${parameters.numChoices}',
        outputTarget: 'optionImages',
      }
    ],
    // Create branched contexts
    contextMutation: {
      fork: {
        'outputs.contextA': {
          base: '${inputs.context}',
          append: {
            'choiceHistory': { choice: '${outputs.choice}', selected: 'A' },
            'scenes': '${outputs.optionA}',
          },
          set: { 'activeBranch': 'A' }
        },
        'outputs.contextB': {
          base: '${inputs.context}',
          append: {
            'choiceHistory': { choice: '${outputs.choice}', selected: 'B' },
            'scenes': '${outputs.optionB}',
          },
          set: { 'activeBranch': 'B' }
        },
        'outputs.contextC': {
          base: '${inputs.context}',
          append: {
            'choiceHistory': { choice: '${outputs.choice}', selected: 'C' },
            'scenes': '${outputs.optionC}',
          },
          set: { 'activeBranch': 'C' }
        }
      }
    }
  },
}
```

---

## Part 5: Workflow Patterns

### 5.1 Novel Generation Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           NOVEL GENERATION WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                       │
│  │ StoryGenesis │─────▶│StoryStructure│─────▶│  Treatment   │──▶ [Marketing Copy]   │
│  │              │      │              │      │  Generator   │                        │
│  │  idea ─────▶ story  │ story ─────▶ outline│              │                        │
│  │  genre       │      │ framework    │      │ format: novel│                        │
│  │  tone        │      │              │      │              │                        │
│  └──────────────┘      └──────────────┘      └──────────────┘                        │
│         │                     │                                                       │
│         │ characters[]        │ beats[]                                               │
│         ▼                     ▼                                                       │
│  ┌──────────────┐      ┌──────────────┐                                              │
│  │  Character   │      │  PlotPoint   │◀─────── [For each beat in outline]           │
│  │   Creator    │      │              │                                              │
│  │              │      │ beat type    │                                              │
│  │ archetype    │      │ stakes       │                                              │
│  │ depth: deep  │      │ emotion      │                                              │
│  └──────────────┘      └──────────────┘                                              │
│         │                     │                                                       │
│         │ character           │ plotPoint                                             │
│         ▼                     ▼                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                        │
│  │  Character   │      │    Scene     │─────▶│    Scene     │──▶ [Repeat for all    │
│  │    Voice     │─────▶│  Generator   │      │  Generator   │     scenes in chapter] │
│  │              │voice │              │      │              │                        │
│  │ speech pat.  │      │ format: prose│      │ precedingScene│                       │
│  │ quirks       │      │ pov: 3rd     │      │              │                        │
│  └──────────────┘      └──────────────┘      └──────────────┘                        │
│                               │                     │                                 │
│                               │ scene               │ scene                           │
│                               ▼                     ▼                                 │
│                        ┌──────────────┐      ┌──────────────┐                        │
│                        │   Chapter    │─────▶│  Manuscript  │                        │
│                        │  Assembler   │      │   Export     │                        │
│                        │              │      │              │                        │
│                        │ format: novel│      │ format: docx │                        │
│                        │              │      │ format: epub │                        │
│                        └──────────────┘      └──────────────┘                        │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

OUTPUTS:
- Complete novel manuscript (50,000+ words)
- Character sheets with portraits
- Location artwork
- Marketing synopsis & logline
- eBook-ready format
```

### 5.2 Visual Storyboard Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         VISUAL STORYBOARD WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────┐      ┌──────────────┐                                              │
│  │ StoryGenesis │─────▶│StoryStructure│                                              │
│  │              │      │              │                                              │
│  │ visualStyle: │      │ framework:   │                                              │
│  │  cinematic   │      │  saveTheCat  │                                              │
│  └──────────────┘      └──────────────┘                                              │
│         │                     │                                                       │
│         │                     │ beats[]                                               │
│         ▼                     ▼                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                        │
│  │  Character   │      │    Scene     │      │   Location   │                        │
│  │   Creator    │      │  Generator   │◀────▶│   Creator    │                        │
│  │              │      │              │      │              │                        │
│  │ genPortrait: │      │ genStoryboard│      │ genImage:    │                        │
│  │   true       │      │   true       │      │   true       │                        │
│  │ genSheet:    │      │ numFrames: 6 │      │ genPanorama: │                        │
│  │   true       │      │              │      │   true       │                        │
│  └──────────────┘      └──────────────┘      └──────────────┘                        │
│         │                     │                     │                                 │
│         │ portrait            │ frames[]            │ locationImage                   │
│         │ characterSheet      │                     │ panorama                        │
│         ▼                     ▼                     ▼                                 │
│  ┌─────────────────────────────────────────────────────────────────┐                │
│  │                    Storyboard Assembler                          │                │
│  │                                                                  │                │
│  │  Combines: character sheets + scene frames + location visuals   │                │
│  │  Adds: shot descriptions, camera angles, transitions            │                │
│  │  Outputs: PDF storyboard, animatic video, pitch deck            │                │
│  │                                                                  │                │
│  └─────────────────────────────────────────────────────────────────┘                │
│                               │                                                       │
│         ┌─────────────────────┼─────────────────────┐                                │
│         ▼                     ▼                     ▼                                │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                        │
│  │   PDF        │      │   Animatic   │      │   Pitch      │                        │
│  │  Storyboard  │      │    Video     │      │    Deck      │                        │
│  │              │      │              │      │              │                        │
│  │ 100+ frames  │      │ 3-5 min      │      │ 20 slides    │                        │
│  │ shot notes   │      │ with music   │      │ with visuals │                        │
│  └──────────────┘      └──────────────┘      └──────────────┘                        │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

OUTPUTS:
- High-res storyboard PDF (100+ frames)
- Animated pre-visualization video
- Pitch deck with concept art
- Character model sheets
- Location concept art
- Shot-by-shot breakdown
```

### 5.3 Interactive Game Narrative Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       INTERACTIVE GAME NARRATIVE WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                        │
│  │ StoryGenesis │─────▶│  WorldLore   │─────▶│   Timeline   │                        │
│  │              │      │              │      │              │                        │
│  │ genre: rpg   │      │ loreType:    │      │ scope:       │                        │
│  │              │      │ comprehensive│      │ world        │                        │
│  └──────────────┘      └──────────────┘      └──────────────┘                        │
│         │                     │                     │                                 │
│         ▼                     ▼                     ▼                                 │
│  ┌──────────────────────────────────────────────────────────────┐                   │
│  │                    World Context Bundle                        │                   │
│  │  (Accumulated lore, factions, history, magic system, etc.)    │                   │
│  └──────────────────────────────────────────────────────────────┘                   │
│                               │                                                       │
│         ┌─────────────────────┼─────────────────────┐                                │
│         ▼                     ▼                     ▼                                │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                        │
│  │  Character   │      │   Location   │ x N  │    Scene     │                        │
│  │   Creator    │ x N  │   Creator    │      │  Generator   │                        │
│  │              │      │              │      │              │                        │
│  │ depth: deep  │      │ mood: varied │      │ Opening      │                        │
│  │ genPortrait  │      │ genImage     │      │ Scene        │                        │
│  │ genSheet     │      │ secrets      │      │              │                        │
│  └──────────────┘      └──────────────┘      └──────────────┘                        │
│         │                     │                     │                                 │
│         └─────────────────────┼─────────────────────┘                                │
│                               ▼                                                       │
│                        ┌──────────────┐                                              │
│                        │ ChoicePoint  │◀──── Player decision points                  │
│                        │              │                                              │
│                        │ numChoices: 3│                                              │
│                        │ convergence: │                                              │
│                        │   delayed    │                                              │
│                        └──────────────┘                                              │
│                               │                                                       │
│              ┌────────────────┼────────────────┐                                     │
│              ▼                ▼                ▼                                     │
│       ┌──────────┐     ┌──────────┐     ┌──────────┐                                │
│       │ Path A   │     │ Path B   │     │ Path C   │                                │
│       │ Scene    │     │ Scene    │     │ Scene    │                                │
│       └──────────┘     └──────────┘     └──────────┘                                │
│              │                │                │                                     │
│              ▼                ▼                ▼                                     │
│       ┌────────────────────────────────────────────────┐                            │
│       │            Consequence Tracker                  │                            │
│       │  Tracks: relationship changes, world state,    │                            │
│       │          character deaths, faction standings   │                            │
│       └────────────────────────────────────────────────┘                            │
│                               │                                                       │
│                               ▼                                                       │
│              [Continue branching for 3-5 major decision points]                       │
│                               │                                                       │
│                               ▼                                                       │
│                        ┌──────────────┐                                              │
│                        │  PathMerge   │──▶ Common climax with variations            │
│                        │              │                                              │
│                        │ Endings:     │                                              │
│                        │  5-7 unique  │                                              │
│                        └──────────────┘                                              │
│                               │                                                       │
│                               ▼                                                       │
│                        ┌──────────────┐                                              │
│                        │ Game Script  │                                              │
│                        │   Export     │                                              │
│                        │              │                                              │
│                        │ Formats:     │                                              │
│                        │ - Ink        │                                              │
│                        │ - Twine      │                                              │
│                        │ - Yarn       │                                              │
│                        │ - JSON       │                                              │
│                        └──────────────┘                                              │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

OUTPUTS:
- Complete branching narrative script
- 5-7 unique endings
- Character portraits + sheets
- Location concept art
- World bible / lore document
- Exportable game script (Ink/Twine/Yarn/JSON)
- Dialogue trees with voice annotations
```

### 5.4 Screenplay + Animatic Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                       SCREENPLAY + ANIMATIC WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                        │
│  │ StoryGenesis │─────▶│StoryStructure│─────▶│  Treatment   │                        │
│  │              │      │              │      │              │                        │
│  │ genre: film  │      │ framework:   │      │ format: film │                        │
│  │ length:script│      │  saveTheCat  │      │              │                        │
│  └──────────────┘      └──────────────┘      └──────────────┘                        │
│         │                     │                                                       │
│         ▼                     ▼                                                       │
│  ┌──────────────┐      ┌──────────────┐                                              │
│  │  Character   │      │    Scene     │◀──── For each beat                           │
│  │   Creator    │─────▶│  Generator   │                                              │
│  │              │voice │              │                                              │
│  │ + Voice      │      │ format:      │                                              │
│  │              │      │  screenplay  │                                              │
│  └──────────────┘      └──────────────┘                                              │
│                               │                                                       │
│                               │ scene (screenplay format)                             │
│                               ▼                                                       │
│                        ┌──────────────┐                                              │
│                        │  Screenplay  │                                              │
│                        │  Formatter   │                                              │
│                        │              │                                              │
│                        │ Industry std │                                              │
│                        │ slug lines   │                                              │
│                        │ parenthetical│                                              │
│                        └──────────────┘                                              │
│                               │                                                       │
│              ┌────────────────┼────────────────┐                                     │
│              ▼                │                ▼                                     │
│       ┌──────────────┐       │         ┌──────────────┐                             │
│       │   Fountain   │       │         │    Final     │                             │
│       │   Export     │       │         │    Draft     │                             │
│       │              │       │         │    Export    │                             │
│       │ .fountain    │       │         │ .fdx         │                             │
│       └──────────────┘       │         └──────────────┘                             │
│                              ▼                                                       │
│                       ┌──────────────┐                                              │
│                       │   Scene      │                                              │
│                       │  Visualizer  │                                              │
│                       │              │                                              │
│                       │ numFrames: 6 │                                              │
│                       │ style:       │                                              │
│                       │  cinematic   │                                              │
│                       └──────────────┘                                              │
│                              │                                                       │
│                              │ storyboardFrames[]                                    │
│                              ▼                                                       │
│                       ┌──────────────┐                                              │
│                       │   Animatic   │                                              │
│                       │   Creator    │                                              │
│                       │              │                                              │
│                       │ + music      │                                              │
│                       │ + dialogue   │                                              │
│                       │ + timing     │                                              │
│                       └──────────────┘                                              │
│                              │                                                       │
│              ┌───────────────┼───────────────┐                                      │
│              ▼               ▼               ▼                                      │
│       ┌──────────┐    ┌──────────┐    ┌──────────┐                                 │
│       │  MP4     │    │ Storyboard│    │  Pitch   │                                 │
│       │ Animatic │    │   PDF     │    │   Deck   │                                 │
│       │          │    │           │    │          │                                 │
│       │ 10-15min │    │ 300+frames│    │ 30 slides│                                 │
│       └──────────┘    └──────────┘    └──────────┘                                 │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

OUTPUTS:
- Industry-standard screenplay (90-120 pages)
- Fountain & Final Draft exports
- Full storyboard (300+ frames)
- Animated pre-visualization (10-15 min)
- Pitch deck with key frames
- Character & location concept art
```

---

## Part 6: API Integration

### 6.1 Backend Endpoints Used

```typescript
// Story Agent APIs
'/api/agent/story/start'              // Create story from prompt
'/api/agent/story/structure'          // Apply story framework
'/api/agent/story/generate-scene'     // Write complete scene
'/api/agent/story/generate-choice'    // Create branching point
'/api/agent/story/generate-branch'    // Write branch path

// Character APIs
'/api/character-library/generate'     // Create character profile
'/api/agent/character/voice-profile'  // Define character voice
'/api/agent/character/relationship'   // Map character relationships

// World-Building APIs
'/api/agent/world/create-location'    // Create location
'/api/agent/world/generate-lore'      // Generate world lore
'/api/agent/world/timeline'           // Create timeline

// Dialogue APIs
'/api/comicbook/dialogue/generate'    // Generate dialogue
'/api/agent/dialogue/apply-voices'    // Apply character voices

// Enhancement APIs
'/api/agent/prompt/enhance'           // Enhance prompts
'/api/agent/prompt/scene-to-visuals'  // Scene → visual prompts
'/api/agent/prompt/batch-enhance'     // Batch prompt enhancement

// Image Generation APIs
'/api/image/flux-2-pro'               // FLUX 2 Pro generation
'/api/image/flux-kontext'             // FLUX Kontext (reference-based)

// Video Generation APIs
'/api/video/kling-avatar'             // Talking head / lip sync
'/api/video/kling-i2v'                // Image to video

// Audio APIs
'/api/audio/voice-clone'              // Clone voice from sample
'/api/audio/tts'                      // Text to speech
'/api/audio/narrate'                  // Multi-voice narration
'/api/audio/ambient'                  // Generate ambient sounds
```

### 6.2 Node → API Mapping

| Node Type | LLM Agent API | Enhancement API | Image API | Video API | Audio API |
|-----------|---------------|-----------------|-----------|-----------|-----------|
| StoryGenesis | story/start | prompt/enhance | flux-2-pro (cover) | - | - |
| StoryStructure | story/structure | prompt/batch-enhance | - | - | - |
| CharacterCreator | character-library/generate | - | flux-2-pro (portrait) | - | - |
| CharacterVoice | character/voice-profile | - | - | - | voice-clone |
| LocationCreator | world/create-location | prompt/enhance | flux-2-pro | - | ambient |
| SceneGenerator | story/generate-scene | scene-to-visuals | flux-kontext (storyboard) | - | narrate |
| DialogueGenerator | dialogue/generate | dialogue/apply-voices | - | kling-avatar | tts |
| PlotTwist | story/generate-twist | - | - | - | - |
| ChoicePoint | story/generate-choice, story/generate-branch | - | flux-2-pro (previews) | - | - |

---

## Part 7: Implementation Checklist

### Phase 1: Context Architecture (Week 1)
- [ ] Implement StoryContext interface and state management
- [ ] Add context input/output ports to all storytelling nodes
- [ ] Create context propagation logic in workflow execution
- [ ] Implement context accumulation (append, set, fork)

### Phase 2: Dual Execution Pipeline (Week 2)
- [ ] Create NodeExecution interface
- [ ] Implement sequential agent call pipeline
- [ ] Add conditional execution support
- [ ] Implement image generation integration
- [ ] Add audio/video generation hooks

### Phase 3: Enhanced Node I/O (Week 3)
- [ ] Update all 21 storytelling nodes with enhanced I/O
- [ ] Add visual output ports (imagePrompt, storyboard, etc.)
- [ ] Add audio output ports (voiceClone, narration, etc.)
- [ ] Implement port compatibility validation

### Phase 4: Workflow Templates (Week 4)
- [ ] Create Novel Generation workflow template
- [ ] Create Storyboard workflow template
- [ ] Create Interactive Game workflow template
- [ ] Create Screenplay workflow template

### Phase 5: Export & Integration (Week 5)
- [ ] Implement manuscript export (docx, epub)
- [ ] Implement screenplay export (fountain, fdx)
- [ ] Implement game script export (ink, twine, yarn)
- [ ] Implement storyboard export (pdf, animatic video)

---

## References

- [Sudowrite](https://sudowrite.com/) - AI writing partner
- [Final Draft](https://www.finaldraft.com/) - Screenwriting software
- [Ink](https://www.inklestudios.com/ink/) - Interactive fiction scripting
- [Twine](https://twinery.org/) - Interactive story tool
- [StoryDiffusion](https://arxiv.org/abs/2407.07672) - AI storyboarding research
