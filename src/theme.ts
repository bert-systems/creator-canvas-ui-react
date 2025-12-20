import { createTheme } from '@mui/material/styles';

// ============================================================================
// CREATOR'S TOOLBOX + SMARTAI BRAND DESIGN TOKENS
// Based on Brand Kit & Guide - December 2025
// ============================================================================

/**
 * Brand Foundation:
 * - Agency-first: users orchestrate; AI assists with transparency
 * - Craft-led: design feels made, not templated
 * - Culturally grounded: inspiration from weave, bead, rhythm motifs
 * - Sleek by default: minimal chrome, high contrast, deliberate motion
 * - Trust UI: every AI action is legible
 */

// ============================================================================
// BRAND COLOR SYSTEM
// ============================================================================

export const brandColors = {
  // Core Brand Colors
  deepOcean: '#154366',      // Brand anchor, headers, nav
  techBlue: '#0A6EB9',       // Secondary action, info
  tealPulse: '#26CABF',      // Primary action, "Go"
  mintGlow: '#85E7AE',       // Success, completed
  coralSpark: '#F2492A',     // Error, destructive
  sunsetOrange: '#FC7D21',   // Warning, attention

  // Gradient definitions
  gradients: {
    ocean: ['#154366', '#0A6EB9'],
    pulse: ['#26CABF', '#85E7AE'],
    sunset: ['#F2492A', '#FC7D21'],
  },
};

// Dark Mode Neutrals (Default Product Theme)
export const darkNeutrals = {
  ink: '#0B0F14',           // bg0 - deepest background
  carbon: '#111111',         // bg1 - logo backgrounds
  surface1: '#14171A',       // elevated surface
  surface2: '#1E2328',       // higher elevation
  border: '#2A313A',         // subtle borders
  textPrimary: '#F5F7FA',    // main text
  textSecondary: '#C7D0DA',  // secondary text
  textTertiary: '#94A3B8',   // muted text, placeholders
};

// Light Mode Neutrals (Marketing + Optional Theme)
export const lightNeutrals = {
  paper: '#F5F7FA',          // bg0
  surface: '#FFFFFF',        // main surface
  surfaceAlt: '#E8ECF0',     // alternate surface
  border: '#D0D9E0',         // borders
  textPrimary: '#0B0F14',    // main text
  textSecondary: '#3B4A5A',  // secondary text
};

// Semantic Color Mapping
export const semanticColors = {
  primaryAction: brandColors.tealPulse,
  primaryActionText: darkNeutrals.ink,
  secondaryAction: brandColors.techBlue,
  success: brandColors.mintGlow,
  warning: brandColors.sunsetOrange,
  error: brandColors.coralSpark,
  info: brandColors.techBlue,
  brandAnchor: brandColors.deepOcean,
};

// ============================================================================
// AGENT STATE COLORS
// ============================================================================

export const agentStateColors = {
  idle: darkNeutrals.textTertiary,
  listening: brandColors.techBlue,
  thinking: brandColors.tealPulse,
  executing: brandColors.mintGlow,
  needsApproval: brandColors.sunsetOrange,
  done: brandColors.mintGlow,
  error: brandColors.coralSpark,
};

// ============================================================================
// CREATIVE CARD DESIGN TOKENS (Updated for Brand)
// ============================================================================

