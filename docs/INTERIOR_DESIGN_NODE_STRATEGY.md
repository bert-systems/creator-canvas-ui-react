# Interior Design Node Strategy - Creative Canvas Studio

**Version:** 1.0
**Date:** December 15, 2025
**Status:** Strategic Planning

---

## Executive Summary

This document defines a comprehensive node-based workflow system for **Interior Design** within Creative Canvas Studio. The system enables designers, homeowners, real estate professionals, and architects to visualize, plan, and execute interior design projects through AI-powered generation pipelines.

### Key Innovations

1. **Space Context System** - Every node understands room dimensions, lighting, and existing elements
2. **Style DNA Architecture** - Consistent design language across all generated assets
3. **Dual Execution Pipeline** - LLM agents for design reasoning + Image/Video generators for visualization
4. **Material & Lighting Intelligence** - Physics-aware material rendering and lighting simulation
5. **Before/After Transformation** - Seamless renovation visualization workflows

---

## Part 1: Interior Design Context Architecture

### 1.1 The SpaceContext Object

Every interior design node receives and propagates a **SpaceContext** object that accumulates spatial and design knowledge:

```typescript
interface SpaceContext {
  // === SPATIAL DATA ===
  space: {
    id: string;
    name: string;
    type: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' |
          'dining' | 'hallway' | 'outdoor' | 'commercial' | 'custom';
    dimensions?: {
      width: number;      // feet or meters
      length: number;
      height: number;
      area: number;
      unit: 'feet' | 'meters';
    };
    existingElements: ExistingElement[];
    architecturalFeatures: ArchitecturalFeature[];
    naturalLight: NaturalLightData;
  };

  // === STYLE DNA ===
  style: {
    primary: DesignStyle;
    secondary?: DesignStyle;
    era?: 'contemporary' | 'vintage' | 'retro' | 'classic' | 'futuristic';
    mood: MoodProfile;
    colorPalette: ColorPalette;
    materialPreferences: MaterialPreference[];
  };

  // === FURNITURE & OBJECTS ===
  furniture: {
    pieces: FurniturePiece[];
    layout: LayoutData;
    scale: 'compact' | 'standard' | 'spacious' | 'grand';
    density: number;  // 0-1, how filled the space is
  };

  // === LIGHTING ===
  lighting: {
    natural: NaturalLightData;
    artificial: ArtificialLightSource[];
    ambiance: 'bright' | 'soft' | 'dramatic' | 'moody' | 'neutral';
    timeOfDay: 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  };

  // === MATERIALS LIBRARY ===
  materials: {
    flooring: MaterialData;
    walls: MaterialData;
    ceiling: MaterialData;
    accents: MaterialData[];
    textiles: TextileData[];
  };

  // === PROJECT DATA ===
  project: {
    budget?: BudgetRange;
    timeline?: string;
    constraints: string[];
    goals: string[];
    clientPreferences: string[];
  };

  // === GENERATED ASSETS ===
  assets: {
    moodBoards: string[];         // URLs
    renderings: RenderingData[];
    floorPlans: string[];
    elevations: string[];
    productLinks: ProductReference[];
  };

  // === METADATA ===
  generationHistory: GenerationRecord[];
}

// Supporting Types
interface DesignStyle {
  name: 'modern' | 'minimalist' | 'scandinavian' | 'industrial' | 'bohemian' |
        'mid-century' | 'contemporary' | 'traditional' | 'transitional' |
        'rustic' | 'coastal' | 'farmhouse' | 'art-deco' | 'japanese' |
        'mediterranean' | 'eclectic' | 'maximalist' | 'biophilic';
  intensity: number;  // 0-1, how strongly applied
  keywords: string[];
}

interface ExistingElement {
  id: string;
  type: 'window' | 'door' | 'column' | 'fireplace' | 'stairs' |
        'built-in' | 'fixture' | 'architectural';
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  mustKeep: boolean;
  description: string;
}

interface NaturalLightData {
  direction: 'north' | 'south' | 'east' | 'west' | 'skylight' | 'multiple';
  intensity: 'abundant' | 'moderate' | 'limited' | 'none';
  windowCount: number;
  windowTypes: string[];
}

interface MoodProfile {
  primary: 'cozy' | 'airy' | 'dramatic' | 'serene' | 'energetic' |
           'sophisticated' | 'playful' | 'zen' | 'romantic' | 'bold';
  warmth: number;      // -1 (cool) to 1 (warm)
  formality: number;   // 0 (casual) to 1 (formal)
  energy: number;      // 0 (calm) to 1 (vibrant)
}

interface FurniturePiece {
  id: string;
  type: string;
  style: string;
  material: string;
  color: string;
  position?: { x: number; y: number; rotation: number };
  dimensions?: { width: number; depth: number; height: number };
  productReference?: ProductReference;
  imageUrl?: string;
}

interface MaterialData {
  type: string;
  subtype: string;
  color: string;
  pattern?: string;
  texture?: string;
  finish: 'matte' | 'satin' | 'gloss' | 'textured' | 'natural';
  reflectivity: number;  // 0-1
}
```

### 1.2 Context Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        INTERIOR DESIGN CONTEXT FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────────┐                                                                │
│  │   SpaceScanner   │──┬── space data ──────────────────────────────────────────▶   │
│  │                  │  │                                                              │
│  │  IN: room photo  │  ├── dimensions ──────▶ FloorPlanGenerator ───────────────▶   │
│  │  IN: floor plan  │  │                                                              │
│  │                  │  ├── existing elements ─▶ RenovationPlanner ──────────────▶   │
│  │ OUT: SpaceContext│  │                                                              │
│  └──────────────────┘  └── natural light ────▶ LightingDesigner ────────────────▶   │
│                                                                                       │
│  ┌──────────────────┐                                                                │
│  │   StyleDefiner   │──┬── style DNA ──────────────────────────────────────────▶    │
│  │                  │  │                                                              │
│  │  IN: preferences │  ├── color palette ───▶ ColorHarmonizer ──────────────────▶   │
│  │  IN: inspiration │  │                                                              │
│  │                  │  ├── material prefs ──▶ MaterialLibrary ──────────────────▶   │
│  │ OUT: StyleContext│  │                                                              │
│  └──────────────────┘  └── mood profile ────▶ MoodBoardGenerator ───────────────▶   │
│                                                                                       │
│  CONTEXT ACCUMULATION:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ Space → Style → Materials → Furniture → Lighting → Render → Video/360      │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Dual Execution Architecture

### 2.1 Node Execution Pipeline

Each interior design node executes a multi-phase pipeline:

