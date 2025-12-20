/**
 * ReferenceImageNode - Upload or provide URLs for reference images
 * Supports file upload (drag-and-drop) and URL input
 * Outputs images for use in generation nodes
 */

import { memo, useState, useCallback, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Box,
  Typography,
  Paper,
  alpha,
  IconButton,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Collections as CollectionsIcon,
  Add as AddIcon,
  Link as LinkIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import type { Port } from '@/models/canvas';
import { PORT_COLORS } from './portColors';
import { nodeService } from '@/services/nodeService';

// ===== Constants =====

const NODE_WIDTH = 320;
const NODE_MIN_HEIGHT = 280;
const MAX_IMAGES = 10;
const REFERENCE_COLOR = '#3b82f6'; // Blue for reference/style

// ===== Types =====

export interface ReferenceImageNodeData {
  nodeType: 'referenceImage';
  category: string;
  label: string;
  parameters: Record<string, unknown>;
  inputs: Port[];
  outputs: Port[];
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;
  error?: string;
  cachedOutput?: {
    images?: string[];
  };
}

export interface ReferenceImageNodeProps {
  id: string;
  data: ReferenceImageNodeData;
  selected?: boolean;
  isConnectable?: boolean;
}

// ===== Helper Functions =====

const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || url.startsWith('data:image/');
  } catch {
    return false;
  }
};

// ===== Component =====

