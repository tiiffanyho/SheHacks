import React, { useState } from 'react';
import { useStore } from '../store';
import '../styles/WeeklyView.css';

export default function WeeklyView() {
  const memories = useStore((state) => state.memories);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const getWeekKey = (date: Date) => {
    const monday = new Date(date);
    monday.setDate(date.getDate() - date.getDay() + 1);
    return monday.toISOString().split('T')[0];
  };

  const getMonthKey = (date: Date) => {
    return date.toISOString().split('-').slice(0, 2).join('-');
  };

  const groupedMemories = memories.reduce((acc, memory) => {
    const key = viewMode === 'week' ? getWeekKey(memory.createdAt) : getMonthKey(memory.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(memory);
    return acc;
  }, {} as Record<string, typeof memories>);

  return (
    <div className="weekly-view">
      <h1>Your Memory Collections</h1>
      
      <div className="view-toggle">
        <button
          className={viewMode === 'week' ? 'active' : ''}
          onClick={() => setViewMode('week')}
        >
          Weekly
        </button>
        <button
          className={viewMode === 'month' ? 'active' : ''}
          onClick={() => setViewMode('month')}
        >
          Monthly
        </button>
      </div>

      <div className="collections">
        {Object.entries(groupedMemories).map(([period, items]) => (
          <div key={period} className="collection-period">
            <h2>{new Date(period).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              ...(viewMode === 'month' && { year: 'numeric' })
            })}</h2>
            <div className="memory-grid">
              {items.map((memory) => (
                <div key={memory.id} className="memory-card">
                  <img src={memory.receiptImage} alt="Receipt" />
                  <div className="memory-info">
                    <p className="merchant">{memory.receiptData.merchant}</p>
                    <p className="total">${memory.receiptData.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
