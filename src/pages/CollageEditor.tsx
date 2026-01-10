import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import '../styles/CollageEditor.css';

interface CollageItem {
  id: string;
  type: 'sticker' | 'image' | 'text' | 'paperclip' | 'smiley';
  x: number;
  y: number;
  rotation: number;
  scale: number;
  content: string;
  color?: string;
}

const STICKERS = [
  '😊', '🎉', '🍔', '🎂', '☕', '🍕', '💝', '✨', '🌟', '💫', '🎨', '🎭'
];

// Initial decorative items
const INITIAL_DECORATIONS: CollageItem[] = [
  { id: 'smiley-1', type: 'smiley', x: 40, y: 30, rotation: -10, scale: 1, content: '☺', color: '#ffb6c1' },
  { id: 'smiley-2', type: 'smiley', x: 500, y: 350, rotation: 15, scale: 1.2, content: '☺', color: '#87ceeb' },
  { id: 'smiley-3', type: 'smiley', x: 550, y: 200, rotation: -5, scale: 0.9, content: '☺', color: '#98d8aa' },
  { id: 'clip-1', type: 'paperclip', x: 520, y: 15, rotation: 20, scale: 1, content: '', color: '#f5a5b8' },
  { id: 'clip-2', type: 'paperclip', x: 30, y: 320, rotation: -15, scale: 1, content: '', color: '#a8d8ea' },
  { id: 'clip-3', type: 'paperclip', x: 60, y: 180, rotation: 5, scale: 1, content: '', color: '#ffd93d' },
];

export default function CollageEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CollageItem[]>(INITIAL_DECORATIONS);
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
          {items.filter(i => !['paperclip', 'smiley'].includes(i.type)).length === 0 && (
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const canvas = (e.target as HTMLElement).closest('.canvas');
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    onUpdate({
      x: e.clientX - canvasRect.left - dragOffset.x,
      y: e.clientY - canvasRect.top - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const canvas = document.querySelector('.canvas');
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        onUpdate({
          x: e.clientX - canvasRect.left - dragOffset.x,
          y: e.clientY - canvasRect.top - dragOffset.y
        });
      };
      const handleGlobalMouseUp = () => setIsDragging(false);
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragOffset, onUpdate]);

  return (
    <div
      className={`collage-item ${selected ? 'selected' : ''} ${item.type === 'paperclip' ? 'paperclip-item' : ''} ${item.type === 'smiley' ? 'smiley-item' : ''}`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {item.type === 'sticker' && <span className="sticker-content">{item.content}</span>}
      {item.type === 'image' && <img src={item.content} alt="collage item" />}
      {item.type === 'smiley' && (
        <span className="smiley-content" style={{ color: item.color }}>{item.content}</span>
      )}
      {item.type === 'paperclip' && (
        <div className="paperclip-shape" style={{ borderColor: item.color }}>
          <div className="paperclip-inner" style={{ borderColor: item.color }}></div>
        </div>
      )}
    </div>
  );
}
