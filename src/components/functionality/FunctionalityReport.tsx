import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import type { FunctionalityResult, FunctionalityGap } from "@/types/functionality";

interface FunctionalityReportProps {
  result: FunctionalityResult;
  onRecheck: () => void;
  imageUrl?: string;
  imageBase64?: string;
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
  critical: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", dot: "bg-destructive", dashColor: "border-destructive/60" },
  major: { bg: "bg-score-medium/10", text: "text-score-medium", border: "border-score-medium/20", dot: "bg-score-medium", dashColor: "border-score-medium/60" },
  minor: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", dot: "bg-primary", dashColor: "border-primary/60" },
};

type Tab = "gaps" | "recommendations" | "enterprise";

const FunctionalityReport = ({ result, onRecheck, imageUrl, imageBase64 }: FunctionalityReportProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("gaps");
  const [hoveredGap, setHoveredGap] = useState<number | null>(null);
  const [selectedGap, setSelectedGap] = useState<number | null>(null);
  const config = verdictConfig[result.verdict];

  const displayImageUrl = imageBase64 ? `data:image/png;base64,${imageBase64}` : imageUrl;

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "gaps", label: "Functional Gaps", icon: "🔍", count: result.gaps?.length || 0 },
    { id: "recommendations", label: "Fixes", icon: "💡", count: result.recommendations?.length || 0 },
    { id: "enterprise", label: "Readiness", icon: "🏢" },
  ];

  const activeGapIndex = hoveredGap ?? selectedGap;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border overflow-hidden"
    >
      {/* Verdict header with AI branding */}
      <div className={`px-5 py-3 ${config.bg} border-b ${config.border} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-card border border-border flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className={`text-sm font-bold ${config.text} flex items-center gap-2`}>
              {config.icon} {config.label}
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 font-semibold uppercase tracking-wider">
                AI
              </span>
            </h4>
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

      {/* Summary & Strengths */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-sm text-foreground leading-relaxed mb-3">{result.summary}</p>
        {result.strengths && result.strengths.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {result.strengths.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-score-high/5 border border-score-high/15 text-score-high">
                <span>✓</span> {s.title}
              </span>
            ))}
          </div>
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
      <div>
        <AnimatePresence mode="wait">
          {activeTab === "gaps" && (
            <motion.div
              key="gaps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {result.gaps && result.gaps.length > 0 ? (
                <div className="flex flex-col lg:flex-row">
                  {/* LEFT COLUMN: Image with dashed gap outlines */}
                  {displayImageUrl && (
                    <div className="lg:w-1/2 border-r border-border p-4 bg-surface-2">
                      <div className="sticky top-0">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          Screen Annotations
                        </p>
                        <div className="relative">
                          <img
                            src={displayImageUrl}
                            alt="Analyzed screen"
                            className="w-full object-contain border border-border bg-card"
                          />
                          {/* Dashed gap area annotations */}
                          <div className="absolute inset-0 pointer-events-none">
                            {result.gaps.map((gap, i) => {
                              if (!gap.area) return null;
                              const isActive = activeGapIndex === i;
                              const sev = severityConfig[gap.severity] || severityConfig.minor;
                              
                              // Position annotations distributed across the image
                              const row = Math.floor(i / 2);
                              const col = i % 2;
                              const totalRows = Math.ceil(result.gaps.length / 2);
                              const topPct = 5 + (row * 85) / Math.max(totalRows, 1);
                              const leftPct = col === 0 ? 3 : 50;
                              const width = col === 0 ? 44 : 44;

                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0 }}
                                  animate={{ 
                                    opacity: isActive ? 1 : 0.5,
                                    scale: isActive ? 1.02 : 1,
                                  }}
                                  className={`absolute pointer-events-auto transition-all duration-300 ${
                                    isActive ? "z-20" : "z-10"
                                  }`}
                                  style={{
                                    top: `${topPct}%`,
                                    left: `${leftPct}%`,
                                    width: `${width}%`,
                                    minHeight: "40px",
                                  }}
                                >
                                  {/* Dashed outline box */}
                                  <div className={`border-2 border-dashed ${sev.dashColor} ${
                                    isActive ? "bg-primary/5" : ""
                                  } p-2 transition-all`}>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold text-primary-foreground ${sev.dot} shrink-0`}>
                                        {i + 1}
                                      </span>
                                      <span className={`text-[9px] font-medium ${sev.text} truncate bg-card/80 backdrop-blur-sm px-1 py-0.5`}>
                                        {gap.area}
                                      </span>
                                    </div>
                                  </div>
                                  {/* Connector line hint */}
                                  {isActive && (
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: "100%" }}
                                      className="h-px bg-primary/40 mt-1"
                                    />
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 text-center">
                          Hover or click gap cards to highlight areas on screen
                        </p>
                      </div>
                    </div>
                  )}

                  {/* RIGHT COLUMN: Gap descriptions */}
                  <div className={`${displayImageUrl ? "lg:w-1/2" : "w-full"} p-4 space-y-3`}>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                      Functional Gaps ({result.gaps.length})
                    </p>
                    {result.gaps.map((gap, i) => {
                      const sev = severityConfig[gap.severity] || severityConfig.minor;
                      const isActive = activeGapIndex === i;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`bg-card border p-4 transition-all cursor-pointer ${
                            isActive
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-primary/30"
                          }`}
                          onMouseEnter={() => setHoveredGap(i)}
                          onMouseLeave={() => setHoveredGap(null)}
                          onClick={() => setSelectedGap(selectedGap === i ? null : i)}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 ${sev.dot}`}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 text-xs font-medium ${sev.bg} ${sev.text} border ${sev.border}`}>
                                  {gap.severity}
                                </span>
                                {gap.area && (
                                  <span className="px-2 py-0.5 text-[10px] font-medium bg-surface-2 text-muted-foreground border border-border flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {gap.area}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-foreground">{gap.issue}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-semibold">Why it matters:</span> {gap.impact}
                              </p>
                              <div className="mt-2 p-2 bg-surface-2 border border-border">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">Industry standard:</span>{" "}
                                  {gap.industryExpectation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
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
              className="p-5 space-y-3"
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
              className="p-5 space-y-3"
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