```typescript
interface InteriorNodeExecution {
  // Phase 1: Design Analysis & Reasoning (LLM)
  designAgents: DesignAgentCall[];

  // Phase 2: Layout & Spatial Planning (LLM + Rules)
  spatialPlanning?: SpatialPlanningCall[];

  // Phase 3: Material & Product Selection (LLM + Database)
  materialSelection?: MaterialSelectionCall[];

  // Phase 4: Image Generation
  imageGeneration?: ImageGenCall[];

  // Phase 5: Video/3D Generation (Optional)
  videoGeneration?: VideoGenCall[];
  threeDGeneration?: ThreeDGenCall[];

  // Phase 6: Context Update
  contextMutation: ContextUpdate;
}

interface DesignAgentCall {
  agentType: 'spatial-analyzer' | 'style-curator' | 'color-theorist' |
             'lighting-expert' | 'furniture-stylist' | 'material-specialist';
  endpoint: string;
  payload: Record<string, unknown>;
  outputMapping: OutputMapping;
}

interface ImageGenCall {
  model: 'flux-2-pro' | 'flux-kontext' | 'interior-specialized';
  promptSource: 'generated' | 'parameter' | 'context';
  style: {
    photorealism: number;      // 0-1
    architecturalAccuracy: number;
    lightingFidelity: number;
  };
  referenceImages?: string[];
  outputTarget: 'rendering' | 'moodBoard' | 'detail' | 'elevation' | 'floorPlan';
}
```

### 2.2 Execution Example: RoomComposer Node

```typescript
const roomComposerPipeline: InteriorNodeExecution = {
  // 1. Analyze space and generate design recommendations
  designAgents: [
    {
      agentType: 'spatial-analyzer',
      endpoint: '/api/agent/interior/analyze-space',
      payload: {
        spaceData: '${context.space}',
        stylePreferences: '${context.style}',
        constraints: '${context.project.constraints}',
        goals: '${context.project.goals}',
      },
      outputMapping: {
        'response.layoutRecommendations' -> 'internal.layouts',
        'response.furnitureSuggestions' -> 'internal.furniture',
        'response.designRationale' -> 'outputs.designBrief',
      }
    }
  ],

  // 2. Plan furniture layout
  spatialPlanning: [
    {
      type: 'furniture-layout',
      endpoint: '/api/agent/interior/plan-layout',
      payload: {
        roomDimensions: '${context.space.dimensions}',
        existingElements: '${context.space.existingElements}',
        furniturePieces: '${internal.furniture}',
        trafficFlow: '${parameters.trafficPriority}',
      },
      outputMapping: {
        'response.layout' -> 'outputs.layout',
        'response.floorPlan' -> 'outputs.floorPlanData',
      }
    }
  ],

  // 3. Generate room rendering
  imageGeneration: [
    {
      model: 'flux-2-pro',
      promptSource: 'generated',
      style: {
        photorealism: 0.95,
        architecturalAccuracy: 0.9,
        lightingFidelity: 0.85,
      },
      referenceImages: [
        '${inputs.existingRoomPhoto}',
        '${context.assets.moodBoards[0]}',
      ],
      outputTarget: 'rendering',
    }
  ],

  // 4. Optionally generate 360 view
  videoGeneration: [
    {
      condition: '${parameters.generate360}',
      model: 'kling-o1',
      type: 'room-spin',
      duration: 6,
      outputTarget: 'spin360',
    }
  ],

  // 5. Update context
  contextMutation: {
    set: {
      'context.furniture.layout': '${outputs.layout}',
      'context.furniture.pieces': '${internal.furniture}',
    },
    append: {
      'context.assets.renderings': '${outputs.rendering}',
      'context.assets.floorPlans': '${outputs.floorPlanData}',
    }
  }
};
```

---

## Part 3: Complete Port Type Ecosystem

### 3.1 Interior Design Port Types

```typescript
export type InteriorPortType =
  // === CONTEXT PORTS ===
  | 'spaceContext'       // Full accumulated SpaceContext
  | 'space'              // Room/space data only
  | 'styleProfile'       // Design style DNA
  | 'moodProfile'        // Atmosphere/mood data

  // === SPATIAL PORTS ===
  | 'dimensions'         // Room measurements
  | 'floorPlan'          // 2D floor plan data
  | 'elevation'          // Wall elevation data
  | 'layout'             // Furniture layout data
  | 'trafficFlow'        // Movement patterns

  // === MATERIAL PORTS ===
  | 'material'           // Single material specification
  | 'materialPalette'    // Collection of materials
  | 'textile'            // Fabric/textile data
  | 'finish'             // Surface finish data

  // === COLOR PORTS ===
  | 'colorPalette'       // Color scheme
  | 'colorHarmony'       // Color relationships
  | 'accentColor'        // Single accent color

  // === FURNITURE PORTS ===
  | 'furniture'          // Single furniture piece
  | 'furnitureSet'       // Collection of furniture
  | 'productReference'   // Real product link

  // === LIGHTING PORTS ===
  | 'lightingScheme'     // Complete lighting plan
  | 'lightSource'        // Single light source
  | 'naturalLight'       // Natural light data
  | 'ambiance'           // Lighting mood

  // === VISUAL PORTS ===
  | 'rendering'          // Generated room rendering
  | 'moodBoard'          // Mood board image
  | 'beforeImage'        // Before renovation photo
  | 'afterImage'         // After renovation rendering
  | 'detailShot'         // Close-up detail
  | 'spin360'            // 360 room video
  | 'walkthrough'        // Video walkthrough

  // === DOCUMENT PORTS ===
  | 'designBrief'        // Design rationale text
  | 'specSheet'          // Material specifications
  | 'shoppingList'       // Product list with links
  | 'costEstimate'       // Budget breakdown

  // === PRIMITIVE PORTS ===
  | 'image'              // Generic image
  | 'video'              // Generic video
  | 'text'               // Text content
  | 'prompt'             // Generation prompt
  | 'any';               // Universal connector
```

### 3.2 Port Compatibility Matrix

```
FROM ↓ / TO →        │ space │ render │ material │ furniture │ lighting │ video │
─────────────────────┼───────┼────────┼──────────┼───────────┼──────────┼───────┤
spaceContext         │   ✓   │   ✓    │    ✓     │     ✓     │    ✓     │   ✓   │
space                │   ✓   │   ✓    │    -     │     ✓     │    ✓     │   -   │
styleProfile         │   -   │   ✓    │    ✓     │     ✓     │    ✓     │   ✓   │
floorPlan            │   ✓   │   ✓    │    -     │     ✓     │    -     │   -   │
materialPalette      │   -   │   ✓    │    ✓     │     -     │    -     │   -   │
colorPalette         │   -   │   ✓    │    ✓     │     ✓     │    ✓     │   ✓   │
rendering            │   -   │   ✓    │    -     │     -     │    -     │   ✓   │
beforeImage          │   ✓   │   ✓    │    -     │     -     │    -     │   ✓   │
```

---

## Part 4: Complete Node Definitions

### 4.1 SPACE ANALYSIS NODES

#### SpaceScanner Node

