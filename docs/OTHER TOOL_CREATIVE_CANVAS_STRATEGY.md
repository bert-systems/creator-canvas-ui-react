# Creative Canvas Strategy - DeepVibe Nexus

**Version:** 1.0
**Date:** December 9, 2025
**Status:** Strategic Planning

---

## Executive Summary

The **Creative Canvas** (working name: "Flow Studio") is an infinity-board, node-based UX surface that serves as the orchestration layer for all DeepVibe Nexus creative studios. Rather than being "just another studio," it represents a paradigm shift—transforming discrete creative tools into composable, visual workflow building blocks that creative professionals can arrange, connect, and iterate on an infinite canvas.

This document synthesizes research from industry-leading node systems (ComfyUI, Houdini, TouchDesigner, Unreal Blueprints, Node-RED) with Nexus's existing architecture to propose a differentiated, production-ready implementation strategy.

---

## 1. Vision & Strategic Positioning

### 1.1 The Problem We're Solving

Current GenAI creative workflows suffer from:

1. **Tool Fragmentation**: Artists jump between 5-10 different tools/services to complete a project
2. **Hidden Dependencies**: The relationship between steps isn't visible—change one thing, break another
3. **Lost Context**: Moving between tools loses creative context (style, character, tone)
4. **Linear Thinking**: Most tools force sequential workflows; creativity is non-linear
5. **Prompt Engineering Overhead**: Each tool requires re-specifying context that should propagate

### 1.2 The Creative Canvas Solution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CREATIVE CANVAS PARADIGM                            │
│                                                                             │
│   Traditional Workflow:                                                     │
│   [Brief] → [Prompt] → [Generate] → [Edit] → [Upscale] → [Export]          │
│      ↑         ↑           ↑          ↑          ↑           ↑              │
│   (context lost at each step, manual re-entry required)                     │
│                                                                             │
│   Creative Canvas Workflow:                                                 │
│                                                                             │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐                           │
│   │ Character│────▶│  Scene   │────▶│  Video   │                           │
│   │   Ref    │     │   Gen    │     │   Gen    │                           │
│   └──────────┘     └──────────┘     └──────────┘                           │
│        │                 ▲               ▲                                  │
│        │           ┌─────┴─────┐         │                                  │
│        └──────────▶│   Style   │─────────┘                                  │
│                    │    DNA    │                                            │
│                    └───────────┘                                            │
│                                                                             │
│   (context flows through connections, changes propagate automatically)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Competitive Differentiation

| Feature | ComfyUI | Runway | Pika | Nexus Creative Canvas |
|---------|---------|--------|------|----------------------|
| Node-based workflow | ✅ | ❌ | ❌ | ✅ |
| Infinite canvas | ✅ | ❌ | ❌ | ✅ |
| Multi-model orchestration | ⚠️ SD only | ❌ | ❌ | ✅ All providers |
| Character consistency | ❌ | ⚠️ | ⚠️ | ✅ Native nodes |
| Style DNA propagation | ❌ | ❌ | ❌ | ✅ First-class |
| AI Agent assistance | ❌ | ❌ | ❌ | ✅ Drag-drop agents |
| Knowledge Graph integration | ❌ | ❌ | ❌ | ✅ Project context |
| Project management | ❌ | ⚠️ | ❌ | ✅ Full integration |
| Video + Image + 3D | ⚠️ | ⚠️ | ⚠️ | ✅ Unified |

**Key Differentiator**: Nexus is the only platform combining node-based visual workflows with integrated project management, knowledge graphs, and AI agent assistance.

---

## 2. Architecture Overview

### 2.1 Integration with Existing Nexus Architecture

The Creative Canvas sits as an **orchestration layer** above existing studios:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CREATIVE CANVAS                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Infinity Board (React Flow)                     │   │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐     │   │
│  │  │Node │──│Node │──│Node │──│Node │──│Node │──│Node │──│Node │     │   │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Scene     │ │  Composite  │ │  Animation  │ │    World    │
│   Studio    │ │   Studio    │ │   Studio    │ │   Studio    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
        │               │               │               │
        └───────────────┴───────────────┴───────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌─────────────┐         ┌─────────────┐
            │  Services   │         │  Knowledge  │
            │    Layer    │         │    Graph    │
            └─────────────┘         └─────────────┘
