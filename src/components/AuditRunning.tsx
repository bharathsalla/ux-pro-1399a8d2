import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";

interface AuditRunningProps {
  personaId: PersonaId;
  onComplete: () => void;
}

const uxRules = [
  { id: "H1", name: "Visibility of System Status", category: "Nielsen" },
  { id: "H2", name: "Match Between System & World", category: "Nielsen" },
  { id: "H3", name: "User Control & Freedom", category: "Nielsen" },
  { id: "H4", name: "Consistency & Standards", category: "Nielsen" },
  { id: "H5", name: "Error Prevention", category: "Nielsen" },
  { id: "F1", name: "Fitts's Law", category: "Motor" },
  { id: "F2", name: "Hick's Law", category: "Cognitive" },
  { id: "G1", name: "Gestalt Proximity", category: "Visual" },
  { id: "G2", name: "Gestalt Similarity", category: "Visual" },
  { id: "A1", name: "WCAG Contrast (4.5:1)", category: "A11y" },
  { id: "A2", name: "Touch Target (44px)", category: "A11y" },
  { id: "V1", name: "Typography Hierarchy", category: "Visual" },
  { id: "V2", name: "Color Harmony", category: "Visual" },
  { id: "V3", name: "Whitespace Balance", category: "Layout" },
  { id: "C1", name: "Cognitive Load", category: "Cognitive" },
  { id: "C2", name: "Information Scent", category: "Cognitive" },
];

const checksByPersona: Record<PersonaId, string[]> = {
  solo: [
    "Checking auto layout usage...",
    "Analyzing 8pt grid alignment...",
    "Validating font size hierarchy...",
    "Checking button consistency...",
    "Measuring contrast ratios...",
    "Verifying grid alignment...",
    "Detecting spacing misalignments...",
    "Scanning component detachment...",
  ],
  lead: [
    "Scanning naming conventions...",
    "Checking component detachment...",
    "Analyzing padding consistency...",
    "Validating typography scale...",
    "Auditing design token usage...",
    "Cross-frame consistency check...",
    "Generating quality breakdown...",
    "Building feedback report...",
  ],
  a11y: [
    "WCAG 2.1 contrast check (4.5:1)...",
    "Touch target validation (44px)...",
    "Scanning text under 12px...",
    "Color-only meaning detection...",
    "Focus state verification...",
    "Screen reader compatibility...",
    "Motion sensitivity check...",
    "Alt text coverage scan...",
  ],
  founder: [
    "Scanning visual consistency...",
    "Mobile compatibility check...",
    "Readability assessment...",
    "User flow clarity check...",
    "Risk level calculation...",
    "Generating business summary...",
    "Stakeholder report prep...",
    "Final recommendation build...",
  ],
  consultant: [
    "Nielsen's heuristic #1: Visibility...",
    "Error prevention analysis...",
    "Cognitive load estimation...",
    "Visual hierarchy mapping...",
    "Conversion clarity check...",
    "Interaction consistency audit...",
    "Business impact scoring...",
    "Generating formal report...",
  ],
};

const AuditRunning = ({ personaId, onComplete }: AuditRunningProps) => {
  const persona = personas.find((p) => p.id === personaId)!;
  const checks = checksByPersona[personaId];
  const [currentCheck, setCurrentCheck] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeRule, setActiveRule] = useState(0);
  const [completedRules, setCompletedRules] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCheck((prev) => {
        if (prev >= checks.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [checks.length, onComplete]);

  useEffect(() => {
    setProgress(((currentCheck + 1) / checks.length) * 100);
  }, [currentCheck, checks.length]);

  // Animate through rules
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRule((prev) => {
        const next = (prev + 1) % uxRules.length;
        setCompletedRules((s) => new Set([...s, prev]));
        return next;
      });
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-4"
    >
      <div className="max-w-xl w-full text-center">
        {/* Central radar animation */}
        <div className="relative w-40 h-40 mx-auto mb-10">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-border/50"
          />
          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-border/30"
          />
          {/* Inner ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8 border border-primary/20"
          />
          {/* Center pulse */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-[38%] bg-primary/20"
          />
          {/* Scanning sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 w-1/2 h-[2px] origin-left"
            style={{ background: "linear-gradient(90deg, hsl(var(--primary)), transparent)" }}
          />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">{persona.icon}</span>
          </div>
          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              className="absolute inset-0"
            >
              <div
                className="absolute w-2 h-2 bg-primary"
                style={{ top: "0%", left: "50%", transform: "translate(-50%, -50%)" }}
              />
            </motion.div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-1">
          Running {persona.title} Audit
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Scanning against {uxRules.length} UX principles
        </p>

        {/* Progress bar with percentage */}
        <div className="relative w-full h-2 bg-surface-3 mb-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 w-1/4 h-full bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"
          />
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-8">
          {Math.round(progress)}% complete
        </p>

        {/* Rule engine grid */}
        <div className="bg-card border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Rule Engine
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {uxRules.map((rule, idx) => {
              const isActive = idx === activeRule;
              const isComplete = completedRules.has(idx);
              return (
                <motion.div
                  key={rule.id}
                  animate={{
                    backgroundColor: isActive
                      ? "hsl(var(--primary) / 0.15)"
                      : isComplete
                      ? "hsl(var(--score-high) / 0.08)"
                      : "hsl(var(--surface-2))",
                    borderColor: isActive
                      ? "hsl(var(--primary) / 0.4)"
                      : "hsl(var(--border))",
                  }}
                  className="border p-1.5 text-center transition-all"
                >
                  <span
                    className={`text-[10px] font-mono font-bold block ${
                      isActive ? "text-primary" : isComplete ? "text-score-high" : "text-muted-foreground"
                    }`}
                  >
                    {rule.id}
                  </span>
                  <span className="text-[8px] text-muted-foreground block truncate leading-tight mt-0.5">
                    {rule.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Active check log */}
        <div className="text-left space-y-1.5">
          <AnimatePresence mode="popLayout">
            {checks
              .slice(Math.max(0, currentCheck - 2), currentCheck + 1)
              .map((check, idx) => {
                const isActive = idx === Math.min(currentCheck, 2);
                return (
                  <motion.div
                    key={check}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isActive ? 1 : 0.35, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    {isActive ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary border-t-transparent flex-shrink-0"
                      />
                    ) : (
                      <svg
                        className="w-4 h-4 text-score-high flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={isActive ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {check}
                    </span>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          className="mt-10 text-[10px] text-muted-foreground"
        >
          Powered by Gemini AI · 60+ UX rules
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AuditRunning;