```typescript
{
  type: 'spaceScanner',
  category: 'interior',
  label: 'Space Scanner',
  displayName: 'Analyze Room',
  description: 'Analyze a room from photo or floor plan to extract dimensions, features, and lighting',

  inputs: [
    { id: 'roomPhoto', name: 'Room Photo', type: 'image' },
    { id: 'floorPlan', name: 'Floor Plan', type: 'image' },
    { id: 'manualDimensions', name: 'Manual Dimensions', type: 'text' },
  ],

  outputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'space', name: 'Space Data', type: 'space' },
    { id: 'dimensions', name: 'Dimensions', type: 'dimensions' },
    { id: 'existingElements', name: 'Existing Elements', type: 'text' },
    { id: 'naturalLight', name: 'Natural Light Analysis', type: 'naturalLight' },
    { id: 'annotatedImage', name: 'Annotated Room', type: 'image' },
  ],

  execution: {
    designAgents: [
      {
        agentType: 'spatial-analyzer',
        endpoint: '/api/agent/interior/scan-space',
        payload: {
          image: '${inputs.roomPhoto || inputs.floorPlan}',
          manualInput: '${inputs.manualDimensions}',
          analysisDepth: '${parameters.analysisDepth}',
        }
      }
    ],
    imageGeneration: [
      {
        condition: '${parameters.generateAnnotation}',
        model: 'flux-kontext',
        type: 'annotation-overlay',
        outputTarget: 'annotatedImage',
      }
    ]
  },

  parameters: [
    { id: 'roomType', name: 'Room Type', type: 'select', default: 'living-room',
      options: [
        { label: 'Living Room', value: 'living-room' },
        { label: 'Bedroom', value: 'bedroom' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Bathroom', value: 'bathroom' },
        { label: 'Home Office', value: 'office' },
        { label: 'Dining Room', value: 'dining' },
        { label: 'Outdoor Space', value: 'outdoor' },
        { label: 'Commercial', value: 'commercial' },
      ]
    },
    { id: 'analysisDepth', name: 'Analysis Depth', type: 'select', default: 'standard',
      options: [
        { label: 'Quick Scan', value: 'quick' },
        { label: 'Standard', value: 'standard' },
        { label: 'Detailed', value: 'detailed' },
      ]
    },
    { id: 'generateAnnotation', name: 'Generate Annotated Image', type: 'boolean', default: true },
  ],
}
```

#### FloorPlanGenerator Node

```typescript
{
  type: 'floorPlanGenerator',
  category: 'interior',
  label: 'Floor Plan Generator',
  displayName: 'Create Floor Plan',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'roomPhoto', name: 'Room Photo', type: 'image' },
    { id: 'dimensions', name: 'Dimensions', type: 'dimensions' },
    { id: 'layout', name: 'Furniture Layout', type: 'layout' },
  ],

  outputs: [
    { id: 'floorPlan', name: 'Floor Plan', type: 'floorPlan' },
    { id: 'floorPlanImage', name: 'Floor Plan Image', type: 'image' },
    { id: 'dimensionedPlan', name: 'Dimensioned Plan', type: 'image' },
    { id: 'furnitureLayout', name: 'Furniture Layout', type: 'image' },
  ],

  parameters: [
    { id: 'style', name: 'Drawing Style', type: 'select', default: 'architectural',
      options: [
        { label: 'Architectural', value: 'architectural' },
        { label: 'Sketch', value: 'sketch' },
        { label: 'Minimal', value: 'minimal' },
        { label: '3D Isometric', value: 'isometric' },
      ]
    },
    { id: 'showDimensions', name: 'Show Dimensions', type: 'boolean', default: true },
    { id: 'showFurniture', name: 'Show Furniture', type: 'boolean', default: true },
    { id: 'scale', name: 'Scale', type: 'select', default: '1:50',
      options: [
        { label: '1:25', value: '1:25' },
        { label: '1:50', value: '1:50' },
        { label: '1:100', value: '1:100' },
      ]
    },
  ],
}
```

### 4.2 STYLE & MOOD NODES

#### StyleDefiner Node

```typescript
{
  type: 'styleDefiner',
  category: 'interior',
  label: 'Style Definer',
  displayName: 'Define Design Style',

  inputs: [
    { id: 'inspirationImages', name: 'Inspiration Images', type: 'image', multiple: true },
    { id: 'preferences', name: 'Style Preferences', type: 'text' },
    { id: 'existingFurniture', name: 'Existing Furniture', type: 'image', multiple: true },
  ],

  outputs: [
    { id: 'styleProfile', name: 'Style Profile', type: 'styleProfile' },
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    { id: 'materialPalette', name: 'Material Palette', type: 'materialPalette' },
    { id: 'moodProfile', name: 'Mood Profile', type: 'moodProfile' },
    { id: 'styleGuide', name: 'Style Guide Document', type: 'text' },
    { id: 'referenceBoard', name: 'Reference Board', type: 'image' },
  ],

  execution: {
    designAgents: [
      {
        agentType: 'style-curator',
        endpoint: '/api/agent/interior/define-style',
        payload: {
          inspirations: '${inputs.inspirationImages}',
          preferences: '${inputs.preferences}',
          existingPieces: '${inputs.existingFurniture}',
          primaryStyle: '${parameters.primaryStyle}',
          secondaryStyle: '${parameters.secondaryStyle}',
        }
      }
    ],
    imageGeneration: [
      {
        model: 'flux-2-pro',
        promptSource: 'generated',
        type: 'mood-board',
        outputTarget: 'referenceBoard',
      }
    ]
  },

  parameters: [
    { id: 'primaryStyle', name: 'Primary Style', type: 'select', default: 'modern',
      options: [
        { label: 'Modern', value: 'modern' },
        { label: 'Minimalist', value: 'minimalist' },
        { label: 'Scandinavian', value: 'scandinavian' },
        { label: 'Industrial', value: 'industrial' },
        { label: 'Bohemian', value: 'bohemian' },
        { label: 'Mid-Century Modern', value: 'mid-century' },
        { label: 'Contemporary', value: 'contemporary' },
        { label: 'Traditional', value: 'traditional' },
        { label: 'Transitional', value: 'transitional' },
        { label: 'Rustic', value: 'rustic' },
        { label: 'Coastal', value: 'coastal' },
        { label: 'Farmhouse', value: 'farmhouse' },
        { label: 'Art Deco', value: 'art-deco' },
        { label: 'Japanese/Zen', value: 'japanese' },
        { label: 'Mediterranean', value: 'mediterranean' },
        { label: 'Eclectic', value: 'eclectic' },
        { label: 'Maximalist', value: 'maximalist' },
        { label: 'Biophilic', value: 'biophilic' },
      ]
    },
    { id: 'secondaryStyle', name: 'Secondary Style', type: 'select', default: 'none' },
    { id: 'styleIntensity', name: 'Style Intensity', type: 'slider', default: 0.7, min: 0, max: 1 },
  ],
}
```

