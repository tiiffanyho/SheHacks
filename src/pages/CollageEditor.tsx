import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import type { CollageItem } from '../store';
import '../styles/CollageEditor.css';

const STICKERS = [
  '😊', '🎉', '🍔', '🎂', '☕', '🍕', '💝', '✨', '🌟', '💫', '🎨', '🎭'
];

export default function CollageEditor() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const { collageItems: items, addCollageItem, updateCollageItem, deleteCollageItem } = useStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Count images and receipts
  const imageCount = items.filter(i => i.type === 'image' && !i.id.startsWith('receipt-')).length;
  const receiptCount = items.filter(i => i.id.startsWith('receipt-')).length;

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
    addCollageItem(newItem);
  };

  const addImage = (file: File, isReceipt: boolean = false) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newItem: CollageItem = {
        id: isReceipt ? `receipt-${Date.now()}` : `photo-${Date.now()}`,
        type: 'image',
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 150,
        rotation: Math.random() * 10 - 5,
        scale: 0.8,
        content: e.target?.result as string
      };
      addCollageItem(newItem);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => addImage(file, false));
    }
    e.target.value = '';
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => addImage(file, true));
    }
    e.target.value = '';
  };

  const updateItem = (id: string, updates: Partial<CollageItem>) => {
    updateCollageItem(id, updates);
  };

  const deleteItem = (id: string) => {
    deleteCollageItem(id);
  };

  return (
    <div className="collage-editor-page">
      <div className="collage-sidebar">
        <h3>✦ Add to Canvas</h3>
        
        <div className="sidebar-section">
          <p className="section-label">Receipts ({receiptCount})</p>
          <input
            type="file"
            ref={receiptInputRef}
            onChange={handleReceiptUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <button className="sidebar-btn" onClick={() => receiptInputRef.current?.click()}>
            <span>🧾</span> Upload Receipt
          </button>
        </div>

        <div className="sidebar-section">
          <p className="section-label">Photos ({imageCount})</p>
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            style={{ display: 'none' }}
          />
          <button className="sidebar-btn" onClick={() => imageInputRef.current?.click()}>
            <span>📷</span> Upload Photo
          </button>
        </div>

        <button className="sidebar-btn" onClick={() => addSticker('✨')}>
          <span>📋</span> Add Sticker
        </button>

        <textarea 
          placeholder="Add a note..." 
          className="note-input"
        />

        <button className="sidebar-btn">
          <span>T</span> Add Text
        </button>

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
