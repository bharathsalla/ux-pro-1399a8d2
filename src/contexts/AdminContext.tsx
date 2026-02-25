import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  isAdmin: boolean;
  isCheckingAdmin: boolean;
  adminToken: string | null;
  verifyPasscode: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  exitAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  // Store the HMAC-signed session token (not the passcode) for admin API calls
  // Token is time-limited (30 min) and verified server-side via cryptographic signature
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const verifyPasscode = useCallback(async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    setIsCheckingAdmin(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-admin", {
        body: { passcode },
      });

      if (error) {
        setIsCheckingAdmin(false);
        return { success: false, error: "Invalid passcode. Please try again." };
      }

      if (data?.success && data?.token) {
        setIsAdmin(true);
        setAdminToken(data.token);
        setIsCheckingAdmin(false);
        return { success: true };
      }

      setIsCheckingAdmin(false);
      return { success: false, error: data?.error || "This area is restricted to administrators." };
    } catch {
      setIsCheckingAdmin(false);
      return { success: false, error: "Verification failed. Please try again." };
    }
  }, []);

  const exitAdminMode = useCallback(() => {
    setIsAdmin(false);
    setAdminToken(null);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, isCheckingAdmin, adminToken, verifyPasscode, exitAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminProvider");
  return ctx;
}
