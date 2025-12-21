# Unified Node Architecture Strategy

**Created:** December 20, 2025
**Status:** PROPOSAL - Awaiting Review
**Priority:** HIGH - Architectural Foundation

---

## Executive Summary

The Creative Canvas Studio currently operates with **three parallel node systems** that cause architectural confusion, inconsistent behavior, and buggy code generation:

1. **CanvasNode** (Legacy) - Card-based, generic connection handles, no typed ports
2. **FlowNode** (Modern) - Typed ports, proper inputs/outputs, result preview
3. **CreativeCard** (v3.0) - Three-mode display, unclear usage pattern

This document proposes a **Unified Node Architecture** that consolidates all node types into a single, flexible system capable of handling all requirements while providing a dramatically improved Creative Palette UX.

---

## The Problem

### Current State: Three Incompatible Systems

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CURRENT: ARCHITECTURAL CHAOS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌────────────┐   │
│  │ CanvasNode  │    │  FlowNode   │    │CreativeCard │    │ 50+ Custom │   │
│  │  (Legacy)   │    │  (Modern)   │    │   (v3.0)    │    │   Nodes    │   │
│  ├─────────────┤    ├─────────────┤    ├─────────────┤    ├────────────┤   │
│  │• Generic    │    │• Typed ports│    │• Hero mode  │    │• Each has  │   │
│  │  handles    │    │• Port colors│    │• Craft mode │    │  own impl  │   │
│  │• CanvasCard │    │• Result     │    │• Mini mode  │    │• Duplicates│   │
│  │  data model │    │  preview    │    │• Glass UI   │    │  logic     │   │
│  │• No port    │    │• Status     │    │• Unclear    │    │• No shared │   │
│  │  validation │    │  animation  │    │  when used  │    │  base      │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └────────────┘   │
│         │                  │                  │                  │         │
│         └──────────────────┼──────────────────┼──────────────────┘         │
│                            │                  │                            │
│                            ▼                  ▼                            │
│              ┌─────────────────────────────────────────┐                   │
│              │    nodeTypes Map in CreativeCanvasStudio │                   │
│              │    53+ entries, inconsistent behavior    │                   │
│              └─────────────────────────────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pain Points

| Issue | Impact | Frequency |
|-------|--------|-----------|
| **Code generation confusion** | New nodes often buggy | Every new feature |
| **Inconsistent port handling** | Connections fail silently | Daily user friction |
| **Data model mismatch** | CanvasCard vs CanvasNodeData | API integration bugs |
| **Duplicate rendering logic** | 50+ node files with similar code | Maintenance nightmare |
| **Unclear system choice** | Developers don't know which to use | Onboarding friction |

---

## The Solution: Unified Node Architecture

### Design Principles

1. **One Node, All Capabilities** - Single flexible component handles all use cases
2. **Composition Over Inheritance** - Features added via slots/plugins, not subclasses
3. **Data-Driven Rendering** - NodeDefinition drives everything, no custom components needed
4. **Progressive Enhancement** - Simple nodes stay simple, complex nodes get complex
5. **Type Safety Throughout** - Typed ports enforced at every level

### Unified Node Component

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED NODE ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      UnifiedNode Component                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                    NODE HEADER                                │   │   │
│  │  │  [CategoryIcon] Label                    [Status] [⋮ Menu]   │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  ┌─────────┐  ┌──────────────────────────────────┐  ┌─────────┐   │   │
│  │  │         │  │                                  │  │         │   │   │
│  │  │  INPUT  │  │         CONTENT ZONE             │  │ OUTPUT  │   │   │
│  │  │  PORTS  │  │                                  │  │  PORTS  │   │   │
│  │  │         │  │  ┌────────────────────────────┐  │  │         │   │   │
│  │  │ ○ image │  │  │     PREVIEW SLOT           │  │  │ image ○ │   │   │
│  │  │ ○ text  │  │  │  (image/video/3D/text)     │  │  │ video ○ │   │   │
│  │  │ ○ style │  │  └────────────────────────────┘  │  │         │   │   │
│  │  │         │  │                                  │  │         │   │   │
│  │  │         │  │  ┌────────────────────────────┐  │  │         │   │   │
│  │  │         │  │  │     PARAMETER SLOT         │  │  │         │   │   │
│  │  │         │  │  │  (inline controls)         │  │  │         │   │   │
│  │  │         │  │  └────────────────────────────┘  │  │         │   │   │
│  │  │         │  │                                  │  │         │   │   │
│  │  └─────────┘  └──────────────────────────────────┘  └─────────┘   │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                    NODE FOOTER                                │   │   │
│  │  │  [Progress Bar]                    [Execute] [More ▼]        │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  DATA MODEL: UnifiedNodeData (single source of truth)                       │
│  RENDERING: Slot-based composition from NodeDefinition                      │
│  PORTS: Typed, validated, persisted to backend                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Unified Data Model

### UnifiedNodeData Interface

