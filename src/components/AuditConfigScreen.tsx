import { useState } from "react";
import { motion } from "framer-motion";
import { type PersonaId, type AuditConfig, personas } from "@/types/audit";

interface AuditConfigScreenProps {
  personaId: PersonaId;
  onStart: (config: AuditConfig) => void;
  onBack: () => void;
}

const fidelityOptions = [
  { value: 'wireframe' as const, label: 'Wireframe', desc: 'Low-fidelity sketch' },
  { value: 'mvp' as const, label: 'MVP', desc: 'Functional prototype' },
  { value: 'high-fidelity' as const, label: 'High-Fidelity', desc: 'Production-ready' },
];

const purposeOptions: Record<PersonaId, { value: AuditConfig['purpose']; label: string }[]> = {
  solo: [
    { value: 'pre-handoff', label: 'Pre-Handoff Check' },
    { value: 'portfolio', label: 'Portfolio Polish' },
    { value: 'review', label: 'Self Review' },
  ],
  lead: [
    { value: 'review', label: 'Team Review' },
    { value: 'pre-handoff', label: 'Pre-Handoff Gate' },
    { value: 'stakeholder', label: 'Quality Report' },
  ],
  a11y: [
    { value: 'review', label: 'Compliance Check' },
    { value: 'pre-handoff', label: 'Pre-Launch Audit' },
    { value: 'stakeholder', label: 'Accessibility Report' },
  ],
  founder: [
    { value: 'stakeholder', label: 'Stakeholder Review' },
    { value: 'pre-handoff', label: 'Dev Readiness' },
    { value: 'review', label: 'Quick Check' },
  ],
  consultant: [
    { value: 'stakeholder', label: 'Client Report' },
    { value: 'review', label: 'Heuristic Evaluation' },
    { value: 'pre-handoff', label: 'Formal Audit' },
  ],
};

const AuditConfigScreen = ({ personaId, onStart, onBack }: AuditConfigScreenProps) => {
  const persona = personas.find(p => p.id === personaId)!;
  const [fidelity, setFidelity] = useState<AuditConfig['fidelity']>('high-fidelity');
  const [purpose, setPurpose] = useState<AuditConfig['purpose']>(purposeOptions[personaId][0].value);
  const [frameCount, setFrameCount] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex flex-col items-center justify-center min-h-screen px-4 py-12"
    >
      <div className="max-w-lg w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Change persona
        </button>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">{persona.icon}</span>
          <div>
            <h2 className="text-2xl font-bold">{persona.title} Mode</h2>
            <p className="text-sm text-muted-foreground">{persona.subtitle}</p>
          </div>
        </div>

        {/* Fidelity */}
        <div className="mb-8">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Design Fidelity
          </label>
          <div className="grid grid-cols-3 gap-3">
            {fidelityOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFidelity(opt.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  fidelity === opt.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-8">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Audit Purpose
          </label>
          <div className="flex flex-wrap gap-2">
            {purposeOptions[personaId].map(opt => (
              <button
                key={opt.value}
                onClick={() => setPurpose(opt.value)}
                className={`px-4 py-2 rounded-full text-sm border transition-all ${
                  purpose === opt.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Count */}
        <div className="mb-10">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Frames to Audit
          </label>
          <div className="flex items-center gap-4">
            {[1, 3, 5].map(num => (
              <button
                key={num}
                onClick={() => setFrameCount(num)}
                className={`w-14 h-14 rounded-xl border text-lg font-semibold transition-all ${
                  frameCount === num
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Start */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart({ fidelity, purpose, frameCount })}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg glow-primary transition-all hover:brightness-110"
        >
          Run Audit →
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AuditConfigScreen;
