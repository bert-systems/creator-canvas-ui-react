import type { Node, Edge } from '@xyflow/react';

// ============================================================================
// BOARD TYPES
// ============================================================================

export type BoardCategory =
  | 'fashion'
  | 'story'
  | 'interior'    // Interior Design boards
  | 'moodboard'   // Moodboard & Creative Direction boards
  | 'social'      // Social Media Content boards
  | 'stock';      // General stock/media boards

export interface Board {
  id: string;
  name: string;
  category: BoardCategory;
  description?: string;
  thumbnail?: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NODE TYPES
// ============================================================================

export type NodeCategory =
  | 'input'
  | 'imageGen'
  | 'videoGen'
  | 'threeD'
  | 'character'
  | 'style'
  | 'logic'
  | 'audio'
  | 'output'
  | 'composite'
  | 'multiFrame'
  // Storytelling categories
  | 'narrative'      // Story structure and generation
  | 'worldBuilding'  // Locations, lore, timelines
  | 'dialogue'       // Conversation and voice
  | 'branching'      // Interactive/choice-based
  // Fashion categories
  | 'fashion'        // Fashion design and production
  | 'fashionPhoto'   // Fashion photography
  | 'fashionVideo'   // Fashion video/runway
  // Interior Design categories
  | 'interiorDesign' // Room redesign, staging, materials
  | 'spacePlanning'  // Floor plans, furniture layout
  // Moodboard categories
  | 'moodboard'      // Visual inspiration & creative direction
  | 'brandIdentity'  // Brand kits, color palettes, typography
  // Social Media categories
  | 'socialMedia'    // Posts, carousels, stories
  | 'contentCreation'; // Captions, hashtags, hooks

export type NodeType =
  // Input nodes
  | 'textInput'
  | 'imageUpload'
  | 'videoUpload'
  | 'audioUpload'
  | 'referenceImage'
  | 'characterReference'
  // Image generation nodes
  | 'flux2Pro'
  | 'flux2Dev'
  | 'nanoBananaPro'
  | 'fluxKontext'
  | 'flux2Max'      // NEW Dec 2025 - Flagship multi-reference
  | 'recraftV3'     // NEW Dec 2025 - Text rendering & vector art
  | 'gptImage'      // NEW Dec 2025 - GPT Image 1.5
  | 'zImageTurbo'   // NEW Dec 2025 - Fast generation
  // Video generation nodes
  | 'kling26T2V'
  | 'kling26I2V'
  | 'klingO1Ref2V'
  | 'klingO1V2VEdit'
  | 'veo31'
  | 'veo31Fast'
  | 'klingAvatar'
  | 'sora2'         // NEW Dec 2025 - OpenAI with audio
  | 'sora2Pro'      // NEW Dec 2025 - OpenAI flagship
  | 'kling26Pro'    // NEW Dec 2025 - Kling flagship with audio
  | 'ltx2'          // NEW Dec 2025 - 4K @ 50fps with audio
  | 'wan26'         // NEW Dec 2025 - Multi-shot with audio
  // 3D generation nodes
  | 'meshy6'
  | 'tripoV25'
  | 'tripoSR'
  // Character consistency nodes
  | 'characterLock'
  | 'faceMemory'
  | 'elementLibrary'
  // Style nodes
  | 'styleDNA'
  | 'styleTransfer'
  | 'loraTraining'
  // Logic nodes
  | 'switch'
  | 'merge'
  | 'split'
  | 'loop'
  | 'conditional'
  // Audio nodes
  | 'audioGen'
  | 'voiceClone'
  | 'lipSync'
  | 'musicGen'
  // Output nodes
  | 'preview'
  | 'export'
  | 'publish'
  // Composite nodes
  | 'virtualTryOn'
  | 'clothesSwap'
  | 'runwayAnimation'
  | 'storyboardAutopilot'
  | 'collectionSlideshow'
  // Multi-frame nodes (Stacks, Queues, Grids)
  // Stacks (Vertical 9:16) - Sequential progression
  | 'stackTime'              // Time progression frames
  | 'stackMultiverse'        // Style/genre variations
  | 'stackChrono'            // Lighting/time-of-day
  | 'stackSubconscious'      // Reality vs perception
  | 'stackZAxis'             // Scale zoom (wide to macro)
  | 'stackCauseEffect'       // Before/after anchoring
  // Queues (Horizontal 16:9+) - Spatial continuity
  | 'queuePanorama'          // Ultra-wide establishing shot
  | 'queueWalkCycle'         // Locomotion frames
  | 'queueDialogueBeat'      // Setup-action-reaction strip
  | 'queueMotionTrail'       // Action ghost trails
  | 'queueMirror'            // Reality vs reflection
  // Grids (Matrix 1:1) - Comparative variations
  | 'gridContact'            // Cinematic contact sheet (3x3)
  | 'gridTurnaround'         // Character turnaround (2x3)
  | 'gridLighting'           // Lighting compass (2x2)
  | 'gridExpression'         // Micro-expression matrix (3x3)
  | 'gridStylePrism'         // Art style variations (3x3)
  | 'gridEntropy'            // Time decay progression (3x3)
  // Enhancement nodes
  | 'upscaleImage'           // Image upscaler
  | 'enhancePrompt'          // Prompt enhancement
  // ========================================
  // STORYTELLING NODES (NEW)
  // ========================================
  // Narrative nodes - Story foundation
  | 'storyGenesis'           // Create story concept from idea
  | 'storyStructure'         // Apply story frameworks (Save the Cat, Hero's Journey)
  | 'treatmentGenerator'     // Generate treatments, synopses, loglines
  | 'sceneGenerator'         // Write complete scenes
  | 'plotPoint'              // Create plot beats and events
  | 'plotTwist'              // Generate surprising twists
  | 'conflictGenerator'      // Create conflicts and obstacles
  | 'storyPivot'             // Radically change story direction
  | 'intrigueLift'           // Add mystery and tension
  | 'storyEnhancer'          // Polish and improve prose
  | 'storySynthesizer'       // Export story to various formats
  // Character nodes - Deep character development
  | 'characterCreator'       // Create multi-dimensional characters
  | 'characterRelationship'  // Map character relationships
  | 'characterVoice'         // Define unique speaking styles
  | 'characterSheet'         // Generate visual character sheets
  // World-building nodes
  | 'locationCreator'        // Create detailed locations
  | 'worldLore'              // Generate mythology and history
  | 'storyTimeline'          // Create chronological timelines
  // Dialogue nodes
  | 'dialogueGenerator'      // Generate authentic dialogue
  | 'monologueGenerator'     // Create powerful speeches
  // Branching narrative nodes
  | 'choicePoint'            // Create branching decisions
  | 'consequenceTracker'     // Track choice impacts
  | 'pathMerge'              // Reunite divergent paths
  // Visualization nodes
  | 'sceneVisualizer'        // Generate storyboard frames
  | 'screenplayFormatter'    // Format as screenplay
  // ========================================
  // FASHION NODES
  // ========================================
  // Garment Design
  | 'garmentSketch'          // Design garment sketches
  | 'patternGenerator'       // Generate sewing patterns
  | 'techPackGenerator'      // Create technical specifications
  // Textiles & Materials
  | 'textileDesigner'        // Design fabric patterns
  | 'culturalTextileFusion'  // Fuse heritage textiles
  // Model & Casting
  | 'modelCaster'            // Generate AI models with diversity
  | 'poseLibrary'            // Select model poses
  // Styling
  | 'outfitComposer'         // Style complete outfits
  | 'accessoryStylist'       // Add accessories
  // Photography
  | 'flatLayComposer'        // Create flat lay product shots
  | 'ecommerceShot'          // Create e-commerce product photos
  // Video
  | 'fabricMotion'           // Animate fabric movement
  // Collections
  | 'collectionBuilder'      // Build fashion collections
  | 'lookbookGenerator'      // Create lookbooks
  // Additional Fashion nodes
  | 'colorwayGenerator'      // Generate color variations
  | 'sizeScaler'             // Size visualization
  | 'layeringStylist'        // Outfit layering
  | 'ghostMannequin'         // Invisible mannequin shots
  | 'turnaroundVideo'        // 360-degree rotation video
  | 'lineSheetGenerator'     // Wholesale line sheets
  // ========================================
  // INTERIOR DESIGN NODES (NEW)
  // ========================================
  // Room Input & Analysis
  | 'roomPhotoUpload'        // Upload room photo for redesign
  | 'roomAnalyzer'           // Analyze room dimensions & features
  | 'roomTypeSelector'       // Select room type (living, bedroom, kitchen, etc.)
  | 'designStyleSelector'    // Select design style (modern, scandinavian, etc.)
  // Room Redesign & Visualization
  | 'roomRedesign'           // AI room style transformation
  | 'virtualStaging'         // Add furniture to empty rooms
  | 'roomRestyle'            // Change room style (before/after)
  | 'materialVisualizer'     // Change walls, floors, finishes
  | 'lightingSimulator'      // Simulate different lighting conditions
  // Furniture & Layout
  | 'furnitureSuggestion'    // AI furniture recommendations
  | 'furniturePlacer'        // Optimal furniture placement
  | 'shoppableFurniture'     // Match real purchasable items
  // Floor Plans & 3D
  | 'floorPlanGenerator'     // Generate 2D/3D floor plans
  | 'roomDimensionEditor'    // Edit room dimensions
  | 'walkthrough3D'          // Create 3D walkthrough video
  // Comparison & Export
  | 'beforeAfterCompare'     // Side-by-side comparison
  | 'designMoodExtractor'    // Extract mood from reference
  | 'materialPalette'        // Material & finish palette generator
  | 'room3DVisualizer'       // 3D room visualization from floor plan
  // ========================================
  // MOODBOARD NODES (NEW)
  // ========================================
  // Moodboard Creation
  | 'moodboardGenerator'     // AI-generated moodboards from prompts
  | 'moodboardLayout'        // Arrange images in moodboard templates
  | 'visualThemeGenerator'   // Generate cohesive visual themes
  | 'inspirationCurator'     // Curate inspiration from multiple sources
  // Color & Palette
  | 'colorPaletteExtractor'  // Extract colors from image
  | 'colorPaletteGenerator'  // Generate palettes from concepts
  | 'colorHarmony'           // Create color harmonies
  | 'pantoneMatchFinder'     // Find matching Pantone colors
  // Brand Identity
  | 'brandKitInput'          // Upload brand assets (logo, colors, fonts)
  | 'brandStyleGuide'        // Generate brand style guidelines
  | 'logoVariations'         // Generate logo variations
  // Typography & Texture
  | 'typographySuggester'    // Suggest font pairings
  | 'textureLibrary'         // Browse and add textures
  | 'patternGenerator'       // Generate seamless patterns
  // Aesthetic & Style
  | 'aestheticSelector'      // Choose aesthetic (minimalist, bold, vintage)
  | 'styleReference'         // Add style reference images
  | 'trendAnalyzer'          // Analyze current design trends
  | 'aestheticAnalyzer'      // Analyze visual aesthetic of images
  | 'textureGenerator'       // Generate seamless textures
  | 'brandKitGenerator'      // Generate complete brand identity kits
  // Export & Presentation
  | 'moodboardExport'        // Export moodboard as PDF/image
  | 'presentationBuilder'    // Build presentation slides
  // ========================================
  // SOCIAL MEDIA NODES (NEW)
  // ========================================
  // Content Creation
  | 'postGenerator'          // Generate single post (image + caption)
  | 'carouselGenerator'      // Generate multi-slide carousel
  | 'storyTemplate'          // Create Stories content
  | 'reelGenerator'          // Generate short-form video
  | 'thumbnailGenerator'     // Create video thumbnails
  // Text & Copy
  | 'captionGenerator'       // Generate captions with hashtags
  | 'hookGenerator'          // Create engaging opening lines
  | 'ctaGenerator'           // Create calls-to-action
  | 'hashtagOptimizer'       // Optimize hashtag strategy
  // Platform Optimization
  | 'platformOptimizer'      // Resize for different platforms
  | 'contentRepurposer'      // Adapt content for multiple platforms
  | 'formatConverter'        // Convert between formats
  // Brand & Templates
  | 'brandKitApplicator'     // Apply brand colors/fonts
  | 'templateApplicator'     // Apply post templates
  | 'batchContentCreator'    // Create multiple posts at once
  // Analytics & Planning
  | 'contentCalendar'        // Plan content schedule
  | 'trendSpotter'           // Identify trending topics
  | 'engagementPredictor'    // Predict post engagement
  | 'socialPostGenerator'    // Generate social post with image and caption
  | 'contentScheduler'       // Schedule content across platforms
  | 'storyCreator'           // Create Stories/Reels content
  | 'templateCustomizer';    // Customize social media templates

export type PortType =
  // Media types
  | 'image'
  | 'video'
  | 'audio'
  | 'text'
  | 'style'
  | 'character'
  | 'mesh3d'
  | 'any'
  // Storytelling types
  | 'story'        // Complete story/script object
  | 'scene'        // Individual scene data
  | 'plotPoint'    // Plot beat/event
  | 'location'     // Location/setting data
  | 'dialogue'     // Conversation/speech
  | 'treatment'    // Story treatment document
  | 'outline'      // Story outline/beat sheet
  | 'lore'         // World-building lore
  | 'timeline'     // Chronological events
  // Fashion types
  | 'garment'      // Garment data (construction, materials)
  | 'fabric'       // Fabric/textile data
  | 'pattern'      // Pattern/print design
  | 'model'        // Model data (body, skin tone, pose)
  | 'outfit'       // Complete styled outfit
  | 'collection'   // Fashion collection
  | 'techPack'     // Technical specifications
  | 'lookbook'     // Lookbook page/spread
  // Interior Design types
  | 'room'         // Room photo/data
  | 'floorPlan'    // Floor plan layout
  | 'material'     // Material/finish data
  | 'furniture'    // Furniture item/suggestion
  | 'designStyle'  // Interior design style
  | 'roomLayout'   // Furniture layout/arrangement
  // Moodboard types
  | 'moodboard'    // Complete moodboard
  | 'colorPalette' // Color palette data
  | 'brandKit'     // Brand identity assets
  | 'typography'   // Font/typography data
  | 'texture'      // Texture/pattern data
  | 'aesthetic'    // Aesthetic/visual theme
  // Social Media types
  | 'post'         // Social media post
  | 'carousel'     // Multi-slide carousel
  | 'caption'      // Caption with hashtags
  | 'template'     // Post/story template
  | 'platform';    // Platform specifications

export interface Port {
  id: string;
  name: string;
  type: PortType;
  required?: boolean;
  multiple?: boolean;
}

// ============================================================================
// DISPLAY MODES & SLOT CONFIGURATION
// ============================================================================

/** Node display modes for different levels of detail */
export type DisplayMode = 'compact' | 'standard' | 'expanded';

/** Preview slot configuration */
export interface PreviewSlotConfig {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d' | 'gallery' | '3d' | 'colorSwatches' | 'calendar' | 'comparison';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'auto';
  showZoom?: boolean;
  showDownload?: boolean;
  showVariations?: boolean;
  showFullscreen?: boolean;
  showTiled?: boolean;           // Show pattern tiled for textures
}

/** Parameter slot configuration */
export interface ParameterSlotConfig {
  layout: 'inline' | 'grid' | 'accordion' | 'stack';
  visibleInModes: DisplayMode[];
  priorityParams?: string[];       // Which params show in compact view
  groupBy?: string;                // Group parameters by category
}

/** Action slot configuration */
export interface ActionSlotConfig {
  primary: 'execute' | 'download' | 'preview';
  secondary?: ('execute' | 'download' | 'duplicate' | 'delete' | 'expand')[];
  showProgress?: boolean;
  showCost?: boolean;
}

/** Metadata slot configuration */
export interface MetadataSlotConfig {
  show: ('model' | 'cost' | 'duration' | 'timestamp')[];
  position: 'footer' | 'header';
}

/** Complete slot configuration for a node */
export interface NodeSlotConfig {
  preview?: PreviewSlotConfig;
  parameters?: ParameterSlotConfig;
  actions?: ActionSlotConfig;
  metadata?: MetadataSlotConfig;
  customContent?: string;          // Component name for escape hatch
}

// ============================================================================
// NODE DEFINITIONS
// ============================================================================

export interface NodeDefinition {
  type: NodeType;
  category: NodeCategory;
  /** Technical label (model name) */
  label: string;
  /** User-friendly display name (task-oriented) */
  displayName?: string;
  /** Detailed description of what the node does */
  description: string;
  /** Short tooltip help text */
  quickHelp?: string;
  /** Example use case */
  useCase?: string;
  icon: string;
  inputs: Port[];
  outputs: Port[];
  parameters: NodeParameter[];
  aiModel?: string;
  /** Model tier: flagship, production, creative, fast */
  tier?: 'flagship' | 'production' | 'creative' | 'fast';
  /** Cost estimate string e.g. "$0.07/megapixel" */
  cost?: string;
  /** Whether model has native audio generation */
  hasAudio?: boolean;
  /** Best use case indicator: 'text', 'faces', etc. */
  bestFor?: string;
  /** Slot configuration for UnifiedNode rendering */
  slots?: NodeSlotConfig;
  /** Default display mode when creating the node */
  defaultDisplayMode?: DisplayMode;
}

export interface NodeParameter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'slider' | 'boolean' | 'color' | 'file' | 'image' | 'video' | 'audio';
  default?: unknown;
  options?: { label: string; value: unknown }[];
  min?: number;
  max?: number;
  step?: number;
}