```typescript
/**
 * Single data model for ALL nodes in Creative Canvas Studio.
 * Replaces: CanvasCard, CanvasNodeData, CreativeCardData
 */
interface UnifiedNodeData {
  // === IDENTITY ===
  id: string;
  nodeType: NodeType;           // 'flux2Pro', 'virtualTryOn', 'storyGenesis', etc.
  category: NodeCategory;       // 'imageGen', 'fashion', 'narrative', etc.

  // === DISPLAY ===
  label: string;                // User-editable title
  displayMode: 'compact' | 'standard' | 'expanded';

  // === TYPED PORTS ===
  inputs: Port[];               // Typed input ports from definition
  outputs: Port[];              // Typed output ports from definition

  // === PARAMETERS ===
  parameters: Record<string, ParameterValue>;  // User-configured values

  // === EXECUTION STATE ===
  status: NodeStatus;           // 'idle' | 'queued' | 'running' | 'completed' | 'error'
  progress?: number;            // 0-100 for running nodes
  error?: string;               // Error message if failed

  // === RESULTS ===
  cachedOutput?: NodeOutput;    // Last execution result
  variations?: NodeOutput[];    // Alternative outputs (for selection)

  // === CONNECTIONS ===
  connectedInputs: Record<string, ConnectionInfo>;   // portId -> source info
  connectedOutputs: Record<string, ConnectionInfo[]>; // portId -> target info[]

  // === METADATA ===
  aiModel?: string;             // Selected AI model
  estimatedCost?: number;       // Estimated execution cost
  lastExecutedAt?: string;      // ISO timestamp
  executionDurationMs?: number; // How long execution took

  // === FLAGS ===
  isLocked?: boolean;           // Prevent changes
  isFavorite?: boolean;         // User marked as favorite
  isTemplate?: boolean;         // Can be saved as template
}

interface Port {
  id: string;
  name: string;
  type: PortType;
  required: boolean;
  multi: boolean;               // Accepts multiple connections
  description?: string;         // Tooltip text
}

interface NodeOutput {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d' | 'data';
  url?: string;                 // For media outputs
  text?: string;                // For text outputs
  data?: Record<string, any>;   // For structured data outputs
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  };
}

interface ConnectionInfo {
  nodeId: string;
  portId: string;
  portType: PortType;
}
```

### Port Type System (Consolidated)

```typescript
/**
 * Unified port type system with clear categories.
 */
type PortType =
  // === CORE MEDIA ===
  | 'image'
  | 'video'
  | 'audio'
  | 'text'
  | 'mesh3d'

  // === UNIVERSAL ===
  | 'any'           // Accepts anything

  // === FASHION DOMAIN ===
  | 'garment'       // Clothing item
  | 'fabric'        // Textile/material
  | 'pattern'       // Sewing pattern
  | 'model'         // Fashion model (person)
  | 'outfit'        // Complete outfit
  | 'lookbook'      // Lookbook page

  // === STORYTELLING DOMAIN ===
  | 'story'         // Complete story data
  | 'scene'         // Individual scene
  | 'character'     // Character profile
  | 'dialogue'      // Dialogue exchange
  | 'location'      // Setting/environment
  | 'plotPoint'     // Story beat

  // === STYLE SYSTEM ===
  | 'style'         // Style reference
  | 'styleDna'      // Brand style DNA
  | 'colorPalette'; // Color scheme

/**
 * Port compatibility matrix - defines what can connect to what.
 */
const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
  // Core types connect to themselves + any
  image: ['image', 'any'],
  video: ['video', 'any'],
  audio: ['audio', 'any'],
  text: ['text', 'any'],
  mesh3d: ['mesh3d', 'any'],
  any: ['image', 'video', 'audio', 'text', 'mesh3d', 'any', /* all types */],

  // Fashion types are image-compatible
  garment: ['garment', 'image', 'any'],
  fabric: ['fabric', 'image', 'any'],
  pattern: ['pattern', 'image', 'any'],
  model: ['model', 'image', 'character', 'any'],
  outfit: ['outfit', 'image', 'any'],
  lookbook: ['lookbook', 'image', 'any'],

  // Story types are text-compatible
  story: ['story', 'text', 'any'],
  scene: ['scene', 'text', 'any'],
  character: ['character', 'text', 'model', 'any'],
  dialogue: ['dialogue', 'text', 'any'],
  location: ['location', 'text', 'any'],
  plotPoint: ['plotPoint', 'scene', 'text', 'any'],

  // Style types
  style: ['style', 'image', 'any'],
  styleDna: ['styleDna', 'style', 'any'],
  colorPalette: ['colorPalette', 'any'],
};
```

---

## Display Mode System

Replace the three separate node systems with **three display modes** in one component:

### Mode Comparison

| Mode | When Used | Height | Preview | Parameters | Use Case |
|------|-----------|--------|---------|------------|----------|
| **Compact** | Overview, many nodes | 80-120px | Thumbnail only | Hidden | Workflow overview |
| **Standard** | Default working | 200-400px | Medium preview | Key params visible | Active editing |
| **Expanded** | Deep editing | 400-600px | Full preview | All params visible | Fine-tuning |

### Mode Switching

```typescript
// User can switch modes via:
// 1. Double-click node → cycle modes
// 2. Context menu → "View As" submenu
// 3. Global toggle → "Compact All" / "Expand All"
// 4. Keyboard: Ctrl+1/2/3 for modes

const handleModeChange = (nodeId: string, mode: DisplayMode) => {
  updateNode(nodeId, { displayMode: mode });

  // Adjust dimensions based on mode
  const dimensions = getModeDimensions(mode, nodeType);
  updateNodeDimensions(nodeId, dimensions);
};
```

### Visual Design Per Mode

