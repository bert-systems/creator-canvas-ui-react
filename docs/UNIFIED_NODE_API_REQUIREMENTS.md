# Unified Node Architecture - API Requirements

**Created:** December 20, 2025
**Related:** `UNIFIED_NODE_ARCHITECTURE_STRATEGY.md`
**Status:** REQUIREMENTS - For API Team Review
**Priority:** HIGH

---

## Executive Summary

This document specifies the backend API requirements to support the **Unified Node Architecture** strategy. The API changes enable:

1. Single unified node data model replacing Card/FlowNode/CreativeCard
2. Full port persistence with type validation
3. Display mode support (compact/standard/expanded)
4. Connection state tracking
5. Category-aware toolbar configurations

---

## Part 1: New Project vs. Adapt Existing - Analysis

### Decision Required

Should we create an entirely new UI project or adapt the existing `creator-canvas-ui-react`?

### Option A: Adapt Existing Project

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        OPTION A: ADAPT EXISTING                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Approach: Incremental migration over 6-8 weeks                             │
│                                                                             │
│  Week 1-2: Create UnifiedNode component alongside existing                  │
│  Week 3-4: Migrate node definitions to slot configs                         │
│  Week 4-5: Switch CreativeCanvasStudio to use UnifiedNode                   │
│  Week 5-6: Implement new palette and toolbar                                │
│  Week 6-7: Remove legacy components                                         │
│  Week 7-8: Testing and polish                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Advantages:**
| Benefit | Impact |
|---------|--------|
| Existing features preserved | Board CRUD, connections, execution all work |
| API integrations intact | 15+ services already connected |
| User workflows preserved | No data migration needed |
| Incremental risk | Can rollback partial changes |
| Shared infrastructure | Theme, store, routing already set up |
| Faster time to feature parity | Don't rebuild working features |

**Disadvantages:**
| Risk | Mitigation |
|------|------------|
| Legacy code interference | Feature flags to isolate new code |
| Complex migration state | Clear phase gates |
| Testing complexity | Parallel testing of old/new |
| Technical debt accumulation | Strict cleanup phase |

**Estimated Effort:** 6-8 weeks

---

### Option B: New Greenfield Project

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        OPTION B: NEW PROJECT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Approach: Clean-slate implementation over 10-14 weeks                      │
│                                                                             │
│  Week 1-2: Project setup, design system, core types                         │
│  Week 3-4: UnifiedNode component and slot system                            │
│  Week 5-6: React Flow integration, canvas setup                             │
│  Week 7-8: Creative Palette and toolbars                                    │
│  Week 9-10: API service layer integration                                   │
│  Week 11-12: Node Inspector and execution                                   │
│  Week 13-14: Testing, polish, data migration                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Advantages:**
| Benefit | Impact |
|---------|--------|
| Clean architecture | No legacy patterns to work around |
| Modern tooling | Can use latest React 19 patterns |
| Optimized bundle | No dead code from old systems |
| Simpler codebase | Easier onboarding for new devs |
| Fresh design system | Consistent from day one |

**Disadvantages:**
| Risk | Impact |
|------|--------|
| Rebuild everything | Even working features need reimplementation |
| Longer timeline | 10-14 weeks vs 6-8 weeks |
| API service duplication | Must recreate 15+ service integrations |
| User disruption | Migration period with potential issues |
| Parallel maintenance | Must maintain old project during transition |
| Feature regression risk | May miss edge cases from current implementation |

**Estimated Effort:** 10-14 weeks

---

### Recommendation: **ADAPT EXISTING (Option A)**

**Rationale:**

1. **The core canvas works** - React Flow integration, board management, and execution pipeline are stable. These represent 40% of the codebase that doesn't need rewriting.

2. **API services are mature** - 15+ service files with proper typing, error handling, and integration. Recreating would be pure waste.

