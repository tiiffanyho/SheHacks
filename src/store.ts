import { create } from 'zustand';

export interface Memory {
  id: string;
  receiptImage: string;
  receiptData: {
    items: Array<{ name: string; price: number }>;
    total: number;
    date: string;
    merchant: string;
  };
  createdAt: Date;
  stickers: string[];
  notes: string;
}

export interface ReceiptData {
  total: number;
  merchant: string;
  date: string;
  category: string;
  items: Array<{ name: string; price: number }>;
}

export interface CollageItem {
  id: string;
  type: 'sticker' | 'image' | 'text' | 'paperclip' | 'smiley';
  x: number;
  y: number;
  rotation: number;
  scale: number;
  content: string;
  color?: string;
  receiptData?: ReceiptData;
}

interface Store {
  memories: Memory[];
  collageItems: CollageItem[];
  addMemory: (memory: Memory) => void;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  addCollageItem: (item: CollageItem) => void;
  updateCollageItem: (id: string, updates: Partial<CollageItem>) => void;
  deleteCollageItem: (id: string) => void;
  setCollageItems: (items: CollageItem[]) => void;
  getTotalSpent: () => number;
}

// Initial decorative items
const INITIAL_DECORATIONS: CollageItem[] = [
  { id: 'smiley-1', type: 'smiley', x: 40, y: 30, rotation: -10, scale: 1, content: '☺', color: '#ffb6c1' },
  { id: 'smiley-2', type: 'smiley', x: 500, y: 350, rotation: 15, scale: 1.2, content: '☺', color: '#87ceeb' },
  { id: 'smiley-3', type: 'smiley', x: 550, y: 200, rotation: -5, scale: 0.9, content: '☺', color: '#98d8aa' },
  { id: 'clip-1', type: 'paperclip', x: 520, y: 15, rotation: 20, scale: 1, content: '', color: '#f5a5b8' },
  { id: 'clip-2', type: 'paperclip', x: 30, y: 320, rotation: -15, scale: 1, content: '', color: '#a8d8ea' },
  { id: 'clip-3', type: 'paperclip', x: 60, y: 180, rotation: 5, scale: 1, content: '', color: '#ffd93d' },
];

export const useStore = create<Store>((set, get) => ({
  memories: [],
  collageItems: INITIAL_DECORATIONS,
  addMemory: (memory) => set((state) => ({ 
    memories: [memory, ...state.memories] 
  })),
  deleteMemory: (id) => set((state) => ({ 
    memories: state.memories.filter(m => m.id !== id) 
  })),
  updateMemory: (id, updates) => set((state) => ({
    memories: state.memories.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  addCollageItem: (item) => set((state) => ({
    collageItems: [...state.collageItems, item]
  })),
  updateCollageItem: (id, updates) => set((state) => ({
    collageItems: state.collageItems.map(item => item.id === id ? { ...item, ...updates } : item)
  })),
  deleteCollageItem: (id) => set((state) => ({
    collageItems: state.collageItems.filter(item => item.id !== id)
  })),
  setCollageItems: (items) => set({ collageItems: items }),
  getTotalSpent: () => {
    const items = get().collageItems;
    return items
      .filter(item => item.id.startsWith('receipt-') && item.receiptData)
      .reduce((sum, item) => sum + (item.receiptData?.total || 0), 0);
  }
}));
