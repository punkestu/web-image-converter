import React, { useState } from 'react';
import { Sliders, Sparkles, ChevronDown, ChevronUp, Play, Download, Settings2 } from 'lucide-react';
import { ConversionSettings, SupportedFormat, ResizeMode } from '../types/converter';
import { PRESET_PROFILES } from '../utils/presets';

interface BatchSettingsBarProps {
  settings: ConversionSettings;
  onSettingsChange: (newSettings: ConversionSettings) => void;
  onApplyToAll: () => void;
  onConvertAll: () => void;
  isProcessing: boolean;
  totalCount: number;
  completedCount: number;
  onDownloadAllZip: () => void;
}

export const BatchSettingsBar: React.FC<BatchSettingsBarProps> = ({
  settings,
  onSettingsChange,
  onApplyToAll,
  onConvertAll,
  isProcessing,
  totalCount,
  completedCount,
  onDownloadAllZip,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFormatChange = (format: SupportedFormat) => {
    onSettingsChange({
      ...settings,
      format,
    });
  };

  const handleQualityChange = (quality: number) => {
    onSettingsChange({
      ...settings,
      quality,
    });
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_PROFILES.find((p) => p.id === presetId);
    if (preset) {
      onSettingsChange({
        ...settings,
        ...preset.settings,
      });
    }
  };

  const handleResizeModeChange = (mode: ResizeMode) => {
    onSettingsChange({
      ...settings,
      resizeMode: mode,
    });
  };

  const formats: { id: SupportedFormat; label: string; badge?: string }[] = [
    { id: 'webp', label: 'WebP', badge: 'Recommended' },
    { id: 'jpeg', label: 'JPEG' },
    { id: 'png', label: 'PNG' },
    { id: 'avif', label: 'AVIF', badge: 'Next-Gen' },
    { id: 'bmp', label: 'BMP' },
    { id: 'ico', label: 'ICO', badge: 'Favicon' },
  ];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section: Target Format and Quick Quality */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="block text-xs font-medium text-neutral-400 mb-1.5">
              Convert All To:
            </span>
            <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-950 p-1">
              {formats.map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleFormatChange(fmt.id)}
                  className={`relative rounded-md px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    settings.format === fmt.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <span>{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (unless format is pure PNG lossless without quant) */}
          {settings.format !== 'ico' && (
            <div className="min-w-[190px]">
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span className="text-neutral-400">Compression Quality</span>
                <span className="font-mono tabular-nums text-white">
                  {settings.quality}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={settings.quality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Quick Presets Dropdown / Toggle */}
          <div>
            <span className="block text-xs font-medium text-neutral-400 mb-1.5">
              Preset Profile:
            </span>
            <div className="flex items-center gap-1.5">
              {PRESET_PROFILES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className="rounded-md border border-neutral-800 bg-neutral-950/80 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                  title={preset.description}
                >
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Action CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800/80 transition-colors cursor-pointer"
          >
            <Settings2 className="h-3.5 w-3.5 text-neutral-400" />
            <span>Resize & Color</span>
            {showAdvanced ? (
              <ChevronUp className="h-3.5 w-3.5 text-neutral-500" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onApplyToAll}
            className="rounded-lg border border-neutral-800 bg-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
            title="Copies current format and quality settings to every image in queue"
          >
            Sync All
          </button>

          <button
            type="button"
            disabled={isProcessing || totalCount === 0}
            onClick={onConvertAll}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer ${
              isProcessing || totalCount === 0
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Convert All ({totalCount})</span>
              </>
            )}
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={onDownloadAllZip}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download ZIP ({completedCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Resizing & Background Controls Drawer */}
      {showAdvanced && (
        <div className="mt-4 border-t border-neutral-800/80 pt-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Resize Mode */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Dimension Scaling
              </label>
              <div className="flex items-center gap-1.5">
                {(['original', 'scale', 'custom'] as ResizeMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleResizeModeChange(mode)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-all cursor-pointer ${
                      settings.resizeMode === mode
                        ? 'bg-neutral-700 text-white'
                        : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {mode === 'original' ? '100% Native' : mode === 'scale' ? 'Scale %' : 'Custom W×H'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale percentage slider if mode === 'scale' */}
            {settings.resizeMode === 'scale' && (
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-neutral-400 mb-1.5">
                  <span>Scale Factor</span>
                  <span className="font-mono tabular-nums text-white">
                    {settings.scalePercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={settings.scalePercentage}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      scalePercentage: Number(e.target.value),
                    })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-indigo-500"
                />
              </div>
            )}

            {/* Custom dimensions if mode === 'custom' */}
            {settings.resizeMode === 'custom' && (
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Max Width (px)</label>
                  <input
                    type="number"
                    min="16"
                    max="8192"
                    value={settings.customWidth || ''}
                    placeholder="e.g. 1920"
                    onChange={(e) =>
                      onSettingsChange({
                        ...settings,
                        customWidth: Number(e.target.value),
                      })
                    }
                    className="w-24 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-white font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Max Height (px)</label>
                  <input
                    type="number"
                    min="16"
                    max="8192"
                    value={settings.customHeight || ''}
                    placeholder="e.g. 1080"
                    onChange={(e) =>
                      onSettingsChange({
                        ...settings,
                        customHeight: Number(e.target.value),
                      })
                    }
                    className="w-24 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-white font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Target Size Cap (KB) */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Target Max File Size (Optional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={settings.targetSizeKB || ''}
                  placeholder="Unlimited (Off)"
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      targetSizeKB: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-32 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-white font-mono tabular-nums focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-neutral-400 font-mono">KB</span>
              </div>
            </div>

            {/* Alpha Background Fill (especially for JPEG conversion) */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Transparency Fill (for JPEG)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange({ ...settings, backgroundColor: '#ffffff' })
                  }
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer ${
                    settings.backgroundColor === '#ffffff'
                      ? 'bg-neutral-700 text-white'
                      : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-white border border-neutral-400 inline-block" />
                  <span>White</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange({ ...settings, backgroundColor: '#000000' })
                  }
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer ${
                    settings.backgroundColor === '#000000'
                      ? 'bg-neutral-700 text-white'
                      : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-black border border-neutral-600 inline-block" />
                  <span>Black</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onSettingsChange({ ...settings, backgroundColor: 'transparent' })
                  }
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer ${
                    settings.backgroundColor === 'transparent'
                      ? 'bg-neutral-700 text-white'
                      : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Alpha (PNG/WebP)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
