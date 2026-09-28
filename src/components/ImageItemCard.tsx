import React from 'react';
import { Download, RefreshCw, Trash2, SplitSquareVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageItem, SupportedFormat } from '../types/converter';
import { formatBytes, formatPercentage } from '../utils/imageProcessor';

interface ImageItemCardProps {
  item: ImageItem;
  onConvert: (id: string) => void;
  onRemove: (id: string) => void;
  onCompare: (item: ImageItem) => void;
  onUpdateFormat: (id: string, format: SupportedFormat) => void;
  onUpdateQuality: (id: string, quality: number) => void;
}

export const ImageItemCard: React.FC<ImageItemCardProps> = ({
  item,
  onConvert,
  onRemove,
  onCompare,
  onUpdateFormat,
  onUpdateQuality,
}) => {
  const isCompleted = item.status === 'completed' && item.convertedBlob;
  const isProcessing = item.status === 'processing';
  const isError = item.status === 'error';

  // Compute savings
  let savingsRatio = 0;
  let bytesSaved = 0;
  if (isCompleted && item.convertedSize) {
    bytesSaved = item.originalSize - item.convertedSize;
    savingsRatio = (item.convertedSize - item.originalSize) / item.originalSize;
  }

  const handleDownload = () => {
    if (!item.convertedBlob) return;
    const url = URL.createObjectURL(item.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const ext = item.settings.format === 'jpeg' ? 'jpg' : item.settings.format;
    a.download = `${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/90">
      {/* Left: Thumbnail & Original Metadata */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
          <img
            src={item.previewUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          {isCompleted && (
            <div className="absolute bottom-1 right-1 rounded-full bg-emerald-500 p-0.5 text-white shadow-sm">
              <CheckCircle2 className="h-3 w-3" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-neutral-100" title={item.name}>
            {item.name}
          </h4>

          {/* Unboxed metadata with typographic separators */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-400 font-mono tabular-nums">
            <span className="uppercase text-neutral-300 font-medium">
              {item.originalFormat}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>{formatBytes(item.originalSize)}</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>
              {item.originalDimensions.width} × {item.originalDimensions.height} px
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Controls (Format, Quality, Progress) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Target Format selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-neutral-400 font-medium">To:</label>
          <select
            value={item.settings.format}
            onChange={(e) => onUpdateFormat(item.id, e.target.value as SupportedFormat)}
            disabled={isProcessing}
            className="rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs font-semibold uppercase text-neutral-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="webp">WebP</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="avif">AVIF</option>
            <option value="bmp">BMP</option>
            <option value="ico">ICO</option>
          </select>
        </div>

        {/* Quality control */}
        {item.settings.format !== 'ico' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Q:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={item.settings.quality}
              onChange={(e) => onUpdateQuality(item.id, Number(e.target.value))}
              disabled={isProcessing}
              className="w-20 cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-indigo-500"
            />
            <span className="text-xs font-mono tabular-nums text-neutral-300 min-w-[28px]">
              {item.settings.quality}%
            </span>
          </div>
        )}

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="w-28 flex flex-col gap-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full bg-indigo-500 transition-all duration-150"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums text-indigo-400">
              Converting {item.progress}%
            </span>
          </div>
        )}

        {/* Converted Stats */}
        {isCompleted && item.convertedSize && (
          <div className="flex items-center gap-2 rounded-lg bg-neutral-950/80 px-3 py-1.5 border border-neutral-800 font-mono text-xs tabular-nums">
            <span className="text-emerald-400 font-medium">
              {formatBytes(item.convertedSize)}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className={savingsRatio <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
              {formatPercentage(savingsRatio)}
            </span>
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{item.errorMessage || 'Conversion failed'}</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 justify-end">
        {isCompleted && (
          <button
            type="button"
            onClick={() => onCompare(item)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors cursor-pointer"
            title="Inspect Before vs After comparison slider"
          >
            <SplitSquareVertical className="h-3.5 w-3.5 text-indigo-400" />
            <span>Compare</span>
          </button>
        )}

        {isCompleted ? (
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors cursor-pointer"
            title="Download converted file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onConvert(item.id)}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Convert</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors cursor-pointer"
          title="Remove from queue"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
