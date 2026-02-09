import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface FunctionalityResult {
  verdict: "good" | "bad" | "mixed";
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface FunctionalityFeedbackProps {
  imageBase64?: string;
  imageUrl?: string;
  screenName?: string;
}

const verdictConfig = {
  good: {
    icon: "✅",
    label: "Works Great",
    tagline: "Users will love this",
    bg: "bg-score-high/8",
    border: "border-score-high/25",
    text: "text-score-high",
    accent: "bg-score-high",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--score-high)/0.3)]",
  },
  mixed: {
    icon: "⚠️",
    label: "Needs Work",
    tagline: "Some friction detected",
    bg: "bg-score-medium/8",
    border: "border-score-medium/25",
    text: "text-score-medium",
    accent: "bg-score-medium",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--score-medium)/0.3)]",
  },
  bad: {
    icon: "❌",
    label: "Major Issues",
    tagline: "Users will struggle here",
    bg: "bg-destructive/8",
    border: "border-destructive/25",
    text: "text-destructive",
    accent: "bg-destructive",
    glow: "shadow-[0_0_30px_-5px_hsl(var(--destructive)/0.3)]",
  },
};

const scanSteps = [
  "Analyzing user flow logic...",
  "Checking CTA placement...",
  "Evaluating navigation clarity...",
  "Scanning form structures...",
  "Detecting missing states...",
  "Assessing information architecture...",
];

const FunctionalityFeedback = ({ imageBase64, imageUrl, screenName }: FunctionalityFeedbackProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FunctionalityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"strengths" | "weaknesses" | "recommendations">("weaknesses");

  const runCheck = async () => {
    if (!imageBase64 && !imageUrl) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);

    // Animate through scan steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % scanSteps.length);
    }, 800);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "audit-functionality",
        { body: { imageBase64, imageUrl, screenName } }
      );

      if (fnError) throw new Error(fnError.message || "Check failed");
      if (data?.error) throw new Error(data.error);

      setResult(data as FunctionalityResult);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
      console.error("Functionality check error:", e);
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  // Initial state — prominent CTA card
  if (!result && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-dashed border-primary/30 bg-primary/[0.03] p-6 relative overflow-hidden group hover:border-primary/50 transition-colors"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/40" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40" />

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-shrink-0">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center"
            >
              <span className="text-3xl">⚡</span>
            </motion.div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-foreground mb-1">
              Functionality Check
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Does this screen <span className="text-foreground font-medium">actually work</span> for users? 
              Check flow clarity, CTA placement, navigation, and missing states.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCheck}
            disabled={!imageBase64 && !imageUrl}
            className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Check
          </motion.button>
        </div>
        {error && (
          <p className="text-xs text-destructive mt-3 text-center">{error}</p>
        )}
      </motion.div>
    );
  }

  // Loading state — animated scanning
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-border bg-card p-6 overflow-hidden relative"
      >
        {/* Scanning line animation */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
        />

        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-border border-t-primary"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 border-2 border-primary/20"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              <span className="text-primary">⚡</span>
              Analyzing Functionality
            </h4>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-xs text-muted-foreground font-mono"
              >
                {scanSteps[currentStep]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Mini progress dots */}
          <div className="flex gap-1">
            {scanSteps.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: i <= currentStep ? "hsl(var(--primary))" : "hsl(var(--border))",
                  scale: i === currentStep ? 1.3 : 1,
                }}
                className="w-1.5 h-1.5"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  const config = verdictConfig[result.verdict];

  const tabs = [
    { key: "weaknesses" as const, label: "Issues", icon: "✗", count: result.weaknesses.length, color: "text-destructive" },
    { key: "strengths" as const, label: "Strengths", icon: "✓", count: result.strengths.length, color: "text-score-high" },
    { key: "recommendations" as const, label: "Fixes", icon: "→", count: result.recommendations.length, color: "text-primary" },
  ];

  const activeItems =
    activeTab === "strengths" ? result.strengths :
    activeTab === "weaknesses" ? result.weaknesses :
    result.recommendations;

  const activeColor =
    activeTab === "strengths" ? "text-score-high" :
    activeTab === "weaknesses" ? "text-destructive" :
    "text-primary";

  const activeIcon =
    activeTab === "strengths" ? "✓" :
    activeTab === "weaknesses" ? "✗" :
    "→";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border border-border bg-card overflow-hidden ${config.glow}`}
    >
      {/* Verdict banner */}
      <div className={`${config.bg} border-b ${config.border} px-5 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
              className={`w-12 h-12 ${config.accent} flex items-center justify-center`}
            >
              <span className="text-2xl text-card filter drop-shadow-sm">{config.icon}</span>
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-base font-bold ${config.text}`}>{config.label}</h4>
                <span className={`text-xs font-mono ${config.text} opacity-70`}>
                  {result.score}/100
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{config.tagline}</p>
            </div>
          </div>
          <button
            onClick={runCheck}
            className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 bg-card transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-check
          </button>
        </div>

        {/* Summary */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-foreground leading-relaxed mt-3"
        >
          {result.summary}
        </motion.p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-xs font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
              activeTab === tab.key
                ? "text-foreground bg-card"
                : "text-muted-foreground hover:text-foreground bg-surface-2/50"
            }`}
          >
            <span className={tab.color}>{tab.icon}</span>
            {tab.label}
            <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-mono ${
              activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-surface-2 text-muted-foreground"
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="funcTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.ul
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            {activeItems.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2.5 text-sm text-foreground p-2 bg-surface-2/30 border border-border/50"
              >
                <span className={`${activeColor} mt-0.5 shrink-0 font-bold text-xs`}>
                  {activeIcon}
                </span>
                <span className="leading-relaxed text-xs">{item}</span>
              </motion.li>
            ))}
            {activeItems.length === 0 && (
              <li className="text-xs text-muted-foreground text-center py-4">
                No {activeTab} found
              </li>
            )}
          </motion.ul>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FunctionalityFeedback;
