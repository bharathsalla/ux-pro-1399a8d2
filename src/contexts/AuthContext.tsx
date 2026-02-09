import React, { createContext, useContext } from "react";
import { useAuth, type UserProfile } from "@/hooks/useAuth";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";
import type { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signUpManual: (email: string, password: string, name: string, country: string) => Promise<{ error: string | null }>;
  signInManual: (email: string, password: string) => Promise<{ error: string | null }>;
  updateProfileCountry: (userId: string, country: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const handleInactivityTimeout = React.useCallback(async () => {
    if (auth.user) {
      toast.info("Session expired due to inactivity. Please log in again.");
      await auth.signOut();
    }
  }, [auth.user, auth.signOut]);

  useInactivityTimer(handleInactivityTimeout, !!auth.user);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
