/**
 * StorytellerStudio - Main container for Storyteller Studio
 * Provides guided flows for story creation, character development, and world building
 */

import React, { useState, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderIcon from '@mui/icons-material/Folder';
import TuneIcon from '@mui/icons-material/Tune';
import { StudioShell, type StudioMode } from '../StudioShell';
import { StudioCommandPalette, type Command } from '../StudioCommandPalette';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../shared';
import { CreateStoryFlow } from './flows/CreateStoryFlow';
import { CreateCharacterFlow } from './flows/CreateCharacterFlow';
import { WorkspaceMode } from '../modes/WorkspaceMode';
import type { StoryData, CharacterProfile } from '@/services/storyGenerationService';

// Active flow type
type ActiveFlow = 'none' | 'create-story' | 'create-character' | 'world-building' | 'branching-story';

// Saved content types
interface SavedStory {
  id: string;
  title: string;
  genre: string;
  premise: string;
  wordCount: number;
  chapterCount: number;
  createdAt: Date;
}

interface SavedCharacter {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  createdAt: Date;
}

interface StorytellerStudioProps {
  onBack?: () => void;
  initialMode?: StudioMode;
}

export const StorytellerStudio: React.FC<StorytellerStudioProps> = ({
  onBack,
  initialMode = 'flow',
}) => {
  const [studioMode, setStudioMode] = useState<StudioMode>(initialMode);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('none');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);

  // Command palette commands
  const contextCommands: Command[] = [
    {
      id: 'create-story',
      label: 'Create New Story',
      description: 'Start a new story from concept to outline',
      shortcut: '⌘N',
      category: 'actions',
      action: () => setActiveFlow('create-story'),
    },
    {
      id: 'create-character',
      label: 'Create Character',
      description: 'Design a character with voice and personality',
      shortcut: '⌘⇧C',
      category: 'actions',
      action: () => setActiveFlow('create-character'),
    },
    {
      id: 'world-building',
      label: 'Build World',
      description: 'Create world lore, history, and locations',
      shortcut: '⌘⇧W',
      category: 'actions',
      action: () => setActiveFlow('world-building'),
    },
    {
      id: 'branching-story',
      label: 'Branching Story',
      description: 'Create interactive narrative with choices',
      category: 'actions',
      action: () => setActiveFlow('branching-story'),
    },
    {
      id: 'switch-flow',
      label: 'Switch to Flow Mode',
      category: 'navigation',
      action: () => setStudioMode('flow'),
    },
    {
      id: 'switch-workspace',
      label: 'Switch to Workspace Mode',
      category: 'navigation',
      action: () => setStudioMode('workspace'),
    },
    {
      id: 'switch-timeline',
      label: 'Switch to Timeline Mode',
      category: 'navigation',
      action: () => setStudioMode('timeline'),
    },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Flow handlers
  const handleFlowCancel = useCallback(() => {
    setActiveFlow('none');
  }, []);

  const handleStoryComplete = useCallback((story: StoryData) => {
    const newStory: SavedStory = {
      id: story.id,
      title: story.title,
      genre: story.genre,
      premise: story.premise,
      wordCount: story.targetWordCount,
      chapterCount: story.estimatedChapters,
      createdAt: new Date(),
    };
    setSavedStories((prev) => [newStory, ...prev]);
    setActiveFlow('none');
  }, []);

  const handleCharacterComplete = useCallback((character: CharacterProfile) => {
    const newCharacter: SavedCharacter = {
      id: character.id,
      name: character.name,
      role: character.role,
      avatarUrl: undefined, // Would come from character sheet generation
      createdAt: new Date(),
    };
    setSavedCharacters((prev) => [newCharacter, ...prev]);
    setActiveFlow('none');
  }, []);

  // Render active flow
  if (activeFlow === 'create-story') {
    return (
      <CreateStoryFlow
        onCancel={handleFlowCancel}
        onComplete={handleStoryComplete}
      />
    );
  }

  if (activeFlow === 'create-character') {
    return (
      <CreateCharacterFlow
        onCancel={handleFlowCancel}
        onComplete={handleCharacterComplete}
      />
    );
  }

  // Render content based on mode
  const renderContent = () => {
    if (studioMode === 'workspace') {
      return (
        <WorkspaceMode
          leftPanels={[
            {
              id: 'stories',
              title: 'Stories',
              icon: <FolderIcon sx={{ fontSize: 16 }} />,
              content: (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      color: studioColors.textTertiary,
                      textTransform: 'uppercase',
                    }}
                  >
                    My Stories ({savedStories.length})
                  </Typography>
                  {savedStories.slice(0, 5).map((story) => (
                    <SurfaceCard key={story.id} sx={{ p: 1.5 }}>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.sm,
                          fontWeight: studioTypography.fontWeight.medium,
                          color: studioColors.textPrimary,
                        }}
                      >
                        {story.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.xs,
                          color: studioColors.textMuted,
                        }}
                      >
                        {story.genre}
                      </Typography>
                    </SurfaceCard>
                  ))}

                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      color: studioColors.textTertiary,
                      textTransform: 'uppercase',
                      mt: 2,
                    }}
                  >
                    Characters ({savedCharacters.length})
                  </Typography>
                  {savedCharacters.slice(0, 5).map((char) => (
                    <SurfaceCard key={char.id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: studioColors.surface3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 16, color: studioColors.textMuted }} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            color: studioColors.textPrimary,
                          }}
                        >
                          {char.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: studioColors.textMuted,
                          }}
                        >
                          {char.role}
                        </Typography>
                      </Box>
                    </SurfaceCard>
                  ))}
                </Box>
              ),
              defaultWidth: 220,
            },
          ]}
          rightPanels={[
            {
              id: 'properties',
              title: 'Properties',
              icon: <TuneIcon sx={{ fontSize: 16 }} />,
              content: (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                    Select a story or character to view properties.
                  </Typography>
                </Box>
              ),
              defaultWidth: 280,
            },
          ]}
        >
          <Box sx={{ p: 4 }}>
            {savedStories.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.md,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                      mb: 2,
                    }}
                  >
                    My Stories
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    {savedStories.map((story) => (
                      <SurfaceCard key={story.id} sx={{ p: 3 }}>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.md,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: studioColors.textPrimary,
                            mb: 1,
                          }}
                        >
                          {story.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={story.genre} size="small" sx={{ background: studioColors.surface3 }} />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            color: studioColors.textSecondary,
                            mb: 2,
                          }}
                        >
                          {story.premise.substring(0, 100)}...
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
                            {story.chapterCount} chapters
                          </Typography>
                          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
                            ~{story.wordCount.toLocaleString()} words
                          </Typography>
                        </Box>
                      </SurfaceCard>
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 400,
                  gap: 2,
                }}
              >
                <Typography sx={{ color: studioColors.textMuted }}>
                  No stories yet. Start by creating a new story.
                </Typography>
              </Box>
            )}
          </Box>
        </WorkspaceMode>
      );
    }

    if (studioMode === 'timeline') {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            p: 4,
            gap: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.lg,
              fontWeight: studioTypography.fontWeight.medium,
              color: studioColors.textSecondary,
            }}
          >
            Timeline Mode
          </Typography>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              color: studioColors.textMuted,
              textAlign: 'center',
              maxWidth: 400,
            }}
          >
            Visualize your story arc, plot points, and character journeys on an interactive timeline.
          </Typography>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              color: studioColors.accent,
              background: `${studioColors.accent}20`,
              px: 2,
              py: 1,
              borderRadius: `${studioRadii.md}px`,
            }}
          >
            Coming Soon
          </Typography>
        </Box>
      );
    }

    // Flow mode - show creation options
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          p: 4,
          gap: 4,
        }}
      >
        <Typography
          sx={{
            fontSize: studioTypography.fontSize['2xl'],
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
          }}
        >
          What would you like to create?
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 3,
            maxWidth: 1000,
          }}
        >
          {/* Create Story */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('create-story')}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: `${studioRadii.lg}px`,
                background: `${studioColors.accent}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              New Story
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Create a story from concept to structured outline
            </Typography>
          </SurfaceCard>

          {/* Create Character */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('create-character')}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: `${studioRadii.lg}px`,
                background: `${studioColors.accent}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              New Character
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Design a character with voice and backstory
            </Typography>
          </SurfaceCard>

          {/* World Building */}
          <SurfaceCard
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              opacity: 0.6,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: `${studioRadii.lg}px`,
                background: studioColors.surface2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PublicIcon sx={{ fontSize: 32, color: studioColors.textMuted }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textSecondary,
              }}
            >
              World Building
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textTertiary,
                textAlign: 'center',
              }}
            >
              Coming soon
            </Typography>
          </SurfaceCard>

          {/* Branching Story */}
          <SurfaceCard
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              opacity: 0.6,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: `${studioRadii.lg}px`,
                background: studioColors.surface2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountTreeIcon sx={{ fontSize: 32, color: studioColors.textMuted }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textSecondary,
              }}
            >
              Branching Story
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textTertiary,
                textAlign: 'center',
              }}
            >
              Coming soon
            </Typography>
          </SurfaceCard>
        </Box>

        {/* Recent content preview */}
        {(savedStories.length > 0 || savedCharacters.length > 0) && (
          <Box sx={{ mt: 4, width: '100%', maxWidth: 1000 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.md,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                }}
              >
                Recent Work
              </Typography>
              <Typography
                onClick={() => setStudioMode('workspace')}
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  color: studioColors.accent,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View all
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
              {savedStories.slice(0, 4).map((story) => (
                <SurfaceCard key={story.id} sx={{ p: 2, minWidth: 200, flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.sm,
                      fontWeight: studioTypography.fontWeight.medium,
                      color: studioColors.textPrimary,
                    }}
                  >
                    {story.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      color: studioColors.textMuted,
                    }}
                  >
                    {story.genre}
                  </Typography>
                </SurfaceCard>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <StudioShell
      category="storyteller"
      mode={studioMode}
      onModeChange={setStudioMode}
      onBack={onBack}
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      headerActions={
        <Tooltip title="New Creation (⌘K)">
          <IconButton
            onClick={() => setCommandPaletteOpen(true)}
            sx={{ color: studioColors.textSecondary }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      }
    >
      {renderContent()}
      <StudioCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        contextCommands={contextCommands}
      />
    </StudioShell>
  );
};

export default StorytellerStudio;
