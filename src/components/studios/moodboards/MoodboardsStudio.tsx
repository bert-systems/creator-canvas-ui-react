/**
 * MoodboardsStudio - Main container for Moodboards & Brand Identity Studio
 * Provides guided flows for creating moodboards and brand kits
 */

import React, { useState, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaletteIcon from '@mui/icons-material/Palette';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FolderIcon from '@mui/icons-material/Folder';
import TuneIcon from '@mui/icons-material/Tune';
import { StudioShell, type StudioMode } from '../StudioShell';
import { StudioCommandPalette, type Command } from '../StudioCommandPalette';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../shared';
import { CreateMoodboardFlow } from './flows/CreateMoodboardFlow';
import { CreateBrandKitFlow } from './flows/CreateBrandKitFlow';
import { WorkspaceMode, Gallery, type GalleryItem } from '../modes/WorkspaceMode';
import { type BrandKit } from '@/services/moodboardService';

// Active flow type
type ActiveFlow = 'none' | 'create-moodboard' | 'create-brand-kit' | 'extract-colors';

// Saved content types
interface SavedMoodboard {
  id: string;
  imageUrl: string;
  theme: string;
  colors: { hex: string }[];
  createdAt: Date;
}

interface SavedBrandKit {
  id: string;
  name: string;
  primaryColor: string;
  createdAt: Date;
}

interface MoodboardsStudioProps {
  onBack?: () => void;
  initialMode?: StudioMode;
}

export const MoodboardsStudio: React.FC<MoodboardsStudioProps> = ({
  onBack,
  initialMode = 'flow',
}) => {
  const [studioMode, setStudioMode] = useState<StudioMode>(initialMode);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('none');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [savedMoodboards, setSavedMoodboards] = useState<SavedMoodboard[]>([]);
  const [savedBrandKits, setSavedBrandKits] = useState<SavedBrandKit[]>([]);

  // Command palette commands
  const contextCommands: Command[] = [
    {
      id: 'create-moodboard',
      label: 'Create Moodboard',
      description: 'Generate visual moodboard with color extraction',
      shortcut: '⌘M',
      category: 'actions',
      action: () => setActiveFlow('create-moodboard'),
    },
    {
      id: 'create-brand-kit',
      label: 'Create Brand Kit',
      description: 'Generate complete brand identity system',
      shortcut: '⌘B',
      category: 'actions',
      action: () => setActiveFlow('create-brand-kit'),
    },
    {
      id: 'extract-colors',
      label: 'Extract Color Palette',
      description: 'Analyze image for color palette',
      shortcut: '⌘E',
      category: 'actions',
      action: () => setActiveFlow('extract-colors'),
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

  const handleMoodboardComplete = useCallback((result: { id: string; imageUrl: string; colors: { hex: string }[]; keywords: string[] }) => {
    const newMoodboard: SavedMoodboard = {
      id: result.id,
      imageUrl: result.imageUrl,
      theme: result.keywords.slice(0, 3).join(', ') || 'Moodboard',
      colors: result.colors,
      createdAt: new Date(),
    };
    setSavedMoodboards((prev) => [newMoodboard, ...prev]);
    setActiveFlow('none');
  }, []);

  const handleBrandKitComplete = useCallback((result: BrandKit) => {
    const newKit: SavedBrandKit = {
      id: result.id,
      name: result.name,
      primaryColor: result.colorPalette?.colors?.[0]?.hex || '#3B9B94',
      createdAt: new Date(),
    };
    setSavedBrandKits((prev) => [newKit, ...prev]);
    setActiveFlow('none');
  }, []);

  // Convert saved content to gallery items
  const moodboardGalleryItems: GalleryItem[] = savedMoodboards.map((mb) => ({
    id: mb.id,
    imageUrl: mb.imageUrl,
    title: mb.theme,
    subtitle: mb.createdAt.toLocaleDateString(),
  }));

  // Render active flow
  if (activeFlow === 'create-moodboard') {
    return (
      <CreateMoodboardFlow
        onCancel={handleFlowCancel}
        onComplete={handleMoodboardComplete}
      />
    );
  }

  if (activeFlow === 'create-brand-kit') {
    return (
      <CreateBrandKitFlow
        onCancel={handleFlowCancel}
        onComplete={handleBrandKitComplete}
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
              id: 'library',
              title: 'Library',
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
                    Moodboards ({savedMoodboards.length})
                  </Typography>
                  {savedMoodboards.slice(0, 4).map((mb) => (
                    <Box
                      key={mb.id}
                      sx={{
                        aspectRatio: '16/9',
                        background: studioColors.surface2,
                        backgroundImage: `url(${mb.imageUrl})`,
                        backgroundSize: 'cover',
                        borderRadius: `${studioRadii.sm}px`,
                      }}
                    />
                  ))}
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.xs,
                      color: studioColors.textTertiary,
                      textTransform: 'uppercase',
                      mt: 2,
                    }}
                  >
                    Brand Kits ({savedBrandKits.length})
                  </Typography>
                  {savedBrandKits.slice(0, 4).map((kit) => (
                    <Box
                      key={kit.id}
                      sx={{
                        p: 2,
                        background: studioColors.surface2,
                        borderRadius: `${studioRadii.sm}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: `${studioRadii.sm}px`,
                          background: kit.primaryColor,
                        }}
                      />
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                        {kit.name}
                      </Typography>
                    </Box>
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
                    Select a moodboard or brand kit to view properties.
                  </Typography>
                </Box>
              ),
              defaultWidth: 280,
            },
          ]}
        >
          <Box sx={{ p: 4 }}>
            {savedMoodboards.length > 0 ? (
              <Box>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.md,
                    fontWeight: studioTypography.fontWeight.semibold,
                    color: studioColors.textPrimary,
                    mb: 2,
                  }}
                >
                  Moodboards
                </Typography>
                <Gallery items={moodboardGalleryItems} columns={3} aspectRatio="16/9" />
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
                  No moodboards yet. Create your first one.
                </Typography>
              </Box>
            )}
          </Box>
        </WorkspaceMode>
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
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 3,
            maxWidth: 900,
          }}
        >
          {/* Create Moodboard */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('create-moodboard')}
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
              <DashboardIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              Moodboard
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Visual inspiration board with color extraction
            </Typography>
          </SurfaceCard>

          {/* Create Brand Kit */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('create-brand-kit')}
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
              <PaletteIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              Brand Kit
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Complete identity with colors and typography
            </Typography>
          </SurfaceCard>

          {/* Extract Colors */}
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
              <ColorLensIcon sx={{ fontSize: 32, color: studioColors.textMuted }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textSecondary,
              }}
            >
              Color Extraction
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
        {(savedMoodboards.length > 0 || savedBrandKits.length > 0) && (
          <Box sx={{ mt: 4, width: '100%', maxWidth: 900 }}>
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
              {savedMoodboards.slice(0, 4).map((mb) => (
                <Box
                  key={mb.id}
                  sx={{
                    width: 200,
                    height: 120,
                    flexShrink: 0,
                    borderRadius: `${studioRadii.md}px`,
                    background: studioColors.surface2,
                    backgroundImage: `url(${mb.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ))}
              {savedBrandKits.slice(0, 2).map((kit) => (
                <Box
                  key={kit.id}
                  sx={{
                    width: 200,
                    height: 120,
                    flexShrink: 0,
                    borderRadius: `${studioRadii.md}px`,
                    background: studioColors.surface2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: `${studioRadii.md}px`,
                      background: kit.primaryColor,
                    }}
                  />
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                    {kit.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <StudioShell
      category="moodboards"
      mode={studioMode}
      onModeChange={setStudioMode}
      onBack={onBack}
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      headerActions={
        <Tooltip title="New (⌘K)">
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

export default MoodboardsStudio;