// ============================================================================
// CANVAS NODE & EDGE (React Flow compatible)
// ============================================================================

export interface CanvasNodeData extends Record<string, unknown> {
  nodeType: NodeType;
  category: NodeCategory;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  result?: NodeResult;
  error?: string;
}

export interface NodeResult {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d';
  url?: string;
  urls?: string[];
  data?: unknown;
  metadata?: Record<string, unknown>;
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge<{ animated?: boolean }>;

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

export interface WorkflowExecution {
  id: string;
  boardId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  nodeStates: Record<string, NodeExecutionState>;
  error?: string;
}

export interface NodeExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  result?: NodeResult;
  error?: string;
}

// ============================================================================
// MOMENTS OF DELIGHT (Connection Actions)
// ============================================================================

export type MomentOfDelight =
  // Fashion moments
  | 'virtualTryOn'
  | 'runwayAnimation'
  | 'textileDNAFusion'
  | 'collectionSlideshow'
  | 'fabricMotion'
  // Story moments
  | 'characterLock'
  | 'sceneToCinematic'
  | 'storyboardAutopilot'
  | 'dialogueSync'
  | 'genreShift'
  // Interior moments
  | 'roomSpin360'
  | 'beforeAfterWalk'
  | 'materialSwap'
  | 'lightingTimelapse'
  // Stock moments
  | 'multiAspectBurst'
  | 'lifestyleExtension'
  | 'seasonalVariants'
  | 'audioMoodMatch'
  // Universal moments
  | 'styleDNAFusion'
  | 'styleTransplant'
  | 'elementTransfer'
  | 'variationBridge'
  | 'characterInject';

