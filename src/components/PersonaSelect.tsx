import { motion } from "framer-motion";
import { type PersonaId, personas } from "@/types/audit";

interface PersonaSelectProps {
  onSelect: (id: PersonaId) => void;
}

const PersonaSelect = ({ onSelect }: PersonaSelectProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface-2 text-sm text-muted-foreground mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          UX Audit Pro
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Who are you <span className="text-gradient-primary">auditing for?</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Select your role to get a contextual, personalized audit experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {personas.map((persona, index) => (
          <motion.button
            key={persona.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(persona.id)}
            className={`group relative p-6 rounded-xl border border-border bg-card text-left transition-all duration-300 hover:border-${persona.color} hover:${persona.glowClass} focus:outline-none focus:ring-2 focus:ring-primary`}
          >
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-${persona.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{persona.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{persona.title}</h3>
                  <p className="text-xs text-muted-foreground">{persona.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-secondary-foreground leading-relaxed">
                {persona.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Select</span>
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-xs text-muted-foreground"
      >
        Each persona adapts the audit depth, language, and scoring weights.
      </motion.p>
    </motion.div>
  );
};

export default PersonaSelect;
