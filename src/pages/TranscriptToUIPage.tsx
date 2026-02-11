import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuditLimit } from "@/hooks/useAuditLimit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  Check,
  Maximize2,
  X,
  Zap,
  Loader2,
  Clock,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Sparkles,
  FileText,
  Users,
  Target,
  Paintbrush,
  Rocket,
  Code2,
  Eye,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Brain,
  Layers,
  Cpu,
  Wand2,
  LayoutDashboard,
} from "lucide-react";
import { FixUxLogo } from "@/components/FixUxLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import SiteNav from "@/components/SiteNav";

/* ── Types ── */
interface GeneratedResult {
  summary: string;
  html: string;
  css: string;
  js: string;
  suggestions: Suggestion[];
  meetingMeta: MeetingMeta;
  keyNotes?: string[];
  whatTheyAsked?: string;
  howDesigned?: string;
  solutionImpact?: string;
}

interface Suggestion {
  title: string;
  description: string;
  category: "Improvement" | "Insight" | "Action Item";
}

interface MeetingMeta {
  participants: string[];
  duration: string;
  topics: string[];
}

interface Session {
  id: string;
  timestamp: string;
  role: string;
  transcript: string;
  result: GeneratedResult;
}

/* ── Constants ── */
const roles = [
  { id: "ux-designer", label: "UX Designer", icon: "🎨", color: "hsl(340 82% 52%)" },
  { id: "product-manager", label: "Product Manager", icon: "📋", color: "hsl(262 83% 58%)" },
  { id: "developer", label: "Developer", icon: "💻", color: "hsl(200 90% 48%)" },
  { id: "qa-engineer", label: "QA Engineer", icon: "🧪", color: "hsl(160 60% 38%)" },
  { id: "stakeholder", label: "Stakeholder", icon: "👔", color: "hsl(30 90% 50%)" },
];

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; bg: string }> = {
  Improvement: { icon: TrendingUp, color: "hsl(160 60% 35%)", bg: "hsl(160 50% 95%)" },
  Insight: { icon: Lightbulb, color: "hsl(220 60% 45%)", bg: "hsl(220 50% 95%)" },
  "Action Item": { icon: AlertCircle, color: "hsl(30 80% 42%)", bg: "hsl(30 60% 95%)" },
};

const loadingSteps = [
  { icon: FileText, label: "Parsing transcript", detail: "Extracting key discussion points and requirements", color: "hsl(200 90% 48%)" },
  { icon: Users, label: "Identifying stakeholders", detail: "Mapping participants, roles, and decision makers", color: "hsl(262 83% 58%)" },
  { icon: Brain, label: "Analyzing requirements", detail: "Understanding functional needs and user stories", color: "hsl(340 82% 52%)" },
  { icon: Layers, label: "Designing layout structure", detail: "Building component hierarchy and information architecture", color: "hsl(38 92% 50%)" },
  { icon: Paintbrush, label: "Generating visual design", detail: "Applying design patterns, spacing, and color systems", color: "hsl(160 60% 38%)" },
  { icon: Cpu, label: "Writing production code", detail: "Generating semantic HTML, CSS, and interactive JavaScript", color: "hsl(217 91% 55%)" },
  { icon: Wand2, label: "Polishing & optimizing", detail: "Refining accessibility, responsiveness, and performance", color: "hsl(280 70% 55%)" },
  { icon: CheckCircle2, label: "Finalizing output", detail: "Preparing preview, code export, and AI insights", color: "hsl(142 71% 40%)" },
];

const noteColors = [
  { bg: "hsl(200 80% 94%)", border: "hsl(200 70% 80%)", text: "hsl(200 80% 30%)" },
  { bg: "hsl(340 70% 94%)", border: "hsl(340 60% 82%)", text: "hsl(340 70% 30%)" },
  { bg: "hsl(160 55% 93%)", border: "hsl(160 50% 78%)", text: "hsl(160 60% 28%)" },
  { bg: "hsl(262 60% 94%)", border: "hsl(262 50% 82%)", text: "hsl(262 60% 32%)" },
  { bg: "hsl(38 70% 93%)", border: "hsl(38 60% 78%)", text: "hsl(38 70% 30%)" },
  { bg: "hsl(217 65% 94%)", border: "hsl(217 55% 80%)", text: "hsl(217 65% 30%)" },
];

