# Stack Workflows - API Requirements Addendum

**Version**: 1.1
**Date**: December 7, 2025
**Status**: Specification for Backend Implementation
**Base Document**: `docs/STACK_WORKFLOWS_API_REQUIREMENTS.md` (v1.0)

---

## Executive Summary

This addendum extends the Stack Workflows API to support **12 new stack types**:
- **4 Innovation Stacks** (vertical 9:16) - Advanced psychological/cinematic effects
- **8 Horizontal Queues** (wide-format 16:9 / 21:9 / 32:9) - Spatial/narrative expansion

The existing API structure remains unchanged; this addendum documents the new stack types, their frame schemas, prompt templates, and validation rules.

---

## 1. New Stack Types

### 1.1 Complete Stack Type Enum

```typescript
type StackType =
  // === FOUNDATIONAL STACKS (Original 6) ===
  | 'split'             // Spatial - multiple camera angles (vertical 9:16)
  | 'time'              // Temporal - action timeline progression (vertical 9:16)
  | 'interaction'       // Dialogue - shot/reverse-shot (vertical 9:16, 2 frames)
  | 'component'         // Layers - depth separation for parallax (horizontal 16:9)
  | 'variable'          // Performance - expression/emotion matrix (grid 1:1)
  | 'cause-effect'      // Physics - before/after anchoring (vertical 9:16, 2 frames)
  // === INNOVATION STACKS - Vertical (9:16) ===
  | 'subconscious'      // Psychological projection - reality vs perception
  | 'z-axis'            // Fractal/infinite dolly - extreme wide to macro
  | 'chrono-illumination' // Time passage - lighting progression (morning/noon/night)
  | 'multiverse'        // Style/genre shifts - same scene in different styles
  // === HORIZONTAL QUEUES - Wide Format ===
  | 'panorama'          // Ultra-wide establishing shot for camera pans (21:9)
  | 'walk-cycle'        // Locomotion consistency frames (16:9)
  | 'dialogue-beat'     // Storyboard strip setup-action-reaction (16:9)
  | 'environment-360'   // Cardinal direction world building (32:9)
  | 'split-diopter'     // Tension focus extreme FG + BG sharp (21:9)
  | 'motion-trail'      // Action blueprint with ghost trails (16:9)
  | 'mirror-dimension'  // Thematic reflection reality vs truth (16:9)
  | 'peripheral';       // Horror reveal central + edge threats (21:9)
```

### 1.2 Extended Canvas Ratios

| Canvas Ratio | Pixel Dimensions (Standard) | Pixel Dimensions (High) | Use Cases |
|--------------|----------------------------|-------------------------|-----------|
| 9:16 | 1080 × 1920 | 2160 × 3840 | Foundational Stacks, Innovation Stacks |
| 16:9 | 1920 × 1080 | 3840 × 2160 | Component, Walk-Cycle, Dialogue-Beat, Motion-Trail, Mirror-Dimension |
| 1:1 | 1024 × 1024 | 2048 × 2048 | Variable |
| **21:9** | 2520 × 1080 | 5040 × 2160 | **NEW:** Panorama, Split-Diopter, Peripheral |
| **32:9** | 3440 × 1080 | 6880 × 2160 | **NEW:** Environment-360 |

---

## 2. Innovation Stacks (4 Types)

### 2.1 Subconscious Stack

**Purpose:** Reality vs perception duality - psychological projection showing external reality alongside internal perception.

**Canvas:** 9:16 (vertical)
**Frames:** 2-4 (typically 2)

**Frame Schema:**
```typescript
interface SubconsciousStackFrame {
  index: number;
  layer: 'reality' | 'perception' | 'memory' | 'fear';
  psychologicalNote?: string;  // "character's self-doubt manifests"
  visualDistortion?: 'none' | 'subtle' | 'moderate' | 'extreme';
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a {frameCount}-frame vertical stack showing psychological duality.
Scene: {sceneDescription}
Frame 1 (TOP - Reality): External world as it exists - {realityFrame.psychologicalNote}
Frame 2 (BOTTOM - Perception): Internal perception/projection - {perceptionFrame.psychologicalNote}
Maintain identical character placement/pose across layers.
Lighting should shift: reality = neutral, perception = {perceptionFrame.visualDistortion} distortion.
```

