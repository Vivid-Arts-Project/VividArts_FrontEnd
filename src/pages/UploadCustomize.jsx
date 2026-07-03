import { useState } from 'react'
import '../App.css'

export default function UploadCustomize({ onBack, onNext }) {
  const [file, setFile] = useState(null)
  const [grayscaleFile, setGrayscaleFile] = useState(null)
  const [size, setSize] = useState('A3')
  const [frame, setFrame] = useState('Classic')
  const [people, setPeople] = useState(1)

  const basePrice = size === 'A3' ? 3800 : 2500
  const framePrice = frame === 'Classic' ? 800 : frame === 'Premium' ? 1500 : 0
  const peoplePrice = (people - 1) * 500
  const total = basePrice + framePrice + peoplePrice

function onFileChange(e) {
  const selectedFile = e.target.files[0]

  if (!selectedFile) return

  if (file) {
    URL.revokeObjectURL(file)
  }

  const imageUrl = URL.createObjectURL(selectedFile)

  setFile(imageUrl)
  setGrayscaleFile(imageUrl)
}

function removeImage() {
  if (file) {
    URL.revokeObjectURL(file)
  }

  setFile(null)
  setGrayscaleFile(null)
}
  return (
    <div className="customize-root">
      <header className="customize-header">
        <div className="brand">Pencil Portraits</div>
        <nav className="customize-nav">
          <button className="ghost-button" onClick={onBack}>← Back</button>
          <button className="primary-button">My Account</button>
        </nav>
      </header>

      <div className="progress-strip">
        <div className="steps">
          <span className="step active">1</span>
          <span className="step">2</span>
          <span className="step">3</span>
          <span className="step">4</span>
        </div>
        <div className="progress-labels">
          <small>Upload &amp; Customise</small>
        </div>
      </div>

      <main className="customize-main">
        <section className="left-col">
          <div className="panel upload-panel">
            <h3>Reference Photo</h3>
            <p className="muted">Upload a clear, high-res photo for best results</p>
            <label className="dropzone">
              {file ? <img src={file} alt="preview" className="preview-img" /> : (
                <div className="drop-inner">
                  <div className="drop-emoji">🖼️</div>
                  <strong>Drag &amp; drop your photo here</strong>
                  <small>JPG, PNG · Max 20MB · Min 1000×1000px</small>
                  <input type="file" accept="image/*" onChange={onFileChange} />
                </div>
              )}
            </label>

           <div className="grayscale-row">
  <div className="thumb">
    {file ? (
      <>
        <img
          src={file}
          alt="Original"
          className="thumb-image"
        />
        <span>Original photo</span>
      </>
    ) : (
      "Original photo"
    )}
  </div>

  <div className="thumb">
    {grayscaleFile ? (
      <>
        <img
          src={grayscaleFile}
          alt="Grayscale"
          className="thumb-image grayscale"
        />
        <span>Grayscale preview</span>
      </>
    ) : (
      "Grayscale preview"
    )}
  </div>
</div>
          </div>


    {file && (
  <label className="replace-btn">
    Replace Photo
    <input
      type="file"
      accept="image/*"
      onChange={onFileChange}
      style={{ display: 'none' }}
    />
  </label>
)}

{file && (
  <button
    type="button"
    className="remove-btn"
    onClick={removeImage}
  >
    Remove Photo
  </button>
)}
          <div className="panel options-panel">
            <h3>Customise Your Portrait</h3>
            <p className="muted">Price updates in real-time as you choose</p>

            <div className="option-group">
              <label className={`card ${size==='A4' ? 'selected' : ''}`} onClick={() => setSize('A4')}>
                <strong>A4</strong>
                <small>210 × 297 mm</small>
                <div className="price">from LKR 2,500</div>
              </label>
              <label className={`card ${size==='A3' ? 'selected' : ''}`} onClick={() => setSize('A3')}>
                <strong>A3</strong>
                <small>297 × 420 mm</small>
                <div className="price">from LKR 3,800</div>
              </label>
            </div>

            <div className="option-group frames">
              <label className={`frame-card ${frame==='None' ? 'selected' : ''}`} onClick={() => setFrame('None')}>
                <div>No Frame</div>
                <small>Included</small>
              </label>
              <label className={`frame-card ${frame==='Classic' ? 'selected' : ''}`} onClick={() => setFrame('Classic')}>
                <div>Classic</div>
                <small>+ LKR 800</small>
              </label>
              <label className={`frame-card ${frame==='Premium' ? 'selected' : ''}`} onClick={() => setFrame('Premium')}>
                <div>Premium</div>
                <small>+ LKR 1,500</small>
              </label>
            </div>

            <div className="people-row">
              <label>Number of People</label>
              <div className="people-controls">
                <button onClick={() => setPeople(Math.max(1, people-1))}>-</button>
                <div className="people-count">{people}</div>
                <button onClick={() => setPeople(people+1)}>+</button>
                <div className="muted small">× LKR 500 extra</div>
              </div>
            </div>

            <div className="special-instructions">
              <label>Special Instructions (optional)</label>
              <textarea placeholder="E.g. Please focus on the facial expression, soft background..." />
            </div>
          </div>
        </section>

        <aside className="right-col">
          <div className="panel order-panel">
            <h3>Order Summary</h3>
            <div className="order-row"><span>Size</span><strong>{size}</strong></div>
            <div className="order-row"><span>Base Price</span><strong>LKR {basePrice.toLocaleString()}</strong></div>
            <div className="order-row"><span>Frame</span><strong>{frame}{framePrice?` (+${framePrice})`:''}</strong></div>
            <div className="order-row"><span>People</span><strong>{people}{peoplePrice?` (+${peoplePrice})`:''}</strong></div>
            <div className="order-row"><span>Delivery</span><strong>7–10 working days</strong></div>

            <div className="total-box">
              <div>
                <small>Total</small>
                <div className="total">LKR {total.toLocaleString()}</div>
                <small className="muted">50% deposit required to begin</small>
              </div>
            </div>

            <button className="primary-button full" onClick={onNext}>Continue to payment →</button>
          </div>

          <div className="panel tips-panel">
            <h4>📸 Photo Tips</h4>
            <ul>
              <li>Clear, well-lit face</li>
              <li>Min 1000px wide</li>
              <li>Front or ¾ angle</li>
              <li>No sunglasses</li>
              <li>No heavy filters</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  )
}
