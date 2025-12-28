# Creative Canvas Studios: Implementation Plan

## Hybrid Approach: Flow-State + Bento Workspace + Timeline

**Document Version:** 1.1
**Date:** December 2025
**Status:** Implementation Ready

---

## 1. Executive Summary

This plan implements **Studios** - specialized, category-specific workspaces that complement the existing node-based Creative Canvas. Studios provide streamlined, guided experiences while leveraging the same underlying AI generation infrastructure.

### Design Philosophy: Refined Professional

**Core Principle:** Quiet confidence over visual noise. Let the user's creative work be the hero.

Inspired by modern design tool leaders:
- **Linear**: Clean, keyboard-first, dark-mode native, seamless transitions
- **Notion**: Elegant restraint, typography-first, whisper-quiet UI
- **Vercel**: Sophisticated minimalism, precision, premium feel
- **Figma**: Professional panels, subtle depth cues

### Aesthetic Direction

**NOT this:** Vibrant gradients, playful animations, saturated accent colors everywhere
**THIS:** Quiet sophistication, muted tones, strategic color moments, editorial restraint

Key principles:
1. **Neutral-First**: 90% of the UI should be in grayscale/neutral tones
2. **Color as Signal**: Reserve color for meaningful states (active, success, error, progress)
3. **Quiet Hover States**: Subtle shifts, not dramatic color changes
4. **Typography Hierarchy**: Let weight and size do the work, not color
5. **Purposeful Animation**: Functional transitions, not decorative flourishes

### Brand Alignment (Refined)
- **Palette**: Neutral-dominant with restrained accent use (see Section 6.1)
- **Typography**: Inter or system fonts for UI clarity, brand fonts for marketing moments only
- **Shape**: 8-12px radii (not overly rounded), clean edges
- **Motion**: Functional transitions (180-280ms), no bouncy/playful easing

---

## 1.1 Design Guidelines: Do's and Don'ts

### ✓ DO
- Use solid, opaque backgrounds (`#18181B`) for cards - not frosted glass
- Keep hover states subtle - slight background lightening only
- Reserve accent color (`#3B9B94`) for primary action buttons only
- Use typography weight/size for hierarchy, not color
- Apply `8px` border radius - professional, not bubbly
- Use `180ms ease-out` transitions - functional, not playful
- Keep icons small (16-20px) and gray (`#71717A`) until interacted with

### ✗ DON'T
- No colored glows or drop shadows
- No glassmorphism everywhere - save for overlays only
- No vibrant brand colors (`#26CABF`, `#F2492A`) in the UI
- No bouncy/spring animations
- No colored borders or dividers
- No emoji or playful iconography
- No gradients in UI elements
- No rounded-full corners on cards (only on pills/badges)

### Visual Comparison

```
❌ AVOID                          ✓ PREFER
─────────────────────────────────────────────────────────────────────
┌────────────────────┐           ┌────────────────────┐
│ ░░░ Glass blur ░░░ │           │ Solid #18181B      │
│ Colored glow       │           │ Subtle border      │
│ ✨ Vibrant accent  │           │ Gray icon          │
│ [████ TEAL BTN ███]│           │ [Generate]         │
└────────────────────┘           └────────────────────┘
  Radius: 16px                     Radius: 8px
  Glow shadow                      No shadow
  Animated pulse                   Static
```

---

## 2. Architecture Overview

### 2.1 Navigation Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CREATOR'S TOOLBOX                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   FASHION   │  │   SOCIAL    │  │  MOODBOARDS │  │   CANVAS    │       │
│  │   STUDIO    │  │   STUDIO    │  │   STUDIO    │  │  (Advanced) │       │
│  │             │  │             │  │             │  │             │       │
│  │  Flow-State │  │  Flow-State │  │  Flow-State │  │  Node-Based │       │
│  │      +      │  │      +      │  │      +      │  │  Workflows  │       │
│  │  Pro Mode   │  │  Pro Mode   │  │  Pro Mode   │  │             │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
│  Shared: Command Palette (⌘K) • AI Generation Engine • Asset Library       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Mode System

Each Studio supports **three modes** that users can toggle:

| Mode | Description | Target User | UI Density |
|------|-------------|-------------|------------|
| **Flow** | Guided wizard, step-by-step | Beginners, quick tasks | Minimal |
| **Workspace** | Full panel layout, customizable | Power users, complex work | Dense |
| **Timeline** | Project/campaign planning view | Managers, sequential work | Medium |

```typescript
type StudioMode = 'flow' | 'workspace' | 'timeline';

interface StudioState {
  mode: StudioMode;
  category: 'fashion' | 'social' | 'moodboards';
  project?: Project;
  preferences: UserPreferences;
}
```

---

## 3. Component Architecture

### 3.1 New Component Structure

