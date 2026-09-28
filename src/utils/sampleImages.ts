import mountainImg from '../assets/images/sample_landscape_mountain_1790551389678.jpg';
import architectureImg from '../assets/images/sample_urban_architecture_1790551402300.jpg';

export async function fetchSampleAsFile(type: 'mountain' | 'architecture'): Promise<File> {
  const url = type === 'mountain' ? mountainImg : architectureImg;
  const fileName = type === 'mountain' ? 'mountain-landscape-alpine.jpg' : 'urban-architecture-facade.jpg';

  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}