type ResultTab = "preview" | "code" | "analysis" | "insights";

/* ── Syntax Highlighting ── */
function highlightHTML(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#ff6b8a">$2</span>')
    .replace(/([\w-]+)(=)/g, '<span style="color:#ffd580">$1</span>$2')
    .replace(/"([^"]*)"/g, '<span style="color:#a6e3a1">"$1"</span>')
    .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color:#6c7086">$1</span>');
}

function highlightCSS(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/([\w.-]+)\s*:/g, '<span style="color:#89b4fa">$1</span>:')
    .replace(/:\s*([^;{}\n]+)/g, ': <span style="color:#a6e3a1">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6c7086">$1</span>')
    .replace(/([.#][\w-]+)/g, '<span style="color:#ffd580">$1</span>')
    .replace(/(@[\w-]+)/g, '<span style="color:#fab387">$1</span>');
}

function highlightJS(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|new|this|async|await|try|catch)\b/g, '<span style="color:#cba6f7">$1</span>')
    .replace(/"([^"]*)"/g, '<span style="color:#a6e3a1">"$1"</span>')
    .replace(/'([^']*)'/g, "<span style=\"color:#a6e3a1\">'$1'</span>")
    .replace(/`([^`]*)`/g, '<span style="color:#a6e3a1">`$1`</span>')
    .replace(/(\/\/.*)/g, '<span style="color:#6c7086">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#fab387">$1</span>');
}

function getHighlightedCode(code: string, tab: "html" | "css" | "js"): string {
  if (tab === "html") return highlightHTML(code);
  if (tab === "css") return highlightCSS(code);
  return highlightJS(code);
}

/* ── Page ── */
export default function TranscriptToUIPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { checkAndIncrement, showLimitPopup, dismissPopup } = useAuditLimit(user?.id ?? null, "transcript");

  const [transcript, setTranscript] = useState("");
  const [role, setRole] = useState("ux-designer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [resultTab, setResultTab] = useState<ResultTab>("preview");
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  /* ── Loading step animation ── */
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 3200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  /* ── Session History ── */
  useEffect(() => {
    const key = `fixux_sessions_${user?.id || "anon"}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) setSessions(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [user?.id]);

  const saveSession = useCallback(
    (res: GeneratedResult) => {
      const session: Session = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        role,
        transcript: transcript.slice(0, 200),
        result: res,
      };
      const key = `fixux_sessions_${user?.id || "anon"}`;
      const updated = [session, ...sessions].slice(0, 20);
      setSessions(updated);
      localStorage.setItem(key, JSON.stringify(updated));
    },
    [role, transcript, sessions, user?.id]
  );

  /* ── Generate ── */
  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error("Please paste a meeting transcript first");
      return;
    }
    if (user) {
      const allowed = checkAndIncrement();
      if (!allowed) return;
    }
    setIsGenerating(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-ui", {
        body: { transcript: transcript.trim(), role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      setResultTab("preview");
      saveSession(data);
    } catch (e: unknown) {
      console.error("Generate UI error:", e);
      toast.error(e instanceof Error ? e.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Preview ── */
  const previewSrcDoc = useMemo(() => {
    if (!result) return "";
    return `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}\n${result.css}</style>\n</head>\n<body>${result.html}\n<script>${result.js}<\/script>\n</body>\n</html>`;
  }, [result]);

  /* ── Copy ── */
  const copyCode = useCallback((code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(label);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedTab(null), 2000);
  }, []);

  const copyAll = useCallback(() => {
    if (!result) return;
    const full = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${result.css}\n</style>\n</head>\n<body>\n${result.html}\n<script>\n${result.js}\n</script>\n</body>\n</html>`;
    navigator.clipboard.writeText(full);
    setCopiedTab("all");
    toast.success("Full HTML copied!");
    setTimeout(() => setCopiedTab(null), 2000);
  }, [result]);

  const loadSession = useCallback((session: Session) => {
    setResult(session.result);
    setRole(session.role);
    setShowHistory(false);
    setResultTab("preview");
  }, []);

  const activeCode = result
    ? activeTab === "html" ? result.html : activeTab === "css" ? result.css : result.js
    : "";

  const highlightedCode = useMemo(() => {
    if (!activeCode) return "";
    return getHighlightedCode(activeCode, activeTab);
  }, [activeCode, activeTab]);

  const activeRole = roles.find((r) => r.id === role);

  const resultTabs: { id: ResultTab; label: string; icon: typeof Eye }[] = [
    { id: "preview", label: "Preview", icon: Eye },
    { id: "code", label: "Code", icon: Code2 },
    { id: "analysis", label: "Analysis", icon: LayoutDashboard },
    { id: "insights", label: "AI Insights", icon: Sparkles },
  ];

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-background flex flex-col page-parallax">
      {/* ═══ Dual Navigation ═══ */}
      <SiteNav
        announcementText="TranscriptToUI · Paste a meeting transcript → get production-ready UI instantly"
        rightSlot={
          sessions.length > 0 ? (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-all uppercase tracking-wide"
            >
              <Clock className="w-3 h-3" />
              History
              <span className="ml-1 w-4 h-4 text-[9px] font-bold flex items-center justify-center bg-primary text-primary-foreground">
                {sessions.length}
              </span>
            </button>
          ) : undefined
        }
      />

      <main className="flex-1 flex flex-col max-w-6xl mx-auto px-6 py-6 w-full">
        {/* ═══ Input Section ═══ */}
        {!result && !isGenerating && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Role selector */}
            <div className="mb-5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] block mb-3">
                Generate as
              </label>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border"
                    style={{
                      background: role === r.id ? r.color : "hsl(var(--card))",
                      color: role === r.id ? "white" : "hsl(var(--muted-foreground))",
                      borderColor: role === r.id ? r.color : "hsl(var(--border))",
                      boxShadow: role === r.id ? `0 4px 14px -4px ${r.color}` : "none",
                    }}
                  >
                    <span className="text-sm">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript input */}
            <div className="border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Meeting Transcript</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {transcript.length > 0 ? `${transcript.split(/\s+/).filter(Boolean).length} words` : ""}
                </span>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={`Paste your meeting transcript here…\n\nExample:\n"We discussed building a dashboard with sidebar navigation, key metrics cards at the top, a chart for monthly revenue, and a recent activity feed…"`}
                className="w-full resize-none text-sm p-5 leading-relaxed focus:outline-none bg-card text-foreground min-h-[220px] max-h-[320px]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {activeRole && (
                    <>
                      <span className="w-2 h-2 rounded-full" style={{ background: activeRole.color }} />
                      Generating as <strong>{activeRole.label}</strong>
                    </>
                  )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!transcript.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
                  style={{ boxShadow: !transcript.trim() ? "none" : "0 4px 14px -4px hsl(var(--primary) / 0.5)" }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Generate UI
                </button>
              </div>
            </div>

            {/* Empty hint */}
            <div className="text-center py-16 opacity-40">
              <div className="text-5xl mb-4">🖥️</div>
              <p className="text-sm text-muted-foreground font-medium">Your AI-generated interface will appear here</p>
            </div>
          </motion.section>
        )}

        {/* ═══ Loading State ═══ */}
        <AnimatePresence>
          {isGenerating && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12"
            >
              <div className="max-w-lg mx-auto">
                {/* Radar animation */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                  <div className="absolute inset-3 border-2 border-primary/15 rounded-full" />
                  <div className="absolute inset-6 border-2 border-primary/10 rounded-full" />
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.3) 60deg, transparent 120deg)`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Brain className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>
                </div>

                <h3 className="text-center text-lg font-bold text-foreground mb-2">Generating Your UI</h3>
                <p className="text-center text-xs text-muted-foreground mb-8">
                  AI is analyzing your transcript and building a production-ready interface
                </p>

                {/* Progress steps */}
                <div className="space-y-1">
                  {loadingSteps.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i === loadingStep;
                    const isDone = i < loadingStep;
                    const isPending = i > loadingStep;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 px-4 py-3 transition-all"
                        style={{
                          background: isActive ? `${step.color}08` : "transparent",
                          borderLeft: isActive ? `3px solid ${step.color}` : "3px solid transparent",
                          opacity: isPending ? 0.35 : 1,
                        }}
                      >
                        <div className="w-7 h-7 shrink-0 flex items-center justify-center" style={{ background: isDone ? "hsl(142 71% 40% / 0.1)" : isActive ? `${step.color}15` : "hsl(var(--accent))" }}>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" style={{ color: "hsl(142 71% 40%)" }} />
                          ) : isActive ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                              <Icon className="w-4 h-4" style={{ color: step.color }} />
                            </motion.div>
                          ) : (
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground">{step.label}</p>
                          {(isActive || isDone) && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="text-[11px] text-muted-foreground leading-snug mt-0.5"
                            >
                              {step.detail}
                            </motion.p>
                          )}
                        </div>
                        {isDone && <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "hsl(142 71% 40%)" }}>Done</span>}
                        {isActive && (
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-[9px] font-bold uppercase tracking-wider"
                            style={{ color: step.color }}
                          >
                            Processing
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="mt-6 h-1 bg-accent overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                  Step {loadingStep + 1} of {loadingSteps.length}
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ═══ Results ═══ */}
        <AnimatePresence>
          {result && !isGenerating && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 flex flex-col min-h-0">
              {/* New generation button */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {activeRole && (
                    <>
                      <span className="w-2 h-2 rounded-full" style={{ background: activeRole.color }} />
                      Generated as <strong>{activeRole.label}</strong>
                    </>
                  )}
                </div>
                <button
                  onClick={() => { setResult(null); }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-all"
                >
                  <ArrowLeft className="w-3 h-3" /> New Transcript
                </button>
              </div>

              {/* ── Tab Navigation ── */}
              <div className="flex items-center gap-0 border-b border-border bg-muted/50 mb-0">
                {resultTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = resultTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setResultTab(tab.id)}
                      className="flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all relative"
                      style={{
                        color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                        background: isActive ? "hsl(var(--card))" : "transparent",
                        borderBottom: isActive ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ── Tab Content ── */}
              <div className="border border-border border-t-0 bg-card flex-1 flex flex-col min-h-0" style={{ minHeight: "calc(100vh - 280px)" }}>
                {/* Preview Tab */}
                {resultTab === "preview" && (
                  <div className="relative">
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={() => setShowPreviewModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-card/90 border border-border hover:bg-accent transition-all"
                        style={{ backdropFilter: "blur(4px)" }}
                      >
                        <Maximize2 className="w-3 h-3" /> Fullscreen
                      </button>
                    </div>
                    <iframe
                      title="Live Preview"
                      srcDoc={previewSrcDoc}
                      className="w-full border-0 flex-1"
                      style={{ height: "calc(100vh - 300px)", minHeight: "500px" }}
                      sandbox="allow-scripts"
                    />
                  </div>
                )}

                {/* Code Tab */}
                {resultTab === "code" && (
                  <div style={{ background: "hsl(220 13% 10%)" }}>
                    <div className="flex items-center justify-between px-4 pt-3 pb-0">
                      <div className="flex items-center gap-0">
                        {(["html", "css", "js"] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider transition-all"
                            style={{
                              color: activeTab === tab ? "white" : "hsl(220 10% 40%)",
                              borderBottom: activeTab === tab
                                ? `2px solid ${tab === "html" ? "#ff6b8a" : tab === "css" ? "#89b4fa" : "#fab387"}`
                                : "2px solid transparent",
                            }}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyCode(activeCode, activeTab.toUpperCase())}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold transition-colors"
                          style={{ color: "hsl(0 0% 100% / 0.5)" }}
                        >
                          {copiedTab === activeTab.toUpperCase() ? <Check className="w-3 h-3" style={{ color: "#a6e3a1" }} /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                        <button
                          onClick={copyAll}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold transition-colors"
                          style={{ color: "white", background: "hsl(0 0% 100% / 0.08)" }}
                        >
                          {copiedTab === "all" ? <Check className="w-3 h-3" style={{ color: "#a6e3a1" }} /> : <Copy className="w-3 h-3" />}
                          Copy All
                        </button>
                      </div>
                    </div>
                    <div className="p-5 overflow-auto flex-1" style={{ height: "calc(100vh - 360px)", minHeight: "400px" }}>
                      <div className="flex font-mono text-[12px] leading-[1.8]">
                        <div className="pr-4 select-none text-right shrink-0" style={{ color: "hsl(220 10% 30%)", minWidth: "2.5rem" }}>
                          {activeCode.split("\n").map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        <pre className="flex-1 whitespace-pre-wrap break-words" style={{ color: "#cdd6f4" }}
                          dangerouslySetInnerHTML={{ __html: highlightedCode }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Tab */}
                {resultTab === "analysis" && (
                  <div className="p-6 overflow-auto" style={{ height: "calc(100vh - 300px)", minHeight: "400px" }}>
                    {/* Summary */}
                    {result.summary && (
                      <div className="mb-5 p-5 border border-primary/20" style={{ background: "hsl(var(--primary) / 0.04)" }}>
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-foreground mb-1">Summary</h4>
                            <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Analysis cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                      {result.whatTheyAsked && (
                        <div className="p-4 border" style={{ borderColor: "hsl(217 91% 55% / 0.25)", background: "hsl(217 91% 55% / 0.04)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-3.5 h-3.5" style={{ color: "hsl(217 91% 55%)" }} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "hsl(217 91% 55%)" }}>Stakeholder Request</span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{result.whatTheyAsked}</p>
                        </div>
                      )}
                      {result.howDesigned && (
                        <div className="p-4 border" style={{ borderColor: "hsl(38 92% 50% / 0.25)", background: "hsl(38 92% 50% / 0.04)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Paintbrush className="w-3.5 h-3.5" style={{ color: "hsl(38 92% 50%)" }} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "hsl(38 80% 40%)" }}>Design Rationale</span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{result.howDesigned}</p>
                        </div>
                      )}
                      {result.solutionImpact && (
                        <div className="p-4 border" style={{ borderColor: "hsl(160 60% 38% / 0.25)", background: "hsl(160 60% 38% / 0.04)" }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Rocket className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Solution Impact</span>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{result.solutionImpact}</p>
                        </div>
                      )}
                    </div>

                    {/* Key Notes with colors */}
                    {result.keyNotes && result.keyNotes.length > 0 && (
                      <div className="mb-5">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
                          <FileText className="w-3 h-3" /> Key Notes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {result.keyNotes.map((note, i) => {
                            const clr = noteColors[i % noteColors.length];
                            return (
                              <div key={i} className="flex items-start gap-3 px-4 py-3 border" style={{ background: clr.bg, borderColor: clr.border }}>
                                <span className="w-5 h-5 shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5" style={{ background: clr.text, color: "white" }}>{i + 1}</span>
                                <p className="text-xs leading-relaxed font-medium" style={{ color: clr.text }}>{note}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Meeting Meta */}
                    {result.meetingMeta && (
                      <div className="flex flex-wrap gap-3">
                        {result.meetingMeta.participants?.length > 0 && (
                          <div className="border border-border bg-accent/30 px-4 py-3 flex-1 min-w-[180px]">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Participants</span>
                            <div className="flex flex-wrap gap-1.5">
                              {result.meetingMeta.participants.map((p, i) => {
                                const clr = noteColors[i % noteColors.length];
                                return (
                                  <span key={i} className="px-2.5 py-1 text-[11px] font-semibold border" style={{ background: clr.bg, borderColor: clr.border, color: clr.text }}>{p}</span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {result.meetingMeta.duration && (
                          <div className="border border-border bg-accent/30 px-4 py-3">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Duration</span>
                            <span className="text-lg font-extrabold text-foreground">{result.meetingMeta.duration}</span>
                          </div>
                        )}
                        {result.meetingMeta.topics?.length > 0 && (
                          <div className="border border-border bg-accent/30 px-4 py-3 flex-1 min-w-[180px]">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Topics</span>
                            <div className="flex flex-wrap gap-1.5">
                              {result.meetingMeta.topics.map((t, i) => {
                                const clr = noteColors[(i + 2) % noteColors.length];
                                return (
                                  <span key={i} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border" style={{ background: clr.bg, borderColor: clr.border, color: clr.text }}>{t}</span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Insights Tab */}
                {resultTab === "insights" && (
                  <div className="p-6 overflow-auto" style={{ height: "calc(100vh - 300px)", minHeight: "400px" }}>
                    {result.suggestions?.length > 0 ? (
                      <div className="space-y-2">
                        {result.suggestions.map((s, i) => {
                          const config = categoryConfig[s.category] || categoryConfig.Insight;
                          const Icon = config.icon;
                          const isExpanded = expandedInsight === i;
                          return (
                            <button
                              key={i}
                              onClick={() => setExpandedInsight(isExpanded ? null : i)}
                              className="w-full text-left border transition-all"
                              style={{
                                borderColor: isExpanded ? config.color + "40" : "hsl(var(--border))",
                                background: isExpanded ? config.bg : "transparent",
                              }}
                            >
                              <div className="px-5 py-4 flex items-center gap-4">
                                <div className="w-9 h-9 shrink-0 flex items-center justify-center" style={{ background: config.bg, border: `1px solid ${config.color}30` }}>
                                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5" style={{ background: config.color, color: "white" }}>
                                      {s.category}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground truncate">{s.title}</p>
                                </div>
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                              </div>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-5 pb-4 pl-[4.75rem]">
                                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-muted-foreground">
                        <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No insights generated</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ History Drawer ═══ */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "hsl(var(--foreground) / 0.3)" }}
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-96 z-50 flex flex-col bg-card border-l border-border"
              style={{ boxShadow: "-8px 0 30px -10px hsl(var(--foreground) / 0.15)" }}
            >
              <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <span className="text-sm font-bold text-foreground">Session History</span>
                <button onClick={() => setShowHistory(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    No sessions yet
                  </div>
                ) : (
                  sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadSession(s)}
                      className="w-full p-4 text-left transition-colors hover:bg-accent border-b border-border"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{new Date(s.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-foreground font-semibold truncate">{s.transcript}…</p>
                      <span className="text-[10px] mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-muted-foreground border border-border">
                        {roles.find((r) => r.id === s.role)?.icon} {roles.find((r) => r.id === s.role)?.label || s.role}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Preview Modal ═══ */}
      <AnimatePresence>
        {showPreviewModal && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "hsl(var(--foreground) / 0.85)", backdropFilter: "blur(12px)" }}
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col bg-card border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3 flex items-center justify-between border-b border-border">
                <span className="text-sm font-extrabold text-foreground">Full Preview</span>
                <button onClick={() => setShowPreviewModal(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <iframe title="Full Preview" srcDoc={previewSrcDoc} className="flex-1 w-full border-0" sandbox="allow-scripts" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Limit Popup ═══ */}
      <AnimatePresence>
        {showLimitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "hsl(var(--foreground) / 0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border p-8 max-w-sm mx-4 text-center"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold text-foreground mb-2">Daily Limit Reached</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You've used your 2 free TranscriptToUI generations today. Come back tomorrow!
              </p>
              <button onClick={dismissPopup} className="px-6 py-2.5 text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors">
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
