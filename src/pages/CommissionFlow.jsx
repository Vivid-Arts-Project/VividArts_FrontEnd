import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import UploadPhotoPage from "./UploadPhotoPage";
import CustomisePage from "./CustomisePage";
import Payment from "./Payment";

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
  const [photoData, setPhotoData] = useState(null);
  const [order, setOrder] = useState(null);

  // If PayHere just redirected back with ?payment=..., land straight on the
  // payment step so it can read the query param and show the confirmation.
  const defaultStep = new URLSearchParams(window.location.search).has('payment') ? 'payment' : 'upload';

  function handlePhotoNext(data) {
    setPhotoData(data);
    navigate('customize');
  }

  function handleCustomiseNext(orderData) {
    setOrder(orderData);
    navigate('payment');
  }

  function handlePaymentComplete() {
    setPhotoData(null);
    setOrder(null);
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
          element={
            <CustomisePage
              photoData={photoData}
              initialOrder={order}
              onNext={handleCustomiseNext}
              onBack={() => navigate('upload')}
              onNavigate={onNavigate}
             />
          }
        />
        <Route
          path="payment"
          element={<Payment order={order} onBack={() => navigate('customize')} onComplete={handlePaymentComplete} />}
        />
      </Routes>
    </div>
  );
}
