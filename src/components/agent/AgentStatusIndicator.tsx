/**
 * AgentStatusIndicator - Visual indicator for AI agent status
 * Implements 7 distinct states per UX Strategy:
 * - Idle, Listening, Thinking, Executing, Needs Approval, Done, Error
 */

import { memo, useMemo } from 'react';
import { Box, Typography, keyframes, alpha } from '@mui/material';
import {
  FiberManualRecord as IdleIcon,
  Hearing as ListeningIcon,
  Psychology as ThinkingIcon,
  PlayCircleOutline as ExecutingIcon,
  PauseCircleOutline as ApprovalIcon,
  CheckCircle as DoneIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { agentStateColors } from '@/theme';

// ============================================================================
// Types
// ============================================================================

export type AgentStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'executing'
  | 'needsApproval'
  | 'done'
  | 'error';

interface AgentStatusIndicatorProps {
  status: AgentStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
}

// ============================================================================
// Animations
// ============================================================================

const slowPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
`;

const mediumPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
`;

const executingRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// ============================================================================
// Status Configuration
// ============================================================================

interface StatusConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  animation?: string;
  label: string;
}

const getStatusConfig = (status: AgentStatus, iconSize: number): StatusConfig => {
  const configs: Record<AgentStatus, StatusConfig> = {
    idle: {
      icon: <IdleIcon sx={{ fontSize: iconSize }} />,
      color: agentStateColors.idle,
      bgColor: alpha(agentStateColors.idle, 0.1),
      label: 'Ready',
    },
    listening: {
      icon: <ListeningIcon sx={{ fontSize: iconSize }} />,
      color: agentStateColors.listening,
      bgColor: alpha(agentStateColors.listening, 0.15),
      animation: `${slowPulse} 1200ms ease-in-out infinite`,
      label: 'Listening...',
    },
    thinking: {
      icon: <ThinkingIcon sx={{ fontSize: iconSize }} />,
      color: agentStateColors.thinking,
      bgColor: alpha(agentStateColors.thinking, 0.15),
      animation: `${mediumPulse} 1000ms ease-in-out infinite`,
      label: 'Thinking...',
    },
    executing: {
      icon: <ExecutingIcon sx={{ fontSize: iconSize }} />,
      color: agentStateColors.executing,
      bgColor: alpha(agentStateColors.executing, 0.15),
      animation: `${executingRotate} 2000ms linear infinite`,
      label: 'Executing...',
    },
    needsApproval: {
      icon: <ApprovalIcon sx={{ fontSize: iconSize }} />,
      color: agentStateColors.needsApproval,
      bgColor: alpha(agentStateColors.needsApproval, 0.15),
      label: 'Needs Approval',
    },
    done: {
      icon: <DoneIcon sx={{ fontSize: iconSize }} />,
      color: agentStateColors.done,
      bgColor: alpha(agentStateColors.done, 0.15),
      animation: `${fadeIn} 300ms ease-out`,
      label: 'Done',
    },
    error: {
      icon: <ErrorIcon sx={{ fontSize: iconSize }} />,
      color: agentStateColors.error,
      bgColor: alpha(agentStateColors.error, 0.15),
      label: 'Error',
    },
  };

  return configs[status];
};

// ============================================================================
// Component
// ============================================================================

export const AgentStatusIndicator = memo(function AgentStatusIndicator({
  status,
  size = 'medium',
  showLabel = true,
  label,
}: AgentStatusIndicatorProps) {
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'small':
        return { container: 24, icon: 16, fontSize: '0.75rem' };
      case 'large':
        return { container: 48, icon: 32, fontSize: '1rem' };
      default:
        return { container: 36, icon: 24, fontSize: '0.875rem' };
    }
  }, [size]);

  const config = useMemo(
    () => getStatusConfig(status, sizeConfig.icon),
    [status, sizeConfig.icon]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      {/* Status Orb */}
      <Box
        sx={{
          width: sizeConfig.container,
          height: sizeConfig.container,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: config.bgColor,
          color: config.color,
          animation: config.animation,
          position: 'relative',
          transition: 'all 200ms ease',
        }}
      >
        {config.icon}

        {/* Executing state: Add progress arc */}
        {status === 'executing' && (
          <Box
            component="svg"
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: 'rotate(-90deg)',
            }}
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={alpha(config.color, 0.3)}
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeDasharray="75 25"
              strokeLinecap="round"
              style={{
                animation: `traveling-dots 1500ms linear infinite`,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Status Label */}
      {showLabel && (
        <Typography
          sx={{
            fontSize: sizeConfig.fontSize,
            fontWeight: 500,
            color: config.color,
          }}
        >
          {label || config.label}
        </Typography>
      )}
    </Box>
  );
});

// ============================================================================
// Compact Dot Indicator (for use in headers/minimal UI)
// ============================================================================

interface AgentDotIndicatorProps {
  status: AgentStatus;
  size?: number;
}

export const AgentDotIndicator = memo(function AgentDotIndicator({
  status,
  size = 8,
}: AgentDotIndicatorProps) {
  const config = getStatusConfig(status, size);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: config.color,
        animation: config.animation,
        boxShadow: `0 0 ${size}px ${alpha(config.color, 0.5)}`,
      }}
    />
  );
});

export default AgentStatusIndicator;
