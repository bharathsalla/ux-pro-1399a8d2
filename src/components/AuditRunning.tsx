import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";

interface AuditRunningProps {
  personaId: PersonaId;
  onComplete: () => void;
}

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

const ruleScanItems = [
  "Nielsen's Heuristics — Visibility of system status",
  "Fitts's Law — Touch target sizing",
  "Hick's Law — Decision complexity",
  "WCAG 2.2 — Contrast ratio (4.5:1)",
  "Gestalt — Proximity & grouping",
  "8pt Grid — Spacing alignment",
  "Typography Scale — Hierarchy check",
  "Color Theory — 60-30-10 rule",
  "Miller's Law — Cognitive load",
  "Atomic Design — Component structure",
  "Jakob's Law — Convention adherence",
  "Doherty Threshold — Response time",
];

const AuditRunning = ({ personaId, onComplete }: AuditRunningProps) => {
  const persona = personas.find((p) => p.id === personaId)!;
  const checks = checksByPersona[personaId];
  const [currentCheck, setCurrentCheck] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanIndex, setScanIndex] = useState(0);
  const [dots, setDots] = useState("");

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

  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanIndex((prev) => (prev + 1) % ruleScanItems.length);
    }, 900);
    return () => clearInterval(scanInterval);
  }, []);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-4"
    >
      <div className="max-w-md w-full text-center">
        {/* Orbital Scanner Animation */}
        <div className="relative w-40 h-40 mx-auto mb-10">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-border"
          />
          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 border border-primary/30"
          />
          {/* Inner ring with sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 border-2 border-primary/40 border-t-primary"
          />
          {/* Center pulse with persona icon */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-12 bg-primary/10 flex items-center justify-center"
          >
            <span className="text-3xl">{persona.icon}</span>
          </motion.div>
          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-2.5 h-2.5 bg-primary"
              style={{
                top: `${50 + 45 * Math.sin((i * Math.PI) / 2)}%`,
                left: `${50 + 45 * Math.cos((i * Math.PI) / 2)}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {persona.title} Audit{dots}
        </h2>

        {/* Active check label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentCheck}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-muted-foreground mb-6"
          >
            {checks[currentCheck]}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-surface-3 mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Rule Engine Scanner */}
        <div className="bg-card border border-border p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rule Engine Active
            </span>
          </div>
          <div className="space-y-1.5 h-[100px] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-card to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-card to-transparent z-10" />
            <AnimatePresence mode="popLayout">
              {ruleScanItems
                .slice(scanIndex, scanIndex + 3)
                .concat(
                  ruleScanItems.slice(0, Math.max(0, scanIndex + 3 - ruleScanItems.length))
                )
                .slice(0, 3)
                .map((rule, idx) => (
                  <motion.div
                    key={`${scanIndex}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: idx === 0 ? 1 : 0.3 + idx * 0.2,
                      x: 0,
                    }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-xs py-1.5"
                  >
                    {idx === 0 ? (
                      <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent animate-spin shrink-0" />
                    ) : (
                      <svg
                        className="w-3.5 h-3.5 text-primary shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    <span
                      className={
                        idx === 0
                          ? "text-foreground font-semibold font-mono text-xs"
                          : "text-muted-foreground font-mono text-xs"
                      }
                    >
                      {rule}
                    </span>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress percentage */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-6 text-xs text-muted-foreground font-medium"
        >
          ✨ {Math.round(progress)}% — Powered by 60+ UX/UI principles
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AuditRunning;
