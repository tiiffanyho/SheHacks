import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import type { CollageItem, ReceiptData } from '../store';
import { analyzeReceipt } from '../services/gemini';
import '../styles/Home.css';
import '../styles/CollageEditor.css';

const STICKERS = [
  '😊', '🎉', '🍔', '🎂', '☕', '🍕', '💝', '✨', '🌟',
  '💫', '🎨', '🎭'
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'stickers' | 'photos'>('stickers');
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

  const handleAddSticker = (emoji: string) => {
    const newItem: CollageItem = {
      id: `sticker-${Date.now()}-${Math.random()}`,
      type: 'sticker',
      x: 200 + Math.random() * 150,
      y: 200 + Math.random() * 150,
      rotation: Math.random() * 360,
      scale: 1,
      content: emoji
    };
    addCollageItem(newItem);
  };

  const handleItemDrag = (id: string, newX: number, newY: number) => {
    updateCollageItem(id, { x: newX, y: newY });
  };

  const handleItemScale = (id: string, newScale: number) => {
    updateCollageItem(id, { scale: Math.max(0.3, Math.min(3, newScale)) });
  };

  const handleItemRotate = (id: string, newRotation: number) => {
    updateCollageItem(id, { rotation: newRotation });
  };

  const handleDeleteItem = (id: string) => {
    deleteCollageItem(id);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Memory Collage</h1>
        <p className="text-gray-600">Capture receipts and create your memories</p>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats and Controls - Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Memories</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Photos</span>
                  <span className="text-2xl font-bold text-pink-500">{imageCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Receipts</span>
                  <span className="text-2xl font-bold text-pink-500">{receiptCount}</span>
                </div>
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => receiptInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
              >
                📸 Upload Receipt
              </button>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
              >
                🖼️ Add Photos
              </button>
            </div>

            {/* Budget Summary */}
            {Object.keys(spendingByCategory).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(spendingByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">
                          {CATEGORY_ICONS[category]} {category}
                        </span>
                        <span className="font-semibold text-gray-800">
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-pink-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total Spent</span>
                    <span className="text-2xl font-bold text-pink-500">${totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Area - Main Content */}
          <div className="lg:col-span-3 relative">
            {/* Canvas Container */}
            <div
              ref={canvasRef}
              className="canvas-wrapper relative bg-white rounded-lg shadow-lg overflow-hidden"
              style={{
                height: '600px',
                position: 'relative'
              }}
            >
              {items.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400 text-lg mb-4">Your collage is empty</p>
                    <p className="text-gray-300 text-sm">Upload receipts and photos to get started!</p>
                  </div>
                </div>
              ) : (
                items.map(item => {
                  const isSticker = item.type === 'sticker';
                  const isSelected = selectedItem === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`absolute cursor-move select-none transition-all ${
                        isSelected ? 'ring-2 ring-pink-500' : ''
                      }`}
                      style={{
                        left: `${item.x}px`,
                        top: `${item.y}px`,
                        transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                        zIndex: isSelected ? 100 : 10
                      }}
                    >
                      {isSticker ? (
                        <div
                          className="text-4xl cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(e) => {
                            const startX = e.clientX - item.x;
                            const startY = e.clientY - item.y;
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={(e) => {
                            const newX = e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0);
                            const newY = e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0);
                            handleItemDrag(item.id, newX, newY);
                          }}
                        >
                          {item.content}
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={item.content}
                            alt={item.id}
                            className="object-cover rounded-lg shadow-md max-w-xs cursor-grab active:cursor-grabbing"
                            style={{
                              width: '120px',
                              height: '120px'
                            }}
                            draggable
                            onDragEnd={(e) => {
                              const newX = e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0);
                              const newY = e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0);
                              handleItemDrag(item.id, newX, newY);
                            }}
                          />
                          {item.receiptData && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                              ${item.receiptData.total?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sidebar Toggles - Positioned on Right */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 z-50">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full shadow-lg transition-all"
                title="Toggle Stickers & Photos"
              >
                ✨
              </button>
              <button
                onClick={() => setPhotoSidebarOpen(!photoSidebarOpen)}
                className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full shadow-lg transition-all"
                title="Photo Library"
              >
                🖼️
              </button>
              <button
                onClick={() => setDrawSidebarOpen(!drawSidebarOpen)}
                className="bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full shadow-lg transition-all"
                title="Drawing Tools"
              >
                ✏️
              </button>
            </div>

            {/* Stickers & Photos Sidebar */}
            {sidebarOpen && (
              <div className="sidebar-panel absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg rounded-l-lg border-l border-pink-200 z-40 overflow-y-auto">
                <div className="p-4 border-b border-pink-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Add to Collage</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSidebarTab('stickers')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                        sidebarTab === 'stickers'
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Stickers
                    </button>
                    <button
                      onClick={() => setSidebarTab('photos')}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                        sidebarTab === 'photos'
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Photos
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {sidebarTab === 'stickers' && (
                    <div className="sticker-grid grid grid-cols-4 gap-2">
                      {STICKERS.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAddSticker(emoji)}
                          className="text-3xl hover:scale-110 transition-transform active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {sidebarTab === 'photos' && (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">Recently added photos</p>
                      <div className="photo-grid grid grid-cols-2 gap-2">
                        {items
                          .filter(item => item.type === 'image' && item.id.startsWith('photo-'))
                          .slice(-8)
                          .map(item => (
                            <img
                              key={item.id}
                              src={item.content}
                              alt={item.id}
                              className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => {
                                setSelectedItem(item.id);
                                setSidebarOpen(false);
                              }}
                            />
                          ))}
                      </div>
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full mt-3 bg-pink-100 hover:bg-pink-200 text-pink-700 font-medium py-2 rounded text-sm transition-colors"
                      >
                        Upload More Photos
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Photo Sidebar */}
            {photoSidebarOpen && (
              <div className="sidebar-panel absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg rounded-l-lg border-l border-pink-200 z-40 overflow-y-auto">
                <div className="p-4 border-b border-pink-200">
                  <h3 className="font-semibold text-gray-800">Photo Library</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 text-center py-8">
                    Your photo library will appear here
                  </p>
                </div>
              </div>
            )}

            {/* Draw Sidebar */}
            {drawSidebarOpen && (
              <div className="sidebar-panel absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg rounded-l-lg border-l border-pink-200 z-40 overflow-y-auto">
                <div className="p-4 border-b border-pink-200">
                  <h3 className="font-semibold text-gray-800">Drawing Tools</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 text-center py-8">
                    Drawing tools coming soon!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={receiptInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleReceiptUpload}
        className="hidden"
      />
      <input
        ref={photoInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Loading Indicator */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-800 font-semibold">Analyzing receipt...</p>
          </div>
        </div>
      )}
    </div>
  );
}