```

### 2.2 Technical Foundation

**Core Technologies:**
- **React Flow 1.0.3** - Already in package.json, provides node graph infrastructure
- **TanStack Query** - Node execution state, caching, polling (existing pattern)
- **SignalR** - Real-time collaboration and execution progress (existing)
- **Framer Motion** - Node animations and microinteractions (existing)

**New Components Required:**
```
src/
├── components/creative-canvas/
│   ├── Canvas.tsx                    # Main React Flow wrapper
│   ├── NodePalette.tsx               # Left sidebar node library
│   ├── NodeInspector.tsx             # Right sidebar property editor
│   ├── CanvasToolbar.tsx             # Top toolbar with agents
│   ├── CanvasMinimap.tsx             # Navigation minimap
│   ├── ConnectionLine.tsx            # Custom connection rendering
│   ├── nodes/                        # Node type components
│   │   ├── BaseNode.tsx              # Shared node UI shell
│   │   ├── InputNodes/
│   │   │   ├── ImageInputNode.tsx
│   │   │   ├── VideoInputNode.tsx
│   │   │   ├── TextPromptNode.tsx
│   │   │   ├── DocumentInputNode.tsx
│   │   │   └── KnowledgeQueryNode.tsx
│   │   ├── GenerationNodes/
│   │   │   ├── ImageGenNode.tsx
│   │   │   ├── VideoGenNode.tsx
│   │   │   ├── SceneGenNode.tsx
│   │   │   ├── CompositeGenNode.tsx
│   │   │   └── ThreeDGenNode.tsx
│   │   ├── ProcessingNodes/
│   │   │   ├── UpscaleNode.tsx
│   │   │   ├── InpaintNode.tsx
│   │   │   ├── StyleTransferNode.tsx
│   │   │   ├── CharacterLockNode.tsx
│   │   │   └── ColorGradeNode.tsx
│   │   ├── AgentNodes/
│   │   │   ├── PromptEngineerNode.tsx
│   │   │   ├── ScriptBreakdownNode.tsx
│   │   │   └── StyleAnalyzerNode.tsx
│   │   ├── OutputNodes/
│   │   │   ├── ExportNode.tsx
│   │   │   ├── AssetLibraryNode.tsx
│   │   │   └── DeliverableNode.tsx
│   │   └── LogicNodes/
│   │       ├── ConditionalNode.tsx
│   │       ├── BatchNode.tsx
│   │       └── MergeNode.tsx
│   └── index.ts
├── hooks/
│   └── useCreativeCanvas.ts          # Canvas state management
├── services/
│   └── creativeCanvas.ts             # Workflow persistence API
└── types/
    └── creativeCanvas.ts             # Type definitions
