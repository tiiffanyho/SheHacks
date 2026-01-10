import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import '../styles/CollageEditor.css';

interface CollageItem {
  id: string;
  type: 'sticker' | 'image' | 'text';
  x: number;
  y: number;
  rotation: number;
  scale: number;
  content: string;
}

const STICKERS = [
  '😊', '🎉', '🍔', '🎂', '☕', '🍕', '💝', '✨', '🌟', '💫', '🎨', '🎭'
];

export default function CollageEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CollageItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const addSticker = (emoji: string) => {
    const newItem: CollageItem = {
      id: Date.now().toString(),
      type: 'sticker',
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      content: emoji
    };
    setItems([...items, newItem]);
  };

  const addImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newItem: CollageItem = {
        id: Date.now().toString(),
        type: 'image',
        x: 50,
        y: 50,
        rotation: 0,
        scale: 1,
        content: e.target?.result as string
      };
      setItems([...items, newItem]);
    };
    reader.readAsDataURL(file);
  };

  const updateItem = (id: string, updates: Partial<CollageItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="collage-editor-page">
      <div className="collage-sidebar">
        <h3>✦ Add to Canvas</h3>
        
        <div className="sidebar-section">
          <p className="section-label">Receipts (0)</p>
        </div>

        <div className="sidebar-section">
          <p className="section-label">Photos (0)</p>
        </div>

        <button className="sidebar-btn">
          <span>📋</span> Add Sticker
        </button>

        <textarea 
          placeholder="Add a note..." 
          className="note-input"
        />

        <button className="sidebar-btn">
          <span>T</span> Add Text
        </button>

        <div className="canvas-controls">
          <p className="section-label">Canvas Controls</p>
          <button className="control-icon-btn">🔍-</button>
          <button className="control-icon-btn">🔍+</button>
        </div>

        <p className="hint">Hold Shift + Drag to pan canvas</p>
      </div>

      <div className="collage-main">
        <div ref={canvasRef} className="canvas">
          {items.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h2>Your Canvas is Empty</h2>
              <p>Start creating your memory collage by adding receipts, photos, stickers, and text from the sidebar</p>
            </div>
          )}
          
          {items.map((item) => (
            <CollageItemComponent
              key={item.id}
              item={item}
              selected={selectedItem === item.id}
              onSelect={() => setSelectedItem(item.id)}
              onUpdate={(updates) => updateItem(item.id, updates)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CollageItemProps {
  item: CollageItem;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CollageItem>) => void;
}

function CollageItemComponent({ item, selected, onSelect, onUpdate }: CollageItemProps) {
  const handleDragEnd = (e: React.DragEvent) => {
    onUpdate({ x: e.clientX - 100, y: e.clientY - 100 });
  };

  return (
    <div
      className={`collage-item ${selected ? 'selected' : ''}`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`
      }}
      draggable
      onDragStart={() => onSelect()}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
    >
      {item.type === 'sticker' && <span className="sticker-content">{item.content}</span>}
      {item.type === 'image' && <img src={item.content} alt="collage item" />}
    </div>
  );
}
