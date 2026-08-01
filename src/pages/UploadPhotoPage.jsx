import { useState } from "react";
import Stepper from "../components/Stepper";

export default function UploadPhotoPage({ onNext, onBack = () => {}, onNavigate = () => {}, initialPhotoData = null }) {
  const [photo, setPhoto] = useState(initialPhotoData?.photo ?? null);
  const [preview, setPreview] = useState("original");
  const [previewUrl, setPreviewUrl] = useState(initialPhotoData?.previewUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG or PNG files are allowed.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File must be under 20MB.");
      return;
    }

    setError("");
    setPhoto(file);

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleNext() {
    if (!photo) {
      setError("Please upload a photo before continuing.");
      return;
    }
    onNext({ photo, previewUrl });
  }

  return (
    <div className="min-h-screen bg-[#0d0c1a] pb-16 font-sans text-white">
      <header className="mx-auto flex max-w-[700px] items-center justify-between px-8 pt-7">
        <span className="text-sm font-bold tracking-[0.2em]">PENCIL PORTRAITS</span>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0d0c1a]"
            onClick={onBack}
          >
            ← Back
          </button>
          <button type="button" onClick={() => onNavigate('profile')} className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-[#0d0c1a]">
            My Account
          </button>
        </div>
      </header>

      <div className="mx-auto mt-7 max-w-[700px] px-8">
        <Stepper current={1} />
      </div>

      <main className="mx-auto mt-7 max-w-[700px] px-8">
        <div className="rounded-[18px] bg-white p-7 text-[#1b1830] shadow-xl">
          <h2 className="text-xl font-bold">Reference Photo</h2>
          <p className="mt-1 text-sm text-[#6b6885]">
            Upload a clear, high-res photo for best results
          </p>

          <label
            className={`mt-5 flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed p-12 text-center transition ${
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
                <span className="mb-1 text-3xl">🖼️</span>
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
            <h3 className="mb-3 text-[15px] font-semibold">📸 Photo Tips</h3>
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
            Next: Customise Your Portrait →
          </button>
        </div>
      </main>
    </div>
  );
}
