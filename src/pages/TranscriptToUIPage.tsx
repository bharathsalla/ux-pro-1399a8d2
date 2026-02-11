import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
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
  GripHorizontal,
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
  { id: "ux-designer", label: "UX Designer", icon: "🎨", gradient: "from-rose-500 to-pink-600" },
  { id: "product-manager", label: "PM", icon: "📋", gradient: "from-violet-500 to-purple-600" },
  { id: "developer", label: "Developer", icon: "💻", gradient: "from-cyan-500 to-blue-600" },
  { id: "qa-engineer", label: "QA", icon: "🧪", gradient: "from-emerald-500 to-green-600" },
  { id: "stakeholder", label: "Stakeholder", icon: "👔", gradient: "from-amber-500 to-orange-600" },
];

const categoryStyles: Record<string, { icon: typeof TrendingUp; bg: string; border: string; badge: string }> = {
  Improvement: {
    icon: TrendingUp,
    bg: "bg-gradient-to-br from-emerald-500/8 to-emerald-500/3",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-700",
  },
  Insight: {
    icon: Lightbulb,
    bg: "bg-gradient-to-br from-blue-500/8 to-blue-500/3",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-700",
  },
  "Action Item": {
    icon: AlertCircle,
    bg: "bg-gradient-to-br from-amber-500/8 to-amber-500/3",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-700",
  },
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

  const dragControls = useDragControls();
  const insightsPanelRef = useRef<HTMLDivElement>(null);

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
      setShowInsights(true);
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
    setShowInsights(true);
  }, []);

  const activeCode = result
    ? activeTab === "html" ? result.html : activeTab === "css" ? result.css : result.js
    : "";

  const highlightedCode = useMemo(() => {
    if (!activeCode) return "";
    return getHighlightedCode(activeCode, activeTab);
  }, [activeCode, activeTab]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100) {
      setShowInsights(false);
    }
  };

  const activeRole = roles.find((r) => r.id === role);

  /* ── Render ── */
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(220 20% 97%) 0%, hsl(220 15% 94%) 100%)" }}>
      {/* ═══ Top Bar ═══ */}
      <header className="shrink-0 border-b" style={{ borderColor: "hsl(220 15% 88%)", background: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 20% 98%) 100%)" }}>
        <div className="px-6 py-3.5 flex items-center gap-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <FixUxLogo size="sm" />
            <div className="w-px h-5" style={{ background: "hsl(220 15% 85%)" }} />
            <span className="text-base font-extrabold text-foreground tracking-tight">TranscriptToUI</span>
            <span className="text-[8px] font-bold px-2 py-0.5 tracking-[0.15em] uppercase"
              style={{
                background: "linear-gradient(135deg, hsl(262 83% 55%) 0%, hsl(280 70% 60%) 100%)",
                color: "white",
              }}
            >
              BETA
            </span>
          </div>

          {/* Role pills */}
          <div className="flex items-center gap-1 mx-auto bg-card/50 border border-border p-1" style={{ backdropFilter: "blur(8px)" }}>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3.5 py-2 text-[11px] font-bold transition-all tracking-wide flex items-center gap-1.5 ${
                  role === r.id
                    ? "text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                }`}
                style={role === r.id ? {
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  backgroundImage: r.id === "ux-designer" ? "linear-gradient(135deg, #f43f5e, #ec4899)"
                    : r.id === "product-manager" ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                    : r.id === "developer" ? "linear-gradient(135deg, #06b6d4, #3b82f6)"
                    : r.id === "qa-engineer" ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #f59e0b, #ea580c)",
                } : undefined}
              >
                <span className="text-sm">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          {/* History */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="relative p-2.5 text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border hover:bg-white/60"
            title="Session history"
          >
            <History className="w-4 h-4" />
            {sessions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg, hsl(262 83% 55%), hsl(280 70% 60%))" }}
              >
                {sessions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ═══ Main Area ═══ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── LEFT: Transcript ── */}
        <div className="w-[30%] flex flex-col min-w-0 shrink-0" style={{ borderRight: "1px solid hsl(220 15% 88%)" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(220 15% 88%)", background: "hsl(0 0% 100%)" }}>
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Transcript
              </span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !transcript.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isGenerating || !transcript.trim() ? "hsl(220 15% 90%)" : "linear-gradient(135deg, hsl(262 83% 55%) 0%, hsl(280 70% 60%) 100%)",
                color: isGenerating || !transcript.trim() ? "hsl(220 10% 55%)" : "white",
                boxShadow: isGenerating || !transcript.trim() ? "none" : "0 4px 15px -3px hsl(262 83% 55% / 0.4)",
              }}
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {isGenerating ? "Generating…" : "Generate UI"}
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={`Paste your meeting transcript here…\n\nExample:\n"We discussed building a dashboard with sidebar navigation, key metrics cards at the top, a chart for monthly revenue, and a recent activity feed…"`}
            className="flex-1 w-full resize-none text-sm p-5 leading-relaxed focus:outline-none"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: "hsl(0 0% 100%)",
              color: "hsl(220 20% 12%)",
            }}
          />

          {/* Analysis sections */}
          {result && (
            <div className="overflow-y-auto" style={{ maxHeight: "42%", borderTop: "1px solid hsl(220 15% 88%)" }}>
              {result.summary && (
                <div className="p-5" style={{ borderBottom: "1px solid hsl(220 15% 92%)", background: "linear-gradient(135deg, hsl(160 60% 97%) 0%, hsl(200 50% 97%) 100%)" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5" style={{ color: "hsl(160 60% 35%)" }}>
                    <Target className="w-3 h-3" /> Summary
                  </h4>
                  <p className="text-[13px] text-foreground leading-relaxed">{result.summary}</p>
                </div>
              )}

              {result.keyNotes && result.keyNotes.length > 0 && (
                <div className="p-5" style={{ borderBottom: "1px solid hsl(220 15% 92%)", background: "hsl(0 0% 100%)" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5" style={{ color: "hsl(262 83% 50%)" }}>
                    <FileText className="w-3 h-3" /> Key Notes
                  </h4>
                  <ul className="space-y-2">
                    {result.keyNotes.map((note, i) => (
                      <li key={i} className="text-[12px] text-foreground leading-relaxed flex gap-2.5 items-start">
                        <span className="w-5 h-5 shrink-0 flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
                          style={{ background: "linear-gradient(135deg, hsl(262 83% 55%), hsl(280 70% 60%))" }}
                        >{i + 1}</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.whatTheyAsked && (
                <div className="p-5" style={{ borderBottom: "1px solid hsl(220 15% 92%)", background: "hsl(0 0% 100%)" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5" style={{ color: "hsl(217 91% 50%)" }}>
                    <Users className="w-3 h-3" /> What They Asked
                  </h4>
                  <p className="text-[12px] text-foreground leading-relaxed">{result.whatTheyAsked}</p>
                </div>
              )}

              {result.howDesigned && (
                <div className="p-5" style={{ borderBottom: "1px solid hsl(220 15% 92%)", background: "hsl(0 0% 100%)" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5" style={{ color: "hsl(38 92% 45%)" }}>
                    <Paintbrush className="w-3 h-3" /> Design Rationale
                  </h4>
                  <p className="text-[12px] text-foreground leading-relaxed">{result.howDesigned}</p>
                </div>
              )}

              {result.solutionImpact && (
                <div className="p-5" style={{ background: "linear-gradient(135deg, hsl(160 60% 97%) 0%, hsl(140 50% 97%) 100%)" }}>
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5" style={{ color: "hsl(160 60% 35%)" }}>
                    <Rocket className="w-3 h-3" /> Solution Impact
                  </h4>
                  <p className="text-[12px] text-foreground leading-relaxed">{result.solutionImpact}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CENTER: Code Editor ── */}
        <div className="w-[35%] flex flex-col min-w-0 shrink-0" style={{ borderRight: "1px solid hsl(220 15% 88%)" }}>
          <div className="px-4 py-3 flex items-center gap-1.5" style={{ borderBottom: "1px solid hsl(220 10% 20%)", background: "hsl(220 13% 14%)" }}>
            {(["html", "css", "js"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
                style={activeTab === tab ? {
                  background: tab === "html" ? "linear-gradient(135deg, #f43f5e, #ec4899)"
                    : tab === "css" ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                    : "linear-gradient(135deg, #f59e0b, #ea580c)",
                } : undefined}
              >
                {tab === "html" ? "〈/〉" : tab === "css" ? "{ }" : "( )"} {tab}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => copyCode(activeCode, activeTab.toUpperCase())}
                disabled={!result}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors disabled:opacity-20"
                style={{ color: "hsl(0 0% 100% / 0.5)" }}
              >
                {copiedTab === activeTab.toUpperCase() ? <Check className="w-3 h-3" style={{ color: "#a6e3a1" }} /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
              <button
                onClick={copyAll}
                disabled={!result}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold transition-colors disabled:opacity-20"
                style={{ color: "white", background: "hsl(0 0% 100% / 0.08)" }}
              >
                {copiedTab === "all" ? <Check className="w-3 h-3" style={{ color: "#a6e3a1" }} /> : <Copy className="w-3 h-3" />}
                Copy All
              </button>
            </div>
          </div>

          {/* Dark code area */}
          <div className="flex-1 overflow-auto" style={{ background: "hsl(220 13% 10%)" }}>
            {result ? (
              <div className="p-5">
                <div className="flex font-mono text-[12px] leading-[1.8]">
                  <div className="pr-4 select-none text-right shrink-0" style={{ color: "hsl(220 10% 30%)", minWidth: "2.5rem" }}>
                    {activeCode.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre
                    className="flex-1 whitespace-pre-wrap break-words"
                    style={{ color: "#cdd6f4" }}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center" style={{ color: "hsl(220 10% 30%)" }}>
                  <span className="text-5xl block mb-4 opacity-40">{"</>"}</span>
                  <span className="text-sm font-mono">Generated code appears here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Live Preview ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(220 15% 88%)", background: "hsl(0 0% 100%)" }}>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Preview
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${result ? "animate-pulse" : ""}`}
                  style={{ background: result ? "linear-gradient(135deg, #10b981, #059669)" : "hsl(220 10% 80%)" }}
                />
                <span className="text-[10px] font-semibold" style={{ color: result ? "hsl(160 60% 35%)" : "hsl(220 10% 55%)" }}>
                  {result ? "Live" : "Waiting"}
                </span>
              </div>
            </div>
            {result && (
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all border border-border hover:border-foreground/20 hover:bg-white"
              >
                <Maximize2 className="w-3 h-3" />
                Enlarge
              </button>
            )}
          </div>
          <div className="flex-1" style={{ background: "hsl(0 0% 100%)" }}>
            {result ? (
              <iframe
                title="Live Preview"
                srcDoc={previewSrcDoc}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="h-full flex items-center justify-center" style={{ background: "linear-gradient(180deg, hsl(220 15% 97%) 0%, hsl(220 10% 94%) 100%)" }}>
                <div className="text-center" style={{ color: "hsl(220 10% 70%)" }}>
                  <span className="text-6xl block mb-4">🖥️</span>
                  <span className="text-sm font-medium">Live preview renders here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── History Drawer ── */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 z-20 flex flex-col"
              style={{ background: "hsl(0 0% 100%)", borderLeft: "1px solid hsl(220 15% 88%)", boxShadow: "-8px 0 30px -10px hsl(220 20% 12% / 0.15)" }}
            >
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(220 15% 88%)" }}>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                  History
                </span>
                <button onClick={() => setShowHistory(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-8 text-center text-sm" style={{ color: "hsl(220 10% 65%)" }}>
                    <History className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    No sessions yet
                  </div>
                ) : (
                  sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadSession(s)}
                      className="w-full p-4 text-left transition-colors group"
                      style={{ borderBottom: "1px solid hsl(220 15% 92%)" }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(s.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-semibold truncate">{s.transcript}…</p>
                      <span className="text-[10px] text-muted-foreground mt-1 inline-flex items-center gap-1 px-2 py-0.5 mt-1.5"
                        style={{ background: "hsl(262 83% 55% / 0.08)", color: "hsl(262 83% 50%)" }}
                      >
                        {roles.find((r) => r.id === s.role)?.icon} {roles.find((r) => r.id === s.role)?.label || s.role}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Bottom Insights — Draggable Sheet ═══ */}
      <AnimatePresence>
        {result && showInsights && (
          <motion.div
            ref={insightsPanelRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="shrink-0 overflow-hidden"
            style={{
              borderTop: "1px solid hsl(220 15% 88%)",
              background: "linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 20% 98%) 100%)",
              touchAction: "none",
            }}
          >
            {/* Drag handle */}
            <div
              className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full" style={{ background: "hsl(220 15% 80%)" }} />
            </div>

            <button
              onClick={() => setShowInsights(false)}
              className="w-full px-6 py-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" style={{ color: "hsl(262 83% 55%)" }} />
                AI Insights & Meeting Details
              </span>
              <span className="text-[10px] font-medium normal-case tracking-normal" style={{ color: "hsl(220 10% 55%)" }}>
                Drag down or tap to close
              </span>
            </button>

            <div className="px-6 pb-5 max-h-[280px] overflow-y-auto">
              {/* Meeting Meta */}
              {result.meetingMeta && (
                <div className="flex gap-8 mb-5 pb-4" style={{ borderBottom: "1px solid hsl(220 15% 92%)" }}>
                  {result.meetingMeta.participants?.length > 0 && (
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] block mb-2" style={{ color: "hsl(220 10% 50%)" }}>
                        Participants
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.meetingMeta.participants.map((p, i) => (
                          <span key={i} className="px-3 py-1 text-[11px] font-semibold"
                            style={{
                              background: `linear-gradient(135deg, hsl(${200 + i * 30} 60% 95%) 0%, hsl(${200 + i * 30} 50% 92%) 100%)`,
                              color: `hsl(${200 + i * 30} 60% 35%)`,
                              border: `1px solid hsl(${200 + i * 30} 50% 85%)`,
                            }}
                          >{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.meetingMeta.duration && (
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] block mb-2" style={{ color: "hsl(220 10% 50%)" }}>
                        Duration
                      </span>
                      <span className="text-[13px] font-bold text-foreground">{result.meetingMeta.duration}</span>
                    </div>
                  )}
                  {result.meetingMeta.topics?.length > 0 && (
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.15em] block mb-2" style={{ color: "hsl(220 10% 50%)" }}>
                        Topics
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.meetingMeta.topics.map((t, i) => (
                          <span key={i} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: "linear-gradient(135deg, hsl(262 83% 55% / 0.08) 0%, hsl(280 70% 60% / 0.05) 100%)",
                              color: "hsl(262 83% 45%)",
                              border: "1px solid hsl(262 83% 55% / 0.15)",
                            }}
                          >{t}</span>
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
                    const styles = categoryStyles[s.category] || categoryStyles.Insight;
                    const Icon = styles.icon;
                    return (
                      <div key={i} className={`p-4 border ${styles.border} ${styles.bg} transition-all hover:scale-[1.02]`}>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] ${styles.badge}`}>
                            <Icon className="w-2.5 h-2.5" />
                            {s.category}
                          </span>
                        </div>
                        <p className="text-[12px] font-bold text-foreground leading-snug mb-1.5">{s.title}</p>
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

      {/* Show insights toggle when hidden */}
      {result && !showInsights && (
        <button
          onClick={() => setShowInsights(true)}
          className="shrink-0 w-full py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors"
          style={{
            borderTop: "1px solid hsl(220 15% 88%)",
            background: "hsl(0 0% 100%)",
            color: "hsl(262 83% 50%)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Show AI Insights
        </button>
      )}

      {/* ═══ Preview Modal ═══ */}
      <AnimatePresence>
        {showPreviewModal && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "hsl(220 20% 12% / 0.85)", backdropFilter: "blur(12px)" }}
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col"
              style={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(220 15% 88%)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(220 15% 88%)" }}>
                <span className="text-sm font-extrabold text-foreground">Full Preview</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "hsl(220 20% 12% / 0.7)", backdropFilter: "blur(8px)" }}
            onClick={dismissPopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md p-8 text-center"
              style={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(220 15% 88%)", boxShadow: "0 25px 60px -15px hsl(220 20% 12% / 0.25)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
                style={{ background: "linear-gradient(135deg, hsl(262 83% 55% / 0.1) 0%, hsl(280 70% 60% / 0.1) 100%)" }}
              >
                <Sparkles className="w-8 h-8" style={{ color: "hsl(262 83% 55%)" }} />
              </div>
              <h2 className="text-xl font-extrabold text-foreground mb-2">Daily Limit Reached</h2>
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
