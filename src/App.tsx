import React from 'react';
import Home from './pages/Home';
import './App.css';

function App() {
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
      </header>

      <main className="main-content">
        <Home />
      </main>
    </div>
  );
}

export default App;
