# Storytelling System - API Requirements

**Version**: 1.0
**Date**: December 16, 2025
**Status**: Specification for Backend Implementation
**Related**: `docs/STORYTELLING_NODE_STRATEGY.md`

---

## Executive Summary

This document specifies the backend API endpoints required to power the **Creative Canvas Studio Storytelling System**. The system enables AI-powered narrative generation, character development, world-building, and visual storyboarding through 26+ specialized nodes.

### Key Integration Points

1. **LLM Agent APIs** - Story generation, character creation, dialogue
2. **Image Generation APIs** - Character portraits, storyboards, locations
3. **Video Generation APIs** - Scene animations, lip-sync
4. **Audio APIs** - Voice synthesis, narration, ambient sounds
5. **Export APIs** - Manuscript, screenplay, game script formats

---

## 1. Story Generation APIs

### 1.1 Story Genesis

**POST** `/api/agent/story/start`

Create a new story concept from a user prompt.

**Request:**
```typescript
interface StoryStartRequest {
  starterPrompt: string;           // "A detective discovers..."
  themes?: string[];               // ["redemption", "identity"]
  genre: StoryGenre;               // "thriller", "romance", etc.
  subGenre?: string;               // "noir", "cozy mystery"
  tone: StoryTone;                 // "dark", "lighthearted", etc.
  mood?: string;                   // "suspenseful", "whimsical"
  pointOfView: POV;                // "first", "third-limited", etc.
  targetLength: TargetLength;      // "short-story", "novel", etc.
  targetAudience: Audience;        // "ya", "adult", "general"
  complexity?: number;             // 0.0-1.0 narrative complexity
  generateCoverArt?: boolean;      // Generate cover image
  visualStyle?: VisualStyle;       // "cinematic", "anime", etc.
}

type StoryGenre =
  | 'fantasy' | 'scifi' | 'thriller' | 'mystery' | 'romance'
  | 'horror' | 'drama' | 'comedy' | 'adventure' | 'literary'
  | 'historical' | 'contemporary' | 'dystopian' | 'magical-realism';

type StoryTone =
  | 'dark' | 'lighthearted' | 'serious' | 'whimsical'
  | 'gritty' | 'hopeful' | 'melancholic' | 'suspenseful';

type POV =
  | 'first' | 'second' | 'third-limited' | 'third-omniscient' | 'multiple';

type TargetLength =
  | 'flash' | 'short-story' | 'novella' | 'novel' | 'series' | 'screenplay';

type Audience =
  | 'children' | 'middle-grade' | 'ya' | 'new-adult' | 'adult' | 'general';

type VisualStyle =
  | 'photorealistic' | 'cinematic' | 'anime' | 'comic' | 'watercolor'
  | 'oil-painting' | 'digital-art' | 'noir' | 'vintage';
```

**Response:**
```typescript
interface StoryStartResponse {
  story: StoryData;
  characters: CharacterSeed[];     // Initial character suggestions
  outline: BasicOutline;           // High-level beat sheet
  logline: string;                 // One-sentence summary
  tagline: string;                 // Marketing hook
  visualStyle: StyleProfile;       // Extracted visual style
  coverPrompt?: string;            // Prompt for cover art
  coverImageUrl?: string;          // If generateCoverArt=true
}

interface StoryData {
  id: string;
  title: string;
  premise: string;
  themes: string[];
  genre: StoryGenre;
  subGenre?: string;
  tone: StoryTone;
  setting: SettingSummary;
  centralConflict: string;
  stakes: string;
  hook: string;
  targetWordCount: number;
  estimatedChapters: number;
}

interface CharacterSeed {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'love-interest';
  archetype: string;
  briefDescription: string;
  motivation: string;
}

interface BasicOutline {
  acts: ActSummary[];
  majorBeats: string[];
}
```

---

### 1.2 Story Structure

**POST** `/api/agent/story/structure`

Apply a story structure framework to generate detailed outline.

**Request:**
```typescript
interface StoryStructureRequest {
  storyId: string;
  story: StoryData;
  framework: StoryFramework;
  characters?: CharacterProfile[];
  detailLevel: 'high-level' | 'detailed' | 'comprehensive';
  includeSubplots?: boolean;
  subplotCount?: number;          // 1-3
}

type StoryFramework =
  | 'three-act'           // Classic 3-act structure
  | 'save-the-cat'        // Blake Snyder's 15 beats
  | 'heros-journey'       // Joseph Campbell's 12 stages
  | 'story-circle'        // Dan Harmon's 8 steps
  | 'five-act'            // Shakespeare structure
  | 'seven-point'         // Dan Wells structure
  | 'freytags-pyramid'    // Classic dramatic structure
  | 'kishotenketsu';      // 4-act Japanese structure
```

