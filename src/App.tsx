import React, { useState } from 'react';
import Home from './pages/Home';
import { useStore } from './store';
import './App.css';

function App() {
  const memories = useStore((state) => state.memories);
  const total = memories.reduce((sum, m) => sum + m.receiptData.total, 0);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <img src="/logo.png" alt="ReceiptJars" className="logo-image" />
            <div>
              <h1>ReceiptJars</h1>
              <p>Turn everyday moments into lasting memories</p>
            </div>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Receipts</span>
            <span className="stat-value">{memories.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">${total.toFixed(2)}</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Home />
      </main>
    </div>
  );
}

export default App;
