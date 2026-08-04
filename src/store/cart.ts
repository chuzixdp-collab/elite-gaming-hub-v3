'use client';
import { create } from 'zustand';

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  category: string;
  diamonds?: number | null;
  bonusDiamonds?: number | null;
  slug: string;
}

interface CartState {
  product: CartProduct | null;
  lastOrderId: string | null;
  lastOrderNumber: string | null;
  setProduct: (product: CartProduct | null) => void;
  setLastOrder: (orderId: string, orderNumber: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>((set) => ({
  product: null,
  lastOrderId: null,
  lastOrderNumber: null,
  setProduct: (product) => set({ product }),
  setLastOrder: (orderId, orderNumber) => set({ lastOrderId: orderId, lastOrderNumber: orderNumber }),
  clear: () => set({ product: null, lastOrderId: null, lastOrderNumber: null }),
}));
