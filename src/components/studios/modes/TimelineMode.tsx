/**
 * TimelineMode - Project timeline view for tracking creative work
 * Provides a horizontal timeline with project cards and milestones
 */

import React, { useState, useCallback, type ReactNode } from 'react';
import { Box, Typography, IconButton, Chip, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { studioColors, studioRadii, studioMotion, studioTypography } from '../shared/studioTokens';

// ============================================================================
// Types
// ============================================================================

export type ProjectStatus = 'draft' | 'in_progress' | 'review' | 'completed' | 'archived';

export interface TimelineProject {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  /** Number of assets in this project */
  assetCount?: number;
  /** Tags for filtering */
  tags?: string[];
}

export interface TimelineMilestone {
  id: string;
  label: string;
  date: Date;
  completed: boolean;
}

export interface TimelineModeProps {
  /** Projects to display */
  projects: TimelineProject[];
  /** Milestones to display on timeline */
  milestones?: TimelineMilestone[];
  /** Currently selected project ID */
  selectedProjectId?: string;
  /** Project selection callback */
  onSelectProject?: (project: TimelineProject) => void;
  /** New project callback */
  onNewProject?: () => void;
  /** Project action callback */
  onProjectAction?: (projectId: string, action: 'edit' | 'delete' | 'archive') => void;
  /** Header content */
  header?: ReactNode;
  /** Empty state content */
  emptyState?: ReactNode;
}

// ============================================================================
// Status Config
// ============================================================================

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: studioColors.textMuted },
  in_progress: { label: 'In Progress', color: studioColors.warning },
  review: { label: 'Review', color: studioColors.blue },
  completed: { label: 'Completed', color: studioColors.success },
  archived: { label: 'Archived', color: studioColors.textTertiary },
};

// ============================================================================
// Project Card Component
// ============================================================================

