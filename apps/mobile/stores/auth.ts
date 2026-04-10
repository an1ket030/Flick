import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, TasteProfile } from '@flick/types';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  tasteProfile: TasteProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setTasteProfile: (tp: TasteProfile | null) => void;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  tasteProfile: null,
  isLoading: true,
  isOnboarded: false,

  setSession: (session) => {
    set({ session, user: session?.user ?? null, isLoading: false });
  },

  setProfile: (profile) => set({ profile }),

  setTasteProfile: (tasteProfile) => {
    set({
      tasteProfile,
      isOnboarded: (tasteProfile?.onboarding_phase ?? 0) >= 1,
    });
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;

    const [profileRes, tasteRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('taste_profiles').select('*').eq('user_id', user.id).single(),
    ]);

    if (profileRes.data) set({ profile: profileRes.data as Profile });
    if (tasteRes.data) {
      const tp = tasteRes.data as TasteProfile;
      set({ tasteProfile: tp, isOnboarded: tp.onboarding_phase >= 1 });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, tasteProfile: null, isOnboarded: false });
  },
}));