```
src/
├── components/
│   ├── studios/                      # NEW: Studio framework
│   │   ├── StudioShell.tsx           # Main container with mode switching
│   │   ├── StudioHeader.tsx          # Universal header with mode toggle
│   │   ├── StudioCommandPalette.tsx  # ⌘K command interface
│   │   ├── StudioSidebar.tsx         # Collapsible navigation rail
│   │   │
│   │   ├── modes/
│   │   │   ├── FlowMode.tsx          # Wizard-style interface
│   │   │   ├── WorkspaceMode.tsx     # Panel-based layout
│   │   │   └── TimelineMode.tsx      # Horizontal project view
│   │   │
│   │   ├── fashion/                  # Fashion Studio specifics
│   │   │   ├── FashionStudio.tsx
│   │   │   ├── CollectionManager.tsx
│   │   │   ├── LookbookCreator.tsx
│   │   │   ├── VirtualTryOnPanel.tsx
│   │   │   ├── TechPackGenerator.tsx
│   │   │   └── flows/
│   │   │       ├── CreateLookbookFlow.tsx
│   │   │       ├── CreateCollectionFlow.tsx
│   │   │       └── VirtualTryOnFlow.tsx
│   │   │
│   │   ├── social/                   # Social Media Studio specifics
│   │   │   ├── SocialStudio.tsx
│   │   │   ├── ContentCalendar.tsx
│   │   │   ├── PostComposer.tsx
│   │   │   ├── PlatformPreview.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   └── flows/
│   │   │       ├── CreatePostFlow.tsx
│   │   │       ├── CreateCarouselFlow.tsx
│   │   │       └── PlanCampaignFlow.tsx
│   │   │
│   │   ├── moodboards/               # Moodboards Studio specifics
│   │   │   ├── MoodboardsStudio.tsx
│   │   │   ├── BoardCanvas.tsx
│   │   │   ├── CollectionBrowser.tsx
│   │   │   ├── ColorExtractor.tsx
│   │   │   ├── ThemeBuilder.tsx
│   │   │   └── flows/
│   │   │       ├── CreateBoardFlow.tsx
│   │   │       ├── ExtractThemeFlow.tsx
│   │   │       └── BuildCollectionFlow.tsx
│   │   │
│   │   └── shared/                   # Shared Studio components
│   │       ├── AIPromptBar.tsx       # Universal AI input
│   │       ├── AssetDropzone.tsx     # Drag-and-drop media
│   │       ├── GenerationQueue.tsx   # Show pending generations
│   │       ├── ResultGallery.tsx     # Display generated content
│   │       ├── ProjectCard.tsx       # Recent project tiles
│   │       ├── BentoPanel.tsx        # Configurable panel container
│   │       ├── GlassCard.tsx         # Glassmorphism card
│   │       └── PulseIndicator.tsx    # Agent activity states
│   │
│   ├── canvas/                       # EXISTING: Node-based canvas
│   └── ...
```

### 3.2 Shared Design System Components

```typescript
// src/components/studios/shared/DesignTokens.ts

/**
 * REFINED PROFESSIONAL PALETTE
 *
 * Philosophy: Neutral-dominant, color used sparingly and meaningfully
 * - Backgrounds: Deep charcoal to near-black
 * - Surfaces: Subtle elevation through lightness, not color
 * - Accents: Muted, desaturated versions of brand colors
 * - Text: High contrast whites and soft grays
 */

export const studioTokens = {
  colors: {
    // ═══════════════════════════════════════════════════════════════
    // NEUTRALS (Primary UI palette - 90% of the interface)
    // ═══════════════════════════════════════════════════════════════
    ink: '#09090B',           // Deepest background (near-black)
    carbon: '#0F0F11',        // Primary background
    surface1: '#18181B',      // Card backgrounds
    surface2: '#1F1F23',      // Elevated cards, popovers
    surface3: '#27272A',      // Hover states, subtle emphasis

    border: '#27272A',        // Default borders (subtle)
    borderSubtle: '#1F1F23',  // Very subtle separators
    borderHover: '#3F3F46',   // Hover state borders

    textPrimary: '#FAFAFA',   // Headings, primary content
    textSecondary: '#A1A1AA', // Body text, labels
    textTertiary: '#71717A',  // Placeholders, hints
    textMuted: '#52525B',     // Disabled text

    // ═══════════════════════════════════════════════════════════════
    // ACCENT COLORS (Used sparingly - 10% of the interface)
    // Desaturated versions of brand colors for professional look
    // ═══════════════════════════════════════════════════════════════

    // Primary accent - Muted teal (use for: active states, primary actions)
    accent: '#3B9B94',        // Desaturated teal (was #26CABF)
    accentMuted: '#2D7A74',   // Darker teal for subtle highlights
    accentSubtle: '#1A4D49',  // Very subtle teal tint for backgrounds

    // Secondary accent - Quiet blue (use for: links, information)
    blue: '#4A7C9B',          // Muted steel blue
    blueMuted: '#3A6179',     // Darker blue

    // Semantic colors (desaturated for refinement)
    success: '#5B9A6F',       // Muted sage green (was #85E7AE)
    successMuted: '#3D6B4A',  // Darker success

    warning: '#C4863A',       // Muted amber (was #FC7D21)
    warningMuted: '#8A5F2A',  // Darker warning

    error: '#B85450',         // Muted coral (was #F2492A)
    errorMuted: '#8A3D3A',    // Darker error

    // ═══════════════════════════════════════════════════════════════
    // BRAND COLORS (Reserved for marketing/logo only, not UI)
    // ═══════════════════════════════════════════════════════════════
    brandTeal: '#26CABF',     // Logo, marketing hero moments ONLY
    brandCoral: '#F2492A',    // Logo accent ONLY
  },

  radii: {
    none: 0,
    sm: 4,                    // Small controls (chips, badges)
    md: 8,                    // Default (buttons, inputs)
    lg: 12,                   // Cards, panels
    xl: 16,                   // Modal dialogs
    full: 9999,               // Pills, avatars
  },

  motion: {
    instant: '100ms ease-out',
    fast: '180ms ease-out',   // Micro-interactions
    standard: '240ms ease-out', // Default transitions
    slow: '320ms ease-out',   // Panel reveals
    // No playful bouncy animations - professional easing only
  },

  shadows: {
    // Subtle, refined shadows
    xs: '0 1px 2px rgba(0,0,0,0.4)',
    sm: '0 2px 4px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.25)',
    lg: '0 8px 24px rgba(0,0,0,0.25)',
    xl: '0 12px 48px rgba(0,0,0,0.3)',
    // No colored glows - refined drop shadows only
  },

  // Refined glass effect - subtle, not dramatic
  glass: {
    background: 'rgba(15, 15, 17, 0.85)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
};
```