export const creativeCardTokens = {
  // Card dimensions
  dimensions: {
    mini: { width: 200, height: 80 },
    default: { width: 320, height: 360 },
    expanded: { width: 400, height: 520 },
  },

  // Preview ratios
  preview: {
    heroRatio: 0.55,
    thumbnailSize: 48,
    variationStripHeight: 56,
  },

  // Border radius (Brand: rounded + modular)
  radius: {
    card: 16,       // Cards/panels
    control: 12,    // Buttons/inputs
    inner: 12,
    button: 12,
    chip: 999,      // Pill shape for chips/tags
    thumbnail: 8,
    canvas: 16,     // Canvas objects
  },

  // Animation timing (Brand: rhythm over chaos)
  timing: {
    micro: 140,      // Micro interactions
    instant: 100,
    fast: 200,
    standard: 220,   // Panel transitions
    normal: 300,
    slow: 320,
    celebration: 800,
    agentListening: 1200,  // Agent "listening" pulse
    agentThinking: 1000,   // Agent "thinking" pulse
  },

  // Easing functions (Brand: pulse, glide, reveal - no bouncy)
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    standard: 'ease-out',
  },

  // Shadows (Brand: sleek, no heavy drop shadows)
  shadows: {
    card: '0 4px 24px rgba(0, 0, 0, 0.3)',
    cardHover: '0 8px 32px rgba(0, 0, 0, 0.4)',
    cardActive: `0 0 0 2px ${brandColors.tealPulse}`,
    glow: `0 0 20px ${brandColors.tealPulse}40`,
    focusRing: `0 0 0 2px ${brandColors.tealPulse}`,
  },

  // Glassmorphism (Updated for brand neutrals)
  glass: {
    background: `${darkNeutrals.surface2}E6`, // 90% opacity
    backgroundLight: `${darkNeutrals.surface2}B3`, // 70% opacity
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(255, 255, 255, 0.15)',
    blur: 12,
  },
};

// ============================================================================
// CATEGORY COLORS (Mapped to Brand Palette)
// ============================================================================

export const categoryColors = {
  // Input - Tech Blue (capability, intelligence)
  input: {
    main: brandColors.techBlue,
    light: '#3A8FD6',
    dark: '#085A9A'
  },

  // Image Gen - Teal Pulse (primary creative action)
  imageGen: {
    main: brandColors.tealPulse,
    light: '#4FD8CE',
    dark: '#1EA89F'
  },

  // Video Gen - Mint Glow (creative output)
  videoGen: {
    main: brandColors.mintGlow,
    light: '#A3EFCA',
    dark: '#5ED498'
  },

  // 3D - Sunset Orange (warm creative accent)
  threeD: {
    main: brandColors.sunsetOrange,
    light: '#FD9B4F',
    dark: '#E06A10'
  },

  // Character - Coral Spark (identity, personality)
  character: {
    main: '#EC4899', // Keep pink for character nodes
    light: '#F472B6',
    dark: '#DB2777'
  },

  // Style - Deep Ocean (brand anchor, sophistication)
  style: {
    main: brandColors.deepOcean,
    light: '#1E5A85',
    dark: '#0F3247'
  },

  // Fashion - Coral Spark (creative, warm)
  fashion: {
    main: brandColors.coralSpark,
    light: '#F56B4A',
    dark: '#D93516'
  },

  // Story/Narrative - Deep Ocean (depth, intelligence)
  story: {
    main: brandColors.deepOcean,
    light: '#1E5A85',
    dark: '#0F3247'
  },
  narrative: {
    main: '#10B981', // Emerald for narrative flow
    light: '#34D399',
    dark: '#059669'
  },

  // World Building - Lime green
  worldBuilding: {
    main: '#84CC16',
    light: '#A3E635',
    dark: '#65A30D'
  },

  // Dialogue - Pink
  dialogue: {
    main: '#F472B6',
    light: '#F9A8D4',
    dark: '#EC4899'
  },

  // Branching - Violet
  branching: {
    main: '#A78BFA',
    light: '#C4B5FD',
    dark: '#8B5CF6'
  },

  // Logic - Tech Blue (subtle intelligence)
  logic: {
    main: darkNeutrals.textTertiary,
    light: darkNeutrals.textSecondary,
    dark: '#6B7280'
  },

  // Audio - Tech Blue variant
  audio: {
    main: brandColors.techBlue,
    light: '#3A8FD6',
    dark: '#085A9A'
  },

  // Output - Teal Pulse (completion, success)
  output: {
    main: brandColors.tealPulse,
    light: '#4FD8CE',
    dark: '#1EA89F'
  },

  // Composite - Deep Ocean (sophisticated multi-step)
  composite: {
    main: '#6366F1', // Indigo for complex operations
    light: '#818CF8',
    dark: '#4F46E5'
  },

  // Agent - Teal Pulse (agentic action)
  agent: {
    main: brandColors.tealPulse,
    light: '#4FD8CE',
    dark: '#1EA89F'
  },

  // Multi-frame categories
  multiFrame: {
    main: '#8B5CF6', // Purple for multi-frame
    light: '#A78BFA',
    dark: '#7C3AED'
  },

  // Enhancement
  enhancement: {
    main: brandColors.mintGlow,
    light: '#A3EFCA',
    dark: '#5ED498'
  },

  // Fashion-specific sub-categories
  fashionDesign: {
    main: brandColors.coralSpark,
    light: '#F56B4A',
    dark: '#D93516'
  },
  fashionTextile: {
    main: brandColors.sunsetOrange,
    light: '#FD9B4F',
    dark: '#E06A10'
  },
  fashionPhoto: {
    main: brandColors.tealPulse,
    light: '#4FD8CE',
    dark: '#1EA89F'
  },
  fashionVideo: {
    main: brandColors.mintGlow,
    light: '#A3EFCA',
    dark: '#5ED498'
  },
};

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  fontFamily: {
    brand: '"Comfortaa", "Nunito", system-ui, -apple-system, sans-serif',
    ui: '"Nunito", "Inter", system-ui, -apple-system, sans-serif',
    fallback: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  weights: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },
  // Type scale in pixels (Brand spec)
  scale: {
    h1: { size: 32, lineHeight: 40 },
    h2: { size: 24, lineHeight: 32 },
    h3: { size: 20, lineHeight: 28 },
    body: { size: 16, lineHeight: 24 },
    small: { size: 14, lineHeight: 20 },
    micro: { size: 12, lineHeight: 16 },
  },
};