```
COMPACT MODE (80px height)
┌─────────────────────────────────────────────────────────┐
│ ○ [Icon] Story Genesis                    [✓] image ○  │
│    "Hero's journey begins..."             [Running ◐]  │
└─────────────────────────────────────────────────────────┘

STANDARD MODE (280px height)
┌─────────────────────────────────────────────────────────┐
│ [🎭] Story Genesis                   [✓ Complete] [⋮]  │
├─────────────────────────────────────────────────────────┤
│ ○ idea    ┌──────────────────────────┐    story ○      │
│           │  [Preview Image/Text]    │                  │
│           │                          │                  │
│           └──────────────────────────┘                  │
├─────────────────────────────────────────────────────────┤
│ Genre: [Fantasy ▼]  Tone: [Epic ▼]                     │
├─────────────────────────────────────────────────────────┤
│ [████████████████████] 100%          [▶ Execute]       │
└─────────────────────────────────────────────────────────┘

EXPANDED MODE (500px+ height)
┌─────────────────────────────────────────────────────────┐
│ [🎭] Story Genesis                   [✓ Complete] [⋮]  │
├─────────────────────────────────────────────────────────┤
│ ○ idea    ┌──────────────────────────┐    story ○      │
│ ○ theme   │                          │   outline ○     │
│ ○ chars   │   [Large Preview Area]   │ treatment ○     │
│           │                          │                  │
│           │                          │                  │
│           └──────────────────────────┘                  │
├─────────────────────────────────────────────────────────┤
│ PARAMETERS                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Genre:     [Fantasy ▼]                              │ │
│ │ Tone:      [Epic ▼]                                 │ │
│ │ Length:    [Feature Film ▼]                         │ │
│ │ Framework: [Hero's Journey ▼]                       │ │
│ │ Audience:  [────●────────] General                  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ VARIATIONS (4 generated)                                │
│ [thumb1] [thumb2] [thumb3] [thumb4]                    │
├─────────────────────────────────────────────────────────┤
│ Model: gemini-2.5-flash  Cost: ~$0.02  Time: 3.2s      │
│ [████████████████████] 100%          [▶ Execute]       │
└─────────────────────────────────────────────────────────┘
```

---

## Slot-Based Composition

Instead of 50+ custom node components, use a **slot system** driven by NodeDefinition:

### Slot Types

```typescript
interface NodeSlotConfig {
  // Content area slots
  preview?: PreviewSlotConfig;      // Image/video/3D/text preview
  parameters?: ParameterSlotConfig; // Inline parameter controls
  variations?: VariationSlotConfig; // Thumbnail strip of alternatives

  // Header slots
  titleEditable?: boolean;          // Can user edit title inline?
  statusPosition?: 'header' | 'footer';

  // Footer slots
  actions?: ActionSlotConfig;       // Execute, download, etc.
  metadata?: MetadataSlotConfig;    // Model, cost, timing info

  // Special slots
  customContent?: React.ComponentType<CustomSlotProps>;  // Escape hatch
}

interface PreviewSlotConfig {
  type: 'image' | 'video' | 'audio' | 'text' | 'mesh3d' | 'gallery';
  aspectRatio?: '1:1' | '4:3' | '16:9' | '9:16' | 'auto';
  showZoom?: boolean;
  showDownload?: boolean;
  showVariations?: boolean;
}

interface ParameterSlotConfig {
  layout: 'inline' | 'grid' | 'accordion';
  visibleInModes: DisplayMode[];
  priorityParams?: string[];  // Which params show in compact view
}
```

### How Slots Replace Custom Nodes

**Before (50+ custom node files):**
```typescript
// src/components/nodes/VirtualTryOnNode.tsx (200+ lines)
// src/components/nodes/StoryGenesisNode.tsx (200+ lines)
// src/components/nodes/GarmentSketchNode.tsx (200+ lines)
// ... 47 more files ...
```

**After (slot configuration in nodeDefinitions.ts):**
```typescript
// nodeDefinitions.ts
{
  type: 'virtualTryOn',
  category: 'fashion',
  label: 'Virtual Try-On',

  // Slots define the UI without custom component
  slots: {
    preview: {
      type: 'image',
      aspectRatio: '3:4',
      showVariations: true,
    },
    parameters: {
      layout: 'inline',
      visibleInModes: ['standard', 'expanded'],
      priorityParams: ['provider', 'category'],
    },
    actions: {
      primary: 'execute',
      secondary: ['download', 'duplicate'],
    },
  },

  inputs: [
    { id: 'model', name: 'Model Photo', type: 'model', required: true },
    { id: 'garment', name: 'Garment', type: 'garment', required: true },
  ],
  outputs: [
    { id: 'result', name: 'Try-On Result', type: 'image' },
  ],
  parameters: [
    { id: 'provider', type: 'select', options: ['fashn', 'idm-vton', 'cat-vton'] },
    { id: 'category', type: 'select', options: ['tops', 'bottoms', 'dresses'] },
    { id: 'mode', type: 'select', options: ['quality', 'speed', 'balanced'] },
  ],
}
```

### Custom Content Escape Hatch

For truly unique nodes that need custom UI:

```typescript
{
  type: 'characterSheet',
  // ... standard config ...

  slots: {
    // Use custom component for the character grid
    customContent: CharacterSheetGrid,  // Only this part is custom

    // Standard slots for everything else
    parameters: { layout: 'accordion' },
    actions: { primary: 'execute' },
  },
}

// CharacterSheetGrid is a small, focused component:
const CharacterSheetGrid: React.FC<CustomSlotProps> = ({ data, onChange }) => {
  // Only handles the 3x3 character pose grid
  return (
    <Grid container spacing={1}>
      {POSES.map(pose => (
        <Grid item xs={4} key={pose}>
          <PoseCell pose={pose} image={data.poses?.[pose]} />
        </Grid>
      ))}
    </Grid>
  );
};
```

---

## Creative Palette UX Redesign

### Current Problems

1. **Horizontal scroll in trending** - Forces immediate scrolling in limited width
2. **Deep nesting** - Category → Subcategory → Node requires many clicks
3. **Search doesn't filter** - Shows count but categories remain unchanged
4. **No quick access** - Common nodes buried in hierarchy

