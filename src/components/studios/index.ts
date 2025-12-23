/**
 * Studios Module
 * Export all studio components and types
 */

// Shared components and tokens
export * from './shared';

// Core components
export { StudioShell } from './StudioShell';
export type { StudioShellProps, StudioMode, StudioCategory } from './StudioShell';

export { StudioCommandPalette } from './StudioCommandPalette';
export type { StudioCommandPaletteProps, Command } from './StudioCommandPalette';

// Mode components
export { FlowMode } from './modes/FlowMode';
export type { FlowModeProps, FlowStep } from './modes/FlowMode';

export { WorkspaceMode, Gallery } from './modes/WorkspaceMode';
export type { WorkspaceModeProps, WorkspacePanel, GalleryProps, GalleryItem } from './modes/WorkspaceMode';

export { TimelineMode } from './modes/TimelineMode';
export type { TimelineModeProps, TimelineProject, TimelineMilestone, ProjectStatus } from './modes/TimelineMode';

// Fashion Studio
export { FashionStudio } from './fashion/FashionStudio';
export type { FashionStudioProps } from './fashion/FashionStudio';

// Social Studio
export { SocialStudio } from './social/SocialStudio';

// Moodboards Studio
export { MoodboardsStudio } from './moodboards/MoodboardsStudio';
