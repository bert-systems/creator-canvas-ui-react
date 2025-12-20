# UX Strategy - Creative Canvas Studio

**Last Updated:** December 18, 2025
**Version:** 1.0
**Reference:** `docs/Creator Toolbox - SmartAI International.md`

---

## Executive Summary

This document outlines the UX elevation strategy for Creative Canvas Studio, transforming it from a functional node-based interface into a **sleek, agentic, culturally-grounded creative platform** that embodies the Creator's Toolbox + SmartAI brand identity.

### North Star

> *"A collaborative canvas where creators orchestrate AI agents to explore, organize, and produce culturally resonant work—with the polish of a luxury creative tool and the transparency of professional software."*

---

## 1. Current State Assessment

### 1.1 What's Working

| Element | Assessment |
|---------|------------|
| Dark mode default | Aligns with brand preference |
| Rounded card shapes | Matches shape language (16px radius) |
| Node categorization | Clear type badges (Input, Style, ImageGen) |
| Connection system | Functional port-based connections |
| Left sidebar taxonomy | Logical grouping of node types |
| Reference Image node | Clean upload UX with URL alternative |

### 1.2 Critical Issues

#### Color System Violations

```
CURRENT STATE                    BRAND SPEC
─────────────────────────────    ─────────────────────────────
Input nodes: #22c55e (green)  →  Mint Glow #85E7AE
Error blocks: Heavy red fill  →  Coral Spark #F2492A (subtle)
Warm accent ratio: ~30-40%    →  Max 2-8% of screen
Neutral ratio: ~50-60%        →  70-80% of screen
```

#### Missing Brand Elements

