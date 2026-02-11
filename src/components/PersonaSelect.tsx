import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";
import { FixUxLogo } from "./FixUxLogo";
import { ThemeToggle } from "./ThemeToggle";
import { X, User, ShieldCheck, MessageCircleHeart, Star, ArrowRight, Upload, FileText, Eye } from "lucide-react";
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
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [activeFeature, setActiveFeature] = useState<"audit" | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Top bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <ThemeToggle />
        <div className="flex rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <button
            onClick={() => setMode("user")}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              mode === "user" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> User
          </button>
          <button
            onClick={() => { setMode("admin"); setShowAdminPasscode(true); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              mode === "admin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Admin
          </button>
        </div>
      </div>

      <AdminPasscodeModal
        open={showAdminPasscode}
        onOpenChange={(open) => { setShowAdminPasscode(open); if (!open) setMode("user"); }}
        onSuccess={() => {}}
      />

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left – Hero */}
        <div className="lg:w-[45%] flex items-center justify-center p-8 lg:p-12 lg:sticky lg:top-0 lg:h-screen relative overflow-hidden border-r border-border bg-gradient-to-br from-primary/5 via-card to-accent/10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-sm w-full relative z-10 flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-6"
            >
              <img src={heroCharacter} alt="FixUx character" className="w-64 h-auto object-contain drop-shadow-lg" />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Design with
                <span className="text-gradient-primary"> confidence.</span>
              </h2>
              <p className="text-muted-foreground text-sm lg:text-base mt-3 leading-relaxed max-w-xs mx-auto">
                AI-powered design audits & transcript-to-UI generation in one platform.
              </p>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex gap-6"
            >
              {[
                { val: "60+", label: "UX Rules" },
                { val: "5", label: "Personas" },
                { val: "AI", label: "Powered" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-extrabold text-primary">{s.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right – Features */}
        <div className="lg:w-[55%] flex flex-col items-center px-6 py-10 lg:px-10 lg:py-8 lg:overflow-y-auto">
          {/* Logo & Title */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6 w-full max-w-lg"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="mb-4"
            >
              <FixUxLogo size="lg" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground mb-1.5 leading-[1.1]">
              What would you
              <br />
              <span className="text-gradient-hero">like to do?</span>
            </h1>
            <p className="text-muted-foreground text-xs max-w-xs mx-auto leading-relaxed">
              Two powerful AI tools — choose one to get started.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-3 max-w-lg w-full mb-4">
            {/* UX Audit */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFeature(activeFeature === "audit" ? null : "audit")}
              className="group relative w-full text-left border-2 bg-card transition-all duration-300 overflow-hidden"
              style={{
                borderColor: activeFeature === "audit" ? "hsl(var(--primary))" : "hsl(var(--border))",
                boxShadow: activeFeature === "audit" ? "0 0 0 1px hsl(var(--primary)), 0 8px 25px -8px hsl(var(--primary) / 0.2)" : undefined,
              }}
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 shrink-0 flex items-center justify-center bg-primary/10 border border-primary/20">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-extrabold text-foreground">UX Design Audit</h3>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground uppercase tracking-wider">Popular</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Upload a screenshot and get AI-powered design feedback with issue mapping and fix suggestions.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
                  {["60+ UX Principles", "Issue Pinpointing", "Fix Suggestions", "5 Personas"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-border bg-accent/50 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>

            {/* Transcript → UI */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/transcript")}
              className="group relative w-full text-left border-2 border-border bg-card transition-all duration-300 overflow-hidden hover:border-[hsl(262_83%_58%)]"
            >
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 shrink-0 flex items-center justify-center border" style={{ background: "hsl(262 83% 58% / 0.1)", borderColor: "hsl(262 83% 58% / 0.2)" }}>
                    <FileText className="w-5 h-5" style={{ color: "hsl(262 83% 58%)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-extrabold text-foreground">Transcript → UI</h3>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider" style={{ background: "hsl(262 83% 58%)", color: "white" }}>New</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Paste a meeting transcript and AI generates production-ready UI with HTML, CSS, JS and insights.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-[hsl(262_83%_58%)] transition-colors shrink-0 mt-1" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
                  {["Live Preview", "Code Export", "AI Insights", "5 Roles"].map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border text-muted-foreground" style={{ borderColor: "hsl(262 83% 58% / 0.2)", background: "hsl(262 83% 58% / 0.05)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          </div>

          {/* Persona Cards (shown when audit selected) */}
          <AnimatePresence>
            {activeFeature === "audit" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-lg overflow-hidden"
              >
                <div className="pb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Select your audit persona
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {personas.map((persona, index) => (
                      <motion.button
                        key={persona.id}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(persona.id)}
                        className={`group relative flex items-center gap-3 p-3 border border-border bg-card text-left transition-all duration-300 card-hover focus:outline-none focus:ring-2 focus:ring-primary/50 ${personaAccentBorder[persona.id]}`}
                      >
                        <span className="w-9 h-9 shrink-0 overflow-hidden border border-border">
                          <img src={personaAvatars[persona.id]} alt={persona.title} className="w-full h-full object-cover" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-sm text-foreground">{persona.title}</h3>
                            <span className="text-xs text-muted-foreground font-medium">· {persona.subtitle}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed truncate">{persona.description}</p>
                        </div>
                        <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground text-center">
                    Each persona adapts audit depth, language & scoring.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 180 }}
            className="mt-6 w-full max-w-lg"
          >
            <motion.button
              onClick={() => setShowFeedback(true)}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group w-full relative overflow-hidden border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 hover:border-primary/60 hover:shadow-lg transition-all duration-300 text-left p-4"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20">
                  <MessageCircleHeart className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    Share your experience! ✨
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Your feedback helps us build a better Fix UX</p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

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
