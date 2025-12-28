/**
 * SocialStudio - Main container for Social Media Studio
 * Provides guided flows for creating social media content
 * Integrates with socialStore for persistent storage
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import MovieIcon from '@mui/icons-material/Movie';
import FolderIcon from '@mui/icons-material/Folder';
import TuneIcon from '@mui/icons-material/Tune';
import { StudioShell, type StudioMode } from '../StudioShell';
import { StudioCommandPalette, type Command } from '../StudioCommandPalette';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../shared';
import { CreatePostFlow } from './flows/CreatePostFlow';
import { CreateCarouselFlow } from './flows/CreateCarouselFlow';
import { WorkspaceMode, Gallery, type GalleryItem } from '../modes/WorkspaceMode';
import { type SocialPostResponse, type CarouselResponse } from '@/services/socialMediaService';
import { useSocialStore } from '@/stores/socialStore';

// Active flow type
type ActiveFlow = 'none' | 'create-post' | 'create-carousel' | 'create-story';

interface SocialStudioProps {
  onBack?: () => void;
  initialMode?: StudioMode;
}

export const SocialStudio: React.FC<SocialStudioProps> = ({
  onBack,
  initialMode = 'flow',
}) => {
  const [studioMode, setStudioMode] = useState<StudioMode>(initialMode);
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('none');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Connect to social store
  const {
    posts,
    carousels,
    postsLoading,
    carouselsLoading,
    fetchPosts,
    fetchCarousels,
    createPost,
    createCarousel,
  } = useSocialStore();

  // Fetch data on mount
  useEffect(() => {
    fetchPosts().catch(console.error);
    fetchCarousels().catch(console.error);
  }, [fetchPosts, fetchCarousels]);

  // Command palette commands
  const contextCommands: Command[] = [
    {
      id: 'create-post',
      label: 'Create Social Post',
      description: 'Generate platform-optimized post with caption',
      shortcut: '⌘P',
      category: 'actions',
      action: () => setActiveFlow('create-post'),
    },
    {
      id: 'create-carousel',
      label: 'Create Carousel',
      description: 'Create multi-slide carousel content',
      shortcut: '⌘C',
      category: 'actions',
      action: () => setActiveFlow('create-carousel'),
    },
    {
      id: 'create-story',
      label: 'Create Story/Reel',
      description: 'Generate vertical video content',
      shortcut: '⌘S',
      category: 'actions',
      action: () => setActiveFlow('create-story'),
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

  const handlePostComplete = useCallback(async (result: SocialPostResponse) => {
    try {
      await createPost({
        postType: 'image',
        platform: result.platformSpecs?.platform || 'instagram',
        caption: result.caption?.text,
        hashtags: result.hashtags,
        imageUrls: [result.postImage],
        status: 'draft',
      });
    } catch (error) {
      console.error('Failed to save post:', error);
    }
    setActiveFlow('none');
  }, [createPost]);

  const handleCarouselComplete = useCallback(async (result: CarouselResponse) => {
    try {
      await createCarousel({
        title: result.caption?.text?.slice(0, 50) || 'Carousel',
        platform: 'instagram',
        caption: result.caption?.text,
        status: 'draft',
        slides: result.slides.map((slide, idx) => ({
          slideOrder: idx,
          imageUrl: slide.imageUrl,
          caption: slide.headline || slide.bodyText,
        })),
      });
    } catch (error) {
      console.error('Failed to save carousel:', error);
    }
    setActiveFlow('none');
  }, [createCarousel]);

  // Convert store data to gallery items
  const postGalleryItems: GalleryItem[] = posts.map((post) => ({
    id: post.id,
    imageUrl: post.imageUrls?.[0] || '',
    title: post.platform || 'Post',
    subtitle: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '',
  }));

  const carouselGalleryItems: GalleryItem[] = carousels.map((carousel) => ({
    id: carousel.id,
    imageUrl: carousel.slides?.[0]?.imageUrl || '',
    title: `${carousel.slides?.length || 0} slides`,
    subtitle: carousel.createdAt ? new Date(carousel.createdAt).toLocaleDateString() : '',
  }));

  const isLoading = postsLoading || carouselsLoading;

  // Render active flow
  if (activeFlow === 'create-post') {
    return (
      <CreatePostFlow
        onCancel={handleFlowCancel}
        onComplete={handlePostComplete}
      />
    );
  }

  if (activeFlow === 'create-carousel') {
    return (
      <CreateCarouselFlow
        onCancel={handleFlowCancel}
        onComplete={handleCarouselComplete}
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
              id: 'content',
              title: 'Content',
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
                    Posts ({posts.length})
                  </Typography>
                  {posts.slice(0, 6).map((post) => (
                    <Box
                      key={post.id}
                      sx={{
                        aspectRatio: '1/1',
                        background: studioColors.surface2,
                        backgroundImage: post.imageUrls?.[0] ? `url(${post.imageUrls[0]})` : undefined,
                        backgroundSize: 'cover',
                        borderRadius: `${studioRadii.sm}px`,
                      }}
                    />
                  ))}
                </Box>
              ),
              defaultWidth: 200,
            },
          ]}
          rightPanels={[
            {
              id: 'settings',
              title: 'Settings',
              icon: <TuneIcon sx={{ fontSize: 16 }} />,
              content: (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                    Content settings and brand kit will appear here.
                  </Typography>
                </Box>
              ),
              defaultWidth: 280,
            },
          ]}
        >
          <Box sx={{ p: 4 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={32} sx={{ color: studioColors.accent }} />
              </Box>
            ) : posts.length > 0 || carousels.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {posts.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.md,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textPrimary,
                        mb: 2,
                      }}
                    >
                      Recent Posts
                    </Typography>
                    <Gallery items={postGalleryItems} columns={4} aspectRatio="1/1" />
                  </Box>
                )}
                {carousels.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.md,
                        fontWeight: studioTypography.fontWeight.semibold,
                        color: studioColors.textPrimary,
                        mb: 2,
                      }}
                    >
                      Carousels
                    </Typography>
                    <Gallery items={carouselGalleryItems} columns={4} aspectRatio="1/1" />
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
                  No content yet. Create your first post or carousel.
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
          {/* Create Post */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('create-post')}
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
              <ArticleIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              Social Post
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Platform-optimized images with captions and hashtags
            </Typography>
          </SurfaceCard>

          {/* Create Carousel */}
          <SurfaceCard
            interactive
            onClick={() => setActiveFlow('create-carousel')}
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
              <ViewCarouselIcon sx={{ fontSize: 32, color: studioColors.accent }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
              }}
            >
              Carousel
            </Typography>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.sm,
                color: studioColors.textSecondary,
                textAlign: 'center',
              }}
            >
              Multi-slide posts for education and storytelling
            </Typography>
          </SurfaceCard>

          {/* Create Story */}
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
              <MovieIcon sx={{ fontSize: 32, color: studioColors.textMuted }} />
            </Box>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.md,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textSecondary,
              }}
            >
              Story / Reel
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
        {(posts.length > 0 || carousels.length > 0) && (
          <Box sx={{ mt: 4, width: '100%', maxWidth: 900 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.md,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                }}
              >
                Recent Content
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
              {[
                ...posts.map(p => ({ id: p.id, imageUrl: p.imageUrls?.[0] || '' })),
                ...carousels.map(c => ({ id: c.id, imageUrl: c.slides?.[0]?.imageUrl || '' }))
              ].slice(0, 6).map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    width: 120,
                    height: 120,
                    flexShrink: 0,
                    borderRadius: `${studioRadii.md}px`,
                    background: studioColors.surface2,
                    backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
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
      category="social"
      mode={studioMode}
      onModeChange={setStudioMode}
      onBack={onBack}
      onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      headerActions={
        <Tooltip title="New Content (⌘K)">
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

export default SocialStudio;