**Use Cases:**
- Dream sequences
- Character internal conflict
- Memory vs reality
- Psychological thriller moments

---

### 2.2 Z-Axis Stack

**Purpose:** Infinite dolly zoom from extreme wide to macro detail - fractal scale progression.

**Canvas:** 9:16 (vertical)
**Frames:** 3-6 (typically 4)

**Frame Schema:**
```typescript
interface ZAxisStackFrame {
  index: number;
  scaleLevel: 'extreme-wide' | 'wide' | 'medium' | 'close' | 'macro' | 'micro';
  focalDistance: string;  // "1km" | "100m" | "10m" | "1m" | "10cm" | "1cm"
  depthCue?: string;      // "mountains visible" | "subject fills frame"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate {frameCount} stacked frames showing scale progression from extreme wide to macro.
Scene: {sceneDescription}
{frames.map(f => `Frame ${f.index + 1}: ${f.scaleLevel} shot, focal distance ~${f.focalDistance}. ${f.depthCue || ''}`).join('. ')}
Each frame zooms progressively deeper into the scene.
Maintain perfect alignment on central subject across all frames.
```

**Use Cases:**
- Epic reveal shots (galaxy → planet → city → person)
- Vertigo/dolly zoom effect
- Scale-shift sequences
- Infinite corridor illusions

---

### 2.3 Chrono-Illumination Stack

**Purpose:** Time passage through lighting progression - same scene at different times of day.

**Canvas:** 9:16 (vertical)
**Frames:** 3-6 (typically 4)

**Frame Schema:**
```typescript
interface ChronoIlluminationStackFrame {
  index: number;
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'golden-hour' | 'dusk' | 'night' | 'midnight';
  lightingNote?: string;  // "long shadows" | "harsh overhead" | "warm golden glow"
  weatherCondition?: 'clear' | 'cloudy' | 'overcast' | 'foggy';
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate {frameCount} stacked frames showing same scene at different times of day.
Scene: {sceneDescription}
{frames.map(f => `Frame ${f.index + 1}: ${f.timeOfDay} - ${f.lightingNote || 'natural lighting'}. Weather: ${f.weatherCondition || 'clear'}`).join('. ')}
CRITICAL: Identical scene composition, only lighting/sky changes.
Character position and pose must be IDENTICAL across all frames.
```

**Use Cases:**
- Time-lapse sequences
- Day-in-the-life montages
- Mood progression
- Environmental storytelling

---

### 2.4 Multiverse Stack

**Purpose:** Same scene rendered in different artistic styles/genres - style exploration.

**Canvas:** 9:16 (vertical)
**Frames:** 2-6 (typically 4)

**Frame Schema:**
```typescript
interface MultiverseStackFrame {
  index: number;
  styleGenre: string;  // "photorealistic" | "anime" | "oil painting" | "pixel art" | "noir" | "cyberpunk"
  colorPalette?: string;  // "warm earth tones" | "neon" | "monochrome"
  artisticInfluence?: string;  // "Studio Ghibli" | "Blade Runner" | "Van Gogh"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate {frameCount} stacked frames showing identical scene in different art styles.
Scene: {sceneDescription}
{frames.map(f => `Frame ${f.index + 1}: ${f.styleGenre} style${f.artisticInfluence ? ` inspired by ${f.artisticInfluence}` : ''}. ${f.colorPalette ? `Palette: ${f.colorPalette}` : ''}`).join('. ')}
CRITICAL: Identical composition, character pose, and camera angle across ALL frames.
Only the artistic rendering style changes, not the scene content.
```