#### MoodBoardGenerator Node

```typescript
{
  type: 'moodBoardGenerator',
  category: 'interior',
  label: 'Mood Board Generator',
  displayName: 'Create Mood Board',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'styleProfile', name: 'Style Profile', type: 'styleProfile' },
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    { id: 'inspirationImages', name: 'Inspiration', type: 'image', multiple: true },
    { id: 'materials', name: 'Materials', type: 'materialPalette' },
  ],

  outputs: [
    { id: 'moodBoard', name: 'Mood Board', type: 'moodBoard' },
    { id: 'colorStory', name: 'Color Story', type: 'image' },
    { id: 'textureBoard', name: 'Texture Board', type: 'image' },
    { id: 'conceptNarrative', name: 'Concept Narrative', type: 'text' },
  ],

  parameters: [
    { id: 'layout', name: 'Layout Style', type: 'select', default: 'collage',
      options: [
        { label: 'Collage', value: 'collage' },
        { label: 'Grid', value: 'grid' },
        { label: 'Layered', value: 'layered' },
        { label: 'Minimal', value: 'minimal' },
      ]
    },
    { id: 'aspectRatio', name: 'Aspect Ratio', type: 'select', default: '16:9' },
    { id: 'includeText', name: 'Include Labels', type: 'boolean', default: true },
  ],
}
```

#### ColorHarmonizer Node

```typescript
{
  type: 'colorHarmonizer',
  category: 'interior',
  label: 'Color Harmonizer',
  displayName: 'Create Color Scheme',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'inspirationImage', name: 'Color Inspiration', type: 'image' },
    { id: 'existingColors', name: 'Existing Colors', type: 'colorPalette' },
    { id: 'preferredColors', name: 'Preferred Colors', type: 'text' },
  ],

  outputs: [
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    { id: 'colorHarmony', name: 'Color Harmony', type: 'colorHarmony' },
    { id: 'paletteVisual', name: 'Palette Visual', type: 'image' },
    { id: 'roomPreview', name: 'Room Color Preview', type: 'image' },
    { id: 'paintCodes', name: 'Paint Codes', type: 'text' },
  ],

  parameters: [
    { id: 'harmonyType', name: 'Harmony Type', type: 'select', default: 'complementary',
      options: [
        { label: 'Complementary', value: 'complementary' },
        { label: 'Analogous', value: 'analogous' },
        { label: 'Triadic', value: 'triadic' },
        { label: 'Split-Complementary', value: 'split-complementary' },
        { label: 'Monochromatic', value: 'monochromatic' },
        { label: 'Neutral with Accent', value: 'neutral-accent' },
      ]
    },
    { id: 'warmth', name: 'Color Temperature', type: 'slider', default: 0.5, min: 0, max: 1 },
    { id: 'saturation', name: 'Saturation Level', type: 'slider', default: 0.6, min: 0, max: 1 },
    { id: 'paintBrand', name: 'Paint Brand', type: 'select', default: 'benjamin-moore',
      options: [
        { label: 'Benjamin Moore', value: 'benjamin-moore' },
        { label: 'Sherwin-Williams', value: 'sherwin-williams' },
        { label: 'Farrow & Ball', value: 'farrow-ball' },
        { label: 'Behr', value: 'behr' },
      ]
    },
  ],
}
```

### 4.3 MATERIAL & TEXTURE NODES

#### MaterialLibrary Node

```typescript
{
  type: 'materialLibrary',
  category: 'interior',
  label: 'Material Library',
  displayName: 'Select Materials',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'styleProfile', name: 'Style Profile', type: 'styleProfile' },
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    { id: 'surfaceType', name: 'Surface Type', type: 'text' },
  ],

  outputs: [
    { id: 'materialPalette', name: 'Material Palette', type: 'materialPalette' },
    { id: 'flooring', name: 'Flooring Material', type: 'material' },
    { id: 'walls', name: 'Wall Treatment', type: 'material' },
    { id: 'countertops', name: 'Countertop Material', type: 'material' },
    { id: 'textiles', name: 'Textile Selections', type: 'textile' },
    { id: 'materialBoard', name: 'Material Board', type: 'image' },
    { id: 'specSheet', name: 'Specification Sheet', type: 'text' },
  ],

  parameters: [
    { id: 'flooringType', name: 'Flooring Type', type: 'select', default: 'hardwood',
      options: [
        { label: 'Hardwood', value: 'hardwood' },
        { label: 'Engineered Wood', value: 'engineered' },
        { label: 'Laminate', value: 'laminate' },
        { label: 'Tile', value: 'tile' },
        { label: 'Natural Stone', value: 'stone' },
        { label: 'Concrete', value: 'concrete' },
        { label: 'Carpet', value: 'carpet' },
        { label: 'Vinyl/LVP', value: 'vinyl' },
      ]
    },
    { id: 'wallTreatment', name: 'Wall Treatment', type: 'select', default: 'paint',
      options: [
        { label: 'Paint', value: 'paint' },
        { label: 'Wallpaper', value: 'wallpaper' },
        { label: 'Wood Paneling', value: 'wood-panel' },
        { label: 'Exposed Brick', value: 'brick' },
        { label: 'Stone', value: 'stone' },
        { label: 'Tile', value: 'tile' },
        { label: 'Plaster/Texture', value: 'texture' },
      ]
    },
    { id: 'sustainability', name: 'Eco-Friendly Priority', type: 'boolean', default: false },
    { id: 'budget', name: 'Budget Level', type: 'select', default: 'mid',
      options: [
        { label: 'Budget', value: 'budget' },
        { label: 'Mid-Range', value: 'mid' },
        { label: 'Premium', value: 'premium' },
        { label: 'Luxury', value: 'luxury' },
      ]
    },
  ],
}
```

#### TextureGenerator Node

```typescript
{
  type: 'textureGenerator',
  category: 'interior',
  label: 'Texture Generator',
  displayName: 'Generate Material Textures',

  inputs: [
    { id: 'material', name: 'Material Specification', type: 'material' },
    { id: 'referenceImage', name: 'Reference Image', type: 'image' },
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
  ],

  outputs: [
    { id: 'texture', name: 'Seamless Texture', type: 'image' },
    { id: 'normalMap', name: 'Normal Map', type: 'image' },
    { id: 'roughnessMap', name: 'Roughness Map', type: 'image' },
    { id: 'tilePreview', name: 'Tiled Preview', type: 'image' },
  ],

  parameters: [
    { id: 'resolution', name: 'Resolution', type: 'select', default: '2k',
      options: [
        { label: '1K (1024px)', value: '1k' },
        { label: '2K (2048px)', value: '2k' },
        { label: '4K (4096px)', value: '4k' },
      ]
    },
    { id: 'seamless', name: 'Seamless Tiling', type: 'boolean', default: true },
    { id: 'generateMaps', name: 'Generate PBR Maps', type: 'boolean', default: true },
  ],
}
```