// ============================================================================
// SHAPE SYSTEM
// ============================================================================

export const shapeTokens = {
  radius: {
    card: 16,
    panel: 16,
    control: 12,
    button: 12,
    input: 12,
    chip: 999,    // Pill
    canvas: 16,
  },
  stroke: {
    icon: 2,      // Icon stroke width
    connector: 2, // Canvas connector lines
    border: 1,    // UI borders
  },
  grid: {
    base: 8,      // 8px base grid
  },
};

// ============================================================================
// CANVAS STYLING
// ============================================================================

export const canvasTokens = {
  // Dark mode canvas background with dot-grid
  background: {
    dark: darkNeutrals.ink,
    dotGrid: {
      color: `${darkNeutrals.textPrimary}0F`, // 6% opacity white
      size: 20,
      opacity: 0.06,
    },
  },
  // Canvas object defaults
  objects: {
    frame: {
      background: darkNeutrals.surface1,
      border: darkNeutrals.border,
      radius: 16,
    },
    card: {
      background: darkNeutrals.surface2,
      border: darkNeutrals.border,
    },
    connector: {
      default: darkNeutrals.textTertiary,
      active: brandColors.tealPulse,
      width: 2,
    },
  },
};

// ============================================================================
// NODE TYPE COLORS (For React Flow)
// ============================================================================

export const nodeColors = {
  input: brandColors.techBlue,
  imageGen: brandColors.tealPulse,
  videoGen: brandColors.mintGlow,
  threeD: brandColors.sunsetOrange,
  character: '#EC4899',            // Pink for character
  style: brandColors.deepOcean,
  fashion: brandColors.coralSpark,
  fashionDesign: brandColors.coralSpark,
  fashionTextile: brandColors.sunsetOrange,
  fashionModel: '#EC4899',
  fashionStyling: brandColors.tealPulse,
  fashionPhoto: brandColors.tealPulse,
  fashionVideo: brandColors.mintGlow,
  fashionCollection: brandColors.deepOcean,
  narrative: '#10B981',            // Emerald
  worldBuilding: '#84CC16',        // Lime
  dialogue: '#F472B6',             // Pink
  branching: '#A78BFA',            // Violet
  logic: darkNeutrals.textTertiary,
  audio: brandColors.techBlue,
  output: brandColors.tealPulse,
  composite: '#6366F1',            // Indigo
  multiFrame: '#8B5CF6',           // Purple
  enhancement: brandColors.mintGlow,
};

