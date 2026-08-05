import { useState } from "react";
import UploadPhotoPage from "./UploadPhotoPage";
import CustomisePage from "./CustomisePage";
import Payment from "./Payment";
import { clearCommissionDraft, getCommissionDraft, setCommissionOrder, setCommissionPhoto } from "../commissionDraft";
import { useLocation, useNavigate } from "../router";
import { Redirect } from "../RouterComponents";

/**
 * CommissionFlow
 * Manages the three-step commission flow, each step as a real sub-route
 * so the URL and browser back/forward buttons track progress:
 *   /commission/upload    → UploadPhotoPage  (upload reference photo)
 *   /commission/customize → CustomisePage    (size, frame, people, notes + order summary)
 *   /commission/payment   → Payment          (pay the deposit via PayHere)
 *
 * photoData and order are lifted up here (not into the URL) so that
 * navigating back and forth between steps doesn't lose what the
 * customer already chose.
 */
export default function CommissionFlow({ onBack = () => {}, onNavigate = () => {} }) {
  const navigate = useNavigate();
  const path = useLocation().split(/[?#]/, 1)[0];
  const [photoData, setPhotoData] = useState(() => getCommissionDraft().photoData);
  const [order, setOrder] = useState(() => getCommissionDraft().order);

  // If PayHere just redirected back with ?payment=..., land straight on the
  // payment step so it can read the query param and show the confirmation.
  const [isPaymentReturn] = useState(() => new URLSearchParams(window.location.search).has('payment'));
  const defaultStep = isPaymentReturn ? 'payment' : 'upload';

  function handlePhotoNext(data) {
    setPhotoData(data);
    setCommissionPhoto(data);
    navigate('/commission/customize');
  }

  function handleCustomiseNext(orderData) {
    setOrder(orderData);
    setCommissionOrder(orderData);
    navigate('/commission/payment');
  }

  function handlePaymentComplete() {
    setPhotoData(null);
    setOrder(null);
    clearCommissionDraft();
    onBack();
  }

  let page;
  if (path === '/commission' || path === '/commission/') page = <Redirect to={`/commission/${defaultStep}`} replace />;
  else if (path === '/commission/upload') page = <UploadPhotoPage initialPhotoData={photoData} onNext={handlePhotoNext} onBack={onBack} onNavigate={onNavigate}/>;
  else if (path === '/commission/customize') page = photoData
    ? <CustomisePage photoData={photoData} initialOrder={order} onNext={handleCustomiseNext} onBack={() => navigate('/commission/upload')} onNavigate={onNavigate}/>
    : <Redirect to="/commission/upload" replace />;
  else if (path === '/commission/payment') page = order || isPaymentReturn
    ? <Payment order={order} onBack={() => navigate('/commission/customize')} onComplete={handlePaymentComplete} />
    : <Redirect to="/commission/upload" replace />;
  else page = <Redirect to="/commission/upload" replace />;

  return <div className="min-h-screen bg-[#0d0c1a] text-white">{page}</div>;
}