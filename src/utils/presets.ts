import { PresetProfile } from '../types/converter';

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'web-balanced',
    name: 'Web Optimized',
    description: 'High visual fidelity with up to 80% smaller file size using modern WebP format.',
    settings: {
      format: 'webp',
      quality: 80,
      resizeMode: 'original',
      maintainAspectRatio: true,
      backgroundColor: 'transparent',
    },
  },
  {
    id: 'social-jpeg',
    name: 'Universal JPEG',
    description: 'Crisp JPEG compatible with all web, mobile, and print applications.',
    settings: {
      format: 'jpeg',
      quality: 85,
      resizeMode: 'original',
      maintainAspectRatio: true,
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'lossless-png',
    name: 'Lossless PNG',
    description: 'Full pixel-perfect transparency preservation without compression artifacts.',
    settings: {
      format: 'png',
      quality: 100,
      resizeMode: 'original',
      maintainAspectRatio: true,
      backgroundColor: 'transparent',
    },
  },
  {
    id: 'compact-mobile',
    name: 'Ultra Compressed',
    description: 'Drastically smaller size for fast mobile loading or email attachments.',
    settings: {
      format: 'webp',
      quality: 55,
      resizeMode: 'scale',
      scalePercentage: 80,
      maintainAspectRatio: true,
      backgroundColor: 'transparent',
    },
  },
  {
    id: 'target-size-100kb',
    name: 'Target < 100 KB',
    description: 'Automatically tunes compression quality to stay strictly under 100 KB.',
    settings: {
      format: 'webp',
      quality: 75,
      resizeMode: 'original',
      maintainAspectRatio: true,
      targetSizeKB: 100,
      backgroundColor: 'transparent',
    },
  },
];
