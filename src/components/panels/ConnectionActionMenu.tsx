/**
 * ConnectionActionMenu - Popup menu for selecting connection actions
 * Appears when user draws a connection between two canvas nodes
 * Enables "Moments of Delight" creative operations
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Slider,
  Chip,
  Button,
  IconButton,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  alpha,
  Fade,
} from '@mui/material';
import {
  MergeType as DnaIcon,
  Palette as PaletteIcon,
  SwapHoriz as SwapHorizIcon,
  Timeline as TimelineIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as AutoAwesomeIcon,
  PlayArrow as PlayArrowIcon,
  ColorLens as ColorLensIcon,
  Texture as TextureIcon,
  WbSunny as LightingIcon,
  Mood as MoodIcon,
  GridView as CompositionIcon,
  Category as SubjectIcon,
  Style as StyleIcon,
} from '@mui/icons-material';
import type {
  ConnectionActionType,
  ConnectionActionDefinition,
  ConnectionActionOptions,
  TransferableElement,
  CardCategory,
  CanvasCard,
} from '../../models/creativeCanvas';
import { CONNECTION_ACTIONS } from '../../models/creativeCanvas';

// Icon mapping for connection actions
const ACTION_ICONS: Record<string, React.ReactNode> = {
  Dna: <DnaIcon />,
  Palette: <PaletteIcon />,
  SwapHoriz: <SwapHorizIcon />,
  Timeline: <TimelineIcon />,
  PersonAdd: <PersonAddIcon />,
};

// Icon mapping for transferable elements
const ELEMENT_ICONS: Record<TransferableElement, React.ReactNode> = {
  colors: <ColorLensIcon fontSize="small" />,
  textures: <TextureIcon fontSize="small" />,
  style: <StyleIcon fontSize="small" />,
  mood: <MoodIcon fontSize="small" />,
  composition: <CompositionIcon fontSize="small" />,
  lighting: <LightingIcon fontSize="small" />,
  subject: <SubjectIcon fontSize="small" />,
};

// Element display names
const ELEMENT_NAMES: Record<TransferableElement, string> = {
  colors: 'Colors',
  textures: 'Textures',
  style: 'Style',
  mood: 'Mood',
  composition: 'Composition',
  lighting: 'Lighting',
  subject: 'Subject',
};

interface ConnectionActionMenuProps {
  position: { x: number; y: number };
  sourceCard: CanvasCard;
  targetCard: CanvasCard;
  category: CardCategory;
  onSelectAction: (actionType: ConnectionActionType, options: ConnectionActionOptions) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

const ConnectionActionMenu: React.FC<ConnectionActionMenuProps> = ({
  position,
  sourceCard,
  targetCard,
  category,
  onSelectAction,
  onClose,
  isProcessing = false,
}) => {
  const [selectedAction, setSelectedAction] = useState<ConnectionActionType | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<ConnectionActionOptions>({
    fusionStrength: 0.5,
    numVariations: 3,
    elementsToTransfer: ['colors', 'mood'],
    resolution: '2K',
    preferredModel: 'auto',
  });

  // Filter actions based on category and card types
  const availableActions = useMemo(() => {
    return CONNECTION_ACTIONS.filter(action => {
      if (action.supportedCategories !== 'all' &&
          !action.supportedCategories.includes(category)) {
        return false;
      }

      if (action.requiresSourceType &&
          !action.requiresSourceType.includes(sourceCard.type)) {
        return false;
      }

      if (action.requiresTargetType &&
          !action.requiresTargetType.includes(targetCard.type)) {
        return false;
      }

      return true;
    });
  }, [category, sourceCard.type, targetCard.type]);

  const selectedActionDef = useMemo(() => {
    return CONNECTION_ACTIONS.find(a => a.type === selectedAction);
  }, [selectedAction]);

  const handleActionClick = (action: ConnectionActionDefinition) => {
    if (selectedAction === action.type) {
      setSelectedAction(null);
    } else {
      setSelectedAction(action.type);
      if (action.defaultOptions) {
        setOptions(prev => ({ ...prev, ...action.defaultOptions }));
      }
    }
  };

  const handleElementToggle = (element: TransferableElement) => {
    setOptions(prev => {
      const current = prev.elementsToTransfer || [];
      const newElements = current.includes(element)
        ? current.filter(e => e !== element)
        : [...current, element];
      return { ...prev, elementsToTransfer: newElements };
    });
  };

  const handleExecute = () => {
    if (selectedAction) {
      onSelectAction(selectedAction, options);
    }
  };

  const hasSourceImage = (sourceCard.generatedImages?.length ?? 0) > 0 || !!sourceCard.thumbnailUrl;
  const hasTargetImage = (targetCard.generatedImages?.length ?? 0) > 0 || !!targetCard.thumbnailUrl;
  const canExecute = hasSourceImage && hasTargetImage;

  const renderActionOptions = () => {
    if (!selectedAction) return null;

    return (
      <Box sx={{ px: 2, py: 1 }}>
        {['creative-dna-fusion', 'style-transplant', 'element-transfer'].includes(selectedAction) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Fusion Strength
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption">Target</Typography>
              <Slider
                value={options.fusionStrength ?? 0.5}
                onChange={(_, v) => setOptions(prev => ({ ...prev, fusionStrength: v as number }))}
                min={0}
                max={1}
                step={0.1}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                sx={{ flex: 1 }}
              />
              <Typography variant="caption">Source</Typography>
            </Box>
          </Box>
        )}

        {selectedAction === 'element-transfer' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Elements to Transfer
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {(Object.keys(ELEMENT_NAMES) as TransferableElement[]).map(element => (
                <Chip
                  key={element}
                  label={ELEMENT_NAMES[element]}
                  icon={ELEMENT_ICONS[element] as React.ReactElement}
                  size="small"
                  variant={options.elementsToTransfer?.includes(element) ? 'filled' : 'outlined'}
                  color={options.elementsToTransfer?.includes(element) ? 'primary' : 'default'}
                  onClick={() => handleElementToggle(element)}
                  sx={{
                    cursor: 'pointer',
                    '& .MuiChip-icon': { fontSize: '1rem' },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {selectedAction === 'variation-bridge' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Number of Variations
            </Typography>
            <ToggleButtonGroup
              value={options.numVariations}
              exclusive
              onChange={(_, v) => v && setOptions(prev => ({ ...prev, numVariations: v }))}
              size="small"
              fullWidth
              sx={{ mt: 1 }}
            >
              <ToggleButton value={3}>3</ToggleButton>
              <ToggleButton value={5}>5</ToggleButton>
              <ToggleButton value={7}>7</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Box>
          <Button
            size="small"
            startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{ mb: 1 }}
          >
            Advanced Options
          </Button>
          <Collapse in={showAdvanced}>
            <Box sx={{ pl: 1, borderLeft: 2, borderColor: 'divider' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Resolution
                </Typography>
                <ToggleButtonGroup
                  value={options.resolution}
                  exclusive
                  onChange={(_, v) => v && setOptions(prev => ({ ...prev, resolution: v }))}
                  size="small"
                  fullWidth
                  sx={{ mt: 0.5 }}
                >
                  <ToggleButton value="1K">1K</ToggleButton>
                  <ToggleButton value="2K">2K</ToggleButton>
                  <ToggleButton value="4K">4K (2x)</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <TextField
                size="small"
                label="Custom Instructions"
                placeholder="E.g., 'Make it more vibrant'"
                value={options.customInstructions || ''}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  customInstructions: e.target.value
                }))}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />
            </Box>
          </Collapse>
        </Box>
      </Box>
    );
  };

  return (
    <Fade in>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999,
          width: 360,
          maxHeight: '80vh',
          overflow: 'auto',
          borderRadius: 3,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            background: (theme) => alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Connect & Create
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Card Preview */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                mx: 'auto',
                mb: 0.5,
                backgroundColor: 'grey.200',
                border: 2,
                borderColor: hasSourceImage ? 'success.main' : 'warning.main',
              }}
            >
              {sourceCard.thumbnailUrl || sourceCard.generatedImages?.[0] ? (
                <img
                  src={sourceCard.thumbnailUrl || sourceCard.generatedImages?.[0]}
                  alt="Source"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.disabled',
                }}>
                  <Typography variant="caption">No image</Typography>
                </Box>
              )}
            </Box>
            <Typography variant="caption" noWrap sx={{ display: 'block', maxWidth: 100, mx: 'auto' }}>
              {sourceCard.title || 'Source'}
            </Typography>
          </Box>

          <SwapHorizIcon color="action" />

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                mx: 'auto',
                mb: 0.5,
                backgroundColor: 'grey.200',
                border: 2,
                borderColor: hasTargetImage ? 'success.main' : 'warning.main',
              }}
            >
              {targetCard.thumbnailUrl || targetCard.generatedImages?.[0] ? (
                <img
                  src={targetCard.thumbnailUrl || targetCard.generatedImages?.[0]}
                  alt="Target"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.disabled',
                }}>
                  <Typography variant="caption">No image</Typography>
                </Box>
              )}
            </Box>
            <Typography variant="caption" noWrap sx={{ display: 'block', maxWidth: 100, mx: 'auto' }}>
              {targetCard.title || 'Target'}
            </Typography>
          </Box>
        </Box>

        {!canExecute && (
          <Box sx={{ px: 2, pb: 1 }}>
            <Chip
              label="Both cards need generated images"
              color="warning"
              size="small"
              sx={{ width: '100%' }}
            />
          </Box>
        )}

        <Divider />

        {/* Action List */}
        <List dense disablePadding>
          {availableActions.map((action) => (
            <React.Fragment key={action.type}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedAction === action.type}
                  onClick={() => handleActionClick(action)}
                  disabled={!canExecute || isProcessing}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {ACTION_ICONS[action.icon] || <AutoAwesomeIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={action.name}
                    secondary={action.description}
                    primaryTypographyProps={{ fontWeight: selectedAction === action.type ? 600 : 400 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip
                    label={action.preferredModel === 'nano-banana-pro' ? 'Nano Banana' : 'FLUX'}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                </ListItemButton>
              </ListItem>

              <Collapse in={selectedAction === action.type}>
                {renderActionOptions()}
              </Collapse>
            </React.Fragment>
          ))}
        </List>

        {/* Execute Button */}
        {selectedAction && (
          <Box sx={{ p: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleExecute}
              disabled={!canExecute || isProcessing}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd6 30%, #6a4190 90%)',
                },
              }}
            >
              {isProcessing ? 'Creating...' : `Create ${selectedActionDef?.name}`}
            </Button>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default ConnectionActionMenu;
