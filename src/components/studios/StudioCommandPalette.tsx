/**
 * StudioCommandPalette - Clean, minimal command interface (⌘K)
 * Inspired by Linear/Raycast but with refined aesthetic
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Dialog,
  Box,
  TextField,
  Typography,
  List,
  ListItemButton,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import ShareIcon from '@mui/icons-material/Share';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import { studioColors, studioRadii, studioMotion, studioTypography, studioShadows } from './shared/studioTokens';

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  category: 'navigation' | 'actions' | 'ai' | 'recent' | 'settings';
  action: () => void;
}

export interface StudioCommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Close callback */
  onClose: () => void;
  /** Additional commands from the current studio context */
  contextCommands?: Command[];
  /** Recently used items */
  recentItems?: { id: string; label: string; action: () => void }[];
  /** Navigation callbacks */
  onNavigate?: {
    toFashion?: () => void;
    toSocial?: () => void;
    toMoodboards?: () => void;
    toCanvas?: () => void;
  };
}

const categoryLabels: Record<Command['category'], string> = {
  navigation: 'Navigation',
  actions: 'Actions',
  ai: 'AI',
  recent: 'Recent',
  settings: 'Settings',
};

const categoryOrder: Command['category'][] = ['actions', 'ai', 'navigation', 'recent', 'settings'];

export const StudioCommandPalette: React.FC<StudioCommandPaletteProps> = ({
  open,
  onClose,
  contextCommands = [],
  recentItems = [],
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build command list
  const commands = useMemo((): Command[] => {
    const baseCommands: Command[] = [
      // Navigation
      {
        id: 'nav-fashion',
        label: 'Go to Fashion Studio',
        shortcut: '⌘1',
        icon: <CheckroomIcon sx={{ fontSize: 16 }} />,
        category: 'navigation',
        action: () => onNavigate?.toFashion?.(),
      },
      {
        id: 'nav-social',
        label: 'Go to Social Studio',
        shortcut: '⌘2',
        icon: <ShareIcon sx={{ fontSize: 16 }} />,
        category: 'navigation',
        action: () => onNavigate?.toSocial?.(),
      },
      {
        id: 'nav-moodboards',
        label: 'Go to Moodboards Studio',
        shortcut: '⌘3',
        icon: <DashboardIcon sx={{ fontSize: 16 }} />,
        category: 'navigation',
        action: () => onNavigate?.toMoodboards?.(),
      },
      {
        id: 'nav-canvas',
        label: 'Open Advanced Canvas',
        description: 'Node-based workflow editor',
        shortcut: '⌘0',
        icon: <AccountTreeIcon sx={{ fontSize: 16 }} />,
        category: 'navigation',
        action: () => onNavigate?.toCanvas?.(),
      },
      // Settings
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon sx={{ fontSize: 16 }} />,
        category: 'settings',
        action: () => {}, // Placeholder
      },
    ];

    // Add context commands
    const allCommands = [...contextCommands, ...baseCommands];

    // Add recent items
    recentItems.forEach((item) => {
      allCommands.push({
        id: `recent-${item.id}`,
        label: item.label,
        icon: <HistoryIcon sx={{ fontSize: 16 }} />,
        category: 'recent',
        action: item.action,
      });
    });

    return allCommands;
  }, [contextCommands, recentItems, onNavigate]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    const result: Command[] = [];
    categoryOrder.forEach((cat) => {
      if (groupedCommands[cat]) {
        result.push(...groupedCommands[cat]);
      }
    });
    return result;
  }, [groupedCommands]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            flatCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    },
    [flatCommands, selectedIndex, onClose]
  );

  const handleSelect = useCallback(
    (command: Command) => {
      command.action();
      onClose();
    },
    [onClose]
  );

  let currentFlatIndex = 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: studioColors.carbon,
          border: `1px solid ${studioColors.border}`,
          borderRadius: `${studioRadii.lg}px`,
          boxShadow: studioShadows.xl,
          overflow: 'hidden',
          maxHeight: '70vh',
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          },
        },
      }}
    >
      {/* Search input */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${studioColors.borderSubtle}`,
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: studioColors.textTertiary, fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: studioTypography.fontSize.base,
              color: studioColors.textPrimary,
              fontFamily: studioTypography.fontFamily,
              '& ::placeholder': {
                color: studioColors.textTertiary,
                opacity: 1,
              },
            },
          }}
          sx={{
            '& .MuiInputBase-root': {
              background: 'transparent',
            },
          }}
        />
      </Box>

      {/* Command list */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {flatCommands.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.md }}>
              No commands found
            </Typography>
          </Box>
        ) : (
          categoryOrder.map((category) => {
            const categoryCommands = groupedCommands[category];
            if (!categoryCommands?.length) return null;

            return (
              <Box key={category}>
                <Typography
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: studioTypography.fontSize.xs,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {categoryLabels[category]}
                </Typography>
                <List disablePadding>
                  {categoryCommands.map((command) => {
                    const isSelected = currentFlatIndex === selectedIndex;
                    const itemIndex = currentFlatIndex;
                    currentFlatIndex++;

                    return (
                      <ListItemButton
                        key={command.id}
                        selected={isSelected}
                        onClick={() => handleSelect(command)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        sx={{
                          px: 2,
                          py: 1,
                          mx: 1,
                          borderRadius: `${studioRadii.md - 2}px`,
                          transition: `background ${studioMotion.instant}`,
                          '&.Mui-selected': {
                            background: studioColors.surface2,
                          },
                          '&:hover': {
                            background: studioColors.surface2,
                          },
                        }}
                      >
                        {/* Icon */}
                        {command.icon && (
                          <Box
                            sx={{
                              mr: 1.5,
                              color: isSelected ? studioColors.textSecondary : studioColors.textTertiary,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {command.icon}
                          </Box>
                        )}

                        {/* Label & Description */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.md,
                              fontWeight: studioTypography.fontWeight.medium,
                              color: studioColors.textPrimary,
                            }}
                          >
                            {command.label}
                          </Typography>
                          {command.description && (
                            <Typography
                              sx={{
                                fontSize: studioTypography.fontSize.sm,
                                color: studioColors.textTertiary,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {command.description}
                            </Typography>
                          )}
                        </Box>

                        {/* Shortcut */}
                        {command.shortcut && (
                          <Typography
                            sx={{
                              ml: 2,
                              fontSize: studioTypography.fontSize.xs,
                              fontFamily: 'monospace',
                              color: studioColors.textMuted,
                            }}
                          >
                            {command.shortcut}
                          </Typography>
                        )}
                      </ListItemButton>
                    );
                  })}
                </List>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${studioColors.borderSubtle}`,
          background: studioColors.surface1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
            <kbd style={{ fontFamily: 'inherit' }}>↑↓</kbd> navigate
          </Typography>
          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
            <kbd style={{ fontFamily: 'inherit' }}>↵</kbd> select
          </Typography>
          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
            <kbd style={{ fontFamily: 'inherit' }}>esc</kbd> close
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default StudioCommandPalette;
