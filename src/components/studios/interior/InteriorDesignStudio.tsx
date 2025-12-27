/**
 * InteriorDesignStudio - Main container for Interior Design Studio
 * Provides guided flows for room redesign, virtual staging, and space visualization
 */

import React, { useState, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import ChairIcon from '@mui/icons-material/Chair';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import FolderIcon from '@mui/icons-material/Folder';
import TuneIcon from '@mui/icons-material/Tune';
import { StudioShell, type StudioMode } from '../StudioShell';
import { StudioCommandPalette, type Command } from '../StudioCommandPalette';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../shared';
import { RedesignRoomFlow } from './flows/RedesignRoomFlow';
import { VirtualStagingFlow } from './flows/VirtualStagingFlow';
import { WorkspaceMode, Gallery, type GalleryItem } from '../modes/WorkspaceMode';
import { type RoomRedesignResponse, type VirtualStagingResponse, type InteriorDesignStyle } from '@/services/interiorDesignService';

// Active flow type
type ActiveFlow = 'none' | 'redesign-room' | 'virtual-staging' | 'floor-plan';

// Saved content types
interface SavedRedesign {
  id: string;
  originalUrl: string;
  redesignedUrl: string;
  style: InteriorDesignStyle;
  roomType: string;
  createdAt: Date;
}

interface SavedStaging {
  id: string;
  originalUrl: string;
  stagedUrl: string;
  stagingStyle: string;
  createdAt: Date;
}

interface InteriorDesignStudioProps {
  onBack?: () => void;
  initialMode?: StudioMode;
}

export const InteriorDesignStudio: React.FC<InteriorDesignStudioProps> = ({
  onBack,
  initialMode = 'flow',
}) => {
  const [studioMode, setStudioMode] = useState<StudioMode>(initialMode);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('none');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [savedRedesigns, setSavedRedesigns] = useState<SavedRedesign[]>([]);
  const [savedStagings, setSavedStagings] = useState<SavedStaging[]>([]);

  // Command palette commands
  const contextCommands: Command[] = [
    {
      id: 'redesign-room',
      label: 'Redesign Room',
      description: 'Transform your room with AI-powered style changes',
      shortcut: '⌘R',
      category: 'actions',
      action: () => setActiveFlow('redesign-room'),
    },
    {
      id: 'virtual-staging',
      label: 'Virtual Staging',
      description: 'Add furniture and decor to empty rooms',
      shortcut: '⌘S',
      category: 'actions',
      action: () => setActiveFlow('virtual-staging'),
    },
    {
      id: 'floor-plan',
      label: 'Create Floor Plan',
      description: 'Generate 2D floor plans with layout suggestions',
      shortcut: '⌘F',
      category: 'actions',
      action: () => setActiveFlow('floor-plan'),
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

  const handleRedesignComplete = useCallback((result: RoomRedesignResponse & { originalUrl: string; style: InteriorDesignStyle; roomType: string }) => {
    const newRedesign: SavedRedesign = {
      id: `redesign-${Date.now()}`,
      originalUrl: result.originalUrl,
      redesignedUrl: result.redesignedRoom,
      style: result.style,
      roomType: result.roomType,
      createdAt: new Date(),
    };
    setSavedRedesigns((prev) => [newRedesign, ...prev]);
    setActiveFlow('none');
  }, []);

  const handleStagingComplete = useCallback((result: VirtualStagingResponse & { originalUrl: string; stagingStyle: string }) => {
    const newStaging: SavedStaging = {
      id: `staging-${Date.now()}`,
      originalUrl: result.originalUrl,
      stagedUrl: result.stagedRoomImage,
      stagingStyle: result.stagingStyle,
      createdAt: new Date(),
    };
    setSavedStagings((prev) => [newStaging, ...prev]);
    setActiveFlow('none');
  }, []);

  // Convert saved content to gallery items
  const redesignGalleryItems: GalleryItem[] = savedRedesigns.map((item) => ({
    id: item.id,
    imageUrl: item.redesignedUrl,
    title: item.style,
    subtitle: item.createdAt.toLocaleDateString(),
  }));

  const stagingGalleryItems: GalleryItem[] = savedStagings.map((item) => ({
    id: item.id,
    imageUrl: item.stagedUrl,
    title: item.stagingStyle,
    subtitle: item.createdAt.toLocaleDateString(),
  }));

  // Render active flow
  if (activeFlow === 'redesign-room') {
    return (
      <RedesignRoomFlow
        onCancel={handleFlowCancel}
        onComplete={handleRedesignComplete}
      />
    );
  }

  if (activeFlow === 'virtual-staging') {
    return (
      <VirtualStagingFlow
        onCancel={handleFlowCancel}
        onComplete={handleStagingComplete}
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
              id: 'rooms',
              title: 'Rooms',
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
                    Redesigns ({savedRedesigns.length})
                  </Typography>
                  {savedRedesigns.slice(0, 4).map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        aspectRatio: '16/9',
                        background: studioColors.surface2,
                        backgroundImage: `url(${item.redesignedUrl})`,
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
                    Staged ({savedStagings.length})
                  </Typography>
                  {savedStagings.slice(0, 4).map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        aspectRatio: '16/9',
                        background: studioColors.surface2,
                        backgroundImage: `url(${item.stagedUrl})`,
                        backgroundSize: 'cover',
                        borderRadius: `${studioRadii.sm}px`,
                      }}
                    />
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
                    Select a room to view properties and materials.
                  </Typography>
                </Box>
              ),
              defaultWidth: 280,
            },
          ]}
        >
          <Box sx={{ p: 4 }}>
            {savedRedesigns.length > 0 || savedStagings.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {savedRedesigns.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.md,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textPrimary,
                        mb: 2,
                      }}
                    >
                      Room Redesigns
                    </Typography>
                    <Gallery items={redesignGalleryItems} columns={3} aspectRatio="16/9" />
                  </Box>
                )}
                {savedStagings.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.md,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textPrimary,
                        mb: 2,
                      }}
                    >
                      Virtual Stagings
                    </Typography>
                    <Gallery items={stagingGalleryItems} columns={3} aspectRatio="16/9" />
                  </Box>
                )}
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
                  No designs yet. Start by redesigning a room or staging an empty space.
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
          {/* Redesign Room */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('redesign-room')}
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
              <HomeIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              Redesign Room
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Transform your room with AI-powered style changes
            </Typography>
          </SurfaceCard>

          {/* Virtual Staging */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('virtual-staging')}
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
              <ChairIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              Virtual Staging
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Add furniture and decor to empty rooms
            </Typography>
          </SurfaceCard>

          {/* Floor Plan to 3D */}
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
              <ViewInArIcon sx={{ fontSize: 32, color: studioColors.textMuted }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textSecondary,
              }}
            >
              Floor Plan to 3D
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
        {(savedRedesigns.length > 0 || savedStagings.length > 0) && (
          <Box sx={{ mt: 4, width: '100%', maxWidth: 900 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.md,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                }}
              >
                Recent Designs
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
              {[...savedRedesigns.map(r => ({ ...r, imageUrl: r.redesignedUrl })),
                ...savedStagings.map(s => ({ ...s, imageUrl: s.stagedUrl }))].slice(0, 6).map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    width: 200,
                    height: 120,
                    flexShrink: 0,
                    borderRadius: `${studioRadii.md}px`,
                    background: studioColors.surface2,
                    backgroundImage: `url(${item.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <StudioShell
      category="interior"
      mode={studioMode}
      onModeChange={setStudioMode}
      onBack={onBack}
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      headerActions={
        <Tooltip title="New Design (⌘K)">
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

export default InteriorDesignStudio;