### 4.4 FURNITURE & LAYOUT NODES

#### FurniturePlacer Node

```typescript
{
  type: 'furniturePlacer',
  category: 'interior',
  label: 'Furniture Placer',
  displayName: 'Place Furniture',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'floorPlan', name: 'Floor Plan', type: 'floorPlan' },
    { id: 'furnitureSet', name: 'Furniture Set', type: 'furnitureSet' },
    { id: 'styleProfile', name: 'Style Profile', type: 'styleProfile' },
  ],

  outputs: [
    { id: 'layout', name: 'Furniture Layout', type: 'layout' },
    { id: 'layoutPlan', name: 'Layout Floor Plan', type: 'image' },
    { id: 'perspective', name: 'Perspective View', type: 'image' },
    { id: 'alternativeLayouts', name: 'Alternative Layouts', type: 'image', multiple: true },
    { id: 'trafficFlow', name: 'Traffic Flow Diagram', type: 'image' },
  ],

  parameters: [
    { id: 'layoutStyle', name: 'Layout Approach', type: 'select', default: 'conversational',
      options: [
        { label: 'Conversational', value: 'conversational' },
        { label: 'Formal/Symmetrical', value: 'formal' },
        { label: 'Open Flow', value: 'open' },
        { label: 'Zoned', value: 'zoned' },
        { label: 'Floating', value: 'floating' },
      ]
    },
    { id: 'focalPoint', name: 'Focal Point', type: 'select', default: 'auto',
      options: [
        { label: 'Auto-Detect', value: 'auto' },
        { label: 'Fireplace', value: 'fireplace' },
        { label: 'Window/View', value: 'window' },
        { label: 'TV/Media', value: 'tv' },
        { label: 'Art/Feature Wall', value: 'art' },
      ]
    },
    { id: 'trafficPriority', name: 'Traffic Flow Priority', type: 'slider', default: 0.7, min: 0, max: 1 },
    { id: 'generateAlternatives', name: 'Generate Alternatives', type: 'number', default: 3, min: 1, max: 5 },
  ],
}
```

#### FurnitureCatalog Node

```typescript
{
  type: 'furnitureCatalog',
  category: 'interior',
  label: 'Furniture Catalog',
  displayName: 'Browse Furniture',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'styleProfile', name: 'Style Profile', type: 'styleProfile' },
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    { id: 'roomType', name: 'Room Type', type: 'text' },
  ],

  outputs: [
    { id: 'furnitureSet', name: 'Furniture Set', type: 'furnitureSet' },
    { id: 'products', name: 'Product References', type: 'productReference', multiple: true },
    { id: 'catalogSheet', name: 'Catalog Sheet', type: 'image' },
    { id: 'shoppingList', name: 'Shopping List', type: 'text' },
  ],

  parameters: [
    { id: 'pieceType', name: 'Furniture Type', type: 'select', default: 'all',
      options: [
        { label: 'All Furniture', value: 'all' },
        { label: 'Seating', value: 'seating' },
        { label: 'Tables', value: 'tables' },
        { label: 'Storage', value: 'storage' },
        { label: 'Beds', value: 'beds' },
        { label: 'Lighting', value: 'lighting' },
        { label: 'Decor', value: 'decor' },
      ]
    },
    { id: 'priceRange', name: 'Price Range', type: 'select', default: 'mid' },
    { id: 'brands', name: 'Preferred Brands', type: 'text' },
    { id: 'sustainable', name: 'Sustainable Only', type: 'boolean', default: false },
  ],
}
```

### 4.5 LIGHTING DESIGN NODES

#### LightingDesigner Node

```typescript
{
  type: 'lightingDesigner',
  category: 'interior',
  label: 'Lighting Designer',
  displayName: 'Design Lighting Scheme',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'layout', name: 'Furniture Layout', type: 'layout' },
    { id: 'moodProfile', name: 'Mood Profile', type: 'moodProfile' },
    { id: 'naturalLight', name: 'Natural Light Data', type: 'naturalLight' },
  ],

  outputs: [
    { id: 'lightingScheme', name: 'Lighting Scheme', type: 'lightingScheme' },
    { id: 'lightingPlan', name: 'Lighting Plan', type: 'image' },
    { id: 'dayRendering', name: 'Daytime Rendering', type: 'image' },
    { id: 'eveningRendering', name: 'Evening Rendering', type: 'image' },
    { id: 'fixtureList', name: 'Fixture List', type: 'text' },
    { id: 'lightingLayers', name: 'Lighting Layers Diagram', type: 'image' },
  ],

  execution: {
    designAgents: [
      {
        agentType: 'lighting-expert',
        endpoint: '/api/agent/interior/design-lighting',
        payload: {
          space: '${context.space}',
          layout: '${inputs.layout}',
          mood: '${inputs.moodProfile}',
          naturalLight: '${inputs.naturalLight}',
          layers: '${parameters.lightingLayers}',
        }
      }
    ],
    imageGeneration: [
      {
        model: 'flux-2-pro',
        promptSource: 'generated',
        count: 2,
        variations: ['day', 'evening'],
        outputTarget: ['dayRendering', 'eveningRendering'],
      }
    ]
  },

  parameters: [
    { id: 'lightingLayers', name: 'Lighting Layers', type: 'select', default: 'three-layer',
      options: [
        { label: 'Ambient Only', value: 'ambient' },
        { label: 'Ambient + Task', value: 'two-layer' },
        { label: 'Ambient + Task + Accent', value: 'three-layer' },
        { label: 'Full (+ Decorative)', value: 'full' },
      ]
    },
    { id: 'ambiance', name: 'Evening Ambiance', type: 'select', default: 'warm',
      options: [
        { label: 'Bright & Functional', value: 'bright' },
        { label: 'Warm & Cozy', value: 'warm' },
        { label: 'Dramatic', value: 'dramatic' },
        { label: 'Soft & Romantic', value: 'soft' },
        { label: 'Moody', value: 'moody' },
      ]
    },
    { id: 'dimming', name: 'Dimmable Fixtures', type: 'boolean', default: true },
    { id: 'smartLighting', name: 'Smart Lighting', type: 'boolean', default: false },
  ],
}
```

#### DaylightSimulator Node

