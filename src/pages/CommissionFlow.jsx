<<<<<<< HEAD
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
=======
>>>>>>> 30555075bab24fc3a5c90727b63e1c8853fa64a8
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
<<<<<<< HEAD
  const location = useLocation();
=======
  const path = useLocation().split(/[?#]/, 1)[0];
>>>>>>> 30555075bab24fc3a5c90727b63e1c8853fa64a8
  const [photoData, setPhotoData] = useState(() => getCommissionDraft().photoData);
  const [order, setOrder] = useState(() => getCommissionDraft().order);

  // If PayHere just redirected back with ?payment=..., land straight on the
  // payment step so it can read the query param and show the confirmation.
  const [isPaymentReturn] = useState(() => new URLSearchParams(window.location.search).has('payment'));
  const defaultStep = isPaymentReturn ? 'payment' : 'upload';

  function handlePhotoNext(data) {
    setPhotoData(data);
    setCommissionPhoto(data);
    // Keep the uploaded photo on the target history entry as well as in the
    // draft. This prevents the customize route guard from redirecting while
    // React is applying the state update during navigation.
    navigate('/commission/customize', { state: { photoData: data } });
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

<<<<<<< HEAD
  const activePhotoData = photoData ?? location.state?.photoData ?? getCommissionDraft().photoData;

  return (
    <div className="min-h-screen bg-[#0d0c1a] text-white">
      <Routes>
        <Route index element={<Navigate to={defaultStep} replace />} />
        <Route
          path="upload"
          element={
            <UploadPhotoPage 
              initialPhotoData={photoData} 
              onNext={handlePhotoNext} 
              onBack={onBack} 
              onNavigate={onNavigate}
            />
          }
        />
        <Route
          path="customize"
          element={activePhotoData ? (
            <CustomisePage
              photoData={activePhotoData}
              initialOrder={order}
              onNext={handleCustomiseNext}
              onBack={() => navigate('/commission/upload')}
              onNavigate={onNavigate}
             />
          ) : (
            <Navigate to="/commission/upload" replace />
          )}
        />
        <Route
          path="payment"
          element={order || isPaymentReturn ? (
            <Payment order={order} onBack={() => navigate('/commission/customize')} onComplete={handlePaymentComplete} />
          ) : (
            <Navigate to="/commission/upload" replace />
          )}
        />
      </Routes>
    </div>
  );
=======
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
>>>>>>> 30555075bab24fc3a5c90727b63e1c8853fa64a8
}