**Response:**
```typescript
interface StoryStructureResponse {
  outline: OutlineData;
  beats: PlotPointData[];
  acts: ActData[];
  actVisualPrompts: string[];     // Image prompts for key act moments
  subplots?: SubplotData[];
}

interface OutlineData {
  id: string;
  framework: StoryFramework;
  totalBeats: number;
  estimatedWordCount: number;
  acts: ActData[];
}

interface ActData {
  actNumber: number;
  title: string;
  summary: string;
  beats: PlotPointData[];
  startPercentage: number;        // 0-100 position in story
  endPercentage: number;
}

interface PlotPointData {
  id: string;
  beatType: BeatType;
  title: string;
  description: string;
  emotionalTone: string;
  stakes: string;
  characters: string[];           // Character IDs involved
  location?: string;              // Location ID
  targetWordCount: number;
  position: number;               // 0-100 story position
}

type BeatType =
  | 'opening' | 'inciting-incident' | 'plot-point-1' | 'midpoint'
  | 'plot-point-2' | 'climax' | 'resolution' | 'denouement'
  | 'pinch-point' | 'dark-moment' | 'catalyst' | 'debate'
  | 'break-into-2' | 'b-story' | 'fun-and-games' | 'all-is-lost'
  | 'dark-night' | 'break-into-3' | 'finale';
```

---

### 1.3 Scene Generation

**POST** `/api/agent/story/generate-scene`

Generate a complete scene with dialogue and description.

**Request:**
```typescript
interface SceneGenerateRequest {
  storyId: string;
  storyContext: StoryData;
  outline?: OutlineData;
  concept: string;                 // Scene concept/description
  characters: CharacterProfile[];
  characterVoices?: Map<string, CharacterVoiceProfile>;
  location?: LocationData;
  precedingScene?: SceneData;
  plotPoint?: PlotPointData;
  format: SceneFormat;
  pov: POV;
  sceneType: SceneType;
  length: SceneLength;
  generateStoryboard?: boolean;
  storyboardFrames?: number;       // 1-9
  generateAudio?: boolean;
  narratorVoice?: string;
}

type SceneFormat =
  | 'prose' | 'screenplay' | 'stageplay' | 'comic-script' | 'treatment';

type SceneType =
  | 'dramatic' | 'action' | 'dialogue' | 'romantic' | 'comedic'
  | 'suspense' | 'exposition' | 'montage' | 'flashback' | 'dream';

type SceneLength =
  | 'brief' | 'short' | 'medium' | 'long' | 'extended';
```

**Response:**
```typescript
interface SceneGenerateResponse {
  scene: SceneData;
  dialogue: DialogueData[];
  narration: string;               // Prose narration text
  storyboardPrompts?: string[];    // If generateStoryboard=true
  storyboardUrls?: string[];       // Generated storyboard images
  keyFrameUrl?: string;            // Primary scene image
  audioUrl?: string;               // If generateAudio=true
  wordCount: number;
}

interface SceneData {
  id: string;
  title: string;
  slugline?: string;               // Screenplay format: INT/EXT
  description: string;
  content: string;                 // Full scene text
  characters: string[];
  location: string;
  timeOfDay: string;
  mood: string;
  beats: string[];
  wordCount: number;
}

interface DialogueData {
  characterId: string;
  characterName: string;
  line: string;
  parenthetical?: string;          // (angrily), (whispering)
  subtext?: string;
  emotion: string;
}
```

---

### 1.4 Treatment Generator

**POST** `/api/agent/story/generate-treatment`

Generate professional synopsis and marketing materials.

**Request:**
```typescript
interface TreatmentRequest {
  storyId: string;
  story: StoryData;
  outline?: OutlineData;
  characters?: CharacterProfile[];
  format: TreatmentFormat;
  includeLogline?: boolean;
  includeTagline?: boolean;
  includeSynopsis?: 'short' | 'long' | 'both';
  includeCharacterBreakdowns?: boolean;
  targetIndustry?: 'film' | 'tv' | 'publishing' | 'games';
}

type TreatmentFormat =
  | 'film' | 'tv-pilot' | 'tv-series' | 'novel' | 'game' | 'general';
```

**Response:**
```typescript
interface TreatmentResponse {
  treatment: TreatmentData;
}

interface TreatmentData {
  id: string;
  format: TreatmentFormat;
  logline: string;
  tagline: string;
  shortSynopsis: string;           // 1 paragraph
  longSynopsis: string;            // 1-2 pages
  characterBreakdowns?: CharacterBreakdown[];
  thematicStatement: string;
  comparables: string[];           // "X meets Y"
  targetAudience: string;
  marketingHooks: string[];
}
```

---

### 1.5 Plot Twist Generator

**POST** `/api/agent/story/generate-twist`

Generate surprising plot twists with foreshadowing.

