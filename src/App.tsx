import React from 'react';
import Home from './pages/Home';
import { useStore } from './store';
import './App.css';

function App() {
  const { collageItems, getTotalSpent } = useStore();
  const receiptCount = collageItems.filter(item => item.id.startsWith('receipt-')).length;
  const totalSpent = getTotalSpent();

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
            <span className="stat-value">{receiptCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Spent</span>
            <span className="stat-value">${totalSpent.toFixed(2)}</span>
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
