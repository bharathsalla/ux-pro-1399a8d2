import React, { createContext, useContext, useState, useCallback } from "react";

const ADMIN_PASSCODE = "082708";

interface AdminContextType {
  isAdmin: boolean;
  verifyPasscode: (passcode: string) => boolean;
  exitAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  const verifyPasscode = useCallback((passcode: string): boolean => {
    if (passcode === ADMIN_PASSCODE) {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const exitAdminMode = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, verifyPasscode, exitAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminContext must be used within AdminProvider");
  return ctx;
}
