/**
 * Studio Design Tokens
 *
 * Refined Professional Palette
 * Philosophy: Neutral-first (90% grayscale), color used sparingly for meaning only
 */

export const studioColors = {
  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRALS (Primary UI palette - 90% of the interface)
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCENT COLORS (Used sparingly - 10% of the interface)
  // Desaturated versions of brand colors for professional look
  // ═══════════════════════════════════════════════════════════════════════════

  // Primary accent - Muted teal (use for: active states, primary actions)
  accent: '#3B9B94',        // Desaturated teal
  accentMuted: '#2D7A74',   // Darker teal for subtle highlights
  accentSubtle: '#1A4D49',  // Very subtle teal tint for backgrounds

  // Secondary accent - Quiet blue (use for: links, information)
  blue: '#4A7C9B',          // Muted steel blue
  blueMuted: '#3A6179',     // Darker blue

  // Semantic colors (desaturated for refinement)
  success: '#5B9A6F',       // Muted sage green
  successMuted: '#3D6B4A',  // Darker success

  warning: '#C4863A',       // Muted amber
  warningMuted: '#8A5F2A',  // Darker warning

  error: '#B85450',         // Muted coral
  errorMuted: '#8A3D3A',    // Darker error

  // ═══════════════════════════════════════════════════════════════════════════
  // BRAND COLORS (Reserved for marketing/logo only, not UI)
  // ═══════════════════════════════════════════════════════════════════════════
  brandTeal: '#26CABF',     // Logo, marketing hero moments ONLY
  brandCoral: '#F2492A',    // Logo accent ONLY
} as const;

export const studioRadii = {
  none: 0,
  sm: 4,       // Small controls (chips, badges)
  md: 8,       // Default (buttons, inputs, cards)
  lg: 12,      // Panels, dialogs
  xl: 16,      // Large modals
  full: 9999,  // Pills, avatars
} as const;

export const studioMotion = {
  instant: '100ms ease-out',
  fast: '180ms ease-out',      // Micro-interactions
  standard: '240ms ease-out',  // Default transitions
  slow: '320ms ease-out',      // Panel reveals
} as const;

export const studioShadows = {
  xs: '0 1px 2px rgba(0,0,0,0.4)',
  sm: '0 2px 4px rgba(0,0,0,0.3)',
  md: '0 4px 12px rgba(0,0,0,0.25)',
  lg: '0 8px 24px rgba(0,0,0,0.25)',
  xl: '0 12px 48px rgba(0,0,0,0.3)',
} as const;

export const studioSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const studioTypography = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: {
    xs: '0.6875rem',    // 11px
    sm: '0.75rem',      // 12px
    md: '0.875rem',     // 14px
    base: '0.9375rem',  // 15px
    lg: '1rem',         // 16px
    xl: '1.125rem',     // 18px
    '2xl': '1.25rem',   // 20px
    '3xl': '1.5rem',    // 24px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

// MUI sx prop compatible styles
export const studioStyles = {
  // Glass panel - for overlays only
  glassPanel: {
    background: 'rgba(15, 15, 17, 0.90)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid rgba(255, 255, 255, 0.05)`,
    borderRadius: `${studioRadii.lg}px`,
  },

  // Surface card - default card style
  surfaceCard: {
    background: studioColors.surface1,
    border: `1px solid ${studioColors.border}`,
    borderRadius: `${studioRadii.md}px`,
    transition: `all ${studioMotion.fast}`,
    '&:hover': {
      background: studioColors.surface2,
      borderColor: studioColors.borderHover,
    },
  },

  // Interactive surface - clickable items
  interactiveSurface: {
    background: 'transparent',
    borderRadius: `${studioRadii.md}px`,
    transition: `background ${studioMotion.fast}`,
    cursor: 'pointer',
    '&:hover': {
      background: studioColors.surface2,
    },
  },

  // Input field style
  inputField: {
    background: studioColors.surface1,
    border: `1px solid ${studioColors.border}`,
    borderRadius: `${studioRadii.md}px`,
    color: studioColors.textPrimary,
    transition: `border-color ${studioMotion.fast}`,
    '&:focus, &:focus-within': {
      borderColor: studioColors.borderHover,
      outline: 'none',
    },
    '& ::placeholder': {
      color: studioColors.textTertiary,
    },
  },

  // Primary button - accent color
  primaryButton: {
    background: studioColors.accent,
    color: studioColors.textPrimary,
    border: 'none',
    borderRadius: `${studioRadii.md - 2}px`,
    fontWeight: studioTypography.fontWeight.semibold,
    textTransform: 'none' as const,
    transition: `background ${studioMotion.fast}`,
    '&:hover': {
      background: studioColors.accentMuted,
    },
    '&:disabled': {
      background: studioColors.surface3,
      color: studioColors.textMuted,
    },
  },

  // Secondary button - outline style
  secondaryButton: {
    background: 'transparent',
    color: studioColors.textSecondary,
    border: `1px solid ${studioColors.border}`,
    borderRadius: `${studioRadii.md - 2}px`,
    fontWeight: studioTypography.fontWeight.medium,
    textTransform: 'none' as const,
    transition: `all ${studioMotion.fast}`,
    '&:hover': {
      background: studioColors.surface2,
      borderColor: studioColors.borderHover,
      color: studioColors.textPrimary,
    },
  },

  // Ghost button - minimal style
  ghostButton: {
    background: 'transparent',
    color: studioColors.textSecondary,
    border: 'none',
    borderRadius: `${studioRadii.md - 2}px`,
    transition: `all ${studioMotion.fast}`,
    '&:hover': {
      background: studioColors.surface2,
      color: studioColors.textPrimary,
    },
  },
} as const;

// Type exports
export type StudioColor = keyof typeof studioColors;
export type StudioRadius = keyof typeof studioRadii;
export type StudioMotion = keyof typeof studioMotion;
export type StudioShadow = keyof typeof studioShadows;