const ReferenceImageNode = memo(({ id, data, selected, isConnectable = true }: ReferenceImageNodeProps) => {
  // Get images from parameters or cachedOutput
  const storedImages = (data.parameters?.images as string[]) ||
                       (data.parameters?.files as string[]) ||
                       data.cachedOutput?.images ||
                       [];

  const [images, setImages] = useState<string[]>(storedImages);
  const [urlInput, setUrlInput] = useState('');
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update node parameters when images change
  const updateNodeImages = useCallback(async (newImages: string[]) => {
    setImages(newImages);
    try {
      await nodeService.update(id, {
        parameters: {
          ...data.parameters,
          images: newImages,
        },
        cachedOutput: {
          images: newImages,
        },
        status: newImages.length > 0 ? 'completed' : 'idle',
      });
    } catch (err) {
      console.error('Failed to update node:', err);
    }
  }, [id, data.parameters]);

  // Handle URL add
  const handleAddUrl = useCallback(() => {
    if (!urlInput.trim()) return;

    if (!isValidImageUrl(urlInput.trim())) {
      setError('Invalid image URL. Must be http://, https://, or data:image/');
      return;
    }

    if (images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const newImages = [...images, urlInput.trim()];
    updateNodeImages(newImages);
    setUrlInput('');
    setIsAddingUrl(false);
    setError(null);
  }, [urlInput, images, updateNodeImages]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploading(true);
    setError(null);

    const newImageUrls: string[] = [];
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      try {
        // Convert to base64 data URL for immediate preview
        // In production, this would upload to backend and return a URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImageUrls.push(dataUrl);
      } catch (err) {
        console.error('Failed to read file:', err);
      }
    }

    if (newImageUrls.length > 0) {
      const allImages = [...images, ...newImageUrls];
      await updateNodeImages(allImages);
    }

    setUploading(false);
  }, [images, updateNodeImages]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Handle remove image
  const handleRemoveImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateNodeImages(newImages);
  }, [images, updateNodeImages]);

  // Render output port
  const renderOutputPort = () => {
    const output = data.outputs?.[0];
    if (!output) return null;

    const portColor = PORT_COLORS[output.type as keyof typeof PORT_COLORS] || PORT_COLORS.any;

    return (
      <Handle
        type="source"
        position={Position.Right}
        id={output.id}
        isConnectable={isConnectable}
        style={{
          width: 12,
          height: 12,
          background: portColor,
          border: '2px solid #1a1a2e',
          right: -6,
        }}
      />
    );
  };

  return (
    <Paper
      elevation={selected ? 8 : 2}
      sx={{
        width: NODE_WIDTH,
        minHeight: NODE_MIN_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: `2px solid ${selected ? REFERENCE_COLOR : alpha(REFERENCE_COLOR, 0.3)}`,
        bgcolor: '#1a1a2e',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: REFERENCE_COLOR,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          background: `linear-gradient(135deg, ${alpha(REFERENCE_COLOR, 0.2)} 0%, ${alpha(REFERENCE_COLOR, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(REFERENCE_COLOR, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CollectionsIcon sx={{ fontSize: 20, color: REFERENCE_COLOR }} />
        <Typography
          variant="subtitle2"
          sx={{
            flex: 1,
            fontWeight: 600,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.label || 'Reference Images'}
        </Typography>
        {data.status === 'completed' && images.length > 0 && (
          <SuccessIcon sx={{ fontSize: 16, color: '#22c55e' }} />
        )}
        {data.status === 'error' && (
          <ErrorIcon sx={{ fontSize: 16, color: '#ef4444' }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 1.5 }}>
        {/* Image Count */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {images.length}/{MAX_IMAGES} images
        </Typography>

        {/* Image Grid */}
        {images.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0.5,
              mb: 1.5,
            }}
          >
            {images.map((url, idx) => (
              <Box
                key={idx}
                sx={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(REFERENCE_COLOR, 0.3)}`,
                  '&:hover .delete-btn': {
                    opacity: 1,
                  },
                }}
              >
                <Box
                  component="img"
                  src={url}
                  alt={`Reference ${idx + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                  }}
                />
                <IconButton
                  className="delete-btn"
                  size="small"
                  onClick={() => handleRemoveImage(idx)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    padding: 0.25,
                    '&:hover': {
                      bgcolor: 'error.main',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 12, color: '#fff' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Drop Zone / Upload Area */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: `2px dashed ${isDragging ? REFERENCE_COLOR : alpha('#fff', 0.2)}`,
            borderRadius: 1,
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragging ? alpha(REFERENCE_COLOR, 0.1) : 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: alpha(REFERENCE_COLOR, 0.5),
              bgcolor: alpha(REFERENCE_COLOR, 0.05),
            },
          }}
        >
          {uploading ? (
            <CircularProgress size={24} sx={{ color: REFERENCE_COLOR }} />
          ) : (
            <>
              <UploadIcon sx={{ fontSize: 32, color: alpha('#fff', 0.5), mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" display="block">
                Drag & drop images or click to upload
              </Typography>
            </>
          )}
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
        />

        {/* URL Input Toggle */}
        <Box sx={{ mt: 1.5 }}>
          {!isAddingUrl ? (
            <Button
              size="small"
              startIcon={<LinkIcon />}
              onClick={() => setIsAddingUrl(true)}
              sx={{
                color: alpha('#fff', 0.7),
                textTransform: 'none',
                fontSize: '0.75rem',
              }}
            >
              Add from URL
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
              <TextField
                size="small"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddUrl();
                  if (e.key === 'Escape') {
                    setIsAddingUrl(false);
                    setUrlInput('');
                  }
                }}
                sx={{
                  flex: 1,
                  '& .MuiInputBase-root': {
                    fontSize: '0.75rem',
                    bgcolor: alpha('#000', 0.2),
                  },
                  '& .MuiInputBase-input': {
                    py: 0.75,
                    px: 1,
                  },
                }}
              />
              <IconButton
                size="small"
                onClick={handleAddUrl}
                sx={{ color: REFERENCE_COLOR }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setIsAddingUrl(false);
                  setUrlInput('');
                  setError(null);
                }}
                sx={{ color: alpha('#fff', 0.5) }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Error Message */}
        {error && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 1, display: 'block' }}
          >
            {error}
          </Typography>
        )}
      </Box>

      {/* Output Port */}
      {renderOutputPort()}

      {/* Port Label */}
      <Box
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: alpha('#fff', 0.5),
            fontSize: '0.65rem',
          }}
        >
          Images
        </Typography>
      </Box>
    </Paper>
  );
});

ReferenceImageNode.displayName = 'ReferenceImageNode';

export { ReferenceImageNode };
export default ReferenceImageNode;