```

---

## 3. Node Taxonomy

### 3.1 Node Categories & Types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NODE TAXONOMY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📥 INPUT NODES (Purple)                                                    │
│  ├── Image Input         - Upload/select reference images                   │
│  ├── Video Input         - Upload/select video clips                        │
│  ├── Text Prompt         - Free-form text input                             │
│  ├── Document Input      - Scripts, briefs, PDFs                            │
│  ├── Knowledge Query     - Query project knowledge graph                    │
│  ├── Asset Browser       - Select from asset library                        │
│  └── Character Sheet     - Load character consistency pack                  │
│                                                                             │
│  🎨 GENERATION NODES (Blue = Image, Green = Video, Orange = 3D)            │
│  ├── Image Gen           - Text/image to image (Nano Banana, FLUX, etc.)   │
│  ├── Video Gen           - Text/image to video (Kling, Veo, Sora)          │
│  ├── Scene Composition   - Multi-reference scene assembly                   │
│  ├── Composite Stack     - Grid/stack batch generation                      │
│  ├── 3D Gen              - Image to 3D mesh (Meshy, Tripo)                 │
│  ├── Animation Gen       - I2V, T2V, interpolation                          │
│  └── Style Frame         - Reference-guided image generation                │
│                                                                             │
│  ⚙️ PROCESSING NODES (Yellow)                                              │
│  ├── Upscale             - Resolution enhancement                           │
│  ├── Inpaint             - Region editing/removal                           │
│  ├── Outpaint            - Canvas extension                                 │
│  ├── Style Transfer      - Apply style DNA to content                       │
│  ├── Character Lock      - Enforce character consistency                    │
│  ├── Color Grade         - LUT/color adjustment                             │
│  ├── Frame Interpolate   - Video smoothing                                  │
│  ├── Lip Sync            - Audio-driven animation                           │
│  └── Background Remove   - Segmentation/extraction                          │
│                                                                             │
│  🤖 AGENT NODES (Magenta - Nexus Differentiation)                          │
│  ├── Prompt Engineer     - Enhance/optimize prompts contextually            │
│  ├── Script Breakdown    - Extract entities from documents                  │
│  ├── Character Architect - Generate character sheets from description       │
│  ├── Style Analyzer      - Extract style DNA from references                │
│  ├── Scene Director      - Suggest shot compositions                        │
│  ├── Quality Guardian    - Review outputs for consistency                   │
│  └── Workflow Scout      - Suggest optimizations/new nodes                  │
│                                                                             │
│  📤 OUTPUT NODES (Cyan)                                                     │
│  ├── Preview             - Display result (auto-attached)                   │
│  ├── Export File         - Download as file                                 │
│  ├── Save to Library     - Add to project asset library                     │
│  ├── Create Deliverable  - Add to project deliverables                      │
│  └── Publish             - External sharing/integration                     │
│                                                                             │
│  🔀 LOGIC NODES (Gray)                                                      │
│  ├── Conditional         - If/then branching                                │
│  ├── Batch/Loop          - Process multiple inputs                          │
│  ├── Merge               - Combine multiple inputs                          │
│  ├── Split               - Divide output to multiple paths                  │
│  ├── Delay               - Timing control                                   │
│  └── Subflow             - Encapsulate node group as reusable node          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Types & Port Colors

Each port has a type that determines valid connections:

| Data Type | Port Color | Example Nodes |
|-----------|------------|---------------|
| Image | `#3B82F6` Blue | Image Gen, Upscale, Style Transfer |
| Video | `#22C55E` Green | Video Gen, Animation, Interpolate |
| Text | `#F59E0B` Orange | Prompt, Document, Knowledge Query |
| Audio | `#A855F7` Purple | Audio Gen, Lip Sync |
| 3D Model | `#EC4899` Pink | 3D Gen, World Studio |
| Style DNA | `#E80ADE` Magenta | Style Analyzer, Style Transfer |
| Character | `#8B5CF6` Violet | Character Sheet, Character Lock |
| Any | `#9CA3AF` Gray | Logic nodes, Preview |

**Connection Rules:**
- Same type → Direct connection (solid line)
- Compatible type → Conversion connection (dashed line with converter icon)
- Incompatible → Connection rejected with tooltip explanation

---

## 4. UX Design Specification

### 4.1 Canvas Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │  ▶ Run All │ ⏹ Stop │ ↩ Undo │ ↪ Redo │ 100% ▼ │    🪄 ⚙️ 🔍 🛡️    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│ ┌────────────┬────────────────────────────────────────────┬───────────────┐ │
│ │            │                                            │               │ │
│ │  PALETTE   │         INFINITE CANVAS                    │  INSPECTOR    │ │
│ │            │                                            │               │ │
│ │ ─────────  │    ┌─────┐      ┌─────┐      ┌─────┐      │  Node: Image  │ │
│ │ 📥 Input   │    │ Img │─────▶│Scene│─────▶│Video│      │  Gen          │ │
│ │   ├ Image  │    │Input│      │ Gen │      │ Gen │      │  ───────────  │ │
│ │   ├ Video  │    └─────┘      └─────┘      └─────┘      │  Model:       │ │
│ │   ├ Text   │         │           │                     │  [Nano ▼]     │ │
│ │   └ Doc    │         ▼           │                     │               │ │
│ │            │    ┌─────┐          │                     │  Prompt:      │ │
│ │ 🎨 Generate │    │Style│──────────┘                     │  [........]   │ │
│ │   ├ Image  │    │ DNA │                                │               │ │
│ │   ├ Video  │    └─────┘                                │  Resolution:  │ │
│ │   ├ Scene  │                                           │  [1024 ▼]     │ │
│ │   └ 3D     │                          ┌──────┐         │               │ │
│ │            │                          │Minimap│         │  [▶ Run Node] │ │
│ │ ⚙️ Process  │                          │ ○    │         │               │ │
│ │   ├ Upscale│                          └──────┘         │               │ │
│ │   ├ Inpaint│                                           │               │ │
│ │   └ Style  │                                           │               │ │
│ │            │                                           │               │ │
│ │ 🤖 Agents   │                                           │               │ │
│ │   ├ Prompt │                                           │               │ │
│ │   └ Style  │                                           │               │ │
│ │            │                                           │               │ │
│ └────────────┴────────────────────────────────────────────┴───────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Node Card Design

