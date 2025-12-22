/**
 * PersonaSelector Component
 *
 * First-time user onboarding screen that helps users identify their creative
 * persona and presents relevant workflow templates to get started quickly.
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
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { PERSONAS, type PersonaType, type Persona } from '../../data/workflowTemplates';

// ============================================================================
// TYPES
// ============================================================================

interface PersonaSelectorProps {
  onSelectPersona: (persona: PersonaType) => void;
  onSkip?: () => void;
}

// ============================================================================
// PERSONA CARD
// ============================================================================

interface PersonaCardProps {
  persona: Persona;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const PersonaCard = memo(function PersonaCard({
  persona,
  isSelected,
  onSelect,
  index,
}: PersonaCardProps) {
  return (
    <Grow in timeout={300 + index * 100}>
      <Card
        elevation={isSelected ? 8 : 1}
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          border: '2px solid',
          borderColor: isSelected ? persona.color : 'transparent',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 6,
          },
        }}
      >
        <CardActionArea
          onClick={onSelect}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            p: 0,
          }}
        >
          {/* Colored Header */}
          <Box
            sx={{
              width: '100%',
              py: 3,
              background: `linear-gradient(135deg, ${persona.color} 0%, ${alpha(persona.color, 0.7)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '3rem' }}>{persona.emoji}</Typography>
          </Box>

          <CardContent sx={{ flex: 1, width: '100%' }}>
            {/* Name */}
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {persona.name}
            </Typography>

            {/* Tagline */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, minHeight: 40 }}
            >
              {persona.tagline}
            </Typography>

            {/* Example Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {persona.examples.slice(0, 3).map((example) => (
                <Chip
                  key={example}
                  label={example}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.7rem',
                    bgcolor: alpha(persona.color, 0.1),
                    color: persona.color,
                    border: `1px solid ${alpha(persona.color, 0.3)}`,
                  }}
                />
              ))}
            </Box>

            {/* Selection Indicator */}
            {isSelected && (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: persona.color,
                }}
              >
                <SparkleIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight={600}>
                  Selected
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

export const PersonaSelector = memo(function PersonaSelector({
  onSelectPersona,
  onSkip,
}: PersonaSelectorProps) {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);

  const handleSelect = useCallback((personaId: PersonaType) => {
    setSelectedPersona(personaId);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedPersona) {
      onSelectPersona(selectedPersona);
    }
  }, [selectedPersona, onSelectPersona]);

  const selectedPersonaData = selectedPersona
    ? PERSONAS.find(p => p.id === selectedPersona)
    : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        background: 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, rgba(0,0,0,0) 50%)',
      }}
    >
      {/* Header */}
      <Fade in timeout={500}>
        <Box sx={{ textAlign: 'center', mb: 5, maxWidth: 600 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to Creative Canvas
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            What brings you here today? Choose your creative focus to get personalized workflows and tools.
          </Typography>
        </Box>
      </Fade>

      {/* Persona Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          maxWidth: 1000,
          width: '100%',
          mb: 4,
        }}
      >
        {PERSONAS.map((persona, index) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isSelected={selectedPersona === persona.id}
            onSelect={() => handleSelect(persona.id)}
            index={index}
          />
        ))}
      </Box>

      {/* Action Buttons */}
      <Fade in={!!selectedPersona} timeout={300}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            onClick={handleContinue}
            disabled={!selectedPersona}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
              background: selectedPersonaData
                ? `linear-gradient(135deg, ${selectedPersonaData.color} 0%, ${alpha(selectedPersonaData.color, 0.8)} 100%)`
                : undefined,
              '&:hover': {
                background: selectedPersonaData
                  ? `linear-gradient(135deg, ${alpha(selectedPersonaData.color, 0.9)} 0%, ${alpha(selectedPersonaData.color, 0.7)} 100%)`
                  : undefined,
              },
            }}
          >
            Continue as {selectedPersonaData?.name}
          </Button>

          {onSkip && (
            <Button
              variant="text"
              color="inherit"
              onClick={onSkip}
              sx={{ color: 'text.secondary' }}
            >
              Skip and explore all tools
            </Button>
          )}
        </Box>
      </Fade>

      {/* Footer Note */}
      <Fade in timeout={1000}>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ mt: 6, textAlign: 'center' }}
        >
          You can always access all tools and change your focus later in settings.
        </Typography>
      </Fade>
    </Box>
  );
});

export default PersonaSelector;
