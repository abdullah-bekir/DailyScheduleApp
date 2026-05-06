import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getSupabase, getSupabaseConfig } from '../lib/supabaseClient';

const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const { isConfigured } = useMemo(() => getSupabaseConfig(), []);
  const [authReady, setAuthReady] = useState(!isConfigured);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setAuthReady(true);
      setUserId(null);
      return undefined;
    }

    let cancelled = false;

    const applySession = (session) => {
      setUserId(session?.user?.id ?? null);
    };

    (async () => {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          applySession(session);
          setAuthReady(true);
          return;
        }
        const { data, error } = await sb.auth.signInAnonymously();
        if (cancelled) return;
        if (error) {
          applySession(null);
        } else {
          applySession(data?.session ?? null);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, [isConfigured]);

  const value = useMemo(
    () => ({
      supabaseConfigured: isConfigured,
      authReady,
      userId,
    }),
    [isConfigured, authReady, userId],
  );

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabaseSession() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error('useSupabaseSession must be used within SupabaseProvider');
  }
  return ctx;
}
