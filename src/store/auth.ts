'use client';
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  ffUid: string | null;
  ffNickname: string | null;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  hydrated: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  hydrate: async () => {
    if (get().hydrated) return;
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      set({ user: data.user, loading: false, hydrated: true });
    } catch {
      set({ user: null, loading: false, hydrated: true });
    }
  },
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },
}));