```typescript
{
  type: 'daylightSimulator',
  category: 'interior',
  label: 'Daylight Simulator',
  displayName: 'Simulate Natural Light',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'rendering', name: 'Room Rendering', type: 'rendering' },
  ],

  outputs: [
    { id: 'morningLight', name: 'Morning Light', type: 'image' },
    { id: 'middayLight', name: 'Midday Light', type: 'image' },
    { id: 'afternoonLight', name: 'Afternoon Light', type: 'image' },
    { id: 'goldenHour', name: 'Golden Hour', type: 'image' },
    { id: 'timelapse', name: 'Daylight Timelapse', type: 'video' },
    { id: 'lightAnalysis', name: 'Light Analysis', type: 'text' },
  ],

  parameters: [
    { id: 'season', name: 'Season', type: 'select', default: 'summer',
      options: [
        { label: 'Spring', value: 'spring' },
        { label: 'Summer', value: 'summer' },
        { label: 'Fall', value: 'fall' },
        { label: 'Winter', value: 'winter' },
      ]
    },
    { id: 'orientation', name: 'Window Orientation', type: 'select', default: 'south' },
    { id: 'generateTimelapse', name: 'Generate Timelapse', type: 'boolean', default: true },
  ],
}
```

### 4.6 RENDERING & VISUALIZATION NODES

#### RoomComposer Node

```typescript
{
  type: 'roomComposer',
  category: 'interior',
  label: 'Room Composer',
  displayName: 'Compose Room Design',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'styleProfile', name: 'Style Profile', type: 'styleProfile' },
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    { id: 'materialPalette', name: 'Materials', type: 'materialPalette' },
    { id: 'furnitureSet', name: 'Furniture', type: 'furnitureSet' },
    { id: 'lightingScheme', name: 'Lighting', type: 'lightingScheme' },
    { id: 'referenceImage', name: 'Reference/Existing Room', type: 'image' },
  ],

  outputs: [
    { id: 'context', name: 'Updated Context', type: 'spaceContext' },
    { id: 'rendering', name: 'Room Rendering', type: 'rendering' },
    { id: 'alternativeViews', name: 'Alternative Views', type: 'image', multiple: true },
    { id: 'detailShots', name: 'Detail Shots', type: 'image', multiple: true },
    { id: 'designBrief', name: 'Design Brief', type: 'text' },
  ],

  parameters: [
    { id: 'viewAngle', name: 'View Angle', type: 'select', default: 'hero',
      options: [
        { label: 'Hero Shot', value: 'hero' },
        { label: 'Wide Angle', value: 'wide' },
        { label: 'Corner View', value: 'corner' },
        { label: 'Straight On', value: 'straight' },
        { label: 'From Entrance', value: 'entrance' },
      ]
    },
    { id: 'photorealism', name: 'Photorealism', type: 'slider', default: 0.9, min: 0, max: 1 },
    { id: 'timeOfDay', name: 'Time of Day', type: 'select', default: 'afternoon' },
    { id: 'generateDetails', name: 'Generate Detail Shots', type: 'boolean', default: true },
    { id: 'alternatives', name: 'Generate Alternatives', type: 'number', default: 2 },
  ],
}
```

#### BeforeAfterTransform Node

```typescript
{
  type: 'beforeAfterTransform',
  category: 'interior',
  label: 'Before/After Transform',
  displayName: 'Create Renovation Visualization',

  inputs: [
    { id: 'beforeImage', name: 'Before Image', type: 'beforeImage', required: true },
    { id: 'styleProfile', name: 'Target Style', type: 'styleProfile' },
    { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    { id: 'changes', name: 'Requested Changes', type: 'text' },
  ],

  outputs: [
    { id: 'afterImage', name: 'After Image', type: 'afterImage' },
    { id: 'sideBy Side', name: 'Side-by-Side', type: 'image' },
    { id: 'slider', name: 'Slider Comparison', type: 'image' },
    { id: 'transitionVideo', name: 'Transition Video', type: 'video' },
    { id: 'changesList', name: 'Changes Made', type: 'text' },
  ],

  parameters: [
    { id: 'transformLevel', name: 'Transformation Level', type: 'select', default: 'moderate',
      options: [
        { label: 'Refresh (Paint, Decor)', value: 'refresh' },
        { label: 'Moderate (+ Furniture)', value: 'moderate' },
        { label: 'Major (+ Layout)', value: 'major' },
        { label: 'Complete (Structural)', value: 'complete' },
      ]
    },
    { id: 'preserveLayout', name: 'Preserve Layout', type: 'boolean', default: true },
    { id: 'generateVideo', name: 'Generate Transition Video', type: 'boolean', default: true },
  ],
}
```

#### RoomSpin360 Node

```typescript
{
  type: 'roomSpin360',
  category: 'interior',
  label: 'Room Spin 360',
  displayName: 'Create 360° Room View',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'rendering', name: 'Room Rendering', type: 'rendering' },
    { id: 'layout', name: 'Furniture Layout', type: 'layout' },
  ],

  outputs: [
    { id: 'spin360', name: '360° Video', type: 'spin360' },
    { id: 'frames', name: 'Key Frames', type: 'image', multiple: true },
    { id: 'panorama', name: 'Panorama Image', type: 'image' },
  ],

  parameters: [
    { id: 'duration', name: 'Duration', type: 'select', default: '6s',
      options: [
        { label: '4 seconds', value: '4s' },
        { label: '6 seconds', value: '6s' },
        { label: '8 seconds', value: '8s' },
        { label: '12 seconds', value: '12s' },
      ]
    },
    { id: 'rotationAngle', name: 'Rotation', type: 'select', default: '360',
      options: [
        { label: '180°', value: '180' },
        { label: '270°', value: '270' },
        { label: 'Full 360°', value: '360' },
      ]
    },
    { id: 'cameraHeight', name: 'Camera Height', type: 'select', default: 'eye-level' },
  ],
}
```

#### WalkthroughGenerator Node

```typescript
{
  type: 'walkthroughGenerator',
  category: 'interior',
  label: 'Walkthrough Generator',
  displayName: 'Create Video Walkthrough',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'renderings', name: 'Room Renderings', type: 'rendering', multiple: true },
    { id: 'floorPlan', name: 'Floor Plan', type: 'floorPlan' },
    { id: 'cameraPath', name: 'Camera Path', type: 'text' },
  ],

  outputs: [
    { id: 'walkthrough', name: 'Walkthrough Video', type: 'video' },
    { id: 'keyFrames', name: 'Key Frames', type: 'image', multiple: true },
    { id: 'narration', name: 'Narration Script', type: 'text' },
  ],

  parameters: [
    { id: 'style', name: 'Video Style', type: 'select', default: 'smooth',
      options: [
        { label: 'Smooth Glide', value: 'smooth' },
        { label: 'Natural Walk', value: 'walk' },
        { label: 'Cinematic', value: 'cinematic' },
        { label: 'Real Estate', value: 'realestate' },
      ]
    },
    { id: 'duration', name: 'Duration', type: 'select', default: '30s' },
    { id: 'addMusic', name: 'Background Music', type: 'boolean', default: true },
    { id: 'addNarration', name: 'Generate Narration', type: 'boolean', default: false },
  ],
}
```

### 4.7 PROJECT MANAGEMENT NODES

#### RenovationPlanner Node