export interface ConnectionAction {
  id: MomentOfDelight;
  label: string;
  description: string;
  icon: string;
  applicableCategories: BoardCategory[];
  sourceNodeTypes: NodeType[];
  targetNodeTypes: NodeType[];
  resultType: 'image' | 'video' | 'audio';
}

// ============================================================================
// ASSET LIBRARY
// ============================================================================

export type AssetType = 'image' | 'video' | 'audio' | 'mesh3d' | 'style' | 'character' | 'story';

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  url: string;
  thumbnailUrl?: string;
  metadata: Record<string, unknown>;
  tags: string[];
  boardId?: string;
  nodeId?: string;
  createdAt: string;
}

/**
 * Story asset for the Story Asset Library
 * Extends base Asset with story-specific data
 */
export interface StoryAsset extends Asset {
  type: 'story';
  storyData: {
    title: string;
    tagline?: string;
    logline?: string;
    genre?: string;
    tone?: string;
    themes?: string[];
    premise?: string;
    characters?: Array<{
      name: string;
      role: string;
      archetype: string;
      briefDescription?: string;
    }>;
    outline?: {
      acts: Array<{
        actNumber: number;
        title: string;
        summary: string;
      }>;
    };
  };
}

// ============================================================================
// TEMPLATES
// ============================================================================

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: BoardCategory;
  thumbnail: string;
  nodes: Omit<CanvasNode, 'id'>[];
  edges: Omit<CanvasEdge, 'id'>[];
  tags: string[];
  featured?: boolean;
}

