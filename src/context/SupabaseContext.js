import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getSupabase, getSupabaseConfig } from '../lib/supabaseClient';

const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const { isConfigured } = useMemo(() => getSupabaseConfig(), []);
  const [authReady, setAuthReady] = useState(!isConfigured);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!isConfigured) {
      setAuthReady(true);
      setUserId(null);
      return undefined;
    }

    const sb = getSupabase();
    if (!sb) {
      setAuthReady(true);
      setUserId(null);
      return undefined;
    }

    let cancelled = false;

    const applySession = (session) => {
      if (cancelled) return;
      setUserId(session?.user?.id ?? null);
      setAuthReady(true);
    };

    sb.auth
      .getSession()
      .then(({ data }) => {
        if (data?.session) {
          applySession(data.session);
        } else {
          return sb.auth.signInAnonymously();
        }
        return null;
      })
      .then((anonRes) => {
        if (cancelled) return;
        if (anonRes?.data?.session) {
          applySession(anonRes.data.session);
        } else if (!anonRes) {
          /* getSession already set */
        } else {
          setAuthReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setAuthReady(true);
      });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
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
