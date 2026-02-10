import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { type AuditIssue } from "@/types/audit";

interface IssueOverlayProps {
  issues: AuditIssue[];
  imageUrl: string;
  imageAlt?: string;
  activeIssueId?: string | null;
  onPinClick?: (issueId: string) => void;
}

const severityConfig: Record<string, { bg: string; border: string; text: string; label: string; pinBg: string }> = {
  critical: {
    bg: "bg-destructive",
    border: "border-destructive",
    text: "text-destructive",
    label: "CRITICAL",
    pinBg: "bg-red-600",
  },
  warning: {
    bg: "bg-score-medium",
    border: "border-score-medium",
    text: "text-score-medium",
    label: "WARNING",
    pinBg: "bg-amber-500",
  },
  info: {
    bg: "bg-primary",
    border: "border-primary",
    text: "text-primary",
    label: "INFO",
    pinBg: "bg-blue-500",
  },
};

/** Determine if the card should open left/right/up based on pin position */
function getCardPosition(x: number, y: number) {
  const isRight = x > 65;
  const isLeft = x < 35;
  const isBottom = y > 65;

  let horizontal = "left-1/2 -translate-x-1/2";
  if (isRight) horizontal = "right-0 translate-x-0";
  if (isLeft) horizontal = "left-0 translate-x-0";

  const vertical = isBottom ? "bottom-14" : "top-14";

  return `${vertical} ${horizontal}`;
}

const IssueOverlay = ({
  issues,
  imageUrl,
  imageAlt = "Design screenshot",
  activeIssueId: externalActiveId,
  onPinClick,
}: IssueOverlayProps) => {
  const [internalActive, setInternalActive] = useState<string | null>(null);
  const activeIssue = externalActiveId !== undefined ? externalActiveId : internalActive;
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePinClick = useCallback(
    (issueId: string) => {
      if (onPinClick) {
        onPinClick(issueId);
      } else {
        setInternalActive(internalActive === issueId ? null : issueId);
      }
    },
    [onPinClick, internalActive]
  );

  const handleClose = useCallback(() => {
    if (onPinClick) onPinClick("");
    else setInternalActive(null);
  }, [onPinClick]);

  return (
    <div ref={containerRef} className="relative bg-card border border-border overflow-visible rounded-lg">
      {/* Image */}
      <img src={imageUrl} alt={imageAlt} className="w-full h-auto block rounded-lg" />

      {/* Dark overlay when a pin is active */}
      <AnimatePresence>
        {activeIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 rounded-lg z-10"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Issue pins */}
      {issues.map((issue, idx) => {
        // Golden-angle scatter for non-overlapping distribution
        const goldenAngle = 137.508;
        const radius = 30;
        const angle = idx * goldenAngle * (Math.PI / 180);
        const spiralR = radius * Math.sqrt(idx + 1) / Math.sqrt(issues.length);
        const cx = 50 + spiralR * Math.cos(angle);
        const cy = 50 + spiralR * Math.sin(angle);
        const x = issue.x != null && issue.x > 0 ? issue.x : Math.max(5, Math.min(95, cx));
        const y = issue.y != null && issue.y > 0 ? issue.y : Math.max(5, Math.min(95, cy));
        const config = severityConfig[issue.severity] || severityConfig.info;
        const isActive = activeIssue === issue.id;
        const cardPos = getCardPosition(x, y);

        return (
          <div
            key={issue.id}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: isActive ? 30 : 20,
            }}
          >
            {/* Outer pulse ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: idx * 0.2,
              }}
              className={`absolute inset-0 rounded-full ${config.pinBg}`}
              style={{ width: 40, height: 40, top: -4, left: -4 }}
            />

            {/* Pin */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isActive ? 1.3 : 1, opacity: 1 }}
              whileHover={{ scale: 1.25 }}
              transition={{
                delay: 0.15 + idx * 0.06,
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePinClick(issue.id);
              }}
              className={`relative w-9 h-9 rounded-full ${config.pinBg} border-[3px] border-white shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex items-center justify-center text-sm font-extrabold text-white cursor-pointer select-none`}
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
            >
              {idx + 1}
            </motion.button>

            {/* Detail card */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`absolute z-50 ${cardPos} w-80 bg-card rounded-xl border-2 ${config.border} shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className={`px-4 py-2.5 ${config.bg} rounded-t-[10px] flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white tracking-wider uppercase">
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.ruleId && (
                        <span className="text-[10px] font-mono text-white/80 bg-white/15 px-2 py-0.5 rounded">
                          {issue.ruleId}
                        </span>
                      )}
                      <button
                        onClick={handleClose}
                        className="text-white/70 hover:text-white transition-colors p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <h4 className="text-sm font-bold text-foreground mb-1 leading-snug">
                      {issue.title}
                    </h4>
                    {issue.principle && (
                      <span className="inline-block text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded mb-2 font-mono">
                        {issue.principle}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {issue.description}
                    </p>

                    {/* Fix */}
                    <div className="bg-primary/8 border border-primary/25 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          How to fix
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Issue count badge */}
      {issues.length > 0 && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border px-3 py-2 rounded-lg shadow-lg">
          <span className="w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
          <span className="text-xs font-bold text-foreground">
            {issues.length} issue{issues.length !== 1 ? "s" : ""} found
          </span>
          <span className="text-[10px] text-muted-foreground">— click pins to see details</span>
        </div>
      )}
    </div>
  );
};

export default IssueOverlay;
