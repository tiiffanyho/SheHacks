import React from 'react';
import { useStore } from '../store';

export default function Dashboard() {
  const memories = useStore((state) => state.memories);
  const total = memories.reduce((sum, m) => sum + m.receiptData.total, 0);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Memories</h3>
          <p className="stat-value">{memories.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <p className="stat-value">${total.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Average Per Receipt</h3>
          <p className="stat-value">${memories.length > 0 ? (total / memories.length).toFixed(2) : '0.00'}</p>
        </div>
      </div>
    </div>
  );
}