```
┌─────────────────────────────────────────┐
│ 🎨 Image Generation          ⚙️ ⋮      │  ← Header (colored by category)
├─────────────────────────────────────────┤
│                                         │
│  ○ Prompt (text)      Generated ●      │  ← Ports (left=in, right=out)
│  ○ Reference (img)                      │
│  ○ Style (style)                        │
│                                         │
├─────────────────────────────────────────┤
│  Model: [Nano Banana Pro    ▼]          │  ← Inline controls
│  Steps: [30  ] CFG: [7.5]               │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │                                 │   │  ← Preview thumbnail
│  │        [Generated Image]        │   │     (appears after execution)
│  │                                 │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ████████████░░░░░░░░ 65% Running...   │  ← Status bar (during execution)
└─────────────────────────────────────────┘
```

**Node States:**
- **Idle**: Default gray border
- **Selected**: Magenta border + glow
- **Running**: Pulsing blue border, progress bar visible
- **Complete**: Green checkmark badge, preview populated
- **Error**: Red border, warning icon, click for details
- **Locked**: Lock icon in header, prevents upstream changes

### 4.3 Microinteractions & Polish

#### Connection Creation
```
User drags from output port:
1. Port highlights with pulse animation
2. Compatible ports on other nodes glow (type-matched color)
3. Incompatible ports dim slightly
4. Connection line follows cursor with smooth bezier
5. On valid drop: line snaps with satisfying bounce
6. On invalid drop: line retracts with subtle shake
```

#### Node Execution Flow
```
When "Run" is triggered:
1. Upstream nodes activate in topological order
2. Active node border pulses blue
3. Progress fills node status bar
4. On complete: brief green flash, thumbnail fades in
5. Data flows visually along connection (animated dash pattern)
6. Downstream nodes auto-run if "auto-execute" enabled
```

#### Agent Drag-Drop
```
User drags agent from toolbar:
1. Agent icon follows cursor with slight trail
2. Compatible nodes highlight with sparkle effect
3. Drop on node: Agent panel slides in from right
4. Agent analyzes node context, streams suggestions
5. User accepts: Node updates with smooth transition
```

### 4.4 Keyboard Shortcuts

| Action | Shortcut | Context |
|--------|----------|---------|
| Delete node | `Delete` / `Backspace` | Node selected |
| Duplicate | `Ctrl/Cmd + D` | Node selected |
| Select all | `Ctrl/Cmd + A` | Canvas |
| Undo | `Ctrl/Cmd + Z` | Global |
| Redo | `Ctrl/Cmd + Shift + Z` | Global |
| Run selected | `Ctrl/Cmd + Enter` | Node selected |
| Run all | `Ctrl/Cmd + Shift + Enter` | Global |
| Zoom in | `Ctrl/Cmd + =` | Canvas |
| Zoom out | `Ctrl/Cmd + -` | Canvas |
| Fit view | `F` | Canvas |
| Toggle palette | `1` | Global |
| Toggle inspector | `2` | Global |
| Search nodes | `/` | Global |

---

## 5. Node-to-Studio Mapping

### 5.1 How Existing Studios Become Nodes

Each existing Nexus studio maps to one or more node types:

| Studio | Node Types | Integration Pattern |
|--------|------------|---------------------|
| **Scene Studio** | Scene Gen, Shot Sequence, Variation | Node wraps SceneStudio service |
| **Composite Studio** | Composite Gen, Stack Builder, Grid | Node wraps CompositeStudio service |
| **Style Studio** | Style Analyzer, Style Transfer, Style Mixer | Node wraps StyleStudio service |
| **Animation Studio** | Video Gen, I2V, T2V, Interpolate, Lip Sync | Node wraps AnimationStudio service |
| **World Studio** | 3D Gen, Character Builder, Environment | Node wraps WorldStudio service |
| **Training Forge** | Dataset Gen, LoRA Train (future) | Node wraps TrainingForge service |
| **Prompt Workbench** | Prompt Node with RAG, enhancement | Inline in nodes + Agent nodes |

### 5.2 Deep Linking: Canvas ↔ Studio

