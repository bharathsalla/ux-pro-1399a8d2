import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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

  // Show results with image
  if (result) {
    return (
      <FunctionalityReport
        result={result}
        onRecheck={runCheck}
        imageUrl={imageUrl}
        imageBase64={imageBase64}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-2 border-primary/20 p-6 relative overflow-hidden"
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[shimmer_2s_infinite] pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">AI Analyzing Product Functionality...</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Evaluating workflows, feature gaps, enterprise readiness &amp; business value
            </p>
            <div className="flex gap-2 mt-2">
              {["Workflows", "Features", "Scalability", "Business"].map((label, i) => (
                <span
                  key={label}
                  className="text-[10px] px-2 py-0.5 bg-surface-2 border border-border text-muted-foreground animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Initial CTA state — prominent AI card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden"
      onClick={runCheck}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            Functionality Feedback
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 font-semibold uppercase tracking-wider">
              AI
            </span>
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Deep product strategy analysis — missing features, workflow gaps, enterprise readiness &amp; business value.
          </p>
        </div>
        <button
          disabled={!imageBase64 && !imageUrl}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            runCheck();
          }}
        >
          <Sparkles className="w-4 h-4" />
          Analyze
        </button>
      </div>

      {error && (
        <div className="px-5 pb-4">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </motion.div>
  );
};

export default FunctionalityFeedback;
