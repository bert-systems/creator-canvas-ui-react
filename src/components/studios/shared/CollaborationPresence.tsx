/**
 * CollaborationPresence - Real-time collaboration indicators
 * Shows who is currently viewing/editing the same project
 */

import React from 'react';
import { Box, Typography, Avatar, AvatarGroup, Tooltip, Chip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { studioColors, studioTypography, studioRadii } from './studioTokens';

// ============================================================================
// Types
// ============================================================================

export interface Collaborator {
  id: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  status: 'viewing' | 'editing' | 'idle' | 'offline';
  lastActivity?: Date;
  cursorPosition?: { x: number; y: number };
  color: string;
}

export interface CollaborationPresenceProps {
  /** List of collaborators */
  collaborators: Collaborator[];
  /** Current user ID (to exclude from display) */
  currentUserId?: string;
  /** Maximum avatars to show before +N */
  maxVisible?: number;
  /** Show status indicators */
  showStatus?: boolean;
  /** Compact mode (just avatars) */
  compact?: boolean;
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// Status Config
// ============================================================================

const statusConfig: Record<Collaborator['status'], { label: string; color: string }> = {
  viewing: { label: 'Viewing', color: studioColors.success },
  editing: { label: 'Editing', color: studioColors.warning },
  idle: { label: 'Away', color: studioColors.textMuted },
  offline: { label: 'Offline', color: studioColors.textTertiary },
};

// ============================================================================
// Helper Functions
// ============================================================================

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
};

// ============================================================================
// Collaborator Avatar Component
// ============================================================================

interface CollaboratorAvatarProps {
  collaborator: Collaborator;
  showStatus?: boolean;
  size?: number;
}

const CollaboratorAvatar: React.FC<CollaboratorAvatarProps> = ({
  collaborator,
  showStatus = true,
  size = 32,
}) => {
  const status = statusConfig[collaborator.status];

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
            {collaborator.displayName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: status.color }}>
            {status.label}
          </Typography>
          {collaborator.lastActivity && (
            <Typography sx={{ fontSize: 10, opacity: 0.7 }}>
              {getTimeAgo(collaborator.lastActivity)}
            </Typography>
          )}
        </Box>
      }
      arrow
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Avatar
          src={collaborator.avatarUrl}
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.4,
            background: collaborator.color,
            border: `2px solid ${collaborator.color}`,
            color: studioColors.textPrimary,
          }}
        >
          {getInitials(collaborator.displayName)}
        </Avatar>

        {showStatus && collaborator.status !== 'offline' && (
          <CircleIcon
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              fontSize: 12,
              color: status.color,
              background: studioColors.carbon,
              borderRadius: '50%',
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const CollaborationPresence: React.FC<CollaborationPresenceProps> = ({
  collaborators,
  currentUserId,
  maxVisible = 4,
  showStatus = true,
  compact = false,
  onClick,
}) => {
  // Filter out current user and offline collaborators
  const activeCollaborators = collaborators.filter(
    (c) => c.id !== currentUserId && c.status !== 'offline'
  );

  if (activeCollaborators.length === 0) {
    return null;
  }

  const visibleCollaborators = activeCollaborators.slice(0, maxVisible);
  const hiddenCount = activeCollaborators.length - maxVisible;

  // Compact mode - just avatars
  if (compact) {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: onClick ? 'pointer' : 'default',
        }}
      >
        <AvatarGroup
          max={maxVisible + 1}
          sx={{
            '& .MuiAvatar-root': {
              width: 28,
              height: 28,
              fontSize: 11,
              border: `2px solid ${studioColors.carbon}`,
            },
          }}
        >
          {activeCollaborators.map((c) => (
            <Avatar
              key={c.id}
              src={c.avatarUrl}
              sx={{ background: c.color }}
            >
              {getInitials(c.displayName)}
            </Avatar>
          ))}
        </AvatarGroup>
      </Box>
    );
  }

  // Full mode with details
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Avatars */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {visibleCollaborators.map((collaborator, index) => (
          <Box
            key={collaborator.id}
            sx={{
              marginLeft: index > 0 ? -1 : 0,
              zIndex: visibleCollaborators.length - index,
            }}
          >
            <CollaboratorAvatar
              collaborator={collaborator}
              showStatus={showStatus}
              size={32}
            />
          </Box>
        ))}

        {hiddenCount > 0 && (
          <Tooltip
            title={
              <Box>
                {activeCollaborators.slice(maxVisible).map((c) => (
                  <Typography key={c.id} sx={{ fontSize: 11 }}>
                    {c.displayName}
                  </Typography>
                ))}
              </Box>
            }
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 12,
                marginLeft: -1,
                background: studioColors.surface3,
                color: studioColors.textSecondary,
                border: `2px solid ${studioColors.carbon}`,
              }}
            >
              +{hiddenCount}
            </Avatar>
          </Tooltip>
        )}
      </Box>

      {/* Active count label */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.xs,
            color: studioColors.textSecondary,
            lineHeight: 1.2,
          }}
        >
          {activeCollaborators.length} {activeCollaborators.length === 1 ? 'person' : 'people'}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            color: studioColors.textMuted,
            lineHeight: 1.2,
          }}
        >
          collaborating
        </Typography>
      </Box>
    </Box>
  );
};

// ============================================================================
// Live Cursor Component (for canvas collaboration)
// ============================================================================

export interface LiveCursorProps {
  collaborator: Collaborator;
  position: { x: number; y: number };
}

export const LiveCursor: React.FC<LiveCursorProps> = ({ collaborator, position }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'left 0.1s ease-out, top 0.1s ease-out',
      }}
    >
      {/* Cursor arrow */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
      >
        <path
          d="M5.5 3.5L19 12L12 13L10 20L5.5 3.5Z"
          fill={collaborator.color}
          stroke={studioColors.textPrimary}
          strokeWidth="1"
        />
      </svg>

      {/* Name label */}
      <Chip
        size="small"
        label={collaborator.displayName.split(' ')[0]}
        sx={{
          position: 'absolute',
          left: 16,
          top: 16,
          height: 20,
          fontSize: 10,
          background: collaborator.color,
          color: studioColors.textPrimary,
          borderRadius: `${studioRadii.sm}px`,
          '& .MuiChip-label': { px: 1 },
        }}
      />
    </Box>
  );
};

// ============================================================================
// Activity Indicator Component
// ============================================================================

export interface ActivityIndicatorProps {
  isActive: boolean;
  label?: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  isActive,
  label,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: isActive ? studioColors.success : studioColors.textMuted,
          animation: isActive ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 },
          },
        }}
      />
      {label && (
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.xs,
            color: isActive ? studioColors.textSecondary : studioColors.textMuted,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default CollaborationPresence;
