import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { type PersonaId, type AuditConfig, type AuditStep } from "@/types/audit";
import PersonaSelect from "@/components/PersonaSelect";
import AuditConfigScreen from "@/components/AuditConfigScreen";
import AuditRunning from "@/components/AuditRunning";
import AuditResults from "@/components/AuditResults";
import { generateAuditResults } from "@/data/auditData";

const Index = () => {
  const [step, setStep] = useState<AuditStep>('persona');
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [, setConfig] = useState<AuditConfig | null>(null);

  const handlePersonaSelect = useCallback((id: PersonaId) => {
    setSelectedPersona(id);
    setStep('config');
  }, []);

  const handleConfigStart = useCallback((cfg: AuditConfig) => {
    setConfig(cfg);
    setStep('running');
  }, []);

  const handleAuditComplete = useCallback(() => {
    setStep('results');
  }, []);

  const handleRestart = useCallback(() => {
    setStep('persona');
    setSelectedPersona(null);
    setConfig(null);
  }, []);

  const handleBack = useCallback(() => {
    setStep('persona');
    setSelectedPersona(null);
  }, []);

  const result = selectedPersona ? generateAuditResults(selectedPersona) : null;

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {step === 'persona' && (
          <PersonaSelect key="persona" onSelect={handlePersonaSelect} />
        )}
        {step === 'config' && selectedPersona && (
          <AuditConfigScreen
            key="config"
            personaId={selectedPersona}
            onStart={handleConfigStart}
            onBack={handleBack}
          />
        )}
        {step === 'running' && selectedPersona && (
          <AuditRunning
            key="running"
            personaId={selectedPersona}
            onComplete={handleAuditComplete}
          />
        )}
        {step === 'results' && selectedPersona && result && (
          <AuditResults
            key="results"
            personaId={selectedPersona}
            result={result}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