// ============================================================================
// PORT COLORS (Data type visualization)
// ============================================================================

export const portColors = {
  image: brandColors.tealPulse,
  video: brandColors.mintGlow,
  audio: brandColors.techBlue,
  text: brandColors.deepOcean,
  style: '#6366F1',                // Indigo
  character: '#EC4899',            // Pink
  mesh3d: brandColors.sunsetOrange,
  story: '#10B981',                // Emerald
  scene: '#34D399',                // Light emerald
  plotPoint: '#84CC16',            // Lime
  location: '#F59E0B',             // Amber
  dialogue: '#F472B6',             // Pink
  treatment: '#A78BFA',            // Violet
  outline: '#8B5CF6',              // Purple
  lore: '#FBBF24',                 // Yellow
  timeline: '#FB923C',             // Orange
  garment: brandColors.coralSpark,
  outfit: '#F56B4A',               // Light coral
  textile: brandColors.sunsetOrange,
  model: '#EC4899',                // Pink
  collection: brandColors.deepOcean,
  any: darkNeutrals.textTertiary,
};

// ============================================================================
// CONNECTION LINE COLORS (Data flow visualization)
// ============================================================================

export const connectionColors = {
  standard: darkNeutrals.textTertiary,
  active: brandColors.tealPulse,
  multiRef: brandColors.mintGlow,
  styleDna: '#6366F1',             // Indigo
  character: '#EC4899',            // Pink
  delight: brandColors.sunsetOrange, // Moment of Delight
};

