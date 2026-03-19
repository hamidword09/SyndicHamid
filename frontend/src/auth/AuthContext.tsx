import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

type AppRole = string | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

const getRoleFromUser = (user: User | null | undefined): AppRole => {
  if (!user) return null;
  const anyUser = user as unknown as {
    app_metadata?: { role?: string | null };
    user_metadata?: { role?: string | null };
  };

  return anyUser.app_metadata?.role ?? anyUser.user_metadata?.role ?? null;
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (error) {
        setSession(null);
        setLoading(false);
        return;
      }
      setSession(data.session ?? null);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  const role = useMemo(() => getRoleFromUser(user), [user]);
  const isAdmin = role === 'admin';

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // La session sera mise à jour via onAuthStateChange
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // La session sera mise à jour via onAuthStateChange
  };

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user,
      role,
      isAdmin,
      loading,
      signIn,
      signOut,
    }),
    [session, user, role, isAdmin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

