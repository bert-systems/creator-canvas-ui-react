/**
 * Shared Studio Components
 * Export all shared components and design tokens
 */

// Design tokens
export * from './studioTokens';

// Components
export { SurfaceCard, GlassPanel } from './SurfaceCard';
export type { SurfaceCardProps } from './SurfaceCard';

export { StatusIndicator, StatusBadge, StatusChip } from './StatusIndicator';
export type { StatusIndicatorProps, StatusBadgeProps, StatusChipProps, StatusState } from './StatusIndicator';

export { AIPromptBar } from './AIPromptBar';
export type { AIPromptBarProps } from './AIPromptBar';

export { CollaborationPresence, LiveCursor, ActivityIndicator } from './CollaborationPresence';
export type { CollaborationPresenceProps, LiveCursorProps, ActivityIndicatorProps, Collaborator } from './CollaborationPresence';

export { BeforeAfterSlider } from './BeforeAfterSlider';
export type { default as BeforeAfterSliderProps } from './BeforeAfterSlider';
