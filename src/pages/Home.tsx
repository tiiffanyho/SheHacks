import React from 'react';
import '../styles/Home.css';

interface HomeProps {
  setPage: (page: 'scan' | 'collage' | 'weekly') => void;
}

export default function Home({ setPage }: HomeProps) {
  return (
    <div className="home">
      <section className="hero">
        <h2>Capture Your Everyday Moments</h2>
        <p>Transform receipts into treasured memories. Collect, create, and celebrate the little moments that make up your life.</p>
        
        <div className="cta-buttons">
          <button className="btn-primary btn-large" onClick={() => setPage('scan')}>
            📸 Start Scanning
          </button>
          <button className="btn-secondary btn-large" onClick={() => setPage('weekly')}>
            📅 View Collections
          </button>
        </div>
      </section>

      <section className="features">
        <h3>How It Works</h3>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">📸</span>
            <h4>Scan Receipts</h4>
            <p>Upload or capture photos of your receipts. Our AI reads and summarizes your spending.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">💰</span>
            <h4>Expense Tracking</h4>
            <p>Get instant summaries of your purchases and spending patterns by week or month.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✨</span>
            <h4>Create Stickers</h4>
            <p>Turn receipts into beautiful stickers to make them more memorable and collectible.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎨</span>
            <h4>Build Collages</h4>
            <p>Drag and drop stickers, images, and designs onto an interactive whiteboard canvas.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📷</span>
            <h4>Add Photos</h4>
            <p>Upload any photos to mix with your stickers for a complete visual story.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📅</span>
            <h4>Collections</h4>
            <p>View your memories organized by week or month to see your story unfold.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
