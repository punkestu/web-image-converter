import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Download, ArrowLeftRight } from 'lucide-react';
import { ImageItem } from '../types/converter';
import { formatBytes, formatPercentage } from '../utils/imageProcessor';

interface CompareModalProps {
  item: ImageItem | null;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ item, onClose }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = fit, 2 = 2x, 3 = 3x
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item || !item.convertedBlob) return null;

  const convertedUrl = item.convertedUrl || URL.createObjectURL(item.convertedBlob);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPosition(percent);
  };

  const bytesSaved = item.convertedSize ? item.originalSize - item.convertedSize : 0;
  const ratio = item.convertedSize
    ? (item.convertedSize - item.originalSize) / item.originalSize
    : 0;

  const handleDownload = () => {
    if (!item.convertedBlob) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const ext = item.settings.format === 'jpeg' ? 'jpg' : item.settings.format;
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
      <div className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-white">Visual Quality Inspector</h3>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400 font-mono truncate max-w-xs">{item.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 p-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                disabled={zoomLevel <= 1}
                className="rounded p-1 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-mono tabular-nums text-neutral-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                disabled={zoomLevel >= 3}
                className="rounded p-1 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-2 border-b border-neutral-800 bg-neutral-900/60 px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300 uppercase tracking-wide">
              Original ({item.originalFormat.toUpperCase()})
            </span>
            <span className="text-neutral-500">·</span>
            <span className="font-mono tabular-nums text-neutral-400">
              {formatBytes(item.originalSize)}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="font-mono tabular-nums text-neutral-400">
              {item.originalDimensions.width} × {item.originalDimensions.height} px
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 text-right">
            <span className="font-semibold text-indigo-400 uppercase tracking-wide">
              Converted ({item.settings.format.toUpperCase()})
            </span>
            <span className="text-neutral-500">·</span>
            <span className="font-mono tabular-nums text-emerald-400 font-semibold">
              {formatBytes(item.convertedSize || 0)}
            </span>
            <span className="text-neutral-500">·</span>
            <span className={`font-mono tabular-nums font-semibold ${ratio <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {formatPercentage(ratio)}
            </span>
          </div>
        </div>

        {/* Interactive Comparison Viewport */}
        <div className="relative flex-1 overflow-auto bg-neutral-950 p-4 select-none">
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
            className="relative mx-auto h-full max-h-[65vh] w-full max-w-4xl overflow-hidden rounded-xl border border-neutral-800 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] cursor-ew-resize"
          >
            {/* Converted Image (Right / Underneath) */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <img
                src={convertedUrl}
                alt="Converted"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>

            {/* Original Image (Left / Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  width: containerRef.current?.clientWidth || '100%',
                  height: '100%',
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                <img
                  src={item.previewUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain pointer-events-none"
                />
              </div>
            </div>

            {/* Split Divider Line */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-xl text-neutral-900 border border-neutral-200">
                <ArrowLeftRight className="h-4 w-4" />
              </div>
            </div>

            {/* Labels overlay */}
            <div className="absolute top-3 left-3 z-10 rounded bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm pointer-events-none">
              Original
            </div>
            <div className="absolute top-3 right-3 z-10 rounded bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-1 text-[11px] font-medium text-indigo-200 backdrop-blur-sm pointer-events-none">
              Converted ({item.settings.quality}%)
            </div>
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/40 px-6 py-2.5 text-xs text-neutral-400">
          <span>Drag the center divider or click anywhere to compare image detail</span>
          <span className="font-mono tabular-nums">Divider: {sliderPosition}%</span>
        </div>
      </div>
    </div>
  );
};