**Use Cases:**
- Style exploration for art direction
- Genre comparison pitches
- Cross-universe storytelling
- Animation style testing

---

## 3. Horizontal Queues (8 Types)

### 3.1 Panorama Queue

**Purpose:** Ultra-wide establishing shot for horizontal camera pans.

**Canvas:** 21:9 (ultra-wide)
**Frames:** 3 panels (left, center, right)

**Frame Schema:**
```typescript
interface PanoramaQueueFrame {
  index: number;
  panelPosition: 'left' | 'center' | 'right';
  contentFocus?: string;  // "mountains" | "protagonist" | "city skyline"
  cameraDirection?: 'pan-left' | 'static' | 'pan-right';
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate an ultra-wide 21:9 panoramic image with 3 seamless panels arranged horizontally.
Scene: {sceneDescription}
Left Panel: {leftFrame.contentFocus || 'scene begins'}
Center Panel: {centerFrame.contentFocus || 'main subject'}
Right Panel: {rightFrame.contentFocus || 'scene continues'}
CRITICAL: Panels must seamlessly connect with consistent horizon line, lighting, and perspective.
Designed for horizontal camera pan animation.
```

**Use Cases:**
- Epic landscape reveals
- City skyline pans
- Battle scene establishing shots
- Horizontal parallax backgrounds

---

### 3.2 Walk Cycle Queue

**Purpose:** Locomotion consistency frames for character animation.

**Canvas:** 16:9 (horizontal)
**Frames:** 4-8 (typically 4: contact-passing-contact-passing)

**Frame Schema:**
```typescript
interface WalkCycleQueueFrame {
  index: number;
  cyclePhase: 'contact-left' | 'passing-left' | 'contact-right' | 'passing-right' | 'custom';
  footPosition?: string;  // "left foot forward" | "mid-stride"
  armPosition?: string;   // "opposite swing"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a {frameCount}-frame horizontal strip showing walk cycle phases.
Scene: {sceneDescription}
{frames.map(f => `Frame ${f.index + 1}: ${f.cyclePhase} phase - ${f.footPosition || 'natural'}, arms ${f.armPosition || 'opposite swing'}`).join('. ')}
CRITICAL: Character identity MUST be identical across all frames.
Frames arranged left-to-right in locomotion sequence order.
Same background, same lighting, only leg/arm positions change.
```

**Use Cases:**
- Character walk cycles for animation
- Run/sprint sequences
- Creature locomotion
- Dance move breakdown

---

### 3.3 Dialogue Beat Queue

**Purpose:** Storyboard strip with setup-action-reaction narrative beats.

**Canvas:** 16:9 (horizontal)
**Frames:** 3-4 (setup, action, reaction, [resolution])

**Frame Schema:**
```typescript
interface DialogueBeatQueueFrame {
  index: number;
  beatType: 'setup' | 'action' | 'reaction' | 'resolution';
  shotType: 'wide' | 'medium' | 'close-up' | 'over-shoulder';
  emotionalBeat?: string;  // "tension builds" | "surprise reveal" | "emotional release"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a {frameCount}-panel horizontal storyboard strip.
Scene: {sceneDescription}
{frames.map(f => `Panel ${f.index + 1} (${f.beatType.toUpperCase()}): ${f.shotType} shot - ${f.emotionalBeat || 'story moment'}`).join('. ')}
Panels flow left-to-right as narrative progression.
Maintain character consistency across all panels.
Each panel tells part of the story beat sequence.
```

**Use Cases:**
- Storyboard strips
- Comic panel sequences
- Conversation beats
- Action-reaction timing

---

### 3.4 Environment 360 Queue

**Purpose:** Cardinal direction views for world building (N-E-S-W).

**Canvas:** 32:9 (super-wide)
**Frames:** 4 panels (North, East, South, West)

