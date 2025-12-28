# Storyteller Studio & Interior Design Studio Strategy

**Version:** 1.0
**Date:** December 26, 2025
**Status:** Design Phase

---

## Executive Summary

This document outlines the design strategy for implementing two new Studios in Creative Canvas:
- **Storyteller Studio** - For narrative creation, character development, world-building, and branching stories
- **Interior Design Studio** - For room redesign, virtual staging, and space visualization

Both studios will follow the established patterns from Social and Moodboard Studios, utilizing:
- `StudioShell` for consistent layout and mode switching
- `FlowMode` for guided step-by-step workflows
- `WorkspaceMode` for power-user panel layouts
- `StudioCommandPalette` for keyboard-driven navigation

---

## 1. Audit Summary

### 1.1 Storytelling Implementation Status

| Component | Count | Status |
|-----------|-------|--------|
| **Nodes Defined** | 28 | Complete |
| **API Endpoints (Swagger v17)** | 9 | Defined |
| **Service Implementation** | 4/9 | Partial |
| **Type Mappings** | Complete | apiEnumMapper.ts |

**Implemented API Endpoints (Working):**
- `POST /api/storytelling/start` - Story Genesis
- `POST /api/storytelling/dialogue/generate` - Dialogue Generator
- `POST /api/storytelling/world/environment` - Location Creator
- `GET /api/storytelling/health` - Health Check

**Defined in Swagger but Service Incomplete:**
- `POST /api/storytelling/structure` - Story Structure
- `POST /api/storytelling/generate-scene` - Scene Generator
- `POST /api/storytelling/generate-twist` - Plot Twist
- `POST /api/storytelling/enhance` - Story Enhancer
- `POST /api/character-library/generate` - Character Creator

**Node Categories:**
1. **Narrative Foundation** (10 nodes): storyGenesis, storyStructure, treatmentGenerator, sceneGenerator, plotPoint, plotTwist, conflictGenerator, storyPivot, intrigueLift, storyEnhancer
2. **Character Development** (4 nodes): characterCreator, characterRelationship, characterVoice, characterSheet
3. **World Building** (3 nodes): locationCreator, worldLore, storyTimeline
4. **Dialogue** (2 nodes): dialogueGenerator, monologueGenerator
5. **Branching Narratives** (3 nodes): choicePoint, consequenceTracker, pathMerge
6. **Visualization & Output** (4 nodes): sceneVisualizer, screenplayFormatter, storySynthesizer

### 1.2 Interior Design Implementation Status

| Component | Count | Status |
|-----------|-------|--------|
| **Nodes Defined** | 6 | Complete |
| **API Endpoints** | 6/6 | **Production Ready** |
| **Service Implementation** | 6/6 | Complete |
| **Async Job Pattern** | Yes | pollUntilComplete() |

**All Endpoints Working:**
- `POST /api/interior/room-redesign` - Room Redesign
- `POST /api/interior/virtual-staging` - Virtual Staging
- `POST /api/interior/floor-plan` - Floor Plan Generator
- `POST /api/interior/furniture/suggest` - Furniture Suggestions
- `POST /api/interior/materials/palette` - Material Palette
- `POST /api/interior/3d/visualize` - 3D Room Preview

---

## 2. Storyteller Studio Design

### 2.1 Studio Modes

```typescript
type StudioMode = 'flow' | 'workspace' | 'timeline';
```

| Mode | Purpose | Primary Users |
|------|---------|---------------|
| **Flow** | Guided story creation wizards | Beginners, Quick projects |
| **Workspace** | Multi-panel editor with chapters, characters, outline | Writers, Complex projects |
| **Timeline** | Story arc visualization, plot points across acts | Planners, Visual thinkers |

### 2.2 Flow Mode - Guided Flows

#### Flow 1: Create Story (Primary)
**Steps:** Concept → Characters → Structure → Generate → Refine

