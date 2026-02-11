import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";
import { FixUxLogo } from "./FixUxLogo";
import { ThemeToggle } from "./ThemeToggle";
import {
  X, ShieldCheck, MessageCircleHeart, ArrowRight, Upload, FileText, Eye,
  CheckCircle2, Zap,
} from "lucide-react";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import AdminPasscodeModal from "@/components/admin/AdminPasscodeModal";
import HeaderProfile from "@/components/auth/HeaderProfile";
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

      {/* ═══ Top Navigation ═══ */}
      <nav className="w-full border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <FixUxLogo size="md" />
          <div className="flex items-center gap-5">
            <button
              onClick={() => setShowFeedback(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase hidden sm:block"
            >
              Feedback
            </button>
            <button
              onClick={() => setShowAdminPasscode(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase hidden sm:block"
            >
              Admin
            </button>
            <ThemeToggle />
            <HeaderProfile />
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="max-w-6xl mx-auto px-8 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="mb-8"
            >
              <img
                src={heroCharacter}
                alt="FixUx"
                className="w-40 md:w-48 h-auto mx-auto object-contain"
              />
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-6">
              We help you build
              <br />
              <span className="text-gradient-primary">better interfaces.</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              AI-powered design audits and transcript-to-UI generation —
              <br className="hidden md:block" />
              two tools, one platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ Divider ═══ */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="border-t border-border" />
      </div>

      {/* ═══ Feature Cards ═══ */}
      <section className="max-w-6xl mx-auto px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-border">
          {/* UX Audit */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setActiveFeature(activeFeature === "audit" ? null : "audit")}
            className="group relative w-full text-left transition-all duration-300 md:border-r border-b md:border-b-0 border-border"
            style={{
              background: activeFeature === "audit" ? "hsl(var(--primary) / 0.03)" : undefined,
            }}
          >
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[9px] font-bold px-2 py-1 bg-primary text-primary-foreground uppercase tracking-[0.12em]">Popular</span>
              </div>

              <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/15 mb-5">
                <Upload className="w-6 h-6 text-primary" />
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-3">
                UX Design Audit
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
                Upload a screenshot and get AI-powered feedback — issue pinpointing,
                severity scoring, and actionable fix suggestions.
              </p>

              <div className="space-y-2 mb-6">
                {["60+ UX principles checked", "Visual issue pinpointing on image", "Severity-based fix suggestions", "5 expert audit personas"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                <Zap className="w-4 h-4" />
                Start Audit
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.button>

          {/* Transcript → UI */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/transcript")}
            className="group relative w-full text-left transition-all duration-300 hover:bg-[hsl(262_83%_58%_/_0.02)]"
          >
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[9px] font-bold px-2 py-1 uppercase tracking-[0.12em]" style={{ background: "hsl(262 83% 58%)", color: "white" }}>New</span>
              </div>

              <div className="w-12 h-12 flex items-center justify-center border mb-5" style={{ background: "hsl(262 83% 58% / 0.08)", borderColor: "hsl(262 83% 58% / 0.15)" }}>
                <FileText className="w-6 h-6" style={{ color: "hsl(262 83% 58%)" }} />
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-3">
                Transcript → UI
              </h2>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
                Paste a meeting transcript and AI generates production-ready
                UI with HTML, CSS, JS — plus actionable insights.
              </p>

              <div className="space-y-2 mb-6">
                {["Live interactive preview", "Full code export (HTML/CSS/JS)", "AI-generated design insights", "5 specialist generation roles"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(262 83% 58%)" }} />
                    <span className="text-xs font-medium text-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <span className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-3 transition-all" style={{ color: "hsl(262 83% 58%)" }}>
                <Zap className="w-4 h-4" />
                Generate UI
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* ═══ Persona Drawer ═══ */}
      <AnimatePresence>
        {activeFeature === "audit" && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-8 pb-12">
              <div className="border border-border">
                <div className="px-8 py-5 border-b border-border flex items-center justify-between">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> Choose your audit persona
                  </p>
                  <button
                    onClick={() => setActiveFeature(null)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 divide-x divide-y divide-border">
                  {personas.map((persona, index) => (
                    <motion.button
                      key={persona.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => onSelect(persona.id)}
                      className={`group text-left p-5 transition-all duration-200 hover:bg-accent/50 ${personaAccentBorder[persona.id]}`}
                    >
                      <div className="w-12 h-12 mb-3 overflow-hidden border border-border">
                        <img src={personaAvatars[persona.id]} alt={persona.title} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-bold text-sm text-foreground mb-0.5">{persona.title}</h3>
                      <p className="text-[11px] text-muted-foreground leading-snug">{persona.subtitle}</p>
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Select <ArrowRight className="w-3 h-3" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ Divider ═══ */}
      <div className="max-w-6xl mx-auto px-8">
        <div className="border-t border-border" />
      </div>

      {/* ═══ Footer ═══ */}
      <footer className="max-w-6xl mx-auto px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FixUxLogo size="sm" />
          <span className="text-xs text-muted-foreground">AI-powered design tools</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowFeedback(true)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircleHeart className="w-3.5 h-3.5" />
            Share feedback
          </button>
        </div>
      </footer>

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
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-background border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFeedback(false)}
                className="absolute top-4 right-4 z-10 p-1.5 bg-muted hover:bg-muted/80 transition-colors"
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
