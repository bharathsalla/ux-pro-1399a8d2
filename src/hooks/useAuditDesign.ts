import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type PersonaId, type AuditConfig, type AuditResult, type FigmaFrame, type ScreenAuditResult } from "@/types/audit";

interface UseAuditDesignReturn {
  isLoading: boolean;
  error: string | null;
  result: AuditResult | null;
  runAudit: (imageBase64: string, personaId: PersonaId, config: AuditConfig) => Promise<AuditResult | null>;
  runMultiScreenAudit: (
    frames: FigmaFrame[],
    personaId: PersonaId,
    config: AuditConfig,
    onScreenComplete: (index: number, result: ScreenAuditResult) => void
  ) => Promise<void>;
}

const CONCURRENCY = 3;

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const index = nextIndex++;
      results[index] = await tasks[index]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
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

      if (fnError) throw new Error(fnError.message || "Audit failed");
      if (data?.error) throw new Error(data.error);

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

  const runMultiScreenAudit = async (
    frames: FigmaFrame[],
    personaId: PersonaId,
    config: AuditConfig,
    onScreenComplete: (index: number, result: ScreenAuditResult) => void
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const auditOneScreen = (frame: FigmaFrame, index: number) => async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "audit-design",
          {
            body: {
              imageUrl: frame.imageUrl,
              personaId,
              fidelity: config.fidelity,
              purpose: config.purpose,
              screenName: frame.name,
            },
          }
        );

        if (fnError) throw new Error(fnError.message || "Audit failed");
        if (data?.error) throw new Error(data.error);

        onScreenComplete(index, {
          screenName: frame.name,
          screenImageUrl: frame.imageUrl,
          result: data as AuditResult,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to audit screen";
        console.error(`Audit error for frame "${frame.name}":`, e);
        onScreenComplete(index, {
          screenName: frame.name,
          screenImageUrl: frame.imageUrl,
          result: null,
          error: message,
        });
      }
    };

    const tasks = frames.map((frame, index) => auditOneScreen(frame, index));
    await runWithConcurrency(tasks, CONCURRENCY);

    setIsLoading(false);
  };

  return { isLoading, error, result, runAudit, runMultiScreenAudit };
}
