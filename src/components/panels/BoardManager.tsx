/**
 * Board Manager - View and manage canvas boards
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Avatar,
  Skeleton,
  Tabs,
  Tab,
  Paper,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  OpenInNew as OpenIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Sort as SortIcon,
  Style as FashionIcon,
  Weekend as InteriorIcon,
  Photo as StockIcon,
  MenuBook as StoryIcon,
  FolderOpen as EmptyIcon,
  ColorLens as MoodboardIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  PhotoLibrary as PhotoLibraryIcon,
} from '@mui/icons-material';
import type { CanvasBoard, CardCategory } from '../../models/creativeCanvas';
import { CATEGORY_INFO } from '../../models/creativeCanvas';

interface BoardManagerProps {
  boards: CanvasBoard[];
  loading: boolean;
  onCreateBoard: () => void;
  onOpenBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onDuplicateBoard: (boardId: string) => void;
}

const getCategoryIcon = (category: CardCategory) => {
  switch (category) {
    case 'fashion':
      return <FashionIcon />;
    case 'interior':
      return <InteriorIcon />;
    case 'stock':
      return <StockIcon />;
    case 'story':
      return <StoryIcon />;
    case 'moodboard':
      return <MoodboardIcon />;
    case 'social':
      return <ShareIcon />;
    default:
      return <FashionIcon />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper to extract preview images from board cards
const getBoardImages = (board: CanvasBoard): string[] => {
  if (!board.cards || board.cards.length === 0) return [];

  const images: string[] = [];

  for (const card of board.cards) {
    // Get generated images
    if (card.generatedImages && card.generatedImages.length > 0) {
      images.push(...card.generatedImages);
    }
    // Get thumbnail if available
    if (card.thumbnailUrl) {
      images.push(card.thumbnailUrl);
    }
    // Get images from assets
    if (card.assets && card.assets.length > 0) {
      const assetImages = card.assets
        .filter((asset) => asset.type === 'image')
        .map((asset) => asset.previewUrl || asset.url || asset.fullResolutionUrl)
        .filter((url): url is string => !!url);
      images.push(...assetImages);
    }
    // Limit to 10 images per board
    if (images.length >= 10) break;
  }

  // Deduplicate and limit
  return [...new Set(images)].slice(0, 10);
};

const BoardManager: React.FC<BoardManagerProps> = ({
  boards,
  loading,
  onCreateBoard,
  onOpenBoard,
  onDeleteBoard,
  onDuplicateBoard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'category'>('recent');
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; boardId: string } | null>(null);
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});

  // Filter and sort boards
  const filteredBoards = useMemo(() => {
    let result = [...boards];

    if (selectedCategory !== 'all') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query) ||
          (b.tags && b.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return result;
  }, [boards, selectedCategory, searchQuery, sortBy]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, boardId: string) => {
    event.stopPropagation();
    setMenuAnchor({ element: event.currentTarget, boardId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCarouselNav = (
    event: React.MouseEvent,
    boardId: string,
    direction: 'prev' | 'next',
    imageCount: number
  ) => {
    event.stopPropagation();
    setCarouselIndices((prev) => {
      const current = prev[boardId] || 0;
      let newIndex: number;
      if (direction === 'next') {
        newIndex = (current + 1) % imageCount;
      } else {
        newIndex = current === 0 ? imageCount - 1 : current - 1;
      }
      return { ...prev, [boardId]: newIndex };
    });
  };

  const renderBoardCard = (board: CanvasBoard) => {
    const categoryInfo = CATEGORY_INFO[board.category];
    const boardImages = getBoardImages(board);
    const currentImageIndex = carouselIndices[board.id] || 0;
    const hasImages = boardImages.length > 0;

    return (
      <Card
        key={board.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
        }}
        onClick={() => onOpenBoard(board.id)}
      >
        <CardMedia
          sx={{
            height: 180,
            bgcolor: categoryInfo.color + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {hasImages ? (
            <>
              <img
                src={boardImages[currentImageIndex]}
                alt={`${board.name} preview ${currentImageIndex + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'opacity 0.3s ease',
                }}
              />
              {/* Navigation arrows - only show if multiple images */}
              {boardImages.length > 1 && (
                <>
                  <IconButton
                    size="small"
                    onClick={(e) => handleCarouselNav(e, board.id, 'prev', boardImages.length)}
                    sx={{
                      position: 'absolute',
                      left: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleCarouselNav(e, board.id, 'next', boardImages.length)}
                    sx={{
                      position: 'absolute',
                      right: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                      width: 28,
                      height: 28,
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </>
              )}
              {/* Image counter */}
              <Chip
                size="small"
                icon={<PhotoLibraryIcon sx={{ fontSize: 14 }} />}
                label={`${currentImageIndex + 1}/${boardImages.length}`}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 22,
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
            </>
          ) : board.thumbnail ? (
            <img
              src={board.thumbnail}
              alt={board.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Avatar
              sx={{
                bgcolor: categoryInfo.color,
                width: 56,
                height: 56,
              }}
            >
              {getCategoryIcon(board.category)}
            </Avatar>
          )}

          <Chip
            size="small"
            label={`${board.cardCount ?? (board.cards?.length || 0)} cards`}
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              bgcolor: 'background.paper',
            }}
          />

          {board.isPublic && (
            <Tooltip title="Public board">
              <ShareIcon
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'white',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  p: 0.5,
                  fontSize: 20,
                }}
              />
            </Tooltip>
          )}
        </CardMedia>

        <CardContent sx={{ flex: 1, pt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                noWrap
                sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}
              >
                {board.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={categoryInfo.name}
                  sx={{
                    bgcolor: categoryInfo.color,
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Updated {formatDate(board.updatedAt)}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, board.id)}
            >
              <MoreIcon />
            </IconButton>
          </Box>

          {board.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {board.description}
            </Typography>
          )}

          {board.tags && board.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {board.tags.slice(0, 3).map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" startIcon={<OpenIcon />} onClick={() => onOpenBoard(board.id)}>
            Open
          </Button>
        </CardActions>
      </Card>
    );
  };

  const renderBoardListItem = (board: CanvasBoard) => {
    const categoryInfo = CATEGORY_INFO[board.category];
    const boardImages = getBoardImages(board);
    const hasImages = boardImages.length > 0;

    return (
      <Paper
        key={board.id}
        variant="outlined"
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: categoryInfo.color,
          },
        }}
        onClick={() => onOpenBoard(board.id)}
      >
        {/* Thumbnail or category icon */}
        {hasImages ? (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={boardImages[0]}
              alt={board.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        ) : (
          <Avatar sx={{ bgcolor: categoryInfo.color }}>
            {getCategoryIcon(board.category)}
          </Avatar>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {board.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={categoryInfo.name}
              sx={{
                bgcolor: categoryInfo.color,
                color: 'white',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {board.cardCount ?? (board.cards?.length || 0)} cards
            </Typography>
            {hasImages && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <PhotoLibraryIcon sx={{ fontSize: 12 }} />
                {boardImages.length} images
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Updated {formatDate(board.updatedAt)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {board.isPublic && (
            <Tooltip title="Public board">
              <ShareIcon color="action" />
            </Tooltip>
          )}
          <IconButton onClick={(e) => handleMenuOpen(e, board.id)}>
            <MoreIcon />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        textAlign: 'center',
      }}
    >
      <Avatar sx={{ width: 80, height: 80, bgcolor: 'action.hover', mb: 2 }}>
        <EmptyIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
      </Avatar>
      <Typography variant="h6" gutterBottom>
        No boards yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        Create your first canvas board to start designing with AI-powered templates
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateBoard}>
        Create Your First Board
      </Button>
    </Box>
  );

  const renderLoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Card>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="80%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <TextField
          placeholder="Search boards..."
          size="small"
          sx={{ width: 300 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          sx={{ flex: 1 }}
        >
          <Tab value="all" label="All" />
          {(Object.entries(CATEGORY_INFO) as [CardCategory, typeof CATEGORY_INFO[CardCategory]][]).map(
            ([key, info]) => (
              <Tab
                key={key}
                value={key}
                label={info.name}
                icon={getCategoryIcon(key)}
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            )
          )}
        </Tabs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Sort by">
            <IconButton
              onClick={() => setSortBy(sortBy === 'recent' ? 'name' : sortBy === 'name' ? 'category' : 'recent')}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={viewMode === 'grid' ? 'List view' : 'Grid view'}>
            <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>

          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateBoard}>
            New Board
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {loading ? (
          renderLoadingSkeleton()
        ) : boards.length === 0 ? (
          renderEmptyState()
        ) : filteredBoards.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No boards match your search
            </Typography>
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredBoards.map((board) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={board.id}>
                {renderBoardCard(board)}
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredBoards.map((board) => renderBoardListItem(board))}
          </Box>
        )}
      </Box>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={onCreateBoard}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) onOpenBoard(menuAnchor.boardId);
            handleMenuClose();
          }}
        >
          <ListItemIcon><OpenIcon /></ListItemIcon>
          <ListItemText>Open</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><EditIcon /></ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor) onDuplicateBoard(menuAnchor.boardId);
            handleMenuClose();
          }}
        >
          <ListItemIcon><DuplicateIcon /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ShareIcon /></ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (menuAnchor) onDeleteBoard(menuAnchor.boardId);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BoardManager;
