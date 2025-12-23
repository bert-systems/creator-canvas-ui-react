/**
 * downloadService.ts - Utility service for downloading and exporting assets
 * Provides functions to download images, create zip archives, and export data
 */

// ==================== TYPE DEFINITIONS ====================

export interface DownloadOptions {
  /** Custom filename (without extension) */
  filename?: string;
  /** File extension override */
  extension?: string;
  /** Whether to add timestamp to filename */
  addTimestamp?: boolean;
}

export interface BatchDownloadItem {
  url: string;
  filename: string;
}

export interface ExportFormat {
  type: 'png' | 'jpg' | 'webp' | 'json' | 'zip';
  quality?: number; // 0-1 for jpg/webp
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a timestamped filename
 */
const generateTimestamp = (): string => {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * Sanitize filename by removing invalid characters
 */
const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100);
};

/**
 * Get file extension from URL or MIME type
 */
const getExtensionFromUrl = (url: string): string => {
  const urlPath = url.split('?')[0];
  const ext = urlPath.split('.').pop()?.toLowerCase();
  if (ext && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'png'; // Default
};

/**
 * Convert image URL to blob
 */
const urlToBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response.blob();
};

// ==================== DOWNLOAD SERVICE ====================

export const downloadService = {
  /**
   * Download a single image from URL
   */
  async downloadImage(
    imageUrl: string,
    options: DownloadOptions = {}
  ): Promise<void> {
    try {
      const blob = await urlToBlob(imageUrl);
      const extension = options.extension || getExtensionFromUrl(imageUrl);

      let filename = options.filename || 'image';
      filename = sanitizeFilename(filename);

      if (options.addTimestamp) {
        filename = `${filename}_${generateTimestamp()}`;
      }

      const fullFilename = `${filename}.${extension}`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fullFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  /**
   * Download image from canvas element
   */
  downloadCanvas(
    canvas: HTMLCanvasElement,
    options: DownloadOptions & { format?: ExportFormat } = {}
  ): void {
    const format = options.format?.type || 'png';
    const quality = options.format?.quality || 0.92;
    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;

    let filename = options.filename || 'canvas';
    filename = sanitizeFilename(filename);

    if (options.addTimestamp) {
      filename = `${filename}_${generateTimestamp()}`;
    }

    const dataUrl = canvas.toDataURL(mimeType, quality);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Download multiple images (one at a time, user will get multiple downloads)
   */
  async downloadMultiple(
    items: BatchDownloadItem[],
    delay: number = 500
  ): Promise<void> {
    for (let i = 0; i < items.length; i++) {
      await this.downloadImage(items[i].url, {
        filename: items[i].filename,
      });

      // Add delay between downloads to avoid browser blocking
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  /**
   * Download JSON data as file
   */
  downloadJSON(
    data: unknown,
    options: DownloadOptions = {}
  ): void {
    let filename = options.filename || 'data';
    filename = sanitizeFilename(filename);

    if (options.addTimestamp) {
      filename = `${filename}_${generateTimestamp()}`;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Download text content as file
   */
  downloadText(
    content: string,
    options: DownloadOptions & { extension?: string } = {}
  ): void {
    let filename = options.filename || 'file';
    filename = sanitizeFilename(filename);
    const extension = options.extension || 'txt';

    if (options.addTimestamp) {
      filename = `${filename}_${generateTimestamp()}`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Copy image to clipboard
   */
  async copyImageToClipboard(imageUrl: string): Promise<boolean> {
    try {
      const blob = await urlToBlob(imageUrl);

      // Check if clipboard API supports images
      if (!navigator.clipboard || !('write' in navigator.clipboard)) {
        console.warn('Clipboard API not fully supported');
        return false;
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      return true;
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      return false;
    }
  },

  /**
   * Copy text to clipboard
   */
  async copyTextToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);

      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  },

  /**
   * Open image in new tab for manual save
   */
  openImageInNewTab(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  },

  /**
   * Generate filename for studio content
   */
  generateFilename(
    prefix: string,
    type: 'lookbook' | 'post' | 'carousel' | 'moodboard' | 'brandkit' | 'image',
    options: { index?: number; addTimestamp?: boolean } = {}
  ): string {
    let filename = `${prefix}_${type}`;

    if (options.index !== undefined) {
      filename = `${filename}_${String(options.index + 1).padStart(2, '0')}`;
    }

    if (options.addTimestamp) {
      filename = `${filename}_${generateTimestamp()}`;
    }

    return sanitizeFilename(filename);
  },

  /**
   * Export lookbook collection
   */
  async exportLookbook(
    name: string,
    images: string[],
    metadata?: {
      concept?: string;
      style?: string;
      createdAt?: Date;
    }
  ): Promise<void> {
    // Download each image
    for (let i = 0; i < images.length; i++) {
      await this.downloadImage(images[i], {
        filename: this.generateFilename(name, 'lookbook', { index: i }),
        addTimestamp: i === 0, // Only add timestamp to first image
      });

      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Download metadata
    if (metadata) {
      this.downloadJSON({
        name,
        ...metadata,
        imageCount: images.length,
        exportedAt: new Date().toISOString(),
      }, {
        filename: this.generateFilename(name, 'lookbook', { addTimestamp: true }),
      });
    }
  },

  /**
   * Export carousel slides
   */
  async exportCarousel(
    topic: string,
    slides: { imageUrl: string; headline?: string; bodyText?: string }[],
    caption?: string
  ): Promise<void> {
    // Download each slide
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].imageUrl) {
        await this.downloadImage(slides[i].imageUrl, {
          filename: `carousel_slide_${i + 1}`,
          addTimestamp: i === 0,
        });

        if (i < slides.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // Download metadata with caption
    this.downloadJSON({
      topic,
      slides: slides.map((s, i) => ({
        slideNumber: i + 1,
        headline: s.headline,
        bodyText: s.bodyText,
      })),
      caption,
      exportedAt: new Date().toISOString(),
    }, {
      filename: 'carousel_content',
      addTimestamp: true,
    });
  },

  /**
   * Export brand kit
   */
  exportBrandKit(
    brandName: string,
    colorPalette: { name: string; hex: string }[],
    typography?: { primary?: string; secondary?: string },
    voiceAndTone?: string
  ): void {
    const brandKit = {
      name: brandName,
      colorPalette: colorPalette.map(c => ({
        name: c.name,
        hex: c.hex,
        rgb: this.hexToRgb(c.hex),
      })),
      typography,
      voiceAndTone,
      exportedAt: new Date().toISOString(),
    };

    this.downloadJSON(brandKit, {
      filename: `${sanitizeFilename(brandName)}_brand_kit`,
      addTimestamp: true,
    });

    // Also export CSS variables
    const cssVariables = colorPalette.map((c, i) =>
      `  --brand-color-${i + 1}: ${c.hex};`
    ).join('\n');

    const cssContent = `:root {\n${cssVariables}\n}`;

    this.downloadText(cssContent, {
      filename: `${sanitizeFilename(brandName)}_colors`,
      extension: 'css',
      addTimestamp: true,
    });
  },

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },
};

export default downloadService;
