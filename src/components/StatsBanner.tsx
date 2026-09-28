import React from 'react';
import { ShieldCheck, Zap, HardDrive, Sparkles } from 'lucide-react';
import { ImageItem, ConversionEngine } from '../types/converter';
import { formatBytes, formatPercentage } from '../utils/imageProcessor';

interface StatsBannerProps {
  items: ImageItem[];
  engine: ConversionEngine;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ items, engine }) => {
  const completed = items.filter((i) => i.status === 'completed' && i.convertedSize);

  const totalOriginalBytes = completed.reduce((acc, i) => acc + i.originalSize, 0);
  const totalConvertedBytes = completed.reduce((acc, i) => acc + (i.convertedSize || 0), 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalConvertedBytes);
  const totalSavedRatio =
    totalOriginalBytes > 0
      ? (totalConvertedBytes - totalOriginalBytes) / totalOriginalBytes
      : 0;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Engine status indicator */}
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            engine === 'browser' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
          }`}>
            {engine === 'browser' ? <ShieldCheck className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200">
                {engine === 'browser' ? 'Client-Side In-Browser Engine' : 'Cloud Processing Pipeline'}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.2 text-[10px] font-medium text-emerald-400">
                Active
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {engine === 'browser'
                ? 'Files are decoded & compressed directly in your browser. Zero bytes uploaded to external servers.'
                : 'Accelerated cloud pipeline with multi-stage quantization and profile normalization.'}
            </p>
          </div>
        </div>

        {/* Aggregate Savings figures if conversions are done */}
        {completed.length > 0 && (
          <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-neutral-800 pt-3 sm:pt-0 sm:pl-6 text-xs font-mono tabular-nums">
            <div>
              <span className="text-[11px] text-neutral-500 block uppercase font-sans">
                Converted
              </span>
              <span className="text-sm font-semibold text-white">
                {completed.length} of {items.length}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block uppercase font-sans">
                Bandwidth Saved
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                {formatBytes(totalSavedBytes)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-500 block uppercase font-sans">
                Reduction
              </span>
              <span className="text-sm font-semibold text-emerald-400">
                {formatPercentage(totalSavedRatio)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
