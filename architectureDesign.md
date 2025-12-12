# Architecture Design - Creative Canvas Studio

**Last Updated:** December 11, 2025

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

- **CanvasNode.tsx** - Custom React Flow node for canvas cards
  - Displays card content with expand/collapse
  - Shows workflow status, progress indicators
  - Handles card execution and preview

### 3. Panel Components (`src/components/panels/`)

- **NodePalette.tsx** - Left sidebar with draggable node types
  - Two tabs: "Nodes" (all node definitions) and "Tools" (category-specific swatches)
  - Collapsible categories with node counts
  - Search/filter functionality
  - HTML5 drag-and-drop for nodes and swatches
  - Premium item badges

- **NodeInspector.tsx** - Right sidebar for node property editing
  - Dynamic parameter forms (text, number, slider, select, boolean, color, file)
  - Port visualization (inputs/outputs)
  - Status indicators with progress
  - Execute/Stop/Duplicate/Delete actions
  - Result preview for generated content

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
- **Output nodes** - Preview, Export

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
| 3D Generation | ❌ Not Started | Meshy/Tripo nodes |
| Real-time Updates | ❌ Not Started | SignalR integration |

## File Structure

```
src/
├── components/
│   ├── canvas/
│   │   └── CreativeCanvasStudio.tsx
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

## Future Architecture Considerations

1. **SignalR Hub** - Real-time workflow progress, collaboration
2. **Web Workers** - Offload image processing
3. **IndexedDB** - Local asset caching
4. **Virtualization** - Handle 100+ nodes efficiently
5. **Undo/Redo Stack** - Command pattern for canvas operations