3. **The problem is isolated** - The architectural chaos is specifically in:
   - `src/components/nodes/` (50+ files) → Replace with 1 UnifiedNode
   - `src/components/cards/` (6 files) → Deprecate
   - `src/components/palette/` (5 files) → Replace with new design

   That's ~60 files to replace, not the entire project.

4. **Risk management** - With feature flags, we can:
   - Ship UnifiedNode for new boards while keeping legacy for existing
   - A/B test the new palette with real users
   - Rollback if issues arise

5. **Time to value** - 6-8 weeks vs 10-14 weeks. The business value is in the unified system, not in rebuilding working infrastructure.

### Migration Strategy for Option A

```typescript
// Feature flags for gradual migration
const FEATURE_FLAGS = {
  // Phase 1: New components available but not default
  UNIFIED_NODE_ENABLED: true,
  NEW_PALETTE_ENABLED: false,
  NEW_TOOLBAR_ENABLED: false,

  // Phase 2: New components as default for new boards
  UNIFIED_NODE_DEFAULT: false,

  // Phase 3: Legacy components deprecated
  LEGACY_NODES_DEPRECATED: false,
};

// Board-level flag for gradual migration
interface Board {
  // ...existing fields
  useUnifiedNodes?: boolean;  // New boards get this true
}
```

---

## Part 2: API Requirements

### 2.1 Unified Node Entity

Replace `CanvasCard` and `CanvasNode` with single `UnifiedNode` entity.

#### Schema: UnifiedNode

```typescript
interface UnifiedNode {
  // === IDENTITY ===
  id: string;                    // UUID
  boardId: string;               // Parent board
  nodeType: string;              // e.g., "flux2Pro", "virtualTryOn"
  category: string;              // e.g., "imageGen", "fashion", "narrative"

  // === DISPLAY ===
  label: string;                 // User-editable title
  displayMode: 'compact' | 'standard' | 'expanded';
  position: { x: number; y: number };
  dimensions: { width: number; height: number };

  // === TYPED PORTS ===
  inputs: NodePort[];
  outputs: NodePort[];

  // === PARAMETERS ===
  parameters: Record<string, any>;  // User-configured values

  // === EXECUTION STATE ===
  status: 'idle' | 'queued' | 'running' | 'completed' | 'error';
  progress?: number;             // 0-100
  error?: string;

  // === RESULTS ===
  cachedOutput?: NodeOutput;
  variations?: NodeOutput[];

  // === CONNECTIONS (Denormalized for quick access) ===
  connectedInputs: Record<string, ConnectionRef>;   // portId -> source
  connectedOutputs: Record<string, ConnectionRef[]>; // portId -> targets

  // === METADATA ===
  aiModel?: string;
  estimatedCost?: number;
  lastExecutedAt?: string;       // ISO timestamp
  executionDurationMs?: number;

  // === FLAGS ===
  isLocked: boolean;
  isFavorite: boolean;

  // === TIMESTAMPS ===
  createdAt: string;
  updatedAt: string;
}

interface NodePort {
  id: string;
  name: string;
  type: PortType;                // See port type enum
  required: boolean;
  multi: boolean;                // Accepts multiple connections
  description?: string;
}

interface NodeOutput {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d' | 'data';
  url?: string;
  text?: string;
  data?: Record<string, any>;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  };
}

interface ConnectionRef {
  nodeId: string;
  portId: string;
  portType: PortType;
}
```

#### Endpoint: Create Node

```
POST /api/creative-canvas/boards/{boardId}/nodes
```

**Request:**
```json
{
  "nodeType": "virtualTryOn",
  "category": "fashion",
  "label": "Virtual Try-On",
  "displayMode": "standard",
  "position": { "x": 100, "y": 200 },
  "dimensions": { "width": 320, "height": 400 },
  "inputs": [
    { "id": "model", "name": "Model Photo", "type": "model", "required": true, "multi": false },
    { "id": "garment", "name": "Garment", "type": "garment", "required": true, "multi": false }
  ],
  "outputs": [
    { "id": "result", "name": "Try-On Result", "type": "image" }
  ],
  "parameters": {
    "provider": "fashn",
    "category": "tops",
    "mode": "quality"
  },
  "aiModel": "fashn-vton"
}
```

