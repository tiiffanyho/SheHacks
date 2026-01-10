import React, { useState } from 'react';
import Home from './pages/Home';
import ReceiptScanner from './pages/ReceiptScanner';
import CollageEditor from './pages/CollageEditor';
import WeeklyView from './pages/WeeklyView';
import './App.css';

type PageType = 'home' | 'scan' | 'collage' | 'weekly';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  return (
    <div className="app">
      <nav className="navbar">
        <h1 onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
          🎨 ReCollect
        </h1>
        <div className="nav-links">
          <button onClick={() => setCurrentPage('scan')}>📸 Scan Receipt</button>
          <button onClick={() => setCurrentPage('collage')}>✨ Collage</button>
          <button onClick={() => setCurrentPage('weekly')}>📅 Collections</button>
        </div>
      </nav>

      <main>
        {currentPage === 'home' && <Home setPage={setCurrentPage} />}
        {currentPage === 'scan' && <ReceiptScanner />}
        {currentPage === 'collage' && <CollageEditor />}
        {currentPage === 'weekly' && <WeeklyView />}
      </main>
    </div>
  );
}

export default App;
