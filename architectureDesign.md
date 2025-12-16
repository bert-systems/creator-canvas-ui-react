# Architecture Design - Creative Canvas Studio

**Last Updated:** December 14, 2025

## Overview

Creative Canvas Studio is a standalone React application providing an infinity-board, node-based interface for composing AI-powered creative workflows. It's been extracted from the parent `ssgp-v2-agents-ui-react` project to operate as an independent creative orchestration platform.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Creative Canvas Studio                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   React 19      │  │  @xyflow/react  │  │   MUI v7        │             │
│  │   Frontend      │  │  (React Flow)   │  │   Components    │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┼────────────────────┘                       │
│                                │                                            │
│  ┌─────────────────────────────▼─────────────────────────────────────────┐  │
│  │                     Zustand State Management                          │  │
│  │  • canvasStore.ts - Board, nodes, edges, UI state                     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                │                                            │
│  ┌─────────────────────────────▼─────────────────────────────────────────┐  │
│  │                      Service Layer                                    │  │
│  │  • creativeCanvasService.ts - Board/Card CRUD, workflows              │  │
│  │  • api.ts - Axios instance with interceptors                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                │                                            │
│                                ▼                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Backend API (ASP.NET Core)                        │  │
│  │           https://localhost:7688/api/creative-canvas/*                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Canvas Components (`src/components/canvas/`)

- **CreativeCanvasStudio.tsx** - Main component wrapping ReactFlowProvider
  - Manages board state, node CRUD, connections
  - Handles "Moments of Delight" (connection actions)
  - Toolbar rendering and viewport management
  - **NEW:** Integrates NodePalette (left) and NodeInspector (right) sidebars
  - **NEW:** Drag-drop handler for palette nodes
  - **NEW:** Parameter change handler for inspector

### 2. Node Components (`src/components/nodes/`)

- **CanvasNode.tsx** - Custom React Flow node for canvas cards (ENHANCED Dec 2025)
  - Displays card content with expand/collapse
  - Shows workflow status, progress indicators
  - Handles card execution and preview
  - **NEW:** Category Badge - Visual indicator at top-left showing card category (Fashion, Interior, etc.)
  - **NEW:** Expand Caret - Bottom section with clickable expand/collapse control for quick access

### 3. Creative Card System (`src/components/cards/`) - NEW in v3.0

The "Elevated Vision" Creative Card system reimagines cards as collectible trading cards for creative entrepreneurs.

- **CreativeCard.tsx** - Main card component with 3 modes
  - **Hero mode** (default): 55% visual preview, controls below
  - **Craft mode** (expanded): Full editing with quick styles, variation strip
  - **Mini mode** (collapsed): 80px thumbnail view for overview
  - Registered as `creativeCard` node type in React Flow

- **CardPreview.tsx** - Hero preview component
  - Large visual area with hover overlay actions
  - Progress ring animation during generation
  - Variation strip with thumbnail selection
  - "Ready to create" anticipation design for empty state

- **CardControls.tsx** - Glassmorphic control overlay
  - Title/prompt inline editing
  - Execute, lock, favorite quick actions
  - Context menu: duplicate, delete, add to collection
  - Execution status with stage name display

- **QuickStyles.tsx** - One-click style presets
  - 6 presets: Cinematic, Editorial, Dramatic, Soft, Vibrant, Vintage
  - Style keyword preview tooltip
  - Expandable preset list
  - Custom style addition

- **ConnectionLine.tsx** - Animated edge visualization
  - Color-coded by data type (image=blue, video=green, etc.)
  - Edge types: StandardEdge, FlowingEdge, StyleEdge, CharacterEdge, DelightEdge
  - Glow effect on active data flow
  - Sparkle animation for "Moment of Delight" connections

- **cardAnimations.ts** - Animation system
  - Keyframes: shimmer, gentlePulse, borderGlow, celebrationBurst
  - State animations for: queued, generating, completed, error
  - Glassmorphism helpers (background, blur, borders)
  - Transition utilities (instant, fast, normal, slow, bounce)

### 4. Creative Collaborators (`src/components/agents/`) - NEW in v3.0

AI-powered creative assistants that proactively help users create, refine, and package their work.

**Agent Personas** (`src/models/agents.ts`):
- **🪄 The Muse** - Creative spark generator, ideation, prompt enhancement
- **🎯 The Curator** - Quality assessment, style consistency, best picks
- **🔧 The Architect** - Workflow optimization, error diagnosis, efficiency
- **📦 The Packager** - Export preparation, bundle creation, marketplace listing
- **🌍 The Heritage Guide** - Cultural context, authentic combinations, attribution

**AgentOrchestrator** (`src/services/agentOrchestrator.ts`):
- Singleton service managing agent lifecycle
- Proactive trigger system (empty canvas, long pause, post-generation, etc.)
- Message queue with read/dismiss/snooze states
- Suggestion management with confidence scoring
- User preferences (enabled agents, muted triggers)
- Analysis progress tracking

