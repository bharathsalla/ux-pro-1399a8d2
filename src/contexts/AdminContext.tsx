import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  isAdmin: boolean;
  isCheckingAdmin: boolean;
  verifyAdmin: () => Promise<boolean>;
  exitAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const verifyAdmin = useCallback(async (): Promise<boolean> => {
    setIsCheckingAdmin(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsCheckingAdmin(false);
        return false;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !data) {
        setIsCheckingAdmin(false);
        return false;
      }

      setIsAdmin(true);
      setIsCheckingAdmin(false);
      return true;
    } catch {
      setIsCheckingAdmin(false);
      return false;
    }
  }, []);

  const exitAdminMode = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, isCheckingAdmin, verifyAdmin, exitAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminProvider");
  return ctx;
}