### New Design: Vertical-First, Action-Oriented

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NEW CREATIVE PALETTE DESIGN                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ [🔍 What do you want to create?                              ] [⌫] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ QUICK ACTIONS ─────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  [📝 Text]  [🖼 Image]  [🎬 Video]  [👗 Try-On]  [✨ Enhance]       │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ RECENT (drag to canvas) ───────────────────────────────────────────┐   │
│  │  [thumb] [thumb] [thumb] [thumb]                      [View All →]  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  ┌─ BROWSE BY INTENT ──────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ▼ 📸 CREATE IMAGES                                           (12) │   │
│  │    ├─ [FLUX.2 Pro] [FLUX.2 Dev] [Recraft] [GPT Image]              │   │
│  │    └─ [Nano Banana Pro] [Kontext Edit] [Upscale] [+3 more]         │   │
│  │                                                                      │   │
│  │  ▶ 🎬 CREATE VIDEOS                                           (8)  │   │
│  │  ▶ 👗 FASHION DESIGN                                          (23) │   │
│  │  ▶ 📖 STORYTELLING                                            (24) │   │
│  │  ▶ 🧊 3D GENERATION                                           (4)  │   │
│  │  ▶ 🔧 UTILITIES                                               (8)  │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ STYLE & ASSETS ────────────────────────────────────────────────────┐   │
│  │  [🎨 Brand DNA]  [🌍 Heritage]  [📁 My Assets]                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key UX Improvements

#### 1. Quick Actions Row (Horizontal but Minimal)

```typescript
const QUICK_ACTIONS = [
  { id: 'text', icon: '📝', label: 'Text', nodeType: 'textInput' },
  { id: 'image', icon: '🖼', label: 'Image', nodeType: 'imageUpload' },
  { id: 'video', icon: '🎬', label: 'Video', nodeType: 'videoUpload' },
  { id: 'tryon', icon: '👗', label: 'Try-On', nodeType: 'virtualTryOn' },
  { id: 'enhance', icon: '✨', label: 'Enhance', nodeType: 'enhancePrompt' },
];

// These 5 fit in any reasonable width (5 × 56px = 280px)
// No horizontal scroll needed
```

#### 2. Remove Trending Section

The horizontal trending section is **removed** entirely. Instead:
- **Recent outputs** shows thumbnails of user's recent work
- **Popular workflows** moved to a separate "Templates" panel

#### 3. Flattened Category Structure

**Before:** Category → Subcategory → Nodes (3 levels)
**After:** Category → Nodes (2 levels, inline chips)

```tsx
// New: Inline node chips within category
<CategorySection title="📸 CREATE IMAGES" count={12}>
  <NodeChipGrid>
    <NodeChip nodeType="flux2Pro" label="FLUX.2 Pro" />
    <NodeChip nodeType="flux2Dev" label="FLUX.2 Dev" />
    <NodeChip nodeType="recraftV3" label="Recraft" />
    {/* Chips wrap naturally, no horizontal scroll */}
  </NodeChipGrid>
</CategorySection>
```

#### 4. Search Actually Filters

```typescript
// When user types in search:
// 1. Filter categories to only show matching nodes
// 2. Expand matching categories automatically
// 3. Highlight matching terms

const filteredCategories = useMemo(() => {
  if (!searchQuery) return INTENT_CATEGORIES;

  const matchedTypes = searchByCapability(searchQuery);

  return INTENT_CATEGORIES
    .map(cat => ({
      ...cat,
      // Only keep nodes that match
      nodes: cat.nodes.filter(n => matchedTypes.includes(n.type)),
      // Auto-expand if has matches
      expanded: true,
    }))
    .filter(cat => cat.nodes.length > 0);  // Hide empty categories
}, [searchQuery]);
```

#### 5. Single Panel (No Tabs)

Replace three tabs (CREATE, STYLE, ASSETS) with a **single scrollable panel**:
- Quick Actions at top
- Recent outputs
- Browse by Intent (expandable categories)
- Style & Assets as footer shortcuts (open separate panels)

This eliminates tab switching and reduces cognitive load.

---

## Toolbar & Menu System (Category-Aware)

The UI architecture includes **three toolbar/menu layers** that complement the Creative Palette (left) and Node Inspector (right):

### Complete UI Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TOP MENU BAR (Global)                                   │
│  [Logo] Creator's Toolbox    File  Edit  View  Canvas  Help    [User] [Settings]   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                         CONTEXT TOOLBAR (Board Category-Aware)                       │
│  Fashion Board: [👗Try-On][🔄Swap][🎬Runway][🎨Colorway][📐Pattern][📸E-com][📖Look]│
├────────────┬────────────────────────────────────────────────────────────┬───────────┤
│            │                                                            │           │
│  CREATIVE  │                                                            │   NODE    │
│  PALETTE   │                    INFINITE CANVAS                         │ INSPECTOR │
│            │                                                            │           │
│  [Search]  │     ┌─────────┐          ┌─────────┐                      │ [Props]   │
│            │     │  Node   │──────────│  Node   │                      │           │
│  Quick     │     └─────────┘          └─────────┘                      │ [Ports]   │
│  Actions   │                    │                                       │           │
│            │              ┌─────┴─────┐                                 │ [Actions] │
│  Browse    │              │   Node    │                                 │           │
│  by Intent │              └───────────┘                                 │ [Result]  │
│            │                                                            │           │
│  Style &   │    ┌─────────────────────────────────────────────┐        │           │
│  Assets    │    │         FLOATING TOOLBAR (Canvas)           │        │           │
│            │    │  [Zoom][Fit][Grid][Snap][Undo][Redo][More]  │        │           │
│            │    └─────────────────────────────────────────────┘        │           │
│            │                                                            │           │
├────────────┴────────────────────────────────────────────────────────────┴───────────┤
│                              STATUS BAR (Execution & Info)                           │
│  Board: "Spring Collection"  │  12 nodes  │  GPU: Ready  │  [▶ Run All] [Executing] │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Top Menu Bar (Global)