**AgentPresence** (`src/components/agents/AgentPresence.tsx`):
- Floating bottom-right presence (like Intercom)
- Proactive message cards with action buttons
- Unread badge with message count
- Quick agent access bar (expandable)
- Auto-dismiss after 10 seconds

**AgentPanel** (`src/components/agents/AgentPanel.tsx`):
- Full slide-in panel for active engagement
- Agent persona tabs with emoji icons
- Analysis progress visualization
- Suggestion cards with Apply/Modify/Skip actions
- Message history
- Ask agent input with send button
- Settings for enabling/disabling agents

### 5. Onboarding System (`src/components/onboarding/`) - NEW in v3.0

Workflow-first onboarding that helps users get started immediately with pre-built workflows.

**PersonaSelector.tsx** - First screen for new users:
- 6 creative personas: Fashion, Storytelling, Interior, Content Creator, E-commerce, General
- Each persona shows emoji, name, tagline, and example use cases
- Selection persisted to localStorage
- Skip option for users who want to explore freely

**WorkflowSelector.tsx** - Workflow template picker:
- Shows 3 workflow templates per persona
- Each workflow card displays: name, description, difficulty, estimated time
- Node preview showing workflow components
- Featured badge for popular workflows
- Option to start with empty canvas

**Workflow Templates** (`src/data/workflowTemplates.ts`):
- 18 pre-built workflows across 6 personas
- Each template defines: nodes, edges, guided steps
- Difficulty levels: beginner, intermediate, advanced
- Includes parameter defaults for immediate use

**User Journey:**
```
First Visit → /welcome (PersonaSelector)
           → Select Persona
           → /welcome/workflows (WorkflowSelector)
           → Select Workflow OR Start Empty
           → / (CreativeCanvasStudio with workflow loaded)
```

### 6. Creative Palette (`src/components/palette/`) - NEW in v3.0

Redesigned creative palette with intent-based organization replacing the technical model-based approach.

**CreativePalette.tsx** - Main wrapper component (v3 - now exclusive):
- Three-tab navigation: CREATE, STYLE, ASSETS
- Unified search across all tabs
- Capability-based search hints
- Legacy NodePalette (v2) has been removed

**CreateTab.tsx** - Intent-based node organization:
- 6 Intent Categories:
  - 📸 **Images** - From Imagination, From References, Enhancements
  - 🎬 **Videos** - From Words, From Images, Talking Faces
  - 👗 **Fashion** - Virtual Try-On, Clothes Swap, Runway, Collection
  - 🧊 **3D** - Image to 3D, Retexture, Product View
  - 📖 **Storytelling** - Character Lock, Scene Sequence, Dialogue
  - 🔧 **Utilities** - Inputs, Outputs, Logic
- Trending section with horizontal scrolling cards
- Drag-to-canvas functionality

**StyleTab.tsx** - Brand DNA and heritage:
- **Style DNA** - Create/import brand styles with keywords and colors
- **Heritage Collection** - African textiles:
  - Kente Cloth (Ghana), Adinkra Symbols (Akan)
  - Mud Cloth/Bògòlanfini (Mali), Shweshwe (South Africa)
  - Ankara/African Wax Print (West Africa)
- **Style Presets** - Cinematic, Editorial, Vibrant, Muted, Vintage
- **Color Palettes** - African Sunrise, Ocean Depths, Forest Canopy, Desert Dusk

**AssetsTab.tsx** - Asset management:
- Recent Outputs with drag-to-canvas
- Collections management
- Saved Characters for consistency
- Upload area for new assets

**paletteData.ts** - Data definitions:
- `INTENT_CATEGORIES` - Category and subcategory structure
- `TRENDING_ITEMS` - Popular workflow items
- `STYLE_PRESETS` - Visual style presets
- `COLOR_PALETTES` - Curated color schemes
- `SEARCH_CAPABILITIES` - Capability-based search with aliases
- `searchByCapability()` - Natural language node search

### 6. Panel Components (`src/components/panels/`)

- **NodePalette.tsx** - DEPRECATED (replaced by CreativePalette v3)
  - Legacy node palette kept for reference
  - No longer rendered in CreativeCanvasStudio

- **NodeInspector.tsx** - Right sidebar for node property editing (ENHANCED Dec 2025)
  - Dynamic parameter forms (text, number, slider, select, boolean, color, file)
  - Port visualization (inputs/outputs)
  - Status indicators with progress
  - Execute/Stop/Duplicate/Delete actions
  - Result preview for generated content
  - **NEW:** Model Chooser - AI model selection for generation nodes (imageGen, videoGen, threeD)
  - **NEW:** Prompt Enhancer - AI agent-based prompt improvement with 5 agents:
    - Muse (creative flourishes), Curator (technical precision), Architect (structure)
    - Heritage Guide (cultural context), Critic (clarity refinement)
  - **NEW:** Enhanced Metadata Display - Shows displayName, quickHelp, useCase, node type badges

- **BoardManager.tsx** - Board listing and management
- **TemplateBrowser.tsx** - Template selection drawer
- **ConnectionActionMenu.tsx** - "Moments of Delight" menu

