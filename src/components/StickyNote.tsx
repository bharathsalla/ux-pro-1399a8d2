import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type AuditIssue } from "@/types/audit";

interface StickyNoteProps {
  issue: AuditIssue;
  index: number;
}

const severityColors: Record<string, { bg: string; border: string; dot: string }> = {
  critical: {
    bg: "bg-destructive/90",
    border: "border-destructive",
    dot: "bg-destructive",
  },
  warning: {
    bg: "bg-score-medium/90",
    border: "border-score-medium",
    dot: "bg-score-medium",
  },
  info: {
    bg: "bg-primary/90",
    border: "border-primary",
    dot: "bg-primary",
  },
};

const StickyNote = ({ issue, index }: StickyNoteProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = severityColors[issue.severity] || severityColors.info;

  // Position the note using x, y percentages from AI
  const x = (issue as any).x ?? 50;
  const y = (issue as any).y ?? 50;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.15, type: "spring", stiffness: 200 }}
      className="absolute z-10 group"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Pin dot */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-7 h-7 rounded-full ${colors.dot} border-2 border-background shadow-lg cursor-pointer flex items-center justify-center text-xs font-bold text-background transition-transform hover:scale-125`}
      >
        {index + 1}
        {/* Pulse ring */}
        <span
          className={`absolute inset-0 rounded-full ${colors.dot} animate-ping opacity-30`}
        />
      </button>

      {/* Expanded sticky note card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className={`absolute top-8 left-1/2 -translate-x-1/2 w-64 rounded-xl border ${colors.border} bg-card shadow-2xl p-4 cursor-default`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2 mb-2">
              <span
                className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-background ${colors.bg}`}
              >
                {issue.severity}
              </span>
              <h4 className="text-sm font-semibold text-foreground leading-tight">
                {issue.title}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
              {issue.description}
            </p>
            <div className="rounded-lg bg-surface-2 border border-border p-2.5">
              <div className="flex items-center gap-1 text-[10px] text-primary font-semibold mb-1 uppercase tracking-wide">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                Fix
              </div>
              <p className="text-xs text-secondary-foreground leading-relaxed">
                {issue.suggestion}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StickyNote;