**Request:**
```typescript
interface PlotTwistRequest {
  storyId: string;
  storyContext: StoryData;
  characters: CharacterProfile[];
  currentPlotPoint?: PlotPointData;
  twistType: TwistType;
  impactLevel: 'minor' | 'moderate' | 'major' | 'story-changing';
  generateForeshadowing?: boolean;
  foreshadowingCount?: number;     // 1-5 hints to plant earlier
}

type TwistType =
  | 'identity-reveal' | 'betrayal' | 'hidden-connection' | 'false-protagonist'
  | 'unreliable-narrator' | 'time-twist' | 'reality-shift' | 'death-fake'
  | 'villain-reveal' | 'prophecy-subversion' | 'reversal-of-fortune';
```

**Response:**
```typescript
interface PlotTwistResponse {
  twist: PlotTwistData;
  foreshadowingHints?: ForeshadowingHint[];
  affectedCharacters: string[];
  narrativeImpact: string;
}

interface PlotTwistData {
  id: string;
  type: TwistType;
  revelation: string;
  setup: string;
  payoff: string;
  emotionalImpact: string;
  suggestedPlacement: number;      // 0-100 story position
}

interface ForeshadowingHint {
  hint: string;
  suggestedPlacement: number;
  subtlety: 'obvious' | 'moderate' | 'subtle' | 'very-subtle';
}
```

---

### 1.6 Branching Narrative

**POST** `/api/agent/story/generate-choice`

Generate choice points for interactive narratives.

**Request:**
```typescript
interface ChoicePointRequest {
  storyId: string;
  storyContext: StoryData;
  precedingScene: SceneData;
  characters: CharacterProfile[];
  numChoices: 2 | 3 | 4;
  choiceType: ChoiceType;
  consequenceWeight: 'light' | 'medium' | 'heavy';
  convergence: 'immediate' | 'delayed' | 'never';
  constraints?: string;
}

type ChoiceType =
  | 'moral-dilemma' | 'relationship' | 'tactical' | 'dialogue'
  | 'exploration' | 'combat' | 'resource' | 'trust';
```

**Response:**
```typescript
interface ChoicePointResponse {
  choice: ChoiceData;
  options: ChoiceOption[];
  optionPreviewPrompts?: string[];  // Image prompts for each option
}

interface ChoiceData {
  id: string;
  prompt: string;                   // The choice presented to reader
  context: string;
  stakes: string;
  timeLimit?: string;               // "You have seconds to decide"
}

interface ChoiceOption {
  id: string;
  label: string;                    // Short label
  description: string;              // What this choice means
  immediateConsequence: string;
  longTermConsequence: string;
  characterImpact: CharacterImpact[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface CharacterImpact {
  characterId: string;
  relationshipChange: number;       // -100 to +100
  trustChange?: number;
}
```

**POST** `/api/agent/story/generate-branch`

Generate scene content for a specific choice branch.

**Request:**
```typescript
interface BranchGenerateRequest {
  storyId: string;
  choiceId: string;
  selectedOptionId: string;
  storyContext: StoryData;
  characters: CharacterProfile[];
  format: SceneFormat;
}
```

**Response:**
```typescript
interface BranchGenerateResponse {
  scene: SceneData;
  updatedRelationships: RelationshipUpdate[];
  worldStateChanges: WorldStateChange[];
  newPlotThreads?: string[];
}
```

---

## 2. Character APIs

### 2.1 Character Generation

**POST** `/api/character-library/generate`

Create detailed character profile.

**Request:**
```typescript
interface CharacterGenerateRequest {
  storyId?: string;
  concept: string;                  // "A retired spy turned librarian"
  archetype?: CharacterArchetype;
  role?: CharacterRole;
  storyContext?: StoryData;
  depth: 'basic' | 'standard' | 'deep' | 'comprehensive';
  generatePortrait?: boolean;
  generateSheet?: boolean;          // Multi-angle reference sheet
  visualStyle?: VisualStyle;
  portraitStyle?: 'realistic' | 'digital' | 'anime' | 'comic' | 'painting';
}

type CharacterArchetype =
  | 'hero' | 'mentor' | 'herald' | 'threshold-guardian' | 'shapeshifter'
  | 'shadow' | 'trickster' | 'ally' | 'mother' | 'father' | 'child'
  | 'rebel' | 'lover' | 'creator' | 'ruler' | 'caregiver' | 'sage'
  | 'innocent' | 'explorer' | 'everyman' | 'jester' | 'magician' | 'outlaw';

type CharacterRole =
  | 'protagonist' | 'antagonist' | 'deuteragonist' | 'tritagonist'
  | 'mentor' | 'sidekick' | 'love-interest' | 'foil' | 'confidant'
  | 'henchman' | 'comic-relief' | 'narrator';
```

