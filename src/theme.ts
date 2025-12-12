import { createTheme } from '@mui/material/styles';

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
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
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
