import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import UploadPhotoPage from "./UploadPhotoPage";
import CustomisePage from "./CustomisePage";
import Payment from "./Payment";
import { clearCommissionDraft, getCommissionDraft, setCommissionOrder, setCommissionPhoto } from "../commissionDraft";

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
  const [photoData, setPhotoData] = useState(() => getCommissionDraft().photoData);
  const [order, setOrder] = useState(() => getCommissionDraft().order);

  // If PayHere just redirected back with ?payment=..., land straight on the
  // payment step so it can read the query param and show the confirmation.
  const isPaymentReturn = new URLSearchParams(window.location.search).has('payment');
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
          element={photoData ? (
            <CustomisePage
              photoData={photoData}
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
}
