# Grid Workflows Strategy - DeepVibe Nexus

**Version:** 1.0
**Date:** December 8, 2025
**Status:** Design Phase

---

## Executive Summary

**Grids** represent the third dimension of our multi-frame generation system:

| System | Dimension | Layout | Purpose |
|--------|-----------|--------|---------|
| **Stacks** | Time/Depth | Vertical (9:16) | Sequential progression, cause/effect |
| **Queues** | Space | Horizontal (16:9+) | Spatial continuity, narrative flow |
| **Grids** | Variation/Relationship | Matrix (1:1) | Comparative inference, coverage |

> "Stacks give you **Control**. Queues give you **Context**. Grids give you **Options**."

Grids generate multiple variations within a single global seed and pixel space, achieving cohesion impossible with sequential generation—same lighting physics, same skin texture, same atmospheric density.

---

## The Grid Paradigm

### Core Concept: Comparative Inference

Unlike sequential generation where each image is independent, Grids force the AI model to perform **comparative inference**. By generating 4-9 states simultaneously:

1. **Global Consistency** - Single seed ensures matching textures, lighting, and physics
2. **Relationship Awareness** - Model understands how cells relate to each other
3. **Efficient Coverage** - One generation replaces 4-9 sequential prompts
4. **Instant Asset Library** - Auto-slice creates stock footage for the scene

### Grid Topologies

| Topology | Aspect Ratio | Use Case |
|----------|--------------|----------|
| 2x2 | 1:1 (square) | Quick comparisons, lighting studies |
| 3x3 | 1:1 (square) | Contact sheets, expression matrices |
| 4x4 | 1:1 (square) | Comprehensive coverage (rare) |
| 1x3 | 3:1 (horizontal strip) | Triptychs, before/during/after |
| 3x1 | 1:3 (vertical strip) | Vertical sequences |
| 2x3 / 3x2 | 3:2 or 2:3 | Turnaround sheets, custom layouts |
| Custom | Variable | Comic page layouts, non-uniform panels |

---

## Grid Types: The Complete Catalog

### Part 1: Foundational Grids (Production Efficiency)

These grids replace tedious manual prompting with instant coverage.

#### 1. Cinematic Contact Sheet (`grid-contact`)
**The anchor grid for any production workflow.**

| Attribute | Value |
|-----------|-------|
| Topology | 3x3 |
| Canvas | 1:1 |
| Logic | Proximity (Far → Near) |
| Value | Instant shot coverage from establishing to ECU |

**Frame Layout:**
```
[ ELS (Extreme Long)  | LS (Long Shot)     | MLS (Medium Long) ]
[ MS (Medium Shot)    | MCU (Medium Close) | CU (Close-Up)     ]
[ ECU (Extreme Close) | Low Angle          | High Angle        ]
```

**Use Cases:**
- Scene pre-visualization
- Shot list generation
- Client presentation boards
- Stock footage creation

---

#### 2. Turnaround Grid (`grid-turnaround`)
**Essential for 3D modelers and character consistency.**

| Attribute | Value |
|-----------|-------|
| Topology | 2x3 or 3x2 |
| Canvas | 3:2 or 2:3 |
| Logic | Angular rotation |
| Value | Character reference sheets for animation |

**Frame Layout:**
```
[ Front (A-Pose) | Side Left  | Side Right ]
[ Back           | 3/4 View   | Detail     ]
```

**Use Cases:**
- 3D character modeling reference
- Kling O1 Reference-to-Video workflows
- Costume design documentation
- Animation model sheets

---

#### 3. Lighting Compass (`grid-lighting`)
**Cinematography pre-visualization tool.**

| Attribute | Value |
|-----------|-------|
| Topology | 2x2 |
| Canvas | 1:1 |
| Logic | Lighting direction/time variation |
| Value | Director of Photography mood visualization |

**Frame Layout:**
```
[ Golden Hour (Backlit)     | High Noon (Hard shadows) ]
[ Cyberpunk Neon (Colored)  | Moonlight (Blue/Silver)  ]
```

**Use Cases:**
- Lighting direction comparison
- Time of day exploration
- Mood board generation
- LUT/color grade previews

---

#### 4. Hand & Prop Grid (`grid-anatomy`)
**AI struggles with hands—generate 9, pick the best 3.**

