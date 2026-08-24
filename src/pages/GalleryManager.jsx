import { useCallback, useEffect, useState } from 'react';
import { addGalleryImage, getGalleryImages, removeGalleryImage, reorderGalleryImages, saveGalleryImage } from '../api/adminApi';

const empty = { title: '', subtitle: '', placement: 'gallery', sortOrder: 0, image: null };

export default function GalleryManager({ onToast }) {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', altText: '' });
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

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setImages(reordered);
    try { await reorderGalleryImages(reordered.map(image => image.id)); onToast('Image position updated'); }
    catch (e) { await load(); onToast(e.response?.data?.error || 'Position update failed'); }
  };

  const openEditor = item => {
    setEditing(item);
    setEditForm({ title: item.title || '', subtitle: item.subtitle || '', altText: item.altText || '' });
  };

  const saveText = async event => {
    event.preventDefault();
    if (!editing || busy) return;
    setBusy(true);
    try { await update(editing, editForm); setEditing(null); }
    finally { setBusy(false); }
  };

  return <div className="flex-1 overflow-y-auto p-6">
    <div className="mb-5"><h1 className="font-outfit text-2xl font-bold text-va-text">Website Images</h1><p className="mt-1 text-sm text-va-text3">Manage images shown on the customer home and gallery sections.</p></div>
    <form onSubmit={upload} className="mb-6 grid grid-cols-1 gap-3 rounded-va border border-va-border bg-white p-5 shadow-va md:grid-cols-5">
      <input className="rounded-lg border border-va-border px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/>
      <input className="rounded-lg border border-va-border px-3 py-2 text-sm" placeholder="Description / size" value={form.subtitle} onChange={e => setForm({...form,subtitle:e.target.value})}/>
      <select className="rounded-lg border border-va-border px-3 py-2 text-sm" value={form.placement} onChange={e => setForm({...form,placement:e.target.value})}><option value="gallery">Gallery only</option><option value="home">Homepage only</option><option value="both">Homepage and gallery</option></select>
      <input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setForm({...form,image:e.target.files[0]})} className="text-sm"/>
      <button disabled={busy} className="rounded-lg bg-grad px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Uploading…' : 'Add image'}</button>
    </form>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{images.map((item, index) => <div key={item.id} className="overflow-hidden rounded-va border border-va-border bg-white shadow-va">
      <button type="button" onClick={() => openEditor(item)} className="group relative block w-full cursor-pointer text-left" aria-label={`Edit title and description for ${item.title || 'image'}`}>
        <img src={item.imageUrl} alt={item.altText || item.title} className="h-48 w-full object-cover"/>
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-bold text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">Edit details</span>
      </button>
      <div className="space-y-3 p-4">
        <div><strong className="block text-sm">{item.title}</strong><span className="text-xs text-va-text3">{item.placement} · position {item.sortOrder}</span></div>
        <select aria-label={`Placement for ${item.title}`} className="w-full rounded-lg border border-va-border px-3 py-2 text-xs" value={item.placement} onChange={event => update(item, { placement: event.target.value })}><option value="gallery">Gallery only</option><option value="home">Homepage only</option><option value="both">Homepage and gallery</option></select>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-lg border border-va-border px-3 py-2 text-xs font-semibold disabled:opacity-40">Move up</button>
          <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} className="rounded-lg border border-va-border px-3 py-2 text-xs font-semibold disabled:opacity-40">Move down</button>
          <label className="cursor-pointer rounded-lg border border-va-border px-3 py-2 text-xs font-semibold">Replace<input hidden type="file" accept="image/*" onChange={e => e.target.files[0] && update(item,{image:e.target.files[0]})}/></label>
          <button type="button" onClick={() => openEditor(item)} className="rounded-lg border border-va-border px-3 py-2 text-xs font-semibold">Edit details</button>
          <button type="button" onClick={() => update(item,{isActive:!item.isActive})} className="rounded-lg border border-va-border px-3 py-2 text-xs font-semibold">{item.isActive ? 'Hide' : 'Show'}</button>
          <button type="button" onClick={async () => { if (window.confirm('Remove this image?')) { await removeGalleryImage(item.id); load(); } }} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button>
        </div>
      </div>
    </div>)}</div>
    {editing && <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setEditing(null); }}>
      <form onSubmit={saveText} role="dialog" aria-modal="true" aria-labelledby="gallery-edit-title" className="w-full max-w-lg rounded-va border border-va-border bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><h2 id="gallery-edit-title" className="font-outfit text-xl font-bold text-va-text">Edit image details</h2><p className="mt-1 text-xs text-va-text3">Clear either field if you want to remove that text.</p></div><button type="button" onClick={() => setEditing(null)} className="text-xl text-va-text3" aria-label="Close">×</button></div>
        <img src={editing.imageUrl} alt="" className="mt-4 h-48 w-full rounded-xl object-cover"/>
        <label className="mt-4 block text-xs font-bold text-va-text3">Title<input className="mt-1.5 w-full rounded-lg border border-va-border px-3 py-2.5 text-sm text-va-text" value={editForm.title} onChange={event => setEditForm({...editForm, title: event.target.value})}/></label>
        <label className="mt-3 block text-xs font-bold text-va-text3">Description<input className="mt-1.5 w-full rounded-lg border border-va-border px-3 py-2.5 text-sm text-va-text" value={editForm.subtitle} onChange={event => setEditForm({...editForm, subtitle: event.target.value})}/></label>
        <label className="mt-3 block text-xs font-bold text-va-text3">Alternative text<input className="mt-1.5 w-full rounded-lg border border-va-border px-3 py-2.5 text-sm text-va-text" value={editForm.altText} onChange={event => setEditForm({...editForm, altText: event.target.value})}/></label>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} disabled={busy} className="rounded-lg border border-va-border px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={busy} className="rounded-lg bg-grad px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save changes'}</button></div>
      </form>
    </div>}
  </div>;
}
