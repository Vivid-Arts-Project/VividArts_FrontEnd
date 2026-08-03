import { useCallback, useEffect, useState } from 'react';
import { addGalleryImage, getGalleryImages, removeGalleryImage, saveGalleryImage } from '../api/adminApi';

const empty = { title: '', subtitle: '', placement: 'gallery', sortOrder: 0, image: null };

export default function GalleryManager({ onToast }) {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => getGalleryImages().then(r => setImages(r.data)).catch(() => onToast('Failed to load website images')), [onToast]);
  useEffect(() => { load(); }, [load]);

  const upload = async (event) => {
    event.preventDefault();
    if (!form.image) return onToast('Select an image first');
    setBusy(true);
    try {
      const data = new FormData(); Object.entries(form).forEach(([key, value]) => value !== null && data.append(key, value));
      await addGalleryImage(data); setForm(empty); await load(); onToast('Website image added');
    } catch (e) { onToast(e.response?.data?.error || 'Image upload failed'); }
    finally { setBusy(false); }
  };

  const update = async (item, values) => {
    const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.append(key, value));
    try { await saveGalleryImage(item.id, data); await load(); onToast('Image updated'); }
    catch (e) { onToast(e.response?.data?.error || 'Update failed'); }
  };

  return <div className="flex-1 overflow-y-auto p-6">
    <div className="mb-5"><h1 className="font-outfit text-2xl font-bold text-va-text">Website Images</h1><p className="mt-1 text-sm text-va-text3">Manage images shown on the customer home and gallery sections.</p></div>
    <form onSubmit={upload} className="mb-6 grid grid-cols-1 gap-3 rounded-va border border-va-border bg-white p-5 shadow-va md:grid-cols-5">
      <input className="rounded-lg border border-va-border px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/>
      <input className="rounded-lg border border-va-border px-3 py-2 text-sm" placeholder="Subtitle / size" value={form.subtitle} onChange={e => setForm({...form,subtitle:e.target.value})}/>
      <select className="rounded-lg border border-va-border px-3 py-2 text-sm" value={form.placement} onChange={e => setForm({...form,placement:e.target.value})}><option value="gallery">Gallery</option><option value="home">Home feature</option></select>
      <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setForm({...form,image:e.target.files[0]})} className="text-sm"/>
      <button disabled={busy} className="rounded-lg bg-grad px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Uploading…' : 'Add image'}</button>
    </form>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{images.map(item => <div key={item.id} className="overflow-hidden rounded-va border border-va-border bg-white shadow-va">
      <img src={item.imageUrl} alt={item.altText || item.title} className="h-48 w-full object-cover"/>
      <div className="space-y-3 p-4">
        <div><strong className="block text-sm">{item.title}</strong><span className="text-xs text-va-text3">{item.placement} · position {item.sortOrder}</span></div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-lg border border-va-border px-3 py-2 text-xs font-semibold">Replace<input hidden type="file" accept="image/*" onChange={e => e.target.files[0] && update(item,{image:e.target.files[0]})}/></label>
          <button onClick={() => update(item,{isActive:!item.isActive})} className="rounded-lg border border-va-border px-3 py-2 text-xs font-semibold">{item.isActive ? 'Hide' : 'Show'}</button>
          <button onClick={async () => { if (window.confirm('Remove this image?')) { await removeGalleryImage(item.id); load(); } }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button>
        </div>
      </div>
    </div>)}</div>
  </div>;
}