---

## 4. Studios Implementation Details

### 4.1 Fashion Studio

#### Flow Mode: Create Lookbook
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Fashion Studio              Create Lookbook                    ⌘K [?] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│            ○ ─────── ● ─────── ○ ─────── ○                              │
│         Concept    Style    Generate   Refine                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │                    SELECT YOUR AESTHETIC                           │ │
│  │                                                                    │ │
│  │   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │ │
│  │   │ ░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │      │ │
│  │   │                │  │                │  │                │      │ │
│  │   │   Minimalist   │  │   Maximalist   │  │   Streetwear   │      │ │
│  │   │   ────────     │  │   ────────     │  │   ────────     │      │ │
│  │   │   Clean lines  │  │   Bold layers  │  │   Urban edge   │      │ │
│  │   └────────────────┘  └────────────────┘  └────────────────┘      │ │
│  │                                                                    │ │
│  │   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐      │ │
│  │   │ ░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░ │  │ + Add Custom   │      │ │
│  │   │                │  │                │  │                │      │ │
│  │   │   Bohemian     │  │   Avant-Garde  │  │   [Reference]  │      │ │
│  │   │   ────────     │  │   ────────     │  │                │      │ │
│  │   │   Free spirit  │  │   Experimental │  │                │      │ │
│  │   └────────────────┘  └────────────────┘  └────────────────┘      │ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ ✨ Or describe your vision...                                │ │ │
│  │  │ "Sustainable luxury for conscious consumers"                 │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │                                              [← Back]  [Next →]   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Workspace Mode: Collection Manager
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ≡ Fashion Studio    SS25 Collection    [Flow] [●Workspace] [Timeline]   │
├────────┬─────────────────────────────────────────────────────┬───────────┤
│ TOOLS  │                                                     │ INSPECTOR │
│ ────── │                 LOOKS GALLERY                       │ ───────── │
│        │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │           │
│ 📁 Assets  │ LK 01 │ │ LK 02 │ │ LK 03 │ │ LK 04 │ │ LK 05 │ │ Look 03   │
│ 🎨 Palette │       │ │       │ │  ✓    │ │       │ │       │ │ ───────── │
│ 👤 Models  │ ✓     │ │ ✓     │ │[sel]  │ │ draft │ │ draft │ │           │
│ 📐 Tech    └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ │ Status:   │
│        │                                                     │ Finalized │
│ ────── │  ┌─────────────────────────────────────────────┐   │           │
│ AI     │  │                                             │   │ Model:    │
│ ────── │  │                                             │   │ flux-pro  │
│ ✨ Gen  │  │              [SELECTED LOOK]                │   │           │
│ 🔄 Var  │  │                                             │   │ Colors:   │
│ 👗 TryOn│  │                                             │   │ ■■■■■    │
│        │  │                                             │   │           │
│        │  └─────────────────────────────────────────────┘   │ [Regen]   │
│        │                                                     │ [Try-On]  │
│        │  ┌── Generation Queue ──────────────────────────┐  │ [Export]  │
│        │  │ ▓▓▓▓▓▓▓░░░ LK06 generating...        [Pause] │  │           │
│        │  └──────────────────────────────────────────────┘  │           │
├────────┴─────────────────────────────────────────────────────┴───────────┤
│ + New Look │ Model: flux-2-pro-edit │ Queue: 1 │ Credits: 247 │   ⌘K    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Social Media Studio

