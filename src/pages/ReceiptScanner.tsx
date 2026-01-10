import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import '../styles/ReceiptScanner.css';

interface ReceiptData {
  items: Array<{ name: string; price: number }>;
  total: number;
  date: string;
  merchant: string;
}

export default function ReceiptScanner() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const addMemory = useStore((state) => state.addMemory);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setPreview(src);
      // Mock receipt data for now
      setReceiptData({
        items: [
          { name: 'Item 1', price: 5.99 },
          { name: 'Item 2', price: 3.49 }
        ],
        total: 9.48,
        date: new Date().toISOString().split('T')[0],
        merchant: 'Local Store'
      });
    };
    reader.readAsDataURL(file);
  };

  const saveMemory = async () => {
    if (receiptData && preview) {
      addMemory({
        id: Date.now().toString(),
        receiptImage: preview,
        receiptData,
        createdAt: new Date(),
        stickers: [],
        notes: ''
      });
      setPreview(null);
      setReceiptData(null);
    }
  };

  return (
    <div className="receipt-scanner">
      <h1>Capture Your Moment</h1>
      {!preview ? (
        <div className="upload-options">
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
            📸 Upload Receipt
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            hidden
          />
        </div>
      ) : (
        <>
          <img src={preview} alt="Receipt" className="preview-image" />

          {receiptData && (
            <div className="receipt-summary">
              <h2>{receiptData.merchant}</h2>
              <p className="date">{receiptData.date}</p>
              <div className="items-list">
                {receiptData.items.map((item, idx) => (
                  <div key={idx} className="item">
                    <span>{item.name}</span>
                    <span className="price">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="total">Total: ${receiptData.total.toFixed(2)}</div>
              <button onClick={saveMemory} className="btn-success">
                ✓ Save Memory
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