```typescript
{
  type: 'renovationPlanner',
  category: 'interior',
  label: 'Renovation Planner',
  displayName: 'Plan Renovation Project',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'beforeImage', name: 'Current State', type: 'beforeImage' },
    { id: 'afterImage', name: 'Target Design', type: 'afterImage' },
    { id: 'budget', name: 'Budget', type: 'text' },
  ],

  outputs: [
    { id: 'projectPlan', name: 'Project Plan', type: 'text' },
    { id: 'costEstimate', name: 'Cost Estimate', type: 'costEstimate' },
    { id: 'timeline', name: 'Project Timeline', type: 'text' },
    { id: 'phaseVisuals', name: 'Phase Visuals', type: 'image', multiple: true },
    { id: 'materialList', name: 'Material List', type: 'shoppingList' },
    { id: 'contractorBrief', name: 'Contractor Brief', type: 'text' },
  ],

  parameters: [
    { id: 'scope', name: 'Renovation Scope', type: 'select', default: 'cosmetic',
      options: [
        { label: 'Cosmetic (Paint, Decor)', value: 'cosmetic' },
        { label: 'Moderate (+ Fixtures)', value: 'moderate' },
        { label: 'Full (+ Layout Changes)', value: 'full' },
        { label: 'Gut Renovation', value: 'gut' },
      ]
    },
    { id: 'diy', name: 'DIY Portions', type: 'boolean', default: false },
    { id: 'permitRequired', name: 'Include Permit Info', type: 'boolean', default: true },
  ],
}
```

#### CostEstimator Node

```typescript
{
  type: 'costEstimator',
  category: 'interior',
  label: 'Cost Estimator',
  displayName: 'Estimate Project Costs',

  inputs: [
    { id: 'context', name: 'Space Context', type: 'spaceContext' },
    { id: 'materialPalette', name: 'Materials', type: 'materialPalette' },
    { id: 'furnitureSet', name: 'Furniture', type: 'furnitureSet' },
    { id: 'projectPlan', name: 'Project Plan', type: 'text' },
  ],

  outputs: [
    { id: 'costEstimate', name: 'Cost Breakdown', type: 'costEstimate' },
    { id: 'budgetSummary', name: 'Budget Summary', type: 'text' },
    { id: 'alternatives', name: 'Budget Alternatives', type: 'text' },
    { id: 'costVisual', name: 'Cost Visualization', type: 'image' },
  ],

  parameters: [
    { id: 'region', name: 'Region', type: 'select', default: 'us-average' },
    { id: 'laborIncluded', name: 'Include Labor', type: 'boolean', default: true },
    { id: 'contingency', name: 'Contingency %', type: 'number', default: 15, min: 0, max: 30 },
  ],
}
```

#### VirtualStaging Node

```typescript
{
  type: 'virtualStaging',
  category: 'interior',
  label: 'Virtual Staging',
  displayName: 'Stage Empty Room',

  inputs: [
    { id: 'emptyRoom', name: 'Empty Room Photo', type: 'image', required: true },
    { id: 'styleProfile', name: 'Style Profile', type: 'styleProfile' },
    { id: 'roomType', name: 'Room Type', type: 'text' },
  ],

  outputs: [
    { id: 'stagedRoom', name: 'Staged Room', type: 'image' },
    { id: 'alternatives', name: 'Style Alternatives', type: 'image', multiple: true },
    { id: 'furnitureList', name: 'Furniture Used', type: 'text' },
    { id: 'beforeAfter', name: 'Before/After', type: 'image' },
  ],

  parameters: [
    { id: 'stagingLevel', name: 'Staging Level', type: 'select', default: 'full',
      options: [
        { label: 'Minimal', value: 'minimal' },
        { label: 'Standard', value: 'standard' },
        { label: 'Full', value: 'full' },
        { label: 'Luxury', value: 'luxury' },
      ]
    },
    { id: 'targetBuyer', name: 'Target Buyer', type: 'select', default: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Young Professional', value: 'young-professional' },
        { label: 'Family', value: 'family' },
        { label: 'Luxury Buyer', value: 'luxury' },
        { label: 'Investor', value: 'investor' },
      ]
    },
    { id: 'alternatives', name: 'Style Alternatives', type: 'number', default: 3 },
  ],
}
```

---

## Part 5: Complete Workflow Patterns