#### Flow Mode: Quick Post Creator
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Social Studio                Quick Post                        ⌘K [?] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ ✨ What do you want to post about?                           │ │ │
│  │  │                                                              │ │ │
│  │  │ "New winter collection drop with cozy knits"                 │ │ │
│  │  │                                                              │ │ │
│  │  │                                            [Generate →]      │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  Format:  [● Single] [Carousel] [Story] [Reel Thumb]              │ │
│  │                                                                    │ │
│  │  Platforms:                                                        │ │
│  │  [✓ Instagram] [✓ TikTok] [□ LinkedIn] [✓ X] [□ Pinterest]        │ │
│  │                                                                    │ │
│  │  Tone:  [Professional] [● Casual] [Playful] [Inspirational]       │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ─────────────────── Quick Templates ───────────────────                │
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │ Product    │  │ Behind     │  │ User       │  │ Sale       │        │
│  │ Spotlight  │  │ Scenes     │  │ Testimonial│  │ Announce   │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Timeline Mode: Content Calendar
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ≡ Social Studio    Winter Campaign    [Flow] [Workspace] [●Timeline]    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CAMPAIGN: Winter Styles 2025        Week 3 of 5        ████████░░ 60%  │
│                                                                          │
│  ┌── DECEMBER 2025 ──────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │    15 Mon    16 Tue    17 Wed    18 Thu    19 Fri    20 Sat      │  │
│  │    ───────   ───────   ───────   ───────   ───────   ───────      │  │
│  │                                                                    │  │
│  │ IG │ ┌───┐   ┌───┐     ┌───┐     ┌───┐               ┌───┐       │  │
│  │    │ │ 📱│   │ 🎠│     │ 📱│     │ 📱│               │ 📱│       │  │
│  │    │ │10a│   │ 2p│     │10a│     │ 3p│               │11a│       │  │
│  │    │ └───┘   └───┘     └───┘     └───┘               └───┘       │  │
│  │                                                                    │  │
│  │ TT │         ┌───┐               ┌───┐     ┌───┐                  │  │
│  │    │         │ 🎬│               │ 🎬│     │ 🎬│                  │  │
│  │    │         │ 6p│               │ 7p│     │12p│                  │  │
│  │    │         └───┘               └───┘     └───┘                  │  │
│  │                                                                    │  │
│  │ X  │ ┌───┐   ┌───┐     ┌───┐     ┌───┐     ┌───┐                  │  │
│  │    │ │ 💬│   │ 💬│     │ 💬│     │ 💬│     │ 💬│                  │  │
│  │    │ │ 9a│   │12p│     │ 9a│     │ 2p│     │10a│                  │  │
│  │    │ └───┘   └───┘     └───┘     └───┘     └───┘                  │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  TODAY'S POSTS ─────────────────────────────────────────────────────────│
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐             │
│  │ [preview]      │  │ [preview]      │  │ [preview]      │             │
│  │ IG • 10:00 AM  │  │ TT • 6:00 PM   │  │ X • 9:00 AM    │             │
│  │ ✓ Published    │  │ ◐ Scheduled    │  │ ✓ Published    │             │
│  │ 1.2K likes     │  │                │  │ 234 likes      │             │
│  └────────────────┘  └────────────────┘  └────────────────┘             │
│                                                                          │
│  [+ Add Post]  [AI Fill Gaps]  [Reschedule All]  [Analytics →]   ⌘K    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Moodboards Studio

#### Flow Mode: Create Board
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Moodboards Studio           New Board                          ⌘K [?] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │                    HOW WOULD YOU LIKE TO START?                   │ │
│  │                                                                    │ │
│  │   ┌─────────────────────┐  ┌─────────────────────┐                │ │
│  │   │                     │  │                     │                │ │
│  │   │    ✨               │  │    📷               │                │ │
│  │   │                     │  │                     │                │ │
│  │   │   Describe It       │  │   Drop Images       │                │ │
│  │   │   ───────────       │  │   ───────────       │                │ │
│  │   │   AI generates a    │  │   We'll extract     │                │ │
│  │   │   starting point    │  │   themes & colors   │                │ │
│  │   └─────────────────────┘  └─────────────────────┘                │ │
│  │                                                                    │ │
│  │   ┌─────────────────────┐  ┌─────────────────────┐                │ │
│  │   │                     │  │                     │                │ │
│  │   │    🔗               │  │    📋               │                │ │
│  │   │                     │  │                     │                │ │
│  │   │   Import Pinterest  │  │   From Template     │                │ │
│  │   │   ───────────       │  │   ───────────       │                │ │
│  │   │   Paste a board URL │  │   Brand, Product,   │                │ │
│  │   │   to import         │  │   Campaign...       │                │ │
│  │   └─────────────────────┘  └─────────────────────┘                │ │
│  │                                                                    │ │
│  │  ─────────────────────────────────────────────────────────────────│ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ ✨ "Serene Japanese minimalism meets Scandinavian warmth"    │ │ │
│  │  │                                              [Create Board →]│ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. API Requirements

