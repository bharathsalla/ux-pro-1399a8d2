import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type PersonaId, type AuditConfig, type AuditResult } from "@/types/audit";

interface UseAuditDesignReturn {
  isLoading: boolean;
  error: string | null;
  result: AuditResult | null;
  runAudit: (imageBase64: string, personaId: PersonaId, config: AuditConfig) => Promise<AuditResult | null>;
}

export function useAuditDesign(): UseAuditDesignReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const runAudit = async (
    imageBase64: string,
    personaId: PersonaId,
    config: AuditConfig
  ): Promise<AuditResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "audit-design",
        {
          body: {
            imageBase64,
            personaId,
            fidelity: config.fidelity,
            purpose: config.purpose,
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Audit failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const auditResult = data as AuditResult;
      setResult(auditResult);
      return auditResult;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      console.error("Audit error:", e);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, result, runAudit };
}
