'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';

/**
 * Initialise auth state on mount — calls the auth store's `hydrate()`
 * which fetches `/api/auth/me` and populates `user`.
 */
export function useAuthInit() {
  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
}

export function useRequireAuth() {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  return { user, loading, isAuthed: !!user };
}

export function useRequireAdmin() {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  return { user, loading, isAdmin: user?.role === 'ADMIN' };
}