| Attribute | Value |
|-----------|-------|
| Topology | 3x3 |
| Canvas | 1:1 |
| Logic | Pose variation with locked subject |
| Value | 90% chance of 3-4 perfect hand poses |

**Frame Layout:**
```
[ Gripping      | Relaxed      | Pointing    ]
[ Open Palm     | Catching     | Dropping    ]
[ Two-Handed    | Fine Motor   | Interaction ]
```

**Use Cases:**
- In-painting reference for hand corrections
- Prop interaction studies
- Gesture library building
- Animation keyframe reference

---

#### 5. Materiality Grid (`grid-texture`)
**Texture patches for upscaling tools.**

| Attribute | Value |
|-----------|-------|
| Topology | 2x2 |
| Canvas | 1:1 |
| Logic | Macro focus on surface materials |
| Value | High-fidelity texture reference for detail hallucination |

**Frame Layout:**
```
[ Skin Texture/Pores  | Fabric Weave        ]
[ Surface Reflection  | Hair Strands/Detail ]
```

**Use Cases:**
- Texture patches for upscaling
- Material consistency reference
- Product photography detail
- VFX texture libraries

---

#### 6. Lens Kit Grid (`grid-lens`)
**How focal length changes perspective.**

| Attribute | Value |
|-----------|-------|
| Topology | 2x2 or 1x4 |
| Canvas | 1:1 or 4:1 |
| Logic | Same shot, different glass |
| Value | Teaches focal length → facial geometry relationship |

**Frame Layout:**
```
[ 16mm Fisheye (Distorted) | 35mm Standard  ]
[ 85mm Portrait (Bokeh)    | 200mm Telephoto (Compressed) ]
```

**Use Cases:**
- Cinematography education
- Lens selection for projects
- Distortion comparison
- Style guide development

---

### Part 2: Innovation Grids (Creative Exploration)

These grids fracture reality and explore the subconscious.

#### 7. Rashomon Grid (`grid-rashomon`)
**Same event through different character perspectives.**

| Attribute | Value |
|-----------|-------|
| Topology | 1x3 (triptych) |
| Canvas | 3:1 (horizontal) |
| Logic | Subjective reality |
| Value | Narrative bias visualization |

**Frame Layout:**
```
[ Victim's POV (Fear, shadows, tilted) | Aggressor's POV (Power, red-tint) | Bystander's POV (Distant, obscured) ]
```

**Use Cases:**
- Psychological thrillers
- Unreliable narrator visualization
- Court scene storyboards
- Multiple viewpoint narratives

---

#### 8. Entropy Grid (`grid-entropy`)
**The arrow of time—decay or evolution across eons.**

| Attribute | Value |
|-----------|-------|
| Topology | 3x3 |
| Canvas | 1:1 |
| Logic | Temporal decay progression |
| Value | Time-lapse animation guides (1 → 9 interpolation) |

**Frame Layout:**
```
[ Brand New (Pristine)  | 10 Years (Minor wear)  | 25 Years (Patina)        ]
[ 50 Years (Rusted)     | 100 Years (Broken)     | 250 Years (Overgrown)    ]
[ 500 Years (Ruins)     | 750 Years (Fragments)  | 1000 Years (Fossilized)  ]
```

**Use Cases:**
- VEO 3.1 time-lapse animation
- Historical/future visualization
- Environmental storytelling
- Meditation on impermanence

---

#### 9. Style Prism Grid (`grid-prism`)
**Shatter the aesthetic dimension—art history multiverse.**

| Attribute | Value |
|-----------|-------|
| Topology | 3x3 |
| Canvas | 1:1 |
| Logic | Same composition through art history |
| Value | "Into the Spider-Verse" style exploration |

**Frame Layout:**
```
[ Photograph (Realism) | Oil Painting    | Charcoal Sketch  ]
[ Cubism              | Bauhaus/Minimal | Glitch Art       ]
[ Anime               | 1950s Comic     | Claymation       ]
```

**Use Cases:**
- Style exploration for art direction
- Music video aesthetics
- Cross-genre storytelling
- Finding the "soul" of a scene

---

#### 10. Micro-Expression Map (`grid-micro`)
**The things unsaid—9 stages of emotional realization.**

