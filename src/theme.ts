import { createTheme } from '@mui/material/styles';

// ============================================================================
// CREATIVE CARD DESIGN TOKENS
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
    heroRatio: 0.55, // 55% of card height for hero preview
    thumbnailSize: 48,
    variationStripHeight: 56,
  },

  // Border radius
  radius: {
    card: 16,
    inner: 12,
    button: 8,
    thumbnail: 6,
  },

  // Animation timing
  timing: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    celebration: 800,
  },

  // Easing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  },

  // Shadows
  shadows: {
    card: '0 4px 24px rgba(0, 0, 0, 0.3)',
    cardHover: '0 8px 32px rgba(0, 0, 0, 0.4)',
    cardActive: '0 0 0 2px',
    glow: '0 0 20px',
  },

  // Glassmorphism
  glass: {
    background: 'rgba(26, 26, 46, 0.85)',
    backgroundLight: 'rgba(26, 26, 46, 0.7)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(255, 255, 255, 0.15)',
    blur: 12,
  },
};

// ============================================================================
// CATEGORY COLORS (Enhanced)
// ============================================================================

export const categoryColors = {
  input: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED' },      // Purple
  imageGen: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },   // Blue
  videoGen: { main: '#22C55E', light: '#4ADE80', dark: '#16A34A' },   // Green
  threeD: { main: '#F97316', light: '#FB923C', dark: '#EA580C' },     // Orange
  character: { main: '#EC4899', light: '#F472B6', dark: '#DB2777' },  // Pink
  style: { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2' },      // Cyan
  fashion: { main: '#EC4899', light: '#F472B6', dark: '#DB2777' },    // Pink
  story: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },      // Amber
  logic: { main: '#6B7280', light: '#9CA3AF', dark: '#4B5563' },      // Gray
  audio: { main: '#A855F7', light: '#C084FC', dark: '#9333EA' },      // Purple
  output: { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2' },     // Cyan
  composite: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5' },  // Indigo
  agent: { main: '#E80ADE', light: '#F472B6', dark: '#BE185D' },      // Magenta
};

// ============================================================================
// MAIN THEME
// ============================================================================

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#0f0f14',
      paper: '#1a1a2e',
    },
    success: {
      main: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Node type colors for React Flow
export const nodeColors = {
  input: '#22c55e',      // Green
  imageGen: '#3b82f6',   // Blue
  videoGen: '#8b5cf6',   // Purple
  threeD: '#f97316',     // Orange
  character: '#ec4899',  // Pink
  style: '#06b6d4',      // Cyan
  logic: '#eab308',      // Yellow
  audio: '#14b8a6',      // Teal
  output: '#ef4444',     // Red
  composite: '#6366f1',  // Indigo
};

// Port colors for connections
export const portColors = {
  image: '#3b82f6',
  video: '#8b5cf6',
  audio: '#14b8a6',
  text: '#22c55e',
  style: '#06b6d4',
  character: '#ec4899',
  mesh3d: '#f97316',
  any: '#9ca3af',
};