Users can "drill down" from a node into its full studio interface:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Canvas View                        │  Studio Detail View              │
│                                     │                                  │
│  ┌─────────┐                        │  ┌──────────────────────────┐   │
│  │ Scene   │ ──── Double-click ───▶ │  │   SCENE STUDIO (full)   │   │
│  │  Gen    │                        │  │   - Shot timeline        │   │
│  └─────────┘                        │  │   - Reference library    │   │
│                                     │  │   - Variation controls   │   │
│  ← Back to Canvas                   │  │   - Advanced settings    │   │
│                                     │  └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

This allows:
- **Quick edits**: Inline on canvas (prompt, model, basic settings)
- **Deep edits**: Full studio for complex configuration
- **Bi-directional sync**: Changes in studio reflect in node and vice versa

---

## 6. AI Agent Integration

### 6.1 Drag-Drop Agents

The toolbar contains draggable AI agent icons that can be dropped onto nodes or canvas areas:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI AGENTS TOOLBAR                                    │
│                                                                             │
│   🪄 Prompt    ⚙️ Workflow   🔍 Analyzer   🛡️ Quality   📋 Director        │
│   Engineer     Scout         (Style)       Guardian     (Scene)            │
│                                                                             │
│   Drag any agent onto a node or canvas area to invoke contextual help      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Agent Behaviors

| Agent | Drop Target | Behavior |
|-------|-------------|----------|
| **Prompt Engineer** | Any gen node | Analyzes prompt + connected context, suggests improvements |
| **Prompt Engineer** | Prompt text node | Rewrites/expands prompt based on project knowledge |
| **Workflow Scout** | Empty canvas | Suggests starter templates based on project type |
| **Workflow Scout** | Node group | Recommends optimizations, newer models, missing steps |
| **Style Analyzer** | Image input | Extracts Style DNA, creates Style node |
| **Style Analyzer** | Multiple images | Creates blended Style DNA node |
| **Quality Guardian** | Output node | Reviews for consistency, brand compliance |
| **Quality Guardian** | Full canvas | Audits entire workflow for issues |
| **Scene Director** | Document node | Suggests shot breakdown from script |
| **Scene Director** | Character nodes | Recommends scene compositions |

### 6.3 Agent Panel UI

When an agent is activated, a slide-in panel appears:

```
┌─────────────────────────────────────┐
│ 🪄 Prompt Engineer                × │
├─────────────────────────────────────┤
│                                     │
│ Analyzing context...                │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░ 45%           │
│                                     │
│ ───────────────────────────────────│
│                                     │
│ Current prompt:                     │
│ "A robot in a forest"               │
│                                     │
│ Suggested improvements:             │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✨ "A sleek chrome humanoid     │ │
│ │ robot standing in a sunlit     │ │
│ │ ancient redwood forest,        │ │
│ │ morning fog, volumetric light" │ │
│ │                                 │ │
│ │ [Apply] [Edit] [Regenerate]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Alt suggestions: [2] [3]            │
│                                     │
└─────────────────────────────────────┘
```

---

## 7. Workflow Persistence & Sharing

### 7.1 Workflow Data Model

```typescript
interface CanvasWorkflow {
  id: string;
  name: string;
  description?: string;
  projectId?: string;          // Link to project context
  clientId?: string;           // Client scope
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;

  // Canvas state
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };

  // Execution state
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'partial' | 'failed';

  // Metadata
  tags: string[];
  isTemplate: boolean;         // Can be used as starter
  isPublic: boolean;           // Shared in template gallery
  thumbnailUrl?: string;       // Preview image
}

interface CanvasNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;              // Type-specific config
  locked: boolean;
  collapsed: boolean;

  // Execution cache
  lastOutput?: unknown;
  lastRunAt?: string;
  lastRunDuration?: number;
}

interface CanvasEdge {
  id: string;
  source: string;              // Node ID
  sourceHandle: string;        // Port ID
  target: string;
  targetHandle: string;
  animated: boolean;           // Show flow animation
}
```

### 7.2 Template Gallery

Pre-built workflow templates accelerate common tasks:

| Template | Description | Nodes |
|----------|-------------|-------|
| **Character Sheet Generator** | Reference images → consistent character sheet | Image Input → Character Lock → Grid Gen → Export |
| **Style Transfer Pipeline** | Apply style to batch of images | Style Analyzer → Batch → Style Transfer → Export |
| **Script to Storyboard** | Document → shot breakdown → keyframes | Doc Input → Script Agent → Scene Gen × N → Sequence |
| **Product Photography** | Product image → multiple backgrounds | Image Input → Background Remove → Composite × N |
| **Video from Image** | Static image → animated video | Image Input → Character Lock → Video Gen → Upscale |

### 7.3 Version Control

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Workflow: "Brand Campaign Q4"                                              │
│                                                                             │
│  Versions:                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ v3 (current)  │ Dec 9, 2025 │ "Added video generation branch"      │   │
│  │ v2            │ Dec 8, 2025 │ "Refined style DNA settings"         │   │
│  │ v1            │ Dec 7, 2025 │ "Initial workflow"                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Compare v2 → v3]  [Restore v2]  [Create Branch]                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Phases

### Phase 1: Foundation (2-3 weeks)
**Goal**: Basic canvas with core node types

- [ ] Set up React Flow integration with custom theme
- [ ] Create `BaseNode` component with Nexus styling
- [ ] Implement node palette (left sidebar)
- [ ] Implement node inspector (right sidebar)
- [ ] Create 5 basic node types:
  - [ ] Image Input Node
  - [ ] Text Prompt Node
  - [ ] Image Generation Node (basic)
  - [ ] Preview Node
  - [ ] Export Node
- [ ] Basic connection validation
- [ ] Canvas zoom/pan controls
- [ ] Workflow save/load (local state first)

### Phase 2: Generation Integration (2-3 weeks)
**Goal**: Connect canvas to existing generation services

- [ ] Wire Image Gen Node to existing `useGeneration` hook
- [ ] Add execution state to nodes (running, complete, error)
- [ ] Implement node execution with progress tracking
- [ ] Add Video Gen Node (Animation Studio integration)
- [ ] Add Scene Gen Node (Scene Studio integration)
- [ ] Add Composite Node (Composite Studio integration)
- [ ] Result preview in nodes (thumbnails, video players)

### Phase 3: Context Propagation (2-3 weeks)
**Goal**: Implement the "magic" of context flowing through connections

- [ ] Style DNA extraction and propagation
- [ ] Character consistency lock nodes
- [ ] Knowledge Graph query nodes
- [ ] Cross-node prompt enhancement (context-aware)
- [ ] Locked constraints (style, character, settings)

### Phase 4: AI Agents (2-3 weeks)
**Goal**: Drag-drop agent assistance

- [ ] Agent toolbar UI
- [ ] Drag-drop interaction for agents
- [ ] Prompt Engineer agent integration
- [ ] Style Analyzer agent integration
- [ ] Quality Guardian agent (output review)
- [ ] Agent panel UI with suggestions

### Phase 5: Advanced Features (3-4 weeks)
**Goal**: Power user capabilities

- [ ] Logic nodes (conditional, batch, merge)
- [ ] Subflow/macro creation (group → reusable node)
- [ ] Template gallery and sharing
- [ ] Workflow versioning
- [ ] Real-time collaboration (SignalR)
- [ ] Deep-link to full studio views
- [ ] Keyboard shortcuts

### Phase 6: Polish & Optimization (2 weeks)
**Goal**: Production readiness

- [ ] Performance optimization for large graphs
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Mobile/tablet responsive adjustments
- [ ] Error handling and recovery
- [ ] Onboarding tour for new users
- [ ] Analytics integration

---

## 9. API Requirements

### 9.1 Backend Endpoints Needed

```
# Workflow CRUD
POST   /api/v1/canvas/workflows                    # Create workflow
GET    /api/v1/canvas/workflows                    # List workflows
GET    /api/v1/canvas/workflows/{id}               # Get workflow
PUT    /api/v1/canvas/workflows/{id}               # Update workflow
DELETE /api/v1/canvas/workflows/{id}               # Delete workflow

# Workflow execution
POST   /api/v1/canvas/workflows/{id}/run           # Run entire workflow
POST   /api/v1/canvas/workflows/{id}/run-node/{nodeId}  # Run single node
GET    /api/v1/canvas/workflows/{id}/status        # Get execution status
POST   /api/v1/canvas/workflows/{id}/stop          # Stop execution

# Templates
GET    /api/v1/canvas/templates                    # List templates
POST   /api/v1/canvas/templates                    # Publish workflow as template
GET    /api/v1/canvas/templates/{id}               # Get template
POST   /api/v1/canvas/templates/{id}/instantiate   # Create workflow from template

# Versions
GET    /api/v1/canvas/workflows/{id}/versions      # List versions
POST   /api/v1/canvas/workflows/{id}/versions      # Create version snapshot
GET    /api/v1/canvas/workflows/{id}/versions/{v}  # Get specific version
POST   /api/v1/canvas/workflows/{id}/versions/{v}/restore  # Restore version
```