// ============================================================================
// STORYTELLING DATA MODELS (NEW)
// ============================================================================

/** Story structure frameworks */
export type StoryFramework =
  | 'saveTheCat'      // Blake Snyder's 15 beats
  | 'herosJourney'    // Joseph Campbell's 12 stages
  | 'threeAct'        // Classic 3-act structure
  | 'fiveAct'         // Shakespearean 5-act
  | 'storyCircle'     // Dan Harmon's 8 steps
  | 'freytag'         // Freytag's Pyramid
  | 'sevenPoint'      // 7-point structure
  | 'fichtean'        // Fichtean Curve
  | 'inMediasRes'     // Start in the middle
  | 'kishotenketsu';  // Japanese 4-act (no conflict)

/** Character archetypes based on Jung and Campbell */
export type CharacterArchetype =
  | 'hero'
  | 'mentor'
  | 'guardian'
  | 'herald'
  | 'shapeshifter'
  | 'shadow'
  | 'ally'
  | 'trickster'
  | 'innocent'
  | 'orphan'
  | 'rebel'
  | 'lover'
  | 'creator'
  | 'ruler'
  | 'caregiver'
  | 'sage';

/** Plot beat types */
export type PlotBeatType =
  | 'inciting'
  | 'complication'
  | 'turning-point'
  | 'revelation'
  | 'confrontation'
  | 'crisis'
  | 'climax'
  | 'resolution'
  | 'cliffhanger';

