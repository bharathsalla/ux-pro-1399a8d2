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
} from "lucide-react";
import { FixUxLogo } from "@/components/FixUxLogo";

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
  { id: "product-manager", label: "PM", icon: "📋", color: "hsl(262 83% 58%)" },
  { id: "developer", label: "Developer", icon: "💻", color: "hsl(200 90% 48%)" },
  { id: "qa-engineer", label: "QA", icon: "🧪", color: "hsl(160 60% 38%)" },
  { id: "stakeholder", label: "Stakeholder", icon: "👔", color: "hsl(30 90% 50%)" },
];

const categoryConfig: Record<string, { icon: typeof TrendingUp; color: string; bg: string }> = {
  Improvement: { icon: TrendingUp, color: "hsl(160 60% 35%)", bg: "hsl(160 50% 95%)" },
  Insight: { icon: Lightbulb, color: "hsl(220 60% 45%)", bg: "hsl(220 50% 95%)" },
  "Action Item": { icon: AlertCircle, color: "hsl(30 80% 42%)", bg: "hsl(30 60% 95%)" },
};

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
  const [activeView, setActiveView] = useState<"preview" | "code">("preview");
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

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
    try {
      const { data, error } = await supabase.functions.invoke("generate-ui", {
        body: { transcript: transcript.trim(), role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
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
  }, []);

  const activeCode = result
    ? activeTab === "html" ? result.html : activeTab === "css" ? result.css : result.js
    : "";

  const highlightedCode = useMemo(() => {
    if (!activeCode) return "";
    return getHighlightedCode(activeCode, activeTab);
  }, [activeCode, activeTab]);

  const activeRole = roles.find((r) => r.id === role);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-background">
      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80" style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <FixUxLogo size="sm" />
              <div className="w-px h-5 bg-border" />
              <span className="text-base font-extrabold text-foreground tracking-tight">TranscriptToUI</span>
              <span className="text-[8px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase bg-primary text-primary-foreground">
                BETA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sessions.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                History
                <span className="ml-1 w-5 h-5 text-[10px] font-bold flex items-center justify-center bg-primary text-primary-foreground">
                  {sessions.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ═══ Step 1 — Input ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border"
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

          {/* Transcript input card */}
          <div className="border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                  Meeting Transcript
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {transcript.length > 0 ? `${transcript.split(/\s+/).filter(Boolean).length} words` : ""}
              </span>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={`Paste your meeting transcript here…\n\nExample:\n"We discussed building a dashboard with sidebar navigation, key metrics cards at the top, a chart for monthly revenue, and a recent activity feed…"`}
              className="w-full resize-none text-sm p-5 leading-relaxed focus:outline-none bg-card text-foreground min-h-[180px] max-h-[280px]"
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
                disabled={isGenerating || !transcript.trim()}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
                style={{
                  boxShadow: isGenerating || !transcript.trim() ? "none" : "0 4px 14px -4px hsl(var(--primary) / 0.5)",
                }}
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {isGenerating ? "Generating…" : "Generate UI"}
              </button>
            </div>
          </div>
        </motion.section>

        {/* ═══ Results ═══ */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* ── Summary Card ── */}
              {result.summary && (
                <div className="mb-6 border border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary/10">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-1">Summary</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Analysis Cards Grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {result.whatTheyAsked && (
                  <div className="border border-border bg-card p-5 group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 flex items-center justify-center" style={{ background: "hsl(217 91% 55% / 0.1)" }}>
                        <Users className="w-3.5 h-3.5" style={{ color: "hsl(217 91% 55%)" }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Stakeholder Request</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{result.whatTheyAsked}</p>
                  </div>
                )}
                {result.howDesigned && (
                  <div className="border border-border bg-card p-5 group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 flex items-center justify-center" style={{ background: "hsl(38 92% 50% / 0.1)" }}>
                        <Paintbrush className="w-3.5 h-3.5" style={{ color: "hsl(38 92% 50%)" }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Design Rationale</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{result.howDesigned}</p>
                  </div>
                )}
                {result.solutionImpact && (
                  <div className="border border-border bg-card p-5 group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 flex items-center justify-center" style={{ background: "hsl(160 60% 38% / 0.1)" }}>
                        <Rocket className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Solution Impact</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{result.solutionImpact}</p>
                  </div>
                )}
              </div>

              {/* ── Key Notes ── */}
              {result.keyNotes && result.keyNotes.length > 0 && (
                <div className="mb-6 border border-border bg-card p-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Key Notes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keyNotes.map((note, i) => (
                      <span key={i} className="inline-flex items-center gap-2 px-3 py-2 text-xs text-foreground border border-border bg-accent/50">
                        <span className="w-5 h-5 shrink-0 flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground">{i + 1}</span>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Meeting Meta ── */}
              {result.meetingMeta && (
                <div className="mb-6 flex flex-wrap gap-4">
                  {result.meetingMeta.participants?.length > 0 && (
                    <div className="border border-border bg-card px-5 py-4 flex-1 min-w-[200px]">
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Participants</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.meetingMeta.participants.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 text-[11px] font-semibold border border-border bg-accent text-foreground">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.meetingMeta.duration && (
                    <div className="border border-border bg-card px-5 py-4">
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Duration</span>
                      <span className="text-lg font-extrabold text-foreground">{result.meetingMeta.duration}</span>
                    </div>
                  )}
                  {result.meetingMeta.topics?.length > 0 && (
                    <div className="border border-border bg-card px-5 py-4 flex-1 min-w-[200px]">
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Topics</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.meetingMeta.topics.map((t, i) => (
                          <span key={i} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-primary/20 bg-primary/5 text-primary">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Output: Preview + Code ── */}
              <div className="border border-border bg-card overflow-hidden mb-6">
                {/* Toggle bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-1 bg-accent p-1">
                    <button
                      onClick={() => setActiveView("preview")}
                      className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold transition-all"
                      style={{
                        background: activeView === "preview" ? "hsl(var(--card))" : "transparent",
                        color: activeView === "preview" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                        boxShadow: activeView === "preview" ? "0 1px 3px hsl(var(--foreground) / 0.06)" : "none",
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => setActiveView("code")}
                      className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold transition-all"
                      style={{
                        background: activeView === "code" ? "hsl(var(--card))" : "transparent",
                        color: activeView === "code" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                        boxShadow: activeView === "code" ? "0 1px 3px hsl(var(--foreground) / 0.06)" : "none",
                      }}
                    >
                      <Code2 className="w-3.5 h-3.5" /> Code
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeView === "preview" && (
                      <button
                        onClick={() => setShowPreviewModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-all"
                      >
                        <Maximize2 className="w-3 h-3" /> Fullscreen
                      </button>
                    )}
                    {activeView === "code" && (
                      <>
                        <button
                          onClick={() => copyCode(activeCode, activeTab.toUpperCase())}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-all"
                        >
                          {copiedTab === activeTab.toUpperCase() ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                        <button
                          onClick={copyAll}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-foreground text-background hover:bg-foreground/90 transition-all"
                        >
                          {copiedTab === "all" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy All
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content area */}
                <div className="relative" style={{ minHeight: "480px" }}>
                  {activeView === "preview" ? (
                    <iframe
                      title="Live Preview"
                      srcDoc={previewSrcDoc}
                      className="w-full border-0"
                      style={{ height: "480px" }}
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div style={{ background: "hsl(220 13% 10%)" }}>
                      {/* Code tabs */}
                      <div className="flex items-center gap-0 px-4 pt-3">
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
                      <div className="p-5 overflow-auto" style={{ height: "440px" }}>
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
                </div>
              </div>

              {/* ── AI Insights ── */}
              {result.suggestions?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Insights
                  </h4>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => {
                      const config = categoryConfig[s.category] || categoryConfig.Insight;
                      const Icon = config.icon;
                      const isExpanded = expandedInsight === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setExpandedInsight(isExpanded ? null : i)}
                          className="w-full text-left border border-border bg-card hover:border-primary/20 transition-all"
                        >
                          <div className="px-5 py-4 flex items-center gap-4">
                            <div className="w-8 h-8 shrink-0 flex items-center justify-center" style={{ background: config.bg }}>
                              <Icon className="w-4 h-4" style={{ color: config.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5" style={{ background: config.bg, color: config.color }}>
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
                                <div className="px-5 pb-4 pl-[4.25rem]">
                                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Empty State ═══ */}
        {!result && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4 opacity-30">🖥️</div>
            <p className="text-sm text-muted-foreground font-medium">Paste a transcript and hit Generate UI</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Your AI-generated interface will appear here</p>
          </motion.div>
        )}

        {/* ═══ Generating State ═══ */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground">Generating your UI…</p>
            <p className="text-xs text-muted-foreground mt-1">This usually takes 15–30 seconds</p>
          </motion.div>
        )}
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
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(s.timestamp).toLocaleString()}
                        </span>
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
              <iframe
                title="Full Preview"
                srcDoc={previewSrcDoc}
                className="flex-1 w-full border-0"
                sandbox="allow-scripts"
              />
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
              <button
                onClick={dismissPopup}
                className="px-6 py-2.5 text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
