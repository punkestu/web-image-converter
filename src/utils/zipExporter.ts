import JSZip from 'jszip';
import { ImageItem } from '../types/converter';
import { getExtension } from './imageProcessor';

export async function exportImagesAsZip(items: ImageItem[]): Promise<void> {
  const completed = items.filter((i) => i.status === 'completed' && i.convertedBlob);
  if (completed.length === 0) return;

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of completed) {
    if (!item.convertedBlob) continue;

    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const ext = getExtension(item.settings.format);
    let targetFileName = `${baseName}.${ext}`;

    // Deduplicate filename if multiple files have the same name
    let counter = 1;
    while (usedNames.has(targetFileName)) {
      targetFileName = `${baseName}_${counter}.${ext}`;
      counter++;
    }
    usedNames.add(targetFileName);

    zip.file(targetFileName, item.convertedBlob);
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(zipContent);

  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `PixelShift_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}
