/**
 * WorkspaceMode - Panel-based layout for power users
 * Provides a Figma-like workspace with customizable panels
 */

import React, { useState, useCallback, type ReactNode } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { studioColors, studioRadii, studioMotion, studioTypography } from '../shared/studioTokens';

// ============================================================================
// Types
// ============================================================================

export interface WorkspacePanel {
  id: string;
  title: string;
  icon?: ReactNode;
  content: ReactNode;
  /** Default width in pixels */
  defaultWidth?: number;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Whether panel can be collapsed */
  collapsible?: boolean;
}

export interface WorkspaceModeProps {
  /** Left sidebar panels */
  leftPanels?: WorkspacePanel[];
  /** Right sidebar panels */
  rightPanels?: WorkspacePanel[];
  /** Main content area */
  children: ReactNode;
  /** Footer content */
  footer?: ReactNode;
}

// ============================================================================
// Panel Component
// ============================================================================

interface PanelProps {
  panel: WorkspacePanel;
  position: 'left' | 'right';
  collapsed: boolean;
  onToggle: () => void;
}

const Panel: React.FC<PanelProps> = ({ panel, position, collapsed, onToggle }) => {
  const width = collapsed ? 48 : (panel.defaultWidth || 240);
  const ChevronIcon = position === 'left'
    ? (collapsed ? ChevronRightIcon : ChevronLeftIcon)
    : (collapsed ? ChevronLeftIcon : ChevronRightIcon);

  return (
    <Box
      sx={{
        width,
        minWidth: collapsed ? 48 : (panel.minWidth || 200),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: studioColors.carbon,
        borderLeft: position === 'right' ? `1px solid ${studioColors.borderSubtle}` : 'none',
        borderRight: position === 'left' ? `1px solid ${studioColors.borderSubtle}` : 'none',
        transition: `width ${studioMotion.standard}, min-width ${studioMotion.standard}`,
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 0 : 2,
          py: 1.5,
          borderBottom: `1px solid ${studioColors.borderSubtle}`,
          minHeight: 48,
        }}
      >
        {!collapsed && (
          <>
            {panel.icon && (
              <Box sx={{ color: studioColors.textTertiary, mr: 1, display: 'flex' }}>
                {panel.icon}
              </Box>
            )}
            <Typography
              sx={{
                flex: 1,
                fontSize: studioTypography.fontSize.sm,
                fontWeight: studioTypography.fontWeight.semibold,
                color: studioColors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {panel.title}
            </Typography>
          </>
        )}
        {panel.collapsible !== false && (
          <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
            <IconButton
              size="small"
              onClick={onToggle}
              sx={{
                color: studioColors.textTertiary,
                '&:hover': {
                  color: studioColors.textSecondary,
                  background: studioColors.surface2,
                },
              }}
            >
              <ChevronIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Panel content */}
      {!collapsed && (
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          {panel.content}
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const WorkspaceMode: React.FC<WorkspaceModeProps> = ({
  leftPanels = [],
  rightPanels = [],
  children,
  footer,
}) => {
  const [collapsedPanels, setCollapsedPanels] = useState<Set<string>>(new Set());

  const togglePanel = useCallback((panelId: string) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(panelId)) {
        next.delete(panelId);
      } else {
        next.add(panelId);
      }
      return next;
    });
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: studioColors.ink,
      }}
    >
      {/* Main workspace area */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Left panels */}
        {leftPanels.length > 0 && (
          <Box sx={{ display: 'flex', height: '100%' }}>
            {leftPanels.map((panel) => (
              <Panel
                key={panel.id}
                panel={panel}
                position="left"
                collapsed={collapsedPanels.has(panel.id)}
                onToggle={() => togglePanel(panel.id)}
              />
            ))}
          </Box>
        )}

        {/* Main content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            background: studioColors.ink,
          }}
        >
          {children}
        </Box>

        {/* Right panels */}
        {rightPanels.length > 0 && (
          <Box sx={{ display: 'flex', height: '100%' }}>
            {rightPanels.map((panel) => (
              <Panel
                key={panel.id}
                panel={panel}
                position="right"
                collapsed={collapsedPanels.has(panel.id)}
                onToggle={() => togglePanel(panel.id)}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          sx={{
            borderTop: `1px solid ${studioColors.borderSubtle}`,
            background: studioColors.carbon,
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
};

// ============================================================================
// Gallery Component - Reusable image gallery for workspace
// ============================================================================

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  selected?: boolean;
}

export interface GalleryProps {
  items: GalleryItem[];
  onSelect?: (item: GalleryItem) => void;
  selectedId?: string;
  columns?: number;
  aspectRatio?: string;
}

export const Gallery: React.FC<GalleryProps> = ({
  items,
  onSelect,
  selectedId,
  columns = 4,
  aspectRatio = '3/4',
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 2,
      p: 2,
    }}
  >
    {items.map((item) => {
      const isSelected = item.id === selectedId;
      return (
        <Box
          key={item.id}
          onClick={() => onSelect?.(item)}
          sx={{
            cursor: onSelect ? 'pointer' : 'default',
            borderRadius: `${studioRadii.md}px`,
            overflow: 'hidden',
            border: `2px solid ${isSelected ? studioColors.accent : 'transparent'}`,
            transition: `all ${studioMotion.fast}`,
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
        >
          <Box
            sx={{
              aspectRatio,
              background: studioColors.surface2,
              backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {(item.title || item.subtitle) && (
            <Box sx={{ p: 1.5, background: studioColors.surface1 }}>
              {item.title && (
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.sm,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textPrimary,
                  }}
                >
                  {item.title}
                </Typography>
              )}
              {item.subtitle && (
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.xs,
                    color: studioColors.textTertiary,
                  }}
                >
                  {item.subtitle}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );
    })}
  </Box>
);

export default WorkspaceMode;
