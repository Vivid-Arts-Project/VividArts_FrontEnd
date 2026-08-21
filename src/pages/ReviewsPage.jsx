import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { deleteReview, getReviews, updateReview } from '../api/adminApi';

const FILTERS = [['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']];
const statusClass = status => status === 'approved'
  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
  : status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200';

export default function ReviewsPage({ search = '', onToast = () => {} }) {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [replies, setReplies] = useState({});

  const load = useCallback(async () => {
    try {
      const response = await getReviews(filter);
      setReviews(response.data.reviews || []);
      setReplies(current => ({ ...Object.fromEntries((response.data.reviews || []).map(review => [review.review_id, review.admin_reply || ''])), ...current }));
    } catch { onToast('Unable to load customer reviews'); }
    finally { setLoading(false); }
  }, [filter, onToast]);

  // Fetch persisted moderation data whenever the selected server-side filter changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reviews;
    return reviews.filter(review => [review.title, review.comment, review.customer?.full_name, review.customer?.username, review.customer?.email, review.order_id].some(value => String(value || '').toLowerCase().includes(query)));
  }, [reviews, search]);

  const save = async (review, data, message) => {
    setWorking(review.review_id);
    try {
      await updateReview(review.review_id, data);
      onToast(message);
      await load();
      window.dispatchEvent(new Event('vividarts:admin-notifications'));
    } catch (error) { onToast(error.response?.data?.error || 'Unable to update review'); }
    finally { setWorking(''); }
  };

  const remove = async review => {
    if (!window.confirm(`Delete “${review.title}” permanently?`)) return;
    setWorking(review.review_id);
    try { await deleteReview(review.review_id); onToast('Review deleted'); await load(); }
    catch { onToast('Unable to delete review'); }
    finally { setWorking(''); }
  };

  return (
    <div className="w-full min-w-0 bg-va-bg p-3 sm:p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-va-purple">Social proof</p><h1 className="mt-1 font-outfit text-2xl font-extrabold text-va-text">Verified Customer Reviews</h1><p className="mt-1 text-xs text-va-text3">Approve genuine completed-order feedback and choose the best stories for the homepage.</p></div>
          <div className="flex flex-wrap gap-2">{FILTERS.map(([id, label]) => <button key={id} type="button" onClick={() => { setLoading(true); setFilter(id); }} className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${filter === id ? 'border-va-purple bg-grad text-white shadow-sm' : 'border-va-border bg-white text-va-text2 hover:border-va-border2'}`}>{label}</button>)}</div>
        </div>

        {loading ? <div className="rounded-2xl border border-va-border bg-white px-6 py-16 text-center text-sm text-va-text3">Loading reviews…</div> : visible.length === 0 ? <div className="rounded-2xl border border-dashed border-va-border2 bg-white px-6 py-16 text-center"><Icon name="rating" size={32} className="mx-auto text-va-border2"/><h2 className="mt-3 font-outfit text-lg font-bold text-va-text">No reviews here yet</h2><p className="mt-1 text-xs text-va-text3">Completed-order reviews will appear here for moderation.</p></div> : (
          <div className="grid gap-5 xl:grid-cols-2">
            {visible.map(review => {
              const disabled = working === review.review_id;
              const customerName = review.customer?.full_name || review.customer?.username || 'Customer';
              const product = review.order?.productOption || {};
              return <article key={review.review_id} className="overflow-hidden rounded-2xl border border-va-border bg-white shadow-[0_10px_35px_rgba(28,24,72,.06)]">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-va-border bg-gradient-to-r from-[#f8fbff] to-[#faf7ff] px-5 py-4">
                  <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-grad font-bold text-white">{review.customer?.profile_image_url ? <img src={review.customer.profile_image_url} alt="" className="h-full w-full object-cover"/> : customerName.charAt(0).toUpperCase()}</div><div><strong className="block text-sm text-va-text">{customerName}</strong><span className="text-[11px] text-va-text3">Verified Purchase · {product.paper_size || 'Portrait'}{product.num_subjects ? ` · ${product.num_subjects} subject${product.num_subjects === 1 ? '' : 's'}` : ''}</span></div></div>
                  <span className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase ${statusClass(review.status)}`}>{review.status}</span>
                </div>
                <div className="p-5">
                  <div className="flex gap-1 text-amber-400">{[1,2,3,4,5].map(star => <Icon key={star} name="rating" size={18} className={star <= review.rating ? '' : 'text-gray-200'}/>)}</div>
                  <h2 className="mt-3 font-outfit text-lg font-bold text-va-text">{review.title}</h2><p className="mt-2 text-sm leading-6 text-va-text2">{review.comment}</p>
                  {review.image_url && <a href={review.image_url} target="_blank" rel="noreferrer" className="mt-4 flex h-52 items-center justify-center overflow-hidden rounded-xl border border-va-border bg-va-bg p-2"><img src={review.image_url} alt="Customer review" className="h-full w-full object-contain"/></a>}
                  <div className="mt-4 grid gap-2 text-[11px] text-va-text3 sm:grid-cols-2"><span>Order #{review.order_id?.slice(0, 8)}</span><span className="sm:text-right">Submitted {new Date(review.createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</span></div>
                  <label className="mt-4 block text-xs font-bold text-va-text2">Public reply<textarea rows={2} value={replies[review.review_id] || ''} onChange={event => setReplies(current => ({ ...current, [review.review_id]: event.target.value }))} placeholder="Thank the customer or add a short response…" className="mt-2 w-full resize-y rounded-xl border border-va-border bg-va-bg px-3 py-2.5 text-xs font-normal leading-5 text-va-text outline-none focus:border-va-purple"/></label>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.status !== 'approved' && <button disabled={disabled} onClick={() => save(review, { status: 'approved', adminReply: replies[review.review_id] }, 'Review approved')} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50">Approve</button>}
                    {review.status !== 'rejected' && <button disabled={disabled} onClick={() => save(review, { status: 'rejected', adminReply: replies[review.review_id] }, 'Review rejected')} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50">Reject</button>}
                    <button disabled={disabled} onClick={() => save(review, { adminReply: replies[review.review_id] }, 'Reply saved')} className="rounded-lg border border-va-border bg-white px-4 py-2 text-xs font-bold text-va-text2 transition hover:bg-va-bg disabled:opacity-50">Save reply</button>
                    <button disabled={disabled} onClick={() => remove(review)} className="ml-auto rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"><Icon name="trash" size={14}/></button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
