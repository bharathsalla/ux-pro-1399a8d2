import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, type AuditResult, type AuditIssue, personas } from "@/types/audit";
import ScoreRing from "./ScoreRing";

interface AuditResultsProps {
  personaId: PersonaId;
  result: AuditResult;
  onRestart: () => void;
}

const severityBadge: Record<AuditIssue['severity'], { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-destructive/15 text-destructive' },
  warning: { label: 'Warning', className: 'bg-score-medium/15 text-score-medium' },
  info: { label: 'Info', className: 'bg-primary/15 text-primary' },
};

const AuditResults = ({ personaId, result, onRestart }: AuditResultsProps) => {
  const persona = personas.find(p => p.id === personaId)!;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(result.categories[0]?.name ?? null);

  const totalIssues = result.categories.reduce((sum, cat) => sum + cat.issues.length, 0);
  const criticalCount = result.categories.reduce(
    (sum, cat) => sum + cat.issues.filter(i => i.severity === 'critical').length, 0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen px-4 py-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{persona.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{persona.title} Audit</h2>
              <p className="text-xs text-muted-foreground">Completed just now</p>
            </div>
          </div>
          <button
            onClick={onRestart}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg border border-border hover:bg-accent"
          >
            New Audit
          </button>
        </div>

        {/* Score Hero */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreRing score={result.overallScore} size={160} strokeWidth={10} label="/100" />
            <div className="flex-1 text-center md:text-left">
              <p className="text-foreground text-lg leading-relaxed mb-4">
                {result.summary}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  result.riskLevel === 'High' ? 'bg-destructive/15 text-destructive' :
                  result.riskLevel === 'Medium' ? 'bg-score-medium/15 text-score-medium' :
                  'bg-score-high/15 text-score-high'
                }`}>
                  Risk: {result.riskLevel}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-surface-3 text-muted-foreground">
                  {totalIssues} issues found
                </span>
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-destructive/15 text-destructive">
                    {criticalCount} critical
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {result.categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
              className={`p-4 rounded-xl border text-center transition-all ${
                expandedCategory === cat.name
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-muted-foreground'
              }`}
            >
              <span className="text-xl block mb-1">{cat.icon}</span>
              <ScoreRing score={cat.score} size={56} strokeWidth={4} className="mx-auto mb-2" />
              <div className="text-xs font-medium text-foreground">{cat.name}</div>
              <div className="text-xs text-muted-foreground">{cat.issues.length} issues</div>
            </motion.button>
          ))}
        </div>

        {/* Expanded Issues */}
        <AnimatePresence mode="wait">
          {expandedCategory && (
            <motion.div
              key={expandedCategory}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mb-6">
                {result.categories
                  .find(c => c.name === expandedCategory)
                  ?.issues.map((issue, i) => (
                    <motion.div
                      key={issue.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card border border-border rounded-xl p-5"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${severityBadge[issue.severity].className}`}>
                          {severityBadge[issue.severity].label}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                          <div className="mt-3 p-3 bg-surface-2 rounded-lg border border-border">
                            <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              Suggestion
                            </div>
                            <p className="text-sm text-secondary-foreground">{issue.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl p-6 text-center"
        >
          <h3 className="font-semibold text-foreground mb-2">Export Report</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {personaId === 'consultant'
              ? 'Generate a client-ready PDF with screenshots and issue markers.'
              : personaId === 'lead'
              ? 'Share structured feedback with your team.'
              : 'Save your audit results for reference.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all">
              Export PDF
            </button>
            <button className="px-5 py-2.5 rounded-lg border border-border text-foreground text-sm hover:bg-accent transition-all">
              Copy Summary
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuditResults;
