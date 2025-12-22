/**
 * Story Generation Service
 * Client-side API service for the Storytelling System
 *
 * Implements all endpoints defined in docs/STORYTELLING_API_REQUIREMENTS.md
 */

import api from './api';

// ===== Type Definitions =====

// Story Types
export type StoryGenre =
  | 'fantasy' | 'scifi' | 'thriller' | 'mystery' | 'romance'
  | 'horror' | 'drama' | 'comedy' | 'adventure' | 'literary'
  | 'historical' | 'contemporary' | 'dystopian' | 'magical-realism';

export type StoryTone =
  | 'dark' | 'lighthearted' | 'serious' | 'whimsical'
  | 'gritty' | 'hopeful' | 'melancholic' | 'suspenseful';

export type POV = 'first' | 'second' | 'third-limited' | 'third-omniscient' | 'multiple';

export type TargetLength = 'flash' | 'short-story' | 'novella' | 'novel' | 'series' | 'screenplay';

export type Audience = 'children' | 'middle-grade' | 'ya' | 'new-adult' | 'adult' | 'general';

export type VisualStyle =
  | 'photorealistic' | 'cinematic' | 'anime' | 'comic' | 'watercolor'
  | 'oil-painting' | 'digital-art' | 'noir' | 'vintage';

export type StoryFramework =
  | 'three-act' | 'save-the-cat' | 'heros-journey' | 'story-circle'
  | 'five-act' | 'seven-point' | 'freytags-pyramid' | 'kishotenketsu';

export type SceneFormat = 'prose' | 'screenplay' | 'stageplay' | 'comic-script' | 'treatment';

export type SceneType =
  | 'dramatic' | 'action' | 'dialogue' | 'romantic' | 'comedic'
  | 'suspense' | 'exposition' | 'montage' | 'flashback' | 'dream';

export type SceneLength = 'brief' | 'short' | 'medium' | 'long' | 'extended';

export type TwistType =
  | 'identity-reveal' | 'betrayal' | 'hidden-connection' | 'false-protagonist'
  | 'unreliable-narrator' | 'time-twist' | 'reality-shift' | 'death-fake'
  | 'villain-reveal' | 'prophecy-subversion' | 'reversal-of-fortune';

export type ChoiceType =
  | 'moral-dilemma' | 'relationship' | 'tactical' | 'dialogue'
  | 'exploration' | 'combat' | 'resource' | 'trust';

export type CharacterArchetype =
  | 'hero' | 'mentor' | 'herald' | 'threshold-guardian' | 'shapeshifter'
  | 'shadow' | 'trickster' | 'ally' | 'mother' | 'father' | 'child'
  | 'rebel' | 'lover' | 'creator' | 'ruler' | 'caregiver' | 'sage'
  | 'innocent' | 'explorer' | 'everyman' | 'jester' | 'magician' | 'outlaw';

export type CharacterRole =
  | 'protagonist' | 'antagonist' | 'deuteragonist' | 'tritagonist'
  | 'mentor' | 'sidekick' | 'love-interest' | 'foil' | 'confidant'
  | 'henchman' | 'comic-relief' | 'narrator';

export type SpeechPattern =
  | 'formal' | 'casual' | 'slang' | 'eloquent' | 'terse'
  | 'verbose' | 'poetic' | 'technical' | 'childlike' | 'archaic';

export type LocationType =
  | 'urban' | 'rural' | 'wilderness' | 'interior' | 'underwater'
  | 'space' | 'fantasy' | 'historical' | 'futuristic' | 'surreal';

export type LoreType =
  | 'history' | 'mythology' | 'religion' | 'politics' | 'economy'
  | 'magic-system' | 'technology' | 'culture' | 'geography' | 'ecology';

export type TimelineScope =
  | 'story' | 'character-lifetime' | 'generation' | 'century'
  | 'era' | 'world-history';

export type DialogueType =
  | 'conversation' | 'argument' | 'interrogation' | 'negotiation'
  | 'flirtation' | 'confession' | 'confrontation' | 'exposition'
  | 'banter' | 'monologue' | 'internal';

export type MonologueType =
  | 'dramatic' | 'villain' | 'inspirational' | 'confessional'
  | 'philosophical' | 'comedic' | 'tragic' | 'romantic'
  | 'internal' | 'death-speech' | 'rally-cry';

export type TreatmentFormat = 'film' | 'tv-pilot' | 'tv-series' | 'novel' | 'game' | 'general';

export type BeatType =
  | 'opening' | 'inciting-incident' | 'plot-point-1' | 'midpoint'
  | 'plot-point-2' | 'climax' | 'resolution' | 'denouement'
  | 'pinch-point' | 'dark-moment' | 'catalyst' | 'debate'
  | 'break-into-2' | 'b-story' | 'fun-and-games' | 'all-is-lost'
  | 'dark-night' | 'break-into-3' | 'finale';

