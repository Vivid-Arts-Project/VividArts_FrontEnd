import { useEffect, useState } from 'react';
import CustomerHeader from '../components/CustomerHeader';

export default function GalleryPage({ onNavigate = () => {} }) {
  const [images, setImages] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const loadImages = () => fetch('/api/content/gallery?placement=gallery')
    .then(response => {
      if (!response.ok) throw new Error('Unable to load the gallery.');
      return response.json();
    })
    .then(data => { setImages(data); setLoadError(''); })
    .catch(() => setLoadError(navigator.onLine ? 'Unable to load the gallery.' : 'You are offline.'));
  useEffect(() => { loadImages(); }, []);
  useEffect(() => {
    if (!selectedImage) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = event => { if (event.key === 'Escape') setSelectedImage(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', closeOnEscape); };
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-[#0a0916] font-sans text-[#f5f4fb]">
      <CustomerHeader onNavigate={onNavigate} active="gallery"/>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a99bff]">Portrait collection</p>
          <h1 className="mt-2 text-3xl font-bold">Gallery</h1>
        </div>

        {loadError && <div role="alert" className="mb-5 flex items-center justify-between rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"><span>{loadError}</span><button type="button" onClick={loadImages} className="rounded-lg border border-red-300/40 px-3 py-1.5 font-semibold">Retry</button></div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <figure key={img.id} className="group relative overflow-hidden rounded-[14px] border border-white/10 bg-[#0f0e1d]">
              <button type="button" onClick={() => setSelectedImage(img)} className="block w-full cursor-zoom-in overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a99bff]" aria-label={`View ${img.title || 'portrait'} full screen`}>
                <img src={img.imageUrl} alt={img.altText || img.title} className="h-60 w-full object-cover transition duration-500 group-hover:scale-105" />
              </button>
              <figcaption className="p-4">
                <strong className="block text-sm">{img.title}</strong>
                {img.subtitle && <span className="text-xs text-white/60">{img.subtitle}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </main>
      {selectedImage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label={selectedImage.title || 'Full-screen gallery image'} onMouseDown={event => { if (event.target === event.currentTarget) setSelectedImage(null); }}>
          <button type="button" onClick={() => setSelectedImage(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-2xl text-white transition hover:bg-white/15" aria-label="Close full-screen image">×</button>
          <figure className="flex max-h-full max-w-6xl flex-col items-center">
            <img src={selectedImage.imageUrl} alt={selectedImage.altText || selectedImage.title} className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"/>
            {(selectedImage.title || selectedImage.subtitle) && <figcaption className="mt-4 text-center"><strong className="block text-base text-white">{selectedImage.title}</strong>{selectedImage.subtitle && <span className="mt-1 block text-sm text-white/60">{selectedImage.subtitle}</span>}</figcaption>}
          </figure>
        </div>
      )}
    </div>
  );
}
