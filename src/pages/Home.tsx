import React, { useRef } from 'react';
import '../styles/Home.css';

interface HomeProps {
  setPage: (page: 'scan' | 'collage') => void;
}

export default function Home({ setPage }: HomeProps) {
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-header">
          <h2>Capture Your Moments</h2>
          <p>Upload receipts to track expenses and turn everyday moments into lasting memories</p>
        </div>

        <div className="upload-cards-container">
          <div className="upload-card">
            <div className="upload-icon">📄</div>
            <h3>Upload Receipt</h3>
            <p>Drag & drop or click to upload receipt photos</p>
            <button 
              className="choose-btn choose-btn-dark"
              onClick={() => receiptInputRef.current?.click()}
            >
              <span>⬆</span> Choose Receipt
            </button>
            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPage('scan');
                }
              }}
              hidden
            />
          </div>

          <div className="upload-card">
            <div className="upload-icon">🖼</div>
            <h3>Add Photos</h3>
            <p>Upload any photos to include in your memory collage</p>
            <button 
              className="choose-btn choose-btn-light"
              onClick={() => photoInputRef.current?.click()}
            >
              <span>⬆</span> Choose Photo
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              hidden
            />
          </div>
        </div>

        <div className="tip">
          <span>💡</span>
          <p>Tip: Take clear photos of your receipts to capture the details of your everyday moments</p>
        </div>
      </div>
    </div>
  );
}
