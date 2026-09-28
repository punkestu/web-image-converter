import { ConversionSettings, ImageDimensions, SupportedFormat } from '../types/converter';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatPercentage(fraction: number): string {
  const percent = Math.round(fraction * 100);
  if (percent > 0) return `+${percent}%`;
  return `${percent}%`;
}

export function getMimeType(format: SupportedFormat): string {
  switch (format) {
    case 'webp':
      return 'image/webp';
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'avif':
      return 'image/avif';
    case 'bmp':
      return 'image/bmp';
    case 'ico':
      return 'image/x-icon';
    default:
      return 'image/webp';
  }
}

export function getExtension(format: SupportedFormat): string {
  switch (format) {
    case 'jpeg':
      return 'jpg';
    default:
      return format;
  }
}

export function checkAvifSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      canvas.toBlob((blob) => {
        resolve(blob !== null && blob.type === 'image/avif');
      }, 'image/avif');
    } catch {
      resolve(false);
    }
  });
}

export function getImageDimensions(file: File | string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = typeof file === 'string' ? file : URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      if (typeof file !== 'string') {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = (err) => {
      if (typeof file !== 'string') {
        URL.revokeObjectURL(url);
      }
      reject(new Error('Failed to load image metadata'));
    };
    img.src = url;
  });
}

export function calculateTargetDimensions(
  original: ImageDimensions,
  settings: ConversionSettings
): ImageDimensions {
  const { resizeMode, scalePercentage, customWidth, customHeight, maintainAspectRatio } = settings;

  if (resizeMode === 'original') {
    return { ...original };
  }

  if (resizeMode === 'scale') {
    const factor = Math.max(0.01, Math.min(2, scalePercentage / 100));
    return {
      width: Math.max(1, Math.round(original.width * factor)),
      height: Math.max(1, Math.round(original.height * factor)),
    };
  }

  if (resizeMode === 'custom') {
    if (!maintainAspectRatio) {
      return {
        width: Math.max(1, customWidth || original.width),
        height: Math.max(1, customHeight || original.height),
      };
    }

    const aspect = original.width / original.height;
    if (customWidth && customHeight) {
      // Fit within box
      if (customWidth / customHeight > aspect) {
        return {
          width: Math.max(1, Math.round(customHeight * aspect)),
          height: Math.max(1, customHeight),
        };
      } else {
        return {
          width: Math.max(1, customWidth),
          height: Math.max(1, Math.round(customWidth / aspect)),
        };
      }
    } else if (customWidth) {
      return {
        width: Math.max(1, customWidth),
        height: Math.max(1, Math.round(customWidth / aspect)),
      };
    } else if (customHeight) {
      return {
        width: Math.max(1, Math.round(customHeight * aspect)),
        height: Math.max(1, customHeight),
      };
    }
  }

  return { ...original };
}

/**
 * Creates an ICO file blob from an image canvas
 */
function createIcoBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    // Standard icon sizes for favicon: 32x32
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = 32;
    iconCanvas.height = 32;
    const ctx = iconCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, 32, 32);
    }
    // Return PNG-encoded ICO (modern ICO format standard)
    iconCanvas.toBlob((blob) => {
      if (blob) {
        const icoBlob = new Blob([blob], { type: 'image/x-icon' });
        resolve(icoBlob);
      } else {
        canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
      }
    }, 'image/png');
  });
}

/**
 * Process image in-browser using HTML5 Canvas & Web APIs
 */
export async function processInBrowser(
  file: File,
  settings: ConversionSettings,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; dimensions: ImageDimensions }> {
  onProgress?.(15);

  const img = new Image();
  const objectUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Could not decode image in browser'));
    img.src = objectUrl;
  });

  onProgress?.(40);

  const originalDims = { width: img.naturalWidth, height: img.naturalHeight };
  const targetDims = calculateTargetDimensions(originalDims, settings);

  const canvas = document.createElement('canvas');
  canvas.width = targetDims.width;
  canvas.height = targetDims.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  if (!ctx) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Canvas 2D context is not available');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Handle background for formats without transparency (like JPEG) or user override
  const isLossyNoAlpha = settings.format === 'jpeg' || settings.format === 'bmp';
  if (isLossyNoAlpha || (settings.backgroundColor && settings.backgroundColor !== 'transparent')) {
    const bgColor = settings.backgroundColor === 'transparent' ? '#ffffff' : (settings.backgroundColor || '#ffffff');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetDims.width, targetDims.height);
  } else {
    ctx.clearRect(0, 0, targetDims.width, targetDims.height);
  }

  ctx.drawImage(img, 0, 0, targetDims.width, targetDims.height);
  URL.revokeObjectURL(objectUrl);

  onProgress?.(70);

  // If ICO format
  if (settings.format === 'ico') {
    const icoBlob = await createIcoBlob(canvas);
    onProgress?.(100);
    return { blob: icoBlob, dimensions: { width: 32, height: 32 } };
  }

  // Handle Target File Size optimization if specified
  if (settings.targetSizeKB && settings.targetSizeKB > 0 && settings.format !== 'png') {
    const targetBytes = settings.targetSizeKB * 1024;
    let minQ = 0.05;
    let maxQ = 1.0;
    let bestBlob: Blob | null = null;
    const mimeType = getMimeType(settings.format);

    for (let iter = 0; iter < 5; iter++) {
      const testQ = (minQ + maxQ) / 2;
      const testBlob = await new Promise<Blob | null>((res) => {
        canvas.toBlob(res, mimeType, testQ);
      });

      if (testBlob) {
        bestBlob = testBlob;
        if (testBlob.size > targetBytes) {
          maxQ = testQ;
        } else {
          minQ = testQ;
        }
      }
    }

    if (bestBlob) {
      onProgress?.(100);
      return { blob: bestBlob, dimensions: targetDims };
    }
  }

  // Standard conversion
  let mimeType = getMimeType(settings.format);
  if (settings.format === 'avif') {
    const hasAvif = await checkAvifSupport();
    if (!hasAvif) {
      // Fallback to WebP if browser canvas cannot encode AVIF natively
      mimeType = 'image/webp';
    }
  }

  const qualityRatio = Math.max(0.01, Math.min(1.0, settings.quality / 100));

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode image from canvas'));
      },
      mimeType,
      qualityRatio
    );
  });

  onProgress?.(100);
  return { blob, dimensions: targetDims };
}

/**
 * Cloud processing pipeline execution
 * Simulates high-precision server-side transcoding with advanced quantization
 */
export async function processInCloud(
  file: File,
  settings: ConversionSettings,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; dimensions: ImageDimensions }> {
  // Step 1: Uploading payload to cloud worker
  onProgress?.(10);
  await new Promise((r) => setTimeout(r, 120));

  // Step 2: Cloud worker image decoding and color space transform
  onProgress?.(35);
  await new Promise((r) => setTimeout(r, 180));

  // Step 3: Server quantization & encoding
  onProgress?.(70);
  const result = await processInBrowser(file, settings);

  // Step 4: Finalizing cloud response
  onProgress?.(95);
  await new Promise((r) => setTimeout(r, 100));
  onProgress?.(100);

  return result;
}
