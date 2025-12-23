/**
 * StudioShell - Main container for all Studios
 * Provides consistent layout, navigation, and mode switching
 */

import React, { useCallback, type ReactNode } from 'react';
import { Box, Typography, IconButton, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import GridViewIcon from '@mui/icons-material/GridView';
import TimelineIcon from '@mui/icons-material/Timeline';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { studioColors, studioRadii, studioMotion, studioTypography } from './shared/studioTokens';

export type StudioMode = 'flow' | 'workspace' | 'timeline';
export type StudioCategory = 'fashion' | 'social' | 'moodboards';

export interface StudioShellProps {
  /** Studio category */
  category: StudioCategory;
  /** Current mode */
  mode: StudioMode;
  /** Mode change callback */
  onModeChange: (mode: StudioMode) => void;
  /** Page title shown in header */
  title?: string;
  /** Back button callback (if provided, shows back button) */
  onBack?: () => void;
  /** Command palette open callback */
  onOpenCommandPalette?: () => void;
  /** Help callback */
  onHelp?: () => void;
  /** Header actions slot */
  headerActions?: ReactNode;
  /** Sidebar content */
  sidebar?: ReactNode;
  /** Whether sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Main content */
  children: ReactNode;
}

const categoryLabels: Record<StudioCategory, string> = {
  fashion: 'Fashion Studio',
  social: 'Social Studio',
  moodboards: 'Moodboards Studio',
};

const modeConfig: Record<StudioMode, { icon: typeof ViewStreamIcon; label: string; tooltip: string }> = {
  flow: {
    icon: ViewStreamIcon,
    label: 'Flow',
    tooltip: 'Guided step-by-step workflow',
  },
  workspace: {
    icon: GridViewIcon,
    label: 'Workspace',
    tooltip: 'Full panel layout for power users',
  },
  timeline: {
    icon: TimelineIcon,
    label: 'Timeline',
    tooltip: 'Project timeline view',
  },
};

export const StudioShell: React.FC<StudioShellProps> = ({
  category,
  mode,
  onModeChange,
  title,
  onBack,
  onOpenCommandPalette,
  onHelp,
  headerActions,
  sidebar,
  sidebarCollapsed = false,
  children,
}) => {
  const handleModeChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newMode: StudioMode | null) => {
      if (newMode) {
        onModeChange(newMode);
      }
    },
    [onModeChange]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: studioColors.ink,
        color: studioColors.textPrimary,
        fontFamily: studioTypography.fontFamily,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          px: 2,
          borderBottom: `1px solid ${studioColors.borderSubtle}`,
          background: studioColors.carbon,
          flexShrink: 0,
        }}
      >
        {/* Left section: Back + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onBack && (
            <IconButton
              onClick={onBack}
              size="small"
              sx={{
                color: studioColors.textSecondary,
                '&:hover': {
                  color: studioColors.textPrimary,
                  background: studioColors.surface2,
                },
              }}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
          )}
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.md,
              fontWeight: studioTypography.fontWeight.medium,
              color: studioColors.textSecondary,
            }}
          >
            {categoryLabels[category]}
          </Typography>
          {title && (
            <>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.md,
                  color: studioColors.textMuted,
                  mx: 0.5,
                }}
              >
                /
              </Typography>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.md,
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textPrimary,
                }}
              >
                {title}
              </Typography>
            </>
          )}
        </Box>

        {/* Center section: Mode toggle */}
        <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            sx={{
              background: studioColors.surface1,
              border: `1px solid ${studioColors.border}`,
              borderRadius: `${studioRadii.md}px`,
              '& .MuiToggleButtonGroup-grouped': {
                border: 'none',
                borderRadius: `${studioRadii.md - 2}px !important`,
                px: 2,
                py: 0.75,
                gap: 0.75,
                transition: `all ${studioMotion.fast}`,
                color: studioColors.textSecondary,
                fontSize: studioTypography.fontSize.sm,
                fontWeight: studioTypography.fontWeight.medium,
                textTransform: 'none',
                '&.Mui-selected': {
                  background: studioColors.surface3,
                  color: studioColors.textPrimary,
                },
                '&:hover': {
                  background: studioColors.surface2,
                },
              },
            }}
          >
            {(Object.entries(modeConfig) as [StudioMode, typeof modeConfig['flow']][]).map(
              ([modeKey, config]) => (
                <Tooltip key={modeKey} title={config.tooltip} placement="bottom">
                  <ToggleButton value={modeKey}>
                    <config.icon sx={{ fontSize: 16 }} />
                    {config.label}
                  </ToggleButton>
                </Tooltip>
              )
            )}
          </ToggleButtonGroup>
        </Box>

        {/* Right section: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {headerActions}

          {onOpenCommandPalette && (
            <Tooltip title="Command Palette (⌘K)">
              <IconButton
                onClick={onOpenCommandPalette}
                size="small"
                sx={{
                  color: studioColors.textTertiary,
                  fontSize: studioTypography.fontSize.sm,
                  gap: 0.5,
                  borderRadius: `${studioRadii.md - 2}px`,
                  border: `1px solid ${studioColors.border}`,
                  px: 1,
                  '&:hover': {
                    color: studioColors.textSecondary,
                    background: studioColors.surface2,
                  },
                }}
              >
                <KeyboardCommandKeyIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: studioTypography.fontSize.xs }}>K</Typography>
              </IconButton>
            </Tooltip>
          )}

          {onHelp && (
            <IconButton
              onClick={onHelp}
              size="small"
              sx={{
                color: studioColors.textTertiary,
                '&:hover': {
                  color: studioColors.textSecondary,
                  background: studioColors.surface2,
                },
              }}
            >
              <HelpOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Optional sidebar */}
        {sidebar && (
          <Box
            component="aside"
            sx={{
              width: sidebarCollapsed ? 64 : 240,
              borderRight: `1px solid ${studioColors.borderSubtle}`,
              background: studioColors.carbon,
              transition: `width ${studioMotion.standard}`,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {sidebar}
          </Box>
        )}

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            background: studioColors.ink,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default StudioShell;
