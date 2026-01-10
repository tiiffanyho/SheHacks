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

interface Store {
  memories: Memory[];
  addMemory: (memory: Memory) => void;
  deleteMemory: (id: string) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
}

export const useStore = create<Store>((set) => ({
  memories: [],
  addMemory: (memory) => set((state) => ({ 
    memories: [memory, ...state.memories] 
  })),
  deleteMemory: (id) => set((state) => ({ 
    memories: state.memories.filter(m => m.id !== id) 
  })),
  updateMemory: (id, updates) => set((state) => ({
    memories: state.memories.map(m => m.id === id ? { ...m, ...updates } : m)
  }))
}));
