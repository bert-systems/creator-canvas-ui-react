/**
 * FashionStudio - Main container for Fashion Studio
 * Combines StudioShell with fashion-specific content
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CollectionsIcon from '@mui/icons-material/Collections';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import CategoryIcon from '@mui/icons-material/Category';
import { StudioShell, type StudioMode } from '../StudioShell';
import { StudioCommandPalette, type Command } from '../StudioCommandPalette';
import { SurfaceCard, AIPromptBar, studioColors, studioTypography, studioRadii } from '../shared';
import { CreateLookbookFlow } from './flows/CreateLookbookFlow';
import { WorkspaceMode, Gallery, type GalleryItem } from '../modes/WorkspaceMode';
import FolderIcon from '@mui/icons-material/Folder';
import TuneIcon from '@mui/icons-material/Tune';

// Active flow type
type ActiveFlow = 'none' | 'create-lookbook' | 'generate-look' | 'virtual-try-on';

// Generated look type (from flow)
interface GeneratedLook {
  id: string;
  imageUrl: string;
  prompt: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

// Saved lookbook type
interface SavedLookbook {
  id: string;
  name: string;
  looks: GeneratedLook[];
  createdAt: Date;
}

export interface FashionStudioProps {
  /** Callback to navigate back */
  onBack?: () => void;
  /** Callback to navigate to other studios */
  onNavigate?: {
    toFashion?: () => void;
    toSocial?: () => void;
    toMoodboards?: () => void;
    toCanvas?: () => void;
  };
}

// Quick action cards for Flow mode
const quickActions = [
  {
    id: 'lookbook',
    title: 'Create Lookbook',
    description: 'Generate a cohesive collection of looks',
    icon: CollectionsIcon,
  },
  {
    id: 'single-look',
    title: 'Generate Look',
    description: 'Create a single fashion look',
    icon: CheckroomIcon,
  },
  {
    id: 'try-on',
    title: 'Virtual Try-On',
    description: 'Try garments on a model',
    icon: CategoryIcon,
  },
];