### 5.1 Existing APIs (Reuse)

| API | Current Use | Studio Use |
|-----|-------------|------------|
| `/api/image/generate` | Node execution | Flow-state generation |
| `/api/multiframe/*` | Grid/Stack nodes | Lookbook batch generation |
| `/api/fashion/*` | Fashion nodes | Virtual try-on, tech packs |
| `/api/prompt/improve` | Prompt enhancement | AI caption writing |
| `/api/creative-canvas/boards` | Board management | Project persistence |
| `/api/creative-canvas/nodes` | Node CRUD | Asset management |

### 5.2 New APIs Required

```yaml
# New Studio-Specific Endpoints

# ========== Fashion Studio ==========
POST /api/studios/fashion/collections
  # Create a new collection with metadata
  body:
    name: string
    season: string
    description: string
    colorPalette?: string[]

GET /api/studios/fashion/collections/{id}/looks
  # Get all looks in a collection

POST /api/studios/fashion/collections/{id}/looks
  # Generate new look(s) for collection
  body:
    prompt: string
    aesthetic: string
    model: string
    count: number  # Batch generation

POST /api/studios/fashion/lookbook/generate
  # Full lookbook generation (multiple looks)
  body:
    concept: string
    aesthetic: string
    lookCount: number
    colorPalette?: string[]
    modelDiversity: boolean

# ========== Social Media Studio ==========
POST /api/studios/social/posts/generate
  # Generate post content (image + caption)
  body:
    topic: string
    format: 'single' | 'carousel' | 'story' | 'reel'
    platforms: string[]
    tone: string

POST /api/studios/social/campaigns
  # Create content campaign
  body:
    name: string
    startDate: date
    endDate: date
    platforms: string[]
    postsPerWeek: number

POST /api/studios/social/campaigns/{id}/fill
  # AI-fill calendar gaps
  body:
    topics: string[]

GET /api/studios/social/schedule
  # Get scheduled posts
  query:
    startDate: date
    endDate: date
    platform?: string

POST /api/studios/social/schedule
  # Schedule a post
  body:
    postId: string
    platforms: string[]
    scheduledAt: datetime

# ========== Moodboards Studio ==========
POST /api/studios/moodboards/extract-theme
  # Extract colors/theme from images
  body:
    imageUrls: string[]

POST /api/studios/moodboards/expand
  # AI expand board with related content
  body:
    boardId: string
    direction: 'similar' | 'contrast' | 'complement'
    count: number

POST /api/studios/moodboards/import-pinterest
  # Import Pinterest board
  body:
    url: string

POST /api/studios/moodboards/generate-layout
  # AI arrange board items
  body:
    boardId: string
    style: 'grid' | 'masonry' | 'organic' | 'timeline'

# ========== Shared Studio APIs ==========
GET /api/studios/projects
  # List user projects across studios
  query:
    studio?: 'fashion' | 'social' | 'moodboards'

POST /api/studios/projects
  # Create new project
  body:
    studio: string
    name: string

GET /api/studios/projects/{id}
  # Get project details

POST /api/studios/ai/suggestions
  # Get AI suggestions for current context
  body:
    context: {
      studio: string
      projectId: string
      currentView: string
      selectedItems?: string[]
    }
```

### 5.3 API Request Tracker (for Backend Team)

| Priority | Endpoint | Purpose | Status |
|----------|----------|---------|--------|
| P0 | `POST /api/studios/fashion/lookbook/generate` | Batch lookbook generation | ⏳ Requested |
| P0 | `POST /api/studios/social/posts/generate` | Multi-platform post generation | ⏳ Requested |
| P0 | `POST /api/studios/moodboards/extract-theme` | Theme/color extraction | ⏳ Requested |
| P1 | `POST /api/studios/social/campaigns` | Campaign management | ⏳ Requested |
| P1 | `POST /api/studios/moodboards/import-pinterest` | Pinterest import | ⏳ Requested |
| P2 | `POST /api/studios/ai/suggestions` | Context-aware AI hints | ⏳ Requested |

---

## 6. Design System Implementation

### 6.1 Refined Component Patterns

**Design Rule:** Components should feel almost invisible until needed. The user's content is the star.

```tsx
// SurfaceCard.tsx - Clean, minimal card (Linear/Vercel inspired)
// NO glassmorphism by default - use solid surfaces for clarity
export const SurfaceCard = styled(Box)(({ theme }) => ({
  background: '#18181B',       // surface1 - solid, not transparent
  border: '1px solid #27272A', // Subtle border
  borderRadius: 12,
  padding: theme.spacing(3),
  transition: 'all 180ms ease-out',

  '&:hover': {
    background: '#1F1F23',      // surface2 - slight lightening only
    border: '1px solid #3F3F46', // Slightly more visible border
    // NO colored shadows or glows
  },
}));

// GlassPanel.tsx - Reserved for overlays/modals only
export const GlassPanel = styled(Box)({
  background: 'rgba(15, 15, 17, 0.90)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  // Used sparingly - only for command palette, dropdowns, modals
});
```

