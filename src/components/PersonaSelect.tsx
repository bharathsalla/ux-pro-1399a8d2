import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";
import { FixUxLogo } from "./FixUxLogo";
import { X, User, ShieldCheck, MessageCircleHeart, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import AdminPasscodeModal from "@/components/admin/AdminPasscodeModal";
import heroCharacters from "@/assets/hero-characters.png";
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      {/* User / Admin toggle — top-right */}
      <div className="fixed top-4 right-4 z-50 flex rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <button
          onClick={() => setMode("user")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            mode === "user"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          User
        </button>
        <button
          onClick={() => {
            setMode("admin");
            setShowAdminPasscode(true);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            mode === "admin"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Admin
        </button>
      </div>

      {/* Admin Passcode Modal */}
      <AdminPasscodeModal
        open={showAdminPasscode}
        onOpenChange={(open) => {
          setShowAdminPasscode(open);
          if (!open) setMode("user");
        }}
        onSuccess={() => {}}
      />

      {/* Hero + Persona Selection */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column – Hero */}
        <div className="lg:w-1/2 flex items-center justify-center bg-card p-8 lg:p-16 lg:sticky lg:top-0 lg:h-screen relative overflow-hidden border-r border-border">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-md w-full relative z-10"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={heroCharacters}
                alt="FixUx characters"
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 text-center"
            >
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Design with
                <span className="text-gradient-primary"> confidence.</span>
              </h2>
              <p className="text-muted-foreground text-base lg:text-lg mt-3 leading-relaxed">
                AI-powered design audits built on 60+ UX/UI
                <br className="hidden sm:block" /> principles, laws & standards.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column – Persona Cards */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 lg:px-12 lg:py-16 lg:overflow-y-auto bg-background">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-10 w-full max-w-lg"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <FixUxLogo size="lg" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.1]">
              Who are you
              <br />
              <span className="text-gradient-hero">auditing for?</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
              Select your role to get a personalized audit experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-3 max-w-lg w-full">
            {personas.map((persona, index) => (
              <motion.button
                key={persona.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.06 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(persona.id)}
                className={`group relative flex items-center gap-4 p-5 border border-border bg-card text-left transition-all duration-300 card-hover focus:outline-none focus:ring-2 focus:ring-primary/50 ${personaAccentBorder[persona.id]}`}
              >
                <span className="w-12 h-12 shrink-0 overflow-hidden border border-border">
                  <img src={personaAvatars[persona.id]} alt={persona.title} className="w-full h-full object-cover" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-base text-foreground">
                      {persona.title}
                    </h3>
                    <span className="text-xs text-muted-foreground font-medium">
                      · {persona.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed truncate">
                    {persona.description}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            Each persona adapts the audit depth, language & scoring.
          </motion.p>

          {/* Feedback CTA — cartoon-style card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 180 }}
            className="mt-10 w-full max-w-lg"
          >
            <motion.button
              onClick={() => setShowFeedback(true)}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group w-full relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 hover:border-primary/60 hover:shadow-xl transition-all duration-300 text-left"
            >
              {/* Decorative floating shapes */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/5 blur-sm"
              />
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-accent/10 blur-sm"
              />

              <div className="relative z-10 p-6 flex items-center gap-5">
                {/* Animated icon cluster */}
                <div className="relative shrink-0">
                  <motion.div
                    animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20"
                  >
                    <MessageCircleHeart className="w-7 h-7 text-primary" />
                  </motion.div>
                  {/* Floating star */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </motion.div>
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    Share your experience!
                    <motion.span
                      animate={{ rotate: [0, 14, -8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      className="inline-block text-base"
                    >
                      ✨
                    </motion.span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your feedback helps us build a better Fix UX for everyone
                  </p>
                </div>

                {/* Arrow */}
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="shrink-0"
                >
                  <ArrowRight className="w-5 h-5 text-primary group-hover:text-primary/80" />
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Feedback Modal Overlay */}
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