**Response:**
```json
{
  "success": true,
  "node": {
    "id": "node-uuid-123",
    "boardId": "board-uuid-456",
    "nodeType": "virtualTryOn",
    "category": "fashion",
    "label": "Virtual Try-On",
    "displayMode": "standard",
    "position": { "x": 100, "y": 200 },
    "dimensions": { "width": 320, "height": 400 },
    "inputs": [...],
    "outputs": [...],
    "parameters": {...},
    "status": "idle",
    "connectedInputs": {},
    "connectedOutputs": {},
    "isLocked": false,
    "isFavorite": false,
    "createdAt": "2025-12-20T10:00:00Z",
    "updatedAt": "2025-12-20T10:00:00Z"
  }
}
```

#### Endpoint: List Board Nodes

```
GET /api/creative-canvas/boards/{boardId}/nodes
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `status` | string | Filter by execution status |
| `includeOutput` | boolean | Include cachedOutput in response |

**Response:**
```json
{
  "success": true,
  "nodes": [...],
  "count": 12
}
```

#### Endpoint: Get Single Node

```
GET /api/creative-canvas/nodes/{nodeId}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `includeOutput` | boolean | Include full cachedOutput |
| `includeVariations` | boolean | Include variation outputs |

#### Endpoint: Update Node

```
PUT /api/creative-canvas/nodes/{nodeId}
```

**Request (partial update supported):**
```json
{
  "label": "My Custom Try-On",
  "displayMode": "expanded",
  "position": { "x": 150, "y": 250 },
  "parameters": {
    "provider": "idm-vton"
  }
}
```

#### Endpoint: Batch Update Nodes

For efficient position updates during drag operations.

```
PATCH /api/creative-canvas/boards/{boardId}/nodes/batch
```

**Request:**
```json
{
  "updates": [
    { "nodeId": "node-1", "position": { "x": 100, "y": 200 } },
    { "nodeId": "node-2", "position": { "x": 300, "y": 200 } },
    { "nodeId": "node-3", "dimensions": { "width": 400, "height": 500 } }
  ]
}
```

#### Endpoint: Delete Node

```
DELETE /api/creative-canvas/nodes/{nodeId}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `deleteConnections` | boolean | Also delete connected edges (default: true) |

---

### 2.2 Edge/Connection Entity

#### Schema: CanvasEdge

```typescript
interface CanvasEdge {
  id: string;
  boardId: string;

  // Source
  sourceNodeId: string;
  sourcePortId: string;
  sourcePortType: PortType;

  // Target
  targetNodeId: string;
  targetPortId: string;
  targetPortType: PortType;

  // Visual
  edgeType?: 'default' | 'animated' | 'style' | 'character' | 'delight';
  label?: string;