interface ProjectCardProps {
  project: TimelineProject;
  isSelected: boolean;
  onSelect: () => void;
  onAction?: (action: 'edit' | 'delete' | 'archive') => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  onSelect,
  onAction,
}) => {
  const status = statusConfig[project.status];

  return (
    <Box
      onClick={onSelect}
      sx={{
        width: 280,
        flexShrink: 0,
        borderRadius: `${studioRadii.md}px`,
        background: studioColors.surface1,
        border: `1px solid ${isSelected ? studioColors.accent : studioColors.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: `all ${studioMotion.fast}`,
        '&:hover': {
          borderColor: isSelected ? studioColors.accent : studioColors.borderHover,
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${studioColors.ink}40`,
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: 140,
          background: project.thumbnailUrl
            ? `url(${project.thumbnailUrl}) center/cover`
            : studioColors.surface2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          p: 1,
        }}
      >
        {onAction && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // Could open a menu here
            }}
            sx={{
              background: `${studioColors.ink}80`,
              color: studioColors.textSecondary,
              '&:hover': {
                background: studioColors.ink,
                color: studioColors.textPrimary,
              },
            }}
          >
            <MoreHorizIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.md,
              fontWeight: studioTypography.fontWeight.medium,
              color: studioColors.textPrimary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {project.title}
          </Typography>
        </Box>

        {project.description && (
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              color: studioColors.textSecondary,
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {project.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Chip
            size="small"
            label={status.label}
            sx={{
              height: 22,
              fontSize: studioTypography.fontSize.xs,
              background: `${status.color}20`,
              color: status.color,
              border: `1px solid ${status.color}40`,
            }}
          />

          <Typography
            sx={{
              fontSize: studioTypography.fontSize.xs,
              color: studioColors.textMuted,
            }}
          >
            {project.assetCount ?? 0} assets
          </Typography>
        </Box>

        {project.tags && project.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
            {project.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                size="small"
                label={tag}
                sx={{
                  height: 18,
                  fontSize: 10,
                  background: studioColors.surface2,
                  color: studioColors.textTertiary,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ============================================================================
// Timeline Track Component
// ============================================================================

interface TimelineTrackProps {
  milestones: TimelineMilestone[];
  onToggleMilestone?: (id: string) => void;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({ milestones, onToggleMilestone }) => {
  if (milestones.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        py: 2,
        px: 4,
        borderBottom: `1px solid ${studioColors.borderSubtle}`,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {milestones.map((milestone, index) => (
        <React.Fragment key={milestone.id}>
          {/* Milestone point */}
          <Box
            onClick={() => onToggleMilestone?.(milestone.id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
              cursor: onToggleMilestone ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            {milestone.completed ? (
              <CheckCircleIcon sx={{ fontSize: 20, color: studioColors.success }} />
            ) : (
              <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: studioColors.textMuted }} />
            )}
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.xs,
                color: milestone.completed ? studioColors.textSecondary : studioColors.textMuted,
                whiteSpace: 'nowrap',
              }}
            >
              {milestone.label}
            </Typography>
            <Typography
              sx={{
                fontSize: 10,
                color: studioColors.textMuted,
              }}
            >
              {milestone.date.toLocaleDateString()}
            </Typography>
          </Box>

          {/* Connector line */}
          {index < milestones.length - 1 && (
            <Box
              sx={{
                flex: 1,
                minWidth: 60,
                height: 2,
                background: milestone.completed ? studioColors.success : studioColors.border,
                mx: 2,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const TimelineMode: React.FC<TimelineModeProps> = ({
  projects,
  milestones = [],
  selectedProjectId,
  onSelectProject,
  onNewProject,
  onProjectAction,
  header,
  emptyState,
}) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left'
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: Math.max(0, newPosition),
        behavior: 'smooth',
      });
      setScrollPosition(Math.max(0, newPosition));
    }
  }, [scrollPosition]);

  // Group projects by status
  const projectsByStatus = projects.reduce((acc, project) => {
    const status = project.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(project);
    return acc;
  }, {} as Record<ProjectStatus, TimelineProject[]>);

  const statusOrder: ProjectStatus[] = ['in_progress', 'draft', 'review', 'completed', 'archived'];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: studioColors.ink,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 3,
          borderBottom: `1px solid ${studioColors.borderSubtle}`,
        }}
      >
        {header || (
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.lg,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
            }}
          >
            Projects
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Scroll controls */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => scroll('left')}
              sx={{
                color: studioColors.textSecondary,
                '&:hover': { background: studioColors.surface2 },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => scroll('right')}
              sx={{
                color: studioColors.textSecondary,
                '&:hover': { background: studioColors.surface2 },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {onNewProject && (
            <Button
              startIcon={<AddIcon />}
              onClick={onNewProject}
              sx={{
                background: studioColors.accent,
                color: studioColors.textPrimary,
                '&:hover': { background: studioColors.accentMuted },
              }}
            >
              New Project
            </Button>
          )}
        </Box>
      </Box>

      {/* Milestone track */}
      {milestones.length > 0 && <TimelineTrack milestones={milestones} />}

      {/* Projects grid */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 4,
        }}
      >
        {projects.length === 0 ? (
          emptyState || (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                gap: 2,
              }}
            >
              <Typography sx={{ color: studioColors.textMuted }}>
                No projects yet. Create your first project to get started.
              </Typography>
              {onNewProject && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={onNewProject}
                  sx={{
                    background: studioColors.accent,
                    color: studioColors.textPrimary,
                    '&:hover': { background: studioColors.accentMuted },
                  }}
                >
                  Create Project
                </Button>
              )}
            </Box>
          )
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {statusOrder.map((status) => {
              const statusProjects = projectsByStatus[status];
              if (!statusProjects || statusProjects.length === 0) return null;

              return (
                <Box key={status}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {statusConfig[status].label}
                    </Typography>
                    <Chip
                      size="small"
                      label={statusProjects.length}
                      sx={{
                        height: 20,
                        fontSize: 11,
                        background: studioColors.surface2,
                        color: studioColors.textTertiary,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      overflowX: 'auto',
                      pb: 1,
                      '&::-webkit-scrollbar': {
                        height: 6,
                      },
                      '&::-webkit-scrollbar-track': {
                        background: studioColors.surface1,
                        borderRadius: 3,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: studioColors.surface3,
                        borderRadius: 3,
                        '&:hover': { background: studioColors.border },
                      },
                    }}
                  >
                    {statusProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isSelected={project.id === selectedProjectId}
                        onSelect={() => onSelectProject?.(project)}
                        onAction={
                          onProjectAction
                            ? (action) => onProjectAction(project.id, action)
                            : undefined
                        }
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TimelineMode;
