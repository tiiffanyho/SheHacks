import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import type { CollageItem, ReceiptData } from '../store';
import { analyzeReceipt } from '../services/gemini';
import '../styles/Home.css';
import '../styles/CollageEditor.css';

const STICKER_FILES = [
  'sticker_5.png', 'sticker_6.png', 'sticker_7.png', 'sticker_8.png',
  'sticker_9.png', 'sticker_10.png', 'sticker_11.png', 'sticker_12.png',
  'sticker_13.png', 'sticker_14.png', 'sticker_15.png', 'sticker_16.png',
  'sticker_17.png', 'sticker_19.png', 'sticker_20.png', 'sticker_21.png',
  'sticker_22.png', 'sticker_23.png', 'sticker_24.png', 'sticker_25.png',
  'sticker_26.png', 'sticker_27.png', 'sticker_28.png', 'sticker_29.png',
  'sticker_30.png', 'sticker_31.png', 'sticker_32.png'
];

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Groceries': '🛒',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Transportation': '🚗',
  'Health': '💊',
  'Utilities': '💡',
  'Other': '📦'
};

export default function Home() {
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { collageItems: items, addCollageItem, updateCollageItem, deleteCollageItem, getTotalSpent } = useStore();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<CollageItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stickerSidebarOpen, setStickerSidebarOpen] = useState(false);
  const [stickerTab, setStickerTab] = useState<'stickers' | 'photos'>('stickers');
  const [photoSidebarOpen, setPhotoSidebarOpen] = useState(false);
  const [drawSidebarOpen, setDrawSidebarOpen] = useState(false);

  // Count images and receipts
  const imageCount = items.filter(i => i.type === 'image' && !i.id.startsWith('receipt-')).length;
  const receiptCount = items.filter(i => i.id.startsWith('receipt-')).length;
  const totalSpent = getTotalSpent();

  // Calculate spending by category
  const spendingByCategory = items
    .filter(item => item.id.startsWith('receipt-') && item.receiptData)
    .reduce((acc, item) => {
      const category = item.receiptData?.category || 'Other';
      acc[category] = (acc[category] || 0) + (item.receiptData?.total || 0);
      return acc;
    }, {} as Record<string, number>);

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsAnalyzing(true);
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageData = event.target?.result as string;
          
          // Add receipt to canvas immediately with loading state
          const itemId = `receipt-${Date.now()}-${Math.random()}`;
          const newItem: CollageItem = {
            id: itemId,
            type: 'image',
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 150,
            rotation: Math.random() * 10 - 5,
            scale: 0.8,
            content: imageData
          };
          addCollageItem(newItem);

          // Analyze with Gemini
          try {
            const receiptData = await analyzeReceipt(imageData);
            updateCollageItem(itemId, { receiptData });
          } catch (error) {
            console.error('Error analyzing receipt:', error);
          }
          setIsAnalyzing(false);
        };
        reader.readAsDataURL(file);
      }
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

  const addSticker = (stickerFile: string) => {
    const newItem: CollageItem = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      rotation: 0,
      scale: 1,
      content: `/stickers/${stickerFile}`
    };
    addCollageItem(newItem);
  };

  const updateItem = (id: string, updates: Partial<CollageItem>) => {
    updateCollageItem(id, updates);
  };

  const deleteItem = (id: string) => {
    deleteCollageItem(id);
    if (selectedReceipt?.id === id) {
      setSelectedReceipt(null);
    }
  };

  const handleReceiptClick = (item: CollageItem) => {
    if (item.id.startsWith('receipt-')) {
      setSelectedReceipt(item);
    }
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
            <button 
              className="upload-icon-btn"
              onClick={() => receiptInputRef.current?.click()}
              disabled={isAnalyzing}
              title="Upload Receipt"
            >
              <img src="/receipt.png" alt="Upload Receipt" className="upload-icon-img" />
            </button>
            <h3>Upload Receipt ({receiptCount})</h3>
            <p>AI will analyze your receipt automatically</p>
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
            <button 
              className="upload-icon-btn"
              onClick={() => photoInputRef.current?.click()}
              title="Add Photos"
            >
              <img src="/photo.png" alt="Add Photos" className="upload-icon-img" />
            </button>
            <h3>Add Photos ({imageCount})</h3>
            <p>Upload any photos to include in your memory collage</p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              hidden
            />
          </div>
        </div>

        {/* Budget Summary */}
        {Object.keys(spendingByCategory).length > 0 && (
          <div className="budget-summary">
            <h4>📊 Spending by Category</h4>
            <div className="category-bars">
              {Object.entries(spendingByCategory).map(([category, amount]) => (
                <div key={category} className="category-bar">
                  <span className="category-label">
                    {CATEGORY_ICONS[category] || '📦'} {category}
                  </span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${Math.min((amount / totalSpent) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="category-amount">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Canvas Section with Sidebars */}
      <div className="canvas-wrapper">
        <div className="canvas-section">
          <h3 className="canvas-title">✦ Your Memory Collage</h3>
          <div 
            ref={canvasRef} 
            className="canvas"
            onClick={(e) => {
              // Deselect when clicking on canvas background (not on items)
              if (e.target === e.currentTarget) {
                setSelectedItem(null);
              }
            }}
          >
            {items.filter(i => !['paperclip', 'smiley'].includes(i.type)).length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <h2>Your Canvas is Empty</h2>
                <p>Start creating your memory collage by adding receipts and photos above</p>
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
                onReceiptClick={() => handleReceiptClick(item)}
              />
            ))}
          </div>
        </div>

        {/* Stickers/Photos Sidebar */}
        <div className={`sidebar stickers-sidebar ${stickerSidebarOpen ? 'open' : ''}`}>
          <button 
            className="sidebar-toggle"
            onClick={() => setStickerSidebarOpen(!stickerSidebarOpen)}
            title="Stickers & Photos"
          >
            <img src="/stickers.png" alt="Stickers" className="sidebar-toggle-img" />
          </button>
          
          {stickerSidebarOpen && (
            <div className="sidebar-content">
              <div className="sidebar-tabs">
                <button 
                  className={`tab-btn ${stickerTab === 'stickers' ? 'active' : ''}`}
                  onClick={() => setStickerTab('stickers')}
                >
                  Stickers
                </button>
                <button 
                  className={`tab-btn ${stickerTab === 'photos' ? 'active' : ''}`}
                  onClick={() => setStickerTab('photos')}
                >
                  Photos
                </button>
              </div>

              {stickerTab === 'stickers' && (
                <div className="sidebar-section">
                  <div className="stickers-grid">
                    {STICKER_FILES.map((file) => (
                      <button 
                        key={file} 
                        className="sticker-btn"
                        onClick={() => {
                          addSticker(file);
                          setStickerSidebarOpen(false);
                        }}
                        title={`Add ${file}`}
                      >
                        <img src={`/stickers/${file}`} alt={file} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {stickerTab === 'photos' && (
                <div className="sidebar-section">
                  {items.filter(i => i.type === 'image' && i.id.startsWith('photo-')).length === 0 ? (
                    <div className="empty-message">No photos uploaded yet</div>
                  ) : (
                    <div className="photos-grid">
                      {items.filter(i => i.type === 'image' && i.id.startsWith('photo-')).map((item) => (
                        <div key={item.id} className="photo-thumbnail">
                          <img src={item.content} alt="Uploaded" />
                          <button 
                            className="add-photo-btn"
                            onClick={() => {
                              addCollageItem({
                                id: `photo-copy-${Date.now()}`,
                                type: 'image',
                                x: 150 + Math.random() * 200,
                                y: 120 + Math.random() * 150,
                                rotation: Math.random() * 10 - 5,
                                scale: 0.8,
                                content: item.content
                              });
                            }}
                            title="Add to canvas"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Draw/Text Sidebar */}
        <div className={`sidebar draw-sidebar ${drawSidebarOpen ? 'open' : ''}`}>
          <button 
            className="sidebar-toggle"
            onClick={() => setDrawSidebarOpen(!drawSidebarOpen)}
            title="Draw & Text"
          >
            <span className="draw-icon">✏️</span>
          </button>
          
          {drawSidebarOpen && (
            <div className="sidebar-content">
              <div className="sidebar-section">
                <div className="draw-tools">
                  <button className="draw-tool-btn">
                    <span>✏️</span>
                    <span>Draw</span>
                  </button>
                  <button className="draw-tool-btn">
                    <span>📝</span>
                    <span>Text</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Details Modal */}
      {selectedReceipt && selectedReceipt.receiptData && (
        <div className="receipt-modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReceipt(null)}>×</button>
            <div className="receipt-modal-content">
              <div className="receipt-preview">
                <img src={selectedReceipt.content} alt="Receipt" />
              </div>
              <div className="receipt-details">
                <h3>{CATEGORY_ICONS[selectedReceipt.receiptData.category]} {selectedReceipt.receiptData.merchant}</h3>
                <div className="receipt-meta">
                  <span className="receipt-date">📅 {selectedReceipt.receiptData.date}</span>
                  <span className="receipt-category">{selectedReceipt.receiptData.category}</span>
                </div>
                <div className="receipt-total">
                  <span>Total</span>
                  <span className="total-amount">${selectedReceipt.receiptData.total.toFixed(2)}</span>
                </div>
                {selectedReceipt.receiptData.items.length > 0 && (
                  <div className="receipt-items">
                    <h4>Items</h4>
                    <ul>
                      {selectedReceipt.receiptData.items.map((item, idx) => (
                        <li key={idx}>
                          <span>{item.name}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="budget-tip">
                  💡 This purchase is {((selectedReceipt.receiptData.total / totalSpent) * 100).toFixed(1)}% of your total spending
                </div>
              </div>
            </div>
          </div>
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
  onReceiptClick: () => void;
}

function CollageItemComponent({ item, selected, onSelect, onUpdate, onDelete, onReceiptClick }: CollageItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1);
  const [initialRotation, setInitialRotation] = useState(0);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const clickStartTime = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isResizing || isRotating) return;
    e.preventDefault();
    onSelect();
    clickStartTime.current = Date.now();
    setIsDragging(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    const clickDuration = Date.now() - clickStartTime.current;
    // If it was a quick click (not a drag), open receipt details
    if (clickDuration < 200 && item.id.startsWith('receipt-')) {
      onReceiptClick();
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    setInitialScale(item.scale);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsRotating(true);
    setInitialRotation(item.rotation);
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
      const handleGlobalMouseUp = () => {
        handleMouseUp();
        setIsDragging(false);
      };
      
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

  React.useEffect(() => {
    if (isRotating && itemRef.current) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const rect = itemRef.current!.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate angle from center to mouse
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const initialAngle = Math.atan2(initialMousePos.y - centerY, initialMousePos.x - centerX) * (180 / Math.PI);
        
        const newRotation = initialRotation + (angle - initialAngle);
        onUpdate({ rotation: newRotation });
      };
      const handleGlobalMouseUp = () => setIsRotating(false);
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isRotating, initialRotation, initialMousePos, onUpdate]);

  const isReceipt = item.id.startsWith('receipt-');

  return (
    <div
      ref={itemRef}
      className={`collage-item ${selected ? 'selected' : ''} ${item.type === 'paperclip' ? 'paperclip-item' : ''} ${item.type === 'smiley' ? 'smiley-item' : ''} ${isReceipt ? 'receipt-item' : ''}`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
        cursor: isRotating ? 'grabbing' : isResizing ? 'nwse-resize' : isDragging ? 'grabbing' : isReceipt ? 'pointer' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {isReceipt && item.receiptData && (
        <div className="receipt-badge">
          ${item.receiptData.total.toFixed(2)}
        </div>
      )}
      <button 
        className="delete-btn" 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        title="Delete"
      >
        ×
      </button>
      <div 
        className="rotate-handle"
        onMouseDown={handleRotateStart}
        title="Rotate"
      >
        ↻
      </div>
      <div 
        className="resize-handle"
        onMouseDown={handleResizeStart}
        title="Resize"
      />
      {item.type === 'sticker' && item.content.startsWith('/') ? (
        <img src={item.content} alt="sticker" className="sticker-image" draggable={false} />
      ) : item.type === 'sticker' ? (
        <span className="sticker-content">{item.content}</span>
      ) : null}
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