  // Timestamps
  createdAt: string;
}
```

#### Endpoint: Create Edge

```
POST /api/creative-canvas/boards/{boardId}/edges
```

**Request:**
```json
{
  "sourceNodeId": "node-1",
  "sourcePortId": "result",
  "targetNodeId": "node-2",
  "targetPortId": "image",
  "edgeType": "default"
}
```

**Response:**
```json
{
  "success": true,
  "edge": {
    "id": "edge-uuid-789",
    "boardId": "board-uuid-456",
    "sourceNodeId": "node-1",
    "sourcePortId": "result",
    "sourcePortType": "image",
    "targetNodeId": "node-2",
    "targetPortId": "image",
    "targetPortType": "image",
    "edgeType": "default",
    "createdAt": "2025-12-20T10:05:00Z"
  },
  "validation": {
    "compatible": true
  }
}
```

**Error Response (Incompatible Ports):**
```json
{
  "success": false,
  "error": "PORT_INCOMPATIBLE",
  "message": "Cannot connect 'video' output to 'image' input",
  "details": {
    "sourcePortType": "video",
    "targetPortType": "image",
    "compatibleTypes": ["video", "any"]
  }
}
```

#### Endpoint: List Board Edges

```
GET /api/creative-canvas/boards/{boardId}/edges
```

#### Endpoint: Delete Edge

```
DELETE /api/creative-canvas/edges/{edgeId}
```

---

### 2.3 Port Type System

#### Endpoint: Get Port Types

```
GET /api/creative-canvas/port-types
```

**Response:**
```json
{
  "success": true,
  "portTypes": [
    {
      "type": "image",
      "category": "core",
      "color": "#3b82f6",
      "description": "Static images (PNG, JPG, WebP)",
      "compatibleWith": ["image", "any"]
    },
    {
      "type": "garment",
      "category": "fashion",
      "color": "#d946ef",
      "description": "Clothing item",
      "compatibleWith": ["garment", "image", "any"]
    },
    {
      "type": "story",
      "category": "storytelling",
      "color": "#10b981",
      "description": "Complete story data",
      "compatibleWith": ["story", "text", "any"]
    }
    // ... all port types
  ]
}
```

#### Endpoint: Check Port Compatibility

```
GET /api/creative-canvas/port-types/compatible
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `sourceType` | string | Source port type |
| `targetType` | string | Target port type |

**Response:**
```json
{
  "compatible": true,
  "sourceType": "garment",
  "targetType": "image",
  "reason": "garment is compatible with image"
}
```

---

### 2.4 Node Execution

#### Endpoint: Execute Single Node

```
POST /api/creative-canvas/nodes/{nodeId}/execute
```

**Request:**
```json
{
  "parameterOverrides": {
    "provider": "cat-vton"
  },
  "inputOverrides": {
    "model": "https://example.com/model.jpg"
  }
}
```

**Response (Sync execution):**
```json
{
  "success": true,
  "status": "completed",
  "output": {
    "type": "image",
    "url": "https://storage.example.com/result.jpg",
    "metadata": {
      "width": 1024,
      "height": 1536,
      "format": "jpeg"
    }
  },
  "execution": {
    "startedAt": "2025-12-20T10:10:00Z",
    "completedAt": "2025-12-20T10:10:05Z",
    "durationMs": 5000,
    "cost": 0.05
  }
}
```

**Response (Async execution):**
```json
{
  "success": true,
  "status": "queued",
  "jobId": "job-uuid-abc",
  "pollUrl": "/api/creative-canvas/nodes/node-123/execution/job-abc"
}
```

#### Endpoint: Get Execution Status

```
GET /api/creative-canvas/nodes/{nodeId}/execution/{jobId}
```

**Response:**
```json
{
  "jobId": "job-uuid-abc",
  "status": "running",
  "progress": 65,
  "stage": "Generating image...",
  "startedAt": "2025-12-20T10:10:00Z"
}
```

#### Endpoint: Execute Multiple Nodes (Batch)

```
POST /api/creative-canvas/boards/{boardId}/execute
```

**Request:**
```json
{
  "nodeIds": ["node-1", "node-2", "node-3"],
  "executionMode": "sequential" | "parallel" | "topological"
}
```

#### Endpoint: Cancel Execution

```
POST /api/creative-canvas/nodes/{nodeId}/execution/{jobId}/cancel
```

---

### 2.5 Node Templates

For slot-based node definitions stored on backend.

#### Schema: NodeTemplate

