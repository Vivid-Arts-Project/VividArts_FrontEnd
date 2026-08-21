import { useState } from "react";
import Stepper from "../components/Stepper";
import CommissionHeader from "../components/CommissionHeader";
import Icon from "../components/Icon";
import { showNotification } from "./notifications"; // 💡 1. Notification function එක Import කරගන්න

export default function UploadPhotoPage({ onNext, onBack = () => {}, initialPhotoData = null }) {
  const [photo, setPhoto] = useState(initialPhotoData?.photo ?? null);
  const [preview, setPreview] = useState("original");
  const [previewUrl, setPreviewUrl] = useState(initialPhotoData?.previewUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      const errText = "Only JPG or PNG files are allowed.";
      setError(errText);
      // 💡 Validation Error Toast
      showNotification("error", errText);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      const errText = "File must be under 20MB.";
      setError(errText);
      // 💡 Validation Error Toast
      showNotification("error", errText);
      return;
    }

    setError("");
    setPhoto(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      // 💡 2. Photo එක සාර්ථකව Load වුණාම Success Notification එකක් පෙන්වීම
      showNotification("success", "Photo uploaded successfully!");
    };
    reader.readAsDataURL(file);
  }

  function handleNext() {
    if (!photo) {
      const errText = "Please upload a photo before continuing.";
      setError(errText);
      // 💡 Error Notification
      showNotification("error", errText);
      return;
    }
    onNext({ photo, previewUrl });
  }

  return (
    <div className="soft-navy-violet-bg min-h-screen pb-16 font-sans text-white">
      <div className="mx-auto max-w-[980px] px-[18px] py-7">
        <CommissionHeader onBack={onBack} onHome={onBack} />
        <Stepper current={1} />

      <main>
        <div className="rounded-[18px] bg-white p-7 text-[#1b1830] shadow-xl">
          <h2 className="text-xl font-bold">Reference Photo</h2>
          <p className="mt-1 text-sm text-[#6b6885]">
            Upload a clear, high-res photo for best results
          </p>

          <label
            className={`mt-5 flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed p-6 text-center transition sm:p-12 ${
              isDragging
                ? "border-[#6366f1] bg-[#f3f2ff]"
                : "border-[#c9c6e0] bg-[#fafafe]"
            } ${photo ? "border-solid border-[#6366f1] p-0" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png"
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />

            {previewUrl && preview === "original" ? (
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="block max-h-[520px] w-full object-contain"
              />
            ) : previewUrl && preview === "grayscale" ? (
              <img
                src={previewUrl}
                alt="Grayscale preview"
                className="block max-h-[520px] w-full object-contain grayscale"
              />
            ) : (
              <>
                <span className="upload-photo-float mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-[0_12px_28px_rgba(99,102,241,0.3)]">
                  <Icon name="upload" size={27} />
                </span>
                <strong>Drag &amp; drop your photo here</strong>
                <span className="text-[12.5px] text-[#6b6885]">
                  JPG, PNG · Max 20MB · Min 1000×1000px
                </span>
              </>
            )}
          </label>

          {error && <p className="mt-2 text-sm text-[#e54d4d]">{error}</p>}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                preview === "original"
                  ? "border-[#6366f1] bg-[#ecebff] text-[#6366f1]"
                  : "border-[#e7e5f1] bg-[#f5f4fa] text-[#6b6885]"
              }`}
              onClick={() => setPreview("original")}
            >
              Original photo
            </button>
            <button
              type="button"
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                preview === "grayscale"
                  ? "border-[#6366f1] bg-[#ecebff] text-[#6366f1]"
                  : "border-[#e7e5f1] bg-[#f5f4fa] text-[#6b6885]"
              }`}
              onClick={() => setPreview("grayscale")}
              disabled={!photo}
            >
              Grayscale preview
            </button>
          </div>

          <div className="mt-5 rounded-xl bg-[#f7f6ff] p-4 sm:p-5">
            <h3 className="mb-3 flex items-center gap-2.5 text-[15px] font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ece9ff] text-[#5a3fbb]">
                <Icon name="camera" size={20} />
              </span>
              Photo Tips
            </h3>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-[#3d3959]">
              <li>Clear, well-lit face</li>
              <li>Min 1000px wide</li>
              <li>Front or ¾ angle</li>
              <li>No sunglasses</li>
              <li>No heavy filters</li>
            </ul>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-white"
            style={{ color: "#ffffff" }}
            onClick={handleNext}
          >
            Next: Customize Your Portrait →
          </button>
        </div>
      </main>
      </div>
    </div>
  );
}