### 9.2 SignalR Hub Events

```typescript
// Canvas collaboration hub
interface CanvasHubEvents {
  // Execution events
  NodeExecutionStarted: (workflowId: string, nodeId: string) => void;
  NodeExecutionProgress: (workflowId: string, nodeId: string, progress: number) => void;
  NodeExecutionComplete: (workflowId: string, nodeId: string, result: unknown) => void;
  NodeExecutionFailed: (workflowId: string, nodeId: string, error: string) => void;

  // Collaboration events (future)
  UserJoined: (workflowId: string, userId: string) => void;
  UserLeft: (workflowId: string, userId: string) => void;
  NodeUpdated: (workflowId: string, nodeId: string, changes: Partial<CanvasNode>) => void;
  CursorMoved: (workflowId: string, userId: string, position: {x: number, y: number}) => void;
}
```

---

## 10. Success Metrics

### 10.1 User Engagement KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Canvas adoption rate | 40% of active users | % users who create ≥1 workflow |
| Workflow complexity | Avg 8+ nodes | Average nodes per workflow |
| Time saved | 30% reduction | Time to complete multi-step project |
| Agent usage | 60% of sessions | % workflows using AI agents |
| Template usage | 25% from templates | % workflows started from template |

### 10.2 Quality KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Workflow success rate | >90% | % runs completing without error |
| Canvas performance | <100ms interactions | p95 latency for node operations |
| Error recovery | >80% | % errors resolved via agent help |

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| React Flow performance with large graphs | High | Medium | Virtualization, node collapsing, lazy loading |
| Complex learning curve | Medium | High | Onboarding wizard, templates, contextual hints |
| API cost explosion (many gen calls) | High | Medium | Execution budgets, preview/draft modes |
| Real-time collab complexity | Medium | Medium | Start single-user, add collab in Phase 5 |
| Scope creep in node types | Medium | High | Strict MVP node list, prioritize by usage data |

---

## 12. Appendix: Design Language

### 12.1 Color Palette (Node Categories)

```css
/* Node header colors */
--node-input: #8B5CF6;       /* Purple - Inputs */
--node-gen-image: #3B82F6;   /* Blue - Image generation */
--node-gen-video: #22C55E;   /* Green - Video generation */
--node-gen-3d: #F97316;      /* Orange - 3D generation */
--node-process: #EAB308;     /* Yellow - Processing */
--node-agent: #E80ADE;       /* Magenta - AI Agents */
--node-output: #06B6D4;      /* Cyan - Outputs */
--node-logic: #6B7280;       /* Gray - Logic */

/* Port colors (data types) */
--port-image: #3B82F6;
--port-video: #22C55E;
--port-text: #F59E0B;
--port-audio: #A855F7;
--port-3d: #EC4899;
--port-style: #E80ADE;
--port-character: #8B5CF6;
--port-any: #9CA3AF;
```

### 12.2 Node Dimensions

```css
/* Default node size */
--node-min-width: 180px;
--node-max-width: 320px;
--node-header-height: 32px;
--node-port-size: 12px;
--node-border-radius: 8px;
--node-preview-height: 120px;

/* Canvas grid */
--grid-size: 20px;
--snap-to-grid: true;
```

### 12.3 Animation Timing

```css
/* Microinteraction durations */
--transition-fast: 150ms;
--transition-normal: 250ms;
--transition-slow: 400ms;

/* Easings */
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 9, 2025 | Claude | Initial strategy document |

---

**Next Steps:**
1. Review with stakeholders
2. Create detailed API requirements document
3. Design Figma prototypes for node cards and interactions
4. Begin Phase 1 implementation

---

*"The Creative Canvas transforms the complexity of multi-model AI orchestration into visual building blocks that feel as natural as arranging sticky notes on a whiteboard—but with the power of a Hollywood VFX pipeline behind every connection."*
