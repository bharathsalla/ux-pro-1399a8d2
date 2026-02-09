import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { FunctionalityResult } from "@/types/functionality";
import FunctionalityReport from "./functionality/FunctionalityReport";

interface FunctionalityFeedbackProps {
  imageBase64?: string;
  imageUrl?: string;
  screenName?: string;
}

const FunctionalityFeedback = ({ imageBase64, imageUrl, screenName }: FunctionalityFeedbackProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FunctionalityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    if (!imageBase64 && !imageUrl) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "audit-functionality",
        {
          body: { imageBase64, imageUrl, screenName },
        }
      );

      if (fnError) throw new Error(fnError.message || "Check failed");
      if (data?.error) throw new Error(data.error);

      setResult(data as FunctionalityResult);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      console.error("Functionality check error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial state — show button to trigger analysis
  if (!result && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="text-lg">🧠</span>
              Functionality Feedback
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Deep product strategy analysis — missing features, workflow gaps &amp; business value.
            </p>
          </div>
          <button
            onClick={runCheck}
            disabled={!imageBase64 && !imageUrl}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze
          </button>
        </div>
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </motion.div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card border border-border p-5">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div>
            <span className="text-sm font-medium text-foreground">Analyzing product functionality...</span>
            <p className="text-xs text-muted-foreground mt-0.5">Evaluating workflows, gaps &amp; enterprise readiness</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return <FunctionalityReport result={result} onRecheck={runCheck} />;
};

export default FunctionalityFeedback;
