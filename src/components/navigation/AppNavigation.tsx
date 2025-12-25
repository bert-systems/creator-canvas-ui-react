/**
 * AppNavigation - Left sidebar navigation
 * Provides access to Studios and Boards
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import ShareIcon from '@mui/icons-material/Share';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import GridViewIcon from '@mui/icons-material/GridView';
import AddIcon from '@mui/icons-material/Add';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import FolderIcon from '@mui/icons-material/Folder';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ExploreIcon from '@mui/icons-material/Explore';
import {
  studioColors,
  studioRadii,
  studioMotion,
  studioTypography,
} from '../studios/shared/studioTokens';
import { useCanvasStore } from '@/stores/canvasStore';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface AppNavigationProps {
  /** Collapsed state controlled externally */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Hide the navigation completely */
  hidden?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const NAV_WIDTH_EXPANDED = 240;
const NAV_WIDTH_COLLAPSED = 64;

const STORAGE_KEY = 'creative-canvas-nav-collapsed';

// ============================================================================
// Category Config
// ============================================================================

const categoryColors: Record<string, string> = {
  fashion: '#E91E63',
  social: '#2196F3',
  moodboards: '#9C27B0',
  canvas: studioColors.accent,
};

const categoryIcons: Record<string, React.ReactNode> = {
  fashion: <CheckroomIcon fontSize="small" />,
  social: <ShareIcon fontSize="small" />,
  moodboards: <ColorLensIcon fontSize="small" />,
  canvas: <GridViewIcon fontSize="small" />,
};

// ============================================================================
// Helper Functions
// ============================================================================

const getStoredCollapsedState = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
};

// ============================================================================
// NavItem Component
// ============================================================================

interface NavItemButtonProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  color?: string;
}

const NavItemButton: React.FC<NavItemButtonProps> = ({
  item,
  isActive,
  collapsed,
  onClick,
  color,
}) => {
  const button = (
    <ListItemButton
      onClick={onClick}
      sx={{
        minHeight: 40,
        borderRadius: `${studioRadii.md}px`,
        px: collapsed ? 1.5 : 2,
        py: 0.75,
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: isActive ? studioColors.surface2 : 'transparent',
        borderLeft: isActive ? `2px solid ${color || studioColors.accent}` : '2px solid transparent',
        transition: `all ${studioMotion.fast}`,
        '&:hover': {
          background: studioColors.surface2,
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 36,
          color: isActive ? (color || studioColors.accent) : studioColors.textSecondary,
          justifyContent: 'center',
        }}
      >
        {item.badge ? (
          <Badge badgeContent={item.badge} color="primary" max={99}>
            {item.icon}
          </Badge>
        ) : (
          item.icon
        )}
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={item.label}
          sx={{
            '& .MuiListItemText-primary': {
              fontSize: studioTypography.fontSize.sm,
              fontWeight: isActive ? studioTypography.fontWeight.semibold : studioTypography.fontWeight.normal,
              color: isActive ? studioColors.textPrimary : studioColors.textSecondary,
            },
          }}
        />
      )}
    </ListItemButton>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};

// ============================================================================
// NavSection Component
// ============================================================================

interface NavSectionComponentProps {
  section: NavSection;
  collapsed: boolean;
  activePath: string;
  onNavigate: (path: string) => void;
}

