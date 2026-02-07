import { useState } from "react";
import { motion } from "framer-motion";
import { type PersonaId, type AuditResult, personas } from "@/types/audit";
import ScoreRing from "./ScoreRing";
import StickyNote from "./StickyNote";

interface ImageAuditResultsProps {
  personaId: PersonaId;
  result: AuditResult;
  imageUrl: string;
  onRestart: () => void;
}

const ImageAuditResults = ({
  personaId,
  result,
  imageUrl,
  onRestart,
}: ImageAuditResultsProps) => {
  const persona = personas.find((p) => p.id === personaId)!;
  const [showNotes, setShowNotes] = useState(true);

  // Flatten all issues for sticky notes
  const allIssues = result.categories.flatMap((cat) => cat.issues);
  const criticalCount = allIssues.filter(
    (i) => i.severity === "critical"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{persona.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{persona.title} Audit</h2>
              <p className="text-xs text-muted-foreground">
                AI-powered analysis complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                showNotes
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {showNotes ? "Hide" : "Show"} Notes
            </button>
            <button
              onClick={onRestart}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg border border-border hover:bg-accent"
            >
              New Audit
            </button>
          </div>
        </div>

        {/* Score bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreRing
              score={result.overallScore}
              size={120}
              strokeWidth={8}
              label="/100"
            />
            <div className="flex-1 text-center md:text-left">
              <p className="text-foreground text-base leading-relaxed mb-3">
                {result.summary}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    result.riskLevel === "High"
                      ? "bg-destructive/15 text-destructive"
                      : result.riskLevel === "Medium"
                      ? "bg-score-medium/15 text-score-medium"
                      : "bg-score-high/15 text-score-high"
                  }`}
                >
                  Risk: {result.riskLevel}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-surface-3 text-muted-foreground">
                  {allIssues.length} issues
                </span>
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-destructive/15 text-destructive">
                    {criticalCount} critical
                  </span>
                )}
              </div>
            </div>
            {/* Category mini-scores */}
            <div className="flex gap-3 flex-wrap justify-center">
              {result.categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex flex-col items-center gap-1"
                >
                  <ScoreRing
                    score={cat.score}
                    size={48}
                    strokeWidth={3}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium max-w-[60px] text-center truncate">
                    {cat.icon} {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Image with sticky notes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative bg-card border border-border rounded-2xl overflow-hidden mb-6"
        >
          <div className="relative">
            <img
              src={imageUrl}
              alt="Design under audit"
              className="w-full h-auto"
            />
            {/* Sticky notes overlay */}
            {showNotes &&
              allIssues.map((issue, idx) => (
                <StickyNote key={issue.id} issue={issue} index={idx} />
              ))}
          </div>
        </motion.div>

        {/* Issues list below image */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground">
            All Issues ({allIssues.length})
          </h3>
          {allIssues.map((issue, idx) => {
            const severityClass =
              issue.severity === "critical"
                ? "bg-destructive/15 text-destructive"
                : issue.severity === "warning"
                ? "bg-score-medium/15 text-score-medium"
                : "bg-primary/15 text-primary";

            return (
              <div
                key={issue.id}
                className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${severityClass}`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {issue.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {issue.description}
                  </p>
                  <div className="mt-2 p-2.5 bg-surface-2 rounded-lg border border-border">
                    <p className="text-xs text-secondary-foreground">
                      💡 {issue.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* New audit button */}
        <div className="text-center pb-8">
          <button
            onClick={onRestart}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all"
          >
            Run Another Audit
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageAuditResults;