| Attribute | Value |
|-----------|-------|
| Topology | 3x3 (ECU faces) |
| Canvas | 1:1 |
| Logic | Subtle emotional progression |
| Value | Face morph training for Kling O1 |

**Frame Layout:**
```
[ Baseline Neutral  | First Flicker    | Recognition      ]
[ Growing Realization | Full Impact    | Processing       ]
[ Controlled Response | Breaking Point | Resolution/Mask  ]
```

**Use Cases:**
- Acting reference for animation
- Kling O1 face morph training
- Emotional beat boards
- Psychological character studies

---

#### 11. X-Ray Grid (`grid-xray`)
**Literal or metaphorical transparency.**

| Attribute | Value |
|-----------|-------|
| Topology | 1x3 (vertical split) |
| Canvas | 1:3 (vertical) |
| Logic | Layered visibility |
| Value | Sci-fi UI elements, deeper storytelling |

**Frame Layout:**
```
[ External Appearance ]
[ Thermal Imaging     ]
[ Anatomical/Mechanical ]
```

**Use Cases:**
- Sci-fi interface design
- Medical visualization
- Character depth revelation
- Cyberpunk aesthetics

---

#### 12. Synesthesia Grid (`grid-synesthesia`)
**If the scene was music, what would it look like?**

| Attribute | Value |
|-----------|-------|
| Topology | 2x2 |
| Canvas | 1:1 |
| Logic | Audio mood → visual interpretation |
| Value | Abstract visuals for music videos |

**Frame Layout:**
```
[ Silence (Desaturated, empty) | Cacophony (Motion blur, noise) ]
[ Melodic (Soft flows, glow)   | Bass Heavy (Dark, vibrating)   ]
```

**Use Cases:**
- Music video pre-visualization
- Dream sequence design
- Sound design visualization
- Abstract art generation

---

#### 13. Graphic Novel Grid (`grid-comic`)
**Finished comic page layout—narrative flow in single generation.**

| Attribute | Value |
|-----------|-------|
| Topology | Custom (non-uniform) |
| Canvas | 2:3 (portrait) |
| Logic | Narrative panel hierarchy |
| Value | Direct-to-print assets, storyboard-to-animatic |

**Example Layout:**
```
┌─────────────┬──────────┐
│             │  Detail  │
│  Hero Shot  ├──────────┤
│  (Large)    │  React   │
│             ├──────────┤
│             │ Dialogue │
└─────────────┴──────────┘
```

**Use Cases:**
- Comic book page generation
- Storyboard-to-animatic workflows
- Marketing sequence layouts
- Narrative beat visualization

---

## Technical Architecture

### Type System Integration

Following the established Stack/Queue patterns:

```typescript
// Add to CompositeMode union
export type CompositeMode =
  | ... // existing modes
  // === GRIDS (Matrix Format - 1:1) ===
  | 'grid-contact'      // Cinematic contact sheet (3x3)
  | 'grid-turnaround'   // Character turnaround (2x3)
  | 'grid-lighting'     // Lighting compass (2x2)
  | 'grid-anatomy'      // Hand & prop (3x3)
  | 'grid-texture'      // Materiality (2x2)
  | 'grid-lens'         // Lens kit (2x2)
  | 'grid-rashomon'     // Subjective reality (1x3)
  | 'grid-entropy'      // Time decay (3x3)
  | 'grid-prism'        // Style multiverse (3x3)
  | 'grid-micro'        // Micro-expression (3x3)
  | 'grid-xray'         // X-ray layers (1x3)
  | 'grid-synesthesia'  // Sound visualization (2x2)
  | 'grid-comic';       // Graphic novel (custom)

// New GridType union
export type GridType =
  // Foundational (6)
  | 'contact'
  | 'turnaround'
  | 'lighting'
  | 'anatomy'
  | 'texture'
  | 'lens'
  // Innovation (7)
  | 'rashomon'
  | 'entropy'
  | 'prism'
  | 'micro'
  | 'xray'
  | 'synesthesia'
  | 'comic';

// Grid topology
export type GridTopology = '2x2' | '3x3' | '4x4' | '1x3' | '3x1' | '2x3' | '3x2' | 'custom';

// Grid canvas ratios
export type GridCanvasRatio = '1:1' | '3:1' | '1:3' | '3:2' | '2:3' | 'custom';
```

### Grid Frame Interfaces