**Response:**
```typescript
interface CharacterGenerateResponse {
  character: CharacterProfile;
  backstory: string;
  arc: CharacterArc;
  voiceProfile: CharacterVoiceProfile;
  portraitPrompt: string;
  portraitUrl?: string;
  characterSheetUrl?: string;
}

interface CharacterProfile {
  id: string;
  name: string;
  fullName?: string;
  aliases?: string[];
  age: number;
  gender: string;
  role: CharacterRole;
  archetype: CharacterArchetype;

  // Physical
  appearance: AppearanceData;

  // Psychological
  personality: PersonalityData;

  // Background
  backstory: BackstoryData;

  // Story function
  motivation: string;
  goal: string;
  fear: string;
  flaw: string;
  strength: string;
  arc: string;

  // Relationships
  relationships?: RelationshipData[];
}

interface AppearanceData {
  height: string;
  build: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  distinguishingFeatures: string[];
  style: string;
  mannerisms: string[];
}

interface PersonalityData {
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  quirks: string[];
  values: string[];
  beliefs: string[];
  mbtiType?: string;
  enneagramType?: string;
}

interface CharacterArc {
  startingState: string;
  trigger: string;
  progression: string[];
  climaxChange: string;
  endingState: string;
  lessonLearned: string;
}
```

---

### 2.2 Character Voice Profile

**POST** `/api/agent/character/voice-profile`

Define unique speech patterns and voice characteristics.

**Request:**
```typescript
interface VoiceProfileRequest {
  characterId: string;
  character: CharacterProfile;
  speechPattern?: SpeechPattern;
  generateQuirks?: boolean;
  generateCatchphrase?: boolean;
  sampleDialogueCount?: number;    // 1-5
  voiceAudioSample?: string;       // URL for voice cloning
  cloneVoice?: boolean;
}

type SpeechPattern =
  | 'formal' | 'casual' | 'slang' | 'eloquent' | 'terse'
  | 'verbose' | 'poetic' | 'technical' | 'childlike' | 'archaic';
```

**Response:**
```typescript
interface VoiceProfileResponse {
  voiceProfile: CharacterVoiceProfile;
  sampleDialogue: SampleDialogue[];
  catchphrases: string[];
  voiceCloneId?: string;           // For TTS integration
}

interface CharacterVoiceProfile {
  id: string;
  characterId: string;
  speechPattern: SpeechPattern;
  vocabulary: VocabularyProfile;
  verbalQuirks: string[];
  fillerWords: string[];
  favoriteExpressions: string[];
  avoidedWords: string[];
  sentenceStructure: string;       // "Short, punchy" or "Long, meandering"
  tone: string;
  pace: 'slow' | 'measured' | 'quick' | 'variable';
  accent?: string;
  dialect?: string;
}

interface VocabularyProfile {
  level: 'simple' | 'moderate' | 'sophisticated' | 'technical';
  jargon?: string[];
  slang?: string[];
  formalTerms?: string[];
}

interface SampleDialogue {
  situation: string;
  line: string;
  emotion: string;
}
```

---

### 2.3 Character Relationships

**POST** `/api/agent/character/relationship`

Map relationships between characters.

**Request:**
```typescript
interface RelationshipRequest {
  storyId: string;
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  relationshipType?: RelationshipType;
  generateHistory?: boolean;
  conflictPotential?: 'low' | 'medium' | 'high';
}

type RelationshipType =
  | 'romantic' | 'rivals' | 'friends' | 'enemies' | 'family'
  | 'mentor-student' | 'colleagues' | 'strangers' | 'frenemies'
  | 'unrequited' | 'complicated';
```

**Response:**
```typescript
interface RelationshipResponse {
  relationship: RelationshipData;
  sharedHistory: SharedHistory;
  conflictPoints: ConflictPoint[];
  dynamicArc: string;
}

interface RelationshipData {
  id: string;
  characterAId: string;
  characterBId: string;
  type: RelationshipType;
  status: 'positive' | 'negative' | 'neutral' | 'complicated';
  intensity: number;               // 0-100
  trustLevel: number;              // 0-100
  dynamicDescription: string;
  powerBalance: 'equal' | 'a-dominant' | 'b-dominant' | 'shifting';
}

interface SharedHistory {
  howTheyMet: string;
  significantMoments: string[];
  secrets: string[];
  unfinishedBusiness: string[];
}

interface ConflictPoint {
  issue: string;
  severity: 'minor' | 'moderate' | 'major';
  resolution?: string;
}
```

---

## 3. World-Building APIs

### 3.1 Location Creation

**POST** `/api/agent/world/create-location`

Create detailed location/setting.

