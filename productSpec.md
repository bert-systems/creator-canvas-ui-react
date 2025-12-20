# Product Specification - Creative Canvas Studio

**Last Updated:** December 17, 2025
**Version:** 3.0

---

## Vision Statement

> *"Transform the complexity of multi-model AI orchestration into visual building blocks that feel as natural as arranging sticky notes on a whiteboard—but with the power of a Hollywood VFX pipeline behind every connection."*

---

## Product Overview

**Creative Canvas Studio** is an infinity-board, node-based orchestration platform that transforms discrete AI creative tools into composable, visual workflow building blocks. Users drag specialized nodes onto an infinite canvas, connect them to form data pipelines, and execute AI-powered creative workflows—all through an intuitive visual interface.

### Target Users

1. **Fashion Designers** - Creating collections, lookbooks, virtual try-ons
2. **Interior Designers** - Room visualization, mood boards, 360° tours
3. **Content Creators** - Stock imagery, social media content
4. **Storytellers** - Scene composition, character-consistent narratives
5. **Creative Agencies** - Multi-domain visual production

---

## Core Concepts

### 1. Boards

Workspaces categorized by creative domain:

| Category | Primary Use Cases | Key Features |
|----------|------------------|--------------|
| **Fashion** | Garments, textiles, collections | Virtual try-on, runway animation, African textiles |
| **Interior** | Room design, mood boards | Style transfer, 360° tours, time-of-day |
| **Stock** | Commercial photos, illustrations | Batch variations, model swap, animated stock |
| **Story** | Scenes, characters, narratives | Character lock, storyboard autopilot, dialogue |

### 2. Nodes

Visual blocks representing AI operations:

