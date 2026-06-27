import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export type AuthProfile = { display_name: string; avatar_color: string };

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string; alreadyExists?: boolean }>;
  signInGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<AuthProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("display_name, avatar_color")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setProfile(data as AuthProfile);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
    signInEmail: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message };
    },
    signUpEmail: async (email, password, name) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: name },
        },
      });
      if (error) {
        // Detect an existing account so the UI can quietly fall back to sign in
        // instead of showing a jarring error.
        const msg = error.message.toLowerCase();
        const alreadyExists =
          msg.includes("already registered") ||
          msg.includes("already exists") ||
          msg.includes("already in use") ||
          error.status === 422;
        return { error: error.message, alreadyExists };
      }
      // Supabase returns a user with an empty identities array when the email
      // already belongs to a confirmed account (anti-enumeration behaviour).
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        return { alreadyExists: true };
      }
      return {};
    },
    signInGoogle: async () => {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) return { error: result.error.message };
      return {};
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    updateProfile: async (patch) => {
      if (!user) return;
      setProfile((p) => (p ? { ...p, ...patch } : p));
      await supabase.from("profiles").update(patch).eq("id", user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