**Request:**
```typescript
interface LocationCreateRequest {
  storyId?: string;
  concept: string;                  // "An abandoned Victorian mansion"
  storyContext?: StoryData;
  lore?: WorldLoreData;
  locationType: LocationType;
  mood: string;
  sensoryDetail: 'minimal' | 'moderate' | 'rich' | 'immersive';
  includeHistory?: boolean;
  includeSecrets?: boolean;
  generateImage?: boolean;
  generatePanorama?: boolean;
  generateAmbient?: boolean;
}

type LocationType =
  | 'urban' | 'rural' | 'wilderness' | 'interior' | 'underwater'
  | 'space' | 'fantasy' | 'historical' | 'futuristic' | 'surreal';
```

**Response:**
```typescript
interface LocationCreateResponse {
  location: LocationData;
  description: string;
  secrets: PlotPointData[];
  visualPrompt: string;
  imageUrl?: string;
  panoramaUrl?: string;
  ambientAudioUrl?: string;
}

interface LocationData {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  atmosphere: string;
  sensoryDetails: SensoryDetails;
  history?: string;
  secrets?: string[];
  pointsOfInterest: PointOfInterest[];
  connectedLocations?: string[];
  timeOfDay?: string;
  weather?: string;
  season?: string;
}

interface SensoryDetails {
  sights: string[];
  sounds: string[];
  smells: string[];
  textures: string[];
  temperature: string;
}

interface PointOfInterest {
  name: string;
  description: string;
  significance: string;
}
```

---

### 3.2 World Lore Generation

**POST** `/api/agent/world/generate-lore`

Generate mythology, history, and world rules.

**Request:**
```typescript
interface WorldLoreRequest {
  storyId: string;
  storyContext: StoryData;
  loreType: LoreType;
  scope: 'focused' | 'moderate' | 'comprehensive';
  includeTimeline?: boolean;
  timelineDepth?: 'recent' | 'historical' | 'ancient' | 'mythic';
}

type LoreType =
  | 'history' | 'mythology' | 'religion' | 'politics' | 'economy'
  | 'magic-system' | 'technology' | 'culture' | 'geography' | 'ecology';
```

**Response:**
```typescript
interface WorldLoreResponse {
  lore: WorldLoreData;
  timeline?: TimelineData;
  factions?: FactionData[];
  conflicts?: HistoricalConflict[];
}

interface WorldLoreData {
  id: string;
  type: LoreType;
  title: string;
  overview: string;
  details: LoreDetail[];
  rules?: WorldRule[];
  exceptions?: string[];
  connections: string[];           // Links to characters/locations
}

interface LoreDetail {
  topic: string;
  content: string;
  significance: string;
}

interface WorldRule {
  rule: string;
  explanation: string;
  limitations: string[];
  consequences: string[];
}
```

---

### 3.3 Timeline Generation

**POST** `/api/agent/world/timeline`

Create chronological event timeline.

**Request:**
```typescript
interface TimelineRequest {
  storyId: string;
  storyContext: StoryData;
  scope: TimelineScope;
  includeCharacterEvents?: boolean;
  characterIds?: string[];
  includeWorldEvents?: boolean;
  eventDensity: 'sparse' | 'moderate' | 'dense';
}

type TimelineScope =
  | 'story' | 'character-lifetime' | 'generation' | 'century'
  | 'era' | 'world-history';
```

**Response:**
```typescript
interface TimelineResponse {
  timeline: TimelineData;
}

interface TimelineData {
  id: string;
  scope: TimelineScope;
  startDate: string;
  endDate: string;
  events: TimelineEvent[];
  eras?: TimelineEra[];
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'world' | 'character' | 'plot';
  significance: 'minor' | 'moderate' | 'major' | 'pivotal';
  participants?: string[];
  consequences?: string[];
}

interface TimelineEra {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  definingEvents: string[];
}
```

---

## 4. Dialogue APIs

### 4.1 Dialogue Generation

**POST** `/api/comicbook/dialogue/generate`

Generate authentic character dialogue.

**Request:**
```typescript
interface DialogueGenerateRequest {
  storyId: string;
  characters: CharacterProfile[];
  characterVoices?: Map<string, CharacterVoiceProfile>;
  situation: string;
  dialogueType: DialogueType;
  subtextLevel: 'none' | 'light' | 'moderate' | 'heavy';
  length: 'brief' | 'short' | 'medium' | 'long';
  format: DialogueFormat;
  emotionalBeats?: string[];
  includeStageDirections?: boolean;
}

type DialogueType =
  | 'conversation' | 'argument' | 'interrogation' | 'negotiation'
  | 'flirtation' | 'confession' | 'confrontation' | 'exposition'
  | 'banter' | 'monologue' | 'internal';

type DialogueFormat =
  | 'prose' | 'screenplay' | 'comic' | 'game';
```