Always visible, provides global application commands:

```typescript
interface TopMenuBar {
  logo: 'Creator\'s Toolbox';

  menus: {
    file: [
      { label: 'New Board', shortcut: 'Ctrl+N', action: 'board.new' },
      { label: 'Open Board...', shortcut: 'Ctrl+O', action: 'board.open' },
      { label: 'Save', shortcut: 'Ctrl+S', action: 'board.save' },
      { divider: true },
      { label: 'Import Workflow...', action: 'workflow.import' },
      { label: 'Export Workflow...', action: 'workflow.export' },
      { divider: true },
      { label: 'Export Assets...', action: 'assets.export' },
    ],

    edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: 'history.undo' },
      { label: 'Redo', shortcut: 'Ctrl+Y', action: 'history.redo' },
      { divider: true },
      { label: 'Cut', shortcut: 'Ctrl+X', action: 'selection.cut' },
      { label: 'Copy', shortcut: 'Ctrl+C', action: 'selection.copy' },
      { label: 'Paste', shortcut: 'Ctrl+V', action: 'selection.paste' },
      { label: 'Duplicate', shortcut: 'Ctrl+D', action: 'selection.duplicate' },
      { label: 'Delete', shortcut: 'Del', action: 'selection.delete' },
      { divider: true },
      { label: 'Select All', shortcut: 'Ctrl+A', action: 'selection.all' },
    ],

    view: [
      { label: 'Zoom In', shortcut: 'Ctrl++', action: 'viewport.zoomIn' },
      { label: 'Zoom Out', shortcut: 'Ctrl+-', action: 'viewport.zoomOut' },
      { label: 'Fit to Screen', shortcut: 'Ctrl+0', action: 'viewport.fit' },
      { divider: true },
      { label: 'Show Grid', toggle: true, action: 'viewport.grid' },
      { label: 'Snap to Grid', toggle: true, action: 'viewport.snap' },
      { label: 'Show Minimap', toggle: true, action: 'viewport.minimap' },
      { divider: true },
      { label: 'Compact All Nodes', action: 'nodes.compactAll' },
      { label: 'Expand All Nodes', action: 'nodes.expandAll' },
    ],

    canvas: [
      { label: 'Run Selected', shortcut: 'Ctrl+Enter', action: 'execute.selected' },
      { label: 'Run All', shortcut: 'Ctrl+Shift+Enter', action: 'execute.all' },
      { label: 'Stop Execution', shortcut: 'Esc', action: 'execute.stop' },
      { divider: true },
      { label: 'Validate Connections', action: 'graph.validate' },
      { label: 'Auto-Layout', action: 'graph.autoLayout' },
      { label: 'Clear Canvas', action: 'graph.clear' },
    ],

    help: [
      { label: 'Keyboard Shortcuts', shortcut: '?', action: 'help.shortcuts' },
      { label: 'Documentation', action: 'help.docs' },
      { label: 'What\'s New', action: 'help.changelog' },
      { divider: true },
      { label: 'Report Issue', action: 'help.report' },
    ],
  };

  rightSection: [
    { type: 'userAvatar', action: 'user.menu' },
    { type: 'settingsButton', action: 'settings.open' },
  ];
}
```

### 2. Context Toolbar (Board Category-Aware)

**This is the key innovation** - toolbar changes based on the active board's category:

