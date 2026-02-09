import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  isAdmin: boolean;
  isCheckingAdmin: boolean;
  verifyPasscode: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  exitAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const verifyPasscode = useCallback(async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    setIsCheckingAdmin(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-admin", {
        body: { passcode },
      });

      if (error) {
        setIsCheckingAdmin(false);
        return { success: false, error: "This area is restricted to administrators." };
      }

      if (data?.success) {
        setIsAdmin(true);
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
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, isCheckingAdmin, verifyPasscode, exitAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminProvider");
  return ctx;
}