**Response:**
```typescript
interface DialogueGenerateResponse {
  dialogue: DialogueExchange;
  subtext: SubtextAnalysis;
  stageDirections?: StageDirection[];
}

interface DialogueExchange {
  id: string;
  situation: string;
  lines: DialogueLine[];
  emotionalArc: string;
  tension: number;                  // 0-100
}

interface DialogueLine {
  characterId: string;
  characterName: string;
  line: string;
  parenthetical?: string;
  subtext?: string;
  emotion: string;
  beat?: string;
}

interface SubtextAnalysis {
  underlyingTensions: string[];
  hiddenAgendas: HiddenAgenda[];
  powerDynamic: string;
}

interface HiddenAgenda {
  characterId: string;
  agenda: string;
  revealed: boolean;
}
```

---

### 4.2 Apply Character Voices

**POST** `/api/agent/dialogue/apply-voices`

Refine dialogue to match character voice profiles.

**Request:**
```typescript
interface ApplyVoicesRequest {
  dialogue: DialogueExchange;
  characters: CharacterProfile[];
  characterVoices: Map<string, CharacterVoiceProfile>;
}
```

**Response:**
```typescript
interface ApplyVoicesResponse {
  enhancedDialogue: DialogueExchange;
  voiceNotes: VoiceNote[];
}

interface VoiceNote {
  characterId: string;
  originalLine: string;
  enhancedLine: string;
  changesApplied: string[];
}
```

---

### 4.3 Monologue Generation

**POST** `/api/agent/dialogue/generate-monologue`

Generate powerful speeches and monologues.

**Request:**
```typescript
interface MonologueRequest {
  storyId: string;
  character: CharacterProfile;
  characterVoice?: CharacterVoiceProfile;
  monologueType: MonologueType;
  situation: string;
  emotionalIntensity: number;       // 0-100
  length: 'brief' | 'medium' | 'extended';
  includeStageDirections?: boolean;
}

type MonologueType =
  | 'dramatic' | 'villain' | 'inspirational' | 'confessional'
  | 'philosophical' | 'comedic' | 'tragic' | 'romantic'
  | 'internal' | 'death-speech' | 'rally-cry';
```

**Response:**
```typescript
interface MonologueResponse {
  monologue: MonologueData;
}

interface MonologueData {
  id: string;
  characterId: string;
  type: MonologueType;
  content: string;
  emotionalBeats: string[];
  peakMoment: string;
  wordCount: number;
  estimatedDuration: string;        // "2-3 minutes"
}
```

---

## 5. Visualization APIs

### 5.1 Scene to Storyboard

**POST** `/api/agent/prompt/scene-to-visuals`

Convert scene text to visual prompts for storyboard generation.

**Request:**
```typescript
interface SceneToVisualsRequest {
  scene: SceneData;
  characters: CharacterProfile[];
  characterPortraits?: Map<string, string>;  // characterId -> imageUrl
  location?: LocationData;
  locationVisual?: string;          // Location image URL
  numFrames: number;                // 1-9
  style: VisualStyle;
  aspectRatio: '16:9' | '4:3' | '2.39:1' | '1:1' | '9:16';
  includeComposition?: boolean;     // Camera angles, framing
}
```

**Response:**
```typescript
interface SceneToVisualsResponse {
  frames: StoryboardFrame[];
}

interface StoryboardFrame {
  frameNumber: number;
  description: string;
  prompt: string;                   // Image generation prompt
  cameraAngle: CameraAngle;
  shotType: ShotType;
  characters: string[];
  action: string;
  dialogue?: string;
  mood: string;
  lighting: string;
}

type CameraAngle =
  | 'eye-level' | 'high-angle' | 'low-angle' | 'birds-eye'
  | 'worms-eye' | 'dutch' | 'over-shoulder' | 'pov';

type ShotType =
  | 'extreme-wide' | 'wide' | 'full' | 'medium-full' | 'medium'
  | 'medium-close' | 'close-up' | 'extreme-close' | 'two-shot';
```

---

### 5.2 Character Sheet Generation

**POST** `/api/agent/character/generate-sheet`

Generate multi-angle character reference sheet.

**Request:**
```typescript
interface CharacterSheetRequest {
  character: CharacterProfile;
  portraitUrl?: string;             // Existing portrait for consistency
  style: VisualStyle;
  includeViews: CharacterView[];
  includeExpressions?: boolean;
  expressionCount?: number;         // 1-6
  includeOutfits?: boolean;
  outfitCount?: number;             // 1-4
}

type CharacterView =
  | 'front' | 'three-quarter' | 'side' | 'back' | 'full-body' | 'bust';
```

**Response:**
```typescript
interface CharacterSheetResponse {
  sheetUrl: string;
  individualViews: ViewImage[];
  expressions?: ExpressionImage[];
  outfits?: OutfitImage[];
}

interface ViewImage {
  view: CharacterView;
  url: string;
  prompt: string;
}

interface ExpressionImage {
  expression: string;               // "happy", "angry", etc.
  url: string;
}

interface OutfitImage {
  description: string;
  url: string;
}
```

