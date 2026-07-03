import 'react'
import '../App.css'

export default function Landing({ onNavigate = () => {} }) {
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="brand">Pencil Portraits</div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </nav>
        <div className="header-actions">
          <button className="ghost-button">Sign In</button>
          <button className="primary-button" onClick={() => onNavigate('customize')}>Commission a Portrait</button>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-panel" id="home">
          <p className="eyebrow">✏️ Handcrafted pencil portraits</p>
          <h1>Your memories, <span>drawn by hand.</span></h1>
          <p className="hero-copy">
            Commission a bespoke pencil portrait from a skilled Sri Lankan artist.
            Upload a photo, choose your size, and receive a stunning hand-drawn
            artwork — delivered to your door.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('customize')}>Commission Now →</button>
            <button className="secondary-button">View Gallery ↓</button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>200+</strong>
              <span>Portraits delivered</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>Average rating</span>
            </div>
            <div>
              <strong>7–10 Days</strong>
              <span>Turnaround</span>
            </div>
          </div>
        </section>

        <aside className="showcase-panel">
          <div className="showcase-card large-card">
            <div className="card-badge">Family Portrait</div>
            <span className="card-size">A3</span>
          </div>
          <div className="showcase-row">
            <div className="showcase-card medium-card">
              <div className="card-avatar">👤</div>
              <div>
                <strong>Solo</strong>
                <span>A4</span>
              </div>
            </div>
            <div className="showcase-card medium-card alt-card">
              <div className="card-avatar">💑</div>
              <div>
                <strong>Couple</strong>
                <span>A3</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <section className="feature-strip">
        <div>🔒 Secure payments via PayHere</div>
        <div>☁️ Photos on Cloudinary</div>
        <div>📄 Instant PDF invoice</div>
        <div>🔁 2 free revisions</div>
        <div>📦 Island-wide delivery</div>
      </section>

      <section className="process-section" id="how-it-works">
        <p className="section-label">Simple process</p>
        <h2>How it works</h2>
        <div className="process-grid">
          <article className="process-card">
            <div className="process-icon">📸</div>
            <span className="process-step">01</span>
            <h3>Upload Your Photo</h3>
            <p>Submit your reference photo through our secure commission form.</p>
          </article>
          <article className="process-card">
            <div className="process-icon">💳</div>
            <span className="process-step">02</span>
            <h3>Pay &amp; Confirm</h3>
            <p>Pay securely online via PayHere. Receive an instant PDF invoice.</p>
          </article>
          <article className="process-card">
            <div className="process-icon">📈</div>
            <span className="process-step">03</span>
            <h3>Track Progress</h3>
            <p>Watch your portrait come to life on your personal dashboard.</p>
          </article>
          <article className="process-card">
            <div className="process-icon">✅</div>
            <span className="process-step">04</span>
            <h3>Approve &amp; Receive</h3>
            <p>Review the watermarked proof, request changes, then receive your framed portrait.</p>
          </article>
        </div>
      </section>
    </div>
  )
}
