/**
 * CharacterLibraryPanel - Browse and manage saved characters
 * Displays characters in a grid with search, filtering, and detail view
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// FilterListIcon available for future filtering UI
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { SurfaceCard, studioColors, studioTypography } from '../shared';
import { useStoryStore } from '@/stores/storyStore';
import type { CharacterResponse } from '@/services/storyLibraryService';

// Role colors for visual distinction
const ROLE_COLORS: Record<string, string> = {
  protagonist: '#10b981',
  antagonist: '#ef4444',
  deuteragonist: '#8b5cf6',
  mentor: '#f59e0b',
  sidekick: '#3b82f6',
  'love-interest': '#ec4899',
  foil: '#6366f1',
  'comic-relief': '#14b8a6',
};

interface CharacterLibraryPanelProps {
  storyId?: string;
  onSelectCharacter?: (character: CharacterResponse) => void;
  onCreateCharacter?: () => void;
  viewMode?: 'grid' | 'list';
}

export const CharacterLibraryPanel: React.FC<CharacterLibraryPanelProps> = ({
  storyId,
  onSelectCharacter,
  onCreateCharacter,
  viewMode: initialViewMode = 'grid',
}) => {
  const { characters, charactersLoading, fetchCharacters, deleteCharacter } = useStoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  // Fetch characters when storyId changes
  useEffect(() => {
    if (storyId) {
      fetchCharacters(storyId);
    }
  }, [storyId, fetchCharacters]);

  // Filter characters based on search and role
  const filteredCharacters = characters.filter((char) => {
    const matchesSearch = !searchQuery ||
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (char.role && char.role.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = !roleFilter || char.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const availableRoles = [...new Set(characters.map(c => c.role).filter(Boolean))];

  // Handle character menu
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, characterId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCharacterId(characterId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedCharacterId(null);
  }, []);

  const handleDeleteCharacter = useCallback(async () => {
    if (storyId && selectedCharacterId) {
      await deleteCharacter(storyId, selectedCharacterId);
    }
    handleMenuClose();
  }, [storyId, selectedCharacterId, deleteCharacter, handleMenuClose]);

  // Render character card
  const renderCharacterCard = (character: CharacterResponse) => {
    const roleColor = ROLE_COLORS[character.role || ''] || studioColors.accent;

    return (
      <SurfaceCard
        key={character.id}
        interactive
        onClick={() => onSelectCharacter?.(character)}
        sx={{
          p: viewMode === 'grid' ? 2 : 1.5,
          display: 'flex',
          flexDirection: viewMode === 'grid' ? 'column' : 'row',
          alignItems: viewMode === 'grid' ? 'center' : 'center',
          gap: viewMode === 'grid' ? 2 : 2,
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            borderColor: studioColors.accent,
            '& .character-menu': { opacity: 1 },
          },
        }}
      >
        {/* Portrait */}
        <Box
          sx={{
            width: viewMode === 'grid' ? 80 : 50,
            height: viewMode === 'grid' ? 80 : 50,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${roleColor}40, ${studioColors.surface3})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${roleColor}`,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {character.portraitUrl ? (
            <Box
              component="img"
              src={character.portraitUrl}
              alt={character.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <PersonIcon sx={{ fontSize: viewMode === 'grid' ? 36 : 24, color: roleColor }} />
          )}
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1, minWidth: 0, textAlign: viewMode === 'grid' ? 'center' : 'left' }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.md,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {character.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, justifyContent: viewMode === 'grid' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
            {character.role && (
              <Chip
                label={character.role}
                size="small"
                sx={{
                  background: `${roleColor}20`,
                  color: roleColor,
                  fontSize: studioTypography.fontSize.xs,
                  height: 20,
                }}
              />
            )}
            {character.archetype && (
              <Chip
                label={character.archetype}
                size="small"
                sx={{
                  background: studioColors.surface3,
                  color: studioColors.textSecondary,
                  fontSize: studioTypography.fontSize.xs,
                  height: 20,
                }}
              />
            )}
          </Box>
          {viewMode === 'list' && (character.briefDescription || character.fullProfile?.motivation) && (
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textMuted,
                mt: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {character.briefDescription || character.fullProfile?.motivation}
            </Typography>
          )}
        </Box>

        {/* Menu button */}
        <IconButton
          size="small"
          className="character-menu"
          onClick={(e) => handleMenuOpen(e, character.id)}
          sx={{
            position: viewMode === 'grid' ? 'absolute' : 'relative',
            top: viewMode === 'grid' ? 8 : 'auto',
            right: viewMode === 'grid' ? 8 : 'auto',
            opacity: 0,
            transition: 'opacity 0.2s',
            color: studioColors.textMuted,
            '&:hover': { color: studioColors.textPrimary },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </SurfaceCard>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.lg,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
          }}
        >
          Characters
          <Typography component="span" sx={{ color: studioColors.textMuted, ml: 1 }}>
            ({characters.length})
          </Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={viewMode === 'grid' ? 'List view' : 'Grid view'}>
            <IconButton
              size="small"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              sx={{ color: studioColors.textSecondary }}
            >
              {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
          {onCreateCharacter && (
            <Tooltip title="Create new character">
              <IconButton
                size="small"
                onClick={onCreateCharacter}
                sx={{ color: studioColors.accent }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Search and filters */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search characters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: studioColors.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              background: studioColors.surface2,
              color: studioColors.textPrimary,
              fontSize: studioTypography.fontSize.sm,
              '& fieldset': { borderColor: studioColors.border },
              '&:hover fieldset': { borderColor: studioColors.borderHover },
            },
          }}
        />
      </Box>

      {/* Role filter chips */}
      {availableRoles.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            size="small"
            onClick={() => setRoleFilter(null)}
            sx={{
              background: !roleFilter ? studioColors.accent : studioColors.surface2,
              color: !roleFilter ? '#fff' : studioColors.textSecondary,
            }}
          />
          {availableRoles.map((role) => (
            <Chip
              key={role}
              label={role}
              size="small"
              onClick={() => setRoleFilter(roleFilter === role ? null : role)}
              sx={{
                background: roleFilter === role ? (ROLE_COLORS[role] || studioColors.accent) : studioColors.surface2,
                color: roleFilter === role ? '#fff' : studioColors.textSecondary,
              }}
            />
          ))}
        </Box>
      )}

      {/* Character list/grid */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(150px, 1fr))' : undefined,
          flexDirection: viewMode === 'list' ? 'column' : undefined,
          gap: 2,
          p: 1,
        }}
      >
        {charactersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress size={32} sx={{ color: studioColors.accent }} />
          </Box>
        ) : filteredCharacters.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 48, color: studioColors.textMuted, mb: 2 }} />
            <Typography sx={{ color: studioColors.textSecondary }}>
              {searchQuery || roleFilter ? 'No characters match your search' : 'No characters yet'}
            </Typography>
            {onCreateCharacter && !searchQuery && !roleFilter && (
              <Typography
                sx={{
                  color: studioColors.accent,
                  cursor: 'pointer',
                  mt: 1,
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={onCreateCharacter}
              >
                Create your first character
              </Typography>
            )}
          </Box>
        ) : (
          filteredCharacters.map(renderCharacterCard)
        )}
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            background: studioColors.surface2,
            border: `1px solid ${studioColors.border}`,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const char = characters.find(c => c.id === selectedCharacterId);
            if (char) onSelectCharacter?.(char);
            handleMenuClose();
          }}
          sx={{ color: studioColors.textPrimary }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={handleDeleteCharacter}
          sx={{ color: '#ef4444' }}
        >
          Delete Character
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CharacterLibraryPanel;