### 4. Services (`src/services/`)

- **canvasToolbarService.ts** - Category-specific tools and swatches
  - Fashion: Fabrics, colors, patterns, styles, African textiles, Adinkra symbols
  - Interior: Color schemes
  - Stock: Color grades
  - Story: AI enhancers
  - Prompt enhancement agents

- **connectionActionService.ts** - "Moments of Delight" fusion operations
  - Image trait analysis (colors, textures, subjects, moods)
  - Fusion prompt generation
  - Multi-image generation with Nano Banana Pro / FLUX Redux
  - Action types: creative-dna-fusion, style-transplant, element-transfer, variation-bridge, character-inject
  - Cost estimation per operation

- **characterConsistencyService.ts** - Character consistency system
  - **Character Lock** - Create/update/delete character profiles with up to 7 reference images
  - **Face Memory** - 5-slot face memory system for multi-character scenes
  - **Element Library** - Kling O1 integration for video element consistency

## Data Models

### Core Entities

```typescript
// Board - Workspace container
interface CanvasBoard {
  id: string;
  name: string;
  category: CardCategory; // 'fashion' | 'interior' | 'stock' | 'story'
  cards: CanvasCard[];
  viewportState: ViewportState;
}

// Card - Visual node on canvas
interface CanvasCard {
  id: string;
  type: CardType;
  templateId: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  prompt?: string;
  enhancedPrompt?: string;
  generatedImages: string[];
  workflow?: CardWorkflow;
}

// Workflow - Execution pipeline
interface CardWorkflow {
  stages: WorkflowStage[];
  status: 'idle' | 'running' | 'completed' | 'failed';
}
```

### Node Definition System

Node types are defined in `src/config/nodeDefinitions.ts`:
- **Input nodes** - Text, image, video, audio uploads
- **Image Gen nodes** - FLUX.2 Pro/Dev, Nano Banana Pro, FLUX Kontext
- **Video Gen nodes** - Kling 2.6, VEO 3.1, Kling Avatar
- **3D Gen nodes** - Meshy 6, Tripo v2.5
- **Character nodes** - Character Lock, Face Memory, Element Library
- **Style nodes** - Style DNA, Style Transfer, LoRA Training
- **Composite nodes** - Virtual Try-On, Runway Animation, Storyboard
- **Multi-Frame nodes** - Stacks, Queues, Grids for variations (NEW in v3.0)
- **Enhancement nodes** - Image Upscaler, Prompt Enhancer (NEW in v3.0)
- **Output nodes** - Preview, Export

### Multi-Frame Node System (NEW in v3.0)

Multi-frame nodes generate consistent image variations for character sheets, time progressions, and style variations.

**Stacks (Vertical 9:16)** - Sequential progression frames:
- `stackTime` - Time progression (aging, evolution, seasons)
- `stackMultiverse` - Style/genre variations of same subject
- `stackChrono` - Lighting/time-of-day progression
- `stackSubconscious` - Reality vs perception/dream states
- `stackZAxis` - Scale zoom (wide to macro)
- `stackCauseEffect` - Before/after anchoring

**Queues (Horizontal 16:9+)** - Spatial continuity frames:
- `queuePanorama` - Ultra-wide establishing shots
- `queueWalkCycle` - Locomotion animation frames
- `queueDialogueBeat` - Setup-action-reaction comic strip
- `queueMotionTrail` - Action ghost trails
- `queueMirror` - Reality vs reflection

**Grids (Matrix 1:1)** - Comparative variation matrices:
- `gridContact` - Cinematic contact sheet (3x3)
- `gridTurnaround` - Character turnaround (2x3)
- `gridLighting` - Lighting compass (2x2)
- `gridExpression` - Micro-expression matrix (3x3)
- `gridStylePrism` - Art style variations (3x3)
- `gridEntropy` - Time decay progression (3x3)

**Enhancement Nodes:**
- `upscaleImage` - 4x AI upscaling for high-res output
- `enhancePrompt` - LLM-powered prompt refinement

### Storytelling Node System (NEW Dec 2025)

A comprehensive node-based storytelling system with 26 node types across 4 new categories. This enables Creative Canvas Studio to be an innovative story generation platform.

**Strategy Document:** `docs/STORYTELLING_NODE_STRATEGY.md`

