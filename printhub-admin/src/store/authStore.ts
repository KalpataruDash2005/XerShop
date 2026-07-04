import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '@/lib/api';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AdminUser | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setToken: (token) => set({ token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('adminToken');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'printhub-admin-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