---

### 5.3 Storyboard Assembly

**POST** `/api/agent/story/assemble-storyboard`

Compile storyboard frames into presentable format.

**Request:**
```typescript
interface StoryboardAssemblyRequest {
  storyId: string;
  frames: StoryboardFrame[];
  frameUrls: string[];
  format: StoryboardFormat;
  includeDialogue?: boolean;
  includeNotes?: boolean;
  includeTimings?: boolean;
}

type StoryboardFormat =
  | 'pdf' | 'png-sequence' | 'video-animatic' | 'pitch-deck';
```

**Response:**
```typescript
interface StoryboardAssemblyResponse {
  outputUrl: string;
  format: StoryboardFormat;
  pageCount?: number;
  duration?: string;                // For animatic
}
```

---

## 6. Export APIs

### 6.1 Manuscript Export

**POST** `/api/export/manuscript`

Export story as formatted manuscript.

**Request:**
```typescript
interface ManuscriptExportRequest {
  storyId: string;
  scenes: SceneData[];
  format: ManuscriptFormat;
  includeChapterBreaks?: boolean;
  includeTitlePage?: boolean;
  authorName?: string;
  contactInfo?: string;
}

type ManuscriptFormat =
  | 'docx' | 'pdf' | 'epub' | 'mobi' | 'rtf' | 'txt' | 'markdown';
```

**Response:**
```typescript
interface ManuscriptExportResponse {
  downloadUrl: string;
  format: ManuscriptFormat;
  wordCount: number;
  pageCount: number;
}
```

---

### 6.2 Screenplay Export

**POST** `/api/export/screenplay`

Export as industry-standard screenplay.

**Request:**
```typescript
interface ScreenplayExportRequest {
  storyId: string;
  scenes: SceneData[];
  format: ScreenplayFormat;
  includeTitlePage?: boolean;
  authorName?: string;
  basedOn?: string;                 // "Based on the novel by..."
}

type ScreenplayFormat =
  | 'fountain' | 'fdx' | 'pdf' | 'celtx';
```

**Response:**
```typescript
interface ScreenplayExportResponse {
  downloadUrl: string;
  format: ScreenplayFormat;
  pageCount: number;
  estimatedRuntime: string;         // "95-105 minutes"
}
```

---

### 6.3 Game Script Export

**POST** `/api/export/game-script`

Export branching narrative for game engines.

**Request:**
```typescript
interface GameScriptExportRequest {
  storyId: string;
  scenes: SceneData[];
  choices: ChoiceData[];
  branches: BranchData[];
  format: GameScriptFormat;
  includeVariables?: boolean;
  includeCharacterStates?: boolean;
}

type GameScriptFormat =
  | 'ink' | 'twine' | 'yarn' | 'json' | 'dialogue-tree';
```

**Response:**
```typescript
interface GameScriptExportResponse {
  downloadUrl: string;
  format: GameScriptFormat;
  nodeCount: number;
  branchCount: number;
  endingCount: number;
}
```

---

## 7. Audio APIs

### 7.1 Voice Clone

**POST** `/api/audio/voice-clone`

Clone voice from audio sample.

**Request:**
```typescript
interface VoiceCloneRequest {
  audioSampleUrl: string;
  characterId: string;
  voiceName: string;
  quality: 'instant' | 'professional';
}
```

**Response:**
```typescript
interface VoiceCloneResponse {
  voiceId: string;
  voiceName: string;
  quality: string;
  sampleUrl: string;                // Test audio
}
```

---

### 7.2 Text to Speech

**POST** `/api/audio/tts`

Generate speech from text.

**Request:**
```typescript
interface TTSRequest {
  text: string;
  voiceId: string;                  // From voice clone or preset
  emotion?: string;
  speed?: number;                   // 0.5-2.0
  pitch?: number;                   // -20 to +20
}
```

**Response:**
```typescript
interface TTSResponse {
  audioUrl: string;
  duration: number;                 // seconds
}
```

---

### 7.3 Multi-Voice Narration

**POST** `/api/audio/narrate`

Generate narrated audio with multiple character voices.

**Request:**
```typescript
interface NarrationRequest {
  content: string;                  // Full text with character tags
  narratorVoiceId: string;
  characterVoices: Map<string, string>;  // characterId -> voiceId
  includeDialoguePauses?: boolean;
  backgroundMusicMood?: string;
}
```

**Response:**
```typescript
interface NarrationResponse {
  audioUrl: string;
  duration: number;
  chapters?: AudioChapter[];
}

interface AudioChapter {
  title: string;
  startTime: number;
  endTime: number;
}
```

---

### 7.4 Ambient Sound Generation