const NavSectionComponent: React.FC<NavSectionComponentProps> = ({
  section,
  collapsed,
  activePath,
  onNavigate,
}) => {
  const [expanded, setExpanded] = useState(section.defaultExpanded ?? true);

  return (
    <Box sx={{ mb: 1 }}>
      {/* Section Header */}
      {!collapsed && (
        <Box
          onClick={() => section.collapsible && setExpanded(!expanded)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            cursor: section.collapsible ? 'pointer' : 'default',
            '&:hover': section.collapsible ? {
              background: studioColors.surface1,
            } : {},
          }}
        >
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.xs,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {section.label}
          </Typography>
          {section.collapsible && (
            expanded ? <ExpandLessIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
                     : <ExpandMoreIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
          )}
        </Box>
      )}

      {/* Section Items */}
      <Collapse in={!section.collapsible || expanded} timeout="auto">
        <List dense disablePadding sx={{ px: collapsed ? 0.5 : 1 }}>
          {section.items.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.25 }}>
              <NavItemButton
                item={item}
                isActive={activePath === item.path || activePath.startsWith(item.path + '/')}
                collapsed={collapsed}
                onClick={() => onNavigate(item.path)}
                color={categoryColors[item.id]}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const AppNavigation: React.FC<AppNavigationProps> = ({
  collapsed: controlledCollapsed,
  onCollapsedChange,
  hidden = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [internalCollapsed, setInternalCollapsed] = useState(getStoredCollapsedState);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  // Get boards from canvas store
  const boards = useCanvasStore((state) => state.boards);
  const currentBoard = useCanvasStore((state) => state.currentBoard);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const handleToggleCollapse = () => {
    const newValue = !collapsed;
    setInternalCollapsed(newValue);
    onCollapsedChange?.(newValue);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (hidden) {
    return null;
  }

  // Navigation sections
  const sections: NavSection[] = [
    {
      id: 'studios',
      label: 'Studios',
      items: [
        { id: 'fashion', label: 'Fashion', icon: <CheckroomIcon />, path: '/studios/fashion' },
        { id: 'social', label: 'Social Media', icon: <ShareIcon />, path: '/studios/social' },
        { id: 'moodboards', label: 'Moodboards', icon: <ColorLensIcon />, path: '/studios/moodboards' },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      items: [
        { id: 'my-library', label: 'My Library', icon: <PhotoLibraryIcon />, path: '/library' },
        { id: 'inspiration', label: 'Inspiration', icon: <ExploreIcon />, path: '/inspiration' },
      ],
    },
    {
      id: 'boards',
      label: 'Boards',
      items: [
        { id: 'canvas', label: 'Canvas', icon: <GridViewIcon />, path: '/canvas' },
        { id: 'new', label: 'New Board', icon: <AddIcon />, path: '/' },
      ],
    },
  ];

  // Add boards section if available
  if (boards.length > 0) {
    sections.push({
      id: 'my-boards',
      label: 'My Boards',
      collapsible: true,
      defaultExpanded: true,
      items: boards.slice(0, 5).map((board) => ({
        id: board.id,
        label: board.name,
        icon: categoryIcons[board.category] || <FolderIcon fontSize="small" />,
        path: `/board/${board.id}`,
        badge: currentBoard?.id === board.id ? undefined : undefined,
      })),
    });
  }

  return (
    <Box
      sx={{
        width: collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED,
        minWidth: collapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH_EXPANDED,
        height: '100vh',
        background: studioColors.carbon,
        borderRight: `1px solid ${studioColors.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: `width ${studioMotion.standard}, min-width ${studioMotion.standard}`,
        overflow: 'hidden',
        zIndex: 1200,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          p: 2,
          height: 56,
          borderBottom: `1px solid ${studioColors.borderSubtle}`,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: studioRadii.md,
                background: `linear-gradient(135deg, ${studioColors.accent} 0%, ${studioColors.blue} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DashboardIcon sx={{ fontSize: 16, color: studioColors.textPrimary }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.semibold,
                color: studioColors.textPrimary,
              }}
            >
              Creative Canvas
            </Typography>
          </Box>
        )}
        <Tooltip title={collapsed ? 'Expand menu' : 'Collapse menu'} placement="right">
          <IconButton
            onClick={handleToggleCollapse}
            size="small"
            sx={{
              color: studioColors.textSecondary,
              '&:hover': {
                background: studioColors.surface2,
                color: studioColors.textPrimary,
              },
            }}
          >
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Navigation Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 2,
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: studioColors.surface3,
            borderRadius: 2,
          },
        }}
      >
        {sections.map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 && (
              <Divider sx={{ my: 1.5, borderColor: studioColors.borderSubtle }} />
            )}
            <NavSectionComponent
              section={section}
              collapsed={collapsed}
              activePath={location.pathname}
              onNavigate={handleNavigate}
            />
          </React.Fragment>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${studioColors.borderSubtle}`,
        }}
      >
        {collapsed ? (
          <Tooltip title="Recent activity" placement="right">
            <IconButton
              size="small"
              sx={{
                color: studioColors.textMuted,
                '&:hover': { color: studioColors.textSecondary },
              }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.xs,
                color: studioColors.textMuted,
              }}
            >
              Last session: Today
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AppNavigation;