### 5.1 FULL ROOM DESIGN WORKFLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           FULL ROOM DESIGN WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌──────────────┐                             │
│  │ Room Photo  │───▶│ SpaceScanner│───▶│ SpaceContext │                             │
│  └─────────────┘    └─────────────┘    └──────┬───────┘                             │
│                                                │                                      │
│  ┌─────────────┐    ┌──────────────┐          │                                      │
│  │ Inspiration │───▶│ StyleDefiner │──────────┼───▶ StyleProfile                    │
│  └─────────────┘    └──────────────┘          │         │                           │
│                                                │         ▼                           │
│                     ┌────────────────┐         │    ┌──────────────┐                │
│                     │ ColorHarmonizer│◀────────┼────│ MoodBoard    │                │
│                     └───────┬────────┘         │    │ Generator    │                │
│                             │                  │    └──────────────┘                │
│                             ▼                  │                                      │
│                     ┌────────────────┐         │                                      │
│                     │MaterialLibrary │◀────────┘                                     │
│                     └───────┬────────┘                                               │
│                             │                                                         │
│                             ▼                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐            │
│  │                      PARALLEL EXECUTION                              │            │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐     │            │
│  │  │FurnitureCatalog│  │ LightingDesigner │  │FloorPlanGenerator│     │            │
│  │  └───────┬────────┘  └────────┬────────┘  └────────┬─────────┘     │            │
│  └──────────┼───────────────────┼───────────────────┼─────────────────┘            │
│             │                   │                   │                               │
│             ▼                   ▼                   ▼                               │
│       ┌──────────────────────────────────────────────────┐                          │
│       │                 FurniturePlacer                  │                          │
│       └───────────────────────┬──────────────────────────┘                          │
│                               │                                                      │
│                               ▼                                                      │
│       ┌──────────────────────────────────────────────────┐                          │
│       │                  RoomComposer                    │                          │
│       │   IN: Style, Materials, Furniture, Lighting     │                          │
│       │   OUT: Final Rendering, Design Brief            │                          │
│       └───────────────────────┬──────────────────────────┘                          │
│                               │                                                      │
│                               ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐            │
│  │                      OUTPUT OPTIONS                                 │            │
│  │  ┌────────────┐  ┌────────────────┐  ┌──────────────────┐          │            │
│  │  │ RoomSpin360│  │WalkthroughGen  │  │DaylightSimulator │          │            │
│  │  └────────────┘  └────────────────┘  └──────────────────┘          │            │
│  └─────────────────────────────────────────────────────────────────────┘            │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 RENOVATION VISUALIZATION WORKFLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        RENOVATION VISUALIZATION WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌─────────────┐         ┌─────────────┐                                            │
│  │Before Photo │────────▶│SpaceScanner │──▶ Current State Analysis                  │
│  └─────────────┘         └─────────────┘                                            │
│                                 │                                                    │
│                                 ▼                                                    │
│  ┌─────────────┐         ┌─────────────────────┐                                    │
│  │ Target Style│────────▶│  StyleDefiner       │──▶ Target Style Profile            │
│  │ Preferences │         └─────────────────────┘                                    │
│  └─────────────┘                │                                                    │
│                                 ▼                                                    │
│                          ┌─────────────────────┐                                    │
│                          │BeforeAfterTransform │                                    │
│                          │  + RenovationPlanner│                                    │
│                          └──────────┬──────────┘                                    │
│                                     │                                                │
│            ┌────────────────────────┼────────────────────────┐                      │
│            ▼                        ▼                        ▼                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐               │
│  │   After Image   │     │   Cost Estimate  │     │  Project Plan   │               │
│  └────────┬────────┘     └─────────────────┘     └─────────────────┘               │
│           │                                                                          │
│           ▼                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐                │
│  │              VISUALIZATION OPTIONS                              │                │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │                │
│  │  │ Side-by-Side   │  │ Slider Compare │  │Transition Video│   │                │
│  │  └────────────────┘  └────────────────┘  └────────────────┘   │                │
│  └─────────────────────────────────────────────────────────────────┘                │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 REAL ESTATE STAGING WORKFLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         REAL ESTATE STAGING WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌────────────────┐                                                                  │
│  │Empty Room Photo│─────────────────────────────────────────────────────────────▶   │
│  └───────┬────────┘                                                                  │
│          │                                                                           │
│          ▼                                                                           │
│  ┌────────────────┐    Multiple Styles                                              │
│  │ VirtualStaging │────────────────────────────────────────────────────────────▶    │
│  └───────┬────────┘                                                                  │
│          │                                                                           │
│          ├────────────────┬────────────────┬────────────────┐                       │
│          ▼                ▼                ▼                ▼                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ Modern Style │ │ Traditional  │ │ Minimalist   │ │ Luxury       │               │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘               │
│         │                │                │                │                        │
│         └────────────────┴────────────────┴────────────────┘                        │
│                                  │                                                   │
│                                  ▼                                                   │
│                          ┌──────────────┐                                           │
│                          │RoomSpin360   │──▶ 360° Tours for Each Style             │
│                          └──────────────┘                                           │
│                                  │                                                   │
│                                  ▼                                                   │
│                          ┌──────────────────┐                                       │
│                          │WalkthroughGenerator│──▶ Virtual Tour Video              │
│                          └──────────────────┘                                       │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: API Integration

### 6.1 Backend Endpoints Required

```typescript
// Space Analysis
POST /api/agent/interior/scan-space
POST /api/agent/interior/analyze-dimensions
POST /api/agent/interior/detect-features

// Style & Design
POST /api/agent/interior/define-style
POST /api/agent/interior/generate-moodboard
POST /api/agent/interior/create-color-palette
POST /api/agent/interior/suggest-materials

// Layout & Furniture
POST /api/agent/interior/plan-layout
POST /api/agent/interior/suggest-furniture
POST /api/agent/interior/optimize-traffic-flow

// Lighting
POST /api/agent/interior/design-lighting
POST /api/agent/interior/simulate-daylight

// Rendering
POST /api/agent/interior/compose-room
POST /api/agent/interior/before-after-transform
POST /api/agent/interior/virtual-staging

// Project Planning
POST /api/agent/interior/plan-renovation
POST /api/agent/interior/estimate-costs
POST /api/agent/interior/generate-shopping-list
```

### 6.2 Image Generation Models

| Use Case | Primary Model | Fallback |
|----------|---------------|----------|
| Room Renderings | FLUX 2 Pro | FLUX Kontext |
| Before/After | FLUX Kontext | FLUX 2 Pro |
| Floor Plans | Specialized | FLUX 2 Dev |
| Material Textures | FLUX 2 Pro | - |
| 360° Views | Kling O1 | VEO 3.1 |
| Walkthroughs | VEO 3.1 | Kling 2.6 |

---

## Part 7: Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Add InteriorPortType to canvas.ts
- [ ] Create SpaceContext interface
- [ ] Add interior node category

### Phase 2: Space Analysis Nodes
- [ ] SpaceScanner
- [ ] FloorPlanGenerator
- [ ] DimensionAnalyzer

### Phase 3: Style & Mood Nodes
- [ ] StyleDefiner
- [ ] MoodBoardGenerator
- [ ] ColorHarmonizer

### Phase 4: Material & Furniture Nodes
- [ ] MaterialLibrary
- [ ] TextureGenerator
- [ ] FurnitureCatalog
- [ ] FurniturePlacer

### Phase 5: Lighting Nodes
- [ ] LightingDesigner
- [ ] DaylightSimulator

### Phase 6: Rendering Nodes
- [ ] RoomComposer
- [ ] BeforeAfterTransform
- [ ] RoomSpin360
- [ ] WalkthroughGenerator

### Phase 7: Project Management Nodes
- [ ] VirtualStaging
- [ ] RenovationPlanner
- [ ] CostEstimator

### Phase 8: Palette & UI Integration
- [ ] Add Interior Design category to palette
- [ ] Register all nodes in CreativeCanvasStudio
- [ ] Add search capabilities

---

## Appendix: Node Summary

| Node | Category | Primary Output | Image Gen | Video Gen |
|------|----------|----------------|-----------|-----------|
| SpaceScanner | Analysis | SpaceContext | Optional | - |
| FloorPlanGenerator | Analysis | Floor Plan Image | Yes | - |
| StyleDefiner | Style | StyleProfile | Yes | - |
| MoodBoardGenerator | Style | Mood Board | Yes | - |
| ColorHarmonizer | Color | Color Palette | Yes | - |
| MaterialLibrary | Materials | Material Palette | Yes | - |
| TextureGenerator | Materials | Seamless Texture | Yes | - |
| FurnitureCatalog | Furniture | Furniture Set | Yes | - |
| FurniturePlacer | Layout | Layout Plan | Yes | - |
| LightingDesigner | Lighting | Lighting Scheme | Yes | - |
| DaylightSimulator | Lighting | Time Variations | Yes | Yes |
| RoomComposer | Rendering | Room Rendering | Yes | Optional |
| BeforeAfterTransform | Rendering | After Image | Yes | Yes |
| RoomSpin360 | Video | 360° Video | Yes | Yes |
| WalkthroughGenerator | Video | Walkthrough | Yes | Yes |
| VirtualStaging | Staging | Staged Room | Yes | - |
| RenovationPlanner | Project | Project Plan | Yes | - |
| CostEstimator | Project | Cost Breakdown | Yes | - |

**Total: 18 Interior Design Nodes**