/** Conflict types */
export type ConflictType =
  | 'interpersonal'   // Person vs Person
  | 'internal'        // Person vs Self
  | 'nature'          // Person vs Nature
  | 'society'         // Person vs Society
  | 'technology'      // Person vs Technology
  | 'supernatural'    // Person vs Supernatural
  | 'fate';           // Person vs Fate/Time

/** Story data - Complete story concept */
export interface StoryData {
  id: string;
  title: string;
  logline: string;
  premise: string;
  theme: string;
  genre: string[];
  tone: string;
  targetLength: 'flash' | 'short' | 'novelette' | 'novella' | 'novel' | 'script';
  targetAudience: 'children' | 'ya' | 'general' | 'mature';
  setting: {
    timePeriod: string;
    locations: string[];
    worldType: 'realistic' | 'fantastical' | 'scifi' | 'historical';
  };
  synopsis: string;
  createdAt: string;
  updatedAt: string;
}

/** Character profile - Deep character data */
export interface CharacterProfile {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  archetype?: CharacterArchetype;

  // Physical attributes
  appearance: {
    age: string;
    gender: string;
    physicalDescription: string;
    distinctiveFeatures: string[];
  };

  // Psychological profile
  personality: {
    traits: string[];
    strengths: string[];
    flaws: string[];
    fears: string[];
    desires: string[];
    motivations: string[];
  };