```typescript
const CREATE_STORY_STEPS: FlowStep[] = [
  { id: 'concept', label: 'Concept', description: 'Describe your story idea' },
  { id: 'characters', label: 'Characters', description: 'Define main characters' },
  { id: 'structure', label: 'Structure', description: 'Choose story framework' },
  { id: 'generate', label: 'Generate', description: 'AI creates your story' },
  { id: 'refine', label: 'Refine', description: 'Review and export' },
];
```

**API Calls (Parallel where possible):**
1. `/api/storytelling/start` - Generate initial story concept
2. `/api/character-library/generate` - Generate characters (per character)
3. `/api/storytelling/structure` - Generate structured outline
4. `/api/storytelling/generate-scene` - Generate key scenes

#### Flow 2: Create Character
**Steps:** Profile → Voice → Relationships → Visual → Export

```typescript
const CREATE_CHARACTER_STEPS: FlowStep[] = [
  { id: 'profile', label: 'Profile', description: 'Basic character details' },
  { id: 'voice', label: 'Voice', description: 'Define speaking style' },
  { id: 'relationships', label: 'Relationships', description: 'Connect to other characters' },
  { id: 'visual', label: 'Visual', description: 'Generate character art' },
  { id: 'export', label: 'Export', description: 'Download character sheet' },
];
```

#### Flow 3: Create Branching Story (Advanced)
**Steps:** Setup → Branches → Consequences → Merge → Preview

