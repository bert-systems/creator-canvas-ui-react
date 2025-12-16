/**
 * ConnectionLine Component
 * Animated, typed connection lines for the Creative Canvas
 *
 * Features:
 * - Gradient lines matching data type (image=blue, video=green)
 * - Animated flow direction (dots moving along line)
 * - Thickness indicates data "richness"
 * - Glow effect when data is actively flowing
 * - Spark animation for "Moment of Delight" connections
 */

import { memo, useMemo } from 'react';
import { BaseEdge, getBezierPath, EdgeLabelRenderer, Position } from '@xyflow/react';
import { Box, alpha, keyframes } from '@mui/material';
import { portColors } from '../../theme';

// ============================================================================
// ANIMATIONS
// ============================================================================

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

// ============================================================================
// TYPES
// ============================================================================

export type PortDataType = 'image' | 'video' | 'audio' | 'text' | 'style' | 'character' | 'mesh3d' | 'any';

export interface ConnectionLineData {
  /** The type of data flowing through this connection */
  dataType?: PortDataType;
  /** Whether data is actively flowing */
  isFlowing?: boolean;
  /** Whether this is a "Moment of Delight" connection */
  isMomentOfDelight?: boolean;
  /** Whether this is a style/DNA connection (dashed) */
  isStyleConnection?: boolean;
  /** Whether this is a character lock connection */
  isCharacterConnection?: boolean;
  /** Custom label to display */
  label?: string;
}

// Props for our edge components
interface ConnectionLineComponentProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
  data?: ConnectionLineData;
}

// ============================================================================
// UTILITIES
// ============================================================================

/** Get color for a data type */
const getEdgeColor = (dataType: PortDataType = 'any'): string => {
  const colors: Record<PortDataType, string> = {
    image: portColors.image,
    video: portColors.video,
    audio: portColors.audio,
    text: portColors.text,
    style: portColors.style,
    character: portColors.character,
    mesh3d: portColors.mesh3d,
    any: portColors.any,
  };
  return colors[dataType] || colors.any;
};

/** Get edge thickness based on data type */
const getEdgeThickness = (dataType: PortDataType = 'any', isFlowing: boolean = false): number => {
  // Base thickness
  let thickness = 2;

  // Richer data types get thicker lines
  if (['video', 'mesh3d', 'character'].includes(dataType)) {
    thickness = 3;
  }

  // Flowing connections are slightly thicker
  if (isFlowing) {
    thickness += 0.5;
  }

  return thickness;
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ConnectionLine = memo(function ConnectionLine({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: ConnectionLineComponentProps) {
  const {
    dataType = 'any',
    isFlowing = false,
    isMomentOfDelight = false,
    isStyleConnection = false,
    isCharacterConnection = false,
    label,
  } = data || {};

  // Calculate the bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get styling based on data type and state
  const edgeColor = getEdgeColor(dataType);
  const thickness = getEdgeThickness(dataType, isFlowing);

  // Build edge styles
  const edgeStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      stroke: edgeColor,
      strokeWidth: thickness,
      fill: 'none',
    };

    // Style connection (dashed)
    if (isStyleConnection) {
      return {
        ...baseStyles,
        strokeDasharray: '8 4',
        stroke: portColors.style,
      };
    }

    // Character connection (bold dashed)
    if (isCharacterConnection) {
      return {
        ...baseStyles,
        strokeDasharray: '12 6',
        strokeWidth: 3,
        stroke: portColors.character,
      };
    }

    // Flowing connection
    if (isFlowing) {
      return {
        ...baseStyles,
        strokeDasharray: '8 8',
      };
    }

    return baseStyles;
  }, [edgeColor, thickness, isStyleConnection, isCharacterConnection, isFlowing]);

  // Glow effect for active connections
  const glowStyles = useMemo(() => {
    if (!isFlowing && !isMomentOfDelight) return {};

    return {
      filter: `drop-shadow(0 0 4px ${alpha(edgeColor, 0.6)})`,
    };
  }, [edgeColor, isFlowing, isMomentOfDelight]);

  return (
    <>
      {/* Background glow layer for active connections */}
      {(isFlowing || isMomentOfDelight) && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: edgeColor,
            strokeWidth: thickness + 4,
            strokeOpacity: 0.15,
            fill: 'none',
          }}
        />
      )}

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          ...edgeStyles,
          ...glowStyles,
        }}
      />

      {/* Sparkle effect for Moment of Delight connections */}
      {isMomentOfDelight && (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(edgeColor, 0.8)} 0%, transparent 70%)`,
                animation: `${sparkle} 2s ease-in-out infinite`,
              }}
            />
          </Box>
        </EdgeLabelRenderer>
      )}

      {/* Label (if provided) */}
      {label && (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: alpha('#0f0f14', 0.9),
              backdropFilter: 'blur(4px)',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              border: `1px solid ${alpha(edgeColor, 0.3)}`,
              fontSize: '0.7rem',
              color: edgeColor,
              fontWeight: 500,
              pointerEvents: 'none',
            }}
          >
            {label}
          </Box>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

// ============================================================================
// CUSTOM EDGE TYPES FOR REACT FLOW
// ============================================================================

/** Standard connection edge - uses React Flow's default edge props */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StandardEdge = memo(function StandardEdge(props: any) {
  return (
    <ConnectionLine
      id={props.id}
      sourceX={props.sourceX}
      sourceY={props.sourceY}
      targetX={props.targetX}
      targetY={props.targetY}
      sourcePosition={props.sourcePosition}
      targetPosition={props.targetPosition}
      style={props.style}
      markerEnd={props.markerEnd}
      data={props.data}
    />
  );
});

/** Animated flowing edge */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FlowingEdge = memo(function FlowingEdge(props: any) {
  return (
    <ConnectionLine
      {...props}
      data={{ ...props.data, isFlowing: true }}
    />
  );
});

/** Style DNA edge (dashed magenta) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StyleEdge = memo(function StyleEdge(props: any) {
  return (
    <ConnectionLine
      {...props}
      data={{ ...props.data, isStyleConnection: true, dataType: 'style' }}
    />
  );
});

/** Character lock edge (bold dashed violet) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CharacterEdge = memo(function CharacterEdge(props: any) {
  return (
    <ConnectionLine
      {...props}
      data={{ ...props.data, isCharacterConnection: true, dataType: 'character' }}
    />
  );
});

/** Moment of Delight edge (sparkle animation) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DelightEdge = memo(function DelightEdge(props: any) {
  return (
    <ConnectionLine
      {...props}
      data={{ ...props.data, isMomentOfDelight: true, isFlowing: true }}
    />
  );
});

export default ConnectionLine;