| Category | Examples | Color |
|----------|----------|-------|
| **Input** | Text, Image, Video, Audio uploads | Green (#22c55e) |
| **Image Gen** | FLUX.2 Pro/Dev, Nano Banana Pro | Blue (#3b82f6) |
| **Video Gen** | Kling 2.6, VEO 3.1, Kling Avatar | Purple (#8b5cf6) |
| **3D Gen** | Meshy 6, Tripo v2.5 | Orange (#f97316) |
| **Character** | Character Lock, Face Memory | Pink (#ec4899) |
| **Style** | Style DNA, Style Transfer, LoRA | Cyan (#06b6d4) |
| **Composite** | Virtual Try-On, Storyboard | Indigo (#6366f1) |
| **Output** | Preview, Export | Red (#ef4444) |

### 3. Connections

Data flows between nodes through typed ports:

| Port Type | Color | Compatible With |
|-----------|-------|-----------------|
| Image | Blue | Image-accepting ports |
| Video | Green | Video ports, frame extraction |
| Text | Orange | Universal prompt ports |
| Audio | Purple | Audio-specific ports |
| 3D Model | Pink | 3D processing nodes |
| Style DNA | Magenta | Style transfer nodes |
| Character | Violet | Character consistency nodes |
| Any | Gray | Logic nodes, Preview |

### 4. Moments of Delight

Context-aware actions triggered when nodes connect:

| Action | Description | Models Used |
|--------|-------------|-------------|
| **Creative DNA Fusion** | Merge creative elements | Nano Banana Pro |
| **Style Transplant** | Apply visual style | FLUX Redux |
| **Element Transfer** | Selective transfer (colors, textures) | Nano Banana Pro |
| **Variation Bridge** | Spectrum between concepts | Nano Banana Pro |
| **Character Inject** | Place character into scene | Nano Banana Pro |

---

## User Flows

### Flow 1: Fashion Design Board

```
1. Create Fashion Board
2. Add "Text Input" node → Enter garment description
3. Add "FLUX.2 Pro" node → Connect text
4. Add "Virtual Try-On" node → Connect generated image + model photo
5. Add "Runway Animation" node → Create catwalk video
6. Export final assets
```

### Flow 2: Story Scene with Character Consistency

```
1. Create Story Board
2. Add "Character Reference" node → Upload character photos (1-7)
3. Add "Character Lock" node → Create 5-face memory
4. Add multiple "Scene Card" nodes
5. Connect Character Lock to each scene → Character injected consistently
6. Add "Storyboard Autopilot" → Generate sequence
```

### Flow 3: Interior Design Visualization

```
1. Create Interior Board
2. Add "Image Upload" → Empty room photo
3. Add "Style DNA" → Reference interior style images
4. Add "Style Transfer" → Apply style to room
5. Add "360° Room Tour" → Generate walkthrough video
```

---

## Feature Matrix

### Implemented (v1.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Infinite Canvas | ✅ | React Flow integration |
| Board Categories | ✅ | Fashion, Interior, Stock, Story |
| Template Cards | ✅ | 10+ templates per category |
| Connection Actions | ✅ | 5 "Moments of Delight" |
| African Fashion Swatches | ✅ | 17 textiles, 10 Adinkra, 12 colors |
| Prompt Enhancement | ✅ | Agent-based LLM enhancement |
| Asset Library | ✅ | Generated image storage |
| Workflow Execution | ✅ | Multi-stage pipelines |

### Implemented (v2.0 - v3.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Node Palette | ✅ | CreativePalette v3 with CREATE/STYLE/ASSETS tabs |
| Node Inspector | ✅ | Model chooser, prompt enhancer, metadata display |
| Video Generation | ✅ | Kling 2.6, VEO 3.1, Kling Avatar |
| Virtual Try-On | ✅ | 5 providers (FASHN, IDM-VTON, CAT-VTON, Leffa, Kling-Kolors) |
| Character Consistency | ✅ | Character Lock (7 refs), Face Memory (5 slots), Element Library |
| Storytelling System | ✅ | 24 nodes across narrative, character, world-building, dialogue |
| Fashion System | ✅ | 23 nodes for design, textile, styling, photography, video |
| Creative Cards | ✅ | 3-mode cards (Hero, Craft, Mini) |
| Agent Collaborators | ✅ | 5 agents (Muse, Curator, Architect, Packager, Heritage Guide) |

### Implementing (v3.1 - Unified Node System)

| Feature | Status | Notes |
|---------|--------|-------|
| **Unified Node API** | 🔄 | Backend persistence for nodes with typed ports |
| **Typed Port System** | 🔄 | Full input/output persistence across page loads |
| **Edge API** | 🔄 | Backend persistence for connections with port IDs |
| **Connection Generation** | 🔄 | Backend API for "Moments of Delight" fusion |
| **Node Execution API** | 🔄 | Per-node execution with status tracking |
| **Batch Node Updates** | 🔄 | Efficient position/dimension syncing |
| **Port Compatibility API** | 🔄 | Server-side port type validation |
| **Node Templates API** | 🔄 | Backend-stored node definitions |

### Backlog (v4.0+)

| Feature | Priority | Phase |
|---------|----------|-------|
| 3D Generation | High | 5 |
| Portfolio System | High | 4 |
| Logic Nodes | Medium | 6 |
| Real-time Collaboration | Medium | 6 |

---

## Unified Node System (v3.1)

> **Migration:** December 2025 - Resolves the Card/Node architectural mismatch

### The Problem Solved

Previously, the system had two incompatible models:
- **Card System** (Backend): Simple workflow stages, no typed ports
- **Node System** (Frontend): Rich typed ports, parameters - but lost on page reload

### The Solution

The `creator-canvas-api` backend now provides full **Node** persistence:

| Capability | Before | After |
|------------|--------|-------|
| Typed Ports | Frontend-only, lost on reload | Persisted to backend |
| Parameters | Embedded in config blob | First-class entity |
| Connections | Basic source→target | Port-level: sourcePort→targetPort |
| Execution | Card workflow stages | Node-level with agent binding |
| Status | Card-level only | Per-node status + cached output |

### New API Capabilities

#### Node Operations
```
POST   /api/creative-canvas/boards/{boardId}/nodes     Create node with full schema
GET    /api/creative-canvas/boards/{boardId}/nodes     List all board nodes
GET    /api/creative-canvas/nodes/{nodeId}             Get node with ports
PUT    /api/creative-canvas/nodes/{nodeId}             Update node
DELETE /api/creative-canvas/nodes/{nodeId}             Delete node
POST   /api/creative-canvas/nodes/{nodeId}/execute     Execute single node
POST   /api/creative-canvas/nodes/{nodeId}/reset       Reset node state
PATCH  /api/creative-canvas/boards/{boardId}/nodes/batch  Batch update
```

#### Edge Operations
```
POST   /api/creative-canvas/boards/{boardId}/edges     Create typed edge
GET    /api/creative-canvas/boards/{boardId}/edges     List board edges
PUT    /api/creative-canvas/edges/{edgeId}             Update edge
DELETE /api/creative-canvas/edges/{edgeId}             Delete edge
```

#### Connection Actions
```
POST   /api/creative-canvas/connections/generate       Fusion image generation
GET    /api/creative-canvas/connections/models         Available fusion models
GET    /api/creative-canvas/port-types                 All port types
GET    /api/creative-canvas/port-types/compatible      Port compatibility check
```

### Data Models

**CanvasNode** (Backend Entity):
```typescript
{
  id: string;
  boardId: string;
  nodeType: string;        // "virtualTryOn", "storyGenesis", etc.
  category: string;        // "fashion", "narrative", etc.
  label: string;
  position: { x, y };
  dimensions: { width, height };
  inputs: NodePort[];      // ← NOW PERSISTED
  outputs: NodePort[];     // ← NOW PERSISTED
  parameters: {};          // ← NOW PERSISTED
  status: "idle" | "running" | "completed" | "error";
  lastExecution?: { startedAt, completedAt, durationMs, error };
  agentBinding?: { agentType, endpoint, config };
  cachedOutput?: {};       // Last execution result
}
```

**NodePort** (Typed Connection Point):
```typescript
{
  id: string;
  name: string;
  type: PortType;   // "image", "video", "garment", "story", etc.
  required: boolean;
  multi: boolean;   // Accepts multiple connections
}
```

**CanvasEdge** (Connection):
```typescript
{
  id: string;
  boardId: string;
  sourceNodeId: string;
  sourcePortId: string;    // ← Port-level connection
  targetNodeId: string;
  targetPortId: string;    // ← Port-level connection
  edgeType?: string;
  label?: string;
}
```

### User Benefits

1. **Persistence** - Nodes retain full configuration across page reloads
2. **Specialized UI** - Nodes render with correct components (VirtualTryOnNode, etc.)
3. **Port Validation** - Incompatible connections prevented at API level
4. **Per-Node Execution** - Execute individual nodes, not entire workflows
5. **Cached Results** - Previous outputs available without re-execution
6. **Collaboration-Ready** - Real-time sync via backend state

---

## AI Model Capabilities

### Image Generation

| Model | Resolution | Features | Cost |
|-------|------------|----------|------|
| FLUX.2 Pro | 4MP | 10 refs, commercial license | $$ |
| FLUX.2 Dev | 2MP | LoRA support, experimental | $ |
| Nano Banana Pro | 2K | 14 refs, 5-face memory | $$ |
| FLUX Kontext | 2K | Context-aware editing | $$ |

### Video Generation

| Model | Duration | Resolution | Audio |
|-------|----------|------------|-------|
| Kling 2.6 T2V | 5-10s | 1080p-4K | Native |
| Kling 2.6 I2V | 5-10s | 1080p | Optional |
| Kling O1 Ref2V | 5-10s | 1080p | No |
| VEO 3.1 | 8s | 1080p | Native |
| Kling Avatar | Variable | 1080p | Lip sync |

### 3D Generation

| Model | Output | Materials | Export |
|-------|--------|-----------|--------|
| Meshy 6 | High-poly | PBR | GLB, FBX, OBJ |
| Tripo v2.5 | Quad mesh | Basic | GLB, FBX |

---

## Success Metrics

| Metric | Target (6 months) | Measurement |
|--------|-------------------|-------------|
| Canvas adoption | 50% of active users | Users creating ≥1 workflow |
| Workflow complexity | Avg 8+ nodes | Average nodes per workflow |
| Video generation | 30% of workflows | Workflows with video nodes |
| Virtual try-on | 40% of fashion boards | Fashion boards using try-on |
| Character consistency | 60% of story boards | Story boards using char lock |
| Agent usage | 60% of sessions | Workflows using AI agents |
| Time saved | 40% reduction | Time to complete multi-step project |

---

## Competitive Differentiation

| Feature | ComfyUI | Runway | Creative Canvas |
|---------|---------|--------|-----------------|
| Node-based UI | ✅ | ❌ | ✅ |
| Fashion focus | ❌ | ⚠️ | ✅ |
| Character consistency | ⚠️ | ❌ | ✅ |
| African cultural assets | ❌ | ❌ | ✅ |
| Virtual try-on | ❌ | ❌ | ✅ |
| Multi-domain boards | ❌ | ❌ | ✅ |
| "Moments of Delight" | ❌ | ❌ | ✅ |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| React Flow performance | High | Virtualization, node collapsing |
| Video latency | High | Async jobs, progress indicators |
| API costs | High | Execution budgets, preview modes |
| Learning curve | Medium | Onboarding wizard, templates |

---

## Pricing Model (Future)

| Tier | Features | Price |
|------|----------|-------|
| **Free** | 5 boards, basic nodes, 100 generations/mo | $0 |
| **Pro** | Unlimited boards, all nodes, 1000 gen/mo | $29/mo |
| **Studio** | Team features, API access, 5000 gen/mo | $99/mo |
| **Enterprise** | Custom, on-prem option | Contact |

---

## Document References

- `docs/CREATIVE_CANVAS_STUDIO_ENHANCED_STRATEGY.md` - Full implementation roadmap
- `architectureDesign.md` - Technical architecture
- `techstack.md` - Technology stack
- `todo.md` - Current tasks and backlog
