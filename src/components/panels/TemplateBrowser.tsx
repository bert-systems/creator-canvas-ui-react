/**
 * Template Browser - Browse and select card templates
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Grid,
  Skeleton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Style as FashionIcon,
  Weekend as InteriorIcon,
  Photo as StockIcon,
  MenuBook as StoryIcon,
  Star as PremiumIcon,
} from '@mui/icons-material';
import type { CardTemplate, CardCategory } from '../../models/creativeCanvas';
import {
  CATEGORY_INFO,
  ALL_TEMPLATES,
  getTemplatesByCategory,
} from '../../models/creativeCanvas';
import creativeCanvasService from '../../services/creativeCanvasService';

interface TemplateBrowserProps {
  category: CardCategory | null;
  onSelectTemplate: (template: CardTemplate, position?: { x: number; y: number }) => void;
  onClose: () => void;
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
  }
};

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  category,
  onSelectTemplate,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CardCategory | 'all'>(category || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<CardTemplate[]>(ALL_TEMPLATES);
  const [loading, setLoading] = useState(false);

  // Load templates from API (fallback to static if API fails)
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const response = await creativeCanvasService.templates.list({
          category: activeTab === 'all' ? undefined : activeTab,
          limit: 50,
        });

        if (response.success && response.data?.templates && response.data.templates.length > 0) {
          setTemplates(response.data.templates);
        } else {
          // Fallback to static templates
          setTemplates(activeTab === 'all' ? ALL_TEMPLATES : getTemplatesByCategory(activeTab));
        }
      } catch (error) {
        console.error('Failed to load templates from API, using static fallback:', error);
        setTemplates(activeTab === 'all' ? ALL_TEMPLATES : getTemplatesByCategory(activeTab));
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [activeTab]);

  // Filter templates by search
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return templates;

    const query = searchQuery.toLowerCase();
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [templates, searchQuery]);

  const handleSelectTemplate = (template: CardTemplate) => {
    onSelectTemplate(template);
  };

  const renderTemplateCard = (template: CardTemplate) => {
    const categoryInfo = CATEGORY_INFO[template.category];

    return (
      <Card
        key={template.id}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardActionArea onClick={() => handleSelectTemplate(template)} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <CardMedia
            sx={{
              height: 120,
              bgcolor: alpha(template.color || categoryInfo.color, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {template.previewImage ? (
              <img
                src={template.previewImage}
                alt={template.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: template.color || categoryInfo.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                {getCategoryIcon(template.category)}
              </Box>
            )}

            {template.isPremium && (
              <Tooltip title="Premium template">
                <PremiumIcon
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'warning.main',
                    bgcolor: 'background.paper',
                    borderRadius: '50%',
                    p: 0.3,
                    fontSize: 20,
                  }}
                />
              </Tooltip>
            )}
          </CardMedia>

          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom noWrap>
              {template.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 1,
              }}
            >
              {template.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={categoryInfo.name}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: alpha(template.color || categoryInfo.color, 0.2),
                  color: template.color || categoryInfo.color,
                }}
              />
              {template.tags.slice(0, 2).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              ))}
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const renderLoadingSkeleton = () => (
    <Grid container spacing={2}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid size={{ xs: 12, sm: 6 }} key={i}>
          <Card>
            <Skeleton variant="rectangular" height={120} />
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="40%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ width: 450, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Add Card Template
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40 }}
        >
          <Tab
            value="all"
            label="All"
            sx={{ minHeight: 40, minWidth: 60, px: 1 }}
          />
          {(Object.entries(CATEGORY_INFO) as [CardCategory, typeof CATEGORY_INFO[CardCategory]][]).map(
            ([key, info]) => (
              <Tab
                key={key}
                value={key}
                label={info.name}
                icon={getCategoryIcon(key)}
                iconPosition="start"
                sx={{
                  minHeight: 40,
                  minWidth: 80,
                  px: 1,
                  '&.Mui-selected': {
                    color: info.color,
                  },
                }}
              />
            )
          )}
        </Tabs>
      </Box>

      {/* Template Grid */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading ? (
          renderLoadingSkeleton()
        ) : filteredTemplates.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No templates found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredTemplates.map((template) => (
              <Grid size={{ xs: 12, sm: 6 }} key={template.id}>
                {renderTemplateCard(template)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Click a template to add it to your canvas
        </Typography>
      </Box>
    </Box>
  );
};

export default TemplateBrowser;