export type RelationshipType =
  | 'romantic' | 'rivals' | 'friends' | 'enemies' | 'family'
  | 'mentor-student' | 'colleagues' | 'strangers' | 'frenemies'
  | 'unrequited' | 'complicated';

// ===== Data Interfaces =====

export interface StoryData {
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

export interface SettingSummary {
  world: string;
  era: string;
  location: string;
}

export interface CharacterSeed {
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'mentor' | 'love-interest';
  archetype: string;
  briefDescription: string;
  motivation: string;
}

export interface BasicOutline {
  acts: ActSummary[];
  majorBeats: string[];
}

export interface ActSummary {
  actNumber: number;
  title: string;
  summary: string;
}

export interface StyleProfile {
  visual: VisualStyle;
  mood: string;
  colorPalette: string[];
}

export interface CharacterProfile {
  id: string;
  name: string;
  fullName?: string;
  aliases?: string[];
  age: number;
  gender: string;
  role: CharacterRole;
  archetype: CharacterArchetype;
  appearance: AppearanceData;
  personality: PersonalityData;
  backstory: BackstoryData;
  motivation: string;
  goal: string;
  fear: string;
  flaw: string;
  strength: string;
  arc: string;
  relationships?: RelationshipData[];
}

export interface AppearanceData {
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

export interface PersonalityData {
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  quirks: string[];
  values: string[];
  beliefs: string[];
  mbtiType?: string;
  enneagramType?: string;
}

export interface BackstoryData {
  origin: string;
  childhoodEvents: string[];
  formativeExperiences: string[];
  secrets: string[];
}

export interface CharacterArc {
  startingState: string;
  trigger: string;
  progression: string[];
  climaxChange: string;
  endingState: string;
  lessonLearned: string;
}

export interface CharacterVoiceProfile {
  id: string;
  characterId: string;
  speechPattern: SpeechPattern;
  vocabulary: VocabularyProfile;
  verbalQuirks: string[];
  fillerWords: string[];
  favoriteExpressions: string[];
  avoidedWords: string[];
  sentenceStructure: string;
  tone: string;
  pace: 'slow' | 'measured' | 'quick' | 'variable';
  accent?: string;
  dialect?: string;
}

export interface VocabularyProfile {
  level: 'simple' | 'moderate' | 'sophisticated' | 'technical';
  jargon?: string[];
  slang?: string[];
  formalTerms?: string[];
}

export interface RelationshipData {
  id: string;
  characterAId: string;
  characterBId: string;
  type: RelationshipType;
  status: 'positive' | 'negative' | 'neutral' | 'complicated';
  intensity: number;
  trustLevel: number;
  dynamicDescription: string;
  powerBalance: 'equal' | 'a-dominant' | 'b-dominant' | 'shifting';
}

export interface SharedHistory {
  howTheyMet: string;
  significantMoments: string[];
  secrets: string[];
  unfinishedBusiness: string[];
}

export interface ConflictPoint {
  issue: string;
  severity: 'minor' | 'moderate' | 'major';
  resolution?: string;
}

export interface OutlineData {
  id: string;
  framework: StoryFramework;
  totalBeats: number;
  estimatedWordCount: number;
  acts: ActData[];
}

export interface ActData {
  actNumber: number;
  title: string;
  summary: string;
  beats: PlotPointData[];
  startPercentage: number;
  endPercentage: number;
}

export interface PlotPointData {
  id: string;
  beatType: BeatType;
  title: string;
  description: string;
  emotionalTone: string;
  stakes: string;
  characters: string[];
  location?: string;
  targetWordCount: number;
  position: number;
}

export interface SubplotData {
  id: string;
  title: string;
  type: 'romantic' | 'mystery' | 'character-arc' | 'thematic';
  beats: PlotPointData[];
  resolution: string;
}

export interface SceneData {
  id: string;
  title: string;
  slugline?: string;
  description: string;
  content: string;
  characters: string[];
  location: string;
  timeOfDay: string;
  mood: string;
  beats: string[];
  wordCount: number;
}

export interface DialogueData {
  characterId: string;
  characterName: string;
  line: string;
  parenthetical?: string;
  subtext?: string;
  emotion: string;
}

export interface LocationData {
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

export interface SensoryDetails {
  sights: string[];
  sounds: string[];
  smells: string[];
  textures: string[];
  temperature: string;
}

export interface PointOfInterest {
  name: string;
  description: string;
  significance: string;
}

export interface WorldLoreData {
  id: string;
  type: LoreType;
  title: string;
  overview: string;
  details: LoreDetail[];
  rules?: WorldRule[];
  exceptions?: string[];
  connections: string[];
}

export interface LoreDetail {
  topic: string;
  content: string;
  significance: string;
}

export interface WorldRule {
  rule: string;
  explanation: string;
  limitations: string[];
  consequences: string[];
}

export interface TimelineData {
  id: string;
  scope: TimelineScope;
  startDate: string;
  endDate: string;
  events: TimelineEvent[];
  eras?: TimelineEra[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'world' | 'character' | 'plot';
  significance: 'minor' | 'moderate' | 'major' | 'pivotal';
  participants?: string[];
  consequences?: string[];
}

export interface TimelineEra {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  definingEvents: string[];
}

export interface PlotTwistData {
  id: string;
  type: TwistType;
  revelation: string;
  setup: string;
  payoff: string;
  emotionalImpact: string;
  suggestedPlacement: number;
}

export interface ForeshadowingHint {
  hint: string;
  suggestedPlacement: number;
  subtlety: 'obvious' | 'moderate' | 'subtle' | 'very-subtle';
}

export interface ChoiceData {
  id: string;
  prompt: string;
  context: string;
  stakes: string;
  timeLimit?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  description: string;
  immediateConsequence: string;
  longTermConsequence: string;
  characterImpact: CharacterImpact[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CharacterImpact {
  characterId: string;
  relationshipChange: number;
  trustChange?: number;
}

export interface TreatmentData {
  id: string;
  format: TreatmentFormat;
  logline: string;
  tagline: string;
  shortSynopsis: string;
  longSynopsis: string;
  characterBreakdowns?: CharacterBreakdown[];
  thematicStatement: string;
  comparables: string[];
  targetAudience: string;
  marketingHooks: string[];
}

export interface CharacterBreakdown {
  characterId: string;
  name: string;
  role: string;
  description: string;
}

export interface DialogueExchange {
  id: string;
  situation: string;
  lines: DialogueLine[];
  emotionalArc: string;
  tension: number;
}

export interface DialogueLine {
  characterId: string;
  characterName: string;
  line: string;
  parenthetical?: string;
  subtext?: string;
  emotion: string;
  beat?: string;
}

export interface MonologueData {
  id: string;
  characterId: string;
  type: MonologueType;
  content: string;
  emotionalBeats: string[];
  peakMoment: string;
  wordCount: number;
  estimatedDuration: string;
}

export interface StoryboardFrame {
  frameNumber: number;
  description: string;
  prompt: string;
  cameraAngle: CameraAngle;
  shotType: ShotType;
  characters: string[];
  action: string;
  dialogue?: string;
  mood: string;
  lighting: string;
}

export type CameraAngle =
  | 'eye-level' | 'high-angle' | 'low-angle' | 'birds-eye'
  | 'worms-eye' | 'dutch' | 'over-shoulder' | 'pov';

export type ShotType =
  | 'extreme-wide' | 'wide' | 'full' | 'medium-full' | 'medium'
  | 'medium-close' | 'close-up' | 'extreme-close' | 'two-shot';

// ===== LLM Configuration (Swagger v3 aligned) =====

export interface RagContext {
  enabled?: boolean;
  sources?: string[];
  maxChunks?: number;
}

export interface LlmConfigBase {
  model?: string;           // LLM model ID (e.g., "gemini-2.5-flash")
  temperature?: number;     // 0.0-1.0, default 0.7
  maxTokens?: number;       // Max output tokens
  topP?: number;            // Nucleus sampling
  topK?: number;            // Top-K sampling
  providerOptions?: Record<string, unknown>;
  rag?: RagContext;
}

// ===== Request Interfaces (Swagger v3 aligned) =====

export interface StoryStartRequest extends LlmConfigBase {
  starterPrompt: string;
  themes?: string[];
  genre: StoryGenre;
  subGenre?: string;
  tone: StoryTone;
  mood?: string;
  pointOfView: POV;
  targetLength: TargetLength;
  targetAudience: Audience;
  complexity?: number;
  generateCoverArt?: boolean;
  visualStyle?: VisualStyle;
}

export interface StoryStructureRequest {
  storyId: string;
  story: StoryData;
  framework: StoryFramework;
  characters?: CharacterProfile[];
  detailLevel: 'high-level' | 'detailed' | 'comprehensive';
  includeSubplots?: boolean;
  subplotCount?: number;
}

export interface SceneGenerateRequest {
  storyId: string;
  storyContext: StoryData;
  outline?: OutlineData;
  concept: string;
  characters: CharacterProfile[];
  characterVoices?: Record<string, CharacterVoiceProfile>;
  location?: LocationData;
  precedingScene?: SceneData;
  plotPoint?: PlotPointData;
  format: SceneFormat;
  pov: POV;
  sceneType: SceneType;
  length: SceneLength;
  generateStoryboard?: boolean;
  storyboardFrames?: number;
  generateAudio?: boolean;
  narratorVoice?: string;
}

export interface TreatmentRequest {
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

export interface PlotTwistRequest {
  storyId: string;
  storyContext: StoryData;
  characters: CharacterProfile[];
  currentPlotPoint?: PlotPointData;
  twistType: TwistType;
  impactLevel: 'minor' | 'moderate' | 'major' | 'story-changing';
  generateForeshadowing?: boolean;
  foreshadowingCount?: number;
}

export interface ChoicePointRequest {
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

export interface BranchGenerateRequest {
  storyId: string;
  choiceId: string;
  selectedOptionId: string;
  storyContext: StoryData;
  characters: CharacterProfile[];
  format: SceneFormat;
}

export interface CharacterGenerateRequest {
  storyId?: string;
  concept: string;
  archetype?: CharacterArchetype;
  role?: CharacterRole;
  storyContext?: StoryData;
  depth: 'basic' | 'standard' | 'deep' | 'comprehensive';
  generatePortrait?: boolean;
  generateSheet?: boolean;
  visualStyle?: VisualStyle;
  portraitStyle?: 'realistic' | 'digital' | 'anime' | 'comic' | 'painting';
}

export interface VoiceProfileRequest {
  characterId: string;
  character: CharacterProfile;
  speechPattern?: SpeechPattern;
  generateQuirks?: boolean;
  generateCatchphrase?: boolean;
  sampleDialogueCount?: number;
  voiceAudioSample?: string;
  cloneVoice?: boolean;
}

export interface RelationshipRequest {
  storyId: string;
  characterA: CharacterProfile;
  characterB: CharacterProfile;
  relationshipType?: RelationshipType;
  generateHistory?: boolean;
  conflictPotential?: 'low' | 'medium' | 'high';
}

// LocationCreateRequest - Swagger v3 aligned
// Note: API expects 'locationDescription' and 'type', but we keep frontend-friendly names
// and map them in the service method
export interface LocationCreateRequest extends LlmConfigBase {
  storyId?: string;
  concept: string;                // Maps to 'locationDescription' in API
  storyContext?: StoryData;
  lore?: WorldLoreData;
  locationType: LocationType;     // Maps to 'type' in API
  mood: string;                   // Maps to 'atmosphere' in API
  sensoryDetail: 'minimal' | 'moderate' | 'rich' | 'immersive';  // Maps to 'detailLevel'
  includeHistory?: boolean;
  includeSecrets?: boolean;
  generateImage?: boolean;
  generatePanorama?: boolean;
  generateAmbient?: boolean;
}

export interface WorldLoreRequest {
  storyId: string;
  storyContext: StoryData;
  loreType: LoreType;
  scope: 'focused' | 'moderate' | 'comprehensive';
  includeTimeline?: boolean;
  timelineDepth?: 'recent' | 'historical' | 'ancient' | 'mythic';
}

export interface TimelineRequest {
  storyId: string;
  storyContext: StoryData;
  scope: TimelineScope;
  includeCharacterEvents?: boolean;
  characterIds?: string[];
  includeWorldEvents?: boolean;
  eventDensity: 'sparse' | 'moderate' | 'dense';
}

// DialogueGenerateRequest - Swagger v3 aligned
// Note: API expects 'sceneContext' and 'type', mapped in service method
export interface DialogueGenerateRequest extends LlmConfigBase {
  storyId: string;
  characters: CharacterProfile[];       // API expects CharacterVoiceProfile[]
  characterVoices?: Record<string, CharacterVoiceProfile>;
  situation: string;                    // Maps to 'sceneContext' in API
  dialogueType: DialogueType;           // Maps to 'type' in API (PascalCase)
  subtextLevel: 'none' | 'light' | 'moderate' | 'heavy';
  length: 'brief' | 'short' | 'medium' | 'long';
  format: 'prose' | 'screenplay' | 'comic' | 'game';
  emotionalBeats?: string[];
  includeStageDirections?: boolean;
}

export interface MonologueRequest {
  storyId: string;
  character: CharacterProfile;
  characterVoice?: CharacterVoiceProfile;
  monologueType: MonologueType;
  situation: string;
  emotionalIntensity: number;
  length: 'brief' | 'medium' | 'extended';
  includeStageDirections?: boolean;
}

export interface SceneToVisualsRequest {
  scene: SceneData;
  characters: CharacterProfile[];
  characterPortraits?: Record<string, string>;
  location?: LocationData;
  locationVisual?: string;
  numFrames: number;
  style: VisualStyle;
  aspectRatio: '16:9' | '4:3' | '2.39:1' | '1:1' | '9:16';
  includeComposition?: boolean;
}

export interface CharacterSheetRequest {
  character: CharacterProfile;
  portraitUrl?: string;
  style: VisualStyle;
  includeViews: CharacterView[];
  includeExpressions?: boolean;
  expressionCount?: number;
  includeOutfits?: boolean;
  outfitCount?: number;
}

export type CharacterView = 'front' | 'three-quarter' | 'side' | 'back' | 'full-body' | 'bust';

export interface StoryEnhanceRequest {
  content: string;
  enhancementFocus: EnhancementFocus[];
  style?: string;
  targetTone?: string;
  preserveVoice?: boolean;
}

export type EnhancementFocus =
  | 'prose' | 'pacing' | 'dialogue' | 'description'
  | 'emotion' | 'atmosphere' | 'tension' | 'clarity';

// ===== Response Interfaces (Swagger v3 aligned) =====

// Base response fields from Swagger v3
export interface ApiResponseBase {
  success: boolean;
  errors?: string[];
  sessionId?: string;
}

export interface StoryStartResponse extends ApiResponseBase {
  story: StoryData;
  characters: CharacterSeed[];
  outline: BasicOutline;
  logline: string;
  tagline: string;
  visualStyle: StyleProfile;
  coverPrompt?: string;
  coverImageUrl?: string;
}

export interface StoryStructureResponse {
  outline: OutlineData;
  beats: PlotPointData[];
  acts: ActData[];
  actVisualPrompts: string[];
  subplots?: SubplotData[];
}

export interface SceneGenerateResponse {
  scene: SceneData;
  dialogue: DialogueData[];
  narration: string;
  storyboardPrompts?: string[];
  storyboardUrls?: string[];
  keyFrameUrl?: string;
  audioUrl?: string;
  wordCount: number;
}

export interface TreatmentResponse {
  treatment: TreatmentData;
}

export interface PlotTwistResponse {
  twist: PlotTwistData;
  foreshadowingHints?: ForeshadowingHint[];
  affectedCharacters: string[];
  narrativeImpact: string;
}

export interface ChoicePointResponse {
  choice: ChoiceData;
  options: ChoiceOption[];
  optionPreviewPrompts?: string[];
}

export interface BranchGenerateResponse {
  scene: SceneData;
  updatedRelationships: RelationshipUpdate[];
  worldStateChanges: WorldStateChange[];
  newPlotThreads?: string[];
}

export interface RelationshipUpdate {
  relationshipId: string;
  characterAId: string;
  characterBId: string;
  change: number;
}

export interface WorldStateChange {
  key: string;
  value: unknown;
  description: string;
}

export interface CharacterGenerateResponse {
  character: CharacterProfile;
  backstory: string;
  arc: CharacterArc;
  voiceProfile: CharacterVoiceProfile;
  portraitPrompt: string;
  portraitUrl?: string;
  characterSheetUrl?: string;
}

export interface VoiceProfileResponse {
  voiceProfile: CharacterVoiceProfile;
  sampleDialogue: SampleDialogue[];
  catchphrases: string[];
  voiceCloneId?: string;
}

export interface SampleDialogue {
  situation: string;
  line: string;
  emotion: string;
}

export interface RelationshipResponse {
  relationship: RelationshipData;
  sharedHistory: SharedHistory;
  conflictPoints: ConflictPoint[];
  dynamicArc: string;
}

export interface LocationCreateResponse extends ApiResponseBase {
  location: LocationData;
  description: string;
  secrets: PlotPointData[];
  visualPrompt: string;
  imageUrl?: string;
  panoramaUrl?: string;
  ambientAudioUrl?: string;
}

export interface WorldLoreResponse {
  lore: WorldLoreData;
  timeline?: TimelineData;
  factions?: FactionData[];
  conflicts?: HistoricalConflict[];
}

export interface FactionData {
  id: string;
  name: string;
  description: string;
  goals: string[];
  members: string[];
}

export interface HistoricalConflict {
  id: string;
  name: string;
  description: string;
  participants: string[];
  outcome: string;
}

export interface TimelineResponse {
  timeline: TimelineData;
}

export interface DialogueGenerateResponse extends ApiResponseBase {
  dialogue: DialogueExchange[] | DialogueExchange;  // Swagger returns array
  sceneDescription?: string;                        // From Swagger
  subtext?: SubtextAnalysis;
  stageDirections?: StageDirection[];
}

export interface SubtextAnalysis {
  underlyingTensions: string[];
  hiddenAgendas: HiddenAgenda[];
  powerDynamic: string;
}

export interface HiddenAgenda {
  characterId: string;
  agenda: string;
  revealed: boolean;
}

export interface StageDirection {
  position: number;
  direction: string;
}

export interface MonologueResponse {
  monologue: MonologueData;
}

export interface SceneToVisualsResponse {
  frames: StoryboardFrame[];
}

export interface CharacterSheetResponse {
  sheetUrl: string;
  individualViews: ViewImage[];
  expressions?: ExpressionImage[];
  outfits?: OutfitImage[];
}

export interface ViewImage {
  view: CharacterView;
  url: string;
  prompt: string;
}

export interface ExpressionImage {
  expression: string;
  url: string;
}

export interface OutfitImage {
  description: string;
  url: string;
}

export interface StoryEnhanceResponse {
  enhancedContent: string;
  changes: EnhancementChange[];
  qualityScore: QualityScore;
}

export interface EnhancementChange {
  original: string;
  enhanced: string;
  reason: string;
  type: EnhancementFocus;
}

export interface QualityScore {
  overall: number;
  prose: number;
  pacing: number;
  dialogue: number;
  description: number;
}

// Connection Action Responses
export interface CharacterMeetResponse {
  scene: SceneData;
  relationship: RelationshipData;
  futureConflicts: string[];
}

export interface PlotWeaveResponse {
  bridgeScene: SceneData;
  connections: string[];
  foreshadowing: string[];
}

export interface LocationPortalResponse {
  transitionScene: SceneData;
  travelDescription: string;
}

// ===== Service Class =====

class StoryGenerationService {
  // ----- Story Generation -----

  async startStory(request: StoryStartRequest): Promise<StoryStartResponse> {
    // Import enum mappers from central utility
    const { storyGenreMap, povMap, targetLengthMap, audienceMap, storyToneMap, mapEnum } = await import('./apiEnumMapper');

    // Map frontend field values to API-expected PascalCase format
    const apiRequest = {
      starterPrompt: request.starterPrompt,
      themes: request.themes || [],
      genre: mapEnum(request.genre, storyGenreMap),
      subGenre: request.subGenre,
      tone: mapEnum(request.tone, storyToneMap),
      mood: request.mood,
      pointOfView: mapEnum(request.pointOfView, povMap),
      targetLength: mapEnum(request.targetLength, targetLengthMap),
      targetAudience: mapEnum(request.targetAudience, audienceMap),
      visualStyle: request.visualStyle,
      // LLM config
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      topP: request.topP,
      topK: request.topK,
      providerOptions: request.providerOptions,
      rag: request.rag,
    };

    const response = await api.post<StoryStartResponse>('/api/storytelling/start', apiRequest);
    return response.data;
  }

  async generateStructure(request: StoryStructureRequest): Promise<StoryStructureResponse> {
    // Import enum mappers
    const { storyFrameworkMap, detailLevelMap, storyGenreMap, storyToneMap, mapEnum } = await import('./apiEnumMapper');

    // Map frontend values to API-expected PascalCase format
    const apiRequest = {
      request: {
        storyId: request.storyId,
        story: request.story ? {
          ...request.story,
          genre: mapEnum(request.story.genre, storyGenreMap),
          tone: mapEnum(request.story.tone, storyToneMap),
        } : undefined,
        framework: mapEnum(request.framework, storyFrameworkMap),
        characters: request.characters,
        detailLevel: mapEnum(request.detailLevel, detailLevelMap),
        includeSubplots: request.includeSubplots,
        subplotCount: request.subplotCount,
      },
    };

    const response = await api.post<StoryStructureResponse>('/api/storytelling/structure', apiRequest);
    return response.data;
  }

  async generateScene(request: SceneGenerateRequest): Promise<SceneGenerateResponse> {
    const response = await api.post<SceneGenerateResponse>('/api/storytelling/generate-scene', request);
    return response.data;
  }

  async generateTreatment(request: TreatmentRequest): Promise<TreatmentResponse> {
    const response = await api.post<TreatmentResponse>('/api/storytelling/generate-treatment', request);
    return response.data;
  }

  async generatePlotTwist(request: PlotTwistRequest): Promise<PlotTwistResponse> {
    const response = await api.post<PlotTwistResponse>('/api/storytelling/generate-twist', request);
    return response.data;
  }

  async generateChoicePoint(request: ChoicePointRequest): Promise<ChoicePointResponse> {
    const response = await api.post<ChoicePointResponse>('/api/storytelling/generate-choice', request);
    return response.data;
  }

  async generateBranch(request: BranchGenerateRequest): Promise<BranchGenerateResponse> {
    const response = await api.post<BranchGenerateResponse>('/api/storytelling/generate-branch', request);
    return response.data;
  }

  // ----- Character Generation -----

  async generateCharacter(request: CharacterGenerateRequest): Promise<CharacterGenerateResponse> {
    const response = await api.post<CharacterGenerateResponse>('/api/character-library/generate', request);
    return response.data;
  }

  async generateVoiceProfile(request: VoiceProfileRequest): Promise<VoiceProfileResponse> {
    const response = await api.post<VoiceProfileResponse>('/api/agent/character/voice-profile', request);
    return response.data;
  }

  async generateRelationship(request: RelationshipRequest): Promise<RelationshipResponse> {
    const response = await api.post<RelationshipResponse>('/api/agent/character/relationship', request);
    return response.data;
  }

  async generateCharacterSheet(request: CharacterSheetRequest): Promise<CharacterSheetResponse> {
    const response = await api.post<CharacterSheetResponse>('/api/agent/character/generate-sheet', request);
    return response.data;
  }

  // ----- World Building -----

  /**
   * Create a location/environment for the story
   * POST /api/storytelling/world/environment (Swagger v3)
   * Maps frontend field names to API field names
   */
  async createLocation(request: LocationCreateRequest): Promise<LocationCreateResponse> {
    // Map frontend field names to Swagger v3 API schema
    const apiRequest = {
      // LLM config
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      topP: request.topP,
      topK: request.topK,
      providerOptions: request.providerOptions,
      rag: request.rag,
      // Location fields (mapped to API names)
      storyId: request.storyId,
      locationDescription: request.concept,           // concept → locationDescription
      type: request.locationType,                     // locationType → type
      atmosphere: request.mood,                       // mood → atmosphere
      detailLevel: request.sensoryDetail,             // sensoryDetail → detailLevel
      includeHistory: request.includeHistory,
      includeSecrets: request.includeSecrets,
      generateImage: request.generateImage,
      generatePanorama: request.generatePanorama,
      generateAmbient: request.generateAmbient,
    };
    const response = await api.post<LocationCreateResponse>('/api/storytelling/world/environment', apiRequest);
    return response.data;
  }

  async generateLore(request: WorldLoreRequest): Promise<WorldLoreResponse> {
    const response = await api.post<WorldLoreResponse>('/api/agent/world/generate-lore', request);
    return response.data;
  }

  async generateTimeline(request: TimelineRequest): Promise<TimelineResponse> {
    const response = await api.post<TimelineResponse>('/api/agent/world/timeline', request);
    return response.data;
  }

  // ----- Dialogue -----

  /**
   * Generate dialogue between characters
   * POST /api/storytelling/dialogue/generate (Swagger v3)
   * Maps frontend field names to API field names
   */
  async generateDialogue(request: DialogueGenerateRequest): Promise<DialogueGenerateResponse> {
    // Convert dialogueType to PascalCase for API (e.g., 'conversation' → 'Conversation')
    const toPascalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    // Map frontend field names to Swagger v3 API schema
    const apiRequest = {
      // LLM config
      model: request.model,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      topP: request.topP,
      topK: request.topK,
      providerOptions: request.providerOptions,
      rag: request.rag,
      // Dialogue fields (mapped to API names)
      storyId: request.storyId,
      sceneContext: request.situation,                 // situation → sceneContext
      characters: request.characters,
      type: toPascalCase(request.dialogueType),        // dialogueType → type (PascalCase)
      subtextLevel: request.subtextLevel,
      length: request.length,
      format: request.format,
      emotionalBeats: request.emotionalBeats,
      includeStageDirections: request.includeStageDirections,
    };
    const response = await api.post<DialogueGenerateResponse>('/api/storytelling/dialogue/generate', apiRequest);
    return response.data;
  }

  async applyCharacterVoices(
    dialogue: DialogueExchange,
    characters: CharacterProfile[],
    voices: Record<string, CharacterVoiceProfile>
  ): Promise<{ enhancedDialogue: DialogueExchange; voiceNotes: VoiceNote[] }> {
    const response = await api.post('/api/agent/dialogue/apply-voices', {
      dialogue,
      characters,
      characterVoices: voices,
    });
    return response.data;
  }

  async generateMonologue(request: MonologueRequest): Promise<MonologueResponse> {
    const response = await api.post<MonologueResponse>('/api/agent/dialogue/generate-monologue', request);
    return response.data;
  }

  // ----- Visualization -----

  async sceneToVisuals(request: SceneToVisualsRequest): Promise<SceneToVisualsResponse> {
    const response = await api.post<SceneToVisualsResponse>('/api/agent/prompt/scene-to-visuals', request);
    return response.data;
  }

  async assembleStoryboard(
    storyId: string,
    frames: StoryboardFrame[],
    frameUrls: string[],
    format: 'pdf' | 'png-sequence' | 'video-animatic' | 'pitch-deck',
    options?: { includeDialogue?: boolean; includeNotes?: boolean; includeTimings?: boolean }
  ): Promise<{ outputUrl: string; format: string; pageCount?: number; duration?: string }> {
    const response = await api.post('/api/agent/story/assemble-storyboard', {
      storyId,
      frames,
      frameUrls,
      format,
      ...options,
    });
    return response.data;
  }

  // ----- Enhancement -----

  async enhancePrompt(
    basePrompt: string,
    purpose: 'character-portrait' | 'location' | 'scene' | 'storyboard' | 'book-cover' | 'concept-art' | 'mood-board',
    options?: { style?: VisualStyle; enhancementLevel?: 'light' | 'moderate' | 'comprehensive' }
  ): Promise<{ enhancedPrompt: string; addedElements: string[]; negativePrompt?: string }> {
    const response = await api.post('/api/agent/prompt/enhance', {
      basePrompt,
      purpose,
      ...options,
    });
    return response.data;
  }

  async enhanceStory(request: StoryEnhanceRequest): Promise<StoryEnhanceResponse> {
    const response = await api.post<StoryEnhanceResponse>('/api/storytelling/enhance', request);
    return response.data;
  }

  // ----- Connection Actions -----

  async characterMeet(
    characterA: CharacterProfile,
    characterB: CharacterProfile,
    storyContext?: StoryData,
    meetingType: 'first-meeting' | 'reunion' | 'confrontation' = 'first-meeting'
  ): Promise<CharacterMeetResponse> {
    const response = await api.post<CharacterMeetResponse>('/api/story/connection/character-meet', {
      characterA,
      characterB,
      storyContext,
      meetingType,
    });
    return response.data;
  }

  async plotWeave(
    plotPointA: PlotPointData,
    plotPointB: PlotPointData,
    storyContext: StoryData,
    bridgeType: 'cause-effect' | 'parallel' | 'contrast' | 'callback' = 'cause-effect'
  ): Promise<PlotWeaveResponse> {
    const response = await api.post<PlotWeaveResponse>('/api/story/connection/plot-weave', {
      plotPointA,
      plotPointB,
      storyContext,
      bridgeType,
    });
    return response.data;
  }

  async locationPortal(
    locationA: LocationData,
    locationB: LocationData,
    characters: CharacterProfile[],
    transitionType: 'travel' | 'teleport' | 'flashback' | 'dream' = 'travel'
  ): Promise<LocationPortalResponse> {
    const response = await api.post<LocationPortalResponse>('/api/story/connection/location-portal', {
      locationA,
      locationB,
      characters,
      transitionType,
    });
    return response.data;
  }

  // ----- Export -----

  async exportManuscript(
    storyId: string,
    scenes: SceneData[],
    format: 'docx' | 'pdf' | 'epub' | 'mobi' | 'rtf' | 'txt' | 'markdown',
    options?: {
      includeChapterBreaks?: boolean;
      includeTitlePage?: boolean;
      authorName?: string;
      contactInfo?: string;
    }
  ): Promise<{ downloadUrl: string; format: string; wordCount: number; pageCount: number }> {
    const response = await api.post('/api/export/manuscript', {
      storyId,
      scenes,
      format,
      ...options,
    });
    return response.data;
  }

  async exportScreenplay(
    storyId: string,
    scenes: SceneData[],
    format: 'fountain' | 'fdx' | 'pdf' | 'celtx',
    options?: {
      includeTitlePage?: boolean;
      authorName?: string;
      basedOn?: string;
    }
  ): Promise<{ downloadUrl: string; format: string; pageCount: number; estimatedRuntime: string }> {
    const response = await api.post('/api/export/screenplay', {
      storyId,
      scenes,
      format,
      ...options,
    });
    return response.data;
  }

  async exportGameScript(
    storyId: string,
    scenes: SceneData[],
    choices: ChoiceData[],
    branches: BranchGenerateResponse[],
    format: 'ink' | 'twine' | 'yarn' | 'json' | 'dialogue-tree',
    options?: {
      includeVariables?: boolean;
      includeCharacterStates?: boolean;
    }
  ): Promise<{
    downloadUrl: string;
    format: string;
    nodeCount: number;
    branchCount: number;
    endingCount: number;
  }> {
    const response = await api.post('/api/export/game-script', {
      storyId,
      scenes,
      choices,
      branches,
      format,
      ...options,
    });
    return response.data;
  }

  // ----- Audio -----

  async cloneVoice(
    audioSampleUrl: string,
    characterId: string,
    voiceName: string,
    quality: 'instant' | 'professional' = 'instant'
  ): Promise<{ voiceId: string; voiceName: string; quality: string; sampleUrl: string }> {
    const response = await api.post('/api/audio/voice-clone', {
      audioSampleUrl,
      characterId,
      voiceName,
      quality,
    });
    return response.data;
  }

  async textToSpeech(
    text: string,
    voiceId: string,
    options?: { emotion?: string; speed?: number; pitch?: number }
  ): Promise<{ audioUrl: string; duration: number }> {
    const response = await api.post('/api/audio/tts', {
      text,
      voiceId,
      ...options,
    });
    return response.data;
  }

  async generateNarration(
    content: string,
    narratorVoiceId: string,
    characterVoices: Record<string, string>,
    options?: {
      includeDialoguePauses?: boolean;
      backgroundMusicMood?: string;
    }
  ): Promise<{ audioUrl: string; duration: number; chapters?: AudioChapter[] }> {
    const response = await api.post('/api/audio/narrate', {
      content,
      narratorVoiceId,
      characterVoices,
      ...options,
    });
    return response.data;
  }

  async generateAmbientSound(
    locationDescription: string,
    mood: string,
    duration: number,
    options?: { loop?: boolean; elements?: string[] }
  ): Promise<{ audioUrl: string; duration: number; loopable: boolean }> {
    const response = await api.post('/api/audio/ambient', {
      locationDescription,
      mood,
      duration,
      ...options,
    });
    return response.data;
  }

  // ----- Health Check -----

  /**
   * Health check for storytelling service
   * GET /api/storytelling/health (swagger v5)
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await api.get<{ status: string }>('/api/storytelling/health');
    return response.data;
  }
}

export interface VoiceNote {
  characterId: string;
  originalLine: string;
  enhancedLine: string;
  changesApplied: string[];
}

export interface AudioChapter {
  title: string;
  startTime: number;
  endTime: number;
}

// Export singleton instance
export const storyGenerationService = new StoryGenerationService();
export default storyGenerationService;
