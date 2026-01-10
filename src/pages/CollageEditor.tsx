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

const BACKGROUNDS = [
  '#ffffff', '#fff5e1', '#e8f5e9', '#e3f2fd', '#f3e5f5', '#fce4ec', '#fff3e0'
];

export default function CollageEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CollageItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [adding, setAdding] = useState<'sticker' | 'image' | null>(null);

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
    setAdding(null);
  };

  const addImage = async (file: File) => {
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

  const exportCollage = () => {
    if (canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = canvasRef.current.offsetWidth;
      canvas.height = canvasRef.current.offsetHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = `collage-${Date.now()}.png`;
        link.click();
      }
    }
  };

  return (
    <div className="collage-editor">
      <h1>Memory Collage</h1>
      
      <div className="editor-toolbar">
        <button onClick={() => setAdding('sticker')} className="btn-primary">🎨 Add Sticker</button>
        <button onClick={() => setAdding('image')} className="btn-primary">📷 Add Image</button>
        <button onClick={exportCollage} className="btn-success">💾 Export</button>
        <div className="background-picker">
          {BACKGROUNDS.map((bg) => (
            <button
              key={bg}
              style={{ backgroundColor: bg }}
              onClick={() => setBackground(bg)}
              className={background === bg ? 'active' : ''}
            />
          ))}
        </div>
      </div>

      {adding === 'sticker' && (
        <div className="sticker-picker">
          {STICKERS.map((sticker) => (
            <button key={sticker} onClick={() => addSticker(sticker)} className="sticker-btn">
              {sticker}
            </button>
          ))}
        </div>
      )}

      {adding === 'image' && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])}
        />
      )}

      <div ref={canvasRef} className="canvas" style={{ backgroundColor: background }}>
        {items.map((item) => (
          <CollageItemComponent
            key={item.id}
            item={item}
            selected={selectedItem === item.id}
            onSelect={() => setSelectedItem(item.id)}
            onUpdate={(updates) => updateItem(item.id, updates)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </div>

      {selectedItem && (
        <div className="item-controls">
          <label>
            Rotation: <input
              type="range"
              min="0"
              max="360"
              value={items.find(i => i.id === selectedItem)?.rotation || 0}
              onChange={(e) => updateItem(selectedItem, { rotation: Number(e.target.value) })}
            />
          </label>
          <label>
            Scale: <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={items.find(i => i.id === selectedItem)?.scale || 1}
              onChange={(e) => updateItem(selectedItem, { scale: Number(e.target.value) })}
            />
          </label>
          <button onClick={() => deleteItem(selectedItem)} className="btn-danger">🗑️ Delete</button>
        </div>
      )}
    </div>
  );
}

interface CollageItemProps {
  item: CollageItem;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CollageItem>) => void;
  onDelete: () => void;
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
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
        cursor: 'grab'
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