export const FashionStudio: React.FC<FashionStudioProps> = ({
  onBack,
  onNavigate,
}) => {
  const [mode, setMode] = useState<StudioMode>('flow');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('none');
  const [savedLookbooks, setSavedLookbooks] = useState<SavedLookbook[]>([]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // ⌘N for new lookbook
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && activeFlow === 'none') {
        e.preventDefault();
        setActiveFlow('create-lookbook');
      }
      // Escape to cancel flow
      if (e.key === 'Escape' && activeFlow !== 'none') {
        e.preventDefault();
        setActiveFlow('none');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFlow]);

  // Context-specific commands
  const contextCommands: Command[] = [
    {
      id: 'new-lookbook',
      label: 'Create New Lookbook',
      shortcut: '⌘N',
      icon: <CollectionsIcon sx={{ fontSize: 16 }} />,
      category: 'actions',
      action: () => {
        setCommandPaletteOpen(false);
        setActiveFlow('create-lookbook');
      },
    },
    {
      id: 'generate-look',
      label: 'Generate Single Look',
      icon: <CheckroomIcon sx={{ fontSize: 16 }} />,
      category: 'actions',
      action: () => {
        setCommandPaletteOpen(false);
        setActiveFlow('generate-look');
      },
    },
    {
      id: 'ai-suggest',
      label: 'AI Style Suggestions',
      icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} />,
      category: 'ai',
      action: () => console.log('AI suggest'),
    },
  ];

  const handlePromptSubmit = useCallback((prompt: string) => {
    console.log('Generating with prompt:', prompt);
    setIsGenerating(true);
    // TODO: Integrate with image generation service
    setTimeout(() => setIsGenerating(false), 2000);
  }, []);

  const handleQuickAction = useCallback((actionId: string) => {
    switch (actionId) {
      case 'lookbook':
        setActiveFlow('create-lookbook');
        break;
      case 'single-look':
        setActiveFlow('generate-look');
        break;
      case 'try-on':
        setActiveFlow('virtual-try-on');
        break;
    }
  }, []);

  const handleLookbookComplete = useCallback((looks: GeneratedLook[]) => {
    // Save the lookbook
    const newLookbook: SavedLookbook = {
      id: `lookbook-${Date.now()}`,
      name: `Lookbook ${savedLookbooks.length + 1}`,
      looks,
      createdAt: new Date(),
    };
    setSavedLookbooks((prev) => [newLookbook, ...prev]);
    setActiveFlow('none');
  }, [savedLookbooks.length]);

  const handleFlowCancel = useCallback(() => {
    setActiveFlow('none');
  }, []);

  // Render content based on mode
  const renderContent = () => {
    // If a flow is active, render the flow instead
    if (activeFlow === 'create-lookbook') {
      return (
        <CreateLookbookFlow
          onCancel={handleFlowCancel}
          onComplete={handleLookbookComplete}
        />
      );
    }

    switch (mode) {
      case 'flow':
        return (
          <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
            {/* Hero section with prompt bar */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize['3xl'],
                  fontWeight: studioTypography.fontWeight.semibold,
                  color: studioColors.textPrimary,
                  mb: 1,
                }}
              >
                What would you like to create?
              </Typography>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.base,
                  color: studioColors.textSecondary,
                  mb: 4,
                }}
              >
                Describe your vision and let AI bring it to life
              </Typography>

              <AIPromptBar
                onSubmit={handlePromptSubmit}
                placeholder="Describe your fashion concept... (e.g., minimalist streetwear collection with earth tones)"
                isLoading={isGenerating}
              />
            </Box>

            {/* Quick actions grid */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 2,
                }}
              >
                Quick Actions
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {quickActions.map((action) => (
                  <Box key={action.id} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: 200 }}>
                    <SurfaceCard
                      interactive
                      padding="lg"
                      onClick={() => handleQuickAction(action.id)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: `${studioRadii.md}px`,
                          background: studioColors.surface3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <action.icon sx={{ fontSize: 20, color: studioColors.textSecondary }} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.md,
                            fontWeight: studioTypography.fontWeight.semibold,
                            color: studioColors.textPrimary,
                            mb: 0.5,
                          }}
                        >
                          {action.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            color: studioColors.textTertiary,
                          }}
                        >
                          {action.description}
                        </Typography>
                      </Box>
                    </SurfaceCard>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Recent projects */}
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  mb: 2,
                }}
              >
                Recent Projects
              </Typography>
              {savedLookbooks.length === 0 ? (
                <Box
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    border: `1px dashed ${studioColors.border}`,
                    borderRadius: `${studioRadii.md}px`,
                  }}
                >
                  <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.md }}>
                    No recent projects yet. Create your first lookbook!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {savedLookbooks.slice(0, 4).map((lookbook) => (
                    <SurfaceCard
                      key={lookbook.id}
                      interactive
                      padding="none"
                      sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180, overflow: 'hidden' }}
                    >
                      {/* Preview images */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '2px',
                          aspectRatio: '1',
                        }}
                      >
                        {lookbook.looks.slice(0, 4).map((look, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              background: studioColors.surface2,
                              backgroundImage: look.imageUrl ? `url(${look.imageUrl})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: studioColors.textPrimary,
                          }}
                        >
                          {lookbook.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            color: studioColors.textTertiary,
                          }}
                        >
                          {lookbook.looks.length} looks
                        </Typography>
                      </Box>
                    </SurfaceCard>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'workspace': {
        // Convert saved lookbooks to gallery items
        const galleryItems: GalleryItem[] = savedLookbooks.flatMap((lookbook) =>
          lookbook.looks
            .filter((look) => look.status === 'complete' && look.imageUrl)
            .map((look) => ({
              id: `${lookbook.id}-${look.id}`,
              imageUrl: look.imageUrl,
              title: `Look ${look.id}`,
              subtitle: lookbook.name,
            }))
        );

        return (
          <WorkspaceMode
            leftPanels={[
              {
                id: 'projects',
                title: 'Projects',
                icon: <FolderIcon sx={{ fontSize: 16 }} />,
                defaultWidth: 220,
                content: (
                  <Box>
                    {savedLookbooks.length === 0 ? (
                      <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.sm }}>
                        No projects yet
                      </Typography>
                    ) : (
                      savedLookbooks.map((lookbook) => (
                        <Box
                          key={lookbook.id}
                          sx={{
                            p: 1.5,
                            mb: 1,
                            borderRadius: `${studioRadii.md}px`,
                            background: studioColors.surface1,
                            cursor: 'pointer',
                            '&:hover': { background: studioColors.surface2 },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.sm,
                              fontWeight: studioTypography.fontWeight.medium,
                              color: studioColors.textPrimary,
                            }}
                          >
                            {lookbook.name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.xs,
                              color: studioColors.textTertiary,
                            }}
                          >
                            {lookbook.looks.length} looks
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                ),
              },
            ]}
            rightPanels={[
              {
                id: 'inspector',
                title: 'Inspector',
                icon: <TuneIcon sx={{ fontSize: 16 }} />,
                defaultWidth: 280,
                content: (
                  <Box>
                    <Typography sx={{ color: studioColors.textTertiary, fontSize: studioTypography.fontSize.sm }}>
                      Select a look to view details
                    </Typography>
                  </Box>
                ),
              },
            ]}
            footer={
              <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                  {galleryItems.length} looks
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
                  Press ⌘K for commands
                </Typography>
              </Box>
            }
          >
            {galleryItems.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  p: 4,
                }}
              >
                <CollectionsIcon sx={{ fontSize: 48, color: studioColors.textMuted, mb: 2 }} />
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.lg,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textSecondary,
                    mb: 1,
                  }}
                >
                  No looks yet
                </Typography>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.sm,
                    color: studioColors.textTertiary,
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  Create a lookbook in Flow mode to get started
                </Typography>
              </Box>
            ) : (
              <Gallery items={galleryItems} columns={4} />
            )}
          </WorkspaceMode>
        );
      }

      case 'timeline':
        return (
          <Box sx={{ p: 3 }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.xl,
                fontWeight: studioTypography.fontWeight.semibold,
                color: studioColors.textPrimary,
                mb: 2,
              }}
            >
              Timeline Mode
            </Typography>
            <Typography sx={{ color: studioColors.textSecondary }}>
              Project timeline view coming soon. This mode will show your collection development
              timeline and project milestones.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <>
      <StudioShell
        category="fashion"
        mode={mode}
        onModeChange={setMode}
        onBack={onBack}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        headerActions={
          <Tooltip title="New Project">
            <IconButton
              size="small"
              sx={{
                color: studioColors.textSecondary,
                '&:hover': {
                  color: studioColors.textPrimary,
                  background: studioColors.surface2,
                },
              }}
            >
              <AddIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        }
      >
        {renderContent()}
      </StudioShell>

      <StudioCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        contextCommands={contextCommands}
        onNavigate={onNavigate}
      />
    </>
  );
};

export default FashionStudio;
