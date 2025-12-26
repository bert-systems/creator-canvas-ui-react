/**
 * CreateMoodboardFlow - Step-by-step moodboard creation wizard
 * Steps: Theme → Style → Generate → Refine
 *
 * Uses parallel API calls for fast generation (~20-30s instead of 2+ minutes):
 * - /api/moodboard/generate - Primary moodboard image
 * - /api/moodboard/analyze - LLM analysis (colors, typography, keywords)
 * - /api/moodboard/element/generate - Individual element images (Texture, Lifestyle, Product, etc.)
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  CircularProgress,
  Button,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PaletteIcon from '@mui/icons-material/Palette';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { FlowMode, type FlowStep } from '../../modes/FlowMode';
import { SurfaceCard, studioColors, studioTypography, studioRadii } from '../../shared';
import {
  moodboardService,
  type MoodboardStyle,
  type MoodTone,
  type MoodboardElementType,
  type MoodboardElementResponse,
  type MoodboardAnalysisResponse,
} from '@/services/moodboardService';
import { downloadService } from '@/services/downloadService';

// Flow step definitions
const FLOW_STEPS: FlowStep[] = [
  { id: 'theme', label: 'Theme', description: 'Describe your vision' },
  { id: 'style', label: 'Style', description: 'Choose layout and mood' },
  { id: 'generate', label: 'Generate', description: 'AI creates your moodboard' },
  { id: 'refine', label: 'Refine', description: 'Review and export' },
];

// Moodboard styles
const MOODBOARD_STYLES: { id: MoodboardStyle; label: string; description: string }[] = [
  { id: 'collage', label: 'Collage', description: 'Layered, organic layout' },
  { id: 'pinterest', label: 'Pinterest', description: 'Masonry grid layout' },
  { id: 'minimal', label: 'Minimal', description: 'Clean, structured' },
  { id: 'magazine', label: 'Magazine', description: 'Editorial spread' },
  { id: 'scattered', label: 'Scattered', description: 'Creative chaos' },
  { id: 'editorial', label: 'Editorial', description: 'Fashion-forward' },
];

// Mood tones
const MOOD_TONES: { id: MoodTone; label: string }[] = [
  { id: 'light', label: 'Light & Airy' },
  { id: 'dark', label: 'Dark & Moody' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'muted', label: 'Muted' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'serene', label: 'Serene' },
];

// Element types for parallel generation
const ELEMENT_TYPES: { id: MoodboardElementType; label: string; description: string }[] = [
  { id: 'Texture', label: 'Texture', description: 'Close-up texture details' },
  { id: 'Lifestyle', label: 'Lifestyle', description: 'Lifestyle scene' },
  { id: 'Product', label: 'Product', description: 'Product detail shot' },
  { id: 'Atmosphere', label: 'Atmosphere', description: 'Atmospheric shot' },
  { id: 'Pattern', label: 'Pattern', description: 'Pattern sample' },
  { id: 'Material', label: 'Material', description: 'Material texture' },
];

// Default element types to generate
const DEFAULT_ELEMENTS: MoodboardElementType[] = ['Texture', 'Lifestyle', 'Product'];

// Generation task status
type TaskStatus = 'pending' | 'running' | 'completed' | 'error';

interface GenerationTask {
  id: string;
  label: string;
  status: TaskStatus;
  result?: string;
  error?: string;
}

// Generated moodboard type
interface GeneratedMoodboard {
  id: string;
  imageUrl: string;
  elements: MoodboardElementResponse[];
  analysis?: MoodboardAnalysisResponse;
  colors: { hex: string; name: string }[];
  keywords: string[];
  typography?: {
    primary?: { name: string; family: string };
    secondary?: { name: string; family: string };
  };
  totalTimeMs: number;
}

interface CreateMoodboardFlowProps {
  onCancel: () => void;
  onComplete: (result: GeneratedMoodboard) => void;
}

export const CreateMoodboardFlow: React.FC<CreateMoodboardFlowProps> = ({ onCancel, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [theme, setTheme] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState<MoodboardStyle>('collage');
  const [tone, setTone] = useState<MoodTone>('balanced');
  const [selectedElements, setSelectedElements] = useState<MoodboardElementType[]>(DEFAULT_ELEMENTS);

  // Generation progress tracking
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  // Generated result
  const [generatedMoodboard, setGeneratedMoodboard] = useState<GeneratedMoodboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Toggle element selection
  const toggleElement = useCallback((elementType: MoodboardElementType) => {
    setSelectedElements(prev =>
      prev.includes(elementType)
        ? prev.filter(e => e !== elementType)
        : [...prev, elementType]
    );
  }, []);

  // Check if current step is valid
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0: return theme.trim().length > 5;
      case 1: return selectedElements.length > 0;
      case 2: return generatedMoodboard !== null;
      case 3: return true;
      default: return false;
    }
  }, [currentStep, theme, selectedElements, generatedMoodboard]);

  // Update task status
  const updateTask = useCallback((taskId: string, updates: Partial<GenerationTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    if (updates.status === 'completed' || updates.status === 'error') {
      setCompletedCount(prev => prev + 1);
    }
  }, []);

  // Handle parallel generation
  const handleGenerate = useCallback(async () => {
    setIsProcessing(true);
    setError(null);
    setCompletedCount(0);

    // Initialize tasks
    const initialTasks: GenerationTask[] = [
      { id: 'moodboard', label: 'Main Moodboard', status: 'pending' },
      { id: 'analysis', label: 'Color & Typography Analysis', status: 'pending' },
      ...selectedElements.map(el => ({
        id: `element-${el}`,
        label: `${el} Element`,
        status: 'pending' as TaskStatus,
      })),
    ];
    setTasks(initialTasks);

    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Mark all as running
      setTasks(initialTasks.map(t => ({ ...t, status: 'running' })));

      // Build parallel promises
      const promises: Promise<{ id: string; result: unknown; error?: string }>[] = [];

      // 1. Main moodboard
      promises.push(
        moodboardService.generateMoodboard({
          theme,
          moodboardStyle: style,
          mood: tone,
          imageCount: 1,
          includeTypography: false,
          includeColorPalette: false,
        })
          .then(result => {
            updateTask('moodboard', { status: 'completed', result: result.moodboard });
            return { id: 'moodboard', result };
          })
          .catch(err => {
            updateTask('moodboard', { status: 'error', error: err.message });
            return { id: 'moodboard', result: null, error: err.message };
          })
      );

      // 2. LLM Analysis
      promises.push(
        moodboardService.analyze({
          theme,
          moodboardStyle: style,
          mood: tone,
        })
          .then(result => {
            updateTask('analysis', { status: 'completed' });
            return { id: 'analysis', result };
          })
          .catch(err => {
            updateTask('analysis', { status: 'error', error: err.message });
            return { id: 'analysis', result: null, error: err.message };
          })
      );

      // 3. Element generations
      selectedElements.forEach(elementType => {
        promises.push(
          moodboardService.generateElement({
            theme,
            elementType,
            moodboardStyle: style,
            mood: tone,
          })
            .then(result => {
              updateTask(`element-${elementType}`, { status: 'completed', result: result.imageUrl });
              return { id: `element-${elementType}`, result };
            })
            .catch(err => {
              updateTask(`element-${elementType}`, { status: 'error', error: err.message });
              return { id: `element-${elementType}`, result: null, error: err.message };
            })
        );
      });

      // Wait for all to complete
      const results = await Promise.all(promises);

      const totalTimeMs = Date.now() - startTime;

      // Extract results
      const moodboardResult = results.find(r => r.id === 'moodboard')?.result as { moodboard: string } | null;
      const analysisResult = results.find(r => r.id === 'analysis')?.result as MoodboardAnalysisResponse | null;
      const elementResults = results
        .filter(r => r.id.startsWith('element-') && r.result)
        .map(r => r.result as MoodboardElementResponse);

      // Collect errors
      results.forEach(r => {
        if (r.error) errors.push(r.error);
      });

      // Build final result
      setGeneratedMoodboard({
        id: `moodboard-${Date.now()}`,
        imageUrl: moodboardResult?.moodboard || '',
        elements: elementResults,
        analysis: analysisResult || undefined,
        colors: analysisResult?.colorPalette?.colors?.map(c => ({ hex: c.hex, name: c.name })) || [],
        keywords: analysisResult?.keywords || [],
        typography: analysisResult?.typography ? {
          primary: analysisResult.typography.primary ? {
            name: analysisResult.typography.primary.name,
            family: analysisResult.typography.primary.family,
          } : undefined,
          secondary: analysisResult.typography.secondary ? {
            name: analysisResult.typography.secondary.name,
            family: analysisResult.typography.secondary.family,
          } : undefined,
        } : undefined,
        totalTimeMs,
      });

      if (errors.length === results.length) {
        setError('All generation tasks failed. Please try again.');
      } else {
        setCurrentStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate moodboard');
    } finally {
      setIsProcessing(false);
    }
  }, [theme, style, tone, selectedElements, updateTask]);

  // Handle step change
  const handleStepChange = useCallback((step: number) => {
    if (step === 2 && currentStep === 1) {
      handleGenerate();
    }
    setCurrentStep(step);
  }, [currentStep, handleGenerate]);

  // Handle completion
  const handleComplete = useCallback(() => {
    if (generatedMoodboard) {
      onComplete(generatedMoodboard);
    }
  }, [generatedMoodboard, onComplete]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography
              sx={{
                fontSize: studioTypography.fontSize.lg,
                fontWeight: studioTypography.fontWeight.medium,
                color: studioColors.textPrimary,
                textAlign: 'center',
                mb: 2,
              }}
            >
              What's your moodboard about?
            </Typography>

            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                Theme
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., 'Scandinavian winter wedding with natural textures and soft lighting'"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: studioColors.surface2,
                    color: studioColors.textPrimary,
                    '& fieldset': { borderColor: studioColors.border },
                    '&:hover fieldset': { borderColor: studioColors.borderHover },
                    '&.Mui-focused fieldset': { borderColor: studioColors.accent },
                  },
                  '& .MuiInputBase-input::placeholder': { color: studioColors.textMuted },
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1,
                }}
              >
                Keywords (optional, comma-separated)
              </Typography>
              <TextField
                fullWidth
                placeholder="minimalist, cozy, organic, natural light"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: studioColors.surface2,
                    color: studioColors.textPrimary,
                    '& fieldset': { borderColor: studioColors.border },
                    '&:hover fieldset': { borderColor: studioColors.borderHover },
                    '&.Mui-focused fieldset': { borderColor: studioColors.accent },
                  },
                  '& .MuiInputBase-input::placeholder': { color: studioColors.textMuted },
                }}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 800, mx: 'auto' }}>
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 2,
                }}
              >
                Layout Style
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {MOODBOARD_STYLES.map((s) => (
                  <SurfaceCard
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    interactive
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      border: style === s.id
                        ? `2px solid ${studioColors.accent}`
                        : `1px solid ${studioColors.border}`,
                      background: style === s.id ? studioColors.surface2 : studioColors.surface1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.sm,
                        fontWeight: studioTypography.fontWeight.medium,
                        color: studioColors.textPrimary,
                      }}
                    >
                      {s.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: studioTypography.fontSize.xs,
                        color: studioColors.textTertiary,
                        mt: 0.5,
                      }}
                    >
                      {s.description}
                    </Typography>
                  </SurfaceCard>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.sm,
                  fontWeight: studioTypography.fontWeight.medium,
                  color: studioColors.textSecondary,
                  mb: 1.5,
                }}
              >
                Mood Tone
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {MOOD_TONES.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    onClick={() => setTone(t.id)}
                    sx={{
                      background: tone === t.id ? studioColors.accent : studioColors.surface2,
                      color: tone === t.id ? studioColors.textPrimary : studioColors.textSecondary,
                      border: `1px solid ${tone === t.id ? studioColors.accent : studioColors.border}`,
                      '&:hover': {
                        background: tone === t.id ? studioColors.accentMuted : studioColors.surface3,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Element Types Selection */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: studioTypography.fontSize.sm,
                    fontWeight: studioTypography.fontWeight.medium,
                    color: studioColors.textSecondary,
                  }}
                >
                  Elements to Generate
                </Typography>
                <Chip
                  size="small"
                  label={`${selectedElements.length} selected`}
                  sx={{
                    background: studioColors.accent,
                    color: studioColors.textPrimary,
                    height: 20,
                    fontSize: 11,
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize.xs,
                  color: studioColors.textTertiary,
                  mb: 2,
                }}
              >
                Select which supporting elements to generate in parallel (~20-30s total)
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
                {ELEMENT_TYPES.map((el) => {
                  const isSelected = selectedElements.includes(el.id);
                  return (
                    <SurfaceCard
                      key={el.id}
                      onClick={() => toggleElement(el.id)}
                      interactive
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        border: isSelected
                          ? `2px solid ${studioColors.accent}`
                          : `1px solid ${studioColors.border}`,
                        background: isSelected ? studioColors.surface2 : studioColors.surface1,
                        opacity: isSelected ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {isSelected && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: studioColors.accent }} />
                        )}
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.sm,
                            fontWeight: studioTypography.fontWeight.medium,
                            color: studioColors.textPrimary,
                          }}
                        >
                          {el.label}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: studioTypography.fontSize.xs,
                          color: studioColors.textTertiary,
                          mt: 0.5,
                        }}
                      >
                        {el.description}
                      </Typography>
                    </SurfaceCard>
                  );
                })}
              </Box>
            </Box>
          </Box>
        );

      case 2:
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              gap: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {isProcessing ? (
              <>
                {/* Header */}
                <Box sx={{ textAlign: 'center' }}>
                  <AutoAwesomeIcon sx={{ fontSize: 48, color: studioColors.accent, mb: 2 }} />
                  <Typography
                    sx={{
                      fontSize: studioTypography.fontSize.lg,
                      fontWeight: studioTypography.fontWeight.semibold,
                      color: studioColors.textPrimary,
                    }}
                  >
                    Creating Your Moodboard
                  </Typography>
                  <Typography sx={{ color: studioColors.textSecondary, mt: 1 }}>
                    Running {totalTasks} tasks in parallel...
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      Progress
                    </Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textSecondary }}>
                      {completedCount} / {totalTasks} complete
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: studioColors.surface2,
                      '& .MuiLinearProgress-bar': {
                        background: studioColors.accent,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Task List */}
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {tasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: `${studioRadii.md}px`,
                        background: studioColors.surface2,
                        border: `1px solid ${studioColors.border}`,
                      }}
                    >
                      {/* Status Icon */}
                      {task.status === 'running' && (
                        <CircularProgress size={20} sx={{ color: studioColors.accent }} />
                      )}
                      {task.status === 'completed' && (
                        <CheckCircleIcon sx={{ fontSize: 20, color: studioColors.success || '#4CAF50' }} />
                      )}
                      {task.status === 'error' && (
                        <ErrorOutlineIcon sx={{ fontSize: 20, color: studioColors.error || '#f44336' }} />
                      )}
                      {task.status === 'pending' && (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: `2px solid ${studioColors.textMuted}`,
                          }}
                        />
                      )}

                      {/* Task Label */}
                      <Typography
                        sx={{
                          flex: 1,
                          fontSize: studioTypography.fontSize.sm,
                          color: task.status === 'completed'
                            ? studioColors.textPrimary
                            : studioColors.textSecondary,
                        }}
                      >
                        {task.label}
                      </Typography>

                      {/* Preview for completed image tasks */}
                      {task.status === 'completed' && task.result && (
                        <Box
                          component="img"
                          src={task.result}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: `${studioRadii.sm}px`,
                            objectFit: 'cover',
                            border: `1px solid ${studioColors.border}`,
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </>
            ) : error ? (
              <>
                <ErrorOutlineIcon sx={{ fontSize: 48, color: studioColors.error || '#f44336' }} />
                <Typography sx={{ color: studioColors.error || '#f44336', textAlign: 'center' }}>
                  {error}
                </Typography>
                <Button
                  onClick={handleGenerate}
                  sx={{
                    background: studioColors.accent,
                    color: studioColors.textPrimary,
                    '&:hover': { background: studioColors.accentMuted },
                  }}
                >
                  Try Again
                </Button>
              </>
            ) : null}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 1000, mx: 'auto', pb: 4 }}>
            {generatedMoodboard && (
              <>
                {/* Hero - Main Moodboard */}
                <SurfaceCard sx={{ p: 0, overflow: 'hidden', position: 'relative' }}>
                  {generatedMoodboard.imageUrl ? (
                    <Box
                      component="img"
                      src={generatedMoodboard.imageUrl}
                      alt="Generated Moodboard"
                      sx={{
                        width: '100%',
                        aspectRatio: '16/9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        aspectRatio: '16/9',
                        background: studioColors.surface2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ color: studioColors.textMuted }}>
                        Moodboard generation failed
                      </Typography>
                    </Box>
                  )}

                  {/* Generation Time Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(0,0,0,0.7)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: `${studioRadii.sm}px`,
                    }}
                  >
                    <Typography sx={{ fontSize: 11, color: '#fff' }}>
                      Generated in {(generatedMoodboard.totalTimeMs / 1000).toFixed(1)}s
                    </Typography>
                  </Box>
                </SurfaceCard>

                {/* Two-column layout for Elements and Analysis */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  {/* Elements Grid */}
                  {generatedMoodboard.elements.length > 0 && (
                    <SurfaceCard sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            fontWeight: studioTypography.fontWeight.semibold,
                            color: studioColors.textTertiary,
                            textTransform: 'uppercase',
                          }}
                        >
                          Generated Elements ({generatedMoodboard.elements.length})
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                          onClick={async () => {
                            for (let i = 0; i < generatedMoodboard.elements.length; i++) {
                              const el = generatedMoodboard.elements[i];
                              if (el.imageUrl) {
                                await downloadService.downloadImage(el.imageUrl, {
                                  filename: downloadService.generateFilename(
                                    `${theme.slice(0, 15) || 'element'}-${el.elementType || i + 1}`,
                                    'image',
                                    { addTimestamp: i === 0 }
                                  ),
                                });
                                if (i < generatedMoodboard.elements.length - 1) {
                                  await new Promise(resolve => setTimeout(resolve, 300));
                                }
                              }
                            }
                          }}
                          sx={{
                            color: studioColors.textSecondary,
                            fontSize: 11,
                          }}
                        >
                          Download All
                        </Button>
                      </Box>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: 1.5,
                        }}
                      >
                        {generatedMoodboard.elements.map((el, i) => (
                          <Box
                            key={i}
                            sx={{
                              position: 'relative',
                              aspectRatio: '1/1',
                              borderRadius: `${studioRadii.md}px`,
                              overflow: 'hidden',
                              background: studioColors.surface2,
                              border: `1px solid ${studioColors.border}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: studioColors.accent,
                                transform: 'scale(1.02)',
                                '& .download-overlay': { opacity: 1 },
                              },
                            }}
                            onClick={() => {
                              if (el.imageUrl) {
                                downloadService.downloadImage(el.imageUrl, {
                                  filename: downloadService.generateFilename(
                                    `${theme.slice(0, 15) || 'element'}-${el.elementType || i + 1}`,
                                    'image',
                                    { addTimestamp: true }
                                  ),
                                });
                              }
                            }}
                          >
                            {el.imageUrl && (
                              <Box
                                component="img"
                                src={el.imageUrl}
                                alt={el.elementType || `Element ${i + 1}`}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            )}
                            {/* Element type label */}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                p: 1,
                              }}
                            >
                              <Typography sx={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>
                                {el.elementType}
                              </Typography>
                            </Box>
                            <Box
                              className="download-overlay"
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s ease',
                              }}
                            >
                              <DownloadIcon sx={{ color: '#fff' }} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </SurfaceCard>
                  )}

                  {/* Analysis Results */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Color Palette */}
                    {generatedMoodboard.colors.length > 0 && (
                      <SurfaceCard sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <PaletteIcon sx={{ fontSize: 18, color: studioColors.accent }} />
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.xs,
                              fontWeight: studioTypography.fontWeight.semibold,
                              color: studioColors.textTertiary,
                              textTransform: 'uppercase',
                            }}
                          >
                            Color Palette
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                          {generatedMoodboard.colors.map((color, i) => (
                            <Tooltip key={i} title={`${color.name} - Click to copy`}>
                              <Box
                                onClick={() => navigator.clipboard.writeText(color.hex)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  p: 1,
                                  borderRadius: `${studioRadii.sm}px`,
                                  background: studioColors.surface2,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  '&:hover': { background: studioColors.surface3 },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: `${studioRadii.sm}px`,
                                    background: color.hex,
                                    border: `1px solid ${studioColors.border}`,
                                  }}
                                />
                                <Box>
                                  <Typography sx={{ fontSize: 11, color: studioColors.textPrimary, fontWeight: 500 }}>
                                    {color.name}
                                  </Typography>
                                  <Typography sx={{ fontSize: 10, color: studioColors.textMuted, fontFamily: 'monospace' }}>
                                    {color.hex}
                                  </Typography>
                                </Box>
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                      </SurfaceCard>
                    )}

                    {/* Typography */}
                    {generatedMoodboard.typography && (
                      <SurfaceCard sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <TextFieldsIcon sx={{ fontSize: 18, color: studioColors.accent }} />
                          <Typography
                            sx={{
                              fontSize: studioTypography.fontSize.xs,
                              fontWeight: studioTypography.fontWeight.semibold,
                              color: studioColors.textTertiary,
                              textTransform: 'uppercase',
                            }}
                          >
                            Typography
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {generatedMoodboard.typography.primary && (
                            <Box sx={{ p: 1.5, background: studioColors.surface2, borderRadius: `${studioRadii.sm}px` }}>
                              <Typography sx={{ fontSize: 10, color: studioColors.textTertiary, textTransform: 'uppercase' }}>
                                Primary
                              </Typography>
                              <Typography sx={{ fontSize: 16, fontWeight: 600, color: studioColors.textPrimary }}>
                                {generatedMoodboard.typography.primary.name}
                              </Typography>
                            </Box>
                          )}
                          {generatedMoodboard.typography.secondary && (
                            <Box sx={{ p: 1.5, background: studioColors.surface2, borderRadius: `${studioRadii.sm}px` }}>
                              <Typography sx={{ fontSize: 10, color: studioColors.textTertiary, textTransform: 'uppercase' }}>
                                Secondary
                              </Typography>
                              <Typography sx={{ fontSize: 16, fontWeight: 600, color: studioColors.textPrimary }}>
                                {generatedMoodboard.typography.secondary.name}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </SurfaceCard>
                    )}

                    {/* Keywords */}
                    {generatedMoodboard.keywords.length > 0 && (
                      <SurfaceCard sx={{ p: 2 }}>
                        <Typography
                          sx={{
                            fontSize: studioTypography.fontSize.xs,
                            fontWeight: studioTypography.fontWeight.semibold,
                            color: studioColors.textTertiary,
                            textTransform: 'uppercase',
                            mb: 1.5,
                          }}
                        >
                          Keywords
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {generatedMoodboard.keywords.map((keyword, i) => (
                            <Chip
                              key={i}
                              label={keyword}
                              size="small"
                              sx={{
                                background: studioColors.surface2,
                                color: studioColors.textSecondary,
                                fontSize: 11,
                                height: 24,
                              }}
                            />
                          ))}
                        </Box>
                      </SurfaceCard>
                    )}
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      if (generatedMoodboard?.imageUrl) {
                        downloadService.downloadImage(generatedMoodboard.imageUrl, {
                          filename: downloadService.generateFilename(
                            theme.slice(0, 30) || 'moodboard',
                            'moodboard',
                            { addTimestamp: true }
                          ),
                        });
                      }
                    }}
                    sx={{
                      background: studioColors.accent,
                      color: studioColors.textPrimary,
                      px: 4,
                      '&:hover': { background: studioColors.accentMuted },
                    }}
                  >
                    Download Moodboard
                  </Button>
                </Box>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <FlowMode
      title="Create Moodboard"
      steps={FLOW_STEPS}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handleComplete}
      onCancel={onCancel}
      canProceed={canProceed()}
      isProcessing={isProcessing}
      nextLabel={currentStep === 1 ? 'Generate' : undefined}
    >
      {renderStepContent()}
    </FlowMode>
  );
};

export default CreateMoodboardFlow;