### 6.2 Command Palette (⌘K)

```tsx
// StudioCommandPalette.tsx - Clean, minimal command interface
// Inspired by Linear/Raycast but with refined aesthetic

const StudioCommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useHotkeys('mod+k', () => setOpen(true));

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          background: '#0F0F11',           // Solid dark, not transparent
          border: '1px solid #27272A',
          borderRadius: 2,                 // 8px - not overly rounded
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
        }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #1F1F23' }}>
        <TextField
          fullWidth
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          InputProps={{
            disableUnderline: true,
            startAdornment: <SearchIcon sx={{ color: '#71717A', mr: 1.5 }} />,
            sx: {
              fontSize: '0.9375rem',
              color: '#FAFAFA',
              '& ::placeholder': { color: '#71717A' },
            },
          }}
          sx={{ '& .MuiInputBase-root': { background: 'transparent' } }}
        />
      </Box>
      <CommandList commands={filteredCommands} onSelect={handleSelect} />
    </Dialog>
  );
};

// Command item - minimal, typography-focused
const CommandItem = styled(Box)<{ selected?: boolean }>(({ selected }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 16px',
  cursor: 'pointer',
  background: selected ? '#1F1F23' : 'transparent', // Subtle selection
  transition: 'background 100ms ease-out',

  '&:hover': {
    background: '#1F1F23',
  },

  '& .label': {
    color: '#FAFAFA',
    fontSize: '0.875rem',
    fontWeight: 500,
  },

  '& .shortcut': {
    marginLeft: 'auto',
    color: '#52525B',            // Very muted
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  },
}));
```

### 6.3 AI Prompt Bar

```tsx
// AIPromptBar.tsx - Clean, minimal prompt input
// Focus on the text, not the chrome

export const AIPromptBar: React.FC<{
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  enableEnhance?: boolean;
}> = ({ onSubmit, placeholder, enableEnhance = true }) => {
  const [value, setValue] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  return (
    <Box sx={{
      background: '#18181B',
      border: '1px solid #27272A',
      borderRadius: 2,                   // 8px
      transition: 'border-color 180ms ease-out',
      '&:focus-within': {
        borderColor: '#3F3F46',          // Just slightly more visible, no color
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2 }}>
        {/* Subtle icon - not colored */}
        <SparklesIcon sx={{ color: '#52525B', fontSize: 18 }} />

        <TextField
          fullWidth
          variant="standard"
          placeholder={placeholder || "Describe what you want to create..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.9375rem',
              color: '#FAFAFA',
              '& ::placeholder': { color: '#71717A' },
            },
          }}
        />

        {enableEnhance && value && (
          <IconButton
            onClick={handleEnhance}
            disabled={isEnhancing}
            size="small"
            sx={{
              color: '#71717A',
              '&:hover': { color: '#A1A1AA', background: '#27272A' },
            }}
          >
            {isEnhancing ? <CircularProgress size={16} sx={{ color: '#71717A' }} /> : <WandIcon />}
          </IconButton>
        )}

        <Button
          onClick={() => onSubmit(value)}
          disabled={!value.trim()}
          sx={{
            px: 2.5,
            py: 0.75,
            borderRadius: 1.5,
            fontSize: '0.8125rem',
            fontWeight: 600,
            textTransform: 'none',
            // Solid accent button - the ONE place we use accent color
            background: value.trim() ? '#3B9B94' : '#27272A',
            color: value.trim() ? '#FAFAFA' : '#52525B',
            '&:hover': {
              background: value.trim() ? '#2D7A74' : '#27272A',
            },
          }}
        >
          Generate
        </Button>
      </Box>
    </Box>
  );
};
```

### 6.4 Status Indicator

```tsx
// StatusIndicator.tsx - Minimal, refined status states
// No dramatic glows or pulses - subtle, professional indicators

type StatusState = 'idle' | 'active' | 'processing' | 'success' | 'warning' | 'error';

const stateStyles: Record<StatusState, { color: string; animation?: string }> = {
  idle: { color: '#52525B' },                    // Muted gray
  active: { color: '#4A7C9B' },                  // Subtle blue
  processing: { color: '#3B9B94', animation: 'pulse 1.5s ease-in-out infinite' },
  success: { color: '#5B9A6F' },                 // Muted sage
  warning: { color: '#C4863A' },                 // Muted amber
  error: { color: '#B85450' },                   // Muted coral
};

export const StatusIndicator: React.FC<{ state: StatusState; size?: number }> = ({
  state,
  size = 8
}) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      bgcolor: stateStyles[state].color,
      animation: stateStyles[state].animation,
      // No glow shadows - clean dot only
    }}
  />
);

// For inline status with text
export const StatusBadge: React.FC<{ state: StatusState; label: string }> = ({
  state,
  label
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <StatusIndicator state={state} />
    <Typography
      variant="caption"
      sx={{
        color: stateStyles[state].color,
        fontSize: '0.75rem',
        fontWeight: 500,
      }}
    >
      {label}
    </Typography>
  </Box>
);
```

