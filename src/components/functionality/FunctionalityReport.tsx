import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FunctionalityResult } from "@/types/functionality";

interface FunctionalityReportProps {
  result: FunctionalityResult;
  onRecheck: () => void;
}

const verdictConfig = {
  good: {
    icon: "✅",
    label: "Strong Functionality",
    bg: "bg-score-high/10",
    border: "border-score-high/30",
    text: "text-score-high",
  },
  mixed: {
    icon: "⚠️",
    label: "Needs Improvement",
    bg: "bg-score-medium/10",
    border: "border-score-medium/30",
    text: "text-score-medium",
  },
  bad: {
    icon: "❌",
    label: "Critical Gaps Found",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
  },
};

const severityConfig = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  major: { bg: "bg-score-medium/10", text: "text-score-medium", border: "border-score-medium/20" },
  minor: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
};

type Tab = "overview" | "gaps" | "recommendations" | "enterprise";

const FunctionalityReport = ({ result, onRecheck }: FunctionalityReportProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const config = verdictConfig[result.verdict];

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "gaps", label: "Gaps", icon: "🔍", count: result.gaps?.length || 0 },
    { id: "recommendations", label: "Fixes", icon: "💡", count: result.recommendations?.length || 0 },
    { id: "enterprise", label: "Readiness", icon: "🏢" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border overflow-hidden"
    >
      {/* Verdict header */}
      <div className={`px-5 py-3 ${config.bg} border-b ${config.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <h4 className={`text-sm font-bold ${config.text}`}>{config.label}</h4>
            <p className="text-xs text-muted-foreground">
              Functionality Score: {result.score}/100
            </p>
          </div>
        </div>
        <button
          onClick={onRecheck}
          className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1 bg-card transition-colors"
        >
          Re-analyze
        </button>
      </div>

      {/* Context bar */}
      <div className="px-5 py-2.5 bg-surface-2 border-b border-border flex flex-wrap gap-3">
        {result.screenType && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Screen:</span> {result.screenType}
          </span>
        )}
        {result.productDomain && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Domain:</span> {result.productDomain}
          </span>
        )}
        {result.primaryUserRole && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">User:</span> {result.primaryUserRole}
          </span>
        )}
        {result.coreGoal && (
          <span className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Goal:</span> {result.coreGoal}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-primary/5 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-[10px] bg-surface-2 border border-border px-1.5 py-0.5 font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>

              {result.strengths && result.strengths.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-score-high uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-score-high" />
                    Functional Strengths
                  </h5>
                  <div className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="bg-score-high/5 border border-score-high/15 p-3">
                        <p className="text-xs font-medium text-foreground flex items-start gap-2">
                          <span className="text-score-high mt-0.5 shrink-0">✓</span>
                          {s.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 ml-5">{s.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "gaps" && (
            <motion.div
              key="gaps"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {result.gaps && result.gaps.length > 0 ? (
                result.gaps.map((gap, i) => {
                  const sev = severityConfig[gap.severity] || severityConfig.minor;
                  return (
                    <div key={i} className="bg-card border border-border p-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-surface-2 flex items-center justify-center text-xs font-bold text-foreground shrink-0 border border-border">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs font-medium ${sev.bg} ${sev.text} border ${sev.border}`}>
                              {gap.severity}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-foreground">{gap.issue}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-semibold">Impact:</span> {gap.impact}
                          </p>
                          <div className="mt-2 p-2 bg-surface-2 border border-border">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">Industry standard:</span>{" "}
                              {gap.industryExpectation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No functional gaps identified.</p>
              )}
            </motion.div>
          )}

          {activeTab === "recommendations" && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {result.recommendations && result.recommendations.length > 0 ? (
                result.recommendations.map((rec, i) => (
                  <div key={i} className="bg-primary/5 border border-primary/20 p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-primary text-lg shrink-0">💡</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground">{rec.feature}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="bg-card border border-border p-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Integration</p>
                            <p className="text-xs text-foreground">{rec.integration}</p>
                          </div>
                          <div className="bg-card border border-border p-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">User Value</p>
                            <p className="text-xs text-foreground">{rec.userValue}</p>
                          </div>
                          <div className="bg-card border border-border p-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Business Value</p>
                            <p className="text-xs text-foreground">{rec.businessValue}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No recommendations generated.</p>
              )}
            </motion.div>
          )}

          {activeTab === "enterprise" && (
            <motion.div
              key="enterprise"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              {result.enterpriseReadiness && (
                <>
                  <div className="bg-card border border-border p-4">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>📈</span> Scalability
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.enterpriseReadiness.scalability}
                    </p>
                  </div>
                  <div className="bg-card border border-border p-4">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>🔒</span> Compliance &amp; Audit
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.enterpriseReadiness.compliance}
                    </p>
                  </div>
                  <div className="bg-card border border-border p-4">
                    <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>👥</span> Role &amp; Workflow Gaps
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {result.enterpriseReadiness.roleGaps}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FunctionalityReport;