**Frame Schema:**
```typescript
interface Environment360QueueFrame {
  index: number;
  cardinalDirection: 'north' | 'east' | 'south' | 'west';
  landmarkNote?: string;  // "main castle" | "distant mountains" | "ocean view"
  lightingDirection?: string;  // "sun behind" | "sun ahead"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a 32:9 super-wide environment strip showing 4 cardinal direction views.
Scene: {sceneDescription}
North Panel: {northFrame.landmarkNote || 'northern view'}
East Panel: {eastFrame.landmarkNote || 'eastern view'}
South Panel: {southFrame.landmarkNote || 'southern view'}
West Panel: {westFrame.landmarkNote || 'western view'}
CRITICAL: All panels share same location, time of day, and atmospheric conditions.
Sun position must be consistent with cardinal directions.
Designed for 360° environment reference or VR skybox creation.
```

**Use Cases:**
- Game level design reference
- Virtual set extension
- Location scouting
- 360° environment reference

---

### 3.5 Split Diopter Queue

**Purpose:** Tension focus with extreme foreground and background both sharp - dual focus planes.

**Canvas:** 21:9 (ultra-wide)
**Frames:** 2 focus planes (foreground sharp, background sharp)

**Frame Schema:**
```typescript
interface SplitDiopterQueueFrame {
  index: number;
  focusPlane: 'extreme-foreground' | 'extreme-background';
  subjectDescription?: string;  // "villain's hand on weapon" | "hero's face in distance"
  focalDepth: string;  // "0.5m" | "50m"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a split-diopter composition in 21:9 ultra-wide format.
Scene: {sceneDescription}
Left half - EXTREME FOREGROUND ({foregroundFrame.focalDepth}): {foregroundFrame.subjectDescription || 'foreground element'}, RAZOR SHARP focus
Right half - EXTREME BACKGROUND ({backgroundFrame.focalDepth}): {backgroundFrame.subjectDescription || 'background element'}, RAZOR SHARP focus
De Palma-style split focus creating visual tension.
Both subjects must be in perfect focus simultaneously.
Narrative tension between foreground and background elements.
```

**Use Cases:**
- Thriller tension shots
- Dramatic confrontations
- De Palma-style compositions
- Dual focus storytelling

---

### 3.6 Motion Trail Queue

**Purpose:** Action blueprint with ghost trails showing movement arc.

**Canvas:** 16:9 (horizontal)
**Frames:** 4-8 positions showing motion arc

**Frame Schema:**
```typescript
interface MotionTrailQueueFrame {
  index: number;
  motionPhase: 'start' | 'mid-arc' | 'peak' | 'follow-through' | 'end';
  opacity: number;  // 0.2 to 1.0 (ghost to solid)
  velocityNote?: string;  // "accelerating" | "maximum speed" | "decelerating"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a motion trail composition showing {frameCount} ghost positions of action.
Scene: {sceneDescription}
{frames.map(f => `Position ${f.index + 1}: ${f.motionPhase} - ${f.opacity * 100}% opacity${f.velocityNote ? `, ${f.velocityNote}` : ''}`).join('. ')}
Character appears multiple times showing motion arc trajectory.
Leftmost = start position, rightmost = end position.
Opacity decreases for older positions (ghost trail effect).
Same character, progressive motion blur on trailing ghosts.
```

**Use Cases:**
- Action choreography planning
- Sports motion studies
- Animation path planning
- Speed/velocity visualization

---

### 3.7 Mirror Dimension Queue

**Purpose:** Thematic reflection showing reality vs reflection (inner truth).

**Canvas:** 16:9 (horizontal)
**Frames:** 2 (reality, reflection)

