import { useState } from "react";
import UploadPhotoPage from "./UploadPhotoPage";
import CustomisePage from "./CustomisePage";
import Payment from "./Payment";

/**
 * CommissionFlow
 * Manages the three-step commission flow:
 *   Step 1 → UploadPhotoPage  (upload reference photo)
 *   Step 2 → CustomisePage    (size, frame, people, notes + order summary)
 *   Step 3 → Payment          (pay the deposit via PayHere)
 *
 * photoData and order are lifted up here so that navigating back and
 * forth between steps doesn't lose what the customer already chose.
 */
export default function CommissionFlow({ onBack = () => {} }) {
  // Same redirect-survives-reload concern as App.jsx: if PayHere just sent
  // us back with ?payment=..., skip straight to the Payment step so it can
  // read the query param and show the confirmation instead of step 1.
  const [step, setStep] = useState(() =>
    new URLSearchParams(window.location.search).has('payment') ? 3 : 1
  );
  const [photoData, setPhotoData] = useState(null);
  const [order, setOrder] = useState(null);

  function handlePhotoNext(data) {
    setPhotoData(data);
    setStep(2);
  }

  function handleCustomiseNext(orderData) {
    setOrder(orderData);
    setStep(3);
  }

  function handlePaymentComplete() {
    setStep(1);
    setPhotoData(null);
    setOrder(null);
    onBack();
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0d0c1a] text-white">
        <UploadPhotoPage initialPhotoData={photoData} onNext={handlePhotoNext} onBack={onBack} />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#0d0c1a] text-white">
        <CustomisePage
          photoData={photoData}
          initialOrder={order}
          onNext={handleCustomiseNext}
          onBack={() => setStep(1)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0c1a] text-white">
      <Payment order={order} onBack={() => setStep(2)} onComplete={handlePaymentComplete} />
    </div>
  );
}
