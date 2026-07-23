import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/api';

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

const setAuthCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'printhub-auth-token=true; path=/; max-age=604800; SameSite=Lax';
  }
};

const clearAuthCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'printhub-auth-token=; path=/; max-age=0; SameSite=Lax';
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, isAuthenticated: true, isLoading: false });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        }
        setAuthCookie();
      },
      logout: () => {
        clearAuthCookie();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },
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
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAuthCookie();
        }
      },
    }
  )
);

useAuthStore.setState({ isLoading: false });
