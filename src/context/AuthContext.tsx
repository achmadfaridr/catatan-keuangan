import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper format username to internal auth email
export const formatUsernameToAuthEmail = (username: string): string => {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  return `${clean}@catatan.local`;
};

export const extractUsername = (user: User | null): string => {
  if (!user) return 'Tamu';
  const metadataName = user.user_metadata?.username || user.user_metadata?.full_name;
  if (metadataName && typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }
  const email = user.email || '';
  if (email.endsWith('@catatan.local')) {
    return email.replace('@catatan.local', '');
  }
  return email.split('@')[0] || 'User';
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  username: string;
  loading: boolean;
  isConfigured: boolean;
  isGuest: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithUsername: (username: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, pass: string) => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('keuangan_guest_mode') === 'true' || !isSupabaseConfigured();
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    // Ambil session saat ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('keuangan_guest_mode');
      }
      setLoading(false);
    });

    // Listen ke perubahan auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        localStorage.removeItem('keuangan_guest_mode');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithUsername = async (identifier: string, pass: string) => {
    if (!supabase) return { error: new Error('Supabase belum dikonfigurasikan.') };
    const clean = identifier.trim().toLowerCase();
    if (!clean) return { error: new Error('Username tidak boleh kosong.') };

    // Support username or standard email (if user used email before)
    const emailToUse = clean.includes('@') ? clean : formatUsernameToAuthEmail(clean);

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: pass,
    });
    if (!error) {
      setAuthModalOpen(false);
      setIsGuest(false);
      localStorage.removeItem('keuangan_guest_mode');
    }
    return { error: error as Error | null };
  };

  const signUpWithUsername = async (usernameInput: string, pass: string) => {
    if (!supabase) return { error: new Error('Supabase belum dikonfigurasikan.') };
    const cleanUsername = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');

    if (cleanUsername.length < 3) {
      return { error: new Error('Username minimal 3 karakter (huruf, angka, titik, atau garis bawah).') };
    }
    if (pass.length < 6) {
      return { error: new Error('Password minimal 6 karakter.') };
    }

    const emailIdentifier = formatUsernameToAuthEmail(cleanUsername);

    const { data, error } = await supabase.auth.signUp({
      email: emailIdentifier,
      password: pass,
      options: {
        data: {
          username: cleanUsername,
          full_name: cleanUsername,
        },
      },
    });

    if (error) {
      return { error: error as Error | null };
    }

    // Pastikan di database public.profiles: email bernilai NULL dan display_name bernilai username
    if (data.user) {
      await (supabase.from('profiles') as any)
        .update({
          email: null,
          display_name: cleanUsername,
        })
        .eq('id', data.user.id);
    }

    setAuthModalOpen(false);
    setIsGuest(false);
    localStorage.removeItem('keuangan_guest_mode');
    return { error: null };
  };

  // Aliases for compatibility
  const signInWithEmail = (email: string, pass: string) => signInWithUsername(email, pass);
  const signUpWithEmail = (email: string, pass: string, name?: string) =>
    signUpWithUsername(name || email.split('@')[0], pass);

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsGuest(true);
    localStorage.setItem('keuangan_guest_mode', 'true');
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('keuangan_guest_mode', 'true');
    setAuthModalOpen(false);
  };

  const currentUsername = extractUsername(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        username: currentUsername,
        loading,
        isConfigured: configured,
        isGuest,
        authModalOpen,
        openAuthModal: () => setAuthModalOpen(true),
        closeAuthModal: () => setAuthModalOpen(false),
        signInWithUsername,
        signUpWithUsername,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
