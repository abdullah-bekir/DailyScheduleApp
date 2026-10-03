import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getSupabase, getSupabaseConfig } from '../lib/supabaseClient';
import {
  isRegisteredAuthUser,
  normalizeEmail,
  normalizeUsername,
  usernameFromAuthUser,
} from '../utils/authUsername';

const SupabaseContext = createContext(null);

function readUserMeta(user) {
  if (!user) {
    return {
      userId: null,
      username: null,
      userEmail: null,
      isAnonymous: true,
      isRegistered: false,
    };
  }
  const isAnonymous = user.is_anonymous === true;
  const username = usernameFromAuthUser(user);
  const userEmail = typeof user.email === 'string' && user.email.trim() ? user.email.trim() : null;
  return {
    userId: user.id ?? null,
    username,
    userEmail,
    isAnonymous,
    isRegistered: isRegisteredAuthUser(user),
  };
}

export function SupabaseProvider({ children }) {
  const { isConfigured } = useMemo(() => getSupabaseConfig(), []);
  const [authReady, setAuthReady] = useState(!isConfigured);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  const applySession = useCallback((session) => {
    const meta = readUserMeta(session?.user ?? null);
    setUserId(meta.userId);
    setUsername(meta.username);
    setUserEmail(meta.userEmail);
    setIsAnonymous(meta.isAnonymous);
    setIsRegistered(meta.isRegistered);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setAuthReady(true);
      setUserId(null);
      setUsername(null);
      setUserEmail(null);
      setIsAnonymous(true);
      setIsRegistered(false);
      return undefined;
    }

    const sb = getSupabase();
    if (!sb) {
      setAuthReady(true);
      setUserId(null);
      setUsername(null);
      setUserEmail(null);
      setIsAnonymous(true);
      setIsRegistered(false);
      return undefined;
    }

    let cancelled = false;

    const safeApply = (session) => {
      if (cancelled) return;
      applySession(session);
    };

    sb.auth
      .getSession()
      .then(({ data }) => {
        safeApply(data?.session ?? null);
      })
      .catch(() => {
        if (!cancelled) setAuthReady(true);
      });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      safeApply(session);
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [isConfigured, applySession]);

  const signInWithEmail = useCallback(async (rawEmail, password) => {
    const sb = getSupabase();
    if (!sb) {
      const err = new Error('SUPABASE_NOT_CONFIGURED');
      err.code = 'SUPABASE_NOT_CONFIGURED';
      throw err;
    }
    const email = normalizeEmail(rawEmail);
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password: String(password ?? ''),
    });
    if (error) throw error;
    return data;
  }, []);

  const signUpWithEmailAndUsername = useCallback(async (rawUsername, rawEmail, password) => {
    const sb = getSupabase();
    if (!sb) {
      const err = new Error('SUPABASE_NOT_CONFIGURED');
      err.code = 'SUPABASE_NOT_CONFIGURED';
      throw err;
    }
    const name = normalizeUsername(rawUsername);
    const email = normalizeEmail(rawEmail);
    const pwd = String(password ?? '');
    const {
      data: { user },
    } = await sb.auth.getUser();

    if (user?.is_anonymous) {
      const { data, error } = await sb.auth.updateUser({
        email,
        password: pwd,
        data: { username: name },
      });
      if (error) throw error;
      const confirmed = Boolean(data.user?.email_confirmed_at);
      return { data, needsEmailConfirmation: !confirmed };
    }

    const { data, error } = await sb.auth.signUp({
      email,
      password: pwd,
      options: { data: { username: name } },
    });
    if (error) throw error;
    const confirmed = Boolean(data.user?.email_confirmed_at);
    return { data, needsEmailConfirmation: !confirmed };
  }, []);

  const signOutForLogin = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { error } = await sb.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      supabaseConfigured: isConfigured,
      authReady,
      userId,
      username,
      userEmail,
      isAnonymous,
      isRegistered,
      signInWithEmail,
      signUpWithEmailAndUsername,
      signOutForLogin,
    }),
    [
      isConfigured,
      authReady,
      userId,
      username,
      userEmail,
      isAnonymous,
      isRegistered,
      signInWithEmail,
      signUpWithEmailAndUsername,
      signOutForLogin,
    ],
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
