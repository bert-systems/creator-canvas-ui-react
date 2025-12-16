/**
 * WorkflowSelector Component
 *
 * Shows workflow templates for the selected persona. Users can pick a workflow
 * to start with a pre-built canvas or skip to an empty canvas.
 */

import { memo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Button,
  IconButton,
  alpha,
  Fade,
  Grow,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as ArrowIcon,
  AccessTime as TimeIcon,
  School as DifficultyIcon,
  Star as StarIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  type PersonaType,
  type WorkflowTemplate,
  getWorkflowsByPersona,
  getPersonaById,
} from '../../data/workflowTemplates';

// ============================================================================
// TYPES
// ============================================================================

interface WorkflowSelectorProps {
  persona: PersonaType;
  onSelectWorkflow: (workflow: WorkflowTemplate) => void;
  onBack: () => void;
  onSkipToEmptyCanvas: () => void;
}

// ============================================================================
// DIFFICULTY BADGE
// ============================================================================

const getDifficultyColor = (difficulty: WorkflowTemplate['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return '#22c55e';
    case 'intermediate':
      return '#f59e0b';
    case 'advanced':
      return '#ef4444';
  }
};

// ============================================================================
// WORKFLOW CARD
// ============================================================================

interface WorkflowCardProps {
  workflow: WorkflowTemplate;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  personaColor: string;
}

const WorkflowCard = memo(function WorkflowCard({
  workflow,
  isSelected,
  onSelect,
  index,
  personaColor,
}: WorkflowCardProps) {
  return (
    <Grow in timeout={300 + index * 100}>
      <Card
        elevation={isSelected ? 8 : 1}
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          border: '2px solid',
          borderColor: isSelected ? personaColor : 'transparent',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
          position: 'relative',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 6,
          },
        }}
      >
        {/* Featured Badge */}
        {workflow.featured && (
          <Chip
            icon={<StarIcon sx={{ fontSize: 14 }} />}
            label="Popular"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              height: 24,
              bgcolor: alpha('#f59e0b', 0.15),
              color: '#f59e0b',
              fontWeight: 600,
              '& .MuiChip-icon': { color: '#f59e0b' },
            }}
          />
        )}

        <CardActionArea
          onClick={onSelect}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
        >
          <CardContent sx={{ width: '100%', pb: 2 }}>
            {/* Icon & Title Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: alpha(personaColor, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '1.5rem' }}>{workflow.icon}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {workflow.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Estimated time">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <TimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary">
                        {workflow.estimatedTime}
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Tooltip title="Difficulty">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <DifficultyIcon
                        sx={{
                          fontSize: 12,
                          color: getDifficultyColor(workflow.difficulty),
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: getDifficultyColor(workflow.difficulty) }}
                      >
                        {workflow.difficulty}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                minHeight: 40,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {workflow.description}
            </Typography>

            {/* Node Preview */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.disabled" sx={{ mb: 0.5, display: 'block' }}>
                Workflow nodes:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {workflow.nodes.slice(0, 4).map((node) => (
                  <Tooltip key={node.id} title={node.label}>
                    <Chip
                      label={node.label.split(' ')[0]}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        bgcolor: alpha(personaColor, 0.08),
                      }}
                    />
                  </Tooltip>
                ))}
                {workflow.nodes.length > 4 && (
                  <Typography variant="caption" color="text.disabled">
                    +{workflow.nodes.length - 4}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {workflow.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: '0.6rem',
                  }}
                />
              ))}
            </Box>

            {/* Selection Indicator */}
            {isSelected && (
              <Box
                sx={{
                  mt: 2,
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: alpha(personaColor, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ color: personaColor }}>
                  Click "Start with this workflow" below
                </Typography>
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Grow>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WorkflowSelector = memo(function WorkflowSelector({
  persona,
  onSelectWorkflow,
  onBack,
  onSkipToEmptyCanvas,
}: WorkflowSelectorProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const personaData = getPersonaById(persona);
  const workflows = getWorkflowsByPersona(persona);

  const handleSelect = useCallback((workflowId: string) => {
    setSelectedWorkflow(workflowId);
  }, []);

  const handleContinue = useCallback(() => {
    const workflow = workflows.find((w) => w.id === selectedWorkflow);
    if (workflow) {
      onSelectWorkflow(workflow);
    }
  }, [selectedWorkflow, workflows, onSelectWorkflow]);

  const selectedWorkflowData = selectedWorkflow
    ? workflows.find((w) => w.id === selectedWorkflow)
    : null;

  if (!personaData) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 4,
        background: `linear-gradient(180deg, ${alpha(personaData.color, 0.05)} 0%, rgba(0,0,0,0) 50%)`,
      }}
    >
      {/* Header */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 4 }}>
          {/* Back Button */}
          <IconButton
            onClick={onBack}
            sx={{ mb: 2 }}
          >
            <BackIcon />
          </IconButton>

          {/* Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography sx={{ fontSize: '2.5rem' }}>{personaData.emoji}</Typography>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {personaData.name} Workflows
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose a workflow to get started, or start with an empty canvas.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Workflows Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
          flex: 1,
          mb: 4,
        }}
      >
        {workflows.map((workflow, index) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            isSelected={selectedWorkflow === workflow.id}
            onSelect={() => handleSelect(workflow.id)}
            index={index}
            personaColor={personaData.color}
          />
        ))}
      </Box>

      {/* Action Buttons - Fixed at bottom */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          py: 3,
          px: 4,
          mx: -4,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Fade in={!!selectedWorkflowData} timeout={300}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            onClick={handleContinue}
            disabled={!selectedWorkflow}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${personaData.color} 0%, ${alpha(personaData.color, 0.8)} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(personaData.color, 0.9)} 0%, ${alpha(personaData.color, 0.7)} 100%)`,
              },
            }}
          >
            Start with "{selectedWorkflowData?.name}"
          </Button>
        </Fade>

        <Typography color="text.secondary" sx={{ mx: 2 }}>
          or
        </Typography>

        <Button
          variant="outlined"
          size="large"
          startIcon={<AddIcon />}
          onClick={onSkipToEmptyCanvas}
          sx={{
            px: 4,
            py: 1.5,
            fontWeight: 600,
            borderRadius: 2,
            borderColor: personaData.color,
            color: personaData.color,
            '&:hover': {
              borderColor: personaData.color,
              bgcolor: alpha(personaData.color, 0.05),
            },
          }}
        >
          Start with Empty Canvas
        </Button>
      </Box>
    </Box>
  );
});

export default WorkflowSelector;
