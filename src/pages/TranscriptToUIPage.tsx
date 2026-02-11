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
  History,
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  { id: "ux-designer", label: "UX Designer", icon: "🎨" },
  { id: "product-manager", label: "Product Manager", icon: "📋" },
  { id: "developer", label: "Developer", icon: "💻" },
  { id: "qa-engineer", label: "QA Engineer", icon: "🧪" },
  { id: "stakeholder", label: "Stakeholder", icon: "👔" },
];

const categoryMeta: Record<string, { icon: typeof TrendingUp; color: string }> = {
  Improvement: { icon: TrendingUp, color: "border-emerald-500/30 bg-emerald-500/5" },
  Insight: { icon: Lightbulb, color: "border-blue-500/30 bg-blue-500/5" },
  "Action Item": { icon: AlertCircle, color: "border-amber-500/30 bg-amber-500/5" },
};

/* ── Simple Syntax Highlighting ── */
function highlightHTML(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#ef6b73">$2</span>')
    .replace(/([\w-]+)(=)/g, '<span style="color:#ffcc66">$1</span>$2')
    .replace(/"([^"]*)"/g, '<span style="color:#bae67e">"$1"</span>')
    .replace(/(&lt;!--.*?--&gt;)/g, '<span style="color:#5c6773">$1</span>');
}