```typescript
interface ContextToolbar {
  // Toolbar adapts to board category
  boardCategory: 'fashion' | 'story' | 'interior' | 'stock';

  // Each category has domain-specific quick actions
  actions: ToolbarAction[];
}

// FASHION BOARD TOOLBAR
const FASHION_TOOLBAR: ToolbarAction[] = [
  { id: 'tryOn', icon: '👗', label: 'Try-On', nodeType: 'virtualTryOn', tooltip: 'Virtual Try-On' },
  { id: 'swap', icon: '🔄', label: 'Swap', nodeType: 'clothesSwap', tooltip: 'Clothes Swap' },
  { id: 'runway', icon: '🎬', label: 'Runway', nodeType: 'runwayAnimation', tooltip: 'Runway Animation' },
  { id: 'colorway', icon: '🎨', label: 'Colorway', nodeType: 'colorwayGenerator', tooltip: 'Generate Colorways' },
  { id: 'pattern', icon: '📐', label: 'Pattern', nodeType: 'patternGenerator', tooltip: 'Sewing Pattern' },
  { id: 'ecommerce', icon: '📸', label: 'E-com', nodeType: 'ecommerceShot', tooltip: 'E-commerce Photos' },
  { id: 'lookbook', icon: '📖', label: 'Lookbook', nodeType: 'lookbookGenerator', tooltip: 'Create Lookbook' },
  { id: 'collection', icon: '📦', label: 'Collection', nodeType: 'collectionBuilder', tooltip: 'Build Collection' },
];

// STORYTELLING BOARD TOOLBAR
const STORY_TOOLBAR: ToolbarAction[] = [
  { id: 'genesis', icon: '✨', label: 'Genesis', nodeType: 'storyGenesis', tooltip: 'Start New Story' },
  { id: 'character', icon: '👤', label: 'Character', nodeType: 'characterCreator', tooltip: 'Create Character' },
  { id: 'scene', icon: '🎬', label: 'Scene', nodeType: 'sceneGenerator', tooltip: 'Generate Scene' },
  { id: 'location', icon: '🏔', label: 'Location', nodeType: 'locationCreator', tooltip: 'Create Location' },
  { id: 'dialogue', icon: '💬', label: 'Dialogue', nodeType: 'dialogueGenerator', tooltip: 'Write Dialogue' },
  { id: 'twist', icon: '🔀', label: 'Twist', nodeType: 'plotTwist', tooltip: 'Add Plot Twist' },
  { id: 'lore', icon: '📜', label: 'Lore', nodeType: 'worldLore', tooltip: 'World Building' },
  { id: 'timeline', icon: '📅', label: 'Timeline', nodeType: 'storyTimeline', tooltip: 'Story Timeline' },
];

// INTERIOR BOARD TOOLBAR
const INTERIOR_TOOLBAR: ToolbarAction[] = [
  { id: 'room', icon: '🏠', label: 'Room', nodeType: 'roomGenerator', tooltip: 'Generate Room' },
  { id: 'style', icon: '🎨', label: 'Style', nodeType: 'interiorStyle', tooltip: 'Apply Style' },
  { id: 'lighting', icon: '💡', label: 'Lighting', nodeType: 'lightingAdjust', tooltip: 'Adjust Lighting' },
  { id: 'furniture', icon: '🛋', label: 'Furniture', nodeType: 'furniturePlace', tooltip: 'Place Furniture' },
  { id: 'materials', icon: '🧱', label: 'Materials', nodeType: 'materialSwap', tooltip: 'Swap Materials' },
  { id: 'tour', icon: '🎥', label: '360 Tour', nodeType: 'tour360', tooltip: 'Create 360 Tour' },
  { id: 'moodboard', icon: '📋', label: 'Moodboard', nodeType: 'moodboardCreate', tooltip: 'Create Moodboard' },
];

// STOCK/GENERAL BOARD TOOLBAR
const STOCK_TOOLBAR: ToolbarAction[] = [
  { id: 'fluxPro', icon: '⚡', label: 'FLUX Pro', nodeType: 'flux2Pro', tooltip: 'FLUX.2 Pro Generation' },
  { id: 'fluxDev', icon: '🔧', label: 'FLUX Dev', nodeType: 'flux2Dev', tooltip: 'FLUX.2 Dev + LoRA' },
  { id: 'recraft', icon: '✏️', label: 'Recraft', nodeType: 'recraftV3', tooltip: 'Recraft V3 (Text/Vector)' },
  { id: 'video', icon: '🎬', label: 'Video', nodeType: 'kling26Pro', tooltip: 'Kling 2.6 Video' },
  { id: 'mesh3d', icon: '🧊', label: '3D', nodeType: 'meshy6', tooltip: 'Image to 3D' },
  { id: 'upscale', icon: '🔍', label: 'Upscale', nodeType: 'upscaleImage', tooltip: '4x Upscale' },
  { id: 'enhance', icon: '✨', label: 'Enhance', nodeType: 'enhancePrompt', tooltip: 'Enhance Prompt' },
  { id: 'batch', icon: '📚', label: 'Batch', nodeType: 'batchGenerator', tooltip: 'Batch Generate' },
];

// Toolbar selection logic
const getContextToolbar = (boardCategory: BoardCategory): ToolbarAction[] => {
  switch (boardCategory) {
    case 'fashion': return FASHION_TOOLBAR;
    case 'story': return STORY_TOOLBAR;
    case 'interior': return INTERIOR_TOOLBAR;
    case 'stock':
    default: return STOCK_TOOLBAR;
  }
};
```

**Context Toolbar Visual Design:**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  FASHION BOARD                                                                       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │  [+ More ▼]   │
│  │ 👗  │ │ 🔄  │ │ 🎬  │ │ 🎨  │ │ 📐  │ │ 📸  │ │ 📖  │ │ 📦  │  │               │
│  │Try- │ │Swap │ │Run- │ │Color│ │Pat- │ │E-com│ │Look-│ │Coll-│  │               │
│  │ On  │ │     │ │ way │ │ way │ │tern │ │     │ │book │ │ect  │  │               │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │               │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│  STORYTELLING BOARD                                                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │  [+ More ▼]   │
│  │ ✨  │ │ 👤  │ │ 🎬  │ │ 🏔  │ │ 💬  │ │ 🔀  │ │ 📜  │ │ 📅  │  │               │
│  │Gene-│ │Char-│ │Scene│ │Loca-│ │Dial-│ │Twist│ │Lore │ │Time-│  │               │
│  │sis  │ │acter│ │     │ │tion │ │ogue │ │     │ │     │ │line │  │               │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3. Floating Toolbar (Canvas Controls)

Positioned at bottom-center of canvas, always accessible:

```typescript
interface FloatingToolbar {
  position: 'bottom-center';  // Floats above canvas

  sections: {
    // Viewport controls
    viewport: [
      { id: 'zoomIn', icon: 'ZoomIn', tooltip: 'Zoom In (Ctrl++)' },
      { id: 'zoomOut', icon: 'ZoomOut', tooltip: 'Zoom Out (Ctrl+-)' },
      { id: 'fitView', icon: 'FitScreen', tooltip: 'Fit to Screen (Ctrl+0)' },
      { id: 'zoomLevel', type: 'display', value: '100%' },  // Current zoom
    ],

    // Canvas options
    canvas: [
      { id: 'toggleGrid', icon: 'Grid', toggle: true, tooltip: 'Toggle Grid' },
      { id: 'toggleSnap', icon: 'Snap', toggle: true, tooltip: 'Snap to Grid' },
      { id: 'toggleMinimap', icon: 'Map', toggle: true, tooltip: 'Toggle Minimap' },
    ],

    // History
    history: [
      { id: 'undo', icon: 'Undo', tooltip: 'Undo (Ctrl+Z)', disabled: !canUndo },
      { id: 'redo', icon: 'Redo', tooltip: 'Redo (Ctrl+Y)', disabled: !canRedo },
    ],

    // Layout
    layout: [
      { id: 'autoLayout', icon: 'AutoLayout', tooltip: 'Auto-Layout Nodes' },
      { id: 'alignHorizontal', icon: 'AlignH', tooltip: 'Align Horizontally' },
      { id: 'alignVertical', icon: 'AlignV', tooltip: 'Align Vertically' },
    ],
  };
}
```

**Floating Toolbar Visual:**

```
                    ┌───────────────────────────────────────────────────────┐
                    │  [🔍+][🔍-][⬚] 100%  │  [⊞][⊡][🗺]  │  [↩][↪]  │  [⋮] │
                    └───────────────────────────────────────────────────────┘
```

### 4. Status Bar (Bottom)

Persistent information and global actions:

```typescript
interface StatusBar {
  position: 'bottom';

  sections: {
    // Board info
    boardInfo: {
      name: string;         // "Spring Collection"
      category: string;     // "Fashion"
      nodeCount: number;    // 12
      edgeCount: number;    // 8
    },

    // System status
    systemStatus: {
      gpuStatus: 'ready' | 'busy' | 'unavailable';
      apiStatus: 'connected' | 'disconnected';
      queueLength: number;
    },

    // Execution controls
    execution: {
      runAll: { label: 'Run All', shortcut: 'Ctrl+Shift+Enter' },
      stopAll: { label: 'Stop', shortcut: 'Esc' },
      currentStatus: 'idle' | 'running' | 'complete';
      progress?: { current: number; total: number };
    },
  };
}
```

**Status Bar Visual:**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 📋 Spring Collection (Fashion)  │  12 nodes • 8 connections  │  GPU: ✓  API: ✓    │
│                                                                [▶ Run All] [2/12]  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5. Right-Click Context Menus

Context-aware menus that appear on right-click:

```typescript
// Canvas context menu (right-click on empty canvas)
const CANVAS_CONTEXT_MENU = [
  { label: 'Add Node...', action: 'palette.open' },
  { divider: true },
  { label: 'Paste', shortcut: 'Ctrl+V', action: 'selection.paste' },
  { label: 'Select All', shortcut: 'Ctrl+A', action: 'selection.all' },
  { divider: true },
  { label: 'Fit View', action: 'viewport.fit' },
  { label: 'Toggle Grid', action: 'viewport.grid' },
];

// Node context menu (right-click on node)
const NODE_CONTEXT_MENU = [
  { label: 'Execute', shortcut: 'Enter', action: 'node.execute' },
  { divider: true },
  { label: 'Edit', action: 'node.edit' },
  { label: 'Duplicate', shortcut: 'Ctrl+D', action: 'node.duplicate' },
  { label: 'Delete', shortcut: 'Del', action: 'node.delete' },
  { divider: true },
  { label: 'View Mode', submenu: [
    { label: 'Compact', action: 'node.mode.compact' },
    { label: 'Standard', action: 'node.mode.standard' },
    { label: 'Expanded', action: 'node.mode.expanded' },
  ]},
  { divider: true },
  { label: 'Copy Output', action: 'node.copyOutput', disabled: !hasOutput },
  { label: 'Save as Template', action: 'node.saveTemplate' },
];

// Edge context menu (right-click on connection)
const EDGE_CONTEXT_MENU = [
  { label: 'Delete Connection', action: 'edge.delete' },
  { label: 'Trigger Fusion...', action: 'edge.fusion', icon: '✨' },  // Moment of Delight
];

// Multi-select context menu
const MULTISELECT_CONTEXT_MENU = [
  { label: 'Execute Selected', action: 'selection.execute' },
  { label: 'Group', action: 'selection.group' },
  { divider: true },
  { label: 'Duplicate All', action: 'selection.duplicate' },
  { label: 'Delete All', action: 'selection.delete' },
  { divider: true },
  { label: 'Align Horizontally', action: 'selection.alignH' },
  { label: 'Align Vertically', action: 'selection.alignV' },
  { label: 'Distribute Evenly', action: 'selection.distribute' },
];
```

### Toolbar Component Structure

```
src/components/toolbar/
├── TopMenuBar.tsx              # Global menu bar
├── ContextToolbar.tsx          # Category-aware toolbar
├── FloatingToolbar.tsx         # Canvas controls
├── StatusBar.tsx               # Bottom status
├── ContextMenu.tsx             # Right-click menus
├── toolbarConfig.ts            # All toolbar configurations
├── categoryToolbars.ts         # Per-category toolbar definitions
└── index.ts                    # Exports
```

### Keyboard Shortcuts Summary

