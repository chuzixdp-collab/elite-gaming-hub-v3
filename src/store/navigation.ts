'use client';
import { create } from 'zustand';

export type ViewName =
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'store'
  | 'checkout'
  | 'order-confirmation'
  | 'tournaments'
  | 'tournament-detail'
  | 'dashboard'
  | 'profile'
  | 'orders'
  | 'notifications'
  | 'wallet'
  | 'prize-claims'
  | 'referral'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-orders'
  | 'admin-payments'
  | 'admin-products'
  | 'admin-tournaments'
  | 'admin-results'
  | 'admin-notifications'
  | 'admin-coupons'
  | 'admin-settings'
  | 'admin-wallet'
  | 'admin-prize-claims'
  | 'admin-referrals'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'refund-policy'
  | 'contact-us';

interface NavigationState {
  view: ViewName;
  params: Record<string, unknown>;
  history: Array<{ view: ViewName; params: Record<string, unknown> }>;
  navigate: (view: ViewName, params?: Record<string, unknown>) => void;
  back: () => void;
  canGoBack: () => boolean;
  scrollY: number;
}

export const useNavigation = create<NavigationState>((set, get) => ({
  view: 'landing',
  params: {},
  history: [],
  scrollY: 0,
  navigate: (view, params = {}) => {
    const state = get();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    set({
      view,
      params,
      history: [...state.history, { view: state.view, params: state.params }].slice(-20),
    });
  },
  back: () => {
    const state = get();
    if (state.history.length === 0) {
      set({ view: 'landing', params: {} });
      return;
    }
    const prev = state.history[state.history.length - 1];
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    set({
      view: prev.view,
      params: prev.params,
      history: state.history.slice(0, -1),
    });
  },
  canGoBack: () => get().history.length > 0,
}));
