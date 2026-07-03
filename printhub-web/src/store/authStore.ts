import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'printhub-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Cart Store
interface CartItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  pageCount: number;
  copies: number;
  colorMode: 'BW' | 'COLOR';
  sides: 'SINGLE' | 'DOUBLE';
  paperSize: string;
  gsm: number;
  binding: string;
  lamination: boolean;
  pageRange?: string;
  price?: number;
}

interface CartState {
  items: CartItem[];
  shopId: number | null;
  shopName: string;
  deliveryType: 'PICKUP' | 'DELIVERY';
  addressId: number | null;
  couponCode: string | null;
  walletAmount: number;
  notes: string;
  addItem: (item: CartItem) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setShop: (shopId: number, shopName: string) => void;
  setDeliveryType: (type: 'PICKUP' | 'DELIVERY') => void;
  setAddressId: (id: number | null) => void;
  setCouponCode: (code: string | null) => void;
  setWalletAmount: (amount: number) => void;
  setNotes: (notes: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  shopId: null,
  shopName: '',
  deliveryType: 'PICKUP',
  addressId: null,
  couponCode: null,
  walletAmount: 0,
  notes: '',
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  clearCart: () => set({
    items: [],
    shopId: null,
    shopName: '',
    deliveryType: 'PICKUP',
    addressId: null,
    couponCode: null,
    walletAmount: 0,
    notes: '',
  }),
  setShop: (shopId, shopName) => set({ shopId, shopName }),
  setDeliveryType: (type) => set({ deliveryType: type }),
  setAddressId: (id) => set({ addressId: id }),
  setCouponCode: (code) => set({ couponCode: code }),
  setWalletAmount: (amount) => set({ walletAmount: amount }),
  setNotes: (notes) => set({ notes }),
}));
