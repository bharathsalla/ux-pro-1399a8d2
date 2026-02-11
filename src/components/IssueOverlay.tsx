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

const severityConfig: Record<string, { label: string; stickyBg: string; stickyBorder: string; headerBg: string; textColor: string }> = {
  critical: {
    label: "CRITICAL",
    stickyBg: "linear-gradient(135deg, hsl(0 85% 95%) 0%, hsl(0 80% 90%) 100%)",
    stickyBorder: "hsl(0 70% 55%)",
    headerBg: "hsl(0 72% 51%)",
    textColor: "hsl(0 70% 35%)",
  },
  warning: {
    label: "WARNING",
    stickyBg: "linear-gradient(135deg, hsl(45 95% 92%) 0%, hsl(40 90% 85%) 100%)",
    stickyBorder: "hsl(38 92% 45%)",
    headerBg: "hsl(38 92% 50%)",
    textColor: "hsl(38 80% 30%)",
  },
  info: {
    label: "INFO",
    stickyBg: "linear-gradient(135deg, hsl(210 85% 95%) 0%, hsl(210 80% 90%) 100%)",
    stickyBorder: "hsl(217 91% 50%)",
    headerBg: "hsl(217 91% 55%)",
    textColor: "hsl(217 80% 35%)",
  },
};

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
    <div ref={containerRef} className="relative bg-card border border-border overflow-visible">
      <img src={imageUrl} alt={imageAlt} className="w-full h-auto block" />

      {/* Dark overlay when a pin is active */}
      <AnimatePresence>
        {activeIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-10"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Issue sticky notes */}
      {issues.map((issue, idx) => {
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
            {/* Sticky note */}
            <motion.button
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: isActive ? 1.15 : 1, opacity: 1, rotate: (idx % 2 === 0 ? -3 : 3) }}
              whileHover={{ scale: 1.2, rotate: 0 }}
              transition={{
                delay: 0.1 + idx * 0.05,
                type: "spring",
                stiffness: 350,
                damping: 18,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePinClick(issue.id);
              }}
              className="relative cursor-pointer select-none"
              style={{
                background: config.stickyBg,
                border: `2px solid ${config.stickyBorder}`,
                boxShadow: `3px 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)`,
                padding: "6px 10px",
                minWidth: "56px",
                maxWidth: "140px",
              }}
            >
              {/* Number badge */}
              <span
                className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center text-[11px] font-extrabold text-white"
                style={{
                  background: config.headerBg,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                {idx + 1}
              </span>
              {/* Title preview */}
              <p
                className="text-[10px] font-bold leading-tight pl-3 truncate"
                style={{ color: config.textColor }}
              >
                {issue.title}
              </p>
            </motion.button>

            {/* Expanded detail card */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`absolute z-50 ${cardPos} w-80`}
                  style={{
                    background: "hsl(0 0% 100%)",
                    border: `2px solid ${config.stickyBorder}`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div
                    className="px-4 py-2.5 flex items-center justify-between"
                    style={{ background: config.headerBg }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-white/20 flex items-center justify-center text-xs font-extrabold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white tracking-wider uppercase">
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.ruleId && (
                        <span className="text-[10px] font-mono text-white/80 bg-white/15 px-2 py-0.5">
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
                      <span className="inline-block text-[10px] text-muted-foreground bg-muted border border-border px-2 py-0.5 mb-2 font-mono">
                        {issue.principle}
                      </span>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {issue.description}
                    </p>

                    {/* Fix */}
                    <div className="p-3" style={{ background: "hsl(152 60% 96%)", border: "1px solid hsl(152 50% 80%)" }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5" style={{ color: "hsl(152 60% 35%)" }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "hsl(152 60% 35%)" }}>
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
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-2 shadow-lg"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 100% / 0.95), hsl(0 0% 98% / 0.95))",
            backdropFilter: "blur(8px)",
            border: "1px solid hsl(220 15% 85%)",
          }}
        >
          <span className="w-2.5 h-2.5 bg-destructive animate-pulse" style={{ borderRadius: "50%" }} />
          <span className="text-xs font-bold text-foreground">
            {issues.length} issue{issues.length !== 1 ? "s" : ""} spotted
          </span>
          <span className="text-[10px] text-muted-foreground">— click notes to expand</span>
        </div>
      )}
    </div>
  );
};

export default IssueOverlay;
