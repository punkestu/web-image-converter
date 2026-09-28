import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { BatchSettingsBar } from './components/BatchSettingsBar';
import { ImageItemCard } from './components/ImageItemCard';
import { CompareModal } from './components/CompareModal';
import { StatsBanner } from './components/StatsBanner';
import {
  ImageItem,
  ConversionSettings,
  ConversionEngine,
  SupportedFormat,
} from './types/converter';
import {
  getImageDimensions,
  processInBrowser,
  processInCloud,
} from './utils/imageProcessor';
import { exportImagesAsZip } from './utils/zipExporter';
import { fetchSampleAsFile } from './utils/sampleImages';
import { Check, ShieldCheck, Zap, Layers, RefreshCw, FileText, Sparkles, ArrowRight } from 'lucide-react';

const DEFAULT_SETTINGS: ConversionSettings = {
  format: 'webp',
  quality: 80,
  resizeMode: 'original',
  scalePercentage: 100,
  customWidth: 1920,
  customHeight: 1080,
  maintainAspectRatio: true,
  backgroundColor: 'transparent',
};

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [engine, setEngine] = useState<ConversionEngine>('browser');
  const [batchSettings, setBatchSettings] = useState<ConversionSettings>(DEFAULT_SETTINGS);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [comparingItem, setComparingItem] = useState<ImageItem | null>(null);

  // Add files to queue
  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      const newItems: ImageItem[] = [];

      for (const file of files) {
        try {
          const previewUrl = URL.createObjectURL(file);
          const dimensions = await getImageDimensions(file);
          const formatExt = file.name.split('.').pop()?.toLowerCase() || 'unknown';

          const item: ImageItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            file,
            name: file.name,
            originalSize: file.size,
            originalFormat: formatExt,
            originalDimensions: dimensions,
            previewUrl,
            status: 'idle',
            progress: 0,
            settings: { ...batchSettings },
            processedVia: engine,
          };
          newItems.push(item);
        } catch (err) {
          console.error('Failed to parse image metadata', err);
        }
      }

      setItems((prev) => [...prev, ...newItems]);
    },
    [batchSettings, engine]
  );

  // Load sample image
  const handleLoadSample = async (type: 'mountain' | 'architecture') => {
    try {
      const file = await fetchSampleAsFile(type);
      await handleFilesAdded([file]);
    } catch (err) {
      console.error('Error loading sample image', err);
    }
  };

  // Convert a single item
  const handleConvertItem = useCallback(
    async (id: string) => {
      const currentItem = items.find((i) => i.id === id);
      if (!currentItem) return;

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'processing', progress: 5 } : i))
      );

      const startTime = performance.now();

      try {
        const onProgress = (p: number) => {
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, progress: p } : i))
          );
        };

        const result =
          engine === 'browser'
            ? await processInBrowser(currentItem.file, currentItem.settings, onProgress)
            : await processInCloud(currentItem.file, currentItem.settings, onProgress);

        const processingTimeMs = Math.round(performance.now() - startTime);
        const convertedUrl = URL.createObjectURL(result.blob);

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'completed',
                  progress: 100,
                  convertedBlob: result.blob,
                  convertedUrl,
                  convertedSize: result.blob.size,
                  convertedDimensions: result.dimensions,
                  processingTimeMs,
                  processedVia: engine,
                }
              : i
          )
        );
      } catch (error: any) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'error',
                  progress: 0,
                  errorMessage: error.message || 'Conversion failed',
                }
              : i
          )
        );
      }
    },
    [items, engine]
  );

  // Convert all items in queue
  const handleConvertAll = async () => {
    if (items.length === 0 || isProcessingBatch) return;
    setIsProcessingBatch(true);

    for (const item of items) {
      await handleConvertItem(item.id);
    }

    setIsProcessingBatch(false);
  };

  // Apply batch settings to all items in list
  const handleApplyToAll = () => {
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        settings: { ...batchSettings },
        // reset converted state if settings changed so user can re-convert
        status: i.status === 'completed' ? 'idle' : i.status,
      }))
    );
  };

  // Update format for individual item
  const handleUpdateFormat = (id: string, format: SupportedFormat) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              settings: { ...i.settings, format },
              status: 'idle',
            }
          : i
      )
    );
  };

  // Update quality for individual item
  const handleUpdateQuality = (id: string, quality: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              settings: { ...i.settings, quality },
              status: 'idle',
            }
          : i
      )
    );
  };

  // Remove individual item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
  };

  // Download all as ZIP
  const handleDownloadAllZip = () => {
    exportImagesAsZip(items);
  };

  const completedCount = items.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 flex flex-col selection:bg-indigo-600/30">
      {/* Top Bar Contract (3 zones) */}
      <Header
        engine={engine}
        onEngineChange={setEngine}
        itemCount={items.length}
        completedCount={completedCount}
        onClearAll={handleClearAll}
        onDownloadAllZip={handleDownloadAllZip}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Hero Introduction & Engine Privacy Callout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-850 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Convert & Compress Images
            </h1>
            <p className="mt-1.5 text-sm text-neutral-400 max-w-2xl">
              Transform high-resolution pictures to modern formats (WebP, JPEG, PNG, AVIF) with customizable compression rates, instant visual quality comparisons, and batch export.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Processing Mode:</span>
            <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-xs font-medium">
              {engine === 'browser' ? (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-neutral-200">Local Browser Sandbox</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 text-sky-400" />
                  <span className="text-neutral-200">Cloud Worker Pipeline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status / Aggregate Savings Banner */}
        <StatsBanner items={items} engine={engine} />

        {/* Upload Drop Zone */}
        {items.length === 0 ? (
          <DropZone
            onFilesSelected={handleFilesAdded}
            onLoadSample={handleLoadSample}
            compact={false}
          />
        ) : (
          <DropZone
            onFilesSelected={handleFilesAdded}
            onLoadSample={handleLoadSample}
            compact={true}
          />
        )}

        {/* Batch Settings Bar (visible when queue is not empty) */}
        {items.length > 0 && (
          <BatchSettingsBar
            settings={batchSettings}
            onSettingsChange={setBatchSettings}
            onApplyToAll={handleApplyToAll}
            onConvertAll={handleConvertAll}
            isProcessing={isProcessingBatch}
            totalCount={items.length}
            completedCount={completedCount}
            onDownloadAllZip={handleDownloadAllZip}
          />
        )}

        {/* Queue of Image Cards */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Queue ({items.length} {items.length === 1 ? 'file' : 'files'})
              </h3>
              <div className="text-xs text-neutral-500 font-mono tabular-nums">
                {completedCount} completed · {items.length - completedCount} pending
              </div>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => (
                <ImageItemCard
                  key={item.id}
                  item={item}
                  onConvert={handleConvertItem}
                  onRemove={handleRemoveItem}
                  onCompare={setComparingItem}
                  onUpdateFormat={handleUpdateFormat}
                  onUpdateQuality={handleUpdateQuality}
                />
              ))}
            </div>
          </div>
        )}

        {/* Format Comparison & Guidance Guide */}
        <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-base font-semibold text-white">
            Which format should you choose?
          </h3>
          <p className="mt-1 text-xs text-neutral-400">
            Engineered guidelines for optimal web delivery, loading speed, and image clarity.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-indigo-400">WebP</span>
                <span className="text-[11px] text-emerald-400 font-medium">Recommended for Web</span>
              </div>
              <p className="mt-2 text-xs text-neutral-300">
                25%–35% smaller than comparable JPEG with identical visual fidelity. Supports full alpha transparency and animation across all modern browsers.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                <span>Lossy & Lossless</span>
                <span>·</span>
                <span>Alpha: Yes</span>
                <span>·</span>
                <span>Best Quality: 75%–85%</span>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-sky-400">JPEG / JPG</span>
                <span className="text-[11px] text-neutral-400 font-medium">Universal Compatibility</span>
              </div>
              <p className="mt-2 text-xs text-neutral-300">
                The global standard for digital photography, email attachments, and legacy operating systems. High compression efficiency for complex photographic details.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                <span>Lossy Only</span>
                <span>·</span>
                <span>Alpha: No (Replaced by fill)</span>
                <span>·</span>
                <span>Best Quality: 80%–90%</span>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-amber-400">PNG</span>
                <span className="text-[11px] text-neutral-400 font-medium">Crisp Lossless & Icons</span>
              </div>
              <p className="mt-2 text-xs text-neutral-300">
                Pixel-perfect lossless compression designed for logos, illustrations, UI screenshots, and diagrams with sharp contrast and translucent drop shadows.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                <span>Lossless</span>
                <span>·</span>
                <span>Alpha: Full 8-bit</span>
                <span>·</span>
                <span>Best for: Graphic Assets</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800/80 pt-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Zero-storage policy: All image memory is purged when you leave or refresh this tab.</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span>Shortcuts:</span>
              <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-300">Ctrl+V</kbd>
              <span>to paste screenshot</span>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Quality Inspection Modal */}
      {comparingItem && (
        <CompareModal
          item={comparingItem}
          onClose={() => setComparingItem(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>PixelShift · High-Performance In-Browser Image Converter & Compressor</span>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Client-side Canvas & WebCodecs</span>
            <span>·</span>
            <span>Zero server data retention</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