```typescript
interface NodeTemplate {
  id: string;
  nodeType: string;
  category: string;
  label: string;
  displayName: string;
  description: string;

  // Ports
  inputs: NodePort[];
  outputs: NodePort[];

  // Parameters
  parameters: ParameterDefinition[];

  // Slots (for UI rendering)
  slots: {
    preview?: PreviewSlotConfig;
    parameters?: ParameterSlotConfig;
    actions?: ActionSlotConfig;
    customContent?: string;  // Component name for escape hatch
  };

  // Execution
  aiModel?: string;
  agentBinding?: {
    agentType: string;
    endpoint: string;
  };

  // Metadata
  tier?: 'flagship' | 'production' | 'creative' | 'fast';
  estimatedCost?: number;
  tags: string[];

  // Timestamps
  version: string;
  updatedAt: string;
}

interface ParameterDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'slider' | 'color' | 'image';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];  // For select
  min?: number;  // For number/slider
  max?: number;
  step?: number;
  description?: string;
}
```

#### Endpoint: List Node Templates

```
GET /api/creative-canvas/templates
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `search` | string | Search by name, description, tags |

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "nodeType": "virtualTryOn",
      "category": "fashion",
      "label": "Virtual Try-On",
      "displayName": "AI Virtual Try-On",
      "description": "Try garments on model photos using AI",
      "inputs": [...],
      "outputs": [...],
      "parameters": [...],
      "slots": {
        "preview": { "type": "image", "aspectRatio": "3:4" },
        "parameters": { "layout": "inline", "priorityParams": ["provider"] }
      },
      "tier": "production",
      "tags": ["fashion", "try-on", "ai"]
    }
    // ... more templates
  ],
  "count": 53
}
```

#### Endpoint: Get Single Template

```
GET /api/creative-canvas/templates/{nodeType}
```

---

### 2.6 Category-Aware Toolbar Configuration

#### Schema: CategoryToolbar

```typescript
interface CategoryToolbar {
  category: BoardCategory;
  actions: ToolbarAction[];
}

interface ToolbarAction {
  id: string;
  icon: string;           // Emoji or icon name
  label: string;
  nodeType: string;       // Node to create on click
  tooltip: string;
  shortcut?: string;
  badge?: 'new' | 'pro';
}
```

#### Endpoint: Get Toolbar for Category

```
GET /api/creative-canvas/toolbars/{category}
```

**Response:**
```json
{
  "success": true,
  "category": "fashion",
  "toolbar": {
    "actions": [
      { "id": "tryOn", "icon": "👗", "label": "Try-On", "nodeType": "virtualTryOn", "tooltip": "Virtual Try-On" },
      { "id": "swap", "icon": "🔄", "label": "Swap", "nodeType": "clothesSwap", "tooltip": "Clothes Swap" },
      { "id": "runway", "icon": "🎬", "label": "Runway", "nodeType": "runwayAnimation", "tooltip": "Runway Animation" },
      { "id": "colorway", "icon": "🎨", "label": "Colorway", "nodeType": "colorwayGenerator", "tooltip": "Generate Colorways" },
      { "id": "pattern", "icon": "📐", "label": "Pattern", "nodeType": "patternGenerator", "tooltip": "Sewing Pattern" },
      { "id": "ecommerce", "icon": "📸", "label": "E-com", "nodeType": "ecommerceShot", "tooltip": "E-commerce Photos" },
      { "id": "lookbook", "icon": "📖", "label": "Lookbook", "nodeType": "lookbookGenerator", "tooltip": "Create Lookbook" },
      { "id": "collection", "icon": "📦", "label": "Collection", "nodeType": "collectionBuilder", "tooltip": "Build Collection" }
    ],
    "moreActions": [
      // Additional actions available in dropdown
    ]
  }
}
```

#### Endpoint: List All Toolbars

```
GET /api/creative-canvas/toolbars
```

---

### 2.7 Board Entity Updates

Extend existing Board entity to support unified nodes.

#### Updated Schema: Board

