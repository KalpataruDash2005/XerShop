import { create } from 'zustand';
import { User } from '@/src/types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// Cart Store for print configuration
interface CartItem {
  id: string;
  fileName: string;
  fileUri: string;
  pageCount: number;
  copies: number;
  colorMode: 'BW' | 'COLOR';
  sides: 'SINGLE' | 'DOUBLE';
  paperSize: string;
  gsm: number;
  binding: string;
  lamination: boolean;
}

interface CartState {
  items: CartItem[];
  shopId: number | null;
  shopName: string;
  addItem: (item: CartItem) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setShop: (shopId: number, shopName: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  shopId: null,
  shopName: '',
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ),
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  clearCart: () => set({ items: [], shopId: null, shopName: '' }),
  setShop: (shopId, shopName) => set({ shopId, shopName }),
}));