  // Background
  backstory: {
    origin: string;
    formativeEvents: string[];
    secrets: string[];
    relationships: Record<string, string>; // characterId -> relationship description
  };

  // Character arc
  characterArc: {
    startingState: string;
    endingState: string;
    keyMoments: string[];
    internalConflict: string;
  };

  // Voice profile for dialogue
  voice: {
    speechPattern: string;
    vocabulary: string;
    quirks: string[];
    catchphrases?: string[];
  };

  // Visual references
  visualReferences?: string[];
  generatedPortraits?: string[];
}

/** Location data - Setting/place information */
export interface LocationData {
  id: string;
  name: string;
  type: string;
  description: string;
  atmosphere: string;
  sensoryDetails: {
    visual: string[];
    auditory: string[];
    olfactory: string[];
    tactile: string[];
  };
  history?: string;
  secrets?: string[];
  connectedLocations?: string[];
  visualReferences?: string[];
}

/** Plot point data - Individual story beat */
export interface PlotPointData {
  id: string;
  type: PlotBeatType;
  summary: string;
  fullDescription: string;
  charactersInvolved: string[];
  location?: string;
  consequences: string[];
  emotionalTone: 'positive' | 'negative' | 'mixed' | 'neutral';
  stakesLevel: number; // 0-1
  position: {
    act: number;
    sequence: number;
  };
}