```typescript
// Base grid cell instruction
export interface GridCellInstructionBase {
  row: number;
  col: number;
  customInstruction?: string;
}

// Contact Sheet cell
export interface ContactSheetCell extends GridCellInstructionBase {
  shotDistance: CameraAngle;
  shotType: string;
}

// Turnaround cell
export interface TurnaroundCell extends GridCellInstructionBase {
  viewAngle: 'front' | 'side-left' | 'side-right' | 'back' | 'three-quarter' | 'detail';
  poseVariant?: string;
}

// Lighting cell
export interface LightingCell extends GridCellInstructionBase {
  lightingDirection: string;
  timeOfDay?: TimeOfDay;
  colorTemperature?: 'warm' | 'cool' | 'neutral' | 'colored';
}

// ... similar interfaces for each grid type
```

### Grid Type Configuration

```typescript
export interface GridTypeConfig {
  type: GridType;
  label: string;
  description: string;
  icon: string;
  color: string;
  topology: GridTopology;
  canvasRatio: GridCanvasRatio;
  cellCount: number;
  category: 'foundational' | 'innovation';
  useCases: string[];
}

export const GRID_TYPE_CONFIGS: Record<GridType, GridTypeConfig> = {
  contact: {
    type: 'contact',
    label: 'Cinematic Contact Sheet',
    description: 'Complete shot coverage from establishing to extreme close-up',
    icon: 'Grid3x3',
    color: 'cyan',
    topology: '3x3',
    canvasRatio: '1:1',
    cellCount: 9,
    category: 'foundational',
    useCases: [
      'Scene pre-visualization',
      'Shot list generation',
      'Client presentation boards',
      'Stock footage creation',
    ],
  },
  // ... remaining configs
};
```

### Component Architecture

```
src/components/composite-studio/
├── GridWorkflowWizard.tsx        # Main wizard (matches StackWorkflowWizard pattern)
├── GridTypeSelector.tsx          # Grid type selection UI
├── GridCellConfigurator.tsx      # Per-cell configuration
├── GridPreview.tsx               # Live topology preview
├── GridProgressTracker.tsx       # Generation progress
├── GridResultHero.tsx            # Result display with auto-slice
└── GridAutoSlicer.tsx            # Individual cell extraction
```

### API Integration

```typescript
// services/grids.ts
export const gridApi = {
  // Generate grid
  generate: (request: GridGenerationRequest) =>
    apiClient.post<GridJobResponse>('/api/v1/grids/generate', request),

  // Get job status
  getJobStatus: (jobId: string) =>
    apiClient.getRaw<GridJobResponse>(`/api/v1/grids/jobs/${jobId}`),

  // Auto-slice grid into individual cells
  extractCells: (jobId: string, request: GridCellExtractionRequest) =>
    apiClient.post<GridCellExtractionResponse>(`/api/v1/grids/jobs/${jobId}/extract`, request),

  // Get presets
  getPresets: (gridType?: GridType) =>
    apiClient.get<GridPresetsResponse>('/api/v1/grids/presets', { gridType }),

  // History
  getHistory: (params: GridHistoryParams) =>
    apiClient.get<GridHistoryResponse>('/api/v1/grids/history', params),
};
```

---

## Prompt Engineering Strategy

### Mega-Prompt Construction

```
Divide the canvas into a [TOPOLOGY] grid.

**Global Context:** [User Scene Description]

**Subject Lock:** Maintain perfect consistency of [character/subject] across all cells.
Seed: [SEED] | Global lighting physics | Unified texture density

**Cell 1 (Row 1, Col 1):** [Specific instruction]
**Cell 2 (Row 1, Col 2):** [Specific instruction]
...
**Cell 9 (Row 3, Col 3):** [Specific instruction]

**Constraint:** Each cell must seamlessly connect to adjacent cells while varying only the specified parameter.
```

### Example: Contact Sheet Prompt