**Frame Schema:**
```typescript
interface MirrorDimensionQueueFrame {
  index: number;
  dimension: 'reality' | 'reflection';
  truthReveal?: string;  // "shows true monster form" | "reveals hidden sadness"
  mirrorType?: 'literal' | 'water' | 'metaphorical';
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a horizontal mirror dimension composition showing reality vs reflection.
Scene: {sceneDescription}
Left half (REALITY): Character as they appear to the world
Right half (REFLECTION): {reflectionFrame.truthReveal || 'inner truth revealed'}
Mirror type: {reflectionFrame.mirrorType || 'literal'}
CRITICAL: Same pose, but reflection reveals hidden truth about character.
Reflection should NOT be a simple mirror flip - it shows inner self.
```

**Use Cases:**
- Character duality
- Mirror world sequences
- Truth vs illusion
- Supernatural reveals

---

### 3.8 Peripheral Queue

**Purpose:** Horror reveal with central focus and edge-of-frame threats.

**Canvas:** 21:9 (ultra-wide)
**Frames:** 3 (left-edge, center, right-edge)

**Frame Schema:**
```typescript
interface PeripheralQueueFrame {
  index: number;
  zone: 'left-peripheral' | 'central-focus' | 'right-peripheral';
  visibilityLevel: 'hidden' | 'barely-visible' | 'emerging' | 'revealed';
  threatDescription?: string;  // "shadow figure" | "reaching hand" | "glowing eyes"
  customInstruction?: string;
}
```

**Prompt Template:**
```
Generate a peripheral horror composition in 21:9 ultra-wide.
Scene: {sceneDescription}
CENTER: Protagonist's focus point - {centralFrame.threatDescription || 'main scene'}
LEFT EDGE: {leftFrame.visibilityLevel} threat - {leftFrame.threatDescription || 'peripheral element'}
RIGHT EDGE: {rightFrame.visibilityLevel} threat - {rightFrame.threatDescription || 'peripheral element'}
Central subject is well-lit and in focus.
Edge threats are ${frames.find(f => f.zone !== 'central-focus')?.visibilityLevel || 'barely-visible'} - lurking just at edge of frame.
Creates dread through peripheral awareness.
```

**Use Cases:**
- Horror creeping dread
- Suspense edge reveals
- Threat awareness shots
- Paranoia-inducing frames

---

## 4. Database Schema Updates

### 4.1 Stack Jobs Table - Update CHECK Constraint

```sql
-- Migration: 2025_12_07_001_extend_stack_types.sql

-- Drop existing constraint
ALTER TABLE stack_jobs DROP CONSTRAINT IF EXISTS stack_jobs_stack_type_check;

-- Add extended constraint
ALTER TABLE stack_jobs ADD CONSTRAINT stack_jobs_stack_type_check
  CHECK (stack_type IN (
    -- Foundational (6)
    'split', 'time', 'interaction', 'component', 'variable', 'cause-effect',
    -- Innovation (4)
    'subconscious', 'z-axis', 'chrono-illumination', 'multiverse',
    -- Queues (8)
    'panorama', 'walk-cycle', 'dialogue-beat', 'environment-360',
    'split-diopter', 'motion-trail', 'mirror-dimension', 'peripheral'
  ));

-- Drop existing canvas ratio constraint
ALTER TABLE stack_jobs DROP CONSTRAINT IF EXISTS stack_jobs_canvas_ratio_check;

-- Add extended canvas ratio constraint
ALTER TABLE stack_jobs ADD CONSTRAINT stack_jobs_canvas_ratio_check
  CHECK (canvas_ratio IN ('9:16', '16:9', '1:1', '21:9', '32:9'));
```

### 4.2 Stack Presets - Seed New Presets

