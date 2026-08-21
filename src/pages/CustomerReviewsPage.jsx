import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import BrandLogo from '../components/BrandLogo';
import Icon from '../components/Icon';

export default function CustomerReviewsPage({ onNavigate = () => {} }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = () => {
    setLoading(true);
    setError('');
    api.getPublicReviews()
      .then(setReviews)
      .catch(loadError => setError(loadError.message || 'Unable to load customer reviews.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getPublicReviews()
      .then(setReviews)
      .catch(loadError => setError(loadError.message || 'Unable to load customer reviews.'))
      .finally(() => setLoading(false));
  }, []);

  const average = useMemo(() => reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : '—', [reviews]);

  return (
    <div className="min-h-screen bg-[#090816] font-sans text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0b1f]/90 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex min-h-[66px] max-w-7xl items-center justify-between gap-4">
          <button type="button" onClick={() => onNavigate('landing')} className="group flex min-w-0 items-center gap-3 text-left">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b9afff]/30 bg-white shadow-[0_8px_24px_rgba(93,78,210,.28)] transition group-hover:-translate-y-0.5"><BrandLogo size={43}/></span>
            <span className="hidden sm:block"><strong className="block text-sm tracking-[.12em]">VIVID ARTS</strong><span className="mt-1 block text-[9px] uppercase tracking-[.22em] text-white/40">Customer stories</span></span>
          </button>
          <button type="button" onClick={() => onNavigate('landing')} className="group inline-flex items-center rounded-xl border border-[#a99bff]/45 bg-gradient-to-r from-[#318fe2] to-[#7354d6] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_28px_rgba(79,91,215,.35)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#45a3ef] hover:to-[#8868e7] hover:shadow-[0_14px_34px_rgba(111,87,230,.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8afff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090816]"><Icon name="arrowLeft" size={18} className="mr-2 transition-transform duration-300 group-hover:-translate-x-1"/> Back to home</button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/10 px-5 py-16 sm:px-8 sm:py-20">
          <div className="absolute left-1/2 top-0 h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-[#6d5bff]/15 blur-[125px]"/>
          <div className="relative mx-auto max-w-7xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#a99bff]/20 bg-[#8b5cf6]/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#bdb3ff]"><Icon name="rating" size={14}/> Verified customer reviews</span>
            <h1 className="mx-auto mt-5 max-w-3xl font-outfit text-4xl font-extrabold leading-tight tracking-[-.03em] sm:text-5xl">Portraits people <span className="bg-gradient-to-r from-[#93c5fd] to-[#a78bfa] bg-clip-text text-transparent">treasure.</span></h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#aaa6bd] sm:text-base">Honest feedback from customers whose commissioned portraits were completed by Vivid Arts.</p>
            {!loading && reviews.length > 0 && <div className="mx-auto mt-8 flex w-fit items-center gap-5 rounded-2xl border border-white/10 bg-white/[.045] px-6 py-4"><div className="text-left"><strong className="text-3xl text-white">{average}</strong><div className="mt-1 flex gap-1 text-amber-300">{[1,2,3,4,5].map(star => <Icon key={star} name="rating" size={14}/>)}</div></div><span className="h-11 w-px bg-white/10"/><div className="text-left"><strong className="text-lg">{reviews.length}</strong><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/40">Verified {reviews.length === 1 ? 'review' : 'reviews'}</p></div></div>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          {loading ? <div className="rounded-[24px] border border-white/10 bg-white/[.035] px-6 py-20 text-center text-sm text-white/45">Loading customer stories…</div> : error ? <div className="rounded-[24px] border border-red-400/20 bg-red-500/10 px-6 py-14 text-center"><p className="text-sm text-red-100">{error}</p><button type="button" onClick={loadReviews} className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#17142d]">Try again</button></div> : reviews.length === 0 ? <div className="mx-auto max-w-xl rounded-[26px] border border-dashed border-white/15 bg-white/[.035] px-6 py-16 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1]/25 to-[#9258e8]/25 text-[#bdb3ff] ring-1 ring-white/10"><Icon name="rating" size={30}/></span><h2 className="mt-5 font-outfit text-xl font-bold">Customer stories are coming soon</h2><p className="mt-2 text-sm leading-6 text-white/40">Approved reviews from completed portrait orders will appear here.</p></div> : <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map(review => <article key={review.id} className="group overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#191733] via-[#14122a] to-[#101d31] shadow-[0_24px_70px_rgba(0,0,0,.28)] transition duration-300 hover:-translate-y-1.5 hover:border-[#8e7ce5]/50">
              {review.imageUrl && <a href={review.imageUrl} target="_blank" rel="noreferrer" className="flex h-64 items-center justify-center overflow-hidden border-b border-white/10 bg-black/20 p-3"><img src={review.imageUrl} alt={`Portrait shared by ${review.customerName}`} className="h-full w-full rounded-xl object-contain transition duration-500 group-hover:scale-[1.02]"/></a>}
              <div className="p-6">
                <div className="flex gap-1 text-amber-300">{[1,2,3,4,5].map(star => <Icon key={star} name="rating" size={18} className={star <= review.rating ? '' : 'text-white/15'}/>)}</div>
                <h2 className="mt-4 font-outfit text-xl font-bold">“{review.title}”</h2><p className="mt-2 text-sm leading-6 text-[#aaa6bd]">{review.comment}</p>
                {review.adminReply && <div className="mt-4 rounded-xl border border-white/[.07] bg-white/[.04] px-3.5 py-3 text-xs leading-5 text-white/50"><strong className="text-[#bdb3ff]">Vivid Arts:</strong> {review.adminReply}</div>}
                <div className="mt-6 flex items-center gap-3 border-t border-white/[.08] pt-4"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#6366f1] to-[#9258e8] text-sm font-extrabold">{review.customerAvatar ? <img src={review.customerAvatar} alt="" className="h-full w-full object-cover"/> : review.customerName.charAt(0).toUpperCase()}</div><div className="min-w-0"><strong className="block truncate text-sm">{review.customerName}</strong><span className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300"><Icon name="completed" size={13}/> Verified purchase{review.paperSize ? ` · ${review.paperSize}` : ''}</span></div></div>
              </div>
            </article>)}
          </div>}
        </section>
      </main>
    </div>
  );
}
