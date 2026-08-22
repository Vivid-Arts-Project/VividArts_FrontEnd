import { useEffect, useState } from 'react';
import BrandLogo from '../components/BrandLogo';

export default function GalleryPage({ onNavigate = () => {} }) {
  const [images, setImages] = useState([]);
  const [loadError, setLoadError] = useState('');
  const loadImages = () => fetch('/api/content/gallery?placement=gallery')
    .then(response => {
      if (!response.ok) throw new Error('Unable to load the gallery.');
      return response.json();
    })
    .then(data => { setImages(data); setLoadError(''); })
    .catch(() => setLoadError(navigator.onLine ? 'Unable to load the gallery.' : 'You are offline.'));
  useEffect(() => { loadImages(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0916] font-sans text-[#f5f4fb]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex shrink-0 items-center gap-3">
              <span className="flex h-13 w-14 items-center justify-center rounded-2xl border border-[#b9afff]/30 bg-white shadow-[0_10px_28px_rgba(93,78,210,0.3)]">
                <BrandLogo size={48} />
              </span>
              <span className="hidden sm:block">
                <span className="block text-[17px] font-black tracking-[0.12em] text-white">VIVID ARTS</span>
                <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.26em] text-[#aaa3c9]">Pencil portraits</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold">Gallery</h1>
          </div>
          <button
            onClick={() => onNavigate('landing')}
            className="group shrink-0 rounded-xl border border-[#a99bff]/40 bg-gradient-to-r from-[#397fdd] to-[#7040bd] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(93,78,210,.28)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#4995ee] hover:to-[#8452d2] hover:shadow-[0_12px_30px_rgba(111,87,230,.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a99bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0916]"
          >
            <span className="mr-1.5 inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Back
          </button>
        </div>

        {loadError && <div role="alert" className="mb-5 flex items-center justify-between rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><span>{loadError}</span><button type="button" onClick={loadImages} className="rounded-lg border border-red-300/40 px-3 py-1.5 font-semibold">Retry</button></div>}
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