```
Divide the canvas into a 3x3 grid.

**Global Context:** A detective in a teal suit sits at a dimly lit bar,
examining a photograph. Film noir aesthetic, practical lighting from bar fixtures.

**Subject Lock:** The detective (male, 40s, weathered face, teal suit) must be
identical across all cells. Same lighting physics, same texture quality.

**Cell 1 (Top-Left):** Extreme Long Shot - Full bar interior, detective small in frame
**Cell 2 (Top-Center):** Long Shot - Detective and bar counter, establishing geography
**Cell 3 (Top-Right):** Medium Long Shot - Detective from knees up, bar context visible
**Cell 4 (Middle-Left):** Medium Shot - Waist up, hands on counter visible
**Cell 5 (Middle-Center):** Medium Close-Up - Chest up, examining photograph
**Cell 6 (Middle-Right):** Close-Up - Face, emotion visible, slight furrow
**Cell 7 (Bottom-Left):** Extreme Close-Up - Eyes only, reflection of photo
**Cell 8 (Bottom-Center):** Low Angle - Looking up at detective, imposing
**Cell 9 (Bottom-Right):** High Angle - Looking down, vulnerability
```

---

## UX Flow: Generate → Celebrate → Extract

Following the established "Generate → Celebrate → Extend" pattern:

### Phase 1: Configure
1. **Select Grid Type** - Choose from Foundational or Innovation grids
2. **Subject Anchoring** - Upload reference images (optional)
3. **Scene Description** - Global context prompt
4. **Cell Customization** - Fine-tune individual cell instructions
5. **Resolution Selection** - Preview / Standard / High

### Phase 2: Celebrate (Hero Moment)
1. **Full Grid Display** - Large hero image with glow effect
2. **Hover Preview** - Individual cell highlighting on hover
3. **Primary Actions:**
   - Download full grid
   - Copy to clipboard
   - Regenerate with same/new seed

### Phase 3: Extract (Auto-Slice)
1. **One-Click Extraction** - Slice all cells to Asset Tray
2. **Selective Extraction** - Choose specific cells
3. **Per-Cell Actions:**
   - Download individual cell
   - Send to Animation Studio
   - Send to Upscaler
   - Use as reference in other workflows

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Add Grid types to `compositeStudio.ts`
- [ ] Create `GridTypeSelector` component
- [ ] Create `GridWorkflowWizard` scaffolding
- [ ] Add grid routes to `ModeSelector`

### Phase 2: Core Grids (Week 2)
- [ ] Implement Contact Sheet (`grid-contact`)
- [ ] Implement Turnaround (`grid-turnaround`)
- [ ] Implement Lighting Compass (`grid-lighting`)
- [ ] Create `GridCellConfigurator` component

### Phase 3: Advanced Grids (Week 3)
- [ ] Implement remaining Foundational grids
- [ ] Implement Innovation grids
- [ ] Create `GridAutoSlicer` component
- [ ] Add Grid history tracking

### Phase 4: Polish (Week 4)
- [ ] `GridResultHero` with hover cell preview
- [ ] Animation integration (cell → Animation Studio)
- [ ] Presets and templates
- [ ] Documentation and guides

---

## Value Proposition

### For Production Teams
- **10x Faster Coverage** - One generation replaces 9 sequential prompts
- **Perfect Consistency** - Global seed ensures matching physics
- **Instant Asset Library** - Auto-slice creates ready-to-use stock

### For Art Directors
- **Rapid Exploration** - Style Prism shows 9 aesthetics in one shot
- **Client Communication** - Contact sheets for presentation decks
- **Decision Making** - Side-by-side comparison accelerates choices

### For Animators
- **Character Sheets** - Turnaround grids for 3D modeling reference
- **Expression Libraries** - Micro-expression maps for face rigs
- **Texture Reference** - Materiality grids for detail hallucination

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Grid adoption rate | 30% of composite workflows | Usage analytics |
| Time savings | 5x faster than sequential | User surveys |
| Cell extraction rate | >60% extract at least one cell | Click tracking |
| User satisfaction | 4.5/5 | In-app feedback |

---

## Appendix: Cell Mapping Reference

### 3x3 Grid Index Mapping
```
[ 0 | 1 | 2 ]
[ 3 | 4 | 5 ]
[ 6 | 7 | 8 ]
```

### 2x2 Grid Index Mapping
```
[ 0 | 1 ]
[ 2 | 3 ]
```

### 2x3 Grid Index Mapping
```
[ 0 | 1 | 2 ]
[ 3 | 4 | 5 ]
```

---

**Document Owner:** Engineering
**Last Updated:** December 8, 2025
**Next Review:** After Phase 1 implementation
