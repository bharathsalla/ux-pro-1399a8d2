import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  avatar_url: string | null;
  auth_provider: string;
  has_submitted_feedback: boolean;
  has_commented: boolean;
  login_count: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as UserProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(p);
  }, [user, fetchProfile]);

  const trackLogin = useCallback(async (userId: string) => {
    // Fetch current count, then increment
    const { data } = await supabase
      .from("profiles")
      .select("login_count")
      .eq("id", userId)
      .single();

    const currentCount = data?.login_count ?? 0;
    
    await supabase
      .from("profiles")
      .update({
        login_count: currentCount + 1,
        last_login_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }, []);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            if (event === "SIGNED_IN") {
              await trackLogin(session.user.id);
            }
            const p = await fetchProfile(session.user.id);
            setProfile(p);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const signUpManual = useCallback(
    async (email: string, password: string, name: string, country: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
            provider: "manual",
          },
        },
      });

      if (error) return { error: error.message };

      // Update the profile with country
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ country, name })
          .eq("id", data.user.id);
      }

      return { error: null };
    },
    []
  );

  const signInManual = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    return { error: null };
  }, []);

  const updateProfileCountry = useCallback(
    async (userId: string, country: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ country })
        .eq("id", userId);

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, country } : prev));
      }
      return { error: error?.message || null };
    },
    []
  );

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    signUpManual,
    signInManual,
    updateProfileCountry,
    refreshProfile,
  };
}
