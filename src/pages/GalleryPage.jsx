import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import BrandLogo from '../components/BrandLogo';

export default function GalleryPage({ onNavigate = () => {} }) {
  const [images, setImages] = useState([]);
  useEffect(() => {
    fetch('/api/content/gallery').then(r => r.ok ? r.json() : []).then(setImages).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0916] font-sans text-[#f5f4fb]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('landing')} className="rounded-md border border-white/10 bg-white/[.03] px-3 py-2 text-sm text-white">← Back</button>
            <h1 className="ml-3 text-2xl font-bold">Gallery</h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <BrandLogo size={36} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <figure key={img.id} className="group relative overflow-hidden rounded-[14px] border border-white/10 bg-[#0f0e1d]">
              <img src={img.imageUrl} alt={img.altText || img.title} className="h-60 w-full object-cover transition duration-500 group-hover:scale-105" />
              <figcaption className="p-4">
                <strong className="block text-sm">{img.title}</strong>
                {img.subtitle && <span className="text-xs text-white/60">{img.subtitle}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