---

## 7. Navigation & Routing

### 7.1 URL Structure

```
/studios/fashion                    # Fashion Studio home
/studios/fashion/collections        # Collections list
/studios/fashion/collections/:id    # Collection detail
/studios/fashion/lookbook/new       # Create lookbook flow
/studios/fashion/try-on             # Virtual try-on

/studios/social                     # Social Studio home
/studios/social/calendar            # Content calendar
/studios/social/posts/new           # Create post flow
/studios/social/campaigns/:id       # Campaign detail

/studios/moodboards                 # Moodboards Studio home
/studios/moodboards/boards/:id      # Board detail
/studios/moodboards/collections/:id # Collection detail

/canvas                             # Advanced node canvas
/canvas?board=:id                   # Specific board
```

### 7.2 Navigation Component

```tsx
// StudioNavigation.tsx
export const StudioNavigation: React.FC = () => {
  const location = useLocation();
  const currentStudio = location.pathname.split('/')[2];

  return (
    <Box sx={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 72,
      bgcolor: 'carbon',
      borderRight: '1px solid',
      borderColor: 'border',
      display: 'flex',
      flexDirection: 'column',
      py: 2,
    }}>
      {/* Logo */}
      <Box sx={{ px: 2, mb: 4 }}>
        <Logo variant="monochrome" size={40} />
      </Box>

      {/* Studio Links */}
      <NavRail>
        <NavItem
          icon={<CheckroomIcon />}
          label="Fashion"
          to="/studios/fashion"
          active={currentStudio === 'fashion'}
          shortcut="⌘1"
        />
        <NavItem
          icon={<ShareIcon />}
          label="Social"
          to="/studios/social"
          active={currentStudio === 'social'}
          shortcut="⌘2"
        />
        <NavItem
          icon={<DashboardIcon />}
          label="Moodboards"
          to="/studios/moodboards"
          active={currentStudio === 'moodboards'}
          shortcut="⌘3"
        />

        <Divider sx={{ my: 2 }} />

        <NavItem
          icon={<AccountTreeIcon />}
          label="Canvas"
          to="/canvas"
          active={location.pathname.startsWith('/canvas')}
          shortcut="⌘0"
          tooltip="Advanced node-based workflows"
        />
      </NavRail>

      {/* Bottom */}
      <Box sx={{ mt: 'auto', px: 1 }}>
        <IconButton onClick={() => openCommandPalette()}>
          <SearchIcon />
        </IconButton>
        <Typography variant="micro" color="textTertiary">⌘K</Typography>
      </Box>
    </Box>
  );
};
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create `StudioShell` container component
- [ ] Implement `StudioHeader` with mode toggle
- [ ] Build `StudioCommandPalette` (⌘K)
- [ ] Create shared components: `GlassCard`, `AIPromptBar`, `PulseIndicator`
- [ ] Set up routing structure
- [ ] Implement design tokens from brand guide

### Phase 2: Fashion Studio MVP (Weeks 3-4)
- [ ] `FashionStudio` container
- [ ] Flow Mode: `CreateLookbookFlow` wizard
- [ ] Workspace Mode: `CollectionManager` with gallery
- [ ] Integrate existing `/api/image/generate` for look generation
- [ ] Connect to `/api/fashion/virtual-try-on` (if available)
- [ ] Request new batch generation API

### Phase 3: Social Media Studio MVP (Weeks 5-6)
- [ ] `SocialStudio` container
- [ ] Flow Mode: `CreatePostFlow` wizard
- [ ] Timeline Mode: `ContentCalendar` view
- [ ] Platform preview components
- [ ] Caption generation with prompt service
- [ ] Request scheduling APIs

### Phase 4: Moodboards Studio MVP (Weeks 7-8)
- [ ] `MoodboardsStudio` container
- [ ] Flow Mode: `CreateBoardFlow`
- [ ] Workspace Mode: `BoardCanvas` with drag-drop
- [ ] Color extraction functionality
- [ ] Pinterest import (if API available)
- [ ] Request theme extraction API

### Phase 5: Polish & Integration (Weeks 9-10)
- [ ] Cross-studio navigation refinement
- [ ] Keyboard shortcuts throughout
- [ ] Animation and micro-interactions
- [ ] Performance optimization
- [ ] Mobile responsive adjustments
- [ ] Canvas ↔ Studio data sharing

### Phase 6: Timeline Mode & Projects (Weeks 11-12)
- [ ] Universal Timeline mode implementation
- [ ] Project management system
- [ ] Cross-studio project linking
- [ ] Export/sharing capabilities
- [ ] Analytics integration

---

## 9. Migration Strategy

### 9.1 Canvas to Studio Data Flow

Studios can **reference** Canvas boards and nodes, enabling users to:
1. Start in Studio (quick creation)
2. "Open in Canvas" for advanced editing
3. Return to Studio view for simplified management

```typescript
// Data mapping
interface StudioProject {
  id: string;
  studio: 'fashion' | 'social' | 'moodboards';
  name: string;
  // Link to underlying canvas board
  canvasBoardId?: string;
  // Studio-specific metadata
  metadata: FashionProjectMeta | SocialProjectMeta | MoodboardProjectMeta;
}