/** Scene data - Complete scene content */
export interface SceneData {
  id: string;
  plotPointId?: string;
  title: string;
  summary: string;
  fullContent: string;
  format: 'prose' | 'screenplay' | 'stageplay' | 'comic';
  pov?: 'first' | 'third-limited' | 'third-omniscient' | 'second';

  elements: {
    characters: string[];
    location: string;
    timeOfDay: string;
    weather?: string;
  };

  beats: {
    opening: string;
    conflict: string;
    resolution: string;
  };

  dialogue?: string;
  actionDescription?: string;
  storyboardPrompts?: string[];
  visualFrames?: string[];
}

/** Outline data - Story structure with beats */
export interface OutlineData {
  id: string;
  storyId: string;
  framework: StoryFramework;

  acts: {
    actNumber: number;
    title: string;
    summary: string;
    beats: PlotPointData[];
  }[];

  subplots?: {
    id: string;
    name: string;
    summary: string;
    beats: PlotPointData[];
  }[];
}

/** Treatment data - Professional story document */
export interface TreatmentData {
  id: string;
  storyId: string;
  format: 'film' | 'tvBible' | 'novelSynopsis' | 'shortPitch' | 'gameNarrative';

  logline: string;
  shortSynopsis: string; // 1-2 paragraphs
  fullTreatment: string; // 2-5 pages

  characterBreakdowns?: {
    characterId: string;
    treatmentDescription: string;
  }[];

  thematicStatement?: string;
  comparables?: string[]; // "X meets Y"
}

/** World lore data - Mythology and history */
export interface WorldLoreData {
  id: string;
  worldName: string;
  type: 'comprehensive' | 'historical' | 'mythological' | 'political' | 'systems' | 'cultural';

  history: {
    era: string;
    events: string[];
  }[];

  mythology?: {
    gods?: string[];
    legends?: string[];
    prophecies?: string[];
  };

  factions?: {
    name: string;
    description: string;
    goals: string[];
    allies: string[];
    enemies: string[];
  }[];

  rules?: {
    magic?: string;
    technology?: string;
    society?: string;
  };
}

/** Timeline data - Chronological events */
export interface TimelineData {
  id: string;
  scope: 'story' | 'characters' | 'world' | 'comprehensive';

  events: {
    id: string;
    date: string; // Can be relative or absolute
    title: string;
    description: string;
    characters?: string[];
    location?: string;
    importance: 'major' | 'minor' | 'background';
  }[];
}

/** Dialogue exchange data */
export interface DialogueData {
  id: string;
  participants: string[];
  context: string;
  type: 'casual' | 'dramatic' | 'romantic' | 'comedic' | 'expository' | 'confrontational' | 'interrogation';

  lines: {
    characterId: string;
    text: string;
    parenthetical?: string; // (angrily), (whispering), etc.
    subtext?: string;
  }[];
}

/** Choice point for branching narratives */
export interface ChoicePointData {
  id: string;
  precedingSceneId: string;
  prompt: string;
  type: 'moral' | 'action' | 'dialogue' | 'strategic' | 'relationship';

  options: {
    id: string;
    label: string;
    description: string;
    consequence: string;
    nextSceneId?: string;
  }[];

  convergenceType: 'immediate' | 'delayed' | 'major' | 'permanent';
}

// Story-specific connection actions (Moments of Delight)
export type StoryMomentOfDelight =
  // Character connections
  | 'characterMeet'         // Two characters → First meeting scene
  | 'relationshipArc'       // Characters → Relationship evolution
  | 'characterConflict'     // Characters → Conflict generation
  // Plot connections
  | 'plotWeave'             // Plot points → Woven subplot
  | 'causeEffect'           // Plot point → Consequence chain
  | 'parallelAction'        // Scenes → Parallel cutaway sequence
  // World connections
  | 'locationReveal'        // Character + Location → Arrival scene
  | 'loreIntegration'       // Lore + Scene → Integrated exposition
  // Enhancement connections
  | 'tensionRamp'           // Scene + Conflict → Heightened tension
  | 'emotionalDeepen'       // Scene + Character → Emotional depth
  // Visual connections
  | 'sceneToStoryboard'     // Scene → Visual frames
  | 'characterToPortrait';  // Character → Visual design

// ============================================================================
// AFRICAN FASHION SWATCHES (from original implementation)
// ============================================================================

