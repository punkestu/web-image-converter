import React from 'react';
import { Cpu, Cloud, ShieldCheck } from 'lucide-react';
import { ConversionEngine } from '../types/converter';

interface HeaderProps {
  engine: ConversionEngine;
  onEngineChange: (engine: ConversionEngine) => void;
  itemCount: number;
  completedCount: number;
  onClearAll: () => void;
  onDownloadAllZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  engine,
  onEngineChange,
  itemCount,
  completedCount,
  onClearAll,
  onDownloadAllZip,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single Wordmark */}
        <div className="flex items-center gap-3">
          <a href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono text-sm font-semibold shadow-inner">
              PX
            </span>
            <span>PixelShift</span>
          </a>
          <span className="hidden sm:inline-block text-neutral-600">/</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>100% In-Browser Sandbox</span>
          </span>
        </div>

        {/* Zone 2: Engine Selector & Mode Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900/90 p-1">
            <button
              type="button"
              onClick={() => onEngineChange('browser')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                engine === 'browser'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Processes images 100% on your device using Client Canvas & WebCodecs. No uploads."
            >
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>In-Browser (Private)</span>
            </button>
            <button
              type="button"
              onClick={() => onEngineChange('cloud')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                engine === 'cloud'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Cloud Processing Engine simulation with server pipeline."
            >
              <Cloud className="h-3.5 w-3.5 text-sky-400" />
              <span>Cloud Pipeline</span>
            </button>
          </div>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {itemCount > 0 && (
            <>
              <button
                type="button"
                onClick={onClearAll}
                className="hidden sm:block text-xs font-medium text-neutral-400 hover:text-neutral-200 px-3 py-2 transition-colors"
              >
                Clear Queue
              </button>
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={onDownloadAllZip}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                  <span>Download ZIP ({completedCount})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
