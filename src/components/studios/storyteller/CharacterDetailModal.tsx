/**
 * CharacterDetailModal - Full character profile view in a modal
 * Displays all character data including appearance, personality, backstory, arc, and voice
 */

import React from 'react';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import { SurfaceCard, studioColors, studioTypography } from '../shared';
import type { CharacterResponse } from '@/services/storyLibraryService';

// Role colors for visual distinction
const ROLE_COLORS: Record<string, string> = {
  protagonist: '#10b981',
  antagonist: '#ef4444',
  deuteragonist: '#8b5cf6',
  mentor: '#f59e0b',
  sidekick: '#3b82f6',
  'love-interest': '#ec4899',
  foil: '#6366f1',
  'comic-relief': '#14b8a6',
};

interface CharacterDetailModalProps {
  character: CharacterResponse | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (character: CharacterResponse) => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  open,
  onClose,
  onEdit,
}) => {
  if (!character) return null;

  const roleColor = ROLE_COLORS[character.role || ''] || studioColors.accent;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          background: studioColors.surface1,
          borderRadius: 2,
          maxWidth: 900,
          maxHeight: '90vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${studioColors.border}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            borderBottom: `1px solid ${studioColors.border}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Portrait */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${roleColor}40, ${studioColors.surface3})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${roleColor}`,
                overflow: 'hidden',
              }}
            >
              {character.portraitUrl ? (
                <Box
                  component="img"
                  src={character.portraitUrl}
                  alt={character.name}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <PersonIcon sx={{ fontSize: 40, color: roleColor }} />
              )}
            </Box>
            {/* Name and role */}
            <Box>
              <Typography
                sx={{
                  fontSize: studioTypography.fontSize['2xl'],
                  fontWeight: studioTypography.fontWeight.bold,
                  color: studioColors.textPrimary,
                }}
              >
                {character.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                {character.role && (
                  <Chip
                    label={character.role}
                    size="small"
                    sx={{ background: roleColor, color: '#fff' }}
                  />
                )}
                {character.archetype && (
                  <Chip
                    label={character.archetype}
                    size="small"
                    sx={{ background: studioColors.surface3, color: studioColors.textPrimary }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onEdit && (
              <IconButton
                onClick={() => onEdit(character)}
                sx={{ color: studioColors.textSecondary }}
              >
                <EditIcon />
              </IconButton>
            )}
            <IconButton onClick={onClose} sx={{ color: studioColors.textSecondary }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Basic Info */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {character.fullProfile?.age && (
              <SurfaceCard sx={{ p: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Age</Typography>
                <Typography sx={{ fontSize: studioTypography.fontSize.lg, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.textPrimary }}>
                  {character.fullProfile.age}
                </Typography>
              </SurfaceCard>
            )}
            {character.fullProfile?.gender && (
              <SurfaceCard sx={{ p: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>Gender</Typography>
                <Typography sx={{ fontSize: studioTypography.fontSize.md, color: studioColors.textPrimary }}>
                  {character.fullProfile.gender}
                </Typography>
              </SurfaceCard>
            )}
          </Box>

          {/* Description */}
          {character.briefDescription && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Description
              </Typography>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.7 }}>
                {character.briefDescription}
              </Typography>
            </SurfaceCard>
          )}

          {/* Core Traits */}
          {character.fullProfile?.motivation && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Motivation
              </Typography>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.7 }}>
                {character.fullProfile.motivation}
              </Typography>
            </SurfaceCard>
          )}

          {/* Physical Description */}
          {character.fullProfile?.physicalDescription && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Physical Description
              </Typography>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.7 }}>
                {character.fullProfile.physicalDescription}
              </Typography>
            </SurfaceCard>
          )}

          {/* Personality */}
          {character.fullProfile?.personality && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Personality
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {character.fullProfile.personality.traits && character.fullProfile.personality.traits.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Traits</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {character.fullProfile.personality.traits.map((t: string, i: number) => (
                        <Chip key={i} label={t} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                      ))}
                    </Box>
                  </Box>
                )}
                {character.fullProfile.personality.fears && character.fullProfile.personality.fears.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Fears</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {character.fullProfile.personality.fears.map((f: string, i: number) => (
                        <Chip key={i} label={f} size="small" sx={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef4444' }} />
                      ))}
                    </Box>
                  </Box>
                )}
                {character.fullProfile.personality.desires && character.fullProfile.personality.desires.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Desires</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {character.fullProfile.personality.desires.map((d: string, i: number) => (
                        <Chip key={i} label={d} size="small" sx={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b981' }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </SurfaceCard>
          )}

          {/* Backstory */}
          {character.fullProfile?.backstory && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Backstory
              </Typography>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.7 }}>
                {character.fullProfile.backstory}
              </Typography>
            </SurfaceCard>
          )}

          {/* Character Arc */}
          {character.fullProfile?.arc && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Character Arc
              </Typography>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary, lineHeight: 1.7 }}>
                {character.fullProfile.arc}
              </Typography>
            </SurfaceCard>
          )}

          {/* Voice & Speech */}
          {character.fullProfile?.voice && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Voice & Speech
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {character.fullProfile.voice.vocabulary && (
                  <Box>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 0.5 }}>Vocabulary</Typography>
                    <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
                      {character.fullProfile.voice.vocabulary}
                    </Typography>
                  </Box>
                )}
                {character.fullProfile.voice.speechPatterns && character.fullProfile.voice.speechPatterns.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Speech Patterns</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {character.fullProfile.voice.speechPatterns.map((p: string, i: number) => (
                        <Chip key={i} label={p} size="small" variant="outlined" sx={{ borderColor: studioColors.accent, color: studioColors.accent }} />
                      ))}
                    </Box>
                  </Box>
                )}
                {character.fullProfile.voice.catchphrases && character.fullProfile.voice.catchphrases.length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted, mb: 1 }}>Catchphrases</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {character.fullProfile.voice.catchphrases.map((c: string, i: number) => (
                        <Chip key={i} label={`"${c}"`} size="small" sx={{ background: studioColors.surface2, fontStyle: 'italic' }} />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </SurfaceCard>
          )}

          {/* Relationships */}
          {character.fullProfile?.relationships && character.fullProfile.relationships.length > 0 && (
            <SurfaceCard sx={{ p: 3 }}>
              <Typography sx={{ fontSize: studioTypography.fontSize.sm, fontWeight: studioTypography.fontWeight.semibold, color: studioColors.accent, textTransform: 'uppercase', mb: 2 }}>
                Relationships
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {character.fullProfile.relationships.map((rel: { characterId: string; type: string; description?: string }, i: number) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={rel.type} size="small" sx={{ background: studioColors.accent, color: '#fff' }} />
                    {rel.description && (
                      <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
                        {rel.description}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </SurfaceCard>
          )}

          {/* Metadata */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: `1px solid ${studioColors.border}` }}>
            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
              Created: {character.createdAt ? new Date(character.createdAt).toLocaleDateString() : '-'}
            </Typography>
            <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
              Updated: {character.updatedAt ? new Date(character.updatedAt).toLocaleDateString() : '-'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default CharacterDetailModal;
