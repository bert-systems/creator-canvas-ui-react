/**
 * VideoPreviewPlayer - Reusable video preview component for node cards
 * Provides play/pause, mute, duration display, and fullscreen controls
 * Supports thumbnail fallback and loading states
 */

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Chip,
  alpha,
  CircularProgress,
  Slider,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  Replay as ReplayIcon,
} from '@mui/icons-material';

// ===== Types =====

export interface VideoPreviewPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  hasAudio?: boolean;
  height?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  accentColor?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  placeholder?: React.ReactNode;
}

// ===== Helper Functions =====

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ===== Component =====

export const VideoPreviewPlayer = memo(function VideoPreviewPlayer({
  videoUrl,
  thumbnailUrl,
  duration,
  hasAudio = true,
  height = 120,
  aspectRatio: _aspectRatio = '16:9',
  accentColor = '#8b5cf6',
  showControls = true,
  autoPlay = false,
  loop = true,
  muted: initialMuted = false,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  placeholder,
}: VideoPreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted || !hasAudio);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration ?? 0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current || !videoUrl) return;

    if (isEnded) {
      videoRef.current.currentTime = 0;
      setIsEnded(false);
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    }
  }, [isPlaying, isEnded, videoUrl, onPlay, onPause]);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (!hasAudio) return;
    setIsMuted(prev => !prev);
  }, [hasAudio]);

  // Handle video ended
  const handleEnded = useCallback(() => {
    if (!loop) {
      setIsPlaying(false);
      setIsEnded(true);
      onEnded?.();
    }
  }, [loop, onEnded]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    onTimeUpdate?.(videoRef.current.currentTime, videoRef.current.duration);
  }, [onTimeUpdate]);

  // Handle metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setVideoDuration(videoRef.current.duration);
    setIsLoading(false);
  }, []);

  // Handle seeking
  const handleSeek = useCallback((_event: Event, value: number | number[]) => {
    if (!videoRef.current) return;
    const newTime = typeof value === 'number' ? value : value[0];
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  // Handle fullscreen
  const handleFullscreen = useCallback(() => {
    if (!videoUrl) return;
    window.open(videoUrl, '_blank');
  }, [videoUrl]);

  // Handle replay
  const handleReplay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setIsEnded(false);
    videoRef.current.play();
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  // Sync with external muted prop
  useEffect(() => {
    setIsMuted(initialMuted || !hasAudio);
  }, [initialMuted, hasAudio]);

  // No video - show placeholder
  if (!videoUrl && !thumbnailUrl) {
    return (
      <Box
        sx={{
          height,
          borderRadius: 1,
          bgcolor: alpha('#000', 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed',
          borderColor: alpha(accentColor, 0.3),
        }}
      >
        {placeholder}
      </Box>
    );
  }

  // Only thumbnail - show static image
  if (!videoUrl && thumbnailUrl) {
    return (
      <Box
        sx={{
          position: 'relative',
          height,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={thumbnailUrl}
          alt="Video preview"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Play button overlay indicating no video yet */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: alpha('#000', 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PlayIcon sx={{ fontSize: 24, color: 'white' }} />
        </Box>
      </Box>
    );
  }

  // Progress is used for any future progress bar implementation
  // const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: '#000',
      }}
      onMouseEnter={() => setShowProgressBar(true)}
      onMouseLeave={() => setShowProgressBar(false)}
    >
      {/* Video element */}
      <Box
        component="video"
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        muted={isMuted}
        loop={loop}
        playsInline
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
      />

      {/* Loading indicator */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress size={32} sx={{ color: accentColor }} />
        </Box>
      )}

      {/* Ended overlay */}
      {isEnded && !loop && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: alpha('#000', 0.7),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton
            onClick={handleReplay}
            sx={{
              bgcolor: alpha(accentColor, 0.8),
              color: 'white',
              '&:hover': { bgcolor: accentColor },
            }}
          >
            <ReplayIcon />
          </IconButton>
        </Box>
      )}

      {/* Progress bar (shown on hover) */}
      {showControls && showProgressBar && videoDuration > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 28,
            left: 4,
            right: 4,
          }}
        >
          <Slider
            value={currentTime}
            min={0}
            max={videoDuration}
            onChange={handleSeek}
            size="small"
            sx={{
              color: accentColor,
              height: 4,
              '& .MuiSlider-thumb': {
                width: 8,
                height: 8,
              },
            }}
          />
        </Box>
      )}

      {/* Controls overlay */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            right: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'opacity 0.2s',
            opacity: showProgressBar || !isPlaying ? 1 : 0.6,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Play/Pause button */}
            <IconButton
              size="small"
              onClick={handlePlayPause}
              sx={{
                bgcolor: alpha('#000', 0.6),
                color: 'white',
                '&:hover': { bgcolor: alpha('#000', 0.8) },
              }}
            >
              {isPlaying ? (
                <PauseIcon sx={{ fontSize: 16 }} />
              ) : (
                <PlayIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>

            {/* Mute button (only if has audio) */}
            {hasAudio && (
              <IconButton
                size="small"
                onClick={handleMuteToggle}
                sx={{
                  bgcolor: alpha('#000', 0.6),
                  color: 'white',
                  '&:hover': { bgcolor: alpha('#000', 0.8) },
                }}
              >
                {isMuted ? (
                  <VolumeOffIcon sx={{ fontSize: 14 }} />
                ) : (
                  <VolumeUpIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Time/Duration display */}
            {videoDuration > 0 && (
              <Chip
                label={
                  showProgressBar
                    ? `${formatTime(currentTime)} / ${formatTime(videoDuration)}`
                    : formatTime(videoDuration)
                }
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#000', 0.6),
                  color: 'white',
                }}
              />
            )}

            {/* Fullscreen button */}
            <IconButton
              size="small"
              onClick={handleFullscreen}
              sx={{
                bgcolor: alpha('#000', 0.6),
                color: 'white',
                '&:hover': { bgcolor: alpha('#000', 0.8) },
              }}
            >
              <FullscreenIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default VideoPreviewPlayer;