export interface TextileSwatch {
  id: string;
  name: string;
  origin: string;
  description: string;
  patternUrl: string;
  colors: string[];
}

export interface AdinkraSwatch {
  id: string;
  name: string;
  meaning: string;
  symbolUrl: string;
}

export interface GarmentType {
  id: string;
  name: string;
  region: string;
  description: string;
}

export const AFRICAN_TEXTILES: TextileSwatch[] = [
  { id: 'kente', name: 'Kente', origin: 'Ghana', description: 'Woven silk and cotton fabric', patternUrl: '', colors: ['gold', 'green', 'red', 'black'] },
  { id: 'ankara', name: 'Ankara', origin: 'West Africa', description: 'Colorful wax print fabric', patternUrl: '', colors: ['orange', 'blue', 'yellow', 'green'] },
  { id: 'mudcloth', name: 'Bogolan (Mudcloth)', origin: 'Mali', description: 'Hand-dyed fermented mud cloth', patternUrl: '', colors: ['brown', 'black', 'white', 'ochre'] },
  { id: 'kitenge', name: 'Kitenge', origin: 'East Africa', description: 'Vibrant printed cotton', patternUrl: '', colors: ['purple', 'orange', 'blue', 'green'] },
  { id: 'shweshwe', name: 'Shweshwe', origin: 'South Africa', description: 'Indigo-dyed printed cotton', patternUrl: '', colors: ['indigo', 'white', 'brown', 'red'] },
  { id: 'adire', name: 'Adire', origin: 'Nigeria', description: 'Indigo tie-dye fabric', patternUrl: '', colors: ['indigo', 'white', 'blue'] },
  { id: 'aso-oke', name: 'Aso Oke', origin: 'Nigeria', description: 'Hand-woven ceremonial cloth', patternUrl: '', colors: ['white', 'blue', 'purple', 'gold'] },
  { id: 'kanga', name: 'Kanga', origin: 'East Africa', description: 'Printed cotton with proverbs', patternUrl: '', colors: ['red', 'green', 'yellow', 'blue'] },
  { id: 'korhogo', name: 'Korhogo', origin: 'Ivory Coast', description: 'Hand-painted cotton cloth', patternUrl: '', colors: ['black', 'brown', 'white'] },
  { id: 'ndebele', name: 'Ndebele', origin: 'South Africa', description: 'Geometric painted patterns', patternUrl: '', colors: ['blue', 'red', 'yellow', 'green', 'white'] },
];

export const ADINKRA_SYMBOLS: AdinkraSwatch[] = [
  { id: 'sankofa', name: 'Sankofa', meaning: 'Return and get it - learn from the past', symbolUrl: '' },
  { id: 'gye-nyame', name: 'Gye Nyame', meaning: 'Except for God - supremacy of God', symbolUrl: '' },
  { id: 'adinkrahene', name: 'Adinkrahene', meaning: 'King of Adinkra symbols - leadership', symbolUrl: '' },
  { id: 'dwennimmen', name: 'Dwennimmen', meaning: 'Ram\'s horns - humility and strength', symbolUrl: '' },
  { id: 'nyame-dua', name: 'Nyame Dua', meaning: 'Tree of God - divine presence', symbolUrl: '' },
];

export const AFRICAN_COLORS = [
  { id: 'kente-gold', name: 'Kente Gold', hex: '#FFD700' },
  { id: 'sahara-sand', name: 'Sahara Sand', hex: '#D2B48C' },
  { id: 'congo-green', name: 'Congo Green', hex: '#228B22' },
  { id: 'nile-blue', name: 'Nile Blue', hex: '#1E90FF' },
  { id: 'serengeti-orange', name: 'Serengeti Orange', hex: '#FF8C00' },
  { id: 'kilimanjaro-brown', name: 'Kilimanjaro Brown', hex: '#8B4513' },
  { id: 'masai-red', name: 'Masai Red', hex: '#DC143C' },
  { id: 'ivory-coast-cream', name: 'Ivory Coast Cream', hex: '#FFFDD0' },
  { id: 'ebony-black', name: 'Ebony Black', hex: '#1C1C1C' },
  { id: 'victoria-falls-teal', name: 'Victoria Falls Teal', hex: '#008080' },
];
