import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import type { CollageItem } from '../store';
import '../styles/Home.css';
import '../styles/CollageEditor.css';

const STICKERS = [
  '😊', '🎉', '🍔', '🎂', '☕', '🍕', '💝', '✨', '🌟', '💫', '🎨', '🎭'
];

export default function Home() {
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { collageItems: items, addCollageItem, updateCollageItem, deleteCollageItem } = useStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Count images and receipts
  const imageCount = items.filter(i => i.type === 'image' && !i.id.startsWith('receipt-')).length;
  const receiptCount = items.filter(i => i.id.startsWith('receipt-')).length;

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newItem: CollageItem = {
            id: `receipt-${Date.now()}-${Math.random()}`,
            type: 'image',
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 150,
            rotation: Math.random() * 10 - 5,
            scale: 0.8,
            content: event.target?.result as string
          };
          addCollageItem(newItem);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newItem: CollageItem = {
            id: `photo-${Date.now()}-${Math.random()}`,
            type: 'image',
            x: 150 + Math.random() * 200,
            y: 120 + Math.random() * 150,
            rotation: Math.random() * 10 - 5,
            scale: 0.8,
            content: event.target?.result as string
          };
          addCollageItem(newItem);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const addSticker = (emoji: string) => {
    const newItem: CollageItem = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      rotation: 0,
      scale: 1,
      content: emoji
    };
    addCollageItem(newItem);
  };

  const updateItem = (id: string, updates: Partial<CollageItem>) => {
    updateCollageItem(id, updates);
  };

  const deleteItem = (id: string) => {
    deleteCollageItem(id);
  };

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-header">
          <h2>Capture Your Moments</h2>
          <p>Upload receipts and photos to create your memory collage</p>
        </div>

        <div className="upload-cards-container">
          <div className="upload-card">
            <div className="upload-icon">📄</div>
            <h3>Upload Receipt ({receiptCount})</h3>
            <p>Drag & drop or click to upload receipt photos</p>
            <button 
              className="choose-btn choose-btn-dark"
              onClick={() => receiptInputRef.current?.click()}
            >
              Choose Receipt
            </button>
            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleReceiptUpload}
              hidden
            />
          </div>

          <div className="upload-card">
            <div className="upload-icon">🖼</div>
            <h3>Add Photos ({imageCount})</h3>
            <p>Upload any photos to include in your memory collage</p>
            <button 
              className="choose-btn choose-btn-light"
              onClick={() => photoInputRef.current?.click()}
            >
              Choose Photo
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              hidden
            />
          </div>

          <div className="upload-card">
            <div className="upload-icon">✨</div>
            <h3>Add Stickers</h3>
            <p>Decorate your collage with fun stickers</p>
            <div className="sticker-grid">
              {STICKERS.slice(0, 6).map((emoji) => (
                <button 
                  key={emoji} 
                  className="sticker-btn-small"
                  onClick={() => addSticker(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Section */}
      <div className="canvas-section">
        <h3 className="canvas-title">✦ Your Memory Collage</h3>
        <div ref={canvasRef} className="canvas">
          {items.filter(i => !['paperclip', 'smiley'].includes(i.type)).length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h2>Your Canvas is Empty</h2>
              <p>Start creating your memory collage by adding receipts, photos, and stickers above</p>
            </div>
          )}
          
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
      </div>
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

function CollageItemComponent({ item, selected, onSelect, onUpdate, onDelete }: CollageItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isResizing) return;
    e.preventDefault();
    onSelect();
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    setInitialScale(item.scale);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
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

  React.useEffect(() => {
    if (isResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;
        const delta = (deltaX + deltaY) / 2;
        const newScale = Math.max(0.2, Math.min(3, initialScale + delta / 100));
        onUpdate({ scale: newScale });
      };
      const handleGlobalMouseUp = () => setIsResizing(false);
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isResizing, initialScale, initialMousePos, onUpdate]);

  return (
    <div
      className={`collage-item ${selected ? 'selected' : ''} ${item.type === 'paperclip' ? 'paperclip-item' : ''} ${item.type === 'smiley' ? 'smiley-item' : ''}`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
        cursor: isResizing ? 'nwse-resize' : isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <button 
        className="delete-btn" 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete"
      >
        ×
      </button>
      <div 
        className="resize-handle"
        onMouseDown={handleResizeStart}
        title="Resize"
      />
      {item.type === 'sticker' && <span className="sticker-content">{item.content}</span>}
      {item.type === 'image' && <img src={item.content} alt="collage item" draggable={false} />}
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