// ============================================================================
// MAIN MUI THEME
// ============================================================================

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: brandColors.tealPulse,
      light: '#4FD8CE',
      dark: '#1EA89F',
      contrastText: darkNeutrals.ink,
    },
    secondary: {
      main: brandColors.techBlue,
      light: '#3A8FD6',
      dark: '#085A9A',
      contrastText: darkNeutrals.textPrimary,
    },
    background: {
      default: darkNeutrals.ink,
      paper: darkNeutrals.surface1,
    },
    success: {
      main: brandColors.mintGlow,
      light: '#A3EFCA',
      dark: '#5ED498',
      contrastText: darkNeutrals.ink,
    },
    warning: {
      main: brandColors.sunsetOrange,
      light: '#FD9B4F',
      dark: '#E06A10',
      contrastText: darkNeutrals.ink,
    },
    error: {
      main: brandColors.coralSpark,
      light: '#F56B4A',
      dark: '#D93516',
      contrastText: darkNeutrals.ink,
    },
    info: {
      main: brandColors.techBlue,
      light: '#3A8FD6',
      dark: '#085A9A',
    },
    text: {
      primary: darkNeutrals.textPrimary,
      secondary: darkNeutrals.textSecondary,
      disabled: darkNeutrals.textTertiary,
    },
    divider: darkNeutrals.border,
    action: {
      active: darkNeutrals.textPrimary,
      hover: `${darkNeutrals.textPrimary}14`, // 8% opacity
      selected: `${brandColors.tealPulse}1F`, // 12% opacity
      disabled: darkNeutrals.textTertiary,
      disabledBackground: darkNeutrals.surface2,
    },
  },
  typography: {
    fontFamily: typography.fontFamily.ui,
    h1: {
      fontFamily: typography.fontFamily.brand,
      fontSize: '2rem',      // 32px
      lineHeight: 1.25,      // 40px
      fontWeight: typography.weights.bold,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: typography.fontFamily.ui,
      fontSize: '1.5rem',    // 24px
      lineHeight: 1.33,      // 32px
      fontWeight: typography.weights.bold,
    },
    h3: {
      fontFamily: typography.fontFamily.ui,
      fontSize: '1.25rem',   // 20px
      lineHeight: 1.4,       // 28px
      fontWeight: typography.weights.bold,
    },
    h4: {
      fontFamily: typography.fontFamily.ui,
      fontSize: '1rem',      // 16px
      lineHeight: 1.5,       // 24px
      fontWeight: typography.weights.semibold,
    },
    h5: {
      fontFamily: typography.fontFamily.ui,
      fontSize: '0.875rem',  // 14px
      lineHeight: 1.43,      // 20px
      fontWeight: typography.weights.semibold,
    },
    h6: {
      fontFamily: typography.fontFamily.ui,
      fontSize: '0.75rem',   // 12px
      lineHeight: 1.33,      // 16px
      fontWeight: typography.weights.semibold,
    },
    body1: {
      fontSize: '1rem',      // 16px
      lineHeight: 1.5,       // 24px
      fontWeight: typography.weights.regular,
    },
    body2: {
      fontSize: '0.875rem',  // 14px
      lineHeight: 1.43,      // 20px
      fontWeight: typography.weights.regular,
    },
    caption: {
      fontSize: '0.75rem',   // 12px
      lineHeight: 1.33,      // 16px
      fontWeight: typography.weights.semibold,
      letterSpacing: '0.02em',
    },
    button: {
      fontFamily: typography.fontFamily.ui,
      fontSize: '0.875rem',
      fontWeight: typography.weights.semibold,
      textTransform: 'none' as const,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: shapeTokens.radius.control, // 12px default
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: darkNeutrals.ink,
          color: darkNeutrals.textPrimary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typography.weights.semibold,
          borderRadius: shapeTokens.radius.button,
          padding: '8px 16px',
          transition: 'all 0.2s ease-out',
        },
        containedPrimary: {
          backgroundColor: brandColors.tealPulse,
          color: darkNeutrals.ink,
          '&:hover': {
            backgroundColor: '#1EA89F',
          },
        },
        containedSecondary: {
          backgroundColor: brandColors.techBlue,
          color: darkNeutrals.textPrimary,
          '&:hover': {
            backgroundColor: '#085A9A',
          },
        },
        containedError: {
          backgroundColor: brandColors.coralSpark,
          color: darkNeutrals.ink,
          '&:hover': {
            backgroundColor: '#D93516',
          },
        },
        outlined: {
          borderColor: darkNeutrals.border,
          color: darkNeutrals.textPrimary,
          '&:hover': {
            backgroundColor: darkNeutrals.surface2,
            borderColor: darkNeutrals.textTertiary,
          },
        },
        text: {
          color: darkNeutrals.textPrimary,
          '&:hover': {
            backgroundColor: `${darkNeutrals.textPrimary}0A`,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: shapeTokens.radius.control,
          transition: 'all 0.2s ease-out',
          '&:hover': {
            backgroundColor: `${darkNeutrals.textPrimary}14`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: darkNeutrals.surface1,
          borderRadius: shapeTokens.radius.card,
          border: `1px solid ${darkNeutrals.border}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: darkNeutrals.surface1,
        },
        rounded: {
          borderRadius: shapeTokens.radius.card,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: darkNeutrals.surface1,
          borderColor: darkNeutrals.border,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: darkNeutrals.surface1,
          borderRadius: shapeTokens.radius.card,
          border: `1px solid ${darkNeutrals.border}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: shapeTokens.radius.control,
            backgroundColor: darkNeutrals.surface1,
            '& fieldset': {
              borderColor: darkNeutrals.border,
            },
            '&:hover fieldset': {
              borderColor: darkNeutrals.textTertiary,
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.tealPulse,
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: darkNeutrals.textTertiary,
            opacity: 1,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: shapeTokens.radius.control,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: shapeTokens.radius.chip,
          backgroundColor: darkNeutrals.surface2,
          border: `1px solid ${darkNeutrals.border}`,
          fontWeight: typography.weights.semibold,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: `${brandColors.tealPulse}20`,
          color: brandColors.tealPulse,
          border: `1px solid ${brandColors.tealPulse}40`,
        },
        colorSuccess: {
          backgroundColor: `${brandColors.mintGlow}20`,
          color: brandColors.mintGlow,
          border: `1px solid ${brandColors.mintGlow}40`,
        },
        colorWarning: {
          backgroundColor: `${brandColors.sunsetOrange}20`,
          color: brandColors.sunsetOrange,
          border: `1px solid ${brandColors.sunsetOrange}40`,
        },
        colorError: {
          backgroundColor: `${brandColors.coralSpark}20`,
          color: brandColors.coralSpark,
          border: `1px solid ${brandColors.coralSpark}40`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: darkNeutrals.surface2,
          color: darkNeutrals.textPrimary,
          border: `1px solid ${darkNeutrals.border}`,
          borderRadius: shapeTokens.radius.control,
          fontSize: '0.75rem',
          fontWeight: typography.weights.regular,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: brandColors.tealPulse,
          height: 2,
          borderRadius: 1,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: typography.weights.semibold,
          color: darkNeutrals.textSecondary,
          '&.Mui-selected': {
            color: brandColors.tealPulse,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: darkNeutrals.border,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: brandColors.tealPulse,
        },
        thumb: {
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${brandColors.tealPulse}20`,
          },
        },
        track: {
          height: 4,
          borderRadius: 2,
        },
        rail: {
          height: 4,
          borderRadius: 2,
          backgroundColor: darkNeutrals.border,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: brandColors.tealPulse,
            '& + .MuiSwitch-track': {
              backgroundColor: brandColors.tealPulse,
            },
          },
        },
        track: {
          backgroundColor: darkNeutrals.border,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: darkNeutrals.surface2,
          borderRadius: 2,
        },
        bar: {
          borderRadius: 2,
        },
        barColorPrimary: {
          backgroundColor: brandColors.tealPulse,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        colorPrimary: {
          color: brandColors.tealPulse,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: shapeTokens.radius.control,
        },
        standardSuccess: {
          backgroundColor: `${brandColors.mintGlow}15`,
          color: brandColors.mintGlow,
        },
        standardWarning: {
          backgroundColor: `${brandColors.sunsetOrange}15`,
          color: brandColors.sunsetOrange,
        },
        standardError: {
          backgroundColor: `${brandColors.coralSpark}15`,
          color: brandColors.coralSpark,
        },
        standardInfo: {
          backgroundColor: `${brandColors.techBlue}15`,
          color: brandColors.techBlue,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: darkNeutrals.surface1,
          border: `1px solid ${darkNeutrals.border}`,
          borderRadius: shapeTokens.radius.control,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: darkNeutrals.surface2,
          },
          '&.Mui-selected': {
            backgroundColor: `${brandColors.tealPulse}15`,
            '&:hover': {
              backgroundColor: `${brandColors.tealPulse}20`,
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: darkNeutrals.surface1,
          border: `1px solid ${darkNeutrals.border}`,
          borderRadius: `${shapeTokens.radius.card}px !important`,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: shapeTokens.radius.card,
        },
      },
    },
  },
});

// ============================================================================
// DESIGN TOKEN EXPORTS (For AI Agents & Documentation)
// ============================================================================

export const designTokens = {
  brand: {
    name: "Creator's Toolbox",
    aiLayer: "SmartAI",
    keywords: ["agentic", "sleek", "craft-led", "culturally grounded", "modern", "trustworthy"],
  },
  color: {
    core: brandColors,
    neutral: darkNeutrals,
    semantic: semanticColors,
    agent: agentStateColors,
    category: categoryColors,
    port: portColors,
    connection: connectionColors,
  },
  typography: {
    fontFamily: typography.fontFamily,
    weights: typography.weights,
    scale: typography.scale,
  },
  shape: shapeTokens,
  motion: {
    duration: creativeCardTokens.timing,
    easing: creativeCardTokens.easing,
  },
  canvas: canvasTokens,
  logo: {
    defaultVariant: "monochrome",
    monochromeColor: brandColors.tealPulse,
    lightModeColor: brandColors.deepOcean,
    backgroundPreferred: darkNeutrals.carbon,
    clearSpaceRule: ">=1x stroke width",
    minSizePx: 24,
  },
};

export default theme;