```typescript
interface Board {
  // ... existing fields ...

  // NEW: Node system flag
  useUnifiedNodes: boolean;      // true for new boards

  // NEW: Display preferences
  defaultDisplayMode: 'compact' | 'standard' | 'expanded';

  // NEW: Toolbar customization
  toolbarOverrides?: ToolbarAction[];  // User-customized toolbar

  // NEW: Quick stats (denormalized)
  stats: {
    nodeCount: number;
    edgeCount: number;
    executedCount: number;
    lastExecutedAt?: string;
  };
}
```

#### Endpoint: Get Board with Full Graph

```
GET /api/creative-canvas/boards/{boardId}/full
```

Returns board with all nodes and edges in single request.

**Response:**
```json
{
  "success": true,
  "board": {
    "id": "board-uuid",
    "name": "Spring Collection",
    "category": "fashion",
    "useUnifiedNodes": true,
    "stats": {
      "nodeCount": 12,
      "edgeCount": 8,
      "executedCount": 5
    }
  },
  "nodes": [...],
  "edges": [...],
  "toolbar": {...}
}
```

---

### 2.8 Graph Validation

#### Endpoint: Validate Graph

```
POST /api/creative-canvas/boards/{boardId}/validate
```

**Response:**
```json
{
  "success": true,
  "valid": false,
  "issues": [
    {
      "type": "MISSING_REQUIRED_INPUT",
      "severity": "error",
      "nodeId": "node-3",
      "portId": "garment",
      "message": "Required input 'Garment' is not connected"
    },
    {
      "type": "CYCLE_DETECTED",
      "severity": "error",
      "nodeIds": ["node-1", "node-2", "node-3"],
      "message": "Circular dependency detected"
    },
    {
      "type": "UNUSED_OUTPUT",
      "severity": "warning",
      "nodeId": "node-5",
      "portId": "result",
      "message": "Output 'result' is not connected to any downstream node"
    }
  ],
  "stats": {
    "totalNodes": 12,
    "connectedNodes": 10,
    "isolatedNodes": 2,
    "executionOrder": ["node-1", "node-2", "node-4", "node-3", "node-5"]
  }
}
```

---

### 2.9 WebSocket/SignalR Events

For real-time updates during execution.

#### Event: Node Status Changed

```json
{
  "event": "node.statusChanged",
  "data": {
    "boardId": "board-uuid",
    "nodeId": "node-uuid",
    "status": "running",
    "progress": 45,
    "stage": "Generating..."
  }
}
```

#### Event: Node Execution Complete

```json
{
  "event": "node.executionComplete",
  "data": {
    "boardId": "board-uuid",
    "nodeId": "node-uuid",
    "status": "completed",
    "output": {
      "type": "image",
      "url": "https://..."
    },
    "execution": {
      "durationMs": 5000,
      "cost": 0.05
    }
  }
}
```

#### Event: Connection Created

```json
{
  "event": "edge.created",
  "data": {
    "boardId": "board-uuid",
    "edge": {...}
  }
}
```

---

## Part 3: API Endpoint Summary

### Node Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/boards/{boardId}/nodes` | Create node |
| GET | `/boards/{boardId}/nodes` | List board nodes |
| GET | `/nodes/{nodeId}` | Get single node |
| PUT | `/nodes/{nodeId}` | Update node |
| PATCH | `/boards/{boardId}/nodes/batch` | Batch update |
| DELETE | `/nodes/{nodeId}` | Delete node |

### Edge Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/boards/{boardId}/edges` | Create edge |
| GET | `/boards/{boardId}/edges` | List board edges |
| DELETE | `/edges/{edgeId}` | Delete edge |

### Port Type Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/port-types` | List all port types |
| GET | `/port-types/compatible` | Check compatibility |

### Execution Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/nodes/{nodeId}/execute` | Execute single node |
| GET | `/nodes/{nodeId}/execution/{jobId}` | Get execution status |
| POST | `/boards/{boardId}/execute` | Execute multiple nodes |
| POST | `/nodes/{nodeId}/execution/{jobId}/cancel` | Cancel execution |

