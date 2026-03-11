'use client';

import { useEffect, createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  supabaseUser: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Supabase のプロフィールデータを User 型に変換
function mapProfile(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    email: profile.email as string,
    name: profile.name as string,
    avatar_url: profile.avatar_url as string | undefined,
    initial_level: (profile.initial_level ?? 0) as User['initial_level'],
    current_level: (profile.current_level ?? 0) as User['current_level'],
    target_level: (profile.target_level ?? 5) as User['target_level'],
    created_at: profile.created_at as string,
    updated_at: profile.updated_at as string,
    notion_token: profile.notion_token as string | undefined,
    google_token: profile.google_token as string | undefined,
    notion_database_id: profile.notion_database_id as string | undefined,
    google_calendar_id: profile.google_calendar_id as string | undefined,
  };
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setUser = useAppStore((s) => s.setUser);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setProfile(null);
        setUser(null);
        return;
      }

      const mapped = mapProfile(data);
      setProfile(mapped);
      setUser(mapped);
    } catch {
      setProfile(null);
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // 初期セッション取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSupabaseUser(user);
      if (user) {
        fetchProfile(user.id);
      }
      setLoading(false);
    });

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        setSupabaseUser(user);

        if (user) {
          await fetchProfile(user.id);
        } else {
          setProfile(null);
          setUser(null);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, setUser]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setProfile(null);
    setUser(null);
  }, [setUser]);

  const refreshProfile = useCallback(async () => {
    if (supabaseUser) {
      await fetchProfile(supabaseUser.id);
    }
  }, [supabaseUser, fetchProfile]);

  return (
    <AuthContext.Provider value={{ supabaseUser, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