```sql
-- Migration: 2025_12_07_002_seed_innovation_presets.sql

INSERT INTO stack_presets (id, tenant_id, name, description, stack_type, frame_count, frames, category, popularity, is_system)
VALUES
  -- Innovation Stack Presets
  (gen_random_uuid(), NULL, 'Dream Sequence Duality', '2-frame reality vs perception for dream sequences', 'subconscious', 2,
   '[{"index":0,"layer":"reality","visualDistortion":"none"},{"index":1,"layer":"perception","visualDistortion":"moderate"}]'::jsonb,
   'psychological', 0, TRUE),

  (gen_random_uuid(), NULL, 'Epic Scale Zoom', '4-frame extreme wide to macro zoom', 'z-axis', 4,
   '[{"index":0,"scaleLevel":"extreme-wide","focalDistance":"1km"},{"index":1,"scaleLevel":"wide","focalDistance":"100m"},{"index":2,"scaleLevel":"close","focalDistance":"1m"},{"index":3,"scaleLevel":"macro","focalDistance":"10cm"}]'::jsonb,
   'cinematography', 0, TRUE),

  (gen_random_uuid(), NULL, 'Day Cycle', '4-frame dawn to dusk time progression', 'chrono-illumination', 4,
   '[{"index":0,"timeOfDay":"dawn","lightingNote":"golden pink sky"},{"index":1,"timeOfDay":"noon","lightingNote":"harsh overhead"},{"index":2,"timeOfDay":"golden-hour","lightingNote":"warm orange glow"},{"index":3,"timeOfDay":"night","lightingNote":"moonlit blue"}]'::jsonb,
   'environmental', 0, TRUE),

  (gen_random_uuid(), NULL, 'Style Exploration 4-Way', '4 art styles for same scene', 'multiverse', 4,
   '[{"index":0,"styleGenre":"photorealistic","colorPalette":"natural"},{"index":1,"styleGenre":"anime","artisticInfluence":"Studio Ghibli"},{"index":2,"styleGenre":"oil painting","artisticInfluence":"impressionist"},{"index":3,"styleGenre":"noir","colorPalette":"monochrome"}]'::jsonb,
   'style', 0, TRUE),

  -- Queue Presets
  (gen_random_uuid(), NULL, 'Epic Panorama', '3-panel ultra-wide establishing shot', 'panorama', 3,
   '[{"index":0,"panelPosition":"left","cameraDirection":"pan-right"},{"index":1,"panelPosition":"center","cameraDirection":"static"},{"index":2,"panelPosition":"right","cameraDirection":"pan-right"}]'::jsonb,
   'cinematography', 0, TRUE),

  (gen_random_uuid(), NULL, 'Standard Walk Cycle', '4-frame locomotion cycle', 'walk-cycle', 4,
   '[{"index":0,"cyclePhase":"contact-left","footPosition":"left foot forward"},{"index":1,"cyclePhase":"passing-left","footPosition":"mid-stride"},{"index":2,"cyclePhase":"contact-right","footPosition":"right foot forward"},{"index":3,"cyclePhase":"passing-right","footPosition":"mid-stride"}]'::jsonb,
   'animation', 0, TRUE),

  (gen_random_uuid(), NULL, 'Story Beat Strip', '3-panel setup-action-reaction', 'dialogue-beat', 3,
   '[{"index":0,"beatType":"setup","shotType":"wide","emotionalBeat":"tension builds"},{"index":1,"beatType":"action","shotType":"close-up","emotionalBeat":"dramatic moment"},{"index":2,"beatType":"reaction","shotType":"medium","emotionalBeat":"emotional response"}]'::jsonb,
   'storyboard', 0, TRUE),

  (gen_random_uuid(), NULL, 'World Cardinal Views', '4-direction environment reference', 'environment-360', 4,
   '[{"index":0,"cardinalDirection":"north","lightingDirection":"sun behind"},{"index":1,"cardinalDirection":"east","lightingDirection":"sun left"},{"index":2,"cardinalDirection":"south","lightingDirection":"sun ahead"},{"index":3,"cardinalDirection":"west","lightingDirection":"sun right"}]'::jsonb,
   'environment', 0, TRUE),

  (gen_random_uuid(), NULL, 'Tension Split Focus', 'Split diopter dual focus', 'split-diopter', 2,
   '[{"index":0,"focusPlane":"extreme-foreground","focalDepth":"0.5m"},{"index":1,"focusPlane":"extreme-background","focalDepth":"20m"}]'::jsonb,
   'cinematography', 0, TRUE),

  (gen_random_uuid(), NULL, 'Action Arc Trail', '6-position motion ghost trail', 'motion-trail', 6,
   '[{"index":0,"motionPhase":"start","opacity":0.3},{"index":1,"motionPhase":"mid-arc","opacity":0.4},{"index":2,"motionPhase":"mid-arc","opacity":0.5},{"index":3,"motionPhase":"peak","opacity":0.7},{"index":4,"motionPhase":"follow-through","opacity":0.85},{"index":5,"motionPhase":"end","opacity":1.0}]'::jsonb,
   'action', 0, TRUE),

  (gen_random_uuid(), NULL, 'Mirror Truth', 'Reality vs reflection reveal', 'mirror-dimension', 2,
   '[{"index":0,"dimension":"reality","mirrorType":"literal"},{"index":1,"dimension":"reflection","truthReveal":"true inner self"}]'::jsonb,
   'psychological', 0, TRUE),

  (gen_random_uuid(), NULL, 'Horror Peripheral', 'Edge-of-frame threat reveal', 'peripheral', 3,
   '[{"index":0,"zone":"left-peripheral","visibilityLevel":"barely-visible","threatDescription":"shadow figure"},{"index":1,"zone":"central-focus","visibilityLevel":"revealed"},{"index":2,"zone":"right-peripheral","visibilityLevel":"emerging","threatDescription":"reaching hand"}]'::jsonb,
   'horror', 0, TRUE);
```

