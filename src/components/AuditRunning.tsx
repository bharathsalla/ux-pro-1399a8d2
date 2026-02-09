import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";
import { CheckCircle2, Loader2 } from "lucide-react";

interface AuditRunningProps {
  personaId: PersonaId;
  onComplete: () => void;
}

const checksByPersona: Record<PersonaId, { label: string; category: string }[]> = {
  solo: [
    { label: "Checking auto layout usage", category: "Layout" },
    { label: "Analyzing 8pt grid alignment", category: "Grid" },
    { label: "Validating font size hierarchy", category: "Typography" },
    { label: "Checking button consistency", category: "Components" },
    { label: "Measuring contrast ratios", category: "Color" },
    { label: "Verifying grid alignment", category: "Layout" },
    { label: "Detecting spacing misalignments", category: "Spacing" },
    { label: "Scanning component detachment", category: "System" },
  ],
  lead: [
    { label: "Scanning naming conventions", category: "System" },
    { label: "Checking component detachment", category: "Components" },
    { label: "Analyzing padding consistency", category: "Spacing" },
    { label: "Validating typography scale", category: "Typography" },
    { label: "Auditing design token usage", category: "Tokens" },
    { label: "Cross-frame consistency check", category: "Consistency" },
    { label: "Generating quality breakdown", category: "Report" },
    { label: "Building feedback report", category: "Report" },
  ],
  a11y: [
    { label: "WCAG 2.1 contrast check (4.5:1)", category: "Contrast" },
    { label: "Touch target validation (44px)", category: "Touch" },
    { label: "Scanning text under 12px", category: "Typography" },
    { label: "Color-only meaning detection", category: "Color" },
    { label: "Focus state verification", category: "Focus" },
    { label: "Screen reader compatibility", category: "A11y" },
    { label: "Motion sensitivity check", category: "Motion" },
    { label: "Alt text coverage scan", category: "Content" },
  ],
  founder: [
    { label: "Scanning visual consistency", category: "Visual" },
    { label: "Mobile compatibility check", category: "Responsive" },
    { label: "Readability assessment", category: "Content" },
    { label: "User flow clarity check", category: "UX" },
    { label: "Risk level calculation", category: "Risk" },
    { label: "Generating business summary", category: "Report" },
    { label: "Stakeholder report prep", category: "Report" },
    { label: "Final recommendation build", category: "Report" },
  ],
  consultant: [
    { label: "Nielsen's heuristic #1: Visibility", category: "Heuristic" },
    { label: "Error prevention analysis", category: "Heuristic" },
    { label: "Cognitive load estimation", category: "Psychology" },
    { label: "Visual hierarchy mapping", category: "Visual" },
    { label: "Conversion clarity check", category: "Business" },
    { label: "Interaction consistency audit", category: "UX" },
    { label: "Business impact scoring", category: "Business" },
    { label: "Generating formal report", category: "Report" },
  ],
};

const principleGroups = [
  {
    group: "Nielsen's Heuristics",
    items: ["Visibility of system status", "Match between system & real world", "User control & freedom", "Error prevention"],
  },
  {
    group: "Laws of UX",
    items: ["Fitts's Law — Target sizing", "Hick's Law — Decision complexity", "Miller's Law — Cognitive load", "Jakob's Law — Convention adherence"],
  },
  {
    group: "WCAG 2.2",
    items: ["Contrast ratio (4.5:1)", "Touch targets (44px min)", "Focus indicators", "Color independence"],
  },
  {
    group: "Design Systems",
    items: ["8pt grid alignment", "Typography scale", "Component consistency", "Spacing tokens"],
  },
];

const AuditRunning = ({ personaId, onComplete }: AuditRunningProps) => {
  const persona = personas.find((p) => p.id === personaId)!;
  const checks = checksByPersona[personaId];
  const [currentCheck, setCurrentCheck] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [completedChecks, setCompletedChecks] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCheck((prev) => {
        if (prev >= checks.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        setCompletedChecks((c) => [...c, prev]);
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [checks.length, onComplete]);

  useEffect(() => {
    setProgress(((currentCheck + 1) / checks.length) * 100);
  }, [currentCheck, checks.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItemIdx((prev) => {
        const group = principleGroups[activeGroupIdx];
        if (prev >= group.items.length - 1) {
          setActiveGroupIdx((g) => (g + 1) % principleGroups.length);
          return 0;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [activeGroupIdx]);

  const currentGroup = principleGroups[activeGroupIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-4"
    >
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Orbital Scanner */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-border"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-3 border border-primary/30"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-6 border-2 border-primary/40 border-t-primary"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-10 bg-primary/10 flex items-center justify-center"
            >
              <span className="text-2xl">{persona.icon}</span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1">
            {persona.title} Audit
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentCheck}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-muted-foreground"
            >
              {checks[currentCheck].label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-surface-3 mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Check list — shows what's happening */}
        <div className="bg-card border border-border p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Running Checks — {checks[currentCheck].category}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground font-mono">
              {currentCheck + 1}/{checks.length}
            </span>
          </div>
          <div className="space-y-1">
            {checks.map((check, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: i <= currentCheck ? 1 : 0.3,
                }}
                className="flex items-center gap-2 text-xs py-1"
              >
                {completedChecks.includes(i) ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : i === currentCheck ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 border border-border shrink-0" />
                )}
                <span
                  className={`font-mono ${
                    i === currentCheck
                      ? "text-foreground font-semibold"
                      : completedChecks.includes(i)
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {check.label}
                </span>
                {i === currentCheck && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-medium">
                    {check.category}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Principle scanner */}
        <div className="bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Principle Engine
            </span>
            <span className="ml-auto text-[10px] text-primary font-medium">
              {currentGroup.group}
            </span>
          </div>
          <div className="space-y-1">
            {currentGroup.items.map((item, idx) => (
              <motion.div
                key={`${activeGroupIdx}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{
                  opacity: idx <= activeItemIdx ? 1 : 0.25,
                  x: 0,
                }}
                className="flex items-center gap-2 text-xs py-1"
              >
                {idx < activeItemIdx ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                ) : idx === activeItemIdx ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 border border-border shrink-0" />
                )}
                <span
                  className={`font-mono ${
                    idx === activeItemIdx ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-5 text-xs text-muted-foreground font-medium text-center"
        >
          ✨ {Math.round(progress)}% — Analyzing across 60+ UX/UI principles
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AuditRunning;