// Studio -> Canvas bridge
const openInCanvas = async (project: StudioProject) => {
  if (project.canvasBoardId) {
    navigate(`/canvas?board=${project.canvasBoardId}`);
  } else {
    // Create canvas board from studio project
    const board = await createBoardFromProject(project);
    navigate(`/canvas?board=${board.id}`);
  }
};
```

### 9.2 Feature Flags

```typescript
// Gradual rollout
const featureFlags = {
  studios_enabled: true,
  studios_fashion: true,
  studios_social: true,
  studios_moodboards: false, // Phase 4
  studios_timeline_mode: false, // Phase 6
  studios_pro_mode: true, // Workspace mode
};
```

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first creation | < 60 seconds | Analytics |
| Flow completion rate | > 70% | Funnel tracking |
| Pro Mode toggle rate | > 30% of active users | Feature usage |
| Cross-studio navigation | > 2 studios/session | Session tracking |
| Canvas fallback rate | < 15% | "Open in Canvas" clicks |
| User satisfaction | > 4.2/5 | In-app surveys |

---

## 11. Design Inspiration Sources

Modern design tools that informed this approach:
- [Linear Design System](https://www.figma.com/community/file/1222872653732371433/linear-design-system) - Clean, dark-mode native, keyboard-first
- [Glow UI](https://www.glowui.com/blog/figma-ui-kits) - Modern SaaS patterns, Auto Layout 5.0
- [AlignUI](https://www.untitledui.com/blog/figma-ui-kits) - Dashboard patterns, comprehensive components
- Raycast - Command palette centricity, progressive disclosure
- Arc Browser - Spatial organization, personality, beautiful animations

---

## 12. Appendix: Refined Theme Integration

**Color Philosophy Recap:**
- Neutral-first: 90% of UI is grayscale
- Accent for meaning: Color signals state, not decoration
- Desaturated palette: Professional, not playful
- Brand colors: Reserved for marketing/logo only

```typescript
// theme.ts - Refined Professional Theme
const studioTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#09090B',      // Near-black
      paper: '#18181B',        // Card surface
    },
    primary: {
      main: '#3B9B94',         // Muted teal (NOT #26CABF)
      dark: '#2D7A74',
      light: '#4AADA5',
    },
    secondary: {
      main: '#4A7C9B',         // Muted steel blue
      dark: '#3A6179',
    },
    success: {
      main: '#5B9A6F',         // Muted sage (NOT #85E7AE)
      dark: '#3D6B4A',
    },
    warning: {
      main: '#C4863A',         // Muted amber (NOT #FC7D21)
      dark: '#8A5F2A',
    },
    error: {
      main: '#B85450',         // Muted coral (NOT #F2492A)
      dark: '#8A3D3A',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#A1A1AA',
      disabled: '#52525B',
    },
    divider: '#27272A',
    action: {
      hover: '#1F1F23',
      selected: '#27272A',
    },
  },
  shape: {
    borderRadius: 8,           // Modest, not overly rounded
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    // NO decorative fonts in UI - save for marketing
    h1: { fontWeight: 600, letterSpacing: '-0.025em' },
    h2: { fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', color: '#A1A1AA' },
    caption: { fontSize: '0.75rem', color: '#71717A' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // No gradient overlays
        },
      },
    },
  },
});
```

### Design System Quick Reference

| Element | Value | Note |
|---------|-------|------|
| Background | `#09090B` | Near-black, not true black |
| Surface | `#18181B` | Cards, panels |
| Surface hover | `#1F1F23` | Subtle lightening |
| Border default | `#27272A` | Barely visible |
| Border hover | `#3F3F46` | Slightly more visible |
| Text primary | `#FAFAFA` | Off-white |
| Text secondary | `#A1A1AA` | Muted gray |
| Text tertiary | `#71717A` | Placeholders |
| Accent (action) | `#3B9B94` | Primary buttons only |
| Corner radius | `8px` | Cards, buttons |
| Transition | `180ms ease-out` | Default |

---

**Next Steps:**
1. Review and approve this refined design approach
2. Prioritize API requests with backend team
3. Begin Phase 1 implementation with new design tokens
4. Create a Figma/design file with the refined palette for visual sign-off