---

## 5. Validation Rules

### 5.1 Frame Count Constraints

| Stack Type | Min Frames | Max Frames | Default | Notes |
|------------|------------|------------|---------|-------|
| **Innovation Stacks** |
| subconscious | 2 | 4 | 2 | Reality + perception layers |
| z-axis | 3 | 6 | 4 | Scale progression levels |
| chrono-illumination | 3 | 6 | 4 | Time of day phases |
| multiverse | 2 | 6 | 4 | Art styles |
| **Horizontal Queues** |
| panorama | 3 | 3 | 3 | Left-center-right panels |
| walk-cycle | 4 | 8 | 4 | Locomotion phases |
| dialogue-beat | 3 | 4 | 3 | Narrative beats |
| environment-360 | 4 | 4 | 4 | N-E-S-W directions |
| split-diopter | 2 | 2 | 2 | FG + BG focus planes |
| motion-trail | 4 | 8 | 6 | Ghost trail positions |
| mirror-dimension | 2 | 2 | 2 | Reality + reflection |
| peripheral | 3 | 3 | 3 | Left + center + right |

### 5.2 Canvas Ratio by Stack Type

| Stack Type | Canvas Ratio | Pixel Size (Standard) |
|------------|--------------|----------------------|
| subconscious | 9:16 | 1080 × 1920 |
| z-axis | 9:16 | 1080 × 1920 |
| chrono-illumination | 9:16 | 1080 × 1920 |
| multiverse | 9:16 | 1080 × 1920 |
| panorama | 21:9 | 2520 × 1080 |
| walk-cycle | 16:9 | 1920 × 1080 |
| dialogue-beat | 16:9 | 1920 × 1080 |
| environment-360 | 32:9 | 3440 × 1080 |
| split-diopter | 21:9 | 2520 × 1080 |
| motion-trail | 16:9 | 1920 × 1080 |
| mirror-dimension | 16:9 | 1920 × 1080 |
| peripheral | 21:9 | 2520 × 1080 |

---

## 6. Cost Estimation

### 6.1 Complexity Multipliers