1. **No dot-grid canvas background** (brand specifies 6-8% opacity grid)
2. **No Deep Ocean anchor color** (#154366 for headers/nav)
3. **No Teal Pulse focus states** (missing focus rings)
4. **No agent status indicators** (7 states defined in brand)
5. **Generic typography** (should be Comfortaa + Nunito)
6. **No surface layering** (flat, uniform darkness)
7. **No gradient moments** (reserved for hero/agent activity)

#### Visual Hierarchy Problems

- All nodes have equal visual weight
- No distinction between idle/active/executing states
- Error states dominate rather than inform
- Port handles lack the "bead" motif from brand
- Connection lines lack polish (no glow, no type coloring)

#### Polish Deficit

- Missing micro-interactions and state transitions
- No "rhythm" or "pulse" visual language
- Spacing inconsistencies between elements
- Lack of subtle shadows/elevation
- No skeleton loading states

---

## 2. Design Principles (from Brand Guide)

### 2.1 Core Pillars

1. **Agency-first**: Users orchestrate; AI assists with transparency
2. **Craft-led**: Feels made, not templated—rhythm and pattern discipline
3. **Culturally grounded**: Process motifs (weave, bead, rhythm), not stereotypes
4. **Sleek by default**: Minimal chrome, high contrast, deliberate motion
5. **Trust UI**: Every AI action is legible (what, why, what changed)

### 2.2 Personality Calibration

| Axis | Setting |
|------|---------|
| Modern ↔ Traditional | **Modern (80%)** |
| Sleek ↔ Ornate | **Sleek (85%)** |
| Warm ↔ Clinical | **Warm (60%)** |
| Global ↔ Local | **Balanced with grounded cues** |
| AI "magic" ↔ Transparent tooling | **Transparent (70%)** |

---

## 3. Color System Implementation

### 3.1 Token Mapping

```typescript
// theme.ts - Brand-aligned color tokens

export const brandColors = {
  // Core palette
  deepOcean: '#154366',      // Nav, headers, anchor
  techBlue: '#0A6EB9',       // Secondary actions, info
  tealPulse: '#26CABF',      // Primary actions, focus
  mintGlow: '#85E7AE',       // Success, completed, input nodes
  coralSpark: '#F2492A',     // Error, destructive
  sunsetOrange: '#FC7D21',   // Warning, attention

  // Dark mode neutrals (70-80% of UI)
  ink: '#0B0F14',            // Canvas background
  carbon: '#111111',         // App background
  surface1: '#14171A',       // Card backgrounds
  surface2: '#1E2328',       // Elevated surfaces
  border: '#2A313A',         // Subtle borders

  // Text hierarchy
  textPrimary: '#F5F7FA',
  textSecondary: '#C7D0DA',
  textTertiary: '#94A3B8',
};

// Semantic mapping
export const semanticColors = {
  primaryAction: brandColors.tealPulse,
  primaryActionText: brandColors.ink,
  secondaryAction: brandColors.techBlue,
  success: brandColors.mintGlow,
  warning: brandColors.sunsetOrange,
  danger: brandColors.coralSpark,
  info: brandColors.techBlue,

  // Node categories
  nodeInput: brandColors.mintGlow,
  nodeImageGen: brandColors.tealPulse,
  nodeVideoGen: brandColors.techBlue,
  nodeStyle: brandColors.sunsetOrange,
  nodeCharacter: '#a855f7', // Purple for character
  nodeComposite: '#6366f1', // Indigo for composite
};
```

### 3.2 Usage Ratios (Strict)

```
┌─────────────────────────────────────────────────────────────┐
│  SCREEN COMPOSITION                                         │
├─────────────────────────────────────────────────────────────┤
│  ████████████████████████████████████████░░░░░░░░░░░░  70%  │  Neutrals
│  ░░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░░░░░░░░░░░░░  20%  │  Cool brand
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████   8%  │  Warm accents
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Component Redesign Specifications

### 4.1 Canvas Background

**Current:** Flat `#1a1a2e`
**Target:** Layered with dot-grid

```css
.canvas-background {
  background-color: #0B0F14;
  background-image: radial-gradient(
    circle,
    rgba(199, 208, 218, 0.06) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

### 4.2 Node Card Redesign

**Current Problems:**
- Uniform appearance regardless of state
- Heavy colored headers
- No surface layering

**Target Design:**

```
┌─────────────────────────────────────────┐
│ ┌─ Header (Deep Ocean gradient, subtle) │
│ │  ○ Icon  Label           [Badge]      │
│ └───────────────────────────────────────│
│                                         │
│   Surface 1 background                  │
│   16px radius, 1px border               │
│                                         │
│   Parameters / Content                  │
│                                         │
│ ┌─ Footer (Surface 2)                   │
│ │  Status indicator │ Actions           │
│ └───────────────────────────────────────│
│                                         │
│  ○ Output ports (bead style)          ○ │
└─────────────────────────────────────────┘

States:
- Idle: Border #2A313A, no glow
- Selected: Border Teal Pulse, subtle glow
- Running: Pulsing border animation (Teal→Mint)
- Completed: Mint Glow accent, check icon
- Error: Coral Spark accent, error icon
```

**CSS Specification:**

```css
.node-card {
  background: var(--surface1);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 220ms ease;
}

.node-card:hover {
  border-color: rgba(38, 202, 191, 0.3);
}

.node-card.selected {
  border-color: var(--tealPulse);
  box-shadow: 0 0 0 2px rgba(38, 202, 191, 0.2);
}

.node-card.running {
  animation: pulse-border 1000ms ease infinite;
}

.node-card.completed {
  border-color: var(--mintGlow);
}

.node-card.error {
  border-color: var(--coralSpark);
}

.node-header {
  background: linear-gradient(135deg,
    rgba(21, 67, 102, 0.4) 0%,
    rgba(21, 67, 102, 0.1) 100%);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
```

### 4.3 Port Handle Redesign (Bead Motif)

**Current:** Basic circles
**Target:** Branded "bead" handles

```
Input Port (left side):
  ◯ ─── 12px diameter
  │     2px stroke, rounded
  │     Color matches port type
  │     Fill on hover/connected

Output Port (right side):
  ─── ◯ Same spec, right-aligned
      │
      Subtle glow when data flowing
```

```css
.port-handle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid currentColor;
  background: var(--surface1);
  transition: all 140ms ease;
}

.port-handle:hover {
  background: currentColor;
  transform: scale(1.2);
}

.port-handle.connected {
  background: currentColor;
}

.port-handle[data-type="image"] { color: var(--tealPulse); }
.port-handle[data-type="text"] { color: var(--sunsetOrange); }
.port-handle[data-type="video"] { color: var(--techBlue); }
.port-handle[data-type="character"] { color: #a855f7; }
```

### 4.4 Connection Line Redesign

**Current:** Plain gray lines
**Target:** Typed, animated connections

```css
.connection-line {
  stroke-width: 2px;
  stroke-linecap: round;
  fill: none;
}

.connection-line[data-type="image"] {
  stroke: var(--tealPulse);
}

.connection-line[data-type="text"] {
  stroke: var(--sunsetOrange);
}

.connection-line.active {
  animation: flow 1.5s linear infinite;
  stroke-dasharray: 8 4;
}

@keyframes flow {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}
```

### 4.5 Error State Redesign

**Current:** Heavy red block with text
**Target:** Subtle, informative error

```
┌─────────────────────────────────────────┐
│ ○ Prompt Enhancer              [Style]  │
├─────────────────────────────────────────┤
│                                         │
│  ⚠ Execution failed                     │  ← Coral Spark icon
│  Could not connect to AI service        │  ← Specific message
│                                         │
│  [Retry]  [View Details]                │  ← Actions
│                                         │
└─────────────────────────────────────────┘
     │
     └── 2px left border in Coral Spark
         (not full background fill)
```

---

## 5. Navigation & Layout

### 5.1 Top Navigation Bar

**Current:** Generic dark bar
**Target:** Deep Ocean anchor with hierarchy

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ◉ Creator's Toolbox    My Boards  Canvas  Library  Marketplace    👤    │
│                                                                          │
│  Background: Deep Ocean #154366                                          │
│  Logo: Teal Pulse monochrome                                             │
│  Active tab: Teal underline                                              │
│  Text: #F5F7FA                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Left Sidebar (Creative Palette)

**Improvements needed:**

1. **Search bar**: Add Teal focus ring
2. **Trending cards**: Reduce visual noise, add hover states
3. **Section headers**: Use Comfortaa font
4. **Accordion icons**: 2px stroke, rounded caps
5. **Category badges**: Pill shape (999 radius)

### 5.3 Board Header

**Current:** Flat toolbar
**Target:** Contextual, category-aware

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ← │ Board Name │ [Fashion Design] │  + ⊞ 🎨 │ 💾 ⬇ ↗ │  < 1/3 >        │
│                                                                          │
│  Background: Surface 2 with subtle bottom border                         │
│  Category badge: Category-specific color (Fashion = warm accent)         │
│  Icon buttons: Ghost style, Teal on hover                                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Agent UI System

### 6.1 Agent Status Indicator

Per brand guide, implement 7 distinct states:

| State | Visual | Animation | Color |
|-------|--------|-----------|-------|
| **Idle** | Neutral dot | None | `#94A3B8` |
| **Listening** | Pulsing orb | Slow pulse (1200ms) | Tech Blue |
| **Thinking** | Pulsing orb | Medium pulse (1000ms) | Teal Pulse |
| **Executing** | Progress arc | Traveling dots | Teal→Mint |
| **Needs Approval** | Pause icon | None (stability) | Sunset Orange |
| **Done** | Check icon | Fade in | Mint Glow |
| **Error** | Warning icon | None | Coral Spark |

### 6.2 Agent Dock Component

```
┌─────────────────────────────────────────┐
│  🤖 SmartAI Agent                    ─  │  ← Collapsible
├─────────────────────────────────────────┤
│                                         │
│  ◉ Thinking...                          │  ← Status orb + text
│                                         │
│  Plan:                                  │
│  • Enhance prompt with style keywords   │  ← 1-3 bullet plan
│  • Generate image via FLUX.2 Pro        │
│                                         │
│  Tools: Prompt Enhancer, FLUX.2 Pro     │  ← Tool transparency
│                                         │
│  [Cancel]              [Proceed]        │  ← Clear actions
│                                         │
└─────────────────────────────────────────┘

Position: Bottom-right, above canvas
Background: Surface 2
Border: 1px Border color
Radius: 16px
Shadow: Subtle elevation
```

### 6.3 Trust UI Requirements

Every agent action must display:
- **Plan summary** (1-3 bullets)
- **Tools it will use**
- **What it will change**
- **Undo / rollback** always visible
- **Approval step** for external actions

---

## 7. Typography Implementation

### 7.1 Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
```

### 7.2 Usage Rules

| Context | Font | Weight | Size |
|---------|------|--------|------|
| App name, H1 | Comfortaa | 700 | 32px |
| Section headers, H2 | Comfortaa | 700 | 24px |
| Subsection headers, H3 | Nunito | 700 | 20px |
| Body text | Nunito | 400 | 16px |
| UI labels, buttons | Nunito | 600 | 14px |
| Captions, metadata | Nunito | 400 | 12px |

### 7.3 Text Styling

```css
/* Sentence case for UI (sleeker than Title Case) */
.ui-label {
  text-transform: none;
  font-family: 'Nunito', system-ui, sans-serif;
}

/* Max line length in panels */
.panel-text {
  max-width: 72ch;
}

/* No center alignment except empty states */
.panel-content {
  text-align: left;
}
```

---

## 8. Motion Design

### 8.1 Timing Standards

| Interaction Type | Duration | Easing |
|------------------|----------|--------|
| Micro (hover, focus) | 120-160ms | ease |
| Panel transitions | 180-240ms | ease-out |
| Agent pulse | 900-1200ms loop | ease-in-out |
| Node state change | 220ms | ease |

### 8.2 Animation Principles

1. **Rhythm over chaos**: Pulse, glide, reveal—no bouncy/elastic
2. **Agent motion = meaning**: Animation indicates state, not decoration
3. **Subtle over dramatic**: Users will see these thousands of times

### 8.3 Key Animations

```css
/* Agent thinking pulse */
@keyframes agent-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* Node selection */
@keyframes node-select {
  from { box-shadow: 0 0 0 0 rgba(38, 202, 191, 0.4); }
  to { box-shadow: 0 0 0 4px rgba(38, 202, 191, 0); }
}

/* Data flow on connection */
@keyframes data-flow {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}

/* Success completion */
@keyframes success-pulse {
  0% { background-color: rgba(133, 231, 174, 0); }
  50% { background-color: rgba(133, 231, 174, 0.1); }
  100% { background-color: rgba(133, 231, 174, 0); }
}
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2) ✅ COMPLETED
- [x] Update theme.ts with brand color tokens
- [x] Implement dot-grid canvas background
- [x] Update top navigation to Deep Ocean
- [x] Load Comfortaa + Nunito fonts
- [x] Create base component variants

### Phase 2: Node System (Week 3-4) ✅ COMPLETED
- [x] Redesign node card component (FlowNode updated with brand styling)
- [x] Implement 5 node states (idle, selected, running, completed, error)
- [x] Create port handle "bead" style (12px, hollow stroke, fill on hover)
- [x] Update connection lines with type colors (using theme portColors)
- [x] Add flow animation for active connections (animated dashes)
- [x] Add NodeResizer for resize handles on selected nodes

### Phase 3: Polish (Week 5-6) ✅ COMPLETED
- [x] Implement micro-interactions (hover, focus, click feedback)
- [x] Add skeleton loading states (SkeletonNode component created)
- [x] Refine error state design (shake animation, brand colors)
- [x] Add subtle shadows/elevation (creativeCardTokens.shadows)
- [x] Accessibility audit (focus ring via focusRing utility)

### Phase 4: Agent UI (Week 7-8)
- [ ] Build Agent Dock component
- [ ] Implement 7 agent status states
- [ ] Create Trust UI pattern components
- [ ] Add agent presence indicators
- [ ] Integrate action timeline

### Phase 5: Refinement (Week 9-10)
- [ ] User testing and feedback
- [ ] Performance optimization
- [ ] Animation timing adjustments
- [ ] Documentation updates
- [ ] Design system finalization

---

## 10. Accessibility Checklist

### 10.1 Color Contrast

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| Text Primary on Ink | 15.2:1 | ✅ AA |
| Text Primary on Surface 1 | 13.8:1 | ✅ AA |
| Ink text on Teal Pulse | 4.8:1 | ✅ AA (large) |
| Ink text on Mint Glow | 12.1:1 | ✅ AA |
| Ink text on Coral Spark | 4.5:1 | ✅ AA (large) |

### 10.2 Requirements

- [ ] All interactive elements have visible focus states (2px Teal ring)
- [ ] Color is never the only indicator of state
- [ ] Touch targets minimum 44x44px
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Screen reader announcements for state changes

---

## 11. Design Tokens (Machine-Ready)

```json
{
  "color": {
    "brand": {
      "deepOcean": "#154366",
      "techBlue": "#0A6EB9",
      "tealPulse": "#26CABF",
      "mintGlow": "#85E7AE",
      "coralSpark": "#F2492A",
      "sunsetOrange": "#FC7D21"
    },
    "neutral": {
      "ink": "#0B0F14",
      "carbon": "#111111",
      "surface1": "#14171A",
      "surface2": "#1E2328",
      "border": "#2A313A",
      "textPrimary": "#F5F7FA",
      "textSecondary": "#C7D0DA",
      "textTertiary": "#94A3B8"
    },
    "semantic": {
      "primaryAction": "#26CABF",
      "success": "#85E7AE",
      "warning": "#FC7D21",
      "danger": "#F2492A",
      "info": "#0A6EB9"
    }
  },
  "typography": {
    "fontFamily": {
      "brand": "Comfortaa, system-ui, sans-serif",
      "ui": "Nunito, system-ui, sans-serif"
    },
    "fontSize": {
      "h1": "32px",
      "h2": "24px",
      "h3": "20px",
      "body": "16px",
      "small": "14px",
      "micro": "12px"
    }
  },
  "shape": {
    "radius": {
      "card": "16px",
      "control": "12px",
      "chip": "999px"
    },
    "stroke": {
      "icon": "2px",
      "connector": "2px",
      "border": "1px"
    }
  },
  "motion": {
    "duration": {
      "micro": "140ms",
      "standard": "220ms",
      "slow": "320ms"
    },
    "easing": {
      "default": "ease",
      "enter": "ease-out",
      "exit": "ease-in"
    }
  }
}
```

---

## 12. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Brand alignment score | ~40% | 90%+ |
| Color ratio (neutrals) | ~55% | 70-80% |
| Warm accent usage | ~30% | 2-8% |
| WCAG AA compliance | Partial | 100% |
| User satisfaction (sleekness) | TBD | 4.5/5 |
| Task completion time | Baseline | -20% |

---

## References

- Brand Guide: `docs/Creator Toolbox - SmartAI International.md`
- Current Theme: `src/theme.ts`
- Node Components: `src/components/nodes/`
- Canvas Studio: `src/components/canvas/CreativeCanvasStudio.tsx`