| Category | Shortcut | Action |
|----------|----------|--------|
| **File** | Ctrl+N | New Board |
| | Ctrl+S | Save Board |
| | Ctrl+O | Open Board |
| **Edit** | Ctrl+Z | Undo |
| | Ctrl+Y | Redo |
| | Ctrl+C | Copy |
| | Ctrl+V | Paste |
| | Ctrl+D | Duplicate |
| | Del | Delete |
| | Ctrl+A | Select All |
| **View** | Ctrl++ | Zoom In |
| | Ctrl+- | Zoom Out |
| | Ctrl+0 | Fit to Screen |
| | G | Toggle Grid |
| | M | Toggle Minimap |
| **Canvas** | Enter | Execute Selected |
| | Ctrl+Enter | Execute Selected |
| | Ctrl+Shift+Enter | Execute All |
| | Esc | Stop Execution |
| **Nodes** | 1 | Compact Mode |
| | 2 | Standard Mode |
| | 3 | Expanded Mode |
| | Space | Toggle Expand/Collapse |
| **Help** | ? | Show Shortcuts |
| | F1 | Help |

---

## Migration Path

### Phase 1: Create UnifiedNode Component (Week 1-2)

1. Create `src/components/nodes/UnifiedNode.tsx`
2. Implement slot system with preview, parameters, actions slots
3. Support all three display modes
4. Test with 5 representative nodes (text input, image gen, try-on, story genesis, output)

### Phase 2: Migrate Node Definitions (Week 2-3)

1. Add `slots` configuration to `nodeDefinitions.ts`
2. Create slot type definitions
3. Define default slots per category
4. Map existing custom node UI to slot configs

### Phase 3: Update CreativeCanvasStudio (Week 3)

1. Register `unifiedNode` as the single node type
2. Update `nodeTypes` map to use UnifiedNode for all types
3. Update drop handler to create UnifiedNodeData
4. Update connection handlers

### Phase 4: New Creative Palette (Week 4)

1. Implement new vertical-first layout
2. Remove trending section, add quick actions
3. Implement actual search filtering
4. Add recent outputs section
5. Flatten category structure

### Phase 5: Deprecate Legacy (Week 5)

1. Remove CanvasNode.tsx, FlowNode.tsx, CreativeCard.tsx
2. Remove 50+ custom node components (keep slot escape hatches)
3. Clean up unused types and imports
4. Update documentation

### Phase 6: Testing & Polish (Week 6)

1. End-to-end testing of all node types
2. Performance optimization
3. Accessibility audit
4. User testing feedback

---

## File Structure After Migration

```
src/components/nodes/
├── UnifiedNode.tsx              # THE node component
├── UnifiedNode.types.ts         # Type definitions
├── slots/
│   ├── PreviewSlot.tsx          # Image/video/text/3D preview
│   ├── ParameterSlot.tsx        # Inline parameter controls
│   ├── VariationSlot.tsx        # Thumbnail variations
│   ├── ActionSlot.tsx           # Execute, download buttons
│   └── MetadataSlot.tsx         # Model, cost, timing
├── ports/
│   ├── PortHandle.tsx           # Single port handle
│   ├── PortGroup.tsx            # Input/output port column
│   └── portColors.ts            # Port type color mapping
├── customSlots/                  # Escape hatch components
│   ├── CharacterSheetGrid.tsx   # 3x3 character poses
│   ├── TimelineEditor.tsx       # Story timeline view
│   └── ColorwayGrid.tsx         # Color variation grid
└── index.ts                      # Exports UnifiedNode

src/components/palette/
├── CreativePalette.tsx          # Simplified single-panel
├── QuickActions.tsx             # Top action buttons
├── RecentOutputs.tsx            # Thumbnail strip
├── CategorySection.tsx          # Expandable category
├── NodeChip.tsx                 # Draggable node chip
├── StyleAssetLinks.tsx          # Bottom shortcut buttons
└── paletteData.ts               # Category & node data
```

**Reduction:** ~60 files → ~20 files

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Node component files | 53 | 15 |
| Lines of code in nodes/ | ~8,000 | ~2,500 |
| Bug reports (node-related) | High | Low |
| New node creation time | 2-4 hours | 15 minutes (config only) |
| Palette vertical scroll | Rare | Primary |
| Palette horizontal scroll | Required | Eliminated |

---

## Decision Points for Review

1. **Display modes**: Should we keep 3 modes or simplify to 2 (compact/expanded)?

2. **Quick actions**: Which 5 nodes should be in quick actions? Context-dependent per board?

3. **Search scope**: Should search also search parameters and descriptions?

4. **Recent outputs**: How many to show? Last 8? Last 4 per board?

5. **Style/Assets panels**: Keep as separate panels or integrate into main palette?

---

## Appendix: Current vs Unified Comparison

### Creating a New Node Type

**Current (Custom Component Required):**
```typescript
// 1. Create new file: src/components/nodes/NewNode.tsx (100+ lines)
// 2. Import in CreativeCanvasStudio.tsx
// 3. Add to nodeTypes map
// 4. Add type to canvas.ts NodeType union
// 5. Add definition to nodeDefinitions.ts
// 6. Test rendering, ports, execution...
// Time: 2-4 hours
```

**Unified (Config Only):**
```typescript
// 1. Add to nodeDefinitions.ts:
{
  type: 'newNode',
  category: 'imageGen',
  label: 'New Node',
  inputs: [...],
  outputs: [...],
  parameters: [...],
  slots: {
    preview: { type: 'image' },
    parameters: { layout: 'inline' },
  },
}
// 2. That's it. UnifiedNode handles everything.
// Time: 15 minutes
```

---

## Related Documents

- `architectureDesign.md` - Will be updated after approval
- `todo.md` - Migration tasks will be added
- `CREATIVE_CANVAS_ELEVATED_VISION.md` - Original v3.0 vision

---

**Prepared by:** Claude (AI Assistant)
**Review requested from:** User
**Next step:** Await approval before implementation