| Stack Type | Multiplier | Rationale |
|------------|------------|-----------|
| **Innovation Stacks** |
| subconscious | 1.4 | Dual reality rendering |
| z-axis | 1.5 | Fractal zoom complexity |
| chrono-illumination | 1.3 | Lighting progression |
| multiverse | 1.6 | Multiple style rendering |
| **Horizontal Queues** |
| panorama | 1.4 | Ultra-wide pixel count |
| walk-cycle | 1.2 | Locomotion consistency |
| dialogue-beat | 1.1 | Storyboard strip |
| environment-360 | 1.5 | Full 32:9 environment |
| split-diopter | 1.3 | Dual focus planes |
| motion-trail | 1.2 | Ghost trail overlays |
| mirror-dimension | 1.4 | Reflection rendering |
| peripheral | 1.2 | Edge detail rendering |

### 6.2 Example Cost Calculations

**Multiverse Stack (4 styles, standard resolution):**
```
Base: 4 frames × $0.02 = $0.08
Multiplier: 1.6 (multiple styles)
Total: $0.08 × 1.6 = $0.128
```

**Environment 360 Queue (4 panels, high resolution):**
```
Base: 4 frames × $0.04 = $0.16
Multiplier: 1.5 (full environment)
Extra: 32:9 canvas surcharge = +$0.05
Total: ($0.16 × 1.5) + $0.05 = $0.29
```

---

## 7. Animation Type Recommendations

| Stack Type | Recommended Animation | Rationale |
|------------|----------------------|-----------|
| subconscious | interpolate | Reality ↔ perception morph |
| z-axis | keyframe | Dolly zoom effect |
| chrono-illumination | keyframe | Time-lapse lighting |
| multiverse | interpolate | Style morphing |
| panorama | single | Camera pan |
| walk-cycle | keyframe | Locomotion animation |
| dialogue-beat | keyframe | Storyboard sequence |
| environment-360 | single | Environment rotate |
| split-diopter | parallax | Depth-based focus |
| motion-trail | keyframe | Action ghost trails |
| mirror-dimension | interpolate | Reality ↔ reflection morph |
| peripheral | single | Horror reveal pan |

---

## 8. Frame Layout Calculations

### 8.1 21:9 Ultra-Wide Layout (3 panels)

```
Canvas: 2520 × 1080
Per-panel: 840 × 1080
Panel positions:
  Panel 0 (left):   x=0, y=0, width=840, height=1080
  Panel 1 (center): x=840, y=0, width=840, height=1080
  Panel 2 (right):  x=1680, y=0, width=840, height=1080
```

### 8.2 32:9 Super-Wide Layout (4 panels)

```
Canvas: 3440 × 1080
Per-panel: 860 × 1080
Panel positions:
  Panel 0 (north): x=0, y=0, width=860, height=1080
  Panel 1 (east):  x=860, y=0, width=860, height=1080
  Panel 2 (south): x=1720, y=0, width=860, height=1080
  Panel 3 (west):  x=2580, y=0, width=860, height=1080
```

---

## 9. Implementation Checklist

### Backend Tasks

- [ ] Update `StackType` enum in DTOs
- [ ] Update database CHECK constraints (migration)
- [ ] Add frame schema validation for 12 new types
- [ ] Implement prompt builders for 12 new types
- [ ] Add frame bounds calculation for 21:9 and 32:9 canvases
- [ ] Seed system presets for new types
- [ ] Update cost estimation logic
- [ ] Update API documentation / Swagger spec

### Frontend Status (Completed ✅)

- ✅ StackType union extended
- ✅ StackCanvasRatio extended (21:9, 32:9)
- ✅ Frame instruction interfaces created
- ✅ STACK_TYPE_CONFIGS populated
- ✅ DEFAULT_STACK_FRAMES populated
- ✅ CompositeMode extended
- ✅ ModeSelector updated with sections
- ✅ Animation type recommendations
- ✅ Cost complexity multipliers

---

**Document Status:** Ready for Backend Implementation
**Frontend Status:** ✅ Complete
**Owner:** Engineering Team
**Last Updated:** December 7, 2025