### Template Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates` | List all templates |
| GET | `/templates/{nodeType}` | Get single template |

### Toolbar Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/toolbars` | List all toolbars |
| GET | `/toolbars/{category}` | Get toolbar for category |

### Board Endpoints (Extended)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boards/{boardId}/full` | Get board with full graph |
| POST | `/boards/{boardId}/validate` | Validate graph |

---

## Part 4: Implementation Priority

### Phase 1: Core Node System (Required for MVP)

1. **UnifiedNode CRUD** - Create, read, update, delete nodes
2. **Edge CRUD** - Create, read, delete edges
3. **Port Compatibility** - Validate connections
4. **Node Templates** - Serve node definitions to frontend

### Phase 2: Execution System

1. **Single Node Execution** - Execute individual nodes
2. **Execution Status** - Poll for progress
3. **Batch Execution** - Execute multiple nodes

### Phase 3: Enhanced Features

1. **Graph Validation** - Full graph validation
2. **Category Toolbars** - Serve toolbar configurations
3. **WebSocket Events** - Real-time updates
4. **Board Stats** - Denormalized counts

### Phase 4: Optimization

1. **Batch Updates** - Efficient position syncing
2. **Full Graph Endpoint** - Single request for all data
3. **Caching** - Template and toolbar caching

---

## Part 5: Migration Considerations

### Database Changes

1. **New Tables:**
   - `unified_nodes` - Replaces `canvas_cards` for new boards
   - `node_ports` - Port definitions per node
   - `canvas_edges` - Enhanced edge table with port references

2. **Existing Tables:**
   - `canvas_cards` - Keep for legacy boards, add `migrated` flag
   - `boards` - Add `use_unified_nodes` column

### Data Migration

```sql
-- Migrate existing cards to unified nodes (optional, per-board)
INSERT INTO unified_nodes (id, board_id, node_type, ...)
SELECT id, board_id, template_type, ...
FROM canvas_cards
WHERE board_id = @boardId;

-- Mark board as migrated
UPDATE boards SET use_unified_nodes = true WHERE id = @boardId;
```

### API Versioning

Consider API versioning for breaking changes:
- `/api/v1/creative-canvas/...` - Legacy card-based
- `/api/v2/creative-canvas/...` - Unified node-based

Or use header-based versioning:
```
X-API-Version: 2
```

---

## Appendix: Port Type Reference

| Type | Category | Color | Compatible With |
|------|----------|-------|-----------------|
| `image` | core | #3b82f6 | image, any |
| `video` | core | #22c55e | video, any |
| `audio` | core | #a855f7 | audio, any |
| `text` | core | #f97316 | text, any |
| `mesh3d` | core | #ec4899 | mesh3d, any |
| `any` | core | #6b7280 | all types |
| `garment` | fashion | #d946ef | garment, image, any |
| `fabric` | fashion | #f59e0b | fabric, image, any |
| `pattern` | fashion | #84cc16 | pattern, image, any |
| `model` | fashion | #f472b6 | model, image, character, any |
| `outfit` | fashion | #8b5cf6 | outfit, image, any |
| `lookbook` | fashion | #06b6d4 | lookbook, image, any |
| `story` | storytelling | #10b981 | story, text, any |
| `scene` | storytelling | #84cc16 | scene, text, any |
| `character` | storytelling | #a78bfa | character, text, model, any |
| `dialogue` | storytelling | #f472b6 | dialogue, text, any |
| `location` | storytelling | #84cc16 | location, text, any |
| `plotPoint` | storytelling | #fbbf24 | plotPoint, scene, text, any |
| `style` | style | #06b6d4 | style, image, any |
| `styleDna` | style | #d946ef | styleDna, style, any |
| `colorPalette` | style | #f97316 | colorPalette, any |

---

**Document End**

*This document should be reviewed with the API team before implementation begins.*
