import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, FolderUp, Image as ImageIcon, Sparkles, Clipboard, ArrowRight } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSample: (sampleType: 'mountain' | 'architecture') => void;
  compact?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onLoadSample,
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [clipboardNotif, setClipboardNotif] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/') || /\.(png|jpe?g|webp|avif|bmp|gif|svg|ico)$/i.test(file.name)
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
      e.target.value = '';
    }
  };

  // Listen to paste event (e.g., screenshot paste with Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const imageFiles = Array.from(e.clipboardData.files).filter((f) =>
          f.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
          onFilesSelected(imageFiles);
          setClipboardNotif(true);
          setTimeout(() => setClipboardNotif(false), 3000);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex items-center justify-between rounded-xl border border-dashed px-5 py-4 transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-200">
              Drag & drop more images here
            </p>
            <p className="text-xs text-neutral-500">
              PNG, JPEG, WebP, AVIF, BMP, GIF, SVG · Paste screenshot with Ctrl+V
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.webp,.avif"
            onChange={handleManualUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 px-3.5 py-2 text-xs font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
          >
            <span>Upload from Device</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
        isDragging
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005]'
          : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/60'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.webp,.avif"
        onChange={handleManualUpload}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error - webkitdirectory is standard across browsers for folder upload
        webkitdirectory="true"
        onChange={handleManualUpload}
        className="hidden"
      />

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800/80 text-neutral-300 shadow-inner">
        <UploadCloud className="h-8 w-8 text-indigo-400" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-neutral-100">
        Drag & drop images here to convert & compress
      </h2>
      <p className="mx-auto mt-1.5 max-w-lg text-sm text-neutral-400">
        All conversions run securely inside your browser canvas. No file size limits and zero data upload to third parties.
      </p>

      {/* Buttons to upload files manually from local device */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Upload Files from Device</span>
        </button>

        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all cursor-pointer"
        >
          <FolderUp className="h-4 w-4" />
          <span>Select Folder</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <Clipboard className="h-3.5 w-3.5" />
        <span>Tip: You can also paste copied images directly from clipboard (Ctrl+V / Cmd+V)</span>
      </div>

      {clipboardNotif && (
        <div className="mt-3 inline-block rounded-md bg-emerald-950/80 border border-emerald-800 px-3 py-1 text-xs text-emerald-300 animate-fade-in">
          Image pasted from clipboard!
        </div>
      )}

      {/* Samples section */}
      <div className="mt-8 border-t border-neutral-800/80 pt-6">
        <p className="text-xs font-medium text-neutral-400">
          No image at hand? Test instantly with pre-loaded high-detail sample assets:
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onLoadSample('mountain')}
            className="group flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Mountain Landscape (High Detail 4:3)</span>
            <ArrowRight className="h-3 w-3 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('architecture')}
            className="group flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/90 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Urban Architecture (Geometric Contrast)</span>
            <ArrowRight className="h-3 w-3 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
