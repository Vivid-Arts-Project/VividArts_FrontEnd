import { useState } from "react";
import UploadPhotoPage from "./UploadPhotoPage";
import CustomisePage from "./CustomisePage";

/**
 * CommissionFlow
 * Manages the two-step flow:
 *   Step 1 → UploadPhotoPage  (upload reference photo)
 *   Step 2 → CustomisePage    (size, frame, people, notes + order summary)
 *
 * photoData is passed from step 1 to step 2 so the thumbnail
 * and file reference are available on the customise screen.
 */
export default function CommissionFlow({ onBack = () => {} }) {
  const [step, setStep] = useState(1);
  const [photoData, setPhotoData] = useState(null);

  function handlePhotoNext(data) {
    setPhotoData(data);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#0d0c1a] text-white">
        <UploadPhotoPage onNext={handlePhotoNext} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0c1a] text-white">
      <CustomisePage photoData={photoData} onBack={handleBack} />
    </div>
  );
}