### 2.3 Workspace Mode Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Storyteller Studio  │ [Flow] [Workspace] [Timeline]  │ ⌘K │
├───────────┬─────────────────────────────────┬───────────────┤
│ CHAPTERS  │                                 │ PROPERTIES    │
│ ────────  │                                 │ ──────────    │
│ Ch 1 ✓    │         MAIN EDITOR             │ Word Count    │
│ Ch 2 ✓    │                                 │ Tone: Dark    │
│ Ch 3 •    │   [Scene content displayed]     │ POV: 3rd      │
│ Ch 4      │                                 │               │
│           │                                 │ CHARACTERS    │
│ OUTLINE   │                                 │ ──────────    │
│ ────────  │                                 │ [Avatar] Alex │
│ • Act 1   │                                 │ [Avatar] Sam  │
│   • Setup │                                 │               │
│   • Inc.  │                                 │ AI ASSIST     │
│ • Act 2   │                                 │ ──────────    │
│           │                                 │ [Enhance]     │
├───────────┴─────────────────────────────────┴───────────────┤
│  Ch 3 of 12  │  2,450 words  │  Last saved: 2 min ago       │
└─────────────────────────────────────────────────────────────┘
```

**Left Panels:**
1. **Chapters** - Navigate story structure
2. **Outline** - Act/beat breakdown (collapsible)
3. **Characters** - Quick character reference

**Right Panels:**
1. **Properties** - Scene metadata, word count, tone
2. **AI Assist** - Enhance, Add Conflict, Generate Dialogue
3. **World Lore** - Reference world details

### 2.4 Timeline Mode

Visual representation of story arc:
- Horizontal timeline with Acts as major divisions
- Plot points as vertical markers
- Character arcs as parallel tracks
- Drag-and-drop scene reordering

### 2.5 Command Palette Commands

```typescript
const storyCommands: Command[] = [
  // Actions
  { id: 'create-story', label: 'Create New Story', shortcut: '⌘N', category: 'actions' },
  { id: 'create-character', label: 'Create Character', shortcut: '⌘⇧C', category: 'actions' },
  { id: 'add-scene', label: 'Add Scene', shortcut: '⌘⇧S', category: 'actions' },
  { id: 'generate-dialogue', label: 'Generate Dialogue', category: 'actions' },
  { id: 'add-plot-twist', label: 'Add Plot Twist', category: 'actions' },
  { id: 'enhance-scene', label: 'Enhance Current Scene', category: 'actions' },

  // Navigation
  { id: 'switch-flow', label: 'Switch to Flow Mode', category: 'navigation' },
  { id: 'switch-workspace', label: 'Switch to Workspace Mode', category: 'navigation' },
  { id: 'switch-timeline', label: 'Switch to Timeline Mode', category: 'navigation' },

  // Export
  { id: 'export-pdf', label: 'Export as PDF', category: 'export' },
  { id: 'export-screenplay', label: 'Export as Screenplay', category: 'export' },
];
```

### 2.6 Saved Content Types

```typescript
interface SavedStory {
  id: string;
  title: string;
  genre: string;
  wordCount: number;
  chapters: SavedChapter[];
  characters: SavedCharacter[];
  outline: StoryOutline;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedCharacter {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  avatarUrl?: string;
  voiceProfile?: CharacterVoice;
  createdAt: Date;
}

interface SavedChapter {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'review' | 'complete';
  scenes: SavedScene[];
}
```

---

## 3. Interior Design Studio Design

### 3.1 Studio Modes

| Mode | Purpose | Primary Users |
|------|---------|---------------|
| **Flow** | Guided room transformation wizards | Homeowners, Quick redesigns |
| **Workspace** | Multi-room project management | Designers, Full home projects |
| **Timeline** | Project phases, before/after tracking | Renovators |

### 3.2 Flow Mode - Guided Flows

#### Flow 1: Redesign Room (Primary)
**Steps:** Upload → Style → Customize → Generate → Compare

```typescript
const REDESIGN_ROOM_STEPS: FlowStep[] = [
  { id: 'upload', label: 'Upload', description: 'Add your room photo' },
  { id: 'style', label: 'Style', description: 'Choose design direction' },
  { id: 'customize', label: 'Customize', description: 'Fine-tune preferences' },
  { id: 'generate', label: 'Generate', description: 'AI redesigns your room' },
  { id: 'compare', label: 'Compare', description: 'Before/after comparison' },
];
```

**API Calls (Parallel):**
1. `/api/interior/room-redesign` - Main redesign
2. `/api/interior/materials/palette` - Suggested materials
3. `/api/interior/furniture/suggest` - Furniture recommendations

#### Flow 2: Virtual Staging
**Steps:** Upload Empty → Room Type → Style → Generate → Export

```typescript
const VIRTUAL_STAGING_STEPS: FlowStep[] = [
  { id: 'upload', label: 'Upload', description: 'Add empty room photo' },
  { id: 'room-type', label: 'Room Type', description: 'Select room function' },
  { id: 'style', label: 'Style', description: 'Choose staging style' },
  { id: 'generate', label: 'Generate', description: 'AI stages your room' },
  { id: 'export', label: 'Export', description: 'Download staged images' },
];
```

#### Flow 3: Floor Plan to 3D
**Steps:** Draw/Upload → Configure → Materials → Render → Export

### 3.3 Workspace Mode Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Interior Design Studio │ [Flow] [Workspace] [Timeline] │ ⌘K │
├───────────┬─────────────────────────────────┬───────────────┤
│ ROOMS     │                                 │ PROPERTIES    │
│ ────────  │       MAIN PREVIEW AREA         │ ──────────    │
│ Living ✓  │                                 │ Room: Living  │
│ Bedroom   │   [Before/After slider view]    │ Style: Modern │
│ Kitchen   │                                 │ Size: 400sqft │
│ Bath      │                                 │               │
│           │                                 │ MATERIALS     │
│ SAVED     │                                 │ ──────────    │
│ ────────  │                                 │ [Wood] Oak    │
│ [thumb]   │                                 │ [Fabric] Linen│
│ [thumb]   │                                 │               │
│ [thumb]   │                                 │ FURNITURE     │
│           │                                 │ ──────────    │
│           │                                 │ Sofa: $2,400  │
│           │                                 │ Table: $800   │
├───────────┴─────────────────────────────────┴───────────────┤
│  Living Room  │  Modern Scandinavian  │  Generated: 32s    │
└─────────────────────────────────────────────────────────────┘
```

**Left Panels:**
1. **Rooms** - Navigate multi-room projects
2. **Saved Designs** - Gallery of previous generations

**Right Panels:**
1. **Properties** - Room details, dimensions
2. **Materials** - Suggested materials with shop links
3. **Furniture** - Recommended pieces with pricing

### 3.4 Command Palette Commands

```typescript
const interiorCommands: Command[] = [
  // Actions
  { id: 'redesign-room', label: 'Redesign Room', shortcut: '⌘N', category: 'actions' },
  { id: 'virtual-staging', label: 'Virtual Staging', shortcut: '⌘⇧S', category: 'actions' },
  { id: 'create-floorplan', label: 'Create Floor Plan', category: 'actions' },
  { id: 'suggest-furniture', label: 'Get Furniture Suggestions', category: 'actions' },
  { id: 'generate-3d', label: 'Generate 3D Preview', category: 'actions' },

  // Navigation
  { id: 'switch-flow', label: 'Switch to Flow Mode', category: 'navigation' },
  { id: 'switch-workspace', label: 'Switch to Workspace Mode', category: 'navigation' },

  // Export
  { id: 'export-comparison', label: 'Export Before/After', category: 'export' },
  { id: 'export-materials', label: 'Export Material List', category: 'export' },
];
```

### 3.5 Saved Content Types

```typescript
interface SavedRoom {
  id: string;
  name: string;
  roomType: RoomType;
  originalImageUrl: string;
  redesigns: SavedRedesign[];
  createdAt: Date;
}

interface SavedRedesign {
  id: string;
  style: InteriorDesignStyle;
  imageUrl: string;
  materials?: MaterialPalette;
  furniture?: FurnitureSuggestion[];
  generationTimeMs: number;
  createdAt: Date;
}

interface SavedProject {
  id: string;
  name: string;
  rooms: SavedRoom[];
  totalBudget?: number;
  createdAt: Date;
}
```

---

## 4. Implementation Plan

### Phase 1: StudioShell Integration
- Add `'storyteller'` and `'interior'` to `StudioCategory` type
- Update `categoryLabels` in StudioShell
- Register new studios in AppNavigation

### Phase 2: Interior Design Studio (API Ready)
1. Create `InteriorDesignStudio.tsx` component
2. Implement `RedesignRoomFlow.tsx`
3. Implement `VirtualStagingFlow.tsx`
4. Create WorkspaceMode configuration
5. Add before/after slider component

### Phase 3: Storyteller Studio (Partial API)
1. Create `StorytellerStudio.tsx` component
2. Implement `CreateStoryFlow.tsx` (using available endpoints)
3. Implement `CreateCharacterFlow.tsx`
4. Create WorkspaceMode with chapter editor
5. Add Timeline visualization component
6. Mark unavailable features as "Coming Soon"

### Phase 4: Service Layer Updates
1. Update `storyGenerationService.ts` to call all swagger-defined endpoints
2. Add error handling for endpoints that may not be implemented
3. Implement graceful degradation for missing endpoints

---

## 5. File Structure

```
src/components/studios/
├── index.ts                          # Export all studios
├── StudioShell.tsx                   # Updated with new categories
├── StudioCommandPalette.tsx          # Shared command palette
│
├── storyteller/
│   ├── index.ts
│   ├── StorytellerStudio.tsx         # Main container
│   └── flows/
│       ├── index.ts
│       ├── CreateStoryFlow.tsx       # Story creation wizard
│       ├── CreateCharacterFlow.tsx   # Character creation
│       └── CreateBranchingStoryFlow.tsx
│
├── interior/
│   ├── index.ts
│   ├── InteriorDesignStudio.tsx      # Main container
│   └── flows/
│       ├── index.ts
│       ├── RedesignRoomFlow.tsx      # Room redesign wizard
│       ├── VirtualStagingFlow.tsx    # Virtual staging
│       └── FloorPlanTo3DFlow.tsx     # Floor plan workflow
│
├── shared/
│   ├── index.ts
│   ├── BeforeAfterSlider.tsx         # Comparison component
│   ├── TimelineEditor.tsx            # Story timeline
│   └── ChapterEditor.tsx             # Rich text for stories
│
└── modes/
    ├── FlowMode.tsx                  # Existing
    ├── WorkspaceMode.tsx             # Existing
    └── TimelineMode.tsx              # Existing
```

---

## 6. API Gap Analysis

### 6.1 Storyteller Studio - Service Updates Required

**Current `storyGenerationService.ts` Issues:**

| Method | Current Endpoint | Swagger Endpoint | Action |
|--------|-----------------|------------------|--------|
| `generateStoryStructure` | `/api/agent/story/generate-structure` | `/api/storytelling/structure` | Update URL |
| `generateScene` | `/api/agent/scene/generate` | `/api/storytelling/generate-scene` | Update URL |
| `generatePlotTwist` | `/api/agent/story/generate-twist` | `/api/storytelling/generate-twist` | Update URL |
| `enhanceStory` | `/api/agent/story/enhance` | `/api/storytelling/enhance` | Update URL |
| `generateCharacter` | `/api/agent/character/generate` | `/api/character-library/generate` | Update URL |

**Recommendation:** Update service layer to use swagger-defined endpoints, test each endpoint, implement graceful error handling.

### 6.2 Interior Design Studio - Ready to Use

All 6 endpoints confirmed working. No changes needed.

### 6.3 Endpoints Needed for Full Studio Feature Set

**Storytelling - Not in Swagger (Phase 2+):**

| Endpoint | Purpose | Studio Feature |
|----------|---------|----------------|
| `POST /api/storytelling/character/voice` | Voice profile generation | Character voice flow |
| `POST /api/storytelling/character/relationship` | Relationship analysis | Character connections |
| `POST /api/storytelling/world/lore` | World-building | World lore panel |
| `POST /api/storytelling/world/timeline` | Event timeline | Timeline mode |
| `POST /api/storytelling/branch/choice` | Branch points | Branching flow |
| `POST /api/storytelling/branch/consequence` | Track consequences | Branching flow |
| `POST /api/storytelling/branch/merge` | Merge paths | Branching flow |
| `POST /api/storytelling/format/screenplay` | Format as screenplay | Export feature |
| `POST /api/storytelling/visualize/scene` | Generate scene image | Visual mode |

---

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Storytelling API endpoints not fully implemented | HIGH | Mark features as "Coming Soon", test each endpoint before launch |
| Timeline mode complexity | MEDIUM | Start with simple horizontal view, iterate based on feedback |
| Large story state management | MEDIUM | Consider dedicated story store, lazy loading for chapters |
| Character sheet image generation slow | LOW | Use async job pattern with progress indicator |

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Studio adoption | 40% of users try within first week | Analytics |
| Flow completion rate | >70% complete guided flows | Analytics |
| Generation success rate | >95% (Interior), >80% (Story) | API monitoring |
| User satisfaction | >4.2/5 rating | Surveys |

---

## Appendix A: Design Token Usage

Studios use shared tokens from `studioTokens.ts`:
- `studioColors.ink` - Background
- `studioColors.carbon` - Header/footer
- `studioColors.accent` - Primary actions (#3B9B94)
- `studioTypography` - Font sizes, weights
- `studioRadii` - Border radius values
- `studioMotion` - Animation timings

---

## Appendix B: Related Documentation

- `docs/STORYTELLING_API_REQUIREMENTS.md` - Original API specification
- `docs/STORYTELLING_NODE_STRATEGY.md` - Node architecture details
- `docs/INTERIOR_DESIGN_NODE_STRATEGY.md` - Interior node details
- `docs/NEW_CATEGORIES_API_REQUIREMENTS.md` - Category API specs
- `src/services/storyGenerationService.ts` - Current service implementation
- `src/services/interiorDesignService.ts` - Interior service (reference)
