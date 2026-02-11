import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";
import { FixUxLogo } from "./FixUxLogo";
import { ThemeToggle } from "./ThemeToggle";
import {
  X, ShieldCheck, MessageCircleHeart, ArrowRight, Upload, FileText, Eye,
  Sparkles, Zap, CheckCircle2, Layers, BarChart3, ScanEye
} from "lucide-react";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import AdminPasscodeModal from "@/components/admin/AdminPasscodeModal";
import heroCharacter from "@/assets/hero-character.png";
import personaSoloImg from "@/assets/persona-solo.png";
import personaLeadImg from "@/assets/persona-lead.png";
import personaA11yImg from "@/assets/persona-a11y.png";
import personaFounderImg from "@/assets/persona-founder.png";
import personaConsultantImg from "@/assets/persona-consultant.png";

const personaAvatars: Record<string, string> = {
  solo: personaSoloImg,
  lead: personaLeadImg,
  a11y: personaA11yImg,
  founder: personaFounderImg,
  consultant: personaConsultantImg,
};

interface PersonaSelectProps {
  onSelect: (id: PersonaId) => void;
}

const personaAccentBorder: Record<string, string> = {
  solo: "hover:border-persona-solo",
  lead: "hover:border-persona-lead",
  a11y: "hover:border-persona-a11y",
  founder: "hover:border-persona-founder",
  consultant: "hover:border-persona-consultant",
};

const PersonaSelect = ({ onSelect }: PersonaSelectProps) => {
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [activeFeature, setActiveFeature] = useState<"audit" | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      <AdminPasscodeModal
        open={showAdminPasscode}
        onOpenChange={(open) => setShowAdminPasscode(open)}
        onSuccess={() => {}}
      />

      {/* ═══ Sticky Header ═══ */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <FixUxLogo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowAdminPasscode(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-accent transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-20 w-56 h-56 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex-1 text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-primary/5 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">AI-Powered Platform</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-4">
                Ship better UX,
                <br />
                <span className="text-gradient-primary">faster.</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
                Two AI tools in one platform — audit your designs for usability issues or turn meeting transcripts into production-ready UI.
              </p>

              {/* Quick stats */}
              <div className="flex items-center gap-6 mt-6 justify-center md:justify-start">
                {[
                  { icon: ScanEye, val: "60+", label: "UX Rules" },
                  { icon: Layers, val: "5", label: "Personas" },
                  { icon: BarChart3, val: "Real-time", label: "Analysis" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary/10 border border-primary/15">
                      <s.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-foreground leading-tight">{s.val}</div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Character illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="shrink-0"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={heroCharacter}
                  alt="FixUx character"
                  className="w-48 md:w-56 lg:w-64 h-auto object-contain drop-shadow-xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Feature Cards — Side by Side ═══ */}
      <section className="max-w-5xl mx-auto px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 text-center">
            Choose your tool
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UX Audit Card */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFeature(activeFeature === "audit" ? null : "audit")}
              className="group relative w-full text-left border-2 bg-card transition-all duration-300 overflow-hidden"
              style={{
                borderColor: activeFeature === "audit" ? "hsl(var(--primary))" : "hsl(var(--border))",
                boxShadow: activeFeature === "audit"
                  ? "0 0 0 1px hsl(var(--primary)), 0 12px 32px -8px hsl(var(--primary) / 0.15)"
                  : "0 2px 8px -2px hsl(var(--foreground) / 0.04)",
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary/10 border border-primary/20">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-foreground">UX Design Audit</h3>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground uppercase tracking-wider">Popular</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Upload a screenshot → get AI-powered design feedback with issue pinpointing, severity scoring & actionable fix suggestions.
                </p>

                {/* Feature list */}
                <div className="space-y-1.5 mb-4">
                  {["60+ UX principles checked", "Visual issue pinpointing", "Severity-based fix suggestions", "5 expert personas"].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-[11px] font-medium text-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-primary text-xs font-bold group-hover:gap-3 transition-all">
                  <Zap className="w-3.5 h-3.5" />
                  Start Audit
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.button>

            {/* Transcript → UI Card */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/transcript")}
              className="group relative w-full text-left border-2 border-border bg-card transition-all duration-300 overflow-hidden hover:border-[hsl(262_83%_58%)]"
              style={{
                boxShadow: "0 2px 8px -2px hsl(var(--foreground) / 0.04)",
              }}
            >
              {/* Top accent bar */}
              <div className="h-1" style={{ background: "linear-gradient(to right, hsl(262 83% 58%), hsl(262 83% 58% / 0.4))" }} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center border" style={{ background: "hsl(262 83% 58% / 0.1)", borderColor: "hsl(262 83% 58% / 0.2)" }}>
                    <FileText className="w-5 h-5" style={{ color: "hsl(262 83% 58%)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-foreground">Transcript → UI</h3>
                      <span className="text-[7px] font-bold px-1.5 py-0.5 uppercase tracking-wider" style={{ background: "hsl(262 83% 58%)", color: "white" }}>New</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Paste a meeting transcript → AI generates production-ready UI with HTML, CSS, JS and actionable design insights.
                </p>

                {/* Feature list */}
                <div className="space-y-1.5 mb-4">
                  {["Live interactive preview", "Full code export (HTML/CSS/JS)", "AI-generated insights", "5 specialist roles"].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: "hsl(262 83% 58%)" }} />
                      <span className="text-[11px] font-medium text-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold group-hover:gap-3 transition-all" style={{ color: "hsl(262 83% 58%)" }}>
                  <Zap className="w-3.5 h-3.5" />
                  Generate UI
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ═══ Persona Cards (shown when audit selected) ═══ */}
      <AnimatePresence>
        {activeFeature === "audit" && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-w-5xl mx-auto px-6 pb-8">
              <div className="border border-primary/20 bg-primary/[0.02] p-5">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                  <Eye className="w-3 h-3" /> Select your audit persona
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {personas.map((persona, index) => (
                    <motion.button
                      key={persona.id}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(persona.id)}
                      className={`group relative flex items-center gap-3 p-3.5 border border-border bg-card text-left transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 ${personaAccentBorder[persona.id]}`}
                    >
                      <span className="w-10 h-10 shrink-0 overflow-hidden border border-border">
                        <img src={personaAvatars[persona.id]} alt={persona.title} className="w-full h-full object-cover" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground leading-tight">{persona.title}</h3>
                        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 truncate">{persona.subtitle}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </motion.button>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                  Each persona adapts audit depth, language & scoring to your role.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ Footer CTA ═══ */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setShowFeedback(true)}
          whileHover={{ y: -1 }}
          className="w-full flex items-center gap-3 p-4 border border-dashed border-muted-foreground/20 hover:border-primary/40 bg-muted/30 hover:bg-primary/[0.03] transition-all text-left"
        >
          <MessageCircleHeart className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground">Share your experience</span>
            <span className="text-xs text-muted-foreground ml-2">Help us improve FixUx</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>
      </section>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-background rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <FeedbackWidget onComplete={() => setShowFeedback(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PersonaSelect;
