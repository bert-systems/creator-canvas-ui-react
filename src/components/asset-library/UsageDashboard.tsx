/**
 * UsageDashboard - Display AI generation usage statistics
 */

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TokenIcon from '@mui/icons-material/Token';
import {
  studioColors,
  studioRadii,
  studioTypography,
} from '../studios/shared/studioTokens';
import { useAssetStore } from '@/stores/assetStore';
import type { UsagePeriod } from '@/models/assetSystem';

// ============================================================================
// Types
// ============================================================================

export interface UsageDashboardProps {
  compact?: boolean;
}

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = studioColors.accent }) => (
  <Box
    sx={{
      p: 2.5,
      background: studioColors.surface1,
      border: `1px solid ${studioColors.border}`,
      borderRadius: `${studioRadii.md}px`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: `${studioRadii.md}px`,
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<{ sx?: object }>, { sx: { color, fontSize: 24 } })}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: studioTypography.fontSize.xs,
          color: studioColors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontSize: studioTypography.fontSize['2xl'],
          fontWeight: studioTypography.fontWeight.semibold,
          color: studioColors.textPrimary,
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.xs,
            color: studioColors.textSecondary,
            mt: 0.5,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// ============================================================================
// Usage Bar Component
// ============================================================================

interface UsageBarProps {
  label: string;
  value: number;
  total: number;
  color?: string;
}

const UsageBar: React.FC<UsageBarProps> = ({ label, value, total, color = studioColors.accent }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textSecondary }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: studioTypography.fontSize.sm, color: studioColors.textPrimary }}>
          {value.toLocaleString()}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          background: studioColors.surface3,
          '& .MuiLinearProgress-bar': {
            background: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ compact = false }) => {
  const {
    usageStats,
    usageLoading,
    usagePeriod,
    fetchUsageStats,
    setUsagePeriod,
  } = useAssetStore();

  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  const handlePeriodChange = (period: UsagePeriod) => {
    setUsagePeriod(period);
  };

  if (usageLoading && !usageStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: studioColors.accent }} />
      </Box>
    );
  }

  if (!usageStats) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography sx={{ color: studioColors.textMuted }}>
          No usage data available
        </Typography>
      </Box>
    );
  }

  const successRate =
    usageStats.totalGenerations > 0
      ? Math.round((usageStats.successfulGenerations / usageStats.totalGenerations) * 100)
      : 0;

  const totalByType = Object.values(usageStats.byType).reduce((sum, t) => sum + t.count, 0);

  if (compact) {
    return (
      <Box
        sx={{
          p: 2,
          background: studioColors.surface1,
          border: `1px solid ${studioColors.border}`,
          borderRadius: `${studioRadii.md}px`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
            }}
          >
            Usage Summary
          </Typography>
          <Typography sx={{ fontSize: studioTypography.fontSize.xs, color: studioColors.textMuted }}>
            {usagePeriod}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: studioColors.textPrimary }}>
              {usageStats.totalGenerations}
            </Typography>
            <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>Generations</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: studioColors.success }}>
              {successRate}%
            </Typography>
            <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>Success</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 600, color: studioColors.accent }}>
              ${usageStats.totalCostUsd.toFixed(2)}
            </Typography>
            <Typography sx={{ fontSize: 11, color: studioColors.textMuted }}>Cost</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Period Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          sx={{
            fontSize: studioTypography.fontSize.lg,
            fontWeight: studioTypography.fontWeight.semibold,
            color: studioColors.textPrimary,
          }}
        >
          Usage Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: studioColors.textSecondary }}>Period</InputLabel>
          <Select
            value={usagePeriod}
            label="Period"
            onChange={(e) => handlePeriodChange(e.target.value as UsagePeriod)}
            sx={{
              color: studioColors.textPrimary,
              '.MuiOutlinedInput-notchedOutline': { borderColor: studioColors.border },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: studioColors.borderHover },
              '.MuiSvgIcon-root': { color: studioColors.textSecondary },
            }}
          >
            <MenuItem value="day">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Generations"
          value={usageStats.totalGenerations.toLocaleString()}
          subtitle={`${usageStats.successfulGenerations} successful`}
          icon={<AutoAwesomeIcon />}
          color={studioColors.accent}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle={`${usageStats.failedGenerations} failed`}
          icon={<CheckCircleIcon />}
          color={studioColors.success}
        />
        <StatCard
          title="Total Cost"
          value={`$${usageStats.totalCostUsd.toFixed(2)}`}
          subtitle="Estimated"
          icon={<AttachMoneyIcon />}
          color={studioColors.warning}
        />
        <StatCard
          title="Total Tokens"
          value={formatTokens(usageStats.totalTokens)}
          subtitle="LLM usage"
          icon={<TokenIcon />}
          color={studioColors.blue}
        />
      </Box>

      {/* Breakdown Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* By Type */}
        <Box
          sx={{
            p: 3,
            background: studioColors.surface1,
            border: `1px solid ${studioColors.border}`,
            borderRadius: `${studioRadii.md}px`,
          }}
        >
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
              mb: 2,
            }}
          >
            By Type
          </Typography>
          {Object.entries(usageStats.byType).map(([type, data]) => (
            <UsageBar
              key={type}
              label={capitalizeFirst(type)}
              value={data.count}
              total={totalByType}
              color={getTypeColor(type)}
            />
          ))}
        </Box>

        {/* By Source */}
        <Box
          sx={{
            p: 3,
            background: studioColors.surface1,
            border: `1px solid ${studioColors.border}`,
            borderRadius: `${studioRadii.md}px`,
          }}
        >
          <Typography
            sx={{
              fontSize: studioTypography.fontSize.sm,
              fontWeight: studioTypography.fontWeight.semibold,
              color: studioColors.textPrimary,
              mb: 2,
            }}
          >
            By Source
          </Typography>
          {Object.entries(usageStats.bySource)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([source, data]) => (
              <UsageBar
                key={source}
                label={formatSourceName(source)}
                value={data.count}
                total={usageStats.totalGenerations}
                color={getSourceColor(source)}
              />
            ))}
        </Box>
      </Box>
    </Box>
  );
};

// ============================================================================
// Helpers
// ============================================================================

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toString();
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatSourceName(source: string): string {
  return source
    .replace('studio-', 'Studio: ')
    .replace('canvas-', 'Canvas: ')
    .split('-')
    .map(capitalizeFirst)
    .join(' ');
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    image: studioColors.accent,
    video: studioColors.success,
    audio: studioColors.warning,
    text: studioColors.blue,
  };
  return colors[type] || studioColors.textSecondary;
}

function getSourceColor(source: string): string {
  if (source.includes('fashion')) return '#E91E63';
  if (source.includes('moodboard')) return '#9C27B0';
  if (source.includes('social')) return '#2196F3';
  if (source.includes('interior')) return '#4CAF50';
  return studioColors.accent;
}

export default UsageDashboard;