**New Categories:**
- `narrative` - Story structure and generation (emerald green #10b981)
- `worldBuilding` - Locations, lore, timelines (lime green #84cc16)
- `dialogue` - Conversation and voice (pink #f472b6)
- `branching` - Interactive/choice-based (violet #a78bfa)

**New Port Types:**
- `story` - Complete story data with metadata
- `scene` - Individual scene content
- `plotPoint` - Story beats and events
- `location` - Setting/environment data
- `dialogue` - Conversation exchanges
- `treatment` - Synopsis/logline content
- `outline` - Structured story outline
- `lore` - World-building information
- `timeline` - Chronological events

**Narrative Nodes:**
- `storyGenesis` - Transform ideas into story concepts with genre, tone, themes
- `storyStructure` - Apply frameworks: Save the Cat (15 beats), Hero's Journey (12 stages), Three-Act, Story Circle
- `treatmentGenerator` - Professional synopses and loglines
- `sceneGenerator` - Complete scenes with dialogue, action, description
- `plotPoint` - Story beats (inciting incident, midpoint, climax, etc.)
- `plotTwist` - Unexpected reveals with foreshadowing
- `conflictGenerator` - Internal, external, interpersonal, societal conflicts
- `storyPivot` - Radical direction changes
- `intrigueLift` - Add mystery, tension, suspense
- `storyEnhancer` - Polish and improve prose

**Character Nodes:**
- `characterCreator` - Deep profiles with Jungian archetypes (hero, mentor, shadow, etc.)
- `characterRelationship` - Dynamics: ally, rival, mentor, love interest, etc.
- `characterVoice` - Distinctive speech patterns and vocabulary
- `characterSheet` - Visual character reference generation

**World-Building Nodes:**
- `locationCreator` - Vivid settings with atmosphere and sensory details
- `worldLore` - Mythology, history, factions, rules
- `storyTimeline` - Chronological event tracking

**Dialogue Nodes:**
- `dialogueGenerator` - Authentic conversations between characters
- `monologueGenerator` - Powerful speeches and internal monologue

**Branching Nodes:**
- `choicePoint` - Branching decision points for interactive fiction
- `consequenceTracker` - Track choice impacts across paths
- `pathMerge` - Reunite divergent narrative paths

**Visualization Nodes:**
- `sceneVisualizer` - Generate storyboard frames from scenes
- `screenplayFormatter` - Industry-standard screenplay formatting

**Story Data Models:**

```typescript
interface StoryData {
  id: string;
  title: string;
  logline: string;
  premise: string;
  theme: string;
  genre: string[];
  tone: string;
  targetLength: 'short' | 'feature' | 'series';
  targetAudience: string;
  setting: { period: string; location: string };
  synopsis: string;
  characters: CharacterProfile[];
  locations: LocationData[];
  plotPoints: PlotPointData[];
  outline?: OutlineData;
  treatment?: TreatmentData;
}

interface CharacterProfile {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  archetype: CharacterArchetype; // hero, mentor, shadow, trickster, etc.
  appearance: string;
  personality: { traits: string[]; flaws: string[]; quirks: string[] };
  backstory: string;
  characterArc: { start: string; midpoint: string; end: string };
  voice: { vocabulary: string; speechPatterns: string };
  relationships: RelationshipData[];
}

interface SceneData {
  id: string;
  plotPointId?: string;
  title: string;
  summary: string;
  fullContent: string;
  format: 'prose' | 'screenplay' | 'treatment';
  pov: string;
  elements: { setting: string; mood: string; conflict?: string };
  beats: string[];
  dialogue: DialogueLine[];
  storyboardPrompts?: string[];
}
```

**Port Compatibility:**
Story ports can connect to text ports for maximum flexibility:
- `story` → `story`, `text`, `any`
- `scene` → `scene`, `text`, `any`
- `plotPoint` → `plotPoint`, `scene`, `text`, `any`
- `outline` → `outline`, `story`, `text`, `any`

## State Management

### Zustand Store (`src/stores/canvasStore.ts`)

```typescript
interface CanvasState {
  // Board state
  currentBoard: Board | null;
  boards: Board[];

  // Canvas state (React Flow)
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodes: string[];

  // UI state
  nodePaletteOpen: boolean;
  inspectorOpen: boolean;
  activeCategory: BoardCategory;

  // Execution state
  currentExecution: WorkflowExecution | null;
  isExecuting: boolean;

  // Assets
  assets: Asset[];
}
```

Persistence is handled via Zustand middleware with `localStorage`.

## API Integration

### Service Layer Structure

```
src/services/
├── api.ts                    # Axios instance, interceptors
└── creativeCanvasService.ts  # Creative Canvas API methods
    ├── boards.*              # Board CRUD
    ├── cards.*               # Card CRUD + workflow execution
    ├── groups.*              # Card grouping
    ├── templates.*           # Template management
    ├── libraries.*           # Asset library management
    └── marketplace.*         # Marketplace operations
```

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/creative-canvas/boards` | Create board |
| `GET /api/creative-canvas/boards` | List boards |
| `POST /api/creative-canvas/boards/{id}/cards` | Create card |
| `POST /api/creative-canvas/cards/{id}/execute` | Execute workflow |
| `GET /api/creative-canvas/cards/{id}/workflow/status` | Poll status |

## Auto-Connect on Drop (NEW in v3.0)

When dragging a node from the palette onto an existing node on the canvas, the system automatically creates a connection if compatible ports exist.

### Implementation

```typescript
// Find node at drop position with tolerance
const findNodeAtPosition = (position, tolerance = 50): Node | null

// Check port type compatibility
const arePortsCompatible = (outputType, inputType): boolean
  // 'any' type matches everything
  // Same types match

// Find best connection between two nodes
const findBestConnection = (sourceNode, targetNode): { sourceHandle, targetHandle } | null
  // Iterates through all source outputs and target inputs
  // Returns first compatible match
```

### Behavior
1. User drags node from palette over existing node
2. On drop, system checks if drop position overlaps an existing node
3. If overlap found, checks port compatibility:
   - New node's outputs → existing node's inputs
   - Existing node's outputs → new node's inputs
4. If compatible ports found, automatically creates edge
5. Node is positioned offset from the target to prevent overlap

### Supported Port Types
- `image` - Image data
- `video` - Video data
- `audio` - Audio data
- `text` - Text/prompt data
- `style` - Style DNA data
- `character` - Character reference data
- `mesh3d` - 3D model data
- `any` - Matches any type

## Connection Actions ("Moments of Delight")

When nodes are connected, special context-aware actions are triggered:

1. **Creative DNA Fusion** - Merge creative elements from both sources
2. **Style Transplant** - Apply style from source to target
3. **Element Transfer** - Selective element transfer (colors, textures)
4. **Variation Bridge** - Generate spectrum between concepts
5. **Character Inject** - Place character into scene

## Key Design Decisions

### 1. React Flow for Canvas
- Infinite panning/zooming canvas
- Built-in node/edge management
- Minimap and controls
- Performance optimized for large graphs

### 2. Board Categories
Four distinct creative domains, each with specialized templates:
- **Fashion** - Garments, textiles, collections
- **Interior** - Rooms, mood boards, layouts
- **Stock** - Commercial photos, illustrations
- **Story** - Scenes, characters, narratives

### 3. Workflow-Based Execution
Cards don't execute immediately; they trigger multi-stage workflows:
1. Prompt enhancement (LLM)
2. Image generation (FLUX/Nano Banana)
3. Variation generation
4. Asset storage

### 4. Dual Model System
Parallel type systems for different contexts:
- `src/models/canvas.ts` - React Flow compatible types (Node taxonomy)
- `src/models/creativeCanvas.ts` - API/business logic types (Cards/Boards)

---

## Legacy Code Patterns (Reference)

> **Source:** Patterns extracted from `ssgp-v2-agents-ui-react` legacy codebase for consistency.

### Card Creation Pattern: API-First

**CRITICAL: All cards are backend entities from creation.**

When a node is dropped from the palette onto the canvas:
1. **Immediately call backend API** - `POST /api/creative-canvas/boards/{boardId}/cards`
2. **Update local React Flow state** with the API response
3. **No local-only cards** - Every card has a backend ID from moment of creation

```typescript
// CORRECT: Create card via API on drop
const handleNodeDrop = async (nodeData, position) => {
  const request: CreateCardRequest = {
    type: nodeData.nodeType,
    templateId: nodeData.id,
    position: { x: position.x, y: position.y },
    dimensions: { width: 320, height: 400 },
    title: nodeData.label,
    config: {
      nodeType: nodeData.nodeType,
      parameters: nodeData.parameters,
      inputs: nodeData.inputs,
      outputs: nodeData.outputs,
    },
  };

  // API call creates the card
  const response = await creativeCanvasService.cards.create(boardId, request);
  const newCard = normalizeCardFromApi(response.data);

  // Update local state with backend card
  setNodes((nds) => [...nds, cardToNode(newCard)]);
};
```

**Why this matters:**
- Workflow export/import works seamlessly (JSON contains real card IDs)
- Position updates persist correctly
- No distinction needed between "local" and "backend" cards
- Collaboration features will work out-of-the-box

### API Response Normalization

The backend API uses different field names than the UI models. Always normalize:

```typescript
// From legacy creativeCanvas.ts
export const normalizeCardFromApi = (apiCard: Record<string, unknown>): CanvasCard => {
  return {
    id: apiCard.id as string,
    type: apiCard.type as CardType,
    templateId: apiCard.templateId as string,
    position: apiCard.position as { x: number; y: number },
    dimensions: apiCard.dimensions as { width: number; height: number },
    title: (apiCard.title || apiCard.templateName) as string,
    prompt: apiCard.config?.basePrompt as string,
    isExpanded: apiCard.expanded as boolean,
    generatedImages: (apiCard.assets || []).map(a => a.previewUrl || a.fullResolutionUrl),
    workflow: apiCard.workflow,
    // ... other field mappings
  };
};
```

### Execution Pattern: Async Jobs with Polling

Node execution follows async job pattern:

```typescript
// 1. Trigger execution (returns immediately)
const jobResponse = await creativeCanvasService.cards.executeWorkflow(cardId, {
  startFromStage: 1,
  stageOverrides: { stage_3: { generationParams: { model: 'flux-2-pro' } } }
});

// 2. Poll for status (or use SignalR when available)
const pollStatus = async () => {
  const status = await creativeCanvasService.cards.getWorkflowStatus(cardId);
  updateNodeProgress(cardId, status.progress);

  if (status.status === 'completed') {
    updateNodeResult(cardId, status.result);
  } else if (status.status !== 'failed') {
    setTimeout(pollStatus, 2000); // Poll every 2 seconds
  }
};
```

### Connection Actions: Spawn Child Cards

When "Moments of Delight" actions execute, they create **new child cards**:

```typescript
const executeConnectionAction = async (actionType, sourceCard, targetCard) => {
  // Analyze images, generate fusion prompt
  const fusionPrompt = await generateFusionPrompt(sourceCard, targetCard, actionType);

  // Create NEW child cards for results (not modify existing)
  const childCards = await Promise.all(
    generatedImages.map((img, idx) =>
      creativeCanvasService.cards.create(boardId, {
        type: 'generated',
        position: calculateChildPosition(sourceCard, targetCard, idx),
        parentIds: [sourceCard.id, targetCard.id],
        generatedImages: [img],
      })
    )
  );

  // Add child cards to canvas
  setNodes((nds) => [...nds, ...childCards.map(cardToNode)]);
};
```

### Workflow Export/Import

Workflows are exported as JSON with all card data:

```typescript
const exportWorkflow = () => {
  const exportData = {
    board: currentBoard,
    cards: currentBoard.cards,
    edges: edges.map(e => ({ source: e.source, target: e.target, type: e.type })),
    exportedAt: new Date().toISOString(),
    version: '2.0',
  };

  // Download as JSON
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${currentBoard.name}-workflow.json`);
};

const importWorkflow = async (jsonData) => {
  // Re-create all cards via API (get new IDs)
  const cardIdMap = new Map<string, string>(); // old ID -> new ID

  for (const card of jsonData.cards) {
    const newCard = await creativeCanvasService.cards.create(boardId, {
      ...card,
      id: undefined, // Let API generate new ID
    });
    cardIdMap.set(card.id, newCard.id);
  }

  // Re-map edge connections
  const newEdges = jsonData.edges.map(e => ({
    source: cardIdMap.get(e.source),
    target: cardIdMap.get(e.target),
    type: e.type,
  }));
};
```

### Swatch/Tool Application

Swatches from the toolbar apply to **selected nodes**, not drop targets:

```typescript
const handleSwatchDrop = (swatchData) => {
  if (!selectedNode) {
    showToast('Select a node first to apply swatch');
    return;
  }

  // Apply keywords to node's prompt
  const currentPrompt = selectedNode.data.parameters?.prompt || '';
  const keywords = swatchData.promptKeywords.join(', ');
  const newPrompt = currentPrompt ? `${currentPrompt}, ${keywords}` : keywords;

  // Update via API
  await creativeCanvasService.cards.update(selectedNode.id, {
    config: { ...selectedNode.data.config, basePrompt: newPrompt }
  });

  // Update local state
  updateNodeData(selectedNode.id, { parameters: { prompt: newPrompt } });
};
```

## Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Infinite Canvas | ✅ Complete | React Flow integrated |
| Board CRUD | ✅ Complete | Full API integration |
| Card CRUD | ✅ Complete | Templates, positions |
| Workflow Execution | ✅ Complete | Multi-stage pipelines |
| Connection Actions | ✅ Complete | Service layer, image analysis |
| Node Palette | ✅ Complete | Drag-drop, tools tab |
| Node Inspector | ✅ Complete | Parameter editing, actions |
| Connection Validation | ✅ Complete | Port type checking |
| Video Generation | ✅ Complete | Kling 2.6, VEO 3.1, Avatar |
| Virtual Try-On | ✅ Complete | Multi-provider support |
| Clothes Swap | ✅ Complete | FLUX Kontext integration |
| Runway Animation | ✅ Complete | Fashion video generation |
| Character Lock | ✅ Complete | 7-ref identity preservation |
| Face Memory | ✅ Complete | 5-slot multi-character system |
| Element Library | ✅ Complete | Kling O1 video elements |
| Multi-Frame Nodes | ✅ Complete | Stacks, Queues, Grids |
| Enhancement Nodes | ✅ Complete | Upscaler, Prompt Enhancer |
| Auto-Connect on Drop | ✅ Complete | Port compatibility check |
| Creative Palette v3 | ✅ Complete | CREATE, STYLE, ASSETS tabs |
| Onboarding Flow | ✅ Complete | Persona selector + Workflow templates |
| Workflow Templates | ✅ Complete | 18 templates across 6 personas |
| 3D Generation | ❌ Not Started | Meshy/Tripo nodes |
| Real-time Updates | ❌ Not Started | SignalR integration |

## File Structure

```
src/
├── components/
│   ├── canvas/
│   │   └── CreativeCanvasStudio.tsx
│   ├── cards/                        # Creative Card System (v3.0)
│   │   ├── CreativeCard.tsx
│   │   ├── CardPreview.tsx
│   │   ├── CardControls.tsx
│   │   ├── QuickStyles.tsx
│   │   ├── ConnectionLine.tsx
│   │   ├── cardAnimations.ts
│   │   └── index.ts
│   ├── palette/                      # Creative Palette (v3.0)
│   │   ├── CreativePalette.tsx       # Main wrapper with tabs
│   │   ├── CreateTab.tsx             # Intent-based node categories
│   │   ├── StyleTab.tsx              # Style DNA, Heritage, Presets
│   │   ├── AssetsTab.tsx             # Recent, Collections, Characters
│   │   ├── paletteData.ts            # Categories, trending, search
│   │   └── index.ts
│   ├── agents/                       # Creative Collaborators (v3.0)
│   │   ├── AgentPresence.tsx
│   │   ├── AgentPanel.tsx
│   │   └── index.ts
│   ├── common/
│   │   └── VideoPreviewPlayer.tsx    # Reusable video player
│   ├── nodes/
│   │   ├── CanvasNode.tsx            # Card-based nodes
│   │   ├── FlowNode.tsx              # Generic workflow nodes
│   │   ├── VideoGenNode.tsx          # Kling 2.6 T2V/I2V
│   │   ├── VEOVideoNode.tsx          # VEO 3.1 video gen
│   │   ├── TalkingHeadNode.tsx       # Kling Avatar v2
│   │   ├── VirtualTryOnNode.tsx      # Multi-provider try-on
│   │   ├── ClothesSwapNode.tsx       # FLUX Kontext swap
│   │   ├── RunwayAnimationNode.tsx   # Fashion animation
│   │   ├── CharacterLockNode.tsx     # Character identity lock (7 refs)
│   │   ├── FaceMemoryNode.tsx        # 5-slot face memory system
│   │   └── ElementLibraryNode.tsx    # Kling O1 element library
│   └── panels/
│       ├── NodePalette.tsx
│       ├── NodeInspector.tsx
│       ├── BoardManager.tsx
│       ├── TemplateBrowser.tsx
│       └── ConnectionActionMenu.tsx
├── config/
│   └── nodeDefinitions.ts
├── models/
│   ├── canvas.ts
│   └── creativeCanvas.ts
├── services/
│   ├── api.ts
│   ├── creativeCanvasService.ts
│   ├── canvasToolbarService.ts       # Swatches, textiles, symbols
│   ├── videoGenerationService.ts     # Kling, VEO, Avatar APIs
│   ├── virtualTryOnService.ts        # Fashion try-on, swap, animation APIs
│   ├── connectionActionService.ts    # Moments of Delight fusion operations
│   └── characterConsistencyService.ts # Character lock, face memory, element library
├── stores/
│   └── canvasStore.ts
├── utils/
│   └── connectionValidation.ts       # Port type validation
├── App.tsx
├── main.tsx
└── theme.ts
```

## Storytelling Node Architecture (Planned Dec 2025)

> **Reference:** Full details in `docs/STORYTELLING_NODE_STRATEGY.md`

### Vision: Visual Story Orchestration

Transform Creative Canvas Studio into an innovative AI-powered storytelling platform by introducing:

- **Visual Story Architecture** - See entire narrative structure at a glance
- **AI-Powered Generation** - Create stories, characters, worlds with AI assistance
- **Modular Composition** - Connect story elements like building blocks
- **Branching Narratives** - Design choice-based interactive stories
- **Visual Storyboarding** - Auto-generate frames from written scenes

### New Node Categories

```typescript
export type NodeCategory =
  // ... existing categories
  | 'narrative'      // Story structure and generation
  | 'worldBuilding'  // Locations, lore, timelines
  | 'dialogue'       // Conversation and voice
  | 'branching';     // Interactive/choice-based
```

### New Port Types

```typescript
export type PortType =
  // ... existing types
  | 'story'        // Complete story/script object
  | 'scene'        // Individual scene data
  | 'plotPoint'    // Plot beat/event
  | 'location'     // Location/setting data
  | 'dialogue'     // Conversation/speech
  | 'treatment'    // Story treatment document
  | 'outline'      // Story outline/beat sheet
  | 'lore'         // World-building lore
  | 'timeline';    // Chronological events
```

### Node Library Overview

| Category | Nodes |
|----------|-------|
| **Narrative** | StoryGenesis, StoryStructure, TreatmentGenerator, SceneGenerator, PlotPoint, PlotTwist, ConflictGenerator, StoryPivot, IntrigueLift, StoryEnhancer |
| **Character** | CharacterCreator, CharacterRelationship, CharacterVoice, CharacterSheet |
| **World-Building** | LocationCreator, WorldLore, Timeline |
| **Dialogue** | DialogueGenerator, MonologueGenerator |
| **Branching** | ChoicePoint, ConsequenceTracker, PathMerge |
| **Visualization** | SceneVisualizer, ScreenplayFormatter |

### Story Framework Support

- Save the Cat (15 Beats)
- Hero's Journey (12 Stages)
- Three-Act Structure
- Five-Act Structure
- Story Circle (Dan Harmon)
- Freytag's Pyramid
- Kishotenketsu (4-Act)

### Competitive Advantages

1. **Visual Node-Based Workflow** - Unlike text-only tools, shows entire story structure visually
2. **AI + Structure** - Combines AI generation with proven story frameworks
3. **Character Consistency** - Integrates with existing character lock for visual consistency
4. **Branching Narratives** - First-class support for interactive fiction
5. **Multi-Format Output** - Generate novels, screenplays, games from same story data

---

## Future Architecture Considerations

1. **SignalR Hub** - Real-time workflow progress, collaboration
2. **Web Workers** - Offload image processing
3. **IndexedDB** - Local asset caching
4. **Virtualization** - Handle 100+ nodes efficiently
5. **Undo/Redo Stack** - Command pattern for canvas operations

---

## Elevated Vision Architecture (v3.0)

> **Reference:** Full details in `docs/CREATIVE_CANVAS_ELEVATED_VISION.md`

### Target User: Creative Entrepreneurs

The platform is designed for creators who want to:
- Create stunning AI-generated content
- Package and sell digital products
- Build consistent brand aesthetics
- Leverage cultural heritage (African textiles, Adinkra)

### Five Pillars of Elevation

1. **Inspiration-First Design** - Gallery of possibilities, recipe shelf, spark moments
2. **Creative Cards** - Visual-first node design with hero preview, craft mode, mini mode
3. **Creative Collaborators** - Agent personas (Muse, Curator, Architect, Packager, Heritage Guide)
4. **Creative Palette** - Three-tab system (Create, Style, Assets)
5. **Portfolio System** - Creator-to-seller pipeline with packaging wizard

### Creative Card Component Architecture

```
src/components/cards/
├── CreativeCard.tsx           # Main card container (3 modes)
├── CardPreview.tsx            # Hero preview with variations strip
├── CardControls.tsx           # Glassmorphic control overlay
├── CardCraftMode.tsx          # Expanded editing mode
├── CardMiniMode.tsx           # Collapsed thumbnail mode
├── QuickStyles.tsx            # One-click style buttons
└── CardAnimations.tsx         # Microinteraction definitions
```

### Card States & Modes

```typescript
type CardMode = 'hero' | 'craft' | 'mini';

type CardState =
  | 'empty'       // Waiting for content, animated invitation
  | 'generating'  // Shimmer animation, progress bar
  | 'complete'    // Celebration moment, result fade-in
  | 'error'       // Gentle error with suggestions
  | 'connected';  // Flow visualization active
```

### Agent Collaborator Architecture

```
src/services/agents/
├── AgentOrchestrator.ts       # Manages agent lifecycle
├── personas/
│   ├── MuseAgent.ts           # Creative spark generator
│   ├── CuratorAgent.ts        # Quality & consistency guardian
│   ├── ArchitectAgent.ts      # Workflow optimizer
│   ├── PackagerAgent.ts       # Export & marketplace specialist
│   └── HeritageGuideAgent.ts  # Cultural authenticity advisor
├── behaviors/
│   ├── proactiveTriggers.ts   # When agents speak up
│   └── dropBehaviors.ts       # Drag-drop responses
└── ui/
    ├── AgentPanel.tsx         # Slide-in interaction panel
    ├── AgentPresence.tsx      # Passive bottom-right presence
    └── AgentSuggestion.tsx    # Suggestion card component
```

### Portfolio System Architecture

```
src/features/portfolio/
├── PortfolioPanel.tsx         # Full portfolio view
├── CollectionManager.tsx      # Create/manage collections
├── ProductBundle.tsx          # Bundle creation wizard
├── ExportSettings.tsx         # Format/quality options
├── PricingSuggestion.tsx      # AI-powered pricing
└── MarketplaceIntegration.tsx # Gumroad, Etsy connectors

src/services/portfolio/
├── portfolioService.ts        # Portfolio CRUD
├── bundleService.ts           # Bundle creation
├── exportService.ts           # Multi-format export
└── marketplaceService.ts      # External platform APIs
```

### Design System Tokens

```css
/* Card Dimensions */
--card-mini-width: 200px;
--card-mini-height: 80px;
--card-default-width: 320px;
--card-default-height: 360px;
--card-expanded-width: 400px;
--card-expanded-height: 520px;

/* Preview Areas */
--preview-hero-ratio: 60%;
--preview-thumbnail-size: 48px;
--preview-variation-strip: 56px;

/* Borders & Effects */
--border-radius-card: 16px;
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
--shadow-card-hover: 0 8px 32px rgba(0, 0, 0, 0.4);

/* Animation Timing */
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-celebration: 800ms;
--ease-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55);
```

### Connection Visualization

```typescript
interface ConnectionStyle {
  type: 'standard' | 'active' | 'multi-ref' | 'style-dna' | 'character' | 'delight';
  color: string;      // Based on data type
  thickness: number;  // 1-4px based on importance
  animated: boolean;  // Dot flow animation
  glow: boolean;      // Active data flow
}
```

### Implementation Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| 1. Foundation Elevation | Creative Cards, Connection Lines | 2-3 weeks |
| 2. Agent Collaborators | Persona system, proactive triggers | 2-3 weeks |
| 3. Portfolio System | Collections, bundles, export | 2-3 weeks |
| 4. Inspiration Layer | Templates, trending, onboarding | 2-3 weeks |
| 5. Polish & Delight | Microinteractions, ambient details | 2 weeks |