function highlightCSS(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/([\w.-]+)\s*:/g, '<span style="color:#73d0ff">$1</span>:')
    .replace(/:\s*([^;{}\n]+)/g, ': <span style="color:#bae67e">$1</span>')
    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#5c6773">$1</span>')
    .replace(/([.#][\w-]+)/g, '<span style="color:#ffcc66">$1</span>')
    .replace(/(@[\w-]+)/g, '<span style="color:#ffa759">$1</span>');
}

function highlightJS(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|new|this|async|await|try|catch)\b/g, '<span style="color:#ffa759">$1</span>')
    .replace(/"([^"]*)"/g, '<span style="color:#bae67e">"$1"</span>')
    .replace(/'([^']*)'/g, "<span style=\"color:#bae67e\">'$1'</span>")
    .replace(/`([^`]*)`/g, '<span style="color:#bae67e">`$1`</span>')
    .replace(/(\/\/.*)/g, '<span style="color:#5c6773">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#e6b450">$1</span>');
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
  const { checkAndIncrement, showLimitPopup, dismissPopup } = useAuditLimit(user?.id ?? null);

  const [transcript, setTranscript] = useState("");
  const [role, setRole] = useState("ux-designer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

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

  /* ── Render ── */
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ═══ Top Bar ═══ */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="px-6 py-3 flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <FixUxLogo size="sm" />
            <div className="w-px h-5 bg-border" />
            <span className="text-base font-bold text-foreground tracking-tight">TranscriptToUI</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              Beta
            </span>
          </div>

          {/* Role pills — center */}
          <div className="flex items-center gap-1 mx-auto">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-all tracking-wide ${
                  role === r.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="mr-1">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          {/* History */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Session history"
          >
            <History className="w-4 h-4" />
            {sessions.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                {sessions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ═══ Main Area ═══ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── LEFT: Transcript Input ── */}
        <div className="w-[32%] flex flex-col border-r border-border min-w-0 shrink-0">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Transcript
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !transcript.trim()}
              className={`flex items-center gap-2 px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                isGenerating || !transcript.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background hover:opacity-90 active:scale-[0.97]"
              }`}
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              {isGenerating ? "Generating…" : "Generate UI"}
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={`Paste your meeting transcript here…\n\nExample:\n"We discussed building a dashboard with sidebar navigation, key metrics cards at the top, a chart for monthly revenue, and a recent activity feed on the right side…"`}
            className="flex-1 w-full resize-none bg-background text-foreground text-sm p-5 leading-relaxed focus:outline-none placeholder:text-muted-foreground/40"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />

          {/* Summary + Key Notes */}
          {result && (
            <div className="border-t border-border bg-card overflow-y-auto max-h-[40%]">
              {result.summary && (
                <div className="p-5 border-b border-border">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Summary
                  </h4>
                  <p className="text-[13px] text-foreground leading-relaxed">{result.summary}</p>
                </div>
              )}

              {result.keyNotes && result.keyNotes.length > 0 && (
                <div className="p-5 border-b border-border">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Key Notes
                  </h4>
                  <ul className="space-y-1.5">
                    {result.keyNotes.map((note, i) => (
                      <li key={i} className="text-[12px] text-foreground leading-relaxed flex gap-2">
                        <span className="text-primary font-bold shrink-0">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.whatTheyAsked && (
                <div className="p-5 border-b border-border">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> What They Asked
                  </h4>
                  <p className="text-[12px] text-foreground leading-relaxed">{result.whatTheyAsked}</p>
                </div>
              )}

              {result.howDesigned && (
                <div className="p-5 border-b border-border">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Paintbrush className="w-3 h-3" /> How It Was Designed
                  </h4>
                  <p className="text-[12px] text-foreground leading-relaxed">{result.howDesigned}</p>
                </div>
              )}

              {result.solutionImpact && (
                <div className="p-5">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Rocket className="w-3 h-3" /> Solution & Impact
                  </h4>
                  <p className="text-[12px] text-foreground leading-relaxed">{result.solutionImpact}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CENTER: Code Editor (dark bg) ── */}
        <div className="w-[34%] flex flex-col border-r border-border min-w-0 shrink-0">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2 bg-card">
            {(["html", "css", "js"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => copyCode(activeCode, activeTab.toUpperCase())}
                disabled={!result}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20"
              >
                {copiedTab === activeTab.toUpperCase() ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
              <button
                onClick={copyAll}
                disabled={!result}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors disabled:opacity-20"
              >
                {copiedTab === "all" ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                Copy All
              </button>
            </div>
          </div>

          {/* Dark code area */}
          <div className="flex-1 overflow-auto" style={{ backgroundColor: "#1a1f29" }}>
            {result ? (
              <div className="p-5">
                {/* Line numbers + code */}
                <div className="flex text-[12px] font-mono leading-[1.7]">
                  <div className="pr-4 select-none text-right shrink-0" style={{ color: "#4a5568", minWidth: "2.5rem" }}>
                    {activeCode.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre
                    className="flex-1 whitespace-pre-wrap break-words"
                    style={{ color: "#d4d4d8" }}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: "#4a5568" }}>
                <div className="text-center">
                  <span className="text-5xl block mb-4 opacity-30">{"</>"}</span>
                  <span className="text-sm font-mono">Generated code appears here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-card">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Preview
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${result ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/20"}`}
                />
                <span className="text-[10px] text-muted-foreground font-medium">
                  {result ? "Live" : "Waiting"}
                </span>
              </div>
            </div>
            {result && (
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <Maximize2 className="w-3 h-3" />
                Enlarge
              </button>
            )}
          </div>
          <div className="flex-1 bg-white">
            {result ? (
              <iframe
                title="Live Preview"
                srcDoc={previewSrcDoc}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-card">
                <div className="text-center text-muted-foreground/30">
                  <span className="text-5xl block mb-4">🖥️</span>
                  <span className="text-sm">Live preview renders here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Session History Drawer ── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-border shadow-2xl z-20 flex flex-col"
            >
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  History
                </span>
                <button onClick={() => setShowHistory(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground/40 text-sm">
                    <History className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    No sessions yet
                  </div>
                ) : (
                  sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadSession(s)}
                      className="w-full p-4 border-b border-border text-left hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(s.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-medium truncate group-hover:text-primary transition-colors">
                        {s.transcript}…
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {roles.find((r) => r.id === s.role)?.label || s.role}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Bottom Insights Panel ═══ */}
      {result && (
        <div className="border-t border-border bg-card shrink-0">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full px-6 py-2.5 flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-widest hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI Insights & Meeting Details
            </span>
            {showInsights ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showInsights && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5">
                  {/* Meeting Meta row */}
                  {result.meetingMeta && (
                    <div className="flex gap-8 mb-5 pb-4 border-b border-border">
                      {result.meetingMeta.participants?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                            Participants
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.meetingMeta.participants.map((p, i) => (
                              <span key={i} className="px-2.5 py-1 bg-muted text-[11px] text-foreground font-medium">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.meetingMeta.duration && (
                        <div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                            Duration
                          </span>
                          <span className="text-[13px] text-foreground font-medium">{result.meetingMeta.duration}</span>
                        </div>
                      )}
                      {result.meetingMeta.topics?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                            Topics
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.meetingMeta.topics.map((t, i) => (
                              <span key={i} className="px-2.5 py-1 bg-primary/5 border border-primary/15 text-[11px] text-foreground font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestion cards */}
                  {result.suggestions?.length > 0 && (
                    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                      {result.suggestions.map((s, i) => {
                        const meta = categoryMeta[s.category] || categoryMeta.Insight;
                        const Icon = meta.icon;
                        return (
                          <div key={i} className={`p-4 border ${meta.color}`}>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">{s.category}</span>
                            </div>
                            <p className="text-[12px] font-semibold text-foreground leading-snug mb-1">{s.title}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{s.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══ Preview Modal ═══ */}
      <AnimatePresence>
        {showPreviewModal && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full max-w-7xl max-h-[92vh] bg-white border border-border overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-card">
                <span className="text-sm font-bold text-foreground">Full Preview</span>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
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

      {/* ═══ Daily Limit Popup ═══ */}
      <AnimatePresence>
        {showLimitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={dismissPopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-background border border-border p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-5">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Daily Limit Reached</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                You've used your <strong className="text-foreground">2 free uses</strong> for today. Come back tomorrow!
              </p>
              <Button onClick={dismissPopup} className="w-full" size="lg">
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