**POST** `/api/audio/ambient`

Generate ambient soundscapes for locations.

**Request:**
```typescript
interface AmbientRequest {
  locationDescription: string;
  mood: string;
  duration: number;                 // seconds
  loop?: boolean;
  elements?: string[];              // ["rain", "thunder", "wind"]
}
```

**Response:**
```typescript
interface AmbientResponse {
  audioUrl: string;
  duration: number;
  loopable: boolean;
}
```

---

## 8. Enhancement APIs

### 8.1 Prompt Enhancement

**POST** `/api/agent/prompt/enhance`

Enhance prompts for better generation results.

**Request:**
```typescript
interface PromptEnhanceRequest {
  basePrompt: string;
  style?: VisualStyle;
  purpose: PromptPurpose;
  enhancementLevel: 'light' | 'moderate' | 'comprehensive';
}

type PromptPurpose =
  | 'character-portrait' | 'location' | 'scene' | 'storyboard'
  | 'book-cover' | 'concept-art' | 'mood-board';
```

**Response:**
```typescript
interface PromptEnhanceResponse {
  enhancedPrompt: string;
  addedElements: string[];
  negativePrompt?: string;
}
```

---

### 8.2 Story Enhancement

**POST** `/api/agent/story/enhance`

Polish and improve story content.

**Request:**
```typescript
interface StoryEnhanceRequest {
  content: string;
  enhancementFocus: EnhancementFocus[];
  style?: string;
  targetTone?: string;
  preserveVoice?: boolean;
}

type EnhancementFocus =
  | 'prose' | 'pacing' | 'dialogue' | 'description'
  | 'emotion' | 'atmosphere' | 'tension' | 'clarity';
```

**Response:**
```typescript
interface StoryEnhanceResponse {
  enhancedContent: string;
  changes: EnhancementChange[];
  qualityScore: QualityScore;
}

interface EnhancementChange {
  original: string;
  enhanced: string;
  reason: string;
  type: EnhancementFocus;
}

interface QualityScore {
  overall: number;                  // 0-100
  prose: number;
  pacing: number;
  dialogue: number;
  description: number;
}
```

---

## 9. Connection Actions (Story-Specific)

### 9.1 Character Meeting

**POST** `/api/story/connection/character-meet`

When two character nodes are connected, generate their meeting.

**Request:**
```typescript
interface CharacterMeetRequest {
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  storyContext?: StoryData;
  meetingType: 'first-meeting' | 'reunion' | 'confrontation';
}
```

**Response:**
```typescript
interface CharacterMeetResponse {
  scene: SceneData;
  relationship: RelationshipData;
  futureConflicts: string[];
}
```

---

### 9.2 Plot Weave

**POST** `/api/story/connection/plot-weave`

Connect two plot points to create continuity.

**Request:**
```typescript
interface PlotWeaveRequest {
  plotPointA: PlotPointData;
  plotPointB: PlotPointData;
  storyContext: StoryData;
  bridgeType: 'cause-effect' | 'parallel' | 'contrast' | 'callback';
}
```

**Response:**
```typescript
interface PlotWeaveResponse {
  bridgeScene: SceneData;
  connections: string[];
  foreshadowing: string[];
}
```

---

### 9.3 Location Portal

**POST** `/api/story/connection/location-portal`

Connect locations with travel/transition scene.

**Request:**
```typescript
interface LocationPortalRequest {
  locationA: LocationData;
  locationB: LocationData;
  characters: CharacterProfile[];
  transitionType: 'travel' | 'teleport' | 'flashback' | 'dream';
}
```

**Response:**
```typescript
interface LocationPortalResponse {
  transitionScene: SceneData;
  travelDescription: string;
}
```

---

## 10. Webhook Events

For async job completion notifications:

```typescript
// Webhook payload structure
interface StoryWebhookPayload {
  eventType: StoryEventType;
  storyId: string;
  timestamp: string;
  data: any;
}

type StoryEventType =
  | 'story.created'
  | 'scene.generated'
  | 'character.created'
  | 'storyboard.completed'
  | 'export.ready'
  | 'audio.generated'
  | 'error';
```

---

## 11. Rate Limits & Pricing

| Endpoint Category | Rate Limit | Estimated Cost |
|-------------------|------------|----------------|
| Story Generation | 10/min | $0.05/request |
| Character Generation | 20/min | $0.03/request |
| Scene Generation | 10/min | $0.08/request |
| Dialogue Generation | 30/min | $0.02/request |
| Image Generation | 5/min | $0.15-0.40/image |
| Storyboard (9 frames) | 2/min | $1.50/set |
| Voice Clone | 5/hour | $5.00/voice |
| TTS | 100/min | $0.01/1000 chars |
| Export | 20/min | $0.10/export |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 16, 2025 | Claude | Initial comprehensive API specification |
