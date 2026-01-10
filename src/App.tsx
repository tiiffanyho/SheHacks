import React, { useState } from 'react';
import Home from './pages/Home';
import ReceiptScanner from './pages/ReceiptScanner';
import CollageEditor from './pages/CollageEditor';
import WeeklyView from './pages/WeeklyView';
import { useStore } from './store';
import './App.css';

type PageType = 'home' | 'scan' | 'collage' | 'weekly';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
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

      <nav className="navbar">
        <button 
          className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          Upload
        </button>
        <button 
          className={`nav-item ${currentPage === 'scan' ? 'active' : ''}`}
          onClick={() => setCurrentPage('scan')}
        >
          Summary
        </button>
        <button 
          className={`nav-item ${currentPage === 'collage' ? 'active' : ''}`}
          onClick={() => setCurrentPage('collage')}
        >
          Memory Collage
        </button>
      </nav>

      <main className="main-content">
        {currentPage === 'home' && <Home setPage={setCurrentPage} />}
        {currentPage === 'scan' && <ReceiptScanner />}
        {currentPage === 'collage' && <CollageEditor />}
      </main>
    </div>
  );
}

export default App;
