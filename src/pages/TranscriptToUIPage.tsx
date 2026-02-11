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
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Types ── */
interface GeneratedResult {
  summary: string;
  html: string;
  css: string;
  js: string;
  suggestions: Suggestion[];
  meetingMeta: MeetingMeta;
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
  Improvement: { icon: TrendingUp, color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  Insight: { icon: Lightbulb, color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  "Action Item": { icon: AlertCircle, color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
};

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
    return `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<style>${result.css}</style>\n</head>\n<body>${result.html}\n<script>${result.js}<\/script>\n</body>\n</html>`;
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

  /* ── Load session ── */
  const loadSession = useCallback((session: Session) => {
    setResult(session.result);
    setRole(session.role);
    setShowHistory(false);
  }, []);

  const activeCode = result
    ? activeTab === "html"
      ? result.html
      : activeTab === "css"
      ? result.css
      : result.js
    : "";

  /* ── Render ── */
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ═══ Header ═══ */}
      <header className="border-b border-border bg-card px-4 py-2.5 flex items-center gap-4 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground tracking-tight">TranscriptToUI</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
            v1.0
          </span>
        </div>

        {/* Role pills */}
        <div className="flex items-center gap-1 ml-auto">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                role === r.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* History toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <History className="w-4 h-4" />
          {sessions.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {sessions.length}
            </span>
          )}
        </button>
      </header>

      {/* ═══ 3-column body ═══ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── Col 1: Transcript ── */}
        <div className="flex-1 flex flex-col border-r border-border min-w-0">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transcript
            </span>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !transcript.trim()}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-all ${
                isGenerating || !transcript.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              {isGenerating ? "Generating…" : "⚡ Generate UI"}
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={`Paste your meeting transcript here…\n\nExample:\n"We need a dashboard with a sidebar navigation, a main content area showing key metrics, and a user profile section in the header…"`}
            className="flex-1 w-full resize-none bg-background text-foreground text-sm p-4 font-sans leading-relaxed focus:outline-none placeholder:text-muted-foreground/50"
          />

          {/* Summary */}
          {result?.summary && (
            <div className="p-4 border-t border-border bg-card">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Summary
              </h4>
              <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
            </div>
          )}
        </div>

        {/* ── Col 2: Code Editor ── */}
        <div className="flex-1 flex flex-col border-r border-border min-w-0">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            {(["html", "css", "js"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-mono font-medium transition-all ${
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => copyCode(activeCode, activeTab.toUpperCase())}
                disabled={!result}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                {copiedTab === activeTab.toUpperCase() ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                Copy
              </button>
              <button
                onClick={copyAll}
                disabled={!result}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
              >
                {copiedTab === "all" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy All
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-background">
            {result ? (
              <pre className="p-4 text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap break-words">
                <code>{activeCode}</code>
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground/40">
                <div className="text-center">
                  <span className="text-4xl block mb-3">{"</>"}</span>
                  <span className="text-sm">Generated code will appear here</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Col 3: Live Preview ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Preview
              </span>
              <span
                className={`w-2 h-2 rounded-full ${result ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
              />
              <span className="text-[10px] text-muted-foreground">
                {result ? "Live" : "Waiting"}
              </span>
            </div>
            {result && (
              <button
                onClick={() => setShowPreviewModal(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex-1 bg-card">
            {result ? (
              <iframe
                title="Live Preview"
                srcDoc={previewSrcDoc}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground/40">
                <div className="text-center">
                  <span className="text-4xl block mb-3">🖥️</span>
                  <span className="text-sm">Live preview will render here</span>
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
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Session History
                </span>
                <button onClick={() => setShowHistory(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground/50 text-sm">No sessions yet</div>
                ) : (
                  sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => loadSession(s)}
                      className="w-full p-4 border-b border-border text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(s.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground font-medium truncate">{s.transcript}…</p>
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

      {/* ═══ Bottom Panel ═══ */}
      <AnimatePresence>
        {result && (result.meetingMeta || (result.suggestions && result.suggestions.length > 0)) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t border-border bg-card px-6 py-4 shrink-0"
          >
            <div className="flex gap-6 overflow-x-auto pb-1">
              {/* Meeting Meta */}
              {result.meetingMeta && (
                <div className="shrink-0 min-w-[200px]">
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Meeting Info
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {result.meetingMeta.participants?.length > 0 && (
                      <p>
                        <span className="text-foreground font-medium">Participants:</span>{" "}
                        {result.meetingMeta.participants.join(", ")}
                      </p>
                    )}
                    {result.meetingMeta.duration && (
                      <p>
                        <span className="text-foreground font-medium">Duration:</span>{" "}
                        {result.meetingMeta.duration}
                      </p>
                    )}
                    {result.meetingMeta.topics?.length > 0 && (
                      <p>
                        <span className="text-foreground font-medium">Topics:</span>{" "}
                        {result.meetingMeta.topics.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Suggestion Cards */}
              {result.suggestions?.map((s, i) => {
                const meta = categoryMeta[s.category] || categoryMeta.Insight;
                const Icon = meta.icon;
                return (
                  <div key={i} className={`shrink-0 min-w-[240px] p-3 border ${meta.color}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{s.category}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Preview Modal ═══ */}
      <AnimatePresence>
        {showPreviewModal && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full h-full max-w-6xl max-h-[90vh] bg-card border border-border overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Full Preview</span>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
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
                You've used your <strong className="text-foreground">2 free uses</strong> for today. Come back
                tomorrow!
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
