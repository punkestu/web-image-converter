export type SupportedFormat = 'webp' | 'jpeg' | 'png' | 'avif' | 'bmp' | 'ico';

export type ResizeMode = 'original' | 'scale' | 'custom' | 'fit-width' | 'fit-height';

export type BackgroundColorOption = 'transparent' | '#ffffff' | '#000000' | 'custom';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ConversionSettings {
  format: SupportedFormat;
  quality: number; // 1 - 100
  resizeMode: ResizeMode;
  scalePercentage: number; // e.g., 50 = 50%
  customWidth: number;
  customHeight: number;
  maintainAspectRatio: boolean;
  backgroundColor: string; // for JPEG or alpha replacement: 'transparent' or hex
  targetSizeKB?: number; // optional target file size cap
  lossless?: boolean; // For WebP
}

export type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalFormat: string;
  originalDimensions: ImageDimensions;
  previewUrl: string;
  status: ProcessingStatus;
  progress: number; // 0 - 100
  errorMessage?: string;
  settings: ConversionSettings;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedDimensions?: ImageDimensions;
  processingTimeMs?: number;
  processedVia: 'browser' | 'cloud';
}

export type ConversionEngine = 'browser' | 'cloud';

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  settings: Partial<ConversionSettings>;
}
